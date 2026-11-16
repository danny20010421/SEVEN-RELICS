# G01 近景待畫清單

這一輪要的是「正面近景」，不是把寬景裁一塊。相機正對物件，物件正面與畫面平行，鋪滿 1280×720。字、數字、銘文由遊戲介面畫在近景上，圖裡不要畫字，除非 Subject 用引號寫出要出現的字。本清單沒有任何引號文字。

遊戲在對應檔案還沒放進 `assets/img/` 時，用現有精靈與同色系的檢視畫面頂著，所以可以先畫、後整合。檔案一到、檔名相符，近景會自動改鋪這張圖。

生成不要自己加重複的風格前綴。`tools/gen_image.py` 會讀 `STYLE_GUIDE.md` 的 `closeup` 或 `sprite`。

```bash
python tools/gen_image.py --category closeup --name g01-cu-paper --prompt "SUBJECT"
python tools/gen_image.py --category sprite --name g01-sp-cu-clothes --width 640 --height 480 --prompt "SUBJECT"
python tools/gen_image.py --category scene --name g01-s04 --prompt "SUBJECT"
```

近景類別交付 1280×720、不透明，API 尺寸就是 `1280x720`。精靈透明。場景仍是 1600×900。

## 數量

| 種類 | 張數 | 檔名 |
| --- | --- | --- |
| 新的正面近景 | 42 | `g01-cu-*.webp` |
| 新的透明精靈 | 3 | `g01-sp-cu-*.webp` |
| 要重畫的寬景與櫃門 | 2 | `g01-s04.webp`、`g01-s04-locker.webp` |
| 合計要畫 | **47** | |

沿用、不要重畫：`g01-s08-gold.webp`（撬開金庫木箱後的近景）、`g01-chock.webp`、`g01-grip.webp`、`g01-crowbar.webp`、`it-crowbar.webp`、`it-handle.webp`、`it-journal.webp`、`it-letter.webp`、`it-photo.webp`、`it-manual.webp`、`g01-cart.webp`、`g01-switch.webp`、`g01-ledger.webp`、`g01-latch.webp`、`g01-keypad.webp`、`g01-plate.webp`、`g01-s06-door.webp`、`g01-s07-panel.webp`、`g01-s08-door.webp`。它們現在被放大放在檢視畫面上，正式近景到了就換掉。

## 近景

類別都是 `closeup`，1280×720，不透明。每一張都是正面、物件朝鏡頭。

### g01-cu-paper

- 用途：所有可讀文件的內頁（邀請函、報告、班次表、紙條、日誌、手冊、信、兩本帳）。文字是介面。
- 狀態：一張，攤開的空白紙。
- Subject: Straight-on frontal view of one large sheet of blank yellowed 1940s paper filling the frame, lying flat and parallel to the lens. Soft creases, a darker foxed edge, cream paper, no writing, no lines, no stamp. The corners stay inside the frame. Dark damp wood only as a thin margin around the sheet. Red rim light on the paper edge.

### g01-cu-study-photo

- 用途：S01 研究室牆上的金瓜石舊照片。點照片後才打開文件。
- Subject: Straight-on framed black-and-white photograph of a 1940s Taiwanese gold-mine portal and terraced mine buildings, the frame parallel to the lens and filling most of the picture. Aged cream mount, no caption, no handwriting. Dark study wall around the frame, red rim light on the frame only.

### g01-cu-envelope

- 用途：S01 館長邀請函，尚未拆開的信封。
- Subject: Straight-on frontal view of one sealed yellowed envelope lying flat, wax-free, string tie, parallel to the lens, filling the frame. Blank face, no address, no characters. Dark wood underneath only at the edges. Red rim light.

### g01-cu-report

- 用途：S01 攤開的礦山報告封面。內文另開紙張近景。
- Subject: Straight-on open report folder lying flat, blank cream pages, a dark cloth cover visible at the left edge, parallel to the lens. No title, no red pen, no table. Dim study desk at the extreme edges only.

### g01-cu-cart

