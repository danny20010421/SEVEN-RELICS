// G01 暫用示意場景（向量繪製）。正式美術圖到位後，換成 webp 背景即可。
// 座標皆為 1280×720 舞台；右側 1144 以後是道具欄，物件不放在那裡。

const DEFS = `<defs>
<filter id="gRock" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.018 0.03" numOctaves="4" seed="7"/><feColorMatrix values="0 0 0 0 0.32  0 0 0 0 0.22  0 0 0 0 0.15  0 0 0 0.55 0"/></filter>
<filter id="gWood" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.004 0.12" numOctaves="2" seed="2"/><feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.22  0 0 0 0 0.12  0 0 0 0.6 0"/></filter>
<radialGradient id="gLamp" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#ffcf7a" stop-opacity="0.35"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient>
<radialGradient id="gVig" cx="50%" cy="50%" r="75%"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.85"/></radialGradient>
<linearGradient id="gRust" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a4330"/><stop offset="1" stop-color="#3a2419"/></linearGradient>
<linearGradient id="gIron" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4442"/><stop offset="1" stop-color="#26211f"/></linearGradient>
</defs>`;

const T = (x, y, s, size = 14) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" fill="#cdb8a8" opacity="0.75" font-family="Noto Sans CJK TC, sans-serif">${s}</text>`;
const base = (bg = '#1a120e') => `<rect width="1280" height="720" fill="${bg}"/><rect width="1280" height="720" filter="url(#gRock)"/>`;
const vig = '<rect width="1280" height="720" fill="url(#gVig)" pointer-events="none"/>';
const wrap = inner => `<svg class="g01-svg" viewBox="0 0 1280 720" width="1280" height="720" xmlns="http://www.w3.org/2000/svg">${DEFS}${inner}${vig}</svg>`;
const beam = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#3b2516"/><rect x="${x}" y="${y}" width="${w}" height="${h}" filter="url(#gWood)"/>`;
const rails = (cx = 560) => `<g stroke="#5b4a40" stroke-width="6" fill="none"><path d="M${cx - 200} 720 L${cx - 50} 420"/><path d="M${cx + 200} 720 L${cx + 50} 420"/></g>
<g stroke="#3b2516" stroke-width="10">${[700, 640, 590, 548, 512, 480, 452].map((y, i) => { const k = (y - 420) / 300; return `<path d="M${cx - 60 - 170 * k} ${y} L${cx + 60 + 170 * k} ${y}"/>`; }).join('')}</g>`;
const cart = (x, y, w = 280) => `<g><path d="M${x} ${y} L${x + w} ${y} L${x + w - 24} ${y + 130} L${x + 24} ${y + 130}Z" fill="url(#gRust)" stroke="#2a1810" stroke-width="4"/>
<path d="M${x + 10} ${y + 30} H${x + w - 10} M${x + 16} ${y + 80} H${x + w - 16}" stroke="#2a1810" stroke-width="3" opacity="0.6"/>
<path d="M${x - 6} ${y} H${x + w + 6}" stroke="#7d5a44" stroke-width="10"/>
<circle cx="${x + 56}" cy="${y + 150}" r="28" fill="#2b2523" stroke="#6b5a50" stroke-width="5"/><circle cx="${x + w - 56}" cy="${y + 150}" r="28" fill="#2b2523" stroke="#6b5a50" stroke-width="5"/>
<path d="M${x + 30} ${y - 2} Q${x + w / 2} ${y - 60} ${x + w - 30} ${y - 2}" fill="#4a3a2e" opacity="0.9"/></g>`;
const lamp = (x, y) => `<circle cx="${x}" cy="${y}" r="120" fill="url(#gLamp)"/><path d="M${x - 10} ${y - 30} h20 v14 h-20z" fill="#3a2a20"/><circle cx="${x}" cy="${y}" r="12" fill="#ffd27a"/>`;

