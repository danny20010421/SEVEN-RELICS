# 秘寶真相 SEVEN RELICS 美術風格指南

這份文件描述 `assets/img/` 既有圖的畫風，並規定之後每一張新圖的尺寸、檔名、style prompt prefix 與審查標準。生成腳本 `tools/gen_image.py` 只讀本檔的 `category-spec` 區塊與各類 `style-prefix` 區塊；改規格時兩邊一起改，腳本在規格對不上時會直接停止。

舞台是 1280×720。畫面文字、按鈕、返回箭頭用 CSS 與 SVG，不做成點陣圖。本指南只管會放進 `assets/img/` 的 WebP。

看過的現有檔（用來歸納，不是待重畫的清單）：`n00-corridor.webp`、`n00-s01.webp`、`wild.webp`、`load1.webp`、`load2.webp`、`hero-f.webp`、`hero-m.webp`、`hero-f-pain.webp`、`avatar-f.webp`、`avatar-m.webp`、`npc-induasen.webp`、`npc-induasen-av.webp`、`it-compass.webp`、`it-crowbar.webp`、`it-memo.webp`、`it-timer.webp`、`ic-bag.webp`、`ic-settings.webp`、`ic-shop.webp`、`ic-vip.webp`、`coin.webp`、`diamond.webp`、`wordmark.webp`。

## 整體

暗色、電影感、偏半寫實的厚塗。不是 pixel art，不是 Q 版，不是扁平向量 icon，也不是把真人照片貼進遊戲。

同一套氣氛拆成兩種畫法，不要混成第三種：

- 場景、載入圖：暗色電影概念畫。空間、霧、濕反射是主體，材質要看得出是鐵、剝落的漆、濕石或濕磚。
- 角色：半寫實插畫。眼睛比寫實照片大、頭髮一綹一綹，陰影用厚塗而不是平塗色塊。比例是成年人的時尚身形，不是 chibi。
- 道具、UI icon、貨幣：單一實體物件的產品畫。金屬、皮革、寶石要有磨損與高光，輪廓吃一圈血紅色 rim light。

恐怖感來自紅光、霧、空房間與過大的眼睛，不靠血腥特寫或內臟。

## 色彩

UI 色票（`css/style.css`）就是畫面的顏色上限。新圖的主色停在這些色相裡：

| 角色 | 色票 | 用途 |
| --- | --- | --- |
| 近黑 | `#0a0607` | 陰影、夜空、未照到的牆。介面底是這顆，不是純灰 |
| 血紅 / 緊急紅 | `#c4142c`、`#e5263a` | 主光、rim light、瞳孔反光、寶石、出口燈 |
| 鏽色與舊金 | `#c9a27e`、`#d8b594` | 黃銅、舊銀、皮革邊緣、石雕高光。做小面積金屬，不做大色塊 |
| 奶油白 | `#f1e8e2` | 紙張、錶面、皮膚高光、極小的 specular。不拿來鋪背景 |

允許被紅光染色的材質色：灰褐大衣、深褐皮革、暖灰石牆、鐵鏽棕。它們是物體本身的顏色，面積可以大，但飽和度要低。

不要出現：白天的藍天、草地綠、霓虹青、紫色魔法光、乾淨的白棚背景、彩虹金屬。鐘面和紙張可以是偏白的奶油色，因為那是物件，不是背景。

## 光

紅光是輪廓光，不是把整張圖塗紅。

- 角色：背後或側後方打一圈 `#e5263a`，頭髮外緣、大衣下擺、袖口最亮，正面留在近黑裡，眼睛裡有一點紅的 catchlight。
- 室內：實用光源是鐵絲燈、EXIT 一類的緊急燈。牆是剝落的深色漆，地面濕，紅光在水窪裡拉出倒影。腳邊有一層薄霧或蒸汽。
- 室外：血月是主光。枯樹、殘拱、石階被染紅，水窪反射月亮。霧壓在中景，遠處的山是剪影。
- 道具與 icon：物件浮在透明底上，紅邊光沿著剪影走，凹陷處近黑，高點是奶油色。

不要平均的攝影棚三點光，不要日光，不要無方向的環境光。

## 角色

成年人，大約七個半頭的時尚身形。全身立繪要看到鞋子與頭髮頂端，只留很小的透明邊，大衣下擺與腳不可被裁掉。預設姿態可以雙手插袋，視線朝向觀眾或略微側過。

預設服裝，除非 prompt 明確要求這一位 NPC 的身份服裝：