- 用途：S03 與 S06 側線的礦車。正對車頭。S03 與側線共用這張。
- Subject: Straight-on front view of an empty rusty 1940s mine cart facing the camera, the front plate parallel to the lens. Two wheels and the near rail visible at the bottom, the cart body filling the frame. Wet rust, red rim light, black tunnel behind. No ore, no text, no people.

### g01-cu-wheel

- 用途：S03 車輪與止輪器的正面。止輪器是既有精靈 `g01-chock.webp`，這張不要畫止輪器。
- 狀態：車輪卡住前的空位；止輪器拿掉後也用這張。
- Subject: Straight-on close view of one rusty mine-cart wheel and a short run of rail, the wheel facing the camera. The rail bed in front of the wheel is bare, a clear gap where a wooden chock would sit, no chock in the picture. Wet rock, red rim light. No text.

### g01-cu-crowbar

- 用途：S03 牆邊鐵撬棒，點了才撿起。道具欄另有 `g01-cu-item-bar`。
- Subject: Straight-on frontal view of one iron crowbar standing vertically against a wet timber, the bar parallel to the picture plane and filling the height of the frame. Thin, worn, not a thick club. Red rim light. No hand, no text.

### g01-cu-crate

- 用途：S03 破木箱內部，空的。手柄是既有 `g01-grip.webp`。
- 狀態：有手柄／撿走後空箱，共用這張空內部。
- Subject: Straight-on view looking squarely into an open broken wooden crate, the opening parallel to the lens. Empty interior, splintered front edge, dark inside. No handle, no cloth, no text.

### g01-cu-switch

- 用途：S03 轉轍器正面。沒有手柄；裝上後的手柄是既有精靈。
- Subject: Straight-on iron railroad switch stand, the face plate parallel to the lens. An empty square socket in the center where a lever handle would fit, no handle. Wet rails at the bottom edge, red rim light. No text, no arrow.

### g01-cu-board

- 用途：S04 黑板正面。粉筆字與照片是介面和精靈，不要畫進去。
- Subject: Straight-on green-black slate blackboard filling the frame, wooden frame parallel to the lens. The slate is mostly blank, a faint erased patch in the upper-left third where a photograph can be pinned, no photo, no chalk letters. Red rim light on the wet frame. No readable marks.

### g01-cu-lamp

- 用途：S04 吊著的舊礦燈，正面。
- Subject: Straight-on oil mining lamp facing the camera, glass chimney and wire cage parallel to the lens, filling the frame. The flame is out, glass grey with dust, a little red rim light on the metal. Dark timber behind. No text.

### g01-cu-sheet

- 用途：S04 桌上的班次表，尚未攤開閱讀。內文在紙張近景。
- Subject: Straight-on yellowed sheet lying flat on wet wood, slightly curled corners, blank, parallel to the lens, filling the frame. No table, no numbers, no handwriting.

### g01-cu-scrap

- 用途：S04 紙條。
- Subject: Straight-on small torn scrap of yellowed paper lying flat, blank, filling the center of the frame, dark wet wood around it. No handwriting.

### g01-cu-helmet

- 用途：S04 桌上的礦工帽，正對帽頭。
- Subject: Straight-on front of a dented 1940s miner helmet, the lamp on the front facing the camera and dead. Rust, cracked leather, red rim light. The helmet fills the frame. No text, no face inside.

### g01-cu-soaked

- 用途：S04 泡爛的紀錄，書頁黏死。
- Subject: Straight-on closed waterlogged cloth book lying flat, pages swollen and fused, ink bled into abstract stains with no letters. Parallel to the lens, filling the frame. Dark wet table at the edges.

### g01-cu-shelf

- 用途：S04 書櫃正面。每一本都可點，近景裡不要有可讀的書名。
- Subject: Straight-on wooden bookshelf filling the frame, three shelves of warped water-stained books seen from the front, spines toward the camera. No readable titles. One shelf partly empty. Red rim light, fog at the right edge.

### g01-cu-photo-men

- 用途：休息室與側線的四人合照正面。名字是介面。兩處共用。
- Subject: Straight-on aged black-and-white photograph filling the frame, four adult men in worn 1940s work clothes standing shoulder to shoulder at a mine portal, facing the camera. No modern clothing, no names, no handwriting, no caption. Cream worn border. Not a likeness of any real person.

