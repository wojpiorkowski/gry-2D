/* ===================== narzędzia ===================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const uid = (p = '') => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function hp(pin) { let h = 5381; const s = 'kraina2d:' + pin; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return 'h' + h.toString(36); }
function plural(n, one, few, many) { if (n === 1) return one; const d = n % 10, t = n % 100; return d >= 2 && d <= 4 && (t < 12 || t > 14) ? few : many; }
function fmtSec(s) { s = Math.round(s || 0); if (s < 60) return s + ' s'; const m = Math.round(s / 60); if (m < 60) return m + ' min'; return Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0') + ' min'; }
const DAY = 86400000;
const dayKey = t => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const fmtDate = t => new Date(t).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
const lsGet = (k, d = null) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };

/* ===================== wygląd awatarów ===================== */
const SKINS = ['#ffe3cc', '#f7cfaa', '#e9b88c', '#d29a6b', '#a8714b', '#74492f'];
const SKIN_N = ['bardzo jasna', 'jasna', 'jasna oliwkowa', 'średnia', 'ciemna', 'bardzo ciemna'];
const HAIRS = ['#22160f', '#4a2f1f', '#7b4a26', '#b0712f', '#d9a54f', '#f0d68a', '#b8432a', '#8c8c8c'];
const HAIR_N = ['czarne', 'ciemnobrązowe', 'brązowe', 'jasnobrązowe', 'ciemny blond', 'jasny blond', 'rude', 'siwe'];
const EYES = ['#3b2a1e', '#2f6db5', '#3f8a4a', '#7a5a2b'];
const EYE_N = ['brązowe', 'niebieskie', 'zielone', 'piwne'];
const HAIRSTYLES = [
  ['short', 'Krótkie', 'krótkie włosy, chłopięca fryzura'],
  ['buzz', 'Bardzo krótkie', 'bardzo krótko ścięte'],
  ['spiky', 'Na jeża', 'krótkie, sterczące'],
  ['curly', 'Loczki', 'kręcone, krótkie lub średnie'],
  ['bob', 'Na pazia', 'do brody, prosta grzywka'],
  ['long', 'Długie', 'długie rozpuszczone'],
  ['ponytail', 'Kitka', 'związane w kucyk z tyłu'],
  ['pigtails', 'Dwa kucyki', 'dwa kucyki po bokach'],
  ['braids', 'Warkocze', 'dwa warkocze'],
  ['bun', 'Kok', 'kok na czubku głowy'],
];

