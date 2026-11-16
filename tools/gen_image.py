#!/usr/bin/env python3
"""Generate a Seven Relics image into assets/_pending/.

Style prefixes and delivery sizes come from STYLE_GUIDE.md.
WebP resize needs Pillow: python3 -m pip install Pillow
"""

from __future__ import annotations

import argparse
import base64
import json
import sys
import urllib.error
import urllib.request
from dataclasses import replace
from pathlib import Path

from art_style import (
    API_URL,
    COMPLEXITIES,
    DEFAULT_MODEL,
    DOCS_URL,
    MIN_PIXELS,
    MODERATIONS,
    PENDING_DIR,
    QUALITIES,
    Category,
    GuideError,
    api_size_for,
    build_prompt,
    check_model,
    load_api_key,
    load_guide,
    pending_stem,
    rel,
    resolve_category,
    utc_now,
    validate_name,
)


def die(message: str, code: int = 2) -> None:
    print(message, file=sys.stderr)
    raise SystemExit(code)


def require_pillow():
    try:
        from PIL import Image
    except ImportError:
        die(
            "需要 Pillow 才能把 API 回傳的 PNG 縮放並存成規格內的 WebP。\n"
            "python3 -m pip install Pillow",
            1,
        )
    return Image


def alpha_note(image) -> str:
    if image.mode != "RGBA":
        return "no-alpha"
    low, high = image.getchannel("A").getextrema()
    if low == 255:
        return "fully-opaque"
    if high == 0:
        return "fully-transparent"
    return "has-transparency"


