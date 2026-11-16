"""Load Seven Relics art categories and style prefixes from STYLE_GUIDE.md."""

from __future__ import annotations

import os
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GUIDE_PATH = ROOT / "STYLE_GUIDE.md"
PENDING_DIR = ROOT / "assets" / "_pending"
IMG_DIR = ROOT / "assets" / "img"
REVIEW_DIR = ROOT / "assets" / "_review"
ACCEPTED_DIR = REVIEW_DIR / "accepted"
REJECTED_DIR = REVIEW_DIR / "rejected"
LOG_PATH = REVIEW_DIR / "log.jsonl"
ENV_PATH = ROOT / ".env"

DEFAULT_MODEL = "gpt-image-2.6-sunburst"
API_URL = "https://api.openai.com/v1/images/generations"
# Checked against OpenAI's image generation docs on 2026-11-16.
# gpt-image-1 was shut down on 2026-10-23.
DOCS_URL = "https://developers.openai.com/api/reference/resources/images/methods/generate"
RETIRED_MODELS = {"gpt-image-1", "dall-e-2", "dall-e-3"}
QUALITIES = ("low", "medium", "high", "xhigh", "max", "auto")
COMPLEXITIES = ("low", "medium", "high")
MODERATIONS = ("low", "auto")
MIN_PIXELS = 655_360
MAX_PIXELS = 8_294_400
MAX_EDGE = 3840

ALIASES = {
    "scene": "scene",
    "bg": "scene",
    "background": "scene",
    "portrait": "portrait",
    "portraits": "portrait",
    "avatar": "avatar",
    "avatars": "avatar",
    "icon": "icon",
    "icons": "icon",
    "ui": "icon",
    "ui-icon": "icon",
    "item": "item",
    "items": "item",
    "currency": "currency",
}

# Canonical filename rules. ic- / it- are reserved for those categories.
NAME_PATTERNS = {
    "scene": re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$"),
    "portrait": re.compile(r"^(?:hero-[mf](?:-[a-z0-9]+)*|npc-[a-z0-9]+(?:-[a-z0-9]+)*)$"),
    "avatar": re.compile(r"^(?:avatar-[mf]|npc-[a-z0-9]+(?:-[a-z0-9]+)*-av)$"),
    "icon": re.compile(r"^ic-[a-z0-9]+(?:-[a-z0-9]+)*$"),
    "item": re.compile(r"^it-[a-z0-9]+(?:-[a-z0-9]+)*$"),
    "currency": re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$"),
}

SPEC_RE = re.compile(r"```category-spec\n(.*?)```", re.S)
PREFIX_RE = re.compile(
    r"<!--\s*style-prefix:\s*([a-z0-9-]+)\s*-->\s*```text\n(.*?)```",
    re.S,
)


class GuideError(Exception):
    pass


@dataclass(frozen=True)
class Category:
    id: str
    width: int
    height: int
    background: str  # "opaque" or "transparent"
    api_size: str
    prefix: str

    @property
    def opaque(self) -> bool:
        return self.background == "opaque"


def rel(path: Path) -> str:
    try:
        return path.resolve().relative_to(ROOT).as_posix()
    except ValueError:
        return path.as_posix()


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def load_api_key() -> str:
    """Environment wins over .env. Never print the returned value."""
    key = os.environ.get("OPENAI_API_KEY", "").strip()
    if key:
        return key
    if not ENV_PATH.is_file():
        raise GuideError(
            "找不到 OPENAI_API_KEY。請匯出環境變數，或在專案根目錄的 .env 寫入 OPENAI_API_KEY=...（.env 已被 gitignore）。"
        )
    text = ENV_PATH.read_text(encoding="utf-8-sig")
    found = ""
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("export "):
            line = line[len("export ") :].strip()
        if "=" not in line:
            continue
        name, value = line.split("=", 1)
        if name.strip() != "OPENAI_API_KEY":
            continue
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
            value = value[1:-1]
        found = value.strip()
    if not found:
        raise GuideError(".env 裡沒有 OPENAI_API_KEY。")
    return found


def _parse_api_size(size: str) -> tuple[int, int]:
    if not re.fullmatch(r"\d+x\d+", size):
        raise GuideError(f"api_size 必須是 WIDTHxHEIGHT，收到 {size!r}。")
    width, height = (int(part) for part in size.split("x"))
    if width % 16 or height % 16:
        raise GuideError(f"{size} 的寬高都必須是 16 的倍數（OpenAI 自訂 size 限制）。")
    if width > MAX_EDGE or height > MAX_EDGE:
        raise GuideError(f"{size} 的邊長超過 {MAX_EDGE}。")
    pixels = width * height
    if pixels < MIN_PIXELS or pixels > MAX_PIXELS:
        raise GuideError(
            f"{size} 的像素數 {pixels} 超出 OpenAI 允許範圍 {MIN_PIXELS}–{MAX_PIXELS}。"
        )
    ratio = max(width, height) / min(width, height)
    if ratio > 3:
        raise GuideError(f"{size} 的長短邊比超過 3:1。")
    return width, height


