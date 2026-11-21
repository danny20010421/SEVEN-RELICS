// 主線第一章第二節 N02　灰盒可玩版
// 劇本：docs/N02-for-grok-final.md（製作人確認版）。玩法：docs/N02-gameplay.md。
// 美術尚未交件：場景先用灰盒＋可點範圍；檔名即素材 ID，美術放進 assets/img/ 後自動顯示。
import { get, save } from './store.js';
import { sfx, bgm, applyVolume } from './audio.js';
import { html, $, IMG, ICON, wait, esc, modal, toast } from './ui.js';

const MAX_FAIL = 3; // 整理與解讀文件錯 3 次 → 達克收走文件離開 → 整節從頭
const HINT_COST = 1; // 第二節起：每次提示 1 顆鑽石

const ITEMS = {
  key: { name: '住處鑰匙', asset: 'N02-PROP-001' },
  note: { name: '筆記本', asset: 'N02-PROP-002' },
  pass: { name: '研究室出入證', asset: 'N02-PROP-003' },
};
const ICO = {
  hint: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/></svg>',
  file: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/></svg>',
  log: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/></svg>',
};

// ---------- 文件（字由程式寫在紙上；紙張圖到位前顯示灰盒紙） ----------
const DOCS = {
  thesis: { title: '論文草稿封面', asset: 'N02-DOC-012', html: '<h4>研究計畫（草稿）</h4><p class="big">1908—1978 年間<br>跨國異常事件與失蹤樣本比較研究</p><p class="muted">指導教授：因杜阿森</p>' },
  sticky: { title: '便條', asset: 'N02-DOC-013', html: '<p class="hand big">密碼：論文的第一個年份。<br>別再忘了。</p>' },
  cal: { title: '桌曆', asset: 'N02-DOC-013', html: '<h4>桌曆</h4><p>圈起來的日子：3 月 12 日、10 月 25 日</p>' },
  pass: { title: '研究室出入證', asset: 'N02-DOC-014', html: '<h4>研究室出入證</h4><table><tr><th>姓名</th><td>{name}</td></tr><tr><th>研究室</th><td>因杜阿森研究室</td></tr><tr><th>首次登記</th><td>2023.09.18</td></tr></table>' },
  bill: { title: '帳單信封', asset: 'N02-DOC-015', html: '<h4>水費通知</h4><p>收件人：{name}</p><p>地址：三樓　37 號</p>' },
  note1: { title: '筆記本・第一頁', asset: 'N02-DOC-011', html: '<p class="hand">家門：門牌，接上我第一次進研究室的那天（月日）。</p><p class="hand">歸檔：所有年份先換成西元再分。</p>' },
  rule: { title: '牆上的分類規則', asset: 'N02-DOC-013', html: '<p class="hand big">依年代歸檔。<br>每十年一個資料夾。</p><p class="muted">（下半張被撕掉了）</p>' },
  conv: { title: '紀年換算對照表', asset: 'N02-DOC-022', html: '<h4>紀年換算對照表</h4><table><tr><th>明治</th><td>＋1867</td></tr><tr><th>昭和</th><td>＋1925</td></tr><tr><th>民國</th><td>＋1911</td></tr><tr><th>佛曆</th><td>－543</td></tr></table>' },
  A: { title: '📄 調查報告（俄文譯本）', asset: 'N02-DOC-016', html: '<h4>現場調查報告</h4><p>日期：西元 1908 年</p><p>西伯利亞通古斯河谷大爆炸後，北方礦物學會派員進入現場，回收「異常結晶樣本」三箱，運往「90-S」。</p><p class="muted">末頁：樣本不列入公開紀錄。</p>' },
  B: { title: '📄 考古發掘報告', asset: 'N02-DOC-018', html: '<h4>發掘報告</h4><p>日期：昭和十二年</p><p>東亞古代文明研究所發掘青銅器一批，表面刻有無法辨識的文字。全數移交「90-S」。</p><p class="muted">（報告後半頁被裁掉）</p>' },
  C: { title: '📄 剪報', asset: 'N02-DOC-017', html: '<h4>南海沉船打撈古儀器　海外基金會「代為研究」</h4><p>日期：民國四十四年</p><p>沉船中打撈出的古代天文儀器殘件，已由一家海外基金會運走。博物館事後才得知。</p>' },
  D: { title: '📄 研究站採集紀錄', asset: 'N02-DOC-019', html: '<h4>熱帶生命科學協會　研究站紀錄</h4><p>日期：佛曆二五二一年</p><p>雨林深處採得不明植物種子樣本，全數移送 90-S。</p><p class="muted">研究站同年因火災關閉，紀錄僅存此頁。</p>' },
  E: { title: '📄 無署名的信', asset: 'N02-DOC-020', html: '<p class="hand">各地機構更名一事，已照辦。</p><p class="hand">一律送往 90-S。</p><p class="hand">不得公開，不得歸還。</p>' },
  F: { title: '📄 我的筆記', asset: 'N02-DOC-011', html: '<p class="hand">北方礦物學會（1908）<br>東亞古代文明研究所（1937）<br>？基金會（1955）<br>熱帶生命科學協會（1978）</p><p class="hand">國家不同，名字不同。都說「為了研究」。最後都送到同一個地方。之後都沒有公開。</p><p class="hand">90-S……是編號，還是座標？</p>' },
  last: { title: '筆記本・最後一頁', asset: 'N02-DOC-011', html: '<p class="hand big" style="text-align:center;margin-top:30%">是他。</p><p style="text-align:center"><span class="mosaic" aria-label="被塗掉的名字"><i></i><i></i><i></i></span></p>' },
};
const SORT = { A: '1900', B: '1930', C: '1950', D: '1970' }; // 正確資料夾
const FOLDERS = ['1900', '1930', '1950', '1970'];

