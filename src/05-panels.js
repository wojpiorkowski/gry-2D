/* ===================== ekran dziecka ===================== */
let HOME_FILTER = 'all';
function vChildHome() {
  const k = me(); if (!k || k.teacher) return go(vLanding);
  if (!k.verified) return go(vVerify, k.id); if (!k.name) return go(vName); if (!k.avatar) return go(vAvatar, true);
  const hws = hwFor(k.id).filter(h => !h.due || h.due >= dayKey(Date.now() - 3 * DAY));
  const today = Store.sessionsOf(k.id).filter(s => dayKey(s.date) === dayKey(Date.now())).reduce((a, s) => a + s.sec, 0);
  const open = hws.filter(h => { const p = hwProgress(k.id, h); return p.done < p.total; }).length;
  view(`<div class="wrap">
    <div class="home-hero"><div class="home-av" style="--stage:${STYLE[k.avatar.style].bg}" id="h-av">${avatarSVG(k.avatar)}<button class="btn ghost small" id="h-edit">✏️ Zmień postać</button></div>
      <div class="stack"><h1>Cześć, ${esc(k.name)}!</h1>
      <p class="lead">${open ? `Masz ${open} ${plural(open, 'zadanie', 'zadania', 'zadań')} od Pani. Zacznij od świecącego kółka!` : 'Wszystkie zadania zrobione. Wybierz dowolną grę!'}</p>
      <div class="row"><span class="stat-pill">⭐ <b>${points(k.id)}</b> punktów</span><span class="stat-pill">🔥 <b>${streak(k.id)}</b> ${plural(streak(k.id), 'dzień', 'dni', 'dni')} z rzędu</span><span class="stat-pill">⏱️ <b>${fmtSec(today)}</b> dziś</span></div></div></div>
    <h2 class="sec-title">Zadania od Pani</h2>
    ${hws.length ? `<div class="hw-grid">${hws.map(h => hwPath(k, h)).join('')}</div>` : '<div class="card"><p><b>Na razie nie ma zadań.</b> Możesz grać, w co chcesz! 🎈</p></div>'}
    <h2 class="sec-title" style="margin-top:28px">Wszystkie gry</h2>
    <div class="filters">${[['all', 'Wszystkie'], ...Object.entries(SUBJ).map(([id, s]) => [id, s.n])].map(([id, n]) => `<button data-f="${id}" aria-pressed="${HOME_FILTER === id}">${n}</button>`).join('')}</div>
    <div class="games-grid">${GAMES.filter(g => HOME_FILTER === 'all' || g.subj === HOME_FILTER).map(g => gameCard(g, k.id)).join('')}</div>
  </div><footer class="foot wrap">Pamiętaj o przerwach: po 20 minutach grania warto się poruszać! 🤸</footer>`);
  $('#h-edit').onclick = () => go(vAvatar, false);
  $('#h-av').onclick = e => { if (!e.target.closest('button')) react($('#h-av'), 'jump'); };
  $$('[data-f]').forEach(b => b.onclick = () => { HOME_FILTER = b.dataset.f; rerender(); });
  $$('.gcard').forEach(b => b.onclick = () => go(vLevels, b.dataset.g, { players: [k], mode: 'home' }));
  $$('.node').forEach(b => b.onclick = () => { const h = S.homework[b.dataset.hw], st = h.steps[+b.dataset.step]; go(vGame, st.game, st.level, { players: [Store.kid(k.id)], mode: 'home', hw: h.id }); });
}
vChildHome.live = true;
function hwPath(k, h) {
  const prog = hwProgress(k.id, h); let nextSet = false;
  const nodes = h.steps.map((st, i) => {
    const g = G[st.game]; if (!g) return '';
    const done = stepDone(k.id, h, st); const isNext = !done && !nextSet; if (isNext) nextSet = true;
    return `<div class="node-wrap"><button class="node ${done ? 'done' : isNext ? 'next' : 'locked'}" style="--gc:${SUBJ[g.subj].c}" data-hw="${h.id}" data-step="${i}" aria-label="${esc(g.name)}, etap ${st.level}">${g.icon}${done ? '<span class="ck">✓</span>' : ''}</button><span class="node-lbl">${esc(g.name)} · etap ${st.level} · ${'★'.repeat(st.min)}</span></div>`;
  }).join('');
  return `<div class="hw-card"><div class="hw-head"><h3>${esc(h.title)}</h3><span class="tag">${prog.done}/${prog.total}${h.due ? ' · do ' + fmtDate(new Date(h.due + 'T12:00')) : ''}</span></div>
    ${h.note ? `<p class="muted">${esc(h.note)}</p>` : ''}${prog.done === prog.total ? '<p><b>🏆 Zrobione! Brawo!</b></p>' : ''}<div class="path">${nodes}</div></div>`;
}

