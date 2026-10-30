/* ===================== nagłówek ===================== */
function me() { const id = lsGet(LS_ME); if (id === 'teacher') return { teacher: true }; return id ? Store.kid(id) : null; }
function setMe(id) { lsSet(LS_ME, id); }
function renderHeader() {
  const m = me(), unread = outbox().filter(x => x.unread).length, muted = lsGet(LS_PREF, {}).muted;
  $('#hdr').innerHTML = `<div class="wrap">
    <button class="logo" id="h-home" aria-label="Strona główna"><span class="logo-badge">2D</span><span><b>Kraina Gier</b><small>klasa 2D · gry do nauki</small></span></button>
    <div class="hdr-sp"></div>
    <div class="hdr-tools">
      <button class="chip-btn" id="h-mail" title="Poczta (prototyp)">📬 <span class="lbl">Poczta</span>${unread ? `<span class="cnt">${unread}</span>` : ''}</button>
      <button class="chip-btn" id="h-snd" title="Dźwięk">${muted ? '🔇' : '🔊'}</button>
      <button class="chip-btn" id="h-fs" title="Pełny ekran na tablicę">⛶ <span class="lbl">Tablica</span></button>
      ${m ? `<span class="me-chip">${m.teacher ? '<span style="font-size:24px;padding:0 4px">👩‍🏫</span>' : `<span class="mini">${pAv(m)}</span>`}<span>${m.teacher ? 'Nauczyciel' : esc(m.name || 'Nowe konto')}</span></span><button class="chip-btn" id="h-out">Wyloguj</button>` : ''}
    </div></div>`;
  $('#h-home').onclick = () => goHome();
  $('#h-mail').onclick = openMailbox;
  $('#h-snd').onclick = () => { const p = lsGet(LS_PREF, {}); p.muted = !p.muted; lsSet(LS_PREF, p); renderHeader(); };
  $('#h-fs').onclick = () => { try { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(() => toast('Pełny ekran nie działa w tym widoku.')); } catch (e) { toast('Pełny ekran nie działa w tym widoku.'); } };
  const out = $('#h-out'); if (out) out.onclick = () => { setMe(null); go(vLanding); };
}
function renderBanner() {
  const b = $('#banner'), inViewer = !!(window.claude && window.claude.use);
  let msg = '', btn = '';
  if (Store.mode === 'local') { msg = 'Pokaz z przykładowymi dziećmi: zmiany zapisują się tylko w tej przeglądarce. Dzieci mają PIN 1111, nauczyciel: nauczyciel@klasa2d.pl, PIN 2222.'; if (inViewer && lsGet(LS_PREF, {}).demo) btn = 'Wróć do prawdziwej klasy'; }
  else if (!Store.canWrite) msg = 'Masz dostęp tylko do podglądu, więc wyniki i nowe konta się nie zapiszą. Poproś właściciela strony o zaproszenie z uprawnieniem do edycji.';
  b.hidden = !msg; b.innerHTML = msg ? `<div class="wrap">${esc(msg)}${btn ? `<button id="bn-real">${btn}</button>` : ''}</div>` : '';
  const r = $('#bn-real'); if (r) r.onclick = () => setDemo(false);
}
function goHome() { const m = me(); if (m && m.teacher) go(vTeacher, 'board'); else if (m && m.name && m.avatar) go(vChildHome); else if (m && !m.name) go(vName); else if (m && !m.avatar) go(vAvatar, true); else go(vLanding); }

