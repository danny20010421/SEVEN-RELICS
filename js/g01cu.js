// G01 的正面近景。正式圖（g01-cu-*.webp）還沒到時，用既有精靈與同色系的檢視畫面。
// 座標是 1280×720。hit.into 會再推進一層；沒有 into 的熱點把 id 交回關卡邏輯。

const hit = (id, x, y, w, h, label, into = '', btn = false, hot = false) => ({ id, x, y, w, h, label, into, btn, hot });
const pip = (x, y, on) => `<i class="cu-pip${on ? ' on' : ''}" style="left:${x}px;top:${y}px"></i>`;

const LEDGER = [['02/15', 12, 12], ['02/16', 15, 15], ['02/17', 12, 9], ['02/18', 10, 10]];
function ledgerTable(which) {
  const col = which === 'depart' ? 1 : 2;
  const head = which === 'depart' ? '離站（車）' : '到站（車）';
  const rows = LEDGER.map(r => `<tr${r[0] === '02/17' ? ' class="cu-hot"' : ''}><td>${r[0]}</td><td>${r[col]}</td></tr>`).join('');
  return `<table class="cu-tab"><tr><th>日期</th><th>${head}</th></tr>${rows}</table><p class="cu-copy">二月十七日那一列，和別的日子不一樣。</p>`;
}

const ROUTES = {
  A: ['A　正常出坑路線', '通往出坑口。入口掛著到站紀錄板，每一車都會登記。'],
  B: ['B　工具維修倉庫', '倉庫門上釘著編號牌，裡面的工具一件件都編了號。'],
  C: ['C　舊式升降井', '一條長滿鏽的側線，盡頭是早已停用的升降井。牆上沒有任何紀錄板。'],
};

function tunnel(letter) {
  const [title, desc] = ROUTES[letter];
  return {
    title, file: 'g01-cu-tunnel.webp', atmos: 'g01-s06.webp', prop: 'tunnel', plate: letter,
    text: `<p class="cu-route">${desc}</p>`,
    hits: [hit(letter, 400, 520, 480, 64, '走這條路', '', true)],
  };
}

function locker(n, s) {
  const open = s.opened && s.opened.has(String(n));
  const ajar = n === 3 && open;
  const journal = ajar && s.got && !s.got.has('journal');
  const clothes = n !== 3 && open;
  const sprites = [];
  const hits = [];
  if (!open) hits.push(hit('lk' + n, 1064, 318, 168, 156, '門扣'));
  else if (journal) {
    sprites.push({ src: 'g01-sp-cu-journal.webp', fb: 'it-journal.webp', x: 740, y: 390, w: 250, h: 170 });
    hits.push(hit('journalRead', 740, 390, 250, 170, '工作日誌', 'journal'));
  } else if (clothes) {
    sprites.push({ src: 'g01-sp-cu-clothes.webp', x: 500, y: 340, w: 340, h: 220, fallback: 'cloth' });
    hits.push(hit('lk' + n, 500, 340, 340, 220, '工作服'));
  }
  return {
    title: `0${n} 號鐵櫃`,
    file: ajar ? 'g01-cu-locker-ajar.webp' : open ? 'g01-cu-locker-open.webp' : 'g01-cu-locker-closed.webp',
    atmos: 'g01-s04.webp',
    plate: open ? '' : '0' + n,
    plateClass: 'on-face',
    // 號碼在門的外側面上，跟著門繞左側鉸鏈往外轉。半開停住；全開轉完再讓正式圖接手。
    hinge: open ? { angle: ajar ? -64 : -108, plate: '0' + n, hold: !!ajar } : null,
    sprites, hits,
    note: open ? (journal ? '門往左外側打開。點架子上的日誌。' : '門沿著左側鉸鏈往外打開了。') : '鉸鏈在左，門扣在右。先對鐵撬棒按「使用」，再點門扣。',
  };
}

