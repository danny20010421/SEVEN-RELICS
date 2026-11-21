import { get, save, reset, SHOP, buy, SIGNIN, STREAK, canSignin, doSignin, VIP, vipLevel, taskDone, triesLeft, today, startMain } from './store.js';
import { FICTION } from './g01.js';
import { sfx, bgm, applyVolume } from './audio.js';
import { html, $, $$, IMG, ICON, fmt, esc, shell, tabs, modal, alertBox, toast, rewardModal } from './ui.js';

const mount = (st, title, tabsHtml, back) => { const el = html(shell(title, tabsHtml, back)); st.appendChild(el); return { el, body: $(el, '.body') }; };
const onTabs = (el, cb) => $$(el, '[data-tab]').forEach(b => b.addEventListener('click', () => {
  sfx('tap');
  $$(el, '[data-tab]').forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-selected', on); });
  cb(+b.dataset.tab);
}));
const emptyState = (text, sub = '') => `<div class="empty">${ICON.empty}<div>${text}</div>${sub ? `<div style="font-size:14px">${sub}</div>` : ''}</div>`;
const CN = '一二三四五六七八九十';
const chName = i => i < 10 ? `第${CN[i]}章` : i === 10 ? '第十一章' : '第十二章';

// ---------------- 關卡選擇 ----------------
export function stages(st, p, go) {
  bgm('lobby');
  const { el, body } = mount(st, '關卡選擇', tabs(['主線關卡', '一般關卡'], p.tab || 0));
  // 主線：序章 + 12 章；預設選第一個可玩的（目前是序章）
  let sel = 'n00', secSel = 0;
  const main = () => {
    const d = get(), n00Done = d.records.includes('n00');
    const item = (id, name, sub, right, on) => `<button type="button" class="ch${on ? ' on' : ''}" data-ch="${id}" role="listitem"><span class="row" style="gap:12px"><b>${name}</b><span>${sub}</span></span>${right}</button>`;
    const list = item('n00', '序章', '記憶的終點', `<span style="font-size:14px;color:var(--gold-2)">${n00Done ? '已破關' : '0 / 1'}</span>`, sel === 'n00') +
      Array.from({ length: 12 }, (_, i) => item(i, chName(i), i === 0 ? '******' : '尚未解鎖', i === 0 ? `<span style="font-size:14px;color:var(--gold-2)">${d.records.includes('n01') ? 1 : 0} / 9</span>` : ICON.lock, sel === 0 && i === 0)).join('');
    const tries = `<div class="row" style="height:48px;gap:16px"><span style="font-size:16px;color:var(--text-2)">今日剩餘次數</span><b style="font-size:24px;line-height:32px">${triesLeft()} / 2</b><button type="button" class="btn-line sm" id="more" style="width:144px">${ICON.plus}<span style="margin-left:8px">增加次數</span></button></div>`;
    const panel = sel === 'n00' ? `<div class="panel stage-panel">
  <div class="col" style="gap:16px">
    <div class="row" style="justify-content:space-between;gap:24px">
      <div class="col" style="gap:4px"><div class="label">序章</div><h2 class="serif" style="margin:0;font-size:32px;line-height:40px">記憶的終點</h2></div>
      ${tries}
    </div>
    <p style="margin:0;font-size:16px;line-height:24px;color:var(--muted)">在緊急通道盡頭醒來，失去了所有記憶。打開金屬逃生門，找出自己是誰。</p>
  </div>
  <div class="nodes"><span class="node${n00Done ? ' done' : ''}">${n00Done ? ICON.check : ''}</span></div>
  <div class="row" style="padding:24px;justify-content:space-between;gap:24px;background:#1a1213;border:1px solid #2f1e1d">
    <div class="col" style="gap:8px"><h3 class="serif" style="margin:0;font-size:24px;line-height:32px">${n00Done ? '已破關' : '尚未破關'}</h3><span style="font-size:16px;line-height:24px;color:var(--text-2)">${n00Done ? '已破關的主線關卡再次挑戰不扣次數，但不會再獲得獎勵。' : '新手教學關卡，跟著提示一步步完成。'}</span></div>
    <button type="button" class="btn" id="play" style="width:208px">${n00Done ? '再次挑戰' : '開始挑戰'}</button>
  </div>
</div>` : `<div class="panel stage-panel">
  <div class="col" style="gap:16px">
    <div class="row" style="justify-content:space-between;gap:24px">
      <div class="col" style="gap:4px"><div class="label">第一章</div><h2 class="serif" style="margin:0;font-size:32px;line-height:40px">******</h2></div>
      ${tries}
    </div>
    <p style="margin:0;font-size:16px;line-height:24px;color:var(--muted)">九個小節環環相扣，須依序限時破解。每日可挑戰 2 次，額外次數需消耗鑽石；已破關的小節再次挑戰不扣次數，但不會再獲得獎勵。</p>
  </div>
  <div class="nodes">${Array.from({ length: 9 }, (_, i) => { const id = 'n0' + (i + 1), done = d.records.includes(id), open = i === 0 || (i === 1 && d.records.includes('n01')); return `<${open ? 'button type="button" data-sec="' + i + '"' : 'span'} class="node${done ? ' done' : ''}${secSel === i ? ' cur' : ''}" aria-label="第${i + 1}節">${done ? ICON.check : open ? String(i + 1) : ICON.lock}</${open ? 'button' : 'span'}>${i < 8 ? '<span class="link-line"></span>' : ''}`; }).join('')}</div>
  ${secSel === 1 ? `<div class="row" style="padding:24px;justify-content:space-between;gap:24px;background:#1a1213;border:1px solid #2f1e1d">
    <div class="col" style="gap:8px"><h3 class="serif" style="margin:0;font-size:24px;line-height:32px">第二節　（標題待定）</h3><span style="font-size:16px;line-height:24px;color:var(--text-2)">不限時挑戰，提示每次 1 顆鑽石。</span></div>
    <button type="button" class="btn" id="playN02" style="width:208px">${d.n02 && d.n02.st ? '繼續調查' : d.records.includes('n02') ? '再次挑戰' : '開始挑戰'}</button>
  </div>` : `<div class="row" style="padding:24px;justify-content:space-between;gap:24px;background:#1a1213;border:1px solid #2f1e1d">
    <div class="col" style="gap:8px"><h3 class="serif" style="margin:0;font-size:24px;line-height:32px">第一節　不存在的第七分鐘</h3><span style="font-size:16px;line-height:24px;color:var(--text-2)">${n00Done ? '不限時挑戰，提供 2 次免費提示。' : '先完成序章後開放。'}</span></div>
    <button type="button" class="btn" id="playN01" style="width:208px"${n00Done ? '' : ' disabled'}>${d.n01 && d.n01.st ? '繼續調查' : d.records.includes('n01') ? '再次挑戰' : '開始挑戰'}</button>
  </div>`}
</div>`;
    body.innerHTML = `<div class="chlist" role="list">${list}</div>${panel}`;
    $$(body, '[data-ch]').forEach(b => b.addEventListener('click', () => {
      sfx('tap');
      const id = b.dataset.ch;
      if (id === 'n00' || id === '0') { sel = id === 'n00' ? 'n00' : 0; main(); return; }
      toast('完成前一章後解鎖');
    }));
    $$(body, '[data-sec]').forEach(b => b.addEventListener('click', () => { sfx('tap'); secSel = +b.dataset.sec; main(); }));
    const p2 = $(body, '#playN02');
    if (p2) p2.addEventListener('click', async () => {
      sfx('tap');
      const dd = get();
      if (dd.n02 && dd.n02.st) {
        const r = await modal({ title: '第二節', body: '上次的調查還沒完成，要從中斷的地方繼續嗎？', buttons: [{ label: '重新開始', kind: 'btn-line', value: 'new' }, { label: '繼續調查', kind: 'btn', value: 'go' }] });
        if (r === 'go') go('n02', { resume: true }); else if (r === 'new') { dd.n02.st = null; save(); go('n02'); }
        return;
      }
      go('n02');
    });
    const pN = $(body, '#playN01');
    if (pN) pN.addEventListener('click', async () => {
      sfx('tap');
      const dd = get();
      if (dd.n01 && dd.n01.st) {
        const r = await modal({ title: '第一節　不存在的第七分鐘', body: '上次的調查還沒完成，要從中斷的地方繼續嗎？', buttons: [{ label: '重新開始', kind: 'btn-line', value: 'new' }, { label: '繼續調查', kind: 'btn', value: 'go' }] });
        if (r === 'go') go('n01', { resume: true }); else if (r === 'new') { dd.n01.st = null; save(); go('n01'); }
        return;
      }
      go('n01');
    });
    const play = $(body, '#play');
    if (play) play.addEventListener('click', async () => {
      sfx('tap');
      const r = startMain('n00');
      if (r === 'replay') {
        const ok = await modal({ title: '再次挑戰', body: '這個關卡已經破關。<br>再次挑戰不會扣除今日挑戰次數，但破關後不會再獲得獎勵。', buttons: [{ label: '取消', kind: 'btn-line', value: false }, { label: '開始', kind: 'btn', value: true }] });
        if (ok) go('prologue', { replay: true });
        return;
      }
      if (r === 'none') { alertBox('今日次數已用完', '可以消耗鑽石增加挑戰次數，或明天再來。'); return; }
      go('prologue');
    });
    $(body, '#more').addEventListener('click', async () => {
      sfx('tap');
      const d = get();
      const ok = await modal({ title: '增加挑戰次數', body: `消耗 5 顆鑽石，增加 1 次今日主線挑戰。<br><span style="font-size:16px;color:var(--muted)">目前持有 ${d.diamonds} 顆鑽石</span>`, buttons: [{ label: '取消', kind: 'btn-line', value: false }, { label: '增加 1 次', kind: 'btn', value: true }] });
      if (!ok) return;
      if (d.diamonds < 5) { alertBox('鑽石不足', '鑽石不足，可以完成每日任務或前往儲值取得。'); return; }
      d.diamonds -= 5; d.mainTries.extra += 1; save(); sfx('coin'); go('stages');
    });
  };
  const general = () => {
    const d = get();
    setTimeout(() => { const b = $(body, '#g01'); if (b) b.addEventListener('click', async () => {
      sfx('tap');
      if (d.records.includes('g01')) {
        const ok = await modal({ title: '再次挑戰', body: '這個關卡已經破關。<br>可以重看劇情，但不會再獲得獎勵。', buttons: [{ label: '取消', kind: 'btn-line', value: false }, { label: '開始', kind: 'btn', value: true }] });
        if (ok) go('g01', { replay: true });
        return;
      }
      go('g01');
    }); });
    body.innerHTML = `<div class="content"><div class="glist">
${d.records.includes('n00') ? `<button type="button" class="card gitem" id="g01"><span class="col" style="gap:4px"><span class="serif" style="font-size:24px;line-height:32px">G01 · 從未消失的黃金</span><span style="font-size:14px;line-height:24px;color:var(--muted)">台灣・金瓜石 · 難度 ★★☆☆☆ · 不限時${d.records.includes('g01') ? ' · 已破關' : ''}</span></span><span class="btn sm" style="width:144px">${d.records.includes('g01') ? '再次挑戰' : '開始調查'}</span></button>` : `<div class="card gitem lock"><span class="col" style="gap:4px"><span class="serif" style="font-size:24px;line-height:32px">G01 · ？？？</span><span style="font-size:14px;line-height:24px">通關序章後開放</span></span>${ICON.lock}</div>`}
<div class="card gitem lock"><span class="col" style="gap:4px"><span class="serif" style="font-size:24px;line-height:32px">更多一般關卡</span><span style="font-size:14px;line-height:24px">分支任務製作中，敬請期待</span></span>${ICON.lock}</div>
</div><p style="margin:16px 0 0;max-width:880px;font-size:14px;line-height:24px;color:var(--muted)">G01 的藏金情節為虛構，取材自金瓜石礦業與戰俘歷史。真實封閉礦坑不可進入，請勿嘗試現地操作。</p></div>`;
  };
  (p.tab ? general : main)();
  onTabs(el, i => (i ? general : main)());
}

