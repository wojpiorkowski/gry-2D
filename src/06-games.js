/* ===================== gry ===================== */
const SUBJ = { mat: { n: 'Matematyka', c: 'var(--mat)' }, pol: { n: 'Język polski', c: 'var(--pol)' }, prz: { n: 'Przyroda', c: 'var(--prz)' }, ang: { n: 'Angielski', c: 'var(--ang)' }, coop: { n: 'Razem', c: 'var(--coop)' } };
function numOpts(ans, n = 4, spread = [1, 2, 10, 3, 5]) {
  const s = new Set([ans]);
  for (const v of shuffle(spread.flatMap(d => [ans + d, ans - d]))) { if (s.size >= n) break; if (v >= 0) s.add(v); }
  let k = 1; while (s.size < n) s.add(ans + 10 + k++);
  return shuffle([...s]).map(String);
}
const verb = op => op === '+' ? 'dodać' : 'odjąć';

function genRocket(L) {
  let a, b, op = Math.random() < .5 ? '+' : '-', box = false;
  if (L === 1) { if (op === '+') { a = R(2, 15); b = R(1, 20 - a); } else { a = R(6, 20); b = R(1, a - 1); } }
  else if (L === 2) {
    if (Math.random() < .5) { if (op === '+') { a = R(1, 8) * 10; b = R(1, 9 - a / 10) * 10; } else { a = R(3, 9) * 10; b = R(1, a / 10 - 1) * 10; } }
    else { if (op === '+') { a = R(2, 8) * 10 + R(0, 4); b = R(1, 5); } else { a = R(2, 9) * 10 + R(5, 9); b = R(1, 5); } }
  } else {
    if (op === '+') { do { a = R(12, 79); b = R(3, 29); } while (a + b > 100 || (a % 10) + (b % 10) < 10); }
    else { do { a = R(21, 99); b = R(3, 29); } while (a - b < 1 || (a % 10) >= (b % 10)); }
    box = Math.random() < .35;
  }
  const ans = op === '+' ? a + b : a - b;
  if (box) return { prompt: `<div class="eq"><span class="box">?</span> ${op} ${b} = ${ans}</div><p class="hint">Jaka liczba pasuje do okienka?</p>`, say: `Jaka liczba ${verb(op)} ${b} daje ${ans}?`, options: numOpts(a), answer: String(a), layout: 'four' };
  return { prompt: `<div class="eq">${a} ${op} ${b} = <span class="box">?</span></div>`, say: `Ile to jest ${a} ${verb(op)} ${b}?`, options: numOpts(ans), answer: String(ans), layout: 'four' };
}
function genApples(L) {
  const basket = n => `<div class="basket"><div class="apples">${'🍎'.repeat(n)}</div><div class="bk">🧺</div></div>`;
  if (L === 1) {
    const k = R(2, 4), n = R(2, 5), ans = k * n;
    return { prompt: `<div class="baskets">${Array.from({ length: k }, () => basket(n)).join('')}</div><p class="hint">${Array(k).fill(n).join(' + ')} = ?</p><p class="qtext">Ile jest wszystkich jabłek?</p>`,
      say: `Mamy ${k} ${plural(k, 'koszyk', 'koszyki', 'koszyków')}, w każdym ${n} ${plural(n, 'jabłko', 'jabłka', 'jabłek')}. Ile jest wszystkich jabłek?`, options: numOpts(ans, 4, [1, 2, n, k]), answer: String(ans), layout: 'four' };
  }
  if (L === 2) {
    const a = R(2, 6), b = R(2, Math.min(10, Math.floor(30 / a))), ans = a * b;
    return { prompt: `<div class="eq">${a} · ${b} = <span class="box">?</span></div><div class="dots-grid" style="--c:${b}">${'<i></i>'.repeat(ans)}</div><p class="hint">${a} ${plural(a, 'rząd', 'rzędy', 'rzędów')} po ${b}</p>`,
      say: `Ile to jest ${a} razy ${b}?`, options: numOpts(ans, 4, [1, 2, a, b]), answer: String(ans), layout: 'four' };
  }
  const k = R(2, 5), n = R(2, Math.min(10, Math.floor(30 / k))), total = k * n;
  return { prompt: `<div class="baskets">${Array.from({ length: k }, () => basket(0)).join('')}</div><p class="qtext">${total} ${plural(total, 'jabłko', 'jabłka', 'jabłek')} dzielimy po równo do ${k} ${plural(k, 'koszyka', 'koszyków', 'koszyków')}. Ile jabłek będzie w jednym koszyku?</p><div class="eq small">${total} : ${k} = ?</div>`,
    say: `${total} jabłek dzielimy po równo do ${k} koszyków. Ile jabłek będzie w jednym koszyku?`, options: numOpts(n, 4, [1, 2, 3]), answer: String(n), layout: 'four' };
}
function clockSVG(h, m) {
  const ha = ((h % 12) + m / 60) * 30 * Math.PI / 180, ma = m * 6 * Math.PI / 180;
  let s = '';
  for (let i = 0; i < 60; i++) { const a = i * 6 * Math.PI / 180, r1 = i % 5 ? 86 : 81; s += `<line x1="${(100 + r1 * Math.sin(a)).toFixed(1)}" y1="${(100 - r1 * Math.cos(a)).toFixed(1)}" x2="${(100 + 90 * Math.sin(a)).toFixed(1)}" y2="${(100 - 90 * Math.cos(a)).toFixed(1)}" stroke="#1f2d47" stroke-width="${i % 5 ? 1 : 3}"/>`; }
  for (let i = 1; i <= 12; i++) { const a = i * 30 * Math.PI / 180; s += `<text x="${(100 + 68 * Math.sin(a)).toFixed(1)}" y="${(100 - 68 * Math.cos(a) + 7).toFixed(1)}" text-anchor="middle" font-family="Baloo 2, sans-serif" font-size="21" font-weight="800" fill="#1f2d47">${i}</text>`; }
  return `<svg class="clock" viewBox="0 0 200 200" role="img" aria-label="Zegar"><circle cx="100" cy="100" r="96" fill="#fff" stroke="#ff8a3d" stroke-width="8"/>${s}
  <line x1="100" y1="100" x2="${(100 + 44 * Math.sin(ha)).toFixed(1)}" y2="${(100 - 44 * Math.cos(ha)).toFixed(1)}" stroke="#e84a8a" stroke-width="8" stroke-linecap="round"/>
  <line x1="100" y1="100" x2="${(100 + 70 * Math.sin(ma)).toFixed(1)}" y2="${(100 - 70 * Math.cos(ma)).toFixed(1)}" stroke="#3d8bff" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="100" r="7" fill="#1f2d47"/></svg>`;
}
function genClock(L) {
  const h = R(1, 12); let m = 0; if (L === 2) m = pick([0, 30, 30]); if (L === 3) m = pick([15, 45, 15, 45, 30]);
  const pm = L === 3 && Math.random() < .35;
  const f = (hh, mm) => `${pm ? (hh % 12) + 12 : hh}:${String(mm).padStart(2, '0')}`;
  const ans = f(h, m), s = new Set([ans]);
  const c = shuffle([f(h % 12 + 1, m), f((h + 10) % 12 + 1, m), f(h, (m + 30) % 60), f(h, (m + 15) % 60), f(h, (m + 45) % 60)]);
  if (pm) c.unshift(`${h}:${String(m).padStart(2, '0')}`);
  for (const x of c) { if (s.size >= 4) break; s.add(x); }
  return { prompt: `${clockSVG(h, m)}<p class="qtext">${pm ? 'Jest popołudnie. Co pokaże zegar elektroniczny?' : 'Która godzina jest na zegarze?'}</p>`, say: pm ? 'Jest popołudnie. Co pokaże zegar elektroniczny?' : 'Która godzina jest na zegarze?', options: shuffle([...s]), answer: ans, layout: 'four' };
}
const SHOP = [['🍎', 'jabłko'], ['🧃', 'sok'], ['🍦', 'lody'], ['✏️', 'ołówek'], ['📒', 'zeszyt'], ['🧸', 'misia'], ['⚽', 'piłkę'], ['🎈', 'balon'], ['🍪', 'ciastko'], ['🖍️', 'kredki'], ['📚', 'książkę'], ['🪁', 'latawiec'], ['🥐', 'rogalika'], ['🍫', 'czekoladę']];
function genShop(L) {
  const it = pick(SHOP);
  if (L === 3) {
    const paid = pick([10, 20, 20, 50]), price = R(Math.max(2, paid - 19), paid - 1), ans = paid - price;
    return { prompt: `<div class="shop-item"><span class="emo">${it[0]}</span><span class="price">${price} zł</span></div><p class="qtext">Płacisz ${paid} zł za ${it[1]}. Ile reszty dostaniesz?</p><div class="coins"><span class="coin note ${paid === 20 ? 'n20' : ''}" style="display:grid;place-items:center">${paid} zł</span></div>`,
      say: `Płacisz ${paid} złotych za ${it[1]}, który kosztuje ${price} złotych. Ile reszty dostaniesz?`, options: numOpts(ans, 4, [1, 2, 10, 5]).map(x => x + ' zł'), answer: ans + ' zł', layout: 'four' };
  }
  const price = L === 1 ? R(2, 10) : R(11, 48), coins = L === 1 ? [1, 2, 5] : [1, 2, 5, 10, 20];
  const coinHTML = c => `<span class="coin ${c >= 10 ? 'note' + (c === 20 ? ' n20' : '') : c === 1 ? 'silver' : ''}" style="display:grid;place-items:center">${c} zł</span>`;
  return {
    prompt: `<div class="shop-item"><span class="emo">${it[0]}</span><span class="price">${price} zł</span></div><p class="qtext">Zapłać dokładnie ${price} zł za ${it[1]}.</p>`,
    say: `Zapłać dokładnie ${price} złotych za ${it[1]}.`, reveal: `Trzeba było położyć ${price} zł.`,
    mount(el, submit) {
      const paid = [];
      el.innerHTML = `<div class="shop"><div class="tray" id="tray"><span class="muted">Dotykaj monet, żeby je położyć</span></div><p class="sum">Położone: <b id="sum">0</b> zł</p>
        <div class="coins">${coins.map(c => `<button class="coin ${c >= 10 ? 'note' + (c === 20 ? ' n20' : '') : c === 1 ? 'silver' : ''}" data-v="${c}">${c} zł</button>`).join('')}</div>
        <div class="row" style="justify-content:center"><button class="btn ghost small" id="undo">↩ Cofnij</button><button class="btn mint" id="pay">Płacę!</button></div></div>`;
      const paint = () => { $('#tray', el).innerHTML = paid.length ? paid.map(coinHTML).join('') : '<span class="muted">Dotykaj monet, żeby je położyć</span>'; $('#sum', el).textContent = paid.reduce((a, b) => a + b, 0); };
      $$('.coins .coin', el).forEach(b => b.onclick = () => { paid.push(+b.dataset.v); sound('tap'); paint(); });
      $('#undo', el).onclick = () => { paid.pop(); paint(); };
      $('#pay', el).onclick = () => { if (!paid.length) return; $$('button', el).forEach(b => b.disabled = true); submit(paid.reduce((a, b) => a + b, 0) === price); };
    }
  };
}
const ORTHO = {
  ou: ['g|ó|ra', 'kr|ó|l', 'st|ó|ł', 'og|ó|rek', 'wiewi|ó|rka', 'mr|ó|z', 'r|ó|ża', 'pi|ó|ro', 'oł|ó|wek', 's|ó|l', 'dr|ó|ga', 'n|ó|żka', 'b|u|ty', 'm|u|cha', 'z|u|pa', 'k|u|ra', 'chm|u|ra', 'bi|u|rko', '|u|l', 'kog|u|t', 'ż|u|k', 'p|u|dełko', 'd|u|ży', '|u|cho'],
  rz: ['|rz|eka', 'mo|rz|e', 'd|rz|ewo', 'g|rz|yb', 'tale|rz|', 'kalenda|rz|', 'bu|rz|a', 'o|rz|ech', 'ma|rz|ec', 'wie|rz|ba', '|ż|aba', '|ż|ółw', 'wie|ż|a', 'ły|ż|ka', 'ksią|ż|ka', '|ż|yrafa', 'ró|ż|a', 'pla|ż|a', 'je|ż|', '|ż|elazko'],
  ch: ['|ch|mura', 'mu|ch|a', '|ch|leb', 'ku|ch|nia', '|ch|omik', 'u|ch|o', 'orze|ch|', 'da|ch|', '|h|ipopotam', '|h|erbata', '|h|amak', '|h|ulajnoga', '|h|ałas', '|h|elikopter', '|h|okej', 'bo|h|ater'],
};
const ORTHO_OPT = { ou: ['ó', 'u'], rz: ['rz', 'ż'], ch: ['ch', 'h'] };
function genOrtho(L) {
  const set = L === 1 ? 'ou' : L === 2 ? 'rz' : pick(['ou', 'rz', 'ch', 'ch']);
  const [a, x, b] = pick(ORTHO[set]).split('|');
  const cols = ['#ff6f61', '#3d8bff'];
  return { prompt: `<div class="word">${a}<span class="gap">?</span>${b}</div><p class="qtext">Złap balon z dobrą literą!</p>`, say: a + x + b, reveal: `Poprawnie: ${a + x + b}`,
    options: ORTHO_OPT[set].map((o, i) => ({ val: o, html: o, style: `--bc:${cols[i]}` })), answer: x, layout: 'balloons', after: `${a}<b style="color:var(--ok)">${x}</b>${b}` };
}
const ABC_WORDS = ['auto', 'banan', 'cebula', 'dynia', 'ekran', 'foka', 'gruszka', 'hamak', 'igła', 'jabłko', 'kot', 'lis', 'łódka', 'mysz', 'nos', 'osa', 'pies', 'rak', 'sowa', 'tort', 'ul', 'wąż', 'zebra', 'żaba', 'ślimak'];
const ABC_GROUPS = [['kot', 'koza', 'kura', 'kwiat'], ['mama', 'miska', 'mrówka', 'motyl'], ['sowa', 'ser', 'sanki', 'sok'], ['pies', 'piłka', 'pomidor', 'pająk'], ['balon', 'banan', 'burak', 'bocian']];
function genAlpha(L) {
  let words;
  if (L < 3) { const n = L === 1 ? 3 : 4; const used = new Set(); words = []; for (const w of shuffle(ABC_WORDS)) { if (words.length >= n) break; if (!used.has(w[0])) { used.add(w[0]); words.push(w); } } }
  else { const g = shuffle(pick(ABC_GROUPS)).slice(0, 2 + R(0, 1)); const f = g[0][0]; words = g.concat(shuffle(ABC_WORDS.filter(w => w[0] !== f)).slice(0, 4 - g.length)); }
  const sorted = words.slice().sort((a, b) => a.localeCompare(b, 'pl'));
  return {
    prompt: `<p class="qtext">Załaduj wagony po kolei, tak jak w alfabecie!</p>`, say: 'Załaduj wagony po kolei, tak jak w alfabecie. ' + words.join(', '), reveal: 'Kolejność: ' + sorted.join(', '),
    mount(el, submit) {
      let idx = 0, mist = 0;
      el.innerHTML = `<div class="stack" style="align-items:center;width:100%"><div class="train"><span class="loco">🚂</span>${sorted.map((_, i) => `<span class="wagon" data-w="${i}">${i + 1}</span>`).join('')}</div>
        <div class="tiles">${shuffle(words).map(w => `<button class="tile" data-w="${w}">${w}</button>`).join('')}</div>
        <div class="abc">A Ą B C Ć D E Ę F G H I J K L Ł M N Ń O Ó P R S Ś T U W Y Z Ź Ż</div></div>`;
      $$('.tile', el).forEach(b => b.onclick = () => {
        if (b.dataset.w === sorted[idx]) { const wg = $(`.wagon[data-w="${idx}"]`, el); wg.textContent = b.dataset.w; wg.classList.add('filled'); b.style.visibility = 'hidden'; idx++; sound('tap');
          if (idx === sorted.length) { $$('.tile', el).forEach(t => t.disabled = true); submit(mist === 0); } }
        else { mist++; b.classList.remove('wrong'); void b.offsetWidth; b.classList.add('wrong'); sound('bad'); }
      });
    }
  };
}
const POS = {
  rz: [['kot', 'dom', 'szkoła', 'mama', 'jabłko', 'rower', 'drzewo', 'piłka', 'słońce', 'okno', 'pies'], ['przyjaciel', 'tęcza', 'kałuża', 'marchewka', 'zegar', 'nauczycielka']],
  cz: [['biega', 'czyta', 'śpiewa', 'skacze', 'pisze', 'rysuje', 'pływa', 'śpi', 'liczy', 'tańczy'], ['maluje', 'buduje', 'szepcze', 'sprząta', 'odpoczywa', 'gotuje']],
  pr: [['wesoły', 'duży', 'mały', 'zielony', 'szybki', 'słodki', 'zimny', 'wysoki', 'miękki', 'głośny'], ['puszysty', 'odważny', 'pracowity', 'błękitny', 'ciekawy', 'kolorowy']],
};
const POS_B = { rz: ['Rzeczownik', 'kto? co?', '#e84a8a'], cz: ['Czasownik', 'co robi?', '#3d8bff'], pr: ['Przymiotnik', 'jaki? jaka?', '#2fb35a'] };
function genPos(L) {
  const kinds = L === 1 ? ['rz', 'cz'] : ['rz', 'cz', 'pr'];
  const kind = pick(kinds), w = pick(L === 3 ? POS[kind][1].concat(POS[kind][0]) : POS[kind][0]);
  return { prompt: `<div class="word-card">${w}</div><p class="qtext">Do którego koszyka pasuje ten wyraz?</p>`, say: w, reveal: `${w} to ${POS_B[kind][0].toLowerCase()}`,
    options: kinds.map(k => ({ val: k, html: `🧺 ${POS_B[k][0]}<small>${POS_B[k][1]}</small>`, style: `--bc:${POS_B[k][2]}` })), answer: kind, layout: 'baskets3' };
}
const BINS = { papier: ['Papier', '#2f7de1'], plastik: ['Metale i tworzywa sztuczne', '#e2b100'], szklo: ['Szkło', '#2fa84f'], bio: ['Bio', '#8b5a2b'], zmieszane: ['Zmieszane', '#3a3a3a'] };
const TRASH = [['📰', 'gazeta', 'papier'], ['📦', 'karton po butach', 'papier'], ['📒', 'stary zeszyt', 'papier'], ['✉️', 'koperta', 'papier'], ['🗞️', 'ulotka', 'papier'],
  ['🧴', 'butelka po szamponie', 'plastik'], ['🥫', 'puszka po fasoli', 'plastik'], ['🧃', 'karton po soku', 'plastik'], ['🥤', 'plastikowy kubek', 'plastik'], ['🍬', 'papierek po cukierku z folii', 'plastik'],
  ['🫙', 'słoik po dżemie', 'szklo'], ['🍾', 'szklana butelka', 'szklo'], ['🍶', 'butelka po syropie', 'szklo'],
  ['🍌', 'skórka od banana', 'bio'], ['🍎', 'ogryzek jabłka', 'bio'], ['🍂', 'liście', 'bio'], ['🥚', 'skorupki jajek', 'bio'], ['🥕', 'obierki z marchewki', 'bio'],
  ['🤧', 'zużyta chusteczka', 'zmieszane'], ['🍽️', 'potłuczony talerz', 'zmieszane'], ['🧽', 'stara gąbka', 'zmieszane'], ['🪥', 'zużyta szczoteczka do zębów', 'zmieszane']];
