#!/usr/bin/env node
// Pracownia awatarów: zdjęcia dziecka + styl -> render postaci (Gemini) -> krótkie animacje (Veo).
//
//   GEMINI_API_KEY=... node generate.mjs --photos a.jpg,b.jpg --style kotek --out out/maja
//   node generate.mjs --list-models
//
// Opcje:
//   --photos     1-3 zdjęcia dziecka (bez zdjęć powstaje postać tylko z opisu, np. do pokazu stylu)
//   --style      id stylu ze styles.json (domyślnie kotek)
//   --variants   ile wariantów obrazu (domyślnie 2)
//   --pet        dodaj małe zwierzątko obok postaci
//   --motions    animacje do zrobienia z wariantu nr 1, np. idle,cheer (domyślnie żadne)
//   --from       gotowy obraz postaci do animacji zamiast generowania nowego
//   --image-model / --video-model  nadpisują automatyczny wybór modelu
//   --extra      dodatkowe wskazówki do opisu (np. "short curly hair, missing front tooth")
// Zdjęcia nie są nigdzie zapisywane przez skrypt; po pracy usuń je z dysku.

import fs from 'node:fs';
import path from 'node:path';

const API = 'https://generativelanguage.googleapis.com/v1beta';
const KEY = process.env.GEMINI_API_KEY;
const here = path.dirname(new URL(import.meta.url).pathname);
const STY = JSON.parse(fs.readFileSync(path.join(here, 'styles.json'), 'utf8'));

const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => {
  if (x.startsWith('--')) a.push([x.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]);
  return a;
}, []));

async function api(method, url, body) {
  const r = await fetch(url.startsWith('http') ? url : API + url, {
    method, headers: { 'x-goog-api-key': KEY, 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined,
  });
  const t = await r.text();
  if (!r.ok) throw new Error(`${r.status} ${url}: ${t.slice(0, 500)}`);
  return t ? JSON.parse(t) : {};
}
async function models() {
  const out = []; let page = '';
  do { const r = await api('GET', `/models?pageSize=1000${page ? '&pageToken=' + page : ''}`); out.push(...(r.models || [])); page = r.nextPageToken; } while (page);
  return out;
}
function pickModel(all, prefs) {
  const names = all.map(m => m.name.replace('models/', ''));
  for (const p of prefs) { const hit = names.filter(n => n.includes(p)).sort().reverse()[0]; if (hit) return hit; }
  return null;
}
const mime = f => /\.png$/i.test(f) ? 'image/png' : /\.webp$/i.test(f) ? 'image/webp' : 'image/jpeg';

async function makeImage(model, prompt, photos) {
  const parts = [{ text: prompt }, ...photos.map(f => ({ inline_data: { mime_type: mime(f), data: fs.readFileSync(f).toString('base64') } }))];
  const r = await api('POST', `/models/${model}:generateContent`, {
    contents: [{ role: 'user', parts }],
    generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '3:4' } },
  });
  const img = (r.candidates?.[0]?.content?.parts || []).find(p => p.inlineData || p.inline_data);
  if (!img) throw new Error('Brak obrazu w odpowiedzi: ' + JSON.stringify(r).slice(0, 400));
  const d = img.inlineData || img.inline_data;
  return { data: Buffer.from(d.data, 'base64'), mime: d.mimeType || d.mime_type };
}
async function makeVideo(model, prompt, imgFile) {
  let op = await api('POST', `/models/${model}:predictLongRunning`, {
    instances: [{ prompt, image: { bytesBase64Encoded: fs.readFileSync(imgFile).toString('base64'), mimeType: mime(imgFile) } }],
    parameters: { aspectRatio: '9:16', durationSeconds: 4, personGeneration: 'allow_adult' },
  });
  while (!op.done) { await new Promise(r => setTimeout(r, 10000)); op = await api('GET', `/${op.name}`); process.stdout.write('.'); }
  if (op.error) throw new Error(JSON.stringify(op.error));
  const uri = op.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
  if (!uri) throw new Error('Brak wideo: ' + JSON.stringify(op.response).slice(0, 400));
  const r = await fetch(uri, { headers: { 'x-goog-api-key': KEY }, redirect: 'follow' });
  return Buffer.from(await r.arrayBuffer());
}

async function main() {
  if (!KEY) { console.error('Brak GEMINI_API_KEY w środowisku.'); process.exit(1); }
  const all = await models();
  if (args['list-models']) { all.forEach(m => console.log(m.name, '-', (m.supportedGenerationMethods || []).join(','))); return; }
  const imageModel = args['image-model'] || pickModel(all, ['gemini-3-pro-image', 'gemini-3.1-flash-image', 'gemini-2.5-flash-image']);
  const videoModel = args['video-model'] || pickModel(all, ['veo-3.1-fast', 'veo-3.1-lite', 'veo-3.1', 'veo-3']);
  const style = STY.styles.find(s => s.id === (args.style || 'kotek'));
  if (!style) { console.error('Nieznany styl. Dostępne: ' + STY.styles.map(s => s.id).join(', ')); process.exit(1); }
  const photos = args.photos ? String(args.photos).split(',').slice(0, 3) : [];
  const out = args.out || path.join('out', style.id); fs.mkdirSync(out, { recursive: true });
  let prompt = STY.base.replace('{bg}', style.bg).replace('{costume}', style.costume) + (args.pet ? STY.companion.replace('{pet}', style.pet) : '');
  if (!photos.length) prompt = prompt.replace('of the child from the reference photos', 'of a cheerful 8-year-old child').replace(/Keep the child's real likeness:[^.]*\./, '');
  if (args.extra) prompt += ' Details: ' + args.extra;
  console.log(`Model obrazu: ${imageModel}, model wideo: ${videoModel}, styl: ${style.name}`);

  let first = args.from;
  if (!first) {
    const n = +(args.variants || 2);
    for (let i = 1; i <= n; i++) {
      const img = await makeImage(imageModel, prompt, photos);
      const f = path.join(out, `${style.id}-${i}.${img.mime.includes('png') ? 'png' : 'jpg'}`);
      fs.writeFileSync(f, img.data); console.log('obraz:', f); first = first || f;
    }
  }
  const motions = args.motions ? String(args.motions).split(',') : [];
  for (const m of motions) {
    if (!STY.motions[m]) { console.error('Nieznany ruch: ' + m); continue; }
    process.stdout.write(`animacja ${m}`);
    const v = await makeVideo(videoModel, STY.motions[m], first);
    const f = path.join(out, `${style.id}-${m}.mp4`); fs.writeFileSync(f, v); console.log('\nwideo:', f);
  }
}
main().catch(e => { console.error(e.message); process.exit(1); });