function vaultDoor(s = {}) {
  const open = !!s.vaultOpen;
  // 寬景與近景用同一扇門。鉸鏈在畫面左側，往裡（離開鏡頭）轉。
  return {
    title: '金庫鐵門',
    atmos: 'g01-s08.webp',
    subject: {
      src: 'g01-s08-door.webp', w: 640, h: 640,
      extra: open ? 'transform-origin:0% 50%;transform:perspective(1100px) rotateY(58deg);' : '',
    },
    sprites: open ? [] : [
      { src: 'g01-keypad.webp', x: 500, y: 210, w: 210, h: 150 },
      { src: 'g01-plate.webp', x: 610, y: 480, w: 180, h: 90 },
    ],
    text: '<p class="cu-inscribe">不為帝國，不為戰爭，只為那些未能歸來的人。</p><p class="cu-frame-txt">當你忘記所有歸途，請記住我來到這世上的日子。</p>',
    hits: open ? [] : [
      hit('words', 420, 70, 440, 90, '門上刻字'),
      hit('frame', 330, 140, 90, 480, '左門框'),
      hit('lock', 490, 200, 230, 170, '機械鎖'),
      hit('plate', 590, 460, 220, 120, '密碼牌'),
    ],
    note: open ? '門繞左側鉸鏈往裡打開了。' : '鉸鏈在左。刻字、門框和密碼牌都在這扇門上。',
  };
}

function vaultCrate(s) {
  const read = s.got && s.got.has('letter');
  if (!s.crateOpen) {
    return {
      title: '釘死的木箱',
      file: 'g01-cu-crate-shut.webp',
      atmos: 'g01-s08.webp',
      prop: 'crate',
      hits: [hit('crate', 340, 150, 600, 420, '箱蓋')],
      note: '箱蓋釘死了。使用鐵撬棒，再點箱蓋。',
    };
  }
  return {
    title: '木箱裡的黃金',
    file: 'g01-s08-gold.webp',
    atmos: 'g01-s08.webp',
    sprites: read ? [] : [{ src: 'g01-sp-cu-letter.webp', fb: 'it-letter.webp', x: 760, y: 400, w: 220, h: 140 }],
    hits: [
      ...(read ? [] : [hit('letterRead', 760, 400, 220, 140, '信', 'letter')]),
      hit('shut', 460, 560, 320, 64, '關上木箱', '', true),
    ],
    note: read ? '信已經收進檔案。黃金留在原地。' : '金條中間夾著一封信。',
  };
}