function genEco(L) {
  const bins = L === 1 ? ['papier', 'plastik', 'szklo'] : L === 2 ? ['papier', 'plastik', 'szklo', 'bio'] : Object.keys(BINS);
  const it = pick(TRASH.filter(t => bins.includes(t[2])));
  return { prompt: `<div class="big-emo">${it[0]}</div><p class="qtext">Gdzie wyrzucisz: <b>${it[1]}</b>?</p>`, say: `Gdzie wyrzucisz: ${it[1]}?`, reveal: `${it[1]}: ${BINS[it[2]][0].toLowerCase()}`,
    options: bins.map(b => ({ val: b, html: `<span class="bin-ic">🗑️</span>${BINS[b][0]}`, style: `--bc:${BINS[b][1]}` })), answer: it[2], layout: 'bins' };
}
const MEM = {
  colors: [['🟥', 'red'], ['🟦', 'blue'], ['🟩', 'green'], ['🟨', 'yellow'], ['🟧', 'orange'], ['🟪', 'purple'], ['🟫', 'brown'], ['⬛', 'black']],
  animals: [['🐱', 'cat'], ['🐶', 'dog'], ['🐟', 'fish'], ['🐦', 'bird'], ['🐴', 'horse'], ['🐮', 'cow'], ['🐷', 'pig'], ['🐰', 'rabbit'], ['🐸', 'frog'], ['🦁', 'lion']],
  food: [['🍎', 'apple'], ['🍌', 'banana'], ['🍞', 'bread'], ['🥛', 'milk'], ['🥚', 'egg'], ['🎂', 'cake'], ['🧀', 'cheese']],
};

