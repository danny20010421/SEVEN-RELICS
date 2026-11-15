# 秘寶真相 SEVEN RELICS

第一人稱古墓解謎、歷史懸疑故事網頁遊戲（搶先體驗版）。營運：千輝創意有限公司。

## 目前內容
- 首次啟動使用者條款、資源載入（兩張輪播與百分比）、登入、選擇主角與命名
- 序章 N00「記憶的終點」：完整新手教學（點擊、撿取、檢視、使用道具、拉近、謎題、密碼）
- 遊戲大廳與大廳導覽（完成後送 500 遊戲幣、2 個加時器）
- 關卡選擇、商城、儲值（未開放金流）、背包、每日簽到、VIP、設定、活動中心、調查檔案、公告與客服、玩家資訊

## 技術
- 純前端（HTML、CSS、JavaScript 模組），不需建置，可直接部署到 GitHub Pages
- 固定 1280×720 舞台等比縮放，手機直拿時顯示轉向提示
- 進度目前存在瀏覽器（localStorage）；帳號雲端存檔、Google／LINE 登入、金流需另建後端
- 背景音樂：登入頁 bgm-000110〈Cold Scrapes Below〉（casper.tw 免費音樂）、序章 bgm-000073〈Night Pursuit〉（casper.tw 免費音樂）、大廳 WombatNoisesAudio〈DON'T GO INSIDE〉（`assets/audio/`）；音效以 Web Audio 即時合成

## 本機執行
```
python3 -m http.server 8000
```
開啟 http://localhost:8000
