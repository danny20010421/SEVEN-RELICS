import { sfx } from './audio.js';
import { get } from './store.js';

export const IMG = n => `assets/img/${n}`;
export const fmt = n => Number(n).toLocaleString('en-US');
export const wait = ms => new Promise(r => setTimeout(r, ms));
export const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function html(str) {
  const t = document.createElement('template');
  t.innerHTML = str.trim();
  return t.content.firstElementChild;
}
export const $ = (root, sel) => root.querySelector(sel);
export const $$ = (root, sel) => [...root.querySelectorAll(sel)];

export function stage() { return document.getElementById('stage'); }

export const ICON = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="#f1e8e2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg>',
  close: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f1e8e2" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>',
  plus: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="#d8b594" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>',
  chev: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d8b594" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink:0"><path d="M9 5l7 7-7 7"></path></svg>',
  lock: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="#9c8c83" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="1"></rect><path d="M8 11V8a4 4 0 0 1 8 0v3"></path></svg>',
  check: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="#d8b594" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="#d8b594" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 10a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6zM10 20a2 2 0 0 0 4 0"></path></svg>',
  headset: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="#d8b594" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 14v-2a8 8 0 0 1 16 0v2"></path><rect x="3" y="14" width="4" height="6" rx="1"></rect><rect x="17" y="14" width="4" height="6" rx="1"></rect></svg>',
  folder: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="#d8b594" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>',
  info: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="#d8b594" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 11v6M12 7.5v.5"></path></svg>',
  book: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="#d8b594" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z"></path></svg>',
  share: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="#d8b594" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="12" r="2.5"></circle><circle cx="18" cy="6" r="2.5"></circle><circle cx="18" cy="18" r="2.5"></circle><path d="M8.2 10.9l7.6-3.8M8.2 13.1l7.6 3.8"></path></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="#d8b594" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"></circle><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"></path></svg>',
  voice: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d8b594" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"></path></svg>',
  down: '<svg class="next" viewBox="0 0 24 24" fill="none" stroke="#f1e8e2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 9l7 7 7-7"></path></svg>',
  empty: '<svg viewBox="0 0 24 24" fill="none" stroke="#6b4a40" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>',
};

export function currency() {
  const d = get();
  return `<button type="button" class="pill" data-go="shop" aria-label="遊戲幣 ${fmt(d.coins)}，前往商城"><img src="${IMG('coin.webp')}" alt=""><span class="num" style="min-width:64px">${fmt(d.coins)}</span>${ICON.plus}</button>
<button type="button" class="pill" data-go="topup" aria-label="鑽石 ${fmt(d.diamonds)}，前往儲值"><img src="${IMG('diamond.webp')}" alt=""><span class="num">${fmt(d.diamonds)}</span>${ICON.plus}</button>`;
}

// 內頁外框：返回、標題、分頁、貨幣
export function shell(title, tabsHtml = '', back = 'lobby') {
  return `<div class="scr fade-in">
<img class="bg" src="${IMG('wild.webp')}" alt="" style="opacity:0.16">
<div class="topbar">
  <div class="left"><button type="button" class="iconbtn" data-go="${back}" aria-label="返回">${ICON.back}</button><h1>${title}</h1>${tabsHtml}</div>
  <div class="right">${currency()}</div>
</div>
<div class="body"></div>
</div>`;
}
export function tabs(names, on = 0, cls = 'tab') {
  return `<div class="${cls === 'tab' ? 'tabs' : 'vtabs'}" role="tablist">${names.map((n, i) => `<button type="button" role="tab" class="${cls}${i === on ? ' on' : ''}" aria-selected="${i === on}" data-tab="${i}">${n}</button>`).join('')}</div>`;
}

let toastTimer = null;
export function toast(text, ms = 2200) {
  const st = stage();
  let w = st.querySelector('.toast-wrap');
  if (w) w.remove();
  w = html(`<div class="toast-wrap"><div class="toast" role="status">${text}</div></div>`);
  st.appendChild(w);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => w.remove(), ms);
}

// 對話框：buttons = [{ label, kind: 'btn'|'btn-line', value }]
export function modal({ title = '', body = '', bodyHtml = '', scroll = '', buttons = [{ label: '確定', kind: 'btn', value: true }], closable = true, width = 560, validate = null }) {
  return new Promise(resolve => {
    const st = stage();
    const el = html(`<div class="modal-back"><div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title || '訊息')}" style="width:${width}px">
${title ? `<h2>${title}</h2>` : ''}
${body ? `<p>${body}</p>` : ''}
${bodyHtml}
${scroll ? `<div class="scroll">${scroll}</div>` : ''}
<div class="actions">${buttons.map((b, i) => `<button type="button" class="${b.kind || 'btn'}" style="width:208px" data-i="${i}">${b.label}</button>`).join('')}</div>
${closable ? `<button type="button" class="x" aria-label="關閉">${ICON.close}</button>` : ''}
</div></div>`);
    const done = v => { el.remove(); resolve(v); };
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-i]');
      if (b) {
        sfx('tap');
        const v = buttons[+b.dataset.i].value;
        if (v && validate) { const r = validate(el); if (r && r.error) { toast(r.error); return; } done(r); return; }
        done(v);
      }
      else if (e.target.closest('.x')) { sfx('tap'); done(null); }
    });
    st.appendChild(el);
    const first = el.querySelector('[data-i]'); if (first) first.focus({ preventScroll: true });
  });
}
export const alertBox = (title, body) => modal({ title, body, buttons: [{ label: '確定', kind: 'btn', value: true }] });

export function rewardModal(title, list) {
  sfx('coin');
  return modal({
    title,
    bodyHtml: `<div class="reward-row">${list.map(r => `<div class="reward"><img src="${IMG(r.img)}" alt="${r.name}"><span>×${fmt(r.n)}</span></div>`).join('')}</div>`,
    buttons: [{ label: '收下', kind: 'btn', value: true }],
    closable: false,
  });
}

// ---------- 對話半身像：所有角色統一「頭頂到腰」同樣大小 ----------
// [頭頂 y, 腰 y, 圖寬, 圖高]（原圖像素）
const BUST = {
  'N01-CHAR-012': [50, 380, 600, 1120],
  'N01-CHAR-013': [52, 425, 600, 1120],
  'N01-CHAR-014': [55, 470, 600, 1120],
  'N02-CHAR-015': [8, 640, 867, 1815],
};
const BUST_HEAD = 88, BUST_WAIST = 560; // 舞台上頭頂、腰的位置
export function bustImg(file, side = 'left') {
  const [top, waist, w, h] = BUST[file] || [50, 420, 600, 1120];
  const k = (BUST_WAIST - BUST_HEAD) / (waist - top);
  const iw = Math.round(w * k), ih = Math.round(h * k), cx = side === 'left' ? 256 : 900;
  return `<div class="bust ${side}" aria-hidden="true" style="height:${BUST_WAIST + 24}px"><img src="${IMG(file + '.webp')}" alt="" style="left:${Math.round(cx - iw / 2)}px;top:${Math.round(BUST_HEAD - top * k)}px;width:${iw}px;height:${ih}px"></div>`;
}
