// G01 的正面近景。正式圖（g01-cu-*.webp）還沒到時，用既有精靈與同色系的檢視畫面。
// 座標是 1280×720。hit.into 會再推進一層；沒有 into 的熱點把 id 交回關卡邏輯。

const hit = (id, x, y, w, h, label, into = '', btn = false) => ({ id, x, y, w, h, label, into, btn });

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
  const journal = n === 3 && open && s.got && !s.got.has('journal');
  const clothes = n !== 3 && open;
  const sprites = [];
  const hits = [];
  if (!open) hits.push(hit('lk' + n, 760, 140, 240, 460, '門扣'));
  else if (journal) {
    sprites.push({ src: 'g01-sp-cu-journal.webp', fb: 'it-journal.webp', x: 490, y: 250, w: 280, h: 200 });
    hits.push(hit('journalRead', 490, 250, 280, 200, '工作日誌', 'journal'));
  } else if (clothes) {
    sprites.push({ src: 'g01-sp-cu-clothes.webp', x: 450, y: 240, w: 360, h: 240, fallback: 'cloth' });
    hits.push(hit('lk' + n, 450, 240, 360, 240, '工作服'));
  }
  return {
    title: `0${n} 號鐵櫃`,
    file: open ? 'g01-cu-locker-open.webp' : 'g01-cu-locker-closed.webp',
    atmos: 'g01-s04.webp',
    subject: open ? null : { src: 'g01-s04-locker.webp', w: 320, h: 600 },
    prop: open ? 'interior' : '',
    plate: '0' + n,
    sprites, hits,
    note: open ? (journal ? '點日誌，翻開來看。' : '') : '門扣鏽死了。先在道具欄對鐵撬棒按「使用」，再點門扣。',
  };
}

function vaultDoor() {
  return {
    title: '金庫鐵門',
    file: 'g01-cu-vault.webp',
    atmos: 'g01-s08.webp',
    subject: { src: 'g01-s08-door.webp', w: 680, h: 580 },
    text: '<p class="cu-inscribe">不為帝國，不為戰爭，只為那些未能歸來的人。</p><p class="cu-frame-txt">當你忘記所有歸途，請記住我來到這世上的日子。</p>',
    sprites: [
      { src: 'g01-keypad.webp', x: 540, y: 250, w: 200, h: 130 },
      { src: 'g01-plate.webp', x: 600, y: 450, w: 180, h: 90 },
    ],
    hits: [
      hit('words', 340, 70, 600, 64, '門上刻字'),
      hit('frame', 160, 150, 180, 420, '左門框'),
      hit('frame', 940, 150, 180, 420, '右門框'),
      hit('lock', 520, 230, 240, 170, '機械鎖', 'dial'),
      hit('plate', 580, 430, 220, 120, '密碼牌', 'mmdd'),
    ],
  };
}

