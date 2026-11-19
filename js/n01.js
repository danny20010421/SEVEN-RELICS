// 主線第一章第一節 N01〈不存在的第七分鐘〉　M2 正式美術版
// 劇情與台詞依《N01-GDD v1.0》逐字使用；GDD 沒寫的地方只放系統介面文字，不補角色台詞。
// 美術依 N01 art 包（UI/UX 審核通過）與 art/CODE_NOTES.md；座標＝母片像素 ÷3（背景）或 ÷2（近景）。
import { get, save } from './store.js';
import { sfx, bgm, applyVolume } from './audio.js';
import { html, $, IMG, ICON, wait, esc, modal, toast } from './ui.js';

const TOTAL = 1800; // 30 分鐘
const STD0 = 21 * 60 + 7; // 主角醒來：標準時 21:07
const OFFSET = 7; // 保安終端快 7 分鐘
const PAUSE_IN_DIALOGUE = true; // 對白播放時暫停倒數（GDD 4.3 建議實機 A/B 測試後定案）

const ITEMS = {
  card: { name: '臨時訪客卡', asset: 'N01-PROP-039', hint: '點門邊的讀卡器使用。' },
  tape: { name: '錄音磁帶', asset: 'N01-PROP-040', hint: '從閱覽室錄音機取下的磁帶。' },
  note: { name: '紙條', asset: 'N01-PROP-038', hint: '咖啡杯下壓著的紙條。' },
  file: { name: '卷宗 1204-M-03', asset: 'N01-PROP-053', hint: '裡面夾著人工清場表。' },
};

const ICO = {
  hint: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d8b594" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"></path></svg>',
  file: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d8b594" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h9l4 4v14H6zM15 3v4h4M9 12h6M9 16h6"></path></svg>',
  log: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d8b594" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H8l-4 4zM8 9h8M8 12h5"></path></svg>',
};
const RATIO = { 'N01-DOC-061': 0.756, 'N01-DOC-062-front': 1.013, 'N01-DOC-062-back': 1.002, 'N01-DOC-063': 0.777, 'N01-DOC-064': 0.768, 'N01-DOC-065': 0.807, 'N01-DOC-066': 0.741, 'N01-DOC-067': 1.831, 'N01-DOC-068': 1.385, 'N01-DOC-069': 0.755, 'N01-DOC-070': 0.979, 'N01-DOC-071': 0.817, 'N01-PROP-039': 0.5 };
const hm = m => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

// ---------- 文件（真正的 UI 文字；正式版紙張底圖用文件 ID） ----------
function docBody(id, ctx) {
  const name = esc(ctx.pname);
  switch (id) {
    case 'form': return { title: '資料申請單', asset: 'N01-DOC-061', html: `<h4>灰橋舊文獻館　資料申請單</h4><table><tr><th>借閱編號</th><td><b>GB-17-042</b></td></tr><tr><th>申請人</th><td>${name}</td></tr><tr><th>登記時間（標準時）</th><td>20:55</td></tr><tr><th>簽名</th><td class="sig">${name}</td></tr></table>` };
    case 'noteF': return { title: '紙條（正面）', asset: 'N01-DOC-062-front', html: '<p class="hand">不要讓別人替你描述，你當時看見了什麼。</p><p class="hand">尤其不要急著相信，你自己寫下的版本。</p>' };
    case 'noteB': return { title: '紙條（背面）', asset: 'N01-DOC-062-back', html: '<p class="press">GB-17-042</p>' };
    case 'visit': return { title: '訪客出入紀錄', asset: 'N01-DOC-063', html: '<h4>訪客出入紀錄</h4><div class="base">時間：標準時（獨立讀卡器）</div><table><tr><th>20:43</th><td>測試卡 T-07 讀卡（維修）</td></tr><tr><th>20:48</th><td>E. Ward 入館</td></tr><tr><th>20:55</th><td>訪客登記</td></tr><tr><th>21:02</th><td>安全測試啟動</td></tr><tr><th>21:06</th><td>清場簽名</td></tr></table>' };
    case 'termlog': return { title: '夜間設備終端紀錄', asset: 'N01-DOC-064', html: `<h4>保安終端　夜間設備紀錄</h4><div class="base">時間：終端時間（尚未校時）</div><table><tr><th>21:14</th><td>備用電源切換／監控訊號中斷</td></tr></table>${ctx.p02 ? `<p class="calc">校正後：終端 21:14 ＝ 標準時 ${hm(21 * 60 + 14 - OFFSET)}</p>` : ''}` };
    case 'test': return { title: '讀卡器測試表', asset: 'N01-DOC-065', html: '<h4>讀卡器維修測試</h4><table><tr><th>測試卡</th><td>T-07</td></tr><tr><th>保安終端記錄</th><td>20:50</td></tr><tr><th>獨立讀卡器記錄</th><td class="torn">（此處以下被撕去）</td></tr></table>' };
    case 'notice': return { title: '終端維護公告', asset: 'N01-DOC-066', html: '<h4>終端維護公告</h4><p>保安終端校時中，已停止自動同步。</p>' };
    case 'label': return { title: '維修標籤', asset: 'N01-DOC-067', html: '<h4>維修標籤</h4><p class="hand big">12/4　M　03</p><p class="hand">（春季例行）</p>' };
    case 'rule': return { title: '文件命名規則', asset: 'N01-DOC-068', html: '<h4>文件命名規則</h4><p class="big">DDMM－類別－序號</p>' };
    case 'clear': return { title: '人工清場簽名表', asset: 'N01-DOC-069', html: '<h4>人工清場簽名表</h4><table><tr><th>時間（標準時）</th><td>21:06</td></tr><tr><th>簽名</th><td class="sig ink2">E. Ward</td></tr><tr><th>清場</th><td>無其他人員</td></tr></table>' };
    case 'order': return { title: '設備操作順序便條', asset: 'N01-DOC-070', html: '<h4>操作順序</h4><p class="hand">① 按鈴通知櫃台</p><p class="hand">② 開機掃描</p><p class="hand">③ 收片入盒</p>' };
    case 'cardback': return { title: '訪客卡（背面）', asset: 'N01-PROP-039', html: '<p class="hand" style="margin:318px -40px 0;text-align:center;font-size:19px;line-height:28px">20:55 發卡<br>——櫃台</p>' };
    case 'loadsheet': return { title: '迴路負載表', asset: 'N01-DOC-066', html: '<h4>備用電源　迴路負載表</h4><table><tr><th>A 照明</th><td>2A</td></tr><tr><th>B 監控</th><td class="smudge">▒A</td></tr><tr><th>C 門禁</th><td>3A</td></tr><tr><th>額定</th><td>6A</td></tr></table><p>※ 讀卡器指示燈接 A 迴路</p><p>※ 過載跳脫後冷卻 20 秒方可重新投入</p>' };
    case 'release': return { title: '人工放行確認單', asset: 'N01-DOC-071', html: '<h4>人工放行確認</h4><table><tr><th>實際在館人數</th><td>1</td></tr><tr><th>閱覽室</th><td>已清查</td></tr><tr><th>走廊</th><td>已清查</td></tr></table>' };
  }
}