// ---------------- 商城 ----------------
export function shop(st, p, go) {
  bgm('lobby');
  taskDone('shop');
  const { el, body } = mount(st, '商城', '');
  el.appendChild(html(tabs(['關卡加成', '外觀', '禮包', '月卡', '抽道具', '儲值'], 0, 'vtab')));
  const paint = i => {
    if (i === 5) { go('topup'); return; }
    if (i > 0) { body.innerHTML = `<div class="content side">${emptyState('即將開放', i === 4 ? '抽道具開放時將公開各項商品的取得機率。' : '')}</div>`; return; }
    const d = get();
    body.innerHTML = `<div class="content side"><div class="grid3">${SHOP.map(it => `<div class="panel prod">
<div class="top"><img class="big" src="${IMG('it-' + it.id + '.webp')}" alt=""><h2>${it.name}</h2><p>${it.desc}</p><div class="chips">${it.chips.map(c => `<span class="chip">${c}</span>`).join('')}</div><span class="owned">持有 ${d.items[it.id]} 個</span></div>
<div class="buy"><span class="price"><img src="${IMG('coin.webp')}" alt="遊戲幣"><span>${fmt(it.price)}</span></span><button type="button" class="btn sm" data-buy="${it.id}" style="width:120px">購買</button></div>
</div>`).join('')}</div></div>`;
    $$(body, '[data-buy]').forEach(b => b.addEventListener('click', async () => {
      sfx('tap');
      const it = SHOP.find(x => x.id === b.dataset.buy);
      const ok = await modal({ title: `購買「${it.name}」`, bodyHtml: `<div class="reward-row"><div class="reward"><img src="${IMG('it-' + it.id + '.webp')}" alt=""><span>×1</span></div></div><p>花費 ${fmt(it.price)} 遊戲幣</p>`, buttons: [{ label: '取消', kind: 'btn-line', value: false }, { label: '購買', kind: 'btn', value: true }] });
      if (!ok) return;
      const r = buy(it.id);
      if (r === 'ok') { sfx('coin'); toast(`已購買「${it.name}」`); go('shop'); }
      else if (r === 'coins') alertBox('遊戲幣不足', '可以透過每日簽到、破關與 VIP 取得遊戲幣。');
      else if (r === 'limit') alertBox('今日已購買', '調查備忘錄每日限購 1 個，明天再來吧。');
    }));
  };
  paint(0);
  $$(el, '.vtab').forEach(b => b.addEventListener('click', () => {
    sfx('tap'); $$(el, '.vtab').forEach(x => x.classList.toggle('on', x === b)); paint(+b.dataset.tab);
  }));
}

