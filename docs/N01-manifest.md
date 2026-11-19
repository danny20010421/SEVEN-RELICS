# N01 素材 manifest

正式美術請放在 `assets/img/<素材ID>.webp`（例如 `assets/img/N01-BG-001.webp`）。檔案存在時程式會自動蓋過灰盒，不必改程式；需要分狀態的道具，依下表另存檔名。

- 座標一律以 1280×720 舞台計算，熱點＝`x,y,寬×高`。
- 背景 1600×900 以上、16:9；物件圖會被縮放到熱點框內（`object-fit: contain`）。
- 文件只需要紙張底圖，文字由 UI 疊上（不要烙字）。
- 序幕四鏡：`N01-VFX-088-1`～`-4`（鑰匙、停下的懷錶、玻璃門後人影、遮住的檔案）。

| 素材ID | 名稱 | 場景 | 程式路徑 | 程式已引用 | 狀態 | 熱點範圍（1280×720） |
|---|---|---|---|---|---|---|
| N01-BG-001 | 閱覽室背景 | A | `assets/img/N01-BG-001.webp` | 是 | 常態 | — |
| N01-BG-002 | 檔案走廊背景 | B | `assets/img/N01-BG-002.webp` | 是 | 常態 | — |
| N01-BG-003 | 微縮膠卷室背景 | C | `assets/img/N01-BG-003.webp` | 是 | 常態 | — |
| N01-BG-004 | 出口控制間背景 | D | `assets/img/N01-BG-004.webp` | 是 | 常態 | — |
| N01-BG-005 | 台灣雨夜館外背景 | OUT | `assets/img/N01-BG-005.webp` | 是 | 常態 | — |
| N01-BG_DETAIL-006 | 桌面近景 | A | `assets/img/N01-BG_DETAIL-006.webp` | 否 | 常態 | — |
| N01-BG_DETAIL-007 | 電箱近景 | A | `assets/img/N01-BG_DETAIL-007.webp` | 是 | 常態 | 備用配電箱 40,190,130×190 |
| N01-BG_DETAIL-008 | 時鐘／終端近景 | B | `assets/img/N01-BG_DETAIL-008.webp` | 是 | 常態 | — |
| N01-BG_DETAIL-009 | 卷宗櫃近景 | C | `assets/img/N01-BG_DETAIL-009.webp` | 是 | 常態 | — |
| N01-BG_DETAIL-010 | 磁帶播放機近景 | C | `assets/img/N01-BG_DETAIL-010.webp` | 是 | 常態 | — |
| N01-BG_DETAIL-011 | 出口控制台近景 | D | `assets/img/N01-BG_DETAIL-011.webp` | 是 | 常態 | 出口控制台 70,320,270×220 |
| N01-CHAR-012 | 女性主角全身 | GLOBAL | `assets/img/N01-CHAR-012.webp` | 否 | 中性立繪 | — |
| N01-CHAR-013 | 男性主角全身 | GLOBAL | `assets/img/N01-CHAR-013.webp` | 否 | 中性立繪 | — |
| N01-CHAR-014 | 因杜阿森全身 | GLOBAL | `assets/img/N01-CHAR-014.webp` | 否 | 中性立繪 | — |
| N01-CHAR-015 | 艾琳全身 | GLOBAL | `assets/img/N01-CHAR-015.webp` | 否 | 中性立繪 | — |
| N01-CHAR-016 | 保安半身 | GLOBAL | `assets/img/N01-CHAR-016.webp` | 否 | 中性立繪 | — |
| N01-EXPR-017 | 女性主角-中性 | GLOBAL | `assets/img/N01-EXPR-017.webp` | 否 | 表情差分 | — |
| N01-EXPR-018 | 女性主角-疑惑 | GLOBAL | `assets/img/N01-EXPR-018.webp` | 否 | 表情差分 | — |
| N01-EXPR-019 | 女性主角-警戒 | GLOBAL | `assets/img/N01-EXPR-019.webp` | 否 | 表情差分 | — |
| N01-EXPR-020 | 女性主角-驚訝 | GLOBAL | `assets/img/N01-EXPR-020.webp` | 否 | 表情差分 | — |
| N01-EXPR-021 | 女性主角-沉思 | GLOBAL | `assets/img/N01-EXPR-021.webp` | 否 | 表情差分 | — |
| N01-EXPR-022 | 男性主角-中性 | GLOBAL | `assets/img/N01-EXPR-022.webp` | 否 | 表情差分 | — |
| N01-EXPR-023 | 男性主角-疑惑 | GLOBAL | `assets/img/N01-EXPR-023.webp` | 否 | 表情差分 | — |
| N01-EXPR-024 | 男性主角-警戒 | GLOBAL | `assets/img/N01-EXPR-024.webp` | 否 | 表情差分 | — |
| N01-EXPR-025 | 男性主角-驚訝 | GLOBAL | `assets/img/N01-EXPR-025.webp` | 否 | 表情差分 | — |
| N01-EXPR-026 | 男性主角-沉思 | GLOBAL | `assets/img/N01-EXPR-026.webp` | 否 | 表情差分 | — |
| N01-EXPR-027 | 因杜阿森-中性 | GLOBAL | `assets/img/N01-EXPR-027.webp` | 否 | 表情差分 | — |
| N01-EXPR-028 | 因杜阿森-疑惑 | GLOBAL | `assets/img/N01-EXPR-028.webp` | 否 | 表情差分 | — |
| N01-EXPR-029 | 因杜阿森-警戒 | GLOBAL | `assets/img/N01-EXPR-029.webp` | 否 | 表情差分 | — |
| N01-EXPR-030 | 因杜阿森-驚訝 | GLOBAL | `assets/img/N01-EXPR-030.webp` | 否 | 表情差分 | — |
| N01-EXPR-031 | 因杜阿森-沉思 | GLOBAL | `assets/img/N01-EXPR-031.webp` | 否 | 表情差分 | — |
| N01-EXPR-032 | 艾琳-中性 | GLOBAL | `assets/img/N01-EXPR-032.webp` | 否 | 表情差分 | — |
| N01-EXPR-033 | 艾琳-疑惑 | GLOBAL | `assets/img/N01-EXPR-033.webp` | 否 | 表情差分 | — |
| N01-EXPR-034 | 艾琳-警戒 | GLOBAL | `assets/img/N01-EXPR-034.webp` | 否 | 表情差分 | — |
| N01-EXPR-035 | 艾琳-驚訝 | GLOBAL | `assets/img/N01-EXPR-035.webp` | 否 | 表情差分 | — |
| N01-EXPR-036 | 艾琳-沉思 | GLOBAL | `assets/img/N01-EXPR-036.webp` | 否 | 表情差分 | — |
| N01-PROP-037 | 咖啡杯 | A | `assets/img/N01-PROP-037.webp` | 是 | 常態／移開後（程式位移 70,−30） | 咖啡杯 610,420,90×100 |
| N01-PROP-038 | 紙條正反面 | A | `assets/img/N01-PROP-038.webp` | 是 | 常態（咖啡杯移開後出現於 612,470,90×56）／道具欄圖示 | — |
| N01-PROP-039 | 訪客卡 | A | `assets/img/N01-PROP-039.webp` | 是 | 場景常態／道具欄圖示 | 臨時訪客卡 730,480,120×64 |
| N01-PROP-040 | 錄音磁帶 | A | `assets/img/N01-PROP-040.webp` | 是 | 場景常態／道具欄圖示 | 錄音機 210,430,140×90 |
| N01-PROP-041 | 電路開關 A/B/C | A | `assets/img/N01-PROP-041.webp` | 否 | 常態／高亮／使用後（若有開啟狀態另列） | — |
| N01-PROP-042 | 讀卡門-上鎖 | A | `assets/img/N01-PROP-042.webp` | 是 | 上鎖（P01 前） | 讀卡器 880,300,60×90 |
| N01-PROP-043 | 讀卡門-通電 | A | `assets/img/N01-PROP-043.webp` | 是 | 通電（P01 後） | 讀卡器 880,300,60×90 |
| N01-PROP-044 | 桌面申請單 | A | `assets/img/N01-PROP-044.webp` | 是 | 常態／高亮／使用後（若有開啟狀態另列） | 文件申請表 380,450,200×110 |
| N01-PROP-045 | 壁鐘 | B | `assets/img/N01-PROP-045.webp` | 是 | 常態／高亮／使用後（若有開啟狀態另列） | 壁鐘 560,110,120×120 |
| N01-PROP-046 | 保安終端 | B | `assets/img/N01-PROP-046.webp` | 是 | 常態／高亮／使用後（若有開啟狀態另列） | 保安終端 290,300,210×170 |
| N01-PROP-047 | 獨立讀卡器 | B | `assets/img/N01-PROP-047.webp` | 是 | 常態／高亮／使用後（若有開啟狀態另列） | 獨立讀卡器 170,300,90×120 |
| N01-PROP-048 | 維護公告 | B | `assets/img/N01-PROP-048.webp` | 是 | 常態／高亮／使用後（若有開啟狀態另列） | 維護公告 560,280,140×170 |
| N01-PROP-049 | 值班登記板 | B | `assets/img/N01-PROP-049.webp` | 是 | 常態／高亮／使用後（若有開啟狀態另列） | 值班登記板 740,260,170×200 |
| N01-PROP-050 | 通道門 | B | `assets/img/N01-PROP-050.webp` | 是 | 常態／高亮／使用後（若有開啟狀態另列） | 往微縮膠卷室 30,170,110×420 |
| N01-PROP-051 | 卷宗櫃-關閉 | C | `assets/img/N01-PROP-051.webp` | 是 | 關閉（P03 前） | 卷宗櫃 60,170,260×380 |
| N01-PROP-052 | 卷宗櫃-打開 | C | `assets/img/N01-PROP-052.webp` | 是 | 打開（P03 後） | 卷宗櫃 60,170,260×380 |
| N01-PROP-053 | 卷宗 1204-M-03 | C | `assets/img/N01-PROP-053.webp` | 是 | 道具欄圖示 | — |
| N01-PROP-054 | 膠卷盒 | C | `assets/img/N01-PROP-054.webp` | 是 | 常態／高亮／使用後（若有開啟狀態另列） | 膠卷盒 570,440,130×90 |
| N01-PROP-055 | 錄音設備 | C | `assets/img/N01-PROP-055.webp` | 是 | 常態／高亮／使用後（若有開啟狀態另列） | 錄音設備 740,350,200×150 |
| N01-PROP-056 | 掃描機 | C | `assets/img/N01-PROP-056.webp` | 是 | 常態／高亮／使用後（若有開啟狀態另列） | 掃描機 360,360,170×150 |
| N01-PROP-057 | 安全捲門-關閉 | D | `assets/img/N01-PROP-057.webp` | 是 | 關閉 | 安全捲門 410,130,450×440 |
| N01-PROP-058 | 安全捲門-開啟 | D | `assets/img/N01-PROP-058.webp` | 是 | 開啟（EV_EXIT） | 安全捲門 410,130,450×440 |
| N01-PROP-059 | 清查面板 | D | `assets/img/N01-PROP-059.webp` | 是 | 常態／高亮／使用後（若有開啟狀態另列） | — |
| N01-PROP-060 | 對講機 | D | `assets/img/N01-PROP-060.webp` | 是 | 常態／高亮／使用後（若有開啟狀態另列） | 對講機 900,280,110×140 |
| N01-DOC-061 | 資料申請單 | A | `assets/img/N01-DOC-061.webp` | 是 | 紙張底圖（文字由 UI 疊上） | — |
| N01-DOC-062 | 匿名紙條 | A | `assets/img/N01-DOC-062.webp` | 是 | 紙張底圖（文字由 UI 疊上） | — |
| N01-DOC-063 | 訪客出入紀錄 | B | `assets/img/N01-DOC-063.webp` | 是 | 紙張底圖（文字由 UI 疊上） | — |
| N01-DOC-064 | 夜間設備終端紀錄 | B | `assets/img/N01-DOC-064.webp` | 是 | 紙張底圖（文字由 UI 疊上） | — |
| N01-DOC-065 | 讀卡器測試表 | B | `assets/img/N01-DOC-065.webp` | 是 | 紙張底圖（文字由 UI 疊上） | — |
| N01-DOC-066 | 終端維護公告 | B | `assets/img/N01-DOC-066.webp` | 是 | 紙張底圖（文字由 UI 疊上） | — |
| N01-DOC-067 | 卷宗索引標籤 | C | `assets/img/N01-DOC-067.webp` | 是 | 紙張底圖（文字由 UI 疊上） | — |
| N01-DOC-068 | 文件命名規則 | C | `assets/img/N01-DOC-068.webp` | 是 | 紙張底圖（文字由 UI 疊上） | — |
| N01-DOC-069 | 人工清場簽名表 | C | `assets/img/N01-DOC-069.webp` | 是 | 紙張底圖（文字由 UI 疊上） | — |
| N01-DOC-070 | 設備操作順序便條 | C | `assets/img/N01-DOC-070.webp` | 是 | 紙張底圖（文字由 UI 疊上） | — |
| N01-DOC-071 | 人工放行確認單 | D | `assets/img/N01-DOC-071.webp` | 是 | 紙張底圖（文字由 UI 疊上） | — |
| N01-UI-072 | 主畫面 HUD | GLOBAL | `—` | 否 | 常態／選取／高亮 | — |
| N01-UI-073 | 對話框 | GLOBAL | `—` | 否 | 常態／選取／高亮 | — |
| N01-UI-074 | 背包欄 | GLOBAL | `—` | 否 | 常態／選取／高亮 | — |
| N01-UI-075 | 近景文件閱讀器 | GLOBAL | `—` | 否 | 常態／選取／高亮 | — |
| N01-UI-076 | 互動熱點提示 | GLOBAL | `—` | 否 | 常態／選取／高亮 | — |
| N01-UI-077 | 電路謎題 UI | GLOBAL | `—` | 否 | 常態／選取／高亮 | — |
| N01-UI-078 | 時間校正 UI | GLOBAL | `—` | 否 | 常態／選取／高亮 | — |
| N01-UI-079 | 檔案查詢 UI | GLOBAL | `—` | 否 | 常態／選取／高亮 | — |
| N01-UI-080 | 錄音排序 UI | GLOBAL | `—` | 否 | 常態／選取／高亮 | — |
| N01-UI-081 | 最終推理 UI | GLOBAL | `—` | 否 | 常態／選取／高亮 | — |
| N01-UI-082 | 清查確認 UI | GLOBAL | `—` | 否 | 常態／選取／高亮 | — |
| N01-UI-083 | 三級提示 UI | GLOBAL | `—` | 否 | 常態／選取／高亮 | — |
| N01-UI-084 | 超時／重試 UI | GLOBAL | `—` | 否 | 常態／選取／高亮 | — |
| N01-UI-085 | 任務完成 UI | GLOBAL | `—` | 否 | 常態／選取／高亮 | — |
| N01-UI-086 | 對話紀錄 UI | GLOBAL | `—` | 否 | 常態／選取／高亮 | — |
| N01-UI-087 | 無障礙字幕 UI | GLOBAL | `—` | 否 | 常態／選取／高亮 | — |
| N01-VFX-088 | 序幕黑幕與閃切 | GLOBAL | `assets/img/N01-VFX-088.webp` | 是 | 序列 | — |
| N01-VFX-089 | 桌燈明滅 | GLOBAL | `assets/img/N01-VFX-089.webp` | 否 | 序列 | — |
| N01-VFX-090 | 門禁指示燈 | GLOBAL | `assets/img/N01-VFX-090.webp` | 否 | 序列 | — |
| N01-VFX-091 | 監控故障 | GLOBAL | `assets/img/N01-VFX-091.webp` | 否 | 序列 | — |
| N01-VFX-092 | 錄音軌波形 | GLOBAL | `assets/img/N01-VFX-092.webp` | 否 | 序列 | — |
| N01-VFX-093 | 安全捲門開啟 | GLOBAL | `assets/img/N01-VFX-093.webp` | 否 | 序列 | — |
| N01-VFX-094 | 雨滴及濕路反光 | GLOBAL | `assets/img/N01-VFX-094.webp` | 否 | 序列 | — |
| N01-VFX-095 | 結尾紙條翻面 | GLOBAL | `assets/img/N01-VFX-095.webp` | 否 | 序列 | — |
| N01-AUDIO-096 | 序幕環境 | GLOBAL | `assets/audio/N01-AUDIO-096.mp3` | 否 | — | — |
| N01-AUDIO-097 | 室內環境 | GLOBAL | `assets/audio/N01-AUDIO-097.mp3` | 否 | — | — |
| N01-AUDIO-098 | 室內雨聲 | GLOBAL | `assets/audio/N01-AUDIO-098.mp3` | 否 | — | — |
| N01-AUDIO-099 | 電箱操作 | GLOBAL | `assets/audio/N01-AUDIO-099.mp3` | 否 | — | — |
| N01-AUDIO-100 | 讀卡機 | GLOBAL | `assets/audio/N01-AUDIO-100.mp3` | 否 | — | — |
| N01-AUDIO-101 | 走廊回音 | GLOBAL | `assets/audio/N01-AUDIO-101.mp3` | 否 | — | — |
| N01-AUDIO-102 | 磁帶運轉 | GLOBAL | `assets/audio/N01-AUDIO-102.mp3` | 否 | — | — |
| N01-AUDIO-103 | 雙響提示鈴 | GLOBAL | `assets/audio/N01-AUDIO-103.mp3` | 否 | — | — |
| N01-AUDIO-104 | 掃描機運轉 | GLOBAL | `assets/audio/N01-AUDIO-104.mp3` | 否 | — | — |
| N01-AUDIO-105 | 膠卷盒闔上 | GLOBAL | `assets/audio/N01-AUDIO-105.mp3` | 否 | — | — |
| N01-AUDIO-106 | 安全門警報 | GLOBAL | `assets/audio/N01-AUDIO-106.mp3` | 否 | — | — |
| N01-AUDIO-107 | 安全門開啟 | GLOBAL | `assets/audio/N01-AUDIO-107.mp3` | 否 | — | — |
| N01-AUDIO-108 | 電話接通 | GLOBAL | `assets/audio/N01-AUDIO-108.mp3` | 否 | — | — |
| N01-AUDIO-109 | 選項確認 | GLOBAL | `assets/audio/N01-AUDIO-109.mp3` | 否 | — | — |
| N01-AUDIO-110 | 配樂-懸疑 | GLOBAL | `assets/audio/N01-AUDIO-110.mp3` | 否 | — | — |
| N01-AUDIO-111 | 配樂-探索 | GLOBAL | `assets/audio/N01-AUDIO-111.mp3` | 否 | — | — |
| N01-AUDIO-112 | 配樂-反轉 | GLOBAL | `assets/audio/N01-AUDIO-112.mp3` | 否 | — | — |
| N01-AUDIO-113 | 配樂-結尾 | GLOBAL | `assets/audio/N01-AUDIO-113.mp3` | 否 | — | — |
| N01-VO-114 | 主角通話台詞 | GLOBAL | `assets/audio/N01-VO-114.mp3` | 否 | — | — |
| N01-VO-115 | 因杜阿森通話台詞 | GLOBAL | `assets/audio/N01-VO-115.mp3` | 否 | — | — |
| N01-VO-116 | 艾琳錄音 | GLOBAL | `assets/audio/N01-VO-116.mp3` | 否 | — | — |
| N01-VO-117 | 前主管錄音 | GLOBAL | `assets/audio/N01-VO-117.mp3` | 否 | — | — |
| N01-VO-118 | 舊館廣播 | GLOBAL | `assets/audio/N01-VO-118.mp3` | 否 | — | — |
| N01-VO-119 | 值班保安 | GLOBAL | `assets/audio/N01-VO-119.mp3` | 否 | — | — |
| N01-VO-120 | 主角結尾旁白 | GLOBAL | `assets/audio/N01-VO-120.mp3` | 否 | — | — |
| N01-LOC-121 | 台灣繁體中文文本 | GLOBAL | `—` | 否 | — | — |
| N01-LOC-122 | 英文文本 | GLOBAL | `—` | 否 | — | — |
| N01-LOC-123 | 固定時間與術語表 | GLOBAL | `—` | 否 | — | — |

## 程式另外需要、xlsx 沒有列的

| 建議ID | 用途 |
|---|---|
| N01-VFX-088-1～4 | 序幕四個閃切鏡頭（xlsx 只有一筆 VFX-088） |
| 主角、教授立繪 | 目前沿用既有 `hero-m/f.webp`、`npc-induasen.webp`；正式版 N01-CHAR-012～014 到位後再切換 |