### g01-cu-photo-back

- 用途：側線那張照片的背面。字是介面。
- Subject: Straight-on back of an aged photograph, blank cream paper with foxing and a slight curl, parallel to the lens, filling the frame. No handwriting, no stamp.

### g01-cu-locker-closed

- 用途：01、02、03 三個鐵櫃共用的關門正面。編號是介面銅牌，不要畫數字。
- 狀態：關閉。
- Subject: Straight-on single tall iron locker door, the door parallel to the lens and filling the frame. Same heavy riveted rusted slab as a mine locker, hinges on the left, a latch on the right, a blank brass nameplate in the upper third with no digits. Peeling dark paint, red rim light, wet metal. No second door, no room around it.

### g01-cu-locker-open

- 用途：任一鐵櫃撬開後。門扇打開能看見，內部是空的。衣服與日誌是精靈。
- 狀態：打開且空。放上衣服精靈就是「打開且有工作服」；放上日誌精靈就是「打開且有日誌」；精靈拿走就是「撿空」。
- Subject: Straight-on open iron locker, the same door as the closed view swung open toward the left so both the dark interior and the inner face of the door are visible. Empty shelves, a hanging bar, no clothes, no book, no digits, no brass number. Red rim light inside the cavity.

### g01-cu-journal

- 用途：鐵櫃裡那本日誌的封面近景。點開後才讀內頁。書名是介面。
- Subject: Straight-on closed cloth journal lying flat, dark worn cover, a blank leather label in the center with no letters, parallel to the lens, filling the frame. Red rim light on the cover edge.

### g01-cu-ledger

- 用途：S05 離站簿與到站簿共用。點下去才把表格畫在紙上。
- Subject: Straight-on closed cloth ledger standing upright and facing the camera, the cover parallel to the lens, filling the frame. Blank, no title, worn corners, red rim light.

### g01-cu-scale

- 用途：S05 磅秤正面，指針卡死。
- Subject: Straight-on large industrial dial scale, the round face parallel to the lens and filling the frame. The needle is stuck, the face has tick marks but no numerals and no words. Cracked glass, rust, red rim light.

### g01-cu-board5

- 用途：S05 運量登記板。數字鍵盤是介面，叠在板子中央。
- Subject: Straight-on dark slate registration board filling the frame, an empty recessed rectangle in the center for a numeric display, no digits, no chalk writing. Iron frame, red rim light, wet stone around the board.

### g01-cu-gravel

- 用途：S05 碎石蓋住轉轍器之前。
- Subject: Straight-on view of wet mine rails with a low pile of loose gravel filling the center of the track, the rails running vertically in the frame so the pile is seen from the front. No switch visible. Red reflections in the puddles. No text.

### g01-cu-oldswitch

- 用途：S05 扒開碎石之後，舊轉轍器露出來。
- Subject: The same straight-on rails as the gravel close-up, gravel gone, a small rusted switch stand now sitting between the rails and facing the camera. No lever handle, no text. Wet stone, red rim light.

### g01-cu-tunnel

- 用途：S06 三條坑道共用。A、B、C 是介面銅牌。
- Subject: Straight-on timbered mine tunnel mouth facing the camera, the portal parallel to the lens, rails running from the bottom center into black. A blank cream board above the portal, no letter. Fog inside. Red rim light on wet timber. No people.

### g01-cu-plaque

- 用途：S06 牆上刻字的石板。句子是介面。
- Subject: Straight-on weathered stone plaque filling the frame, scratched and damp, no readable characters, no letters. Iron pins at the corners. Red rim light, dark rock around it.

### g01-cu-irondoor

- 用途：S06 側線鐵門正面。門扣是另一張近景，這張的門扣位置留空。
- Subject: Straight-on rusted iron door filling the frame, the door parallel to the lens. A blank patch on the right stile where a latch will be composited, no latch painted. Rivets, red rim light, no text, no window.

### g01-cu-latch

