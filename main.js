import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';
import { ScrollTrigger } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js';

gsap.registerPlugin(ScrollTrigger);
const canvas = document.querySelector('#scene');
const loader = document.querySelector('#loader');
const loaderBar = document.querySelector('.loader-line i');
const loaderNum = document.querySelector('.loader-percent');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030406);
scene.fog = new THREE.FogExp2(0x030406, 0.012);

const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 250);
camera.position.set(6, 3.1, 10.5);

let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  });
} catch (error) {
  document.body.classList.add('no-webgl');
  canvas.hidden = true;
  loader.classList.add('done');
  const fallback = document.createElement('div');
  fallback.className = 'webgl-fallback';
  fallback.innerHTML = '<span>WEBGL / UNAVAILABLE</span><b>XW—01</b><p>Your browser cannot display the interactive starfighter. The mission guide and specifications are still available below.</p>';
  document.body.append(fallback);
}

if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Cinematic Space Lighting
  scene.add(new THREE.AmbientLight(0x131a24, 1.4));
  scene.add(new THREE.HemisphereLight(0xd0e2f5, 0x090e14, 2.2));

  const key = new THREE.DirectionalLight(0xf2f8ff, 3.8);
  key.position.set(5, 7.5, 7.5);
  key.castShadow = true;
  scene.add(key);

  const keyBack = new THREE.DirectionalLight(0x7ea9d4, 1.6);
  keyBack.position.set(-6, 3, -4);
  scene.add(keyBack);

  const fill = new THREE.DirectionalLight(0x566d85, 1.2);
  fill.position.set(-4, -2, 5);
  scene.add(fill);

  const rim = new THREE.PointLight(0x4ee2ff, 28, 26);
  rim.position.set(2.5, 1.6, -3.5);
  scene.add(rim);

  const warm = new THREE.PointLight(0xff6a24, 5.5, 14);
  warm.position.set(0, -0.8, 3.5);
  scene.add(warm);

  // Materials helper for procedural elements
  const mat = (color, metalness = 0.75, roughness = 0.32, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, metalness, roughness, ...extra });

  const alloy = mat(0x9fa8ae, 0.82, 0.29);
  const lightAlloy = mat(0xc9cdd0, 0.72, 0.25);
  const dark = mat(0x242a30, 0.88, 0.3);
  const black = mat(0x080b0e, 0.58, 0.24);
  const red = mat(0x8d2626, 0.4, 0.38);
  const glass = mat(0x27404a, 0.72, 0.12, { transparent: true, opacity: 0.56 });
  const glow = new THREE.MeshStandardMaterial({
    color: 0xff6a24,
    emissive: 0xff4714,
    emissiveIntensity: 2.2,
    metalness: 0.35,
    roughness: 0.26
  });
  const cyan = new THREE.MeshStandardMaterial({
    color: 0x39dafa,
    emissive: 0x12a5d0,
    emissiveIntensity: 2.4,
    metalness: 0.3,
    roughness: 0.2
  });

  // Procedural ship (for exploded diagnostic engineering sequence)
  const ship = new THREE.Group();
  scene.add(ship);
  const parts = {};

  function group(name, pos = [0, 0, 0]) {
    const g = new THREE.Group();
    g.name = name;
    g.position.set(...pos);
    ship.add(g);
    parts[name] = g;
    g.userData.home = g.position.clone();
    return g;
  }

  function childGroup(parent, name, pos = [0, 0, 0]) {
    const g = new THREE.Group();
    g.name = name;
    g.position.set(...pos);
    parent.add(g);
    parts[name] = g;
    g.userData.home = g.position.clone();
    return g;
  }

  function mesh(parent, geometry, material, pos = [0, 0, 0], rot = [0, 0, 0]) {
    const m = new THREE.Mesh(geometry, material);
    m.position.set(...pos);
    m.rotation.set(...rot);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }

  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  function cylinder(parent, r1, r2, len, material, pos, rot = [Math.PI / 2, 0, 0], segments = 32) {
    return mesh(parent, new THREE.CylinderGeometry(r1, r2, len, segments, 1), material, pos, rot);
  }
  function torus(parent, r, t, material, pos, rot = [Math.PI / 2, 0, 0]) {
    return mesh(parent, new THREE.TorusGeometry(r, t, 10, 40), material, pos, rot);
  }

  function makeWing(name, x, z, angle) {
    const g = group(name, [x, 0, z]);
    g.rotation.y = angle;
    g.scale.x = name.includes('left') ? -1 : 1;
    const sh = new THREE.Shape();
    sh.moveTo(-0.2, -0.5);
    sh.lineTo(2.5, -0.26);
    sh.lineTo(2.9, 0);
    sh.lineTo(2.5, 0.26);
    sh.lineTo(-0.2, 0.5);
    sh.closePath();
    mesh(g, new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.035, bevelThickness: 0.03 }), lightAlloy, [0, -0.05, 0], [Math.PI / 2, 0, 0]);
    mesh(g, box(1.8, 0.035, 0.025), red, [1.18, 0.03, 0.34]);
    mesh(g, box(0.65, 0.045, 0.025), dark, [0.25, 0.035, -0.34]);
    for (let i = 0; i < 7; i++) {
      const x0 = 0.22 + i * 0.31;
      mesh(g, box(0.018, 0.02, 0.72), alloy, [x0, 0.045, 0]);
      for (const z0 of [-0.31, 0.31]) mesh(g, new THREE.SphereGeometry(0.025, 8, 6), dark, [x0, 0.065, z0]);
    }
    for (let i = 0; i < 3; i++) mesh(g, box(0.28, 0.025, 0.018), alloy, [1.7 + i * 0.22, 0.035, 0]);
    const cannon = childGroup(g, `${name}-cannon`, [2.62, 0.02, 0]);
    cylinder(cannon, 0.07, 0.055, 0.68, dark, [0, 0, -0.2], [Math.PI / 2, 0, 0], 16);
    cylinder(cannon, 0.09, 0.09, 0.12, alloy, [0, 0, -0.55], [Math.PI / 2, 0, 0], 16);
    mesh(cannon, new THREE.SphereGeometry(0.09, 12, 8), glow, [0, 0, -0.65]);
    g.userData.home = g.position.clone();
    return g;
  }

  function makeEngine(name, x, y) {
    const g = group(name, [x, y, 1.42]);
    cylinder(g, 0.48, 0.39, 0.95, alloy, [0, 0, 0]);
    cylinder(g, 0.39, 0.35, 0.12, dark, [0, 0, -0.47]);
    cylinder(g, 0.34, 0.39, 0.12, lightAlloy, [0, 0, 0.48]);
    torus(g, 0.39, 0.045, alloy, [0, 0, 0.53]);
    torus(g, 0.29, 0.025, glow, [0, 0, 0.58]);
    cylinder(g, 0.25, 0.21, 0.42, dark, [0, 0, 0.2]);
    cylinder(g, 0.22, 0.15, 0.23, black, [0, 0, 0.42]);
    torus(g, 0.19, 0.025, cyan, [0, 0, 0.55]);
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI) / 5;
      mesh(g, box(0.035, 0.035, 0.55), dark, [Math.cos(a) * 0.405, Math.sin(a) * 0.405, 0], [0, 0, a]);
    }
    for (const z of [-0.25, -0.07, 0.11, 0.29]) torus(g, 0.395, 0.012, lightAlloy, [0, 0, z]);
    const turbine = childGroup(g, `${name}-turbine`, [0, 0, 0.25]);
    torus(turbine, 0.24, 0.035, alloy, [0, 0, 0]);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      mesh(turbine, box(0.22, 0.025, 0.04), lightAlloy, [Math.cos(a) * 0.12, Math.sin(a) * 0.12, 0], [0, 0, a]);
    }
    turbine.userData.home = turbine.position.clone();
    g.userData.home = g.position.clone();
    return g;
  }

  // Fuselage, modular canopy, nose, and internal backbone
  const hull = group('hull', [0, 0, 0]);
  cylinder(hull, 0.49, 0.38, 2.6, alloy, [0, 0, 0.05]);
  cylinder(hull, 0.42, 0.34, 0.7, dark, [0, 0, -1.25]);
  mesh(hull, new THREE.ConeGeometry(0.39, 1.25, 8), lightAlloy, [0, 0, -2.15], [-Math.PI / 2, 0, 0]);
  for (let z = -1.1; z < 1.2; z += 0.22) torus(hull, 0.405, 0.012, dark, [0, 0, z]);
  mesh(hull, box(0.12, 0.16, 2.4), dark, [0, -0.38, 0.05]);
  for (const s of [-1, 1]) mesh(hull, box(0.035, 0.12, 1.65), lightAlloy, [s * 0.31, 0.1, 0.1]);
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5;
    const x = Math.cos(a) * 0.47, y = Math.sin(a) * 0.47;
    cylinder(hull, 0.03, 0.03, 0.09, dark, [x, y, -0.4], [0, Math.PI / 2 - a, Math.PI / 2], 8);
  }

  const canopy = group('canopy', [0, 0.43, -0.85]);
  mesh(canopy, new THREE.SphereGeometry(0.44, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), glass, [0, 0, 0], [Math.PI / 2, 0, 0]);
  mesh(canopy, box(0.035, 0.025, 0.72), alloy, [0, 0.12, 0]);
  for (const z of [-0.3, 0.3]) mesh(canopy, box(0.48, 0.035, 0.035), alloy, [0, 0.04, z]);

  const cockpit = group('cockpit', [0, 0.03, -0.75]);
  mesh(cockpit, box(0.48, 0.28, 0.85), dark);
  mesh(cockpit, box(0.29, 0.36, 0.35), black, [0, 0.17, 0.06]);
  cylinder(cockpit, 0.045, 0.04, 0.36, alloy, [0, -0.05, -0.24], [Math.PI / 2, 0, 0], 10);
  mesh(cockpit, box(0.3, 0.08, 0.12), cyan, [0, 0.18, -0.4]);

  const reactor = group('reactor', [0, 0, 0.2]);
  cylinder(reactor, 0.29, 0.29, 0.55, dark, [0, 0, 0]);
  torus(reactor, 0.31, 0.045, alloy, [0, 0, -0.25]);
  torus(reactor, 0.31, 0.045, alloy, [0, 0, 0.25]);
  cylinder(reactor, 0.18, 0.18, 0.42, cyan, [0, 0, 0]);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    mesh(reactor, box(0.06, 0.07, 0.73), alloy, [Math.cos(a) * 0.34, Math.sin(a) * 0.34, 0], [0, 0, a]);
  }

  const cage = group('reactor-cage', [0, 0, 0.15]);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    mesh(cage, box(0.035, 0.035, 0.9), dark, [Math.cos(a) * 0.48, Math.sin(a) * 0.48, 0], [0, 0, a]);
  }

  makeWing('wing-upper-left', -0.62, 0, -0.43);
  makeWing('wing-lower-left', -0.62, 0.3, 0.43);
  makeWing('wing-upper-right', 0.62, 0, 0.43);
  makeWing('wing-lower-right', 0.62, 0.3, -0.43);

  makeEngine('engine-upper-left', -0.92, 0.43);
  makeEngine('engine-upper-right', 0.92, 0.43);
  makeEngine('engine-lower-left', -0.92, -0.43);
  makeEngine('engine-lower-right', 0.92, -0.43);

  for (const s of [-1, 1]) {
    const brace = group(`brace-${s}`, [s * 0.72, -0.04, 0.8]);
    mesh(brace, box(0.1, 0.1, 1.2), dark, [0, 0, 0.15], [0, s * 0.15, 0]);
    for (let i = 0; i < 5; i++) {
      const z = -0.2 + i * 0.18;
      cylinder(brace, 0.018, 0.018, 0.55, alloy, [s * 0.12, 0.1, z], [Math.PI / 2, 0, 0], 8);
    }
  }

  const micro = new THREE.Group();
  ship.add(micro);
  for (let i = 0; i < 85; i++) {
    const geo = i % 4 === 0 ? new THREE.BoxGeometry(0.035, 0.035, 0.08) : new THREE.SphereGeometry(0.018, 6, 5);
    const m = mesh(micro, geo, i % 5 === 0 ? red : alloy, [
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 1.6,
      (Math.random() - 0.5) * 4
    ]);
    m.userData.origin = m.position.clone();
    m.userData.phase = Math.random() * Math.PI * 2;
  }

  // Deep-space starfield & ambient dust
  const starCount = 2400;
  const positions = new Float32Array(starCount * 3);
  let seed = 947;
  function rand() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  for (let i = 0; i < starCount; i++) {
    const r = 18 + rand() * 95;
    const a = rand() * Math.PI * 2;
    const b = Math.acos(2 * rand() - 1);
    positions[i * 3] = r * Math.sin(b) * Math.cos(a);
    positions[i * 3 + 1] = r * Math.cos(b);
    positions[i * 3 + 2] = r * Math.sin(b) * Math.sin(a);
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const stars = new THREE.Points(
    sg,
    new THREE.PointsMaterial({
      color: 0xc8daf0,
      size: 0.09,
      transparent: true,
      opacity: 0.82,
      sizeAttenuation: true
    })
  );
  scene.add(stars);

  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(350 * 3);
  for (let i = 0; i < 350; i++) {
    dustPos[i * 3] = (rand() - 0.5) * 28;
    dustPos[i * 3 + 1] = (rand() - 0.5) * 14;
    dustPos[i * 3 + 2] = (rand() - 0.5) * 35;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({ color: 0x718599, size: 0.025, transparent: true, opacity: 0.45 })
  );
  scene.add(dust);

  // ==========================================
  // TEXTURED X-WING GLB MODEL INTEGRATION
  // ==========================================
  const glbRoot = new THREE.Group();
  glbRoot.name = 'glb-starfighter-root';
  scene.add(glbRoot);

  const glbDriftGroup = new THREE.Group();
  glbRoot.add(glbDriftGroup);

  const glbDragGroup = new THREE.Group();
  glbDriftGroup.add(glbDragGroup);

  // Base hero orientation: centered on hero page, nose facing forward/right with dynamic hero bank
  const HERO_ROT_X = -0.05;
  const HERO_ROT_Y = 0.24;
  const HERO_ROT_Z = -0.07;
  glbRoot.rotation.set(HERO_ROT_X, HERO_ROT_Y, HERO_ROT_Z);
  glbRoot.position.set(0, 0, 0); // Positioned at exact 3D center of the hero screen

  let glbLoaded = false;
  let glbModel = null;
  const engineLights = [];
  const thrusterSprites = [];

  // Loader state handling
  let currentLoadPercent = 0;
  function updateLoaderProgress(pct) {
    currentLoadPercent = Math.max(currentLoadPercent, Math.min(100, Math.round(pct)));
    if (loaderBar) loaderBar.style.width = currentLoadPercent + '%';
    if (loaderNum) loaderNum.textContent = String(currentLoadPercent).padStart(2, '0');
    if (currentLoadPercent >= 100) {
      setTimeout(() => loader.classList.add('done'), 400);
    }
  }

  // Smooth fallback progress timer while downloading 7.7MB asset
  const loaderInterval = setInterval(() => {
    if (glbLoaded) {
      clearInterval(loaderInterval);
      return;
    }
    if (currentLoadPercent < 90) {
      updateLoaderProgress(currentLoadPercent + Math.ceil((90 - currentLoadPercent) * 0.08));
    }
  }, 100);

  const gltfLoader = new GLTFLoader();
  gltfLoader.load(
    './source/textured_x-wing_low_poly.glb',
    (gltf) => {
      clearInterval(loaderInterval);
      glbModel = gltf.scene;

      // Ensure crisp PBR textures and prevent Sketchfab BLEND sorting artifacts
      glbModel.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.depthWrite = true;
            child.material.depthTest = true;
            child.material.roughness = Math.min(child.material.roughness ?? 0.5, 0.65);
            child.material.metalness = Math.max(child.material.metalness ?? 0.4, 0.4);
            if (child.material.map) {
              child.material.map.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
            }
          }
        }
      });

      // Calculate bounding box and center geometric centroid exactly to (0, 0, 0)
      const bbox = new THREE.Box3().setFromObject(glbModel);
      const center = bbox.getCenter(new THREE.Vector3());
      const size = bbox.getSize(new THREE.Vector3());
      glbModel.position.sub(center);

      // Scale model to match hero screen focal dimensions (~5.8 units span)
      const maxDim = Math.max(size.x, size.y, size.z);
      const scaleFactor = 5.8 / maxDim;
      glbModel.scale.setScalar(scaleFactor);

      // Ion Drive Thrusters at rear engine exhausts
      const thrusterOffsets = [
        [-0.88 * scaleFactor, 0.38 * scaleFactor, -3.35 * scaleFactor],
        [0.88 * scaleFactor, 0.38 * scaleFactor, -3.35 * scaleFactor],
        [-0.90 * scaleFactor, -0.40 * scaleFactor, -3.35 * scaleFactor],
        [0.90 * scaleFactor, -0.40 * scaleFactor, -3.35 * scaleFactor]
      ];

      const thrusterRoot = new THREE.Group();
      thrusterOffsets.forEach((pos) => {
        // Point light for engine glow
        const pLight = new THREE.PointLight(0x4ee2ff, 2.5, 7.0);
        pLight.position.set(...pos);
        thrusterRoot.add(pLight);
        engineLights.push(pLight);

        // Core plasma flare
        const flareGeo = new THREE.SphereGeometry(0.12 * scaleFactor, 12, 8);
        const flareMat = new THREE.MeshBasicMaterial({ color: 0x9eecff });
        const flare = new THREE.Mesh(flareGeo, flareMat);
        flare.position.set(...pos);
        thrusterRoot.add(flare);
        thrusterSprites.push(flare);

        // Ion ring halo
        const haloGeo = new THREE.TorusGeometry(0.24 * scaleFactor, 0.035 * scaleFactor, 8, 24);
        const haloMat = new THREE.MeshBasicMaterial({ color: 0x1aa6f5 });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        halo.position.set(...pos);
        thrusterRoot.add(halo);
      });

      glbModel.add(thrusterRoot);
      glbDragGroup.add(glbModel);

      glbLoaded = true;
      updateLoaderProgress(100);
      updateScene(window.scrollY / (document.documentElement.scrollHeight - innerHeight || 1));
    },
    (xhr) => {
      if (xhr.lengthComputable && xhr.total > 0) {
        const pct = Math.round((xhr.loaded / xhr.total) * 100);
        updateLoaderProgress(pct);
      }
    },
    (error) => {
      console.warn('Could not load textured GLB starship:', error);
      clearInterval(loaderInterval);
      updateLoaderProgress(100);
    }
  );

  // Mouse parallax and interactive hero drag-to-rotate
  const mouse = { x: 0, y: 0 };
  let isDragging = false;
  let startPointer = { x: 0, y: 0 };
  const targetDragRot = { x: 0, y: 0 };
  const heroSection = document.querySelector('.hero');
  const heroHint = document.querySelector('.hero-3d-hint');

  window.addEventListener(
    'pointermove',
    (e) => {
      mouse.x = (e.clientX / innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / innerHeight - 0.5) * 2;

      if (isDragging && progress < 0.15) {
        const dx = e.clientX - startPointer.x;
        const dy = e.clientY - startPointer.y;
        startPointer.x = e.clientX;
        startPointer.y = e.clientY;

        targetDragRot.y += dx * 0.007;
        targetDragRot.x += dy * 0.007;
        targetDragRot.x = THREE.MathUtils.clamp(targetDragRot.x, -0.65, 0.65);

        if (heroHint) heroHint.style.opacity = '0';
      }
    },
    { passive: true }
  );

  window.addEventListener('pointerdown', (e) => {
    if (progress > 0.15) return;
    if (e.target.closest('a, button, input, .sound-control, .mobile-menu')) return;
    isDragging = true;
    startPointer.x = e.clientX;
    startPointer.y = e.clientY;
    if (heroSection) heroSection.classList.add('is-dragging');
  });

  window.addEventListener('pointerup', () => {
    isDragging = false;
    if (heroSection) heroSection.classList.remove('is-dragging');
  });

  let progress = 0;
  let launchGlow = 0;
  const smooth = (a, b, t) => a + (b - a) * THREE.MathUtils.clamp(t, 0, 1);
  const ease = (t) => {
    t = THREE.MathUtils.clamp(t, 0, 1);
    return t * t * (3 - 2 * t);
  };
  function segment(p, a, b) {
    return ease((p - a) / (b - a));
  }

  function cameraPose(p) {
    let x = 6, y = 3.1, z = 10.5, tx = 0, ty = 0, tz = 0, roll = 0;
    if (p < 0.12) {
      const t = segment(p, 0, 0.12);
      x = smooth(6, 3.8, t);
      y = smooth(3.1, 2.1, t);
      z = smooth(10.5, 8.2, t);
      roll = smooth(0, -0.06, t);
    } else if (p < 0.24) {
      const t = segment(p, 0.12, 0.24);
      x = smooth(3.8, -4, t);
      y = smooth(2.1, 3, t);
      z = smooth(8.2, 7, t);
      roll = smooth(-0.06, 0.04, t);
    } else if (p < 0.43) {
      const t = segment(p, 0.24, 0.43);
      x = smooth(-4, 0, t);
      y = smooth(3, 2, t);
      z = smooth(7, 11, t);
    } else if (p < 0.54) {
      const t = segment(p, 0.43, 0.54);
      x = smooth(0, 0.1, t);
      y = smooth(2, 0.5, t);
      z = smooth(11, 2.35, t);
      tx = smooth(0, 0, t);
      tz = smooth(0, 0.2, t);
    } else if (p < 0.66) {
      const t = segment(p, 0.54, 0.66);
      x = smooth(0.1, 2.7, t);
      y = smooth(0.5, 1.1, t);
      z = smooth(2.35, 4.25, t);
      tx = smooth(0, -0.5, t);
      tz = smooth(0.2, 1.4, t);
    } else if (p < 0.75) {
      const t = segment(p, 0.66, 0.75);
      x = smooth(2.7, 0, t);
      y = smooth(1.1, 0.5, t);
      z = smooth(4.25, 3.5, t);
      tz = smooth(1.4, 0, t);
    } else if (p < 0.9) {
      const t = segment(p, 0.75, 0.9);
      x = smooth(0, 2.8, t);
      y = smooth(0.5, 2.1, t);
      z = smooth(3.5, 10.7, t);
    } else {
      const t = segment(p, 0.9, 1);
      x = smooth(2.8, 0, t);
      y = smooth(2.1, 1.3, t);
      z = smooth(10.7, 14, t);
      tx = smooth(0, 0, t);
    }
    const small = innerWidth < 650 ? 1.35 : 1;
    camera.position.set(x * small + mouse.x * 0.18, y * small - mouse.y * 0.12, z * small);
    camera.rotation.z = roll;
    camera.lookAt(tx, ty, tz);
  }

  function updateScene(p) {
    progress = p;
    const ext = segment(p, 0.23, 0.43);
    const ret = segment(p, 0.75, 0.9);
    const explode = Math.max(0, ext - ret);
    const spread = explode * 1.0;

    // SCROLLYTELLING STAGE TRANSITION FOR TEXTURED GLB STARFIGHTER
    if (p < 0.22) {
      // HERO & INITIAL FLIGHT: Textured GLB is the primary centerpiece at origin (0, 0, 0)
      glbRoot.visible = true;
      ship.visible = p > 0.18; // Smoothly hand off into flight stage

      const tFlight = segment(p, 0.08, 0.22);
      glbRoot.position.set(
        smooth(0, 0.4, tFlight),
        smooth(0, -0.15, tFlight),
        smooth(0, -2.5, tFlight)
      );
      glbRoot.rotation.set(
        smooth(HERO_ROT_X, -0.14, tFlight),
        smooth(HERO_ROT_Y, -0.05, tFlight),
        smooth(HERO_ROT_Z, -0.32, tFlight)
      );
      glbRoot.scale.setScalar(1);
    } else if (p >= 0.22 && p <= 0.78) {
      // ANATOMY / EXPLODED DIAGNOSTIC: Procedural components open for engineering inspection
      glbRoot.visible = false;
      ship.visible = true;
    } else if (p > 0.78 && p <= 0.88) {
      // REASSEMBLY: Components snap back to 100% assembly, textured GLB returns
      const tReassemble = segment(p, 0.78, 0.88);
      glbRoot.visible = p > 0.82;
      ship.visible = p <= 0.86;
      glbRoot.position.set(0, 0, 0);
      glbRoot.rotation.set(HERO_ROT_X, HERO_ROT_Y, HERO_ROT_Z);
      glbRoot.scale.setScalar(smooth(0.85, 1.0, tReassemble));
    } else {
      // DEPARTURE / HYPERDRIVE LAUNCH: Textured GLB accelerates into the cosmos
      glbRoot.visible = true;
      ship.visible = false;
      const launch = segment(p, 0.88, 1);
      launchGlow = launch;
      glbRoot.rotation.set(-0.02, 0, 0);
      glbRoot.position.set(0, launch * 0.45, -launch * 28);
      glbRoot.scale.setScalar(Math.max(0.01, 1 - launch * 0.65));
    }

    // Procedural parts animation for exploded engineering view
    ship.rotation.y = 0.08 * Math.sin(p * 7);
    ship.rotation.x = 0.03 * Math.sin(p * 11);
    ship.rotation.z = 0;

    for (const [name, g] of Object.entries(parts)) {
      const h = g.userData.home;
      if (!h) continue;
      let dx = 0, dy = 0, dz = 0;
      if (name === 'hull') { dz = -0.2 * spread; dy = -0.1 * spread; }
      if (name === 'canopy') { dy = 1.5 * spread; dz = -0.35 * spread; }
      if (name === 'cockpit') { dy = 0.45 * spread; dz = -0.8 * spread; }
      if (name === 'reactor') { dy = 0.4 * spread; dz = 1.55 * spread; g.rotation.z = 0.28 * spread; }
      if (name === 'reactor-cage') { dx = 0.55 * spread; dy = 0.15 * spread; dz = 1.25 * spread; }
      if (name.startsWith('wing-') && !name.includes('cannon')) {
        const side = Math.sign(h.x) || 1;
        dx = side * 1.15 * spread;
        dy = (name.includes('upper') ? 1 : -1) * 0.58 * spread;
        dz = (name.includes('upper') ? -0.9 : 0.9) * spread;
        g.rotation.y = (name.includes('left') ? -1 : 1) * 0.23 * spread;
      }
      if (name.includes('-cannon')) {
        dx = (name.includes('left') ? -1 : 1) * 0.2 * spread;
        dy = 0.72 * spread;
        dz = -0.38 * spread;
        g.rotation.x = 0.35 * spread;
      }
      if (name.startsWith('engine-')) {
        dx = (h.x < 0 ? -1 : 1) * 1.05 * spread;
        dy = (h.y > 0 ? 1 : -1) * 0.68 * spread;
        dz = 1.7 * spread;
        g.rotation.x = 0.18 * spread;
      }
      if (name.includes('-turbine')) {
        dz = 0.8 * spread;
        g.rotation.z = p * 2.4;
      }
      if (name.startsWith('brace')) {
        dx = Math.sign(h.x) * 0.3 * spread;
        dy = -0.55 * spread;
      }
      g.position.set(h.x + dx, h.y + dy, h.z + dz);
    }

    const inside = segment(p, 0.445, 0.5) * (1 - segment(p, 0.515, 0.54));
    const reactorLight = THREE.MathUtils.lerp(2.2, 4.7, inside);
    cyan.emissiveIntensity = reactorLight;
    glow.emissiveIntensity = 2.2 + segment(p, 0.91, 0.98) * 5;

    for (let i = 0; i < micro.children.length; i++) {
      const m = micro.children[i];
      const o = m.userData.origin;
      const phase = m.userData.phase;
      const amp = 0.22 + explode * 0.85;
      m.position.set(
        o.x + Math.sin(p * 5 + phase) * amp,
        o.y + Math.cos(p * 4 + phase) * amp,
        o.z + Math.sin(p * 3 + phase) * amp
      );
      m.visible = explode > 0.1 && explode < 0.95;
    }

    const launch = segment(p, 0.9, 1);
    ship.scale.setScalar(1 - launch * 0.58);
    ship.position.z = -launch * 15;
    ship.position.y = launch * 0.45;
    stars.rotation.y = p * 0.025;
    dust.position.z = (p - 0.5) * -4;

    cameraPose(p);

    const rail = document.querySelector('.progress-rail i');
    if (rail) rail.style.height = `${p * 100}%`;

    const topbar = document.querySelector('.topbar');
    if (topbar) topbar.classList.toggle('scrolled', scrollY > 35);

    const phases = document.querySelectorAll('.phase-list span');
    const phaseIdx = p < 0.28 ? 0 : p < 0.33 ? 1 : p < 0.38 ? 2 : 3;
    phases.forEach((el, i) => el.classList.toggle('active', i === phaseIdx));
  }

  ScrollTrigger.create({
    trigger: 'main',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1.15,
    onUpdate: (self) => updateScene(self.progress),
    invalidateOnRefresh: true
  });

  // Animation Loop with weightless drift and thruster pulses
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Procedural ship subtle idle rotation
    ship.rotation.y += 0.00045;
    for (const g of Object.values(parts)) {
      if (g.name.includes('-turbine') && progress < 0.5) g.rotation.z += 0.003;
    }

    // Textured GLB interactive drag easing & hover physics
    if (!isDragging && progress < 0.15) {
      targetDragRot.x = THREE.MathUtils.lerp(targetDragRot.x, 0, 0.035);
      targetDragRot.y = THREE.MathUtils.lerp(targetDragRot.y, 0, 0.035);
    }
    glbDragGroup.rotation.x += (targetDragRot.x - glbDragGroup.rotation.x) * 0.12;
    glbDragGroup.rotation.y += (targetDragRot.y - glbDragGroup.rotation.y) * 0.12;

    // Natural deep-space hover oscillation
    glbDriftGroup.position.y = Math.sin(t * 1.5) * 0.07;
    glbDriftGroup.rotation.z = Math.sin(t * 1.2) * 0.025 + mouse.x * -0.05;
    glbDriftGroup.rotation.x = Math.cos(t * 1.1) * 0.018 - mouse.y * 0.04;

    // Quad Ion Thruster pulses
    const thrusterPulse = 2.2 + Math.sin(t * 10.0) * 0.45 + launchGlow * 18;
    for (let i = 0; i < engineLights.length; i++) {
      engineLights[i].intensity = thrusterPulse;
    }
    for (let i = 0; i < thrusterSprites.length; i++) {
      thrusterSprites[i].scale.setScalar(1.0 + Math.sin(t * 14.0) * 0.12 + launchGlow * 2.8);
    }

    warm.intensity = 4.6 + Math.sin(t * 2.4) * 0.6 + launchGlow * 9;
    rim.intensity = 26 + launchGlow * 14;
    stars.rotation.x = Math.sin(t * 0.03) * 0.01;

    renderer.render(scene, camera);
  }

  function resize() {
    camera.aspect = innerWidth / innerHeight;
    camera.fov = innerWidth < 650 ? 43 : 38;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 650 ? 1.35 : 1.8));
    renderer.setSize(innerWidth, innerHeight);
    ScrollTrigger.refresh();
  }
  addEventListener('resize', resize);

  animate();
  updateScene(0);

  // Mobile menu and replay button
  const menu = document.querySelector('.mobile-menu');
  const menuBtn = document.querySelector('.menu-button');
  const menuClose = document.querySelector('.menu-close');
  if (menuBtn && menu) menuBtn.addEventListener('click', () => menu.classList.add('open'));
  if (menuClose && menu) menuClose.addEventListener('click', () => menu.classList.remove('open'));
  if (menu) {
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => menu.classList.remove('open')));
  }
  const replayBtn = document.querySelector('.replay');
  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      if (menu) menu.classList.remove('open');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Audio ambience toggle
  let audioCtx = null, osc = null, gain = null, audioOn = false;
  const soundBtn = document.querySelector('#soundToggle');
  if (soundBtn) {
    soundBtn.addEventListener('click', async () => {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        osc = audioCtx.createOscillator();
        const filter = audioCtx.createBiquadFilter();
        gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 48;
        filter.type = 'lowpass';
        filter.frequency.value = 95;
        gain.gain.value = 0;
        osc.connect(filter).connect(gain).connect(audioCtx.destination);
        osc.start();
      }
      await audioCtx.resume();
      audioOn = !audioOn;
      gain.gain.setTargetAtTime(audioOn ? 0.028 : 0, audioCtx.currentTime, 0.35);
      const bEl = soundBtn.querySelector('b');
      if (bEl) bEl.textContent = audioOn ? 'ON' : 'OFF';
      soundBtn.setAttribute('aria-label', audioOn ? 'Turn sound off' : 'Turn sound on');
    });
  }
}