def load_guide(path: Path = GUIDE_PATH) -> dict[str, Category]:
    if not path.is_file():
        raise GuideError(f"找不到風格指南：{rel(path)}")
    text = path.read_text(encoding="utf-8").replace("\r\n", "\n")
    spec_match = SPEC_RE.search(text)
    if not spec_match:
        raise GuideError("STYLE_GUIDE.md 缺少 ```category-spec 區塊。")
    prefixes = {name: body.strip() for name, body in PREFIX_RE.findall(text)}
    categories: dict[str, Category] = {}
    for lineno, raw in enumerate(spec_match.group(1).splitlines(), start=1):
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        parts = [part.strip() for part in line.split("|")]
        if len(parts) != 5:
            raise GuideError(f"category-spec 第 {lineno} 行應為 id|寬|高|background|api_size：{raw}")
        cid, width_s, height_s, background, api_size = parts
        if cid in categories:
            raise GuideError(f"category-spec 重複定義 {cid}。")
        if background not in ("opaque", "transparent"):
            raise GuideError(f"{cid} 的 background 必須是 opaque 或 transparent。")
        try:
            width, height = int(width_s), int(height_s)
        except ValueError as exc:
            raise GuideError(f"{cid} 的寬高不是整數。") from exc
        if width < 1 or height < 1:
            raise GuideError(f"{cid} 的寬高必須為正數。")
        _parse_api_size(api_size)
        prefix = prefixes.get(cid, "")
        if not prefix:
            raise GuideError(f"STYLE_GUIDE.md 缺少 <!-- style-prefix: {cid} --> 的 ```text 區塊。")
        categories[cid] = Category(cid, width, height, background, api_size, prefix)
    extra = sorted(set(prefixes) - set(categories))
    if extra:
        raise GuideError("有 style prefix 但 category-spec 沒有對應類別：" + ", ".join(extra))
    if not categories:
        raise GuideError("category-spec 是空的。")
    missing = sorted(set(NAME_PATTERNS) - set(categories))
    if missing:
        raise GuideError("腳本的檔名規則沒有對應的類別：" + ", ".join(missing))
    for cid, pattern in NAME_PATTERNS.items():
        if pattern.pattern not in text:
            raise GuideError(
                f"STYLE_GUIDE.md 必須寫出 {cid} 的檔名規則 {pattern.pattern}，與 tools/art_style.py 保持一致。"
            )
    for phrase in ("1600×900", "850×1300", "256×256", "400×400", "160×160"):
        if phrase not in text:
            raise GuideError(f"STYLE_GUIDE.md 缺少交付尺寸 {phrase}。")
    return categories


def resolve_category(name: str, guide: dict[str, Category]) -> Category:
    key = ALIASES.get(name.strip().lower())
    if key is None or key not in guide:
        known = ", ".join(sorted(guide))
        raise GuideError(f"未知的 category {name!r}。可用：{known}（別名 bg、ui、ui-icon）。")
    return guide[key]


def canonical_name(name: str) -> str:
    cleaned = name.strip().replace("\\", "/")
    if "/" in cleaned or cleaned in {".", ".."}:
        raise GuideError(f"name 只能是檔名，不能含路徑：{name!r}")
    if cleaned.lower().endswith(".webp"):
        cleaned = cleaned[:-5]
    if cleaned != cleaned.lower():
        raise GuideError(f"name 請用小寫：{name!r}")
    return cleaned


def validate_name(category: Category, name: str) -> str:
    stem = canonical_name(name)
    if stem.startswith("ic-") and category.id != "icon":
        raise GuideError(f"{stem} 的 ic- 前綴只用於 icon。")
    if stem.startswith("it-") and category.id != "item":
        raise GuideError(f"{stem} 的 it- 前綴只用於 item。")
    pattern = NAME_PATTERNS[category.id]
    if not pattern.fullmatch(stem):
        raise GuideError(f"{stem} 不符合 {category.id} 的檔名規則 {pattern.pattern}")
    return stem


def build_prompt(category: Category, subject: str, intended_use: str | None) -> str:
    subject = subject.strip()
    if not subject:
        raise GuideError("prompt 不可為空。")
    parts = [category.prefix, "", f"Subject: {subject}"]
    if intended_use and intended_use.strip():
        parts.append(f"Intended use: {intended_use.strip()}")
    prompt = "\n".join(parts).strip() + "\n"
    if len(prompt) > 32000:
        raise GuideError("組合後的 prompt 超過 OpenAI 上限 32000 字元。")
    return prompt


def pending_stem(name: str, index: int, count: int) -> str:
    if count == 1:
        return name
    return f"{name}-v{index}"


def check_model(model: str) -> str:
    model = model.strip()
    if not model:
        raise GuideError("model 不可為空。")
    if model in RETIRED_MODELS:
        raise GuideError(
            f"{model} 已停用。預設請用 {DEFAULT_MODEL}。"
            "（gpt-image-1 於 2026-10-23 關閉；dall-e-2 / dall-e-3 於 2026-05-12 關閉。）"
        )
    return model
