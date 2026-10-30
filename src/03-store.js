/* ===================== dane: wspólna baza (claude.ai) albo przeglądarka ===================== */
const LS_DATA = 'kraina2d_data_v1', LS_ME = 'kraina2d_me', LS_MAIL = 'kraina2d_outbox', LS_PREF = 'kraina2d_pref';
const DEFAULT_TEACHER = { email: 'nauczyciel@klasa2d.pl', pin: hp('2222') };
const S = { kids: {}, sessions: {}, homework: {}, teacher: null };
const Store = {
  mode: 'local', ready: false, canWrite: true, db: null,
  kids() { return Object.values(S.kids).filter(k => k.verified && k.name).sort((a, b) => a.name.localeCompare(b.name, 'pl')); },
  kid(id) { return S.kids[id] || null; },
  byEmail(email) { email = (email || '').trim().toLowerCase(); return Object.values(S.kids).find(k => k.email === email) || null; },
  teacher() { return S.teacher || DEFAULT_TEACHER; },
  sessionsOf(id) { return Object.values(S.sessions).filter(s => s.kid === id).sort((a, b) => b.date - a.date); },
  homework() { return Object.values(S.homework).sort((a, b) => b.created - a.created); },
  async put(col, obj) {
    if (col === 'config') S.teacher = obj; else S[col][obj.id] = obj;
    if (this.mode === 'local') return saveLocal();
    try { await this.db.collection(col).doc(col === 'config' ? 'teacher' : obj.id).set(JSON.parse(JSON.stringify(obj))); }
    catch (e) { writeFailed(e); }
  },
  async del(col, id) {
    delete S[col][id];
    if (this.mode === 'local') return saveLocal();
    try { await this.db.collection(col).doc(id).delete(); } catch (e) { writeFailed(e); }
  },
};
function writeFailed(e) {
  if (e && (e.code === 'invalid_argument' || e.code === 'not_granted')) {
    Store.canWrite = false; renderBanner();
    toast('Ta przeglądarka ma tylko podgląd: zmiany nie zapiszą się we wspólnej bazie.');
  } else if (e && e.code === 'quota_exceeded') toast('Baza jest pełna. Usuń stare dane w ustawieniach nauczyciela.');
  else toast('Nie udało się zapisać. Spróbuj jeszcze raz za chwilę.');
}
function saveLocal() { lsSet(LS_DATA, S); }
function loadLocal() {
  const d = lsGet(LS_DATA);
  if (d && d.kids) Object.assign(S, d); else seedLocal();
}
let UNSUB = [];
// Pokaz z przykładowymi dziećmi: działa tylko w tej przeglądarce i nie dotyka wspólnej bazy klasy.
async function setDemo(on) {
  const p = lsGet(LS_PREF, {}); p.demo = on; lsSet(LS_PREF, p); setMe(null);
  UNSUB.forEach(u => { try { u(); } catch (e) { } }); UNSUB = [];
  S.kids = {}; S.sessions = {}; S.homework = {}; S.teacher = null; Store.canWrite = true;
  if (on || !(await connectDb())) { Store.mode = 'local'; Store.db = null; loadLocal(); }
  renderBanner(); go(vLanding);
}
async function connectDb() {
  let db = null;
  try { db = window.claude && window.claude.use ? await window.claude.use('db') : null; } catch (e) { db = null; }
  if (!db) return false;
  Store.db = db; Store.mode = 'db';
  try { const u = await window.claude.use('user'); if (u && u.can) { const c = await u.can('data.write'); if (c === false) Store.canWrite = false; } } catch (e) { }
  S.kids = {}; S.sessions = {}; S.homework = {}; S.teacher = null;
  const first = [];
  const sub = (col) => first.push(new Promise(res => {
    UNSUB.push(db.collection(col).onSnapshot(snap => {
      const m = {}; snap.docs.forEach(d => { m[d.id] = Object.assign({ id: d.id }, d.data()); }); S[col] = m; res(); scheduleRerender();
    }, () => res()));
  }));
  sub('kids'); sub('sessions'); sub('homework');
  first.push(new Promise(res => UNSUB.push(db.doc('config/teacher').onSnapshot(d => { S.teacher = d.exists ? d.data() : null; res(); }, () => res()))));
  await Promise.race([Promise.all(first), new Promise(r => setTimeout(r, 5000))]);
  return true;
}