- 黑色高領毛衣
- 灰褐、下擺不齊的長大衣，長度到小腿或腳踝，前襟敞開
- 黑色西裝長褲、簡單皮帶
- 黑皮鞋。女主角是高跟短靴，男主角是樂福鞋
- 紅色只出現在 rim light、袖口內裡或瞳孔，不做成一身紅制服

兩位主角的身份要鎖定，情緒變體只改姿勢與表情：

- 女主角 `hero-f`：深棕長波浪髮、紅瞳、黑色高跟短靴。`hero-f-pain` 是扶額、蹙眉，衣服不變。
- 男主角 `hero-m`：黑色捲髮、紅瞳、黑色樂福鞋。`hero-m-pain` 同樣只改成疼痛表情。
- 因杜阿森 `npc-induasen`：年長男性、銀白背梳髮、短鬚、圓框眼鏡與鏡鏈、深色學者大衣、酒紅背心、懷錶、手杖、掛著火漆文件的皮袋、手持燙金書。他是大學教授，不是主角換裝。

新的 NPC 可以有自己的職業服裝，但仍用同一套紅邊光、近黑布料與小面積舊金。頭像是同一個人的頭肩，不是另一張臉。

頭像會被裁成 64×64 的圓。臉要大、要正中，圓形裁切之後五官仍清楚；頭髮可以碰到四邊。

## 場景

16:9，不透明，沒有邊框。1280×720 舞台用 `object-fit: cover` 鋪滿；場景與舞台同為 16:9，所以整張都會被看到，不會被 cover 切掉。大廳頂欄、關卡 HUD 會壓住邊緣，主要的門、路、人物放在畫面中央約 70% 的安全區。

地點由 prompt 決定，畫法不變。既有的兩種場所：

- 工業緊急通道：剝漆牆、管線、電箱、鐵絲燈、濕地面、地霧。`n00-corridor.webp`、`n00-s01.webp`。
- 血月廢墟：枯樹、石板路、殘破拱門與水道橋、霧、水窪裡的紅倒影。`wild.webp`。

載入圖可以放角色與超自然元素（`load1.webp` 的紅眼睛、`load2.webp` 的低角度集會），但光色仍然是近黑加血紅。場景裡不要無意義的假文字。既有 EXIT 燈是關卡內容；新圖只有在 prompt 用引號寫出要出現的字時才畫字。

## 道具、icon、貨幣

一張圖只有一個物件，置中，透明背景。

- UI icon（`ic-`）：實體物件的四分之三視角，48×48 時仍認得出。例如皮革背包、咬合的鏽齒輪、裝著紅寶石的金屬推車、紅寶石王冠配月桂。不要扁平象形符號，不要外加圓形底章，不要字母。
- 道具（`it-`）：最長邊約佔正方形的 70% 到 85%。細的東西保持細，例如鐵棒是斜放的一根，不要畫成粗棍子。材質是鏽鐵、舊黃銅、裂開的皮革、發黃的紙、發黑的鋼。遊戲裡的解析盤是一枚黃銅羅盤（`it-compass.webp`），加時器是一隻帶紅針與鍊條的懷錶（`it-timer.webp`）。不要手，不要桌面。
- 貨幣：32×32 時仍是一枚錢幣或一顆寶石。`coin.webp` 是古典側面浮雕加月桂與一顆小紅寶石；`diamond.webp` 是多切面的紅寶石。不要數字、不要幣值文字。

透明就是透明。不要畫棋盤格，不要留白底或黑底，不要在腳下加一塊陰影。

## 交付規格

| 類別 | category | 交付尺寸 | 背景 | 畫面上的大小 | 生成時先向 API 要 |
| --- | --- | --- | --- | --- | --- |
| 場景 / 背景 | `scene` | 1600×900 | 不透明 | 1280×720 全畫面 | `1792x1008` |
| 立繪 | `portrait` | 850×1300 | 透明 | 對話立繪寬約 400，頭痛變體更寬 | `1024x1568` |
| 頭像 | `avatar` | 256×256 | 透明 | 64×64 圓形 | `1024x1024` |
| UI icon | `icon` | 256×256 | 透明 | 功能鍵 48×48 | `1024x1024` |
| 道具 | `item` | 400×400 | 透明 | 背包格 72×72，檢視約 136–200 | `1024x1024` |
| 關卡精靈 | `sprite` | 預設 1024×1024，可用 `--width` `--height` 覆寫 | 透明；矩形鋪滿的門板可以不透明 | 疊在場景上的物件，舞台座標見關卡 | 依交付比例計算，誤差 < 1% |
| 近景 | `closeup` | 1280×720 | 不透明 | 點物件後鋪滿舞台的正面近景 | `1280x720` |
| 貨幣 | `currency` | 160×160 | 透明 | 頂欄 32×32 | `1024x1024` |