// ---------------- 儲值 ----------------
export function topup(st, p, go) {
  bgm('lobby');
  const { body } = mount(st, '儲值', '', 'shop');
  const packs = [[10, 100], [50, 500], [100, 1000], [500, 5000], [1000, 10000], [5000, 50000]];
  body.innerHTML = `<div class="content"><div class="grid3">${packs.map(([n, ntd]) => `<div class="panel col" style="height:292px;padding:24px;align-items:center;justify-content:center;gap:16px"><img src="${IMG('diamond.webp')}" alt="" style="width:96px;height:96px"><b style="font-size:24px;line-height:32px">鑽石 ×${fmt(n)}</b><button type="button" class="btn sm" data-pay style="width:160px">NT$${fmt(ntd)}</button></div>`).join('')}</div></div>`;
  $$(body, '[data-pay]').forEach(b => b.addEventListener('click', () => { sfx('tap'); alertBox('儲值尚未開放', '金流服務正在準備中，開放後會在公告通知。'); }));
}

// ---------------- 背包 ----------------
export function bag(st, p, go) {
  bgm('lobby');
  const { el, body } = mount(st, '背包', tabs(['關鍵線索', '道具', '文物', '收藏品']));
  const NAMES = { timer: ['加時器', '主線任務延長 3 分鐘。同一關卡限用 3 次。'], compass: ['解析盤', '協助縮小密碼謎題的範圍。同一關卡限用 2 次。'], memo: ['調查備忘錄', '自動整理已發現的相關線索。每關限用 1 次。'] };
  const paint = i => {
    const d = get();
    const list = i === 0 ? d.clues.map(c => ({ img: c.img, name: c.name, desc: c.desc, n: 1 })) : i === 1 ? Object.keys(NAMES).filter(k => d.items[k] > 0).map(k => ({ img: 'it-' + k + '.webp', name: NAMES[k][0], desc: NAMES[k][1], n: d.items[k] })) : i === 3 ? (d.collection || []).map(c => ({ img: c.img, name: c.name, desc: c.desc, n: 1 })) : [];
    if (!list.length) { body.innerHTML = `<div class="content">${emptyState(i === 0 ? '尚未取得關鍵線索' : '這裡還沒有東西', i === 0 ? '破解主線關卡後取得的關鍵線索會收在這裡。' : '')}</div>`; return; }
    const bagImg = (file, px) => `<img src="${IMG(file)}" alt="" style="width:${px}px;height:${px}px;object-fit:contain" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'miss-img',textContent:'藏'}))">`;
    body.innerHTML = `<div class="content"><div class="bag-grid">${Array.from({ length: 40 }, (_, k) => list[k] ? `<button type="button" class="bslot has${k === 0 ? ' sel' : ''}" data-k="${k}" aria-label="${list[k].name}">${bagImg(list[k].img, 72)}<span class="n">×${list[k].n}</span></button>` : '<span class="bslot" aria-hidden="true"></span>').join('')}</div>
<div class="panel bag-detail" id="det"></div></div>`;
    const det = k => {
      const it = list[k];
      const kind = i === 0 ? '關鍵線索' : i === 3 ? '收藏品' : '道具';
      $(body, '#det').innerHTML = `<div class="col" style="gap:16px"><div class="center" style="height:160px;background:#1a1213;border:1px solid #4a302c">${bagImg(it.img, 136)}</div><h2 class="serif" style="margin:0;font-size:24px;line-height:32px">${it.name}</h2><div class="row" style="gap:8px"><span class="chip">${kind}</span><span class="chip">持有 ×${it.n}</span></div><p style="margin:0;font-size:16px;line-height:28px;color:var(--muted)">${it.desc}</p></div><div class="muted" style="font-size:14px;line-height:24px">${i === 1 ? '道具可在關卡中從右上角使用。' : ''}</div>`;
      $$(body, '.bslot.has').forEach(x => x.classList.toggle('sel', +x.dataset.k === k));
    };
    det(0);
    $$(body, '.bslot.has').forEach(b => b.addEventListener('click', () => { sfx('tap'); det(+b.dataset.k); }));
  };
  paint(0); onTabs(el, paint);
}

