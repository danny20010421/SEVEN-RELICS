# 第一章第二節擴充：美術需求（給 Grok）

The images in the repo are temporary placeholders. Replace them with Grok's versions using **the same filenames**.
- **No text in any image.** All writing — years, spine lettering, catalog entries, magazine name — is overlaid by code.
- **No people.** Characters appear only as dialogue busts.
- Overall style matches the current N02 art: dark warm lighting, worn old-apartment feel, a mix of realism and illustration.

| # | Filename | Size | Content | Code dependencies (must match) |
|---|---|---|---|---|
| 1 | `N02-BG-004-mess.webp` | 1920×1080 | Protagonist's room, **same angle and composition as N02-BG-004**, but ransacked: books scattered on the floor, papers everywhere, drawers half open. | Hotspot positions follow BG-004: bookshelf on the left, coffee table in the middle, corkboard upper right, desk on the right, wastebasket at bottom left of the bookshelf (x≈262–331, y≈306–446 on a 1280×720 basis). |
| 2 | `N02-BG_DETAIL-015.webp` (optional) | 1920×1080 | Close-up of the entryway floor: half-dried wet shoeprints. | Not used yet (the scene currently uses a subtitle). If drawn, it will be added as a cutaway. |
| 3 | `N02-BG_DETAIL-012.webp` | 1920×1080 | Bookshelf close-up, front view. **The middle shelf row is completely empty** (y≈260–600, x≈390–1530 on a 1920 basis); the floor is below (y≥650). Room to the left and right of the shelf for pinning notes. | Code draws 8 books on the empty row and 8 more on the floor; leave both areas clear. Spine titles, arrow and conversion table are all drawn by code. |
| 4 | `N02-BG_DETAIL-013.webp` | 1920×1080 | Close-up of a section of the room wall: old wall panels, **one faintly visible vertical seam between two panels**, no handle, no keyhole. | — |
| 5 | `N02-BG_DETAIL-014.webp` | 1920×1080 | Table top / floor (wood grain, a few scraps of paper). **The centre must be clear** (1280 basis x 340–940, y 140–540) — that is where the frame sits. | Torn pieces are cut by code. |
| 5a | `N02-DOC-024.webp` | 1200×800 | **Photocopy of photo G**: black-and-white, grainy, at the 1955 salvage scene — a salvage-ship deck with ropes and a crane hook; **one wooden crate at the centre with a stamped marking area left blank** (code adds "90-S"; alternatively Grok may paint "90-S" in faded stencil). No people's faces. | Code cuts it into a 4×2 grid (8 pieces of 300×400 each). Keep the key content (the crate) inside the middle 2 columns. |
| 5b | `N02-DOC-025.webp` | 600×800 | **Fashion magazine cover** (fictional): a full-length female model in an elegant pose; **the face is covered by a spill of ink plus stains**, and **the name area at the bottom is torn away** (blank or torn edge). Title area at the top left blank (code adds the fictional title). | Code cuts it into 3 vertical strips (200×800 each). Do not imitate the cover design of any real magazine. |
| 6 | `N02-DOC-011.webp` (shared) | Existing | The catalog card currently uses the lined notebook paper DOC-011. If a dedicated **blank index card** (horizontal lines, punch hole at top) is drawn, name it `N02-DOC-026.webp`, 1200×900. | Lists A–G as 7 lines in total. |
| 7 | `N02-BG-004.webp` (replace) | 1920×1080 | **The tidied room**: same angle as #1, books back on the shelf, floor mostly clear (a few files still on the coffee table, waiting for P3). Shown after Puzzle A and Puzzle B are both solved. | If replaced, `N02-BG-004-notebook.webp` must be reworked to match (same image + notebook on the desk). |

Once all the art is ready, run `python3 tools/gen_preload.py .` and bump the `?v=` in index.html.

完整交接文件（劇情、角色設定、規格、檢查清單）：https://claude.ai/artifact/Tr6NfVJsxdtMXosxi7f8rs