const GAMES = [
  { id: 'rakieta', name: 'Rakieta liczb', subj: 'mat', icon: '🚀', desc: 'Dodawanie i odejmowanie do 100', levels: ['Do 20', 'Pełne dziesiątki i jedności', 'Z przekraczaniem progu i okienka'], how: 'Policz w pamięci i dotknij dobrej odpowiedzi. Każda dobra odpowiedź to krok do nagrody!', make: genRocket },
  { id: 'jablka', name: 'Koszyki jabłek', subj: 'mat', icon: '🍎', desc: 'Mnożenie i dzielenie do 30', levels: ['Liczymy grupy', 'Mnożenie', 'Dzielenie po równo'], how: 'Liczymy jabłka w koszykach: dodajemy po tyle samo, mnożymy i dzielimy po równo.', make: genApples },
  { id: 'zegar', name: 'Zegarmistrz', subj: 'mat', icon: '⏰', desc: 'Odczytywanie godzin na zegarze', levels: ['Pełne godziny', 'Wpół do', 'Kwadranse i popołudnie'], how: 'Krótka wskazówka pokazuje godziny, długa minuty. Która godzina?', make: genClock },
  { id: 'sklepik', name: 'Sklepik', subj: 'mat', icon: '🛒', desc: 'Płacenie monetami i reszta', levels: ['Do 10 zł', 'Do 50 zł', 'Ile reszty?'], how: 'Kup to, co jest na półce. Połóż dokładnie tyle złotych, ile kosztuje.', make: genShop },
  { id: 'balony', name: 'Ortograficzne balony', subj: 'pol', icon: '🎈', desc: 'ó czy u, rz czy ż, ch czy h', levels: ['ó czy u', 'rz czy ż', 'ch czy h i mieszanka'], how: 'W wyrazie brakuje litery. Złap balon z tą, która pasuje!', make: genOrtho },
  { id: 'pociag', name: 'Alfabetowy pociąg', subj: 'pol', icon: '🚂', desc: 'Kolejność alfabetyczna', levels: ['3 wyrazy', '4 wyrazy', 'Ta sama pierwsza litera'], how: 'Dotykaj wyrazy w kolejności alfabetycznej, a trafią do wagonów.', make: genAlpha },
  { id: 'slowa', name: 'Koszyki słów', subj: 'pol', icon: '🧺', desc: 'Rzeczownik, czasownik, przymiotnik', levels: ['Kto? co? Co robi?', 'Trzy koszyki', 'Trudniejsze wyrazy'], how: 'Zapytaj wyraz: kto? co? (rzeczownik), co robi? (czasownik), jaki? (przymiotnik).', make: genPos },
  { id: 'eko', name: 'Eko-sortownia', subj: 'prz', icon: '♻️', desc: 'Segregacja odpadów', levels: ['3 pojemniki', '4 pojemniki', 'Wszystkie 5'], how: 'Pomóż Ziemi! Wrzuć śmieć do dobrego pojemnika.', make: genEco },
  { id: 'memory', name: 'English Memory', subj: 'ang', icon: '🃏', desc: 'Kolory, zwierzęta, jedzenie', levels: ['Kolory', 'Zwierzęta', 'Mieszanka'], how: 'Odkrywaj po dwie karty i znajdź pary: obrazek i angielskie słowo. Usłyszysz, jak się je wymawia.', whole: true, play: playMemory },
  { id: 'most', name: 'Most przyjaźni', subj: 'coop', icon: '🌉', desc: 'Gra dla dwojga: zbudujcie most', levels: ['Łatwy', 'Średni', 'Trudny'], how: 'Gracie we dwoje, każde po swojej stronie. Deska pojawia się, gdy OBOJE odpowiecie dobrze. Spotkajcie się na środku mostu!', whole: true, coop: true, play: playBridge },
];
const G = Object.fromEntries(GAMES.map(g => [g.id, g]));