/* ===================== plac zabaw („filmik” z awatarami) ===================== */
function playground(el, kids) {
  if (!kids.length) kids = [GUEST, { name: 'Ty?', avatar: { style: 'hero', skin: 1, hair: 3, hairStyle: 'curly' } }, { name: 'Kolega', avatar: { style: 'dino', skin: 3 } }];
  kids = kids.slice(0, 12);
  const n = kids.length, acts = ['walk', 'hop', 'dance', 'walk', 'hop'];
  const ballPair = n >= 2 ? [0, Math.min(n - 1, 2)] : null;
  el.classList.add('scene');
  el.innerHTML = `<div class="sun"></div><div class="cloud" style="top:30px;animation-duration:38s"></div><div class="cloud" style="top:80px;animation-duration:52s;animation-delay:-20s;transform:scale(.7)"></div>
  <div class="hill h1"></div><div class="hill h2"></div><div class="ground"></div><div class="kite" style="left:68%;top:26%">🪁</div><div class="flutter" style="left:12%;top:38%">🦋</div>
  ${kids.map((k, i) => { const x = n === 1 ? 50 : 7 + i * (86 / (n - 1)); const act = ballPair && ballPair.includes(i) ? 'catch' : acts[i % acts.length];
    return `<div class="pk ${act === 'walk' ? 'walk' : act === 'hop' ? 'hop' : ''}" data-i="${i}" style="left:${x}%;--dx:${R(-50, 50)}px;--t:${R(6, 11)}s;--del:${-i * 1.1}s">${pAv(k, act === 'dance' ? 'dance' : act === 'walk' ? 'walk' : '')}<span class="pk-name">${esc(k.name)}</span></div>`; }).join('')}
  ${ballPair ? '<div class="ball"></div>' : ''}`;
  if (!ballPair) return;
  const ball = $('.ball', el), A = $(`.pk[data-i="${ballPair[0]}"]`, el), B = $(`.pk[data-i="${ballPair[1]}"]`, el);
  let t0 = performance.now(), dir = 0, raf;
  const tick = now => {
    const w = el.clientWidth, h = el.clientHeight, dur = 1500;
    let p = (now - t0) / dur;
    if (p >= 1) { t0 = now; p = 0; dir = 1 - dir; react(dir ? A : B, 'jump', 700); }
    const xa = A.offsetLeft + 10, xb = B.offsetLeft - 10;
    const from = dir ? xb : xa, to = dir ? xa : xb;
    const x = from + (to - from) * p, y = h - 120 - Math.sin(p * Math.PI) * Math.min(120, h * .35);
    ball.style.transform = `translate(${x - 13}px, ${y}px)`; ball.style.left = '0'; ball.style.top = '0';
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick); onCleanup(() => cancelAnimationFrame(raf));
}

/* ===================== strona startowa ===================== */
function vLanding() {
  const kids = Store.kids();
  view(`<div class="wrap hero">
    <div class="stack"><h1>Kraina Gier <span>klasy 2D</span></h1>
    <p class="lead">Mini gry z matematyki, polskiego, przyrody i angielskiego, dopasowane do drugiej klasy. Każde dziecko gra swoją postacią, a Pani zadaje zadania i widzi postępy.</p></div>
    <div id="pg"></div>
    <div class="hero-cta">
      <button class="cta-card" id="c-login"><span class="ic" style="background:#e6f3ff">🎮</span><span><b>Zaloguj się</b><span>E-mail rodzica i PIN</span></span></button>
      <button class="cta-card" id="c-reg"><span class="ic" style="background:#fff1c2">➕</span><span><b>Dodaj dziecko</b><span>Załóż konto i stwórz postać</span></span></button>
      <button class="cta-card" id="c-teach"><span class="ic" style="background:#efe9ff">👩‍🏫</span><span><b>Jestem nauczycielem</b><span>Tablica, zadania, wyniki</span></span></button>
    </div>
    <h2 class="sec-title" style="margin-top:14px">10 gier na start</h2>
    <div class="games-grid">${GAMES.map(g => gameCard(g)).join('')}</div>
    ${Store.mode === 'db' ? '<div class="note blue" style="margin-top:6px">Chcesz zobaczyć, jak to wygląda z całą klasą? <button class="link" id="c-demo">Otwórz pokaz z przykładowymi dziećmi i wynikami</button> (nie zmienia danych klasy).</div>' : ''}
  </div><footer class="foot wrap">Prototyp portalu dla klasy 2D. Gry ułożone według podstawy programowej edukacji wczesnoszkolnej (klasa 2).</footer>`);
  playground($('#pg'), kids);
  $('#c-login').onclick = () => go(vLogin);
  $('#c-reg').onclick = () => go(vRegister);
  $('#c-teach').onclick = () => go(vLogin, true);
  const dm = $('#c-demo'); if (dm) dm.onclick = () => setDemo(true);
  $$('.gcard').forEach(b => b.onclick = () => { toast('Zaloguj się, żeby zagrać swoją postacią.', 'Zaloguj', () => go(vLogin)); });
}
vLanding.live = true;
function gameCard(g, kidId) {
  const best = kidId ? [1, 2, 3].map(l => bestStars(kidId, g.id, l)).reduce((a, b) => a + b, 0) : null;
  return `<button class="gcard" data-g="${g.id}" style="--gc:${SUBJ[g.subj].c}"><span class="gs">${SUBJ[g.subj].n}</span><span class="gi">${g.icon}</span><b>${g.name}</b><span class="gd">${g.desc}</span>${best !== null ? `<span class="best">${'★'.repeat(Math.min(best, 9))}${best ? '' : '<span class="muted" style="letter-spacing:0">Jeszcze bez gwiazdek</span>'}</span>` : ''}</button>`;
}

