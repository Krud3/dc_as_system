/** Carga y colocación de props GLB. */
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * @param {*} THREE
 * @param {THREE.Object3D} defaultParent — normalmente SUB.entorno
 */
export function createPlantSystem(THREE, defaultParent) {
  const gltfLoader = new GLTFLoader();
  const PLANT_FILES = {
    tree1: '/models/tree1.glb',
    tree2: '/models/tree2.glb',
    tree3: '/models/tree3.glb',
    tree4: '/models/tree.4.glb',
    tree5: '/models/tree5.glb',
    bush1: '/models/bush1.glb',
    extinguisher: '/models/fire-extinguisher.glb',
    desk: '/models/desk.glb',
    dumpster: '/models/dumpster.glb',
  };
  const _plantBox = new THREE.Box3();
  const _plantSize = new THREE.Vector3();
  function normalizePlant(scene) {
    const root = new THREE.Group();
    root.add(scene);
    scene.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true;
      o.receiveShadow = false;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of mats) {
        if (!m) continue;
        m.flatShading = true;
        m.metalness = 0;
        if (typeof m.roughness === 'number') m.roughness = Math.max(m.roughness, 0.72);
        m.needsUpdate = true;
      }
    });
    _plantBox.setFromObject(root);
    _plantBox.getSize(_plantSize);
    const s = 1 / Math.max(_plantSize.y, 1e-4);
    scene.scale.multiplyScalar(s);
    _plantBox.setFromObject(root);
    scene.position.x -= (_plantBox.min.x + _plantBox.max.x) * 0.5;
    scene.position.z -= (_plantBox.min.z + _plantBox.max.z) * 0.5;
    scene.position.y -= _plantBox.min.y;
    return root;
  }
  const plantTemplates = {};
  const plantQueue = [];
  function placePlant(key, name, x, z, height, ry = 0, parent = defaultParent, y = 0.2) {
    const tpl = plantTemplates[key];
    if (!tpl) {
      plantQueue.push({ key, name, x, z, height, ry, parent, y });
      return null;
    }
    const inst = tpl.clone(true);
    inst.name = name;
    let mi = 0;
    inst.traverse((o) => {
      if (!o.isMesh) return;
      mi += 1;
      o.name = `${name}_mesh_${mi}`;
      o.castShadow = true;
      o.receiveShadow = false;
    });
    inst.scale.setScalar(height);
    inst.position.set(x, y, z);
    inst.rotation.y = ry;
    parent.add(inst);
    return inst;
  }
  // Carga diferida: la escena procedural monta ya; GLBs llegan sin bloquear el primer frame.
  const plantsReady = Promise.all(Object.entries(PLANT_FILES).map(async ([key, url]) => {
    const gltf = await gltfLoader.loadAsync(url);
    plantTemplates[key] = normalizePlant(gltf.scene);
  })).then(() => {
    const pending = plantQueue.splice(0, plantQueue.length);
    for (const p of pending) placePlant(p.key, p.name, p.x, p.z, p.height, p.ry, p.parent, p.y);
  });
  void plantsReady.catch((err) => console.error('GLB plant/props', err));

  return { placePlant, plantsReady, plantTemplates, plantQueue, PLANT_FILES };
}