/* ---------- wspólna oprawa gry ---------- */
function gameShell(g, level, ctx, N) {
  const ps = ctx.players;
  view(`<div class="wrap game" style="--gc:${SUBJ[g.subj].c}">
    <div class="game-top"><button class="btn ghost small" id="g-quit">✕ Wyjdź</button><div class="game-title"><span>${g.icon}</span>${g.name}<small>Etap ${level}</small></div>
    <button class="say-btn" id="g-say">🔊 Przeczytaj</button></div>
    <div class="trail"><div class="stones">${'<i class="stone"></i>'.repeat(N)}</div><span class="goal">🎁</span>${ps.map((p, i) => `<div class="tav" data-i="${i}" style="left:${4 + i * 3}%">${pAv(p, 'walk')}</div>`).join('')}</div>
    <div class="game-main"><div class="game-area" id="area"></div>
    <div class="game-side"><div class="bubble" id="bubble">Do dzieła!</div><div id="side-av">${ps.map((p, i) => `<div class="av-slot" data-i="${i}">${pAv(p)}</div>`).join('')}</div>${ps.map(p => `<b>${esc(p.name)}</b>`).join(' i ')}</div></div></div>`);
  if (ps.length > 1) $$('#side-av .av-slot').forEach(a => a.style.width = '110px');
  const ctl = []; $$('#side-av .av-slot').forEach((el, i) => mount3D(el, ps[i], 'idle').then(c => ctl[i] = c));
  let sayText = '';
  $('#g-say').onclick = () => speak(sayText);
  return {
    area: $('#area'),
    setSay(t) { sayText = t; },
    step(i, ok) { const st = $$('.stone')[i]; if (st) st.classList.add(ok ? 'ok' : 'bad'); },
    move(k) { $$('.tav').forEach((t, i) => t.style.left = `calc(${4 + i * 3}% + ${k / N} * 84%)`); },
    cheer(ok, text) { $('#bubble').textContent = text; ctl.forEach(c => c && c.play(ok ? pick(['cheer', 'jump']) : 'sad', true)); $$('#side-av .av, .tav .av').forEach(a => { a.classList.remove('jump', 'oops'); void a.getBoundingClientRect(); a.classList.add(ok ? 'jump' : 'oops'); setTimeout(() => a.classList.remove('jump', 'oops'), 800); }); },
    onQuit(f) { $('#g-quit').onclick = f; },
  };
}
const PRAISE = ['Super!', 'Brawo!', 'Ekstra!', 'Mistrz!', 'Tak trzymaj!', 'Rewelacja!', 'Świetnie!'];
const COMFORT = ['Prawie!', 'Nic się nie stało!', 'Następnym razem się uda!', 'Spróbujemy dalej!'];
function vGame(gid, level, ctx) {
  const g = G[gid]; if (!g) return backTo(ctx);
  if (g.whole) return g.play(g, level, ctx);
  const N = 8, t0 = Date.now(); let i = 0, score = 0, answered = 0, busy = false, timer;
  const sh = gameShell(g, level, ctx, N);
  onCleanup(() => clearTimeout(timer));
  sh.onQuit(async () => { if (answered && !busy) await recordSession(ctx.players, { game: gid, level, correct: score, total: answered, stars: 0, sec: Math.min(1800, (Date.now() - t0) / 1000 | 0), done: false, mode: ctx.mode, hw: ctx.hw || null }); backTo(ctx); });
  const next = () => {
    if (i >= N) return finish();
    const q = g.make(level); i++; busy = false;
    sh.area.innerHTML = `<div class="q">${q.prompt}</div>${q.mount ? '<div class="mount" style="width:100%"></div>' : `<div class="opts ${q.layout || ''}">${q.options.map(o => { const v = typeof o === 'object' ? o.val : o, h = typeof o === 'object' ? o.html : esc(o); return `<button class="opt" data-v="${esc(v)}" style="${typeof o === 'object' ? o.style || '' : ''}">${h}</button>`; }).join('')}</div>`}<div class="fb" aria-live="polite"></div>`;
    sh.setSay(q.say);
    if (q.mount) q.mount($('.mount', sh.area), ok => handle(ok, q, null));
    else $$('.opt', sh.area).forEach(b => b.onclick = () => { if (!busy) handle(b.dataset.v === q.answer, q, b); });
  };
  const handle = (ok, q, btn) => {
    busy = true; answered++; if (ok) score++;
    sh.step(i - 1, ok); sh.move(score);
    const fb = $('.fb', sh.area);
    if (btn) { $$('.opt', sh.area).forEach(b => { b.disabled = true; if (b.dataset.v === q.answer) b.classList.add('right'); }); if (!ok) btn.classList.add('wrong'); }
    if (q.after) { const w = $('.word', sh.area); if (w) w.innerHTML = q.after; }
    if (ok) { fb.className = 'fb ok'; fb.textContent = pick(PRAISE); sound('ok'); sh.cheer(true, pick(PRAISE)); }
    else { fb.className = 'fb bad'; fb.textContent = q.reveal || `Dobra odpowiedź: ${q.answer}`; sound('bad'); sh.cheer(false, pick(COMFORT)); }
    timer = setTimeout(next, ok ? 1000 : 2200);
  };
  const finish = () => results(g, level, ctx, { correct: score, total: N, stars: starsFor(score, N), sec: Math.min(1800, (Date.now() - t0) / 1000 | 0) }, sh.area);
  next();
}
async function results(g, level, ctx, r, area) {
  await recordSession(ctx.players, { game: g.id, level, correct: r.correct, total: r.total, stars: r.stars, sec: r.sec, done: true, mode: ctx.mode, hw: ctx.hw || null, per: r.per });
  const title = r.stars === 3 ? 'Mistrzostwo!' : r.stars === 2 ? 'Świetnie!' : r.stars === 1 ? 'Dobra robota!' : 'Ćwiczymy dalej!';
  area.innerHTML = `<div class="results"><div class="avs">${ctx.players.map((p, i) => `<div class="av-slot" data-i="${i}">${pAv(p, 'dance')}</div>`).join('')}</div><h2>${title}</h2>
    <div class="stars">${[1, 2, 3].map(n => `<span class="${n <= r.stars ? 'on' : ''}">★</span>`).join('')}</div>
    <p style="font-size:20px;font-weight:800">${r.per ? ctx.players.map(p => `${esc(p.name)}: ${(r.per[p.id] || r).correct}/${(r.per[p.id] || r).total}`).join(' · ') : `${r.correct} z ${r.total} dobrze`} · ${fmtSec(r.sec)}</p>
    <p class="muted">+${r.correct * 10 + r.stars * 5} punktów${ctx.players.some(p => p.guest) ? ' (gość nie zbiera punktów)' : ''}</p>
    <div class="row" style="justify-content:center"><button class="btn" id="r-again">Zagraj jeszcze raz</button>${level < 3 ? '<button class="btn sun" id="r-next">Następny etap →</button>' : ''}<button class="btn ghost" id="r-back">Wróć</button></div></div>`;
  $$('.results .av-slot', area).forEach((el, i) => mount3D(el, ctx.players[i], r.stars ? 'dance' : 'idle'));
  if (r.stars) { sound('win'); confetti(r.stars * 30); }
  $('#r-again').onclick = () => go(vGame, g.id, level, ctx);
  const n = $('#r-next'); if (n) n.onclick = () => go(vGame, g.id, level + 1, ctx);
  $('#r-back').onclick = () => backTo(ctx);
}