/* ===================== logowanie ===================== */
const LOCKS = {};
function vLogin(teacherHint) {
  view(`<div class="wrap"><div class="auth card">
    <h2>${teacherHint ? 'Logowanie nauczyciela' : 'Zaloguj się'}</h2>
    <label class="field">E-mail ${teacherHint ? '' : 'rodzica'}<input id="l-email" type="email" autocomplete="email" inputmode="email" placeholder="${teacherHint ? 'nauczyciel@klasa2d.pl' : 'np. mama@poczta.pl'}"></label>
    <div id="l-pin"></div><p class="err" id="l-err"></p>
    <div class="row" style="justify-content:space-between"><button class="link" id="l-forgot">Zapomniałem PIN-u</button><button class="link" id="l-reg">Nie mam konta, dodaj dziecko</button></div>
  </div></div>`);
  const email = $('#l-email'); email.focus();
  const pad = pinPad($('#l-pin'), 'Wpisz 4-cyfrowy PIN', pin => {
    const e = email.value.trim().toLowerCase(), err = $('#l-err');
    if (!e) { pad.reset(); err.textContent = 'Najpierw wpisz adres e-mail.'; email.focus(); return; }
    const lk = LOCKS[e]; if (lk && lk.until > Date.now()) { pad.reset(); err.textContent = `Za dużo prób. Spróbuj za ${Math.ceil((lk.until - Date.now()) / 1000)} s.`; return; }
    const t = Store.teacher();
    if (e === t.email && hp(pin) === t.pin) { setMe('teacher'); sound('win'); return go(vTeacher, 'board'); }
    const k = Store.byEmail(e);
    if (!k || k.pin !== hp(pin)) {
      const l = LOCKS[e] = LOCKS[e] || { n: 0, until: 0 }; l.n++;
      if (l.n >= 5) { l.until = Date.now() + 60000; l.n = 0; }
      pad.reset('Spróbuj jeszcze raz'); sound('bad'); err.textContent = 'Nie pasuje e-mail albo PIN.'; return;
    }
    delete LOCKS[e]; setMe(k.id);
    if (!k.verified) return go(vVerify, k.id);
    sound('win'); goHome();
  });
  $('#l-forgot').onclick = () => go(vForgot, email.value);
  $('#l-reg').onclick = () => go(vRegister);
}

