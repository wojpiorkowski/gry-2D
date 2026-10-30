#!/usr/bin/env node
// Pracownia awatarów w Meshy: zdjęcia dziecka + styl -> render postaci -> model 3D -> szkielet -> animacje.
//
//   MESHY_API_KEY=... NODE_USE_ENV_PROXY=1 node meshy.mjs --photos a.jpg,b.jpg --style kotek --out out/maja
//   node meshy.mjs --library dance          (przegląd animacji, za darmo)
//
// Opcje:
//   --photos   1-3 zdjęcia dziecka (bez zdjęć postać powstaje z samego opisu, np. do pokazu stylu)
//   --style    id stylu ze styles.json (domyślnie kotek)
//   --extra    dodatkowe wskazówki do wyglądu (np. "short curly hair, round glasses")
//   --from-image  pomiń krok 1 i zrób model 3D z gotowego obrazu
//   --actions  własne id animacji z biblioteki, np. 12,34,56 (domyślnie dobierane po nazwach)
//   --steps    które kroki zrobić: image,3d,rig,anim (domyślnie wszystkie)
// Wynik w --out: render.png, model.glb, rigged.glb, avatar.glb (postać z animacjami), info.json.

import fs from 'node:fs';
import path from 'node:path';

const API = 'https://api.meshy.ai/openapi/v1';
const KEY = process.env.MESHY_API_KEY;
const here = path.dirname(new URL(import.meta.url).pathname);
const STY = JSON.parse(fs.readFileSync(path.join(here, 'styles.json'), 'utf8'));
const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => {
  if (x.startsWith('--')) a.push([x.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]);
  return a;
}, []));

// Ruchy dla gier: nazwa w portalu -> słowa do wyszukania w bibliotece Meshy (pierwsze trafienie wygrywa)
const WANT = {
  idle: ['idle', 'breathing', 'stand'],
  cheer: ['cheer', 'celebrat', 'victory', 'happy'],
  jump: ['jump'],
  dance: ['dance', 'dancing'],
  wave: ['wave', 'waving', 'greet'],
  sad: ['sad', 'disappoint', 'defeat'],
  walk: ['walk'],
  think: ['think', 'thinking', 'scratch'],
};
const POSE = ' IMPORTANT for 3D conversion: exactly one character, standing straight in a relaxed A-pose (arms slightly away from the body, hands open, legs slightly apart), facing the camera, the whole body from head to feet visible, nothing held in the hands, no companion animal, no props touching the body, plain pure white background.';

