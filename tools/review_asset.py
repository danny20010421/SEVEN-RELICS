#!/usr/bin/env python3
"""Approve, reject, list, or regenerate assets in assets/_pending/."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import gen_image
from art_style import (
    ACCEPTED_DIR,
    IMG_DIR,
    LOG_PATH,
    PENDING_DIR,
    REJECTED_DIR,
    GuideError,
    rel,
    utc_now,
)


def die(message: str, code: int = 2) -> None:
    print(message, file=sys.stderr)
    raise SystemExit(code)


def sidecar_path(folder: Path, stem: str) -> Path:
    return folder / f"{stem}.json"


def load_sidecar(path: Path) -> dict:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        die(f"{rel(path)} 不是合法的 JSON：{exc}", 1)
    if not isinstance(data, dict) or "name" not in data or "category" not in data:
        die(f"{rel(path)} 缺少 name 或 category。", 1)
    return data


def find_record(stem: str) -> tuple[Path, Path, dict]:
    """Return (webp, json, meta) from pending, then rejected."""
    for folder in (PENDING_DIR, REJECTED_DIR):
        meta_path = sidecar_path(folder, stem)
        webp_path = folder / f"{stem}.webp"
        if meta_path.is_file() and webp_path.is_file():
            return webp_path, meta_path, load_sidecar(meta_path)
        if meta_path.is_file() or webp_path.is_file():
            die(f"{rel(folder / stem)} 的 .webp 與 .json 必須成對存在。", 1)
    matches: list[tuple[Path, Path, dict]] = []
    for folder in (PENDING_DIR, REJECTED_DIR):
        if not folder.is_dir():
            continue
        for meta_path in sorted(folder.glob("*.json")):
            meta = load_sidecar(meta_path)
            if meta.get("name") == stem or meta.get("stem") == stem:
                webp_path = meta_path.with_suffix(".webp")
                if webp_path.is_file():
                    matches.append((webp_path, meta_path, meta))
    if len(matches) == 1:
        return matches[0]
    if len(matches) > 1:
        names = ", ".join(rel(path) for _, path, _ in matches)
        die(f"{stem} 對到多個 sidecar，請改用完整 stem：{names}")
    die(f"找不到 {stem}。請看 assets/_pending/ 或 assets/_review/rejected/。", 1)


def append_log(entry: dict) -> None:
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with LOG_PATH.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(entry, ensure_ascii=False) + "\n")


def sibling_hint(canonical: str, current_stem: str) -> None:
    if not PENDING_DIR.is_dir():
        return
    siblings = [
        path.name
        for path in sorted(PENDING_DIR.glob(f"{canonical}*.webp"))
        if path.stem != current_stem
    ]
    if siblings:
        print("同名的其他待審檔還在： " + ", ".join(siblings))


def cmd_list() -> int:
    if not PENDING_DIR.is_dir():
        print("（沒有待審檔案）")
        return 0
    rows = sorted(PENDING_DIR.glob("*.webp"))
    if not rows:
        print("（沒有待審檔案）")
        return 0
    for webp in rows:
        meta_path = webp.with_suffix(".json")
        if not meta_path.is_file():
            print(f"{rel(webp)}\t（缺少 sidecar）")
            continue
        meta = load_sidecar(meta_path)
        prompt = " ".join(str(meta.get("prompt") or "").split())
        if len(prompt) > 72:
            prompt = prompt[:69] + "..."
        print(f"{rel(webp)}\t{meta.get('category', '?')}\t{prompt}")
    return 0


def cmd_approve(stem: str, force: bool) -> int:
    webp, meta_path, meta = find_record(stem)
    if webp.parent != PENDING_DIR:
        die(f"{rel(webp)} 不在待審佇列。請先重新生成到 assets/_pending/。", 1)
    canonical = str(meta["name"])
    dest = IMG_DIR / f"{canonical}.webp"
    if dest.exists() and not force:
        die(
            f"{rel(dest)} 已經在遊戲素材夾。覆寫既有圖必須明確加上 --force。",
            1,
        )
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(webp.read_bytes())
    webp.unlink()
    meta["status"] = "accepted"
    meta["reviewed_at"] = utc_now()
    meta["accepted_path"] = rel(dest)
    ACCEPTED_DIR.mkdir(parents=True, exist_ok=True)
    accepted = ACCEPTED_DIR / meta_path.name
    accepted.write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    meta_path.unlink()
    append_log(
        {
            "time": meta["reviewed_at"],
            "action": "approve",
            "stem": webp.stem,
            "name": canonical,
            "category": meta.get("category"),
            "accepted_path": rel(dest),
            "prompt": meta.get("prompt"),
        }
    )
    print(rel(dest))
    print(rel(accepted))
    sibling_hint(canonical, webp.stem)
    return 0


def cmd_reject(stem: str, reason: str) -> int:
    reason = reason.strip()
    if not reason:
        die("reject 需要 --reason。")
    webp, meta_path, meta = find_record(stem)
    if webp.parent != PENDING_DIR:
        die(f"{rel(webp)} 已經不在待審佇列。", 1)
    reviewed_at = utc_now()
    meta["status"] = "rejected"
    meta["reason"] = reason
    meta["reviewed_at"] = reviewed_at
    REJECTED_DIR.mkdir(parents=True, exist_ok=True)
    dest_webp = REJECTED_DIR / webp.name
    dest_json = REJECTED_DIR / meta_path.name
    if dest_webp.exists() or dest_json.exists():
        die(f"退回夾已有 {dest_webp.name}。請先移走舊的退回檔。", 1)
    dest_webp.write_bytes(webp.read_bytes())
    dest_json.write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    webp.unlink()
    meta_path.unlink()
    append_log(
        {
            "time": reviewed_at,
            "action": "reject",
            "stem": webp.stem,
            "name": meta.get("name"),
            "category": meta.get("category"),
            "reason": reason,
            "prompt": meta.get("prompt"),
            "rejected_path": rel(dest_webp),
        }
    )
    print(rel(dest_webp))
    print(reason)
    return 0


def cmd_regen(args: argparse.Namespace) -> int:
    _webp, _meta_path, meta = find_record(args.stem)
    prompt = args.prompt.strip()
    if not prompt:
        die("regen 需要 --prompt，寫上修正後的內容。")
    intended = args.use if args.use is not None else (meta.get("intended_use") or "")
    argv = [
        "--category",
        str(meta["category"]),
        "--name",
        str(meta["name"]),
        "--prompt",
        prompt,
        "--variants",
        str(args.variants),
        "--force",
    ]
    if intended:
        argv.extend(["--use", str(intended)])
    if args.model:
        argv.extend(["--model", args.model])
    if args.quality:
        argv.extend(["--quality", args.quality])
    if args.complexity:
        argv.extend(["--complexity", args.complexity])
    if args.moderation:
        argv.extend(["--moderation", args.moderation])
    if args.dry_run:
        argv.append("--dry-run")
    try:
        return gen_image.run(argv)
    except GuideError as exc:
        die(str(exc))
    return 1


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(
        description="審查 assets/_pending/：核准後移到 assets/img/，退回則記下理由。"
    )
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("list", help="列出待審 WebP")

    approve = sub.add_parser("approve", help="移到 assets/img/<name>.webp")
    approve.add_argument("stem", help="待審檔名，不含 .webp")
    approve.add_argument("--force", action="store_true", help="覆寫 assets/img/ 裡的同名檔")

    reject = sub.add_parser("reject", help="移到 assets/_review/rejected/ 並記錄理由")
    reject.add_argument("stem")
    reject.add_argument("--reason", required=True)

    regen = sub.add_parser("regen", help="沿用原類別，用新 prompt 重新生成到待審佇列")
    regen.add_argument("stem")
    regen.add_argument("--prompt", required=True)
    regen.add_argument("--use", default=None)
    regen.add_argument("--variants", type=int, default=1)
    regen.add_argument("--model", default="")
    regen.add_argument("--quality", default="")
    regen.add_argument("--complexity", default="")
    regen.add_argument("--moderation", default="")
    regen.add_argument("--dry-run", action="store_true")

    args = parser.parse_args(argv)
    if args.cmd == "list":
        code = cmd_list()
    elif args.cmd == "approve":
        code = cmd_approve(args.stem, args.force)
    elif args.cmd == "reject":
        code = cmd_reject(args.stem, args.reason)
    else:
        code = cmd_regen(args)
    sys.exit(code)


if __name__ == "__main__":
    main()