/* ===================== rejestracja ===================== */
function vRegister() {
  view(`<div class="wrap"><div class="auth card">
    <div class="steps-dots"><i class="on"></i><i></i><i></i><i></i></div>
    <h2>Dodaj dziecko</h2>
    <p class="muted">Konto zakłada rodzic. Na podany adres wyślemy kod, żeby potwierdzić, że to Twój e-mail.</p>
    <div id="r-body"></div><p class="err" id="r-err"></p>
    <button class="link" id="r-login">Mam już konto</button></div></div>`);
  $('#r-login').onclick = () => go(vLogin);
  const body = $('#r-body'), err = $('#r-err');
  let email = '', pin1 = '';
  const stepEmail = () => {
    body.innerHTML = `<div class="stack"><label class="field">E-mail rodzica<input id="r-email" type="email" autocomplete="email" inputmode="email" placeholder="np. mama@poczta.pl" value="${esc(email)}"></label><button class="btn" id="r-next">Dalej</button></div>`;
    const inp = $('#r-email'); inp.focus();
    const next = () => {
      email = inp.value.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = 'Wpisz poprawny adres e-mail.'; return; }
      if (email === Store.teacher().email) { err.textContent = 'Ten adres należy do konta nauczyciela.'; return; }
      const ex = Store.byEmail(email);
      if (ex && ex.verified) { err.innerHTML = 'To konto już istnieje. <button class="link" id="r-goforgot">Zapomniałem PIN-u</button>'; $('#r-goforgot').onclick = () => go(vForgot, email); return; }
      err.textContent = ''; $$('.steps-dots i')[1].classList.add('on'); stepPin();
    };
    $('#r-next').onclick = next; inp.onkeydown = e => { if (e.key === 'Enter') next(); };
  };
  const stepPin = () => {
    pinPad(body, 'Wymyśl 4-cyfrowy PIN dla dziecka', v => { pin1 = v; err.textContent = '';
      pinPad(body, 'Powtórz PIN', async v2 => {
        if (v2 !== pin1) { err.textContent = 'PIN-y się różnią. Wymyśl PIN jeszcze raz.'; sound('bad'); return stepPin(); }
        const ex = Store.byEmail(email);
        const k = ex || { id: uid('k'), created: Date.now() };
        Object.assign(k, { email, pin: hp(pin1), verified: false, code: String(R(100000, 999999)) });
        await Store.put('kids', k); setMe(k.id);
        sendMail(email, 'Kraina Gier 2D: kod potwierdzający', 'Wpisz ten kod w portalu, żeby potwierdzić adres e-mail i dokończyć zakładanie konta dziecka.', k.code);
        go(vVerify, k.id);
      });
    });
  };
  stepEmail();
}
function vVerify(kidId) {
  const k = Store.kid(kidId); if (!k) return go(vLanding);
  view(`<div class="wrap"><div class="auth card">
    <div class="steps-dots"><i class="on"></i><i class="on"></i><i class="on"></i><i></i></div>
    <h2>Sprawdź skrzynkę</h2>
    <p>Wysłaliśmy 6-cyfrowy kod na <b>${esc(k.email)}</b>. Wpisz go poniżej.</p>
    <div class="note blue">W prototypie e-mail trafia do <button class="link" id="v-mail">Poczty</button> w prawym górnym rogu.</div>
    <label class="field">Kod z e-maila<input id="v-code" class="code-input" inputmode="numeric" maxlength="6" autocomplete="one-time-code"></label>
    <p class="err" id="v-err"></p>
    <div class="row"><button class="btn mint" id="v-ok">Potwierdź</button><button class="btn ghost small" id="v-again">Wyślij kod ponownie</button></div></div></div>`);
  $('#v-mail').onclick = openMailbox;
  const inp = $('#v-code'); inp.focus();
  const ok = async () => {
    const kk = Store.kid(kidId);
    if (inp.value.trim() !== kk.code) { $('#v-err').textContent = 'Ten kod nie pasuje. Sprawdź e-mail.'; sound('bad'); return; }
    const n = Object.assign({}, kk, { verified: true }); delete n.code;
    await Store.put('kids', n); sound('win'); confetti(40); go(vName);
  };
  $('#v-ok').onclick = ok; inp.onkeydown = e => { if (e.key === 'Enter') ok(); };
  $('#v-again').onclick = async () => { const kk = Store.kid(kidId); kk.code = String(R(100000, 999999)); await Store.put('kids', kk); sendMail(kk.email, 'Kraina Gier 2D: nowy kod', 'Twój nowy kod potwierdzający.', kk.code); };
}
function vForgot(prefill) {
  view(`<div class="wrap"><div class="auth card"><h2>Nowy PIN</h2>
    <p class="muted">Wyślemy kod na e-mail rodzica. Po wpisaniu kodu ustawisz nowy PIN.</p>
    <div id="f-body"></div><p class="err" id="f-err"></p><button class="link" id="f-back">Wróć do logowania</button></div></div>`);
  $('#f-back').onclick = () => go(vLogin);
  const body = $('#f-body'), err = $('#f-err');
  body.innerHTML = `<div class="stack"><label class="field">E-mail<input id="f-email" type="email" value="${esc(prefill || '')}"></label><button class="btn" id="f-send">Wyślij kod</button></div>`;
  $('#f-send').onclick = async () => {
    const e = $('#f-email').value.trim().toLowerCase();
    const t = Store.teacher();
    const isT = e === t.email, k = isT ? null : Store.byEmail(e);
    if (!isT && !k) { err.textContent = 'Nie znamy tego adresu. Sprawdź pisownię albo załóż konto.'; return; }
    const code = String(R(100000, 999999));
    if (isT) { S._tcode = code; } else { const n = Object.assign({}, k, { reset: code }); await Store.put('kids', n); }
    sendMail(e, 'Kraina Gier 2D: zmiana PIN-u', 'Wpisz ten kod, żeby ustawić nowy PIN.', code);
    err.textContent = '';
    body.innerHTML = `<div class="stack"><label class="field">Kod z e-maila<input id="f-code" class="code-input" inputmode="numeric" maxlength="6"></label><button class="btn" id="f-ok">Dalej</button></div>`;
    $('#f-ok').onclick = () => {
      const c = $('#f-code').value.trim(); const want = isT ? S._tcode : (Store.kid(k.id) || {}).reset;
      if (c !== want) { err.textContent = 'Ten kod nie pasuje.'; return; }
      err.textContent = '';
      let p1 = '';
      const ask = () => pinPad(body, 'Nowy PIN', v => { p1 = v; pinPad(body, 'Powtórz nowy PIN', async v2 => {
        if (v2 !== p1) { err.textContent = 'PIN-y się różnią.'; return ask(); }
        if (isT) await Store.put('config', Object.assign({}, t, { pin: hp(p1) }));
        else { const n = Object.assign({}, Store.kid(k.id), { pin: hp(p1), verified: true }); delete n.reset; delete n.code; await Store.put('kids', n); }
        toast('PIN zmieniony. Możesz się zalogować.'); go(vLogin, isT);
      }); });
      ask();
    };
  };
}
function vName() {
  const k = me(); if (!k || k.teacher) return go(vLanding);
  view(`<div class="wrap"><div class="auth card">
    <div class="steps-dots"><i class="on"></i><i class="on"></i><i class="on"></i><i class="on"></i></div>
    <h2>Jak ma na imię dziecko?</h2><p class="muted">Wystarczy samo imię. Tak zobaczy je Pani i koledzy na tablicy.</p>
    <label class="field">Imię<input id="n-name" maxlength="20" autocomplete="off" value="${esc(k.name || '')}"></label><p class="err" id="n-err"></p>
    <button class="btn" id="n-ok">Dalej: stwórz postać ✨</button></div></div>`);
  const inp = $('#n-name'); inp.focus();
  const ok = async () => {
    const n = inp.value.trim().replace(/\s+/g, ' ');
    if (n.length < 2) { $('#n-err').textContent = 'Wpisz imię (co najmniej 2 litery).'; return; }
    await Store.put('kids', Object.assign({}, Store.kid(k.id), { name: n[0].toUpperCase() + n.slice(1) })); go(vAvatar, true);
  };
  $('#n-ok').onclick = ok; inp.onkeydown = e => { if (e.key === 'Enter') ok(); };
}