/* przykładowe dzieci, tylko w trybie przeglądarki */
function seedLocal() {
  const names = [['Ala', 'cat', 1, 5, 'pigtails', 1, 0, 1], ['Bartek', 'astro', 2, 1, 'short', 0, 0, 0], ['Zosia', 'royal', 0, 6, 'long', 2, 1, 1], ['Kuba', 'dino', 3, 0, 'spiky', 0, 0, 0],
  ['Hania', 'fairy', 1, 4, 'braids', 1, 0, 1], ['Staś', 'football', 4, 0, 'buzz', 0, 0, 0], ['Lena', 'wizard', 2, 2, 'ponytail', 3, 1, 0], ['Antek', 'knight', 1, 3, 'curly', 1, 0, 0]];
  const games = ['rakieta', 'jablka', 'zegar', 'sklepik', 'balony', 'pociag', 'slowa', 'eko', 'memory', 'most'];
  const now = Date.now();
  names.forEach(([name, style, skin, hair, hs, eye, glasses, freckles], i) => {
    const id = 'demo' + i;
    S.kids[id] = { id, demo: true, email: name.toLowerCase().replace('ś', 's') + '@demo.pl', pin: hp('1111'), verified: true, name, created: now - 20 * DAY,
      avatar: { style, skin, hair, hairStyle: hs, eye, glasses: !!glasses, freckles: !!freckles, bow: i % 3 === 0 } };
    const c3 = { Bartek: 'kk_knight', Zosia: 'kk_rogue', Kuba: 'robot', Lena: 'kk_mage', 'Staś': 'kk_barbarian' }[name];
    if (c3) S.kids[id].avatar3d = { id: c3 };
    const weak = games[i % 8];
    const n = R(7, 16);
    for (let j = 0; j < n; j++) {
      const g = pick(games), level = R(1, 2), total = g === 'memory' ? 4 + level * 2 : g === 'most' ? 6 : 8;
      const acc = g === weak ? Math.random() * .45 + .25 : Math.random() * .4 + .6;
      const correct = Math.round(total * acc);
      const sid = 'ds' + i + '_' + j;
      S.sessions[sid] = { id: sid, kid: id, game: g, level, correct, total, stars: starsFor(correct, total), sec: R(70, 420), date: now - R(0, 13) * DAY - R(0, 8) * 3600000, done: true, mode: Math.random() < .3 ? 'lesson' : 'home' };
    }
  });
  const c = now - 3 * DAY, due = dayKey(now + 4 * DAY);
  S.homework.hw1 = { id: 'hw1', title: 'Tydzień z ortografią', note: 'Zagrajcie codziennie po kilka minut.', due, to: 'all', created: c, steps: [{ game: 'balony', level: 1, min: 2 }, { game: 'pociag', level: 1, min: 2 }, { game: 'rakieta', level: 1, min: 2 }, { game: 'balony', level: 2, min: 2 }] };
  S.homework.hw2 = { id: 'hw2', title: 'Bartek: mnożenie', note: 'Poćwicz koszyki jabłek.', due, to: ['demo1'], created: c, steps: [{ game: 'jablka', level: 1, min: 2 }, { game: 'jablka', level: 2, min: 2 }] };
  S.homework.hw3 = { id: 'hw3', title: 'Zosia: zegar', note: '', due, to: ['demo2'], created: c, steps: [{ game: 'zegar', level: 1, min: 3 }, { game: 'zegar', level: 2, min: 2 }] };
  S.teacher = DEFAULT_TEACHER;
  saveLocal();
}

