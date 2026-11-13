/* ===========================================================================
   Architecture showcase scene — scroll-driven.

   Loads one of the three delivered GLB models (Architecture-1/2/3.glb) and maps
   scroll progress (0 → 1) onto the baked "Construction" animation, so the
   building assembles as the visitor scrolls. The first ~75% builds the house in
   CoArchitive's daytime study-model palette; the final stretch is the pay-off —
   a procedural city rises and lights up around it, the sky shifts to dusk, the
   house windows glow and the camera pulls back to a bright aerial city view.

   The GLB ships geometry + keyframes only; camera, lights, sky, shadow and the
   city layer are added here. Loaded lazily (see ArchHero.jsx).
   =========================================================================== */

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (t) => t * t * (3 - 2 * t);

// Site palette ramp (dark → light): the model reads as a branded study model in
// CoArchitive's paper / sand / green tones rather than a generic render.
const PALETTE = [
  { l: 0.0, c: "#13301f" },
  { l: 0.22, c: "#2f5a40" },
  { l: 0.42, c: "#9a8f74" },
  { l: 0.6, c: "#c9bfa6" },
  { l: 0.8, c: "#e7e1d2" },
  { l: 1.0, c: "#f6f3ec" },
];

function toneFor(color) {
  const lum = 0.21 * color.r + 0.72 * color.g + 0.07 * color.b;
  let a = PALETTE[0];
  let b = PALETTE[PALETTE.length - 1];
  for (let i = 0; i < PALETTE.length - 1; i++) {
    if (lum >= PALETTE[i].l && lum <= PALETTE[i + 1].l) {
      a = PALETTE[i];
      b = PALETTE[i + 1];
      break;
    }
  }
  const t = b.l === a.l ? 0 : (lum - a.l) / (b.l - a.l);
  return new THREE.Color(a.c).lerp(new THREE.Color(b.c), clamp(t, 0, 1));
}

// Recolour a loaded model into the site palette; glazing is kept but cooled and
// gains a warm emissive so the finished house can light up at dusk. Returns the
// glazing materials so their glow can be ramped with scroll.
function brandMaterials(root) {
  const cache = new Map();
  const glass = [];
  const warm = new THREE.Color("#ffcf8f");
  const remap = (m) => {
    if (cache.has(m)) return cache.get(m);
    const glassy = m.transparent === true || (m.opacity ?? 1) < 0.95;
    const base = m.color ? m.color.clone() : new THREE.Color("#c9bfa6");
    const next = new THREE.MeshStandardMaterial({
      color: glassy ? new THREE.Color("#8fb4b0") : toneFor(base),
      roughness: glassy ? 0.25 : 0.82,
      metalness: 0,
      transparent: glassy,
      opacity: glassy ? 0.5 : 1,
      emissive: glassy ? warm.clone() : new THREE.Color("#000000"),
      emissiveIntensity: 0,
      envMapIntensity: 0.4,
    });
    cache.set(m, next);
    if (glassy) glass.push(next);
    return next;
  };
  root.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    o.material = Array.isArray(o.material) ? o.material.map(remap) : remap(o.material);
  });
  return glass;
}