// S03 本山六坑入口
export const s03 = () => wrap(`${base()}
<path d="M300 720 L330 300 Q560 170 790 300 L820 720Z" fill="#0b0706"/>
<path d="M360 720 L380 330 Q560 230 740 330 L760 720Z" fill="#050303"/>
${beam(300, 280, 40, 440)}${beam(780, 280, 40, 440)}${beam(280, 250, 560, 44)}
${T(560, 236, '本山六坑', 20)}
<text id="aw" x="860" y="250" font-size="44" fill="#d8b594" opacity="0" font-family="serif" transform="rotate(-6 860 250)">A.W.</text>
${rails(560)}
${lamp(900, 210)}
<g id="cart">${cart(420, 400)}${T(560, 380, '礦車')}</g>
<g id="chock"><path d="M666 586 L708 586 L708 560Z" fill="#8a6a50" stroke="#2a1810" stroke-width="3"/>${T(712, 610, '止輪器')}</g>
<g id="bar"><path d="M196 640 L246 380" stroke="#7a7470" stroke-width="10" stroke-linecap="round"/><path d="M246 380 q14 -20 -6 -30" stroke="#7a7470" stroke-width="10" fill="none" stroke-linecap="round"/>${T(220, 670, '鐵撬棒')}</g>
<g><rect x="880" y="540" width="150" height="100" fill="#4a3020" stroke="#2a1810" stroke-width="4"/><path d="M880 540 l40 -30 h110 l-30 30" fill="#5a3a26"/><path d="M900 560 l60 60 M960 560 l-50 70" stroke="#2a1810" stroke-width="5"/>${T(955, 670, '破木箱')}</g>
<g id="grip"><path d="M990 520 l40 -40" stroke="#b08a50" stroke-width="12" stroke-linecap="round"/></g>
<g><rect x="250" y="560" width="70" height="40" fill="url(#gIron)"/><rect x="278" y="500" width="14" height="64" fill="#5b524e"/>${T(285, 625, '轉轍器')}</g>
<g id="lever" opacity="0"><path d="M285 506 L330 440" stroke="#b08a50" stroke-width="12" stroke-linecap="round"/><circle cx="330" cy="440" r="10" fill="#c9a27e"/></g>`);

// S04 礦工休息室
export const s04 = () => wrap(`${base('#1d1410')}
${beam(0, 0, 1280, 60)}${beam(120, 0, 30, 720)}${beam(1000, 0, 30, 720)}
${lamp(520, 120)}
<g><rect x="180" y="120" width="300" height="190" fill="#1e2a22" stroke="#4a3020" stroke-width="10"/><text x="330" y="180" text-anchor="middle" font-size="26" fill="#d9d4c8" opacity="0.8" font-family="serif">安全第一</text><path d="M220 220 h200 M220 250 h150" stroke="#d9d4c8" stroke-width="3" opacity="0.4"/>${T(330, 336, '黑板')}</g>
<g><rect x="430" y="180" width="70" height="90" fill="#e8dcc0" transform="rotate(4 465 225)"/><path d="M445 205 h40 M445 220 h34 M445 235 h40 M445 250 h28" stroke="#5a4a3a" stroke-width="2" transform="rotate(4 465 225)"/>${T(470, 292, '紙條')}</g>
<g><rect x="200" y="430" width="440" height="24" fill="#4a2f1e"/><rect x="220" y="454" width="20" height="200" fill="#3b2516"/><rect x="600" y="454" width="20" height="200" fill="#3b2516"/>
<rect x="260" y="400" width="130" height="34" fill="#e8dcc0" transform="rotate(-3 325 417)"/><path d="M272 412 h100 M272 422 h80" stroke="#5a4a3a" stroke-width="2"/>${T(325, 392, '班次表')}
<path d="M470 430 q40 -60 90 0z" fill="#c9a24a" stroke="#6a5020" stroke-width="3"/>${T(515, 392, '礦工帽')}
<rect x="560" y="410" width="60" height="22" fill="#6a6a5a" opacity="0.6"/></g>
<g><rect x="80" y="380" width="90" height="70" fill="#d9d0bc" stroke="#6a5a48" stroke-width="4" transform="rotate(-5 125 415)"/><rect x="88" y="388" width="74" height="54" fill="#6a6258" transform="rotate(-5 125 415)"/><g fill="#2a2420" transform="rotate(-5 125 415)"><circle cx="100" cy="405" r="6"/><circle cx="118" cy="403" r="6"/><circle cx="136" cy="405" r="6"/><circle cx="152" cy="404" r="6"/><rect x="94" y="411" width="64" height="26"/></g>${T(125, 472, '舊照片')}</g>
${[0, 1, 2].map(i => `<g id="lk${i + 1}"><rect x="${680 + i * 100}" y="220" width="90" height="400" fill="url(#gIron)" stroke="#1a1614" stroke-width="4"/><path d="M${700 + i * 100} 250 h50 M${700 + i * 100} 262 h50 M${700 + i * 100} 274 h50" stroke="#1a1614" stroke-width="3"/><rect x="${708 + i * 100}" y="300" width="34" height="22" fill="#d9d0bc"/><text x="${725 + i * 100}" y="317" text-anchor="middle" font-size="16" font-weight="700" fill="#2a2420" font-family="sans-serif">0${i + 1}</text><rect x="${748 + i * 100}" y="410" width="12" height="36" fill="#8a6a50"/></g>`).join('')}
${T(825, 648, '鐵櫃')}
<g opacity="0.6"><rect x="1040" y="300" width="60" height="320" fill="#3b2516"/>${[0, 1, 2, 3].map(i => `<rect x="1046" y="${320 + i * 70}" width="48" height="50" fill="#5a4030"/>`).join('')}</g>`);