/* ---------- English Memory ---------- */
function playMemory(g, level, ctx) {
  const pairs = level === 1 ? shuffle(MEM.colors).slice(0, 4) : level === 2 ? shuffle(MEM.animals).slice(0, 6) : shuffle([...MEM.colors, ...MEM.animals, ...MEM.food]).slice(0, 8);
  const N = pairs.length, t0 = Date.now(); let found = 0, mist = 0, open = [], lock = false;
  const sh = gameShell(g, level, ctx, N);
  sh.setSay('Znajdź pary: obrazek i angielskie słowo.');
  const cards = shuffle(pairs.flatMap(([e, w]) => [{ id: w, face: e, emo: true }, { id: w, face: w, emo: false }]));
  sh.area.innerHTML = `<p class="qtext">Znajdź pary: obrazek i słowo po angielsku</p><div class="mem">${cards.map((c, i) => `<button class="mcard" data-i="${i}" aria-label="Karta ${i + 1}"><span class="in"><span class="f">?</span><span class="b ${c.emo ? 'emo' : ''}">${c.face}</span></span></button>`).join('')}</div><div class="fb" aria-live="polite"></div>`;
  sh.onQuit(async () => { if (found) await recordSession(ctx.players, { game: g.id, level, correct: found, total: found + mist, stars: 0, sec: (Date.now() - t0) / 1000 | 0, done: false, mode: ctx.mode, hw: ctx.hw || null }); backTo(ctx); });
  $$('.mcard', sh.area).forEach(b => b.onclick = () => {
    const c = cards[+b.dataset.i]; if (lock || b.classList.contains('up') || b.classList.contains('gone')) return;
    b.classList.add('up'); sound('tap'); speak(c.id, 'en-GB'); open.push(b);
    if (open.length < 2) return;
    const [a, bb] = open, ca = cards[+a.dataset.i], cb = cards[+bb.dataset.i]; open = [];
    if (ca.id === cb.id && ca.emo !== cb.emo) {
      found++; sh.step(found - 1, true); sh.move(found); sh.cheer(true, `${ca.id}!`); sound('ok');
      setTimeout(() => { a.classList.add('gone'); bb.classList.add('gone'); }, 300);
      if (found === N) {
        const total = N + mist, stars = mist <= N * .75 ? 3 : mist <= N * 1.5 ? 2 : 1;
        setTimeout(() => results(g, level, ctx, { correct: N, total, stars, sec: Math.min(1800, (Date.now() - t0) / 1000 | 0) }, sh.area), 900);
      }
    } else {
      mist++; lock = true; sh.cheer(false, 'Szukaj dalej!');
      setTimeout(() => { a.classList.remove('up'); bb.classList.remove('up'); lock = false; }, 1000);
    }
  });
}

