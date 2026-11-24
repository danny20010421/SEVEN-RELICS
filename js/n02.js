// 主線第一章第二節 N02〈留下來的人〉
// 劇本：docs/N02-for-grok-final.md（製作人確認版）。玩法：docs/N02-gameplay.md。
// 美術：Grok 交件（docs/N02-grok-art.md），熱點與文件格線照 docs/N02-geometry.json 的舞台座標。
import { get, save } from './store.js';
import { sfx, bgm, applyVolume } from './audio.js';
import { html, $, IMG, ICON, wait, esc, modal, toast, clearToast, bustImg } from './ui.js';

const MAX_FAIL = 3; // 第一章第二節起：整節錯 3 次（所有謎題都算）→ 從頭重新挑戰
const LIMIT = 30 * 60; // 每節限時 30 分鐘；只有打開設定時暫停；最後 3 分鐘全螢幕紅框
const WARN = 3 * 60;
const HINT_COST = 1; // 第二節起：每次提示 1 顆鑽石

const ITEMS = {
  slip: { name: '紙條', asset: 'N01-PROP-038' }, // N01 唯一帶過來的道具
  key: { name: '住處鑰匙', asset: 'N02-PROP-001' },
  note: { name: '筆記本', asset: 'N02-PROP-002' },
  pass: { name: '研究室出入證', asset: 'N02-PROP-003' },
};
const ICO = {
  hint: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/></svg>',
  file: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/></svg>',
  log: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/></svg>',
};

// ---------- 文件：字寫在 Grok 交的空白紙上（座標 docs/N02-geometry.json，單位＝紙張百分比） ----------
const T = (x, y, w, h, t, cls = '') => `<div class="n2t ${cls}" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%">${t}</div>`;
// 寫在橫線上：每行底＝線的 y
const onLines = (L, rows, x, w, h = 3.4, cls = 'hand') => rows.map(([i, t, c = '']) => T(x, L[i] - h, w, h, t, `line ${cls} ${c}`)).join('');
const L011 = [9.4, 13.1, 17.0, 20.85, 24.7, 28.5, 32.3, 36.1, 40.0, 43.8, 47.6, 51.35, 55.2, 58.85, 62.6, 66.4, 70.15, 73.9, 77.6, 81.3, 85.0, 88.8, 92.5, 96.25];
const L016 = [20.2, 22.9, 25.75, 28.55, 31.3, 34.1, 36.9, 39.65, 42.5, 45.3, 48.0, 50.6, 53.5, 56.2, 59.0, 61.75, 64.5, 67.15, 69.9, 72.7, 75.4, 78.15, 80.85, 83.55, 86.3];
// 直書格紙（DOC-018）：一格一字，由右往左
const R018 = [13.44, 18.15, 23.21, 28.14, 33.08, 38.02, 43.02, 48.02, 53.02, 58.01, 62.95, 67.95, 72.95, 78.0, 82.94, 87.94, 92.94, 97.99];
const C018 = [[4.45, 8.7], [10.05, 14.3], [15.7, 19.95], [21.35, 25.6], [27.0, 31.2], [32.6, 36.8], [38.2, 42.5], [43.9, 48.3], [51.4, 55.7], [57.1, 61.4], [62.8, 67.1], [68.5, 72.75], [74.15, 78.4], [79.85, 84.1], [85.5, 89.8], [91.05, 95.35]];
const VERT = { '，': '︐', '。': '︒', '「': '﹁', '」': '﹂', '-': '｜', '、': '︑' };
function vertical(cols) {
  return cols.map((txt, ci) => { const [x0, x1] = C018[C018.length - 1 - ci]; return [...txt].map((ch, ri) => ri < R018.length - 1 ? T(x0, R018[ri], x1 - x0, R018[ri + 1] - R018[ri], VERT[ch] || ch, 'cell') : '').join(''); }).join('');
}
// 表格（DOC-019、022）
const grid = (xs, ys, rows) => rows.map((r, ri) => { let c = 0; return r.map(cell => { const [t, span = 1, cls = ''] = Array.isArray(cell) ? cell : [cell]; const x0 = xs[c], x1 = xs[c + span]; c += span; return t === '' ? '' : T(x0, ys[ri], x1 - x0, ys[ri + 1] - ys[ri], t, 'cellb ' + cls); }).join(''); }).join('');
const SCRIBBLE = '<svg class="scribble" viewBox="0 0 120 24" aria-label="被筆塗掉的名字"><path d="M2 14 L20 6 L14 18 L34 5 L28 19 L50 6 L44 18 L66 5 L60 19 L82 6 L76 18 L98 5 L92 19 L116 8" /><path d="M4 9 L116 15" /><path d="M6 17 L114 10" /></svg>';
const MOSAIC = '<span class="mosaic" aria-label="模糊不清的名字"><i></i><i></i><i></i></span>';
const DOCS = {
  slip: { title: '紙條', asset: 'N01-DOC-062-front', r: 1.013, html: T(12, 30, 76, 40, '<p>不要讓別人替你描述，你當時看見了什麼。</p><p>尤其不要急著相信，你自己寫下的版本。</p>', 'hand para') },
  thesis: { title: '論文草稿封面', asset: 'N02-DOC-012', r: 0.747, html: T(13.4, 16, 77.4, 6, '研究計畫（草稿）', 'muted') + T(13.4, 30, 77.4, 20, '1908—1978 年間<br>跨國異常事件與失蹤樣本<br>比較研究', 'title') + T(13.4, 78, 77.4, 6, '指導教授　因杜阿森', 'muted') },
  sticky: { title: '便條', asset: 'N02-DOC-013', r: 0.992, html: T(8.06, 21, 83.67, 72, '密碼：<br>論文的第一個年份。<br>別再忘了。', 'hand big') },
  rule: { title: '牆上的分類規則', asset: 'N02-DOC-013', r: 0.992, html: T(8.06, 21, 83.67, 46, '依年代歸檔。<br>每十年一個資料夾。', 'hand big') + T(8.06, 70, 83.67, 18, '（下半張被撕掉了）', 'muted') },
  pass: { title: '研究室出入證', asset: 'N02-DOC-014', r: 1.609, html: T(4.75, 14.56, 90.5, 13.36, '研究室出入證', 'band') + T(34.9, 36.69, 61, 14.48, '姓名　{name}', 'fld') + T(34.9, 56.23, 61, 14.4, '研究室　因杜阿森研究室', 'fld') + T(34.9, 76.1, 61, 14.4, '首次登記　2023.09.18', 'fld') },
  bill: { title: '帳單信封', asset: 'N02-DOC-015', r: 1.815, html: T(5.25, 37.39, 48.75, 32.94, '<p>{name}　收</p><p>三樓　37 號</p>', 'fld para') + T(5.25, 12, 60, 14, '水費繳費通知', 'muted l') },
  note1: { title: '筆記本・第一頁', asset: 'N02-DOC-011', r: 0.747, html: onLines(L011, [[2, '家門：門牌，接上我第一次'], [3, '進研究室的那天（月日）。'], [5, '歸檔：所有年份先換成西元，'], [6, '再分。已經是西元的，不用換。']], 14.4, 82.3) },
  conv: { title: '紀年換算對照表', asset: 'N02-DOC-022', r: 0.7495, html: T(3.74, 4.65, 92.39, 18.65, '紀年換算對照表', 'title') + grid([3.74, 32.56, 96.13], [23.3, 31.3, 44.4, 56.9, 69.4, 81.9], [[['紀年', 1, 'head'], ['換算成西元', 1, 'head']], ['明治', '＋1867'], ['昭和', '＋1925'], ['民國', '＋1911'], ['佛曆', '－543']]) },
  A: { title: '📄 A　現場調查報告', asset: 'N02-DOC-016', r: 0.7475, html: T(4.55, 5.65, 91.1, 10.9, '現場調查報告', 'title') + onLines(L016, [[0, '日期：西元 1908 年'], [2, '西伯利亞通古斯河谷大爆炸後，'], [3, '北方礦物學會派員進入現場，'], [4, '回收「異常結晶樣本」三箱，'], [5, '運往「90-S」。'], [21, '樣本不列入公開紀錄。']], 8, 84, 2.4, 'type') },
  B: { title: '📄 B　考古發掘報告', asset: 'N02-DOC-018', r: 1.1488, html: vertical(['發掘報告', '昭和十二年', '東亞古代文明研究所', '發掘青銅器一批', '表面刻有無法辨識', '的文字', '全數移交', '「90-S」']) },
  C: { title: '📄 C　剪報', asset: 'N02-DOC-017', r: 0.75, html: T(2, 5.55, 96, 13.25, '北大西洋沉船打撈古儀器<br>海外基金會「代為研究」', 'headline') + T(3.5, 20.5, 29, 60, '<p>【本報訊】據海外通訊，民國四十四年，北大西洋一艘沉船中，打撈出一具古代天文儀器的殘件。</p>', 'col') + T(35.4, 20.5, 29, 60, '<p>儀器已由一家海外基金會以「代為研究」為名運走。</p><p>博物館方面表示，事後才得知此事。</p>', 'col') + T(67.5, 49, 30, 8, '（打撈出的儀器殘件）', 'caption') },
  D: { title: '📄 D　研究站採集紀錄', asset: 'N02-DOC-019', r: 0.748, html: T(4.81, 8.3, 89.84, 7.65, '熱帶生命科學協會　研究站採集紀錄', 'title sm') + grid([4.81, 27.87, 50.47, 72.53], [18.7, 28.0, 36.15, 44.3], [[['日期', 1, 'head'], ['樣本', 1, 'head'], ['去向', 1, 'head']], ['佛曆<br>二五二一年', '雨林深處採得<br>不明植物種子', '全數移送<br>90-S'], [['備註：研究站同年因火災關閉，<br>紀錄僅存此頁。', 3]]]) },
  E: { title: '📄 E　無署名的信', asset: 'N02-DOC-020', r: 0.747, html: T(10.04, 9, 79.92, 22, '<p>各地機構更名一事，已照辦。</p><p>一律送往 90-S。</p><p>不得公開，不得歸還。</p>', 'hand para l') },
  F: { title: '📄 F　我的筆記', asset: 'N02-DOC-011', r: 0.747, html: onLines(L011, [[1, '北方礦物學會（1908）'], [2, '東亞古代文明研究所（1937）'], [3, '？基金會（1955）'], [4, '熱帶生命科學協會（1978）'], [6, '國家不同，名字不同。'], [7, '都說「為了研究」。'], [9, '90-S……'], [10, '是編號，還是座標？']], 14.4, 82.3) },
  last: { title: '筆記本・最後一頁', asset: 'N02-DOC-011', r: 0.747, html: onLines(L011, [[10, '是他。', 'center big'], [12, SCRIBBLE, 'center']], 14.4, 82.3, 4.2) },
};
const SORT = { A: '1900', B: '1930', C: '1950', D: '1970' }; // 正確資料夾
const FOLDERS = ['1900', '1930', '1950', '1970'];