// S05 六坑運礦站
export const s05 = () => wrap(`${base()}
${beam(0, 60, 1280, 36)}${lamp(360, 140)}${lamp(840, 140)}
<g stroke="#5b4a40" stroke-width="6" fill="none"><path d="M120 720 L420 330"/><path d="M300 720 L470 330"/><path d="M820 720 L640 330"/><path d="M1000 720 L700 330"/></g>
<g id="gravel"><ellipse cx="540" cy="560" rx="90" ry="26" fill="#3a3028"/><circle cx="510" cy="552" r="10" fill="#4f433a"/><circle cx="560" cy="566" r="12" fill="#4f433a"/><circle cx="590" cy="550" r="8" fill="#4f433a"/>${T(540, 604, '鐵軌碎石')}</g>
<g><rect x="70" y="420" width="190" height="16" fill="#4a2f1e"/><rect x="84" y="436" width="14" height="150" fill="#3b2516"/><rect x="232" y="436" width="14" height="150" fill="#3b2516"/>
<rect x="88" y="392" width="70" height="32" fill="#7a5a3a"/><rect x="170" y="392" width="70" height="32" fill="#5a3a4a"/>${T(124, 386, '離站簿')}${T(206, 386, '到站簿')}</g>
<g><rect x="880" y="470" width="180" height="40" fill="url(#gIron)"/><rect x="960" y="380" width="20" height="90" fill="#5b524e"/><circle cx="970" cy="370" r="34" fill="#d9d0bc" stroke="#3a3430" stroke-width="5"/><path d="M970 370 l18 -14" stroke="#c4142c" stroke-width="3"/>${T(970, 540, '磅秤')}</g>
<g><rect x="740" y="140" width="250" height="150" fill="#1e2a22" stroke="#4a3020" stroke-width="8"/><text x="865" y="190" text-anchor="middle" font-size="22" fill="#d9d4c8" opacity="0.8" font-family="serif">運量登記</text><path d="M770 230 h190" stroke="#d9d4c8" stroke-width="2" opacity="0.4"/><text x="865" y="268" text-anchor="middle" font-size="20" fill="#d9d4c8" opacity="0.7" font-family="serif">消失：＿ 車</text>${T(865, 312, '登記板')}</g>
<g id="oldsw" opacity="0"><rect x="500" y="530" width="80" height="30" fill="url(#gIron)"/><path d="M540 530 l26 -40" stroke="#8a7a70" stroke-width="10"/></g>`);

