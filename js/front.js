import { get, save } from './store.js';
import { sfx, unlock, bgm } from './audio.js';
import { html, $, $$, IMG, ICON, modal, alertBox, toast, wait, esc } from './ui.js';

const WORDMARK = (w, h) => `<img src="${IMG('wordmark.webp')}" alt="秘寶真相" style="width:${w}px;height:${h}px;display:block">`;

const TERMS_TEXT = `<p style="margin:0 0 16px"><b>使用者條款與隱私權政策（搶先體驗版）</b></p>
<p style="margin:0 0 16px">本遊戲由千輝創意有限公司（以下稱本公司）營運。正式條款內容將於正式上線前公告於本頁，屆時將以公告內容為準。</p>
<p style="margin:0 0 16px">一、帳號與資料：搶先體驗期間，您的遊戲進度僅儲存於目前使用的裝置與瀏覽器中，清除瀏覽器資料將一併清除進度。</p>
<p style="margin:0 0 16px">二、虛擬貨幣與道具：遊戲幣、鑽石與道具僅限於本遊戲內使用，不得兌換現金。儲值功能尚未開放。</p>
<p style="margin:0 0 16px">三、機率型商品：如日後提供抽道具等機率型商品，本公司將公開各項商品的取得機率。</p>
<p style="margin:0">四、隱私權：本公司僅在提供遊戲服務所需範圍內處理您的資料，詳細內容以正式公告為準。</p>`;

export function terms(st, p, go) {
  const el = html(`<div class="scr fade-in">
<img class="bg" src="${IMG('load1.webp')}" alt="" style="opacity:0.32;filter:blur(4px)">
<div class="fill" style="background:rgba(10,6,7,0.62)"></div>
<div class="fill center">
<div class="terms-box" role="dialog" aria-label="使用者條款">
  <div class="terms-head">
    ${WORDMARK(169, 56)}
    <div class="col" style="align-items:flex-end;gap:4px"><div style="font-size:16px;font-weight:700;letter-spacing:0.08em;line-height:24px">使用者條款</div><div class="muted" style="font-size:14px;line-height:24px">首次啟動時顯示</div></div>
  </div>
  <div class="stripe"></div>
  <div class="terms-body">
    <p>在您使用千輝創意有限公司的服務前，請務必審慎閱讀並充分了解 <button type="button" class="link" data-doc>《使用者條款》</button> 與 <button type="button" class="link" data-doc>《隱私權政策》</button> 中的各項條款以及自身權益。</p>
    <p>如您已詳細閱讀並同意，請點擊「同意」開始遊戲；如您拒絕，將無法進入遊戲。</p>
  </div>
  <div class="center" style="height:80px"><label class="check"><input id="agree" type="checkbox"><span>我已閱讀並同意《使用者條款》與《隱私權政策》</span></label></div>
  <div class="center" style="height:88px;padding-bottom:32px;gap:32px">
    <button type="button" class="btn-line serif-btn" id="no" style="width:240px;font-family:var(--serif);font-weight:900;font-size:24px;letter-spacing:0.24em;padding-left:0.24em">拒絕</button>
    <button type="button" class="btn" id="yes" style="width:240px;font-family:var(--serif);font-weight:900;font-size:24px;letter-spacing:0.24em;padding-left:0.24em" disabled>同意</button>
  </div>
</div>
</div>
</div>`);
  st.appendChild(el);
  const cb = $(el, '#agree'), yes = $(el, '#yes');
  cb.addEventListener('change', () => { yes.disabled = !cb.checked; sfx('tap'); });
  $$(el, '[data-doc]').forEach(b => b.addEventListener('click', () => { sfx('tap'); modal({ title: '使用者條款與隱私權政策', scroll: TERMS_TEXT, width: 720, buttons: [{ label: '我知道了', kind: 'btn', value: true }] }); }));
  $(el, '#no').addEventListener('click', () => { sfx('tap'); alertBox('無法進入遊戲', '您必須同意使用者條款與隱私權政策，才能開始遊戲。'); });
  yes.addEventListener('click', () => {
    unlock(); sfx('tap');
    const d = get(); d.agreed = true; save();
    go('loading');
  });
}

// 開場需要的素材；章節素材之後依需求載入
export const PRELOAD = ['wordmark.webp', 'load1.webp', 'load2.webp', 'wild.webp', 'hero-m.webp', 'hero-f.webp', 'avatar-m.webp', 'avatar-f.webp',
  'coin.webp', 'diamond.webp', 'ic-world.webp', 'ic-event.webp', 'ic-shop.webp', 'ic-bag.webp', 'ic-signin.webp', 'ic-vip.webp', 'ic-settings.webp',
  'it-timer.webp', 'it-compass.webp', 'it-memo.webp', 'it-crowbar.webp',
  'n00-s01.webp', 'n00-crowbar-floor.webp', 'n00-marquee.webp', 'n00-keypad.webp', 'n00-box.webp', 'n00-box-open.webp', 'n00-corridor.webp', 'n00-memory.webp', 'hero-m-pain.webp', 'hero-f-pain.webp'];

