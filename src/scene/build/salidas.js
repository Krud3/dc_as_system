/** SALIDAS: calor, e-waste, drenaje. */

export function buildSalidas(ctx) {
  const {
    THREE, SUB, M, box, decoBox, line, placePlant,
    y0, HX, HZ, HW, MX, MZ, WX, chillerPos,
  } = ctx;
// ===== SALIDAS =====
const O = SUB.salidas;
for (let i = 0; i < 4; i++) {
  const [x, y, z] = chillerPos[i];
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.42, 1.8, 16, 1, true), M.heat);
  p.name = `calor_chiller_${i + 1}`; p.position.set(x, y + 1.35, z); p.userData.baseY = y + 1.35; O.add(p);
}
line(O, 'fibra_salida_datos', M.steelLight, [MX, y0 + 1.7, MZ + 0.35], [-26, 7, -16], 0.03);
placePlant('dumpster', 'contenedor_e_waste', 6.5, 10.6, 1.35, 0, O, y0);
for (let i = 0; i < 3; i++) box(O, `rack_retirado_${i + 1}`, M.grey, 0.5, 0.32, 0.85, 8.4 + i * 0.62, y0 + 0.16, 10.6);
decoBox(O, 'ewaste_pallet', M.deskTop, 2.4, 0.1, 1.1, 9.0, y0 + 0.05, 10.6);
line(O, 'drenaje_agua', M.grey, [HX - HW / 2 - 0.15, y0 + 0.18, HZ + 2], [WX, y0 + 0.18, HZ + 2], 0.05);
  Object.assign(ctx, { O });
}