def fit_image(image, category: Category):
    """Resize onto the category canvas.

    Matching aspect ratios are scaled directly. Opaque mismatches are cover-cropped.
    Transparent mismatches are contained so the subject is not clipped.
    """
    from PIL import Image

    image = image.convert("RGBA")
    tw, th = category.width, category.height
    sw, sh = image.size
    resampling = Image.Resampling.LANCZOS
    close = abs((sw / sh) - (tw / th)) / (tw / th) < 0.01
    if close:
        fitted = image.resize((tw, th), resampling)
    elif category.opaque:
        scale = max(tw / sw, th / sh)
        nw, nh = max(tw, round(sw * scale)), max(th, round(sh * scale))
        resized = image.resize((nw, nh), resampling)
        left, top = (resized.width - tw) // 2, (resized.height - th) // 2
        fitted = resized.crop((left, top, left + tw, top + th))
    else:
        scale = min(tw / sw, th / sh)
        nw = min(tw, max(1, round(sw * scale)))
        nh = min(th, max(1, round(sh * scale)))
        resized = image.resize((nw, nh), resampling)
        fitted = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
        fitted.paste(resized, ((tw - nw) // 2, (th - nh) // 2), resized)
    if fitted.size != (tw, th):
        canvas = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
        canvas.paste(fitted, ((tw - fitted.width) // 2, (th - fitted.height) // 2))
        fitted = canvas
    if category.opaque:
        flat = Image.new("RGB", (tw, th), (0, 0, 0))
        flat.paste(fitted, mask=fitted.getchannel("A"))
        return flat
    return fitted


def save_webp(image, path: Path, category: Category) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    quality = 82 if category.opaque else 88
    image.save(path, format="WEBP", quality=quality, method=6)


def request_images(payload: dict, api_key: str) -> dict:
    raw = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        API_URL,
        data=raw,
        method="POST",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=600) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        request_id = exc.headers.get("x-request-id", "")
        suffix = f"\nrequest id: {request_id}" if request_id else ""
        die(f"OpenAI Images API 回應 HTTP {exc.code}。{suffix}\n{detail}", 1)
    except urllib.error.URLError as exc:
        die(f"無法連上 OpenAI Images API：{exc.reason}", 1)


def decode_images(body: dict, expected: int) -> list[bytes]:
    data = body.get("data") or []
    blobs: list[bytes] = []
    for item in data:
        encoded = item.get("b64_json")
        if not encoded:
            continue
        blobs.append(base64.b64decode(encoded))
    if len(blobs) != expected:
        die(f"API 回傳 {len(blobs)} 張圖，預期 {expected}。", 1)
    return blobs


def print_dry_run(category: Category, name: str, prompt: str, args) -> None:
    print("dry-run")
    print(f"category: {category.id}")
    print(f"name: {name}")
    print(f"model: {args.model}")
    print(f"quality: {args.quality}")
    print(f"complexity: {args.complexity}")
    print(f"background: {category.background}")
    print("output_format: png")
    print(f"api_size: {category.api_size}")
    print(f"deliver: {category.width}x{category.height} webp")
    print(f"variants: {args.variants}")
    print(f"docs: {DOCS_URL}")
    for index in range(1, args.variants + 1):
        stem = pending_stem(name, index, args.variants)
        print(f"target: {rel(PENDING_DIR / (stem + '.webp'))}")
        print(f"sidecar: {rel(PENDING_DIR / (stem + '.json'))}")
    print("final_prompt:")
    print("---")
    print(prompt, end="" if prompt.endswith("\n") else "\n")
    print("---")


def write_variant(stem: str, png_bytes: bytes, meta: dict, category: Category, force: bool) -> None:
    Image = require_pillow()
    from io import BytesIO

    image = Image.open(BytesIO(png_bytes))
    note = alpha_note(image.convert("RGBA"))
    fitted = fit_image(image, category)
    if fitted.size != (category.width, category.height):
        die(f"縮放後尺寸是 {fitted.size}，規格是 {category.width}x{category.height}。", 1)
    webp_path = PENDING_DIR / f"{stem}.webp"
    json_path = PENDING_DIR / f"{stem}.json"
    for path in (webp_path, json_path):
        if path.exists() and not force:
            die(f"{rel(path)} 已存在。覆寫請加 --force。", 1)
    meta = dict(meta)
    meta["alpha_received"] = note
    if not category.opaque and note != "has-transparency":
        meta["alpha_warning"] = (
            "API 回傳的圖沒有可用的透明像素。已依原圖縮放，沒有自動去背；審查時請判 FAIL 或重生成。"
        )
        print(f"警告：{stem} {meta['alpha_warning']}", file=sys.stderr)
    save_webp(fitted, webp_path, category)
    json_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(rel(webp_path))
    print(rel(json_path))


def build_payload(args, prompt: str, category: Category) -> dict:
    payload = {
        "model": args.model,
        "prompt": prompt,
        "n": args.variants,
        "size": category.api_size,
        "quality": args.quality,
        "background": category.background,
        "output_format": "png",
        "complexity": args.complexity,
    }
    if args.moderation:
        payload["moderation"] = args.moderation
    return payload


def run(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="依 STYLE_GUIDE.md 的類別前綴呼叫 OpenAI Images API，把 WebP 與 sidecar 寫進 assets/_pending/。"
    )
    parser.add_argument("--category", help="scene、portrait、avatar、icon、item、sprite、currency（別名 bg、ui）")
    parser.add_argument("--name", help="不含副檔名的檔名，例如 it-lantern")
    parser.add_argument("--prompt", help="這張圖要畫的內容，不要自己重寫風格前綴")
    parser.add_argument("--width", type=int, default=0, help="sprite 的交付寬度，需與 --height 一起用")
    parser.add_argument("--height", type=int, default=0, help="sprite 的交付高度，需與 --width 一起用")
    parser.add_argument("--use", default="", help="用途，寫進 sidecar 與 prompt 的 Intended use")
    parser.add_argument("--variants", type=int, default=1, help="生成張數 1–10；超過 1 張時檔名加 -v1、-v2")
    parser.add_argument("--model", default=DEFAULT_MODEL, help=f"預設 {DEFAULT_MODEL}")
    parser.add_argument("--quality", default="high", choices=QUALITIES)
    parser.add_argument("--complexity", default="high", choices=COMPLEXITIES)
    parser.add_argument("--moderation", default="", choices=("", *MODERATIONS))
    parser.add_argument("--dry-run", action="store_true", help="只印最終 prompt 與目標路徑，不呼叫 API")
    parser.add_argument("--force", action="store_true", help="覆寫已存在的 pending 檔")
    parser.add_argument("--show-spec", action="store_true", help="印出風格指南裡的類別規格後結束")
    args = parser.parse_args(argv)

    try:
        guide = load_guide()
        args.model = check_model(args.model)
        if args.show_spec:
            for category in guide.values():
                print(
                    f"{category.id}\t{category.width}x{category.height}\t{category.background}\t{category.api_size}"
                )
            return 0
        if not args.category or not args.name or not args.prompt:
            die("請提供 --category、--name、--prompt。規格一覽可用 --show-spec。")
        if not 1 <= args.variants <= 10:
            die("--variants 必須介於 1 到 10（API 的 n 上限）。")
        category = resolve_category(args.category, guide)
        if args.width or args.height:
            if category.id != "sprite":
                die("--width 與 --height 只用於 sprite。")
            if args.width < 1 or args.height < 1:
                die("sprite 要同時給 --width 與 --height。")
            category = replace(
                category,
                width=args.width,
                height=args.height,
                api_size=api_size_for(args.width, args.height),
            )
        name = validate_name(category, args.name)
        prompt = build_prompt(category, args.prompt, args.use)
    except GuideError as exc:
        die(str(exc))

    if args.dry_run:
        print_dry_run(category, name, prompt, args)
        return 0

    try:
        api_key = load_api_key()
    except GuideError as exc:
        die(str(exc), 1)

    payload = build_payload(args, prompt, category)
    body = request_images(payload, api_key)
    blobs = decode_images(body, args.variants)
    created = utc_now()
    for index, blob in enumerate(blobs, start=1):
        stem = pending_stem(name, index, args.variants)
        meta = {
            "name": name,
            "stem": stem,
            "file": f"{stem}.webp",
            "category": category.id,
            "prompt": args.prompt.strip(),
            "style_prefix": category.prefix,
            "final_prompt": prompt,
            "intended_use": args.use.strip() or None,
            "model": args.model,
            "quality": args.quality,
            "complexity": args.complexity,
            "background": category.background,
            "api_size": category.api_size,
            "output_size": [category.width, category.height],
            "variant": index,
            "variants": args.variants,
            "timestamp": created,
            "status": "pending",
            "min_api_pixels": MIN_PIXELS,
        }
        write_variant(stem, blob, meta, category, args.force)
    return 0


def main(argv: list[str] | None = None) -> None:
    sys.exit(run(argv))


if __name__ == "__main__":
    main()
