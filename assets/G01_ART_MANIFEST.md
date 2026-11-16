# G01 待畫清單

正式圖還沒到。S03–S08 與結語遠景若缺任何一張本幕要用的 webp，整幕退回 `js/g01art.js` 的示意圖。下面每一張都還沒有檔案。

舞台是 1280×720。場景 1600×900 用 `object-fit: cover` 鋪滿，比例相同，不會被裁切。精靈的舞台座標寫在 `js/g01art.js` 的 `PLACES`，跟下面的百分比是同一套（百分比 = 舞台像素 ÷ 1280 或 ÷ 720）。

生成時不要重寫風格前綴。`tools/gen_image.py` 會自己加上。prompt 只放下面的 Subject。sprite 要加 `--width` 與 `--height`。

已經在用、不要重畫：

| 檔案 | 用途 |
| --- | --- |
| `g01-study.webp` | S01 因杜阿森研究室 |
| `g01-museum.webp` | S02 與 S09 回館，博物館辦公室 |
| `npc-induasen.webp` | S01 立繪 |
| `npc-arthur.webp` | S07 升降時的記憶剪影 |
| `it-crowbar.webp` | 背包裡的鐵撬棒。坑口那根是另外的精靈 |
| `hero-m.webp`、`hero-f.webp` | 主角立繪 |

## 場景

類別都是 `scene`，1600×900，不透明。

### g01-s03.webp

- 用途：S03 本山六坑入口背景。礦車、止輪器、撬棒、手柄是精靈，不要畫進這張。
- Subject: Eye-level view outside a timbered 1940s Taiwan gold-mine portal at dusk, wet rock and peeling timber, two rusty rails running from the bottom center into a black tunnel mouth. Leave these regions empty for sprites: rails and floor clear from 34% to 57% across and 50% to 81% down (no cart); a low iron switch stand with an empty socket and no lever handle at 19% to 28% across and 60% to 85% down; a bare vertical timber strip at 14% to 20% across and 54% to 88% down (no crowbar); a broken open crate at 68% to 82% across and 65% to 90% down whose interior is empty around 76% to 81% across and 68% to 75% down. The right inner wall around 64% across and 28% down is bare wet stone, no letters. A blank weathered board above the portal, no readable text. Fog, dripping rock, red rim light only on wet metal. The rightmost 17% may fall into shadow.

### g01-s04.webp

- 用途：S04 礦工休息室背景。03 號櫃門與合照是精靈。
- Subject: Dim miners' rest room inside a wet timbered adit. Left wall, a green-black blackboard with faded unreadable chalk, about 14% to 38% across and 15% to 43% down. A hanging oil lamp near 41% across and 12% down, glass grey with dust. Center, a heavy wooden table with a yellowed shift sheet, a dented helmet, and a soaked unreadable log; no legible writing. Far left of the table, 6% to 14% across and 51% to 63% down, leave the wood bare for a photograph sprite. Right of center, three tall iron lockers from 53% to 76% across and 31% to 86% down. Lockers one and two are shut, each with a blank brass plate in the upper third and no digits. Locker three's frame is there but its door slab is missing: a dark empty opening from 69% to 76% across and 39% to 72% down. A water-stained bookshelf at 80% to 86% across, not in the far-right shadow. No readable text anywhere.

### g01-s05.webp

- 用途：S05 六坑運礦站背景。兩本簿子、碎石、舊轉轍器是精靈。
- Subject: Underground ore station, two sets of wet rails converging toward the back, a hanging lamp, red reflections in puddles. Left, a wooden desk whose top is clear from 6% to 22% across and 52% to 61% down (no books). Center floor, rails visible from 35% to 49% across and 71% to 81% down, no gravel and no switch. Right of center, a large dial scale. Upper right, a blank dark slate board from 58% to 77% across and 19% to 43% down, no writing, no numbers. No cart.

### g01-s06.webp

