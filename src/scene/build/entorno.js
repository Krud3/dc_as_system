/** ENTORNO: terreno, rayo, faroles, torres, ciudad, plantings. */

export function buildEntorno(ctx) {
  const {
    THREE, SUB, M, mat, box, decoBox, decoCyl, line, placePlant,
  } = ctx;
// ===== ENTORNO =====
const E = SUB.entorno;
box(E, 'terreno', M.ground, 70, 0.2, 50, 0, 0.1, 0);
M.rayo = mat('rayo', 0xf4eefc, 0.2, 0, { emissive: 0xb497cf, emissiveIntensity: 2, transparent: true, opacity: 0 });
const rayo = new THREE.Group(); rayo.name = 'rayo'; rayo.visible = false; E.add(rayo);
{ const pts = [[30, 30, -14], [31.5, 24, -13], [29.5, 18, -14.5], [30.8, 13, -13.6], [30, 9, -14]];
  for (let i = 0; i < pts.length - 1; i++) line(rayo, `rayo_seg_${i + 1}`, M.rayo, pts[i], pts[i + 1], 0.09);
  line(rayo, 'rayo_rama', M.rayo, [29.5, 18, -14.5], [26.5, 14, -16.5], 0.05); }
box(E, 'via_publica', M.asphalt, 70, 0.03, 3.6, 0, 0.215, 19.6);
// línea central segmentada (deco, no interfiere)
for (let x = -34; x < 34; x += 2.4) decoBox(E, `via_linea_${x}`, M.paper, 1.2, 0.012, 0.12, x, 0.235, 19.6);
M.farol = mat('farol', 0xf0e8f8, 0.32, 0, { emissive: 0xb497cf, emissiveIntensity: 1.55 });
const faroles = [];
[-30, -20, -10, 0, 10, 20, 30].forEach((x, i) => {
  box(E, `farol_${i + 1}_poste`, M.deepSteel, 0.12, 4.2, 0.12, x, 0.2 + 2.1, 21.8);
  box(E, `farol_${i + 1}_brazo`, M.deepSteel, 0.08, 0.08, 1.1, x, 0.2 + 4.15, 21.35);
  box(E, `farol_${i + 1}_lampara`, M.farol, 0.46, 0.1, 0.28, x, 0.2 + 4.1, 20.85);
  decoBox(E, `farol_cap_${i + 1}`, M.deepSteel, 0.54, 0.06, 0.34, x, 0.2 + 4.18, 20.85);
  // Una PointLight cada dos faroles: el resto se ve por emisión del mesh.
  if (i % 2 === 0) {
    const pl = new THREE.PointLight(0xb497cf, 0, 14, 1.6); pl.position.set(x, 0.2 + 3.85, 20.8); pl.name = `farol_${i + 1}_luz`; E.add(pl); faroles.push(pl);
  }
});
const tower = (x, z, n) => {
  box(E, `${n}_mastil`, M.deepSteel, 0.26, 9, 0.26, x, 4.7, z);
  box(E, `${n}_cruceta`, M.deepSteel, 3.0, 0.14, 0.14, x, 8.6, z);
  box(E, `${n}_cruceta_2`, M.deepSteel, 2.2, 0.14, 0.14, x, 7.4, z);
  // aisladores deco
  [-1.2, -0.6, 0, 0.6, 1.2].forEach((o, k) => decoCyl(E, `${n}_aislador_${k}`, M.cabinetWhite, 0.07, 0.3, x + o, 8.45, z, 8));
  decoBox(E, `${n}_base`, M.concrete, 1.2, 0.3, 1.2, x, 0.35, z, 0, true);
};
tower(30, -14, 'torre_at_1'); tower(30, 2, 'torre_at_2');
line(E, 'linea_at', M.ink, [30, 8.7, -14], [30, 8.7, 2]);
box(E, 'ciudad_1', M.wallAccent, 5, 7, 5, -28, 3.7, -16);
box(E, 'ciudad_2', M.cabinetWhite, 4, 10, 4, -22, 5.2, -19);
box(E, 'ciudad_3', M.wallAccent, 6, 5, 4, -30, 2.7, -8);
// ventanas deco en edificios base (ilustración como la referencia)
[['ciudad_1', -28, 3.7, -16, 5, 7, 5], ['ciudad_2', -22, 5.2, -19, 4, 10, 4], ['ciudad_3', -30, 2.7, -8, 6, 5, 4]].forEach(([tag, bx, by, bz, w, h, d], bi) => {
  for (let f = 0; f < Math.floor(h / 1.3); f++) for (let cc = 0; cc < Math.floor(w / 1.1); cc++)
    decoBox(E, `ciudad_win_${bi}_${f}_${cc}`, M.screenBlue, 0.55, 0.6, 0.04, bx - w / 2 + 0.7 + cc * 1.1, 0.2 + 1.1 + f * 1.3, bz + d / 2 + 0.02);
  decoBox(E, `ciudad_roof_${bi}`, M.wallMuro, w + 0.3, 0.18, d + 0.3, bx, 0.2 + h + 0.09, bz, 0, true);
});
const ciudadNueva = [[-33, 8, 4, -14, 4], [-25, 12, 4, -12, 4], [-32, 6, 5, -2, 5], [-20, 9, 3.5, -22, 3.5], [-27, 14, 4, -22, 4], [-33, 9, 4, -20, 4], [-36, 6, 4, -8, 4], [-26, 16, 3.5, -4, 3.5]]
  .map(([x, h, w, z, d], i) => { const b = box(E, `ciudad_nueva_${i + 1}`, M.cabinetWhite, w, h, d, x, 0.2 + h / 2, z); b.visible = false; b.userData.h = h; return b; });
// Fachada con luces para los edificios extra (hijas del edificio: crecen con él
// durante la animación y se ven iluminadas como el resto de la ciudad)
ciudadNueva.forEach((b, i) => {
  const p = b.geometry.parameters, w = p.width, h = p.height, d = p.depth;
  const cols = Math.max(2, Math.floor(w / 1.1)), floors = Math.max(2, Math.floor(h / 1.3));
  for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.6, 0.04), M.screenBlue);
    win.name = `deco_ciudad_nueva_win_${i}_${f}_${c}`;
    win.position.set(-w / 2 + 0.7 + c * ((w - 1.1) / Math.max(cols - 1, 1)), -h / 2 + 1.1 + f * 1.3, d / 2 + 0.02);
    b.add(win);
  }
  const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 0.18, d + 0.3), M.wallMuro);
  roof.name = `deco_ciudad_nueva_roof_${i}`; roof.position.set(0, h / 2 + 0.09, 0); roof.castShadow = true; b.add(roof);
});
// Paisajismo ligero: pocos grupos que enmarcan el sitio (sin saturar el perímetro)
// [x, z, modelo, altura_m, rotY]
const plantings = [
  // Sur — solo flancos del portón (hueco |x|<6)
  [-17.5, 16.2, 'tree4', 3.8, 0.4],
  [-15.8, 15.6, 'bush1', 0.8, 1.0],
  [-14.5, 16.4, 'tree1', 3.1, -0.5],
  [14.2, 16.3, 'tree5', 3.3, 0.6],
  [16.0, 15.7, 'bush1', 0.75, -0.8],
  [17.8, 16.2, 'tree3', 3.0, 0.2],
  // Norte — dos acentos, no una hilera
  [-10.5, -16.8, 'tree4', 4.0, 0.3],
  [-8.8, -17.2, 'bush1', 0.85, 0.9],
  [8.5, -16.9, 'tree2', 3.6, -0.4],
  [10.2, -16.5, 'bush1', 0.7, 1.2],
  // Suroeste — un solo grupo hacia la ciudad
  [-26.5, 14.5, 'tree4', 3.9, 0.7],
  [-24.8, 15.8, 'tree1', 3.2, -0.3],
  [-25.5, 13.2, 'bush1', 0.9, 0.5],
  // Noroeste — un árbol junto a edificios
  [-24.0, -4.5, 'tree5', 3.5, 0.55],
  [-22.8, -3.2, 'bush1', 0.8, -1.0],
  // Este — lejos de las torres (x≈30), un grupo limpio
  [24.5, 8.0, 'tree3', 3.15, -0.6],
  [26.0, 9.5, 'bush1', 0.78, 0.4],
  [25.2, -6.5, 'tree2', 3.5, 0.25],
];
plantings.forEach(([x, z, key, h, ry], i) => {
  const isBush = key.startsWith('bush');
  placePlant(key, isBush ? `deco_arbusto_${i + 1}` : `arbol_${i + 1}`, x, z, h, ry);
});
  Object.assign(ctx, { E, rayo, faroles, ciudadNueva });
}
