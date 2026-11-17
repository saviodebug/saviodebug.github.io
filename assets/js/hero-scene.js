import * as THREE from 'three';
import { RoomEnvironment } from '../vendor/three/RoomEnvironment.js';

export function mountScene(host, { english = false } = {}) {
  const visual = host.closest('.hero-visual');
  const tools = visual.querySelector('.scene-tools');
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
  const accentMaterial = new THREE.MeshPhysicalMaterial({ color: 0x88adff, metalness: .65, roughness: .2, clearcoat: 1, clearcoatRoughness: .1, envMapIntensity: 1.6 });
  const inner = new THREE.MeshPhysicalMaterial({ color: 0x6141aa, metalness: .8, roughness: .22 });
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
  const leftBracket = extruded(bracket, chrome, -1.35, -.05);
  const rightBracket = extruded(bracket.map(([x,y]) => [-x,y]), chrome, 1.35, -.05);
  const slash = extruded([[-.14,-1.1],[.22,-1.1],[.65,1.1],[.29,1.1]], accentMaterial, 0, .24);
  // The thin inset edges make the symbol read as a manufactured object, not a flat glyph.
  const wireGeometry = new THREE.EdgesGeometry(slash.geometry, 24);
  const wire = new THREE.LineSegments(wireGeometry, new THREE.LineBasicMaterial({ color: 0xbcb5ff, transparent: true, opacity: .32 }));
  slash.add(wire);
  const detailGeo = new THREE.BoxGeometry(.1, .1, .14);
  for (let i = 0; i < 3; i++) {
    const detail = new THREE.Mesh(detailGeo, i === 1 ? accentMaterial : inner);
    detail.position.set(-.16 + i * .16, -1.45, 0);
    sculpture.add(detail);
  }
  const rim = new THREE.DirectionalLight(0xb4c3ff, 3.2);
  rim.position.set(-3, 4, 5);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, 2);
  fill.position.set(3, -2, 3);
  scene.add(fill);
  // The portal and project satellites share the existing renderer and resource lifecycle.
  const orbital = new THREE.Group();
  scene.add(orbital);
  const ringGeometry = new THREE.TorusGeometry(2.85, .018, 8, 96);
  const ringBlue = new THREE.MeshBasicMaterial({ color:0x789dff, transparent:true, opacity:.7 });
  const ringPurple = new THREE.MeshBasicMaterial({ color:0xa786ff, transparent:true, opacity:.65 });
  const ringA = new THREE.Mesh(ringGeometry, ringBlue);
  const ringB = new THREE.Mesh(ringGeometry, ringPurple);
  ringA.rotation.x = .7;
  ringB.rotation.set(1.2, -.6, .4);
  orbital.add(ringA, ringB);
  const chipShape = new THREE.Shape();
  chipShape.moveTo(-.22,-.28);chipShape.lineTo(.22,-.28);chipShape.quadraticCurveTo(.28,-.28,.28,-.22);
  chipShape.lineTo(.28,.22);chipShape.quadraticCurveTo(.28,.28,.22,.28);chipShape.lineTo(-.22,.28);
  chipShape.quadraticCurveTo(-.28,.28,-.28,.22);chipShape.lineTo(-.28,-.22);chipShape.quadraticCurveTo(-.28,-.28,-.22,-.28);
  const chipGeometry = new THREE.ExtrudeGeometry(chipShape,{depth:.08,bevelEnabled:true,bevelSegments:3,bevelSize:.025,bevelThickness:.025,steps:1});
  chipGeometry.center();
  const chipFace = new THREE.PlaneGeometry(.49,.49);
  const chipMaterial = new THREE.MeshStandardMaterial({color:0x2b2850,metalness:.55,roughness:.3});
  const ownedTextures = new Set();
  const textureLoader = new THREE.TextureLoader();
  const satellites = ['yoshi-mark.png','confereai-logo.webp','yoshi-community.webp'].map((filename,index)=>{
    const group = new THREE.Group();
    group.add(new THREE.Mesh(chipGeometry,chipMaterial));
    const texture = textureLoader.load('/assets/images/projects/'+filename,loaded=>{if(disposed)loaded.dispose();});
    texture.colorSpace = THREE.SRGBColorSpace;
    ownedTextures.add(texture);
    const face = new THREE.Mesh(chipFace,new THREE.MeshBasicMaterial({map:texture,toneMapped:false}));
    face.position.z=.071;
    group.add(face);
    group.userData.phase=index*Math.PI*2/3;
    group.position.set(Math.cos(group.userData.phase)*2.75,Math.sin(group.userData.phase)*1.22,Math.sin(group.userData.phase)*.65+.35);
    orbital.add(group);
    return group;
  });
  const dustGeometry = new THREE.BufferGeometry();
  const dustPositions = new Float32Array(48*3);
  for(let i=0;i<48;i++){
    const angle=i*2.39996323, radius=2.5+(i%7)*.07;
    dustPositions[i*3]=Math.cos(angle)*radius;
    dustPositions[i*3+1]=Math.sin(angle)*1.65;
    dustPositions[i*3+2]=Math.sin(i*1.7)*.7-1;
  }
  dustGeometry.setAttribute('position',new THREE.BufferAttribute(dustPositions,3));
  const dust = new THREE.Points(dustGeometry,new THREE.PointsMaterial({color:0x9aabff,size:.025,transparent:true,opacity:.6,sizeAttenuation:true}));
  orbital.add(dust);
  sculpture.rotation.set(.22, -.4, -.15);
  host.append(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  renderer.domElement.addEventListener('webglcontextlost', lost);
  let pointerX = 0, pointerY = 0, visible = true, disposed = false, frame = 0, last = 0, elapsed = 0;
  let drag = null, dragYaw = 0, dragPitch = 0, visualBounds = null;
  host.tabIndex = 0;
  host.removeAttribute('aria-hidden');
  host.setAttribute('role', 'group');
  host.setAttribute('aria-label', english ? 'Interactive 3D. Drag or use arrow keys to rotate. Home resets the view.' : '3D interativo. Arraste ou use as setas para girar. Home redefine a visão.');
  function resize() {
    if (disposed) return;
    const width = Math.max(1, host.clientWidth), height = Math.max(1, host.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Fit the complete symbol in narrow portrait canvases as well as wide desktop stages.
    camera.position.z = Math.max(11.5, 7.2 / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect));
    camera.updateProjectionMatrix();
    visualBounds = visual.getBoundingClientRect();
    renderer.render(scene, camera);
  }
  function animate(now) {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    frame = requestAnimationFrame(animate);
    const delta = Math.min((now - (last || now - 1000 / 60)) / 1000, .05);
    elapsed += delta;
    last = now;
    const damping = 1 - Math.exp(-7 * delta);
    const targetX = .2 + dragPitch + pointerY * .16 + Math.sin(elapsed * .35) * .06;
    const targetY = -.35 + dragYaw + pointerX * .35 + elapsed * .16;
    sculpture.rotation.x += (targetX - sculpture.rotation.x) * damping;
    sculpture.rotation.y += (targetY - sculpture.rotation.y) * damping;
    sculpture.rotation.z = -.14 + Math.sin(elapsed * .25) * .04;
    sculpture.position.y = Math.sin(elapsed * 1.1) * .12;
    // The brackets separate as the visitor leaves the opening and enters the projects.
    const departure = Math.max(0, Math.min(1, scrollY / Math.max(1, innerHeight * .8)));
    leftBracket.position.x = -1.35 - departure * .8;
    rightBracket.position.x = 1.35 + departure * .8;
    slash.rotation.z = departure * .45;
    sculpture.position.z = departure * .4;
    ringA.rotation.z = elapsed * .12;
    ringB.rotation.y = -.6 + Math.sin(elapsed*.2)*.2;
    dust.rotation.z = elapsed*.025;
    satellites.forEach(group=>{
      const angle=group.userData.phase+elapsed*.16;
      group.position.set(Math.cos(angle)*2.75,Math.sin(angle)*1.22,Math.sin(angle)*.65+.35);
      group.rotation.set(.12,Math.sin(angle)*.2,Math.sin(angle)*.12);
    });
    renderer.render(scene, camera);
  }
  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    const running = !disposed && visible && !document.hidden;
    host.dataset.state = running ? 'running' : 'paused';
    if (running) frame = requestAnimationFrame(animate);
  }
  function move(event) {
    if (event.pointerType === 'touch') return;
    const rect = visualBounds || visual.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / rect.width * 2 - 1;
    pointerY = (event.clientY - rect.top) / rect.height * 2 - 1;
  }
  function leave() { pointerX = pointerY = 0; }
  function down(event) {
    if (event.button !== 0) return;
    drag = { x: event.clientX, y: event.clientY, yaw: dragYaw, pitch: dragPitch };
    host.setPointerCapture(event.pointerId);
  }
  function rotate(event) {
    if (!drag) return;
    dragYaw = drag.yaw + (event.clientX - drag.x) * .008;
    dragPitch = THREE.MathUtils.clamp(drag.pitch + (event.clientY - drag.y) * .006, -.7, .7);

  }
  function release() { drag = null; }
  function keyRotate(event) {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') { dragYaw = 0; dragPitch = 0; }
    else if (event.key === 'ArrowLeft') dragYaw -= .2;
    else if (event.key === 'ArrowRight') dragYaw += .2;
    else dragPitch = THREE.MathUtils.clamp(dragPitch + (event.key === 'ArrowUp' ? -.15 : .15), -.7, .7);
    sculpture.rotation.x = .2 + dragPitch;
    sculpture.rotation.y = -.35 + dragYaw;
    renderer.render(scene, camera);
  }
  function mode(event) {
    const target = event.target.closest('[data-scene-mode]');
    if (!target) return;
    const wireframe = target.dataset.sceneMode === 'wire';
    [chrome, accentMaterial, inner].forEach(material => { material.wireframe = wireframe; });
    tools.querySelectorAll('button').forEach(control => control.setAttribute('aria-pressed', String(control === target)));
    host.dataset.mode = wireframe ? 'wire' : 'solid';
    renderer.render(scene, camera);
  }
  function theme() {
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    accentMaterial.color.set(accent);
    inner.color.copy(accentMaterial.color).multiplyScalar(.45);
    wire.material.color.copy(accentMaterial.color).lerp(new THREE.Color(0xffffff), .45);
    renderer.toneMappingExposure = document.documentElement.dataset.theme === 'light' ? 1.3 : 1.1;
    renderer.render(scene, camera);
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
  host.addEventListener('pointerdown', down);
  host.addEventListener('pointermove', rotate);
  host.addEventListener('pointerup', release);
  host.addEventListener('pointercancel', release);
  host.addEventListener('lostpointercapture', release);
  host.addEventListener('keydown', keyRotate);
  tools?.addEventListener('click', mode);
  document.addEventListener('portfolio:theme', theme);
  if (tools) tools.hidden = false;
  host.dataset.mode = 'solid';
  visual.addEventListener('pointerleave', leave);
  document.addEventListener('visibilitychange', sync);
  resize();
  theme();
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
    host.removeEventListener('pointerdown', down);
    host.removeEventListener('pointermove', rotate);
    host.removeEventListener('pointerup', release);
    host.removeEventListener('pointercancel', release);
    host.removeEventListener('lostpointercapture', release);
    host.removeEventListener('keydown', keyRotate);
    tools?.removeEventListener('click', mode);
    document.removeEventListener('portfolio:theme', theme);
    host.removeAttribute('tabindex');
    host.setAttribute('aria-hidden', 'true');
    if (tools) tools.hidden = true;
    visual.removeEventListener('pointerleave', leave);
    renderer.domElement.removeEventListener('webglcontextlost', lost);
    const geometries = new Set(), materials = new Set();
    scene.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(m => materials.add(m));
    });
    geometries.forEach(g => g.dispose());
    materials.forEach(m => m.dispose());
    ownedTextures.forEach(texture => texture.dispose());
    environment.dispose();
    renderer.dispose();
    renderer.domElement.remove();
    visual.classList.remove('scene-ready');
  }
  return { destroy };
}