- 用途：S06 三條路線的選擇畫面。沒有精靈。A、B、C 由遊戲介面疊上，圖裡不要畫字母。
- Subject: Three mine tunnel mouths side by side in one wet gallery. Left mouth 12% to 32% across, middle 37% to 57%, right 62% to 82%, each from about 42% to 89% down, timber frames, rails disappearing into black. Above each mouth, at 22%, 47%, and 72% across and 34% down, a small blank cream board with no letters. Upper center, a weathered plaque from 30% to 64% across and 15% to 32% down, scratched stone, no readable characters. No people.

### g01-s06b.webp

- 用途：S06 側線。礦車、鐵門、門扣、照片是精靈。
- Subject: A narrow side tunnel. Rails clear from 10% to 31% across and 60% to 87% down, no cart. Center, a dark rectangular opening from 34% to 56% across and 25% to 75% down, empty, no door. To the right of that opening, bare wet stone from 62% to 70% across and 44% to 56% down, no photograph. Red rim light, dripping timber, fog. No text.

### g01-s07.webp

- 用途：S07 五坑豎井。控制盤與手柄是精靈，牆上的手冊畫在背景裡。
- Subject: A disused vertical lift shaft in a mine, the iron cage resting at the bottom of a black shaft that fills 34% to 56% across and 13% to 88% down. Left wall is bare stone from 15% to 27% across and 45% to 73% down (a control panel sprite covers it). Above that, at 12% to 19% across and 28% to 43% down, a closed worn booklet hanging on a nail, no readable text. Right, a tool rack with an empty peg at 73% to 78% across and 41% to 49% down, other tools rusted and not a T-handle. Fog and a single lamp. No people, no text.

### g01-s08.webp

- 用途：S08 金庫室背景。門、鐵鍊、鎖、密碼牌、木箱都是精靈。
- Subject: A rough rock chamber. Center, a heavy iron door frame with rivets, the opening itself dark and empty from 27% to 61% across and 25% to 86% down, no door, no chain, no lock, no crates. The stone jambs just outside that opening are carved but have no readable letters. One lamp, wet dust, red rim light on the frame. No gold, no text.

### g01-s08-gold.webp

- 用途：撬開木箱後的近景。沒有信紙上的字，信是遊戲介面。
- Subject: Close view looking down into an opened 1940s wooden crate in a dark vault. Inside, several cloth-wrapped gold bars, old linen pulled back on the nearest bar so dull yellow metal shows, cream specular only on the metal. Other closed crates fade into black behind. No hands, no letter, no text, no coins, no modern objects. The gold is the only bright thing.

### g01-ridge.webp

- 用途：S09 離開博物館後的遠景。沒有鬼、沒有反派、沒有恐怖音效能對上的紅光。
- Subject: Overcast dusk above the Jinguashi ridges in Taiwan. Fog is the subject. Layered dark mountains, wet tree tops moving in wind across the lower third, a small distant museum roof in the valley, no people. Keep red only as a faint rim on the farthest ridge, not a blood moon and not a horror glow. No text, no ruins on fire, no supernatural figure.

## 人物

林館長是虛構人物，不得像任何真人、公眾人物或現任館長。不要眼鏡，以免跟因杜阿森的圓框眼鏡重複。

### npc-lin.webp

- 類別：`portrait`
- 尺寸：850×1300，透明
- 用途：S02、S09 對話立繪，取景比照 `npc-induasen.webp`（全身、看得到鞋與頭頂）。
- Subject: An entirely fictional woman in her early fifties, invented face, not a likeness of any real person. Taiwanese museum curator. Silver-streaked black hair in a low bun, a small mole beside the left eyebrow, warm brown eyes, no glasses, no beard. Charcoal wool overcoat open over a cream high-collar blouse, dark trousers, plain black shoes, a thin brass key on a cord, a leather folio of papers under one arm. Calm, not smiling wide. Same full-body framing as the game's other portraits.

### npc-lin-av.webp

