# 秘寶真相 SEVEN RELICS

第一人稱古墓解謎、歷史懸疑故事網頁遊戲（搶先體驗版）。營運：千輝創意有限公司。

## 目前內容
- 首次啟動使用者條款、資源載入（兩張輪播與百分比）、登入、選擇主角與命名
- 序章 N00「記憶的終點」：完整新手教學（點擊、撿取、檢視、使用道具、拉近、謎題、密碼）
- 一般關卡 G01「從未消失的黃金」：金瓜石。場景與道具圖在 `assets/img/`，清單見 `assets/G01_ART_MANIFEST.md`
- 遊戲大廳與大廳導覽（完成後送 500 遊戲幣、2 個加時器）
- 關卡選擇、商城、儲值（未開放金流）、背包、每日簽到、VIP、設定、活動中心、調查檔案、公告與客服、玩家資訊

## 技術
- 純前端（HTML、CSS、JavaScript 模組），不需建置，可直接部署到 GitHub Pages
- 固定 1280×720 舞台等比縮放，手機直拿時顯示轉向提示
- 進度目前存在瀏覽器（localStorage）；帳號雲端存檔、Google／LINE 登入、金流需另建後端
- 背景音樂：登入頁 bgm-000110〈Cold Scrapes Below〉（casper.tw 免費音樂）、序章 bgm-000073〈Night Pursuit〉（casper.tw 免費音樂）、大廳 WombatNoisesAudio〈DON'T GO INSIDE〉（`assets/audio/`）；音效以 Web Audio 即時合成

## 美術素材

新圖不手繪、不使用 stock。Claude Code 依 `CLAUDE.md` 呼叫生成腳本，圖先進 `assets/_pending/`，審查通過才進 `assets/img/`。風格、尺寸、檔名與審查清單在 `STYLE_GUIDE.md`。

### 準備

1. 到 [OpenAI API keys](https://platform.openai.com/api-keys) 建立金鑰。圖像模型走 OpenAI Images API，與 Claude 訂閱分開計費。
2. 在專案根目錄建 `.env`（已被 gitignore，不會進 commit）：

   ```
   OPENAI_API_KEY=sk-...
   ```

   已匯出的環境變數優先於 `.env`。不要把金鑰寫進程式或提交訊息。
3. 縮放與轉成 WebP 需要 Pillow，只裝這一個套件：

   ```
   python3 -m pip install Pillow
   ```

   `--dry-run` 不需要 Pillow，也不需要金鑰。
4. 安裝 [Claude Code](https://code.claude.com/docs/en/quickstart)（Claude Pro、Max、Team 或 Console 帳號）。macOS、Linux、WSL：

   ```
   curl -fsSL https://claude.ai/install.sh | bash
   ```

   Windows PowerShell 用 `irm https://claude.ai/install.ps1 | iex`。裝好後在這個目錄執行 `claude`。

預設模型是 `gpt-image-2.6-sunburst`（2026-11-16 對過 [Images API](https://developers.openai.com/api/reference/resources/images/methods/generate)）。`gpt-image-1` 已於 2026-10-23 停用。透明類別會送 `background: transparent` 與 `output_format: png`，再由 Pillow 縮成風格指南裡的 WebP。API 不接受 256、400、160 或 1600×900 這些最終尺寸（邊長要是 16 的倍數，且像素數至少 655,360），所以腳本先要較大的合法 size 再縮小。

### 流程

```
python3 tools/gen_image.py --dry-run --category item --name it-lantern --prompt "A rusted brass oil lantern with a cracked glass chimney."
python3 tools/gen_image.py --category item --name it-lantern --prompt "A rusted brass oil lantern with a cracked glass chimney." --use "背包道具"
```

腳本寫出 `assets/_pending/it-lantern.webp` 與同名 `.json`（category、prompt、用途、model、時間）。`--variants 3` 會產生 `it-lantern-v1.webp` 到 `v3`。

生成之後先停下來給審查。審查者對著 `STYLE_GUIDE.md` 的清單看圖，再執行：

```
python3 tools/review_asset.py list
python3 tools/review_asset.py approve it-lantern
python3 tools/review_asset.py reject it-lantern --reason "紅邊光太弱，看起來像新品黃銅。"
python3 tools/review_asset.py regen it-lantern --prompt "修正後的主體描述"
```

`approve` 把圖移到 `assets/img/it-lantern.webp`。`reject` 把圖與理由記到 `assets/_review/`（這個目錄與待審佇列都不進 git）。`regen` 沿用 sidecar 裡的 category，用新 prompt 再生成一張待審圖。程式只引用已經在 `assets/img/` 的檔案。

## 本機執行
```
python3 -m http.server 8000
```
開啟 http://localhost:8000

## 字型授權

- `assets/fonts/g01-hand.woff2`：霞鶩文楷 TC（LXGW WenKai TC），SIL Open Font License 1.1。只保留 G01 文件用到的字。
- `assets/fonts/g01-sign.woff2`：Homemade Apple，Apache License 2.0。只保留簽名用到的字母。
- `assets/fonts/g01-en.woff2`：Caveat，SIL Open Font License 1.1。只保留英文日誌用到的字母。
