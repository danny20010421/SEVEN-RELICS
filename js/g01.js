// 一般關卡 G01「從未消失的黃金」：台灣・金瓜石（改版）
// 流程依《G01 劇情流程（改版）》：寬景直接操作，只有需要細看的物件才開近景；文件以紙張或冊子呈現。
export const FICTION = '本關以金瓜石的礦業史與戰俘強迫勞動為背景，寫成原創懸疑故事。亞瑟・威廉斯、藏金行動、封閉金庫與可重新啟動的升降設備皆為虛構，並非史實。真實封閉礦坑不可進入，請勿嘗試現地操作。';
import { get, save, taskDone } from './store.js';
import { sfx, bgm, applyVolume } from './audio.js';
import { html, $, $$, IMG, ICON, wait, esc, modal, toast, alertBox, fmt } from './ui.js';

const ITEMS = {
  bar: { name: '鐵撬棒', src: IMG('it-crowbar.webp'), desc: '靠在屋牆邊的鐵撬棒，扁口還很結實。', hint: '能撬開卡住或鏽死的東西。' },
  grip: { name: '扳桿手柄', src: IMG('it-grip.webp'), desc: '破木箱裡的金屬手柄，末端有卡榫。', hint: '轉轍器的扳桿少了一支手柄。' },
  fl: { name: '手電筒', src: IMG('it-flashlight.webp'), desc: '一支舊手電筒，換上自己帶的備用電池後還能亮。', hint: '對著黑暗的地方使用，就能照亮。' },
  ctl: { name: 'T 型手柄', src: IMG('it-handle.webp'), desc: '工具架上的 T 型手柄，握把磨得發亮。', hint: '形狀跟控制盤上的插座一樣。' },
};
const ICO = {
  hint: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d8b594" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"></path></svg>',
  file: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d8b594" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h9l4 4v14H6zM15 3v4h4M9 12h6M9 16h6"></path></svg>',
};

// ---------------- 文件 ----------------
// kind：letter（白紙）、sheet（黃褐紙）、book（攤開的冊子，左右兩頁）、plate（鐵牌）、photo（照片）
const LEDGER = [['02／15', 12, 12], ['02／16', 15, 15], ['02／17', 12, 9], ['02／18', 10, 10]];
const tab = (h, col) => `<table><tr><th>日期</th><th>${h}（車）</th></tr>${LEDGER.map(r => `<tr><td>${r[0]}</td><td>${r[col]}</td></tr>`).join('')}</table>`;
const entry = (d, t, p) => `<div class="d">${d}</div><h4>${t}</h4><p>${p}</p>`;
const DOCS = {
  photo: { title: '金瓜石舊照片', kind: 'photo', img: 'g01-oldphoto.webp', cap: '金瓜石礦坑內作業　日治時期' },
  invite: { title: '館長邀請函', kind: 'letter', body: '<p>因杜阿森教授台鑒：</p><p>本館近日整理戰時礦場檔案，發現數筆運輸紀錄前後不符，另有一份未列入正式目錄的舊礦圖。懇請教授推薦合適人選，協助釐清疑點。調查許可與安全協助，將由本館安排。</p><p class="r">黃金博物館　林館長　敬上</p>' },
  report: { title: '礦山報告摘要', kind: 'letter', body: '<h4>本山礦區運輸摘要　1945 年 2 月</h4><p>本月運輸作業大致正常，惟部分日期之離站、到站數量，待覆核。</p><p class="redpen">1945-02-17　運量對不上？</p>' },
  survey: { title: '本山礦區調查資料', kind: 'letter', body: '<h4>本山礦區調查資料</h4><p>六坑內有礦工休息室、運礦站與數條維修坑道。</p><p>另一份未列入目錄的舊圖上，多了一條通往上方坑道的路線。</p><p class="redpen">1945-02-17：同一天的離站與到站數量不一致。</p>' },
  schedule: { title: '班次表', kind: 'sheet', body: '<h4 class="c">班次表</h4><div class="subt">本山六坑　礦工休息室</div><table><tr><th>班次</th><th>時間</th><th>鐵櫃</th></tr><tr><td>早班</td><td>06 – 14 點</td><td>01</td></tr><tr><td>午班</td><td>14 – 22 點</td><td>02</td></tr><tr><td>夜班</td><td>22 – 06 點</td><td>03</td></tr></table><div class="note2">我們只在所有人都睡著後，才能記下真正的數字。</div>' },
  journal: { title: 'A. WILLIAMS 工作日誌', kind: 'book', spreads: [
    [entry('1944 年 12 月 12 日', '無法回家的生日', '今天是我的生日。十二月十二日。以前每年的這一天，母親都會準備一頓豐盛的晚餐。今年我只能在冰冷的礦坑裡度過。不知道明年的生日，我還能不能回家。'),
      entry('1945 年 2 月 15 日', '不屬於我們的財富', '今天我們發現一批被特殊封裝的金屬貨物，比普通礦石重得多。士兵不許我們查看，也沒把它們列進礦石清單。我懷疑那些箱子裡，是已經提煉好的黃金。')],
    [entry('1945 年 2 月 17 日', '三車貨物', '我們已經商量好了。三車貨物，不會抵達原本的終點。如果有人發現這本日誌，請記住今天的日期。數字會告訴你它們去了哪裡。'),
      entry('1945 年 2 月 21 日', '另一條路', '吳先生熟悉礦區所有的維修路線。他告訴我們，有一條舊升降路線通往上方的坑道，早就不在平常的運輸清單裡。或許我們還有機會。')],
    [entry('1945 年 2 月 28 日', '約定', '最後一批貨物已經安置好了。當所有人離開後，那裡不會再有人踏入。我不知道我們還能不能回來。但只要有人記得那一天，就能打開最後一道門。'), ''],
  ] },
  ledger: { title: '離站簿與到站簿', kind: 'book', spreads: [[`<h4>離站簿　1945 年 2 月</h4>${tab('離站', 1)}`, `<h4>到站簿　1945 年 2 月</h4>${tab('到站', 2)}`]] },
  photoA: { title: '戰俘合照', kind: 'photo', img: 'it-photo.webp', cap: 'Arthur　Edward　Thomas　吳清和' },
  photoB: { title: '四人合照（背面）', kind: 'photo', img: 'it-photo.webp', cap: '我希望我們四個人，都能活著回到這裡。' },
  manual: { title: '升降機操作須知', kind: 'plate', body: '<h4>升降機操作須知</h4><p>一、解除制動</p><p>二、接通電源</p><p>三、選擇上升或下降</p><p class="warn">三樓與四樓之間設有維修平台（3.5），一般運轉不停靠。</p><p class="warn">如需停靠：通過三樓後，拉下手動制動桿。</p>' },
  letter: { title: '亞瑟最後的信', kind: 'letter', body: '<p class="i">如果你正在讀這封信，代表我們成功了。</p><p class="i">我們不知道自己還能活多久。每天都有同伴倒下，而那些人只在乎明天還能挖出多少礦石。</p><p class="i">這些黃金足以讓我們任何一個人過上富裕的生活，但沒有人打算獨自帶走它們。我們決定把黃金藏在這裡，直到這場戰爭結束。若我們沒能回來，希望找到它們的人，能記住曾經在這座山裡受苦的人。</p><p class="i">黃金屬於活著的人，但請別忘了那些死去的人。願 H. Cole 和陳金水安息。</p><p class="i">如果有一天，這些黃金再次被人發現，我只希望它們不會成為下一場貪婪的開始。</p><p class="sig">Arthur Williams</p><p class="r">1945 年 3 月</p>' },
};
const DOC_ICON = { journal: 'it-journal.webp', letter: 'it-letter.webp', photoA: 'it-photo.webp', photoB: 'it-photo.webp', survey: 'it-survey.webp', ledger: 'it-ledger.webp', manual: 'it-manual.webp' };