// S06 封閉維修坑道
export const s06 = () => wrap(`${base('#140e0b')}
${[[150, 'A'], [470, 'B'], [790, 'C']].map(([x, k]) => `<g><path d="M${x} 640 L${x + 10} 330 Q${x + 120} 250 ${x + 230} 330 L${x + 240} 640Z" fill="#070404"/>${beam(x - 6, 320, 24, 320)}${beam(x + 222, 320, 24, 320)}${beam(x - 20, 300, 280, 30)}
<rect x="${x + 85}" y="250" width="70" height="40" fill="#d9d0bc" stroke="#3a3430" stroke-width="3"/><text x="${x + 120}" y="279" text-anchor="middle" font-size="24" font-weight="700" fill="#2a2420" font-family="serif">${k}</text>
<path d="M${x + 70} 640 L${x + 110} 420 M${x + 170} 640 L${x + 130} 420" stroke="#4b3a30" stroke-width="4"/></g>`).join('')}
${T(270, 680, '正常出坑路線')}${T(590, 680, '工具維修倉庫')}${T(910, 680, '舊式升降井')}
<g><rect x="380" y="110" width="440" height="120" fill="#2a2420" stroke="#5a4a3a" stroke-width="4"/><text x="600" y="152" text-anchor="middle" font-size="20" fill="#d9c9a8" font-family="serif">凡出坑者，皆有紀錄。凡入庫者，皆有編號。</text><text x="600" y="190" text-anchor="middle" font-size="20" fill="#d9c9a8" font-family="serif">唯不升不出者，不留其名。</text>${T(600, 250, '牆上的刻字')}</g>`);

// S06b 側線：礦車、受損的鐵門、合照
export const s06b = () => wrap(`${base('#150f0c')}
${rails(560)}
<g><rect x="430" y="200" width="270" height="330" fill="url(#gIron)" stroke="#1a1614" stroke-width="6"/><path d="M450 230 h230 M450 500 h230" stroke="#1a1614" stroke-width="4"/><g id="latch"><rect x="660" y="340" width="52" height="40" fill="#7a5a40" stroke="#2a1810" stroke-width="3"/><path d="M670 360 h34" stroke="#2a1810" stroke-width="4"/></g>${T(565, 190, '鏽蝕的鐵門')}${T(686, 400, '門扣')}</g>
<g id="door2" opacity="0"><rect x="436" y="206" width="258" height="318" fill="#050303"/></g>
<g id="cart2">${cart(140, 470, 240)}${T(260, 450, '礦車')}</g>
<g id="photo2"><rect x="790" y="330" width="80" height="60" fill="#d9d0bc" stroke="#6a5a48" stroke-width="4" transform="rotate(8 830 360)"/><rect x="797" y="337" width="66" height="46" fill="#5a544c" transform="rotate(8 830 360)"/>${T(830, 420, '門邊的照片')}</g>`);

// S07 五坑舊運輸區：升降井
export const s07 = () => wrap(`${base('#130d0a')}
${lamp(600, 100)}
<g><rect x="420" y="80" width="300" height="560" fill="#080505" stroke="#3b2516" stroke-width="16"/>${[0, 1, 2, 3, 4, 5].map(i => `<path d="M420 ${120 + i * 90} H720" stroke="#2a1d14" stroke-width="6"/>`).join('')}
<g id="cage"><rect x="460" y="300" width="220" height="300" fill="none" stroke="#6b5a50" stroke-width="8"/>${[0, 1, 2, 3, 4].map(i => `<path d="M${490 + i * 40} 300 V600" stroke="#4b3f38" stroke-width="5"/>`).join('')}<path d="M570 80 V300" stroke="#5b524e" stroke-width="6"/></g>${T(570, 664, '升降井')}</g>
<g><rect x="190" y="330" width="150" height="190" fill="url(#gIron)" stroke="#1a1614" stroke-width="4"/>${[0, 1, 2].map(i => `<circle cx="${225 + i * 40}" cy="380" r="12" fill="#3a3430" stroke="#8a7a70" stroke-width="3"/>`).join('')}<rect x="236" y="430" width="58" height="58" fill="#1a1614" stroke="#8a7a70" stroke-width="3"/><g id="ctl" opacity="0"><path d="M265 459 L300 410" stroke="#c9a27e" stroke-width="10" stroke-linecap="round"/></g>${T(265, 548, '控制盤')}</g>
<g><rect x="160" y="230" width="70" height="80" fill="#d9d0bc" transform="rotate(-4 195 270)"/><path d="M172 250 h46 M172 264 h40 M172 278 h46" stroke="#5a4a3a" stroke-width="2" transform="rotate(-4 195 270)"/>${T(196, 224, '維修手冊')}</g>
<g><rect x="830" y="260" width="200" height="16" fill="#4a2f1e"/><rect x="830" y="400" width="200" height="16" fill="#4a2f1e"/><path d="M860 276 v80 M900 276 v60 M990 416 v70" stroke="#7a7470" stroke-width="8"/><g id="grip2"><path d="M940 276 v90" stroke="#c9a27e" stroke-width="12" stroke-linecap="round"/></g>${T(930, 520, '工具架')}</g>`);

