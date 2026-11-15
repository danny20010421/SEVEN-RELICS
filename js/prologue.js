// 序章 N00「記憶的終點」：新手教學
import { get, save, taskDone } from './store.js';
import { sfx, bgm, vibrate, applyVolume } from './audio.js';
import { html, $, $$, IMG, ICON, wait, esc, modal } from './ui.js';

const ITEMS = {
  crowbar: { name: '鐵棒', img: 'it-crowbar.webp', desc: '一根生鏽的鐵棒，一端是彎鉤，一端是扁口。', hint: '也許能撬開什麼東西。' },
  compass: { name: '解析盤', img: 'it-compass.webp', desc: '能縮小密碼的範圍。', hint: '對密碼鎖使用，可以揭露其中一位數字。之後也能在商城購買。' },
};
const RIDDLE = [
  ['未曾存在，吞沒一切', 'Never existed, yet devours all.'],
  ['不曾移動，目觀四方', 'Never moved, yet sees all four directions.'],
  ['鏡中之影，與誰相同', 'A reflection in the mirror—who is its equal?'],
  ['另一消散，何以為證', 'If the other fades, what proof remains?'],
];
const ANSWER = '0421';
const HS_LABEL = { crowbar: '地上的鐵棒', door: '逃生門', lock: '電子鎖', exit: '跑馬燈', box: '電箱' };

// 1280×720 舞台上的座標
const S01 = { crowbar: [850, 676], door: [639, 430] };
const O = [640, 250], Z = 1.35;
const zp = ([x, y]) => [Math.round(O[0] + (x - O[0]) * Z), Math.round(O[1] + (y - O[1]) * Z)];
const S02 = { exit: zp([643, 119]), lock: zp([544, 425]), box: zp([413, 329]) };
const KEYS = [['1', 371, 283], ['2', 451, 283], ['3', 531, 283], ['4', 371, 348], ['5', 451, 348], ['6', 531, 348], ['7', 371, 413], ['8', 451, 413], ['9', 531, 413], ['C', 371, 480], ['0', 451, 480], ['E', 531, 480]];