API 的自訂 size 兩邊都要是 16 的倍數，總像素要落在 655,360 到 8,294,400，長短邊比不超過 3:1。1600×900 的 900、850×1300 的兩邊，以及 256、400、160 都過不了這條線，所以腳本先要上表右側的尺寸，再用 Pillow 縮成交付尺寸。場景與立繪的 API 比例已對齊交付比例（誤差小於 1%），縮放時不會裁切主體。

檔案一律是 `.webp`。不透明場景存成沒有 alpha 的 WebP；其餘類別保留透明。

## 檔名

小寫、數字、連字號。不要空白、底線、中文檔名或大寫。

| category | 規則 | 例子 |
| --- | --- | --- |
| scene | 小寫、數字、連字號 | `n01-hall`、`wild`、`load3` |
| portrait | `hero-f` 或 `hero-m`，後面可接情緒；或 `npc-` 開頭 | `hero-f`、`hero-f-pain`、`npc-induasen` |
| avatar | `avatar-f`、`avatar-m`，或同一個 NPC 名字加 `-av` | `avatar-f`、`npc-induasen-av` |
| icon | 必須以 `ic-` 開頭 | `ic-bag`、`ic-map` |
| item | 必須以 `it-` 開頭 | `it-lantern`、`it-compass` |
| sprite | `g` 加兩位關卡號，再接至少一段連字號 | `g01-cart`、`g01-s08-door` |
| closeup | `g` 加兩位關卡號，再接 `-cu-`，後面至少一段 | `g01-cu-locker-closed`、`g01-cu-paper` |
| currency | 短名。不要用 `ic-` 或 `it-` | `coin`、`diamond` |

`ic-` 只給 icon，`it-` 只給 item。關卡場景用 `nXX-` 加地點；全遊戲共用的背景可以用短名（`wild`、`load1`）。主角只有 `hero-f` 與 `hero-m`，情緒接在後面。NPC 立繪是 `npc-<拼音>`，頭像是同一個名字再加 `-av`。

腳本核對的正則（與 `NAME_PATTERNS` 相同）：

```text
scene ^[a-z0-9]+(?:-[a-z0-9]+)*$
portrait ^(?:hero-[mf](?:-[a-z0-9]+)*|npc-[a-z0-9]+(?:-[a-z0-9]+)*)$
avatar ^(?:avatar-[mf]|npc-[a-z0-9]+(?:-[a-z0-9]+)*-av)$
icon ^ic-[a-z0-9]+(?:-[a-z0-9]+)*$
item ^it-[a-z0-9]+(?:-[a-z0-9]+)*$
sprite ^g[0-9]{2}(?:-[a-z0-9]+)+$
closeup ^g[0-9]{2}-cu(?:-[a-z0-9]+)+$
currency ^[a-z0-9]+(?:-[a-z0-9]+)*$
```

關卡精靈是疊在場景上的單一物件（礦車、櫃門、門、把手）。檔名用關卡號開頭，不要用 `it-` 或 `ic-`。交付尺寸不是固定的 1024×1024：生成時加 `--width` 與 `--height`，長短邊比不得超過 3:1，腳本會挑一組同比例的合法 API size 再縮小。預設畫布只在沒給寬高時使用。

多張變體在待審階段寫成 `it-lantern-v1.webp`、`it-lantern-v2.webp`。核准進 `assets/img/` 時只用正式名 `it-lantern.webp`。

## 既有例外

這些舊檔不要拿新規格去重做，審查也不要拿它們當新圖的尺寸依據：

- `hero-f.webp`、`hero-m.webp` 高度是 1300，寬度只有約 480–510，因為當時把透明邊裁掉了。新立繪統一放在 850×1300 的透明畫布上。
- `hero-f-pain.webp`、`hero-m-pain.webp` 寬度約 820–855，已接近新規格。
- `npc-induasen-av.webp` 是 192×192、沒有 alpha。新頭像是 256×256 透明。
- `wordmark.webp` 是 1200×397 的金屬標題字「秘寶真相」，不屬於上表任何一類。不要用這個流程重畫標題。
- `n00-crowbar-floor.webp` 是 360×66、帶 alpha 的關卡熱點，不是一張背景，也不是 `it-crowbar`。

## Style prompt prefix

