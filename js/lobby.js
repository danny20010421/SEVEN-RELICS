import { get, save, vipLevel, claimDaily, canSignin, triesLeft } from './store.js';
import { sfx, bgm } from './audio.js';
import { html, $, IMG, ICON, fmt, esc, currency, rewardModal, toast, stage } from './ui.js';

const TITLE = '無名的探尋者';

export function render(st, params, go) {
  const d = get();
  bgm('lobby');
  const g = (d.player && d.player.gender) || 'm';
  const dl = d.daily;
  const el = html(`<div class="scr fade-in">
<img class="bg" src="${IMG('wild.webp')}" alt="">
<div class="fill" style="background:linear-gradient(90deg,rgba(10,6,7,0.3) 0%,rgba(10,6,7,0.1) 30%,rgba(10,6,7,0.86) 52%,rgba(10,6,7,0.94) 100%)"></div>
<div class="abs" style="left:0;top:0;width:1280px;height:176px;background:linear-gradient(180deg,rgba(10,6,7,0.88),rgba(10,6,7,0))"></div>
<img src="${IMG(`hero-${g}.webp`)}" alt="主角" style="position:absolute;left:200px;top:120px;width:220px;height:592px;object-fit:contain;filter:drop-shadow(0 0 24px rgba(0,0,0,0.85))">

<div class="lob-top">
  <button type="button" class="player" data-go="profile" id="tPlayer" aria-label="玩家資訊">
    <span class="avatar"><img src="${IMG(`avatar-${g}.webp`)}" alt=""></span>
    <span class="info"><span class="name">${esc(d.player ? d.player.name : '玩家')}</span><span class="meta"><span class="chip-red">VIP ${vipLevel()}</span><span class="title">${TITLE}</span></span></span>
  </button>
  <div class="row" style="gap:12px">
    <div class="row" style="gap:12px" id="tCur">${currency()}</div>
    <button type="button" class="pill" data-go="files" id="tFiles" style="padding:0 16px;font-size:16px;font-weight:400">${ICON.folder}<span>調查檔案</span></button>
    <button type="button" class="iconbtn" data-go="notice" aria-label="公告與客服">${ICON.bell}</button>
  </div>
</div>

<div class="lob-right">
  <button type="button" class="card main-card" data-go="stages" id="tMain">
    <span class="head"><img src="${IMG('ic-world.webp')}" alt=""><span class="serif">主線關卡</span><span class="chip">每日限次</span></span>
    <span class="col" style="max-width:400px;gap:8px">
      <span style="font-size:20px;line-height:28px">第一章　******</span>
      <span class="bar gold"><i style="width:0%"></i></span>
      <span class="muted" style="font-size:14px;line-height:24px">已破解 0 / 9 節</span>
    </span>
    <span class="row" style="height:56px;gap:24px">
      <span class="btn" style="width:176px;font-size:20px">繼續調查</span>
      <span style="font-size:16px;line-height:56px">今日剩餘　<b>${triesLeft()} / 2</b></span>
    </span>
  </button>
  <button type="button" class="card gen-card" data-go="stages" data-tab="1" id="tGen">
    <span class="row" style="gap:16px"><span class="serif" style="font-size:24px;line-height:32px">一般關卡</span><span class="muted" style="font-size:14px;line-height:32px">分支任務 · 難度簡單，輕鬆體驗破解的快感</span></span>
    ${ICON.chev}
  </button>
  <nav class="func-row" aria-label="大廳功能" id="tFunc">
    ${[['events', 'ic-event', '活動中心'], ['shop', 'ic-shop', '商城'], ['bag', 'ic-bag', '背包'], ['signin', 'ic-signin', '每日簽到'], ['vip', 'ic-vip', 'VIP'], ['settings', 'ic-settings', '設定']]
      .map(([k, ic, n]) => `<button type="button" class="card func" data-go="${k}"><img src="${IMG(ic + '.webp')}" alt=""><span>${n}</span>${k === 'signin' && canSignin() ? '<i class="dot" aria-label="今日尚未簽到"></i>' : ''}</button>`).join('')}
  </nav>
  <div class="two">
    <button type="button" class="card daily" id="tDaily">
      <span class="row" style="height:24px;justify-content:space-between"><b style="font-size:16px;line-height:24px">每日任務</b><b style="font-size:16px;line-height:24px">${dl.points} / 100 積分</b></span>
      <span class="bar"><i style="width:${dl.points}%"></i></span>
      <span class="row" style="height:32px;gap:8px;font-size:14px;color:var(--text-2)"><span>${dl.claimed ? '今日鑽石已領取' : dl.points >= 100 ? '點一下領取' : '積分滿 100 贈送'}</span><img src="${IMG('diamond.webp')}" alt="鑽石" style="width:24px;height:24px"><b style="color:var(--text)">×1</b></span>
    </button>
    <button type="button" class="card banner" data-go="events">
      <img class="b" src="${IMG('load1.webp')}" alt="">
      <span class="sh"></span>
      <span class="chip-red" style="position:absolute;left:16px;top:16px">活動展示</span>
      <span class="col" style="position:absolute;left:16px;right:16px;bottom:16px;gap:4px"><span class="serif" style="font-size:24px;line-height:32px">限時探索</span><span style="font-size:14px;line-height:24px;color:var(--text-2)">即將開放</span></span>
    </button>
  </div>
</div>
</div>`);
  st.appendChild(el);
  const gen = $(el, '#tGen');
  gen.addEventListener('click', e => { e.stopPropagation(); sfx('tap'); go('stages', { tab: 1 }); }, true);
  $(el, '#tDaily').addEventListener('click', async () => {
    sfx('tap');
    if (claimDaily()) { await rewardModal('每日任務完成', [{ img: 'diamond.webp', name: '鑽石', n: 1 }]); go('lobby'); }
    else if (get().daily.claimed) toast('今日的每日任務獎勵已領取');
    else {
      const t = get().daily.done;
      toast(`每日任務：簽到 40　造訪商城 20　完成任一關卡 40（已完成 ${Object.keys(t).length} / 3）`, 3200);
    }
  });

  if (!d.tourDone) setTimeout(() => runTour(el, go), params.fromPrologue ? 900 : 300);
}