// ---------- 場景熱點（舞台座標，取自 docs/N02-geometry.json） ----------
const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
const CIRCLED = { 2: 12, 9: 25 }; // 3/12、10/25（月份從 0 起算）

export function render(st, params, go) {
  const d = get();
  const g = (d.player && d.player.gender) || 'm';
  const pname = (d.player && d.player.name) || '玩家';
  d.n02 = d.n02 || {};
  const meta = d.n02; // seenIntro 跨次保留
  const fresh = () => ({ scene: 'S', items: ['slip'], read: [], flags: {}, hints: {}, fail: 0, placed: {}, log: [] });
  // 不再接續：每次進來都從頭開始（已買的提示保留）
  meta.st = null; meta.keep = null;
  const S0 = fresh(); S0.hints = { ...(meta.hintsKept || {}) };
  const F = S0.flags;
  const n01c = ((d.n01 && d.n01.last && d.n01.last.choices) || {});
  const d01 = n01c.D01, d02 = n01c.D02;

  const el = html(`<div class="scr g01 n01 n02">
<div class="layer" id="scene"></div>
<div class="fill" id="hsLayer" style="z-index:3"></div>
<div class="fill hidden" id="cu" style="z-index:6"></div>
<div class="shade-top"></div>
<div class="shade-right"></div>
<div class="lvl-top" id="hud">
  <button type="button" class="iconbtn" id="leave" aria-label="離開關卡">${ICON.back}</button>
  <div class="lvl-goal"><span class="chip-red" style="height:32px">第一章・第二節</span><span id="goal">目標　—</span></div>
  <div class="n1-timer" id="timer" aria-label="剩餘時間">30:00</div><div class="n1-alert" id="alert" aria-label="錯誤次數"><span>錯誤</span><i></i><i></i><i></i></div>
</div>
<div class="lvl-right" style="height:64px">
  <div class="hint-wrap"><button type="button" class="iconbtn hud-big" id="hintBtn">${ICO.hint}<span>提示</span></button><span class="hint-meta" id="hintMeta"></span></div>
  <button type="button" class="iconbtn hud-big" id="fileBtn">${ICO.file}<span>檔案</span></button>
  <button type="button" class="iconbtn hud-big" id="logBtn">${ICO.log}<span>紀錄</span></button>
  <button type="button" class="iconbtn hud-big" id="setBtn">${ICON.gear.replace('<svg', '<svg width="24" height="24"')}<span>設定</span></button>
</div>
<div class="slots" id="slots" role="group" aria-label="臨時道具欄"></div>
<div class="black on" id="black"></div>
</div>`);
  st.appendChild(el);
  const scene = $(el, '#scene'), hsLayer = $(el, '#hsLayer'), cu = $(el, '#cu');
  let alive = true, listeners = [], ended = false, selected = null;
  const S = () => { if (!alive) throw new Error('left'); };
  const emit = a => listeners.slice().forEach(l => l(a));
  const act = test => new Promise(res => { const l = a => { if (test(a)) { listeners = listeners.filter(x => x !== l); res(a); } }; listeners.push(l); });
  const persist = () => save();
  const flag = (k, v = true) => { F[k] = v; persist(); };

  // ---------- 倒數：牆上時間計算（切到別的 App 也照樣走），只有設定打開時暫停 ----------
  let t0 = Date.now(), pausedMs = 0, pauseAt = 0, tick = 0;
  const frame = html('<div class="tl-frame hidden" aria-hidden="true"></div>'); document.body.appendChild(frame);
  const LIM = window.__N02_LIMIT || LIMIT; // 測試用：縮短限時
  const left = () => Math.max(0, LIM - Math.floor((Date.now() - t0 - pausedMs - (pauseAt ? Date.now() - pauseAt : 0)) / 1000));
  function paintTimer() {
    const t = left(), n = $(el, '#timer');
    n.textContent = `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
    n.classList.toggle('warn', t <= WARN); frame.classList.toggle('hidden', t > WARN || ended);
    if (t <= 0 && !ended) lose('time');
  }
  const stopTimer = () => { clearInterval(tick); frame.remove(); };

  // ---------- 道具欄 ----------
  function paintSlots(ping) {
    const s = $(el, '#slots'); s.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const id = S0.items[i];
      if (!id) { s.appendChild(html('<span class="slot" role="img" aria-label="空的道具欄"></span>')); continue; }
      const b = html(`<button type="button" class="slot has${selected === id ? ' sel' : ''}${ping === id ? ' ping' : ''}" aria-label="${ITEMS[id].name}"><span class="n1-gb-item">${ITEMS[id].name}</span><img src="${IMG(ITEMS[id].asset + '.webp')}" alt="" onerror="this.remove()"></button>`);
      b.addEventListener('click', () => { sfx('tap'); if (id === 'note') readDoc(F.P4 ? 'F' : 'note1'); else if (id === 'pass') readDoc('pass'); else if (id === 'slip') readDoc('slip'); else { selected = selected === id ? null : id; paintSlots(); } });
      s.appendChild(b);
    }
    const ban = $(el, '.use-banner'); if (ban) ban.remove();
    if (selected) el.appendChild(html(`<div class="use-banner"><div>使用「${ITEMS[selected].name}」：點要開的門　再點一次道具就取消</div></div>`));
  }
  const addItem = id => { if (!S0.items.includes(id)) S0.items.push(id); sfx('pick'); persist(); paintSlots(id); };
  const has = id => S0.items.includes(id);

  // ---------- 場景：背景＋站著的角色＋熱點 ----------
  function setScene(bgId, title, objs, chars = {}) {
    // 角色不站在場景裡，只在對話時出現半身像（製作人決定）
    scene.innerHTML = `<div class="n1-gb"><span>${bgId}　${title}</span></div><img class="bg" id="bgimg" src="${IMG(bgId + '.webp')}" alt="${title}" onerror="this.remove()">`;
    setHs(objs);
  }
  const setBg = f => { const b = $(scene, '#bgimg'); if (b) b.src = IMG(f + '.webp'); };
  let task = null; // 開場點擊任務 { id, hint, miss, glowT }
  function setHs(list, layer = hsLayer) {
    if (layer === hsLayer) hsLayer.innerHTML = '';
    if (layer === hsLayer && task) {
      const bg = html(`<button type="button" class="area n2-missfill" data-hs="__miss" style="left:0;top:0;width:1280px;height:720px" aria-label="場景"></button>`);
      bg.addEventListener('click', ev => { ev.stopPropagation(); sfx('tap'); emit({ type: 'hs', id: '__miss' }); });
      layer.appendChild(bg);
    }
    list.forEach(({ id, x, y, w, h, label }) => {
      const b = html(`<button type="button" class="area n2-gb" data-hs="${id}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px" aria-label="${label}"><span>${label}</span></button>`);
      b.addEventListener('click', ev => { ev.stopPropagation(); sfx('tap'); emit({ type: 'hs', id, item: selected }); });
      layer.appendChild(b);
    });
  }
  async function tapTask(id, text, list, { hint, miss } = {}) {
    task = { id, hint: hint || text, miss: miss || '再找找看。' };
    paintHintMeta();
    const ban = html(`<div class="use-banner"><div>任務：${text}</div></div>`);
    el.appendChild(ban);
    const others = list.filter(h => h.id !== id);
    const target = list.filter(h => h.id === id);
    setHs([...others, ...target]);
    const glowT = setTimeout(() => {
      el.querySelectorAll(`[data-hs="${id}"]`).forEach(b => b.classList.add('task-glow'));
    }, 3000);
    for (;;) {
      const a = await act(x => x.type === 'hs'); S();
      if (a.id === id) break;
      toast(task.miss);
    }
    clearTimeout(glowT);
    task = null;
    ban.remove();
    setHs([]);
    paintHintMeta();
  }
  async function loop(handler) {
    for (;;) {
      const a = await act(x => x.type === 'hs'); S();
      const r = await handler(a.id, a.item); S();
      if (a.item && selected === a.item) { selected = null; paintSlots(); }
      if (r) return r;
    }
  }
  function openCu(inner, list = []) {
    cu.innerHTML = `<div class="n1-gb"></div>${inner}`;
    const b = html(`<button type="button" class="btn-line g1-cuback">${ICON.back}<span>返回</span></button>`);
    b.addEventListener('click', ev => { ev.stopPropagation(); sfx('tap'); emit({ type: 'hs', id: 'back' }); });
    cu.appendChild(b); setHs(list, cu);
    cu.classList.remove('hidden'); hsLayer.classList.add('hidden'); $(el, '#slots').classList.add('cu-hide');
  }
  const closeCu = () => { cu.classList.add('hidden'); cu.innerHTML = ''; hsLayer.classList.remove('hidden'); $(el, '#slots').classList.remove('cu-hide'); };
  const cuBg = f => `<img class="bg" src="${IMG(f + '.webp')}" alt="" onerror="this.remove()">`;

  // ---------- 對白（場景裡的角色站在原地；對話框只顯示主角立繪） ----------
  const WHO = { me: pname, dark: '達克', prof: '因杜阿森' };
  function say(cn, who = 'me', opt = {}) {
    cn = cn.replace(/\{主角\}/g, esc(pname));
    S0.log.push([opt.think ? pname + '（心裡）' : WHO[who] || '', cn]); if (S0.log.length > 200) S0.log.shift();
    return new Promise(res => {
      const calm = cu.classList.contains('hidden') && !el.querySelector('.g1-docback');
      let pic = null;
      if (who === 'me' && calm && opt.pic !== false) pic = html(bustImg(g === 'f' ? 'N01-CHAR-012' : 'N01-CHAR-013', 'left'));
      if ((who === 'dark' || who === 'prof') && calm && opt.pic !== false) pic = html(bustImg(who === 'dark' ? 'N02-CHAR-015' : 'N01-CHAR-014', 'right'));
      if (pic) el.appendChild(pic);
      const c = null;
      const b = html(`<div class="sub${opt.think ? ' think' : ''}" role="button" tabindex="0" aria-label="點一下繼續"><div class="who"><span>${esc(opt.think ? pname + '（心裡）' : WHO[who] || '')}</span></div><p class="cn">${cn}</p>${ICON.down}</div>`);
      const done = () => { sfx('tap'); b.remove(); if (pic) pic.remove(); if (c) c.classList.remove('talk'); res(); };
      b.addEventListener('click', done);
      b.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') done(); });
      el.appendChild(b); b.focus({ preventScroll: true });
    });
  }
  async function lines(L) { for (const [w, t, o] of L) { await say(t, w, o); S(); } }
  async function sys(ls, ms = 2200) {
    const b = html(`<div class="sysmsg" style="top:240px"><div role="status">${ls.map(l => `<p>${l}</p>`).join('')}</div></div>`);
    el.appendChild(b); await wait(ms); b.remove();
  }
  function choose(q, options) {
    return new Promise(res => {
      const b = html(`<div class="n1-choice n2-choice" role="group" aria-label="${q}"><p class="n2-q">${q}</p>${options.map((o, i) => `<button type="button" class="btn-line" data-i="${i}">${o}</button>`).join('')}<button type="button" class="btn-line n2-cancel" data-i="-1">再看看文件</button></div>`);
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

  // ---------- 文件：依紙張原比例顯示 ----------
  const paperBox = r => { const h = r < 1.2 ? 600 : Math.round(820 / r), w = Math.round(h * r); return { w, h, x: Math.round(572 - w / 2), y: Math.round(380 - h / 2) }; };
  function readDoc(id) {
    clearToast();
    if (id !== 'last' && !S0.read.includes(id)) { S0.read.push(id); persist(); }
    sfx('page');
    return new Promise(res => {
      const doc = DOCS[id]; const { w, h, x, y } = paperBox(doc.r);
      const m = html(`<div class="g1-docback n1-docback" role="dialog" aria-label="${doc.title}"><div class="n1-paper n2-paper" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"><img src="${IMG(doc.asset + '.webp')}" alt="" onerror="this.remove()"><div class="n2-ink">${doc.html.replace(/\{name\}/g, esc(pname))}</div></div><div class="g1-dochint">點旁邊收起</div></div>`);
      m.addEventListener('click', e => { if (e.target.closest('.n1-paper')) return; sfx('tap'); m.remove(); res(); });
      el.appendChild(m);
    });
  }
  // 桌曆：DOC-023 月份頁，可翻 12 個月；3/12、10/25 有深色筆圈（不顯示年份）
  function calendar() {
    sfx('page');
    let mo = 0;
    const COLS = [2.1, 16.2, 30.1, 43.4, 57.0, 70.55, 84.15, 98.0], ROWS = [33.0, 43.7, 54.2, 64.8, 75.4, 85.7, 96.2];
    const page = () => {
      const first = new Date(2026, mo, 1).getDay(), days = new Date(2026, mo + 1, 0).getDate();
      let cells = '';
      for (let dd = 1; dd <= days; dd++) {
        const k = first + dd - 1, c = k % 7, r = Math.floor(k / 7);
        const x0 = COLS[c], y0 = ROWS[r], w = COLS[c + 1] - COLS[c], h = ROWS[r + 1] - ROWS[r];
        cells += T(x0, y0, w, h, `<span>${dd}</span>${CIRCLED[mo] === dd ? '<svg class="ring" viewBox="0 0 100 70" aria-label="圈起來的日子"><path d="M14 40 C10 14 60 4 84 18 C98 28 92 58 58 64 C30 68 8 56 18 30" /></svg>' : ''}`, 'dd');
      }
      return T(2.1, 11.33, 95.9, 13.08, MONTHS[mo], 'month') + ['日', '一', '二', '三', '四', '五', '六'].map((w, i) => T(COLS[i], 24.41, COLS[i + 1] - COLS[i], 8.63, w, 'wk')).join('') + cells;
    };
    return new Promise(res => {
      const { w, h, x, y } = paperBox(1.2516);
      const m = html(`<div class="g1-docback n1-docback" role="dialog" aria-label="桌曆"><div class="n1-paper n2-paper" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"><img src="${IMG('N02-DOC-023.webp')}" alt="" onerror="this.remove()"><div class="n2-ink cal"></div></div>
<button type="button" class="btn-line n2-flip" data-f="-1" style="left:${x - 72}px;top:${y + h / 2 - 28}px" aria-label="上一個月">${ICON.back}</button><button type="button" class="btn-line n2-flip next" data-f="1" style="left:${x + w + 16}px;top:${y + h / 2 - 28}px" aria-label="下一個月">${ICON.back}</button><div class="g1-dochint">點旁邊收起</div></div>`);
      const ink = $(m, '.n2-ink'); ink.innerHTML = page();
      m.addEventListener('click', e => {
        const f = e.target.closest('[data-f]');
        if (f) { mo = (mo + +f.dataset.f + 12) % 12; sfx('page'); ink.innerHTML = page(); return; }
        if (e.target.closest('.n1-paper')) return;
        sfx('tap'); m.remove(); res();
      });
      el.appendChild(m);
    });
  }
  $(el, '#fileBtn').addEventListener('click', () => {
    sfx('tap');
    if (!S0.read.length) { toast('還沒有看過任何文件。'); return; }
    const m = html(`<div class="modal-back" style="z-index:44"><div class="gdoc" role="dialog" aria-label="檔案"><div class="label">調查檔案</div><h2>已讀文件</h2><div class="redline"></div>
<div class="gfiles">${S0.read.map(i => `<button type="button" class="gfile" data-doc="${i}"><span>${DOCS[i].title}</span></button>`).join('')}</div><button type="button" class="x" aria-label="關閉">${ICON.close}</button></div></div>`);
    m.addEventListener('click', e => {
      const b = e.target.closest('[data-doc]');
      if (b) { sfx('tap'); m.remove(); readDoc(b.dataset.doc); return; }
      if (e.target.closest('.x') || e.target === m) { sfx('tap'); m.remove(); }
    });
    el.appendChild(m);
  });

  // ---------- 目標與提示（每次 1 顆鑽石） ----------
  const STEPS = [
    { k: 'P1', done: () => F.P1, goal: '打開自己的置物櫃', hl: ['desk', 'locker'], hints: ['桌上不是有東西嗎。', '便條說密碼是「論文的第一個年份」。論文草稿就在桌上。', '論文封面標題的第一個數字，就是那個年份。'] },
    { k: 'GO', done: () => F.AT_HOME, goal: '回住處', hl: ['door'], hints: ['鑰匙拿到了，還站著做什麼。', '先點道具欄的鑰匙，再點研究室的門。', '點下方道具欄的「住處鑰匙」，再點研究室的門。'] },
    { k: 'GATE', done: () => F.GATE, goal: '打開鐵門', hl: ['gate'], hints: ['鑰匙不只開家門。', '先點道具欄的鑰匙，再點鐵門。', '點下方道具欄的「住處鑰匙」，再點鐵門。'] },
    { k: 'P2', done: () => F.P2, goal: '打開家門', hl: ['plate', 'keypad'], hints: ['你自己寫過規則。', '門牌是 37；出入證上有第一次登記的日期。', '門牌號碼，接上第一次進研究室的月日。'] },
    { k: 'P3', done: () => F.P3, goal: '整理文件', hl: ['wall', 'shelf', 'pile'], hints: ['牆上只寫了一半。', '所有年份先換成西元。書架上有換算對照表；佛曆是減 543。已經是西元的，不用換。', '各換成西元以後，再依十年歸檔。別只看文件上原本的紀年。'] },
    { k: 'P4', done: () => F.P4, goal: '讀懂文件', hl: ['board'], hints: ['看完再下結論。', '四份文件的機構名字都不一樣，但做的事和東西的去向一樣。', '共同點不在地點，而在「帶走之後去了哪裡」。你當時在追的，也是這件事。'] },
    { k: 'END', done: () => false, goal: '翻到筆記本最後一頁', hl: ['desk'], hints: ['你自己的筆記本，最後一頁還沒看。', '點書桌上的筆記本。', '筆記本就在書桌上。'] },
  ];
  const cur = () => STEPS.find(s => !s.done()) || STEPS[STEPS.length - 1];
  const paintGoal = () => { $(el, '#goal').textContent = '目標　' + (F.START ? cur().goal : '—'); };
  function flash(ids, ms = 5000) { ids.forEach(id => el.querySelectorAll(`[data-hs="${id}"]`).forEach(b => { b.classList.add('show'); setTimeout(() => b.classList.remove('show'), ms); })); }
  const paintHintMeta = () => {
    const m = $(el, '#hintMeta'); if (!m) return;
    if (task) { m.textContent = '第 1 段免費'; return; }
    if (!F.START) { m.textContent = ''; return; }
    const have = S0.hints[cur().k] || 0;
    if (have <= 0) m.textContent = '第 1 段免費';
    else if (have < 3) m.textContent = '1 💎';
    else m.textContent = '已看完';
  };
  paintHintMeta();
  $(el, '#hintBtn').addEventListener('click', async () => {
    sfx('tap');
    if (task) { toast(task.hint); return; }
    if (!F.START) { toast('這裡不需要提示，往下看劇情吧。'); return; }
    const stp = cur(); const have = S0.hints[stp.k] || 0;
    const lv = Math.min(have + 1, 3);
    const isNew = lv > have;
    if (isNew && lv >= 2) {
      const dd = get();
      const noDia = dd.diamonds < HINT_COST;
      const ok = await modal({ title: '使用提示', body: `消耗 ${HINT_COST} 顆鑽石，取得第 ${lv} 段提示。`, bodyHtml: `<div class="col" style="align-items:center;gap:4px"><div class="row" style="height:48px;gap:12px;font-size:18px"><span style="color:var(--text-2)">消耗</span><img src="${IMG('diamond.webp')}" alt="鑽石" style="width:40px;height:40px"><b style="font-size:24px">×${HINT_COST}</b></div><div style="font-size:14px;line-height:24px;color:var(--muted)">第 ${lv}／3 段提示　目前持有 ${dd.diamonds} 顆鑽石</div></div>`, buttons: [{ label: '取消', kind: 'btn-line', value: false }, { label: noDia ? '鑽石不足' : '使用提示', kind: 'btn', value: true, disabled: noDia }] });
      if (!ok || !alive) return;
      if (get().diamonds < HINT_COST) { toast('鑽石不足'); return; }
      get().diamonds -= HINT_COST; save();
      toast(`已扣 1 顆，剩 ${get().diamonds} 顆`);
    }
    if (isNew) { S0.hints[stp.k] = lv; persist(); }
    sfx('hint'); if (lv >= 2) flash(stp.hl);
    if (lv === 1) { await say(stp.hints[0], 'dark'); S(); }
    else sys([`提示 ${lv}／3：${stp.hints[lv - 1]}`], 4600);
    paintHintMeta();
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
    pauseAt = Date.now();
    box.addEventListener('click', e => { if (e.target.closest('[data-ok]') || e.target.closest('.x')) { sfx('tap'); box.remove(); if (pauseAt) { pausedMs += Date.now() - pauseAt; pauseAt = 0; } } });
    el.appendChild(box);
  });
  $(el, '#leave').addEventListener('click', async () => {
    sfx('tap');
    const ok = await modal({ title: '離開關卡', body: '離開後要從頭挑戰，確定嗎？', buttons: [{ label: '繼續調查', kind: 'btn-line', value: false }, { label: '離開', kind: 'btn', value: true }] });
    if (ok && alive) { meta.hintsKept = { ...(meta.hintsKept || {}), ...(S0.hints || {}) }; save(); go('stages', { tab: 0 }); }
  });

  // ---------- 錯誤：所有謎題答錯都算一次；滿 3 次或時間到 → 這一節從頭重新挑戰（已買提示保留） ----------
  const paintFail = () => $(el, '#alert').querySelectorAll('i').forEach((x, i) => x.classList.toggle('on', i < S0.fail));
  const FAIL_LINE = ['那份放錯了。', '（看了你一眼）你確定你看得懂？'];
  const FAIL_LINE_P4 = ['這個結論站不住腳。', '（看了你一眼）你確定你看得懂？'];
  async function miss(kind) {
    sfx('error'); S0.fail++; persist(); paintFail();
    if (S0.fail >= MAX_FAIL) { await lose('fail'); return; }
    if (kind === 'p3' || kind === 'p4') { await say((kind === 'p4' ? FAIL_LINE_P4 : FAIL_LINE)[S0.fail - 1], 'dark'); S(); }
  }
  async function lose(why) {
    if (ended) return;
    ended = true; stopTimer(); closeCu(); listeners = [];
    meta.hintsKept = { ...(meta.hintsKept || {}), ...(S0.hints || {}) }; meta.st = null; meta.keep = null; save();
    if (why === 'fail' && F.AT_ROOM) {
      for (const [w, t] of [['dark', '（把文件一疊疊收起來）夠了。'], ['me', '等一下，我快——'], ['dark', '你連自己的東西都看不懂。今晚就到這裡。']]) { await say(t, w).catch(() => {}); }
      sfx('door');
    } else sfx('error');
    alive = false;
    const b = html(`<div class="n1-fail"><div class="col" style="align-items:center;gap:16px;z-index:2">
<h2>${why === 'time' ? '時間到了' : '錯誤已達 3 次'}</h2><p>這一節要從頭重新挑戰。</p><p>已保留：已買的提示</p>
<div class="row" style="gap:16px;height:56px"><button type="button" class="btn-line" data-a="out" style="width:208px">返回關卡選擇</button><button type="button" class="btn" data-a="retry" style="width:208px">重新挑戰</button></div></div></div>`);
    b.addEventListener('click', e => { const a = e.target.closest('[data-a]'); if (!a) return; sfx('tap'); if (a.dataset.a === 'retry') go('n02'); else go('stages', { tab: 0 }); });
    el.appendChild(b);
  }

  // ================= 場景 =================
  // 序　舊館外・雨停之後（BG-001）：達克靠著 N01 結尾那台黑色轎車
  async function sceneS() {
    setScene('N02-BG-001', '舊館外・深夜', []);
    $(el, '#black').classList.remove('on'); await wait(600); S();
    await sys([`限時 30 分鐘　錯 ${MAX_FAIL} 次、時間到或中途離開，都要從頭挑戰`], 2600); S();
    await say('樓上還有一扇窗亮著。樓下那扇，是暗的。', 'me', { think: true }); S();
    if (d02 === 1) await say('那個保安……我總覺得他沒把話說完。', 'me', { think: true });
    else if (d02 === 0) await say('總感覺哪裡有錯…', 'me', { think: true });
    else if (d02 === 2) await say('我還是不知道，今晚到底出了什麼事……', 'me', { think: true });
    S();
    await tapTask('dark', '點擊靠在車旁的人', [
      { id: 'dark', x: 1055, y: 300, w: 150, h: 290, label: '靠在車旁的人' },
      { id: 'car', x: 922, y: 375, w: 310, h: 185, label: '黑色轎車' },
    ], { hint: '達克就站在右邊的車旁。', miss: '達克在右邊的車旁。' });
    await lines([
      ['dark', '（看了一眼，嘆氣）終於出來了嗎？'],
      ['me', '……你是？'],
      ['dark', '我也是因杜阿森教授的學生。'],
      ['me', '教授的學生？那我們……'],
      ['dark', '同一個研究室。僅此而已！'],
      ['me', '那現在……？'],
      ['dark', '上車吧！教授叫我來帶你回去。'],
    ]);
    await tapTask('car', '點擊那台黑色轎車', [
      { id: 'car', x: 922, y: 375, w: 133, h: 185, label: '黑色轎車' },
    ], { hint: '點右邊那台黑色轎車。', miss: '要上車，點右邊那台黑色轎車。' });
    await say('謝謝……', 'me'); S();
    await say('……', 'dark'); S();
    sfx('cardoor'); await wait(700); S(); sfx('caroff');
    await sys(['前往：學校・教授研究室'], 1600); S();
    return 'A';
  }

  // A　教授研究室（BG-002）
  const A_HS = [
    { id: 'door', x: 38, y: 44, w: 110, h: 381, label: '研究室的門' },
    { id: 'desk', x: 0, y: 415, w: 475, h: 160, label: '我的座位' },
    { id: 'locker', x: 1045, y: 119, w: 55, h: 331, label: '我的置物櫃' },
    { id: 'window', x: 281, y: 19, w: 269, h: 275, label: '窗' },
    { id: 'shelf', x: 600, y: 88, w: 310, h: 140, label: '書架' },
  ];
  async function sceneA() {
    setScene('N02-BG-002', '學校・教授研究室', A_HS);
    if (!meta.seenIntro) {
      await tapTask('prof', '點擊窗邊的教授', [
        { id: 'prof', x: 560, y: 130, w: 160, h: 470, label: '因杜阿森' },
        ...A_HS,
      ], { hint: '教授在窗邊。', miss: '教授在窗邊。' });
      await lines([
        ['prof', '回來了就好！'],
        ['me', '教授，我好像……'],
        ['prof', '沒事……先坐著休息吧！剩下的之後說……'],
      ]);
      await tapTask('desk', '點擊自己的座位坐下', A_HS, { hint: '你的座位在左邊。', miss: '你的座位在左邊。' });
      await lines([
        ['prof', '（看向達克）辛苦你了，讓你跑了這趟。'],
        ['dark', '幫一個小忙而已，不過這小子……'],
        ['prof', '（看向你）你還記得他嗎？'],
        ['me', '也是你的學生……'],
        ['dark', '從見面就這樣……'],
        ['prof', '看來是真的。（停頓）'],
      ]);
      if (d01 === 2) await say('他要我先相信他。現在人就在眼前，我還是不敢說自己完全信。', 'me', { think: true });
      else if (d01 === 0) await say('他在電話裡說，從我能確認的事情開始。可是我能確認的，好像很少。', 'me', { think: true });
      else if (d01 === 1) await say('他在電話裡說，先處理眼前的問題。現在眼前的問題，變成回家。', 'me', { think: true });
      await lines([
        ['prof', '他不是裝的。達克，他失憶了！'],
        ['dark', '？'],
        ['prof', '{主角}，你還記得多少？'],
        ['me', '……什麼都不記得了，很突然地出現在那。'],
        ['me', '我甚至不知道自己怎麼進去……'],
        ['dark', '……'],
        ['prof', '達克，再拜託你一件事。'],
        ['dark', '教授您說。'],
        ['prof', '先帶他回家吧！或許熟悉的地方，能喚醒他的記憶，讓他想起一些東西。'],
        ['dark', '……'],
        ['prof', '你們同一個研究室的，互相幫忙一下。'],
        ['prof', '地址我寫給你。現在只有你能幫忙了。'],
        ['dark', '……知道了。'],
        ['dark', '我只幫忙送到家。'],
        ['prof', '麻煩你了。（轉向你）還有，你之前收集的那些歷史文件，回去整理一下。你失憶前……已經快摸到某些東西了。'],
        ['me', '什麼東西？'],
        ['prof', '等你自己找到，我再告訴你我知道的部分。'],
        ['me', '住處的鑰匙……應該在我的置物櫃裡。'],
      ]);
      meta.seenIntro = true; save();
      setHs(A_HS);
    }
    flag('START'); paintGoal(); paintHintMeta();
    return loop(async (id, item) => {
      if (id === 'back') { closeCu(); return; }
      if (id === 'desk') { await deskCu(); return; }
      if (id === 'locker') {
        if (F.P1_TAKEN) return void sys(['置物櫃裡只剩一條灰色圍巾'], 1400);
        if (!F.LOCKER_TAUNT) { flag('LOCKER_TAUNT'); await say('自己的東西，自己想辦法。', 'dark'); S(); }
        await p1(); paintGoal(); return;
      }
      if (id === 'window') return void sys(['校園的燈都熄了。'], 1400);
      if (id === 'shelf') return void sys(['教授的書，大部分是外文。'], 1400);
      if (id === 'prof') { await say('文件整理好了，再來告訴我。', 'prof'); S(); return; }
      if (id === 'dark') { await say(F.P1_TAKEN ? '走了。' : '……', 'dark'); S(); return; }
      if (id === 'door') {
        if (!F.P1_TAKEN) { await say('先拿到鑰匙再走。', 'dark'); S(); return; }
        if (item !== 'key') { sfx('error'); await sys(['門鎖著。點道具欄的鑰匙，再點門'], 1600); S(); return; }
        sfx('latch'); await wait(500); S(); await sys(['前往：住處'], 1400); S(); return 'B';
      }
    });
  }
  // 書桌近景（DETAIL-005）
  async function deskCu() {
    openCu(cuBg('N02-BG_DETAIL-005'), [
      { id: 'thesis', x: 115, y: 138, w: 466, h: 402, label: '論文草稿' },
      { id: 'sticky', x: 631, y: 319, w: 140, h: 102, label: '便條' },
      { id: 'cal', x: 835, y: 119, w: 384, h: 306, label: '桌曆' },
    ]);
    return loop(async id => {
      if (id === 'back') { closeCu(); return true; }
      if (id === 'cal') { await calendar(); S(); return; }
      if (DOCS[id]) { await readDoc(id); S(); }
    });
  }
  // 謎題 1：置物櫃四位數轉盤鎖（DETAIL-006），答案 1908；打開後三樣東西一一拿走
  async function p1() {
    const v = F.P1_V || [0, 0, 0, 0];
    const WX = [506, 600, 694, 788];
    // 拿走一樣就少一樣：依已拿的物品組合換圖（k 鑰匙、n 筆記本、p 出入證）
    const openImg = () => { const t = ['key', 'note', 'pass'].filter(has).map(k => k[0]).join(''); return t.length === 3 ? 'N02-BG_DETAIL-006-empty' : t ? 'N02-BG_DETAIL-006-open-' + t : 'N02-BG_DETAIL-006-open'; };
    const paint = msg => openCu(cuBg(F.P1 ? (F.P1_TAKEN ? 'N02-BG_DETAIL-006-empty' : openImg()) : 'N02-BG_DETAIL-006') +
      (F.P1 ? '' : WX.map((x, i) => `<div class="n2-wheel" style="left:${x}px;top:431px;width:75px;height:94px"><span>${v[i]}</span></div>`).join('')) +
      `<div class="n1-state" style="left:640px;top:648px">${msg || (F.P1 ? '把裡面的東西拿走' : '點上下的齒紋轉動，對好之後拉開櫃門')}</div>`,
    F.P1 ? [
      ...(has('key') ? [] : [{ id: 'key', x: 445, y: 200, w: 125, h: 125, label: '住處鑰匙' }]),
      ...(has('note') ? [] : [{ id: 'note', x: 575, y: 75, w: 380, h: 213, label: '筆記本' }]),
      ...(has('pass') ? [] : [{ id: 'pass', x: 570, y: 263, w: 225, h: 88, label: '研究室出入證' }]),
      { id: 'scarf', x: 600, y: 388, w: 250, h: 312, label: '灰色圍巾' },
    ] : [
      ...WX.flatMap((x, i) => [{ id: 'u' + i, x, y: 375, w: 75, h: 56, label: `第 ${i + 1} 輪往上` }, { id: 'd' + i, x, y: 525, w: 75, h: 63, label: `第 ${i + 1} 輪往下` }]),
      { id: 'pull', x: 306, y: 222, w: 113, h: 415, label: '拉開櫃門' },
    ]);
    paint();
    return loop(async id => {
      if (id === 'back') { closeCu(); return true; }
      if (!F.P1) {
        if (id[0] === 'u' || id[0] === 'd') { const i = +id[1]; v[i] = (v[i] + (id[0] === 'u' ? 1 : 9)) % 10; F.P1_V = [...v]; persist(); sfx('dial'); paint(); return; }
        if (id !== 'pull') return;
        if (v.join('') !== '1908') { paint('鎖沒有開'); await miss('p1'); S(); return; }
        sfx('latch'); flag('P1'); paint(); return;
      }
      if (id === 'scarf') { await sys(['一條灰色圍巾。'], 1200); S(); return; }
      if (id === 'key' || id === 'note' || id === 'pass') {
        addItem(id); paint();
        if (id === 'note') { await lines([['me', '這是我的筆記？'], ['dark', '或許，上面寫著你的名字。']]); }
        if (has('key') && has('note') && has('pass')) { flag('P1_TAKEN'); paint(); await wait(600); S(); closeCu(); paintGoal(); return true; }
        paint(); return;
      }
    });
  }

  // B　公寓三樓（BG-003 → 用鑰匙開鐵門 → BG-003-open）
  const B_HS = () => F.GATE ? [
    { id: 'plate', x: 575, y: 91, w: 81, h: 40, label: '門牌' },
    { id: 'keypad', x: 680, y: 305, w: 70, h: 120, label: '密碼鎖' },
    { id: 'inner', x: 470, y: 140, w: 200, h: 460, label: '內門' },
    { id: 'mail', x: 337, y: 240, w: 94, h: 122, label: '信箱' },
    { id: 'shoe', x: 785, y: 394, w: 253, h: 225, label: '鞋櫃' },
  ] : [
    { id: 'plate', x: 575, y: 91, w: 81, h: 40, label: '門牌' },
    { id: 'gate', x: 460, y: 131, w: 288, h: 475, label: '鐵門' },
    { id: 'mail', x: 337, y: 240, w: 94, h: 122, label: '信箱' },
    { id: 'shoe', x: 785, y: 394, w: 253, h: 225, label: '鞋櫃' },
    { id: 'light', x: 765, y: 262, w: 28, h: 35, label: '電燈開關' },
  ];
  async function sceneB() {
    setScene(F.GATE ? 'N02-BG-003-open' : 'N02-BG-003', '公寓三樓・門口', B_HS());
    if (!F.B_IN) {
      flag('B_IN');
      await lines([
        ['dark', '到了。'],
        ['me', '你怎麼知道我住這裡？'],
        ['dark', '教授剛給了地址。'],
      ]);
      flag('AT_HOME'); paintGoal();
    }
    return loop(async (id, item) => {
      if (id === 'back') { closeCu(); return; }
      if (id === 'plate') return void sys(['門牌：37'], 1600);
      if (id === 'shoe') return void sys(['一雙球鞋、一把傘。'], 1400);
      if (id === 'light') return void sys(['按了幾下，燈還是只亮一半。'], 1400);
      if (id === 'dark') { await say(F.GATE ? '大部分人應該會把密碼留在自己天天看得到的地方吧？' : '……', 'dark'); S(); return; }
      if (id === 'mail') { await mailCu(); return; }
      if (id === 'gate') {
        if (item !== 'key') { sfx('error'); return void sys(['鐵門鎖著。點道具欄的鑰匙，再點鐵門'], 1600); }
        sfx('latch'); flag('GATE'); setBg('N02-BG-003-open'); setHs(B_HS());
        await lines([
          ['me', '鑰匙能開外面的鐵門，可是裡面這道……是密碼鎖。', { think: true }],
          ['dark', '（看了一眼手錶）大部分人會把密碼留在自己天天看得到的地方。'],
        ]);
        paintGoal(); return;
      }
      if (id === 'inner') { if (!F.P2) return void sys(['內門鎖著。旁邊是密碼鎖。'], 1400); return 'C'; }
      if (id === 'keypad') { if (await p2()) return 'C'; }
    });
  }
  async function mailCu() {
    openCu(cuBg('N02-BG_DETAIL-008'), [
      { id: 'bill', x: 363, y: 380, w: 525, h: 175, label: '帳單信封' },
      { id: 'kraft', x: 388, y: 275, w: 525, h: 105, label: '牛皮紙信封' },
      { id: 'slot', x: 438, y: 75, w: 475, h: 125, label: '卡在投信口的信封' },
    ]);
    return loop(async id => {
      if (id === 'back') { closeCu(); return true; }
      if (id === 'bill') { await readDoc('bill'); S(); return; }
      if (id === 'kraft') { await sys(['牛皮紙信封，裡面是空的。'], 1400); S(); return; }
      if (id === 'slot') { await sys(['夾在投信口的廣告傳單。'], 1400); S(); return; }
    });
  }
  // 謎題 2：六位數按鍵密碼鎖（DETAIL-007），答案 370918
  async function p2() {
    let v = '', ok = false;
    const K = { k1: [570, 151], k2: [635, 151], k3: [700, 151], k4: [570, 212], k5: [635, 212], k6: [700, 212], k7: [570, 273], k8: [635, 273], k9: [700, 273], kC: [570, 335], k0: [635, 335], kOK: [700, 335] };
    const paint = msg => openCu(cuBg('N02-BG_DETAIL-007') +
      `<div class="n2-lcd" style="left:565px;top:35px;width:191px;height:59px">${[0, 1, 2, 3, 4, 5].map(i => `<i class="${i < v.length ? 'on' : ''}"></i>`).join('')}</div>` +
      `<i class="n2-led${ok ? ' on' : ''}" style="left:648px;top:107px;width:26px;height:26px"></i><div class="n1-state" style="left:640px;top:648px">${msg || ''}</div>`,
    Object.entries(K).map(([k, [x, y]]) => ({ id: k, x, y, w: 56, h: 56, label: k === 'kOK' ? '確認' : k === 'kC' ? '清除' : k.slice(1) })));
    paint();
    const r = await loop(async id => {
      if (id === 'back') { closeCu(); return 'no'; }
      if (id === 'kC') { v = v.slice(0, -1); sfx('beep'); paint(); return; }
      if (id === 'kOK') {
        if (v === '370918') return 'ok';
        sfx('beepErr'); v = ''; paint('密碼錯誤'); await miss('p2'); S(); return;
      }
      if (v.length < 6) { v += id.slice(1); sfx('beep'); paint(); }
    });
    if (r !== 'ok') return false;
    ok = true; paint(); sfx('latch'); flag('P2'); await wait(700); S(); closeCu();
    await sys(['門開了'], 1200); S();
    return true;
  }

  // C　主角房間（BG-004；筆記本在身上，書桌是空的。謎題 4 完成後把筆記本放回桌上 → BG-004-notebook）
  const C_HS = [
    { id: 'shelf', x: 0, y: 0, w: 269, h: 460, label: '書架' },
    { id: 'wall', x: 272, y: 88, w: 190, h: 175, label: '牆上的紙條' },
    { id: 'pile', x: 362, y: 450, w: 438, h: 175, label: '整理桌' },
    { id: 'floor', x: 190, y: 630, w: 810, h: 90, label: '地上的文件' },
    { id: 'board', x: 740, y: 69, w: 329, h: 219, label: '軟木板' },
    { id: 'desk', x: 800, y: 306, w: 340, h: 200, label: '書桌' },
    { id: 'basket', x: 262, y: 306, w: 69, h: 140, label: '捲起來的紙' },
  ];
  async function sceneC() {
    setScene(F.P4 ? 'N02-BG-004-notebook' : 'N02-BG-004', '我的房間', C_HS);
    flag('AT_ROOM');
    if (!F.C_IN) {
      flag('C_IN');
      await lines([
        ['dark', '（掃了一眼）你的東西，你自己整理。我在這裡等。'],
        ['me', '這些……都是我收集的？'],
        ['dark', '房間是你的，不然是誰的！'],
        ['me', '我在找什麼？'],
        ['dark', '我怎麼知道…。不過你半夜一個人去那間舊館，應該不是去散步。'],
      ]);
    }
    paintGoal();
    return loop(async id => {
      if (id === 'back') { closeCu(); return; }
      if (id === 'wall') { await readDoc('rule'); return; }
      if (id === 'shelf') { await readDoc('conv'); return; }
      if (id === 'basket') return void sys(['幾卷舊地圖。現在先不管它。'], 1400);
      if (id === 'dark') { await say(F.P3 ? '……' : '文件不會自己分類。', 'dark'); S(); return; }
      if (id === 'pile' || id === 'floor') { if (F.P3) return void sys(['文件都歸檔好了'], 1200); await p3(); paintGoal(); return; }
      if (id === 'board') { if (!F.P3) { await say('先把地上的東西整理好。', 'dark'); S(); return; } if (F.P4) return void sys(['軟木板上的線索都串起來了'], 1200); await p4(); paintGoal(); return; }
      if (id === 'desk') { if (!F.P4) return void sys(['書桌。筆記本在我身上。'], 1400); return 'END'; }
    });
  }
  // 謎題 3：整理桌（DETAIL-009）：點文件拿起（再點一次可閱讀）→ 點資料夾放進去
  async function p3() {
    let sel = null;
    const left = () => Object.keys(SORT).filter(k => !S0.placed[k]);
    const FX = [120, 390, 658, 925], TAB = [215, 485, 753, 1020]; // 資料夾、標籤（DETAIL-009）
    const thumb = k => `<img src="${IMG(DOCS[k].asset + '.webp')}" alt="">`;
    const paint = msg => openCu(cuBg(F.P3 ? 'N02-BG_DETAIL-009-done' : 'N02-BG_DETAIL-009') +
      Object.keys(SORT).map((k, i) => S0.placed[k] ? '' : `<div class="n2-card${sel === k ? ' sel' : ''}" style="left:${150 + i * 270}px;top:96px">${thumb(k)}<span>${k}</span></div>`).join('') +
      FOLDERS.map((f, i) => `<div class="n2-tab" style="left:${TAB[i]}px;top:314px">${f}s</div>` + (F.P3 ? '' : Object.keys(S0.placed).filter(k => S0.placed[k] === f).map(k => `<div class="n2-infolder" style="left:${FX[i] + 60}px;top:360px">${thumb(k)}</div>`).join(''))).join('') +
      `<div class="n1-state" style="left:640px;top:648px">${msg || (sel ? `拿起了文件 ${sel}：點資料夾放進去，再點一次文件可以閱讀` : '點一份文件拿起來')}</div>`,
    [...left().map(k => ({ id: 'd' + k, x: 150 + 'ABCD'.indexOf(k) * 270, y: 96, w: 160, h: 200, label: '文件 ' + k })),
      ...FOLDERS.map((f, i) => ({ id: 'f' + f, x: FX[i], y: 320, w: 238, h: 300, label: f + ' 年代資料夾' }))]);
    paint();
    return loop(async id => {
      if (id === 'back') { closeCu(); return true; }
      if (id[0] === 'd') { const k = id[1]; if (sel === k) { await readDoc(k); S(); paint(); return; } sel = k; sfx('page'); paint(); return; }
      if (id[0] === 'f') {
        if (!sel) { paint('先拿起一份文件'); return; }
        const f = id.slice(1);
        if (SORT[sel] !== f) { sel = null; paint(); await miss('p3'); S(); if (!ended) paint('這份不該放在這裡。'); return; }
        S0.placed[sel] = f; persist(); sfx('file'); sel = null;
        if (left().length) { paint(); return; }
        flag('P3'); paint('四份文件都歸檔好了'); await wait(1000); S(); closeCu();
        await say('年代分開以後……這四份文件，好像在說同一件事。', 'me'); S();
        return true;
      }
    });
  }
  // 謎題 4：軟木板（DETAIL-010）：六份文件釘在圖釘上，點來讀；整理好後回答兩題
  async function p4() {
    const Q = [
      { q: '這些文件的共同點是？', o: ['這些事件的發生地點都在亞洲一帶，沒有例外', '都以研究為名帶走，送往 90-S，從未公開', '這些全部都是各國政府主導的官方研究計畫', '這些全都和兩次世界大戰的軍備擴張直接有關'], a: 1 },
      { q: '我之前在查什麼？', o: ['二十世紀各國科學界一連串的造假與掩飾事件', '一群不斷改名、以研究為名收走樣本或器物的人', '各地博物館失竊案被一一串連起來的走私網路', '冷戰時期各國所隱匿未報的核子試驗完整紀錄'], a: 1 },
    ];
    const PIN = [[400, 218], [638, 218], [875, 218], [400, 418], [638, 418], [875, 418]];
    const KEYS = ['A', 'B', 'C', 'D', 'E', 'F'];
    const unreadOf = () => KEYS.filter(k => !S0.read.includes(k));
    const paint = () => {
      const unread = unreadOf();
      openCu(cuBg('N02-BG_DETAIL-010') +
        KEYS.map((k, i) => `<div class="n2-pinned" style="left:${PIN[i][0] - 70}px;top:${PIN[i][1] - 6}px"><img src="${IMG(DOCS[k].asset + '.webp')}" alt=""><span>${k}</span>${unread.includes(k) ? '<i class="n2-unread" aria-label="還沒看">未</i>' : ''}</div>`).join('') +
        `<button type="button" class="btn n2-answer${unread.length ? ' is-wait' : ''}" data-hs="ans">整理出結論</button>`,
      KEYS.map((k, i) => ({ id: 'r' + k, x: PIN[i][0] - 76, y: PIN[i][1] - 12, w: 152, h: 176, label: '讀 ' + DOCS[k].title })));
      const ans = $(cu, '.n2-answer');
      if (ans) ans.addEventListener('click', ev => { ev.stopPropagation(); sfx('tap'); emit({ type: 'hs', id: 'ans' }); });
    };
    paint();
    return loop(async id => {
      if (id === 'back') { closeCu(); return true; }
      if (id[0] === 'r') { await readDoc(id[1]); S(); paint(); return; }
      if (id !== 'ans') return;
      const unread = unreadOf();
      if (unread.length) { toast(`看完再下結論。還沒看：${unread.join('、')}（${KEYS.length - unread.length}/6）`); return; }
      const ansBtn = $(cu, '.n2-answer'); if (ansBtn) ansBtn.style.visibility = 'hidden';
      const showAns = () => { const b = $(cu, '.n2-answer'); if (b) b.style.visibility = ''; };
      for (let qi = F.P4_Q || 0; qi < Q.length; qi++) {
        const c = await choose(`${qi + 1}／2　${Q[qi].q}`, Q[qi].o); S();
        if (c < 0) { showAns(); return; }
        if (c !== Q[qi].a) { showAns(); await miss('p4'); S(); return; }
        sfx('pin'); flag('P4_Q', qi + 1);
      }
      flag('P4'); closeCu();
            await lines([
        ['me', '西伯利亞、北大西洋……幾十年、好幾個地方，都有同一群人經手。'],
        ['dark', '同一群人？'],
        ['me', '名字每次都不一樣。可是做事的方法一模一樣。'],
        ['dark', '（看著文件，安靜了很久）'],
      ]);
            setBg('N02-BG-004-notebook');
      await sys(['你把筆記本放在書桌上，翻到最後一頁'], 1800); S();
      paintGoal(); return true;
    });
  }

  // 結尾
  async function ending() {
    await readDoc('last'); S();
    await lines([
      ['me', '這一頁……「是他。」旁邊原本寫著一個名字，被我自己塗掉了。'],
      ['me', '舊館那張借閱卡，旁邊的字也是我寫的。'],
      ['me', '我在找一個人。'],
      ['me', '可是那個名字，是我自己塗掉的。'],
    ]);
        await lines([
      ['dark', '（拿起外套）我走了。'],
      ['me', '達克。'],
      ['dark', '還有事？'],
      ['me', '謝謝。'],
      ['dark', '（沒有回頭）教授交代的事，我做完了而已。'],
    ]);
    sfx('door');
    await wait(700); S();
    await say('以前的我，到底是個什麼樣的人？', 'me', { think: true }); S();
    ended = true; stopTimer();
    const dd = get();
    if (!dd.records.includes('n02')) dd.records.push('n02');
    meta.st = null; meta.cleared = true; meta.keep = null; meta.hintsKept = null; save();
    $(el, '#black').classList.add('on'); await wait(600); S();
    const card = html(`<div class="n1-fail"><div class="col" style="align-items:center;gap:16px;z-index:2"><div class="label">第一章・第二節</div><h2>留下來的人</h2><p>完</p><p class="n2-credit">背景音樂　HORROR — Mehul ShaRma</p><div class="row" style="height:56px"><button type="button" class="btn" data-a="out" style="width:208px">返回關卡選擇</button></div></div></div>`);
    el.appendChild(card);
    await new Promise(r => $(card, '[data-a]').addEventListener('click', () => { sfx('tap'); r(); })); S();
    go('stages', { tab: 0 });
  }

  async function flow() {
    paintSlots(); paintGoal(); bgm('n02'); // 背景音樂：HORROR — Mehul ShaRma
    let where = 'S';
    paintFail(); paintTimer(); tick = setInterval(paintTimer, 250);
    const RUN = { S: sceneS, A: sceneA, B: sceneB, C: sceneC };
    let first = true;
    for (;;) {
      S0.scene = where; persist();
      if (!first) { $(el, '#black').classList.add('on'); await wait(450); S(); closeCu(); }
      const p = RUN[where]();
      if (!first || where !== 'S') { await wait(120); S(); $(el, '#black').classList.remove('on'); }
      first = false;
      const next = await p; S();
      if (next === 'END') { await ending(); return; }
      where = next;
    }
  }
  flow().catch(e => { if (e && e.message !== 'left') console.error(e); });
  return () => { alive = false; listeners = []; stopTimer(); };
}