/* ---------- Most przyjaźni (kooperacja na tablicy) ---------- */
function playBridge(g, level, ctx) {
  const ps = ctx.players.length >= 2 ? ctx.players.slice(0, 2) : [ctx.players[0], GUEST];
  ctx = Object.assign({}, ctx, { players: ps });
  const PL = 6, t0 = Date.now(), gens = [genRocket, genOrtho, genApples, genPos, genEco, genClock];
  const st = [{ c: 0, t: 0, ready: false }, { c: 0, t: 0, ready: false }]; let built = 0, round = 0, timers = [];
  onCleanup(() => timers.forEach(clearTimeout));
  view(`<div class="wrap game" style="--gc:var(--coop)">
    <div class="game-top"><button class="btn ghost small" id="g-quit">✕ Wyjdź</button><div class="game-title"><span>🌉</span>Most przyjaźni<small>Etap ${level}</small></div></div>
    <div class="bridge"><div class="river"></div><div class="cliff L"></div><div class="cliff R"></div><div class="planks">${'<i class="plank"></i>'.repeat(PL)}</div>
      <div class="bav" id="bav0" style="left:8%">${pAv(ps[0], 'walk')}</div><div class="bav" id="bav1" style="left:92%">${pAv(ps[1], 'walk')}</div></div>
    <div class="duo"><div class="pane" id="pane0" style="--pc:#ff8a3d"></div><div class="pane" id="pane1" style="--pc:#7a5cff"></div></div></div>`);
  $('#g-quit').onclick = async () => { if (st[0].t || st[1].t) await recordSession(ps, { game: g.id, level, correct: 0, total: 0, stars: 0, sec: (Date.now() - t0) / 1000 | 0, done: false, mode: ctx.mode, per: { [ps[0].id]: { correct: st[0].c, total: st[0].t }, [ps[1].id]: { correct: st[1].c, total: st[1].t } } }); backTo(ctx); };
  const head = i => `<div class="pane-h">${pAv(ps[i])}<span>${esc(ps[i].name)}</span><button class="say-btn" data-say style="margin-left:auto">🔊</button></div>`;
  const ask = i => {
    const pane = $('#pane' + i); st[i].ready = false;
    let q; do { q = gens[(round + i * 3 + R(0, 1)) % gens.length](level); } while (q.mount);
    let opts = q.options; if (opts.length > 3) { const ans = opts.find(o => (typeof o === 'object' ? o.val : o) === q.answer); opts = shuffle([ans, ...shuffle(opts.filter(o => o !== ans)).slice(0, 2)]); }
    const lay = q.layout === 'four' || q.layout === 'balloons' ? '' : q.layout;
    pane.innerHTML = `${head(i)}<div class="q">${q.prompt}</div><div class="opts ${lay}">${opts.map(o => { const v = typeof o === 'object' ? o.val : o, h = typeof o === 'object' ? o.html : esc(o); return `<button class="opt" data-v="${esc(v)}" style="${typeof o === 'object' ? o.style || '' : ''}">${h}</button>`; }).join('')}</div><div class="fb" aria-live="polite"></div>`;
    $('[data-say]', pane).onclick = () => speak(q.say);
    $$('.opt', pane).forEach(b => b.onclick = () => {
      $$('.opt', pane).forEach(x => x.disabled = true); st[i].t++;
      const ok = b.dataset.v === q.answer, fb = $('.fb', pane);
      $$('.opt', pane).forEach(x => { if (x.dataset.v === q.answer) x.classList.add('right'); });
      if (q.after) { const w = $('.word', pane); if (w) w.innerHTML = q.after; }
      if (ok) { st[i].c++; st[i].ready = true; sound('ok'); react($('#bav' + i), 'jump');
        timers.push(setTimeout(() => { if (st[i].ready) pane.innerHTML = `${head(i)}<div class="wait"><span style="font-size:60px">✅</span>Gotowe!<span class="muted" style="font-size:18px">Czekamy na: ${esc(ps[1 - i].name)}</span></div>`; check(); }, 700)); }
      else { b.classList.add('wrong'); fb.className = 'fb bad'; fb.textContent = q.reveal || `Dobra odpowiedź: ${q.answer}`; sound('bad'); react($('#bav' + i), 'oops'); timers.push(setTimeout(() => ask(i), 2000)); }
    });
  };
  const check = () => {
    if (!(st[0].ready && st[1].ready)) return;
    built++; round++; sound('plank');
    $$('.plank')[built - 1].classList.add('on');
    const step = 34 / PL; $('#bav0').style.left = (8 + built * step) + '%'; $('#bav1').style.left = (92 - built * step) + '%';
    if (built >= PL) {
      [0, 1].forEach(i => { $('#pane' + i).innerHTML = `${head(i)}<div class="wait"><span style="font-size:60px">🤝</span>Spotkaliście się na moście!</div>`; $('#bav' + i + ' .av').classList.add('dance'); });
      const per = { [ps[0].id]: { correct: st[0].c, total: st[0].t, stars: starsFor(st[0].c, st[0].t) }, [ps[1].id]: { correct: st[1].c, total: st[1].t, stars: starsFor(st[1].c, st[1].t) } };
      const c = st[0].c + st[1].c, t = st[0].t + st[1].t;
      timers.push(setTimeout(() => { const area = document.createElement('div'); area.className = 'game-area'; $('.duo').replaceWith(area); results(g, level, ctx, { correct: c, total: t, stars: starsFor(c, t), sec: Math.min(1800, (Date.now() - t0) / 1000 | 0), per }, area); }, 1600));
      return;
    }
    timers.push(setTimeout(() => { ask(0); ask(1); }, 500));
  };
  ask(0); ask(1);
}

/* ===================== start ===================== */
async function boot() {
  renderHeader();
  if (window.claude && window.claude.use && !lsGet(LS_PREF, {}).demo) {
    view('<div class="wrap" style="padding:80px 0;text-align:center"><span class="sparkle">✨</span><h2>Ładuję Krainę Gier…</h2></div>');
    if (!(await connectDb())) loadLocal();
  } else loadLocal();
  Store.ready = true; renderBanner(); goHome();
}
