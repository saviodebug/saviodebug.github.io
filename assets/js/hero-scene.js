import * as THREE from 'three';

// One continuous world: the document supplies the stops, the camera connects them.
export function mountScene(host, { english = false } = {}) {
  const visual = host.closest('.hero-visual');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true, powerPreference: 'high-performance' });
  } catch {
    host.dataset.state = 'fallback';
    document.body.classList.add('world-fallback');
    return { destroy() {} };
  }
  let disposed = false, frame = 0, last = 0, elapsed = 0;
  let pointerX = 0, pointerY = 0, yaw = 0, pitch = 0, drag = null;
  let route = [], progress = 0, particleShape = 0, returning = null;
  let frameAverage = 16.67, resolutionCheck = 0;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(43, 1, .1, 125);
  const darkColor = new THREE.Color('#050913'), lightColor = new THREE.Color('#e5eaf4');
  scene.background = darkColor.clone();
  scene.fog = new THREE.FogExp2(darkColor, .045);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  const hemi = new THREE.HemisphereLight(0x8cabff, 0x111126, 3);
  const key = new THREE.DirectionalLight(0xc2d6ff, 4);
  key.position.set(-7, 9, 5);
  const rim = new THREE.DirectionalLight(0x7966ff, 5);
  rim.position.set(8, 3, -8);
  scene.add(hemi, key, rim);
  const metal = new THREE.MeshLambertMaterial({ color: 0x506381 });
  const edge = new THREE.MeshStandardMaterial({ color: 0x89aaff, metalness: .55, roughness: .25, emissive: 0x3459a9, emissiveIntensity: .4 });
  const blue = new THREE.MeshBasicMaterial({ color: 0x6f9fff });
  const purple = new THREE.MeshBasicMaterial({ color: 0x9a78ff });
  const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x101b30, vertexColors: true });
  const terrainGeometry = new THREE.PlaneGeometry(100, 170, 65, 110);
  terrainGeometry.rotateX(-Math.PI / 2);
  const terrainPositions = terrainGeometry.attributes.position;
  for (let i = 0; i < terrainPositions.count; i++) {
    const x = terrainPositions.getX(i), z = terrainPositions.getZ(i);
    const bank = Math.min(1, Math.abs(x) / 14);
    terrainPositions.setY(i, -3.1 + bank * (Math.sin(x * .34 + z * .13) * 1.5 + Math.cos(z * .28 - x * .19) * 1.1));
  }
  terrainGeometry.computeVertexNormals();
  // The landscape is static, so bake its broad lighting into vertex colors.
  const terrainColors = new Float32Array(terrainPositions.count * 3);
  const normals = terrainGeometry.attributes.normal;
  for (let i = 0; i < terrainPositions.count; i++) {
    const shade = .65 + Math.max(0, normals.getY(i) * .7 - normals.getX(i) * .4 + normals.getZ(i) * .2) * .65;
    terrainColors.set([shade * .8, shade * .9, shade * 1.3], i * 3);
  }
  terrainGeometry.setAttribute('color', new THREE.BufferAttribute(terrainColors, 3));
  const terrain = new THREE.Mesh(terrainGeometry, floorMaterial);
  terrain.position.z = -34;
  scene.add(terrain);
  const grid = new THREE.GridHelper(130, 65, 0x42649b, 0x273650);
  grid.position.set(0, -3.05, -34);
  grid.material.transparent = true;
  grid.material.opacity = .16;
  scene.add(grid);

  const core = new THREE.Group();
  core.position.set(0, .15, 0);
  scene.add(core);
  const blockGeometry = new THREE.BoxGeometry(.76, .43, .5);
  const shell = new THREE.InstancedMesh(blockGeometry, metal, 96);
  const transform = new THREE.Object3D();
  const blockSeeds = [];
  for (let i = 0; i < 96; i++) {
    const row = Math.floor(i / 16), angle = (i % 16) / 16 * Math.PI * 2 + (row % 2) * .12;
    const latitude = (row / 5 - .5) * Math.PI * .8;
    blockSeeds.push({ angle, latitude, radius: 2.18, wave: i * .73 });
  }
  shell.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  core.add(shell);
  const nucleus = new THREE.Mesh(new THREE.IcosahedronGeometry(1.13, 1), edge);
  core.add(nucleus);
  const nucleusLines = new THREE.LineSegments(new THREE.EdgesGeometry(nucleus.geometry), new THREE.LineBasicMaterial({ color: 0xc4d6ff, transparent: true, opacity: .65 }));
  nucleus.add(nucleusLines);
  const torusGeometry = new THREE.TorusGeometry(2.95, .025, 6, 100);
  const coreRings = [];
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(torusGeometry, i === 1 ? purple : blue);
    ring.rotation.set(.6 + i * .7, i * .5, i * .8);
    core.add(ring);
    coreRings.push(ring);
  }

  const ownedTextures = new Set();
  const loader = new THREE.TextureLoader();
  const platformGeometry = new THREE.CylinderGeometry(2.65, 2.95, .22, 48);
  const logoGeometry = new THREE.PlaneGeometry(1.65, 1.65);
  const stations = [];
  const stationSpecs = [
    { id: 'project-yoshi', z: -16, color: 0x8e83ff, file: 'yoshi-mark.png' },
    { id: 'project-bot', z: -32, color: 0x7b9fff, file: 'yoshi-community.webp' },
    { id: 'project-confere', z: -48, color: 0x77d5f1, file: 'confereai-logo.webp' }
  ];
  stationSpecs.forEach((spec, index) => {
    const group = new THREE.Group();
    group.position.set(index === 1 ? -2.8 : 2.8, 0, spec.z);
    scene.add(group);
    const material = new THREE.MeshStandardMaterial({ color: spec.color, metalness: .25, roughness: .3, emissive: spec.color, emissiveIntensity: .08 });
    const plinth = new THREE.Mesh(platformGeometry, metal);
    plinth.position.y = -2.55;
    group.add(plinth);
    const sculpture = new THREE.Group();
    group.add(sculpture);
    if (index === 0) {
      const shardGeometry = new THREE.BoxGeometry(.5, 2.2, .5);
      for (let i = 0; i < 5; i++) {
        const shard = new THREE.Mesh(shardGeometry, material);
        const a = i * Math.PI * 2 / 5;
        shard.position.set(Math.cos(a) * 1.3, Math.sin(i * 2) * .25, Math.sin(a) * .8);
        shard.rotation.z = -Math.cos(a) * .3;
        sculpture.add(shard);
      }
    } else if (index === 1) {
      const octa = new THREE.Mesh(new THREE.OctahedronGeometry(1.7, 0), material);
      octa.scale.y = 1.2;
      sculpture.add(octa);
      const cage = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.15, 0)), new THREE.LineBasicMaterial({ color: 0x91b3ff }));
      sculpture.add(cage);
    } else {
      const frameGeometry = new THREE.TorusGeometry(1.65, .16, 6, 4);
      const frameA = new THREE.Mesh(frameGeometry, material);
      const frameB = new THREE.Mesh(frameGeometry, edge);
      frameA.rotation.z = Math.PI / 4;
      frameB.rotation.set(0, Math.PI / 2, Math.PI / 4);
      sculpture.add(frameA, frameB);
    }
    const texture = loader.load('/assets/images/projects/' + spec.file, tex => { if (disposed) tex.dispose(); });
    texture.colorSpace = THREE.SRGBColorSpace;
    ownedTextures.add(texture);
    const logo = new THREE.Mesh(logoGeometry, new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide, toneMapped: false }));
    logo.position.set(0, .05, 1.9);
    group.add(logo);
    const halo = new THREE.Mesh(torusGeometry, index === 0 ? purple : blue);
    halo.rotation.x = Math.PI / 2;
    halo.position.y = -2.39;
    group.add(halo);
    stations.push({ ...spec, group, sculpture, logo, element: document.getElementById(spec.id) });
  });

  const starsGeometry = new THREE.BufferGeometry();
  const stars = new Float32Array(700 * 3);
  for (let i = 0; i < 700; i++) {
    stars[i * 3] = Math.sin(i * 127.1) * 38;
    stars[i * 3 + 1] = Math.cos(i * 311.7) * 15 + 3;
    stars[i * 3 + 2] = -((i * 17.13) % 110);
  }
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(stars, 3));
  const starMaterial = new THREE.PointsMaterial({ color: 0x9bafff, size: .035, transparent: true, opacity: .65, sizeAttenuation: true });
  scene.add(new THREE.Points(starsGeometry, starMaterial));

  const constellation = new THREE.Group();
  constellation.position.set(2, 0, -73);
  scene.add(constellation);
  const count = 1600, particlePositions = new Float32Array(count * 3);
  const particleTargets = [];
  for (let shape = 0; shape < 4; shape++) {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = i / count, a = i * 2.39996323;
      let x, y, z;
      if (shape === 0) {
        const r = Math.sqrt(1 - (u * 2 - 1) ** 2) * 2.6;
        x = Math.cos(a) * r; y = (u * 2 - 1) * 2.6; z = Math.sin(a) * r;
      } else if (shape === 1) {
        const r = 1.8 + Math.sin(i * 2.1) * .3;
        x = Math.cos(a) * r; y = Math.sin(a) * r; z = Math.sin(i * .63) * .6;
      } else if (shape === 2) {
        const side = i % 4, t = (i % 400) / 399 * 4 - 2;
        x = side < 2 ? t : (side === 2 ? -2 : 2);
        y = side < 2 ? (side === 0 ? -1.4 : 1.4) : t * .7;
        z = Math.sin(i * .9) * .45;
      } else {
        x = ((i * .6180339) % 1 - .5) * 4;
        y = (u - .5) * 3;
        z = Math.sin(x * 2 + y * 2) * .7;
      }
      positions.set([x, y, z], i * 3);
    }
    particleTargets.push(positions);
  }
  particlePositions.set(particleTargets[0]);
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3).setUsage(THREE.DynamicDrawUsage));
  const particleMaterial = new THREE.PointsMaterial({ color: 0x8fafff, size: .055, sizeAttenuation: true, transparent: true, opacity: .9 });
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  constellation.add(particles);
  const stackPortal = new THREE.Mesh(new THREE.TorusKnotGeometry(1.7, .12, 90, 8, 2, 3), edge);
  stackPortal.position.set(3, 0, -60);
  scene.add(stackPortal);

  const lookAt = new THREE.Vector3(), destination = new THREE.Vector3();
  function refreshRoute() {
    const stops = [
      { id: 'inicio', object: core, offset: 0 },
      ...stations.filter(s => !document.getElementById(s.id).hidden).map(s => ({ id: s.id, object: s.group, offset: .45 })),
      { id: 'stack', object: stackPortal, offset: .1 },
      { id: 'sobre', object: stackPortal, offset: .55 },
      { id: 'contato', object: constellation, offset: .35 }
    ];
    route = stops.map(stop => {
      const element = document.getElementById(stop.id), rect = element.getBoundingClientRect();
      return { scroll: Math.max(0, rect.top + scrollY + rect.height * stop.offset - (stop.id === 'inicio' ? 0 : innerHeight * .32)), object: stop.object };
    });
    stations.forEach(s => { s.group.visible = !document.getElementById(s.id).hidden; });
  }
  function resize() {
    if (disposed) return;
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    refreshRoute();
  }
  function animate(now) {
    frame = 0;
    if (disposed || document.hidden) return;
    frame = requestAnimationFrame(animate);
    const frameMs = now - (last || now - 16.67);
    const dt = Math.min(frameMs / 1000, .05);
    frameAverage += (Math.min(frameMs, 120) - frameAverage) * .08;
    // Keep motion active; only the canvas resolution adapts to sustained frame cost.
    if (elapsed > 2 && now - resolutionCheck > 1200) {
      resolutionCheck = now;
      const ratio = renderer.getPixelRatio();
      const ceiling = Math.min(devicePixelRatio, innerWidth < 600 ? 1.2 : 1.35);
      const next = frameAverage > 23 ? Math.max(Math.min(.6, ceiling), ratio * .82) : frameAverage < 18 ? Math.min(ceiling, ratio * 1.08) : ratio;
      if (Math.abs(next - ratio) > .02) {
        renderer.setPixelRatio(next);
        renderer.setSize(innerWidth, innerHeight, false);
      }
    }
    last = now; elapsed += dt;
    const damp = 1 - Math.exp(-8 * dt);
    if (returning) {
      const t = THREE.MathUtils.smoothstep(now - returning.start, 0, 1300);
      progress = returning.from * (1 - t);
      if (t === 1 && scrollY < 16) returning = null;
    } else progress += (scrollY - progress) * damp;
    let a = route[0], b = a, t = 0;
    for (let i = 0; i < route.length - 1; i++) {
      if (progress >= route[i].scroll) {
        a = route[i]; b = route[i + 1];
        t = THREE.MathUtils.clamp((progress - a.scroll) / Math.max(1, b.scroll - a.scroll), 0, 1);
      }
    }
    t = t * t * (3 - 2 * t);
    destination.lerpVectors(a.object.position, b.object.position, t);
    const mobile = innerWidth < 760;
    const departureBlend = THREE.MathUtils.smoothstep(-destination.z, 0, 12);
    const distance = mobile ? 19 : Math.max(10.8 + departureBlend * 1.6, 6.6 / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect));
    const shift = mobile ? 0 : -.25 - departureBlend * 2.15;
    const lift = mobile ? .9 - THREE.MathUtils.smoothstep(-destination.z, 3, 13) * 3.7 : .4;
    camera.position.set(destination.x + shift + Math.sin(t * Math.PI) * .8 + pointerX * .22, destination.y + 1.1 + pointerY * .12, destination.z + distance);
    lookAt.set(destination.x + shift, destination.y + lift, destination.z);
    camera.lookAt(lookAt);
    const coreScale = 1 - THREE.MathUtils.smoothstep(-destination.z, 3, 7);
    core.visible = coreScale > .001;
    core.scale.setScalar(coreScale);
    stations.forEach(station => {
      station.group.visible = !station.element.hidden && station.z <= destination.z + 4 && station.z >= destination.z - 24;
    });
    const departure = THREE.MathUtils.clamp(progress / Math.max(1, innerHeight * 1.2), 0, 1);
    blockSeeds.forEach((seed, i) => {
      const wave = Math.sin(elapsed * .75 + seed.wave) * .045;
      const interaction = Math.max(0, Math.cos(seed.angle - pointerX * Math.PI)) * Math.abs(pointerX) * .18;
      const r = seed.radius + departure * (1.5 + Math.sin(seed.wave) * .6) + wave + interaction;
      transform.position.set(Math.cos(seed.angle) * Math.cos(seed.latitude) * r, Math.sin(seed.latitude) * r, Math.sin(seed.angle) * Math.cos(seed.latitude) * r);
      transform.rotation.set(0, -seed.angle + Math.PI / 2, seed.latitude * .25 + departure * .25);
      transform.updateMatrix(); shell.setMatrixAt(i, transform.matrix);
    });
    shell.instanceMatrix.needsUpdate = true;
    core.rotation.set(pitch + pointerY * .08, elapsed * .06 + yaw, -.12);
    nucleus.rotation.set(elapsed * .13, elapsed * .2, .2);
    nucleus.scale.setScalar(1 + Math.sin(elapsed * 1.4) * .035);
    coreRings.forEach((ring, i) => { ring.rotation.z = elapsed * (.06 + i * .015); });
    stations.forEach((station, index) => {
      station.sculpture.rotation.y = elapsed * (index === 1 ? -.18 : .16);
      station.sculpture.position.y = Math.sin(elapsed * .9 + index) * .14;
      station.logo.rotation.y = camera.position.x > station.group.position.x ? .18 : -.18;
    });
    stackPortal.visible = destination.z < -54 && destination.z > -68;
    constellation.visible = destination.z < -64;
    stackPortal.rotation.set(elapsed * .12, elapsed * .18, 0);
    if (destination.z < -64) {
      const target = particleTargets[particleShape];
      for (let i = 0; i < particlePositions.length; i++) particlePositions[i] += (target[i] - particlePositions[i]) * damp;
      particleGeometry.attributes.position.needsUpdate = true;
    }
    particles.rotation.y = Math.sin(elapsed * .18) * .3 + pointerX * .15;
    renderer.render(scene, camera);
  }
  function sync() {
    cancelAnimationFrame(frame); last = 0;
    host.dataset.state = document.hidden ? 'paused' : 'running';
    if (!disposed && !document.hidden) frame = requestAnimationFrame(animate);
  }
  function move(event) {
    if (event.pointerType === 'touch') return;
    pointerX = event.clientX / innerWidth * 2 - 1;
    pointerY = event.clientY / innerHeight * 2 - 1;
    if (drag) { yaw = drag.yaw + (event.clientX - drag.x) * .005; pitch = THREE.MathUtils.clamp(drag.pitch + (event.clientY - drag.y) * .003, -.5, .5); }
  }
  function down(event) { if (event.button === 0) drag = { x: event.clientX, y: event.clientY, yaw, pitch }; }
  function release() { drag = null; }
  function rotate(event) {
    if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') { yaw = 0; pitch = 0; }
    else if (event.key === 'ArrowLeft') yaw -= .2;
    else if (event.key === 'ArrowRight') yaw += .2;
    else pitch = THREE.MathUtils.clamp(pitch + (event.key === 'ArrowUp' ? -.15 : .15), -.5, .5);
  }
  function theme() {
    const light = document.documentElement.dataset.theme === 'light';
    scene.background.copy(light ? lightColor : darkColor);
    scene.fog.color.copy(scene.background);
    floorMaterial.color.set(light ? 0xb7c5db : 0x101b30);
    metal.color.set(light ? 0x8c9cb5 : 0x506381);
    hemi.intensity = light ? 4 : 3;
    starMaterial.opacity = light ? .3 : .65;
    particleMaterial.color.set(light ? 0x3155b4 : 0x8fafff);
  }
  function reenter() { returning = { start: performance.now(), from: progress }; }
  function morph(event) { particleShape = event.detail % particleTargets.length; }
  function lost(event) {
    event.preventDefault(); destroy(); host.dataset.state = 'fallback';
    document.body.classList.add('world-fallback');
  }
  renderer.debug.onShaderError = () => queueMicrotask(() => lost({ preventDefault() {} }));
  host.append(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden','true');
  renderer.domElement.addEventListener('webglcontextlost', lost);
  host.tabIndex = 0;
  host.removeAttribute('aria-hidden');
  host.setAttribute('role','group');
  host.setAttribute('aria-label', english ? 'Interactive world. Arrow keys rotate the core. Home resets rotation.' : 'Mundo interativo. As setas giram o núcleo. Home restaura a rotação.');
  host.addEventListener('keydown', rotate);
  host.addEventListener('pointerdown', down);
  addEventListener('pointermove', move, { passive: true });
  addEventListener('pointerup', release);
  addEventListener('resize', resize, { passive: true });
  const layoutObserver = new ResizeObserver(refreshRoute);
  layoutObserver.observe(document.querySelector('main'));
  layoutObserver.observe(document.getElementById('contato'));
  document.fonts.ready.then(() => { if (!disposed) refreshRoute(); });
  document.addEventListener('portfolio:layout', refreshRoute);
  document.addEventListener('portfolio:theme', theme);
  document.addEventListener('portfolio:constellation', morph);
  document.addEventListener('portfolio:reenter', reenter);
  document.addEventListener('visibilitychange', sync);
  [metal, edge, floorMaterial, ...stations.map(station => station.sculpture.children[0].material)].forEach(material => { material.wireframe = true; });
  host.dataset.mode = 'wire';
  resize(); theme(); progress = scrollY;
  visual.classList.add('scene-ready');
  document.body.classList.add('world-rendered');
  sync();
  function destroy() {
    if (disposed) return;
    disposed = true; cancelAnimationFrame(frame);
    layoutObserver.disconnect();
    host.removeEventListener('keydown', rotate);
    host.removeEventListener('pointerdown', down);
    removeEventListener('pointermove', move);
    removeEventListener('pointerup', release);
    removeEventListener('resize', resize);
    document.removeEventListener('portfolio:layout', refreshRoute);
    document.removeEventListener('portfolio:theme', theme);
    document.removeEventListener('portfolio:constellation', morph);
    document.removeEventListener('portfolio:reenter', reenter);
    document.removeEventListener('visibilitychange', sync);
    renderer.domElement.removeEventListener('webglcontextlost', lost);
    const geometries = new Set(), materials = new Set();
    scene.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.material) materials.add(object.material);
    });
    geometries.forEach(geometry => geometry.dispose());
    materials.forEach(material => material.dispose());
    ownedTextures.forEach(texture => texture.dispose());
    renderer.dispose(); renderer.domElement.remove();
    visual.classList.remove('scene-ready');
    document.body.classList.remove('world-rendered');
  }
  return { destroy };
}