// ---------------- 每日簽到 ----------------
export function signin(st, p, go) {
  bgm('lobby');
  const { body } = mount(st, '每日簽到', '');
  const d = get();
  const can = canSignin();
  const idx = d.signin.idx; // 下一個要領的位置
  const doneCount = can ? idx : (idx === 0 ? 7 : idx);
  body.innerHTML = `<div class="content">
<div class="days">${SIGNIN.map((r, i) => {
    const done = i < doneCount, now = can && i === idx;
    return `<div class="day${done ? ' done' : ''}${now ? ' today' : ''}"><b style="font-size:16px;line-height:24px">第 ${i + 1} 天</b><div class="rw"><div><img src="${IMG('coin.webp')}" alt="遊戲幣"><span>×${r.coins}</span></div><div><img src="${IMG('it-timer.webp')}" alt="加時器"><span>×${r.timer}</span></div></div>${done ? `<span class="state ok">${ICON.check.replace('class="ico"', 'width="16" height="16"')}<span>已領取</span></span>` : now ? '<span class="state now">今日可領</span>' : '<span class="state">尚未開放</span>'}</div>`;
  }).join('')}</div>
<div class="panel abs col" style="left:8px;top:296px;width:1216px;padding:24px;gap:16px">
  <div class="row" style="height:32px;justify-content:space-between"><h2 class="serif" style="margin:0;font-size:24px;line-height:32px">連續登入獎勵</h2><span style="font-size:16px;color:var(--text-2)">已連續簽到　<b style="color:var(--text)">${d.signin.last ? d.signin.streak : 0} 天</b></span></div>
  <div class="row" style="height:88px;gap:16px">${STREAK.map(s => `<div class="row" style="flex:1 1 0;height:88px;padding:0 24px;justify-content:space-between;background:#1a1213;border:1px solid #2f1e1d"><div class="col" style="gap:4px"><b style="font-size:18px;line-height:24px">連續 ${s.days} 天</b><span class="muted" style="font-size:14px;line-height:20px">${d.signin.streak >= s.days ? '已達成' : `還差 ${s.days - (d.signin.last ? d.signin.streak : 0)} 天`}</span></div><div class="row" style="height:40px;gap:8px"><img src="${IMG('coin.webp')}" alt="遊戲幣" style="width:40px;height:40px"><b style="font-size:20px;line-height:28px">×${fmt(s.coins)}</b></div></div>`).join('')}</div>
</div>
<div class="abs center" style="left:0;right:0;top:536px;height:56px"><button type="button" class="btn serif-btn" id="sign" style="width:240px" ${can ? '' : 'disabled'}>${can ? '簽到領取' : '今日已簽到'}</button></div>
</div>`;
  $(body, '#sign').addEventListener('click', async () => {
    const r = doSignin(); if (!r) return;
    const list = [{ img: 'coin.webp', name: '遊戲幣', n: r.coins + (r.bonus || 0) }, { img: 'it-timer.webp', name: '加時器', n: r.timer }];
    await rewardModal('簽到成功', list);
    go('signin');
  });
}