// S08 被遺忘的金庫
export const s08 = () => wrap(`${base('#120c09')}
${lamp(560, 120)}
<g><rect x="300" y="150" width="520" height="490" fill="#2a2420" stroke="#4a3e36" stroke-width="10"/>${T(560, 674, '門框')}
<rect x="340" y="190" width="440" height="430" fill="url(#gIron)" stroke="#1a1614" stroke-width="6"/>
${[0, 1, 2, 3].map(i => `<circle cx="${370 + i * 126}" cy="210" r="8" fill="#6b5a50"/><circle cx="${370 + i * 126}" cy="600" r="8" fill="#6b5a50"/>`).join('')}
<text x="560" y="250" text-anchor="middle" font-size="17" fill="#c9b49a" font-family="serif" font-style="italic">Not for the empire. Not for the war.</text>
<text x="560" y="276" text-anchor="middle" font-size="17" fill="#c9b49a" font-family="serif" font-style="italic">For those who never returned.</text>
<g id="chain"><path d="M340 420 Q560 470 780 420" stroke="#7a7470" stroke-width="10" fill="none" stroke-dasharray="18 8"/></g>
<g><rect x="500" y="380" width="120" height="80" rx="8" fill="#3a3430" stroke="#9a8a7a" stroke-width="4"/>${[0, 1, 2, 3].map(i => `<rect x="${512 + i * 26}" y="404" width="20" height="32" fill="#d9d0bc"/>`).join('')}${T(560, 486, '機械鎖')}</g>
<g><rect x="640" y="520" width="70" height="34" fill="#c9a27e" stroke="#5a4a3a" stroke-width="3"/><text x="675" y="543" text-anchor="middle" font-size="16" font-weight="700" fill="#2a2420" font-family="sans-serif">MMDD</text>${T(675, 578, '密碼牌')}</g></g>
<g id="vault" opacity="0"><rect x="340" y="190" width="440" height="430" fill="#060403"/>${[[380, 470], [500, 500], [620, 470], [440, 400], [580, 410]].map(([x, y]) => `<rect x="${x}" y="${y}" width="110" height="70" fill="#4a3020" stroke="#2a1810" stroke-width="4"/><path d="M${x} ${y + 20} h110" stroke="#2a1810" stroke-width="3"/>`).join('')}${T(560, 600, '木箱')}</g>`);

export const BADGE = '<div class="g01-badge">暫用示意圖</div>';

// S09 結語遠景：山霧與樹梢。沒有紅光、沒有人影。正式圖是 g01-ridge.webp。
export const s09 = () => wrap(`<rect width="1280" height="720" fill="#100e0c"/>
<path d="M0 280 L180 180 L340 250 L520 120 L760 230 L980 150 L1280 260 V720 H0Z" fill="#1c1814"/>
<path d="M0 360 L240 280 L480 340 L720 250 L1040 330 L1280 280 V720 H0Z" fill="#2a241e" opacity="0.9"/>
<path d="M0 460 Q360 400 720 450 T1280 420 V720 H0Z" fill="#14110e"/>
<g fill="#0c0a09">${[80, 180, 260, 980, 1100, 1200].map((x, i) => `<path d="M${x} 720 L${x + 18} ${520 - (i % 3) * 30} L${x + 36} 720Z"/>`).join('')}</g>
<rect x="560" y="470" width="70" height="36" fill="#3a3028"/><path d="M548 470 L595 448 L642 470Z" fill="#4a3a30"/>
<rect width="1280" height="720" fill="#c9b8a4" opacity="0.08"/>
${T(640, 660, '金瓜石　山霧')}`);