- 用途：側線門扣的正面特寫。用撬棒撬的就是這裡。
- Subject: Straight-on rusted iron latch and hasp filling the frame, the metal parallel to the lens, screws and flakes of rust sharp. No hand, no crowbar, no text.

### g01-cu-manual

- 用途：S07 掛在牆上的維修手冊，封面。內文在紙張近景。
- Subject: Straight-on closed worn booklet hanging flat against wet stone, the cover parallel to the lens and filling the frame. Blank cover, a nail at the top, no title. Red rim light.

### g01-cu-panel

- 用途：S07 控制盤正面。四個開關的字是介面；圖上是沒有標籤的扳桿，都在下方位置。
- Subject: Straight-on iron control panel filling the frame, four vertical metal toggles in a row, all resting down, no labels, no letters, no lamps lit. Empty socket on the left where a handle can be added. Red rim light, dark stone behind the panel edge.

### g01-cu-rack

- 用途：S07 工具架正面。控制手柄是既有 `it-handle.webp`，這張的掛釘是空的。
- Subject: Straight-on wooden tool rack filling the frame. Rusted unusable tools on most pegs, one empty peg near the upper center, no T-handle. Red rim light. No text.

### g01-cu-shaft

- 用途：S07 正對升降井與鐵籠。
- Subject: Straight-on view into a vertical mine shaft, the iron cage front facing the camera at the bottom of the frame, the shaft rising as a black rectangle. Wet guides, one lamp, fog. No people, no text.

### g01-cu-vault

- 用途：S08 金庫門正面。刻字、MMDD、號碼都是介面。鎖與銅牌的位置留空。
- Subject: Straight-on heavy riveted vault door filling the frame, the door parallel to the lens. A blank circle in the upper-middle for a lock, a blank rectangle low on the door for a plate, no digits, no engraved sentence, no chain. Red rim light, rough rock only at the extreme edges.

### g01-cu-dial

- 用途：S08 機械鎖正面。四位數字是介面。
- Subject: Straight-on mechanical lock with four blank brass wheels side by side, the wheels facing the camera and filling the frame. No digits on the wheels. Dark iron around them, red rim light.

### g01-cu-mmdd

- 用途：S08 密碼牌正面。MMDD 四個字母是介面。
- Subject: Straight-on small blank brass plate filling the frame, four empty recessed slots in a row, no letters, no digits. Tarnish, screws, red rim light, dark iron behind the plate.

### g01-cu-crate-shut

- 用途：S08 釘死的木箱正面。撬開後改用既有的 `g01-s08-gold.webp`，不要為黃金另畫一張。
- Subject: Straight-on nailed wooden crate front, the lid parallel to the lens and filling the frame, nail heads visible, no gold, no cloth, no letter. Dark vault behind the edges. Red rim light.

### g01-cu-letter

- 用途：木箱裡那封信，摺好的正面。內文在紙張近景。
- Subject: Straight-on folded yellowed letter lying flat, blank, a bit of string, parallel to the lens, filling the center. No handwriting. Dark cloth and a hint of dull gold at the extreme edges only, no readable metal stamp.

### g01-cu-item-bar

- 用途：道具欄檢視鐵撬棒。比背包圖大，正面。
- Subject: Straight-on iron crowbar lying flat and horizontal, parallel to the lens, centered, thin and worn, on a dark wet bench that fills the rest of the frame. Red rim light. No hand, no text.

### g01-cu-item-grip

- 用途：道具欄檢視扳桿手柄。
- Subject: Straight-on metal lever grip lying flat, the T or bar parallel to the lens, a notch at one end, centered on a dark wet bench. Red rim light. No text.

### g01-cu-item-ctl

- 用途：道具欄檢視控制手柄。
- Subject: Straight-on control handle lying flat, a short shaft and crossbar parallel to the lens, polished where hands wore it, centered on a dark wet bench. Red rim light. No text.

## 透明精靈

類別 `sprite`，透明背景。近景打開後叠在櫃內或箱內，可以被點。

### g01-sp-cu-clothes