/* ===================== wybór etapu ===================== */
function backTo(ctx) { if (ctx.mode === 'lesson') go(vTeacher, 'board'); else go(vChildHome); }
function vLevels(gid, ctx) {
  const g = G[gid]; const p0 = ctx.players[0];
  const partnerPick = g.coop && ctx.players.length < 2;
  let partner = GUEST;
  view(`<div class="wrap"><div class="card stack" style="margin-top:20px;--gc:${SUBJ[g.subj].c}">
    <div class="row"><span class="gi" style="width:76px;height:76px;border-radius:22px;display:grid;place-items:center;font-size:44px;background:color-mix(in srgb,var(--gc) 18%, #fff)">${g.icon}</span>
    <div><h2 style="font-size:36px">${g.name}</h2><p class="muted"><b>${SUBJ[g.subj].n}</b> · ${g.desc}</p></div></div>
    <p style="font-size:19px">${g.how}</p>
    <div class="row">${ctx.players.map(p => `<span class="me-chip"><span class="mini">${avatarSVG(avOf(p))}</span>${esc(p.name)}</span>`).join('')}</div>
    ${partnerPick ? `<div><b>Z kim grasz?</b><div class="chips" id="partner" style="margin-top:6px"><button data-p="guest" aria-pressed="true">👨‍👩‍👧 Mama, tata albo rodzeństwo</button>${ctx.mode === 'lesson' ? Store.kids().filter(x => x.id !== p0.id).map(x => `<button data-p="${x.id}" aria-pressed="false">${esc(x.name)}</button>`).join('') : ''}</div></div>` : ''}
    <div class="levels">${g.levels.map((l, i) => { const b = p0.guest ? 0 : bestStars(p0.id, g.id, i + 1); return `<button class="lvl" data-l="${i + 1}"><b>Etap ${i + 1}</b><span>${l}</span><span class="st">${'★'.repeat(b)}${'☆'.repeat(3 - b)}</span></button>`; }).join('')}</div>
    <div><button class="btn ghost" id="lv-back">← Wróć</button></div></div></div>`);
  $('#lv-back').onclick = () => backTo(ctx);
  const pp = $('#partner'); if (pp) pp.onclick = e => { const b = e.target.closest('[data-p]'); if (!b) return; $$('[data-p]', pp).forEach(x => x.setAttribute('aria-pressed', x === b)); partner = b.dataset.p === 'guest' ? GUEST : Store.kid(b.dataset.p); };
  $$('.lvl').forEach(b => b.onclick = () => go(vGame, gid, +b.dataset.l, Object.assign({}, ctx, { players: partnerPick ? [ctx.players[0], partner] : ctx.players })));
}