// 20 stylów: kolory stroju i dodatki rysowane w avatarSVG
const STYLES = [
  { id: 'hero', name: 'Superbohater', shirt: '#2f6fe0', pants: '#1d3f9a', shoes: '#e63946', bg: '#cfe1ff' },
  { id: 'astro', name: 'Astronauta', shirt: '#f1f4f8', pants: '#dfe5ec', shoes: '#8a96a8', bg: '#d9d6ff' },
  { id: 'pirate', name: 'Pirat', shirt: '#1d3557', pants: '#3a2c20', shoes: '#22160f', bg: '#bfe7f2' },
  { id: 'knight', name: 'Rycerz', shirt: '#b8c2cc', pants: '#7d8a97', shoes: '#4b5563', bg: '#e3e7ee' },
  { id: 'royal', name: 'Królewna', shirt: '#ff7eb6', pants: '#ff7eb6', shoes: '#ffcf33', bg: '#ffe0ef', dress: 1 },
  { id: 'wizard', name: 'Czarodziej', shirt: '#5b3cc4', pants: '#5b3cc4', shoes: '#2e1a6b', bg: '#e5dcff', dress: 1 },
  { id: 'ninja', name: 'Ninja', shirt: '#2b2d42', pants: '#2b2d42', shoes: '#111', bg: '#dfe3ea' },
  { id: 'cat', name: 'Kotek', shirt: '#f4a259', pants: '#f4a259', shoes: '#e07a2f', bg: '#ffe8cf', hood: '#f4a259' },
  { id: 'dog', name: 'Piesek', shirt: '#b07d4f', pants: '#b07d4f', shoes: '#6f4a2b', bg: '#f1e2d1', hood: '#b07d4f' },
  { id: 'dino', name: 'Dinozaur', shirt: '#4cc38a', pants: '#4cc38a', shoes: '#2c8a5c', bg: '#d6f5e5', hood: '#4cc38a' },
  { id: 'unicorn', name: 'Jednorożec', shirt: '#f3ecff', pants: '#f3ecff', shoes: '#c9a7ff', bg: '#f4e6ff', hood: '#f3ecff' },
  { id: 'football', name: 'Piłkarz', shirt: '#e63946', pants: '#ffffff', shoes: '#22160f', bg: '#d6f3d0' },
  { id: 'fire', name: 'Strażak', shirt: '#f2b705', pants: '#f2b705', shoes: '#22160f', bg: '#ffe1d6' },
  { id: 'doctor', name: 'Lekarz', shirt: '#ffffff', pants: '#5aa9e6', shoes: '#3c6e91', bg: '#dff4ff' },
  { id: 'chef', name: 'Kucharz', shirt: '#ffffff', pants: '#3a3a3a', shoes: '#222', bg: '#fff1d6' },
  { id: 'painter', name: 'Malarz', shirt: '#7fc8f8', pants: '#5a6c8a', shoes: '#3a2c20', bg: '#fff5c9' },
  { id: 'fairy', name: 'Wróżka', shirt: '#7bd389', pants: '#7bd389', shoes: '#ff7eb6', bg: '#e1fbe6', dress: 1 },
  { id: 'cowboy', name: 'Kowboj', shirt: '#4a90d9', pants: '#3b5b8a', shoes: '#6f4a2b', bg: '#ffe9c7' },
  { id: 'ski', name: 'Narciarz', shirt: '#00a6d6', pants: '#1d3557', shoes: '#ef476f', bg: '#e6f7ff' },
  { id: 'robot', name: 'Robot', shirt: '#b0bec5', pants: '#90a4ae', shoes: '#607d8b', bg: '#e3eef2', sleeve: '#90a4ae' },
];
const STYLE = Object.fromEntries(STYLES.map(s => [s.id, s]));
const DEFAULT_AV = { style: 'hero', skin: 1, hair: 2, hairStyle: 'short', eye: 0, glasses: false, freckles: false, bow: false };
const GUEST = { id: 'guest', name: 'Gość', guest: true, avatar: { style: 'robot', skin: 2, hair: 0, hairStyle: 'buzz', eye: 0 } };