- 尺寸：640×480
- 用途：01、02 號櫃打開後裡面的工作服。點了只會查看，不能拿走。
- 狀態：一張。櫃子空了就不要畫第二張，遊戲把精靈拿掉。
- Subject: One crumpled set of worn canvas mine work clothes, folded and seen from the front, isolated on transparency. Dirty, damp, no body inside, no hanger, no text. Red rim light on the folds.

### g01-sp-cu-journal

- 尺寸：520×360
- 用途：03 號櫃打開後，日誌躺在架子上。點了進入封面近景。撿進檔案後遊戲拿掉這張。
- Subject: One closed dark journal lying at a slight rest but still mostly front-on, isolated on transparency. Blank cover, no title. Red rim light. No hands.

### g01-sp-cu-letter

- 尺寸：480×320
- 用途：黃金箱裡可點的那封摺好的信。
- Subject: One folded blank letter isolated on transparency, front-on, yellowed paper, a bit of string. No handwriting. Red rim light.

## 要重畫的寬景

### g01-s04.webp

- 類別：`scene`，1600×900，不透明
- 用途：取代現在的休息室寬景。三座鐵櫃必須是同一種框，編號不要畫進圖，櫃門由 `g01-s04-locker.webp` 蓋上。合照改釘在黑板上，所以黑板要留一塊空位，不要把照片畫進背景。
- 遊戲目前把櫃門放在舞台：x=596、724、852，y=162，寬 124，高 388。照片放在 x=200，y=175，寬 170，高 120。新圖盡量維持這個佈局，整合時再微調。
- Subject: The same dim miners' rest room as before: wet timber, a hanging oil lamp, a heavy table with a blank yellowed sheet, a dented helmet and a soaked log, a bookshelf at the right. The blackboard on the left wall is blank except for a slightly cleaner rectangle on the board itself, about 16% to 30% across and 24% to 42% down, where a photo can be pinned; the wall to the left of the blackboard is bare, no photograph. Right of center, three identical tall locker frames, equal width, from about 46% to 77% across and 22% to 76% down. All three openings are dark and empty, no doors, no brass numbers, no painted digits. No readable text anywhere.

### g01-s04-locker.webp

- 類別：`sprite`，`--width 496 --height 1536` 會超過 3:1，所以用 `--width 512 --height 1024`。遊戲再用 cover 拉到櫃位。透明底，門板本身不透明並貼齊四邊。
- 用途：三個櫃子共用同一扇門。不要編號。
- Subject: One tall riveted iron locker door, full-bleed, the opaque door touching all four edges, hinges on the left, latch on the right, a blank brass plate in the upper third with no digits. Same door three times in the game. Transparent only if any pixel falls outside the door, otherwise the door fills the canvas. No number, no text, red rim light, peeling dark paint.

## 近景裡的狀態怎麼對

| 物件 | 圖 | 遊戲怎麼換 |
| --- | --- | --- |
| 鐵櫃關閉 | `g01-cu-locker-closed.webp` | 01、02、03 共用，銅牌數字是介面 |
| 鐵櫃打開、有工作服 | `g01-cu-locker-open.webp` + `g01-sp-cu-clothes.webp` | 01、02 |
| 鐵櫃打開、有日誌 | `g01-cu-locker-open.webp` + `g01-sp-cu-journal.webp` | 03，點日誌再進 `g01-cu-journal.webp`，再進紙張 |
| 鐵櫃打開、已空 | `g01-cu-locker-open.webp` | 日誌收進檔案之後 |
| 止輪器還在 | `g01-cu-wheel.webp` + 既有止輪器精靈 | 撬掉後只留輪子 |
| 破木箱有手柄 | `g01-cu-crate.webp` + 既有手柄精靈 | 拿走後只留空箱 |
| 轉轍器沒有／已裝手柄 | `g01-cu-switch.webp` | 手柄精靈叠上去 |
| 碎石／舊轉轍器 | `g01-cu-gravel.webp` 然後 `g01-cu-oldswitch.webp` | 登記成功後才挖得開 |
| 金庫木箱釘死／已開 | `g01-cu-crate-shut.webp` 然後既有 `g01-s08-gold.webp` | 信是 `g01-sp-cu-letter.webp` |