export function render(st, params, go) {
  const d = get();
  const g = (d.player && d.player.gender) || 'm';
  const pname = (d.player && d.player.name) || '玩家';
  d.n02 = d.n02 || {};
  const meta = d.n02; // seenIntro 跨次保留
  const fresh = () => ({ scene: 'S', items: [], read: [], flags: {}, hints: {}, fail: 0, placed: {}, log: [] });
  let S0 = params && params.resume && meta.st ? meta.st : fresh();
  const F = S0.flags;

  const el = html(`<div class="scr g01 n01 n02">
<div class="layer" id="scene"></div>
<div class="fill" id="hsLayer" style="z-index:3"></div>
<div class="fill hidden" id="cu" style="z-index:6"></div>
<div class="shade-top"></div>
<div class="shade-right"></div>
<div class="lvl-top" id="hud">
  <button type="button" class="iconbtn" id="leave" aria-label="離開關卡">${ICON.back}</button>
  <div class="lvl-goal"><span class="chip-red" style="height:32px">第一章・第二節</span><span id="goal">目標　—</span></div>
  <div class="n1-alert hidden" id="alert" aria-label="失誤次數"><span>失誤</span><i></i><i></i><i></i></div>
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
  const scene = $(el, '#scene'), hsLayer = $(el, '#hsLayer'), cu = $(el, '#cu');
  let alive = true, listeners = [], ended = false;
  const S = () => { if (!alive) throw new Error('left'); };
  const emit = a => listeners.slice().forEach(l => l(a));
  const act = test => new Promise(res => { const l = a => { if (test(a)) { listeners = listeners.filter(x => x !== l); res(a); } }; listeners.push(l); });
  const persist = () => { meta.st = S0; save(); };
  const flag = (k, v = true) => { F[k] = v; persist(); };

  // ---------- 道具欄 ----------
  function paintSlots(ping) {
    const s = $(el, '#slots'); s.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const id = S0.items[i];
      if (!id) { s.appendChild(html('<span class="slot" role="img" aria-label="空的道具欄"></span>')); continue; }
      const b = html(`<button type="button" class="slot has${ping === id ? ' ping' : ''}" aria-label="${ITEMS[id].name}"><span class="n1-gb-item">${ITEMS[id].name}</span><img src="${IMG(ITEMS[id].asset + '.webp')}" alt="" onerror="this.remove()"></button>`);
      b.addEventListener('click', () => { sfx('tap'); if (id === 'note') readDoc('note1'); else if (id === 'pass') readDoc('pass'); else toast('住處鑰匙。到門口會自動使用。'); });
      s.appendChild(b);
    }
  }
  const addItem = id => { if (!S0.items.includes(id)) S0.items.push(id); sfx('pick'); persist(); paintSlots(id); };

  // ---------- 場景（灰盒：可點範圍顯示名稱；正式背景到位後只留熱點） ----------
  function setScene(bgId, title, objs) {
    scene.innerHTML = `<div class="n1-gb"><span>${bgId}　${title}</span></div><img class="bg" src="${IMG(bgId + '.webp')}" alt="${title}" onerror="this.remove()">`;
    setHs(objs);
  }
  function setHs(list, layer = hsLayer) {
    if (layer === hsLayer) hsLayer.innerHTML = '';
    list.forEach(({ id, x, y, w, h, label, cls = '' }) => {
      const b = html(`<button type="button" class="area n2-gb ${cls}" data-hs="${id}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px" aria-label="${label}"><span>${label}</span></button>`);
      b.addEventListener('click', ev => { ev.stopPropagation(); sfx('tap'); emit({ type: 'hs', id }); });
      layer.appendChild(b);
    });
  }
  async function loop(handler) {
    for (;;) {
      const a = await act(x => x.type === 'hs'); S();
      const r = await handler(a.id); S();
      if (r) return r;
    }
  }
  function openCu(inner, list = [], showLabels = false) {
    cu.innerHTML = `<div class="n1-gb"></div>${inner}`;
    const b = html(`<button type="button" class="btn-line g1-cuback">${ICON.back}<span>返回</span></button>`);
    b.addEventListener('click', ev => { ev.stopPropagation(); sfx('tap'); emit({ type: 'hs', id: 'back' }); });
    cu.appendChild(b); setHs(list, cu); cu.classList.toggle('labels', showLabels);
    cu.classList.remove('hidden'); hsLayer.classList.add('hidden'); $(el, '#slots').classList.add('cu-hide');
  }
  const closeCu = () => { cu.classList.add('hidden'); cu.innerHTML = ''; hsLayer.classList.remove('hidden'); $(el, '#slots').classList.remove('cu-hide'); };

  // ---------- 對白 ----------
  const WHO = { me: pname, dark: '達克', prof: '因杜阿森' };
  const PIC = { me: g === 'f' ? 'N01-CHAR-012' : 'N01-CHAR-013', dark: 'N02-CHAR-015', prof: 'N01-CHAR-014' };
  function say(cn, who = 'me', opt = {}) {
    cn = cn.replace(/\{主角\}/g, esc(pname));
    S0.log.push([WHO[who] || '', cn]); if (S0.log.length > 200) S0.log.shift();
    return new Promise(res => {
      const calm = cu.classList.contains('hidden') && !el.querySelector('.g1-docback');
      let pic = null;
      if (PIC[who] && calm && opt.pic !== false) pic = html(`<img class="portrait n1-char${who === 'me' ? '' : ' npc'}" src="${IMG(PIC[who] + '.webp')}" alt="">`);
      if (pic) el.appendChild(pic);
      const b = html(`<div class="sub${opt.think ? ' think' : ''}" role="button" tabindex="0" aria-label="點一下繼續"><div class="who"><span>${esc(opt.think ? pname + '（心裡）' : WHO[who] || '')}</span></div><p class="cn">${cn}</p>${ICON.down}</div>`);
      const done = () => { sfx('tap'); b.remove(); if (pic) pic.remove(); res(); };
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
  $(el, '#logBtn').addEventListener('click', () => {
    sfx('tap');
    const m = html(`<div class="modal-back" style="z-index:44"><div class="gdoc" role="dialog" aria-label="對話紀錄"><div class="label">對話紀錄</div><h2>已讀內容</h2><div class="redline"></div>
<div class="n1-log">${S0.log.length ? S0.log.map(([w, t]) => `<p><b>${esc(w)}</b>${t}</p>`).join('') : '<p>還沒有對話。</p>'}</div><button type="button" class="x" aria-label="關閉">${ICON.close}</button></div></div>`);
    m.addEventListener('click', e => { if (e.target.closest('.x') || e.target === m) { sfx('tap'); m.remove(); } });
    el.appendChild(m); const lg = $(m, '.n1-log'); lg.scrollTop = lg.scrollHeight;
  });

  // ---------- 文件 ----------
  function readDoc(id) {
    if (!S0.read.includes(id)) { S0.read.push(id); persist(); }
    sfx('page');
    return new Promise(res => {
      const doc = DOCS[id];
      const m = html(`<div class="g1-docback n1-docback" role="dialog" aria-label="${doc.title}"><div class="n1-paper n2-paper" style="left:332px;top:88px;width:480px;height:576px"><img src="${IMG(doc.asset + '.webp')}" alt="" onerror="this.remove()"><div class="n1-ink">${doc.html.replace(/\{name\}/g, esc(pname))}</div></div><div class="g1-dochint">點旁邊收起</div></div>`);
      m.addEventListener('click', e => { if (e.target.closest('.n1-paper')) return; sfx('tap'); m.remove(); res(); });
      el.appendChild(m);
    });
  }
  $(el, '#fileBtn').addEventListener('click', () => {
    sfx('tap');
    if (!S0.read.length) { toast('還沒有看過任何文件。'); return; }
    const m = html(`<div class="modal-back" style="z-index:44"><div class="gdoc" role="dialog" aria-label="檔案"><div class="label">調查檔案</div><h2>已讀文件</h2><div class="redline"></div>
<div class="gfiles">${S0.read.filter(i => i !== 'last').map(i => `<button type="button" class="gfile" data-doc="${i}"><span>${DOCS[i].title}</span></button>`).join('')}</div><button type="button" class="x" aria-label="關閉">${ICON.close}</button></div></div>`);
    m.addEventListener('click', e => {
      const b = e.target.closest('[data-doc]');
      if (b) { sfx('tap'); m.remove(); readDoc(b.dataset.doc); return; }
      if (e.target.closest('.x') || e.target === m) { sfx('tap'); m.remove(); }
    });
    el.appendChild(m);
  });

  // ---------- 目標與提示（每次 1 顆鑽石） ----------
  const STEPS = [
    { k: 'P1', done: () => F.P1, goal: '打開自己的置物櫃', hl: ['desk', 'locker'], hints: ['先看看自己的座位。', '便條說密碼是「論文的第一個年份」。論文草稿就在桌上。', '論文題目是 1908—1978 年，置物櫃密碼 1908。'] },
    { k: 'GO', done: () => F.AT_HOME, goal: '回住處', hl: ['door'], hints: ['拿到鑰匙了，從門口離開。', '點研究室的門。', '點研究室的門。'] },
    { k: 'P2', done: () => F.P2, goal: '打開家門', hl: ['plate', 'keypad', 'mail'], hints: ['筆記本第一頁寫著家門密碼的規則。', '門牌是 37；出入證上有第一次登記的日期。', '37＋0918＝370918。'] },
    { k: 'P3', done: () => F.P3, goal: '整理文件', hl: ['wall', 'shelf', 'pile'], hints: ['牆上的規則只寫了一半，另一半在筆記本裡。', '所有年份先換成西元。書架上有換算對照表；佛曆是減 543。', 'A 1908→1900 年代、B 昭和12＝1937→1930 年代、C 民國44＝1955→1950 年代、D 佛曆2521＝1978→1970 年代。'] },
    { k: 'P4', done: () => F.P4, goal: '讀懂文件', hl: ['board'], hints: ['先看軟木板上的信和你自己的筆記。', '四份文件的機構名字都不一樣，但做的事和東西的去向一樣。', '第一題選「以研究為名帶走、送往 90-S、從未公開」；第二題選「一群不斷改名、以研究為名收走樣本與器物的人」。'] },
    { k: 'END', done: () => false, goal: '看筆記本最後一頁', hl: ['desk2'], hints: ['書桌上的筆記本。', '點書桌。', '點書桌。'] },
  ];
  const cur = () => STEPS.find(s => !s.done()) || STEPS[STEPS.length - 1];
  const paintGoal = () => { $(el, '#goal').textContent = '目標　' + (F.START ? cur().goal : '—'); };
  function flash(ids, ms = 5000) { ids.forEach(id => el.querySelectorAll(`[data-hs="${id}"]`).forEach(b => { b.classList.add('show'); setTimeout(() => b.classList.remove('show'), ms); })); }
  $(el, '#hintBtn').addEventListener('click', async () => {
    sfx('tap');
    if (!F.START) { toast('這裡不需要提示，往下看劇情吧。'); return; }
    const stp = cur(); const lv = Math.min((S0.hints[stp.k] || 0) + 1, 3);
    if (lv > (S0.hints[stp.k] || 0)) {
      const dd = get();
      const ok = await modal({ title: '使用提示', body: `消耗 ${HINT_COST} 顆鑽石，取得第 ${lv} 段提示。`, bodyHtml: `<div class="col" style="align-items:center;gap:4px"><div class="row" style="height:48px;gap:12px;font-size:18px"><span style="color:var(--text-2)">消耗</span><img src="${IMG('diamond.webp')}" alt="鑽石" style="width:40px;height:40px"><b style="font-size:24px">×${HINT_COST}</b></div><div style="font-size:14px;line-height:24px;color:var(--muted)">第 ${lv}／3 段提示　目前持有 ${dd.diamonds} 顆鑽石</div></div>`, buttons: [{ label: '取消', kind: 'btn-line', value: false }, { label: '使用提示', kind: 'btn', value: true }] });
      if (!ok || !alive) return;
      if (dd.diamonds < HINT_COST) { await modal({ title: '鑽石不足', body: '鑽石不足，可以完成每日任務或前往儲值取得。', buttons: [{ label: '知道了', kind: 'btn', value: true }] }); return; }
      dd.diamonds -= HINT_COST; save();
      S0.hints[stp.k] = lv; persist();
    }
    sfx('hint'); if (lv >= 2) flash(stp.hl);
    sys([`提示 ${lv}／3：${stp.hints[lv - 1]}`], 4600);
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
    const ok = await modal({ title: '離開關卡', body: '目前的進度會保存，下次可以從這裡繼續。', buttons: [{ label: '繼續調查', kind: 'btn-line', value: false }, { label: '離開', kind: 'btn', value: true }] });
    if (ok && alive) { persist(); go('stages', { tab: 0 }); }
  });

  // ---------- 失誤：整理與解讀文件錯一次＋1，滿 3 次 → 達克收走文件 → 失敗、整節從頭 ----------
  const paintFail = () => { const n = $(el, '#alert'); n.classList.toggle('hidden', !F.AT_ROOM); n.querySelectorAll('i').forEach((x, i) => x.classList.toggle('on', i < S0.fail)); };
  const FAIL_LINE = ['那份放錯了。', '（看了他一眼）你確定你看得懂？'];
  async function miss() {
    sfx('error'); S0.fail++; persist(); paintFail();
    if (S0.fail >= MAX_FAIL) { await failed(); return; }
    await say(FAIL_LINE[S0.fail - 1], 'dark'); S();
  }
  async function failed() {
    closeCu();
    await lines([
      ['dark', '（把文件一疊疊收起來）夠了。'],
      ['me', '等一下，我快——'],
      ['dark', '你連自己的東西都看不懂。今晚就到這裡。'],
    ]);
    if (ended) return;
    ended = true; alive = false; sfx('door');
    meta.st = null; save();
    const b = html(`<div class="n1-fail"><div class="col" style="align-items:center;gap:16px;z-index:2">
<div class="label">EV_N02_FAIL</div><h2>達克失去了耐心</h2><p>文件被收走了。這一晚，什麼都沒查到。</p>
<div class="row" style="gap:16px;height:56px"><button type="button" class="btn-line" data-a="out" style="width:208px">返回關卡選擇</button><button type="button" class="btn" data-a="retry" style="width:208px">重新挑戰</button></div></div></div>`);
    b.addEventListener('click', e => { const a = e.target.closest('[data-a]'); if (!a) return; sfx('tap'); if (a.dataset.a === 'retry') go('n02', { retry: true }); else go('stages', { tab: 0 }); });
    el.appendChild(b);
  }

  // ================= 場景 =================
  // 序　舊館外（純劇情）
  async function sceneS() {
    setScene('N02-BG-001', '舊館外・深夜', []);
    $(el, '#black').classList.remove('on'); await wait(500); S();
    sfx('bike');
    await lines([
      ['dark', '……出來了。'],
      ['me', '（左右看了看）你在跟我說話？'],
      ['dark', '這裡沒有別人。'],
      ['me', '抱歉，你是……？'],
      ['dark', '（看了你一眼）達克・利姆。教授的學生。'],
      ['me', '教授的學生？那我們……'],
      ['dark', '同一個研究室。僅此而已。'],
      ['me', '……我不記得你。'],
      ['dark', '無所謂。教授要我來接你。上車。'],
      ['me', '教授叫你來的？'],
      ['dark', '不然呢。'],
      ['me', '竟然有人在等我。……可是這個人，看起來一點也不想來。', { think: true }],
    ]);
    await sys(['前往：學校・教授研究室'], 1600); S();
    return 'A';
  }

  // A　教授研究室
  const A_HS = [
    { id: 'desk', x: 120, y: 380, w: 280, h: 160, label: '我的座位' },
    { id: 'locker', x: 860, y: 200, w: 160, h: 360, label: '學生置物櫃' },
    { id: 'prof', x: 520, y: 180, w: 180, h: 340, label: '教授' },
    { id: 'dark', x: 720, y: 200, w: 120, h: 340, label: '達克' },
    { id: 'door', x: 40, y: 140, w: 70, h: 360, label: '研究室的門' },
  ];
  async function sceneA() {
    setScene('N02-BG-002', '學校・教授研究室', A_HS);
    if (!meta.seenIntro) {
      await lines([
        ['prof', '你出來了。很好。'],
        ['me', '教授……你在電話裡說，出來以後再說。'],
        ['prof', '嗯。先坐。（看向達克）達克，謝謝你跑這一趟。'],
        ['dark', '教授。'],
        ['prof', '（轉向你）你還記得他嗎？'],
        ['me', '……不記得。'],
        ['dark', '從見面開始就這樣。'],
        ['prof', '他沒有在演。（停頓）{主角}，你還記得多少？'],
        ['me', '今晚以前的事……很模糊。舊館裡，還少了七分鐘。'],
        ['dark', '……'],
        ['prof', '達克，我想拜託你一件事。帶他回住處。熟悉的地方，也許能讓他想起一些東西。'],
        ['dark', '……為什麼是我？'],
        ['prof', '你們在同一個研究室待過，他的住處你也去過。現在只有你能幫這個忙。'],
        ['dark', '……我知道了。'],
        ['prof', '麻煩你了。（轉向你）還有，你之前收集的那些歷史文件，回去整理一下。你失憶前……已經快摸到某些東西了。'],
        ['me', '什麼東西？'],
        ['prof', '等你自己找到，我再告訴你我知道的部分。'],
        ['me', '住處的鑰匙……應該在我的置物櫃裡。'],
      ]);
      meta.seenIntro = true; save();
    }
    flag('START'); paintGoal();
    return loop(async id => {
      if (id === 'back') { closeCu(); return; }
      if (id === 'desk') { await deskCu(); return; }
      if (id === 'locker') { if (F.P1) return void sys(['置物櫃已經打開了'], 1200); await p1(); paintGoal(); return; }
      if (id === 'prof') { await say('文件整理好了，再來告訴我。', 'prof'); S(); return; }
      if (id === 'dark') { await say(F.P1 ? '走了。' : '……', 'dark'); S(); return; }
      if (id === 'door') { if (!F.P1) { await say('先拿到鑰匙再走。', 'dark'); S(); return; } await sys(['前往：住處'], 1400); S(); return 'B'; }
    });
  }
  async function deskCu() {
    openCu(`<div class="n2-cut">N02-BG_DETAIL-005　我的書桌</div><img class="bg" src="${IMG('N02-BG_DETAIL-005.webp')}" alt="書桌近景" onerror="this.remove()">`, [
      { id: 'thesis', x: 200, y: 200, w: 300, h: 380, label: '論文草稿' },
      { id: 'sticky', x: 560, y: 240, w: 200, h: 200, label: '便條' },
      { id: 'cal', x: 820, y: 220, w: 280, h: 300, label: '桌曆' },
    ], true);
    return loop(async id => {
      if (id === 'back') { closeCu(); return true; }
      if (DOCS[id]) { await readDoc(id); S(); }
    });
  }
  // 謎題 1：四位數轉盤鎖，答案 1908
  async function p1() {
    const v = F.P1_V || [0, 0, 0, 0];
    const paint = msg => openCu(`<div class="n2-cut">N02-BG_DETAIL-006　置物櫃轉盤鎖</div><img class="bg" src="${IMG('N02-BG_DETAIL-006.webp')}" alt="轉盤鎖" onerror="this.remove()">
<div class="n2-dial">${v.map(n => `<span>${n}</span>`).join('')}</div><div class="n1-state" style="left:640px;top:520px">${msg || '上下轉動，對齊四個數字'}</div>`,
    [...[0, 1, 2, 3].flatMap(i => [{ id: 'u' + i, x: 448 + i * 104, y: 216, w: 96, h: 64, label: `第 ${i + 1} 格往上` }, { id: 'd' + i, x: 448 + i * 104, y: 424, w: 96, h: 64, label: `第 ${i + 1} 格往下` }]),
      { id: 'pull', x: 560, y: 584, w: 160, h: 56, label: '拉開置物櫃' }]);
    paint();
    return loop(async id => {
      if (id === 'back') { closeCu(); return true; }
      if (id[0] === 'u' || id[0] === 'd') { const i = +id[1]; v[i] = (v[i] + (id[0] === 'u' ? 1 : 9)) % 10; F.P1_V = [...v]; persist(); sfx('dial'); paint(); return; }
      if (id !== 'pull') return;
      if (v.join('') !== '1908') { sfx('error'); paint('鎖沒有開'); return; }
      sfx('latch'); flag('P1'); closeCu();
      addItem('key'); addItem('note'); addItem('pass');
      await sys(['取得：住處鑰匙、筆記本、研究室出入證'], 2000); S();
      await lines([
        ['me', '這是我的筆記？'],
        ['dark', '上面寫著你的名字。'],
      ]);
      paintGoal(); return true;
    });
  }

  // B　公寓門口
  const B_HS = [
    { id: 'plate', x: 620, y: 150, w: 100, h: 60, label: '門牌' },
    { id: 'keypad', x: 760, y: 260, w: 90, h: 130, label: '密碼鎖' },
    { id: 'mail', x: 160, y: 300, w: 180, h: 140, label: '信箱' },
    { id: 'shoe', x: 360, y: 420, w: 200, h: 160, label: '鞋櫃' },
    { id: 'dark', x: 940, y: 180, w: 120, h: 360, label: '達克' },
  ];
  async function sceneB() {
    setScene('N02-BG-003', '公寓三樓・門口', B_HS);
    if (!F.B_IN) {
      flag('B_IN'); sfx('latch');
      await lines([
        ['dark', '到了。'],
        ['me', '你怎麼知道我住這裡？'],
        ['dark', '教授給了地址。'],
        ['me', '鑰匙能開外面的鐵門，可是裡面這道……是密碼鎖。', { think: true }],
        ['dark', '（看了一眼手錶，沒有說話）'],
      ]);
      flag('AT_HOME'); paintGoal();
    }
    return loop(async id => {
      if (id === 'back') { closeCu(); return; }
      if (id === 'plate') return void sys(['門牌：37'], 1600);
      if (id === 'mail') { await readDoc('bill'); return; }
      if (id === 'shoe') return void sys(['一雙鞋、一把傘。'], 1400);
      if (id === 'dark') { await say('大部分人會把密碼留在自己天天看得到的地方。', 'dark'); S(); return; }
      if (id === 'keypad') { if (await p2()) return 'C'; }
    });
  }
  // 謎題 2：六位數按鍵，答案 370918
  async function p2() {
    let v = '';
    const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'];
    const paint = msg => openCu(`<div class="n2-cut">N02-BG_DETAIL-007　密碼鎖</div><img class="bg" src="${IMG('N02-BG_DETAIL-007.webp')}" alt="密碼鎖" onerror="this.remove()">
<div class="n2-lcd">${(v + '------').slice(0, 6).split('').map(c => `<span>${c === '-' ? '' : '•'}</span>`).join('')}</div>
<div class="n2-keys">${KEYS.map(k => `<span>${k === 'OK' ? '確認' : k === 'C' ? '清除' : k}</span>`).join('')}</div><div class="n1-state" style="left:640px;top:648px">${msg || ''}</div>`,
    KEYS.map((k, i) => ({ id: 'k' + k, x: 520 + (i % 3) * 88, y: 248 + Math.floor(i / 3) * 88, w: 80, h: 80, label: k === 'OK' ? '確認' : k === 'C' ? '清除' : k })));
    paint();
    const r = await loop(async id => {
      if (id === 'back') { closeCu(); return 'no'; }
      const k = id.slice(1);
      if (k === 'C') { v = ''; sfx('beep'); paint(); return; }
      if (k === 'OK') {
        if (v === '370918') return 'ok';
        sfx('beepErr'); v = ''; paint('密碼錯誤'); return;
      }
      if (v.length < 6) { v += k; sfx('beep'); paint(); }
    });
    if (r !== 'ok') return false;
    sfx('latch'); flag('P2'); closeCu();
    await sys(['門開了'], 1200); S();
    return true;
  }

  // C　主角房間
  const C_HS = [
    { id: 'wall', x: 180, y: 120, w: 200, h: 160, label: '牆上的紙條' },
    { id: 'pile', x: 400, y: 460, w: 360, h: 160, label: '地上的文件堆' },
    { id: 'board', x: 820, y: 120, w: 300, h: 240, label: '軟木板' },
    { id: 'desk2', x: 820, y: 400, w: 300, h: 180, label: '書桌' },
    { id: 'shelf', x: 40, y: 300, w: 140, h: 320, label: '書架' },
    { id: 'dark', x: 600, y: 160, w: 110, h: 300, label: '達克' },
  ];
  async function sceneC() {
    setScene('N02-BG-004', '我的房間', C_HS);
    flag('AT_ROOM'); paintFail();
    if (!F.C_IN) {
      flag('C_IN');
      await lines([
        ['dark', '（掃了一眼）你的東西，你自己整理。我在這裡等。'],
        ['me', '這些……都是我收集的？'],
        ['dark', '房間是你的，不然是誰的。'],
        ['me', '我在找什麼？'],
        ['dark', '我不知道，也沒興趣。不過你半夜一個人去那間舊館，應該不是去散步。'],
      ]);
      await sys([`整理或解讀文件錯 ${MAX_FAIL} 次，達克會收走文件離開`], 2400); S();
    }
    paintGoal();
    return loop(async id => {
      if (id === 'back') { closeCu(); return; }
      if (id === 'wall') { await readDoc('rule'); return; }
      if (id === 'shelf') { await readDoc('conv'); return; }
      if (id === 'dark') { await say(F.P3 ? '……' : '文件不會自己分類。', 'dark'); S(); return; }
      if (id === 'pile') { if (F.P3) return void sys(['文件都歸檔好了'], 1200); await p3(); paintGoal(); return; }
      if (id === 'board') { if (!F.P3) { await say('先把地上的東西整理好。', 'dark'); S(); return; } if (F.P4) return void sys(['軟木板上的線索都串起來了'], 1200); await p4(); paintGoal(); return; }
      if (id === 'desk2') { if (!F.P4) { await readDoc('note1'); return; } return 'END'; }
    });
  }
  // 謎題 3：四份文件放進四個年代資料夾（點文件 → 點資料夾）
  async function p3() {
    let sel = null;
    const left = () => Object.keys(SORT).filter(k => !S0.placed[k]);
    const paint = msg => openCu(`<div class="n2-cut">N02-BG_DETAIL-009　整理桌</div><img class="bg" src="${IMG('N02-BG_DETAIL-009.webp')}" alt="整理桌" onerror="this.remove()">
<div class="n2-docs">${Object.keys(SORT).map(k => `<span class="${S0.placed[k] ? 'used' : ''}${sel === k ? ' sel' : ''}">${S0.placed[k] ? '' : DOCS[k].title.replace('📄 ', '')}</span>`).join('')}</div>
<div class="n2-folders">${FOLDERS.map(f => `<span><b>${f} 年代</b><small>${Object.keys(S0.placed).filter(k => S0.placed[k] === f).map(k => k).join('、') || '—'}</small></span>`).join('')}</div>
<div class="n1-state" style="left:640px;top:648px">${msg || (sel ? `已拿起「${DOCS[sel].title.replace('📄 ', '')}」：點一個資料夾放進去，或點「讀」看內容` : '點一份文件拿起來')}</div>
${sel ? `<div class="n2-readbtn">讀這份文件</div>` : ''}`,
    [...Object.keys(SORT).filter(k => !S0.placed[k]).map(k => ({ id: 'd' + k, x: 168 + 'ABCD'.indexOf(k) * 240, y: 152, w: 224, h: 120, label: '文件 ' + k })),
      ...FOLDERS.map((f, i) => ({ id: 'f' + f, x: 168 + i * 240, y: 376, w: 224, h: 200, label: f + ' 年代資料夾' })),
      ...(sel ? [{ id: 'read', x: 1000, y: 584, w: 200, h: 48, label: '讀這份文件' }] : [])]);
    paint();
    return loop(async id => {
      if (id === 'back') { closeCu(); return true; }
      if (id === 'read' && sel) { await readDoc(sel); S(); paint(); return; }
      if (id[0] === 'd') { sel = id[1]; sfx('page'); paint(); return; }
      if (id[0] === 'f') {
        if (!sel) { paint('先拿起一份文件'); return; }
        const f = id.slice(1);
        if (SORT[sel] !== f) { const s = sel; sel = null; paint(); await miss(); S(); if (!ended) paint(`「${DOCS[s].title.replace('📄 ', '')}」不屬於 ${f} 年代`); return; }
        S0.placed[sel] = f; persist(); sfx('file'); sel = null;
        if (left().length) { paint(); return; }
        flag('P3'); paint('四份文件都歸檔好了'); await wait(900); S(); closeCu();
        await say('年代分開以後……這四份文件，好像在說同一件事。', 'me'); S();
        return true;
      }
    });
  }
  // 謎題 4：軟木板。可讀 E、F 與 A～D；兩題四選一
  async function p4() {
    const Q = [
      { q: '這些文件的共同點是？', o: ['都發生在亞洲', '都以研究為名帶走樣本或器物，送往代號「90-S」的地方，從未公開', '都是政府主導的計畫', '都和戰爭有關'], a: 1 },
      { q: '我之前在查什麼？', o: ['二十世紀的科學造假事件', '一群在世界各地不斷改名、以研究為名收走樣本與器物的人', '各國的考古走私網', '冷戰時期的核子試驗'], a: 1 },
    ];
    let qi = F.P4_Q || 0;
    const paint = () => openCu(`<div class="n2-cut">N02-BG_DETAIL-010　軟木板</div><img class="bg" src="${IMG('N02-BG_DETAIL-010.webp')}" alt="軟木板" onerror="this.remove()">
<div class="n2-pins">${['A', 'B', 'C', 'D', 'E', 'F'].map(k => `<span>${DOCS[k].title.replace('📄 ', '')}</span>`).join('')}</div>
<div class="n2-quiz"><p class="q">${qi + 1}／2　${Q[qi].q}</p>${Q[qi].o.map((t, i) => `<p class="o">${i + 1}．${t}</p>`).join('')}</div>`,
    [...['A', 'B', 'C', 'D', 'E', 'F'].map((k, i) => ({ id: 'r' + k, x: 168 + (i % 3) * 320, y: 112 + Math.floor(i / 3) * 80, w: 304, h: 64, label: '讀 ' + DOCS[k].title })),
      ...Q[qi].o.map((t, i) => ({ id: 'a' + i, x: 168, y: 368 + i * 64, w: 944, h: 56, label: t }))]);
    paint();
    return loop(async id => {
      if (id === 'back') { closeCu(); return true; }
      if (id[0] === 'r') { await readDoc(id[1]); S(); paint(); return; }
      if (id[0] !== 'a') return;
      if (+id[1] !== Q[qi].a) { closeCu(); await miss(); S(); if (!ended) paint(); return; }
      sfx('pin'); qi++; flag('P4_Q', qi);
      if (qi < Q.length) { paint(); return; }
      flag('P4'); closeCu();
      await lines([
        ['me', '西伯利亞、京都、香港、泰國……幾十年、好幾個國家，都有同一群人經手。'],
        ['dark', '同一群人？'],
        ['me', '名字每次都不一樣。可是做事的方法一模一樣。'],
        ['dark', '（看著文件，安靜了很久）'],
      ]);
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
      ['dark', '（拿起外套）我走了。'],
      ['me', '達克。'],
      ['dark', '還有事？'],
      ['me', '謝謝。'],
      ['dark', '（沒有回頭）教授交代的事，我做完了而已。'],
    ]);
    sfx('door');
    await say('以前的我，到底是個什麼樣的人？', 'me', { think: true }); S();
    ended = true;
    const dd = get();
    if (!dd.records.includes('n02')) dd.records.push('n02');
    meta.st = null; meta.cleared = true; save();
    $(el, '#black').classList.add('on'); await wait(600); S();
    const card = html(`<div class="n1-fail"><div class="col" style="align-items:center;gap:16px;z-index:2"><div class="label">第一章・第二節</div><h2>完</h2><div class="row" style="height:56px"><button type="button" class="btn" data-a="out" style="width:208px">返回關卡選擇</button></div></div></div>`);
    el.appendChild(card);
    await new Promise(r => $(card, '[data-a]').addEventListener('click', () => { sfx('tap'); r(); })); S();
    go('stages', { tab: 0 });
  }

  async function flow() {
    paintSlots(); paintGoal(); bgm(null); // 第二節背景音樂由製作人提供後再接上
    let where = S0.scene || 'S';
    if (params && params.retry && meta.seenIntro) where = 'A'; // 重新挑戰：略過舊館外的劇情
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
  return () => { alive = false; listeners = []; if (!ended && F.START) { meta.st = S0; save(); } };
}