const STEPS = [
  { id: 'tPlayer', text: '這是你的玩家資訊：頭像、名字、VIP 等級與稱呼。點一下可以查看探索進度與成就。' },
  { id: 'tCur', text: '遊戲幣用來購買道具，從每日簽到、破關與 VIP 取得；鑽石可購買額外挑戰次數與月卡，從儲值與每日任務取得。' },
  { id: 'tMain', text: '這裡是主線關卡。共 12 章劇情，每章 9 節環環相扣、限時破解，每天可挑戰 2 次。' },
  { id: 'tGen', text: '一般關卡是分支任務，難度較簡單、不限時，可以輕鬆體驗破解的快感。' },
  { id: 'tFunc', text: '這一排是活動中心、商城、背包、每日簽到、VIP 與設定。記得每天簽到領取遊戲幣與加時器。' },
  { id: 'tDaily', text: '完成每日任務累積積分，滿 100 積分就能領取 1 顆鑽石。' },
  { id: 'tFiles', text: '調查檔案會記錄劇情、人物關係、組織情報與證據，幫助你拼湊真相。' },
  { id: null, text: '導覽結束。這是送給你的新手禮物，祝你早日找回自己是誰。' },
];

async function runTour(el, go) {
  const st = stage();
  const s = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--s')) || 1;
  const catchEl = html('<div class="tour-catch"></div>');
  const hole = html('<div class="tour-hole"></div>');
  el.append(catchEl, hole);
  let i = 0;
  const show = () => new Promise(res => {
    const step = STEPS[i];
    const old = el.querySelector('.tour-tip'); if (old) old.remove();
    let tipLeft = 440, tipTop = 248;
    if (step.id) {
      const sr = st.getBoundingClientRect(), r = el.querySelector('#' + step.id).getBoundingClientRect();
      const x = (r.left - sr.left) / s, y = (r.top - sr.top) / s, w = r.width / s, h = r.height / s;
      Object.assign(hole.style, { left: x - 8 + 'px', top: y - 8 + 'px', width: w + 16 + 'px', height: h + 16 + 'px', opacity: 1 });
      // 提示框放在目標旁邊的空位
      if (x > 600) { tipLeft = Math.max(24, x - 432); tipTop = Math.min(720 - 264, Math.max(24, y)); }
      else { tipLeft = Math.min(1280 - 424, x + w + 32); tipTop = Math.min(720 - 264, Math.max(24, y + h + 24)); if (y < 120) { tipLeft = Math.max(24, x); tipTop = y + h + 32; } }
    } else {
      Object.assign(hole.style, { left: '640px', top: '360px', width: '0px', height: '0px' });
    }
    const tip = html(`<div class="tip tour-tip" style="left:${tipLeft}px;top:${tipTop}px"><div class="label">大廳導覽</div><p>${step.text}</p><div class="foot"><span>${i + 1} / ${STEPS.length}</span><div class="row" style="gap:8px">${step.id ? '<button type="button" class="btn-ghost" data-skip>略過</button>' : ''}<button type="button" class="btn sm" style="width:120px" data-next>${step.id ? '下一步' : '領取禮物'}</button></div></div></div>`);
    tip.addEventListener('click', e => {
      if (e.target.closest('[data-next]')) { sfx('tap'); res('next'); }
      if (e.target.closest('[data-skip]')) { sfx('tap'); res('skip'); }
    });
    el.appendChild(tip);
  });
  while (i < STEPS.length) {
    const r = await show();
    if (r === 'skip') i = STEPS.length - 1; else i++;
  }
  el.querySelector('.tour-tip').remove(); hole.remove(); catchEl.remove();
  const d = get();
  d.tourDone = true;
  if (!d.rewardGiven) {
    d.rewardGiven = true; d.coins += 500; d.items.timer += 2; save();
    await rewardModal('新手禮物', [{ img: 'coin.webp', name: '遊戲幣', n: 500 }, { img: 'it-timer.webp', name: '加時器', n: 2 }]);
  } else save();
  go('lobby');
}