// ---------------- VIP ----------------
export function vip(st, p, go) {
  bgm('lobby');
  const { body } = mount(st, 'VIP', '');
  const d = get(), lv = vipLevel();
  const next = VIP[lv + 1];
  const pct = next ? Math.min(100, Math.round((d.topup - VIP[lv]) / (next - VIP[lv]) * 100)) : 100;
  body.innerHTML = `<div class="content">
<div class="panel abs col" style="left:0;top:0;width:400px;height:600px;padding:32px;align-items:center;justify-content:space-between">
  <div class="col" style="align-items:center;gap:8px"><img src="${IMG('ic-vip.webp')}" alt="" style="width:200px;height:200px"><div class="label">目前等級</div><div style="font-family:var(--cinzel);font-weight:700;font-size:56px;line-height:64px">VIP ${lv}</div></div>
  <div class="col" style="width:100%;gap:8px">
    <div class="row" style="height:24px;justify-content:space-between;font-size:16px"><span>已累計儲值</span><b>${fmt(d.topup)} 鑽石</b></div>
    <div class="bar"><i style="width:${pct}%"></i></div>
    <div class="muted" style="font-size:14px;line-height:24px">${next ? `再儲值 ${fmt(next - d.topup)} 鑽石升級至 VIP ${lv + 1}` : '已達最高等級'}</div>
  </div>
  <button type="button" class="btn" data-go="topup" style="width:100%">前往儲值</button>
</div>
<div class="panel abs col" style="left:424px;top:0;width:808px;height:600px;padding:24px;gap:16px">
  <div class="row" style="height:32px;justify-content:space-between"><h2 class="serif" style="margin:0;font-size:20px;line-height:32px">VIP 等級</h2><span class="muted" style="font-size:14px">各等級專屬福利尚未公布</span></div>
  <ul class="tiers">${VIP.slice(1).map((v, i) => {
    const n = i + 1, st2 = n < lv ? `<span class="state ok">${ICON.check.replace('class="ico"', 'width="16" height="16"')}<span>已達成</span></span>` : n === lv ? '<span class="state now">目前等級</span>' : '<span class="state">未達成</span>';
    return `<li class="tier${n === lv ? ' cur' : ''}"><span class="row" style="gap:24px"><b style="width:88px;font-family:var(--cinzel);font-size:24px;line-height:32px">VIP ${n}</b><span style="font-size:16px;color:var(--text-2)">累計儲值　<b style="color:var(--text)">${fmt(v)}</b>　鑽石</span></span>${st2}</li>`;
  }).join('')}</ul>
</div>
</div>`;
}

// ---------------- 設定 ----------------
export function settings(st, p, go) {
  bgm('lobby');
  const { body } = mount(st, '設定', '');
  const d = get(), s = d.settings;
  const seg = (key, opts) => `<div class="seg" data-seg="${key}">${opts.map(([v, l]) => `<button type="button" data-v="${v}" class="${s[key] === v ? 'on' : ''}" aria-pressed="${s[key] === v}">${l}</button>`).join('')}</div>`;
  body.innerHTML = `<div class="content row" style="align-items:flex-start;gap:16px">
<div class="set-col" style="flex:1 1 0">
  <section class="panel set-card"><h2>音量</h2>
    <div class="set-row"><label for="v1">背景音樂</label><input id="v1" type="range" min="0" max="100" value="${Math.round(s.bgm * 100)}"></div>
    <div class="set-row"><label for="v2">音效</label><input id="v2" type="range" min="0" max="100" value="${Math.round(s.sfx * 100)}"></div>
  </section>
  <section class="panel set-card"><h2>操作</h2>
    <div class="set-row"><label for="vib">震動回饋（手機）</label><input id="vib" type="checkbox" ${s.vibrate ? 'checked' : ''}></div>
    <div class="set-row"><span>電腦操作</span><span class="muted">滑鼠點擊；Esc 返回</span></div>
  </section>
</div>
<div class="set-col" style="flex:1 1 0">
  <section class="panel set-card"><h2>畫質</h2><div class="set-row"><span>特效品質</span>${seg('quality', [['low', '低'], ['mid', '中'], ['high', '高']])}</div></section>
  <section class="panel set-card"><h2>語言</h2><div class="set-row"><label for="lang">顯示語言</label><select id="lang" class="field"><option>繁體中文</option></select></div></section>
  <section class="panel set-card"><h2>帳號管理</h2>
    <div class="set-row"><span>${esc(d.account ? d.account.email : '未登入')}</span><button type="button" class="btn-line sm" id="logout" style="width:120px">登出</button></div>
    <div class="set-row"><span>存檔　<span class="muted">儲存在這台裝置</span></span><button type="button" class="btn-line sm" id="wipe" style="width:120px">清除存檔</button></div>
  </section>
</div>
</div>`;
  const upd = () => { s.bgm = $(body, '#v1').value / 100; s.sfx = $(body, '#v2').value / 100; s.vibrate = $(body, '#vib').checked; applyVolume(); save(); };
  ['#v1', '#v2'].forEach(k => $(body, k).addEventListener('input', upd));
  $(body, '#vib').addEventListener('change', upd);
  $$(body, '[data-seg] button').forEach(b => b.addEventListener('click', () => {
    sfx('tap'); const key = b.parentElement.dataset.seg; s[key] = b.dataset.v; save();
    $$(b.parentElement, 'button').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
  }));
  $(body, '#logout').addEventListener('click', async () => {
    sfx('tap');
    if (await modal({ title: '登出', body: '確定要登出嗎？', buttons: [{ label: '取消', kind: 'btn-line', value: false }, { label: '登出', kind: 'btn', value: true }] })) { d.account = null; save(); go('login'); }
  });
  $(body, '#wipe').addEventListener('click', async () => {
    sfx('tap');
    if (await modal({ title: '清除存檔', body: '所有進度、遊戲幣與道具都會刪除，而且無法復原。確定要清除嗎？', buttons: [{ label: '取消', kind: 'btn-line', value: false }, { label: '清除', kind: 'btn', value: true }] })) { reset(); go('loading'); }
  });
}