// A tileable "lit windows" emissive map for the city buildings.
function windowTexture() {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const g = c.getContext("2d");
  g.fillStyle = "#000000";
  g.fillRect(0, 0, 64, 64);
  const cols = 6;
  const rows = 6;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const on = Math.random() > 0.35;
      g.fillStyle = on
        ? ["#ffe6b0", "#ffd890", "#fff4d6", "#ffcf8f"][Math.floor(Math.random() * 4)]
        : "#120f0a";
      g.fillRect(x * 10 + 3, y * 10 + 3, 6, 6);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createArchScene(canvas, opts = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.96;

  const scene = new THREE.Scene();

  // --- gradient sky dome, lerped day → dusk via uniforms ---
  const DAY = { top: new THREE.Color("#c7d4da"), mid: new THREE.Color("#e8dfd0"), bot: new THREE.Color("#d6ccb5") };
  // deep teal-green dusk, on-brand, so the warm window lights read as bright
  const DUSK = { top: new THREE.Color("#0a2130"), mid: new THREE.Color("#1f4a39"), bot: new THREE.Color("#0b1813") };
  const skyUniforms = {
    uTop: { value: DAY.top.clone() },
    uMid: { value: DAY.mid.clone() },
    uBot: { value: DAY.bot.clone() },
  };
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: skyUniforms,
      vertexShader: `
        varying float vH;
        void main(){
          vH = normalize(position).y * 0.5 + 0.5;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        varying float vH;
        uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uBot;
        void main(){
          vec3 c = vH > 0.5 ? mix(uMid, uTop, (vH - 0.5) * 2.0) : mix(uBot, uMid, vH * 2.0);
          gl_FragColor = vec4(c, 1.0);
        }`,
    })
  );
  sky.frustumCulled = false;
  scene.add(sky);

  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 20000);

  const hemi = new THREE.HemisphereLight(0xeaf2ff, 0x6f7a63, 0.6);
  scene.add(hemi);
  const ambient = new THREE.AmbientLight(0xffffff, 0.16);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xffe9c7, 2.0);
  sun.castShadow = true;
  scene.add(sun);
  scene.add(sun.target);
  // warm fill that comes up at dusk, so the lit city reads as bright
  const cityGlow = new THREE.PointLight(0xffca7a, 0, 0);
  scene.add(cityGlow);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(40000, 40000),
    new THREE.ShadowMaterial({ opacity: 0.22 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const loader = new GLTFLoader();

  let model = null;
  let mixer = null;
  let duration = 1;
  let ready = false;
  let alive = true;
  let rafId = 0;

  const center = new THREE.Vector3();
  let radius = 10;
  const baseAngle = Math.PI * 0.26;

  let progressTarget = 0;
  let progressCur = 0;

  // city layer, built once the model is framed
  let cityGroup = null;
  let cityMat = null; // shared building material (emissive windows)
  let lampMat = null; // street-lamp emissive
  let glassMats = [];

  function buildCity(baseY) {
    cityGroup = new THREE.Group();
    cityGroup.position.y = baseY;

    cityMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#34463a"),
      roughness: 0.9,
      metalness: 0,
      emissive: new THREE.Color("#ffce86"),
      emissiveMap: windowTexture(),
      emissiveIntensity: 0,
    });
    lampMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#2a2a26"),
      emissive: new THREE.Color("#ffd27a"),
      emissiveIntensity: 0,
    });

    const box = new THREE.BoxGeometry(1, 1, 1);
    const lamp = new THREE.SphereGeometry(0.06 * radius, 8, 8);
    const span = 6; // grid half-extent in blocks
    const step = radius * 1.35;
    for (let gx = -span; gx <= span; gx++) {
      for (let gz = -span; gz <= span; gz++) {
        const dx = gx * step;
        const dz = gz * step;
        const fromCenter = Math.hypot(dx, dz);
        if (fromCenter < radius * 1.5) continue; // leave room for the house
        // thin the far field a little, randomly
        if (fromCenter > radius * 6 && Math.random() > 0.6) continue;
        const h = radius * (0.7 + Math.random() * Math.random() * 3.2);
        const w = step * (0.42 + Math.random() * 0.22);
        const d = step * (0.42 + Math.random() * 0.22);
        const b = new THREE.Mesh(box, cityMat);
        b.scale.set(w, h, d);
        b.position.set(dx + (Math.random() - 0.5) * step * 0.3, h / 2, dz + (Math.random() - 0.5) * step * 0.3);
        b.castShadow = false;
        b.receiveShadow = false;
        cityGroup.add(b);
        // a street lamp near some blocks
        if (Math.random() > 0.7) {
          const l = new THREE.Mesh(lamp, lampMat);
          l.position.set(dx - step * 0.4, radius * 0.18, dz - step * 0.4);
          cityGroup.add(l);
        }
      }
    }
    cityGroup.visible = false;
    scene.add(cityGroup);
  }

  function placeCamera(p, cl) {
    // dolly in while building, then pull back + up to an aerial city at the end
    const a = baseAngle + p * 0.5 + cl * 0.22;
    const dist = radius * (3.5 - p * 1.25) + cl * radius * 4.2;
    const hgt = center.y + radius * (1.7 - p * 0.95) + cl * radius * 2.8;
    camera.position.set(
      center.x + Math.cos(a) * dist,
      hgt,
      center.z + Math.sin(a) * dist
    );
    camera.lookAt(center.x, center.y + radius * (0.12 + cl * 0.25), center.z);
    camera.near = Math.max(0.1, dist / 120);
    camera.far = dist * 12 + radius * 60;
    camera.updateProjectionMatrix();
  }

  function frameModel() {
    const box = new THREE.Box3().setFromObject(model);
    box.getCenter(center);
    const size = box.getSize(new THREE.Vector3());
    radius = Math.max(size.x, size.z, size.y * 0.8) * 0.5 || 10;

    ground.position.y = box.min.y;

    sun.position.set(center.x + radius * 1.6, box.max.y + radius * 2.4, center.z + radius * 1.0);
    sun.target.position.copy(center);
    const sc = sun.shadow.camera;
    const d = radius * 2.8;
    sc.left = -d;
    sc.right = d;
    sc.top = d;
    sc.bottom = -d;
    sc.near = 0.5;
    sc.far = radius * 12;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.bias = -0.0004;
    sc.updateProjectionMatrix();

    sky.scale.setScalar(radius * 120);
    sky.position.copy(center);
    cityGlow.position.set(center.x, center.y + radius * 2.5, center.z);
    cityGlow.distance = radius * 30;

    buildCity(box.min.y);
    placeCamera(0, 0);
  }

  function load(url) {
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (gltf) => {
          if (!alive) return;
          model = gltf.scene;
          glassMats = brandMaterials(model);
          model.traverse((o) => {
            if (o.isMesh) {
              o.castShadow = true;
              o.receiveShadow = true;
            }
          });
          scene.add(model);
          if (gltf.animations && gltf.animations.length) {
            mixer = new THREE.AnimationMixer(model);
            duration = gltf.animations[0].duration || 1;
            gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
            mixer.setTime(0);
          }
          frameModel();
          ready = true;
          resolve();
        },
        undefined,
        (err) => reject(err || new Error("GLB load failed"))
      );
    });
  }

  function setProgress(p) {
    progressTarget = clamp(p, 0, 1);
  }

  // ramp the dusk / city / lights on, driven by how far into the end we are
  function applyCity(p) {
    const cl = smooth(clamp((p - 0.62) / 0.38, 0, 1)); // 0 until 62%, 1 at the end
    // sky day → dusk
    skyUniforms.uTop.value.copy(DAY.top).lerp(DUSK.top, cl);
    skyUniforms.uMid.value.copy(DAY.mid).lerp(DUSK.mid, cl);
    skyUniforms.uBot.value.copy(DAY.bot).lerp(DUSK.bot, cl);
    // sunlight dims toward evening, warm fill comes up
    sun.intensity = 2.0 * (1 - cl * 0.62);
    hemi.intensity = 0.6 * (1 - cl * 0.45);
    cityGlow.intensity = cl * radius * 2.2;
    renderer.toneMappingExposure = 0.96 + cl * 0.34;
    // city rises and lights up
    if (cityGroup) {
      cityGroup.visible = cl > 0.001;
      cityGroup.scale.y = 0.08 + cl * 0.92;
      if (cityMat) cityMat.emissiveIntensity = cl * 1.9;
      if (lampMat) lampMat.emissiveIntensity = cl * 3.2;
    }
    // the finished house windows glow
    for (const m of glassMats) m.emissiveIntensity = cl * 1.3;
    return cl;
  }

  function resize(w, h) {
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (ready) placeCamera(progressCur, smooth(clamp((progressCur - 0.62) / 0.38, 0, 1)));
  }

  function tick() {
    if (!alive) return;
    rafId = requestAnimationFrame(tick);
    progressCur += (progressTarget - progressCur) * 0.12;
    if (ready) {
      if (mixer) mixer.setTime(progressCur * duration);
      const cl = applyCity(progressCur);
      placeCamera(progressCur, cl);
    }
    renderer.render(scene, camera);
  }

  function start() {
    if (!rafId) tick();
  }

  function dispose() {
    alive = false;
    cancelAnimationFrame(rafId);
    rafId = 0;
    mixer?.stopAllAction();
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose?.();
      if (o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => {
          for (const k in m) {
            const v = m[k];
            if (v && v.isTexture) v.dispose();
          }
          m.dispose?.();
        });
      }
    });
    renderer.dispose();
  }

  return { load, setProgress, resize, start, dispose };
}