每一段 fence 都會被原樣加在使用者 prompt 前面，再補上 `Subject:` 與選填的 `Intended use:`。前綴用英文，因為圖像模型對這段材質與限制的遵循比較穩。不要在呼叫腳本時把前綴再寫一次。

HTML 註解是腳本的錨點，刪了或改了類別 id，生成會停。

### scene

<!-- style-prefix: scene -->
```text
Dark cinematic semi-realistic environment painting for the mystery game Seven Relics (秘寶真相). Opaque full-bleed 16:9 picture, no border, no letterbox, no watermark, no signature, no logo. Palette: near-black shadows (#0a0607), blood and emergency red (#c4142c, #e5263a), rust and antique gold only as worn metal (#c9a27e, #d8b594), cream only as small specular highlights (#f1e8e2). Painterly materials with visible grain, peeling paint, wet stone or tile, and low volumetric fog. Strong red rim light and red reflections on damp ground. Keep the single focal subject inside the central 70 percent so interface chrome can cover the edges. No pixel art, no flat cel animation, no bright daylight, no blue sky, no saturated green, no cyan neon, no modern UI, and no extra text unless the subject line quotes the exact words to render.
```

### portrait

<!-- style-prefix: portrait -->
```text
Full-body character portrait for Seven Relics (秘寶真相), centered on a fully transparent background. Show the shoes and the top of the hair with only a small transparent margin; do not crop the coat or the feet. Tall adult proportions, about seven and a half heads, not chibi and not a child. Semi-realistic painterly illustration: large expressive eyes, individually painted hair strands, thick soft shading, fashion-sketch silhouette. Not flat cel animation, not pixel art, not a photograph of a real person. Default costume unless the subject says otherwise: black turtleneck, long muted taupe-grey overcoat with an uneven hem, black tailored trousers, plain belt, black leather shoes. Red is a rim light along the hair, shoulders, and coat edge, plus a red catchlight in the eyes, not a red uniform. Antique gold (#c9a27e, #d8b594) only for small metal details. Near-black cloth in the shadows. No scenery, no floor, no cast shadow blob, no frame, no text, no watermark, no checkerboard.
```

### avatar

<!-- style-prefix: avatar -->
```text
Head-and-shoulders avatar for Seven Relics (秘寶真相), square, fully transparent background. The face is large and centered so it still reads after a circular crop to 64 pixels; hair may touch the edges. Match the full-body portraits: painterly semi-realistic illustration, red rim light on the hair, near-black clothing, cream skin highlights, no scenery, no frame, no text, no watermark, no checkerboard. Not pixel art, not chibi, not a photograph.
```

### icon

<!-- style-prefix: icon -->
```text
One physical UI icon for Seven Relics (秘寶真相), centered on a fully transparent background, three-quarter view, readable at 48 pixels. Dark forged metal, leather, rust, and antique gold, with a blood-red rim light (#e5263a) and a small red gem or inner red glow when it suits the object. Semi-realistic painted material, bevelled and worn, not a flat vector pictogram, not pixel art, not a photograph of a plastic toy. No letters, no numbers, no badge circle, no scenery, no watermark, no checkerboard.
```

### item

<!-- style-prefix: item -->
```text
One inventory object for Seven Relics (秘寶真相), centered on a fully transparent background, slight three-quarter or diagonal view. The longest side spans about 70 to 85 percent of the square; thin objects such as tools stay thin. Antique or worn materials: rusted iron, aged brass, cracked leather, yellowed paper, darkened steel. Blood-red rim light, cream specular highlights, near-black recesses. Semi-realistic product painting, not pixel art, not a flat icon, not a glossy modern product photo. No hands, no scenery, no text, no watermark, no checkerboard.
```

### sprite

<!-- style-prefix: sprite -->
```text
One compositing sprite for Seven Relics (秘寶真相), on a fully transparent background. Paint only the single object named in the subject, seen from the same eye-level angle as a dark mine interior. If the subject says full-bleed, the opaque surface must touch the canvas edges it names so the game can scale the file onto a hotspot without a gap; interior holes and any named gaps stay transparent. Otherwise keep a transparent silhouette and let the opaque pixels touch the bounding edges the subject names. Blood-red rim light, wet rust, near-black shadows, cream only as small specular highlights. No scenery, no floor, no cast shadow blob, no second object, no frame, no watermark, no checkerboard, and no text unless the subject quotes the exact characters.
```

### closeup