// 正式圖缺失任何一張時，整幕退回上面的 SVG。座標是 1280×720 舞台像素。
const sp = (id, file, x, y, w, h, extra = {}) => ({ id, file, x, y, w, h, ...extra });
export const PLACES = {
  s03: {
    bg: 'g01-s03.webp', alt: '本山六坑入口，生鏽的礦車擋住坑口', fallback: s03,
    extra: '<div id="aw" class="g01-aw" style="left:860px;top:230px">A.W.</div>',
    sprites: [
      sp('cart', 'g01-cart.webp', 450, 430, 380, 285, { z: 2 }),
      sp('chock', 'g01-chock.webp', 648, 618, 72, 48, { z: 4 }),
      sp('bar', 'g01-crowbar.webp', 148, 248, 64, 192, { z: 3 }),
      sp('grip', 'g01-grip.webp', 948, 492, 84, 60, { z: 4 }),
      sp('lever', 'g01-grip.webp', 246, 438, 88, 62, { opacity: 0, z: 5, extra: 'transform:rotate(-62deg);transform-origin:18% 82%' }),
    ],
  },
  s04: {
    bg: 'g01-s04.webp', alt: '礦工休息室，黑板、木桌與三座鐵櫃', fallback: s04,
    sprites: [
      sp('photoAart', 'it-photo.webp', 52, 318, 124, 96, { z: 3, fit: 'cover' }),
      sp('lk3door', 'g01-s04-locker.webp', 796, 168, 168, 390, { z: 2, fit: 'cover' }),
    ],
    tags: [{ x: 624, y: 232, text: '01' }, { x: 744, y: 232, text: '02' }, { x: 848, y: 214, text: '03' }],
  },
  s05: {
    bg: 'g01-s05.webp', alt: '六坑運礦站，兩條軌道與桌面上的紀錄簿', fallback: s05,
    sprites: [
      sp('departBook', 'g01-ledger.webp', 58, 400, 96, 64, { z: 3 }),
      sp('arriveBook', 'g01-ledger.webp', 162, 398, 96, 64, { z: 3 }),
      sp('oldsw', 'g01-switch.webp', 568, 618, 108, 72, { opacity: 0, z: 2 }),
      sp('gravel', 'g01-gravel.webp', 520, 608, 216, 72, { z: 4 }),
    ],
  },
  s06: {
    bg: 'g01-s06.webp', alt: '封閉維修坑道的三條路線', fallback: s06, sprites: [],
    tags: [{ x: 286, y: 248, text: 'A' }, { x: 612, y: 248, text: 'B' }, { x: 892, y: 248, text: 'C' }],
  },
  s06b: {
    bg: 'g01-s06b.webp', alt: '維修側線盡頭的鏽蝕鐵門', fallback: s06b,
    sprites: [
      sp('cart2', 'g01-cart.webp', 96, 524, 210, 158, { z: 2 }),
      sp('door', 'g01-s06-door.webp', 416, 146, 328, 422, { z: 3 }),
      sp('latch', 'g01-latch.webp', 688, 308, 74, 56, { z: 4 }),
      sp('photo2art', 'it-photo.webp', 792, 248, 112, 86, { z: 3, fit: 'cover' }),
    ],
  },
  s07: {
    bg: 'g01-s07.webp', alt: '五坑舊運輸區的豎井與控制盤', fallback: s07,
    sprites: [
      sp('panelArt', 'g01-s07-panel.webp', 44, 392, 168, 210, { z: 2 }),
      sp('grip2', 'it-handle.webp', 996, 228, 60, 60, { z: 3, fit: 'contain' }),
      sp('ctl', 'it-handle.webp', 96, 468, 60, 60, { opacity: 0, z: 4, fit: 'contain' }),
    ],
  },
  s08: {
    bg: 'g01-s08.webp', alt: '被遺忘的金庫，鐵鍊封住的厚鐵門', fallback: s08,
    sprites: [
      sp('vault', 'g01-crates.webp', 418, 448, 400, 200, { opacity: 0, z: 1 }),
      sp('vaultDoor', 'g01-s08-door.webp', 388, 168, 432, 432, { z: 2 }),
      sp('chain', 'g01-chain.webp', 400, 348, 408, 136, { z: 3 }),
      sp('lockArt', 'g01-keypad.webp', 512, 222, 160, 114, { z: 4 }),
      sp('plateArt', 'g01-plate.webp', 640, 468, 150, 75, { z: 5 }),
    ],
  },
  ridge: {
    bg: 'g01-ridge.webp', alt: '金瓜石的山霧，風吹過樹梢', fallback: s09, sprites: [],
  },
};
