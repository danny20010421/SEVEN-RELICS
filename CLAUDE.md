# CLAUDE.md

動工前先讀 `HANDOFF.md`：製作人的固定要求、關卡引擎架構、G01 劇本與素材對照都在裡面。

秘寶真相 SEVEN RELICS。靜態網頁遊戲，GitHub Pages，沒有建置步驟。營運方是千輝創意有限公司。介面文案用繁體中文。

## 程式慣例

- 舞台固定 1280×720，CSS 變數 `--s` 等比縮放。不要另做響應式版面。
- 原始碼是 `index.html`、`css/style.css`、`js/*.js`（ES modules）。不要加打包器、框架或後端。
- 圖片只放 `assets/img/`，只有 `.webp`。程式用 `js/ui.js` 的 `IMG('檔名.webp')` 取路徑，不要寫死別的目錄。
- 進度在 `localStorage`。不要為了美術流程改存檔格式。
- 按鈕、箭頭、小符號用 `js/ui.js` 的 `ICON` SVG。那些不是 `ic-*` 點陣圖。
- 沒有人要求時，不要改既有的 `.webp`，也不要改玩法、文案或關卡座標。

## 需要新圖時

不要手繪、不要下載 stock、不要放純色或文字 placeholder、不要把別張圖改名充數。呼叫生成腳本，讓圖先進入審查佇列。

先讀 `STYLE_GUIDE.md`。腳本會依類別自動加上 style prompt prefix，prompt 只寫這張圖的主體與必要細節（誰、什麼物件、地點、表情）。不要在 prompt 裡重寫整份風格。

```bash
python3 tools/gen_image.py --category item --name it-lantern --prompt "A rusted brass oil lantern with a cracked glass chimney." --use "序章可撿取的道具"
```

- category：`scene`、`portrait`、`avatar`、`icon`、`item`、`sprite`、`currency`。別名 `bg`、`ui` 可以用。
- `sprite` 要加 `--width` 與 `--height`（長短邊比不超過 3:1）。沒給的話用 1024×1024。
- 檔名規則在風格指南裡，腳本會拒絕不合法的名字。
- 想先確認文字：加上 `--dry-run`。它只印最終 prompt 與 `assets/_pending/` 路徑，不呼叫 API。
- 真的生成需要環境變數 `OPENAI_API_KEY`，或專案根目錄的 `.env`。不要把 key 寫進程式、不要 commit `.env`。
- 轉換成 WebP 需要 Pillow：`python3 -m pip install Pillow`。
- 多個候選用 `--variants 3`，待審檔會是 `it-lantern-v1.webp` 這種名字。
- 若 Images API 以內容審核擋住這類暗色場景，可以加 `--moderation low` 再生成一次。不要改 prompt 去規避成另一種畫風。

生成結束就停。不要把新圖接上 `js/`。向使用者報告每一個待審檔與 sidecar 的路徑、category、prompt，並請審查者依 `STYLE_GUIDE.md` 的清單給 PASS 或 FAIL。

只有檔案已經在 `assets/img/` 之後，才可以在程式裡引用它。`assets/_pending/` 與 `assets/_review/` 不是遊戲資源。

不要自己核准自己剛生成的圖。審查者用：

```bash
python3 tools/review_asset.py list
python3 tools/review_asset.py approve it-lantern
python3 tools/review_asset.py reject it-lantern --reason "沒有紅色 rim light，金屬像新品。"
python3 tools/review_asset.py regen it-lantern --prompt "修正後的主體描述"
```

`approve` 會把圖移到 `assets/img/<正式檔名>.webp`。目標已存在時腳本會拒絕，除非使用者明確要求替換並加上 `--force`。沒有這句話就不要加 `--force`。

退回或重生成時，把審查清單的編號寫進 `--reason` 或新的 prompt，不要只說「再畫一次」。

## 不要提交的東西

`.env`、`assets/_pending/`、`assets/_review/` 已在 `.gitignore`。不要 `git add -f` 它們。未審查的圖不進 commit。