// ---------------- 活動中心 ----------------
export function events(st, p, go) {
  bgm('lobby');
  const { el, body } = mount(st, '活動中心', '');
  el.appendChild(html(tabs(['限時探索', '特殊事件', '活動獎勵'], 0, 'vtab')));
  body.innerHTML = `<div class="content side"><div class="panel abs" style="left:0;top:0;width:1008px;height:312px;overflow:hidden;border-color:var(--red)">
<img src="${IMG('wild.webp')}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 30%">
<div class="fill" style="background:linear-gradient(90deg,rgba(10,6,7,0.94) 0%,rgba(10,6,7,0.7) 45%,rgba(10,6,7,0.1) 100%)"></div>
<div class="abs col" style="left:32px;top:32px;width:480px;gap:8px"><span class="chip-red" style="align-self:flex-start">即將開放</span><h2 class="serif" style="margin:0;font-size:40px;line-height:56px">限時探索</h2><div style="font-size:16px;line-height:24px;color:var(--text-2)">活動開放時會在公告通知。</div></div>
</div>${'<div></div>'}<div class="abs" style="left:0;top:328px;width:1008px;height:272px">${emptyState('目前沒有進行中的活動')}</div></div>`;
  $$(el, '.vtab').forEach(b => b.addEventListener('click', () => { sfx('tap'); $$(el, '.vtab').forEach(x => x.classList.toggle('on', x === b)); }));
}

// ---------------- 調查檔案 ----------------
// 人物關係：以主角為中心的關係圖；通關指定主線關卡後解鎖
const PEOPLE = [
  {
    id: 'induasen', name: '因杜阿森', title: '歷史學家', rel: '大學教授', slot: 'left', unlock: 'n00',
    av: 'npc-induasen-av.webp', img: 'npc-induasen.webp',
    lines: ['外表冷酷、實則熱心的老人。擁有強大的人脈與訊息資源，世界各地遇到困難的機構，都會想找他協助。', '自稱是主角的大學老師，是幫助主角恢復記憶的關鍵人物。']
  },
  {
    id: 'lin', name: '林館長', title: '博物館館長', rel: '委託人', slot: 'right', unlock: 'g01',
    av: 'npc-lin-av.webp', img: 'npc-lin.webp',
    lines: ['黃金博物館在這一關的委託人。完全虛構的人物，不對應任何一位現實中的館長。', '她提供調查檔案與進坑許可。主角回館時，沒有說出金庫的位置。']
  }
];
const SLOT = { left: [192, 248, 416, 280], right: [880, 248, 720, 280], top: [536, 40, 568, 184], bottom: [536, 456, 568, 404] };
function people(body, d, focus) {
  const known = PEOPLE.filter(m => d.records.includes(m.unlock));
  const pick = focus && known.find(m => m.id === focus);
  if (pick) {
    body.innerHTML = `<div class="content"><div class="panel pdoc">
  <div class="pdoc-pic" data-fb="${pick.name.slice(0, 1)}"><img src="${IMG(pick.img)}" alt="${pick.name}" onerror="this.classList.add('miss')"></div>
  <div class="pdoc-text">
    <div class="row" style="height:24px;gap:8px;font-size:14px;color:var(--muted)"><span>人物關係</span><span>›</span><span>${esc(d.player.name)}</span><span>›</span><span style="color:var(--gold-2)">${pick.name}</span></div>
    <h2 class="serif" style="margin:0;font-size:40px;line-height:56px">${pick.name}</h2>
    <div class="row" style="gap:8px"><span class="chip-red">${pick.title}</span><span class="pchip">與主角：${pick.rel}</span></div>
    <div class="redline"></div>
    ${pick.lines.map(t => `<p>${t}</p>`).join('')}
  </div>
  <button type="button" class="btn-line" id="pback" style="position:absolute;right:32px;bottom:32px;width:208px">返回關係圖</button>
</div></div>`;
    $(body, '#pback').addEventListener('click', () => { sfx('tap'); people(body, d); });
    return;
  }
  const node = (x, y, inner, label, on, id, fb = '') => `<button type="button" class="pnode" style="left:${x}px;top:${y}px"${id ? ` data-p="${id}"` : ''} aria-label="${label}"><span class="pav${on ? ' on' : ''}"${fb ? ` data-fb="${fb}"` : ''}>${inner}</span><span class="pname">${label}</span></button>`;
  const q = '<span style="font-size:32px;font-weight:700;line-height:40px;color:var(--muted-2)">？</span>';
  let html2 = '<div class="pline" style="left:320px;top:199px;width:592px;height:2px"></div><div class="pline" style="left:615px;top:40px;width:2px;height:320px"></div>';
  for (const [slot, [x, y, lx, ly]] of Object.entries(SLOT)) {
    const m = known.find(k => k.slot === slot);
    html2 += `<span class="prel" style="left:${lx}px;top:${ly - 96}px">${m ? m.rel : '******'}</span>`;
    html2 += m ? node(x, y - 96, `<img src="${IMG(m.av)}" alt="" onerror="this.classList.add('miss')">`, m.name, true, m.id, m.name.slice(0, 1)) : node(x, y - 96, q, '？？？', false);
  }
  html2 += node(536, 152, `<img src="${IMG(`avatar-${d.player.gender}.webp`)}" alt="">`, esc(d.player.name), true);
  body.innerHTML = `<div class="content"><div class="panel pgraph"><div class="pgraph-in">${html2}</div>
  <div class="muted" style="position:absolute;left:24px;bottom:24px;height:40px;display:flex;align-items:center;font-size:16px;color:var(--text-2)">${known.length ? '點人物可查看詳細資料。通關主線關卡後，會有更多關鍵人物加入。' : '通關主線關卡後，關鍵人物才會加入這裡。'}</div></div></div>`;
  $$(body, '[data-p]').forEach(b => b.addEventListener('click', () => { sfx('tap'); people(body, d, b.dataset.p); }));
}