export function loading(st, p, go) {
  const el = html(`<div class="scr">
<img class="bg load-slide on" src="${IMG('load1.webp')}" alt="">
<img class="bg load-slide" src="${IMG('load2.webp')}" alt="">
<div class="load-shade"></div>
<div class="abs" style="left:48px;top:24px;height:64px;display:flex;align-items:center">${WORDMARK(194, 64)}</div>
<div class="abs col" style="left:48px;right:48px;bottom:40px;gap:24px">
  <div class="row" style="justify-content:flex-end;height:32px"><div class="dots" aria-hidden="true"><i class="on"></i><i></i></div></div>
  <div class="col" style="gap:8px">
    <div class="row" style="height:32px;justify-content:space-between"><div style="font-size:16px;line-height:32px;color:var(--text-2)">下載遊戲資源中</div><div id="pct" style="font-family:var(--cinzel);font-weight:700;font-size:24px;line-height:32px">0%</div></div>
    <div class="bar" role="progressbar" aria-label="資源下載進度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i id="fill" style="width:0%;box-shadow:0 0 16px rgba(229,38,58,0.8);transition:width 0.3s"></i></div>
  </div>
</div>
</div>`);
  st.appendChild(el);
  const slides = $$(el, '.load-slide'), dots = $$(el, '.dots i');
  let k = 0;
  const car = setInterval(() => { k = 1 - k; slides.forEach((s, i) => s.classList.toggle('on', i === k)); dots.forEach((s, i) => s.classList.toggle('on', i === k)); }, 2600);
  // 至少停留到兩張輪播圖都看過一輪；進度條依「實際下載」與「最短時間」兩者較慢的那個前進
  const MIN_MS = 4800, t0 = performance.now();
  let done = 0, shown = 0, alive = true;
  const total = PRELOAD.length;
  const set = v => { $(el, '#pct').textContent = v + '%'; $(el, '#fill').style.width = v + '%'; $(el, '[role=progressbar]').setAttribute('aria-valuenow', v); };
  const tick = setInterval(() => {
    const target = Math.round(Math.min(done / total, (performance.now() - t0) / MIN_MS) * 100);
    if (shown < target) { shown = Math.min(target, shown + 2); set(shown); }
    if (shown >= 100) {
      clearInterval(tick); clearInterval(car);
      setTimeout(() => {
        if (!alive) return;
        const d = get();
        if (!d.account) go('login');
        else if (!d.player) go('name');
        else if (!d.prologueDone) go('prologue');
        else go('lobby');
      }, 700);
    }
  }, 40);
  PRELOAD.forEach(n => {
    const im = new Image();
    im.onload = im.onerror = () => { done++; };
    im.src = IMG(n);
  });
  // 字型也一併等候（最多 3 秒）
  return () => { alive = false; clearInterval(car); clearInterval(tick); };
}