- 類別：`avatar`
- 尺寸：256×256，透明
- 用途：通關後調查檔案的人物關係頭像，圓形裁切。
- Subject: The same fictional curator as npc-lin: early fifties, low bun with a silver streak, mole beside the left eyebrow, warm brown eyes, no glasses. Head and shoulders, face large and centered. Not a real person.

## 道具

類別都是 `item`，400×400，透明。畫面不要手、不要桌子、不要可讀的句子。

### it-grip.webp

- 用途：背包裡的扳桿手柄。坑口那支是 `g01-grip.webp`。
- Subject: One short aged-brass lever handle, diagonal, thin, with a square notch at the lower end. Worn smooth at the grip. About 80 percent of the square.

### it-handle.webp

- 用途：背包裡的升降控制手柄，也疊在 S07 工具架與控制盤插座上（`object-fit: contain`，盒子是正方形）。
- Subject: One T-shaped control handle of darkened brass, the crossbar at the top, a short shaft, the base a square peg. Fills about 85 percent of the square. No panel behind it.

### it-journal.webp

- 用途：檔案裡《A. WILLIAMS 工作日誌》的小圖。
- Subject: One small clothbound notebook, olive drab worn to brown, a cotton tie, cream page edges. No readable writing, no letters on the cover.

### it-ledger.webp

- 用途：離站簿與到站簿在檔案列表的小圖。桌上的實體簿是 `g01-ledger.webp`。
- Subject: One thicker cloth ledger, dark red-brown, a cracked spine, no title, no numbers.

### it-photo.webp

- 用途：收藏「戰俘四人合照」，也以 `object-fit: cover` 貼在 S04 桌角與 S06 門邊（舞台盒子 110×84）。
- Subject: One aged horizontal black-and-white photograph of four fictional men standing together: three gaunt European prisoners in torn work clothes and one Taiwanese miner in a helmet. Painterly faces, not photographs of real people, no names, no caption. The print touches the left and right edges of the square and occupies only the central 76 percent of the height; the bands above and below are fully transparent.

### it-letter.webp

- 用途：收藏「亞瑟的最後一封信」影像檔。原信不帶走。
- Subject: One folded cream letter, closed, a darkened wax seal, no readable writing.

### it-survey.webp

- 用途：檔案裡的「本山礦區調查資料」。
- Subject: One worn manila folder, a corner of a hand-drawn mine map peeking out, no readable words or numbers.

### it-manual.webp

- 用途：檔案裡的升降維修手冊。
- Subject: One thin grey technical booklet, cloth cover, no readable title.

## 精靈

類別都是 `sprite`。長短邊比都不超過 3:1。舞台盒子跟圖的比例相同，遊戲用 `object-fit: fill`，所以主體要碰到 prompt 點名的邊。

### g01-cart.webp

- 尺寸：400×300，透明剪影
- 舞台：S03 左 430 上 360 寬 300 高 225；S06 側線左 130 上 430 寬 260 高 195。同一張圖。
- Subject: Side view of one rusted 1940s mine cart, three-quarter enough to read as a cart. Wheels touch the bottom edge, the body touches the left and right edges. Transparent gaps above the wheels and above the rim. No track, no chock, no background.

### g01-chock.webp

- 尺寸：144×96，透明
- 舞台：左 656 上 552 寬 72 高 48，壓在礦車右輪下。拿走後透明。
- Subject: One wooden wheel chock, a low wedge, touching the left, right, and bottom edges. Transparent above the slope. Wet, splintered.

### g01-crowbar.webp

- 尺寸：160×480，透明
- 舞台：左 176 上 390 寬 80 高 240，靠在左側坑木上。
- Subject: One iron crowbar standing nearly vertical, the hooked end at the top edge and the flat chisel end at the bottom edge, the bar touching the top and bottom. Thin. Transparent on both sides. Not the same pose as the inventory icon.

### g01-grip.webp

- 尺寸：168×120，透明
- 舞台：破木箱裡左 968 上 488 寬 70 高 50；裝上轉轍器後左 250 上 448 寬 84 高 60，遊戲再轉 -42 度。
- Subject: One short brass lever handle lying horizontal, a round grip at the right edge and a notched tang at the left edge, touching the left and right edges. Transparent above and below the shaft.

