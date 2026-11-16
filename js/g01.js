// 一般關卡 G01「從未消失的黃金」：台灣・金瓜石
// 劇情與謎題依企劃書 V1.0。S03–S08 與結語遠景優先用 webp；缺任何一張就整幕退回 g01art.js。
export const FICTION = '本關以金瓜石的礦業史與戰俘強迫勞動為背景，寫成原創懸疑故事。亞瑟・威廉斯、藏金行動、封閉金庫與可重新啟動的升降設備皆為虛構，並非史實。真實封閉礦坑不可進入，請勿嘗試現地操作。';
import { get, save, taskDone } from './store.js';
import { sfx, bgm, applyVolume } from './audio.js';
import { html, $, $$, IMG, ICON, wait, esc, modal, toast, alertBox, fmt } from './ui.js';
import * as ART from './g01art.js';
import * as CU from './g01cu.js';

const svgSrc = s => 'data:image/svg+xml,' + encodeURIComponent(s);
const ITEMS = {
  bar: { name: '鐵撬棒', src: IMG('it-crowbar.webp'), desc: '靠在坑口牆邊的鐵撬棒，扁口還很結實。', hint: '能撬開卡住或鏽死的東西。' },
  grip: { name: '扳桿手柄', src: svgSrc('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"><path d="M18 58 L52 14" stroke="#b08a50" stroke-width="10" stroke-linecap="round"/><circle cx="52" cy="14" r="8" fill="#c9a27e"/><rect x="10" y="54" width="18" height="10" fill="#6b5a50"/></svg>'), desc: '從破木箱裡找到的金屬手柄，末端有卡榫。', hint: '看起來能裝回某個機械上。' },
  ctl: { name: '控制手柄', src: svgSrc('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"><path d="M36 64 V22" stroke="#c9a27e" stroke-width="10" stroke-linecap="round"/><path d="M20 18 H52" stroke="#c9a27e" stroke-width="10" stroke-linecap="round"/><rect x="28" y="56" width="16" height="10" fill="#6b5a50"/></svg>'), desc: '工具架上的控制手柄，握把磨得發亮。', hint: '升降井的控制盤上，好像少了一支這樣的手柄。' },
};
const ICO = {
  hint: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d8b594" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"></path></svg>',
  file: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d8b594" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h9l4 4v14H6zM15 3v4h4M9 12h6M9 16h6"></path></svg>',
};

// ---------------- 文件內容 ----------------
const LEDGER = [['02/15', 12, 12], ['02/16', 15, 15], ['02/17', 12, 9], ['02/18', 10, 10]];
const DOCS = {
  photo: { title: '金瓜石舊照片', pages: ['<p>一張泛黃的黑白照片。坑口在山坡下，後面是層層疊疊的礦場建築，軌道從坑口伸出來。</p><p>照片角落用鉛筆寫著：本山六坑。</p>'] },
  invite: { title: '館長邀請函', pages: ['<p>因杜阿森教授台鑒：</p><p>本館近日整理戰時礦場檔案，發現數筆運輸紀錄前後不符，另有一份未列入正式目錄的舊礦圖。懇請教授推薦合適人選，協助釐清疑點。調查許可與安全協助，將由本館安排。</p><p style="text-align:right">黃金博物館　林○中 敬上</p>'] },
  report: { title: '礦山報告摘要', pages: ['<p>〈本山礦區運輸摘要・1945 年 2 月〉</p><p>本月運輸作業大致正常，惟部分日期之離站、到站數量，待覆核。</p><p class="red">1945-02-17　運量對不上？（紅筆註記）</p>'] },
  survey: { title: '本山礦區調查資料', pages: ['<div class="label">六坑舊照片</div><p>本山六坑口，木造坑框與兩條軌道。坑口前常有礦車停放。</p>', '<div class="label">礦區平面圖</div><p>六坑內有礦工休息室、運礦站與數條維修坑道。另一份未列入目錄的舊圖上，多了一條通往上方坑道的路線。</p>', '<div class="label">異常日期摘要</div><p class="red">1945 年 2 月 17 日：同一天的離站與到站數量不一致。</p>'] },
  schedule: { title: '班次表', pages: ['<table class="gtab"><tr><th>班次</th><th>時間</th><th>編號</th></tr><tr><td>早班</td><td>06–14 點</td><td>01</td></tr><tr><td>午班</td><td>14–22 點</td><td>02</td></tr><tr><td>夜班</td><td>22–06 點</td><td>03</td></tr></table><p>鐵櫃依班次編號分配。</p>'] },
  note: { title: '牆上的紙條', pages: ['<p class="hand">「我們只在所有人都睡著後，才能記下真正的數字。」</p>'] },
  journal: { title: 'A. WILLIAMS 工作日誌', pages: [
    '<div class="label">1944-12-12</div><h3>無法回家的生日</h3><p class="hand">今天是我的生日。十二月十二日。以前每年的這一天，母親都會準備一頓豐盛的晚餐。今年我只能在冰冷的礦坑裡度過。不知道明年的生日，我還能不能回家。</p>',
    '<div class="label">1945-02-15</div><h3>不屬於我們的財富</h3><p class="hand">今天我們發現一批被特殊封裝的金屬貨物。它們比普通礦石重得多。負責搬運的士兵不允許我們查看，也沒有將它們列入一般礦石清單。我懷疑那些箱子裡裝的是已經提煉完成的黃金。</p>',
    '<div class="label">1945-02-17</div><h3>三車貨物</h3><p class="hand">我們已經商量好了。三車貨物，不會抵達原本的終點。如果有人發現這本日誌，請記住今天的日期。數字會告訴你它們去了哪裡。</p>',
    '<div class="label">1945-02-21</div><h3>另一條路</h3><p class="hand">林先生熟悉礦區的所有維修路線。他告訴我們，有一條舊升降路線通往上方的坑道。那裡早已不在平常的運輸清單之中。或許我們還有機會。</p>',
    '<div class="label">1945-02-28</div><h3>約定</h3><p class="hand">我們已經把最後一批貨物安置好了。當所有人離開後，那裡應該不會再有人踏入。我不知道我們還能否回來。但只要有人記得那一天，就能打開最後一道門。</p>'] },
  photoA: { title: '戰俘合照', pages: ['<div class="gphoto"><span></span><span></span><span></span><span></span></div><p>四個人並肩站在坑口前，衣衫破舊。照片下方寫著名字：</p><p class="hand">Arthur　Edward　Thomas　林清和</p>'] },
  depart: { title: '離站簿', pages: [`<table class="gtab"><tr><th>日期</th><th>離站（車）</th></tr>${LEDGER.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table>`] },
  arrive: { title: '到站簿', pages: [`<table class="gtab"><tr><th>日期</th><th>到站（車）</th></tr>${LEDGER.map(r => `<tr><td>${r[0]}</td><td>${r[2]}</td></tr>`).join('')}</table>`] },
  photoB: { title: '四人合照（背面）', pages: ['<div class="gphoto"><span></span><span></span><span></span><span></span></div><p>同樣的四個人。照片背面寫著：</p><p class="hand">「黃金已經藏好了。我希望我們四個人，都能活著回到這裡。」</p>'] },
  manual: { title: '升降設備維修手冊', pages: ['<p>〈升降設備啟動程序〉</p><p>一、解除制動。</p><p>二、接通電源。</p><p>三、選擇上升。</p><p class="red">注意：順序錯誤時，控制盤會自動復位。盤上沒有下降鈕。</p>'] },
  letter: { title: '亞瑟最後的信', pages: [
    '<div class="label">1945 年 3 月</div><p class="hand">如果你正在讀這封信，代表我們成功了。</p><p class="hand">我們不知道自己還能活多久。每天都有同伴倒下，而那些人只在乎明天還能挖出多少礦石。</p>',
    '<p class="hand">這些黃金足以讓我們任何一個人過上富裕的生活。但沒有人打算獨自帶走它們。</p><p class="hand">我們決定將黃金藏在這裡，直到這場戰爭結束。若我們沒能回來，希望找到它們的人，能記住曾經在這座山裡受苦的人。</p>',
    '<p class="hand">黃金屬於活著的人。但請別忘了那些死去的人。</p><p class="hand">如果有一天，這些黃金再次被人發現，我只希望它們不會成為下一場貪婪的開始。</p><p class="hand" style="text-align:right">—— Arthur Williams</p>'] },
};
// 檔案按鈕裡的小圖。圖還沒到就用通用文件符號。
const DOC_ICON = {
  journal: 'it-journal.webp', letter: 'it-letter.webp', photoA: 'it-photo.webp', photoB: 'it-photo.webp',
  survey: 'it-survey.webp', depart: 'it-ledger.webp', arrive: 'it-ledger.webp', manual: 'it-manual.webp',
};
const NOTES = {
  photo: ['六坑口舊照片：本山六坑。'],
  invite: ['館長邀請函：戰時運輸紀錄前後不符，另有一份未列入正式目錄的舊礦圖。'],
  report: ['礦山報告：<b>1945-02-17</b> 有紅筆註記，運量對不上。'],
  survey: ['調查資料：<b>1945-02-17</b> 離站與到站數量不一致。舊礦圖多出一條未登記的路線。'],
  schedule: ['班次表：早班 01（06–14）、午班 02（14–22）、夜班 <b>03</b>（22–06）。'],
  note: ['紙條：「我們只在所有人都睡著後，才能記下真正的數字。」'],
  journal: [
    '日誌 1944-12-12：十二月十二日是亞瑟的生日。',
    '日誌 1945-02-15：特殊封裝的金屬貨物，比礦石重，疑似已經提煉的黃金。',
    '日誌 1945-02-17：三車貨物不會抵達原本的終點。日期本身就是線索。',
    '日誌 1945-02-21：林清和知道一條舊升降路線，通往上方坑道，不在平常的運輸清單裡。',
    '日誌 1945-02-28：最後一批貨物已經安置。記得那一天，就能打開最後一道門。',
  ],
  photoA: ['合照：Arthur、Edward、Thomas、林清和，四個人站在坑口前。'],
  photoB: ['合照背面：「黃金已經藏好了。我希望我們四個人，都能活著回到這裡。」'],
  manual: ['維修手冊：一、解除制動。二、接通電源。三、選擇上升。順序錯誤，控制盤會復位。'],
  letter: ['亞瑟的信：他們把黃金留下來，是為了記住在這座山裡受苦的人。原信留在箱中，只收一份影像。'],
};