async function api(method, url, body) {
  for (let attempt = 0; ; attempt++) {
    const r = await fetch(API + url, { method, headers: { authorization: `Bearer ${KEY}`, 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    const t = await r.text();
    if (r.status === 429 && attempt < 4) { await sleep(5000 * (attempt + 1)); continue; }
    if (!r.ok) throw new Error(`${r.status} ${method} ${url}: ${t.slice(0, 600)}`);
    return t ? JSON.parse(t) : {};
  }
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function run(kind, body, label) {
  const { result: id } = await api('POST', `/${kind}`, body);
  process.stdout.write(`${label} (${id}) `);
  for (;;) {
    await sleep(5000);
    const t = await api('GET', `/${kind}/${id}`);
    if (t.status === 'SUCCEEDED') { console.log(`gotowe, ${t.consumed_credits ?? '?'} kr.`); return t; }
    if (t.status === 'FAILED' || t.status === 'CANCELED') throw new Error(`${label}: ${t.status} ${JSON.stringify(t.task_error || {})}`);
    process.stdout.write(`${t.progress ?? 0}% `);
  }
}
async function download(url, file) { const r = await fetch(url); if (!r.ok) throw new Error(`pobieranie ${r.status} ${url}`); fs.writeFileSync(file, Buffer.from(await r.arrayBuffer())); console.log('  zapisano', file); }
const dataUri = f => `data:${/\.png$/i.test(f) ? 'image/png' : /\.webp$/i.test(f) ? 'image/webp' : 'image/jpeg'};base64,${fs.readFileSync(f).toString('base64')}`;

async function library(search) {
  const r = await api('GET', `/animations/library?search=${encodeURIComponent(search)}&page_size=50`);
  return r.result || r.items || r.data || r || [];
}
async function pickActions() {
  if (args.actions) return Object.fromEntries(String(args.actions).split(',').map((id, i) => ['a' + i, +id]));
  const chosen = {};
  for (const [name, words] of Object.entries(WANT)) {
    for (const w of words) {
      const list = await library(w);
      const hit = Array.isArray(list) ? list.find(a => !Object.values(chosen).includes(a.action_id ?? a.id)) : null;
      if (hit) { chosen[name] = hit.action_id ?? hit.id; console.log(`  ruch ${name}: ${hit.name || hit.action_name} (#${chosen[name]})`); break; }
    }
  }
  return chosen;
}

async function main() {
  if (!KEY) { console.error('Brak MESHY_API_KEY w środowisku.'); process.exit(1); }
  if (args.library) { const l = await library(args.library === true ? '' : args.library); console.log(JSON.stringify(l, null, 1).slice(0, 6000)); return; }
  const style = STY.styles.find(s => s.id === (args.style || 'kotek'));
  if (!style) { console.error('Nieznany styl. Dostępne: ' + STY.styles.map(s => s.id).join(', ')); process.exit(1); }
  const out = args.out || path.join('out', style.id); fs.mkdirSync(out, { recursive: true });
  const steps = String(args.steps || 'image,3d,rig,anim').split(',');
  const photos = args.photos ? String(args.photos).split(',').slice(0, 3) : [];
  const info = { style: style.id, created: new Date().toISOString(), credits: 0 };
  const add = t => { info.credits += t.consumed_credits || 0; };

  let prompt = STY.base.replace('{bg}', 'pure white').replace('{costume}', style.costume) + POSE;
  if (!photos.length) prompt = prompt.replace('of the child from the reference photos', 'of a cheerful 8-year-old child').replace(/Keep the child's real likeness:[^.]*\./, '');
  if (args.extra) prompt += ' Details: ' + args.extra;

  let imgTask = null, imgFile = args['from-image'];
  if (steps.includes('image') && !imgFile) {
    const refs = photos.map(dataUri);
    const body = { ai_model: 'nano-banana-pro', prompt, aspect_ratio: '3:4' };
    const t = refs.length ? await run('image-to-image', { ...body, reference_image_urls: refs }, 'Krok 1: postać ze zdjęć')
      : await run('text-to-image', body, 'Krok 1: postać z opisu');
    add(t); imgTask = t.id; imgFile = path.join(out, 'render.png'); await download(t.image_urls[0], imgFile);
  }
  let modelTask = null;
  if (steps.includes('3d')) {
    const body = { ai_model: 'latest', should_texture: true, enable_pbr: false, pose_mode: 'a-pose', target_polycount: 40000, target_formats: ['glb'] };
    const t = await run('image-to-3d', imgTask ? { ...body, input_task_id: imgTask } : { ...body, image_url: dataUri(imgFile) }, 'Krok 2: model 3D');
    add(t); modelTask = t.id; await download(t.model_urls.glb, path.join(out, 'model.glb'));
    if (t.thumbnail_url) await download(t.thumbnail_url, path.join(out, 'model.png'));
  }
  let rigTask = null;
  if (steps.includes('rig') && modelTask) {
    const t = await run('rigging', { input_task_id: modelTask, height_meters: 1.25 }, 'Krok 3: szkielet');
    add(t); rigTask = t.id; const r = t.result || t;
    await download(r.rigged_character_glb_url, path.join(out, 'rigged.glb'));
    const walk = r.basic_animations?.walking_glb_url; if (walk) await download(walk, path.join(out, 'walk.glb'));
  }
  if (steps.includes('anim') && rigTask) {
    const acts = await pickActions();
    const ids = Object.values(acts).slice(0, 10);
    const t = await run('animations', { rig_task_id: rigTask, action_ids: ids }, 'Krok 4: animacje');
    add(t); const r = t.result || t;
    await download(r.animation_glb_url, path.join(out, 'avatar.glb'));
    info.actions = acts; // kolejność klipów w avatar.glb odpowiada kolejności ids
  }
  info.tasks = { image: imgTask, model: modelTask, rig: rigTask };
  fs.writeFileSync(path.join(out, 'info.json'), JSON.stringify(info, null, 2));
  console.log(`Gotowe: ${out}, zużyte kredyty: ${info.credits}`);
}
main().catch(e => { console.error(e.message); process.exit(1); });