export function login(st, p, go) {
  bgm('login');
  const el = html(`<div class="scr fade-in">
<img class="bg" src="${IMG('wild.webp')}" alt="">
<div class="fill" style="background:linear-gradient(90deg,rgba(10,6,7,0.9) 0%,rgba(10,6,7,0.5) 40%,rgba(10,6,7,0.4) 60%,rgba(10,6,7,0.92) 100%)"></div>
<div class="abs col" style="left:64px;top:64px;width:560px;gap:16px">
  <div class="row" style="height:56px"><div style="font-family:var(--cinzel);font-size:14px;letter-spacing:0.24em;color:var(--gold-2)">******</div></div>
  <h1 style="margin:0;height:160px">${WORDMARK(484, 160)}</h1>
  <div style="font-size:18px;line-height:32px;letter-spacing:0.16em;color:var(--gold-2)">******</div>
  <div style="width:64px;height:2px;margin:8px 0;background:var(--glow)"></div>
  <p style="margin:0;max-width:480px;font-family:var(--serif);font-weight:600;font-size:20px;line-height:36px">******</p>
</div>
<div class="abs row" style="left:64px;bottom:48px;gap:16px">
  <button type="button" class="lbtn" data-info="intro">${ICON.info}<span>遊戲介紹</span></button>
  <button type="button" class="lbtn" data-info="story">${ICON.book}<span>故事背景</span></button>
  <button type="button" class="lbtn" data-info="service">${ICON.headset}<span>客服中心</span></button>
  <button type="button" class="lbtn" data-info="share">${ICON.share}<span>分享遊戲</span></button>
</div>
<div class="abs row" style="right:64px;top:0;width:400px;height:720px">
<form class="login-box" novalidate>
  <div class="col" style="gap:8px"><h2 class="serif" style="margin:0;font-size:24px;line-height:32px">帳號登入</h2><div class="muted" style="font-size:14px;line-height:24px">搶先體驗期間，進度儲存在這台裝置上。</div></div>
  <div class="col" style="gap:16px">
    <div class="col" style="gap:8px"><label for="acct" style="font-size:14px;line-height:24px;color:var(--gold-2)">帳號</label><input id="acct" class="field" type="email" autocomplete="email" placeholder="電子信箱" style="height:48px;font-size:16px"></div>
    <div class="col" style="gap:8px"><label for="pwd" style="font-size:14px;line-height:24px;color:var(--gold-2)">密碼</label><input id="pwd" class="field" type="password" autocomplete="current-password" placeholder="至少 6 個字元" style="height:48px;font-size:16px"></div>
    <div class="err" id="err" role="alert"></div>
  </div>
  <button type="submit" class="btn serif-btn">登入遊戲</button>
  <div class="col" style="gap:16px">
    <div class="sep"><i></i><span>或使用其他方式登入</span><i></i></div>
    <div class="row" style="gap:16px;height:48px"><button type="button" class="lbtn" data-soon style="flex:1">Google 登入</button><button type="button" class="lbtn" data-soon style="flex:1">LINE 登入</button></div>
  </div>
</form>
</div>
</div>`);
  st.appendChild(el);
  const form = $(el, 'form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = $(el, '#acct').value.trim(), pwd = $(el, '#pwd').value;
    const err = $(el, '#err');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = '請輸入正確的電子信箱。'; sfx('error'); return; }
    if (pwd.length < 6) { err.textContent = '密碼至少需要 6 個字元。'; sfx('error'); return; }
    unlock(); sfx('tap');
    const d = get(); d.account = { email, provider: 'email' }; save();
    go(d.player ? (d.prologueDone ? 'lobby' : 'prologue') : 'name');
  });
  $$(el, '[data-soon]').forEach(b => b.addEventListener('click', () => { sfx('tap'); toast(`${b.textContent.replace(' 登入', '')} 登入即將開放`); }));
  $$(el, '[data-info]').forEach(b => b.addEventListener('click', async () => {
    sfx('tap');
    const k = b.dataset.info;
    if (k === 'intro') modal({ title: '遊戲介紹', body: '******', buttons: [{ label: '關閉', kind: 'btn', value: true }] });
    if (k === 'story') modal({ title: '故事背景', body: '******', buttons: [{ label: '關閉', kind: 'btn', value: true }] });
    if (k === 'service') modal({ title: '客服中心', body: '客服管道將於正式上線前公布。', buttons: [{ label: '關閉', kind: 'btn', value: true }] });
    if (k === 'share') {
      const url = location.href.split('#')[0];
      try {
        if (navigator.share) await navigator.share({ title: '秘寶真相 SEVEN RELICS', text: '一起來解開《秘寶真相 SEVEN RELICS》的謎團！', url });
        else { await navigator.clipboard.writeText(url); toast('遊戲連結已複製'); }
      } catch (e) { /* 使用者取消分享 */ }
    }
  }));
}

export function name(st, p, go) {
  const d = get();
  let pick = (d.player && d.player.gender) || 'm';
  const el = html(`<div class="scr fade-in">
<div class="abs row" style="left:64px;top:64px;gap:24px">
  <button type="button" class="pick" data-g="m" aria-label="選擇男主角"><span class="glow"></span><span class="art"><img src="${IMG('hero-m.webp')}" alt=""></span><span class="lab">男主角</span></button>
  <button type="button" class="pick" data-g="f" aria-label="選擇女主角"><span class="glow"></span><span class="art"><img src="${IMG('hero-f.webp')}" alt=""></span><span class="lab">女主角</span></button>
</div>
<div class="abs row" style="left:728px;top:0;width:488px;height:720px">
<form class="col" style="width:488px;gap:32px" novalidate>
  <div class="col" style="gap:8px">
    <div class="label">初始設定</div>
    <h1 class="serif" style="margin:0;font-size:48px;line-height:64px">選擇主角</h1>
    <p style="margin:0;font-size:18px;line-height:32px;color:var(--text-2)">選擇男主角或女主角，兩者的劇情完全相同。</p>
  </div>
  <div class="col" style="gap:8px">
    <label for="pname" style="font-size:14px;line-height:24px;color:var(--gold-2)">玩家名稱</label>
    <input id="pname" class="field" type="text" maxlength="12" autocomplete="off" placeholder="輸入名字" style="font-size:20px">
    <div class="err" id="err" role="alert"></div>
    <div class="muted" style="font-size:14px;line-height:24px">2–12 個字，可使用中文、英文與數字。</div>
  </div>
  <button type="submit" class="btn serif-btn" style="width:240px">確認</button>
</form>
</div>
</div>`);
  st.appendChild(el);
  const paint = () => $$(el, '.pick').forEach(b => { const on = b.dataset.g === pick; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  paint();
  $$(el, '.pick').forEach(b => b.addEventListener('click', () => { pick = b.dataset.g; sfx('tap'); paint(); }));
  $(el, 'form').addEventListener('submit', e => {
    e.preventDefault();
    const n = $(el, '#pname').value.trim();
    const err = $(el, '#err');
    if (n.length < 2 || n.length > 12) { err.textContent = '名字需要 2–12 個字。'; sfx('error'); return; }
    if (!/^[\p{Script=Han}A-Za-z0-9]+$/u.test(n)) { err.textContent = '名字只能使用中文、英文與數字。'; sfx('error'); return; }
    sfx('tap');
    d.player = { name: n, gender: pick, id: String(Math.floor(10000000 + Math.random() * 89999999)) };
    save();
    go('prologue');
  });
}
