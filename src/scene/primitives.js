/** Primitivas de geometría (box/cyl/line/deco/aspas). */
export function createPrimitives(THREE, M) {
const _edgeMat = new THREE.LineBasicMaterial({ color: 0x2b2b2d, transparent: true, opacity: 0.16 });
function addEdges(mesh, opacity = 0.16) {
  try {
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 28),
      opacity === 0.16 ? _edgeMat : new THREE.LineBasicMaterial({ color: 0x2b2b2d, transparent: true, opacity }));
    e.raycast = () => {}; mesh.add(e);
  } catch (_) {}
  return mesh;
}
const _noEdge = /(_led|_luz|servidor_|marca_|riel_|hilo|pulso|rayo|calor_|humo|lluvia|nube_|ventana_)/;
const box = (parent, name, m, w, h, d, x, y, z, ry = 0, edge = null) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  mesh.name = name; mesh.position.set(x, y, z); mesh.rotation.y = ry; parent.add(mesh);
  // Edges solo en volúmenes grandes (edificios/salas); racks y deco fina no duplican draw calls.
  const wantEdge = edge !== null ? edge : (Math.min(w, h, d) > 0.2 && Math.max(w, h, d) > 1.4 && !_noEdge.test(name));
  if (wantEdge) addEdges(mesh, Math.max(w, h, d) > 3 ? 0.22 : 0.14);
  return mesh;
};
const cyl = (parent, name, m, r, h, x, y, z, seg = 16, rot = null) => {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m);
  mesh.name = name; mesh.position.set(x, y, z); if (rot) mesh.rotation.set(...rot); parent.add(mesh); return mesh;
};
const line = (parent, name, m, a, b, r = 0.03) => {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const len = A.distanceTo(B), mid = A.clone().add(B).multiplyScalar(0.5);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 10), m);
  mesh.name = name; mesh.position.copy(mid);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  parent.add(mesh); return mesh;
};
// deco: detalle visual extra. Lleva "deco" en el nombre para que el deterioro,
// el picking y el resaltado lo ignoren (ver noDet / noPick).
const decoBox = (parent, name, m, w, h, d, x, y, z, ry = 0, edge = false) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  mesh.name = `deco_${name}`; mesh.position.set(x, y, z); mesh.rotation.y = ry;
  parent.add(mesh);
  if (edge) addEdges(mesh, 0.12);
  return mesh;
};
const decoCyl = (parent, name, m, r, h, x, y, z, seg = 12, rot = null) => {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m);
  mesh.name = `deco_${name}`; mesh.position.set(x, y, z); if (rot) mesh.rotation.set(...rot);
  parent.add(mesh); return mesh;
};
// Aspas para ventiladores: hijas del ventilador para que giren con él
function aspas(parentFan, tag, r = 0.34, n = 5) {
  for (let i = 0; i < n; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(r, 0.02, 0.1), M.fanBlade);
    b.name = `deco_${tag}_aspa_${i + 1}`; b.position.y = 0.03;
    const piv = new THREE.Group(); piv.rotation.y = (i / n) * Math.PI * 2; piv.add(b);
    b.position.x = r * 0.45; b.rotation.y = 0.5; parentFan.add(piv);
  }
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), M.deepSteel);
  hub.name = `deco_${tag}_hub`; hub.position.y = 0.04; parentFan.add(hub);
}

  return { addEdges, box, cyl, line, decoBox, decoCyl, aspas };
}