function entranceCrate(s) {
  return {
    title: '破木箱',
    file: 'g01-cu-crate.webp',
    atmos: 'g01-s03.webp',
    prop: 'crate',
    sprites: s.hasGrip ? [] : [{ src: 'g01-grip.webp', fb: 'it-grip.webp', x: 540, y: 280, w: 180, h: 120 }],
    hits: [hit('crate', 420, 180, 440, 360, s.hasGrip ? '空箱子' : '箱子裡的手柄')],
    note: s.hasGrip ? '箱子裡已經空了。' : '裡面有一支金屬手柄。',
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
  photo: () => ({
    title: '金瓜石舊照片', file: 'g01-cu-study-photo.webp', atmos: 'g01-study.webp', prop: 'frame',
    crop: { src: 'g01-study.webp', x: 600, y: 60, w: 220, h: 260 },
    hits: [hit('photo', 330, 70, 620, 520, '照片')],
  }),
  invite: () => ({
    title: '館長邀請函', file: 'g01-cu-envelope.webp', atmos: 'g01-study.webp', prop: 'envelope',
    hits: [hit('invite', 340, 160, 600, 360, '拆開信封')],
  }),
  report: () => ({
    title: '礦山報告摘要', file: 'g01-cu-report.webp', atmos: 'g01-study.webp', prop: 'report',
    hits: [hit('report', 280, 120, 720, 440, '翻開報告')],
  }),
  cart: (s) => ({
    title: '礦車', file: 'g01-cu-cart.webp', atmos: 'g01-s03.webp',
    subject: { src: 'g01-cart.webp', w: 700, h: 500 },
    hits: [hit('cart', 280, 100, 720, 500, '推動礦車')],
    note: s.chock ? '車輪還被止輪器卡住，正面推不動。' : '止輪器拿掉了。得讓它沿著鐵軌自己滑。',
  }),
  wheel: (s) => ({
    title: '車輪與止輪器', file: 'g01-cu-wheel.webp', atmos: 'g01-s03.webp', prop: 'wheel',
    sprites: s.chock ? [{ src: 'g01-chock.webp', x: 500, y: 400, w: 240, h: 140 }] : [],
    hits: [hit('wheel', 360, 180, 560, 400, '止輪器')],
    note: s.chock ? '使用鐵撬棒，再點這塊止輪器。' : '止輪器已經拿掉，輪子可以沿著鐵軌滾了。',
  }),
  bar: (s) => ({
    title: '鐵撬棒', file: 'g01-cu-crowbar.webp', atmos: 'g01-s03.webp',
    subject: s.hasBar ? null : { src: 'g01-crowbar.webp', w: 180, h: 540 },
    prop: s.hasBar ? 'empty' : '',
    text: s.hasBar ? '<p class="cu-copy">撬棒已經收進道具欄。</p>' : '',
    hits: s.hasBar ? [] : [hit('bar', 500, 60, 280, 580, '撿起鐵撬棒')],
  }),
  crate: (s) => (s.place === 's08b' ? vaultCrate(s) : entranceCrate(s)),
  switch: (s) => ({
    title: '轉轍器', file: 'g01-cu-switch.webp', atmos: 'g01-s03.webp',
    subject: { src: 'g01-switch.webp', w: 520, h: 340 },
    sprites: s.gripOn ? [{ src: 'g01-grip.webp', fb: 'it-grip.webp', x: 560, y: 200, w: 200, h: 130 }] : [],
    hits: [hit('switch', 400, 160, 480, 400, s.gripOn ? '扳桿' : '空的插座')],
    note: s.gripOn ? (s.chock ? '扳桿能動，但車輪還被止輪器卡住。' : '拉下扳桿。礦車會順著坡度，沿左岔的鐵軌滑到棚邊停下。') : '插座是空的。把扳桿手柄裝上去。',
  }),
  board: () => ({
    title: '黑板', file: 'g01-cu-board.webp', atmos: 'g01-s04.webp', prop: 'board',
    text: '<p class="cu-chalk">安全第一</p>',
    sprites: [{ src: 'it-photo.webp', x: 168, y: 148, w: 250, h: 180 }],
    hits: [
      hit('board', 120, 70, 1040, 520, '黑板'),
      hit('photoA', 168, 148, 250, 180, '釘在黑板上的照片', 'photoA'),
    ],
  }),
  note: () => ({
    title: '紙條', file: 'g01-cu-scrap.webp', atmos: 'g01-s04.webp', prop: 'scrap',
    hits: [hit('note', 360, 180, 560, 320, '翻開紙條')],
  }),
  lamp: () => ({
    title: '舊礦燈', file: 'g01-cu-lamp.webp', atmos: 'g01-s04.webp', prop: 'lamp',
    hits: [hit('lamp', 460, 60, 360, 560, '看看礦燈')],
  }),
  schedule: () => ({
    title: '班次表', file: 'g01-cu-sheet.webp', atmos: 'g01-s04.webp', prop: 'sheet',
    hits: [hit('schedule', 300, 120, 680, 440, '攤開班次表')],
  }),
  helmet: () => ({
    title: '礦工帽', file: 'g01-cu-helmet.webp', atmos: 'g01-s04.webp', prop: 'helmet',
    hits: [hit('helmet', 400, 120, 480, 440, '看看礦工帽')],
  }),
  soaked: () => ({
    title: '泡水的紀錄', file: 'g01-cu-soaked.webp', atmos: 'g01-s04.webp', prop: 'soaked',
    hits: [hit('soaked', 340, 160, 600, 380, '翻動書頁')],
  }),
  photoA: () => ({
    title: '四人合照', file: 'g01-cu-photo-men.webp', atmos: 'g01-s04.webp',
    subject: { src: 'it-photo.webp', w: 680, h: 460 },
    text: '<p class="cu-names">Arthur　　Edward　　Thomas　　林清和</p>',
    hits: [hit('photoA', 300, 80, 680, 500, '看合照')],
  }),
  books: () => ({
    title: '書櫃', file: 'g01-cu-shelf.webp', atmos: 'g01-s04.webp', prop: 'shelf',
    hits: [
      hit('books', 220, 120, 240, 420, '左邊的紀錄'),
      hit('books', 500, 140, 260, 400, '中間的紀錄'),
      hit('books', 800, 160, 240, 380, '右邊的紀錄'),
    ],
    note: '每一本都可以翻。紙頁都黏在一起。',
  }),
  lk1: (s) => locker(1, s),
  lk2: (s) => locker(2, s),
  lk3: (s) => locker(3, s),
  journal: () => ({
    title: '工作日誌', file: 'g01-cu-journal.webp', atmos: 'g01-s04.webp',
    subject: { src: 'it-journal.webp', w: 460, h: 460 },
    text: '<p class="cu-name">A. WILLIAMS</p>',
    hits: [hit('journalRead', 400, 120, 480, 460, '翻開日誌')],
  }),
  depart: () => ({
    title: '離站簿', file: 'g01-cu-ledger.webp', atmos: 'g01-s05.webp', prop: 'book',
    text: ledgerTable('depart'),
    hits: [hit('depart', 860, 500, 280, 64, '收進檔案', '', true)],
  }),
  arrive: () => ({
    title: '到站簿', file: 'g01-cu-ledger.webp', atmos: 'g01-s05.webp', prop: 'book',
    text: ledgerTable('arrive'),
    hits: [hit('arrive', 860, 500, 280, 64, '收進檔案', '', true)],
  }),
  scale: () => ({
    title: '磅秤', file: 'g01-cu-scale.webp', atmos: 'g01-s05.webp', prop: 'dial',
    hits: [hit('scale', 360, 80, 560, 520, '看看指針')],
  }),
  board5: () => ({
    title: '運量登記板', file: 'g01-cu-board5.webp', atmos: 'g01-s05.webp', prop: 'slate',
    hits: [hit('board5', 360, 140, 560, 420, '輸入消失的車數')],
    note: '比對兩本簿子之後，在這裡輸入少掉的車數。',
  }),
  gravel: (s) => ({
    title: s.gravelOn ? '鐵軌上的碎石' : '舊轉轍器',
    file: s.gravelOn ? 'g01-cu-gravel.webp' : 'g01-cu-oldswitch.webp',
    atmos: 'g01-s05.webp',
    subject: { src: s.gravelOn ? 'g01-gravel.webp' : 'g01-switch.webp', w: 640, h: 280 },
    hits: [hit('gravel', 300, 220, 680, 320, s.gravelOn ? '撥開碎石' : '舊轉轍器')],
    note: s.solved3 ? '碎石可以撥開。' : '先把消失的車數登記上去。',
  }),
  A: () => tunnel('A'),
  B: () => tunnel('B'),
  C: () => tunnel('C'),
  wall: () => ({
    title: '牆上的刻字', file: 'g01-cu-plaque.webp', atmos: 'g01-s06.webp', prop: 'plaque',
    text: '<p class="cu-inscribe">凡出坑者，皆有紀錄。<br>凡入庫者，皆有編號。<br>唯不升不出者，不留其名。</p>',
    hits: [hit('wall', 260, 140, 760, 420, '讀刻字')],
  }),
  cart2: (s) => ({
    title: '側線上的礦車', file: 'g01-cu-cart.webp', atmos: 'g01-s06b.webp',
    subject: { src: 'g01-cart.webp', w: 640, h: 460 },
    hits: s.cartIn ? [] : [hit('cart2', 300, 120, 680, 480, '把礦車推進側線')],
    note: s.cartIn ? '礦車已經沿著側線滑到鐵門旁邊，停下了。' : '軌道往鐵門的方向微微下傾。推一把，它會自己滾過去。',
  }),
  latch: () => ({
    title: '門扣', file: 'g01-cu-latch.webp', atmos: 'g01-s06b.webp',
    subject: { src: 'g01-latch.webp', w: 420, h: 280 },
    hits: [hit('latch', 400, 180, 480, 340, '撬門扣')],
    note: '門扣鏽死了。使用鐵撬棒再點它。',
  }),
  door: () => ({
    title: '鐵門', file: 'g01-cu-irondoor.webp', atmos: 'g01-s06b.webp',
    subject: { src: 'g01-s06-door.webp', w: 520, h: 580 },
    sprites: [{ src: 'g01-latch.webp', x: 860, y: 300, w: 140, h: 100 }],
    hits: [
      hit('door', 300, 80, 520, 520, '鐵門'),
      hit('latch', 840, 280, 180, 140, '門扣', 'latch'),
    ],
  }),
  photo2: () => ({
    title: '門邊的照片', file: 'g01-cu-photo-men.webp', atmos: 'g01-s06b.webp',
    subject: { src: 'it-photo.webp', w: 640, h: 440 },
    hits: [
      hit('photo2', 180, 520, 280, 64, '翻到背面', 'photo2back', true),
      hit('photo2', 520, 520, 280, 64, '看這張照片', '', true),
    ],
  }),
  photo2back: () => ({
    title: '照片背面', file: 'g01-cu-photo-back.webp', atmos: 'g01-s06b.webp', prop: 'back',
    text: '<p class="cu-hand">黃金已經藏好了。<br>我希望我們四個人，都能活著回到這裡。</p>',
    hits: [hit('photo2', 470, 520, 340, 64, '收進檔案', '', true)],
  }),
  manual: () => ({
    title: '維修手冊', file: 'g01-cu-manual.webp', atmos: 'g01-s07.webp',
    subject: { src: 'it-manual.webp', w: 420, h: 520 },
    hits: [hit('manual', 420, 80, 440, 540, '翻開手冊')],
  }),
  panel: (s) => ({
    title: '控制盤', file: 'g01-cu-panel.webp', atmos: 'g01-s07.webp',
    subject: { src: 'g01-s07-panel.webp', w: 460, h: 540 },
    sprites: s.ctlOn ? [{ src: 'it-handle.webp', x: 430, y: 180, w: 90, h: 90 }] : [],
    hits: [hit('panel', 400, 120, 480, 480, s.ctlOn ? '依順序操作' : '裝上控制手柄')],
    note: s.ctlOn ? '解除制動，接通電源，然後上升。' : '控制盤上少了一支手柄。',
  }),
  rack: (s) => ({
    title: '工具架', file: 'g01-cu-rack.webp', atmos: 'g01-s07.webp', prop: 'rack',
    sprites: s.hasCtl ? [] : [{ src: 'it-handle.webp', x: 560, y: 150, w: 150, h: 150 }],
    hits: [
      hit('rack', 520, 120, 230, 220, '控制手柄'),
      hit('rust', 240, 180, 200, 280, '鏽掉的扳手'),
      hit('rust', 820, 200, 200, 260, '鏽掉的鉗子'),
    ],
  }),
  shaft: () => ({
    title: '升降井', file: 'g01-cu-shaft.webp', atmos: 'g01-s07.webp', prop: 'shaft',
    hits: [hit('shaft', 380, 40, 520, 620, '看看鐵籠')],
  }),
  words: () => vaultDoor(),
  frame: () => vaultDoor(),
  frame2: () => vaultDoor(),
  lock: () => vaultDoor(),
  plate: () => vaultDoor(),
  dial: () => ({
    title: '機械鎖', file: 'g01-cu-dial.webp', atmos: 'g01-s08.webp',
    subject: { src: 'g01-keypad.webp', w: 520, h: 340 },
    hits: [hit('lock', 400, 160, 480, 360, '轉動密碼輪', '', true)],
  }),
  mmdd: () => ({
    title: '密碼牌', file: 'g01-cu-mmdd.webp', atmos: 'g01-s08.webp', prop: 'mmdd',
    text: '<p class="cu-mmdd">MMDD</p><p class="cu-copy">月份兩位，日期兩位。</p>',
    hits: [hit('plate', 340, 120, 600, 420, '看密碼牌')],
  }),
  letter: () => ({
    title: '摺好的信', file: 'g01-cu-letter.webp', atmos: 'g01-s08.webp',
    subject: { src: 'it-letter.webp', w: 420, h: 420 },
    hits: [hit('letterRead', 420, 120, 440, 460, '拆開這封信')],
  }),
};

export function view(id, state) {
  const make = VIEWS[id];
  if (!make) return null;
  const spec = make(state || {});
  spec.id = id;
  return spec;
}
