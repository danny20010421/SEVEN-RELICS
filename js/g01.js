// 一般關卡 G01「從未消失的黃金」：台灣・金瓜石（改版）
// 流程依《G01 劇情流程（改版）》：寬景直接操作，只有需要細看的物件才開近景；文件以紙張或冊子呈現。
export const FICTION = '本關以金瓜石的礦業史與戰俘強迫勞動為背景，寫成原創懸疑故事。亞瑟・威廉斯、藏金行動、封閉金庫與可重新啟動的升降設備皆為虛構，並非史實。真實封閉礦坑不可進入，請勿嘗試現地操作。';
import { get, save, taskDone } from './store.js';
import { sfx, bgm, applyVolume } from './audio.js';
import { html, $, $$, IMG, ICON, wait, esc, modal, toast, alertBox, fmt } from './ui.js';

const ITEMS = {
  bar: { name: '鐵撬棒', src: IMG('it-crowbar.webp'), desc: '靠在屋牆邊的鐵撬棒，扁口還很結實。', hint: '能撬開卡住或鏽死的東西。' },
  grip: { name: '礦車扳桿', src: IMG('it-lever.webp'), desc: '木箱裡斜插著的一支鐵扳桿，底座有轉軸。', hint: '插到控制機上，扳下去就能放開礦車。' },
  fl: { name: '手電筒', src: IMG('it-flashlight.webp'), desc: '一支舊手電筒，換上自己帶的備用電池後還能亮。', hint: '對著黑暗的地方使用，就能照亮。' },
  tr: { name: '翻譯筆', src: IMG('it-translator.webp'), desc: '林館長給的翻譯筆，掃過英文就會顯示中文。', hint: '看英文文件時，點它就能翻譯。' },
  ctl: { name: '舊鑰匙', src: IMG('it-key.webp'), desc: '掉在十字架底下的舊鑰匙，柄上繫著一段紅布。', hint: '插進控制盤中間的鑰匙孔，轉動就能啟動。' },
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
 ], spreadsEn: [
    [entry('12 December 1944', 'A Birthday Far From Home', 'Today is my birthday. The twelfth of December. Every year on this day, Mother would cook a grand supper. This year I spend it in a cold mine. I wonder whether, by my next birthday, I shall be home.'),
      entry('15 February 1945', 'Wealth That Is Not Ours', 'Today we found a load of specially sealed metal cargo, far heavier than ore. The guards would not let us look, and it was never put on the ore list. I suspect those crates hold refined gold.')],
    [entry('17 February 1945', 'Three Carts', 'It is agreed. Three carts will not reach their destination. If anyone finds this journal, remember this date. The numbers will tell you where they went.'),
      entry('21 February 1945', 'Another Way', 'Mr Wu knows every maintenance route in the mine. He told us of an old lift line to the upper tunnels, long struck off the haulage lists. Perhaps we still have a chance.')],
    [entry('28 February 1945', 'The Promise', 'The last of the cargo is in place. Once we all leave, no one will set foot there again. I do not know if we will ever return. But whoever remembers that day can open the last door.'), ''],
  ] },
  ledger: { title: '離站簿與到站簿', kind: 'book', spreads: [[`<h4>離站簿　1945 年 2 月</h4>${tab('離站', 1)}`, `<h4>到站簿　1945 年 2 月</h4>${tab('到站', 2)}`]] },
  photoA: { title: '四人合照', kind: 'photo4', img: 'g01-photo4.webp' },
  photoB: { title: '四人合照（背面）', kind: 'photoback', img: 'g01-photo4-back.webp', cap: '我希望我們四個人，<br>都能活著回到這裡。<br><span>1944　冬</span>' },
  manual: { title: '升降機操作須知', kind: 'plate', body: '<h4>升降機操作須知</h4><p>一、解除制動</p><p>二、接通電源</p><p>三、選擇上升或下降</p><p class="warn">三樓與四樓之間設有維修平台（3.5），一般運轉不停靠。</p><p class="warn">如需停靠：同時按下 3 與 4。</p>' },
  letter: { title: '亞瑟最後的信', kind: 'letter', body: '<p class="i">如果你正在讀這封信，代表我們成功了。</p><p class="i">我們不知道自己還能活多久。每天都有同伴倒下，而那些人只在乎明天還能挖出多少礦石。</p><p class="i">這些黃金足以讓我們任何一個人過上富裕的生活，但沒有人打算獨自帶走它們。我們決定把黃金藏在這裡，直到這場戰爭結束。若我們沒能回來，希望找到它們的人，能記住曾經在這座山裡受苦的人。</p><p class="i">黃金屬於活著的人，但請別忘了那些死去的人。願 H. Cole 和陳金水安息。</p><p class="i">如果有一天，這些黃金再次被人發現，我只希望它們不會成為下一場貪婪的開始。</p><p class="sig">Arthur Williams</p><p class="r">1945 年 3 月</p>' },
};
const DOC_ICON = { journal: 'it-journal.webp', letter: 'it-letter.webp', photoA: 'g01-photo4.webp', photoB: 'g01-photo4-back.webp', survey: 'it-survey.webp', ledger: 'it-ledger.webp', manual: 'it-manual.webp' };

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
      b.addEventListener('click', () => { sfx('tap'); if (id === 'tr') { if (curTrans) curTrans(); else toast('看英文文件時，點翻譯筆就能翻譯。'); return; } selected = selected === id ? null : id; paintSlots(); });
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
  let lastPt = [640, 400];
  el.addEventListener('pointerdown', e => { const r = el.getBoundingClientRect(); const k = r.width / 1280; lastPt = [(e.clientX - r.left) / k, (e.clientY - r.top) / k]; }, true);
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
    if (step.free) { sfx('hint'); flash(hlIds()); const h0 = step.hints[Math.min(hintLv, step.hints.length - 1)]; hintLv++; sys([(typeof h0 === 'function' ? h0() : h0) + '（免費提示）'], 3600); return; }
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
  function docHtml(doc, page, lang = 'zh') {
    if (doc.kind === 'letter') return `<div class="g1-paper letter"><img src="${IMG('g01-paper-letter.webp')}" alt=""><div class="ink">${doc.body}</div></div>`;
    if (doc.kind === 'sheet') return `<div class="g1-paper sheet"><img src="${IMG('g01-paper-sheet.webp')}" alt=""><div class="ink">${doc.body}</div></div>`;
    if (doc.kind === 'plate') return `<div class="g1-plate">${doc.body}</div>`;
    if (doc.kind === 'photo') return `<div class="g1-photo"><img src="${IMG(doc.img)}" alt=""><p>${doc.cap}</p></div>`;
    if (doc.kind === 'photo4') return `<div class="g1-photo4"><img src="${IMG(doc.img)}" alt=""></div>`;
    if (doc.kind === 'photoback') return `<div class="g1-photo4 back"><img src="${IMG(doc.img)}" alt=""><p>${doc.cap}</p></div>`;
    if (doc.kind === 'ledgerpick') return docHtml(DOCS.ledger, 0);
    const sp2 = lang === 'en' && doc.spreadsEn ? doc.spreadsEn : doc.spreads;
    const [l, r] = sp2[page]; const n = sp2.length;
    return `<div class="g1-book${lang === 'en' && doc.spreadsEn ? ' en' : ''}"><img src="${IMG('g01-book.webp')}" alt=""><div class="pg l">${l}</div><div class="pg r">${r}</div>
${page > 0 ? '<div class="curl l"></div>' : ''}${page < n - 1 ? '<div class="curl r"></div>' : ''}</div>`;
  }
  let docLang = 'en', curTrans = null; // 亞瑟的日誌原文是英文；看文件時點道具欄的翻譯筆就會翻成中文
  function readDoc(id) {
    return new Promise(res => {
      const doc = DOCS[id]; let page = 0, scanning = false;
      const m = html(`<div class="g1-docback" role="dialog" aria-label="${doc.title}"></div>`);
      const multi = doc.kind === 'book' && doc.spreads.length > 1;
      const pen = doc.spreadsEn && inv.includes('tr');
      const paint = () => { m.innerHTML = docHtml(doc, page, docLang) + `<div class="g1-dochint">${pen ? (docLang === 'en' ? '點道具欄的翻譯筆翻譯　' : '再點翻譯筆看原文　') : ''}${multi ? '點書的右側翻頁，左側翻回　' : ''}點旁邊收起</div>`; };
      if (pen) {
        el.classList.add('g1-docopen');
        curTrans = () => {
          if (scanning) return;
          if (docLang === 'zh') { docLang = 'en'; paint(); return; }
          scanning = true; const bk0 = $(m, '.g1-book'); bk0.insertAdjacentHTML('beforeend', '<div class="g1-scan"></div>'); sfx('hint');
          setTimeout(() => { scanning = false; docLang = 'zh'; paint(); }, 900);
        };
      }
      const close = () => { curTrans = null; el.classList.remove('g1-docopen'); m.remove(); res(); };
      m.addEventListener('click', e => {
        const bk = e.target.closest('.g1-book');
        if (bk) {
          if (!multi) return;
          const r = bk.getBoundingClientRect(), right = e.clientX > r.left + r.width / 2;
          const np = page + (right ? 1 : -1);
          if (np < 0 || np >= doc.spreads.length) return;
          sfx('tap'); page = np; paint(); return;
        }
        sfx('tap'); close();
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
    const s01n = () => ['photo', 'invite', 'report'].filter(k => got.has(k)).length;
    setStep('調查研究室裡的資料　0／3', [() => `這個房間有 3 樣東西值得注意：牆上的照片、桌上的信、攤開的報告。還差 ${3 - s01n()} 樣。`], () => ['photo', 'invite', 'report'].filter(k => !got.has(k)), '研究室裡有三份資料：牆上的舊照片、桌上的館長邀請函、攤開的礦山報告。全部看過後，就能接受委託。');
    step.free = true;
    setHs([['photo', 624, 96, 152, 180, '金瓜石舊照片'], ['invite', 700, 548, 140, 48, '館長邀請函'], ['report', 470, 470, 330, 76, '礦山報告摘要']]);
    sys(['這個房間有 3 樣東西值得注意。', '找不到的話，右上角的「提示」這一關可以免費使用。'], 3600);
    const s01Talk = {
      photo: ['坑道裡鑿岩的礦工……他們大概沒想到，八十年後還有人在看這張照片。', 'Miners drilling in the tunnel… they never imagined anyone would look at this eighty years later.'],
      invite: ['未列入目錄的舊礦圖……有人刻意不讓它被登記？', 'A mine map left out of the catalogue… did someone keep it off the books on purpose?'],
      report: ['一九四五年二月十七日……有人用紅筆圈起這一天。', 'February 17, 1945… someone circled that date in red.'],
    };
    await loop(async id => {
      await getDoc(id); S();
      await me(...s01Talk[id]); S();
      $(el, '#goal').textContent = `目標　調查研究室裡的資料　${s01n()}／3`;
      if (s01n() === 3) return true;
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
    await say('對了，這個你帶著。礦場的舊文件有不少是英文寫的，有些是當年戰俘留下的。用這支翻譯筆掃過去，就看得到中文。', 'Oh, and take this. Many of the old mine papers are in English, some left by the prisoners. Scan them with this pen and you’ll see the Chinese.', 'lin'); S();
    await me('翻譯筆……謝謝，應該派得上用場。', 'A translation pen… thanks. It’ll come in handy.'); S();
    got.add('survey'); addItem('tr');
    await sys(['任務更新：前往本山六坑，查明異常的運輸紀錄。', '獲得「本山礦區調查資料」「翻譯筆」'], 2600); S();

    // ---------- S03 本山六坑入口 ----------
    bgm('g01mine');
    // 礦車正面圖：車輪落在軌道上（輪距 273px 對應背景軌距 232px）；溜下去時沿軌道中線往消失點縮小
    await chapter('本山六坑入口', 'S03', () => setScene('g01-s03.webp', '本山六坑入口，生鏽的礦車停在軌道上擋住坑口', [
      ['cart', 'g01-cart-front.webp', 537, 292, 307, 291, 'z-index:2;transform-origin:158px 288px;transition:transform 2.6s cubic-bezier(.45,0,.8,.6),filter 2.6s ease-in,opacity .8s ease-in 1.9s'],
      ['chock', 'g01-chock.webp', 786, 556, 58, 39, 'z-index:3'],
      ['bar', 'g01-crowbar.webp', 176, 396, 52, 170, 'z-index:2;transform:rotate(-8deg)'],
    ], `<div class="g1-clip" style="left:960px;top:230px;width:240px;height:222px"><img id="grip" class="g1-sp" src="${IMG('g01-lever.webp')}" alt="" style="left:119px;top:60px;width:22px;height:240px;transform-origin:50% 100%;transform:rotate(-30deg)"></div>
<div class="g1-clip" style="left:100px;top:300px;width:300px;height:222px"><img id="lever" class="g1-sp" src="${IMG('g01-lever.webp')}" alt="" style="left:163px;top:57px;width:18px;height:190px;opacity:0;transform-origin:50% 87%;transition:transform .6s ease,opacity .3s"></div>`)); S();
    let hasBar = false, chock = true, hasGrip = false, gripOn = false, rolled = false;
    setHs([['cart', 537, 292, 307, 291, '礦車'], ['wheel', 760, 520, 120, 90, '車輪'], ['bar', 130, 380, 120, 200, '鐵撬棒'], ['crate', 940, 260, 280, 360, '木箱'], ['ctrl', 260, 380, 210, 260, '控制機']]);
    setStep('移開擋住入口的礦車', [() => !hasBar ? '小屋牆邊靠著一根鐵撬棒。' : chock ? '車輪底下卡著止輪器。點道具欄的鐵撬棒，再點車輪。' : !hasGrip ? '右邊的木箱裡斜插著一支扳桿。' : !gripOn ? '左下角齒輪機上有個孔，把扳桿插進去。' : '把扳桿往左下扳。'],
      () => !hasBar ? ['bar'] : chock ? ['wheel'] : !hasGrip ? ['crate'] : ['ctrl'],
      '礦車被止輪器卡在往下的軌道上。順序：撿鐵撬棒 → 撬掉車輪下的止輪器 → 從右邊木箱拿扳桿 → 插到左下角的控制機 → 扳下扳桿，礦車就會順著軌道溜進坑道。');
    await me('本山六坑……入口被一台礦車擋住了。', 'Shaft Six… a mine cart is blocking the entrance.'); S();
    const awCu = async () => {
      openCu(`<img class="bg" src="${IMG('g01-aw-cu.webp')}" alt="岩壁上刻著 A.W.">`, [], false);
      await me('「A.W.」……刻痕很深，是用工具一筆一筆鑿出來的。是人名的縮寫嗎？', '“A.W.”… cut deep, stroke by stroke with a tool. Someone’s initials?', { pic: false }); S();
      closeCu();
    };
    await loop(async (id, item) => {
      if (id === 'aw') { await awCu(); return true; }
      if (id === 'cart') return void await me(chock ? '太重了，推不動。軌道往坑裡斜……車輪底下卡著東西。' : '止輪器拿掉了，可是控制機還鎖著車。', chock ? 'Too heavy to push. The track slopes inward… something is jammed under the wheel.' : 'The chock is out, but the control is still holding the cart.');
      if (id === 'wheel') {
        if (!chock) return void await me('止輪器已經拿掉了。', 'The chock is gone.');
        if (item !== 'bar') return void await me('輪子底下卡著止輪器。空手拉不出來。', 'A wheel chock is jammed under the wheel. I can’t pull it out by hand.');
        sfx('pry'); hide('chock'); chock = false;
        return void await me('撬出來了。車子還是被控制機鎖住……那台機器少了扳桿。', 'It’s out. The cart is still held by that machine… it’s missing its lever.');
      }
      if (id === 'bar') { if (hasBar) return; hasBar = true; hide('bar'); dropHs('bar'); addItem('bar'); return void await me('這個或許派得上用場。', 'This might come in handy.'); }
      if (id === 'crate') { if (hasGrip) return void await me('箱子裡已經空了。', 'The crate is empty now.'); hasGrip = true; hide('grip'); addItem('grip'); return void await me('一支礦車扳桿……底座的轉軸，應該插得進左邊那台控制機。', 'A mine-cart lever… its pivot base should fit that control machine on the left.'); }
      if (id === 'ctrl') {
        if (!gripOn) {
          if (item !== 'grip') return void await me('一台生鏽的齒輪機，齒輪旁邊有個孔，少了扳桿。', 'A rusted control machine with an empty socket. Its lever is missing.');
          sfx('clang'); gripOn = true; dropItem('grip'); sp('lever').style.opacity = 1;
          return void await me('插進齒輪旁的孔裡了，卡得很緊。往左下扳應該就行。', 'It’s in, and it fits tight.');
        }
        if (chock) return void await me('扳桿扳不下去……礦車的輪子還被止輪器卡著。', 'The lever won’t go… the wheel is still chocked.');
        if (rolled) return;
        sp('lever').style.transform = 'rotate(-40deg)'; sfx('clang'); await wait(500); S();
        const c = sp('cart'); sfx('whoosh');
        c.style.transform = 'translate(-8px,-125px) scale(.48)'; c.style.filter = 'brightness(.15)'; c.style.opacity = '0';
        await wait(2700); S(); sfx('clang'); rolled = true; dropHs('cart'); dropHs('wheel');
        await me('坑道是往下的坡。煞車一放，礦車就順著軌道溜進去了……路讓出來了。', 'The tunnel slopes down. With the brake released, the cart rolled away down the track… the way is clear.'); S();
        await me('嗯？礦車原本擋著的岩壁……那裡好像刻著什麼……', 'Hm? On the rock the cart was hiding… something seems to be carved there…', { pic: false }); S();
        setHs([['aw', 920, 260, 160, 150, '岩壁']]);
        setStep('調查右邊的岩壁', ['點右邊木箱上方的岩壁。'], ['aw'], '點右邊木箱上方的岩壁，看看刻了什麼。');
        flash(['aw'], 5000); toast('點右邊的岩壁看看。');
      }
    }); S();

    // ---------- S04 礦工休息室 ----------
    // 背景本身就有三座鐵櫃；03 號原本敞開，用同一張背景裡 02 號的門補成關著的門。照片是釘在黑板角落的一張小照片。
    await chapter('礦工休息室', 'S04', () => setScene('g01-s04.webp', '礦工休息室，黑板、木桌與三座鐵櫃', [
      ['door3', 'g01-s04-door3.webp', 828, 164, 104, 388, 'z-index:2'],
    ], [[652, '01'], [768, '02'], [880, '03']].map(([x, t]) => `<div class="g1-engr lk" style="left:${x}px;top:258px">${t}</div>`).join(''))); S();
    let gotPhotoA = false;
    const opened = new Set();
    setHs([['board', 150, 115, 320, 240, '黑板'], ['schedule', 230, 452, 265, 100, '桌上攤開的紙'], ['helmet', 385, 380, 130, 80, '礦工帽'], ['manual4', 515, 440, 200, 80, '泡水的冊子'], ['lk1', 598, 165, 106, 280, '01 號鐵櫃'], ['lk2', 712, 165, 108, 390, '02 號鐵櫃'], ['lk3', 828, 164, 104, 388, '03 號鐵櫃']]);
    setStep('找出藏著線索的鐵櫃', ['桌上那張攤開的紙，暗示了該打開哪一座鐵櫃。', '「所有人都睡著後」——那是哪一個班次？', '夜班的編號是 03。點道具欄的鐵撬棒，再點 03 號鐵櫃。'], () => (got.has('schedule') ? ['lk3'] : ['schedule']), '班次表：早班 01、午班 02、夜班 03。手寫字：「我們只在所有人都睡著後，才能記下真正的數字。」所有人都睡著＝夜班＝03 號鐵櫃，用鐵撬棒撬開它。');
    await me('礦工休息的地方……帽子、桌子都還在，好像人們只是暫時離開。', 'Where the miners rested… the helmets and table are still here, as if they just stepped out.'); S();
    await loop(async (id, item) => {
      if (id === 'back') { closeCu(); return; }
      if (id === 'board') {
        const found = await photoPile(gotPhotoA); S();
        if (found && !gotPhotoA) {
          gotPhotoA = true; got.add('photoA');
          await me('三個英國名字，一個台灣名字……Arthur，是 A.W. 嗎？', 'Three English names and one Taiwanese… Arthur. Could he be A.W.?'); S();
          await me('陳金水……他們是一起的。這張照片被夾在一堆礦場照片裡，像是有人刻意藏起來。', 'Chen Jinshui… they were together. Tucked among the mine photos, as if someone hid it on purpose.'); S();
        }
        return;
      }
      if (id === 'manual4') return void await me('一本泡過水的工作手冊，字都暈開了，看不出內容。', 'A water-soaked work manual. The ink has bled; nothing is legible.');
      if (id === 'helmet') return void await me('一頂舊礦工帽，帽燈早就不亮了。', 'An old miner’s helmet. The lamp died long ago.');
      if (id === 'schedule') {
        const first = !got.has('schedule');
        await getDoc('schedule'); S();
        if (first) { await me('班次和鐵櫃編號是對應的。下面這行字，跟表格不是同一個人寫的。', 'The shifts match the locker numbers. The line at the bottom is in a different hand.'); S(); await me('所有人都睡著之後……那是半夜，是夜班的時間。', 'After everyone is asleep… that’s midnight. The night shift.'); }
        return;
      }
      if (id.startsWith('lk')) {
        const n = +id[2];
        if (opened.has(n)) return void await me(n === 3 ? '櫃子已經打開了。' : '只有那件舊工作服。', n === 3 ? 'It’s already open.' : 'Only that old coverall.');
        if (item !== 'bar') return void await me('鎖扣都鏽死了，要撬開才行。', 'The latch has rusted shut. I’ll need to pry it.');
        sfx('pry'); opened.add(n);
        if (n !== 3) {
          const v = html(`<div class="g1-docback" role="dialog" aria-label="${n} 號鐵櫃內部"><img class="g1-lockerview" src="${IMG('g01-locker-open.webp')}" alt="鐵櫃裡掛著一件破舊的工作服"><div class="g1-dochint">點旁邊收起</div></div>`);
          el.appendChild(v);
          await me('撬開了……裡面只掛著一件發霉的工作服。不是這一個。', 'Pried open… only a mouldy coverall hanging inside. Not this one.', { pic: false }); S();
          await new Promise(r => v.addEventListener('click', () => { sfx('tap'); v.remove(); r(); })); S();
          return;
        }
        sfx('door'); hide('door3'); await wait(500); S();
        await me('櫃底壓著一本日誌……封面寫著「A. WILLIAMS」。裡面是英文，用館長給的翻譯筆掃一下。', 'A journal pressed at the bottom of the locker… “A. WILLIAMS” on the cover. It’s in English; the director’s pen can scan it.'); S();
        await getDoc('journal'); return true;
      }
    }); S();
    await me('A.W.……亞瑟・威廉斯。日治時期被押到金瓜石做苦工的英國戰俘，他就是其中一個。', 'A.W.… Arthur Williams. One of the British prisoners forced to labor at Jinguashi under Japanese rule.'); S();
    await me('日誌說，二月十七日的數字會告訴我答案。去運礦站看看。', 'The journal says the numbers from February 17 will tell me. To the loading station.'); S();

    // ---------- S05 六坑運礦站 ----------
    await chapter('六坑運礦站', 'S05', () => setScene('g01-s05.webp', '六坑運礦站，兩條軌道、磅秤與一塊舊黑板', [
      ['oldsw', 'g01-switch.webp', 690, 600, 130, 86, 'opacity:0;z-index:2;filter:brightness(.8) contrast(1.1)'],
      ['rag', 'g01-rag.webp', 612, 566, 290, 0, 'z-index:4;filter:brightness(.6)'],
    ])); S();
    let circled = false, rubbed = false;
    setHs([['ledger', 956, 312, 190, 64, '桌上的帳簿'], ['scale', 820, 326, 80, 150, '磅秤'], ['board5', 844, 84, 300, 206, '黑板'], ['gravel', 600, 556, 310, 150, '軌道上的破布']]);
    setStep('找出對不上的那一天', [() => !circled ? '右邊桌上疊著帳簿，翻開離站簿與到站簿，同一天的數字應該一樣。' : !rubbed ? '黑板上的粉筆灰底下，好像還有字。用手指把灰抹掉。' : '軌道上蓋著一塊破布，把它移開。', () => !circled ? '二月十七日：離站 12、到站 9。在冊子上點那一行。' : !rubbed ? '在黑板上來回滑動，把整片粉筆灰擦掉。' : '點鐵軌旁的碎石。'],
      () => (!circled ? ['ledger'] : !rubbed ? ['board5'] : ['gravel']),
      () => (!circled ? '翻開離站簿與到站簿，只有 02/17 對不上：離站 12 車、到站 9 車。在冊子上點 02/17 那一行圈起來。' : !rubbed ? '黑板被粉筆灰蓋住了。點黑板，用手指或滑鼠來回抹，擦出底下的字。' : '絆倒主角的是軌道上的一塊破布。點破布把它移開。'));
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
        if (rubbed) return void await me('「必須找到遺失的黃金，否則所有人一起陪葬」……', '“Find the missing gold, or every one of you will be buried with it”…');
        if (!circled) return void await me('一塊舊黑板，上面積滿了粉筆灰。', 'An old blackboard, thick with chalk dust.');
        const ok = await rubBoard(); S();
        if (!ok) return;
        rubbed = true; hintLv = 0;
        $(el, '#goal').textContent = '目標　檢查鐵軌';
        await me('「必須找到遺失的黃金，否則所有人一起陪葬」……', '“Find the missing gold, or every one of you will be buried with it”…', { pic: false }); S();
        await me('這不是礦工寫的，是寫給礦工看的。三車貨不見了，監工就拿所有人的命來逼。', 'The miners didn’t write this—it was written for them. Three carts went missing, and the overseers threatened every life to get them back.', { pic: false }); S();
        await me('可是他們沒找到。表示藏貨的人，寧可被這樣對待，也沒說出去。', 'But they never found it. Whoever hid the cargo kept silent, even under that.', { pic: false }); S();
        closeCu();
        await me('或許前方有什麼？', 'Maybe there’s something further along?'); S();
        el.classList.add('g1-shake1'); sfx('clang'); await wait(480); el.classList.remove('g1-shake1'); S();
        await me('哇——！咦？這個是什麼？', 'Whoa—! Huh? What’s this?', { pic: false }); S();
        flash(['gravel'], 4000);
        return;
      }
      if (id === 'gravel') {
        if (!rubbed) return void await me('軌道上蓋著一塊又髒又破的布。', 'A filthy, torn cloth lying over the track.');
        const rg = sp('rag'); rg.classList.add('g1-rag'); rg.style.transform = 'translate(-260px,40px) rotate(-14deg)'; rg.style.opacity = '.85'; sfx('whoosh'); await wait(500); S();
        sp('oldsw').style.opacity = 1; await wait(400); S();
        await me('破布底下……是一個轉轍器，被人砸壞了。扳桿斷在側線那一邊，只能通往旁邊那條舊軌道。', 'Under the cloth… a switch, smashed. The lever snapped off toward the siding, so it can only send carts down the old track.'); S();
        await me('有人故意弄壞它、再用破布蓋住。三車貨物沒有離開礦坑，而是從這裡轉進去了。', 'Someone broke it on purpose and hid it under the cloth. The three loads never left the mine; they were switched off here.'); S();
        return true;
      }
    }); S();

    // ---------- S06 三岔路 ----------
    const fork = () => { setScene('g01-s06-fork.webp', '三條坑道的岔路口'); setHs([['A', 84, 210, 222, 300, '左邊的坑道'], ['B', 536, 180, 214, 300, '中間的坑道'], ['C', 972, 210, 170, 300, '右邊的坑道']]); };
    await chapter('封閉維修坑道', 'S06', fork); S();
    let seenA = false, gotPhotoB = false, hasKey = false;
    setStep('選一條路', ['右邊是出坑的路，每一車都會被登記。', '左邊的支撐木比較新，先看看左邊。', '左坑道的十字架底下掉著一把鑰匙。'], () => (seenA && hasKey ? ['B'] : ['A']), () => (seenA ? '左邊是死路，十字架是有人為落盤罹難者立的墓。走中間那條。' : '右邊通往出坑口，每車都要登記，不會是藏貨的路。左邊的支撐木最新，有人修過，先走左邊。'));
    await me('側線通到一個三岔路口。三條坑道，軌道都還在。', 'The siding leads to a three-way fork. Rails run into all three.'); S();
    await me('右邊那條通往出坑口，每一車都要登記。要藏起三車貨，不會走那裡。', 'The right one leads out, where every cart is logged. Nobody hiding three loads would go that way.'); S();
    await me('左邊的支撐木是新的……礦場封閉後，還有人進來修過。先從左邊看看。', 'The left one has new timber… someone came back after the mine closed. I’ll check the left first.'); S();
    for (;;) {
      const a = await act(x => x.type === 'hs'); S();
      if (a.id === 'C') { await me('出坑的路，每一車都會被登記……不是這裡。', 'The way out—every cart gets logged. Not here.'); continue; }
      if (a.id === 'B' && !seenA) { await me('中間那條的軌道最舊……先確認左邊是誰修的。', 'The middle track is the oldest… first, I want to know who repaired the left one.'); continue; }
      if (a.id === 'A') {
        await fadeTo(() => setScene('g01-s06-left.webp', '塌陷的左坑道，一座纏著紅布的木十字架', hasKey ? [] : [['key', 'g01-key.webp', 404, 486, 64, 0, 'z-index:2;transform:rotate(14deg);filter:brightness(.85)']])); S();
        setHs([['cross', 245, 222, 176, 237, '十字架'], ['chest', 4, 429, 240, 122, '木箱'], ...(hasKey ? [] : [['key', 384, 462, 110, 70, '十字架底下的東西']])]);
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
          if (b.id === 'key') {
            if (hasKey) continue;
            hasKey = true; hide('key'); dropHs('key'); addItem('ctl');
            await me('十字架底下掉著一把舊鑰匙……柄上繫著紅布，跟十字架上的是同一塊。', 'An old key lying under the cross… a strip of red cloth tied to it, the same cloth as on the cross.'); S();
            await me('是有人留給來祭拜的人？還是……留給找到這裡的人？', 'Left for whoever came to pay respects? Or… for whoever found this place?'); S();
            continue;
          }
          if (b.id === 'chest') {
            await getDoc('photoB'); S();
            if (!gotPhotoB) { gotPhotoB = true; await me('他們知道，自己也可能躺在這裡。', 'They knew they might end up lying here too.'); S(); }
            continue;
          }
          if (b.id === 'exit') {
            if (!seenA) { await me('先看看那座十字架。', 'Let me look at that cross first.'); continue; }
            if (!hasKey) { await me('十字架底下……好像有東西在反光。', 'Something is glinting under the cross…'); flash(['key'], 4000); continue; }
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
      ['flash', 'it-flashlight.webp', 560, 560, 130, 0, 'z-index:5;opacity:0;transform:rotate(-12deg)'],
      ['sign', 'g01-sign.webp', 744, 470, 190, 0, 'z-index:2;transform:rotate(9deg);filter:brightness(.8)'],
    ]); setDark(true, 'pitch'); }); S();
    let hasFl = false;
    setHs([['grope', 0, 80, 1140, 640, '在黑暗中摸索']]);
    setStep('調查中間的坑道', [() => !hasFl ? '什麼都看不見。在畫面上到處點點看，用手摸索地面。' : '移動手電筒的光，照遍整條坑道。', () => !hasFl ? '往畫面下方中間的地面摸摸看。' : '地上倒著一塊方向牌，箭頭指向右邊的岩壁。'], () => (!hasFl ? [] : ['sign', 'side']), '在黑暗中點畫面摸索，往下方中間的地面摸，就會摸到手電筒。打開後移動光線，照到地上那塊指向右邊的方向牌，再點右邊岩壁的缺口。');
    await me('好黑……什麼都看不見。只能用手摸著走了。', 'So dark… I can’t see a thing. I’ll have to feel my way.', { pic: false }); S();
    toast('在畫面上到處點點看，摸索四周。');
    let gropes = 0;
    await loop(async id => {
      if (id === 'grope') {
        const [x, y] = lastPt; gropes++;
        const rp = html(`<div class="g1-touch" style="left:${x}px;top:${y}px"></div>`); el.appendChild(rp); setTimeout(() => rp.remove(), 700);
        const dx = 625 - x, dy = 598 - y;
        if (Math.hypot(dx, dy) < 150 || gropes >= 9) {
          sfx('pick'); hasFl = true; addItem('fl');
          await me('手指碰到一個冰冷的圓筒……是手電筒！電池早就爛了，換上我帶的備用電池。', 'My fingers touch a cold cylinder… a flashlight! The battery rotted long ago; I’ll swap in my spare.', { pic: false }); S();
          sfx('flash'); setDark(true, 'torch deep');
          setHs([['end', 380, 240, 260, 200, '軌道盡頭'], ['sign', 740, 470, 200, 120, '倒在地上的木牌'], ['side', 880, 270, 180, 200, '岩壁']]);
          toast('移動滑鼠或手指，用光照亮四周。');
          return;
        }
        const dir = Math.abs(dx) > 160 ? (dx > 0 ? '右邊' : '左邊') : '';
        if (y < 430) return void await me(['摸到的是冰冷、潮濕的岩壁……東西應該不會在牆上。', '頭頂是粗糙的支撐木。往地上摸摸看。'][gropes % 2], ['Cold, wet rock… nothing up here.', 'Rough timber overhead. I should feel along the ground.'][gropes % 2], { pic: false });
        return void await me(`腳邊是枕木和碎石……${dir ? `再往${dir}一點摸摸看。` : '應該就在附近。'}`, `Sleepers and loose stones underfoot… ${dir ? `a little more to the ${dx > 0 ? 'right' : 'left'}.` : 'it must be close.'}`, { pic: false });
      }
      if (id === 'end') return void await me(hasFl ? '落石把整條坑道堵死了。' : '前面黑漆漆的，伸手不見五指。', hasFl ? 'The rockfall has sealed the tunnel completely.' : 'Pitch black ahead.', { pic: false });
      if (id === 'sign') {
        if (!hasFl) return void await me('太暗了，什麼也看不見。', 'Too dark to see anything.', { pic: false });
        return void await me('一塊倒在地上的方向牌，木頭都爛了……箭頭指著右邊。右邊只有岩壁？', 'A fallen direction sign, the wood rotten through… the arrow points right. But there’s only rock to the right?', { pic: false });
      }
      if (id === 'side') {
        if (!hasFl) return void await me('太暗了，什麼也看不見。', 'Too dark to see anything.', { pic: false });
        moveLight(970, 380);
        await me('岩壁後面有一條小坑道……地上有礦車輪子壓過的痕跡。', 'A narrow passage behind the rock… cart-wheel ruts in the dirt.', { pic: false }); S();
        await me('三車貨物，就是從這裡推進去的。', 'This is where the three cartloads were pushed through.', { pic: false }); S();
        return true;
      }
    }); S();

    // ---------- S07 五坑舊運輸區 ----------
    await chapter('五坑舊運輸區', 'S07', () => { setScene('g01-s07-empty-nh.webp', '五坑舊運輸區的空豎井，左邊是控制盤', [['ctlIn', 'g01-key-end.webp', 127, 460, 8, 0, 'opacity:0;z-index:3;transform-origin:50% 18%;rotate:-45deg']]); setDark(true, 'torch'); }); S();
    let ctlOn = false, cageDown = false;
    const s07hs = () => setHs([['manual', 191, 207, 74, 114, '操作須知鐵牌'], ['panel', 46, 367, 168, 207, '控制盤'], cageDown ? ['cage', 498, 306, 237, 299, '鐵籠'] : ['shaft', 470, 60, 300, 520, '豎井']]);
    s07hs();
    setStep('啟動升降機', [() => !ctlOn ? '控制盤中間有個鑰匙孔。十字架底下撿到的鑰匙，也許對得上。' : '照鐵牌上的順序操作控制盤：解除制動 → 接通電源 → 下降。'], ['manual', 'panel'], '打開控制盤，點道具欄的舊鑰匙，再點中間的鑰匙孔；插進去後點鑰匙左側或往左滑，把鑰匙轉開。之後照鐵牌順序：解除制動 → 接通電源 → 下降，把鐵籠叫下來。');
    await me('一座豎井……鐵籠不在這裡，停在上面某一層。', 'A shaft… the cage isn’t here. It’s stopped somewhere above.'); S();
    let panelSeq = [];
    // 控制盤近景：整張高解析控制盤圖，按鈕與刻字都在圖上
    const PANEL = { brake: [484, 435], power: [804, 435], down: [645, 545] };
    let keyIn = 0; // 0 沒插、1 插著還沒轉、2 已轉動
    const KEYST = 'left:615px;top:289px;height:230px';
    const panelCu = () => {
      openCu(`<img class="bg" src="${IMG('g01-panel-cu.webp')}" alt="升降機控制盤：儀表、鑰匙孔與三顆按鈕">` +
        (keyIn ? `<img class="g1-sp g1-keyin${keyIn === 2 ? ' turned' : ' still'}" src="${IMG('g01-key-end.webp')}" alt="插在鑰匙孔裡的鑰匙" style="${KEYST}">` : '') +
        Object.entries(PANEL).map(([k, [x, y]]) => panelSeq.includes(k) ? `<div class="g1-panelglow" style="left:${x}px;top:${y}px"></div>` : '').join(''),
        [...(keyIn ? [] : [['socket', 595, 280, 100, 130, '中間的鑰匙孔']]), ...Object.entries(PANEL).map(([k, [x, y]]) => [k, x - 56, y - 56, 112, 112, { brake: '解除制動', power: '接通電源', down: '下降' }[k]])]);
      if (keyIn === 1) armTurn();
    };
    // 鑰匙插著時：點鑰匙左側或往左滑，才會逆時針轉 45 度
    function armTurn() {
      const z = html('<div class="g1-turnzone" aria-label="轉動鑰匙：點左側或往左滑"></div>');
      cu.appendChild(z);
      let x0 = null;
      z.addEventListener('pointerdown', e => { const r = el.getBoundingClientRect(); x0 = (e.clientX - r.left) * 1280 / r.width; });
      z.addEventListener('pointerup', async e => {
        if (x0 === null || keyIn !== 1) return;
        const r = el.getBoundingClientRect(), x1 = (e.clientX - r.left) * 1280 / r.width;
        const swipeL = x1 - x0 < -30, tapL = Math.abs(x1 - x0) <= 30 && x1 < 645;
        x0 = null;
        if (!(swipeL || tapL)) { toast('轉不動……試試往另一個方向。'); return; }
        keyIn = 2; const kk = cu.querySelector('.g1-keyin'); if (kk) { kk.classList.remove('still'); kk.classList.add('turned'); }
        z.remove(); sfx('clang');
        setTimeout(() => emit({ type: 'hs', id: 'keyturned', item: null }), 650);
      });
    }
    await loop(async (id, item) => {
      if (id === 'back') { closeCu(); return; }
      if (id === 'manual') { await getDoc('manual'); S(); return void await me('一般運轉不停靠的地方……就不會出現在任何運輸紀錄裡。', 'A level the lift never normally stops at… would never show up in any transport record.'); }
      if (id === 'shaft') return void await me('鐵籠停在上面。得先把它叫下來。', 'The cage is up there. I need to call it down.');
      if (id === 'panel') { panelCu(); return; }
      if (id === 'keyturned') {
        ctlOn = true; sp('ctlIn').style.opacity = 1; panelCu();
        return void await me('鑰匙轉過去了……儀表的指針跳了一下。有電了。', 'The key turns… the gauge needle jumps. There’s power.', { pic: false });
      }
      if (id === 'socket') {
        if (keyIn) return;
        if (item !== 'ctl') return void await me('中間是一個鑰匙孔，孔緣磨得發亮。', 'A keyhole in the middle, its rim worn shiny.', { pic: false });
        dropItem('ctl'); keyIn = 1; sfx('key'); panelCu();
        await me('鑰匙插進去了。要往哪邊轉……？', 'The key is in. Which way does it turn…?', { pic: false }); S();
        toast('點鑰匙的左側，或往左滑動來轉動鑰匙。');
        return;
      }
      if (PANEL[id]) {
        if (!ctlOn) return void await me(keyIn ? '按了沒有反應……鑰匙還沒轉。' : '按了沒有反應……要先用鑰匙啟動。', keyIn ? 'Nothing… the key hasn’t been turned.' : 'Nothing happens… it needs the key first.', { pic: false });
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

    // ---------- 鐵籠：同時按 3 與 4，停在 3.5 樓 ----------
    await fadeTo(() => { setDark(false); setScene('g01-lift.webp', '升降機鐵籠內部，右邊是樓層按鈕', [],
      [5, 4, 3, 2].map(f => `<div class="g1-lglow" id="lf${f}" style="left:1120px;top:${{ 5: 165, 4: 200, 3: 237, 2: 270 }[f]}px"></div>`).join('')); $(el, '#slots').classList.add('hidden'); }); S();
    setHs([['lpanel', 1080, 77, 114, 352, '樓層按鈕']]);
    setStep('停在 3.5 樓', ['鐵牌上寫著：3.5 在三樓和四樓之間，一般運轉不停靠。', '鐵牌最後一行：如需停靠，同時按下 3 與 4。', '打開樓層按鈕，同時按住 3 和 4（滑鼠就快速連點兩顆）。'], ['lpanel'], '樓層按鈕近景裡，同時按下 3 和 4（手機用兩指同時按，滑鼠就在一秒內先後點兩顆），鐵籠就會停在 3.5 樓。');
    await me('按鈕只有 1 到 5。鐵牌上寫著，要停在 3.5，得同時按下 3 和 4。', 'Buttons only go 1 to 5. The plate said: to stop at 3.5, press 3 and 4 together.', { pic: false }); S();
    const lights = f => [2, 3, 4, 5].forEach(n => $(el, '#lf' + n).classList.toggle('on', Array.isArray(f) ? f.includes(n) : f === n));
    const LBTN = { 5: 205, 4: 266, 3: 338, 2: 405, 1: 477 };
    let held = {}, liftBusy = false;
    const liftCu = () => openCu(`<div class="g1-crossbg"></div><img class="g1-sp" src="${IMG('g01-lift-panel.webp')}" alt="" style="left:512px;top:50px;height:620px">` +
      Object.entries(LBTN).map(([f, y]) => `<div class="g1-btnglow sm" id="lb${f}" style="left:639px;top:${y}px"></div>`).join(''),
      Object.entries(LBTN).map(([f, y]) => [`f${f}`, 597, y - 28, 84, 56, `${f} 樓`]));
    // 鐵籠上下擺動著上升
    async function ride(stops) {
      el.classList.add('g1-bob'); sfx('whoosh');
      for (const f of stops) { lights(f); await wait(1300); S(); }
      el.classList.remove('g1-bob');
    }
    // 樓層按鈕不走 loop：兩顆鍵要能在一秒內先後按到，所以直接聽點擊
    await new Promise(resolve => {
      const LP = a => {
        if (a.type !== 'hs' || !alive) return;
        if (a.id === 'back') { closeCu(); return; }
        if (a.id === 'lpanel') { if (!liftBusy) { held = {}; liftCu(); } return; }
        if (!/^f\d$/.test(a.id) || liftBusy) return;
        const f = +a.id[1], now = Date.now();
        held[f] = now; const g0 = cu.querySelector('#lb' + f); if (g0) g0.classList.add('on'); sfx('key');
        if (held[3] && held[4] && Math.abs(held[3] - held[4]) < 1000) {
          liftBusy = true; listeners = listeners.filter(x => x !== LP);
          setTimeout(async () => { try { closeCu(); await ride([2, 3, [3, 4]]); resolve(); } catch (e) { /* 離開關卡 */ } }, 300);
          return;
        }
        setTimeout(async () => {
          try {
            const g1 = cu.querySelector('#lb' + f); if (g1) g1.classList.remove('on');
            if (held[f] !== now || liftBusy || !cuOpen()) return;
            if (f === 1) { await me('已經在一樓了。', 'We’re already on one.', { pic: false }); return; }
            liftBusy = true; closeCu();
            await ride(Array.from({ length: f - 1 }, (_, i) => i + 2)); S();
            sfx('clang');
            await me(`${f} 樓……門外是封死的岩壁。不是這裡。`, `Floor ${f}… a sealed rock wall outside. Not here.`, { pic: false }); S();
            sfx('whoosh'); await sys(['鐵籠慢慢降回一樓。'], 1600); S();
            lights(0); liftBusy = false; held = {};
          } catch (e) { /* 離開關卡 */ }
        }, 1000);
      };
      listeners.push(LP);
    }); S();
    sfx('clang');
    await say('三和四的燈一起亮著。鐵籠停在兩層中間，上下晃了幾下才穩住。', 'Both the 3 and 4 lights glow. The cage stops between floors, bobbing a few times before it settles.', 'think'); S();
    await me('門外是一條平台……沒有樓層編號。手電筒照到鐵網上，刻著一排日期。', 'A platform outside… no floor number. My light catches dates scratched into the mesh.', { pic: false }); S();
    await me('二月二十二日、二十四日、二十六日、二十八日……四個晚上。他們來過不只一次。', 'February 22nd, 24th, 26th, 28th… four nights. They came here more than once.', { pic: false }); S();
    cine.classList.remove('hidden');
    cine.innerHTML = `<img class="bg" src="${IMG('g01-lift.webp')}" alt="" style="filter:brightness(.45) sepia(.5)"><img src="${IMG('npc-arthur.webp')}" alt="" class="g01-ghost" style="height:820px;top:30px"><div class="vignette"></div>`;
    sfx('flash'); await wait(1200); S();
    await say('吳先生說，這座升降機只有維修時才會停在三點五。帳上，不會有它的名字。', 'Mr Wu said this lift only stops at three-and-a-half for repairs. It has no name in any ledger.', 'arthur'); S();
    await say('一個晚上只能推一車。Edward 守在豎井口，Thomas 數著巡邏的腳步聲，我和吳先生推車。', 'One cart a night. Edward kept watch at the shaft, Thomas counted the patrol’s footsteps, Mr Wu and I pushed.', 'arthur'); S();
    await say('Cole 和陳先生沒能等到這一天。落盤那天，是他們把我們推出坑道的。', 'Cole and Mr Chen never saw this day. When the roof came down, they were the ones who pushed us out.', 'arthur'); S();
    await say('我們在左邊的坑道替他們立了十字架，也在那裡發了誓。', 'We raised a cross for them in the left tunnel, and we made our vow there.', 'arthur'); S();
    await say('這座山拿走了他們的命。它的黃金，不能再拿去換更多人的命。', 'This mountain took their lives. Its gold will not be traded for any more.', 'arthur'); S();
    await say('我們不知道戰爭什麼時候結束……但至少這一次，黃金不會再被他們帶走。', 'We don’t know when the war will end… but this time, they won’t take the gold.', 'arthur'); S();
    cine.classList.add('hidden'); cine.innerHTML = '';
    await me('……十字架不只是墓碑。那是他們欠下的兩條命，也是這個約定開始的地方。', '…The cross wasn’t just a grave. It was two lives they owed, and where this promise began.', { pic: false }); S();
    await me('黑板上那張合照裡的四個人……陳金水已經不在了。照片背面那句話，他們終究沒能做到。', 'The four men in that photo from the blackboard… Chen Jinshui was already gone. The words on the back were a wish they couldn’t keep.', { pic: false }); S();
    await me('一般運轉不停靠的地方，也就是沒有人會來的地方。他們把秘密藏在帳本的縫隙裡。', 'A level the lift never stops at is a place no one comes. They hid their secret in the gaps of the ledgers.', { pic: false }); S();
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
    if (dd.g01.photoA || dd.g01.photoB) upsert('g01-photo', '四人合照', 'g01-photo4.webp', [dd.g01.photoA && '休息室黑板那疊照片裡找到的合照，寫著 Arthur、Edward、Thomas、陳金水', dd.g01.photoB && '左坑道木箱裡那張背面寫著：我希望我們四個人，都能活著回到這裡'].filter(Boolean).join('。') + '。');
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
    const miss = [!gotPhotoA && '休息室黑板上的合照', !gotPhotoB && '左坑道木箱裡的合照'].filter(Boolean);
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

  // 黑板上的一疊舊照片：關鍵的四人合照混在裡面
  function photoPile(already) {
    return new Promise(res => {
      const LINES = [['礦車推進坑道的照片……不是這張。', 'Men pushing a cart into the tunnel… not this one.'], ['坑口、豎井、煙囪……都是礦場的紀錄照。', 'Tunnel mouths, a headframe, a chimney… records of the mine.'], ['這張只拍到礦工的背影。', 'Only the miners’ backs in this one.'], ['一塊礦石……這是宣傳用的照片吧。', 'A lump of ore… probably a publicity shot.']];
      let n = 0, busy = false;
      const m = html(`<div class="g1-docback" role="dialog" aria-label="黑板上的舊照片">
<img class="g1-pile" src="${IMG('g01-photopile.webp')}" alt="一疊礦場舊照片">
<button type="button" class="g1-key4" aria-label="一張四個人的合照"><img src="${IMG('g01-photo4.webp')}" alt=""></button>
<div class="g1-dochint">${already ? '點旁邊收起' : '從這疊照片裡找找看　點旁邊收起'}</div></div>`);
      m.addEventListener('click', async e => {
        if (busy) return;
        if (e.target.closest('.g1-key4')) {
          busy = true; sfx('tap'); m.remove();
          await readDoc('photoA'); res(true); return;
        }
        if (e.target.closest('.g1-pile')) {
          busy = true; sfx('tap'); const [cn, en] = LINES[n++ % LINES.length];
          await me(cn, en, { pic: false }); busy = false; return;
        }
        sfx('tap'); m.remove(); res(false);
      });
      el.appendChild(m);
    });
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
      // 黑板近景：整張黑板圖（1672×941）縮成寬 1144，內框 75–1595 × 75–865
      const k = 1144 / 1672, top0 = 56, L = 75 * k, T = top0 + 75 * k, W = 1520 * k, H = 790 * k;
      openCu(`<div class="g1-crossbg"></div><img class="g1-sp" src="${IMG('g01-board-cu.webp')}" alt="黑板" style="left:0;top:${top0}px;width:1144px;height:${941 * k}px">` +
        `<div class="g1-chalkmsg2" style="left:${L}px;top:${T}px;width:${W}px;height:${H}px"><p>必須找到遺失的黃金</p><p class="big">否則所有人一起陪葬</p></div>` +
        `<canvas class="g1-dust" width="${Math.round(W)}" height="${Math.round(H)}" style="left:${L}px;top:${T}px;width:${W}px;height:${H}px"></canvas><div class="g1-kmsg" id="rbm" style="top:${top0 + 941 * k - 56}px">在黑板上來回抹，擦掉粉筆灰</div>`);
      const cv = $(cu, '.g1-dust'), cx = cv.getContext('2d');
      // 擦拭前的黑板（滿是粉筆灰的同一塊黑板）畫在畫布上，抹掉的地方露出底下的字
      let base0 = 0, ready = false;
      const dusty = new Image();
      dusty.onload = () => {
        cx.drawImage(dusty, 75, 75, 1520, 790, 0, 0, cv.width, cv.height);
        const base = cx.getImageData(0, 0, cv.width, cv.height).data;
        for (let i = 3; i < base.length; i += 4 * 97) if (base[i] > 30) base0++;
        cx.globalCompositeOperation = 'destination-out'; ready = true;
      };
      dusty.src = IMG('g01-board-dusty.webp');
      let done = false, n = 0, down = false;
      const rub = e => {
        if (done || !ready) return;
        const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * cv.width / r.width, y = (e.clientY - r.top) * cv.height / r.height;
        const g = cx.createRadialGradient(x, y, 0, x, y, 54); g.addColorStop(0, 'rgba(0,0,0,0.9)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, 54, 0, 7); cx.fill();
        if (++n % 12 === 0) check();
      };
      const check = () => {
        if (!ready) return;
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