export function render(st, params, go) {
  const replay = !!(params && params.replay);
  const d = get();
  const g = (d.player && d.player.gender) || 'm';
  const pname = (d.player && d.player.name) || '玩家';
  const el = html(`<div class="scr g01">
<div class="layer" id="scene"></div>
<div class="fill" id="hsLayer" style="z-index:3"></div>
<div class="fill hidden" id="cu"></div>
<div class="fill hidden" id="close" style="z-index:4;background:#0a0607"></div>
<div class="fill hidden" id="cine" style="z-index:20;background:#000"></div>
<div class="shade-top"></div>
<div class="shade-right"></div>
<div class="lvl-top" id="hud">
  <button type="button" class="iconbtn" id="leave" aria-label="離開關卡">${ICON.back}</button>
  <div class="lvl-goal"><span class="chip-red" style="height:32px">一般關卡 · 從未消失的黃金</span><span id="goal">目標　接受委託</span></div>
  <button type="button" class="iconbtn hud-item" id="useCompass" aria-label="解析盤"><img src="${IMG('it-compass.webp')}" alt=""><b id="nCompass"></b></button>
  <button type="button" class="iconbtn hud-item" id="useMemo" aria-label="調查備忘錄"><img src="${IMG('it-memo.webp')}" alt=""><b id="nMemo"></b></button>
</div>
<div class="lvl-right" style="height:64px">
  <button type="button" class="iconbtn hud-big" id="hintBtn">${ICO.hint}<span>提示</span><i class="hint-free" id="hintFree" hidden>首次免費</i></button>
  <button type="button" class="iconbtn hud-big" id="fileBtn">${ICO.file}<span>檔案</span></button>
  <button type="button" class="iconbtn hud-big" id="setBtn">${ICON.gear.replace('<svg', '<svg width="24" height="24"')}<span>設定</span></button>
</div>
<div class="slots" id="slots" role="group" aria-label="臨時道具欄"></div>
<div class="black on" id="black"></div>
</div>`);
  st.appendChild(el);
  const scene = $(el, '#scene'), hsLayer = $(el, '#hsLayer'), close = $(el, '#close'), cine = $(el, '#cine'), cu = $(el, '#cu');
  let alive = true, listeners = [], inv = [], selected = null;
  let step = { goal: '', hints: [], hl: [], memo: '' }, hintLv = 0;
  let stack = [];
  const IDLE_HINT_MS = 38000;
  let snap = () => ({ got, place: 's01', opened: new Set(), chock: true, hasBar: false, hasGrip: false, gripOn: false, cartIn: false, doorOpen: false, hasCtl: false, ctlOn: false, vaultOpen: false, crateOpen: false, solved3: false, gravelOn: true, switchPeek: false });
  function bind(place, more) {
    snap = () => Object.assign({
      got, place, opened: new Set(),
      chock: true, hasBar: false, hasGrip: false, gripOn: false,
      cartIn: false, doorOpen: false, hasCtl: false, ctlOn: false,
      vaultOpen: false, crateOpen: false, solved3: false, gravelOn: true, switchPeek: false,
    }, more ? more() : {});
  }
  const got = new Set();          // 已取得的文件
  const memoLines = [];
  const addNote = (id, text) => { if (!memoLines.some(n => n.id === id)) memoLines.push({ id, text }); };
  function absorb(id) {
    (NOTES[id] || []).forEach((text, i) => addNote(id + i, text));
    if (got.has('schedule') && got.has('note')) addNote('night', '所有人都睡著的時段是夜班，班次編號是 <b>03</b>。');
    if (got.has('depart') && got.has('arrive')) addNote('diff', '離站簿與到站簿只有 <b>02/17</b> 不一致：離站 12 車、到站 9 車，差額 <b>3</b> 車。');
  }
  const seen = new Set();         // 已調查過的熱點
  let usedHelp = false, compassUsed = 0, memoUsed = 0;
  let lockApi = null;             // 目前開著的密碼介面（給解析盤用）
  const S = () => { if (!alive) throw new Error('left'); };

  const emit = a => listeners.slice().forEach(l => l(a));
  const act = test => new Promise(res => { const l = a => { if (test(a)) { listeners = listeners.filter(x => x !== l); res(a); } }; listeners.push(l); });

  // ---------- 道具欄 ----------
  function paintSlots(ping) {
    const s = $(el, '#slots'); s.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const id = inv[i];
      if (!id) { s.appendChild(html('<span class="slot" role="img" aria-label="空的道具欄"></span>')); continue; }
      const b = html(`<button type="button" class="slot has${selected === id ? ' sel' : ''}${ping === id ? ' ping' : ''}" aria-label="${ITEMS[id].name}"><img src="${ITEMS[id].src}" alt=""></button>`);
      b.addEventListener('click', () => { sfx('tap'); openItem(id); });
      s.appendChild(b);
    }
    const ban = $(el, '.use-banner'); if (ban) ban.remove();
    if (selected) el.appendChild(html(`<div class="use-banner"><div><img src="${ITEMS[selected].src}" alt="" style="width:32px;height:32px">使用「${ITEMS[selected].name}」：請點選要使用的位置</div></div>`));
  }
  const addItem = id => { if (!inv.includes(id)) inv.push(id); sfx('pick'); paintSlots(id); };
  async function flyPickup(hsId, itemId, line) {
    const src = el.querySelector(`#hsLayer [data-hs="${hsId}"]`);
    const slot = $(el, '#slots');
    const stage = document.getElementById('stage').getBoundingClientRect();
    const sc = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--s')) || 1;
    if (src && slot) {
      const a = src.getBoundingClientRect();
      const b = slot.getBoundingClientRect();
      const ghost = html(`<img class="g01-fly" alt="" src="${ITEMS[itemId].src}">`);
      ghost.style.left = ((a.left - stage.left) / sc) + 'px';
      ghost.style.top = ((a.top - stage.top) / sc) + 'px';
      el.appendChild(ghost);
      requestAnimationFrame(() => {
        ghost.style.left = ((b.left - stage.left) / sc + 16) + 'px';
        ghost.style.top = ((b.top - stage.top) / sc) + 'px';
        ghost.style.opacity = '0.2';
      });
      await wait(340);
      ghost.remove();
    }
    addItem(itemId);
    toast(line);
  }
  async function revealBeat() {
    sfx('hum');
    scene.classList.add('flick');
    await wait(520);
    scene.classList.remove('flick');
  }
  function fileHere(id) {
    const fresh = !got.has(id);
    if (fresh) { got.add(id); absorb(id); sfx('pick'); }
    closeStack();
    toast(fresh ? '已收進檔案。' : '這份已經在檔案裡。');
    return fresh;
  }
  const dropItem = id => { inv = inv.filter(x => x !== id); if (selected === id) selected = null; paintSlots(); };
  function openItem(id) {
    stack.push({ kind: 'item', itemId: id });
    cu.classList.remove('hidden');
    cu.classList.add('on');
    paintCu();
  }

  // ---------- 場景與熱點 ----------
  function setScene(inner, placeholder = false) { scene.innerHTML = inner + (placeholder ? ART.BADGE : ''); hsLayer.innerHTML = ''; }
  const bgImg = (n, alt) => `<img class="bg" src="${IMG(n)}" alt="${alt}">`;
  const probed = new Map();
  function probe(src) {
    if (probed.has(src)) return probed.get(src);
    const p = new Promise(res => {
      const img = new Image();
      img.onload = () => res(true);
      img.onerror = () => res(false);
      img.src = src;
    });
    probed.set(src, p);
    return p;
  }
  let painted = false, linArt = false;
  const iconReady = {};
  async function resolveArt() {
    for (const [id, file] of [['grip', 'it-grip.webp'], ['ctl', 'it-handle.webp']]) {
      if (await probe(IMG(file))) ITEMS[id].src = IMG(file);
    }
    for (const file of new Set(Object.values(DOC_ICON))) iconReady[file] = await probe(IMG(file));
    linArt = await probe(IMG('npc-lin.webp'));
  }
  const fileIcon = id => {
    const file = DOC_ICON[id];
    return file && iconReady[file] ? `<img src="${IMG(file)}" alt="" style="width:36px;height:36px;object-fit:contain">` : ICO.file;
  };
  // 缺任何一張 webp，整幕退回向量示意圖，避免半套圖對不齊。
  async function showPlace(place) {
    const files = [place.bg, ...(place.sprites || []).map(s => s.file)];
    const ok = (await Promise.all([...new Set(files)].map(f => probe(IMG(f))))).every(Boolean);
    if (!ok) { painted = false; setScene(place.fallback(), true); return; }
    painted = true;
    const sprites = (place.sprites || []).map(s => {
      const style = [`left:${s.x}px`, `top:${s.y}px`, `width:${s.w}px`, `height:${s.h}px`, `opacity:${s.opacity ?? 1}`, `z-index:${s.z ?? 1}`, `object-fit:${s.fit || 'fill'}`, s.extra || ''].filter(Boolean).join(';');
      return `<img class="g01-sp" id="${s.id}" src="${IMG(s.file)}" alt="" style="${style}">`;
    }).join('');
    const tags = (place.tags || []).map(t => `<span class="g01-tag" style="left:${t.x}px;top:${t.y}px">${t.text}</span>`).join('');
    setScene(`<img class="bg" src="${IMG(place.bg)}" alt="${place.alt}">${place.under || ''}${sprites}${tags}${place.extra || ''}`, false);
  }
  const fade = (id, opacity) => { const n = scene.querySelector('#' + id); if (n) n.style.opacity = String(opacity); return n; };
  function swingDoor(n) {
    // 門與號碼牌是同一個節點。鉸鏈在左緣，負的 rotateY 讓外側面朝鏡頭、往左外側打開。
    const door = scene.querySelector('#lk' + n + 'door');
    if (!door) return;
    door.style.transition = 'transform .55s ease, filter .55s ease';
    door.classList.add('ajar');
  }
  const svg = id => scene.querySelector('#' + id);
  function showExit(label) {
    if (el.querySelector('.g01-accept')) return;
    const b = html(`<button type="button" class="btn serif-btn g01-accept" style="width:240px">${label}</button>`);
    b.addEventListener('click', () => { sfx('tap'); emit({ type: 'hs', id: 'exit', item: selected }); });
    el.appendChild(b);
  }
  // list: [id, x, y, w, h, 名稱]。有近景的物件只負責把鏡頭推進去，互動發生在近景裡。
  function setHs(list) {
    hsLayer.innerHTML = '';
    list.forEach(([id, x, y, w, h, label]) => {
      const b = html(`<button type="button" class="area" data-hs="${id}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px" aria-label="${label}"></button>`);
      b.addEventListener('click', () => {
        sfx('tap'); armIdle();
        if (CU.view(id, snap())) { openFromWide(id, b); return; }
        emit({ type: 'hs', id, item: selected });
      });
      hsLayer.appendChild(b);
    });
    armIdle();
  }
  const dropHs = id => { const b = $(hsLayer, `[data-hs="${id}"]`); if (b) b.remove(); };
  async function loop(handler) {
    for (;;) {
      const a = await act(x => x.type === 'hs'); S();
      const used = a.item;
      const r = await handler(a.id, used); S();
      if (stack.length) paintCu();
      if (used && selected === used) { selected = null; paintSlots(); }
      if (r) return r;
    }
  }

  // ---------- 近景 ----------
  let idleTimer = 0, cuToken = 0;
  function armIdle() {
    clearTimeout(idleTimer);
    el.querySelectorAll('.area.idle').forEach(n => n.classList.remove('idle'));
    const ms = window.__G01_IDLE_MS || IDLE_HINT_MS;
    idleTimer = setTimeout(() => {
      if (!alive) return;
      const ids = typeof step.hl === 'function' ? step.hl() : (step.hl || []);
      (ids || []).forEach(id => el.querySelectorAll(`[data-hs="${id}"]`).forEach(n => n.classList.add('idle')));
    }, ms);
  }
  el.addEventListener('pointerdown', armIdle);
  function openFromWide(id, btn) {
    if (stack.length) closeStack();
    cuToken++;
    const x = parseFloat(btn.style.left) + parseFloat(btn.style.width) / 2;
    const y = parseFloat(btn.style.top) + parseFloat(btn.style.height) / 2;
    scene.style.transformOrigin = `${x}px ${y}px`;
    scene.classList.add('cu-zoom');
    stack = [{ kind: 'view', id }];
    cu.classList.remove('hidden');
    cu.classList.remove('on');
    requestAnimationFrame(() => requestAnimationFrame(() => cu.classList.add('on')));
    paintCu();
  }
  function closeStack() {
    const token = ++cuToken;
    const pending = stack.splice(0);
    scene.classList.remove('cu-zoom');
    cu.classList.remove('on');
    pending.forEach(f => { if (f && f.res) f.res(); });
    setTimeout(() => {
      if (token !== cuToken || stack.length) return;
      cu.classList.add('hidden');
      cu.innerHTML = '';
      delete cu.dataset.view;
    }, 300);
  }
  function popCu() {
    const frame = stack.pop();
    if (frame && frame.res) frame.res();
    if (!stack.length) { closeStack(); return; }
    paintCu();
  }
  function turnDoc(k) {
    const frame = stack[stack.length - 1];
    if (!frame || frame.kind !== 'doc') return;
    const doc = DOCS[frame.docId];
    sfx('tap');
    if (k === 'prev') frame.page = Math.max(0, frame.page - 1);
    else frame.page = Math.min(doc.pages.length - 1, frame.page + 1);
    paintCu();
  }
  cu.addEventListener('click', e => {
    const t = e.target.closest('[data-cu]');
    if (!t) return;
    armIdle();
    const k = t.dataset.cu;
    if (k === 'wide') { sfx('tap'); closeStack(); return; }
    if (k === 'back' || k === 'shut') { sfx('tap'); popCu(); return; }
    if (k === 'use') { sfx('tap'); selected = t.dataset.item; popCu(); paintSlots(); return; }
    if (k === 'put') { sfx('tap'); if (selected === t.dataset.item) selected = null; popCu(); paintSlots(); return; }
    if (k === 'prev' || k === 'next') { turnDoc(k); return; }
    if (k === 'into') { sfx('tap'); stack.push({ kind: 'view', id: t.dataset.into }); paintCu(); return; }
    if (k === 'hs') { sfx('tap'); emit({ type: 'hs', id: t.dataset.hs, item: selected }); }
  });
  async function paintCu() {
    const frame = stack[stack.length - 1];
    if (!frame) return;
    if (frame.kind === 'doc') { cu.dataset.view = 'doc:' + frame.docId; cu.innerHTML = docMarkup(frame); return; }
    if (frame.kind === 'item') { cu.dataset.view = 'item:' + frame.itemId; cu.innerHTML = await itemMarkup(frame.itemId); return; }
    const spec = CU.view(frame.id, snap());
    if (!spec) { closeStack(); return; }
    cu.dataset.view = frame.id;
    const full = spec.file && await probe(IMG(spec.file)) ? IMG(spec.file) : '';
    let subject = '';
    if (!full && spec.subject && await probe(IMG(spec.subject.src))) subject = IMG(spec.subject.src);
    const sprites = [];
    for (const sp of spec.sprites || []) {
      let url = '';
      if (sp.src && await probe(IMG(sp.src))) url = IMG(sp.src);
      else if (sp.fb && await probe(IMG(sp.fb))) url = IMG(sp.fb);
      sprites.push({ ...sp, url });
    }
    const hits = (spec.hits || []).map(hit => {
      const attr = hit.into ? `data-cu="into" data-into="${hit.into}"` : `data-cu="hs" data-hs="${hit.id}"`;
      return `<button type="button" class="area cu-hit${hit.btn ? ' cu-act' : ''}${hit.hot ? ' show' : ''}" ${attr} style="left:${hit.x}px;top:${hit.y}px;width:${hit.w}px;height:${hit.h}px" aria-label="${hit.label}">${hit.btn ? hit.label : ''}</button>`;
    }).join('');
    const spriteHtml = sprites.map(sp => sp.url
      ? `<img class="cu-sprite" alt="" src="${sp.url}" style="left:${sp.x}px;top:${sp.y}px;width:${sp.w}px;height:${sp.h}px;${sp.extra || ''}">`
      : `<div class="prop-cloth" style="left:${sp.x}px;top:${sp.y}px"></div>`).join('');
    const subj = subject ? `<img class="cu-subject" alt="" src="${subject}" style="left:${(1280 - spec.subject.w) / 2}px;top:${Math.max(48, (620 - spec.subject.h) / 2)}px;width:${spec.subject.w}px;height:${spec.subject.h}px;${spec.subject.extra || ''}">` : '';
    const crop = !full && !subject && spec.crop ? cropHtml(spec.crop) : '';
    const atmos = !full && spec.atmos ? `<div class="cu-atmos" style="background-image:url(${IMG(spec.atmos)})"></div><div class="cu-vignette"></div>` : '<div class="cu-vignette"></div>';
    const hinge = spec.hinge
      ? `<div class="cu-hinge${spec.hinge.hold ? ' hold' : ''}" style="--open:${spec.hinge.angle}deg"><img alt="" src="${IMG('g01-s04-locker.webp')}"><b class="cu-num">${spec.hinge.plate}</b></div>`
      : '';
    cu.innerHTML = `<div class="cu-stage${spec.hinge && spec.hinge.hold ? ' cavity' : ''}">${full ? `<img class="cu-full" alt="" src="${full}">` : atmos}
${!full && spec.prop ? `<div class="cu-prop prop-${spec.prop}"></div>` : ''}${crop}${subj}${hinge}${spriteHtml}
${spec.text || ''}${spec.plate ? `<div class="cu-plate ${spec.plateClass || ''}${String(spec.plate).length === 1 ? ' letter' : ''}"><b>${spec.plate}</b></div>` : ''}
${hits}<button type="button" class="cu-back" data-cu="back">返回</button><button type="button" class="cu-wide" data-cu="wide">回到寬景</button>
<div class="cu-cap"><b>${spec.title}</b>${spec.note ? `<span>${spec.note}</span>` : ''}</div>
${full || crop || subj || hinge ? '' : '<i class="cu-temp">待換正式近景</i>'}</div>`;
  }
  function cropHtml(crop) {
    const scale = Math.min(2.15, 680 / crop.w);
    return `<div class="cu-cropwin"><img alt="" src="${IMG(crop.src)}" style="width:${1280 * scale}px;height:${720 * scale}px;margin-left:${-crop.x * scale}px;margin-top:${-crop.y * scale}px"></div>`;
  }
  function docMarkup(frame) {
    const doc = DOCS[frame.docId];
    const last = frame.page >= doc.pages.length - 1;
    return `<div class="cu-doc" role="dialog" aria-label="${esc(doc.title)}"><div class="label">調查檔案</div><h2>${doc.title}</h2><div class="gdoc-body">${doc.pages[frame.page]}</div>
<div class="cu-pages">${frame.page ? '<button type="button" class="btn-line sm" data-cu="prev" style="width:144px">上一頁</button>' : ''}<button type="button" class="btn sm" data-cu="${last ? 'shut' : 'next'}" style="width:144px">${last ? '闔上' : '下一頁'}</button></div></div>
<button type="button" class="cu-back" data-cu="back">返回</button><button type="button" class="cu-wide" data-cu="wide">回到寬景</button>`;
  }
  async function itemMarkup(id) {
    const it = ITEMS[id];
    const file = { bar: 'g01-cu-item-bar.webp', grip: 'g01-cu-item-grip.webp', ctl: 'g01-cu-item-ctl.webp' }[id];
    const full = file && await probe(IMG(file));
    return `${full ? `<img class="cu-full" alt="" src="${IMG(file)}">` : `<div class="cu-atmos" style="background-image:url(${IMG('g01-s03.webp')})"></div><div class="cu-vignette"></div><i class="cu-temp">待換正式近景</i>`}
<div class="cu-item">${full ? '' : `<img alt="" src="${it.src}">`}<b style="font-family:var(--serif);font-size:32px;letter-spacing:0.12em">${it.name}</b><p>${it.desc}</p><p>${it.hint}</p>
<div class="row" style="gap:16px"><button type="button" class="btn-line" data-cu="put" data-item="${id}" style="width:200px">放回道具欄</button><button type="button" class="btn" data-cu="use" data-item="${id}" style="width:200px">使用</button></div></div>
<button type="button" class="cu-back" data-cu="back">返回</button><button type="button" class="cu-wide" data-cu="wide">回到寬景</button>`;
  }

  // ---------- 對白 ----------
  const WHO = { me: pname, ind: '因杜阿森', lin: '林館長', arthur: '亞瑟・威廉斯' };
  function say(cn, en, who = 'me', opt = {}) {
    return new Promise(res => {
      const calm = close.classList.contains('hidden') && cine.classList.contains('hidden');
      let pic = null;
      if (who === 'me' && calm && opt.pic !== false) pic = html(`<img class="portrait" src="${IMG(`hero-${g}.webp`)}" alt="">`);
      if (who === 'ind' && calm) pic = html(`<img class="portrait npc" src="${IMG('npc-induasen.webp')}" alt="">`);
      if (who === 'lin' && calm && linArt) pic = html(`<img class="portrait npc" src="${IMG('npc-lin.webp')}" alt="">`);
      if (pic) el.appendChild(pic);
      const b = html(`<div class="sub${who === 'think' ? ' think' : ''}" role="button" tabindex="0" aria-label="點一下繼續"><div class="who"><span>${esc(who === 'think' ? `${pname}（內心）` : WHO[who] || '')}</span>${ICON.voice}</div><p class="cn">${cn}</p><p class="en">${en}</p>${ICON.down}</div>`);
      const done = () => { sfx('tap'); b.remove(); if (pic) pic.remove(); res(); };
      b.addEventListener('click', done);
      b.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') done(); });
      el.appendChild(b); b.focus({ preventScroll: true });
    });
  }
  const me = (cn, en, opt) => say(cn, en, 'me', opt);
  async function sys(lines, ms = 2400) {
    const b = html(`<div class="sysmsg" style="top:240px"><div role="status">${lines.map(l => `<p>${l}</p>`).join('')}</div></div>`);
    el.appendChild(b); await wait(ms); b.remove();
  }
  let tipEl = null;
  function tip(text, pos = { left: 180, top: 168 }) {
    untip();
    tipEl = html(`<div class="tip" style="left:${pos.left}px;top:${pos.top}px;width:${pos.width || 440}px"><div class="label">提示</div><p>${text}</p><div class="foot"><span></span><button type="button" class="btn sm" style="width:120px">知道了</button></div></div>`);
    tipEl.querySelector('.btn').addEventListener('click', () => { sfx('tap'); untip(); });
    el.appendChild(tipEl);
  }
  const untip = () => { if (tipEl) { tipEl.remove(); tipEl = null; } };

  // ---------- 目標、提示、備忘錄 ----------
  function setStep(goal, hints, hl, memo) {
    step = { goal, hints, hl, memo }; hintLv = 0;
    $(el, '#goal').textContent = '目標　' + goal;
    armIdle();
  }
  function flash(ids) {
    (ids || []).forEach(id => {
      el.querySelectorAll(`[data-hs="${id}"]`).forEach(b => { b.classList.add('show'); setTimeout(() => b.classList.remove('show'), 6000); });
    });
  }
  function paintHint() {
    const free = !get().g01FreeHint;
    const badge = $(el, '#hintFree');
    if (badge) badge.hidden = !free;
    $(el, '#hintBtn').setAttribute('aria-label', free ? '提示，首次免費' : '提示');
  }
  $(el, '#hintBtn').addEventListener('click', async () => {
    sfx('tap');
    if (!step.hints.length) { toast('這裡不需要提示，往下看劇情吧。'); return; }
    const dd = get();
    const free = !dd.g01FreeHint;
    const ok = await modal({
      title: free ? '首次提示免費' : '使用提示',
      body: free ? '這一關的第一次提示不用消耗鑽石。' : '消耗鑽石，取得一個小幫助。',
      bodyHtml: free
        ? `<div class="col" style="align-items:center;gap:8px"><b style="font-size:28px;letter-spacing:0.12em;color:var(--gold-2)">首次免費</b><div style="font-size:16px;line-height:24px;color:var(--muted)">存在這個存檔裡。用過之後，每次提示消耗 1 顆鑽石。</div></div>`
        : `<div class="col" style="align-items:center;gap:4px"><div class="row" style="height:48px;gap:12px;font-size:18px"><span style="color:var(--text-2)">消耗</span><img src="${IMG('diamond.webp')}" alt="鑽石" style="width:40px;height:40px"><b style="font-size:24px">×1</b></div><div style="font-size:14px;line-height:24px;color:var(--muted)">目前持有 ${fmt(dd.diamonds)} 顆鑽石</div></div>`,
      buttons: [{ label: '取消', kind: 'btn-line', value: false }, { label: free ? '免費查看' : '使用提示', kind: 'btn', value: true }],
    });
    if (!ok || !alive) return;
    if (free) { dd.g01FreeHint = true; usedHelp = true; save(); paintHint(); }
    else {
      if (dd.diamonds < 1) { alertBox('鑽石不足', '鑽石不足，可以完成每日任務或前往儲值取得。'); return; }
      dd.diamonds -= 1; usedHelp = true; save();
    }
    sfx('hint');
    const h = step.hints[Math.min(hintLv, step.hints.length - 1)]; hintLv++;
    flash(typeof step.hl === 'function' ? step.hl() : step.hl);
    await modal({ title: '提示', body: typeof h === 'function' ? h() : h, buttons: [{ label: '知道了', kind: 'btn', value: true }] });
  });
  function paintHud() {
    const dd = get();
    $(el, '#nCompass').textContent = dd.items.compass; $(el, '#nMemo').textContent = dd.items.memo;
    paintHint();
  }
  $(el, '#useCompass').addEventListener('click', () => {
    sfx('tap');
    const dd = get();
    if (!lockApi) { toast('解析盤要在輸入密碼或數字的畫面使用。'); return; }
    if (dd.items.compass < 1) { toast('沒有解析盤了，可以到商城購買。'); return; }
    if (compassUsed >= 2) { toast('同一關卡最多使用 2 次解析盤。'); return; }
    if (!lockApi.reveal()) { toast('已經沒有可以解析的數字了。'); return; }
    dd.items.compass -= 1; compassUsed++; usedHelp = true; save(); paintHud(); sfx('hint');
  });
  $(el, '#useMemo').addEventListener('click', async () => {
    sfx('tap');
    const dd = get();
    if (!step.memo) { toast('目前沒有需要整理的線索。'); return; }
    if (memoUsed >= 1) { await modal({ title: '調查備忘錄', body: step.memo, buttons: [{ label: '關閉', kind: 'btn', value: true }] }); return; }
    if (dd.items.memo < 1) { toast('沒有調查備忘錄了，可以到商城購買。'); return; }
    const ok = await modal({ title: '使用調查備忘錄', body: `自動整理目前的線索，直接告訴你下一步。<br><span style="font-size:16px;color:var(--muted)">每關限用 1 次　持有 ${dd.items.memo} 個</span>`, buttons: [{ label: '取消', kind: 'btn-line', value: false }, { label: '使用', kind: 'btn', value: true }] });
    if (!ok || !alive) return;
    dd.items.memo -= 1; memoUsed++; usedHelp = true; save(); paintHud(); sfx('hint');
    await modal({ title: '調查備忘錄', body: step.memo, buttons: [{ label: '知道了', kind: 'btn', value: true }] });
  });

  // ---------- 文件 ----------
  function readDoc(id) {
    return new Promise(res => {
      stack.push({ kind: 'doc', docId: id, page: 0, res });
      cu.classList.remove('hidden');
      cu.classList.add('on');
      paintCu();
    });
  }
  async function getDoc(id, opts = {}) {
    const first = !got.has(id);
    got.add(id);
    absorb(id);
    if (!opts.shown) await readDoc(id);
    if (first && got.size === 1) tip('看過的文件都會收進右上角的「檔案」。重點數字記在調查備忘錄裡，不用背下來。', { left: 420, top: 168 });
  }
  $(el, '#fileBtn').addEventListener('click', () => {
    sfx('tap');
    if (!got.size && !memoLines.length) { toast('還沒有取得任何文件。'); return; }
    const memo = memoLines.length ? memoLines.map(n => `<p>${n.text}</p>`).join('') : '<p>還沒有記下線索。</p>';
    const m = html(`<div class="modal-back" style="z-index:44"><div class="gdoc" role="dialog" aria-label="檔案"><div class="label">調查檔案</div><h2>已取得的文件</h2><div class="redline"></div>
<div class="gdoc-scroll"><div class="gmemo"><div class="label">調查備忘錄</div>${memo}</div>
<div class="gfiles">${[...got].map(id => `<button type="button" class="gfile" data-doc="${id}">${fileIcon(id)}<span>${DOCS[id].title}</span></button>`).join('')}</div></div>
<button type="button" class="x" aria-label="關閉">${ICON.close}</button></div></div>`);
    m.addEventListener('click', e => {
      const b = e.target.closest('[data-doc]');
      if (b) { sfx('tap'); m.remove(); readDoc(b.dataset.doc); return; }
      if (e.target.closest('.x')) { sfx('tap'); m.remove(); }
    });
    el.appendChild(m);
  });

  // ---------- 設定、離開 ----------
  $(el, '#setBtn').addEventListener('click', () => {
    sfx('tap');
    const s = d.settings;
    const box = html(`<div class="modal-back" style="z-index:46"><div class="modal" role="dialog" aria-label="設定"><h2>設定</h2>
<div class="col" style="align-self:stretch;gap:8px"><div class="set-row"><label for="v1">背景音樂</label><input id="v1" type="range" min="0" max="100" value="${Math.round(s.bgm * 100)}"></div><div class="set-row"><label for="v2">音效</label><input id="v2" type="range" min="0" max="100" value="${Math.round(s.sfx * 100)}"></div></div>
<div class="actions"><button type="button" class="btn" style="width:208px" data-ok>完成</button></div><button type="button" class="x" aria-label="關閉">${ICON.close}</button></div></div>`);
    const upd = () => { s.bgm = $(box, '#v1').value / 100; s.sfx = $(box, '#v2').value / 100; applyVolume(); save(); };
    $(box, '#v1').addEventListener('input', upd); $(box, '#v2').addEventListener('input', upd);
    box.addEventListener('click', e => { if (e.target.closest('[data-ok]') || e.target.closest('.x')) { sfx('tap'); box.remove(); } });
    el.appendChild(box);
  });
  $(el, '#leave').addEventListener('click', async () => {
    sfx('tap');
    const ok = await modal({ title: '離開關卡', body: '一般關卡離開後，下次需要從頭開始。確定要離開嗎？', buttons: [{ label: '繼續調查', kind: 'btn-line', value: false }, { label: '離開', kind: 'btn', value: true }] });
    if (ok && alive) go('stages', { tab: 1 });
  });

  // ---------- 場景切換 ----------
  async function fadeTo(fn, ms = 700) {
    closeStack();
    el.querySelectorAll('.g01-accept').forEach(n => n.remove());
    $(el, '#black').classList.add('on'); await wait(ms); S();
    untip(); await fn(); await wait(200); S();
    $(el, '#black').classList.remove('on'); await wait(ms); S();
  }
  async function chapter(title, sub) {
    closeStack();
    el.querySelectorAll('.g01-accept').forEach(n => n.remove());
    const b = html(`<div class="g01-card"><div class="label">${sub}</div><h2>${title}</h2></div>`);
    $(el, '#black').classList.add('on'); await wait(800); S();
    el.appendChild(b); await wait(1800); S(); b.remove();
  }

  // ---------- 通用數字輸入（運量登記、金庫機械鎖） ----------
  function numberLock({ len, title, sub, answer, hints, dial = false }) {
    return new Promise(res => {
      let val = dial ? Array(len).fill(0) : [], wrong = 0, revealed = new Set();
      const ui = html(`<div class="glock-back"><div class="glock${dial ? ' dial' : ''}"><div class="label">${sub}</div><h2>${title}</h2>
<div class="glock-show"></div><div class="glock-msg"></div><div class="glock-pad"></div>
<div class="row" style="gap:16px;justify-content:center"><button type="button" class="btn-line" data-a="back" style="width:176px">返回</button><button type="button" class="btn" data-a="ok" style="width:176px">確認</button></div></div></div>`);
      const show = $(ui, '.glock-show'), msg = $(ui, '.glock-msg'), pad = $(ui, '.glock-pad');
      const paint = () => {
        if (dial) show.innerHTML = val.map((v, i) => `<div class="gdial${revealed.has(i) ? ' rv' : ''}"><button type="button" data-up="${i}" aria-label="第 ${i + 1} 位加一">▲</button><b>${v}</b><button type="button" data-dn="${i}" aria-label="第 ${i + 1} 位減一">▼</button></div>`).join('');
        else show.innerHTML = Array.from({ length: len }, (_, i) => `<b class="${revealed.has(i) ? 'rv' : ''}">${val[i] ?? '＿'}</b>`).join('') + '<span>車</span>';
      };
      if (!dial) pad.innerHTML = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'C'].map(k => `<button type="button" data-k="${k}">${k === 'C' ? '清除' : k}</button>`).join('');
      ui.addEventListener('click', async e => {
        const t = e.target.closest('button'); if (!t) return;
        if (t.dataset.up) { sfx('key'); val[+t.dataset.up] = (val[+t.dataset.up] + 1) % 10; paint(); return; }
        if (t.dataset.dn) { sfx('key'); val[+t.dataset.dn] = (val[+t.dataset.dn] + 9) % 10; paint(); return; }
        if (t.dataset.k) { sfx('key'); if (t.dataset.k === 'C') val = []; else if (val.length < len) val.push(t.dataset.k); paint(); return; }
        if (t.dataset.a === 'back') { sfx('tap'); lockApi = null; ui.remove(); res(false); return; }
        if (t.dataset.a === 'ok') {
          const s = val.join('');
          if (s.length < len) { sfx('error'); msg.textContent = `請輸入 ${len} 位數字。`; return; }
          if (s === answer) { sfx('unlock'); msg.textContent = ''; ui.classList.add('ok'); await wait(700); lockApi = null; ui.remove(); res(true); return; }
          sfx('error'); show.classList.remove('shake'); void show.offsetWidth; show.classList.add('shake');
          msg.textContent = hints[Math.min(wrong, hints.length - 1)]; wrong++;
          if (!dial) { val = []; paint(); }
        }
      });
      lockApi = {
        reveal() {
          const i = [...Array(len).keys()].find(k => !revealed.has(k)); if (i == null) return false;
          revealed.add(i);
          if (dial) val[i] = +answer[i]; else { val = answer.slice(0, i + 1).split(''); }
          msg.textContent = `解析完成：第 ${i + 1} 位是 ${answer[i]}。`; paint(); return true;
        }
      };
      paint(); el.appendChild(ui);
    });
  }

  // ================= 流程 =================
  async function flow() {
    await resolveArt();
    paintSlots(); paintHud();
    bgm('lobby');
    await modal({ title: '劇情聲明', body: FICTION, width: 720, buttons: [{ label: '我知道了', kind: 'btn', value: true }] });
    if (!alive) return;

    // ---------- S01 研究室 ----------
    await chapter('從未消失的黃金', '一般關卡 G01　台灣・金瓜石'); S();
    setScene(bgImg('g01-study.webp', '因杜阿森的研究室：書桌、地圖與窗外的雨'), false);
    $(el, '#black').classList.remove('on'); await wait(900); S();
    await say('你來啦。有件事情，我想應該會讓你感興趣。', 'There you are. I have something I think you’ll find interesting.', 'ind'); S();
    await me('又是什麼奇怪的事情？', 'Another strange case?'); S();
    await say('呵呵……對歷史學家而言，世界上沒有奇怪的事情，只有尚未找到答案的問題。', 'Heh… To a historian, nothing is strange. There are only questions not yet answered.', 'ind'); S();
    await say('台灣有間黃金博物館，最近在整理一批舊礦場的歷史檔案。他們發現了一些不太尋常的紀錄。', 'The Gold Museum in Taiwan has been sorting old mining archives. They found some unusual records.', 'ind'); S();
    await me('什麼紀錄？', 'What kind of records?'); S();
    await say('第二次世界大戰期間，一批貨物從金瓜石礦場消失了。有人說是日軍私下轉移，也有人說，那些黃金至今仍藏在山裡。', 'During the Second World War, a shipment vanished from the Jinguashi mine. Some say the army moved it in secret. Others say the gold is still in the mountain.', 'ind'); S();
    await me('所以你要我去找黃金？', 'So you want me to find gold?'); S();
    await say('不。我要你去找真相。黃金博物館的館長已經同意讓你參與這次調查。至於報酬……他們會替你安排的。', 'No. I want you to find the truth. The museum’s director has agreed to let you join. As for payment… they’ll see to it.', 'ind'); S();
    await say('記住，歷史最有趣的地方，從來不是人們記錄了什麼，而是他們選擇留下什麼，又遺漏了什麼。', 'Remember: what makes history interesting is never what people recorded, but what they chose to leave, and what they left out.', 'ind'); S();

    setStep('調查桌上的資料', ['書桌上和牆上的照片、信封、報告都可以點開來看。'], ['photo', 'invite', 'report'], '研究室裡有三份資料：牆上的金瓜石舊照片、桌上的館長邀請函、攤開的礦山報告摘要。全部看過後，就能接受委託。');
    const s01 = [['photo', 624, 96, 152, 180, '金瓜石舊照片'], ['invite', 700, 548, 140, 48, '館長邀請函'], ['report', 470, 470, 330, 76, '礦山報告摘要']];
    bind('s01');
    setHs(s01);
    tip('點畫面上的物品就能調查。這一關不限時間。', { left: 180, top: 168 });
    await loop(async id => {
      if (!['photo', 'invite', 'report'].includes(id)) return;
      if (!got.has(id)) { got.add(id); absorb(id); sfx('pick'); }
      if (['photo', 'invite', 'report'].every(k => got.has(k))) return true;
    }); S();
    untip();
    await me('一九四五年二月十七日……報告上的紅字，特別圈起了這一天。', 'February 17, 1945… someone circled that date in red.'); S();
    const acc = html('<button type="button" class="btn serif-btn g01-accept" style="width:240px">接受委託</button>');
    el.appendChild(acc); setStep('接受委託', [], [], '');
    await new Promise(r => acc.addEventListener('click', () => { sfx('tap'); r(); })); S(); acc.remove();

    // ---------- S02 黃金博物館 ----------
    await fadeTo(() => { setScene(bgImg('g01-museum.webp', '雨後的黃金博物館'), false); setHs([]); }, 900); S();
    await sys(['台灣・金瓜石　黃金博物館'], 2000); S();
    await say('你就是因杜阿森教授推薦來的人吧？歡迎來到金瓜石。', 'You must be the one Professor Induasen recommended. Welcome to Jinguashi.', 'lin'); S();
    await me('教授只告訴我，這裡有一批消失的黃金。', 'The professor only told me there’s some missing gold here.'); S();
    await say('這件事其實已經流傳很久了。有人說當年日軍撤離時，把黃金藏進礦坑，也有人說早就運往日本。', 'That story has been around for a long time. Some say the gold was hidden in the mine when the army withdrew. Others say it was shipped to Japan long ago.', 'lin'); S();
    await say('不過，我們最近重新整理了一批戰時資料，發現有些地方對不上。你看，這是同一天的離站與到站紀錄。數字不一樣。', 'But we recently re-sorted some wartime records, and a few things don’t add up. Look: departures and arrivals for the same day. The numbers differ.', 'lin'); S();
    await me('會不會只是登記錯誤？', 'Couldn’t it just be a clerical error?'); S();
    await say('也許。但我們還找到一份沒有登記在正式目錄中的舊礦圖。圖上有一條路線，在其他版本裡完全不存在。', 'Perhaps. But we also found an old mine map that isn’t in the official catalogue. It shows a route that appears in no other version.', 'lin'); S();
    await me('你想讓我進去確認？', 'You want me to go in and check?'); S();
    await say('是的。我們已經安排調查許可與必要的安全協助。你只需要協助我們確認歷史檔案中的疑點。如果發現什麼，請務必告訴我。', 'Yes. Permits and safety support are arranged. Just help us verify the questions in the archive. And if you find anything, please tell me.', 'lin'); S();
    got.add('survey'); sfx('pick');
    await sys(['任務更新：前往本山六坑，查明異常的運輸紀錄。', '獲得「本山礦區調查資料」'], 2600); S();

    // ---------- S03 本山六坑入口：謎題① ----------
    bgm('g01mine');
    await chapter('本山六坑入口', 'S03'); S();
    await showPlace(ART.PLACES.s03); $(el, '#black').classList.remove('on'); await wait(700); S();
    let hasBar = false, chock = true, hasGrip = false, gripOn = false, thrown = false, cartLook = 0;
    bind('s03', () => ({ chock, hasBar, hasGrip, gripOn, thrown }));
    setHs([['cart', 450, 430, 380, 270, '礦車'], ['wheel', 640, 600, 110, 80, '車輪'], ['bar', 140, 240, 90, 220, '鐵撬棒'], ['crate', 880, 470, 240, 170, '破木箱'], ['switch', 210, 430, 160, 230, '轉轍器']]);
    const s03Hint = () => !hasBar ? '牆邊好像靠著一根鐵撬棒。' : chock ? '礦車的車輪底下卡著止輪器。選擇鐵撬棒「使用」，再點車輪。' : !hasGrip ? '右邊的破木箱裡，露出了一截手柄。' : !gripOn ? '轉轍器少了扳桿。把扳桿手柄裝上去。' : '拉動轉轍器的扳桿，礦車會沿著鐵軌滑進坑道。';
    const s03Hl = () => !hasBar ? ['bar'] : chock ? ['wheel'] : !hasGrip ? ['crate'] : ['switch'];
    setStep('移開擋住入口的礦車', [s03Hint], s03Hl, '入口被礦車擋住，礦車車輪被止輪器卡住。順序：撿起鐵撬棒 → 用撬棒撬掉止輪器 → 從破木箱拿出扳桿手柄 → 裝到轉轍器上 → 拉動扳桿，礦車會沿著鐵軌滑進坑道。');
    await me('這台礦車擋住入口了。', 'This mine cart is blocking the entrance.'); S();
    await loop(async (id, item) => {
      if (id === 'cart') { cartLook++; return void toast(chock ? '太重了，推不動。車輪底下還卡著東西。' : '先拉轉轍器，它會沿著鐵軌自己滑。'); }
      if (id === 'wheel') {
        if (!chock) return void await me('止輪器已經拿掉了。', 'The wheel chock is gone now.');
        if (item === 'bar') { sfx('pry'); svg('chock').style.opacity = 0; chock = false; await me('好了，現在應該能移動了。', 'There. It should move now.'); return; }
        return void await me('底下似乎卡住了什麼。', 'Something seems to be jammed underneath.');
      }
      if (id === 'bar') {
        if (hasBar) return;
        hasBar = true;
        await flyPickup('bar', 'bar', '鐵撬棒收進道具欄。');
        if (svg('bar')) svg('bar').style.opacity = '0';
        dropHs('bar');
        tip('點開道具欄裡的鐵撬棒，按「使用」，再點要撬的位置。', { left: 180, top: 168 });
        return;
      }
      if (id === 'crate') {
        if (hasGrip) return void toast('箱子裡已經空了。');
        hasGrip = true;
        await flyPickup('crate', 'grip', '扳桿手柄收進道具欄。');
        if (svg('grip')) svg('grip').style.opacity = '0';
        return;
      }
      if (id === 'switch') {
        if (!gripOn) {
          if (item === 'grip') { sfx('clang'); gripOn = true; dropItem('grip'); svg('lever').style.opacity = 1; await me('這樣就行了。', 'That should do it.'); return; }
          return void await me('扳桿少了一個手柄……', 'The lever is missing its handle…');
        }
        if (chock) return void await me('扳桿拉得動，但礦車還被卡著。', 'The lever moves, but the cart is still stuck.');
        thrown = true;
        if (stack.length) paintCu();
        const lever = svg('lever');
        if (lever) {
          lever.style.transition = 'transform .4s ease';
          lever.style.transformOrigin = '6% 50%';
          lever.style.transform = 'rotate(72deg)';
        }
        sfx('clang');
        await wait(420); S();
        closeStack();
        await wait(200); S();
        const c = svg('cart');
        if (c) {
          c.style.transformOrigin = '50% 78%';
          c.style.transition = 'transform 2.2s cubic-bezier(.25,.6,.2,1), opacity 2.2s ease';
          c.style.transform = 'translate(0px, -230px) scale(0.32)';
          c.style.opacity = '0';
        }
        sfx('whoosh');
        await wait(2300); S();
        await me('礦車沿著正前方的鐵軌滑進坑道，消失在裡面。', 'The cart follows the rails straight into the tunnel and fades into the dark.'); return true;
      }
    }); S();
    dropHs('cart');
    // 坑道裡一閃而過的 A.W.
    sfx('drip');
    await sys(['滴水聲在坑道裡迴盪，遠處傳來金屬的回音。'], 2200); S();
    const aw = svg('aw'); aw.style.transition = 'opacity 0.3s'; aw.style.opacity = 0.9; sfx('tinnitus'); await wait(500); aw.style.opacity = 0; S();
    await me('剛剛牆上……好像刻著「A.W.」？', 'On the wall just now… was that “A.W.”?'); S();

    // ---------- S04 礦工休息室：謎題② ----------
    await chapter('礦工休息室', 'S04'); S();
    await showPlace(ART.PLACES.s04); $(el, '#black').classList.remove('on'); await wait(700); S();
    const opened = new Set(); let gotPhotoA = false;
    bind('s04', () => ({ opened, hasBar, chock }));
    setHs([['board', 140, 100, 390, 300, '黑板'], ['note', 250, 490, 80, 40, '紙條'], ['lamp', 400, 70, 150, 160, '舊礦燈'], ['schedule', 280, 470, 200, 80, '班次表'], ['helmet', 70, 400, 180, 110, '礦工帽'], ['soaked', 200, 420, 150, 80, '泡水紀錄'], ['photoA', 190, 188, 168, 112, '舊照片'], ['books', 1090, 120, 160, 460, '書櫃'], ['lk1', 600, 168, 118, 380, '01 號鐵櫃'], ['lk2', 744, 168, 118, 380, '02 號鐵櫃'], ['lk3', 888, 168, 122, 380, '03 號鐵櫃']]);
    setStep('找出藏著線索的鐵櫃', ['桌上的班次表和牆上的紙條，暗示了該打開哪一個鐵櫃。', '紙條說，真正的數字是在「所有人都睡著後」記下的——那是哪一個班次？', '夜班的編號是 03。選擇鐵撬棒「使用」，撬開 03 號鐵櫃。'], ['schedule', 'note', 'lk3'], '班次表：早班 01、午班 02、夜班 03。紙條：「我們只在所有人都睡著後，才能記下真正的數字。」所有人都睡著＝夜班＝03 號鐵櫃，用鐵撬棒撬開它。');
    await me('這裡是礦工休息的地方……好像很久沒人來過了。', 'This must be where the miners rested… no one’s been here in ages.'); S();
    await loop(async (id, item) => {
      if (id === 'exit') return true;
      if (id === 'board') return void toast('黑板上只剩模糊的「安全第一」。');
      if (id === 'helmet') return void toast('礦工帽的燈早就壞了。');
      if (id === 'lamp') return void toast('礦燈裡的油乾了。');
      if (id === 'books') return void toast('書櫃上的紀錄泡過水，頁面黏成一塊。');
      if (id === 'soaked') return void toast('這份紀錄泡爛了，字跡全暈開。');
      if (id === 'note' || id === 'schedule') { fileHere(id); return; }
      if (id === 'photoA') {
        const fresh = fileHere('photoA');
        if (fresh) { gotPhotoA = true; await me('Arthur……A.W.？還有林清和，是台灣人的名字。', 'Arthur… A.W.? And Lin Qinghe—a Taiwanese name.'); }
        return;
      }
      if (id === 'journalRead') {
        if (!fileHere('journal')) return;
        await me('A.W.……亞瑟・威廉斯。原來入口牆上的字，是他留下的。', 'A.W.… Arthur Williams. So he left those letters at the entrance.'); S();
        await me('日誌上說，二月十七日的數字會告訴我答案。休息室還能再看看，然後去運礦站。', 'The journal says the numbers from February 17 will tell me. I can look around, then head to the loading station.'); S();
        setStep('前往運礦站', ['舊照片可以收進收藏。看完就前往運礦站。'], ['photoA'], '夜班鐵櫃已經打開，日誌收在檔案裡。可選：看看四人合照，再前往運礦站。');
        showExit('前往運礦站');
        return;
      }
      if (id.startsWith('lk')) {
        const n = id[2];
        if (opened.has(n)) return void await me(n === '3' ? (got.has('journal') ? '櫃子已經空了。' : '日誌還在架子上。') : '裡面只有破舊的工作服。', n === '3' ? (got.has('journal') ? 'The locker is empty.' : 'The journal is still on the shelf.') : 'Only some worn-out work clothes.');
        if (item !== 'bar') return void await me('上了鎖，門扣都鏽死了。', 'Locked. The latch has rusted shut.');
        sfx('pry'); opened.add(n); swingDoor(n);
        if (stack.length) paintCu();
        if (n !== '3') return void toast('裡面只有破舊的工作服。');
        sfx('door'); sfx('hum'); scene.classList.add('flick'); await wait(420); scene.classList.remove('flick'); S();
        await me('門開了。架子上有一本日誌。', 'The door is open. A journal sits on the shelf.');
        return;
      }
    }); S();

    // ---------- S05 六坑運礦站：謎題③ ----------
    await chapter('六坑運礦站', 'S05'); S();
    await showPlace(ART.PLACES.s05); $(el, '#black').classList.remove('on'); await wait(700); S();
    let solved3 = false, gravelOn = true, switchPeek = false;
    bind('s05', () => ({ solved3, gravelOn, switchPeek, hasBar }));
    setHs([['depart', 54, 392, 108, 80, '離站簿'], ['arrive', 158, 390, 108, 80, '到站簿'], ['scale', 900, 270, 220, 290, '磅秤'], ['board5', 700, 145, 300, 200, '登記板'], ['gravel', 510, 600, 240, 90, '鐵軌碎石'], ['swHandle', 568, 608, 120, 80, '轉轍手柄']]);
    setStep('找出消失的礦車數量', ['再比較一下兩份表格。', '離站與到站數量，應該一致才對。', '二月十七日的差異最明顯。離站 12 車，到站只有 9 車。'], ['depart', 'arrive', 'board5'], '比對離站簿與到站簿：只有 02/17 對不上，離站 12 車、到站 9 車，少了 3 車。在登記板輸入 3。');
    tip('打開兩本紀錄簿比對，找出數字對不上的那一天，再到登記板輸入消失的礦車數量。', { left: 280, top: 168 });
    await loop(async (id, item) => {
      if (id === 'depart' || id === 'arrive') {
        fileHere(id);
        return;
      }
      if (id === 'scale') return void toast('磅秤的指針卡死了，看不出重量。');
      if (id === 'gravel') {
        if (!solved3) return void await me('鐵軌旁堆著一些碎石。', 'Some loose gravel beside the track.');
        if (switchPeek) return void await me('碎石已經撥開一截，底下的手柄還卡著。', 'The gravel is pulled back. The handle underneath is still stuck.');
        sfx('pry'); gravelOn = false; switchPeek = true; fade('gravel', 0.28); fade('oldsw', 1);
        step.hl = ['swHandle']; armIdle(); flash(['swHandle']);
        await me('碎石鬆了，底下露出一截轉轍手柄。', 'The gravel gives. Part of a switch handle shows underneath.');
        return;
      }
      if (id === 'swHandle') {
        if (!switchPeek) return void await me('還埋在碎石裡。', 'It’s still buried in the gravel.');
        if (item !== 'bar') return void await me('手柄卡在碎石裡。用鐵撬棒撬它。', 'The handle is stuck in the gravel. Pry it with the crowbar.');
        sfx('pry'); fade('gravel', 0);
        await me('舊轉轍器通往一條封閉的側線。', 'The old switch leads to a sealed side line.'); return true;
      }
      if (id === 'board5') {
        if (solved3) return void await me('消失的，是三車貨物。', 'Three cartloads went missing.');
        if (!got.has('depart') || !got.has('arrive')) return void await me('先把兩本簿子打開，對過同一天的數字。', 'Open both books and compare the same dates.');
        untip();
        const ok = await numberLock({ len: 1, title: '消失的礦車數量', sub: '運量登記', answer: '3', hints: ['再比較一下兩份表格。', '離站與到站數量，應該一致才對。', '二月十七日的差異最明顯。'] }); S();
        if (!ok) return;
        solved3 = true; step.hints = ['鐵軌旁的碎石底下，好像藏著什麼。']; step.hl = ['gravel']; step.memo = '少了 3 車已經確認。檢查鐵軌旁的碎石，找出被掩蓋的舊轉轍器。'; hintLv = 0; armIdle();
        await me('二月十七日……正好是日誌上記載的日期。有三車貨物沒有抵達終點。', 'February 17… the very date in the journal. Three cartloads never reached their destination.'); S();
        await me('所以它們根本沒有被運出礦坑？', 'So they were never taken out of the mine?'); S();
        $(el, '#goal').textContent = '目標　檢查鐵軌';
      }
    }); S();

    // ---------- S06 封閉維修坑道：謎題④ ----------
    await chapter('封閉維修坑道', 'S06'); S();
    await showPlace(ART.PLACES.s06); $(el, '#black').classList.remove('on'); await wait(700); S();
    bind('s06');
    setHs([['A', 150, 300, 280, 300, 'A 正常出坑路線'], ['B', 470, 300, 290, 300, 'B 工具維修倉庫'], ['C', 820, 300, 270, 300, 'C 舊式升降井'], ['wall', 360, 80, 520, 150, '牆上的刻字']]);
    setStep('找出沒有被記錄的路線', ['先讀一讀牆上的刻字。', '出坑的有紀錄，入庫的有編號……哪一條路兩者都不是？', '「不升不出者」——不走出坑、也不進倉庫的，是舊式升降井 C。'], ['wall', 'C'], '刻字：「凡出坑者，皆有紀錄。凡入庫者，皆有編號。唯不升不出者，不留其名。」A 出坑有到站紀錄、B 入庫有編號，只有 C 舊式升降井不在帳本上。選 C。');
    await me('三條路……哪一條才是他們走的？', 'Three paths… which one did they take?'); S();
    await loop(async id => {
      if (id === 'wall') { addNote('wall', '刻字：凡出坑者皆有紀錄，凡入庫者皆有編號，唯不升不出者不留其名。'); return void toast('刻字已記下。出坑有紀錄，入庫有編號。'); }
      if (id === 'A') { sfx('error'); return void await me('出坑的每一車都會被登記……不是這裡。', 'Every cart leaving the pit gets logged… not this way.'); }
      if (id === 'B') { sfx('error'); return void await me('倉庫裡的東西都有編號……也不是這裡。', 'Everything in the store is numbered… not here either.'); }
      if (id === 'C') return true;
    }); S();
    await fadeTo(() => showPlace(ART.PLACES.s06b)); S();
    let cartIn = false, doorOpen = false, gotPhotoB = false;
    bind('s06b', () => ({ cartIn, doorOpen, hasBar }));
    setHs([['cart2', 30, 560, 250, 150, '礦車'], ['latch', 670, 290, 110, 80, '門扣'], ['door', 416, 146, 328, 422, '鐵門'], ['photo2', 780, 240, 140, 110, '門邊的照片']]);
    setStep('打開側線盡頭的鐵門', [() => !cartIn ? '先把礦車推進側線。' : '門扣鏽死了。選擇鐵撬棒「使用」，撬開門扣。'], () => (!cartIn ? ['cart2'] : ['latch']), '把礦車推進側線讓出通道，再用鐵撬棒撬開受損的門扣。門邊的照片可以看看。');
    await loop(async (id, item) => {
      if (id === 'cart2') {
        if (cartIn) return;
        cartIn = true; closeStack(); await wait(420); S();
        sfx('whoosh');
        const c = svg('cart2');
        if (c) {
          c.style.zIndex = '6';
          c.style.transformOrigin = '40% 90%';
          c.style.transition = 'transform 1.6s cubic-bezier(.25,.6,.2,1)';
          c.style.transform = 'translate(250px, -96px)';
        }
        await wait(1700); S();
        return void await me('礦車沿著左邊的鐵軌，朝鐵門滾過去，停在門前的軌道上。', 'The cart follows the left-hand rail and stops on the track in front of the door.');
      }
      if (id === 'photo2') {
        const fresh = fileHere('photoB');
        if (fresh) { gotPhotoB = true; await me('原來不只他一個人……他們到底想做什麼？', 'So he wasn’t alone… what were they trying to do?'); }
        return;
      }
      if (id === 'latch' || id === 'door') {
        if (doorOpen) return true;
        if (!cartIn) return void await me('礦車卡在軌道上，擋住了去路。', 'The cart is stuck on the track, blocking the way.');
        if (item !== 'bar') return void await me('門扣鏽死了，徒手打不開。', 'The latch is rusted shut. I can’t open it by hand.');
        sfx('pry'); await wait(200); sfx('door'); fade('latch', 0); doorOpen = true;
        const doorSp = svg('door');
        if (doorSp) { doorSp.style.transition = 'transform 0.8s ease'; doorSp.style.transformOrigin = '0% 50%'; doorSp.style.transform = 'perspective(900px) rotateY(52deg)'; }
        await me('門扣撬斷了。後面是一條往上的通道。', 'The latch snaps. A passage leads upward.'); S();
        setStep('穿過鐵門', ['點打開的鐵門，繼續往前走。'], ['door'], '鐵門已經打開，點它繼續前進。門邊的照片也可以看看。');
        return;
      }
    }); S();

    // ---------- S07 五坑舊運輸區：謎題⑤ ----------
    await chapter('五坑舊運輸區', 'S07'); S();
    await showPlace(ART.PLACES.s07); $(el, '#black').classList.remove('on'); await wait(700); S();
    let hasCtl = false, ctlOn = false, panelSeq = [];
    bind('s07', () => ({ hasCtl, ctlOn, hasBar, panelSeq }));
    setHs([['manual', 145, 200, 140, 160, '維修手冊'], ['panel', 44, 392, 168, 210, '控制盤'], ['rack', 960, 200, 260, 360, '工具架'], ['shaft', 400, 40, 420, 600, '升降井']]);
    setStep('啟動升降設備', [() => !hasCtl ? '工具架上有一支控制手柄。' : !ctlOn ? '把控制手柄裝到控制盤上。' : '照維修手冊上的順序操作控制盤。', '維修手冊：解除制動 → 接通電源 → 選擇上升。'], () => (!hasCtl ? ['rack'] : !ctlOn ? ['panel'] : ['manual', 'panel']), '從工具架拿控制手柄，裝到控制盤上。依維修手冊的順序：解除制動 → 接通電源 → 上升。');
    await me('這個升降井……究竟多久沒有人使用過了？', 'This lift shaft… how long since anyone used it?'); S();
    await loop(async (id, item) => {
      if (id === 'manual') { fileHere('manual'); return; }
      if (id === 'shaft') return void toast('鐵籠停在井底，上面一片漆黑。');
      if (id === 'rust') return void toast('剩下的工具都鏽壞了。');
      if (id === 'rack') {
        if (hasCtl) return void toast('剩下的工具都鏽壞了。');
        hasCtl = true;
        await flyPickup('rack', 'ctl', '控制手柄收進道具欄。');
        if (svg('grip2')) svg('grip2').style.opacity = '0';
        return;
      }
      if (id === 'panel') {
        if (!ctlOn) {
          if (item !== 'ctl') return void await me('控制盤上少了一支手柄。', 'The control panel is missing a handle.');
          sfx('clang'); ctlOn = true; dropItem('ctl');
          const handle = svg('ctl');
          if (handle) { handle.style.opacity = '1'; handle.style.left = '105px'; handle.style.top = '466px'; handle.style.width = '46px'; handle.style.height = '46px'; }
          return void await me('手柄嵌進左側的圓孔了。', 'The handle seats in the socket on the left.');
        }
        if (!id.startsWith('lev')) return void await me('三顆按鈕：左解除制動、右接通電源、下上升。', 'Three buttons: brake on the left, power on the right, up at the bottom.');
      }
      if (id.startsWith('lev')) {
        const key = id.slice(4);
        const order = ['brake', 'power', 'up'];
        sfx('clang');
        panelSeq = panelSeq.concat(key);
        const pip = scene.querySelector('#pip-' + key);
        if (pip) pip.classList.add('on');
        if (order[panelSeq.length - 1] !== key) {
          panelSeq = [];
          scene.querySelectorAll('.g01-pip').forEach(n => n.classList.remove('on'));
          return void await me('控制盤復位了。順序好像不對。', 'The panel reset. That order isn’t right.');
        }
        if (panelSeq.length === 3) return true;
        return void await me(panelSeq.length === 1 ? '制動解開了。' : '電源接通了。', panelSeq.length === 1 ? 'The brake is off.' : 'Power is on.');
      }
    }); S();
    // 上升與記憶旁白
    cine.classList.remove('hidden');
    cine.innerHTML = `<div class="g01-lift"><img src="${IMG('npc-arthur.webp')}" alt="" class="g01-ghost"><div class="g01-shaft"></div></div><div class="vignette"></div>`;
    sfx('whoosh'); await wait(1600); S();
    await say('我們不知道戰爭什麼時候結束……', 'We don’t know when the war will end…', 'arthur'); S();
    await say('但至少這一次，黃金不會再被他們帶走……', 'But at least this time, they won’t take the gold away…', 'arthur'); S();
    await sys(['（以上為依據日誌重建的想像，並非真實錄音）'], 1800); S();

    // ---------- S08 被遺忘的金庫：謎題⑥ ----------
    await chapter('被遺忘的金庫', 'S08'); S();
    cine.classList.add('hidden'); cine.innerHTML = '';
    await showPlace(ART.PLACES.s08); $(el, '#black').classList.remove('on'); await wait(700); S();
    let vaultOpen = false;
    bind('s08', () => ({ vaultOpen }));
    setHs([['words', 460, 172, 280, 36, '門上的英文刻字'], ['frame', 190, 150, 180, 450, '門框'], ['frame2', 840, 150, 180, 450, '門框'], ['lock', 500, 230, 190, 150, '機械鎖'], ['plate', 630, 460, 170, 90, '密碼牌']]);
    setStep('打開金庫的鐵門', ['日誌寫著：十二月十二日是他的生日。', '門框刻著：「當你忘記所有歸途，請記住我來到這世上的日子。」', '密碼牌是 MMDD。月份兩位、日期兩位。'], ['frame', 'plate', 'lock'], '門框要你記住他來到這世上的日子。日誌第一頁：12 月 12 日。密碼牌 MMDD＝月月日日。密碼是 1212。');
    await me('厚重的鐵門……還用鐵鍊鎖著。', 'A heavy iron door… chained shut.'); S();
    await loop(async (id, item) => {
      if (id === 'words') { addNote('words', '門上刻字：不為帝國，不為戰爭，只為那些未能歸來的人。'); return void toast('門上的句子已記下。'); }
      if (id === 'frame' || id === 'frame2') { addNote('frame', '門框：「當你忘記所有歸途，請記住我來到這世上的日子。」'); return void toast('門框上的句子已記下。'); }
      if (id === 'plate') { addNote('plate', '密碼牌：<b>MMDD</b>（月份兩位、日期兩位）。'); return void toast('密碼牌是 MMDD：月兩位、日兩位。'); }
      if (id === 'lock') {
        if (vaultOpen) return true;
        const ok = await numberLock({ len: 4, dial: true, title: '機械鎖', sub: '四位數密碼', answer: '1212', hints: ['不對。日誌寫著：十二月十二日是他的生日。', '不對。門框說：當你忘記所有歸途，請記住我來到這世上的日子。', '不對。密碼牌是 MMDD。月份兩位、日期兩位。'] }); S();
        if (!ok) return;
        vaultOpen = true; sfx('unlock'); fade('chain', 0); await revealBeat(); S(); sfx('door');
        const vault = svg('vault'); if (vault) { vault.style.transition = 'opacity 1.2s'; vault.style.opacity = '1'; }
        const door = svg('vaultDoor');
        if (door) {
          door.style.transition = 'transform 1.1s ease';
          door.style.transformOrigin = '0% 50%';
          door.style.transform = 'perspective(1100px) rotateY(58deg)';
          door.style.zIndex = '4';
        }
        fade('lockArt', 0); fade('plateArt', 0);
        await wait(1200); S();
        return true;
      }
    }); S();
    setHs([['crate', 420, 500, 400, 150, '木箱']]);
    setStep('打開木箱', ['箱蓋釘死了。選擇鐵撬棒「使用」，撬開木箱。'], ['crate'], '用鐵撬棒撬開木箱。');
    let crateOpen = false;
    bind('s08b', () => ({ crateOpen, hasBar }));
    await me('十幾只木箱……', 'A dozen wooden crates…'); S();
    await loop(async (id, item) => {
      if (id === 'crate') {
        if (crateOpen) return;
        if (item !== 'bar') return void await me('箱蓋釘死了。', 'The lid is nailed shut.');
        sfx('pry'); crateOpen = true; sfx('flash');
        await revealBeat();
        await me('……黃金。竟然真的在這裡。這麼多年來……從來沒有人發現？', '…Gold. It really is here. All these years… and no one ever found it?');
        return;
      }
      if (id === 'letterRead') {
        if (got.has('letter')) return void toast('信的影像已經在檔案裡。原信留在箱中。');
        await revealBeat();
        fileHere('letter');
        await me('所以……他們不是為了偷走黃金。而是為了不讓其他人帶走它。這麼多年來，它一直都在這裡。', 'So… they weren’t stealing the gold. They were keeping anyone else from taking it. All these years, it’s been right here.'); S();
        await me('你們的約定，我明白了。', 'I understand your promise.');
        closeStack();
        setStep('回報調查結果', [], [], '信已讀完。黃金與原信留在箱裡。');
        return true;
      }
      if (id === 'shut') {
        if (!got.has('letter')) return void await me('先看看夾在金條裡的那封信。', 'Read the letter tucked among the bars first.');
        sfx('door'); closeStack(); return true;
      }
    }); S();
    await sys(['不帶走黃金，也不記下金庫的精確位置。', '信件留在原處，只帶走一張照片。'], 2800); S();

    // ---------- S09 結語：回到博物館 ----------
    bgm('lobby');
    await fadeTo(() => { cine.classList.add('hidden'); cine.innerHTML = ''; setScene(bgImg('g01-museum.webp', '雨後的黃金博物館'), false); setHs([]); setStep('回報調查結果', [], [], ''); }, 1000); S();
    await say('你回來了！調查得怎麼樣？有發現什麼嗎？', 'You’re back! How did it go? Did you find anything?', 'lin'); S();
    await me('找到了一些東西。', 'I found a few things.'); S();
    await say('黃金呢？', 'And the gold?', 'lin'); S();
    await me('關於那些消失的運輸紀錄……我發現，當時有一段沒有列入正式清單的維修路線。那三車貨物很可能在運輸途中被轉移，所以才會出現數量不一致的情況。', 'About the missing records… there was a maintenance route that never made the official list. The three cartloads were likely diverted along it—which is why the numbers don’t match.'); S();
    await say('原來是這樣……所以，那批傳說中的黃金呢？', 'I see… so what about the legendary gold?', 'lin'); S();
    await me('沒有足夠的證據能證明那批貨物就是黃金。至於它們最終去了哪裡……恐怕已經無法確認了。', 'There’s not enough evidence that the cargo was gold. As for where it ended up… I’m afraid we can’t know.'); S();
    await say('看來這場流傳了幾十年的尋寶傳說，終究還是個謎。', 'So the treasure legend stays a mystery after all these decades.', 'lin'); S();
    await me('也許吧。', 'Perhaps.'); S();
    await say('不過還是非常感謝你。至少我們終於知道，當年的紀錄為什麼會出現問題。', 'Still, thank you. At least now we know why the records went wrong.', 'lin'); S();
    await me('不客氣。', 'You’re welcome.'); S();
    await say('如果以後還有類似的調查，希望能再次請你幫忙。', 'If anything like this comes up again, I hope we can count on you.', 'lin'); S();
    await me('有機會的話。', 'If the chance comes.'); S();
    await fadeTo(() => showPlace(ART.PLACES.ridge)); S();
    await say('有些寶藏，或許從來就不該被帶走。', 'Some treasures were perhaps never meant to be taken.', 'think'); S();

    // 黑幕標題
    $(el, '#black').classList.add('on'); await wait(900); S();
    const card = html('<div class="g01-card end"><div class="label">G01 CLEAR</div><h2>從未消失的黃金</h2><p>真相已揭曉・祕密仍留在山中。</p></div>');
    el.appendChild(card); await wait(3200); S();

    // 結算。金幣只在首次通關發放；收藏與檔案註記重玩時仍會補上。
    const dd = get();
    if (!dd.collection) dd.collection = [];
    dd.g01 = dd.g01 || { photoA: false, photoB: false, letter: false };
    dd.g01.photoA = dd.g01.photoA || gotPhotoA;
    dd.g01.photoB = dd.g01.photoB || gotPhotoB;
    dd.g01.letter = true;
    const upsert = (id, name, img, desc) => {
      const i = dd.collection.findIndex(c => c.id === id);
      if (i < 0) dd.collection.push({ id, name, img, desc });
      else dd.collection[i].desc = desc;
    };
    upsert('g01-letter', '亞瑟的最後一封信', 'it-letter.webp', '1945 年 3 月留在木箱裡的信，影像檔。原信留在原處，黃金沒有帶走。');
    if (dd.g01.photoA || dd.g01.photoB) {
      const bits = [];
      if (dd.g01.photoA) bits.push('休息室那張寫著 Arthur、Edward、Thomas、林清和');
      if (dd.g01.photoB) bits.push('側線那張背面寫著：黃金已經藏好了');
      upsert('g01-photo', '戰俘四人合照', 'it-photo.webp', bits.join('。') + '。');
    }
    const first = !replay && !dd.records.includes('g01');
    const collected = gotPhotoA && gotPhotoB;
    const rows = [];
    if (first) {
      rows.push(['首次通關', 500]);
      if (collected) rows.push(['戰俘檔案完整收集', 200]);
      if (!usedHelp) rows.push(['未使用提示道具', 100]);
      dd.coins += rows.reduce((s, r) => s + r[1], 0);
      dd.records.push('g01');
      taskDone('stage');
      sfx('coin');
    }
    save();
    const miss = [!gotPhotoA && '休息室的合照', !gotPhotoB && '側線鐵門旁的合照'].filter(Boolean);
    card.remove();
    const res = html(`<div class="modal-back" style="z-index:60"><div class="modal g01-clear" role="dialog" aria-label="破關結算" style="width:720px">
<div class="col" style="align-items:center;gap:8px"><div class="label">一般關卡 · G01</div><h2 style="font-size:40px;line-height:56px;letter-spacing:0.16em">破解完成</h2></div>
${first ? `<div class="col" style="align-self:stretch;gap:8px">${rows.map(([t, n]) => `<div class="g01-rw"><span>${t}</span><span class="row" style="gap:8px"><img src="${IMG('coin.webp')}" alt="遊戲幣" style="width:32px;height:32px"><b>×${n}</b></span></div>`).join('')}</div>
${miss.length ? `<p style="font-size:16px;line-height:24px;color:var(--muted)">戰俘檔案還沒收齊：${miss.join('、')}。再挑戰可以補看，獎勵只在首次通關結算。</p>` : ''}` : '<p>已破關的關卡再次挑戰，不會再獲得獎勵。</p>'}
<div style="align-self:stretch;height:1px;background:#4a302c"></div>
<p style="font-size:16px;line-height:24px">取得收藏「亞瑟的最後一封信」影像檔。原信與黃金都留在山裡，調查檔案不記載金庫的位置。</p>
<p style="font-size:14px;line-height:24px;color:var(--muted)">${FICTION}</p>
<div class="actions"><button type="button" class="btn-line" data-a="stages" style="width:208px">返回關卡選擇</button><button type="button" class="btn" data-a="lobby" style="width:208px">返回大廳</button></div></div></div>`);
    el.appendChild(res);
    const a = await new Promise(r => res.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b) { sfx('tap'); r(b.dataset.a); } })); S();
    go(a === 'lobby' ? 'lobby' : 'stages', a === 'lobby' ? {} : { tab: 1 });
  }

  // 升降控制盤：解除制動 → 接通電源 → 上升
  function liftPanel() {
    return new Promise(res => {
      const ORDER = ['brake', 'power', 'up'];
      let seq = [];
      const ui = html(`<div class="glock-back"><div class="glock gpanel"><div class="label">升降設備</div><h2>控制盤</h2>
<div class="gsw">${[['brake', '解除制動'], ['power', '接通電源'], ['up', '上升'], ['down', '下降']].map(([k, t]) => `<button type="button" class="gswitch" data-k="${k}"><i></i><span>${t}</span></button>`).join('')}</div>
<div class="glock-msg">依照維修手冊的順序操作。</div>
<div class="row" style="gap:16px;justify-content:center"><button type="button" class="btn-line" data-a="back" style="width:176px">返回</button></div></div></div>`);
      const msg = $(ui, '.glock-msg');
      ui.addEventListener('click', async e => {
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.a === 'back') { sfx('tap'); ui.remove(); res(false); return; }
        const k = b.dataset.k; if (!k || b.classList.contains('on')) return;
        sfx('clang'); b.classList.add('on'); seq.push(k);
        if (ORDER[seq.length - 1] !== k) {
          sfx('error'); msg.textContent = '控制盤復位了。順序好像不對。';
          await wait(700); $$(ui, '.gswitch').forEach(x => x.classList.remove('on')); seq = []; return;
        }
        if (seq.length === 3) { msg.textContent = '升降設備啟動。'; sfx('unlock'); await wait(900); ui.remove(); res(true); }
      });
      el.appendChild(ui);
    });
  }

  flow().catch(e => { if (e && e.message !== 'left') console.error(e); });
  return () => { alive = false; listeners = []; lockApi = null; };
}