// 劇情紀錄：序章與已破關的一般關卡
const STORY = [
  { id: 'n00', group: '序章', name: '記憶的終點', label: '序章 · 紀錄 01', html: `<p>在意識深處的緊急通道醒來。門上的跑馬燈留下四句謎語：</p>
<p style="font-family:var(--serif);font-weight:600;color:var(--text)">未曾存在，吞沒一切<br>不曾移動，目觀四方<br>鏡中之影，與誰相同<br>另一消散，何以為證</p>
<p>門後是一條伸向黑暗的通道。模糊的人影、殘缺的符號……我好像來過那裡。</p>` },
  { id: 'g01', group: '一般關卡', name: '從未消失的黃金', label: '一般關卡 · G01　台灣・金瓜石', html: d => {
    const g = d.g01 || {};
    const who = (g.photoA || g.photoB)
      ? '英國戰俘亞瑟・威廉斯、Edward Miller、Thomas Reed，與台灣技工林清和'
      : '英國戰俘亞瑟・威廉斯與他的同伴，以及台灣技工林清和';
    return `<p>受因杜阿森教授之託，協助黃金博物館調查 1945 年 2 月 17 日的運輸紀錄。三車貨物沒有抵達終點，而是沿著一條沒有寫進正式清單的維修路線被移走。</p>
<p>藏起黃金的，是${who}。黃金留在山裡。這份紀錄不記載金庫的位置，也不把黃金當成可以取走的東西。</p>
<div class="label" style="margin-top:8px">收藏　亞瑟的最後一封信（影像檔）</div>
<p style="font-family:var(--serif);font-weight:600;color:var(--text)">如果你正在讀這封信，代表我們成功了。<br>黃金屬於活著的人。但請別忘了那些死去的人。<br>如果有一天，這些黃金再次被人發現，我只希望它們不會成為下一場貪婪的開始。<br>—— Arthur Williams</p>
<p style="font-size:14px;line-height:24px;color:var(--muted)">${FICTION}</p>`;
  } },
];
function story(body, d, pick) {
  const have = STORY.filter(s => d.records.includes(s.id));
  const cur = have.find(s => s.id === pick) || have[0];
  let list = '', g = '';
  for (const s of STORY) {
    if (s.group !== g) { g = s.group; list += `<div class="label" style="height:32px;display:flex;align-items:center">${g}</div>`; }
    list += d.records.includes(s.id) ? `<button type="button" class="fitem${cur && cur.id === s.id ? ' on' : ' got'}" data-s="${s.id}">${s.name}</button>` : `<div class="fitem"><span>？？？</span>${ICON.lock}</div>`;
  }
  body.innerHTML = `<div class="content"><div class="flist">${list}</div>
<div class="panel fdoc">${cur ? `<div class="label">${cur.label}</div><h2>${cur.name}</h2><div class="redline"></div>${typeof cur.html === 'function' ? cur.html(d) : cur.html}` : emptyState('尚未取得劇情紀錄')}</div></div>`;
  $$(body, '[data-s]').forEach(b => b.addEventListener('click', () => { sfx('tap'); story(body, d, b.dataset.s); }));
}

export function files(st, p, go) {
  bgm('lobby');
  const { el, body } = mount(st, '調查檔案', tabs(['劇情紀錄', '人物關係', '組織情報', '證據牆']));
  const paint = i => {
    const d = get();
    if (i === 0) {
      story(body, d);
    } else if (i === 1) {
      people(body, d);
    } else {
      const t = ['人物關係', '組織情報', '證據牆'][i - 1];
      body.innerHTML = `<div class="content"><div class="panel fill">${emptyState(`尚未取得${t}`, '通關主線關卡後，相關內容會加入這裡。')}</div></div>`;
    }
  };
  paint(0); onTabs(el, paint);
}