export function render(st, params, go) {
  const d = get();
  const g = (d.player && d.player.gender) || 'm';
  const pname = (d.player && d.player.name) || '玩家';
  d.n01 = d.n01 || {};
  const meta = d.n01; // seenPrologue、seenTape、cleared 跨次保留
  const fresh = () => ({ scene: 'A', timer: TOTAL, items: [], read: [], flags: {}, choices: {}, trust: 0, habit: 0, noteDisclosure: null, hints: {}, log: [] });
  let S0 = params && params.resume && meta.st ? meta.st : fresh();
  if (!(params && params.resume) && window.__N01_T) S0.timer = window.__N01_T; // 測試用：縮短倒數
  const F = S0.flags;

  const el = html(`<div class="scr g01 n01">
<div class="layer" id="scene"></div>
<div class="fill" id="hsLayer" style="z-index:3"></div>
<div class="fill hidden" id="cu" style="z-index:6"></div>
<div class="fill hidden" id="cine" style="z-index:20;background:#000"></div>
<div class="shade-top"></div>
<div class="shade-right"></div>
<div class="lvl-top" id="hud">
  <button type="button" class="iconbtn" id="leave" aria-label="離開關卡">${ICON.back}</button>
  <div class="lvl-goal"><span class="chip-red" style="height:32px">第一章・第一節</span><span id="goal">目標　—</span></div>
  <div class="n1-timer" id="timer" aria-label="剩餘時間">30:00</div>
</div>
<div class="lvl-right" style="height:64px">
  <button type="button" class="iconbtn hud-big" id="hintBtn">${ICO.hint}<span>提示</span></button>
  <button type="button" class="iconbtn hud-big" id="fileBtn">${ICO.file}<span>檔案</span></button>
  <button type="button" class="iconbtn hud-big" id="logBtn">${ICO.log}<span>紀錄</span></button>
  <button type="button" class="iconbtn hud-big" id="setBtn">${ICON.gear.replace('<svg', '<svg width="24" height="24"')}<span>設定</span></button>
</div>
<div class="slots" id="slots" role="group" aria-label="臨時道具欄"></div>
<div class="black on" id="black"></div>
</div>`);
  st.appendChild(el);
  const scene = $(el, '#scene'), hsLayer = $(el, '#hsLayer'), cu = $(el, '#cu'), cine = $(el, '#cine');
  let alive = true, listeners = [], selected = null, running = false, ended = false;
  const S = () => { if (!alive) throw new Error('left'); };
  const emit = a => listeners.slice().forEach(l => l(a));
  const act = test => new Promise(res => { const l = a => { if (test(a)) { listeners = listeners.filter(x => x !== l); res(a); } }; listeners.push(l); });
  const persist = () => { meta.st = S0; save(); };
  const flag = (k, v = true) => { F[k] = v; persist(); };

  // ---------- 倒數 ----------
  const paintTimer = () => {
    const t = Math.max(0, S0.timer);
    const n = $(el, '#timer'); n.textContent = `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
    n.classList.toggle('warn', t <= 300);
  };
  const stdNow = () => STD0 + Math.floor((TOTAL - S0.timer) / 60);
  let tick = setInterval(() => {
    if (!alive || !running || ended) return;
    if (PAUSE_IN_DIALOGUE && (el.querySelector('.sub') || !cine.classList.contains('hidden'))) return;
    S0.timer--; paintTimer();
    if (S0.timer % 5 === 0) persist();
    if (S0.timer <= 0) timeout();
  }, 1000);

  // ---------- 道具欄 ----------
  function itemImg(id) { return `<span class="n1-gb-item">${ITEMS[id].name}</span><img src="${IMG(ITEMS[id].asset + '.webp')}" alt="" onerror="this.remove()">`; }
  function paintSlots(ping) {
    const s = $(el, '#slots'); s.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const id = S0.items[i];
      if (!id) { s.appendChild(html('<span class="slot" role="img" aria-label="空的道具欄"></span>')); continue; }
      const b = html(`<button type="button" class="slot has${selected === id ? ' sel' : ''}${ping === id ? ' ping' : ''}" aria-label="${ITEMS[id].name}">${itemImg(id)}</button>`);
      b.addEventListener('click', () => { sfx('tap'); if (id === 'note') { readDoc('noteF'); return; } selected = selected === id ? null : id; paintSlots(); });
      s.appendChild(b);
    }
    const ban = $(el, '.use-banner'); if (ban) ban.remove();
    if (selected) el.appendChild(html(`<div class="use-banner"><div>「${ITEMS[selected].name}」${ITEMS[selected].hint}　再點一次道具就取消</div></div>`));
  }
  const addItem = id => { if (!S0.items.includes(id)) S0.items.push(id); sfx('pick'); persist(); paintSlots(id); };
  const has = id => S0.items.includes(id);

  // ---------- 場景 ----------
  // objs：{ id, x, y, w, h, label }＝熱點；spr：[id, 檔名, x, y, w, h, 額外樣式]＝疊在背景上的狀態圖
  function setScene(bgId, title, objs, spr = []) {
    scene.innerHTML = `<div class="n1-gb"></div><img class="bg" id="bgimg" src="${IMG(bgId + '.webp')}" alt="${title}" onerror="this.remove()">` +
      spr.map(([id, f, x, y, w, h, st = '']) => `<img class="n1-spr" id="o-${id}" src="${IMG(f)}" alt="" style="left:${x}px;top:${y}px;width:${w}px;${h ? `height:${h}px;` : ''}${st}">`).join('');
    setHs(objs);
  }
  const setBg = f => { const b = $(scene, '#bgimg'); if (b) b.src = IMG(f + '.webp'); };
  const addSpr = (id, f, x, y, w, h, st = '') => { if (!scene.querySelector('#o-' + id)) scene.insertAdjacentHTML('beforeend', `<img class="n1-spr" id="o-${id}" src="${IMG(f)}" alt="" style="left:${x}px;top:${y}px;width:${w}px;${h ? `height:${h}px;` : ''}${st}">`); };
  const ob = id => scene.querySelector('#o-' + id);
  const dropHs = id => { const b = $(hsLayer, `[data-hs="${id}"]`); if (b) b.remove(); };
  function setHs(list, layer = hsLayer) {
    if (layer === hsLayer) hsLayer.innerHTML = '';
    list.forEach(({ id, x, y, w, h, label }) => {
      const b = html(`<button type="button" class="area" data-hs="${id}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px" aria-label="${label}"></button>`);
      b.addEventListener('click', ev => { ev.stopPropagation(); sfx('tap'); if (layer === hsLayer) lastOrigin = [x + w / 2, y + h / 2]; emit({ type: 'hs', id, item: selected }); });
      layer.appendChild(b);
    });
  }
  let lastOrigin = [640, 360], cuT = 0;
  async function loop(handler) {
    for (;;) {
      const a = await act(x => x.type === 'hs'); S();
      const used = a.item;
      const r = await handler(a.id, used); S();
      if (used && selected === used) { selected = null; paintSlots(); }
      if (r) return r;
    }
  }
  // 近景：從點擊的物件位置推進；返回時反向播放（CODE_NOTES 審核補充）
  function openCu(inner, list = []) {
    clearTimeout(cuT);
    const wasOpen = !cu.classList.contains('hidden') && !cu.classList.contains('out');
    cu.innerHTML = inner;
    const b = html(`<button type="button" class="btn-line g1-cuback">${ICON.back}<span>返回</span></button>`);
    b.addEventListener('click', ev => { ev.stopPropagation(); sfx('tap'); emit({ type: 'hs', id: 'back', item: null }); });
    cu.appendChild(b); setHs(list, cu);
    cu.style.transformOrigin = `${lastOrigin[0]}px ${lastOrigin[1]}px`;
    cu.classList.remove('hidden', 'out'); hsLayer.classList.add('hidden'); $(el, '#slots').classList.add('cu-hide');
    if (!wasOpen) { cu.classList.remove('in'); void cu.offsetWidth; cu.classList.add('in'); }
  }
  const closeCu = () => {
    if (cu.classList.contains('hidden')) return;
    cu.classList.remove('in'); cu.classList.add('out'); hsLayer.classList.remove('hidden'); $(el, '#slots').classList.remove('cu-hide');
    clearTimeout(cuT); cuT = setTimeout(() => { cu.classList.add('hidden'); cu.classList.remove('out'); cu.innerHTML = ''; }, 320);
  };
  async function fadeTo(fn) {
    $(el, '#black').classList.add('on'); await wait(500); S();
    closeCu(); fn(); await wait(150); S();
    $(el, '#black').classList.remove('on'); await wait(500); S();
  }

  // ---------- 對白、廣播、紀錄 ----------
  const WHO = { fv: '女聲', mv: '男聲', me: pname, ind: '因杜阿森（電話）', indp: '因杜阿森', cast: '館內廣播', eileen: '錄音・艾琳', male: '錄音・男聲', sup: '錄音・前主管', guard: '保安（對講機）' };
  function say(cn, who = 'me', opt = {}) {
    S0.log.push([WHO[who] || '', cn]); if (S0.log.length > 200) S0.log.shift();
    return new Promise(res => {
      const calm = cu.classList.contains('hidden') && cine.classList.contains('hidden') && !el.querySelector('.g1-docback');
      let pic = null;
      if (who === 'me' && calm && opt.pic !== false) pic = html(`<img class="portrait n1-char" src="${IMG(g === 'f' ? 'N01-CHAR-012.webp' : 'N01-CHAR-013.webp')}" alt="">`);
      if (who === 'indp' && calm) pic = html(`<img class="portrait npc n1-char" src="${IMG('N01-CHAR-014.webp')}" alt="">`);
      if (pic) el.appendChild(pic);
      const phone = who === 'ind' ? '<span class="n1-phone" aria-hidden="true">☎</span>' : '';
      const b = html(`<div class="sub${who === 'cast' ? ' think' : ''}" role="button" tabindex="0" aria-label="點一下繼續"><div class="who"><span>${phone}${esc(WHO[who] || '')}</span></div><p class="cn">${cn}</p>${ICON.down}</div>`);
      const done = () => { sfx('tap'); b.remove(); if (pic) pic.remove(); res(); };
      b.addEventListener('click', done);
      b.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') done(); });
      el.appendChild(b); b.focus({ preventScroll: true });
    });
  }
  const me = (cn, opt) => say(cn, 'me', opt);
  async function sys(lines, ms = 2400) {
    const b = html(`<div class="sysmsg" style="top:240px"><div role="status">${lines.map(l => `<p>${l}</p>`).join('')}</div></div>`);
    el.appendChild(b); await wait(ms); b.remove();
  }
  function choose(options) {
    return new Promise(res => {
      const b = html(`<div class="n1-choice" role="group" aria-label="選擇回答">${options.map((o, i) => `<button type="button" class="btn-line" data-i="${i}">${o}</button>`).join('')}</div>`);
      b.addEventListener('click', e => { const t = e.target.closest('[data-i]'); if (!t) return; sfx('tap'); b.remove(); res(+t.dataset.i); });
      el.appendChild(b);
    });
  }
  $(el, '#logBtn').addEventListener('click', () => {
    sfx('tap');
    const m = html(`<div class="modal-back" style="z-index:44"><div class="gdoc" role="dialog" aria-label="對話紀錄"><div class="label">對話紀錄</div><h2>已讀內容</h2><div class="redline"></div>
<div class="n1-log">${S0.log.length ? S0.log.map(([w, t]) => `<p><b>${esc(w)}</b>${t}</p>`).join('') : '<p>還沒有對話。</p>'}</div><button type="button" class="x" aria-label="關閉">${ICON.close}</button></div></div>`);
    m.addEventListener('click', e => { if (e.target.closest('.x') || e.target === m) { sfx('tap'); m.remove(); } });
    el.appendChild(m); const lg = $(m, '.n1-log'); lg.scrollTop = lg.scrollHeight;
  });

  // ---------- 文件：點一下直接開到內容，一個畫面看完 ----------
  function readDoc(id) {
    if (!S0.read.includes(id)) { S0.read.push(id); persist(); }
    return new Promise(res => {
      const doc = docBody(id, { pname, p02: !!F.P02_SOLVED });
      const r = RATIO[doc.asset] || 0.78;
      const h = r < 1.2 ? 576 : Math.round(800 / r), w = Math.round(h * r);
      const m = html(`<div class="g1-docback n1-docback" role="dialog" aria-label="${doc.title}"><div class="n1-paper${r >= 1.2 ? ' wide' : ''}" style="left:${Math.round(572 - w / 2)}px;top:${Math.round(376 - h / 2)}px;width:${w}px;height:${h}px"><img src="${IMG(doc.asset + '.webp')}" alt="" onerror="this.remove()"><div class="n1-ink">${doc.html}</div></div><div class="g1-dochint">點旁邊收起</div></div>`);
      m.addEventListener('click', e => { if (e.target.closest('.n1-paper')) return; sfx('tap'); m.remove(); res(); });
      el.appendChild(m);
    });
  }
  $(el, '#fileBtn').addEventListener('click', () => {
    sfx('tap');
    const ids = S0.read.filter(i => i !== 'noteB' || F.NOTE_DISCOVERED);
    if (!ids.length) { toast('還沒有看過任何文件。'); return; }
    const m = html(`<div class="modal-back" style="z-index:44"><div class="gdoc" role="dialog" aria-label="檔案"><div class="label">調查檔案</div><h2>已讀文件</h2><div class="redline"></div>
<div class="gfiles">${ids.map(i => `<button type="button" class="gfile" data-doc="${i}"><span>${docBody(i, { pname }).title}</span></button>`).join('')}</div><button type="button" class="x" aria-label="關閉">${ICON.close}</button></div></div>`);
    m.addEventListener('click', e => {
      const b = e.target.closest('[data-doc]');
      if (b) { sfx('tap'); m.remove(); readDoc(b.dataset.doc); return; }
      if (e.target.closest('.x') || e.target === m) { sfx('tap'); m.remove(); }
    });
    el.appendChild(m);
  });

  // ---------- 目標與三階提示（第一節全免費） ----------
  const STEPS = [
  { k: 'P01', done: () => F.P01_SOLVED, goal: '恢復電源', hl: ['panel'], hl3: ['panel'], hints: [
    '閱覽室牆上有一個備用配電箱。它不是壞了，是跳脫了。',
    '配電箱門內側有一張負載表，有一格被弄髒了。上方的錶記得跳脫那一刻的負載。',
    '跳脫時 A、B 開著＝7A，所以 B＝5A。開 A、關 B、開 C，合計 5A。'] },
  { k: 'CARD', done: () => F.AREA_B_OPEN, goal: '用訪客卡打開通道門', hl: () => (has('card') ? ['door'] : ['card']), hints: [
    '桌上有一張臨時訪客卡。', '點道具欄的訪客卡，再點通道門。', '先拿桌上的訪客卡，再點通道門刷卡。'] },
  { k: 'P02', done: () => F.P02_SOLVED, goal: '校正時間', hl: ['term', 'creader', 'duty', 'clock'], hl3: ['term'], hints: [
    '同一件事，被兩台機器各記了一次。找出那件事。',
    '讀卡器測試表上的測試卡 T-07，也出現在值班登記板上。或者——牆上的鐘是什麼時候停的？',
    'T-07：終端 20:50、標準時 20:43。終端快 7 分鐘，在終端輸入 −7。'] },
  { k: 'P03', done: () => F.P03_SOLVED, goal: '找出維護卷宗', hl: ['cab', 'label', 'rule'], hl3: ['d-c4r3', 'cab'], hints: [
    '維修標籤是維修人員寫給自己看的。他寫日期的習慣，和牆上的命名規則一樣嗎？',
    '標籤寫「12/4・春季例行」。春季是幾月？',
    '12/4＝4 月 12 日 → DDMM＝1204 → 打開 1204-M-03（第三排第四格）。'] },
  { k: 'P04', done: () => F.P04_SOLVED, goal: '還原錄音', hl: ['memo', 'bell', 'scan', 'film'], hl3: ['rec'], hints: [
    '便條寫的是操作步驟，不是聲音。每個步驟會發出什麼聲音？',
    '去點提示鈴、掃描機、膠卷盒，聽聽它們的聲音。這間房裡沒有電話。',
    '〔叮、叮〕→〔低沉的嗡鳴〕→〔喀一聲〕；電話鈴那段不屬於這捲帶子。'] },
  { k: 'P05', done: () => F.P05_SOLVED, goal: '完成最終推理', hl: ['console'], hl3: ['console'], hints: [
    '每個結論都要插一張證據卡才算數。',
    '我在館裡的證據在閱覽室；錄音的證據是磁帶；清場表的問題要看簽名和測試啟動的先後。',
    '①已在閱覽室＋申請單（或訪客卡背面）②不足以證明＋磁帶 ③尚未釐清＋訪客出入紀錄。'] },
  { k: 'CHK', done: () => F.CHECKS_DONE, goal: '完成人工清查', hl: ['chk'], hl3: ['chk'], hints: [
    '右側牆上的人工清場面板有三個清查點。',
    '清查表只能寫你親眼確認過的事。',
    '閱覽室已清查、走廊已清查；在館人數切到 1 再確認。'] },
  { k: 'EXIT', done: () => F.N01_CLEAR, goal: '離開舊文獻館', hl: ['shutter'], hints: ['安全門已經打開。', '點安全門離開。', '點安全門離開。'] },
  ];
  const cur = () => STEPS.find(s => !s.done()) || STEPS[STEPS.length - 1];
  const paintGoal = () => { $(el, '#goal').textContent = '目標　' + (F.EV_N01_START ? cur().goal : '—'); };
  const cuOpenNow = () => !cu.classList.contains('hidden');
  function flash(ids, ms = 5000) { ids.forEach(id => el.querySelectorAll(`[data-hs="${id}"]`).forEach(b => { b.classList.add('show'); setTimeout(() => b.classList.remove('show'), ms); })); }
  const hlIds = (lv = 2) => { const st = cur(); const h = lv >= 3 && st.hl3 ? st.hl3 : st.hl; return typeof h === 'function' ? h() : h; };
  // 提示鈕預設 .dim；同一步驟 90 秒沒進展 → .pulse（不再自動閃熱點）
  let idleT = 0, idleK = null;
  const hintBtn = $(el, '#hintBtn'); hintBtn.classList.add('dim');
  const armIdle = () => {
    const k = F.EV_N01_START ? cur().k : null;
    if (k === idleK && idleT) return;
    idleK = k; clearTimeout(idleT); hintBtn.classList.remove('pulse'); hintBtn.classList.add('dim');
    idleT = setTimeout(() => { if (alive && F.EV_N01_START) { hintBtn.classList.remove('dim'); hintBtn.classList.add('pulse'); } idleT = 0; }, window.__N01_IDLE_MS || 90000);
  };
  el.addEventListener('pointerdown', armIdle);
  hintBtn.addEventListener('click', async () => {
    sfx('tap');
    if (!F.EV_N01_START) { toast('這裡不需要提示，往下看劇情吧。'); return; }
    const st = cur(); const lv = Math.min((S0.hints[st.k] || 0) + 1, 3);
    const cost = lv === 2 ? 30 : lv === 3 ? 60 : 0;
    if (cost && (S0.hints[st.k] || 0) < lv) {
      const ok = await modal({ title: `提示 ${lv}／3`, body: lv === 2 ? '花 30 秒換提示？' : '花 60 秒看答案？', buttons: [{ label: '先不要', kind: 'btn-line', value: false }, { label: '好', kind: 'btn', value: true }] });
      if (!ok || !alive) return;
      S0.timer -= cost; paintTimer(); S0.hintCost = (S0.hintCost || 0) + 1;
    } else if (!cost && !(S0.hints[st.k])) S0.hintCost = (S0.hintCost || 0) + 1;
    S0.hints[st.k] = lv; persist();
    hintBtn.classList.remove('pulse'); hintBtn.classList.add('dim');
    sfx('hint'); if (lv >= 2) flash(hlIds(lv));
    sys([`提示 ${lv}／3：${st.hints[lv - 1]}`], 4200);
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
    const ok = await modal({ title: '離開關卡', body: '目前的進度與剩餘時間會保存，下次可以從這裡繼續。', buttons: [{ label: '繼續調查', kind: 'btn-line', value: false }, { label: '離開', kind: 'btn', value: true }] });
    if (ok && alive) { persist(); go('stages', { tab: 0 }); }
  });

  // ---------- 超時：安全門鎖定、夜間保安通報，無限次重試 ----------
  function timeout() {
    if (ended) return;
    ended = true; running = false; alive = false; F.N01_TIMEOUT = true;
    meta.st = null; save();
    const b = html(`<div class="n1-fail"><div class="n1-shut" aria-hidden="true"></div><img class="n1-failscr" src="${IMG('N01-SCR-05.webp')}" alt=""><div class="col" style="align-items:center;gap:16px;z-index:2">
<div class="label">EV_TIMEOUT</div><h2>安全門已自動鎖定</h2><p>夜間安全系統已啟動。保安正在趕來——在那之前，你哪裡都去不了。</p>
<div class="row" style="gap:16px;height:56px"><button type="button" class="btn-line" data-a="out" style="width:208px">返回關卡選擇</button><button type="button" class="btn" data-a="retry" style="width:208px">重新挑戰</button></div></div></div>`);
    b.addEventListener('click', e => { const a = e.target.closest('[data-a]'); if (!a) return; sfx('tap'); if (a.dataset.a === 'retry') go('n01', { retry: true }); else go('stages', { tab: 0 }); });
    el.appendChild(b); sfx('error');
  }

  // ================= 場景 =================
  // ---------- 可互動小物件（v2.2 近景；不推進劇情，只給系統描述） ----------
  // sp＝可移動部件在近景舞台上的位置（interactable_sprites.json ÷2）；mv＝移開方式
  const INT = {
    phone: { cu: 'N01-INT-001-PHONE', name: '桌上電話', dark: true, sp: [281, 75, 733, 245], mv: 'translate(-40px,-90px) rotate(-6deg)', mvLabel: '拿起話筒', mvLine: ['話筒裡沒有聲音。托架周圍有一圈沒積灰的乾淨印子。'] },
    lamp: { cu: 'N01-INT-001-LAMP', name: '銀行燈', line: ['照明：ON'] },
    shelf: { cu: 'N01-INT-001-SHELFBOX', name: '書架檔案箱', dark: true, sp: [837, 231, 334, 383], mv: 'scale(1.18) translateY(30px)', mvLabel: '把箱子滑出', mvLine: ['架上露出一塊沒積灰的長方形，和幾根散落的釘書針。箱子後面只有牆。'] },
    lamp2: { cu: 'N01-INT-002-LAMP', name: '終端旁檯燈', line: ['檯燈的燈頭可以轉動。'] },
    filebox: { cu: 'N01-INT-002-FILEBOX', name: '桌上收納盒', sp: [363, 263, 634, 102], mv: 'translateY(-70px) rotate(-3deg)', mvLabel: '掀開蓋子', mvLine: ['空白的磁碟片和一卷印表機色帶。'] },
    drawer2: { cu: 'N01-INT-002-DESKDRAWER', name: '終端桌抽屜', sp: [448, 108, 386, 157], mv: 'scale(1.08) translateY(24px)', mvLabel: '拉開抽屜', mvLine: ['舊鉛筆、橡皮擦、斷掉的尺、幾張空白便條。'] },
    reader: { cu: 'N01-INT-003-READER', name: '微縮膠片閱讀機', line: ['閱讀機沒有裝膠片，螢幕只有一片空白光。'] },
    drawer3: { cu: 'N01-INT-003-DESKDRAWER', name: '閱讀機桌抽屜', sp: [399, 130, 482, 131], mv: 'scale(1.08) translateY(24px)', mvLabel: '拉開抽屜', mvLine: ['備用燈泡、一盒保險絲、一捲絕緣膠帶。'] },
    wlamp: { cu: 'N01-INT-003-WORKLAMP', name: '夾式工作燈', line: ['夾式工作燈，燈頭可以轉向櫃子或工作桌。'] },
    inter: { cu: 'N01-INT-004-INTERCOM', name: '對講機', sp: [458, 45, 142, 422], mv: 'translate(-60px,-50px) rotate(-8deg)', mvLabel: '拿起話筒', mvLine: ['〔只有電流聲〕', '對講機：無人應答'] },
    lamp4: { cu: 'N01-INT-004-LAMP', name: '控制台檯燈', line: ['檯燈照著控制台的按鈕。'] },
    window4: { cu: 'N01-INT-004-WINDOW', name: '控制間窗戶', line: ['外面是雨。看不清街道。'] },
    cabinet: { cu: 'N01-INT-004-CABINET', name: '控制台下櫃門', sp: [127, 141, 514, 453], mv: 'perspective(900px) rotateY(-70deg)', origin: 'left center', mvLabel: '打開櫃門', mvLine: ['整束接線，和一排老式保險絲座。'] },
    beacon: { cu: 'N01-INT-004-BEACON', name: '紅色警示燈', line: ['玻璃罩裡積著灰和幾隻死蟲。'] },
  };
  async function inspect(k) {
    const d = INT[k]; let moved = false;
    const dim = d.dark && !F.P01_SOLVED ? 'filter:brightness(.5) saturate(.75)' : '';
    const paint = () => openCu(`<img class="bg" src="${IMG(d.cu + (moved ? '_revealed' : '_closeup') + '.webp')}" alt="${d.name}近景" style="${dim}">`,
      moved || !d.sp ? [] : [{ id: 'mv', x: d.sp[0], y: d.sp[1], w: d.sp[2], h: d.sp[3], label: d.mvLabel }]);
    paint();
    if (d.line) sys(d.line, 2000);
    return loop(async id => {
      if (id === 'back') { closeCu(); return true; }
      if (id !== 'mv' || moved) return;
      moved = true; sfx(k === 'phone' || k === 'inter' ? 'pick' : 'door'); paint();
      const [x, y, w, h] = d.sp;
      const sp = html(`<img class="n1-spr n1-mvspr" src="${IMG(d.cu + '_sprite.webp')}" alt="" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;${dim}${d.origin ? `transform-origin:${d.origin};` : ''}">`);
      cu.insertBefore(sp, cu.querySelector('.g1-cuback'));
      await wait(30); sp.style.transform = d.mv; sp.style.opacity = '0';
      await wait(480); sp.remove(); S();
      await sys(d.mvLine, 2600); S();
    });
  }
  // 冷卻／鎖定：存結束時間，重整後繼續算
  const secsLeft = k => Math.max(0, Math.ceil(((F[k] || 0) - Date.now()) / 1000));
  const lockFor = (k, sec) => { F[k] = Date.now() + sec * 1000; persist(); };
  function ticker(k, onTick, onDone) {
    const iv = setInterval(() => { if (!alive) return clearInterval(iv); const n = secsLeft(k); if (n > 0) onTick(n); else { clearInterval(iv); onDone(); } }, 250);
    return iv;
  }

  // ---------- A 閱覽室（BG-001） ----------
  const A_HS = () => [
    { id: 'i-shelf', x: 356, y: 131, w: 81, h: 63, label: '書架檔案箱' },
    { id: 'panel', x: 40, y: 140, w: 212, h: 182, label: '備用配電箱' },
    { id: 'phone', x: 204, y: 410, w: 150, h: 100, label: '桌上電話' },
    { id: 'lamp', x: 356, y: 306, w: 170, h: 150, label: '銀行燈' },
    { id: 'form', x: 570, y: 448, w: 162, h: 106, label: '文件申請表' },
    { id: 'cup', x: 484, y: 456, w: 74, h: 56, label: '咖啡杯' },
    { id: 'note', x: 448, y: 498, w: 68, h: 42, label: '咖啡杯旁的紙條' },
    { id: 'tape', x: 760, y: 488, w: 112, h: 60, label: '錄音磁帶' },
    { id: 'card', x: 886, y: 462, w: 98, h: 100, label: '臨時訪客卡' },
    { id: 'door', x: 982, y: 136, w: 172, h: 304, label: '通道門與讀卡器' },
  ];
  // 拿走的物品：正式空桌補丁，依光線狀態換圖（舞台座標）
  const TAKEN = { card: [872.67, 446, 130, 129.33], cass: [738.67, 452, 150.67, 113.33], slip: [422.67, 476, 124, 92.67] };
  const TK = { card: 'card', tape: 'cass', note: 'slip' };
  const litKey = () => (F.P01_SOLVED ? 'N01-BG-001-solved' : 'N01-BG-001-dark');
  const takenSpr = k => { const n = TK[k]; const [x, y, w, h] = TAKEN[n]; const o = ob('t-' + k); if (o) o.remove(); addSpr('t-' + k, `${litKey()}-taken-${n}.webp`, x, y, w, h); };
  function sceneAState() {
    setBg(litKey());
    const r = ob('reader'); if (r) r.remove();
    addSpr('reader', F.P01_SOLVED ? 'N01-PROP-043.webp' : 'N01-PROP-042.webp', 1226.67, 253.33, 33.33, 33.33);
    ['card', 'tape', 'note'].forEach(k => { if (has(k)) { takenSpr(k); dropHs(k); } });
  }
  async function sceneA() {
    setScene(litKey(), '閱覽室', A_HS());
    sceneAState(); paintGoal();
    return loop(async (id, item) => {
      if (id === 'back') { closeCu(); return; }
      if (id === 'panel') { await p01(); sceneAState(); return; }
      if (id === 'lamp') { if (!F.P01_SOLVED) return void sys(['照明：未供電'], 1400); await inspect('lamp'); return; }
      if (id === 'i-shelf') { await inspect('shelf'); return; }
      if (id === 'phone') {
        if (!F.n01_phone_rang) {
          sfx('ring2'); await sys(['〔電話鈴響兩聲〕'], 1700); S(); flag('n01_phone_rang');
          openCu(`<img class="bg" src="${IMG('N01-INT-001-PHONE_closeup.webp')}" alt="桌上電話近景" style="${F.P01_SOLVED ? '' : 'filter:brightness(.5) saturate(.75)'}">`);
          await me('……沒有人。只是一個舊鈴聲。'); S();
        }
        await inspect('phone'); return;
      }
      if (id === 'form') { await readDoc('form'); S0.habit++; return; }
      if (id === 'cup') return void sys(['咖啡杯'], 1000);
      if (id === 'note') { flag('CUP_MOVED'); addItem('note'); takenSpr('note'); dropHs('note'); await readDoc('noteF'); flag('NOTE_READ'); return; }
      if (id === 'card') { addItem('card'); takenSpr('card'); dropHs('card'); await readDoc('cardback'); return; }
      if (id === 'tape') { addItem('tape'); takenSpr('tape'); dropHs('tape'); return; }
      if (id === 'door') {
        if (F.AREA_B_OPEN) return 'B';
        if (!F.P01_SOLVED) { sfx('error'); return void sys(['讀卡器沒有反應：門禁未供電'], 1800); }
        if (item !== 'card') { sfx('error'); return void sys([has('card') ? '請使用訪客卡' : '需要訪客卡'], 1600); }
        sfx('unlock'); flag('AREA_B_OPEN'); paintGoal(); await sys(['讀卡成功'], 1000); S(); return 'B';
      }
    });
  }
  // P01：照明 2A、監控 5A（負載表上被弄髒）、門禁 3A，額定 6A。開場＝跳脫當下的拉桿位置 ↑↑↓（7A）
  // 電流錶（G03）：黑針＝目前負載（程式旋轉，蓋掉畫死的黑針），紅針＝上次跳脫 7A（畫死）
  async function p01() {
    const sw = F.P01_SW || { A: true, B: true, C: false };
    if (F.P01_TRIP === undefined) F.P01_TRIP = true;
    const AMP = { A: 2, B: 5, C: 3 }, NAME = { A: '照明', B: '監控', C: '門禁' };
    const LX = { A: 373, B: 526, C: 678 }, MX = { A: 384, B: 535, C: 687.5 };
    const TBL = [['A 照明', '2A'], ['B 監控', ''], ['C 門禁', '3A'], ['額定', '6A']], TY = [251, 305, 360, 414];
    const sum = () => (F.P01_TRIP ? 0 : Object.keys(AMP).reduce((t, k) => t + (sw[k] ? AMP[k] : 0), 0));
    const needle = L => -80.7 + 16.39 * L;
    let iv = 0;
    const stateTxt = () => {
      if (F.P01_SOLVED) return '門禁控制器已恢復';
      const c = secsLeft('P01_COOL'); if (c) return `過載跳脫・冷卻 ${c}`;
      if (F.P01_TRIP) return '已跳脫：重新投入任一迴路';
      if (sw.C && !sw.A) return '門禁已供電：讀卡器指示燈無電（A 迴路）';
      return !sw.C ? '門禁未供電' : '';
    };
    const paint = () => {
      const cool = secsLeft('P01_COOL') > 0, L = sum();
      openCu(`<img class="bg" src="${IMG('N01-BG_DETAIL-007.webp')}" alt="備用配電箱近景"><div class="n1-trip" id="trip"></div>` +
        `<img class="n1-spr" src="${IMG('N01-BG_DETAIL-007-noneedle.webp')}" alt="" style="left:510px;top:228px;width:92px;height:34px">` +
        `<img class="n1-spr n1-needle" src="${IMG('N01-BG_DETAIL-007-needle-black.webp')}" alt="" style="left:504.375px;top:151.875px;width:200px;height:200px;transform:rotate(${(needle(L) + 80.7).toFixed(2)}deg)">` +
        TBL.map(([a, b], i) => `<div class="n1-tag sheet" style="left:967px;top:${TY[i]}px">${a}</div>` + (b ? `<div class="n1-tag sheet" style="left:1058px;top:${TY[i]}px">${b}</div>` : '')).join('') +
        ['A', 'B', 'C'].map(k => `<img class="n1-spr" src="${IMG(sw[k] ? 'N01-PROP-041-lever-up.webp' : 'N01-PROP-041-lever-down.webp')}" alt="" style="left:${LX[k]}px;top:325px;width:103px;height:170px">` +
          `<img class="n1-spr" src="${IMG(sw[k] && !F.P01_TRIP ? 'N01-PROP-041-lamp-on.webp' : 'N01-PROP-041-lamp-off.webp')}" alt="" style="left:${MX[k]}px;top:255px;width:80px;height:80px">` +
          `<div class="n1-stamp" style="left:${LX[k] + 51}px;top:540px">${k}　${NAME[k]}</div>`).join('') +
        `<div class="n1-state n1-st007" id="p01st">${stateTxt()}</div>`,
      [{ id: 'sheet', x: 905, y: 170, w: 230, h: 300, label: '迴路負載表' }, ...(F.P01_SOLVED || cool ? [] : ['A', 'B', 'C'].map(k => ({ id: 'sw' + k, x: LX[k] - 8, y: 318, w: 119, h: 186, label: `${k} ${NAME[k]} 開關` })))]);
      if (cool) { clearInterval(iv); iv = ticker('P01_COOL', () => { const s = cu.querySelector('#p01st'); if (s) s.textContent = stateTxt(); }, () => { if (cu.querySelector('#p01st')) paint(); }); }
    };
    paint();
    const r = await loop(async id => {
      if (id === 'back') { closeCu(); return true; }
      if (id === 'sheet') { await readDoc('loadsheet'); return; }
      if (!id.startsWith('sw') || F.P01_SOLVED || secsLeft('P01_COOL')) return;
      const k = id[2]; sw[k] = !sw[k]; F.P01_TRIP = false; F.P01_SW = { ...sw }; persist(); sfx('clang');
      if (sum() > 6) {
        paint(); await wait(350); S();
        F.P01_TRIP = true; sw.A = sw.B = sw.C = false; F.P01_SW = { ...sw }; lockFor('P01_COOL', 20);
        sfx('error'); paint(); const t = cu.querySelector('#trip'); if (t) t.classList.add('on');
        return;
      }
      if (sw.A && !sw.B && sw.C) {
        flag('P01_SOLVED'); paint(); sfx('unlock'); await wait(900); S(); closeCu(); sceneAState();
        await me('燈亮了，但門還是鎖著。'); S();
        await say('那代表至少有一件好事：它只是拒絕讓你出去，不是設備壞得開不了。', 'ind'); S();
        await me('……這算好事？'); S();
        await say('對調查來說，算。', 'ind'); S();
        paintGoal(); return true;
      }
      paint();
    });
    clearInterval(iv); return r;
  }

  // ---------- B 檔案走廊（BG-002） ----------
  const B_HS = () => [
    { id: 'i-lamp2', x: 137, y: 312, w: 100, h: 120, label: '終端旁檯燈' },
    { id: 'i-filebox', x: 169, y: 419, w: 70, h: 66, label: '桌上收納盒' },
    { id: 'i-drawer2', x: 390, y: 477, w: 75, h: 175, label: '終端桌抽屜' },
    { id: 'clock', x: 238, y: 98, w: 148, h: 200, label: '壁鐘' },
    { id: 'term', x: 240, y: 344, w: 172, h: 132, label: '保安終端' },
    { id: 'creader', x: 400, y: 314, w: 56, h: 72, label: '獨立讀卡器' },
    { id: 'doorC', x: 458, y: 130, w: 106, h: 460, label: '往微縮膠卷室的門' },
    { id: 'doorD', x: 820, y: 200, w: 150, h: 360, label: '往一樓出口控制間的樓梯' },
    { id: 'notice', x: 1018, y: 170, w: 112, h: 252, label: '軟木公告板' },
    { id: 'duty', x: 1132, y: 108, w: 26, h: 340, label: '值班登記板' },
  ];
  async function sceneB() {
    setScene(F.P02_SOLVED ? 'N01-BG-002-open' : 'N01-BG-002', '檔案走廊', B_HS());
    addBack('← 閱覽室', 'toA');
    paintGoal();
    return loop(async (id) => {
      if (id === 'back') { closeCu(); return; }
      if (id === 'toA') return 'A';
      if (id === 'clock') { await clockCu(); return; }
      if (id === 'i-lamp2') { await inspect('lamp2'); return; }
      if (id === 'i-filebox') { await inspect('filebox'); return; }
      if (id === 'i-drawer2') { await inspect('drawer2'); return; }
      if (id === 'creader') { await readDoc('test'); return; }
      if (id === 'notice') { await readDoc('notice'); return; }
      if (id === 'duty') { await readDoc('visit'); return; }
      if (id === 'term') { await p02(); return; }
      if (id === 'doorC') { if (!F.P02_SOLVED) { sfx('error'); return void sys(['檔案管理路徑尚未開放'], 1600); } return 'C'; }
      if (id === 'doorD') { if (!(F.P03_SOLVED && F.P04_SOLVED)) { sfx('error'); return void sys(['出口控制間尚未開放'], 1600); } return 'D'; }
    });
  }
  // 壁鐘近景（008）：停在 21:07:34，不播滴答聲
  async function clockCu() {
    openCu(`<img class="bg" src="${IMG('N01-BG_DETAIL-008.webp')}" alt="壁鐘近景">`, [{ id: 'plug', x: 610, y: 562, w: 30, h: 45, label: '插座' }]);
    if (!F.n01_clock_seen) { flag('n01_clock_seen'); await me('秒針沒在動。'); S(); }
    if (S0.read.includes('termlog') && !F.n01_clock_pair) { flag('n01_clock_pair'); await me('終端說斷電是 21:14。牆上的鐘說是 21:07。'); S(); }
    return loop(async id => {
      if (id === 'back') { closeCu(); return true; }
      if (id === 'plug') { await me('插頭還插著。是整條線路斷了電。'); S(); }
    });
  }
  function addBack(label, id) {
    const b = html(`<button type="button" class="btn-line g1-exit n1-back" data-hs="${id}">${label}</button>`);
    b.addEventListener('click', () => { sfx('tap'); emit({ type: 'hs', id, item: null }); });
    hsLayer.appendChild(b);
  }
  // P02：保安終端近景（PROP-046）；分頁「系統狀態／監控」；輸入列 ▲▼ ENTER（−15…+15），錯一次鎖 30 秒
  // 螢幕區：母片 [918,198,1830,876]／2 → 舞台 459,99,456×339
  async function p02() {
    const SCR = 'left:459px;top:99px;width:456px;height:339px';
    if (!F.TERM_BOOTED) {
      openCu(`<img class="bg" src="${IMG('N01-PROP-046.webp')}" alt="保安終端近景"><div class="n1-crt" style="${SCR}"><img src="${IMG('N01-SCR-01.webp')}" alt=""><div class="n1-crt-t boot">SECURITY TERMINAL<br>LOADING…</div></div>`);
      await wait(2200); S(); flag('TERM_BOOTED');
    }
    let tab = 'S', v = 0, msg = '', iv = 0, fx = '';
    const fmt = n => (n > 0 ? '+' + n : n === 0 ? '±0' : '−' + -n);
    const tabs = () => `<div class="n1-tab${tab === 'S' ? ' on' : ''}" style="left:11px;top:9px">系統狀態</div><div class="n1-tab${tab === 'C' ? ' on' : ''}" style="left:161px;top:9px">監控</div>`;
    const paint = (img) => {
      const lock = secsLeft('P02_LOCK');
      const hs = [{ id: 'tabS', x: 470, y: 108, w: 140, h: 30, label: '系統狀態分頁' }, { id: 'tabC', x: 620, y: 108, w: 140, h: 30, label: '監控分頁' }];
      let body;
      if (tab === 'C') {
        body = `<img src="${IMG(img || 'N01-SCR-04.webp')}" alt="">${tabs()}<div class="n1-crt-t row msg" style="left:4%;top:86%">監控迴路未供電（B 迴路 OFF）</div>`;
      } else {
        const t0 = hm(stdNow() + OFFSET);
        body = `<img src="${IMG('N01-SCR-06.webp')}" alt="">${tabs()}<div class="n1-crt-t" style="left:3%;top:18%">保安終端　系統狀態</div><div class="n1-crt-t clk" style="left:65%;top:15.5%;width:28.5%;height:17.8%">${t0}</div>
<div class="n1-crt-t row" style="left:4%;top:41%">21:14　備用電源切換／監控訊號中斷</div>` +
          (F.P02_SOLVED ? `<div class="n1-crt-t row ok" style="left:4%;top:52%">校正：終端 21:14 ＝ 標準時 21:07</div>`
            : `<div class="n1-crt-t row" style="left:4%;top:52%">時間校正</div><div class="n1-crt-t row${lock ? ' dimt' : ''}" style="left:4%;top:61.5%">終端時間 <b>${fmt(v)}</b> 分鐘 ＝ 標準時</div>` +
              `<div class="n1-crt-b${lock ? ' dimt' : ''}" style="left:241px;top:201px;width:40px">▲</div><div class="n1-crt-b${lock ? ' dimt' : ''}" style="left:285px;top:201px;width:40px">▼</div><div class="n1-crt-b${lock ? ' dimt' : ''}" style="left:341px;top:201px;width:96px">ENTER</div>`) +
          `<div class="n1-crt-t row msg" id="p02msg" style="left:4%;top:82%">${lock ? `校時失敗：終端鎖定 ${lock} 秒` : msg}</div>`;
        hs.push({ id: 'log', x: 470, y: 230, w: 434, h: 36, label: '終端紀錄' });
        if (!F.P02_SOLVED && !lock) hs.push({ id: 'up', x: 700, y: 300, w: 40, h: 36, label: '加一分鐘' }, { id: 'dn', x: 744, y: 300, w: 40, h: 36, label: '減一分鐘' }, { id: 'ent', x: 800, y: 300, w: 96, h: 36, label: '確認' });
      }
      openCu(`<img class="bg" src="${IMG('N01-PROP-046.webp')}" alt="保安終端近景"><div class="n1-crt" style="${SCR}">${body}${fx ? `<img class="n1-fx" src="${IMG(fx)}" alt="">` : ''}</div>`, hs);
      if (tab === 'S' && lock) { clearInterval(iv); iv = ticker('P02_LOCK', n => { const m = cu.querySelector('#p02msg'); if (m) m.textContent = `校時失敗：終端鎖定 ${n} 秒`; }, () => { if (cu.querySelector('#p02msg') && tab === 'S') { msg = ''; paint(); } }); }
    };
    paint();
    const r = await loop(async id => {
      if (id === 'back') { closeCu(); return true; }
      if (id === 'log') { await readDoc('termlog'); return; }
      if (id === 'tabS') { tab = 'S'; paint(); return; }
      if (id === 'tabC') {
        tab = 'C'; paint();
        if (F.P02_SOLVED && !F.n01_scr03_seen) {
          await wait(900); S();
          fx = 'N01-SCR-05.webp'; paint(); await wait(150); S();
          fx = ''; paint('N01-SCR-03.webp'); sfx('flash'); await wait(400); S();
          fx = 'N01-SCR-05.webp'; paint('N01-SCR-03.webp'); await wait(150); S();
          fx = ''; paint();
          flag('n01_scr03_seen');
          await me('……剛才那裡有人。'); S();
          await say('你說什麼？', 'ind'); S();
          await me('沒事。監控根本沒有電。'); S();
        }
        return;
      }
      if (secsLeft('P02_LOCK') || F.P02_SOLVED) return;
      if (id === 'up' || id === 'dn') { v = Math.max(-15, Math.min(15, v + (id === 'up' ? 1 : -1))); sfx('key'); msg = ''; paint(); return; }
      if (id !== 'ent') return;
      if (!(S0.read.includes('test') || F.n01_clock_seen)) { sfx('error'); msg = '資料不足：需要同一事件的兩筆紀錄'; paint(); return; }
      if (v !== -7) {
        sfx('error'); S0.timer -= 30; paintTimer(); lockFor('P02_LOCK', 30);
        if (!F.P02_FAILED) { flag('P02_FAILED'); fx = 'N01-SCR-05.webp'; paint(); await wait(150); S(); fx = ''; }
        paint(); return;
      }
      flag('P02_SOLVED'); sfx('unlock'); paint(); await wait(900); S(); closeCu(); setBg('N01-BG-002-open');
      await me('你早就知道這裡的時鐘有問題？'); S();
      await say('我知道它以前出過問題。', 'ind'); S();
      await me('那為什麼你剛才不提醒我？'); S();
      await say('因為我不確定問題還在不在。你現在給了我答案。', 'ind'); S();
      paintGoal(); return true;
    });
    clearInterval(iv); return r;
  }

  // ---------- C 微縮膠卷室（BG-003） ----------
  // 命名規則卡、維修標籤、操作順序便條已畫進背景（rule 300,252／label 546,362／memo 846,474）
  const C_HS = () => [
    { id: 'i-reader', x: 400, y: 144, w: 140, h: 100, label: '微縮膠片閱讀機' },
    { id: 'i-drawer3', x: 662, y: 387, w: 144, h: 169, label: '閱讀機桌抽屜' },
    { id: 'i-wlamp', x: 1160, y: 169, w: 120, h: 160, label: '夾式工作燈' },
    { id: 'cab', x: 0, y: 20, w: 286, h: 640, label: '卷宗櫃' },
    { id: 'rule', x: 300, y: 252, w: 92, h: 70, label: '文件命名規則' },
    { id: 'label', x: 546, y: 362, w: 84, h: 54, label: '維修標籤' },
    { id: 'scan', x: 628, y: 300, w: 154, h: 76, label: '掃描機' },
    { id: 'rec', x: 954, y: 334, w: 268, h: 142, label: '錄音設備' },
    { id: 'memo', x: 846, y: 474, w: 82, h: 70, label: '操作順序便條' },
    { id: 'bell', x: 972, y: 488, w: 100, h: 72, label: '提示鈴' },
    { id: 'film', x: 1084, y: 430, w: 74, h: 120, label: '膠卷盒' },
    { id: 'toB2', x: 880, y: 80, w: 170, h: 250, label: '回檔案走廊的門口' },
  ];
  async function sceneC() {
    setScene(F.P03_SOLVED ? 'N01-BG-003-open' : 'N01-BG-003', '微縮膠卷室', C_HS());
    const rb = $(hsLayer, '[data-hs="rule"]'); if (rb) rb.classList.add('n1-glow');
    addBack('← 檔案走廊', 'toB');
    paintGoal();
    return loop(async id => {
      if (id === 'back') { closeCu(); return; }
      if (id === 'toB' || id === 'toB2') return 'B';
      if (id === 'rule') { await readDoc('rule'); return; }
      if (id === 'label') { await readDoc('label'); return; }
      if (id === 'memo') { await readDoc('order'); return; }
      if (id === 'bell') { sfx('bell2'); flag('n01_snd_bell'); return void sys(['〔叮、叮〕'], 1300); }
      if (id === 'scan') { sfx('hum'); flag('n01_snd_scan'); return void sys(['〔低沉的嗡鳴〕'], 1500); }
      if (id === 'film') { sfx('snap'); flag('n01_snd_film'); return void sys(['〔塑膠扣上的喀一聲〕'], 1300); }
      if (id === 'i-reader') { await inspect('reader'); return; }
      if (id === 'i-drawer3') { await inspect('drawer3'); return; }
      if (id === 'i-wlamp') { await inspect('wlamp'); return; }
      if (id === 'cab') { await p03(); return; }
      if (id === 'rec') { await p04(); return; }
    });
  }
  // P03：卷宗櫃近景（BG_DETAIL-009）5×4 抽屜；目標 c4r3＝1204-M-03。M 類開錯 −15 秒、M 類抽屜鎖 15 秒
  const CELL_X = [[40, 270], [277, 510], [517, 751], [758, 1000], [1007, 1242]];
  const CELL_Y = [[30, 220], [227, 410], [417, 599], [606, 720]];
  const LABEL_Y = [97, 285, 473, 660];
  const CODES = [['1104-M-03', '0312-A-01', '2204-S-02', '1204-M-02', '0701-R-04'], ['1204-R-03', '0911-A-02', '3003-M-01', '1504-S-03', '1204-A-01'], ['0612-M-05', '2104-M-03', '0412-M-03', '1204-M-03', '1902-R-02'], ['2512-S-01', '1204-M-30', '0805-A-03', '1003-M-04', '2711-R-01']];
  const DRAWER = { c1r1: 'C03', c2r1: 'C01', c3r1: 'C07', c4r1: 'C04', c5r1: 'C03', c1r2: 'C02', c2r2: 'C09', c3r2: 'C06', c4r2: 'C03', c5r2: 'C10', c1r3: 'C05', c2r3: 'C01', c3r3: 'C08', c4r3: 'T01', c5r3: 'C03', c1r4: 'C04', c2r4: 'C02', c3r4: 'C10', c4r4: 'C06', c5r4: 'C01' };
  const DRAWER_LINE = {
    C05: '照片面朝下，背面的日期被人用指甲刮掉了。……正面，我現在還不想翻過來看。',
    C08: '我好像在哪裡看過這把鑰匙。它對不上這棟館裡任何一道鎖——至少今晚沒有。',
  };
  const isM = c => c.split('-')[1] === 'M';
  async function p03() {
    let iv = 0;
    const paint = () => {
      const ml = secsLeft('P03_MLOCK');
      openCu(`<img class="bg" src="${IMG(F.P03_SOLVED ? 'N01-BG_DETAIL-009-open.webp' : 'N01-BG_DETAIL-009.webp')}" alt="卷宗櫃近景"><div class="n1-plate009">卷宗櫃 C-2　M 類管制</div>` +
        CODES.map((row, r) => row.map((c, ci) => (F.P03_SOLVED && r === 2 && ci === 3) ? '' : `<div class="n1-tag${ml && isM(c) ? ' dimt' : ''}" style="left:${(CELL_X[ci][0] + CELL_X[ci][1]) / 2}px;top:${LABEL_Y[r]}px">${c}</div>`).join('')).join('') +
        (ml ? `<div class="n1-state" id="p03st" style="left:640px;top:690px">M 類抽屜鎖定 ${ml} 秒</div>` : ''),
      F.P03_SOLVED ? [] : CODES.flatMap((row, r) => row.map((c, ci) => ({ c, id: `d-c${ci + 1}r${r + 1}`, x: CELL_X[ci][0], y: CELL_Y[r][0], w: CELL_X[ci][1] - CELL_X[ci][0], h: CELL_Y[r][1] - CELL_Y[r][0], label: `抽屜 ${c}` }))).filter(h => !(ml && isM(h.c))));
      if (ml) { clearInterval(iv); iv = ticker('P03_MLOCK', n => { const s = cu.querySelector('#p03st'); if (s) s.textContent = `M 類抽屜鎖定 ${n} 秒`; }, () => { if (cu.querySelector('#p03st')) paint(); }); }
    };
    paint();
    const r = await loop(async id => {
      if (id === 'back') { closeCu(); return true; }
      if (!id.startsWith('d-')) return;
      const cell = id.slice(2), content = DRAWER[cell];
      const code = CODES[+cell[3] - 1][+cell[1] - 1];
      if (isM(code) && secsLeft('P03_MLOCK')) return;
      sfx('door');
      if (content !== 'T01') {
        const v = html(`<div class="g1-docback n1-drawer" role="dialog" aria-label="打開的抽屜"><img src="${IMG('N01-DRW-' + content + '.webp')}" alt="抽屜內部">${content === 'C09' ? '<div class="n1-tag card">2104-M-03</div>' : ''}<div class="g1-dochint">點一下關上抽屜</div></div>`);
        el.appendChild(v);
        if (DRAWER_LINE[content]) { await me(DRAWER_LINE[content], { pic: false }); S(); if (content === 'C05') flag('n01_photo_seen'); if (content === 'C08') flag('n01_key_seen'); }
        if (isM(code)) { S0.timer -= 15; paintTimer(); lockFor('P03_MLOCK', 15); sfx('error'); await me('這份維護卷宗不是那一天的。', { pic: false }); S(); }
        await new Promise(r => v.addEventListener('click', () => { sfx('tap'); v.remove(); r(); })); S();
        paint(); return;
      }
      flag('P03_SOLVED'); sfx('unlock'); paint(); await wait(700); S();
      const v = html(`<div class="g1-docback n1-drawer" role="dialog" aria-label="卷宗 1204-M-03"><img src="${IMG('N01-DRW-T01.webp')}" alt="抽屜裡的卷宗"><div class="g1-dochint">點卷宗取出</div></div>`);
      el.appendChild(v);
      await new Promise(r => v.addEventListener('click', () => { sfx('pick'); v.remove(); r(); })); S();
      closeCu(); setBg('N01-BG-003-open'); addItem('file');
      await readDoc('clear'); S();
      await me('她說這裡沒有人。那我是什麼？'); S();
      paintGoal(); return true;
    });
    clearInterval(iv); return r;
  }
  // P04：錄音設備近景（BG_DETAIL-010）。四段片段只顯示字母＋擬聲字幕，字母每局洗牌（F.P04_ORDER）
  // 計數器窗（G05）舞台 565,435,108.5×32.5；歸零鈕中心 (718.5,451.5) r15＝重排
  const SEG = { bell: '〔叮、叮〕', scan: '〔低沉的嗡鳴〕', film: '〔塑膠扣上的喀一聲〕', phone: '〔電話鈴響兩聲〕' };
  const ANSWER = ['bell', 'scan', 'film'];
  async function p04() {
    if (F.P04_SOLVED) { await playFull(true); return; }
    let ctr = F.P04_CTR || 0;
    const counter = (spin) => `<div class="n1-ctr${spin ? ' spin' : ''}" id="ctr" style="left:565px;top:435px;width:108.5px;height:32.5px">${String(ctr % 1000).padStart(3, '0').split('').map(d => `<span>${d}</span>`).join('')}</div>`;
    const deck = (extra, list, play, spin) => openCu(`<img class="bg" src="${IMG('N01-BG_DETAIL-010.webp')}" alt="錄音設備近景"><div class="n1-vu${play ? ' on' : ''}" style="left:360px;top:260px"></div><div class="n1-vu${play ? ' on' : ''}" style="left:650px;top:260px"></div>${counter(spin)}${extra}`, list);
    if (!F.CH1_PLAYED) {
      deck('<div class="n1-stamp tape" style="left:640px;top:505px">第一聲道</div>', [], true);
      await say('不要讓他看見那份紀錄。', 'eileen'); S();
      await say('事情已經結束了。你不需要再記得。', 'male'); S();
      flag('CH1_PLAYED');
      closeCu();
      await me('教授。你有沒有什麼事情沒告訴我？'); S();
      await say('有。但我想你問的不是這個。', 'ind'); S();
    }
    if (!F.P04_ORDER) { const o = Object.keys(SEG); for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } flag('P04_ORDER', o); }
    const order = F.P04_ORDER, LET = ['A', 'B', 'C', 'D'];
    let pick = [], iv = 0;
    const paint = msg => {
      const rw = secsLeft('P04_REW');
      deck(`<div class="n1-stamp tape sm" style="left:640px;top:452px">第二聲道　片段排序</div>` +
        order.map((k, i) => `<div class="n1-seg2${pick.includes(k) ? ' used' : ''}${rw ? ' dimt' : ''}" style="left:${280 + i * 180}px;top:485px;width:176px"><b>${LET[i]}</b><small>${SEG[k]}</small></div>`).join('') +
        [0, 1, 2].map(i => `<div class="n1-key" style="left:${384 + i * 128}px;top:588px">${pick[i] ? LET[order.indexOf(pick[i])] : ''}</div>`).join('') +
        `<div class="n1-state n1-st010" id="p04st">${rw ? `倒帶中… ${rw}` : msg || ''}</div>`,
      rw ? [] : [...order.map((k, i) => ({ id: 's' + k, x: 282 + i * 180, y: 480, w: 176, h: 52, label: `片段 ${LET[i]}` })), { id: 'reset', x: 698, y: 431, w: 41, h: 41, label: '計數器歸零（重排）' }], false, rw > 0);
      if (rw) { clearInterval(iv); iv = ticker('P04_REW', n => { const s = cu.querySelector('#p04st'); if (s) s.textContent = `倒帶中… ${n}`; ctr = (ctr + 997) % 1000; const c = cu.querySelector('#ctr'); if (c) c.innerHTML = String(ctr).padStart(3, '0').split('').map(d => `<span>${d}</span>`).join(''); }, () => { F.P04_CTR = ctr = 0; persist(); if (cu.querySelector('#p04st')) paint(); }); }
    };
    paint();
    const r = await loop(async id => {
      if (id === 'back') { closeCu(); return true; }
      if (secsLeft('P04_REW')) return;
      if (id === 'reset') { pick = []; ctr = 0; F.P04_CTR = 0; sfx('key'); paint(); return; }
      if (id[0] !== 's') return;
      const k = id.slice(1); if (pick.includes(k)) return;
      pick.push(k); sfx('key'); ctr = (ctr + 137) % 1000; F.P04_CTR = ctr; persist();
      paint();
      if (k === 'phone' && !F.n01_phone_seg_heard) { flag('n01_phone_seg_heard'); await me('這段不是在這間房間錄的。電話……是閱覽室那一台？', { pic: false }); S(); }
      if (pick.length < 3) return;
      if (pick.join() !== ANSWER.join()) { sfx('error'); pick = []; S0.timer -= 15; paintTimer(); lockFor('P04_REW', 15); paint(); return; }
      flag('P04_SOLVED'); sfx('unlock'); paint('〔叮、叮〕→〔低沉的嗡鳴〕→〔喀一聲〕'); await wait(700); S(); closeCu();
      await playFull(false); S();
      paintGoal(); return true;
    });
    clearInterval(iv); return r;
  }
  async function playFull(replay) {
    cine.classList.remove('hidden');
    cine.innerHTML = `<img class="bg" src="${IMG('N01-BG_DETAIL-010.webp')}" alt="" style="filter:brightness(.45)"><div class="n1-vu on" style="left:360px;top:260px"></div><div class="n1-vu on" style="left:650px;top:260px"></div>${meta.seenTape ? '<button type="button" class="btn-line n1-skip">略過</button>' : ''}`;
    let skip = false;
    const sk = $(cine, '.n1-skip'); if (sk) sk.addEventListener('click', () => { skip = true; const s = el.querySelector('.sub'); if (s) s.click(); });
    const L = [['eileen', '不要讓他看見那份紀錄。'], ['sup', '為什麼？'], ['eileen', '那份檢查表還沒有完成。他又會把推測當成結論。'], ['sup', '事情已經結束了。那只是設備測試。'], ['eileen', '上次他說他記得所有故障紀錄，結果把年份都寫錯了。'], ['sup', '你不需要再記得每一個錯誤。查原始資料就好。']];
    for (const [w, t] of L) { if (skip) { S0.log.push([WHO[w], t]); continue; } await say(t, w); S(); }
    meta.seenTape = true; persist();
    cine.classList.add('hidden'); cine.innerHTML = '';
    if (!replay && has('tape')) await sys(['桌上那捲磁帶，是被擷取的同一段第一聲道。它可以當作證據。'], 2600);
  }

  // ---------- D 出口控制間（BG-004） ----------
  const D_HS = () => [
    { id: 'i-window4', x: 119, y: 19, w: 237, h: 190, label: '控制間窗戶' },
    { id: 'i-lamp4', x: 150, y: 212, w: 125, h: 128, label: '控制台檯燈' },
    { id: 'i-cab', x: 181, y: 484, w: 256, h: 147, label: '控制台下櫃門' },
    { id: 'i-beacon', x: 690, y: 62, w: 70, h: 69, label: '紅色警示燈' },
    { id: 'console', x: 134, y: 342, w: 318, h: 140, label: '出口控制台' },
    { id: 'shutter', x: 486, y: 214, w: 480, h: 388, label: '安全門' },
    { id: 'inter', x: 1004, y: 234, w: 84, h: 178, label: '對講機' },
    { id: 'chk', x: 1100, y: 164, w: 58, h: 236, label: '人工清場面板' },
  ];
  const leftovers = () => ['tape', 'note'].filter(k => !has(k));
  async function sceneD() {
    setScene(F.CHECKS_DONE ? 'N01-BG-004-open' : 'N01-BG-004', '出口控制間', D_HS());
    addBack('← 檔案走廊', 'toB');
    if (!F.D_INTRO) {
      flag('D_INTRO');
      await say('你應該看到出口了。', 'ind'); S();
      await me('嗯。但它說還有人員沒有確認。'); S();
      await say('那就告訴它，你在這裡。', 'ind'); S();
    }
    paintGoal();
    return loop(async id => {
      if (id === 'back') { closeCu(); return; }
      if (id === 'toB') return 'B';
      if (id === 'i-window4') { await inspect('window4'); return; }
      if (id === 'i-lamp4') { await inspect('lamp4'); return; }
      if (id === 'i-cab') { await inspect('cabinet'); return; }
      if (id === 'i-beacon') { await inspect('beacon'); return; }
      if (id === 'inter') { if (F.CHECKS_DONE) { await readDoc('release'); return; } await inspect('inter'); return; }
      if (id === 'console') {
        if (F.CHECKS_DONE) { await scr02(); return; }
        if (F.P05_SOLVED) return void sys(['驗證完成　請至右側人工清場面板'], 1800);
        await p05(); return;
      }
      if (id === 'chk') { if (!F.P05_SOLVED) { sfx('error'); return void sys(['請先在控制台完成驗證'], 1600); } if (F.CHECKS_DONE) { await readDoc('release'); return; } await checks(); return; }
      if (id === 'shutter') {
        if (!F.CHECKS_DONE) { sfx('error'); return void sys(['安全門鎖著：人工放行權限未取得'], 1600); }
        if (leftovers().length) collectLeft();
        return 'EXIT';
      }
    });
  }
  // 監控恢復（SCR-02）：第一次有台詞，之後點控制台開放行確認單
  async function scr02() {
    if (F.n01_scr02_seen) { await readDoc('release'); return; }
    openCu(`<img class="bg" src="${IMG('N01-BG_DETAIL-011.webp')}" alt="出口控制台近景"><div class="n1-crt amber" style="left:150px;top:154px;width:316px;height:226px"><img src="${IMG('N01-SCR-02.webp')}" alt=""><div class="n1-crt-t" style="left:6%;top:6%">監控恢復</div></div>`);
    flag('n01_scr02_seen');
    await me(F.n01_scr03_seen ? '四個畫面都是空的。剛才那個位置，也是空的。' : '四個畫面都是空的。'); S();
    return loop(async id => { if (id === 'back') { closeCu(); return true; } });
  }
  function collectLeft() {
    const l = leftovers(); if (!l.length) return;
    l.forEach(k => { if (!S0.items.includes(k)) S0.items.push(k); });
    persist(); paintSlots(l[0]); sfx('pick');
    sys([`已取回閱覽室桌上的遺留物品：${l.map(k => ITEMS[k].name).join('、')}`], 2400);
  }
  // P05：出口控制台近景（BG_DETAIL-011）。選答案 → 選證據卡（入卡槽）→ 按紅鈕送出；錯一次鎖 30 秒
  const CARDS = ['form', 'noteF', 'cardback', 'visit', 'termlog', 'test', 'label', 'rule', 'clear', 'order', 'tape'];
  const cardName = id => (id === 'tape' ? '錄音磁帶' : docBody(id, { pname }).title);
  async function p05() {
    const Q = [
      { q: '九點零六分清場簽名時，我在哪裡？', o: ['已在閱覽室', '尚未入館', '在走廊'], a: 0, ev: ['form', 'cardback'] },
      { q: '被裁切的錄音能證明什麼？', o: ['教授威脅過艾琳', '不足以證明教授威脅', '錄音是偽造的'], a: 1, ev: ['tape'] },
      { q: '清場表上的「無其他人員」？', o: ['是偽造的', '尚未釐清：簽在巡查之前', '確認無誤'], a: 1, ev: ['visit', 'clear'] },
    ];
    let qi = F.P05_Q || 0, opt = null, card = null, iv = 0;
    const known = id => (id === 'tape' ? has('tape') : S0.read.includes(id));
    const paint = msg => {
      const q = Q[qi], lock = secsLeft('P05_LOCK'), noData = !q.ev.some(known);
      const cards = CARDS.filter(known);
      const cw = Math.min(112, Math.floor((1100 - 8 * (cards.length - 1)) / Math.max(1, cards.length)));
      openCu(`<img class="bg" src="${IMG('N01-BG_DETAIL-011.webp')}" alt="出口控制台近景"><div class="n1-crt amber" style="left:150px;top:154px;width:316px;height:226px">
<div class="n1-crt-t" style="left:6%;top:4%">最終推理　${qi + 1}／3</div><div class="n1-crt-t tiny" style="left:6%;top:13%">每次驗證失敗，系統鎖定 30 秒</div><div class="n1-crt-t q" style="left:6%;top:22%">${q.q}</div>
${q.o.map((t, i) => `<div class="n1-crt-t opt${opt === i ? ' sel' : ''}${noData || lock ? ' dimt' : ''}" style="left:6%;top:${44 + i * 15}%">${opt === i ? '▶' : ''}${i + 1}．${t}</div>`).join('')}<div class="n1-crt-t msg" id="p05msg" style="left:6%;top:88%">${lock ? `推理不成立：系統鎖定 ${lock} 秒` : noData ? '資料不足' : msg || (opt === null ? '選一個結論' : card ? '按紅色按鈕送出' : '插入一張證據卡')}</div></div>` +
        (card ? `<div class="n1-slotcard" style="left:955px;top:415px;width:230px;height:75px"><span>${cardName(card)}</span></div>` : '') +
        `<div class="n1-cards">${cards.map((c, i) => `<div class="n1-card${c === card ? ' used' : ''}" style="left:${160 + i * (cw + 8)}px;top:600px;width:${cw}px;height:64px"><span>${cardName(c)}</span></div>`).join('')}</div>`,
      lock || noData ? [] : [
        ...q.o.map((t, i) => ({ id: 'a' + i, x: 158, y: 247 + i * 34, w: 300, h: 32, label: t })),
        ...cards.map((c, i) => ({ id: 'c-' + c, x: 160 + i * (cw + 8), y: 600, w: cw, h: 64, label: '證據卡 ' + cardName(c) })),
        { id: 'go', x: 1000, y: 160, w: 135, h: 130, label: '送出（紅色按鈕）' }]);
      if (lock) { clearInterval(iv); iv = ticker('P05_LOCK', n => { const m = cu.querySelector('#p05msg'); if (m) m.textContent = `推理不成立：系統鎖定 ${n} 秒`; }, () => { if (cu.querySelector('#p05msg')) paint(); }); }
    };
    paint();
    const r = await loop(async id => {
      if (id === 'back') { closeCu(); return true; }
      if (secsLeft('P05_LOCK')) return;
      if (id[0] === 'a') { opt = +id[1]; sfx('key'); paint(); return; }
      if (id.startsWith('c-')) {
        card = id.slice(2); sfx('card'); paint();
        const sc = cu.querySelector('.n1-slotcard'); if (sc) { sc.classList.add('in'); }
        return;
      }
      if (id !== 'go') return;
      if (opt === null || !card) { sfx('error'); paint(opt === null ? '先選一個結論' : '先插入一張證據卡'); return; }
      const q = Q[qi];
      if (opt !== q.a || !q.ev.includes(card)) {
        const wrong = card; sfx('error'); S0.timer -= 30; paintTimer(); lockFor('P05_LOCK', 30);
        const sc = cu.querySelector('.n1-slotcard'); if (sc) { sc.classList.add('out'); await wait(200); S(); }
        card = null; opt = null; paint();
        if (wrong === 'tape') { await playFull(true); S(); } else { await readDoc(wrong); S(); }
        paint(); return;
      }
      sfx('unlock'); qi++; opt = null; card = null; flag('P05_Q', qi);
      if (qi < 3) { paint(); return; }
      flag('P05_SOLVED');
      openCu(`<img class="bg" src="${IMG('N01-BG_DETAIL-011.webp')}" alt=""><div class="n1-crt amber" style="left:150px;top:154px;width:316px;height:226px"><div class="n1-crt-t q" style="left:6%;top:30%">驗證完成</div><div class="n1-crt-t" style="left:6%;top:50%">請至右側人工清場面板</div></div>`);
      await wait(1500); S(); closeCu(); paintGoal();
      await me('系統相信我了。現在只剩我自己還沒相信。'); S();
      flash(['chk'], 1500);
      return true;
    });
    clearInterval(iv); return r;
  }
  // 清查點：人工清場面板正面近景（BG_DETAIL-CHK，G06）。母片 2560，舞台＝÷2
  // 三根拉桿＝閱覽室／走廊／在館人數確認；旋鈕 0→1→2→3 設定人數；人數銘牌顯示「在館人數 n」
  async function checks() {
    if (F.CHECKS_DONE) return;
    const TG = [[436.1, 91.4], [436.1, 223.6], [436.1, 355.1]], TW = 87.2, TH = 91.4;
    const ON = [[420, 74], [420, 206], [420, 337.5]];
    const PL = [[780.3, 135.3], [780.3, 266.8], [780.3, 397.6]];
    const KC = [511, 546];
    const ok = F.CHK_OK || [false, false, false]; let n = F.CHK_N || 0;
    const NAMES = ['閱覽室已清查', '走廊已清查', '實際在館人數'];
    const paint = msg => {
      openCu(`<img class="bg" src="${IMG('N01-BG_DETAIL-CHK.webp')}" alt="人工清場面板近景">` +
        ON.map(([x, y], i) => (ok[i] ? `<img class="n1-spr" src="${IMG(`N01-CHK-row${i + 1}-on.webp`)}" alt="" style="left:${x}px;top:${y}px;width:274px;height:126.5px">` : '')).join('') +
        PL.map(([x, y], i) => `<div class="n1-stamp plate" style="left:${x}px;top:${y}px">${NAMES[i]}</div>`).join('') +
        `<img class="n1-spr n1-knob" src="${IMG('N01-CHK-knob.webp')}" alt="" style="left:462.5px;top:497.5px;width:96px;height:96px;transform:rotate(${n * 90}deg)">` +
        [0, 1, 2, 3].map(i => { const a = i * Math.PI / 2, rr = 86; return `<div class="n1-kd${i === n ? ' on' : ''}" style="left:${KC[0] + Math.sin(a) * rr}px;top:${KC[1] - Math.cos(a) * rr}px">${i}</div>`; }).join('') +
        `<div class="n1-stamp plate big" style="left:774px;top:541.4px">在館人數 ${n}</div>` +
        `<div class="n1-state" style="left:640px;top:684px">${msg || '扳下開關確認每一項'}</div>`,
      [...TG.map(([x, y], i) => ({ id: 'sw' + i, x, y, w: TW, h: TH, label: `${NAMES[i]} 確認開關` })),
        { id: 'knob', x: KC[0] - 60, y: KC[1] - 60, w: 120, h: 120, label: '人數旋鈕' }, { id: 'cnt', x: 671, y: 505, w: 206, h: 73, label: '在館人數銘牌' }]);
    };
    paint();
    return loop(async id => {
      if (id === 'back') { closeCu(); return true; }
      if (id === 'knob' || id === 'cnt') { if (!ok[2]) { n = (n + 1) % 4; F.CHK_N = n; sfx('key'); paint(); } return; }
      if (!id.startsWith('sw')) return;
      const i = +id[2]; if (ok[i]) return;
      if (i === 2 && n !== 1) {
        if (n === 2 && !F.n01_tried_two) { flag('n01_tried_two'); await me('我沒有親眼確認第二個人。清查表只能寫我看見的。', { pic: false }); S(); return; }
        sfx('error'); S0.timer -= 20; paintTimer(); paint('清查內容與現場不符'); return;
      }
      ok[i] = true; F.CHK_OK = [...ok]; persist(); sfx('clang'); paint();
      if (!ok.every(Boolean)) return;
      flag('CHECKS_DONE'); sfx('unlock'); await wait(600); S(); closeCu(); setBg('N01-BG-004-checked'); await wait(800); S();
      await say('……喂？出口控制間？這個時間怎麼會有人在裡面。', 'guard'); S();
      await me('我被鎖在館裡了。系統說還有人員沒有確認。'); S();
      await say('今晚九點零二分開始夜間安全測試，測試期間門禁會自己鎖死。這是正常的。', 'guard'); S();
      await me('清場表上寫「無其他人員」，簽名是九點零六分。'); S();
      await say('喔，那是沃德小姐在測試前先簽的。……我們一直都這樣，不然要等巡完一圈。', 'guard'); S();
      await me('所以簽名的時候，沒有人真的上去看過二樓。'); S();
      await say('……還有走廊那台終端，上禮拜就說要校時，一直沒人弄。大概快了幾分鐘吧。', 'guard'); S();
      await say('放行我這邊按了。出去走側門台階，正門的感應燈壞了，很暗。', 'guard'); S();
      sfx('unlock'); setBg('N01-BG-004-open'); await wait(500); S();
      const c = await choose(['只是系統出錯', '有人說謊', '我還不知道']);
      S0.choices.D02 = c; persist();
      await say(['系統確實出了錯。但系統不會自己簽名。', '也許。但「沒做完」和「說謊」之間，還隔著很多種人。', '不知道，是一個可以接受的答案。'][c], 'ind'); S();
      await say('對了——你上來的時候，有沒有看到別人？', 'guard'); S();
      await me('……為什麼這樣問？'); S();
      await say('沒事。監控今晚整晚都沒訊號，我只是問問。', 'guard'); S();
      paintGoal(); return true;
    });
  }

  // ---------- 序幕、開場、結尾 ----------
  async function prologue() {
    cine.classList.remove('hidden');
    cine.innerHTML = `<div class="n1-shot" id="shot"></div>${meta.seenPrologue ? '<button type="button" class="btn-line n1-skip">略過</button>' : ''}`;
    $(el, '#black').classList.remove('on');
    let skip = false;
    const sk = $(cine, '.n1-skip'); if (sk) sk.addEventListener('click', () => { skip = true; const s = el.querySelector('.sub'); if (s) s.click(); });
    const shot = (id, label) => { $(cine, '#shot').innerHTML = `<img class="bg" src="${IMG(id + '.webp')}" alt="${label}" onerror="this.remove()">`; };
    const flashShot = async (n, label) => { if (skip) return; shot(`N01-VFX-088-${n}`, label); sfx('flash'); await wait(850); S(); $(cine, '#shot').innerHTML = ''; await wait(250); S(); };
    await wait(800); S();
    if (!skip) { await say('不要讓他看見那份紀錄……', 'fv'); S(); }
    await flashShot(1, '鑰匙'); await flashShot(2, '停下的懷錶'); await flashShot(3, '玻璃門後人影'); await flashShot(4, '遮住的檔案');
    if (!skip) { await say('事情已經結束了。你不需要再記得。', 'mv'); S(); }
    if (!skip) { await me('那不是我記得的版本。', { pic: false }); S(); }
    meta.seenPrologue = true; save();
    cine.classList.add('hidden'); cine.innerHTML = '';
  }
  async function opening() {
    await say('謝天謝地，你終於接電話了。', 'ind'); S();
    await me('教授？'); S();
    await say('你現在在哪裡？', 'ind'); S();
    await me('……一間閱覽室。我不確定。'); S();
    await say('看看桌上的文件，有沒有寫地址？', 'ind'); S();
    await me('灰橋舊文獻館，二樓。'); S();
    await say('你怎麼會去那裡？', 'ind'); S();
    await me('不是你叫我來的嗎？'); S();
    await say('我昨天叫你去的是大學圖書館。', 'ind'); S();
    await me('昨天？'); S();
    await say('你還記得昨天發生了什麼嗎？', 'ind'); S();
    const c = await choose(['我不確定，我的記憶有點混亂。', '你先告訴我，為什麼我應該相信你？', '別管昨天了，先告訴我怎麼出去。']);
    S0.choices.D01 = c; S0.trust = [1, -1, 0][c]; persist();
    await me(['我不確定，我的記憶有點混亂。', '你先告訴我，為什麼我應該相信你？', '別管昨天了，先告訴我怎麼出去。'][c]); S();
    await say(['那就先別急著回想。從你能確認的事情開始。', '你不應該。尤其在你連自己怎麼到那裡都不清楚的時候。', '很好，先處理眼前的問題。其他事情離開後再談。'][c], 'ind'); S();
    await say('舊館夜間安全系統即將啟動，請所有未授權人員離開管制區域。', 'cast'); S();
    sfx('error'); await sys(['通道門鎖著'], 1400); S();
    flag('EV_N01_START'); running = true; paintGoal(); armIdle();
    await sys(['任務：離開舊文獻館', '剩餘時間 30:00'], 2200); S();
  }
  async function ending() {
    running = false; ended = true; flag('N01_CLEAR');
    $(el, '#timer') && $(el, '#timer').classList.add('hidden');
    el.querySelectorAll('.lvl-goal, #hintBtn').forEach(n => n.classList.add('hidden'));
    const outStd = hm(stdNow());
    await fadeTo(() => { setScene('N01-BG-005', '台灣雨夜館外', []); $(el, '#slots').classList.add('hidden'); }); S();
    await sys([`離館時間　標準時 ${outStd}`], 2000); S();
    await say('找到你想找的東西了嗎？', 'indp'); S();
    await me('我連自己想找什麼都不知道。'); S();
    await say('那你今天至少學會了一件事：不知道自己正在找什麼，比誤以為自己已經找到答案要好。', 'indp'); S();
    // EV_NOTE：沒拿或沒讀過也在這裡補讀，不會漏
    if (!has('note')) S0.items.push('note');
    await readDoc('noteF'); S();
    await readDoc('noteB'); S();
    await readDoc('form'); S();
    flag('NOTE_DISCOVERED');
    // 熄燈鏡頭：二樓西側閱覽室的窗燈熄掉（無台詞）
    const win = html('<div class="n1-winoff" style="left:804px;top:267px;width:30px;height:65px"></div>');
    scene.appendChild(win); await wait(700); S(); win.classList.add('on'); sfx('tap'); await wait(900); S();
    await me('如果我不記得自己來過這裡……那我到底是什麼時候，申請了這份文件？'); S();
    $(el, '#black').classList.add('on'); await wait(900); S();
    const dd = get();
    if (!dd.records.includes('n01')) dd.records.push('n01');
    dd.n01.cleared = true; dd.n01.st = null;
    const oldF = (dd.n01.last && dd.n01.last.flags) || {};
    const nf = { ...oldF }; Object.entries(F).forEach(([k, v]) => { if (k.startsWith('n01_') && v) nf[k] = v; });
    dd.n01.last = { trust: S0.trust, habit: S0.habit, noteDisclosure: S0.noteDisclosure, choices: S0.choices, read: S0.read, flags: nf, hintCost: S0.hintCost || 0 };
    save();
    const card = html(`<div class="g01-card"><div class="label">第一章・第一節　完</div><h2>不存在的第七分鐘</h2><p>下一節「留下來的人」</p><p class="n1-hc">使用提示 ${S0.hintCost || 0} 次</p><button type="button" class="btn" style="width:208px;pointer-events:auto" data-a>返回關卡選擇</button></div>`);
    el.appendChild(card);
    await new Promise(r => $(card, '[data-a]').addEventListener('click', () => { sfx('tap'); r(); })); S();
    go('stages', { tab: 0 });
  }

  async function flow() {
    paintSlots(); paintTimer(); bgm('n00');
    if (params && params.retry) F.RETRY = true;
    if (!F.EV_N01_START) {
      await prologue(); S();
      setScene(litKey(), '閱覽室', A_HS()); sceneAState();
      await wait(600); S(); $(el, '#black').classList.remove('on'); await wait(400); S();
      await opening(); S();
    } else {
      $(el, '#black').classList.remove('on'); running = true; armIdle();
    }
    let where = S0.scene || 'A';
    const RUN = { A: sceneA, B: sceneB, C: sceneC, D: sceneD };
    let first = true;
    for (;;) {
      S0.scene = where; persist();
      if (!first) { $(el, '#black').classList.add('on'); await wait(450); S(); closeCu(); }
      const p = RUN[where](); // 場景在第一個 await 前就畫好
      if (!first) { await wait(120); S(); $(el, '#black').classList.remove('on'); }
      first = false;
      const next = await p; S();
      if (next === 'EXIT') { await ending(); return; }
      where = next;
    }
  }
  flow().catch(e => { if (e && e.message !== 'left') console.error(e); });
  return () => { alive = false; listeners = []; clearInterval(tick); clearTimeout(idleT); if (!ended && F.EV_N01_START) { meta.st = S0; save(); } };
}