const VIEWS = {
  photo: (s) => ({
    title: '金瓜石舊照片', file: 'g01-cu-study-photo.webp', atmos: 'g01-study.webp',
    text: `<button type="button" class="cu-photo-cap${s.got && s.got.has('photo') ? ' on' : ''}" data-cu="hs" data-hs="photo">本山六坑</button>`,
    note: '坑口在山坡下，後面是層層礦場。點角落的鉛筆字。',
  }),
  invite: (s) => ({
    title: '館長邀請函', file: 'g01-cu-paper.webp', atmos: 'g01-study.webp',
    text: `<div class="cu-letter"><h2>館長邀請函</h2>
<p>因杜阿森教授台鑒：</p>
<p>本館近日整理戰時礦場檔案，發現數筆運輸紀錄前後不符，另有一份<button type="button" class="cu-phrase${s.got && s.got.has('invite') ? ' on' : ''}" data-cu="hs" data-hs="invite">未列入正式目錄的舊礦圖</button>。懇請教授推薦合適人選，協助釐清疑點。調查許可與安全協助，將由本館安排。</p>
<p class="sig">黃金博物館　林○中 敬上</p></div>`,
    note: '信紙就是這一頁。點那句畫了重點的話。',
  }),
  report: (s) => ({
    title: '礦山報告摘要', file: 'g01-cu-paper.webp', atmos: 'g01-study.webp',
    text: `<div class="cu-letter"><h2>本山礦區運輸摘要</h2>
<p>1945 年 2 月。本月運輸作業大致正常，惟部分日期之離站、到站數量，待覆核。</p>
<p><button type="button" class="cu-phrase${s.got && s.got.has('report') ? ' on' : ''}" data-cu="hs" data-hs="report">1945-02-17　運量對不上</button></p></div>`,
    note: '點紅字那一行。',
  }),
  wheel: (s) => ({
    title: '車輪與止輪器', file: 'g01-cu-wheel.webp', atmos: 'g01-s03.webp', prop: 'wheel',
    sprites: s.chock ? [{ src: 'g01-chock.webp', x: 540, y: 575, w: 200, h: 70 }] : [],
    hits: [hit('wheel', 520, 555, 240, 100, '止輪器')],
    note: s.chock ? '使用鐵撬棒，再點這塊止輪器。' : '止輪器已經拿掉，輪子可以沿著鐵軌滾了。',
  }),
  crate: (s) => (s.place === 's08b' ? vaultCrate(s) : null),
  switch: (s) => ({
    title: '轉轍器', atmos: 'g01-s03.webp',
    // 近景就是寬景那根立管。方孔圓靶是另一台機器，不拿來當這個插座。
    crop: { src: 'g01-s03.webp', x: 200, y: 400, w: 220, h: 220 },
    sprites: s.gripOn ? [{
      src: 'g01-grip.webp', fb: 'it-grip.webp', x: 512, y: 228, w: 150, h: 36,
      extra: `transform-origin:6% 50%;transform:rotate(${s.thrown ? 72 : -16}deg);transition:transform .4s ease;filter:drop-shadow(4px 8px 2px rgba(0,0,0,.85))`,
    }] : [],
    hits: [hit('switch', 470, 180, 180, 160, s.gripOn ? '扳桿' : '管口')],
    note: s.gripOn
      ? (s.thrown ? '扳桿繞管口轉下去了。' : (s.chock ? '手柄插進管口了。車輪還被止輪器卡住。' : '拉這支扳桿。它只繞管口轉。'))
      : '管口是空的。把扳桿手柄的方榫插進去。',
  }),
  note: (s) => ({
    title: '紙條', file: 'g01-cu-paper.webp', atmos: 'g01-s04.webp',
    text: `<div class="cu-letter"><p class="hand">「我們只在所有人都睡著後，才能記下真正的數字。」</p>
<p><button type="button" class="cu-phrase${s.got && s.got.has('note') ? ' on' : ''}" data-cu="hs" data-hs="note">收進檔案</button></p></div>`,
    note: '所有人都睡著的時段，對得上班次表。',
  }),
  schedule: (s) => ({
    title: '班次表', file: 'g01-cu-paper.webp', atmos: 'g01-s04.webp',
    text: `<div class="cu-letter"><h2>班次表</h2>
<table class="cu-tab" style="position:relative;left:0;top:0"><tr><th>班次</th><th>時間</th><th>編號</th></tr>
<tr><td>早班</td><td>06–14</td><td>01</td></tr><tr><td>午班</td><td>14–22</td><td>02</td></tr><tr class="cu-hot"><td>夜班</td><td>22–06</td><td>03</td></tr></table>
<p><button type="button" class="cu-phrase${s.got && s.got.has('schedule') ? ' on' : ''}" data-cu="hs" data-hs="schedule">收進檔案</button></p></div>`,
    note: '鐵櫃照班次編號。',
  }),
  photoA: (s) => ({
    title: '四人合照', file: 'g01-cu-photo-men.webp', atmos: 'g01-s04.webp',
    subject: { src: 'it-photo.webp', w: 680, h: 460 },
    text: `<p class="cu-names">Arthur　　Edward　　Thomas　　林清和</p><button type="button" class="cu-photo-cap${s.got && s.got.has('photoA') ? ' on' : ''}" data-cu="hs" data-hs="photoA">收進收藏</button>`,
  }),
  lk1: (s) => locker(1, s),
  lk2: (s) => locker(2, s),
  lk3: (s) => locker(3, s),
  journal: (s) => ({
    title: '工作日誌', file: 'g01-cu-paper.webp', atmos: 'g01-s04.webp',
    text: `<div class="cu-letter cu-scroll"><h2>A. WILLIAMS</h2>
<p><b>1944-12-12　無法回家的生日</b><br>今天是我的生日。十二月十二日。以前每年的這一天，母親都會準備一頓豐盛的晚餐。今年我只能在冰冷的礦坑裡度過。</p>
<p><b>1945-02-15　不屬於我們的財富</b><br>特殊封裝的金屬貨物比礦石重得多。士兵不准查看，也沒列入一般清單。我懷疑那是已經提煉的黃金。</p>
<p><b>1945-02-17　三車貨物</b><br>三車貨物不會抵達原本的終點。如果有人發現這本日誌，請記住今天的日期。數字會告訴你它們去了哪裡。</p>
<p><b>1945-02-21　另一條路</b><br>林先生知道一條舊升降路線，通往上方坑道，不在平常的運輸清單裡。</p>
<p><b>1945-02-28　約定</b><br>最後一批貨物已經安置。只要有人記得那一天，就能打開最後一道門。</p>
<p><button type="button" class="cu-phrase${s.got && s.got.has('journal') ? ' on' : ''}" data-cu="hs" data-hs="journalRead">收進檔案</button></p></div>`,
    note: '五頁都在這一本。先記住日期。',
  }),
  depart: (s) => ({
    title: '離站簿', file: 'g01-cu-paper.webp', atmos: 'g01-s05.webp',
    text: ledgerTable('depart') + `<button type="button" class="cu-act area" data-cu="hs" data-hs="depart" style="left:820px;top:520px;width:280px;height:64px">收進檔案</button>`,
  }),
  arrive: (s) => ({
    title: '到站簿', file: 'g01-cu-paper.webp', atmos: 'g01-s05.webp',
    text: ledgerTable('arrive') + `<button type="button" class="cu-act area" data-cu="hs" data-hs="arrive" style="left:820px;top:520px;width:280px;height:64px">收進檔案</button>`,
  }),
  board5: (s) => ({
    title: '運量登記板', file: 'g01-cu-board5.webp', atmos: 'g01-s05.webp',
    text: s.solved3 ? '<div class="cu-chalk-num">3</div>' : '',
    hits: s.solved3 ? [] : [hit('board5', 420, 200, 440, 280, '輸入消失的車數')],
    note: s.solved3 ? '已經登記：少了 3 車。' : '比對兩本簿子之後，在凹槽裡輸入少掉的車數。',
  }),
  gravel: (s) => ({
    title: s.switchPeek ? '露出的轉轍手柄' : '鐵軌上的碎石',
    file: s.switchPeek ? 'g01-cu-oldswitch.webp' : 'g01-cu-gravel.webp',
    atmos: 'g01-s05.webp',
    sprites: s.switchPeek ? [{ src: 'g01-grip.webp', fb: 'it-grip.webp', x: 530, y: 300, w: 220, h: 80, extra: 'filter:drop-shadow(0 0 12px rgba(229,38,58,.9))' }] : [],
    hits: s.switchPeek
      ? [hit('swHandle', 500, 270, 280, 150, '撬開手柄', '', false, true)]
      : [hit('gravel', 460, 220, 360, 280, '撥開碎石')],
    note: s.switchPeek ? '手柄露出一截。用鐵撬棒撬它。' : (s.solved3 ? '碎石可以撥開。' : '先把消失的車數登記上去。'),
  }),
  A: () => tunnel('A'),
  B: () => tunnel('B'),
  C: () => tunnel('C'),
  wall: () => ({
    title: '牆上的刻字', file: 'g01-cu-plaque.webp', atmos: 'g01-s06.webp', prop: 'plaque',
    text: '<p class="cu-inscribe">凡出坑者，皆有紀錄。<br>凡入庫者，皆有編號。<br>唯不升不出者，不留其名。</p>',
    hits: [hit('wall', 480, 560, 320, 56, '記下', '', true)],
  }),
  latch: (s) => ({
    title: '門扣', atmos: 'g01-s06b.webp',
    subject: {
      src: 'g01-s06-door.webp', w: 520, h: 680,
      extra: s.doorOpen ? 'transform-origin:0% 50%;transform:perspective(900px) rotateY(52deg);' : '',
    },
    sprites: s.doorOpen ? [] : [{ src: 'g01-latch.webp', x: 770, y: 290, w: 150, h: 110 }],
    hits: s.doorOpen ? [hit('door', 480, 180, 360, 320, '進入通道')] : [hit('latch', 750, 270, 190, 150, '撬門扣')],
    note: s.doorOpen ? '門扣已經撬斷，門繞左側鉸鏈往裡打開。' : '這是門右側的門扣。使用鐵撬棒再點它。',
  }),
  door: (s) => ({
    title: '鐵門', atmos: 'g01-s06b.webp',
    subject: {
      src: 'g01-s06-door.webp', w: 520, h: 680,
      extra: s.doorOpen ? 'transform-origin:0% 50%;transform:perspective(900px) rotateY(52deg);' : '',
    },
    sprites: s.doorOpen ? [] : [{ src: 'g01-latch.webp', x: 770, y: 290, w: 150, h: 110 }],
    hits: s.doorOpen
      ? [hit('door', 480, 160, 400, 400, '進入通道')]
      : [hit('latch', 750, 270, 190, 150, '門扣', 'latch')],
    note: s.doorOpen ? '門繞左側鉸鏈往裡打開了。' : '鉸鏈在左，門扣在右。',
  }),
  photo2: (s) => ({
    title: '照片背面', file: 'g01-cu-photo-back.webp', atmos: 'g01-s06b.webp',
    text: `<p class="cu-ink">黃金已經藏好了。<br>我希望我們四個人，都能活著回到這裡。</p>
<button type="button" class="cu-photo-cap${s.got && s.got.has('photoB') ? ' on' : ''}" data-cu="hs" data-hs="photo2">收進檔案</button>`,
    note: '背面的字才是線索。',
  }),
  manual: (s) => ({
    title: '維修手冊', file: 'g01-cu-paper.webp', atmos: 'g01-s07.webp',
    text: `<div class="cu-letter"><h2>升降設備啟動程序</h2>
<p>一、解除制動。</p><p>二、接通電源。</p><p>三、選擇上升。</p>
<p>順序錯誤時，控制盤會自動復位。</p>
<p><button type="button" class="cu-phrase${s.got && s.got.has('manual') ? ' on' : ''}" data-cu="hs" data-hs="manual">解除制動 → 接通電源 → 上升</button></p></div>`,
    note: '三個步驟，對得上控制盤的三顆按鈕。',
  }),
  panel: (s) => {
    const seq = s.panelSeq || [];
    const on = id => seq.includes(id);
    // 寬景那塊錶盤：中間一個圓孔，下面三顆按鈕。四支扳桿的圖是另一塊盤。
    return {
      title: '控制盤', atmos: 'g01-s07.webp',
      subject: { src: 'g01-s07-panel.webp', w: 480, h: 620 },
      sprites: s.ctlOn ? [{ src: 'it-handle.webp', x: 590, y: 283, w: 100, h: 100 }] : [],
      hits: s.ctlOn ? [
        hit('lev-brake', 500, 450, 120, 100, '解除制動'),
        hit('lev-power', 680, 450, 120, 100, '接通電源'),
        hit('lev-up', 580, 540, 140, 100, '上升'),
      ] : [hit('panel', 560, 280, 160, 150, '裝上控制手柄')],
      note: s.ctlOn ? '手柄在中間的圓孔裡。三顆按鈕：左解除制動、右接通電源、下上升。' : '中間的圓孔是空的。把控制手柄裝進去。',
      text: s.ctlOn ? `${pip(554, 440, on('brake'))}${pip(726, 440, on('power'))}${pip(640, 545, on('up'))}` : '',
    };
  },
  words: (s) => vaultDoor(s),
  frame: (s) => vaultDoor(s),
  frame2: (s) => vaultDoor(s),
  lock: (s) => vaultDoor(s),
  plate: (s) => vaultDoor(s),
  letter: (s) => ({
    title: '亞瑟的信', file: 'g01-cu-paper.webp', atmos: 'g01-s08.webp',
    text: `<div class="cu-letter cu-scroll"><h2>1945 年 3 月</h2>
<p class="hand">如果你正在讀這封信，代表我們成功了。我們不知道自己還能活多久。每天都有同伴倒下，而那些人只在乎明天還能挖出多少礦石。</p>
<p class="hand">這些黃金足以讓我們任何一個人過上富裕的生活。但沒有人打算獨自帶走它們。我們決定將黃金藏在這裡，直到這場戰爭結束。</p>
<p class="hand">黃金屬於活著的人。但請別忘了那些死去的人。如果有一天這些黃金再次被人發現，我只希望它們不會成為下一場貪婪的開始。</p>
<p class="sig hand">—— Arthur Williams</p>
<p><button type="button" class="cu-phrase${s.got && s.got.has('letter') ? ' on' : ''}" data-cu="hs" data-hs="letterRead">把影像收進檔案</button></p></div>`,
    note: '原信留在箱子裡。',
  }),
};

export function view(id, state) {
  const make = VIEWS[id];
  if (!make) return null;
  const spec = make(state || {});
  if (!spec) return null;
  spec.id = id;
  return spec;
}