// ---------------- 公告與客服 ----------------
export function notice(st, p, go) {
  bgm('lobby');
  const { el, body } = mount(st, '公告與客服', tabs(['更新公告', '客服聯絡', '問題回報']));
  const paint = i => {
    if (i === 0) body.innerHTML = `<div class="content"><div class="flist"><button type="button" class="fitem on" style="height:72px;flex-direction:column;align-items:flex-start;justify-content:center;gap:4px"><span>搶先體驗版上線</span><span style="font-size:14px;font-weight:400;color:var(--muted)">${today()}</span></button></div>
<div class="panel fdoc"><div class="label">${today()}</div><h2>搶先體驗版上線</h2><div class="redline"></div>
<p>感謝你參與《秘寶真相》搶先體驗。目前開放序章「記憶的終點」、一般關卡 G01「從未消失的黃金」，以及大廳各項功能。</p>
<p>主線第一章、其他一般關卡、帳號雲端存檔、Google 與 LINE 登入、儲值功能，將陸續開放。G01 的藏金情節為虛構，請勿進入真實封閉礦坑。</p>
<p>搶先體驗期間，進度只儲存在目前使用的裝置與瀏覽器中。</p></div></div>`;
    else body.innerHTML = `<div class="content"><div class="panel fill">${emptyState(i === 1 ? '客服管道將於正式上線前公布' : '問題回報功能即將開放')}</div></div>`;
  };
  paint(0); onTabs(el, paint);
}

// ---------------- 玩家資訊 ----------------
export function profile(st, p, go) {
  bgm('lobby');
  const { body } = mount(st, '玩家資訊', '');
  const d = get(), g = d.player.gender;
  const ach = [['序章完成', d.records.includes('n00')], ['首次簽到', !!d.signin.last], ['完成大廳導覽', d.tourDone], ['首次購買道具', d.items.compass + d.items.memo > 0 || d.items.timer > (d.rewardGiven ? 2 : 0)]];
  body.innerHTML = `<div class="content">
<div class="panel abs col" style="left:0;top:0;width:400px;height:600px;padding:32px;align-items:center;justify-content:space-between">
  <div class="col" style="align-items:center;gap:16px">
    <span class="avatar" style="width:160px;height:160px"><img src="${IMG(`avatar-${g}.webp`)}" alt=""></span>
    <h2 class="serif" style="margin:0;font-size:28px;line-height:40px">${esc(d.player.name)}</h2>
    <div class="row" style="gap:8px"><span class="chip-red">VIP ${vipLevel()}</span><span style="font-size:14px;color:var(--gold-2)">無名的探尋者</span></div>
    <div class="muted" style="font-size:14px;line-height:24px">玩家編號　${d.player.id}</div>
  </div>
  <button type="button" class="btn-line" id="rename" style="width:100%">修改名稱</button>
</div>
<div class="abs col" style="left:424px;top:0;width:808px;gap:16px">
  <section class="panel col" style="height:232px;padding:24px;justify-content:space-between">
    <h2 class="serif" style="margin:0;font-size:20px;line-height:32px">探索進度</h2>
    <div class="col" style="gap:8px"><div class="row" style="height:24px;justify-content:space-between"><span>主線關卡　序章</span><b>${d.records.includes('n00') ? '已破關' : '未破關'}</b></div><div class="bar gold"><i style="width:${d.records.includes('n00') ? 100 : 0}%"></i></div></div>
    <div class="col" style="gap:8px"><div class="row" style="height:24px;justify-content:space-between"><span>主線關卡　第一章</span><b>已破解 0 / 9 節</b></div><div class="bar gold"><i style="width:0%"></i></div></div>
    <div class="col" style="gap:8px"><div class="row" style="height:24px;justify-content:space-between"><span>一般關卡</span><b>已完成 ${d.records.filter(r => r !== 'n00').length} / 1 關</b></div><div class="bar gold"><i style="width:${Math.min(100, d.records.filter(r => r !== 'n00').length * 100)}%"></i></div></div>
  </section>
  <section class="panel col" style="height:352px;padding:24px;gap:16px">
    <h2 class="serif" style="margin:0;font-size:20px;line-height:32px">成就</h2>
    <div class="grid3" style="grid-template-columns:repeat(4,minmax(0,1fr))">${ach.map(([n, ok]) => `<div class="col center" style="height:112px;gap:8px;background:${ok ? '#1a1213' : 'rgba(17,11,12,0.7)'};border:1px solid ${ok ? 'var(--gold)' : 'var(--line-dim)'};color:${ok ? 'var(--text)' : 'var(--muted-2)'}">${ok ? ICON.check : ICON.lock}<b style="font-size:16px;line-height:24px">${ok ? n : '？？？'}</b></div>`).join('')}</div>
  </section>
</div>
</div>`;
  $(body, '#rename').addEventListener('click', async () => {
    sfx('tap');
    const r = await modal({
      title: '修改名稱',
      bodyHtml: `<div class="col" style="align-self:stretch;gap:8px"><input id="nn" class="field" maxlength="12" value="${esc(d.player.name)}" aria-label="新名稱"><div class="muted" style="font-size:14px;line-height:24px">2–12 個字，可使用中文、英文與數字。</div></div>`,
      buttons: [{ label: '取消', kind: 'btn-line', value: false }, { label: '確認', kind: 'btn', value: true }],
      validate: m => {
        const n = m.querySelector('#nn').value.trim();
        if (n.length < 2 || !/^[\p{Script=Han}A-Za-z0-9]+$/u.test(n)) return { error: '名字需要 2–12 個中文、英文或數字' };
        return { name: n };
      },
    });
    if (r && r.name) { d.player.name = r.name; save(); go('profile'); }
  });
}
