/* ===========================================================================
   Architecture showcase scene — scroll-driven.

   Loads one of the three delivered GLB models (Architecture-1/2/3.glb) and maps
   scroll progress (0 → 1) onto the baked "Construction" animation, so the
   building assembles as the visitor scrolls, and the camera dollies from a site
   overview down to a three-quarter view of the finished house. The GLB ships
   geometry + keyframes only; camera, lights, sky and shadow are added here.

   Loaded lazily (see ArchHero.jsx) so Three.js + the model arrive as their own
   chunk after the poster frame has painted.
   =========================================================================== */

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// Site palette ramp (dark → light), so the model reads as a branded study model
// in CoArchitive's paper / sand / green tones rather than a generic render.
const PALETTE = [
  { l: 0.0, c: "#13301f" }, // green-deep
  { l: 0.22, c: "#2f5a40" }, // green-soft
  { l: 0.42, c: "#9a8f74" }, // deep tan
  { l: 0.6, c: "#c9bfa6" }, // tan / sand
  { l: 0.8, c: "#e7e1d2" }, // paper
  { l: 1.0, c: "#f6f3ec" }, // paper-hi
];

function toneFor(color) {
  // perceived brightness of the original material colour (0..1)
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

// Recolour a loaded model into the site palette. Glazing (transparent/emissive)
// is kept but cooled to a soft site blue-green.
function brandMaterials(root) {
  const cache = new Map();
  const remap = (m) => {
    if (cache.has(m)) return cache.get(m);
    const glassy = m.transparent === true || (m.opacity ?? 1) < 0.95;
    const base = m.color ? m.color.clone() : new THREE.Color("#c9bfa6");
    const next = new THREE.MeshStandardMaterial({
      color: glassy ? new THREE.Color("#8fb4b0") : toneFor(base),
      roughness: glassy ? 0.25 : 0.82,
      metalness: 0.0,
      transparent: glassy,
      opacity: glassy ? 0.42 : 1,
      envMapIntensity: 0.4,
    });
    cache.set(m, next);
    return next;
  };
  root.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    o.material = Array.isArray(o.material) ? o.material.map(remap) : remap(o.material);
  });
}

// soft vertical sky→sand gradient so the pale building always has contrast
function gradientTexture() {
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 256;
  const g = c.getContext("2d");
  const grd = g.createLinearGradient(0, 0, 0, 256);
  grd.addColorStop(0, "#dfe6e1");
  grd.addColorStop(0.55, "#e9e3d5");
  grd.addColorStop(1, "#cfc5af");
  g.fillStyle = grd;
  g.fillRect(0, 0, 4, 256);
  const tex = new THREE.CanvasTexture(c);
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
  scene.background = gradientTexture();

  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 5000);

  const hemi = new THREE.HemisphereLight(0xeaf2ff, 0x6f7a63, 0.6);
  scene.add(hemi);
  const ambient = new THREE.AmbientLight(0xffffff, 0.16);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xffe9c7, 2.0);
  sun.castShadow = true;
  scene.add(sun);
  scene.add(sun.target);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(8000, 8000),
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

  function placeCamera(p) {
    // dolly: high, far site overview → lower, closer three-quarter view
    const a = baseAngle + p * 0.5;
    const dist = radius * (3.5 - p * 1.25);
    const hgt = center.y + radius * (1.7 - p * 0.95);
    camera.position.set(
      center.x + Math.cos(a) * dist,
      hgt,
      center.z + Math.sin(a) * dist
    );
    camera.lookAt(center.x, center.y + radius * 0.12, center.z);
    camera.near = Math.max(0.1, dist / 90);
    camera.far = dist * 9;
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

    placeCamera(0);
  }

  function load(url) {
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (gltf) => {
          if (!alive) return;
          model = gltf.scene;
          brandMaterials(model);
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
            gltf.animations.forEach((clip) => {
              // played but never advanced by delta — the pose is set purely by
              // setProgress → mixer.setTime (a paused action ignores setTime).
              mixer.clipAction(clip).play();
            });
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

  // scroll handle: 0 (empty site) … 1 (finished building)
  function setProgress(p) {
    progressTarget = clamp(p, 0, 1);
  }

  function resize(w, h) {
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (ready) placeCamera(progressCur);
  }

  function tick() {
    if (!alive) return;
    rafId = requestAnimationFrame(tick);
    // ease toward the scroll target so scrubbing stays smooth
    progressCur += (progressTarget - progressCur) * 0.12;
    if (ready) {
      if (mixer) mixer.setTime(progressCur * duration);
      placeCamera(progressCur);
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
    scene.background?.dispose?.();
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