<!-- style-prefix: closeup -->
```text
A straight-on, frontal close-up for Seven Relics (秘寶真相), opaque full-bleed 16:9, as if the camera has moved squarely in front of one object. Not a cropped angle of a wide shot, not a three-quarter view, not a dutch tilt. The object faces the lens and fills the frame; its front surface is parallel to the picture plane. Dark cinematic semi-realistic painting: near-black shadows (#0a0607), blood-red rim light (#c4142c, #e5263a), worn rust and antique gold only as metal (#c9a27e, #d8b594), cream only as paper or a small specular (#f1e8e2). Wet iron, peeling paint, or yellowed paper, with a little fog at the edges. No border, no letterbox, no watermark, no modern UI, no hands, and no text or digits unless the subject line quotes the exact characters.
```

### currency

<!-- style-prefix: currency -->
```text
One currency token for Seven Relics (秘寶真相), centered, fully transparent background, readable at 32 pixels. Paint either an antique metal medallion with a classical relief, a laurel, and one small red gem, or a faceted crimson jewel (#c4142c, #e5263a). Red rim light and cream highlights. No numerals, no letters, no scenery, no watermark, no checkerboard.
```

## 審查清單

審查對象是 `assets/_pending/` 裡的新圖與它的 sidecar JSON。先讀 JSON 的 `category`、`final_prompt`、`intended_use`，再看圖。舊檔例外不適用於新圖。

任一條 FAIL 條件成立，整張就是 FAIL。不要用「大致可以」放行。不確定就 FAIL，請生成端改 prompt 重來。

1. **身份與檔名。** FAIL：category 與檔名規則不符、`ic-` / `it-` 用錯類別、變體被直接放進 `assets/img/` 時仍帶 `-v1`。
2. **尺寸與背景。** FAIL：像素尺寸不是規格表、場景帶有 alpha、透明類別沒有透明像素、透明區域被畫成棋盤格、白底或黑底。sprite 以 sidecar 的 `output_size` 為準，不必是 1024×1024。prompt 寫明 full-bleed 的矩形門板、櫃門、控制盤可以完全不透明。
3. **色彩。** FAIL：主色離開近黑、血紅、鏽金、奶油白；出現藍天、草地綠、霓虹青、紫光；紅光鋪滿整張以致沒有近黑陰影。
4. **畫法。** FAIL：pixel art、Q 版、扁平 icon、塑膠 3D 公仔、真人照片、浮水印、簽名。角色可以有偏大的眼睛與細髮，這是既有立繪的畫法，不算 FAIL。
5. **光。** FAIL：沒有紅色 rim light，或光源變成日光、白棚燈、無方向的灰霧。場景若是室內或潮濕室外，卻完全沒有霧或濕反射，也是 FAIL。
6. **主體。** FAIL：道具、icon、貨幣、頭像出現多個互不相關的主體；主體被畫布裁切；立繪看不到腳或頭頂；頭像的臉偏到圓形裁切會切掉五官的位置。sprite 若 prompt 要求鋪滿畫布以便對位，四邊碰到邊緣不算裁切。
7. **文字。** FAIL：出現 prompt 沒有用引號要求的字、假 logo、幣值數字。要求了字卻拼錯，也是 FAIL。
8. **連續性。** FAIL：`hero-f` / `hero-m` / `npc-induasen` 的臉、髮型或既定服裝被換成另一個人；情緒變體順便換了衣服。
9. **小尺寸仍可辨。** FAIL：icon 縮到 48px、貨幣縮到 32px、道具縮到 72px 之後只剩一塊紅。
10. **場景安全區。** FAIL：唯一的出入口或主體貼在四邊，中央 70% 是空的。

解剖明顯崩壞（多出來的手指、融化的五官、斷開的四肢）是 FAIL。大衣口袋裡的手看不清楚，不是 FAIL。

審查輸出用這個格式，方便生成端照著改：

```text
結果: PASS
檔案: assets/_pending/it-lantern.webp
未過項目:
備註:
```

FAIL 時把清單編號與一句理由寫進「未過項目」。PASS 才執行 `tools/review_asset.py approve`。FAIL 執行 `reject --reason`，理由沿用未過項目，不要只寫「風格不對」。

## 腳本讀取的規格

上一張表若與這個區塊衝突，以這個區塊為準。

```category-spec
# id|width|height|background|api_size
# api_size：寬高皆為 16 的倍數，像素數 655360–8294400，長短邊比不超過 3:1。
scene|1600|900|opaque|1792x1008
portrait|850|1300|transparent|1024x1568
avatar|256|256|transparent|1024x1024
icon|256|256|transparent|1024x1024
item|400|400|transparent|1024x1024
sprite|1024|1024|transparent|1024x1024
closeup|1280|720|opaque|1280x720
currency|160|160|transparent|1024x1024
```
