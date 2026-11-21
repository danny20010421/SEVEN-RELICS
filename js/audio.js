// 音效與背景音樂：音效以 Web Audio 即時合成，不需另外下載檔案。
// 若 assets/audio/ 內放了授權完成的音樂檔（例如 bgm-n00.mp3），會優先播放該檔案。
import { get } from './store.js';

let ctx = null, master = null, sfxBus = null, bgmBus = null;
let drone = null, bgmEl = null, currentBgm = null;

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain(); master.connect(ctx.destination);
  sfxBus = ctx.createGain(); sfxBus.connect(master);
  bgmBus = ctx.createGain(); bgmBus.connect(master);
  applyVolume();
  return ctx;
}
export function unlock() {
  const c = ensure();
  if (c && c.state === 'suspended') c.resume();
  // 瀏覽器擋下自動播放時，等下一次點擊再播
  if (bgmEl && currentBgm && FILES[currentBgm] && bgmEl.paused) bgmEl.play().catch(() => {});
}
// 切回分頁或從背景回來時，繼續播放
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { if (bgmEl && !bgmEl.paused) bgmEl.pause(); return; }
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
  if (bgmEl && currentBgm && FILES[currentBgm] && bgmEl.paused) bgmEl.play().catch(() => {});
});
export function applyVolume() {
  const s = get().settings;
  if (sfxBus) sfxBus.gain.value = s.sfx;
  if (bgmBus) bgmBus.gain.value = s.bgm * 0.5;
  if (bgmEl) bgmEl.volume = s.bgm * 0.7;
}

function noiseBuf(sec = 1) {
  const b = ctx.createBuffer(1, ctx.sampleRate * sec, ctx.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}
function env(g, t, a, peak, dcy) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + dcy);
}
function tone(freq, dur, type = 'sine', peak = 0.3, when = 0, glideTo = null) {
  const t = ctx.currentTime + when;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
  env(g, t, 0.005, peak, dur);
  o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + dur + 0.05);
}
function noise(dur, filterType, freq, peak = 0.3, when = 0, q = 1, freqTo = null) {
  const t = ctx.currentTime + when;
  const s = ctx.createBufferSource(); s.buffer = noiseBuf(Math.max(0.2, dur + 0.1));
  const f = ctx.createBiquadFilter(); f.type = filterType; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
  if (freqTo) f.frequency.exponentialRampToValueAtTime(freqTo, t + dur);
  const g = ctx.createGain(); env(g, t, 0.01, peak, dur);
  s.connect(f); f.connect(g); g.connect(sfxBus); s.start(t); s.stop(t + dur + 0.1);
}

const SFX = {
  tap() { tone(1400, 0.05, 'triangle', 0.12); },
  pick() { tone(1800, 0.25, 'triangle', 0.18); tone(2700, 0.35, 'sine', 0.1, 0.03); noise(0.08, 'highpass', 3000, 0.15); },
  clang() { tone(180, 0.5, 'square', 0.12, 0, 90); tone(620, 0.6, 'triangle', 0.15); tone(930, 0.4, 'sine', 0.08); noise(0.25, 'bandpass', 1800, 0.3, 0, 2); },
  key() { tone(1046, 0.09, 'square', 0.08); },
  error() { tone(220, 0.18, 'sawtooth', 0.12); tone(196, 0.3, 'sawtooth', 0.12, 0.2); },
  unlock() { tone(660, 0.12, 'square', 0.08); tone(880, 0.12, 'square', 0.08, 0.12); tone(1320, 0.3, 'square', 0.08, 0.24); noise(0.12, 'highpass', 2000, 0.2, 0.4); },
  pry() { noise(0.6, 'bandpass', 700, 0.35, 0, 3, 1600); tone(140, 0.3, 'square', 0.1, 0.5, 70); noise(0.1, 'highpass', 2500, 0.3, 0.6); },
  door() { noise(2.2, 'bandpass', 160, 0.45, 0, 4, 380); tone(70, 2.2, 'sawtooth', 0.08, 0, 55); },
  whoosh() { noise(1.2, 'bandpass', 300, 0.3, 0, 1.5, 2400); },
  tinnitus() { tone(7800, 3.2, 'sine', 0.05); noise(3, 'lowpass', 400, 0.15, 0, 1, 120); },
  flash() { noise(1.6, 'highpass', 1200, 0.25, 0, 1, 8000); tone(5200, 1.8, 'sine', 0.04); },
  drip() { tone(1400, 0.06, 'sine', 0.05); tone(680, 0.18, 'sine', 0.03, 0.04, 320); noise(0.12, 'highpass', 2400, 0.05, 0.02); },
  coin() { tone(1568, 0.12, 'triangle', 0.12); tone(2093, 0.3, 'triangle', 0.12, 0.08); },
  hint() { tone(523, 0.2, 'sine', 0.1); tone(784, 0.35, 'sine', 0.1, 0.12); },
  ring2() { for (const d of [0, 0.9]) { for (let i = 0; i < 12; i++) { tone(i % 2 ? 1100 : 900, 0.04, 'square', 0.06, d + i * 0.05); } } },
  bell2() { tone(1760, 0.9, 'sine', 0.12); tone(3520, 0.5, 'sine', 0.04); tone(1760, 0.9, 'sine', 0.12, 0.32); tone(3520, 0.5, 'sine', 0.04, 0.32); },
  hum() { tone(98, 1.4, 'sawtooth', 0.06); tone(196, 1.4, 'triangle', 0.04); noise(1.2, 'lowpass', 300, 0.12); },
  snap() { noise(0.05, 'highpass', 2500, 0.35); tone(420, 0.06, 'square', 0.08); },
  step() { for (const d of [0, 0.45, 0.9]) noise(0.12, 'lowpass', 220, 0.4, d, 2); },
  bike() { tone(90, 1.2, 'sawtooth', 0.08, 0, 40); noise(1.0, 'lowpass', 300, 0.2, 0, 2, 80); },
  dial() { noise(0.03, 'highpass', 3200, 0.25); tone(2400, 0.02, 'square', 0.05); },
  latch() { noise(0.08, 'bandpass', 1200, 0.35, 0, 3); tone(260, 0.12, 'square', 0.08, 0.05, 160); },
  beep() { tone(1760, 0.07, 'square', 0.06); },
  beepErr() { tone(440, 0.12, 'square', 0.08); tone(330, 0.2, 'square', 0.08, 0.14); },
  page() { noise(0.25, 'bandpass', 2600, 0.18, 0, 1.2, 1200); },
  file() { noise(0.12, 'lowpass', 900, 0.3); tone(180, 0.1, 'triangle', 0.08, 0.05); },
  pin() { tone(2600, 0.05, 'triangle', 0.08); noise(0.04, 'highpass', 4000, 0.12); },
  card() { noise(0.18, 'bandpass', 2200, 0.2, 0, 2); tone(300, 0.08, 'triangle', 0.08, 0.15); },
  marquee() { tone(55, 0.6, 'sawtooth', 0.05); noise(0.5, 'highpass', 6000, 0.05); },
};
// 有實際錄音檔的音效（找不到檔案時退回合成音）
// 用 Web Audio 播放（不另開 <audio>，避免 iOS 上把背景音樂擠掉）
const SFX_FILES = { step: 'assets/audio/N01-SFX-STEP.mp3' };
const sfxBuf = {};
function loadSfx(name) {
  if (sfxBuf[name] !== undefined) return;
  sfxBuf[name] = null;
  fetch(SFX_FILES[name]).then(r => r.arrayBuffer()).then(a => new Promise((ok, ng) => ctx.decodeAudioData(a, ok, ng))).then(b => { sfxBuf[name] = b; }).catch(() => { sfxBuf[name] = false; });
}
export function sfx(name) {
  if (!ensure()) return;
  if (SFX_FILES[name]) {
    loadSfx(name);
    const b = sfxBuf[name];
    if (b) { try { const s = ctx.createBufferSource(); s.buffer = b; s.connect(sfxBus); s.start(); return; } catch (e) { /* 退回合成音 */ } }
  }
  if (!SFX[name]) return;
  try { SFX[name](); } catch (e) { /* 播放失敗不影響遊戲 */ }
}

