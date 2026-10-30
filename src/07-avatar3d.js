/* ===================== awatary 3D (GLB z animacjami: Quaternius, Meshy) ===================== */
// Postać z polem avatar3d = { glb, img, clips: { idle, cheer, jump, dance, wave, sad, walk } } (nazwy albo numery klipów w GLB).
// Bez avatar3d używamy rysowanej postaci SVG.
function pAv(p, cls = '') {
  const a = p && p.avatar3d;
  if (a && a.img) return `<img class="av av-img ${cls}" src="${esc(a.img)}" alt="" draggable="false">`;
  return avatarSVG(avOf(p), cls);
}
let THREE_LIB = null;
function loadThree() {
  if (!THREE_LIB) THREE_LIB = Promise.all([import('three'), import('three/addons/loaders/GLTFLoader.js')]).then(([T, L]) => ({ THREE: T, GLTFLoader: L.GLTFLoader }));
  return THREE_LIB;
}
const GLB_CACHE = {};
// Zamienia obrazek postaci w elemencie el na żywy model 3D. Zwraca sterownik { play(name, once) } albo null.
async function mount3D(el, p, start = 'idle') {
  const a = p && p.avatar3d; if (!el || !a || !a.glb) return null;
  let lib; try { lib = await loadThree(); } catch (e) { return null; }
  const { THREE, GLTFLoader } = lib;
  if (!el.isConnected) return null;
  let gltf;
  try { gltf = await (GLB_CACHE[a.glb] = GLB_CACHE[a.glb] || new GLTFLoader().loadAsync(a.glb)); } catch (e) { delete GLB_CACHE[a.glb]; return null; }
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
  const dist = Math.max(size.y / (2 * Math.tan(15 * Math.PI / 180)), size.x * 1.2) * 1.12;
  cam.position.set(0, size.y * .55, dist); cam.lookAt(0, size.y * .5, 0);
  const mixer = new THREE.AnimationMixer(model), clips = gltf.animations || [];
  const clipOf = name => {
    const key = a.clips && a.clips[name];
    if (typeof key === 'number') return clips[key];
    if (typeof key === 'string') return clips.find(c => c.name === key);
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
  onCleanup(() => { cancelAnimationFrame(raf); mixer.stopAllAction(); renderer.dispose(); renderer.forceContextLoss && renderer.forceContextLoss(); });
  return { play };
}
