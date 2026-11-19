// 主線第一章第一節 N01〈不存在的第七分鐘〉　M1 灰盒可玩版
// 劇情與台詞依《N01-GDD v1.0》逐字使用；GDD 沒寫的地方只放系統介面文字，不補角色台詞。
// 正式美術放進 assets/img/，檔名就是素材 ID（例如 N01-BG-001.webp），程式會自動換掉灰盒。
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
const hm = m => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

// ---------- 文件（真正的 UI 文字；正式版紙張底圖用文件 ID） ----------
function docBody(id, ctx) {
  const name = esc(ctx.pname);
  switch (id) {
    case 'form': return { title: '資料申請單', asset: 'N01-DOC-061', html: `<h4>灰橋舊文獻館　資料申請單</h4><table><tr><th>借閱編號</th><td><b>GB-17-042</b></td></tr><tr><th>申請人</th><td>${name}</td></tr><tr><th>登記時間（標準時）</th><td>20:55</td></tr><tr><th>簽名</th><td class="sig">${name}</td></tr></table>` };
    case 'noteF': return { title: '紙條（正面）', asset: 'N01-DOC-062', html: '<p class="hand">不要讓別人替你描述，你當時看見了什麼。</p><p class="hand">尤其不要急著相信，你自己寫下的版本。</p>' };
    case 'noteB': return { title: '紙條（背面）', asset: 'N01-DOC-062', html: '<p class="press">GB-17-042</p>' };
    case 'visit': return { title: '訪客出入紀錄', asset: 'N01-DOC-063', html: '<h4>訪客出入紀錄</h4><div class="base">時間：標準時（獨立讀卡器）</div><table><tr><th>20:48</th><td>E. Ward 入館</td></tr><tr><th>20:55</th><td>訪客登記</td></tr><tr><th>21:02</th><td>安全測試啟動</td></tr><tr><th>21:06</th><td>清場簽名</td></tr></table>' };
    case 'termlog': return { title: '夜間設備終端紀錄', asset: 'N01-DOC-064', html: `<h4>保安終端　夜間設備紀錄</h4><div class="base">時間：終端時間（尚未校時）</div><table><tr><th>21:14</th><td>備用電源切換／監控訊號中斷</td></tr></table>${ctx.p02 ? `<p class="calc">校正後：終端 21:14 ＝ 標準時 ${hm(21 * 60 + 14 - OFFSET)}</p>` : ''}` };
    case 'test': return { title: '讀卡器測試表', asset: 'N01-DOC-065', html: '<h4>讀卡器維修測試</h4><p>同一次讀卡事件：</p><table><tr><th>獨立讀卡器（標準時）</th><td>20:43</td></tr><tr><th>保安終端</th><td>20:50</td></tr></table>' };
    case 'notice': return { title: '終端維護公告', asset: 'N01-DOC-066', html: '<h4>終端維護公告</h4><p>保安終端校時中，已停止自動同步。</p>' };
    case 'label': return { title: '卷宗索引標籤', asset: 'N01-DOC-067', html: '<h4>維修標籤</h4><table><tr><th>日期</th><td>4 月 12 日</td></tr><tr><th>類別</th><td>M（維護）</td></tr><tr><th>序號</th><td>03</td></tr></table>' };
    case 'rule': return { title: '文件命名規則', asset: 'N01-DOC-068', html: '<h4>文件命名規則</h4><p class="big">DDMM－類別－序號</p>' };
    case 'clear': return { title: '人工清場簽名表', asset: 'N01-DOC-069', html: '<h4>人工清場簽名表</h4><table><tr><th>時間（標準時）</th><td>21:06</td></tr><tr><th>簽名</th><td class="sig ink2">E. Ward</td></tr><tr><th>清場</th><td>無其他人員</td></tr></table>' };
    case 'order': return { title: '設備操作順序便條', asset: 'N01-DOC-070', html: '<h4>操作順序</h4><p class="big">提示鈴 → 掃描機 → 膠卷盒</p>' };
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

  // ---------- 場景（灰盒＋正式圖自動替換） ----------
  // obj：{ id, x, y, w, h, label, asset, hs?: false }
  function setScene(bgId, title, objs) {
    scene.innerHTML = `<div class="n1-gb"><span>${bgId}　${title}</span></div><img class="bg" src="${IMG(bgId + '.webp')}" alt="${title}" onerror="this.remove()">` +
      objs.map(o => `<div class="n1-obj${o.asset ? '' : ' bgpart'}" id="o-${o.id}" style="left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.h}px"><span class="n1-gbl">${o.label}<small>${o.asset || bgId + ' 內'}</small></span>${o.asset ? `<img src="${IMG(o.asset + '.webp')}" alt="" onerror="this.remove()">` : ''}</div>`).join('');
    setHs(objs.filter(o => o.hs !== false));
  }
  const ob = id => scene.querySelector('#o-' + id);
  const setObj = (id, asset, label) => { const n = ob(id); if (!n) return; n.innerHTML = `<span class="n1-gbl">${label}<small>${asset}</small></span><img src="${IMG(asset + '.webp')}" alt="" onerror="this.remove()">`; };
  const hideObj = id => { const n = ob(id); if (n) n.style.display = 'none'; const b = $(hsLayer, `[data-hs="${id}"]`); if (b) b.remove(); };
  function setHs(list, layer = hsLayer) {
    if (layer === hsLayer) hsLayer.innerHTML = '';
    list.forEach(({ id, x, y, w, h, label }) => {
      const b = html(`<button type="button" class="area" data-hs="${id}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px" aria-label="${label}"></button>`);
      b.addEventListener('click', ev => { ev.stopPropagation(); sfx('tap'); emit({ type: 'hs', id, item: selected }); });
      layer.appendChild(b);
    });
  }
  async function loop(handler) {
    for (;;) {
      const a = await act(x => x.type === 'hs'); S();
      const used = a.item;
      const r = await handler(a.id, used); S();
      if (used && selected === used) { selected = null; paintSlots(); }
      if (r) return r;
    }
  }
  function openCu(inner, list = []) {
    cu.innerHTML = inner;
    const b = html(`<button type="button" class="btn-line g1-cuback">${ICON.back}<span>返回</span></button>`);
    b.addEventListener('click', ev => { ev.stopPropagation(); sfx('tap'); emit({ type: 'hs', id: 'back', item: null }); });
    cu.appendChild(b); setHs(list, cu);
    cu.classList.remove('hidden'); hsLayer.classList.add('hidden');
  }
  const closeCu = () => { cu.classList.add('hidden'); cu.innerHTML = ''; hsLayer.classList.remove('hidden'); };
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
      if (who === 'me' && calm && opt.pic !== false) pic = html(`<img class="portrait" src="${IMG(`hero-${g}.webp`)}" alt="">`);
      if (who === 'indp' && calm) pic = html(`<img class="portrait npc" src="${IMG('npc-induasen.webp')}" alt="">`);
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
      const m = html(`<div class="g1-docback n1-docback" role="dialog" aria-label="${doc.title}"><div class="n1-paper" data-asset="${doc.asset}"><img src="${IMG(doc.asset + '.webp')}" alt="" onerror="this.remove()"><div class="n1-ink">${doc.html}</div></div><div class="g1-dochint">點旁邊收起</div></div>`);
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
    { k: 'P01', done: () => F.P01_SOLVED, goal: '恢復電源', hl: ['panel'], hints: ['閱覽室牆上有一個備用配電箱。', '容量上限 6A：照明 2A、監控 5A、門禁 3A。三組全開會過載。', 'A 照明 ON、B 監控 OFF、C 門禁 ON，合計 5A。'] },
    { k: 'CARD', done: () => F.AREA_B_OPEN, goal: '用訪客卡打開通道門', hl: () => (has('card') ? ['reader'] : ['card']), hints: ['桌上有一張臨時訪客卡。', '點道具欄的訪客卡，再點門邊的讀卡器。', '先拿桌上的訪客卡，再刷門邊讀卡器。'] },
    { k: 'P02', done: () => F.P02_SOLVED, goal: '校正時間', hl: ['term', 'creader'], hints: ['走廊有兩種時間：牆鐘的標準時，和保安終端的時間。', '讀卡器測試表：同一次讀卡，標準 20:43，終端記成 20:50。', '終端快 7 分鐘，在保安終端選 −7。'] },
    { k: 'P03', done: () => F.P03_SOLVED, goal: '找出維護卷宗', hl: ['cab', 'label', 'rule'], hints: ['膠卷室牆上貼著文件命名規則。', '維修標籤寫著日期、類別和序號：4 月 12 日、M、03。', '依 DDMM－類別－序號，輸入 1204-M-03。'] },
    { k: 'P04', done: () => F.P04_SOLVED, goal: '還原錄音', hl: ['rec', 'memo'], hints: ['錄音設備旁有一張操作順序便條。', '便條：提示鈴 → 掃描機 → 膠卷盒。每段錄音開頭的聲音標記不同。', '依序排成 A → B → C。'] },
    { k: 'P05', done: () => F.P05_SOLVED, goal: '完成最終推理', hl: ['console'], hints: ['出口控制台要回答三個問題。', '回想時間、錄音、清場表三份證據。', '終端快 7 分鐘；裁切的錄音不足以證明教授威脅；「無其他人員」尚未釐清。'] },
    { k: 'CHK', done: () => F.CHECKS_DONE, goal: '完成人工清查', hl: ['console'], hints: ['控制台的人工清場面板有三個清查點。', '館內實際有幾個人？閱覽室和走廊你都走過了。', '實際在館 1 人、閱覽室已清查、走廊已清查。'] },
    { k: 'EXIT', done: () => F.N01_CLEAR, goal: '離開舊文獻館', hl: ['shutter'], hints: ['出口捲門已經可以打開。', '點安全捲門離開。', '點安全捲門離開。'] },
  ];
  const cur = () => STEPS.find(s => !s.done()) || STEPS[STEPS.length - 1];
  const paintGoal = () => { $(el, '#goal').textContent = '目標　' + (F.EV_N01_START ? cur().goal : '—'); };
  function flash(ids, ms = 5000) { ids.forEach(id => el.querySelectorAll(`[data-hs="${id}"]`).forEach(b => { b.classList.add('show'); setTimeout(() => b.classList.remove('show'), ms); })); }
  const hlIds = () => { const h = cur().hl; return typeof h === 'function' ? h() : h; };
  let idleT = 0;
  const armIdle = () => { clearTimeout(idleT); idleT = setTimeout(() => { if (alive && !el.querySelector('.sub,.modal-back,.g1-docback')) flash(hlIds(), 2400); }, window.__N01_IDLE_MS || 38000); };
  el.addEventListener('pointerdown', armIdle);
  $(el, '#hintBtn').addEventListener('click', () => {
    sfx('tap');
    if (!F.EV_N01_START) { toast('這裡不需要提示，往下看劇情吧。'); return; }
    const s = cur(); const lv = S0.hints[s.k] || 0;
    S0.hints[s.k] = Math.min(lv + 1, 3); persist();
    sfx('hint'); flash(hlIds());
    sys([`提示 ${Math.min(lv + 1, 3)}／3：${s.hints[Math.min(lv, 2)]}`], 3800);
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

  // ---------- 超時：捲門封閉、夜間保安通報，無限次重試 ----------
  function timeout() {
    if (ended) return;
    ended = true; running = false; alive = false; F.N01_TIMEOUT = true;
    meta.st = null; save();
    const b = html(`<div class="n1-fail"><div class="n1-shut" aria-hidden="true"></div><div class="col" style="align-items:center;gap:16px;z-index:2">
<div class="label">EV_TIMEOUT</div><h2>出口捲門已封閉</h2><p>夜間保安已收到通報。</p>
<div class="row" style="gap:16px;height:56px"><button type="button" class="btn-line" data-a="out" style="width:208px">返回關卡選擇</button><button type="button" class="btn" data-a="retry" style="width:208px">重新挑戰</button></div></div></div>`);
    b.addEventListener('click', e => { const a = e.target.closest('[data-a]'); if (!a) return; sfx('tap'); if (a.dataset.a === 'retry') go('n01', { retry: true }); else go('stages', { tab: 0 }); });
    el.appendChild(b); sfx('error');
  }

  // ================= 場景 =================
  const A_OBJ = () => [
    { id: 'panel', x: 40, y: 190, w: 130, h: 190, label: '備用配電箱', asset: 'N01-BG_DETAIL-007' },
    { id: 'lamp', x: 210, y: 150, w: 120, h: 170, label: '照明', asset: null },
    { id: 'tape', x: 210, y: 430, w: 140, h: 90, label: '錄音機', asset: 'N01-PROP-040' },
    { id: 'form', x: 380, y: 450, w: 200, h: 110, label: '文件申請表', asset: 'N01-PROP-044' },
    { id: 'cup', x: 610, y: 420, w: 90, h: 100, label: '咖啡杯', asset: 'N01-PROP-037' },
    { id: 'card', x: 730, y: 480, w: 120, h: 64, label: '臨時訪客卡', asset: 'N01-PROP-039' },
    { id: 'reader', x: 880, y: 300, w: 60, h: 90, label: '讀卡器', asset: F.P01_SOLVED ? 'N01-PROP-043' : 'N01-PROP-042' },
    { id: 'door', x: 960, y: 140, w: 170, h: 440, label: '通道門', asset: null },
  ];
  async function sceneA() {
    setScene('N01-BG-001', '閱覽室', A_OBJ());
    if (has('card')) hideObj('card');
    if (has('tape')) hideObj('tape');
    if (F.CUP_MOVED) cupMoved();
    paintGoal();
    return loop(async (id, item) => {
      if (id === 'back') { closeCu(); return; }
      if (id === 'panel') { await p01(); return; }
      if (id === 'lamp') return void sys([F.P01_SOLVED ? '照明：ON（2A）' : '照明'], 1400);
      if (id === 'form') { await readDoc('form'); S0.habit++; return; }
      if (id === 'cup') { if (!F.CUP_MOVED) { flag('CUP_MOVED'); cupMoved(); sfx('tap'); } return; }
      if (id === 'note') { addItem('note'); hideObj('note'); await readDoc('noteF'); flag('NOTE_READ'); return; }
      if (id === 'card') { addItem('card'); hideObj('card'); return; }
      if (id === 'tape') { addItem('tape'); hideObj('tape'); return; }
      if (id === 'reader' || id === 'door') {
        if (F.AREA_B_OPEN) return 'B';
        if (!F.P01_SOLVED) { sfx('error'); return void sys(['讀卡器沒有反應：門禁未供電'], 1800); }
        if (item !== 'card') { sfx('error'); return void sys([has('card') ? '請使用訪客卡' : '需要訪客卡'], 1600); }
        sfx('unlock'); flag('AREA_B_OPEN'); paintGoal(); await sys(['讀卡成功'], 1000); S(); return 'B';
      }
    });
  }
  function cupMoved() {
    const c = ob('cup'); if (c) c.style.transform = 'translate(70px,-30px)';
    if (!has('note') && !scene.querySelector('#o-note')) {
      scene.insertAdjacentHTML('beforeend', `<div class="n1-obj" id="o-note" style="left:612px;top:470px;width:90px;height:56px"><span class="n1-gbl">紙條<small>N01-PROP-038</small></span><img src="${IMG('N01-PROP-038.webp')}" alt="" onerror="this.remove()"></div>`);
      const b = html('<button type="button" class="area" data-hs="note" style="left:604px;top:462px;width:106px;height:72px" aria-label="紙條"></button>');
      b.addEventListener('click', ev => { ev.stopPropagation(); sfx('tap'); emit({ type: 'hs', id: 'note', item: selected }); });
      hsLayer.appendChild(b);
    }
  }
  // P01：照明 2A、監控 5A、門禁 3A，上限 6A；初始 ON/ON/OFF＝7A 過載
  async function p01() {
    const sw = F.P01_SW || { A: true, B: true, C: false };
    const AMP = { A: 2, B: 5, C: 3 }, NAME = { A: '照明', B: '監控', C: '門禁' };
    const paint = () => {
      const sum = Object.keys(AMP).reduce((s, k) => s + (sw[k] ? AMP[k] : 0), 0);
      const state = F.P01_SOLVED ? '門禁控制器已恢復' : sum > 6 ? '過載待重置' : !sw.C ? '門禁未供電' : !sw.A ? '照明未供電' : '';
      openCu(`<div class="n1-cubg"><img src="${IMG('N01-BG_DETAIL-007.webp')}" alt="" onerror="this.remove()"></div>
<div class="n1-p01"><div class="n1-cap">備用配電箱　額定 6A</div><div class="row" style="gap:32px">${['A', 'B', 'C'].map(k => `<div class="n1-sw${sw[k] ? ' on' : ''}"><b>${k}</b><span>${NAME[k]}　${AMP[k]}A</span><i>${sw[k] ? 'ON' : 'OFF'}</i></div>`).join('')}</div>
<div class="n1-meter${sum > 6 ? ' over' : ''}"><span style="width:${Math.min(sum, 10) * 10}%"></span><em>${sum}A／6A</em></div><div class="n1-state">${state}</div></div>`,
      F.P01_SOLVED ? [] : ['A', 'B', 'C'].map((k, i) => ({ id: 'sw' + k, x: 366 + i * 196, y: 250, w: 160, h: 200, label: `${k} 開關` })));
    };
    paint();
    return loop(async id => {
      if (id === 'back') { closeCu(); return true; }
      if (!id.startsWith('sw') || F.P01_SOLVED) return;
      const k = id[2]; sw[k] = !sw[k]; F.P01_SW = { ...sw }; persist(); sfx('clang');
      if (sw.A && !sw.B && sw.C) {
        flag('P01_SOLVED'); paint(); sfx('unlock'); await wait(600); S(); closeCu();
        setObj('reader', 'N01-PROP-043', '讀卡器');
        await me('燈亮了，但門還是鎖著。'); S();
        await say('那代表至少有一件好事：它只是拒絕讓你出去，不是設備壞得開不了。', 'ind'); S();
        await me('……這算好事？'); S();
        await say('對調查來說，算。', 'ind'); S();
        paintGoal(); return true;
      }
      paint();
    });
  }

  const B_OBJ = () => [
    { id: 'doorC', x: 30, y: 170, w: 110, h: 420, label: '往微縮膠卷室', asset: 'N01-PROP-050' },
    { id: 'creader', x: 170, y: 300, w: 90, h: 120, label: '獨立讀卡器', asset: 'N01-PROP-047' },
    { id: 'term', x: 290, y: 300, w: 210, h: 170, label: '保安終端', asset: 'N01-PROP-046' },
    { id: 'clock', x: 560, y: 110, w: 120, h: 120, label: '壁鐘', asset: 'N01-PROP-045' },
    { id: 'notice', x: 560, y: 280, w: 140, h: 170, label: '維護公告', asset: 'N01-PROP-048' },
    { id: 'duty', x: 740, y: 260, w: 170, h: 200, label: '值班登記板', asset: 'N01-PROP-049' },
    { id: 'doorD', x: 960, y: 170, w: 170, h: 420, label: '往出口控制間', asset: null },
  ];
  async function sceneB() {
    setScene('N01-BG-002', '檔案走廊', B_OBJ());
    const clock = () => { const n = ob('clock'); if (n) { const l = n.querySelector('.n1-clock') || n.appendChild(html('<span class="n1-clock"></span>')); l.textContent = hm(stdNow()); } };
    clock(); const ci = setInterval(clock, 1000);
    addBack('← 閱覽室', 'toA');
    paintGoal();
    try {
      return await loop(async (id, item) => {
        if (id === 'back') { closeCu(); return; }
        if (id === 'toA') return 'A';
        if (id === 'clock') return void sys([`壁鐘（標準時）　${hm(stdNow())}`], 1600);
        if (id === 'creader') { await readDoc('test'); return; }
        if (id === 'notice') { await readDoc('notice'); return; }
        if (id === 'duty') { await readDoc('visit'); return; }
        if (id === 'term') { await p02(); return; }
        if (id === 'doorC') { if (!F.P02_SOLVED) { sfx('error'); return void sys(['檔案管理路徑尚未開放'], 1600); } return 'C'; }
        if (id === 'doorD') { if (!(F.P03_SOLVED && F.P04_SOLVED)) { sfx('error'); return void sys(['出口控制間尚未開放'], 1600); } return 'D'; }
      });
    } finally { clearInterval(ci); }
  }
  function addBack(label, id) {
    const b = html(`<button type="button" class="btn-line g1-exit n1-back" data-hs="${id}">${label}</button>`);
    b.addEventListener('click', () => { sfx('tap'); emit({ type: 'hs', id, item: null }); });
    hsLayer.appendChild(b);
  }
  // P02：終端快 7 分鐘，選 −7
  async function p02() {
    const paint = msg => openCu(`<div class="n1-cubg"><img src="${IMG('N01-BG_DETAIL-008.webp')}" alt="" onerror="this.remove()"></div>
<div class="n1-p02"><div class="row" style="gap:48px"><div class="n1-clk"><span>壁鐘（標準時）</span><b>${hm(stdNow())}</b></div><div class="n1-clk term"><span>保安終端</span><b>${hm(stdNow() + OFFSET)}</b></div></div>
<p class="n1-cap">終端紀錄：21:14　備用電源切換／監控訊號中斷</p>
${F.P02_SOLVED ? `<p class="n1-ok">終端 21:14 ＝ 標準時 21:07</p>` : `<p class="n1-cap">時間校正：終端時間要加減幾分鐘，才是標準時？</p><div class="row" style="gap:16px">${[-14, -7, 0, 7].map(v => `<span class="n1-opt" data-v="${v}">${v > 0 ? '+' + v : v === 0 ? '±0' : '−' + -v}</span>`).join('')}</div>`}
<div class="n1-state">${msg || ''}</div></div>`,
    F.P02_SOLVED ? [{ id: 'log', x: 340, y: 300, w: 600, h: 48, label: '終端紀錄' }] : [-14, -7, 0, 7].map((v, i) => ({ id: 'o' + v, x: 416 + i * 120, y: 452, w: 104, h: 64, label: `${v} 分鐘` })).concat([{ id: 'log', x: 340, y: 300, w: 600, h: 48, label: '終端紀錄' }]));
    paint();
    return loop(async id => {
      if (id === 'back') { closeCu(); return true; }
      if (id === 'log') { await readDoc('termlog'); return; }
      if (!id.startsWith('o')) return;
      if (id !== 'o-7') { sfx('error'); paint('對照讀卡器測試表再算一次。'); return; }
      flag('P02_SOLVED'); sfx('unlock'); paint(); await wait(700); S(); closeCu();
      await me('你早就知道這裡的時鐘有問題？'); S();
      await say('我知道它以前出過問題。', 'ind'); S();
      await me('那為什麼你剛才不提醒我？'); S();
      await say('因為我不確定問題還在不在。你現在給了我答案。', 'ind'); S();
      paintGoal(); return true;
    });
  }

  const C_OBJ = () => [
    { id: 'cab', x: 60, y: 170, w: 260, h: 380, label: F.P03_SOLVED ? '卷宗櫃（已開）' : '卷宗櫃', asset: F.P03_SOLVED ? 'N01-PROP-052' : 'N01-PROP-051' },
    { id: 'rule', x: 360, y: 130, w: 170, h: 120, label: '文件命名規則', asset: null },
    { id: 'scan', x: 360, y: 360, w: 170, h: 150, label: '掃描機', asset: 'N01-PROP-056' },
    { id: 'label', x: 380, y: 290, w: 120, h: 60, label: '維修標籤', asset: null },
    { id: 'film', x: 570, y: 440, w: 130, h: 90, label: '膠卷盒', asset: 'N01-PROP-054' },
    { id: 'rec', x: 740, y: 350, w: 200, h: 150, label: '錄音設備', asset: 'N01-PROP-055' },
    { id: 'memo', x: 970, y: 250, w: 140, h: 110, label: '操作順序便條', asset: null },
  ];
  async function sceneC() {
    setScene('N01-BG-003', '微縮膠卷室', C_OBJ());
    addBack('← 檔案走廊', 'toB');
    paintGoal();
    return loop(async id => {
      if (id === 'back') { closeCu(); return; }
      if (id === 'toB') return 'B';
      if (id === 'rule') { await readDoc('rule'); return; }
      if (id === 'label') { await readDoc('label'); return; }
      if (id === 'memo') { await readDoc('order'); return; }
      if (id === 'scan') return void sys(['掃描機'], 1200);
      if (id === 'film') return void sys(['膠卷盒'], 1200);
      if (id === 'cab') { if (F.P03_SOLVED) { await readDoc('clear'); return; } await p03(); return; }
      if (id === 'rec') { await p04(); return; }
    });
  }
  // P03：DDMM-類別-序號 → 1204-M-03
  async function p03() {
    let dd = '', cat = '', sq = '';
    const CATS = ['A', 'M', 'R', 'S'];
    const paint = msg => openCu(`<div class="n1-cubg"><img src="${IMG('N01-BG_DETAIL-009.webp')}" alt="" onerror="this.remove()"></div>
<div class="n1-p03"><div class="n1-cap">卷宗查詢　DDMM－類別－序號</div>
<div class="n1-code"><b>${(dd + '____').slice(0, 4)}</b><i>－</i><b>${cat || '_'}</b><i>－</i><b>${(sq + '__').slice(0, 2)}</b></div>
<div class="n1-pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => `<span>${n}</span>`).join('')}</div>
<div class="n1-pad cat">${CATS.map(c => `<span>${c}</span>`).join('')}<span>清除</span></div><div class="n1-state">${msg || ''}</div></div>`,
    [...[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n, i) => ({ id: 'n' + n, x: 284 + i * 72, y: 364, w: 64, h: 64, label: String(n) })),
      ...CATS.map((c, i) => ({ id: 'c' + c, x: 428 + i * 72, y: 444, w: 64, h: 64, label: c })), { id: 'clr', x: 716, y: 444, w: 136, h: 64, label: '清除' }]);
    paint();
    return loop(async id => {
      if (id === 'back') { closeCu(); return true; }
      if (id === 'clr') { dd = cat = sq = ''; paint(); return; }
      if (id[0] === 'n') { if (dd.length < 4) dd += id[1]; else if (cat && sq.length < 2) sq += id[1]; sfx('key'); }
      if (id[0] === 'c' && dd.length === 4 && !cat) { cat = id[1]; sfx('key'); }
      if (dd.length === 4 && cat && sq.length === 2) {
        if (`${dd}-${cat}-${sq}` !== '1204-M-03') { sfx('error'); dd = cat = sq = ''; paint('查無此卷宗'); return; }
        flag('P03_SOLVED'); sfx('unlock'); paint('1204-M-03'); await wait(600); S(); closeCu();
        setObj('cab', 'N01-PROP-052', '卷宗櫃（已開）'); addItem('file');
        await readDoc('clear'); S();
        await me('她說這裡沒有人。那我是什麼？'); S();
        paintGoal(); return true;
      }
      paint();
    });
  }
  // P04：第一聲道 → 依便條排序 A→B→C → 完整錄音
  async function p04() {
    if (F.P04_SOLVED) { await playFull(true); return; }
    if (!F.CH1_PLAYED) {
      await sys(['第一聲道'], 1000); S();
      await say('不要讓他看見那份紀錄。', 'eileen'); S();
      await say('事情已經結束了。你不需要再記得。', 'male'); S();
      flag('CH1_PLAYED');
      await me('教授。你有沒有什麼事情沒告訴我？'); S();
      await say('有。但我想你問的不是這個。', 'ind'); S();
    }
    // 三段開頭各有不同的聲音標記（非聽覺替代：圖示＋波形註記）
    const SEG = { A: ['雙響提示鈴', '♪♪'], B: ['掃描機運轉', '▤▤'], C: ['膠卷盒闔上', '▣'] };
    const shown = ['C', 'A', 'B'];
    let pick = [];
    const paint = msg => openCu(`<div class="n1-cubg"><img src="${IMG('N01-BG_DETAIL-010.webp')}" alt="" onerror="this.remove()"></div>
<div class="n1-p04"><div class="n1-cap">第二聲道　片段排序</div>
<div class="row" style="gap:24px">${shown.map(k => `<div class="n1-seg${pick.includes(k) ? ' used' : ''}"><b>${k}</b><span class="wave">${SEG[k][1]}</span><small>開頭：${SEG[k][0]}</small></div>`).join('')}</div>
<div class="n1-slots">${[0, 1, 2].map(i => `<span>${pick[i] || ''}</span>`).join('<i>→</i>')}</div><div class="n1-state">${msg || ''}</div></div>`,
    [...shown.map((k, i) => ({ id: 's' + k, x: 320 + i * 224, y: 220, w: 200, h: 180, label: `片段 ${k}` })), { id: 'reset', x: 560, y: 520, w: 160, h: 48, label: '重排' }]);
    paint();
    return loop(async id => {
      if (id === 'back') { closeCu(); return true; }
      if (id === 'reset') { pick = []; paint(); return; }
      if (id[0] !== 's') return;
      const k = id[1]; if (pick.includes(k)) return;
      pick.push(k); sfx('key');
      if (pick.length < 3) { paint(); return; }
      if (pick.join('') !== 'ABC') { sfx('error'); pick = []; paint('播放中斷：順序不對'); return; }
      flag('P04_SOLVED'); sfx('unlock'); paint('A → B → C'); await wait(600); S(); closeCu();
      await playFull(false); S();
      paintGoal(); return true;
    });
  }
  async function playFull(replay) {
    cine.classList.remove('hidden');
    cine.innerHTML = `<div class="n1-wave" aria-hidden="true"></div>${meta.seenTape ? '<button type="button" class="btn-line n1-skip">略過</button>' : ''}`;
    let skip = false;
    const sk = $(cine, '.n1-skip'); if (sk) sk.addEventListener('click', () => { skip = true; const s = el.querySelector('.sub'); if (s) s.click(); });
    const L = [['eileen', '不要讓他看見那份紀錄。'], ['sup', '為什麼？'], ['eileen', '那份檢查表還沒有完成。他又會把推測當成結論。'], ['sup', '事情已經結束了。那只是設備測試。'], ['eileen', '上次他說他記得所有故障紀錄，結果把年份都寫錯了。'], ['sup', '你不需要再記得每一個錯誤。查原始資料就好。']];
    for (const [w, t] of L) { if (skip) { S0.log.push([WHO[w], t]); continue; } await say(t, w); S(); }
    meta.seenTape = true; persist();
    cine.classList.add('hidden'); cine.innerHTML = '';
    if (!replay && has('tape')) await sys(['桌上那捲磁帶，是被擷取的同一段第一聲道。'], 2400);
  }

  const D_OBJ = () => [
    { id: 'console', x: 70, y: 320, w: 270, h: 220, label: '出口控制台', asset: 'N01-BG_DETAIL-011' },
    { id: 'shutter', x: 410, y: 130, w: 450, h: 440, label: '安全捲門', asset: F.N01_CLEAR ? 'N01-PROP-058' : 'N01-PROP-057' },
    { id: 'inter', x: 900, y: 280, w: 110, h: 140, label: '對講機', asset: 'N01-PROP-060' },
    { id: 'tray', x: 890, y: 470, w: 200, h: 90, label: '出口置物盤', asset: null },
  ];
  const leftovers = () => ['tape', 'note'].filter(k => !has(k));
  async function sceneD() {
    setScene('N01-BG-004', '出口控制間', D_OBJ());
    addBack('← 檔案走廊', 'toB');
    if (!leftovers().length || !F.CHECKS_DONE) hideObj('tray');
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
      if (id === 'inter') return void sys(['對講機'], 1200);
      if (id === 'console') { await (F.P05_SOLVED ? checks() : p05()); return; }
      if (id === 'tray') { collectLeft(); return; }
      if (id === 'shutter') {
        if (!F.CHECKS_DONE) { sfx('error'); return void sys(['人工放行權限未取得'], 1600); }
        if (leftovers().length) collectLeft();
        return 'EXIT';
      }
    });
  }
  function collectLeft() {
    const l = leftovers(); if (!l.length) return;
    l.forEach(k => { if (!S0.items.includes(k)) S0.items.push(k); });
    persist(); paintSlots(l[0]); sfx('pick'); hideObj('tray');
    sys([`已取回閱覽室桌上的遺留物品：${l.map(k => ITEMS[k].name).join('、')}`], 2400);
  }
  // P05：三題推理，錯了不扣次數，給證據回顧
  async function p05() {
    const Q = [
      { q: '保安終端的時間？', o: ['比標準時快 7 分鐘', '比標準時慢 7 分鐘', '和標準時一致'], a: 0, ev: 'test' },
      { q: '被裁切的錄音能證明什麼？', o: ['教授威脅過艾琳', '不足以證明教授威脅', '錄音是偽造的'], a: 1, ev: null },
      { q: '艾琳清場表上的「無其他人員」？', o: ['是偽造的', '尚未釐清', '確認無誤'], a: 1, ev: 'clear' },
    ];
    let qi = 0;
    const paint = msg => openCu(`<div class="n1-cubg"><img src="${IMG('N01-BG_DETAIL-011.webp')}" alt="" onerror="this.remove()"></div>
<div class="n1-p05"><div class="n1-cap">最終推理　${qi + 1}／3</div><h3>${Q[qi].q}</h3><div class="col" style="gap:12px">${Q[qi].o.map(t => `<span class="n1-opt wide">${t}</span>`).join('')}</div><div class="n1-state">${msg || ''}</div></div>`,
    Q[qi].o.map((t, i) => ({ id: 'a' + i, x: 400, y: 300 + i * 76, w: 480, h: 64, label: t })));
    paint();
    return loop(async id => {
      if (id === 'back') { closeCu(); return true; }
      if (id[0] !== 'a') return;
      const q = Q[qi];
      if (+id[1] !== q.a) {
        sfx('error');
        if (q.ev) { closeCu(); await readDoc(q.ev); S(); } else { closeCu(); await playFull(true); S(); }
        paint('回顧證據後再選一次。'); return;
      }
      sfx('key'); qi++;
      if (qi < 3) { paint(); return; }
      flag('P05_SOLVED'); sfx('unlock'); closeCu(); paintGoal();
      await checks(); return true;
    });
  }
  // 清查點：實際在館 1 人、閱覽室已清查、走廊已清查
  async function checks() {
    if (F.CHECKS_DONE) { await readDoc('release'); return; }
    let n = 0, ra = false, rb = false;
    const paint = msg => openCu(`<div class="n1-cubg"><img src="${IMG('N01-PROP-059.webp')}" alt="" onerror="this.remove()"></div>
<div class="n1-p05"><div class="n1-cap">人工清場面板</div>
<div class="n1-row"><span>實際在館人數</span><span class="n1-step"><i>−</i><b>${n}</b><i>＋</i></span></div>
<div class="n1-row"><span>閱覽室已清查</span><b class="n1-box${ra ? ' on' : ''}">${ra ? '✓' : ''}</b></div>
<div class="n1-row"><span>走廊已清查</span><b class="n1-box${rb ? ' on' : ''}">${rb ? '✓' : ''}</b></div>
<span class="n1-opt wide">確認放行</span><div class="n1-state">${msg || ''}</div></div>`,
    [{ id: 'm', x: 706, y: 262, w: 56, h: 56, label: '減少人數' }, { id: 'p', x: 826, y: 262, w: 56, h: 56, label: '增加人數' }, { id: 'ra', x: 780, y: 334, w: 104, h: 56, label: '閱覽室已清查' }, { id: 'rb', x: 780, y: 406, w: 104, h: 56, label: '走廊已清查' }, { id: 'ok', x: 400, y: 486, w: 480, h: 64, label: '確認放行' }]);
    paint();
    return loop(async id => {
      if (id === 'back') { closeCu(); return true; }
      if (id === 'm') n = Math.max(0, n - 1);
      if (id === 'p') n = Math.min(9, n + 1);
      if (id === 'ra') ra = !ra;
      if (id === 'rb') rb = !rb;
      if (id !== 'ok') { sfx('tap'); paint(); return; }
      if (!(n === 1 && ra && rb)) { sfx('error'); paint('清查內容與現場不符'); return; }
      flag('CHECKS_DONE'); sfx('unlock'); closeCu();
      // GDD 只寫了保安說明的要點，沒有逐字台詞；這裡照要點呈現（已列入回報）
      await say('夜間測試＋提前簽署清場確認＋終端未校時。', 'guard'); S();
      const c = await choose(['只是系統出錯', '有人說謊', '我還不知道']);
      S0.choices.D02 = c; persist();
      if (c === 2) { await say('不知道，是一個可以接受的答案。', 'ind'); S(); }
      if (leftovers().length) { const t = ob('tray'); if (t) { t.style.display = ''; } setHs(D_OBJ().filter(o => o.hs !== false)); addBack('← 檔案走廊', 'toB'); }
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
    const shot = (id, label) => { $(cine, '#shot').innerHTML = `<div class="n1-gb"><span>${id}　${label}</span></div><img class="bg" src="${IMG(id + '.webp')}" alt="" onerror="this.remove()">`; };
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
    flag('EV_N01_START'); running = true; paintGoal();
    await sys(['任務：離開舊文獻館', '剩餘時間 30:00'], 2200); S();
  }
  async function ending() {
    running = false; ended = true; flag('N01_CLEAR');
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
    await me('如果我不記得自己來過這裡……那我到底是什麼時候，申請了這份文件？'); S();
    $(el, '#black').classList.add('on'); await wait(900); S();
    const dd = get();
    if (!dd.records.includes('n01')) dd.records.push('n01');
    dd.n01.cleared = true; dd.n01.st = null;
    dd.n01.last = { trust: S0.trust, habit: S0.habit, noteDisclosure: S0.noteDisclosure, choices: S0.choices, read: S0.read };
    save();
    const card = html('<div class="g01-card"><div class="label">第一章・第一節　完</div><h2>不存在的第七分鐘</h2><p>下一節「留下來的人」</p><button type="button" class="btn" style="width:208px;pointer-events:auto" data-a>返回關卡選擇</button></div>');
    el.appendChild(card);
    await new Promise(r => $(card, '[data-a]').addEventListener('click', () => { sfx('tap'); r(); })); S();
    go('stages', { tab: 0 });
  }

  async function flow() {
    paintSlots(); paintTimer(); bgm('n00');
    if (params && params.retry) F.RETRY = true;
    if (!F.EV_N01_START) {
      await prologue(); S();
      setScene('N01-BG-001', '閱覽室', A_OBJ());
      $(el, '#black').classList.remove('on'); await wait(400); S();
      await opening(); S();
    } else {
      $(el, '#black').classList.remove('on'); running = true;
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
