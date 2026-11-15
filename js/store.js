// 本機存檔（之後換成帳號雲端存檔時，只需替換 load / save）
const KEY = 'mibao.save.v1';

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const yesterday = () => {
  const d = new Date(); d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const fresh = () => ({
  agreed: false,
  account: null,               // { email, provider }
  player: null,                // { name, gender: 'm'|'f', id }
  coins: 0,
  diamonds: 0,
  topup: 0,                    // 累計儲值鑽石
  items: { timer: 0, compass: 0, memo: 0 },
  memoBought: '',              // 調查備忘錄每日限購 1 個
  signin: { last: '', streak: 0, idx: 0 },
  daily: { date: '', points: 0, done: {}, claimed: false },
  mainTries: { date: '', used: 0, extra: 0 },
  prologueDone: false,
  tourDone: false,
  rewardGiven: false,
  clues: [],
  records: [],
  settings: { bgm: 0.6, sfx: 0.8, quality: 'mid', vibrate: true },
});

let data = null;

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    data = raw ? Object.assign(fresh(), JSON.parse(raw)) : fresh();
  } catch (e) {
    data = fresh();
  }
  rollDaily();
  return data;
}
export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* 私密瀏覽等情況：只保留在記憶體 */ }
}
export function get() { return data || load(); }
export function reset() {
  const keepAgreed = data && data.agreed;
  data = fresh(); data.agreed = keepAgreed; save();
}

function rollDaily() {
  const t = today();
  if (data.daily.date !== t) data.daily = { date: t, points: 0, done: {}, claimed: false };
  if (data.mainTries.date !== t) data.mainTries = { date: t, used: 0, extra: 0 };
}

// 每日任務：滿 100 積分送 1 顆鑽石
export const TASKS = [
  { id: 'signin', name: '完成每日簽到', pts: 40 },
  { id: 'shop', name: '造訪商城', pts: 20 },
  { id: 'stage', name: '完成任一關卡', pts: 40 },
];
export function taskDone(id) {
  rollDaily();
  const t = TASKS.find(x => x.id === id);
  if (!t || data.daily.done[id]) return false;
  data.daily.done[id] = true;
  data.daily.points = Math.min(100, data.daily.points + t.pts);
  save();
  return true;
}
export function claimDaily() {
  if (data.daily.points >= 100 && !data.daily.claimed) {
    data.daily.claimed = true; data.diamonds += 1; save(); return true;
  }
  return false;
}

// 每日簽到：7 天一輪
export const SIGNIN = [
  { coins: 100, timer: 1 }, { coins: 100, timer: 1 }, { coins: 150, timer: 2 }, { coins: 150, timer: 1 },
  { coins: 200, timer: 2 }, { coins: 200, timer: 2 }, { coins: 500, timer: 3 },
];
export const STREAK = [{ days: 7, coins: 500 }, { days: 14, coins: 1000 }, { days: 30, coins: 2000 }];
export function canSignin() { return data.signin.last !== today(); }
export function doSignin() {
  if (!canSignin()) return null;
  const s = data.signin;
  s.streak = s.last === yesterday() ? s.streak + 1 : 1;
  const reward = { ...SIGNIN[s.idx % 7] };
  s.idx = (s.idx + 1) % 7;
  s.last = today();
  data.coins += reward.coins; data.items.timer += reward.timer;
  const bonus = STREAK.find(x => x.days === s.streak);
  if (bonus) { data.coins += bonus.coins; reward.bonus = bonus.coins; }
  save();
  taskDone('signin');
  return reward;
}

export const VIP = [0, 1000, 5000, 10000, 50000, 100000, 1000000];
export function vipLevel() {
  let lv = 0;
  VIP.forEach((v, i) => { if (i > 0 && data.topup >= v) lv = i; });
  return lv;
}

export const SHOP = [
  { id: 'timer', name: '加時器', price: 1500, desc: '主線任務延長 3 分鐘。', chips: ['同一關卡限用 3 次'] },
  { id: 'compass', name: '解析盤', price: 3000, desc: '協助縮小密碼謎題的範圍，例如揭露四位數密碼中一位數的數字或位置。', chips: ['同一關卡限用 2 次'] },
  { id: 'memo', name: '調查備忘錄', price: 10000, desc: '自動整理已發現的相關線索，交叉比對證據時使用。', chips: ['每關限用 1 次，效果持續整關', '每日限購 1 個'] },
];
export function buy(id) {
  const p = SHOP.find(x => x.id === id);
  if (!p) return 'none';
  if (id === 'memo' && data.memoBought === today()) return 'limit';
  if (data.coins < p.price) return 'coins';
  data.coins -= p.price; data.items[id] += 1;
  if (id === 'memo') data.memoBought = today();
  save();
  return 'ok';
}

export function triesLeft() {
  rollDaily();
  return Math.max(0, 2 + data.mainTries.extra - data.mainTries.used);
}