/* ===================== kreator awatara (zdjęcia + AI) ===================== */
function vAvatar(first) {
  const k = me(); if (!k || k.teacher) return go(vLanding);
  const av = Object.assign({}, DEFAULT_AV, k.avatar || {});
  const photos = []; // {file, url} — zostają tylko w pamięci tej karty
  let aiNote = '';
  view(`<div class="wrap maker">
    <div class="stage" id="stage"><div id="st-av"></div><h3>${esc(k.name)}</h3><p class="muted" id="st-style"></p></div>
    <div class="stack">
      <div class="card stack"><h2 style="font-size:26px">1. Zdjęcia dziecka (do 3)</h2>
        <p class="muted">Najlepiej twarz z przodu, w dobrym świetle. AI obejrzy zdjęcia i narysuje podobną postać: kolor włosów, fryzurę, oczy, okulary, piegi.</p>
        <div class="photos" id="photos"></div>
        <div class="ai-box"><div class="row"><button class="btn small" id="ai-go" disabled>✨ Narysuj postać ze zdjęć</button><span class="ai-out" id="ai-out"></span></div>
        <p class="muted" style="font-size:13px" id="ai-info">Zdjęcia nie są zapisywane w portalu. Do analizy wysyłamy je do Claude (AI) z konta osoby, która tworzy awatar; zapisujemy tylko narysowaną postać.</p></div>
      </div>
      <div class="card stack"><h2 style="font-size:26px">2. Wybierz styl</h2><div class="styles" id="styles"></div></div>
      <div class="card stack"><h2 style="font-size:26px">3. Popraw szczegóły</h2>
        <div><b>Skóra</b><div class="swatches" id="sw-skin"></div></div>
        <div><b>Włosy</b><div class="swatches" id="sw-hair"></div></div>
        <div><b>Fryzura</b><div class="chips" id="ch-hs"></div></div>
        <div><b>Oczy</b><div class="swatches" id="sw-eye"></div></div>
        <div class="chips" id="ch-x"></div>
      </div>
      <div class="row"><button class="btn sun" id="av-save">${first ? 'Gotowe! Zaczynamy grać 🎉' : 'Zapisz postać'}</button>${first ? '' : '<button class="btn ghost" id="av-cancel">Anuluj</button>'}</div>
    </div></div>`);
  const paint = () => {
    $('#st-av').innerHTML = avatarSVG(av, 'dance');
    $('#stage').style.setProperty('--stage', STYLE[av.style].bg);
    $('#st-style').textContent = STYLE[av.style].name + (aiNote ? ' · ' + aiNote : '');
    $('#styles').innerHTML = STYLES.map(s => `<button class="sty" data-s="${s.id}" aria-pressed="${s.id === av.style}" style="--sb:${s.bg}">${avatarSVG(Object.assign({}, av, { style: s.id }))}${s.name}</button>`).join('');
    $('#sw-skin').innerHTML = SKINS.map((c, i) => `<button class="sw" data-skin="${i}" aria-pressed="${i === av.skin}" style="background:${c}" aria-label="Skóra ${SKIN_N[i]}"></button>`).join('');
    $('#sw-hair').innerHTML = HAIRS.map((c, i) => `<button class="sw" data-hair="${i}" aria-pressed="${i === av.hair}" style="background:${c}" aria-label="Włosy ${HAIR_N[i]}"></button>`).join('');
    $('#sw-eye').innerHTML = EYES.map((c, i) => `<button class="sw" data-eye="${i}" aria-pressed="${i === av.eye}" style="background:${c}" aria-label="Oczy ${EYE_N[i]}"></button>`).join('');
    $('#ch-hs').innerHTML = HAIRSTYLES.map(([id, n]) => `<button data-hs="${id}" aria-pressed="${id === av.hairStyle}">${n}</button>`).join('');
    $('#ch-x').innerHTML = [['glasses', '👓 Okulary'], ['freckles', 'Piegi'], ['bow', '🎀 Spinka']].map(([id, n]) => `<button data-x="${id}" aria-pressed="${!!av[id]}">${n}</button>`).join('');
  };
  const paintPhotos = () => {
    $('#photos').innerHTML = photos.map((p, i) => `<div class="ph"><img src="${p.url}" alt="Zdjęcie ${i + 1}"><button data-rm="${i}" aria-label="Usuń zdjęcie">✕</button></div>`).join('')
      + (photos.length < 3 ? `<label class="ph-add">📷<br>Dodaj zdjęcie<input type="file" id="ph-in" accept="image/*" multiple hidden></label>` : '');
    const inp = $('#ph-in'); if (inp) inp.onchange = () => { [...inp.files].slice(0, 3 - photos.length).forEach(f => photos.push({ file: f, url: URL.createObjectURL(f) })); paintPhotos(); };
    $('#ai-go').disabled = !photos.length;
  };
  onCleanup(() => photos.forEach(p => URL.revokeObjectURL(p.url)));
  $('.maker').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.s) av.style = b.dataset.s;
    else if (b.dataset.skin) av.skin = +b.dataset.skin;
    else if (b.dataset.hair) av.hair = +b.dataset.hair;
    else if (b.dataset.eye) av.eye = +b.dataset.eye;
    else if (b.dataset.hs) av.hairStyle = b.dataset.hs;
    else if (b.dataset.x) av[b.dataset.x] = !av[b.dataset.x];
    else if (b.dataset.rm) { const p = photos.splice(+b.dataset.rm, 1)[0]; URL.revokeObjectURL(p.url); return paintPhotos(); }
    else return;
    paint();
  });
  $('#ai-go').onclick = async () => {
    const out = $('#ai-out'), btn = $('#ai-go'); btn.disabled = true;
    const close = magic('AI ogląda zdjęcia i rysuje postać…');
    try {
      const r = await aiAvatar(photos.map(p => p.file));
      Object.assign(av, r.av); aiNote = 'narysowane ze zdjęć'; out.textContent = r.note || 'Gotowe! Możesz jeszcze poprawić szczegóły.';
      sound('win'); confetti(30);
    } catch (e) {
      const local = await localColors(photos.map(p => p.file)).catch(() => null);
      if (local) { Object.assign(av, local); aiNote = 'kolory ze zdjęcia'; }
      out.textContent = aiError(e) + (local ? ' Odczytałem kolory skóry i włosów bez AI.' : '');
    } finally { close(); btn.disabled = !photos.length; paint(); }
  };
  $('#av-save').onclick = async () => {
    const close = magic('Tworzę Twoją postać…');
    await new Promise(r => setTimeout(r, 1100));
    await Store.put('kids', Object.assign({}, Store.kid(k.id), { avatar: Object.assign({}, av) }));
    close(); sound('win'); confetti(70); go(vChildHome);
  };
  const c = $('#av-cancel'); if (c) c.onclick = () => go(vChildHome);
  paint(); paintPhotos();
  aiAvailable().then(ok => { if (!ok) $('#ai-info').textContent = 'AI nie jest dostępne w tym widoku, więc ze zdjęcia odczytamy tylko kolor skóry i włosów (zdjęcie zostaje na urządzeniu).'; });
}
function magic(text) {
  const el = document.createElement('div'); el.className = 'magic';
  el.innerHTML = `<div class="card stack" role="status"><span class="sparkle">✨</span><h3>${esc(text)}</h3><p class="muted">To może potrwać do minuty.</p></div>`;
  document.body.appendChild(el); return () => el.remove();
}
async function getSample() { try { return window.claude && window.claude.use ? await window.claude.use('sample') : null; } catch (e) { return null; } }
async function aiAvailable() { const s = await getSample(); if (!s) return false; try { const l = await s.limits(); return !!(l && l.images); } catch (e) { return false; } }
function aiError(e) {
  const c = e && e.code;
  if (c === 'not_granted') return 'Nie zezwolono na użycie AI.';
  if (c === 'rate_limited') return 'AI jest teraz zajęte, spróbuj za chwilę.';
  if (c === 'no_face') return e.message;
  if (c === 'unavailable' || c === 'images_unavailable') return 'AI nie jest dostępne w tym widoku.';
  return 'AI nie dało rady tym razem.';
}
async function downscale(file, max = 768) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const s = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return await new Promise(res => c.toBlob(res, 'image/jpeg', .85));
  } finally { URL.revokeObjectURL(url); }
}
async function aiAvatar(files) {
  const sample = await getSample(); if (!sample) throw { code: 'unavailable' };
  const lim = await sample.limits().catch(() => null);
  if (!lim || !lim.images) throw { code: 'images_unavailable' };
  const blobs = await Promise.all(files.slice(0, Math.min(3, lim.images.maxCount || 3)).map(f => downscale(f)));
  const prompt = `Rysujesz kreskówkową postać dziecka do szkolnej gry edukacyjnej (klasa 2). Rodzic dodał ${blobs.length} zdjęcie/zdjęcia swojego dziecka i zgodził się na ich analizę.
Dobierz cechy postaci tak, żeby dziecko rozpoznało siebie. Odpowiedz WYŁĄCZNIE obiektem JSON:
{"skin": liczba 0-5 (kolor skóry od najjaśniejszej: ${SKIN_N.map((n, i) => i + '=' + n).join(', ')}),
 "hair": liczba 0-7 (${HAIR_N.map((n, i) => i + '=' + n).join(', ')}),
 "hairStyle": jedno z: ${HAIRSTYLES.map(h => `"${h[0]}" (${h[2]})`).join(', ')},
 "eye": liczba 0-3 (${EYE_N.map((n, i) => i + '=' + n).join(', ')}),
 "glasses": true/false, "freckles": true/false (tylko jeśli wyraźnie widać), "bow": true/false (spinka lub kokardka we włosach),
 "opis": "jedno krótkie, ciepłe zdanie po polsku dla dziecka o tym, co narysowałeś, bez ocen wyglądu"}
Jeśli na zdjęciach nie widać twarzy dziecka, odpowiedz {"blad": "krótka wskazówka po polsku, jakie zdjęcie dodać"}.`;
  const r = await sample.json(prompt, { images: blobs, modelTier: 'default' });
  if (!r || typeof r !== 'object') throw { code: 'bad' };
  if (r.blad) throw { code: 'no_face', message: String(r.blad) };
  const hs = HAIRSTYLES.map(h => h[0]).includes(r.hairStyle) ? r.hairStyle : 'short';
  return { av: { skin: clamp(+r.skin | 0, 0, 5), hair: clamp(+r.hair | 0, 0, 7), hairStyle: hs, eye: clamp(+r.eye | 0, 0, 3), glasses: !!r.glasses, freckles: !!r.freckles, bow: !!r.bow }, note: r.opis ? String(r.opis).slice(0, 200) : '' };
}
async function localColors(files) {
  const blob = await downscale(files[0], 120), url = URL.createObjectURL(blob);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const c = document.createElement('canvas'), N = 60; c.width = c.height = N; const x = c.getContext('2d');
    const s = Math.min(img.width, img.height); x.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, N, N);
    const d = x.getImageData(0, 0, N, N).data;
    const avg = (x0, y0, x1, y1) => { let r = 0, g = 0, b = 0, n = 0; for (let y = y0; y < y1; y++) for (let xx = x0; xx < x1; xx++) { const i = (y * N + xx) * 4; r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; } return [r / n, g / n, b / n]; };
    const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
    const near = (pal, rgb) => pal.map((p, i) => [i, hex(p).reduce((a, v, j) => a + (v - rgb[j]) ** 2, 0)]).sort((a, b) => a[1] - b[1])[0][0];
    return { skin: near(SKINS, avg(24, 26, 36, 38)), hair: near(HAIRS, avg(20, 2, 40, 9)) };
  } finally { URL.revokeObjectURL(url); }
}