/* ===================== wyniki ===================== */
function starsFor(c, t) { const r = t ? c / t : 0; return r >= .9 ? 3 : r >= .7 ? 2 : r >= .4 ? 1 : 0; }
function stepDone(kidId, hw, st) {
  return Store.sessionsOf(kidId).some(s => s.game === st.game && s.level >= st.level && s.stars >= st.min && s.date >= hw.created - 60000);
}
function hwFor(kidId) { return Store.homework().filter(h => h.to === 'all' || (Array.isArray(h.to) && h.to.includes(kidId))); }
function hwProgress(kidId, hw) { const d = hw.steps.filter(st => stepDone(kidId, hw, st)).length; return { done: d, total: hw.steps.length }; }
function bestStars(kidId, game, level) { return Math.max(0, ...Store.sessionsOf(kidId).filter(s => s.game === game && s.level === level).map(s => s.stars)); }
function streak(kidId) {
  const days = new Set(Store.sessionsOf(kidId).map(s => dayKey(s.date)));
  let n = 0, t = Date.now(); if (!days.has(dayKey(t))) t -= DAY;
  while (days.has(dayKey(t))) { n++; t -= DAY; }
  return n;
}
function points(kidId) { return Store.sessionsOf(kidId).reduce((a, s) => a + s.correct * 10 + s.stars * 5, 0); }
function subjStats(kidId, since = 0) {
  const out = {}; for (const k of Object.keys(SUBJ)) out[k] = { c: 0, t: 0, sec: 0, n: 0 };
  Store.sessionsOf(kidId).filter(s => s.date >= since).forEach(s => { const g = G[s.game]; if (!g) return; const o = out[g.subj]; o.c += s.correct; o.t += s.total; o.sec += s.sec; o.n++; });
  return out;
}
function weakest(kidId) {
  const st = subjStats(kidId); let best = null;
  for (const k of ['mat', 'pol', 'prz', 'ang']) { const a = st[k].t ? st[k].c / st[k].t : -1; if (best === null || a < best.a) best = { k, a }; }
  return best.k;
}
async function recordSession(players, data) {
  for (const p of players) {
    if (!p || p.guest) continue;
    const per = data.per ? data.per[p.id] : null;
    const s = Object.assign({ id: uid('s'), kid: p.id, date: Date.now() }, data, per || {});
    delete s.per;
    await Store.put('sessions', s);
  }
}

/* ===================== poczta (w prototypie pokazywana na ekranie) ===================== */
function outbox() { return lsGet(LS_MAIL, []); }
function sendMail(to, subj, body, code) {
  const box = outbox(); box.unshift({ id: uid('m'), to, subj, body, code, date: Date.now(), unread: true }); lsSet(LS_MAIL, box.slice(0, 30));
  renderHeader();
  toast(`Wysłaliśmy e-mail na ${to}`, 'Otwórz pocztę', openMailbox);
}
function openMailbox() {
  const box = outbox(); box.forEach(m => m.unread = false); lsSet(LS_MAIL, box); renderHeader();
  modal(`<div class="modal-h"><h3>📬 Poczta (prototyp)</h3><button class="x" data-close aria-label="Zamknij">✕</button></div>
  <p class="muted">W prototypie nie wysyłamy prawdziwych e-maili. Wiadomości z kodami pojawiają się tutaj, na tym urządzeniu.</p>
  ${box.length ? box.map(m => `<div class="mail"><b>${esc(m.subj)}</b><span class="muted">Do: ${esc(m.to)} · ${new Date(m.date).toLocaleString('pl-PL')}</span><p>${esc(m.body)}</p>${m.code ? `<div class="code">${esc(m.code)}</div>` : ''}</div>`).join('') : '<p>Na razie pusto.</p>'}`);
}