/* ===================== panel nauczyciela ===================== */
let BOARD_SEL = [];
function vTeacher(tab = 'board') {
  const m = me(); if (!m || !m.teacher) return go(vLogin, true);
  view(`<div class="wrap"><div class="tabs" role="tablist">${[['board', '🎯 Tablica'], ['hw', '📚 Zadania domowe'], ['stats', '📊 Wyniki i czas'], ['set', '⚙️ Ustawienia']].map(([id, n]) => `<button role="tab" data-tab="${id}" aria-selected="${id === tab}">${n}</button>`).join('')}</div><div id="tpane"></div></div>`);
  $$('[data-tab]').forEach(b => b.onclick = () => go(vTeacher, b.dataset.tab));
  ({ board: tBoard, hw: tHw, stats: tStats, set: tSet })[tab]($('#tpane'));
}
vTeacher.live = true;
function tBoard(el) {
  const kids = Store.kids();
  BOARD_SEL = BOARD_SEL.filter(id => Store.kid(id));
  el.innerHTML = `<div id="pg"></div>
  <div class="row" style="justify-content:space-between;margin-top:20px"><h2 class="sec-title" style="margin:0">Kto gra przy tablicy?</h2><button class="btn sun small" id="b-rand">🎲 Losuj dziecko</button></div>
  <p class="muted" style="margin:6px 0 12px">Dotknij jednej postaci albo dwóch (do gry w parze). Wyniki zapiszą się dzieciom.</p>
  ${kids.length ? `<div class="kids-grid">${kids.map(k => `<button class="kid" data-k="${k.id}" aria-pressed="${BOARD_SEL.includes(k.id)}" style="--sb:${STYLE[avOf(k).style].bg}">${BOARD_SEL.includes(k.id) ? `<span class="pick-n">${BOARD_SEL.indexOf(k.id) + 1}</span>` : ''}${k.demo ? '<span class="demo">przykład</span>' : ''}${avatarSVG(avOf(k))}${esc(k.name)}</button>`).join('')}</div>`
      : '<div class="card"><p><b>Nie ma jeszcze dzieci.</b> Gdy rodzice dodadzą dzieci na stronie głównej, ich postacie pojawią się tutaj.</p></div>'}
  <h2 class="sec-title" style="margin-top:26px">Wybierz grę</h2>
  <div class="games-grid">${GAMES.map(g => gameCard(g)).join('')}</div>
  <div class="board-bar"><div class="sel">${BOARD_SEL.length ? BOARD_SEL.map(id => { const k = Store.kid(id); return `<span class="mini">${avatarSVG(avOf(k))}</span>${esc(k.name)}`; }).join(' + ') : 'Nikt nie jest wybrany'}</div>${BOARD_SEL.length ? '<button class="btn ghost small" id="b-clear">Wyczyść</button>' : ''}</div>`;
  playground($('#pg'), kids);
  $$('.kid', el).forEach(b => b.onclick = () => {
    const id = b.dataset.k; if (BOARD_SEL.includes(id)) BOARD_SEL = BOARD_SEL.filter(x => x !== id); else { BOARD_SEL.push(id); if (BOARD_SEL.length > 2) BOARD_SEL.shift(); sound('tap'); }
    rerender();
  });
  const c = $('#b-clear'); if (c) c.onclick = () => { BOARD_SEL = []; rerender(); };
  $('#b-rand').onclick = () => {
    if (!kids.length) return; const btns = $$('.kid', el); let n = 0; const target = R(12, 20);
    const t = setInterval(() => { btns.forEach(b => b.style.outline = ''); const b = btns[n % btns.length]; b.style.outline = '5px solid #ff6f61'; sound('tap'); n++;
      if (n > target) { clearInterval(t); const id = b.dataset.k; BOARD_SEL = [id]; sound('win'); confetti(30); setTimeout(rerender, 600); } }, 110);
    onCleanup(() => clearInterval(t));
  };
  $$('.gcard', el).forEach(b => b.onclick = () => {
    if (!BOARD_SEL.length) { toast('Najpierw dotknij postaci dziecka, które będzie grać.'); return; }
    go(vLevels, b.dataset.g, { players: BOARD_SEL.map(id => Store.kid(id)), mode: 'lesson' });
  });
}
function recipients(h) { const kids = Store.kids(); return h.to === 'all' ? kids : kids.filter(k => h.to.includes(k.id)); }
function tHw(el) {
  const hws = Store.homework();
  el.innerHTML = `<div class="row" style="margin-bottom:16px"><button class="btn" id="hw-new">➕ Nowe zadanie</button><button class="btn sun" id="hw-sug">✨ Zadania dopasowane do każdego dziecka</button></div>
  ${hws.length ? `<div class="stack">${hws.map(h => { const rc = recipients(h); const done = rc.filter(k => { const p = hwProgress(k.id, h); return p.done === p.total; }).length;
    return `<div class="card stack"><div class="hw-head"><div><h3 style="font-size:26px">${esc(h.title)}</h3><p class="muted">${h.to === 'all' ? 'Cała klasa' : rc.map(k => esc(k.name)).join(', ') || 'Brak dzieci'}${h.due ? ' · termin ' + fmtDate(new Date(h.due + 'T12:00')) : ''} · ukończyło ${done}/${rc.length}</p></div>
      <div class="row"><button class="btn ghost small" data-edit="${h.id}">Edytuj</button><button class="btn ghost small" data-del="${h.id}">Usuń</button></div></div>
      ${h.note ? `<p>${esc(h.note)}</p>` : ''}
      <div class="row">${h.steps.map((s, i) => { const g = G[s.game]; return g ? `<span class="step-chip" style="--gc:${SUBJ[g.subj].c}">${i + 1}. ${g.icon} ${g.name} · etap ${s.level} · ${'★'.repeat(s.min)}</span>` : ''; }).join('')}</div>
      <div class="matrix">${rc.map(k => { const p = hwProgress(k.id, h); return `<div class="mrow"><span class="who"><span class="av-mini">${avatarSVG(avOf(k))}</span>${esc(k.name)}</span>${h.steps.map((s, i) => `<span class="cell ${stepDone(k.id, h, s) ? 'ok' : ''}">${stepDone(k.id, h, s) ? '✓' : i + 1}</span>`).join('')}<span class="muted" style="font-weight:800">${p.done}/${p.total}</span></div>`; }).join('')}</div></div>`; }).join('')}</div>`
      : '<div class="card"><p>Nie ma jeszcze zadań domowych. Dodaj pierwsze albo użyj zadań dopasowanych do każdego dziecka.</p></div>'}`;
  $$('.who .av-mini', el).forEach(x => { x.style.display = 'inline-block'; x.style.width = '34px'; x.style.height = '44px'; });
  $('#hw-new').onclick = () => go(vHwEdit, null);
  $('#hw-sug').onclick = suggestHw;
  $$('[data-edit]', el).forEach(b => b.onclick = () => go(vHwEdit, b.dataset.edit));
  $$('[data-del]', el).forEach(b => b.onclick = async () => {
    if (b.dataset.sure) { await Store.del('homework', b.dataset.del); toast('Usunięto zadanie.'); rerender(); }
    else { b.dataset.sure = '1'; b.textContent = 'Na pewno usunąć?'; b.classList.add('coral'); b.classList.remove('ghost'); }
  });
}
const SUBJ_GAMES = { mat: ['rakieta', 'jablka', 'zegar', 'sklepik'], pol: ['balony', 'pociag', 'slowa'], prz: ['eko'], ang: ['memory'] };
function suggestLevel(kidId, game) { let lv = 1; [1, 2].forEach(l => { if (bestStars(kidId, game, l) >= 2) lv = l + 1; }); return lv; }
function suggestHw() {
  const kids = Store.kids();
  if (!kids.length) return toast('Nie ma jeszcze dzieci w klasie.');
  const plans = kids.map(k => {
    const subj = weakest(k.id), games = SUBJ_GAMES[subj];
    const g1 = games.slice().sort((a, b) => accOf(k.id, a) - accOf(k.id, b))[0], g2 = games.length > 1 ? games.filter(x => x !== g1)[0] : g1;
    const l1 = suggestLevel(k.id, g1), l2 = g2 === g1 ? Math.min(3, l1 + 1) : suggestLevel(k.id, g2);
    return { k, subj, steps: [{ game: g1, level: l1, min: 2 }, { game: g2, level: l2, min: 2 }] };
  });
  modal(`<div class="modal-h"><h3>Zadania dopasowane do dzieci</h3><button class="x" data-close aria-label="Zamknij">✕</button></div>
    <p class="muted">Dla każdego dziecka portal wybrał obszar z najsłabszymi wynikami (albo taki, w którym jeszcze nie grało). Możesz odznaczyć dzieci, którym nie chcesz zadawać.</p>
    <div class="stack">${plans.map((p, i) => `<label class="row" style="background:#f6f8fb;border-radius:16px;padding:8px 12px"><input type="checkbox" checked data-i="${i}" style="width:22px;height:22px"><span class="who"><span style="display:inline-block;width:34px;height:44px">${avatarSVG(avOf(p.k))}</span>${esc(p.k.name)}</span><span class="tag" style="background:${SUBJ[p.subj].c};color:#fff">${SUBJ[p.subj].n}</span>${p.steps.map(s => `<span class="step-chip" style="--gc:${SUBJ[p.subj].c}">${G[s.game].icon} ${G[s.game].name} · etap ${s.level}</span>`).join('')}</label>`).join('')}</div>
    <label class="field">Termin<input type="date" id="sg-due" value="${dayKey(Date.now() + 7 * DAY)}"></label>
    <div class="row"><button class="btn" id="sg-ok">Zadaj zaznaczonym</button><button class="btn ghost" data-close>Anuluj</button></div>`, (m, close) => {
    $('#sg-ok', m).onclick = async () => {
      const due = $('#sg-due', m).value; let n = 0;
      for (const cb of $$('input[type=checkbox]', m)) { if (!cb.checked) continue; const p = plans[+cb.dataset.i]; n++;
        await Store.put('homework', { id: uid('hw'), title: `${p.k.name}: ${SUBJ[p.subj].n.toLowerCase()}`, note: 'Zadanie dopasowane do Ciebie. Powodzenia!', due, to: [p.k.id], created: Date.now(), steps: p.steps }); }
      close(); toast(`Zadano ${n} ${plural(n, 'zadanie', 'zadania', 'zadań')}.`); rerender();
    };
  });
}
function accOf(kidId, game) { const ss = Store.sessionsOf(kidId).filter(s => s.game === game); const c = ss.reduce((a, s) => a + s.correct, 0), t = ss.reduce((a, s) => a + s.total, 0); return t ? c / t : -1; }
function vHwEdit(id) {
  const m = me(); if (!m || !m.teacher) return go(vLogin, true);
  const h = id ? JSON.parse(JSON.stringify(S.homework[id])) : { id: uid('hw'), title: '', note: '', due: dayKey(Date.now() + 7 * DAY), to: 'all', created: Date.now(), steps: [{ game: 'rakieta', level: 1, min: 2 }] };
  const kids = Store.kids();
  view(`<div class="wrap"><div class="card stack" style="margin-top:20px;max-width:900px">
    <h2 style="font-size:32px">${id ? 'Edytuj zadanie' : 'Nowe zadanie domowe'}</h2>
    <label class="field">Tytuł<input id="e-title" maxlength="60" placeholder="np. Ćwiczymy ó i u" value="${esc(h.title)}"></label>
    <label class="field">Wiadomość dla dzieci (opcjonalnie)<input id="e-note" maxlength="140" value="${esc(h.note)}"></label>
    <label class="field" style="max-width:240px">Termin<input id="e-due" type="date" value="${esc(h.due)}"></label>
    <div><b>Dla kogo?</b><div class="chips" id="e-to" style="margin-top:6px"><button data-to="all" aria-pressed="${h.to === 'all'}">Cała klasa</button>${kids.map(k => `<button data-to="${k.id}" aria-pressed="${Array.isArray(h.to) && h.to.includes(k.id)}">${esc(k.name)}</button>`).join('')}</div></div>
    <div><b>Kroki (jak ścieżka w Duolingo)</b><p class="muted">Dziecko zalicza krok, gdy zdobędzie wymaganą liczbę gwiazdek na tym etapie albo wyższym.</p></div>
    <div class="editor-steps" id="e-steps"></div>
    <div class="row"><button class="btn ghost small" id="e-add">➕ Dodaj krok</button><span class="muted">Szybko:</span><button class="btn ghost small" data-tpl="pol">Ortografia</button><button class="btn ghost small" data-tpl="mat">Matematyka</button><button class="btn ghost small" data-tpl="mix">Mieszanka</button></div>
    <p class="err" id="e-err"></p>
    <div class="row"><button class="btn mint" id="e-save">Zapisz i zadaj</button><button class="btn ghost" id="e-cancel">Anuluj</button></div></div></div>`);
  const TPL = { pol: [['balony', 1], ['balony', 2], ['pociag', 1], ['slowa', 1]], mat: [['rakieta', 1], ['rakieta', 2], ['jablka', 1], ['zegar', 1]], mix: [['rakieta', 2], ['balony', 1], ['eko', 1], ['memory', 1], ['zegar', 1]] };
  const paintSteps = () => {
    $('#e-steps').innerHTML = h.steps.map((s, i) => `<div class="editor-step"><label class="field">Gra<select data-i="${i}" data-f="game">${GAMES.map(g => `<option value="${g.id}" ${g.id === s.game ? 'selected' : ''}>${g.icon} ${g.name}</option>`).join('')}</select></label>
      <label class="field">Etap<select data-i="${i}" data-f="level">${[1, 2, 3].map(l => `<option value="${l}" ${l === s.level ? 'selected' : ''}>Etap ${l}: ${G[s.game].levels[l - 1]}</option>`).join('')}</select></label>
      <label class="field">Gwiazdki<select data-i="${i}" data-f="min">${[1, 2, 3].map(l => `<option value="${l}" ${l === s.min ? 'selected' : ''}>${'★'.repeat(l)}</option>`).join('')}</select></label>
      <button class="btn ghost small" data-rm="${i}" aria-label="Usuń krok">✕</button></div>`).join('');
  };
  $('#e-steps').addEventListener('change', e => { const t = e.target; if (!t.dataset.f) return; const s = h.steps[+t.dataset.i]; s[t.dataset.f] = t.dataset.f === 'game' ? t.value : +t.value; paintSteps(); });
  $('#e-steps').addEventListener('click', e => { const b = e.target.closest('[data-rm]'); if (!b) return; h.steps.splice(+b.dataset.rm, 1); paintSteps(); });
  $('#e-add').onclick = () => { h.steps.push({ game: 'balony', level: 1, min: 2 }); paintSteps(); };
  $$('[data-tpl]').forEach(b => b.onclick = () => { h.steps = TPL[b.dataset.tpl].map(([game, level]) => ({ game, level, min: 2 })); if (!$('#e-title').value) $('#e-title').value = b.textContent; paintSteps(); });
  $('#e-to').onclick = e => {
    const b = e.target.closest('[data-to]'); if (!b) return;
    if (b.dataset.to === 'all') h.to = 'all';
    else { let arr = Array.isArray(h.to) ? h.to.slice() : []; arr = arr.includes(b.dataset.to) ? arr.filter(x => x !== b.dataset.to) : arr.concat(b.dataset.to); h.to = arr.length ? arr : 'all'; }
    $$('[data-to]').forEach(x => x.setAttribute('aria-pressed', x.dataset.to === 'all' ? h.to === 'all' : Array.isArray(h.to) && h.to.includes(x.dataset.to)));
  };
  $('#e-cancel').onclick = () => go(vTeacher, 'hw');
  $('#e-save').onclick = async () => {
    h.title = $('#e-title').value.trim(); h.note = $('#e-note').value.trim(); h.due = $('#e-due').value;
    if (!h.title) { $('#e-err').textContent = 'Wpisz tytuł zadania.'; return; }
    if (!h.steps.length) { $('#e-err').textContent = 'Dodaj co najmniej jeden krok.'; return; }
    await Store.put('homework', h); toast('Zadanie zapisane. Dzieci zobaczą je po zalogowaniu.'); go(vTeacher, 'hw');
  };
  paintSteps();
}
function tStats(el) {
  const kids = Store.kids(), wk = Date.now() - 7 * DAY;
  const all = kids.flatMap(k => Store.sessionsOf(k.id)), week = all.filter(s => s.date >= wk);
  const c = week.reduce((a, s) => a + s.correct, 0), t = week.reduce((a, s) => a + s.total, 0);
  const hwAll = Store.homework().flatMap(h => recipients(h).map(k => hwProgress(k.id, h)));
  const hwDone = hwAll.filter(p => p.done === p.total).length;
  el.innerHTML = `<div class="tiles-row">
    <div class="tile-stat"><b>${fmtSec(week.reduce((a, s) => a + s.sec, 0))}</b><span>czas gry całej klasy w 7 dni</span></div>
    <div class="tile-stat"><b>${week.length}</b><span>rozegranych gier w 7 dni</span></div>
    <div class="tile-stat"><b>${t ? Math.round(c / t * 100) : 0}%</b><span>dobrych odpowiedzi w 7 dni</span></div>
    <div class="tile-stat"><b>${hwDone}/${hwAll.length}</b><span>ukończonych zadań domowych</span></div></div>
  <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Dziecko</th><th>Czas (7 dni)</th><th>Czas łącznie</th><th>Gry</th><th>Dobre odpowiedzi</th><th>Zadania domowe</th><th>Do poćwiczenia</th><th>Ostatnio</th></tr></thead><tbody>
  ${kids.map(k => { const ss = Store.sessionsOf(k.id), w = ss.filter(s => s.date >= wk); const cc = ss.reduce((a, s) => a + s.correct, 0), tt = ss.reduce((a, s) => a + s.total, 0);
    const hp_ = hwFor(k.id).map(h => hwProgress(k.id, h)); const hd = hp_.filter(p => p.done === p.total).length; const wkst = weakest(k.id); const acc = tt ? Math.round(cc / tt * 100) : 0;
    return `<tr class="click" data-k="${k.id}"><td><span class="who"><span style="display:inline-block;width:34px;height:44px">${avatarSVG(avOf(k))}</span>${esc(k.name)}</span></td><td class="num">${fmtSec(w.reduce((a, s) => a + s.sec, 0))}</td><td class="num">${fmtSec(ss.reduce((a, s) => a + s.sec, 0))}</td><td class="num">${ss.length}</td>
    <td><div class="row" style="gap:8px;flex-wrap:nowrap"><div class="bar" style="flex:1"><i style="width:${acc}%"></i></div><span class="num">${tt ? acc + '%' : '–'}</span></div></td><td class="num">${hd}/${hp_.length}</td><td><span class="subj-dot" style="--bc:${SUBJ[wkst].c}"></span>${SUBJ[wkst].n}</td><td>${ss[0] ? fmtDate(ss[0].date) : '–'}</td></tr>`; }).join('')}
  </tbody></table></div><p class="muted" style="margin-top:10px">Dotknij wiersza, żeby zobaczyć szczegóły dziecka.</p>`;
  $$('tr[data-k]', el).forEach(r => r.onclick = () => kidDetail(Store.kid(r.dataset.k)));
}
function kidDetail(k) {
  const ss = Store.sessionsOf(k.id), st = subjStats(k.id);
  const days = Array.from({ length: 14 }, (_, i) => { const t = Date.now() - (13 - i) * DAY; const key = dayKey(t); return { t, sec: ss.filter(s => dayKey(s.date) === key).reduce((a, s) => a + s.sec, 0) }; });
  const maxSec = Math.max(60, ...days.map(d => d.sec));
  modal(`<div class="modal-h"><div class="who" style="font-size:24px;font-family:var(--display)"><span style="display:inline-block;width:56px;height:72px">${avatarSVG(avOf(k))}</span>${esc(k.name)}</div><button class="x" data-close aria-label="Zamknij">✕</button></div>
    <p class="muted">${esc(k.email)} · ${ss.length} ${plural(ss.length, 'gra', 'gry', 'gier')} · łącznie ${fmtSec(ss.reduce((a, s) => a + s.sec, 0))}</p>
    <h4>Obszary</h4>
    <div class="stack" style="gap:8px">${Object.entries(SUBJ).map(([id, s]) => { const o = st[id], a = o.t ? Math.round(o.c / o.t * 100) : 0; return `<div class="row" style="flex-wrap:nowrap"><span style="width:130px;font-weight:800;flex:none">${s.n}</span><div class="bar" style="flex:1;--bc:${s.c}"><i style="width:${a}%"></i></div><span class="num" style="width:120px;flex:none;text-align:right">${o.t ? a + '%' : 'brak gier'} · ${fmtSec(o.sec)}</span></div>`; }).join('')}</div>
    <h4>Czas gry w ostatnich 14 dniach</h4>
    <div class="daybars">${days.map(d => `<div title="${fmtDate(d.t)}: ${fmtSec(d.sec)}"><i style="height:${Math.round(d.sec / maxSec * 100)}%"></i>${new Date(d.t).getDate()}</div>`).join('')}</div>
    <p class="muted" style="font-size:13px">Najdłuższy dzień: ${fmtSec(Math.max(...days.map(d => d.sec)))}.</p>
    <h4>Zadania domowe</h4>
    ${hwFor(k.id).map(h => { const p = hwProgress(k.id, h); return `<div class="row"><b>${esc(h.title)}</b><span class="tag">${p.done}/${p.total}</span>${h.steps.map(s => `<span class="cell ${stepDone(k.id, h, s) ? 'ok' : ''}">${G[s.game] ? G[s.game].icon : ''}</span>`).join('')}</div>`; }).join('') || '<p class="muted">Brak zadań.</p>'}
    <h4>Ostatnie gry</h4>
    <div class="tbl-wrap" style="box-shadow:none;border:2px solid #eef2f8"><table class="tbl" style="min-width:560px"><thead><tr><th>Kiedy</th><th>Gra</th><th>Etap</th><th>Wynik</th><th>Gwiazdki</th><th>Czas</th><th>Gdzie</th></tr></thead><tbody>
    ${ss.slice(0, 25).map(s => `<tr><td>${new Date(s.date).toLocaleString('pl-PL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td><td>${G[s.game] ? G[s.game].icon + ' ' + G[s.game].name : s.game}</td><td class="num">${s.level}</td><td class="num">${s.correct}/${s.total}${s.done === false ? ' (przerwana)' : ''}</td><td style="color:#e0a800">${'★'.repeat(s.stars)}</td><td class="num">${fmtSec(s.sec)}</td><td>${s.mode === 'lesson' ? 'lekcja' : 'dom'}</td></tr>`).join('') || '<tr><td colspan="7">Jeszcze nie grało.</td></tr>'}
    </tbody></table></div>`);
}
function tSet(el) {
  const t = Store.teacher(), kids = Object.values(S.kids).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pl')), demo = kids.filter(k => k.demo).length;
  el.innerHTML = `<div class="stack">
    <div class="card stack"><h3 style="font-size:24px">Konto nauczyciela</h3>
      <label class="field" style="max-width:420px">E-mail<input id="s-email" type="email" value="${esc(t.email)}"></label>
      <label class="field" style="max-width:200px">Nowy PIN (4 cyfry)<input id="s-pin" inputmode="numeric" maxlength="4" placeholder="••••"></label>
      <p class="err" id="s-err"></p><div><button class="btn small" id="s-save">Zapisz</button></div></div>
    <div class="card stack"><h3 style="font-size:24px">Dzieci w klasie (${kids.length})</h3>
      ${demo ? `<div class="row"><span class="muted">${demo} ${plural(demo, 'przykładowe dziecko', 'przykładowe dzieci', 'przykładowych dzieci')} do pokazu.</span><button class="btn coral small" id="s-demo">Usuń przykładowe dzieci</button></div>` : ''}
      <div class="tbl-wrap" style="box-shadow:none;border:2px solid #eef2f8"><table class="tbl" style="min-width:520px"><thead><tr><th>Dziecko</th><th>E-mail rodzica</th><th>Stan</th><th></th></tr></thead><tbody>
      ${kids.map(k => `<tr><td><span class="who">${k.avatar ? `<span style="display:inline-block;width:30px;height:40px">${avatarSVG(k.avatar)}</span>` : ''}${esc(k.name || '(bez imienia)')}</span></td><td>${esc(k.email)}</td><td>${k.verified ? (k.avatar ? 'gotowe' : 'bez postaci') : 'niepotwierdzony e-mail'}</td><td><button class="btn ghost small" data-delk="${k.id}">Usuń</button></td></tr>`).join('')}
      </tbody></table></div></div>
    <div class="card stack"><h3 style="font-size:24px">Gdzie są dane</h3>
      <p>${Store.mode === 'db' ? 'Konta, postacie, wyniki i zadania są we wspólnej bazie tej strony na claude.ai. Widzą je osoby, którym udostępniono stronę. Zdjęć dzieci nie zapisujemy.' : 'Tryb pokazowy: wszystko zapisuje się tylko w tej przeglądarce.'}</p>
      ${Store.mode === 'local' ? '<div><button class="btn ghost small" id="s-reset">Przywróć dane pokazowe</button></div>' : ''}</div></div>`;
  $('#s-save').onclick = async () => {
    const e = $('#s-email').value.trim().toLowerCase(), p = $('#s-pin').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { $('#s-err').textContent = 'Wpisz poprawny e-mail.'; return; }
    if (p && !/^\d{4}$/.test(p)) { $('#s-err').textContent = 'PIN to 4 cyfry.'; return; }
    await Store.put('config', { email: e, pin: p ? hp(p) : t.pin }); toast('Zapisano dane nauczyciela.'); rerender();
  };
  const d = $('#s-demo'); if (d) d.onclick = async () => {
    if (!d.dataset.sure) { d.dataset.sure = 1; d.textContent = 'Na pewno? Usunie też ich wyniki'; return; }
    for (const k of kids.filter(x => x.demo)) { for (const s of Store.sessionsOf(k.id)) await Store.del('sessions', s.id); await Store.del('kids', k.id); }
    for (const h of Store.homework()) { if (Array.isArray(h.to) && !h.to.some(id => S.kids[id])) await Store.del('homework', h.id); }
    toast('Usunięto przykładowe dzieci.'); rerender();
  };
  $$('[data-delk]', el).forEach(b => b.onclick = async () => {
    if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = 'Na pewno?'; b.classList.add('coral'); return; }
    const id = b.dataset.delk; for (const s of Store.sessionsOf(id)) await Store.del('sessions', s.id); await Store.del('kids', id); toast('Usunięto konto dziecka.'); rerender();
  });
  const r = $('#s-reset'); if (r) r.onclick = () => { S.kids = {}; S.sessions = {}; S.homework = {}; seedLocal(); toast('Przywrócono dane pokazowe.'); rerender(); };
}
