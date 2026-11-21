import { load, get } from './store.js';
import { unlock, sfx } from './audio.js';
import { stage } from './ui.js';
import * as front from './front.js';
import * as prologue from './prologue.js';
import * as g01 from './g01.js';
import * as n01 from './n01.js';
import * as n02 from './n02.js';
import * as lobby from './lobby.js';
import * as pages from './pages.js';

const SCREENS = {
  terms: front.terms, loading: front.loading, login: front.login, name: front.name,
  prologue: prologue.render,
  g01: g01.render,
  n01: n01.render,
  n02: n02.render,
  lobby: lobby.render,
  stages: pages.stages, shop: pages.shop, bag: pages.bag, signin: pages.signin, vip: pages.vip,
  settings: pages.settings, events: pages.events, files: pages.files, notice: pages.notice,
  profile: pages.profile, topup: pages.topup,
};

let cleanup = null;
let current = null;
export function go(name, params = {}) {
  if (!SCREENS[name]) return;
  if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
  const st = stage();
  st.innerHTML = '';
  current = name;
  const r = SCREENS[name](st, params, go);
  if (typeof r === 'function') cleanup = r;
}
export const currentScreen = () => current;

// 依螢幕縮放 1280×720 的舞台
function fit() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const s = Math.min(vw / 1280, vh / 720);
  document.documentElement.style.setProperty('--s', s);
  const portrait = vh > vw;
  const touch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  document.getElementById('rotate').hidden = !(portrait && touch);
}
window.addEventListener('resize', fit);
window.addEventListener('orientationchange', () => setTimeout(fit, 200));
if (window.visualViewport) window.visualViewport.addEventListener('resize', fit);
fit();

// 首次互動時啟用音訊（瀏覽器規定）
const firstGesture = () => { unlock(); };
window.addEventListener('pointerdown', firstGesture, { passive: true });
window.addEventListener('keydown', firstGesture);

// 全域導覽按鈕：data-go="畫面名稱"
stage().addEventListener('click', e => {
  const b = e.target.closest('[data-go]');
  if (!b || b.disabled) return;
  e.preventDefault();
  sfx('tap');
  go(b.dataset.go);
});

// 電腦鍵盤：Esc 返回大廳
window.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const back = stage().querySelector('.modal-back .x');
  if (back) { back.click(); return; }
  const top = stage().querySelector('.topbar [data-go]');
  if (top) top.click();
});

// 防止雙指縮放與長按選單
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('contextmenu', e => e.preventDefault());

load();
const d = get();
window.__mibao = { go, get };
go(d.agreed ? 'loading' : 'terms');
