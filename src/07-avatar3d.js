/* ===================== awatary 3D (GLB z animacjami: Quaternius, Kenney, Meshy) ===================== */
// Postać z polem avatar3d = { id } (gotowa postać z CHARS3D) albo { glb, img, clips: { idle, cheer, jump, dance, wave, sad, walk } }
// (nazwy klipów w GLB, same końcówki po „|” też pasują, albo numery). Bez avatar3d używamy rysowanej postaci SVG.
const CL_MINI = { idle: 'idle', walk: 'walk', jump: 'jump', cheer: 'emote-yes', sad: 'emote-no', wave: 'emote-yes', dance: 'jump' };
const CL_BIG = { idle: 'Idle', walk: 'Walk', jump: 'Jump', cheer: 'Yes', sad: 'No', wave: 'Wave', dance: 'Wave' };
const CL_BLOB = { idle: 'Idle', walk: 'Walk', jump: 'Jump', cheer: 'Yes', sad: 'No', wave: 'Yes', dance: 'Dance' };
const CL_CAT = { idle: 'Idle', walk: 'Walk', jump: 'Jump_Loop', cheer: 'Jump_Loop', sad: 'Idle_Eating', wave: 'Headbutt', dance: 'Run' };
// Gotowe postacie CC0 (pliki w postacie/, licencja w postacie/CC0-1.0.txt): Kenney „Mini Characters” i Quaternius
const CHARS3D = [
  ['mini_female_b', 'Sportsmenka', CL_MINI], ['mini_female_c', 'Podróżniczka', CL_MINI], ['mini_female_e', 'Lekarka', CL_MINI], ['mini_female_f', 'Mechaniczka', CL_MINI],
  ['mini_male_a', 'Okularnik', CL_MINI], ['mini_male_c', 'Policjant', CL_MINI], ['mini_male_e', 'Naukowiec', CL_MINI], ['mini_male_f', 'Ogrodnik', CL_MINI],
  ['dino', 'Dinek', CL_BIG], ['alien_big', 'Kosmita', CL_BIG], ['yeti', 'Yeti', CL_BIG], ['mushroom_king', 'Grzybowy król', CL_BIG],
  ['ninja_brute', 'Ninja', CL_BIG], ['blob_wizard', 'Czarodziej', CL_BLOB], ['blob_bird', 'Ptaszor', CL_BLOB], ['cat', 'Kotek', CL_CAT],
].map(([id, name, clips]) => ({ id, name, clips, glb: `postacie/${id}.glb.json`, img: `postacie/${id}.png` }));
const CHAR3D = Object.fromEntries(CHARS3D.map(c => [c.id, c]));
// Strona na claude.ai nie serwuje plików .glb, więc build.sh pakuje je do .glb.json ({ b64 }); zwykłe .glb też działają
async function loadGLB(url, loader) {
  if (!url.endsWith('.json')) return loader.loadAsync(url);
  const r = await fetch(url); if (!r.ok) throw new Error('GLB ' + r.status);
  const bin = atob((await r.json()).b64), buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return loader.parseAsync(buf.buffer, '');
}
// Pełny opis postaci 3D: gotowa postać z katalogu albo własny plik (np. z Meshy)
function av3dOf(p) {
  const a = p && p.avatar3d; if (!a) return null;
  return a.id && CHAR3D[a.id] ? Object.assign({}, CHAR3D[a.id], a) : a;
}
function pAv(p, cls = '') {
  const a = av3dOf(p);
  if (a && a.img) return `<img class="av av-img ${cls}" src="${esc(a.img)}" alt="" draggable="false">`;
  return avatarSVG(avOf(p), cls);
}
let THREE_LIB = null;
function loadThree() {
  if (!THREE_LIB) THREE_LIB = Promise.all([import('three'), import('three/addons/loaders/GLTFLoader.js'), import('three/addons/libs/meshopt_decoder.module.js')])
    .then(([T, L, M]) => ({ THREE: T, GLTFLoader: L.GLTFLoader, MeshoptDecoder: M.MeshoptDecoder }));
  return THREE_LIB;
}
const GLB_CACHE = {};
// Zamienia obrazek postaci w elemencie el na żywy model 3D. Zwraca sterownik { play(name, once) } albo null.
async function mount3D(el, p, start = 'idle') {
  const a = av3dOf(p); if (!el || !a || !a.glb) return null;
  let lib; try { lib = await loadThree(); } catch (e) { return null; }
  const { THREE, GLTFLoader, MeshoptDecoder } = lib;
  if (!el.isConnected) return null;
  let gltf;
  try { gltf = await (GLB_CACHE[a.glb] = GLB_CACHE[a.glb] || loadGLB(a.glb, new GLTFLoader().setMeshoptDecoder(MeshoptDecoder))); } catch (e) { delete GLB_CACHE[a.glb]; return null; }
  if (!el.isConnected) return null;
  const w = el.clientWidth || 180, h = el.clientHeight || Math.round(w * 1.3);
  let renderer; try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { return null; }
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); renderer.setSize(w, h); renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb9d8a8, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.8); sun.position.set(2, 4, 3); scene.add(sun);
  // Każdy widok dostaje własną kopię postaci (ten sam plik może być na ekranie kilka razy)
  const { clone } = await import('three/addons/utils/SkeletonUtils.js');
  const model = clone(gltf.scene); scene.add(model);
  model.traverse(o => { if (o.isSkinnedMesh) o.frustumCulled = false; });
  model.updateMatrixWorld(true);
  let box; try { box = new THREE.Box3().setFromObject(model); } catch (e) { box = new THREE.Box3(); model.traverse(o => { if (o.isMesh) { o.geometry.computeBoundingBox(); box.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld)); } }); }
  const size = box.getSize(new THREE.Vector3()), mid = box.getCenter(new THREE.Vector3());
  model.position.sub(new THREE.Vector3(mid.x, box.min.y, mid.z));
  const cam = new THREE.PerspectiveCamera(30, w / h, 0.01, 100);
  const tn = Math.tan(15 * Math.PI / 180), dist = Math.max(size.y / (2 * tn), size.x / (2 * tn * w / h)) * 1.08 + size.z / 2;
  cam.position.set(0, size.y * .55, dist); cam.lookAt(0, size.y * .5, 0);
  const mixer = new THREE.AnimationMixer(model), clips = gltf.animations || [];
  const clipOf = name => {
    const key = a.clips && a.clips[name];
    if (typeof key === 'number') return clips[key];
    if (typeof key === 'string') return clips.find(c => c.name === key) || clips.find(c => c.name.split('|').pop().toLowerCase() === key.toLowerCase());
    return clips.find(c => c.name.toLowerCase().includes(name)) || null;
  };
  let current = null;
  const play = (name, once) => {
    const c = clipOf(name) || (once ? null : clips[0]); if (!c) return;
    const act = mixer.clipAction(c);
    act.reset(); act.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat); act.clampWhenFinished = !!once;
    if (current && current !== act) act.crossFadeFrom(current, .25, false);
    act.play(); current = act;
    if (once) { const back = e => { if (e.action === act) { mixer.removeEventListener('finished', back); play(start); } }; mixer.addEventListener('finished', back); }
  };
  play(start);
  const img = el.querySelector('.av-img, svg.av'); if (img) img.style.display = 'none';
  renderer.domElement.className = 'av3d'; el.appendChild(renderer.domElement);
  const clock = new THREE.Clock(); let raf;
  const tick = () => { mixer.update(clock.getDelta()); model.rotation.y = Math.sin(clock.elapsedTime * .4) * .25; renderer.render(scene, cam); raf = requestAnimationFrame(tick); };
  tick();
  let gone = false;
  const dispose = () => { if (gone) return; gone = true; cancelAnimationFrame(raf); mixer.stopAllAction(); renderer.dispose(); renderer.forceContextLoss && renderer.forceContextLoss(); renderer.domElement.remove(); };
  onCleanup(dispose);
  return { play, dispose };
}
