import * as THREE from 'three';
import { RoomEnvironment } from '../vendor/three/RoomEnvironment.js';

export function mountScene(host, { english = false } = {}) {
  const visual = host.closest('.hero-visual');
  const button = document.querySelector('.motion-toggle');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    host.dataset.state = 'fallback';
    return { destroy() {} };
  }
  renderer.debug.onShaderError = () => {
    queueMicrotask(() => {
      destroy();
      host.dataset.state = 'fallback';
    });
  };
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 600 ? 1.25 : 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 40);
  camera.position.set(0, .12, 8.7);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();

  const sculpture = new THREE.Group();
  scene.add(sculpture);
  const chrome = new THREE.MeshPhysicalMaterial({ color: 0xd5d9e1, metalness: 1, roughness: .19, clearcoat: .8, envMapIntensity: 1.25 });
  const blue = new THREE.MeshPhysicalMaterial({ color: 0x2456d6, metalness: .65, roughness: .2, clearcoat: 1, clearcoatRoughness: .1, envMapIntensity: 1.6 });
  const inner = new THREE.MeshPhysicalMaterial({ color: 0x1640b2, metalness: .8, roughness: .22 });
  function extruded(points, material, x, z, rotation = 0) {
    const shape = new THREE.Shape();
    points.forEach(([px, py], i) => i ? shape.lineTo(px, py) : shape.moveTo(px, py));
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: .28, bevelEnabled: true, bevelSegments: 5, steps: 1, bevelSize: .075, bevelThickness: .075, curveSegments: 8 });
    geometry.center();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, 0, z);
    mesh.rotation.z = rotation;
    sculpture.add(mesh);
    return mesh;
  }
  const bracket = [[.35, 1],[-.55, .16],[-.55, -.16],[.35,-1],[.67,-.65],[-.02,0],[.67,.65]];
  extruded(bracket, chrome, -1.35, -.05);
  extruded(bracket.map(([x,y]) => [-x,y]), chrome, 1.35, -.05);
  const slash = extruded([[-.14,-1.1],[.22,-1.1],[.65,1.1],[.29,1.1]], blue, 0, .24);
  // The thin inset edges make the symbol read as a manufactured object, not a flat glyph.
  const wireGeometry = new THREE.EdgesGeometry(slash.geometry, 24);
  const wire = new THREE.LineSegments(wireGeometry, new THREE.LineBasicMaterial({ color: 0x7d9fff, transparent: true, opacity: .32 }));
  slash.add(wire);
  const detailGeo = new THREE.BoxGeometry(.1, .1, .14);
  for (let i = 0; i < 3; i++) {
    const detail = new THREE.Mesh(detailGeo, i === 1 ? blue : inner);
    detail.position.set(-.16 + i * .16, -1.45, 0);
    sculpture.add(detail);
  }
  const rim = new THREE.DirectionalLight(0xc2d0ff, 3.2);
  rim.position.set(-3, 4, 5);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, 2);
  fill.position.set(3, -2, 3);
  scene.add(fill);
  sculpture.rotation.set(.22, -.4, -.15);
  host.append(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  renderer.domElement.addEventListener('webglcontextlost', lost);
  let pointerX = 0, pointerY = 0, paused = false, visible = true, disposed = false, frame = 0, last = 0, elapsed = 0;
  const frameDelay = 1000 / 30;
  function resize() {
    if (disposed) return;
    const width = Math.max(1, host.clientWidth), height = Math.max(1, host.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Fit the complete symbol in narrow portrait canvases as well as wide desktop stages.
    camera.position.z = Math.max(8.7, 5.1 / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect));
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }
  function animate(now) {
    frame = 0;
    if (disposed || paused || !visible || document.hidden) return;
    frame = requestAnimationFrame(animate);
    if (now - last < frameDelay) return;
    elapsed += Math.min(now - (last || now), 100) / 1000;
    last = now;
    const targetX = .2 + pointerY * .16 + Math.sin(elapsed * .35) * .06;
    const targetY = -.35 + pointerX * .35 + Math.sin(elapsed * .28) * .18;
    sculpture.rotation.x += (targetX - sculpture.rotation.x) * .06;
    sculpture.rotation.y += (targetY - sculpture.rotation.y) * .06;
    sculpture.rotation.z = -.14 + Math.sin(elapsed * .25) * .04;
    sculpture.position.y = Math.sin(elapsed * .7) * .065;
    renderer.render(scene, camera);
  }
  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    const running = !disposed && !paused && visible && !document.hidden;
    host.dataset.state = running ? 'running' : 'paused';
    if (running) frame = requestAnimationFrame(animate);
  }
  function move(event) {
    if (paused || event.pointerType === 'touch') return;
    const rect = visual.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / rect.width * 2 - 1;
    pointerY = (event.clientY - rect.top) / rect.height * 2 - 1;
  }
  function leave() { pointerX = pointerY = 0; }
  function toggle() {
    paused = !paused;
    button.setAttribute('aria-pressed', String(paused));
    button.querySelector('.motion-icon').textContent = paused ? '▷' : 'Ⅱ';
    button.querySelector('.motion-label').textContent = paused ? (english ? 'Play 3D' : 'Ativar 3D') : (english ? 'Pause 3D' : 'Pausar 3D');
    sync();
  }
  function lost(event) {
    event.preventDefault();
    destroy();
    host.dataset.state = 'fallback';
  }
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: .01 });
  const resizer = new ResizeObserver(resize);
  observer.observe(host);
  resizer.observe(host);
  visual.addEventListener('pointermove', move, { passive: true });
  visual.addEventListener('pointerleave', leave);
  document.addEventListener('visibilitychange', sync);
  button?.addEventListener('click', toggle);
  if (button) {
    button.hidden = false;
    button.setAttribute('aria-pressed', 'false');
    button.querySelector('.motion-icon').textContent = 'Ⅱ';
    button.querySelector('.motion-label').textContent = english ? 'Pause 3D' : 'Pausar 3D';
  }
  resize();
  visual.classList.add('scene-ready');
  host.dataset.state = 'running';
  sync();
  function destroy() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    resizer.disconnect();
    document.removeEventListener('visibilitychange', sync);
    visual.removeEventListener('pointermove', move);
    visual.removeEventListener('pointerleave', leave);
    button?.removeEventListener('click', toggle);
    renderer.domElement.removeEventListener('webglcontextlost', lost);
    const geometries = new Set(), materials = new Set();
    scene.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(m => materials.add(m));
    });
    geometries.forEach(g => g.dispose());
    materials.forEach(m => m.dispose());
    environment.dispose();
    renderer.dispose();
    renderer.domElement.remove();
    visual.classList.remove('scene-ready');
    if (button) button.hidden = true;
  }
  return { destroy };
}