export function render(st, params, go) {
  const replay = !!(params && params.replay);
  const d = get();
  const g = (d.player && d.player.gender) || 'm';
  const pname = (d.player && d.player.name) || '玩家';
  const el = html(`<div class="scr g01">
<div class="layer" id="scene"></div>
<div class="fill" id="hsLayer" style="z-index:3"></div>
<div class="g1-dark hidden" id="dark"></div>
<div class="fill hidden" id="cu" style="z-index:6"></div>
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
  <button type="button" class="iconbtn hud-big" id="hintBtn">${ICO.hint}<span>提示</span></button>
  <button type="button" class="iconbtn hud-big" id="fileBtn">${ICO.file}<span>檔案</span></button>
  <button type="button" class="iconbtn hud-big" id="setBtn">${ICON.gear.replace('<svg', '<svg width="24" height="24"')}<span>設定</span></button>
</div>
<div class="slots" id="slots" role="group" aria-label="臨時道具欄"></div>
<div class="black on" id="black"></div>
</div>`);
  st.appendChild(el);
  const scene = $(el, '#scene'), hsLayer = $(el, '#hsLayer'), cine = $(el, '#cine'), cu = $(el, '#cu'), dark = $(el, '#dark');
  let alive = true, listeners = [], inv = [], selected = null;
  let step = { goal: '', hints: [], hl: [], memo: '' }, hintLv = 0;
  const got = new Set();
  let usedHelp = false, compassUsed = 0, memoUsed = 0;
  let lockApi = null;
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
      b.addEventListener('click', () => { sfx('tap'); selected = selected === id ? null : id; paintSlots(); });
      s.appendChild(b);
    }
    const ban = $(el, '.use-banner'); if (ban) ban.remove();
    if (selected) el.appendChild(html(`<div class="use-banner"><div><img src="${ITEMS[selected].src}" alt="" style="width:32px;height:32px;object-fit:contain">「${ITEMS[selected].name}」${ITEMS[selected].hint}　點要使用的位置，再點一次道具就取消</div></div>`));
  }
  const addItem = id => { if (!inv.includes(id)) inv.push(id); sfx('pick'); paintSlots(id); };
  const dropItem = id => { inv = inv.filter(x => x !== id); if (selected === id) selected = null; paintSlots(); };

  // ---------- 場景、精靈圖、熱點 ----------
  // sprites：[id, 檔名, x, y, w, h, 額外樣式]
  function setScene(bg, alt, sprites = [], extra = '') {
    scene.innerHTML = `<img class="bg" src="${IMG(bg)}" alt="${alt}">` +
      sprites.map(([id, f, x, y, w, h, st = '']) => `<img class="g1-sp" id="${id}" src="${IMG(f)}" alt="" style="left:${x}px;top:${y}px;width:${w}px;${h ? `height:${h}px;` : ''}${st}">`).join('') + extra;
    hsLayer.innerHTML = '';
  }
  const sp = id => scene.querySelector('#' + id);
  const hide = id => { const n = sp(id); if (n) n.style.opacity = 0; };
  function setHs(list, layer = hsLayer) {
    if (layer === hsLayer) hsLayer.innerHTML = '';
    list.forEach(([id, x, y, w, h, label]) => {
      const b = html(`<button type="button" class="area" data-hs="${id}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px" aria-label="${label}"></button>`);
      b.addEventListener('click', ev => { ev.stopPropagation(); sfx('tap'); emit({ type: 'hs', id, item: selected }); });
      layer.appendChild(b);
    });
  }
  const dropHs = id => { const b = $(hsLayer, `[data-hs="${id}"]`); if (b) b.remove(); };
  async function loop(handler) {
    for (;;) {
      const a = await act(x => x.type === 'hs'); S();
      const used = a.item;
      const r = await handler(a.id, used); S();
      if (used && selected === used) { selected = null; paintSlots(); }
      if (r) return r;
    }
  }
  function exitBtn(label, id = 'exit') {
    const b = html(`<button type="button" class="btn-line g1-exit" data-exit="${id}">${label}</button>`);
    b.addEventListener('click', () => { sfx('tap'); emit({ type: 'hs', id, item: null }); });
    el.appendChild(b); return b;
  }

  // ---------- 近景（以物件為主，不出現立繪） ----------
  function openCu(inner, list = [], back = true) {
    cu.innerHTML = inner;
    if (back) {
      const b = html(`<button type="button" class="btn-line g1-cuback">${ICON.back}<span>返回</span></button>`);
      b.addEventListener('click', ev => { ev.stopPropagation(); sfx('tap'); emit({ type: 'hs', id: 'back', item: null }); });
      cu.appendChild(b);
    }
    setHs(list, cu);
    cu.classList.remove('hidden'); cu.classList.add('on'); hsLayer.classList.add('hidden'); dark.classList.add('cu-off');
  }
  function closeCu() { cu.classList.add('hidden'); cu.classList.remove('on'); cu.innerHTML = ''; hsLayer.classList.remove('hidden'); dark.classList.remove('cu-off'); lockApi = null; }
  const cuOpen = () => !cu.classList.contains('hidden');
  // 寬景局部放大：背景圖 + 位置
  const zoomBg = (bg, x0, y0, k, left, top) => `<div class="g1-zoom" style="background-image:url(${IMG(bg)});background-size:${1280 * k}px ${720 * k}px;background-position:${left - x0 * k}px ${top - y0 * k}px"></div>`;

  // ---------- 手電筒照明（S07、S08） ----------
  let lightOn = false, lightProbe = null;
  function setDark(on, mode = 'torch') {
    lightOn = on && mode !== 'pitch'; dark.classList.toggle('hidden', !on);
    dark.className = 'g1-dark ' + mode + (on ? '' : ' hidden');
    if (on) moveLight(640, 400);
  }
  function moveLight(x, y) { dark.style.setProperty('--lx', x + 'px'); dark.style.setProperty('--ly', y + 'px'); if (lightProbe) lightProbe(x, y); }
  el.addEventListener('pointermove', e => {
    if (!lightOn) return;
    const r = el.getBoundingClientRect(); const k = r.width / 1280;
    moveLight((e.clientX - r.left) / k, (e.clientY - r.top) / k);
  });
  el.addEventListener('pointerdown', e => {
    if (!lightOn) return;
    const r = el.getBoundingClientRect(); const k = r.width / 1280;
    moveLight((e.clientX - r.left) / k, (e.clientY - r.top) / k);
  }, true);

  // ---------- 對白 ----------
  const WHO = { me: pname, ind: '因杜阿森', lin: '林館長', arthur: '亞瑟・威廉斯' };
  function say(cn, en, who = 'me', opt = {}) {
    return new Promise(res => {
      const calm = !cuOpen() && cine.classList.contains('hidden') && !el.querySelector('.g1-docback');
      let pic = null;
      if (who === 'me' && calm && opt.pic !== false) pic = html(`<img class="portrait" src="${IMG(`hero-${g}${opt.pain ? '-pain' : ''}.webp`)}" alt="">`);
      if (who === 'ind' && calm) pic = html(`<img class="portrait npc" src="${IMG('npc-induasen.webp')}" alt="">`);
      if (who === 'lin' && calm) pic = html(`<img class="portrait npc" src="${IMG('npc-lin.webp')}" alt="">`);
      if (pic) el.appendChild(pic);
      const label = who === 'think' ? `${pname}（內心）` : who === 'arthur' ? '亞瑟・威廉斯（依日誌重建）' : (WHO[who] || '');
      const b = html(`<div class="sub${who === 'think' ? ' think' : ''}" role="button" tabindex="0" aria-label="點一下繼續"><div class="who"><span>${esc(label)}</span>${ICON.voice}</div><p class="cn">${cn}</p><p class="en">${en}</p>${ICON.down}</div>`);
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
  function tip(text, pos = { left: 360, top: 96 }) {
    untip();
    tipEl = html(`<div class="tip" style="left:${pos.left}px;top:${pos.top}px;width:${pos.width || 440}px"><div class="label">提示</div><p>${text}</p><div class="foot"><span></span><button type="button" class="btn sm" style="width:120px">知道了</button></div></div>`);
    tipEl.querySelector('.btn').addEventListener('click', () => { sfx('tap'); untip(); });
    el.appendChild(tipEl);
  }
  const untip = () => { if (tipEl) { tipEl.remove(); tipEl = null; } };

  // ---------- 目標、提示、備忘錄、閒置提示 ----------
  function setStep(goal, hints, hl, memo) {
    step = { goal, hints, hl, memo }; hintLv = 0;
    $(el, '#goal').textContent = '目標　' + goal;
    armIdle();
  }
  const hlIds = () => (typeof step.hl === 'function' ? step.hl() : step.hl) || [];
  function flash(ids, ms = 6000) {
    ids.forEach(id => el.querySelectorAll(`[data-hs="${id}"]`).forEach(b => { b.classList.add('show'); setTimeout(() => b.classList.remove('show'), ms); }));
  }
  let idleT = 0;
  function armIdle() {
    clearTimeout(idleT);
    idleT = setTimeout(() => { if (alive && !el.querySelector('.sub') && !el.querySelector('.modal-back')) flash(hlIds(), 2400); }, window.__G01_IDLE_MS || 38000);
  }
  el.addEventListener('pointerdown', armIdle);
  $(el, '#hintBtn').addEventListener('click', async () => {
    sfx('tap');
    if (!step.hints.length) { toast('這裡不需要提示，往下看劇情吧。'); return; }
    const dd = get();
    const ok = await modal({ title: '使用提示', body: '消耗鑽石，取得一個小幫助。', bodyHtml: `<div class="col" style="align-items:center;gap:4px"><div class="row" style="height:48px;gap:12px;font-size:18px"><span style="color:var(--text-2)">消耗</span><img src="${IMG('diamond.webp')}" alt="鑽石" style="width:40px;height:40px"><b style="font-size:24px">×1</b></div><div style="font-size:14px;line-height:24px;color:var(--muted)">目前持有 ${fmt(dd.diamonds)} 顆鑽石</div></div>`, buttons: [{ label: '取消', kind: 'btn-line', value: false }, { label: '使用提示', kind: 'btn', value: true }] });
    if (!ok || !alive) return;
    if (dd.diamonds < 1) { alertBox('鑽石不足', '鑽石不足，可以完成每日任務或前往儲值取得。'); return; }
    dd.diamonds -= 1; save(); usedHelp = true; sfx('hint');
    const h = step.hints[Math.min(hintLv, step.hints.length - 1)]; hintLv++;
    flash(hlIds());
    sys([typeof h === 'function' ? h() : h], 3600);
  });
  function paintHud() { const dd = get(); $(el, '#nCompass').textContent = dd.items.compass; $(el, '#nMemo').textContent = dd.items.memo; }
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
    const m = typeof step.memo === 'function' ? step.memo() : step.memo;
    if (memoUsed >= 1) { await modal({ title: '調查備忘錄', body: m, buttons: [{ label: '關閉', kind: 'btn', value: true }] }); return; }
    if (dd.items.memo < 1) { toast('沒有調查備忘錄了，可以到商城購買。'); return; }
    const ok = await modal({ title: '使用調查備忘錄', body: `自動整理目前的線索，直接告訴你下一步。<br><span style="font-size:16px;color:var(--muted)">每關限用 1 次　持有 ${dd.items.memo} 個</span>`, buttons: [{ label: '取消', kind: 'btn-line', value: false }, { label: '使用', kind: 'btn', value: true }] });
    if (!ok || !alive) return;
    dd.items.memo -= 1; memoUsed++; usedHelp = true; save(); paintHud(); sfx('hint');
    await modal({ title: '調查備忘錄', body: m, buttons: [{ label: '知道了', kind: 'btn', value: true }] });
  });

  // ---------- 文件：一張紙或一本冊子浮在場景上，點旁邊收起 ----------
  function docHtml(doc, page) {
    if (doc.kind === 'letter') return `<div class="g1-paper letter"><img src="${IMG('g01-paper-letter.webp')}" alt=""><div class="ink">${doc.body}</div></div>`;
    if (doc.kind === 'sheet') return `<div class="g1-paper sheet"><img src="${IMG('g01-paper-sheet.webp')}" alt=""><div class="ink">${doc.body}</div></div>`;
    if (doc.kind === 'plate') return `<div class="g1-plate">${doc.body}</div>`;
    if (doc.kind === 'photo') return `<div class="g1-photo"><img src="${IMG(doc.img)}" alt=""><p>${doc.cap}</p></div>`;
    if (doc.kind === 'ledgerpick') return docHtml(DOCS.ledger, 0);
    const [l, r] = doc.spreads[page]; const n = doc.spreads.length;
    return `<div class="g1-book"><img src="${IMG('g01-book.webp')}" alt=""><div class="pg l">${l}</div><div class="pg r">${r}</div>
${n > 1 ? `${page > 0 ? '<button type="button" class="turn prev" data-turn="-1">‹ 上一頁</button>' : ''}${page < n - 1 ? '<button type="button" class="turn next" data-turn="1">翻頁 ›</button>' : ''}` : ''}</div>`;
  }
  function readDoc(id) {
    return new Promise(res => {
      const doc = DOCS[id]; let page = 0;
      const m = html(`<div class="g1-docback" role="dialog" aria-label="${doc.title}"></div>`);
      const paint = () => { m.innerHTML = docHtml(doc, page) + '<div class="g1-dochint">點旁邊收起</div>'; };
      m.addEventListener('click', e => {
        const t = e.target.closest('[data-turn]');
        if (t) { sfx('tap'); page += +t.dataset.turn; paint(); return; }
        if (e.target.closest('.g1-paper,.g1-book,.g1-plate,.g1-photo') && doc.kind === 'book') return;
        sfx('tap'); m.remove(); res();
      });
      paint(); el.appendChild(m);
    });
  }
  async function getDoc(id) {
    const first = !got.has(id) && got.size === 0;
    got.add(id);
    await readDoc(id);
    if (first) toast('看過的文件會收進右上角的「檔案」，隨時可以重看。');
  }
  $(el, '#fileBtn').addEventListener('click', () => {
    sfx('tap');
    if (!got.size) { toast('還沒有取得任何文件。'); return; }
    const m = html(`<div class="modal-back" style="z-index:44"><div class="gdoc" role="dialog" aria-label="檔案"><div class="label">調查檔案</div><h2>已取得的文件</h2><div class="redline"></div>
<div class="gfiles">${[...got].map(id => `<button type="button" class="gfile" data-doc="${id}">${DOC_ICON[id] ? `<img src="${IMG(DOC_ICON[id])}" alt="" style="width:40px;height:40px;object-fit:contain">` : ICO.file}<span>${DOCS[id].title}</span></button>`).join('')}</div>
<button type="button" class="x" aria-label="關閉">${ICON.close}</button></div></div>`);
    m.addEventListener('click', e => {
      const b = e.target.closest('[data-doc]');
      if (b) { sfx('tap'); m.remove(); readDoc(b.dataset.doc); return; }
      if (e.target.closest('.x') || e.target === m) { sfx('tap'); m.remove(); }
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
    $(el, '#black').classList.add('on'); await wait(ms); S();
    untip(); closeCu(); el.querySelectorAll('.g1-exit').forEach(n => n.remove()); fn(); await wait(200); S();
    $(el, '#black').classList.remove('on'); await wait(ms); S();
  }
  async function chapter(title, sub, fn) {
    $(el, '#black').classList.add('on'); await wait(800); S();
    untip(); closeCu(); el.querySelectorAll('.g1-exit').forEach(n => n.remove());
    const b = html(`<div class="g01-card"><div class="label">${sub}</div><h2>${title}</h2></div>`);
    el.appendChild(b); await wait(1800); S(); b.remove();
    fn(); await wait(200); S();
    $(el, '#black').classList.remove('on'); await wait(700); S();
  }

  // ================= 流程 =================
  async function flow() {
    paintSlots(); paintHud();
    bgm('lobby');
    await modal({ title: '劇情聲明', body: FICTION, width: 720, buttons: [{ label: '我知道了', kind: 'btn', value: true }] }); S();

    // ---------- S01 研究室 ----------
    await chapter('從未消失的黃金', '一般關卡 G01　台灣・金瓜石', () => setScene('g01-study.webp', '因杜阿森的研究室：書桌、地圖與窗外的雨')); S();
    await say('你來啦。有件事情，我想應該會讓你感興趣。', 'There you are. I have something I think you’ll find interesting.', 'ind'); S();
    await me('又是什麼奇怪的事情？', 'Another strange case?'); S();
    await say('呵呵……對歷史學家而言，世界上沒有奇怪的事情，只有尚未找到答案的問題。', 'Heh… To a historian, nothing is strange. There are only questions not yet answered.', 'ind'); S();
    await say('台灣有間黃金博物館，最近在整理一批舊礦場的歷史檔案。他們發現了一些不太尋常的紀錄。', 'The Gold Museum in Taiwan has been sorting old mining archives. They found some unusual records.', 'ind'); S();
    await me('什麼紀錄？', 'What kind of records?'); S();
    await say('第二次世界大戰期間，一批貨物從金瓜石礦場消失了。有人說是日軍私下轉移，也有人說，那些黃金至今仍藏在山裡。', 'During the Second World War, a shipment vanished from the Jinguashi mine. Some say the army moved it in secret. Others say the gold is still in the mountain.', 'ind'); S();
    await me('所以你要我去找黃金？', 'So you want me to find gold?'); S();
    await say('不。我要你去找真相。黃金博物館的館長已經同意讓你參與這次調查。至於報酬……他們會替你安排的。', 'No. I want you to find the truth. The museum’s director has agreed to let you join. As for payment… they’ll see to it.', 'ind'); S();
    await say('記住，歷史最有趣的地方，從來不是人們記錄了什麼，而是他們選擇留下什麼，又遺漏了什麼。', 'Remember: what makes history interesting is never what people recorded, but what they chose to leave, and what they left out.', 'ind'); S();
    setStep('調查桌上的資料', ['書桌上和牆上的照片、信、報告都可以點開來看。'], ['photo', 'invite', 'report'], '研究室裡有三份資料：牆上的舊照片、桌上的館長邀請函、攤開的礦山報告。全部看過後，就能接受委託。');
    setHs([['photo', 624, 96, 152, 180, '金瓜石舊照片'], ['invite', 700, 548, 140, 48, '館長邀請函'], ['report', 470, 470, 330, 76, '礦山報告摘要']]);
    toast('點畫面上的物品就能調查。點道具欄的道具，再點目標就能使用。');
    const s01Talk = {
      photo: ['坑道裡鑿岩的礦工……他們大概沒想到，八十年後還有人在看這張照片。', 'Miners drilling in the tunnel… they never imagined anyone would look at this eighty years later.'],
      invite: ['未列入目錄的舊礦圖……有人刻意不讓它被登記？', 'A mine map left out of the catalogue… did someone keep it off the books on purpose?'],
      report: ['一九四五年二月十七日……有人用紅筆圈起這一天。', 'February 17, 1945… someone circled that date in red.'],
    };
    await loop(async id => {
      await getDoc(id); S();
      await me(...s01Talk[id]); S();
      if (['photo', 'invite', 'report'].every(k => got.has(k))) return true;
    }); S();
    untip();
    await me('運出去的和運到的對不上，差的那一點，就是我要找的東西。', 'What left and what arrived don’t match. That small gap is what I’m looking for.'); S();
    setStep('接受委託', [], [], '');
    const acc = html('<button type="button" class="btn serif-btn g01-accept" style="width:240px">接受委託</button>');
    el.appendChild(acc);
    await new Promise(r => acc.addEventListener('click', () => { sfx('tap'); r(); })); S(); acc.remove();

    // ---------- S02 黃金博物館 ----------
    await fadeTo(() => { setScene('g01-museum.webp', '雨後的黃金博物館'); }, 900); S();
    await sys(['台灣・金瓜石　黃金博物館'], 2000); S();
    await say('你就是因杜阿森教授推薦來的人吧？歡迎來到金瓜石。', 'You must be the one Professor Induasen recommended. Welcome to Jinguashi.', 'lin'); S();
    await me('教授只告訴我，這裡有一批消失的黃金。', 'The professor only told me there’s some missing gold here.'); S();
    await say('這件事其實已經流傳很久了。有人說當年日軍撤離時，把黃金藏進礦坑，也有人說早就運往日本。', 'That story has been around a long time. Some say the gold was hidden in the mine when the army withdrew. Others say it was shipped to Japan long ago.', 'lin'); S();
    await say('不過，我們最近重新整理了一批戰時資料，發現同一天的離站與到站紀錄，數字不一樣。', 'But we recently re-sorted some wartime records, and for the same day, departures and arrivals don’t match.', 'lin'); S();
    await me('會不會只是登記錯誤？', 'Couldn’t it just be a clerical error?'); S();
    await say('也許。但我們還找到一份沒有登記在正式目錄中的舊礦圖。圖上有一條路線，在其他版本裡完全不存在。', 'Perhaps. But we also found an old mine map that isn’t in the official catalogue. It shows a route no other version has.', 'lin'); S();
    await me('若只是登記錯誤，不會有人特地畫一份不列入目錄的圖。', 'A clerical error doesn’t explain someone drawing a map that was kept out of the catalogue.'); S();
    await say('工程隊上個月剛把幾條舊坑道的電恢復，方便調查，但裡面很多地方還沒人進去過。如果發現什麼，請務必告訴我。', 'The engineers restored power to a few old tunnels last month for the survey, but much of it hasn’t been entered yet. If you find anything, please tell me.', 'lin'); S();
    got.add('survey'); sfx('pick');
    await sys(['任務更新：前往本山六坑，查明異常的運輸紀錄。', '獲得「本山礦區調查資料」'], 2600); S();

    // ---------- S03 本山六坑入口 ----------
    bgm('g01mine');
    await chapter('本山六坑入口', 'S03', () => setScene('g01-s03.webp', '本山六坑入口，生鏽的礦車擋住坑口', [
      ['cart', 'g01-cart-rear.webp', 488, 330, 300, 0, 'z-index:2;transition:transform 2.2s ease-in,filter 2.2s ease-in,opacity 2.2s ease-in'],
      ['chock', 'g01-chock.webp', 716, 600, 64, 42, 'z-index:3'],
      ['bar', 'g01-crowbar.webp', 120, 450, 52, 170, 'z-index:2;transform:rotate(-10deg)'],
      ['grip', 'g01-grip.webp', 948, 492, 84, 60, 'z-index:2'],
      ['lever', 'g01-grip.webp', 246, 438, 88, 62, 'opacity:0;z-index:5;transform:rotate(-62deg);transform-origin:18% 82%'],
    ], '<div id="aw" class="g1-scratch" style="left:860px;top:236px;opacity:0">A.W.</div>')); S();
    let hasBar = false, chock = true, hasGrip = false, gripOn = false;
    setHs([['cart', 488, 330, 300, 270, '礦車'], ['wheel', 690, 560, 110, 90, '車輪'], ['bar', 100, 440, 100, 190, '鐵撬棒'], ['crate', 880, 470, 220, 170, '破木箱'], ['switch', 230, 430, 160, 230, '轉轍器']]);
    setStep('移開擋住入口的礦車', [() => !hasBar ? '屋牆邊靠著一根鐵撬棒。' : chock ? '車輪底下卡著止輪器。選擇鐵撬棒「使用」，再點車輪。' : !hasGrip ? '右邊的破木箱裡，露出一截手柄。' : !gripOn ? '轉轍器少了扳桿。把扳桿手柄裝上去。' : '拉動轉轍器的扳桿，礦車就會滑開。'],
      () => !hasBar ? ['bar'] : chock ? ['wheel'] : !hasGrip ? ['crate'] : ['switch'],
      '礦車被止輪器卡在下坡軌道上。順序：撿鐵撬棒 → 撬掉止輪器 → 從破木箱拿扳桿手柄 → 裝回轉轍器 → 拉下扳桿，礦車就會滑進坑道的支線。');
    await me('本山六坑……入口被一台礦車擋住了。', 'Shaft Six… a mine cart is blocking the entrance.'); S();
    await loop(async (id, item) => {
      if (id === 'cart') return void await me(chock ? '太重了，完全推不動。軌道是往裡面傾斜的……它本來應該會自己滑下去。' : '止輪器拿掉了，可是前面的軌道還沒扳過去。', chock ? 'Too heavy to push. The track slopes inward… it should roll down by itself.' : 'The chock is out, but the switch ahead isn’t thrown yet.');
      if (id === 'wheel') {
        if (!chock) return void await me('止輪器已經拿掉了。', 'The chock is gone.');
        if (item !== 'bar') return void await me('輪子底下卡著止輪器。空手拉不出來。', 'A wheel chock is jammed under the wheel. I can’t pull it out by hand.');
        sfx('pry'); hide('chock'); chock = false;
        return void await me('撬出來了。還是不動……前面的軌道是對著轉轍器合起來的。', 'It’s out. Still not moving… the track ahead is set by the switch.');
      }
      if (id === 'bar') { if (hasBar) return; hasBar = true; hide('bar'); dropHs('bar'); addItem('bar'); return void await me('這個或許派得上用場。', 'This might come in handy.'); }
      if (id === 'crate') { if (hasGrip) return void await me('箱子裡已經空了。', 'The crate is empty now.'); hasGrip = true; hide('grip'); addItem('grip'); return void await me('扳桿的手柄……末端的卡榫，剛好對得上。', 'A lever handle… the notch at its end should fit.'); }
      if (id === 'switch') {
        if (!gripOn) {
          if (item !== 'grip') return void await me('轉轍器的扳桿手柄不見了。', 'The switch lever is missing its handle.');
          sfx('clang'); gripOn = true; dropItem('grip'); sp('lever').style.opacity = 1;
          return void await me('裝上了。', 'It fits.');
        }
        if (chock) return void await me('扳桿拉得動，但礦車還被止輪器卡著。', 'The lever moves, but the cart is still chocked.');
        sfx('clang'); await wait(300); S();
        const c = sp('cart'); sfx('whoosh');
        c.style.transform = 'translate(66px,-118px) scale(0.32)'; c.style.filter = 'brightness(0.2)'; c.style.opacity = '0';
        await wait(2300); S(); sfx('clang');
        await me('坑道是往下的坡。扳過轉轍器，礦車就轉進裡面的支線……路讓出來了。', 'The tunnel slopes down. With the switch thrown, the cart turned off onto the inner siding… the way is clear.'); S();
        return true;
      }
    }); S();
    const aw = sp('aw'); aw.style.transition = 'opacity .3s'; aw.style.opacity = 1; sfx('tinnitus'); await wait(700); aw.style.opacity = 0; S();
    await me('剛剛牆上……好像刮著「A.W.」？是人名的縮寫嗎？', 'On the wall just now… was that “A.W.”? Someone’s initials?'); S();

    // ---------- S04 礦工休息室 ----------
    await chapter('礦工休息室', 'S04', () => setScene('g01-s04.webp', '礦工休息室，黑板、木桌與三座鐵櫃', [
      ['photoAart', 'it-photo.webp', 200, 175, 170, 120, 'z-index:4;object-fit:cover;box-shadow:0 10px 16px rgba(0,0,0,.55);transform:rotate(-2deg)'],
      ['lk1', 'g01-s04-locker.webp', 596, 162, 124, 388, 'z-index:2;object-fit:cover'],
      ['lk2', 'g01-s04-locker.webp', 724, 162, 124, 388, 'z-index:2;object-fit:cover'],
      ['lk3', 'g01-s04-locker.webp', 852, 162, 124, 388, 'z-index:2;object-fit:cover'],
    ], [1, 2, 3].map(i => `<div class="g1-engr lk" style="left:${596 + (i - 1) * 128 + 63}px;top:253px">0${i}</div>`).join(''))); S();
    let gotPhotoA = false;
    const opened = new Set();
    setHs([['board', 150, 125, 370, 250, '黑板'], ['photoA', 200, 175, 170, 120, '舊照片'], ['schedule', 278, 460, 160, 90, '桌上的紙'], ['helmet', 400, 385, 130, 70, '礦工帽'], ['lk1', 596, 162, 124, 388, '01 號鐵櫃'], ['lk2', 724, 162, 124, 388, '02 號鐵櫃'], ['lk3', 852, 162, 124, 388, '03 號鐵櫃']]);
    setStep('找出藏著線索的鐵櫃', ['桌上那張紙，暗示了該打開哪一座鐵櫃。', '「所有人都睡著後」——那是哪一個班次？', '夜班的編號是 03。靠近鐵櫃，用鐵撬棒撬開 03 號。'], () => (got.has('schedule') ? ['lk3'] : ['schedule']), '班次表：早班 01、午班 02、夜班 03。手寫字：「我們只在所有人都睡著後，才能記下真正的數字。」所有人都睡著＝夜班＝03 號鐵櫃，用鐵撬棒撬開它。');
    await me('礦工休息的地方……帽子、桌子都還在，好像人們只是暫時離開。', 'Where the miners rested… the helmets and table are still here, as if they just stepped out.'); S();
    await loop(async (id, item) => {
      if (id === 'back') { closeCu(); return; }
      if (id === 'board') return void await me('黑板上寫著「安全第一」。字跡已經模糊了。', 'The blackboard reads “Safety First.” The chalk has almost faded.');
      if (id === 'helmet') return void await me('一頂舊礦工帽，帽燈早就不亮了。', 'An old miner’s helmet. The lamp died long ago.');
      if (id === 'photoA') {
        await getDoc('photoA'); S();
        if (!gotPhotoA) { gotPhotoA = true; await me('三個英國名字，一個台灣名字……他們是一起的。', 'Three English names and one Taiwanese name… they were together.'); }
        return;
      }
      if (id === 'schedule') {
        const first = !got.has('schedule');
        await getDoc('schedule'); S();
        if (first) { await me('班次和鐵櫃編號是對應的。下面這行字，跟表格不是同一個人寫的。', 'The shifts match the locker numbers. The line at the bottom is in a different hand.'); S(); await me('所有人都睡著之後……那是半夜，是夜班的時間。', 'After everyone is asleep… that’s midnight. The night shift.'); }
        return;
      }
      if (id.startsWith('lk')) {
        const n = +id[2];
        if (opened.has(n)) return void await me(n === 3 ? '櫃子已經打開了。' : '只有舊工作服。', n === 3 ? 'It’s already open.' : 'Only old work clothes.');
        if (item !== 'bar') return void await me('鎖扣都鏽死了，要撬開才行。', 'The latch has rusted shut. I’ll need to pry it.');
        sfx('pry'); opened.add(n);
        sp('lk' + n).style.filter = 'brightness(.45)';
        if (n !== 3) return void await me('只有舊工作服。不是這一個。', 'Only old work clothes. Not this one.');
        sfx('door');
        await me('一本日誌……封面寫著「A. WILLIAMS」。', 'A journal… “A. WILLIAMS” on the cover.'); S();
        await getDoc('journal'); return true;
      }
    }); S();
    await me('A.W.……亞瑟・威廉斯。日治時期被押到金瓜石做苦工的英國戰俘，他就是其中一個。', 'A.W.… Arthur Williams. One of the British prisoners forced to labor at Jinguashi under Japanese rule.'); S();
    await me('日誌說，二月十七日的數字會告訴我答案。去運礦站看看。', 'The journal says the numbers from February 17 will tell me. To the loading station.'); S();

    // ---------- S05 六坑運礦站 ----------
    await chapter('六坑運礦站', 'S05', () => setScene('g01-s05.webp', '六坑運礦站，兩條軌道、磅秤與一塊舊黑板', [
      ['book1', 'g01-ledger.webp', 58, 400, 96, 64, 'z-index:3'],
      ['book2', 'g01-ledger.webp', 162, 398, 96, 64, 'z-index:3'],
      ['oldsw', 'g01-switch.webp', 568, 618, 108, 72, 'opacity:0;z-index:2'],
      ['gravel', 'g01-gravel.webp', 520, 608, 216, 72, 'z-index:4'],
    ])); S();
    let circled = false, rubbed = false;
    setHs([['ledger', 54, 390, 212, 82, '離站簿與到站簿'], ['scale', 900, 270, 220, 290, '磅秤'], ['board5', 740, 130, 270, 200, '舊黑板'], ['gravel', 510, 600, 240, 90, '鐵軌碎石']]);
    setStep('找出對不上的那一天', [() => !circled ? '翻開桌上的離站簿與到站簿，同一天的數字應該一樣。' : !rubbed ? '黑板上的粉筆灰底下，好像還有字。用手指把灰抹掉。' : '黑板上的箭頭指向鐵軌旁的碎石。', () => !circled ? '二月十七日：離站 12、到站 9。在冊子上點那一行。' : !rubbed ? '在黑板上來回滑動，把整片粉筆灰擦掉。' : '點鐵軌旁的碎石。'],
      () => (!circled ? ['ledger'] : !rubbed ? ['board5'] : ['gravel']),
      () => (!circled ? '翻開離站簿與到站簿，只有 02/17 對不上：離站 12 車、到站 9 車。在冊子上點 02/17 那一行圈起來。' : !rubbed ? '黑板被粉筆灰蓋住了。點黑板，用手指或滑鼠來回抹，擦出底下的字。' : '黑板上的箭頭指向鐵軌旁的碎石，點碎石。'));
    await me('礦車在這裡秤重、登記，再送出去。每一車都會留下紀錄。', 'Carts were weighed and logged here before leaving. Every load left a record.'); S();
    await loop(async id => {
      if (id === 'back') { closeCu(); return; }
      if (id === 'ledger') {
        got.add('ledger');
        if (circled) { await readDoc('ledger'); return; }
        const ok = await ledgerPick(); S();
        if (!ok) return;
        circled = true; hintLv = 0;
        $(el, '#goal').textContent = '目標　調查黑板';
        await me('二月十七日，離站十二車，到站只有九車。三車……跟日誌寫的一樣。', 'February 17: twelve carts left, only nine arrived. Three… just as the journal said.'); S();
        await me('如果貨在路上翻了，紀錄會寫「運失」。沒有寫，就代表有人讓它們從帳上消失了。', 'If cargo were lost on the way, it would be logged. It wasn’t. Someone erased it from the books.'); S();
        await me('那塊黑板……粉筆灰底下，好像還留著字。', 'That blackboard… there seems to be writing under the chalk dust.'); S();
        return;
      }
      if (id === 'scale') return void await me('磅秤的指針早就卡死了。', 'The scale’s needle is stuck fast.');
      if (id === 'board5') {
        if (rubbed) return void await me('「三車　→　舊側線」。箭頭指著鐵軌旁的碎石。', '“Three carts → old siding.” The arrow points at the gravel.');
        if (!circled) return void await me('一塊舊黑板，上面積滿了粉筆灰。', 'An old blackboard, thick with chalk dust.');
        const ok = await rubBoard(); S();
        if (!ok) return;
        rubbed = true; hintLv = 0;
        $(el, '#goal').textContent = '目標　檢查鐵軌';
        await me('夜班留下的字……「三車　→　舊側線」。只有在所有人睡著後，他們才敢寫下真正的數字。', 'Words left by the night shift… “Three carts → old siding.” Only when everyone slept did they dare write the real numbers.', { pic: false }); S();
        closeCu();
        await me('箭頭指著鐵軌旁那堆碎石。', 'The arrow points at that pile of gravel by the track.'); S();
        return;
      }
      if (id === 'gravel') {
        if (!rubbed) return void await me('鐵軌旁堆著一些碎石。', 'Some loose gravel beside the track.');
        sfx('pry'); hide('gravel'); sp('oldsw').style.opacity = 1; await wait(500); S();
        await me('碎石底下藏著一個舊轉轍器……有人刻意蓋住它。這條側線，不在任何一份圖上。', 'An old switch hidden under the gravel… someone covered it on purpose. This siding isn’t on any map.'); S();
        await me('三車貨物沒有離開礦坑，而是從這裡轉進去了。', 'The three loads never left the mine. They were switched off here.'); S();
        return true;
      }
    }); S();

    // ---------- S06 三岔路 ----------
    const fork = () => { setScene('g01-s06-fork.webp', '三條坑道的岔路口'); setHs([['A', 84, 210, 222, 300, '左邊的坑道'], ['B', 536, 180, 214, 300, '中間的坑道'], ['C', 972, 210, 170, 300, '右邊的坑道']]); };
    await chapter('封閉維修坑道', 'S06', fork); S();
    let seenA = false, gotPhotoB = false;
    setStep('選一條路', ['右邊是出坑的路，每一車都會被登記。', '左邊的支撐木比較新，先看看左邊。'], () => (seenA ? ['B'] : ['A']), () => (seenA ? '左邊是死路，十字架是有人為落盤罹難者立的墓。走中間那條。' : '右邊通往出坑口，每車都要登記，不會是藏貨的路。左邊的支撐木最新，有人修過，先走左邊。'));
    await me('側線通到一個三岔路口。三條坑道，軌道都還在。', 'The siding leads to a three-way fork. Rails run into all three.'); S();
    await me('右邊那條通往出坑口，每一車都要登記。要藏起三車貨，不會走那裡。', 'The right one leads out, where every cart is logged. Nobody hiding three loads would go that way.'); S();
    await me('左邊的支撐木是新的……礦場封閉後，還有人進來修過。先從左邊看看。', 'The left one has new timber… someone came back after the mine closed. I’ll check the left first.'); S();
    for (;;) {
      const a = await act(x => x.type === 'hs'); S();
      if (a.id === 'C') { await me('出坑的路，每一車都會被登記……不是這裡。', 'The way out—every cart gets logged. Not here.'); continue; }
      if (a.id === 'B' && !seenA) { await me('中間那條的軌道最舊……先確認左邊是誰修的。', 'The middle track is the oldest… first, I want to know who repaired the left one.'); continue; }
      if (a.id === 'A') {
        await fadeTo(() => setScene('g01-s06-left.webp', '塌陷的左坑道，一座纏著紅布的木十字架')); S();
        setHs([['cross', 245, 222, 176, 237, '十字架'], ['chest', 4, 429, 240, 122, '木箱']]);
        exitBtn('‹ 回到岔路口');
        await me('前面塌了……過不去。那修這裡的人，是來做什麼的？', 'It’s collapsed ahead… no way through. Then why did someone repair this?'); S();
        for (;;) {
          const b = await act(x => x.type === 'hs'); S();
          if (b.id === 'cross') {
            openCu(`<div class="g1-crossbg"></div><img class="g1-sp" src="${IMG('g01-cross.webp')}" alt="" style="left:380px;top:20px;width:520px"><div class="g1-carveh" style="left:640px;top:300px">H.COLE</div><div class="g1-carve" style="left:640px;top:326px">陳金水</div><div class="g1-carveh" style="left:640px;top:520px;font-size:12px">1945.1.9</div>`, [], false);
            await me('十字架上刻著名字……H. Cole，還有陳金水。都是一九四五年一月九日。', 'Names carved into the cross… H. Cole, and Chen Jinshui. Both January 9, 1945.'); S();
            await me('同一天……是落盤。英國戰俘和台灣礦工，死在同一個地方。', 'The same day… a cave-in. A British prisoner and a Taiwanese miner died in the same place.'); S();
            await me('原來修這條路，是為了替他們立一座墓。這不是礦場立的……是他們的同伴偷偷做的。', 'So the repairs were for a grave. The mine didn’t raise this… their companions did, in secret.'); S();
            closeCu(); seenA = true; continue;
          }
          if (b.id === 'chest') {
            await getDoc('photoB'); S();
            if (!gotPhotoB) { gotPhotoB = true; await me('他們知道，自己也可能躺在這裡。', 'They knew they might end up lying here too.'); S(); }
            continue;
          }
          if (b.id === 'exit') {
            if (!seenA) { await me('先看看那座十字架。', 'Let me look at that cross first.'); continue; }
            await me('這裡沒有路了。回去走中間那條。', 'No way on from here. Back to the middle path.'); S();
            await fadeTo(fork); S();
            break;
          }
        }
        continue;
      }
      if (a.id === 'B') break;
    }

    // ---------- S06-B 中坑道：幾乎全黑，用手電筒找出神秘通道 ----------
    await fadeTo(() => { setScene('g01-s06-mid.webp', '中間的坑道，一片漆黑', [
      ['flash', 'it-flashlight.webp', 560, 560, 130, 0, 'z-index:5;transform:rotate(-12deg)'],
    ], '<div id="aw2" class="g1-scratch" style="left:1000px;top:318px;opacity:0;z-index:5">A.W.</div>'); setDark(true, 'pitch'); }); S();
    let hasFl = false;
    setHs([['flash', 540, 530, 170, 110, '地上發亮的東西'], ['end', 380, 240, 260, 200, '軌道盡頭'], ['side', 880, 290, 160, 220, '岩壁']]);
    setStep('調查中間的坑道', [() => !hasFl ? '黑暗中，地上有個東西在反光。' : '移動手電筒的光，照遍整條坑道。', () => !hasFl ? '畫面下方中間，那個反光的東西。' : '右邊的岩壁後面，好像有一個缺口。'], () => (!hasFl ? ['flash'] : ['side']), '先撿起地上反光的手電筒。打開後，用滑鼠或手指移動光線，照到右邊岩壁的缺口，點它。');
    await me('好黑……什麼都看不見。', 'So dark… I can’t see a thing.', { pic: false }); S();
    await loop(async id => {
      if (id === 'end') return void await me(hasFl ? '落石把整條坑道堵死了。' : '前面黑漆漆的，伸手不見五指。', hasFl ? 'The rockfall has sealed the tunnel completely.' : 'Pitch black ahead.', { pic: false });
      if (id === 'flash') {
        if (hasFl) return;
        hasFl = true; hide('flash'); dropHs('flash'); addItem('fl');
        await me('一支舊手電筒……電池早就爛了。換上我帶的備用電池。', 'An old flashlight… the battery rotted long ago. I’ll swap in my spare.', { pic: false }); S();
        sfx('flash'); setDark(true, 'torch deep'); lightProbe = (x, y) => { const d = Math.hypot(x - 960, y - 400); sp('aw2').style.opacity = d < 230 ? Math.min(1, (230 - d) / 120) : 0; };
        toast('移動滑鼠或手指，用光照亮四周。');
        return;
      }
      if (id === 'side') {
        if (!hasFl) return void await me('太暗了，什麼也看不見。', 'Too dark to see anything.', { pic: false });
        moveLight(960, 400);
        await me('岩壁後面有一條小坑道……地上有礦車輪子壓過的痕跡。牆上，又是 A.W.。', 'A narrow passage behind the rock… cart-wheel ruts in the dirt. And on the wall, A.W. again.', { pic: false }); S();
        await me('三車貨物，就是從這裡推進去的。', 'This is where the three cartloads were pushed through.', { pic: false }); S();
        lightProbe = null;
        return true;
      }
    }); S();

    // ---------- S07 五坑舊運輸區 ----------
    await chapter('五坑舊運輸區', 'S07', () => { setScene('g01-s07-empty.webp', '五坑舊運輸區的空豎井，左邊是控制盤，右邊是工具架', [['ctlIn', 'it-handle.webp', 104, 438, 60, 60, 'opacity:0;z-index:3;object-fit:contain']]); setDark(true, 'torch'); }); S();
    let hasCtl = false, ctlOn = false, cageDown = false;
    const s07hs = () => setHs([['manual', 191, 207, 74, 114, '操作須知鐵牌'], ['panel', 46, 367, 168, 207, '控制盤'], ...(hasCtl ? [] : [['rack', 980, 190, 90, 90, '工具架上的手柄']]), cageDown ? ['cage', 498, 306, 237, 299, '鐵籠'] : ['shaft', 470, 60, 300, 520, '豎井']]);
    s07hs();
    setStep('啟動升降機', [() => !hasCtl ? '工具架上有一支 T 型手柄。' : !ctlOn ? '把 T 型手柄裝到控制盤中間的插座。' : '照鐵牌上的順序操作控制盤：解除制動 → 接通電源 → 下降。'], () => (!hasCtl ? ['rack'] : ['manual', 'panel']), '工具架上拿 T 型手柄，裝到控制盤中間的插座。照鐵牌順序：解除制動 → 接通電源 → 下降，把鐵籠叫下來。');
    await me('一座豎井……鐵籠不在這裡，停在上面某一層。', 'A shaft… the cage isn’t here. It’s stopped somewhere above.'); S();
    let panelSeq = [];
    const PANEL = { brake: [515, 438, '解除制動'], power: [770, 438, '接通電源'], down: [643, 526, '下降'] };
    const panelCu = () => openCu(zoomBg(hasCtl && ctlOn ? 'g01-s07-empty-nh.webp' : hasCtl ? 'g01-s07-empty-nh.webp' : 'g01-s07-empty.webp', 30, 350, 2.6, 302, -862 + 350 * 2.6) +
      `${ctlOn ? `<img class="g1-sp" src="${IMG('it-handle.webp')}" alt="" style="left:583px;top:292px;width:120px;height:120px;object-fit:contain">` : ''}` +
      Object.values(PANEL).map(([x, y, t]) => `<div class="g1-engr sm" style="left:${x}px;top:${y + 64}px">${t}</div>`).join('') +
      Object.entries(PANEL).map(([k, [x, y]]) => `<div class="g1-btnglow${panelSeq.includes(k) ? ' on' : ''}" style="left:${x}px;top:${y}px"></div>`).join(''),
      [['socket', 583, 292, 120, 120, '中間的插座'], ...Object.entries(PANEL).map(([k, [x, y, t]]) => [k, x - 56, y - 56, 112, 112, t])]);
    await loop(async (id, item) => {
      if (id === 'back') { closeCu(); return; }
      if (id === 'manual') { await getDoc('manual'); S(); return void await me('一般運轉不停靠的地方……就不會出現在任何運輸紀錄裡。', 'A level the lift never normally stops at… would never show up in any transport record.'); }
      if (id === 'shaft') return void await me('鐵籠停在上面。得先把它叫下來。', 'The cage is up there. I need to call it down.');
      if (id === 'rack') { hasCtl = true; scene.querySelector('img.bg').src = IMG('g01-s07-empty-nh.webp'); addItem('ctl'); s07hs(); return void await me('一支 T 型手柄……跟控制盤上的插座一樣形狀。', 'A T-shaped handle… the same shape as the socket on the panel.'); }
      if (id === 'panel') { panelCu(); return; }
      if (id === 'socket') {
        if (ctlOn) return;
        if (item !== 'ctl') return void await me('中間有個插座，少了一支手柄。', 'There’s an empty socket in the middle.');
        sfx('clang'); ctlOn = true; dropItem('ctl'); sp('ctlIn').style.opacity = 1; panelCu();
        return void await me('裝上了。', 'It fits.');
      }
      if (PANEL[id]) {
        if (!ctlOn) return void await me('按了沒有反應……中間的插座少了手柄。', 'Nothing happens… the socket in the middle needs a handle.');
        if (panelSeq.includes(id)) return;
        sfx('clang'); panelSeq.push(id); panelCu();
        if (['brake', 'power', 'down'][panelSeq.length - 1] !== id) { sfx('error'); await wait(500); panelSeq = []; panelCu(); return void await me('控制盤復位了。順序不對。', 'The panel reset. Wrong order.'); }
        if (panelSeq.length < 3) return;
        closeCu(); sfx('whoosh'); await wait(600); S();
        scene.querySelector('img.bg').src = IMG('g01-s07-cage-nh.webp'); cageDown = true; s07hs(); sfx('clang');
        await me('鐵籠下來了……日誌裡的吳先生說過，有一條舊升降路線通往上方的坑道。就是這個。', 'The cage is down… Mr. Wu in the journal spoke of an old lift route to the upper tunnels. This is it.'); S();
        setStep('搭乘升降機', ['點鐵籠進去。'], ['cage'], '進入鐵籠。');
        return;
      }
      if (id === 'cage') return true;
    }); S();

    // ---------- 鐵籠：停在 3.5 樓 ----------
    await fadeTo(() => { setDark(false); setScene('g01-lift.webp', '升降機鐵籠內部，右邊是樓層按鈕', [
      ['brake', 'it-handle.webp', 930, 380, 110, 110, 'z-index:3;object-fit:contain;transform:rotate(25deg);transition:transform .2s'],
    ], [5, 4, 3, 2].map(f => `<div class="g1-lglow" id="lf${f}" style="left:1120px;top:${{ 5: 165, 4: 200, 3: 237, 2: 270 }[f]}px"></div>`).join('')); $(el, '#slots').classList.add('hidden'); }); S();
    setHs([['lpanel', 1080, 77, 114, 352, '樓層按鈕'], ['brakeHs', 910, 360, 150, 150, '手動制動桿']]);
    setStep('停在 3.5 樓', ['鐵牌說：3.5 在三樓和四樓之間，過了三樓後拉下制動桿。', '按 4 往上，等三樓的燈亮過之後，馬上拉制動桿。'], ['lpanel', 'brakeHs'], '按 4 讓鐵籠上升。三樓的燈亮過、四樓的燈還沒亮之前，拉下手動制動桿，就會停在 3.5。');
    await me('按鈕只有 1 到 5。要停在 3.5，得在過了三樓之後，自己拉制動桿。', 'The buttons only go 1 to 5. To stop at 3.5, I have to pull the brake myself after passing three.'); S();
    let floor = 1, riding = false, stopped = false;
    const lights = () => [2, 3, 4, 5].forEach(f => $(el, '#lf' + f).classList.toggle('on', Math.floor(floor) === f));
    const LBTN = { 5: 205, 4: 266, 3: 338, 2: 405, 1: 477 };
    const liftCu = () => openCu(`<div class="g1-crossbg"></div><img class="g1-sp" src="${IMG('g01-lift-panel.webp')}" alt="" style="left:512px;top:50px;height:620px">`,
      Object.entries(LBTN).map(([f, y]) => [`f${f}`, 597, y - 28, 84, 56, `${f} 樓`]));
    let rideRes = null;
    async function ride() {
      riding = true; stopped = false; el.classList.add('g1-shake'); sfx('whoosh');
      const BL = a => {
        if (a.type !== 'hs' || a.id !== 'brakeHs' || stopped) return;
        if (floor < 3) { sfx('error'); toast('還沒過三樓。'); return; }
        stopped = true; sfx('clang'); sp('brake').style.transform = 'rotate(70deg)';
      };
      listeners.unshift(BL);
      for (const [f, ms] of [[2, 1300], [3, 1300], [3.5, 2200], [4, 0]]) {
        floor = f === 3.5 ? 3.2 : f; lights();
        if (f === 4) break;
        const t0 = Date.now();
        while (Date.now() - t0 < ms) { await wait(50); S(); if (stopped) break; }
        if (stopped) break;
      }
      listeners = listeners.filter(x => x !== BL);
      el.classList.remove('g1-shake'); riding = false;
      return stopped;
    }
    await loop(async id => {
      if (id === 'back') { closeCu(); return; }
      if (id === 'lpanel') { if (!riding) liftCu(); return; }
      if (id === 'brakeHs') {
        if (!riding) return void await me('制動桿……要在上升的途中拉。', 'The brake… I have to pull it while we’re moving.', { pic: false });
        if (floor < 3) { sfx('error'); toast('還沒過三樓。'); return; }
        stopped = true; sfx('clang'); sp('brake').style.transform = 'rotate(70deg)';
        return;
      }
      if (/^f\d$/.test(id)) {
        const f = +id[1]; closeCu();
        if (f === 1) return void await me('已經在一樓了。', 'We’re already on one.', { pic: false });
        if (f < 4) return void await me(`${f} 樓的出口被封死了。`, `The exit on ${f} is sealed.`, { pic: false });
        floor = 1; lights();
        const ok = await ride(); S();
        if (ok) return true;
        sfx('clang'); await me('四樓……門外是封死的岩壁。太遠了。', 'Four… a sealed rock wall outside. Too far.', { pic: false }); S();
        sfx('whoosh'); await sys(['鐵籠慢慢降回一樓。'], 1600); S();
        floor = 1; lights(); sp('brake').style.transform = 'rotate(25deg)';
      }
    }); S();
    el.classList.remove('g1-shake');
    cine.classList.remove('hidden');
    cine.innerHTML = `<img class="bg" src="${IMG('g01-lift.webp')}" alt="" style="filter:brightness(.45) sepia(.5)"><img src="${IMG('npc-arthur.webp')}" alt="" class="g01-ghost" style="height:820px;top:30px"><div class="vignette"></div>`;
    sfx('flash'); await wait(1200); S();
    await say('我們不知道戰爭什麼時候結束……', 'We don’t know when the war will end…', 'arthur'); S();
    await say('但至少這一次，黃金不會再被他們帶走。', 'But this time, they won’t take the gold.', 'arthur'); S();
    cine.classList.add('hidden'); cine.innerHTML = '';
    await me('一般運轉不停靠的地方……也就是沒有人會來的地方。', 'A level the lift never stops at… a place no one would ever come.', { pic: false }); S();
    $(el, '#slots').classList.remove('hidden');

    // ---------- S08 被遺忘的金庫 ----------
    await chapter('被遺忘的金庫', 'S08', () => { setScene('g01-s08-gate.webp', '緊鎖的鐵柵門，右邊牆上有一組密碼鎖'); setDark(true); }); S();
    setHs([['rock', 0, 140, 306, 396, '左邊的岩壁'], ['keypad', 1010, 264, 124, 152, '密碼鎖'], ['gate', 400, 140, 560, 460, '鐵柵門']]);
    let rockSeen = false;
    setStep('打開鐵柵門', ['日誌裡，好像有人提過某個特別的日子。', '左邊岩壁上的刻字：他最想回家的那一天。', '日誌第一篇：十二月十二日是亞瑟的生日。月份兩位、日期兩位。'], () => (rockSeen ? ['keypad'] : ['rock', 'keypad']), '日誌最後一篇：記得那一天，就能打開最後一道門。岩壁刻著「I want to go home」。日誌第一篇，亞瑟在生日（12 月 12 日）最想回家。密碼 1212。');
    await me('一道鐵柵門……裡面還有空間。', 'An iron gate… there’s space beyond it.'); S();
    await loop(async id => {
      if (id === 'back') { closeCu(); return; }
      if (id === 'gate') return void await me('鎖得很緊，搖不動。', 'Locked tight. It won’t budge.');
      if (id === 'rock') {
        openCu(`<img class="bg" src="${IMG('g01-s08-rock.webp')}" alt="岩壁上刻著 I want to go home">`);
        await me('「I want to go home」……我想回家。旁邊一道道刻痕，他在數日子。', '“I want to go home”… and tally marks beside it. He was counting days.'); S();
        await me('他在日誌第一頁寫過……在生日那天，最想回家。', 'He wrote it on the journal’s first page… on his birthday, he wanted most to go home.'); S();
        rockSeen = true; closeCu(); return;
      }
      if (id === 'keypad') {
        await me('四位數密碼。日誌最後一篇說，只要有人記得那一天，就能打開最後一道門。', 'Four digits. The last journal entry said whoever remembers that day can open the last door.', { pic: false }); S();
        const ok = await keypad(); S();
        if (!ok) return;
        return true;
      }
    }); S();
    sfx('unlock'); await wait(400); sfx('door');
    scene.querySelector('img.bg').src = IMG('g01-s08-open.webp');
    scene.insertAdjacentHTML('beforeend', `<img class="g1-sp" id="crates" src="${IMG('g01-crates.webp')}" alt="" style="left:520px;top:420px;width:300px;height:150px;opacity:.9">`);
    setHs([['crates', 500, 380, 340, 220, '木箱']]);
    await me('開了。他用自己的生日鎖住這裡……只有讀過日誌的人，才打得開。', 'It’s open. He locked it with his own birthday… only someone who read the journal could open it.'); S();
    setStep('打開木箱', ['木箱的蓋子釘死了。選擇鐵撬棒「使用」，再點木箱。'], ['crates'], '用鐵撬棒撬開木箱。');
    await me('十幾只木箱……', 'A dozen wooden crates…'); S();
    await loop(async (id, item) => {
      if (item !== 'bar') return void await me('箱蓋釘死了。', 'The lid is nailed shut.');
      sfx('pry'); return true;
    }); S();
    await fadeTo(() => { setDark(false); setScene('g01-s08-gold.webp', '打開的木箱裡，舊布包著金條'); setStep('讀信', [], [], ''); }); S();
    sfx('flash');
    await me('……黃金。竟然真的在這裡。這麼多年來，從來沒有人發現？', '…Gold. It really is here. All these years, and no one ever found it?'); S();
    await me('箱子裡還夾著一封信。', 'There’s a letter tucked in the crate.'); S();
    await getDoc('letter'); S();
    await me('H. Cole，陳金水……十字架上的名字。', 'H. Cole, Chen Jinshui… the names on the cross.'); S();
    await me('他們不是為了偷走黃金，而是不讓那些把人按在礦坑裡的人，再帶走它。', 'They weren’t stealing the gold. They were keeping it from the people who worked them to death underground.'); S();
    await me('你們的約定，我明白了。', 'I understand your promise.'); S();
    const shutBtn = html('<button type="button" class="btn serif-btn g01-accept" style="width:240px">關上木箱</button>');
    el.appendChild(shutBtn);
    await new Promise(r => shutBtn.addEventListener('click', () => { sfx('door'); r(); })); S(); shutBtn.remove();
    await sys(['不帶走黃金，也不記下金庫的精確位置。', '信留在原處，只帶走一份影像。'], 2800); S();

    // ---------- S09 結語 ----------
    bgm('lobby');
    await fadeTo(() => { setScene('g01-museum.webp', '雨後的黃金博物館'); setStep('回報調查結果', [], [], ''); }, 1000); S();
    await say('你回來了！調查得怎麼樣？有發現什麼嗎？', 'You’re back! How did it go? Did you find anything?', 'lin'); S();
    await me('找到了一些東西。', 'I found a few things.'); S();
    await say('黃金呢？', 'And the gold?', 'lin'); S();
    await me('關於那些消失的運輸紀錄……當時有一段沒有列入正式清單的維修路線。那三車貨物很可能在運輸途中被轉移，所以數字才會對不上。', 'About the missing records… there was a maintenance route never put on the official list. The three loads were likely diverted along it—that’s why the numbers don’t match.'); S();
    await say('原來是這樣……所以，那批傳說中的黃金呢？', 'I see… and the legendary gold?', 'lin'); S();
    await me('沒有足夠的證據能證明那批貨物就是黃金。至於它們最終去了哪裡……恐怕已經無法確認了。', 'There’s not enough evidence that the cargo was gold. As for where it went… I’m afraid we can’t know.'); S();
    await say('看來這場流傳了幾十年的尋寶傳說，終究還是個謎。不過還是非常感謝你，至少我們知道當年的紀錄為什麼會出問題。', 'So the legend stays a mystery. Still, thank you. At least we know why the records went wrong.', 'lin'); S();
    await me('不客氣。', 'You’re welcome.'); S();
    await fadeTo(() => setScene('g01-ridge.webp', '金瓜石的山霧')); S();
    await say('有些寶藏，或許從來就不該被帶走。', 'Some treasures were perhaps never meant to be taken.', 'think'); S();
    $(el, '#black').classList.add('on'); await wait(900); S();
    const card = html('<div class="g01-card end"><div class="label">G01 CLEAR</div><h2>從未消失的黃金</h2><p>真相已揭曉・祕密仍留在山中。</p></div>');
    el.appendChild(card); await wait(3200); S();

    // ---------- 結算 ----------
    const dd = get();
    if (!dd.collection) dd.collection = [];
    dd.g01 = dd.g01 || { photoA: false, photoB: false, letter: false };
    dd.g01.photoA = dd.g01.photoA || gotPhotoA; dd.g01.photoB = dd.g01.photoB || gotPhotoB; dd.g01.letter = true;
    const upsert = (id, name, img, desc) => { const i = dd.collection.findIndex(c => c.id === id); if (i < 0) dd.collection.push({ id, name, img, desc }); else dd.collection[i].desc = desc; };
    upsert('g01-letter', '亞瑟的最後一封信', 'it-letter.webp', '1945 年 3 月留在木箱裡的信，影像檔。原信留在原處，黃金沒有帶走。');
    if (dd.g01.photoA || dd.g01.photoB) upsert('g01-photo', '戰俘四人合照', 'it-photo.webp', [dd.g01.photoA && '休息室那張寫著 Arthur、Edward、Thomas、吳清和', dd.g01.photoB && '左坑道木箱裡那張背面寫著：我希望我們四個人，都能活著回到這裡'].filter(Boolean).join('。') + '。');
    const first = !replay && !dd.records.includes('g01');
    const collected = gotPhotoA && gotPhotoB;
    const rows = [];
    if (first) {
      rows.push(['首次通關', 500]);
      if (collected) rows.push(['戰俘檔案完整收集', 200]);
      if (!usedHelp) rows.push(['未使用提示道具', 100]);
      dd.coins += rows.reduce((s, r) => s + r[1], 0);
      dd.records.push('g01'); taskDone('stage'); sfx('coin');
    }
    save();
    const miss = [!gotPhotoA && '休息室的合照', !gotPhotoB && '左坑道木箱裡的合照'].filter(Boolean);
    card.remove();
    const res = html(`<div class="modal-back" style="z-index:60"><div class="modal g01-clear" role="dialog" aria-label="破關結算" style="width:720px">
<div class="col" style="align-items:center;gap:8px"><div class="label">一般關卡 · G01</div><h2 style="font-size:40px;line-height:56px;letter-spacing:0.16em">破解完成</h2></div>
${first ? `<div class="col" style="align-self:stretch;gap:8px">${rows.map(([t, n]) => `<div class="g01-rw"><span>${t}</span><span class="row" style="gap:8px"><img src="${IMG('coin.webp')}" alt="遊戲幣" style="width:32px;height:32px"><b>×${n}</b></span></div>`).join('')}</div>
${miss.length ? `<p style="font-size:16px;line-height:24px;color:var(--muted)">戰俘檔案還沒收齊：${miss.join('、')}。</p>` : ''}` : '<p>已破關的關卡再次挑戰，不會再獲得獎勵。</p>'}
<div style="align-self:stretch;height:1px;background:#4a302c"></div>
<p style="font-size:16px;line-height:24px">取得收藏「亞瑟的最後一封信」影像檔。原信與黃金都留在山裡。</p>
<div class="actions"><button type="button" class="btn-line" data-a="stages" style="width:208px">返回關卡選擇</button><button type="button" class="btn" data-a="lobby" style="width:208px">返回大廳</button></div></div></div>`);
    el.appendChild(res);
    const a = await new Promise(r => res.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b) { sfx('tap'); r(b.dataset.a); } })); S();
    go(a === 'lobby' ? 'lobby' : 'stages', a === 'lobby' ? {} : { tab: 1 });
  }

  // 冊子：直接點出對不上的那一天，紅筆圈起來
  function ledgerPick() {
    return new Promise(res => {
      const m = html(`<div class="g1-docback" role="dialog" aria-label="離站簿與到站簿">${docHtml(DOCS.ledger, 0)}<div class="g1-dochint" id="lph">點出兩邊對不上的那一天　點旁邊收起</div></div>`);
      const rows = m.querySelectorAll('.g1-book tr');
      rows.forEach((tr, i) => { if (i % 5 === 0) return; tr.classList.add('g1pick'); tr.dataset.r = (i % 5) - 1; });
      let done = false;
      const finish = async () => {
        done = true; lockApi = null; sfx('unlock');
        m.querySelectorAll('tr[data-r="2"]').forEach(tr => tr.classList.add('circled'));
        $(m, '#lph').textContent = '';
        await wait(1200); m.remove(); res(true);
      };
      m.addEventListener('click', e => {
        if (done) return;
        const tr = e.target.closest('tr[data-r]');
        if (tr) {
          sfx('tap');
          if (tr.dataset.r === '2') { finish(); return; }
          $(m, '#lph').textContent = '這一天，兩邊的數字一樣。'; return;
        }
        if (e.target.closest('.g1-book')) return;
        sfx('tap'); lockApi = null; m.remove(); res(false);
      });
      lockApi = { reveal() { if (done) return false; finish(); return true; } };
      el.appendChild(m);
    });
  }
  // 黑板：用手指或滑鼠抹掉粉筆灰，露出夜班留下的字
  function rubBoard() {
    return new Promise(res => {
      const k = 2.6, L = 239, T = 141, bx = 745, by = 136, W = 256 * k, H = 184 * k;
      openCu(zoomBg('g01-s05.webp', bx, by, k, L, T) +
        `<div class="g1-chalkmsg2" style="left:${L}px;top:${T}px;width:${W}px;height:${H}px"><p>2／17　夜班</p><p>離 12　→　到 9</p><p class="big">三車　→　舊側線</p><svg viewBox="0 0 120 120" class="arrow" aria-hidden="true"><path d="M60 6 C 54 46, 66 70, 60 108 M 40 88 L 60 110 L 80 86" fill="none" stroke="rgba(236,232,220,.8)" stroke-width="5" stroke-linecap="round"/></svg></div>` +
        `<canvas class="g1-dust" width="${Math.round(W)}" height="${Math.round(H)}" style="left:${L}px;top:${T}px;width:${W}px;height:${H}px"></canvas><div class="g1-kmsg" id="rbm">在黑板上來回抹，擦掉粉筆灰</div>`);
      const cv = $(cu, '.g1-dust'), cx = cv.getContext('2d');
      // 粉筆灰：一層不均勻的灰白抹痕
      // 粉筆灰：深淺不一的抹痕，邊緣自然淡出，不是一塊色塊
      for (let i = 0; i < 1400; i++) {
        const a = 0.02 + Math.random() * 0.07, v = 180 + Math.random() * 50 | 0, r = 8 + Math.random() * 46;
        cx.fillStyle = `rgba(${v},${v},${v - 6},${a})`;
        cx.beginPath(); cx.ellipse(40 + Math.random() * (cv.width - 80), 30 + Math.random() * (cv.height - 60), r * (1.5 + Math.random() * 2), r, (Math.random() - 0.5) * 0.6, 0, 7); cx.fill();
      }
      cx.globalCompositeOperation = 'destination-in';
      const fade = cx.createRadialGradient(cv.width / 2, cv.height / 2, Math.min(cv.width, cv.height) * 0.25, cv.width / 2, cv.height / 2, cv.width * 0.56);
      fade.addColorStop(0, 'rgba(0,0,0,1)'); fade.addColorStop(1, 'rgba(0,0,0,0)');
      cx.fillStyle = fade; cx.fillRect(0, 0, cv.width, cv.height);
      const base = cx.getImageData(0, 0, cv.width, cv.height).data; let base0 = 0;
      for (let i = 3; i < base.length; i += 4 * 97) if (base[i] > 30) base0++;
      cx.globalCompositeOperation = 'destination-out';
      let done = false, n = 0, down = false;
      const rub = e => {
        if (done) return;
        const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * cv.width / r.width, y = (e.clientY - r.top) * cv.height / r.height;
        const g = cx.createRadialGradient(x, y, 0, x, y, 54); g.addColorStop(0, 'rgba(0,0,0,0.9)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, 54, 0, 7); cx.fill();
        if (++n % 12 === 0) check();
      };
      const check = () => {
        const d = cx.getImageData(0, 0, cv.width, cv.height).data; let c = 0;
        for (let i = 3; i < d.length; i += 4 * 97) if (d[i] > 30) c++;
        if (c < base0 * 0.3) finish();
      };
      const finish = () => { done = true; lockApi = null; cv.style.transition = 'opacity .8s'; cv.style.opacity = 0; $(cu, '#rbm').textContent = ''; sfx('hint'); setTimeout(() => { off(); res(true); }, 900); };
      cv.addEventListener('pointerdown', e => { down = true; cv.setPointerCapture(e.pointerId); rub(e); });
      cv.addEventListener('pointermove', e => { if (down || e.pointerType === 'mouse') rub(e); });
      cv.addEventListener('pointerup', () => { down = false; check(); });
      lockApi = { reveal() { if (done) return false; finish(); return true; } };
      const L2 = a => { if (a.type === 'hs' && a.id === 'back' && !done) { off(); lockApi = null; closeCu(); res(false); } };
      const off = () => { listeners = listeners.filter(l => l !== L2); };
      listeners.unshift(L2);
    });
  }
  // 密碼鎖：直接按圖上的數字鍵，輸入的數字取代螢幕上的星號
  function keypad() {
    return new Promise(res => {
      let val = '', wrong = 0;
      const H = ['不對。日誌裡，好像有人提過某個特別的日子。', '不對。他最想回家的那一天……', '不對。月份兩位、日期兩位。'];
      const KEYS = { 1: [551, 260], 2: [643, 260], 3: [731, 260], 4: [551, 345], 5: [643, 345], 6: [731, 345], 7: [551, 425], 8: [643, 425], 9: [731, 425], 0: [643, 509] };
      const SLOT = [577, 620, 661, 704];
      const paint = () => { $(cu, '#lcd').innerHTML = [...val].map((c, i) => `<div class="g1-lcdpatch" style="left:${SLOT[i]}px;top:161px"></div><div class="g1-lcd" style="left:${SLOT[i]}px;top:161px">${c}</div>`).join(''); };
      openCu(`<img class="bg" src="${IMG('g01-s08-keypad-cu.webp')}" alt="密碼鎖"><div id="lcd"></div><div class="g1-kmsg" id="km"></div>`,
        Object.entries(KEYS).map(([k, [x, y]]) => [`k${k}`, x - 40, y - 40, 80, 80, k]));
      lockApi = { reveal() { const i = val.length; if (i >= 4) return false; val += '1212'[i]; paint(); $(cu, '#km').textContent = `解析完成：第 ${i + 1} 位是 ${'1212'[i]}。`; return true; } };
      const L = async a => {
        if (a.type !== 'hs') return;
        if (a.id === 'back') { off(); closeCu(); res(false); return; }
        if (!/^k\d$/.test(a.id)) return;
        sfx('key'); val += a.id[1]; paint();
        if (val.length < 4) return;
        if (val === '1212') { off(); sfx('unlock'); await wait(800); closeCu(); res(true); return; }
        sfx('error'); $(cu, '#km').textContent = H[Math.min(wrong, 2)]; wrong++;
        await wait(600); val = ''; paint();
      };
      const off = () => { listeners = listeners.filter(l => l !== L); };
      listeners.unshift(L);
    });
  }

  flow().catch(e => { if (e && e.message !== 'left') console.error(e); });
  return () => { alive = false; listeners = []; lockApi = null; clearTimeout(idleT); };
}