/* ===================== drobne elementy interfejsu ===================== */
let CLEAN = [];
function onCleanup(f) { CLEAN.push(f); }
function cleanup() { CLEAN.forEach(f => { try { f(); } catch (e) { } }); CLEAN = []; }
let CUR = null, rrTimer = null;
function go(fn, ...args) { cleanup(); CUR = { fn, args }; fn(...args); window.scrollTo(0, 0); renderHeader(); }
function rerender() { if (!CUR || !CUR.fn.live) return; const y = window.scrollY; cleanup(); CUR.fn(...CUR.args); window.scrollTo(0, y); renderHeader(); }
function scheduleRerender() { clearTimeout(rrTimer); rrTimer = setTimeout(() => { if (!document.querySelector('.modal-bg') && !document.activeElement?.matches('input,textarea,select')) rerender(); }, 400); }
const app = () => $('#app');
function view(html) { app().innerHTML = html; return app(); }
function toast(msg, act, fn) {
  $$('.toast').forEach(t => t.remove());
  const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status');
  t.innerHTML = `<span>${esc(msg)}</span>${act ? `<button>${esc(act)}</button>` : ''}`;
  if (act) t.querySelector('button').onclick = () => { t.remove(); fn(); };
  document.body.appendChild(t); setTimeout(() => t.remove(), act ? 7000 : 3500);
}
function modal(html, onMount) {
  const bg = document.createElement('div'); bg.className = 'modal-bg';
  bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
  const close = () => bg.remove();
  bg.addEventListener('click', e => { if (e.target === bg || e.target.closest('[data-close]')) close(); });
  document.body.appendChild(bg); if (onMount) onMount(bg.querySelector('.modal'), close); return close;
}
function confetti(n = 60) {
  const cols = ['#ff6f61', '#ffd23a', '#1fbfa6', '#7a5cff', '#3d8bff', '#e84a8a'];
  for (let i = 0; i < n; i++) {
    const c = document.createElement('i'); c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw'; c.style.background = pick(cols);
    c.style.animationDuration = (1.4 + Math.random() * 1.4) + 's'; c.style.animationDelay = (Math.random() * .4) + 's';
    document.body.appendChild(c); setTimeout(() => c.remove(), 3400);
  }
}
let AC = null;
function sound(type) {
  if (lsGet(LS_PREF, {}).muted) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const seq = { ok: [660, 880], bad: [310, 230], win: [523, 659, 784, 1047], tap: [520], plank: [392, 523] }[type] || [500];
    seq.forEach((f, i) => {
      const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + i * .11;
      o.type = type === 'bad' ? 'sine' : 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.18, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + .22);
      o.connect(g).connect(AC.destination); o.start(t); o.stop(t + .24);
    });
  } catch (e) { }
}
function speak(text, lang = 'pl-PL') {
  try { if (!window.speechSynthesis || !text) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = lang; u.rate = .9; speechSynthesis.speak(u); } catch (e) { }
}

function pinPad(el, label, onDone) {
  let v = '';
  el.innerHTML = `<div class="pin"><div class="pin-label">${esc(label)}</div><div class="dots">${'<i></i>'.repeat(4)}</div>
  <div class="keys">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button type="button" data-k="${n}">${n}</button>`).join('')}<button type="button" data-k="del" aria-label="Usuń">⌫</button><button type="button" data-k="0">0</button><button type="button" data-k="clr" aria-label="Wyczyść">✕</button></div></div>`;
  const dots = $$('.dots i', el);
  const paint = () => dots.forEach((d, i) => d.classList.toggle('on', i < v.length));
  const press = k => {
    if (k === 'del') v = v.slice(0, -1); else if (k === 'clr') v = ''; else if (v.length < 4) { v += k; sound('tap'); }
    paint(); if (v.length === 4) { const val = v; setTimeout(() => onDone(val), 160); }
  };
  el.addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b) press(b.dataset.k); });
  const kd = e => { if (e.target.matches('input,textarea')) return; if (/^[0-9]$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') press('del'); };
  document.addEventListener('keydown', kd); onCleanup(() => document.removeEventListener('keydown', kd));
  return { reset(msg) { v = ''; paint(); const p = $('.pin', el); p.classList.remove('shake'); void p.offsetWidth; p.classList.add('shake'); if (msg) $('.pin-label', el).textContent = msg; } };
}