export function render(st, params, go) {
  const d = get();
  const el = html(`<div class="scr">
<div class="layer" id="scene">
  <img class="bg" src="${IMG('n00-s01.webp')}" alt="緊急通道盡頭的金屬逃生門">
  <img id="crowbarFloor" src="${IMG('n00-crowbar-floor.webp')}" alt="" style="position:absolute;left:712px;top:651px;width:276px;height:50px">
</div>
<div class="fill" id="hsLayer" style="z-index:3"></div>
<div class="fill hidden" id="close" style="z-index:4;background:#0a0607"></div>
<div class="fill hidden" id="cine" style="z-index:20;background:#000"></div>
<div class="shade-top"></div>
<div class="shade-right"></div>
<div class="lvl-top" id="hud"><div class="lvl-goal"><span class="chip-red" style="height:32px">序章 · 記憶的終點</span><span>目標　打開逃生門</span></div></div>
<div class="lvl-right" id="hudR"><button type="button" class="iconbtn" id="setBtn" aria-label="設定" style="width:64px;height:64px;flex-direction:column;gap:4px;font-size:14px;line-height:20px">${ICON.gear.replace('<svg', '<svg width="24" height="24"')}<span>設定</span></button></div>
<div class="slots" id="slots" role="group" aria-label="臨時道具欄"></div>
<div class="black on" id="black"></div>
<div class="white" id="white"></div>
</div>`);
  st.appendChild(el);
  const scene = $(el, '#scene'), hsLayer = $(el, '#hsLayer'), close = $(el, '#close'), cine = $(el, '#cine');
  let alive = true;
  let inv = [];            // 道具欄
  let selected = null;     // 選取要使用的道具
  let listeners = [];

  // ---------- 事件：流程用 await act(條件) 等玩家動作 ----------
  const emit = a => { listeners.slice().forEach(l => l(a)); };
  const act = test => new Promise(res => {
    const l = a => { if (test(a)) { listeners = listeners.filter(x => x !== l); res(a); } };
    listeners.push(l);
  });

  // ---------- 道具欄 ----------
  function paintSlots(ping) {
    const s = $(el, '#slots');
    s.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const id = inv[i];
      if (!id) { s.appendChild(html('<span class="slot" role="img" aria-label="空的道具欄"></span>')); continue; }
      const it = ITEMS[id];
      const b = html(`<button type="button" class="slot has${selected === id ? ' sel' : ''}${ping === id ? ' ping' : ''}" aria-label="${it.name}"><img src="${IMG(it.img)}" alt=""></button>`);
      b.addEventListener('click', () => { sfx('tap'); openItem(id); });
      s.appendChild(b);
    }
    const ban = $(el, '.use-banner'); if (ban) ban.remove();
    if (selected) {
      el.appendChild(html(`<div class="use-banner"><div><img src="${IMG(ITEMS[selected].img)}" alt="" style="width:32px;height:32px">使用「${ITEMS[selected].name}」：請點選要使用的位置</div></div>`));
    }
  }
  const addItem = id => { inv.push(id); paintSlots(id); };
  const removeItem = id => { inv = inv.filter(x => x !== id); if (selected === id) selected = null; paintSlots(); };

  function openItem(id) {
    const it = ITEMS[id];
    const m = html(`<div class="modal-back" style="z-index:45"><div class="modal" role="dialog" aria-label="道具檢視" style="width:760px;flex-direction:row;align-items:stretch;gap:32px;padding:32px">
<div style="width:240px;height:240px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:#1a1213;border:1px solid #4a302c"><img src="${IMG(it.img)}" alt="" style="width:200px;height:200px;display:block"></div>
<div class="col" style="flex-grow:1;min-width:0;justify-content:space-between;gap:16px">
  <div class="col" style="gap:12px">
    <h2 style="text-align:left;margin:0 56px 0 0">${it.name}</h2>
    <p style="text-align:left;margin:0">${it.desc}</p>
    <div style="height:1px;background:#4a302c"></div>
    <p style="text-align:left;margin:0;color:var(--gold-2)">${it.hint}</p>
  </div>
  <div class="row" style="height:56px;justify-content:flex-end;gap:16px"><button type="button" class="btn-line" data-a="back" style="width:160px">放回道具欄</button><button type="button" class="btn" data-a="use" style="width:160px">使用</button></div>
</div>
<button type="button" class="x" aria-label="關閉">${ICON.close}</button>
</div></div>`);
    m.addEventListener('click', e => {
      const a = e.target.closest('[data-a]');
      if (!a && !e.target.closest('.x')) return;
      sfx('tap');
      const use = a && a.dataset.a === 'use';
      selected = use ? id : (selected === id ? null : selected);
      m.remove(); paintSlots();
      emit({ type: 'itemClosed', id, use });
    });
    el.appendChild(m);
    emit({ type: 'itemOpened', id });
  }

  // ---------- 可點區塊 ----------
  function setHs(list) {
    hsLayer.innerHTML = '';
    list.forEach(([id, [x, y], show, big]) => {
      const b = html(`<button type="button" class="hs${show ? ' show' : ''}${big ? ' big' : ''}" style="left:${x}px;top:${y}px" data-hs="${id}" aria-label="${HS_LABEL[id] || id}"></button>`);
      b.addEventListener('click', () => { sfx('tap'); const item = selected; emit({ type: 'hs', id, item }); });
      hsLayer.appendChild(b);
    });
  }

  // ---------- 對白、提示、系統訊息 ----------
  const name = (d.player && d.player.name) || '玩家';
  // 主角立繪：只在不會擋住解謎畫面時出現（特寫、過場時不顯示）
  const g = (d.player && d.player.gender) || 'm';
  function say(cn, en, portrait = true) {
    return new Promise(res => {
      const showP = portrait && close.classList.contains('hidden') && cine.classList.contains('hidden');
      const pic = showP ? html(`<img class="portrait${portrait === 'pain' ? ' pain' : ''}" src="${IMG(`hero-${g}${portrait === 'pain' ? '-pain' : ''}.webp`)}" alt="">`) : null;
      if (pic) el.appendChild(pic);
      const b = html(`<div class="sub" role="button" tabindex="0" aria-label="點一下繼續"><div class="who"><span>${esc(name)}</span>${ICON.voice}</div><p class="cn">${cn}</p><p class="en">${en}</p>${ICON.down}</div>`);
      const done = () => { sfx('tap'); b.remove(); if (pic) pic.remove(); res(); };
      b.addEventListener('click', done);
      b.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') done(); });
      el.appendChild(b); b.focus({ preventScroll: true });
    });
  }
  let tipEl = null;
  function tip(text, step, pos = { left: 560, top: 320 }, withBtn = false) {
    if (tipEl) tipEl.remove();
    tipEl = html(`<div class="tip" style="left:${pos.left}px;top:${pos.top}px"><div class="label">新手教學</div><p>${text}</p><div class="foot"><span>${step} / 11</span>${withBtn ? '<button type="button" class="btn sm" style="width:120px">下一步</button>' : ''}</div></div>`);
    el.appendChild(tipEl);
    if (withBtn) return new Promise(res => tipEl.querySelector('.btn').addEventListener('click', () => { sfx('tap'); tipEl.remove(); tipEl = null; res(); }));
    return Promise.resolve();
  }
  const untip = () => { if (tipEl) { tipEl.remove(); tipEl = null; } };
  // side = true：顯示在右半邊，避免蓋住密碼鎖的螢幕
  async function sys(lines, ms = 2400, top = 240, side = false) {
    const pos = side ? 'left:640px;width:504px' : '';
    const b = html(`<div class="sysmsg" style="top:${top}px;${pos}"><div role="status" style="${side ? 'min-width:0;width:472px;padding:24px' : ''}">${lines.map(l => `<p>${l}</p>`).join('')}</div></div>`);
    el.appendChild(b); await wait(ms); b.remove();
  }

  // ---------- 特寫畫面 ----------
  let backCb = null;
  function openClose(inner, withBack = false) {
    close.innerHTML = inner;
    close.classList.remove('hidden');
    close.classList.add('scr', 'fade-in');
    hsLayer.innerHTML = '';
    if (withBack) {
      const b = html(`<button type="button" class="backbtn">${ICON.back.replace('<svg', '<svg width="20" height="20"')}<span>返回場景</span></button>`);
      b.addEventListener('click', () => { sfx('tap'); emit({ type: 'back' }); });
      close.appendChild(b);
    }
  }
  const shut = () => { close.classList.add('hidden'); close.innerHTML = ''; };

  // 密碼鎖
  let kp = null;
  function openKeypad() {
    openClose(`<img class="bg" src="${IMG('n00-keypad.webp')}" alt="門把旁的電子密碼鎖"><div class="kp-screen" id="kps"><span class="code" id="kpc">_ _ _ _</span><span class="msg" id="kpm">請輸入密碼</span></div><div id="keys"></div>`);
    const keys = $(close, '#keys');
    KEYS.forEach(([k, x, y]) => {
      const b = html(`<button type="button" class="key" data-k="${k}" style="left:${x}px;top:${y}px" aria-label="${k === 'C' ? '清除' : k === 'E' ? '確認' : k}"></button>`);
      b.addEventListener('click', () => { emit({ type: 'key', k, item: selected }); });
      keys.appendChild(b);
    });
    // 整個鍵盤也是「使用道具」的目標
    kp = { reveal: null, input: '' };
    paintKp();
  }
  function paintKp(state = '', msg = '') {
    const s = $(close, '#kps'); if (!s) return;
    const slots = [0, 1, 2, 3].map(i => kp.input[i] || (kp.reveal && kp.reveal.i === i && !kp.input[i] ? kp.reveal.d : '_'));
    $(close, '#kpc').textContent = slots.join(' ');
    $(close, '#kpm').textContent = msg || (kp.reveal ? '輸入密碼' : '請輸入密碼');
    s.classList.remove('err', 'ok', 'shake');
    if (state) { void s.offsetWidth; s.classList.add(state); if (state === 'err') s.classList.add('shake'); }
  }

  // ---------- 設定 ----------
  $(el, '#setBtn').addEventListener('click', async () => {
    sfx('tap');
    const s = d.settings;
    const box = html(`<div class="modal-back" style="z-index:46"><div class="modal" role="dialog" aria-label="設定"><h2>設定</h2>
<div class="col" style="align-self:stretch;gap:8px">
<div class="set-row"><label for="v1">背景音樂</label><input id="v1" type="range" min="0" max="100" value="${Math.round(s.bgm * 100)}"></div>
<div class="set-row"><label for="v2">音效</label><input id="v2" type="range" min="0" max="100" value="${Math.round(s.sfx * 100)}"></div>
</div>
<div class="actions"><button type="button" class="btn" style="width:208px" data-ok>完成</button></div>
<button type="button" class="x" aria-label="關閉">${ICON.close}</button></div></div>`);
    const upd = () => { s.bgm = $(box, '#v1').value / 100; s.sfx = $(box, '#v2').value / 100; applyVolume(); save(); };
    $(box, '#v1').addEventListener('input', upd); $(box, '#v2').addEventListener('input', upd);
    box.addEventListener('click', e => { if (e.target.closest('[data-ok]') || e.target.closest('.x')) { sfx('tap'); box.remove(); } });
    el.appendChild(box);
  });

  // ---------- 流程 ----------
  const S = () => { if (!alive) throw new Error('left'); };
  async function flow() {
    bgm('n00');
    paintSlots();
    await wait(300); $(el, '#black').classList.remove('on'); await wait(900); S();
    await say('這裡是……哪裡？', 'Where… am I?', 'pain'); S();
    await say('頭好痛……什麼都想不起來。', 'My head… I can’t remember anything.', 'pain'); S();

    // 1 撿起鐵棒
    setHs([['crowbar', S01.crowbar, true]]);
    tip('點一下發光的位置，可以調查或撿起東西。', 1, { left: 560, top: 400 });
    await act(a => a.type === 'hs' && a.id === 'crowbar'); S();
    untip(); $(el, '#crowbarFloor').remove(); setHs([]); sfx('pick'); addItem('crowbar');
    await say('一根鐵棒。也許用得上。', 'A crowbar. Might come in handy.'); S();

    // 2 檢視道具
    tip('撿到的道具會放進右側的道具欄。點一下道具，可以放大檢視。', 2, { left: 600, top: 120 });
    await act(a => a.type === 'itemOpened'); untip();
    await act(a => a.type === 'itemClosed'); S();
    selected = null; paintSlots();
    await say('那裡有一扇門。是出口嗎？', 'There’s a door over there. Is it a way out?'); S();

    // 3 前往門前
    setHs([['door', S01.door, true, true]]);
    tip('點一下逃生門，前往門前。', 3, { left: 120, top: 360 });
    await act(a => a.type === 'hs' && a.id === 'door'); S();
    untip(); setHs([]); sfx('whoosh'); scene.classList.add('zoomed'); await wait(800); S();
    await say('門上有一道電子鎖。', 'There’s an electronic lock on the door.'); S();
    await say('看來沒那麼容易出去。', 'Looks like getting out won’t be that easy.'); S();

    // 4 拉近電子鎖
    setHs([['lock', S02.lock, true]]);
    tip('點一下門把旁的電子鎖，可以拉近查看。', 4, { left: 600, top: 400 });
    await act(a => a.type === 'hs' && a.id === 'lock'); S();
    untip(); openKeypad();

    // 5 用鐵棒撬鎖（失敗）
    // full = 點畫面任何地方都算；否則點整個密碼鎖範圍
    const kpTarget = full => {
      const b = html(full
        ? '<button type="button" class="area" style="left:0;top:0;width:1144px;height:720px" data-hs="keypad" aria-label="點一下畫面"></button>'
        : '<button type="button" class="area show" style="left:232px;top:56px;width:424px;height:600px" data-hs="keypad" aria-label="密碼鎖"></button>');
      b.addEventListener('click', () => { sfx('tap'); emit({ type: 'hs', id: 'keypad', item: selected }); });
      close.appendChild(b); return b;
    };
    let t = kpTarget(true);
    tip('先點道具欄的鐵棒，選擇「使用」，再點一下畫面任何地方。', 5, { left: 664, top: 320 });
    await act(a => a.type === 'hs' && a.id === 'keypad' && a.item === 'crowbar'); S();
    untip(); t.remove(); selected = null; paintSlots();
    sfx('clang'); vibrate(120);
    await sys(['鎖具異常堅固，無法以蠻力破壞。', '也許附近藏著開鎖的方法。'], 2800, 160, true); S();
    await say('撬不開……', 'It won’t budge…', false); S();
    shut();
    await say('這道鎖比看起來還要堅固。得找別的辦法。', 'This lock is tougher than it looks. I need another way.'); S();

    // 6 跑馬燈謎語
    setHs([['exit', S02.exit, true]]);
    tip('門上方的燈號似乎在閃。點一下看看。', 6, { left: 760, top: 140 });
    await act(a => a.type === 'hs' && a.id === 'exit'); S();
    untip(); await showRiddle(true); S();

    // 7 電腦示範答錯
    setHs([['lock', S02.lock, true], ['exit', S02.exit, false]]);
    tip('回到密碼鎖，試著輸入密碼。', 7, { left: 600, top: 400 });
    await act(a => a.type === 'hs' && a.id === 'lock'); S();
    untip(); openKeypad();
    const blocker = html('<div class="blocker" style="z-index:9"></div>'); el.appendChild(blocker);
    await tip('密碼鎖可以直接輸入數字。我們先隨便試一組看看。', 7, { left: 664, top: 320 }, true); S();
    for (const k of ['1', '2', '3', '4']) {
      const b = $(close, `[data-k="${k}"]`); b.classList.add('press'); sfx('key');
      kp.input += k; paintKp(); await wait(380); b.classList.remove('press'); S();
    }
    const eb = $(close, '[data-k="E"]'); eb.classList.add('press'); await wait(250); eb.classList.remove('press');
    sfx('error'); vibrate(80); paintKp('err', '密碼錯誤'); await wait(1200); S();
    blocker.remove();
    await say('不對。得先想通那段謎語。', 'Wrong. I need to solve that riddle first.', false); S();
    await tip('答錯不會怎樣。但在主線關卡中，答錯 3 次或時間用完，就必須從頭開始。', 8, { left: 664, top: 320 }, true); S();
    kp.input = ''; shut();
    await say('也許附近還藏著什麼線索……', 'Maybe there’s another clue around here…'); S();

    // 8 撬開電箱
    setHs([['box', S02.box, true], ['lock', S02.lock, false], ['exit', S02.exit, false]]);
    tip('門左側的牆上有個小電箱。先選取鐵棒，再點一下電箱，試著撬開它。', 9, { left: 560, top: 300 });
    while (true) {
      const a = await act(x => x.type === 'hs'); S();
      if (a.id === 'box' && a.item === 'crowbar') break;
      if (a.id === 'box') sys(['電箱的蓋子鏽死了，徒手打不開。'], 1800);
      else if (a.id === 'exit') { untip(); await showRiddle(false); S(); setHs([['box', S02.box, true], ['lock', S02.lock, false], ['exit', S02.exit, false]]); tip('門左側的牆上有個小電箱。先選取鐵棒，再點一下電箱，試著撬開它。', 9, { left: 560, top: 300 }); }
      else if (a.id === 'lock') sys(['先找找看附近有沒有開鎖的線索。'], 1800);
    }
    untip(); removeItem('crowbar');
    openClose(`<img class="bg" src="${IMG('n00-box.webp')}" id="boxImg" alt="牆上的小電箱">`);
    await wait(500); sfx('pry'); vibrate(150); await wait(700); S();
    $(close, '#boxImg').src = IMG('n00-box-open.webp');
    const comp = html(`<button type="button" class="hs show" style="left:670px;top:360px;width:200px;height:200px;margin:-100px 0 0 -100px;border-radius:50%" data-hs="compass" aria-label="解析盤"><img src="${IMG('it-compass.webp')}" alt="" style="position:absolute;inset:0;width:200px;height:200px;filter:brightness(0.75) saturate(0.9) drop-shadow(0 8px 12px rgba(0,0,0,0.8))"></button>`);
    comp.addEventListener('click', () => { sfx('tap'); emit({ type: 'hs', id: 'compass' }); });
    close.appendChild(comp);
    await say('裡面有東西。', 'There’s something inside.', false); S();
    tip('點一下解析盤，把它撿起來。', 9, { left: 760, top: 400 });
    await act(a => a.type === 'hs' && a.id === 'compass'); S();
    untip(); comp.remove(); sfx('pick'); addItem('compass');
    await sys(['取得「解析盤」。'], 1600); S();
    shut();

    // 9 使用解析盤
    setHs([['lock', S02.lock, true], ['exit', S02.exit, false]]);
    tip('解析盤能揭露密碼的其中一位。點道具欄的解析盤選擇「使用」，再點一下密碼鎖。之後也能在商城購買。', 10, { left: 600, top: 300 });
    let a1 = await act(a => a.type === 'hs' && (a.id === 'lock' || a.id === 'exit')); S();
    while (a1.id === 'exit') { untip(); await showRiddle(false); S(); setHs([['lock', S02.lock, true], ['exit', S02.exit, false]]); a1 = await act(a => a.type === 'hs' && (a.id === 'lock' || a.id === 'exit')); S(); }
    untip(); openKeypad();
    if (a1.item !== 'compass') {
      t = kpTarget(false);
      tip('點道具欄的解析盤，選擇「使用」，再點一下密碼鎖的任何位置。', 10, { left: 680, top: 320 });
      await act(a => a.type === 'hs' && a.id === 'keypad' && a.item === 'compass'); S();
      untip(); t.remove();
    }
    removeItem('compass'); sfx('hint');
    kp.reveal = { i: 2, d: '2' }; paintKp('', '解析完成');
    await sys(['解析完成：第 3 位數字是 2。'], 2400, 160, true); S();
    await say('第三位是 2……「鏡中之影」，原來是指兩個。', 'The third digit is 2… “a reflection in the mirror” — it means two.', false); S();

    // 10 解開密碼
    tip('解開謎語，輸入四位數密碼。順序必須完全正確。<br><span style="color:var(--muted)">按 C 清除，按 ↵ 確認。</span>', 11, { left: 664, top: 320 });
    const backBtn = html(`<button type="button" class="backbtn">${ICON.back.replace('<svg', '<svg width="20" height="20"')}<span>重看謎語</span></button>`);
    backBtn.addEventListener('click', () => { sfx('tap'); emit({ type: 'riddle' }); });
    close.appendChild(backBtn);
    kp.input = ''; paintKp();
    while (true) {
      const a = await act(x => x.type === 'key' || x.type === 'riddle'); S();
      if (a.type === 'riddle') {
        await showRiddle(false, true); S(); continue;
      }
      if (a.k === 'C') { sfx('key'); kp.input = ''; paintKp(); continue; }
      if (a.k === 'E') {
        if (kp.input.length < 4) { sfx('error'); paintKp('err', '請輸入四位數'); continue; }
        if (kp.input === ANSWER) break;
        sfx('error'); vibrate(80); paintKp('err', '密碼錯誤'); await sys(['密碼錯誤。再想想那四句謎語。'], 1600, 160, true); kp.input = ''; paintKp(); continue;
      }
      if (kp.input.length < 4) { sfx('key'); kp.input += a.k; paintKp(); }
    }
    untip(); backBtn.remove();
    sfx('unlock'); paintKp('ok', '解鎖成功'); vibrate(60);
    await sys(['解鎖成功。'], 1400, 160, true); S();
    await say('開了。', 'It’s open.', false); S();
    shut();
    await say('門後……有什麼在等著我？', 'What’s waiting for me behind this door?'); S();

    // 11 結尾演出
    setHs([]);
    $(el, '#slots').classList.add('hidden'); $(el, '#hud').classList.add('hidden'); $(el, '#hudR').classList.add('hidden');
    $$(el, '.shade-top, .shade-right').forEach(x => x.classList.add('hidden'));
    sfx('door'); scene.classList.add('door-open'); scene.style.transform = 'scale(2.2)'; await wait(1800); S();
    $(el, '#black').classList.add('on'); await wait(900); S();
    cine.classList.remove('hidden');
    cine.innerHTML = `<div class="sway"><div class="rgb"><img src="${IMG('n00-corridor.webp')}" alt=""><img src="${IMG('n00-corridor.webp')}" alt=""><img src="${IMG('n00-corridor.webp')}" alt=""></div><div class="glitch-bar"></div></div><div class="vignette"></div>`;
    if (d.settings.quality === 'low') cine.classList.add('low');
    $(el, '#black').classList.remove('on'); sfx('whoosh'); await wait(1200); S();
    await say('這個地方……我好像來過。', 'This place… I feel like I’ve been here before.'); S();
    $(el, '#black').classList.add('on'); await wait(800); S();
    // 記憶碎片：畫面本身不動，只有畫中的每個人影各自明滅閃爍
    const FIGS = [[228, 66, 100, 124], [380, 180, 152, 124], [790, 96, 180, 210], [1080, 240, 160, 130], [176, 322, 176, 206], [498, 352, 46, 56], [872, 402, 52, 86], [950, 490, 170, 130]];
    cine.innerHTML = `<img class="bg" src="${IMG('n00-memory.webp')}" alt="記憶碎片：模糊的人影與殘缺的符號">` +
      FIGS.map(([x, y, w, h], i) => `<div class="mem-ghost" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;background-image:url(${IMG('n00-memory.webp')});background-position:${-x}px ${-y}px;animation-duration:${(1.3 + (i * 0.37) % 1.1).toFixed(2)}s;animation-delay:${(-i * 0.43).toFixed(2)}s"></div>`).join('') +
      `<div class="vignette"></div>`;
    $(el, '#black').classList.remove('on'); sfx('tinnitus'); await wait(1400); S();
    await say('這些人是誰……我又是誰？', 'Who are these people… and who am I?'); S();
    await say('那個符號……我在哪裡見過？', 'That symbol… where have I seen it before?'); S();
    sfx('flash'); $(el, '#white').classList.add('on'); await wait(2000); S();

    d.prologueDone = true;
    if (!d.records.includes('n00')) d.records.push('n00');
    save(); taskDone('stage');
    bgm(null);
    go('lobby', { fromPrologue: true });
  }

  // 跑馬燈：first = 第一次看（逐句跑字並唸出）；之後直接顯示四句
  async function showRiddle(first, fromKeypad = false) {
    const prev = fromKeypad ? close.innerHTML : null;
    const prevKp = fromKeypad ? { ...kp } : null;
    openClose(`<img class="bg" src="${IMG('n00-marquee.webp')}" alt="門上方的跑馬燈"><div class="led" id="led"></div>`);
    const led = $(close, '#led');
    sfx('marquee');
    if (first) {
      await say('這是……謎語？', 'Is this… a riddle?'); S();
      for (const [cn, en] of RIDDLE) {
        led.innerHTML = `<div class="led-line" style="animation-duration:2.6s">${cn}</div>`;
        await wait(2700); S();
        await say(cn + '。', en); S();
      }
      await say('四句話……每一句都在指一個數字嗎？', 'Four lines… does each one point to a number?'); S();
    }
    led.innerHTML = `<div class="col" style="width:100%;align-items:center;gap:8px">${RIDDLE.map(([cn]) => `<div style="font-family:var(--serif);font-weight:900;font-size:40px;line-height:64px;letter-spacing:0.24em;padding-left:0.24em;color:#fff1ec;text-shadow:0 0 8px #ff6b6b,0 0 24px #ff2a2a">${cn}</div>`).join('')}</div>`;
    const b = html(`<button type="button" class="backbtn">${ICON.back.replace('<svg', '<svg width="20" height="20"')}<span>返回</span></button>`);
    close.appendChild(b);
    if (first) tip('記住這四句謎語，之後隨時可以回來重看。點「返回」回到門前。', 6, { left: 820, top: 520 });
    await new Promise(res => b.addEventListener('click', () => { sfx('tap'); res(); }));
    untip();
    if (fromKeypad) {
      close.innerHTML = prev; kp = prevKp;
      // 重新綁定按鍵
      $$(close, '.key').forEach(k => k.addEventListener('click', () => emit({ type: 'key', k: k.dataset.k, item: selected })));
      const rb = $(close, '.backbtn'); if (rb) rb.addEventListener('click', () => { sfx('tap'); emit({ type: 'riddle' }); });
      paintKp();
      tip('解開謎語，輸入四位數密碼。順序必須完全正確。<br><span style="color:var(--muted)">按 C 清除，按 ↵ 確認。</span>', 11, { left: 664, top: 320 });
    } else shut();
  }

  flow().catch(() => {});
  return () => { alive = false; listeners = []; };
}