function hairParts(hs, c) {
  const cap = `<path d="M31 62 Q28 29 60 29 Q92 29 89 62 Q84 45 66 43 Q50 50 31 62Z" fill="${c}"/>`;
  switch (hs) {
    case 'buzz': return { back: '', front: `<path d="M32 56 Q32 31 60 31 Q88 31 88 56 Q74 41 60 41 Q46 41 32 56Z" fill="${c}"/>` };
    case 'spiky': return { back: '', front: `<path d="M31 60 L29 40 L38 43 L39 26 L49 36 L55 21 L63 34 L71 21 L76 35 L86 27 L84 43 L92 41 L89 60 Q75 44 60 44 Q45 44 31 60Z" fill="${c}"/>` };
    case 'curly': {
      const f = [[33, 52], [36, 40], [45, 32], [57, 28], [69, 30], [79, 36], [86, 46], [88, 58], [31, 62]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10" fill="${c}"/>`).join('');
      return { back: `<circle cx="29" cy="72" r="9" fill="${c}"/><circle cx="91" cy="72" r="9" fill="${c}"/>`, front: f };
    }
    case 'bob': return { back: `<path d="M28 60 Q25 27 60 27 Q95 27 92 60 L94 92 Q84 98 76 90 L44 90 Q36 98 26 92Z" fill="${c}"/>`, front: `<path d="M31 60 Q30 30 60 30 Q90 30 89 60 Q88 49 82 46 L38 46 Q32 49 31 60Z" fill="${c}"/>` };
    case 'long': return { back: `<path d="M29 58 Q25 27 60 27 Q95 27 91 58 L96 114 Q78 122 60 116 Q42 122 24 114Z" fill="${c}"/>`, front: cap };
    case 'ponytail': return { back: `<path d="M84 40 Q112 52 104 104 Q98 112 94 100 Q100 66 80 50Z" fill="${c}"/><circle cx="86" cy="44" r="5" fill="#ff6f61"/>`, front: cap };
    case 'pigtails': return { back: `<ellipse cx="21" cy="82" rx="11" ry="16" fill="${c}"/><ellipse cx="99" cy="82" rx="11" ry="16" fill="${c}"/><circle cx="27" cy="68" r="4" fill="#ff6f61"/><circle cx="93" cy="68" r="4" fill="#ff6f61"/>`, front: cap };
    case 'braids': {
      const br = x => [78, 90, 102, 114].map(y => `<ellipse cx="${x}" cy="${y}" rx="7" ry="7" fill="${c}"/>`).join('') + `<circle cx="${x}" cy="123" r="3.5" fill="#ff6f61"/>`;
      return { back: `<path d="M29 60 Q26 28 60 28 Q94 28 91 60 L90 76 L30 76Z" fill="${c}"/>` + br(29) + br(91), front: `<path d="M31 62 Q30 30 58 30 L60 44 Q44 46 31 62Z M89 62 Q90 30 62 30 L60 44 Q76 46 89 62Z" fill="${c}"/>` };
    }
    case 'bun': return { back: `<circle cx="60" cy="25" r="12" fill="${c}"/>`, front: cap };
    default: return { back: '', front: cap };
  }
}

function avatarSVG(av, cls = '') {
  av = Object.assign({}, DEFAULT_AV, av || {});
  const st = STYLE[av.style] || STYLES[0];
  const skin = SKINS[av.skin] || SKINS[1], hair = HAIRS[av.hair] || HAIRS[2], eye = EYES[av.eye] || EYES[0];
  const sleeve = st.sleeve || st.shirt;
  const d = (Math.random() * -3).toFixed(2);
  let back = '', chest = '', armL = '', armR = '', faceUnder = '', faceOver = '', hat = '', feet = '';
  let hp_ = hairParts(av.hairStyle, hair);
  let hoodBack = '', showEars = true;
  if (st.hood) {
    showEars = false;
    hp_ = { back: '', front: `<path d="M38 47 Q60 33 82 47 Q71 42 60 44 Q49 42 38 47Z" fill="${hair}"/>` };
    hoodBack = `<circle cx="60" cy="60" r="37" fill="${st.hood}"/>`;
  }
  switch (st.id) {
    case 'hero':
      back = `<path d="M40 96 L80 96 L98 178 Q60 186 22 178Z" fill="#e63946"/>`;
      chest = `<polygon points="60,104 64,114 75,114 66,121 69,132 60,125 51,132 54,121 45,114 56,114" fill="#ffd23a"/>`;
      faceUnder = `<path d="M33 57 Q60 51 87 57 L85 71 Q72 73 60 66 Q48 73 35 71Z" fill="#1d3f9a"/>`;
      break;
    case 'astro':
      back = `<rect x="30" y="92" width="60" height="52" rx="10" fill="#cfd8e3"/>`;
      chest = `<rect x="48" y="106" width="24" height="16" rx="4" fill="#3d8bff"/><circle cx="54" cy="114" r="3" fill="#ffd23a"/><circle cx="66" cy="114" r="3" fill="#ff6f61"/>`;
      hat = `<circle cx="60" cy="62" r="39" fill="rgba(180,225,255,.25)" stroke="#e9f1f7" stroke-width="5"/><path d="M35 46 Q41 33 54 29" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".9"/>`;
      break;
    case 'pirate':
      chest = [102, 114, 126, 138].map(y => `<rect x="38" y="${y}" width="44" height="5" fill="#fff" opacity=".9"/>`).join('');
      hat = `<path d="M29 55 Q29 28 60 28 Q91 28 91 55 Q60 43 29 55Z" fill="#d62828"/><circle cx="91" cy="52" r="5" fill="#d62828"/><path d="M92 52 L104 60 L98 64Z" fill="#d62828"/>`;
      faceOver = `<path d="M33 53 L88 71" stroke="#111" stroke-width="2.5"/><ellipse cx="71" cy="64" rx="7.5" ry="7" fill="#111"/>`;
      armR = `<path d="M88 146 Q92 156 84 160" stroke="#c9ced6" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      break;
    case 'knight':
      chest = `<rect x="56" y="102" width="8" height="30" fill="#e63946"/><rect x="47" y="111" width="26" height="8" fill="#e63946"/>`;
      hat = `<path d="M28 61 Q28 26 60 26 Q92 26 92 61 L85 61 Q83 40 60 40 Q37 40 35 61Z" fill="#9aa5b1"/><path d="M60 28 Q66 2 84 6 Q72 13 67 30Z" fill="#e63946"/>`;
      armL = `<path d="M18 110 L42 110 L42 128 Q30 142 18 128Z" fill="#3a6bd8" stroke="#ffd23a" stroke-width="2.5"/>`;
      break;
    case 'royal':
      chest = `<path d="M44 100 Q60 110 76 100" stroke="#fff" stroke-width="4" fill="none"/><circle cx="60" cy="122" r="4" fill="#fff"/><circle cx="50" cy="138" r="3" fill="#fff"/><circle cx="70" cy="138" r="3" fill="#fff"/>`;
      hat = `<path d="M42 36 L44 18 L52 29 L60 14 L68 29 L76 18 L78 36Z" fill="#ffd23a" stroke="#e0a800" stroke-width="1.5"/><circle cx="60" cy="27" r="3" fill="#e63946"/>`;
      break;
    case 'wizard':
      chest = `<text x="48" y="130" font-size="12" fill="#ffd23a">★</text><text x="64" y="146" font-size="10" fill="#ffd23a">★</text><text x="58" y="114" font-size="9" fill="#ffd23a">★</text>`;
      hat = `<path d="M30 42 L58 -12 L90 42Z" fill="#5b3cc4"/><ellipse cx="60" cy="42" rx="38" ry="7" fill="#46299e"/><text x="54" y="26" font-size="13" fill="#ffd23a">★</text>`;
      armR = `<line x1="88" y1="142" x2="106" y2="114" stroke="#6f4a2b" stroke-width="4" stroke-linecap="round"/><text x="100" y="114" font-size="16" fill="#ffd23a">✦</text>`;
      break;
    case 'ninja':
      chest = `<rect x="38" y="128" width="44" height="7" fill="#e63946"/>`;
      hat = `<rect x="29" y="44" width="62" height="9" rx="3" fill="#e63946"/><path d="M89 47 L106 40 L102 55Z" fill="#e63946"/>`;
      break;
    case 'cat':
      back = `<path class="av-tail" d="M80 150 Q112 150 104 118" stroke="#e07a2f" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M27 42 L31 10 L54 27Z M93 42 L89 10 L66 27Z" fill="${st.hood}"/><path d="M33 36 L35 18 L48 28Z M87 36 L85 18 L72 28Z" fill="#ffc9d6"/>`;
      faceOver = `<g stroke="#7a4b2a" stroke-width="1.5"><line x1="30" y1="74" x2="42" y2="76"/><line x1="30" y1="80" x2="42" y2="79"/><line x1="90" y1="74" x2="78" y2="76"/><line x1="90" y1="80" x2="78" y2="79"/></g><ellipse cx="60" cy="72" rx="3" ry="2" fill="#ff8fa3"/>`;
      chest = `<ellipse cx="60" cy="122" rx="14" ry="18" fill="#ffe2c4"/>`;
      break;
    case 'dog':
      back = `<path class="av-tail" d="M80 146 Q104 140 100 122" stroke="#6f4a2b" stroke-width="8" fill="none" stroke-linecap="round"/>`;
      hat = `<ellipse cx="25" cy="66" rx="10" ry="22" fill="#6f4a2b"/><ellipse cx="95" cy="66" rx="10" ry="22" fill="#6f4a2b"/>`;
      faceOver = `<ellipse cx="60" cy="72" rx="4" ry="3" fill="#3a2516"/>`;
      chest = `<ellipse cx="60" cy="122" rx="14" ry="18" fill="#f1e2d1"/>`;
      break;
    case 'dino':
      back = `<path class="av-tail" d="M78 150 Q112 160 114 132 Q104 146 80 140Z" fill="#2c8a5c"/><path d="M36 34 L42 16 L50 28 L56 10 L64 26 L72 12 L76 30 L86 20 L84 38Z" fill="#ffb703"/>`;
      chest = `<ellipse cx="60" cy="122" rx="15" ry="20" fill="#bff0d5"/>`;
      break;
    case 'unicorn':
      back = `<path d="M30 40 L34 22 L46 32Z M90 40 L86 22 L74 32Z" fill="${st.hood}"/><path d="M24 50 Q18 80 30 100" stroke="#ff7eb6" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M26 46 Q24 70 34 86" stroke="#7fc8f8" stroke-width="6" fill="none" stroke-linecap="round"/>`;
      hat = `<path d="M54 25 L60 -4 L66 25Z" fill="#ffd23a" stroke="#e0a800" stroke-width="1.5"/>`;
      chest = `<path d="M46 108 Q60 116 74 108" stroke="#c9a7ff" stroke-width="5" fill="none"/>`;
      break;
    case 'football':
      chest = `<text x="60" y="132" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="26" fill="#fff">7</text>`;
      feet = `<g transform="translate(99 182)"><circle r="10" fill="#fff" stroke="#222" stroke-width="1.5"/><polygon points="0,-4 4,-1 2.5,4 -2.5,4 -4,-1" fill="#222"/></g>`;
      break;
    case 'fire':
      chest = `<rect x="38" y="118" width="44" height="6" fill="#d9e1e8"/><rect x="38" y="132" width="44" height="6" fill="#d9e1e8"/>`;
      hat = `<path d="M27 55 Q27 24 60 24 Q93 24 93 55Z" fill="#d62828"/><rect x="20" y="50" width="80" height="8" rx="4" fill="#a61b1b"/><circle cx="60" cy="38" r="7" fill="#ffd23a"/>`;
      break;
    case 'doctor':
      chest = `<path d="M60 96 L60 146" stroke="#d5dde8" stroke-width="2"/><path d="M50 96 Q48 116 60 120 Q72 116 70 96" stroke="#333" stroke-width="2.5" fill="none"/><circle cx="60" cy="122" r="4" fill="#9aa5b1"/><rect x="68" y="128" width="10" height="10" fill="#fff"/><path d="M73 129 V137 M69 133 H77" stroke="#e63946" stroke-width="2.5"/>`;
      break;
    case 'chef':
      chest = `<path d="M44 108 L76 108 L80 146 L40 146Z" fill="#f2f2f2" stroke="#d9d9d9"/><path d="M50 92 L60 104 L70 92" fill="#e63946"/>`;
      hat = `<rect x="40" y="22" width="40" height="18" fill="#fff" stroke="#ddd"/><circle cx="46" cy="18" r="10" fill="#fff"/><circle cx="60" cy="12" r="12" fill="#fff"/><circle cx="74" cy="18" r="10" fill="#fff"/>`;
      break;
    case 'painter':
      chest = `<circle cx="50" cy="114" r="4" fill="#ff6f61"/><circle cx="68" cy="124" r="5" fill="#ffd23a"/><circle cx="56" cy="136" r="3.5" fill="#7a5cff"/>`;
      hat = `<ellipse cx="56" cy="34" rx="31" ry="10" fill="#e63946"/><circle cx="58" cy="24" r="3.5" fill="#e63946"/>`;
      armL = `<ellipse cx="24" cy="142" rx="13" ry="9" fill="#e8c39e"/><circle cx="19" cy="139" r="2.5" fill="#ff6f61"/><circle cx="25" cy="137" r="2.5" fill="#3d8bff"/><circle cx="30" cy="142" r="2.5" fill="#2fb35a"/>`;
      armR = `<line x1="88" y1="142" x2="102" y2="122" stroke="#6f4a2b" stroke-width="3"/><circle cx="102" cy="121" r="3" fill="#ff6f61"/>`;
      break;
    case 'fairy':
      back = `<g class="av-wings"><ellipse cx="34" cy="106" rx="22" ry="30" fill="rgba(170,230,255,.75)" stroke="#9ad0ec" stroke-width="2"/><ellipse cx="86" cy="106" rx="22" ry="30" fill="rgba(170,230,255,.75)" stroke="#9ad0ec" stroke-width="2"/></g>`;
      hat = `<path d="M46 34 Q60 24 74 34" stroke="#ffd23a" stroke-width="4" fill="none"/><circle cx="60" cy="27" r="4" fill="#ff7eb6"/>`;
      armR = `<line x1="88" y1="142" x2="104" y2="118" stroke="#ffd23a" stroke-width="3"/><text x="98" y="118" font-size="16" fill="#ffd23a">★</text>`;
      break;
    case 'cowboy':
      chest = `<path d="M38 100 L52 100 L50 146 L38 146Z M82 100 L68 100 L70 146 L82 146Z" fill="#8b5a2b"/><path d="M50 92 L60 106 L70 92Z" fill="#e63946"/>`;
      hat = `<ellipse cx="60" cy="38" rx="44" ry="8" fill="#8b5a2b"/><path d="M38 38 Q40 12 60 15 Q80 12 82 38Z" fill="#a0692f"/><rect x="39" y="30" width="42" height="5" fill="#5a3a1c"/>`;
      break;
    case 'ski':
      chest = `<rect x="38" y="90" width="44" height="10" rx="5" fill="#ef476f"/><rect x="66" y="96" width="9" height="26" rx="4" fill="#ef476f"/>`;
      hat = `<path d="M29 52 Q29 22 60 22 Q91 22 91 52Z" fill="#ef476f"/><rect x="27" y="47" width="66" height="10" rx="5" fill="#fff"/><circle cx="60" cy="17" r="8" fill="#fff"/>`;
      break;
    case 'robot':
      chest = `<rect x="44" y="104" width="32" height="22" rx="4" fill="#78909c"/><circle cx="52" cy="115" r="4" fill="#ff5252"/><circle cx="62" cy="115" r="4" fill="#ffd23a"/><circle cx="71" cy="115" r="3" fill="#69f0ae"/><rect x="46" y="132" width="28" height="4" rx="2" fill="#78909c"/>`;
      hat = `<rect x="27" y="40" width="66" height="9" rx="4" fill="#90a4ae"/><line x1="60" y1="40" x2="60" y2="18" stroke="#90a4ae" stroke-width="3"/><circle class="av-light" cx="60" cy="15" r="5" fill="#ff5252"/>`;
      break;
  }
  const torso = st.dress
    ? `<path d="M40 95 Q60 89 80 95 L92 152 Q60 160 28 152Z" fill="${st.shirt}"/>`
    : `<rect x="38" y="93" width="44" height="54" rx="15" fill="${st.shirt}"/>`;
  const legs = st.dress
    ? `<g class="av-legL"><rect x="46" y="146" width="11" height="34" rx="5" fill="${skin}"/><ellipse cx="50" cy="182" rx="10" ry="6" fill="${st.shoes}"/></g><g class="av-legR"><rect x="63" y="146" width="11" height="34" rx="5" fill="${skin}"/><ellipse cx="70" cy="182" rx="10" ry="6" fill="${st.shoes}"/></g>`
    : `<g class="av-legL"><rect x="45" y="138" width="13" height="42" rx="6" fill="${st.pants}"/><ellipse cx="50" cy="182" rx="10" ry="6" fill="${st.shoes}"/></g><g class="av-legR"><rect x="62" y="138" width="13" height="42" rx="6" fill="${st.pants}"/><ellipse cx="70" cy="182" rx="10" ry="6" fill="${st.shoes}"/></g>`;
  const glasses = av.glasses ? `<g fill="rgba(255,255,255,.25)" stroke="#2b2d42" stroke-width="2.6"><circle cx="49" cy="64" r="8.5"/><circle cx="71" cy="64" r="8.5"/><path d="M57.5 63 Q60 61 62.5 63" fill="none"/></g>` : '';
  const freckles = av.freckles ? `<g fill="#b5703f" opacity=".6"><circle cx="40" cy="72" r="1.3"/><circle cx="44" cy="75" r="1.3"/><circle cx="38" cy="76" r="1.1"/><circle cx="80" cy="72" r="1.3"/><circle cx="76" cy="75" r="1.3"/><circle cx="82" cy="76" r="1.1"/></g>` : '';
  const bow = av.bow && !st.hood ? `<g transform="translate(78 36) rotate(18)"><path d="M0 0 L-11 -7 L-11 7Z M0 0 L11 -7 L11 7Z" fill="#ff5fa2"/><circle r="3.2" fill="#e23d84"/></g>` : '';
  const ears = showEars ? `<circle cx="31" cy="65" r="6" fill="${skin}"/><circle cx="89" cy="65" r="6" fill="${skin}"/>` : '';
  return `<svg class="av ${cls}" viewBox="0 -16 120 216" style="--d:${d}s" aria-hidden="true">
<ellipse cx="60" cy="193" rx="30" ry="5" fill="rgba(0,0,0,.14)"/>
<g class="av-all">${back}${legs}${torso}
<g class="av-armL"><rect x="26" y="97" width="12" height="42" rx="6" fill="${sleeve}"/><circle cx="32" cy="141" r="7" fill="${skin}"/>${armL}</g>
<g class="av-armR"><rect x="82" y="97" width="12" height="42" rx="6" fill="${sleeve}"/><circle cx="88" cy="141" r="7" fill="${skin}"/>${armR}</g>
${chest}<rect x="54" y="84" width="12" height="12" fill="${skin}"/>
${hp_.back}${hoodBack}${ears}<circle cx="60" cy="62" r="29" fill="${skin}"/>${hp_.front}${bow}${faceUnder}
<g class="av-eyes"><ellipse cx="49" cy="64" rx="4" ry="5" fill="${eye}"/><ellipse cx="71" cy="64" rx="4" ry="5" fill="${eye}"/><circle cx="50.5" cy="62" r="1.4" fill="#fff"/><circle cx="72.5" cy="62" r="1.4" fill="#fff"/></g>
<path d="M44 55 Q49 52 54 55 M66 55 Q71 52 76 55" stroke="${st.hood ? '#5a3a1c' : hair}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
<circle cx="41" cy="74" r="5" fill="#ff8a8a" opacity=".4"/><circle cx="79" cy="74" r="5" fill="#ff8a8a" opacity=".4"/>${freckles}
<path d="M51 77 Q60 86 69 77" stroke="#7a2e2e" stroke-width="3" fill="#fff" stroke-linecap="round"/>
${glasses}${faceOver}${hat}${feet}</g></svg>`;
}
function avOf(p) { return (p && p.avatar) || DEFAULT_AV; }
function react(el, cls, ms = 800) { if (!el) return; const s = el.querySelector('svg.av') || el; s.classList.remove('jump', 'oops'); void s.getBoundingClientRect(); s.classList.add(cls); setTimeout(() => s.classList.remove(cls), ms); }