// 合成的低頻環境音（沒有音樂檔時使用）
function startDrone(mood) {
  stopDrone();
  const t = ctx.currentTime;
  const out = ctx.createGain(); out.gain.setValueAtTime(0.0001, t); out.gain.exponentialRampToValueAtTime(0.35, t + 3);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = mood === 'lobby' ? 520 : 380; lp.Q.value = 6;
  const lfo = ctx.createOscillator(), lfoG = ctx.createGain(); lfo.frequency.value = 0.07; lfoG.gain.value = 160;
  lfo.connect(lfoG); lfoG.connect(lp.frequency);
  const base = mood === 'lobby' ? 55 : 43.65;
  const oscs = [base, base * 1.005, base * 1.5, base * 2.01].map((f, i) => {
    const o = ctx.createOscillator(); o.type = i < 2 ? 'sawtooth' : 'triangle'; o.frequency.value = f;
    const g = ctx.createGain(); g.gain.value = i < 2 ? 0.25 : 0.08; o.connect(g); g.connect(lp); o.start(); return o;
  });
  const n = ctx.createBufferSource(); n.buffer = noiseBuf(4); n.loop = true;
  const nf = ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 900; nf.Q.value = 0.7;
  const ng = ctx.createGain(); ng.gain.value = 0.025; n.connect(nf); nf.connect(ng); ng.connect(out); n.start();
  lp.connect(out); out.connect(bgmBus); lfo.start();
  drone = { out, nodes: [...oscs, lfo, n] };
}
function stopDrone() {
  if (!drone) return;
  const d = drone; drone = null;
  const t = ctx.currentTime;
  d.out.gain.cancelScheduledValues(t); d.out.gain.setValueAtTime(d.out.gain.value, t); d.out.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
  setTimeout(() => d.nodes.forEach(n => { try { n.stop(); } catch (e) {} }), 1400);
}

// 背景音樂檔：登入頁 bgm-000110〈Cold Scrapes Below〉；序章 bgm-000073〈Night Pursuit〉；大廳與各內頁 WombatNoisesAudio〈DON'T GO INSIDE〉
// 沒有登記檔案的畫面使用合成環境音
const FILES = { login: 'assets/audio/bgm-login.mp3', n00: 'assets/audio/bgm-n00.mp3', lobby: 'assets/audio/bgm-lobby.mp3' };
export async function bgm(name) {
  if (!ensure() || currentBgm === name) return;
  currentBgm = name;
  if (bgmEl) bgmEl.pause();
  stopDrone();
  if (!name) return;
  const src = FILES[name];
  if (src) {
    // 同一個 <audio> 換曲目：手機瀏覽器解鎖過一次就能一直用，不會每換一頁就被擋
    if (!bgmEl) { bgmEl = new Audio(); bgmEl.loop = true; bgmEl.preload = 'auto'; bgmEl.setAttribute('playsinline', ''); }
    bgmEl.src = src; bgmEl.currentTime = 0; applyVolume();
    bgmEl.play().catch(() => { /* 等使用者下一次點擊後由 unlock() 播放 */ });
    return;
  }
  if (currentBgm === name) startDrone(name);
}

export function vibrate(ms) {
  if (get().settings.vibrate && navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) {} }
}