### g01-s04-locker.webp

- 尺寸：160×480，full-bleed，可以不透明
- 舞台：左 886 上 280 寬 80 高 240，蓋住 03 號櫃的門洞。撬開後隱藏。
- Subject: Full-bleed iron locker door, rivets, a blank brass plate in the upper third with no digits, a rusted latch on the right edge. The metal touches all four edges. No number, no text.

### g01-ledger.webp

- 尺寸：192×128，透明
- 舞台：兩本，左 80 與左 184，都是上 372 寬 96 高 64。
- Subject: One closed cloth ledger seen from a high three-quarter angle, as if lying on a desk. The book touches the left, right, and bottom edges. No title, no pages open.

### g01-switch.webp

- 尺寸：192×128，透明
- 舞台：左 490 上 512 寬 96 高 64，一開始透明，碎石清掉後出現。
- Subject: One small rusted railway switch stand seen from above, a short lever lying flat, touching the canvas edges of its footprint. No gravel.

### g01-gravel.webp

- 尺寸：360×120，透明
- 舞台：左 450 上 524 寬 180 高 60，蓋住轉轍器。
- Subject: A low pile of wet mine gravel and a few stones, full width, touching the left and right edges, transparent holes between stones so rails could show through. No switch.

### g01-s06-door.webp

- 尺寸：420×540，full-bleed，可以不透明
- 舞台：左 430 上 180 寬 280 高 360。打開後隱藏。
- Subject: Full-bleed riveted iron door, heavily rusted, touching all four edges. A blank socket for a latch on the right edge, about 80 percent across and 41 percent down. No chain, no text, no window.

### g01-latch.webp

- 尺寸：128×96，透明
- 舞台：左 656 上 328 寬 64 高 48，在門的右側。
- Subject: One broken rusted latch hasp, horizontal, touching left and right edges. Transparent around the metal.

### g01-s07-panel.webp

- 尺寸：320×400，full-bleed，可以不透明
- 舞台：左 186 上 326 寬 160 高 200。手柄裝上後疊在正中心。
- Subject: Full-bleed iron lift control panel, three dark buttons and a gauge, touching all four edges. In the exact center, an empty round socket about 30 percent of the panel width, dark inside, no handle. No text, no numbers.

### g01-s08-door.webp

- 尺寸：560×560，full-bleed，可以不透明
- 舞台：左 340 上 180 寬 440 高 440。
- Subject: Full-bleed heavy vault door of dark iron plate, rivets along the rim, touching all four edges. Upper area has a blank carved cartouche with no letters. No chain, no keypad, no gold. A small blank brass plate shape may sit low and to the right, with no characters.

### g01-chain.webp

- 尺寸：480×160，透明
- 舞台：左 350 上 400 寬 420 高 140，橫過鐵門中段。
- Subject: One heavy rusted chain running horizontally, links touching the left and right edges, sagging slightly, transparent above and below the links. No padlock.

### g01-keypad.webp

- 尺寸：224×160，透明
- 舞台：左 490 上 300 寬 140 高 100，在門的上半部。四位數字是遊戲介面，不要畫數字。
- Subject: One mechanical four-wheel combination lock, dark steel housing, four blank cream wheels with no digits. The housing touches the left and right edges. No door behind it.

### g01-plate.webp

- 尺寸：240×120，透明
- 舞台：左 620 上 500 寬 120 高 60，在門的右下。
- Subject: One small brass plate, the only text is the four characters "MMDD" centered, engraved, nothing else. The plate touches the left and right edges.

### g01-crates.webp

- 尺寸：560×280，透明
- 舞台：左 380 上 400 寬 400 高 200，在門後面，開門後才顯現。箱蓋是關著的。
- Subject: A row of closed wooden crates seen from the front, rope and iron corners, touching the left, right, and bottom edges. Lids shut. No gold showing. Transparent above the crates.
