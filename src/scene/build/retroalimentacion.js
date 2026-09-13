/** RETROALIMENTACIÓN: NOC, sensores, meteo. */
import { plantaMaceta } from '../buildGenerator.js';

export function buildRetroalimentacion(ctx) {
  const {
    THREE, SUB, M, box, cyl, decoBox, decoCyl, line, placePlant, plantsReady,
    y0, HX, HZ, HW, HD, RY, NX, NZ,
    filas, filasIniciales, rows, perRow, rackH, rackPitch, fy, zFila,
  } = ctx;
  const planta = (parent, tag, x, y, z) => plantaMaceta(parent, tag, x, y, z, { M, decoBox, decoCyl });
// ===== RETROALIMENTACIÓN =====
const R = SUB.retroalimentacion;
// Sala NOC: panel de fondo, zócalo, alfombra y luz ambiente
decoBox(R, 'noc_panel_fondo', M.wallAccent, 7.2, 1.55, 0.08, NX + 1.7, y0 + 0.85, NZ - 1.05);
decoBox(R, 'noc_zocalo', M.deepSteel, 7.2, 0.12, 0.1, NX + 1.7, y0 + 0.06, NZ - 1.05);
decoBox(R, 'noc_friso', M.cabinetWhite, 7.2, 0.08, 0.1, NX + 1.7, y0 + 1.6, NZ - 1.05);
decoBox(R, 'noc_alfombra', M.carpetNoc, 7.0, 0.025, 3.6, NX + 1.7, y0 + 0.02, NZ + 0.35);
// luminarias colgantes
const lucesNoc = [];
{
  // Una sola PointLight cálida en el centro del NOC (meshes siguen con emisión).
  const pl = new THREE.PointLight(0xffc888, 0, 6.5, 2);
  pl.position.set(NX + 1.7, y0 + 1.75, NZ);
  pl.name = 'deco_noc_punto_0';
  R.add(pl);
  lucesNoc.push(pl);
}
[[NX - 0.2, NZ + 0.2], [NX + 1.7, NZ], [NX + 3.6, NZ - 0.2]].forEach(([lx, lz], i) => {
  decoCyl(R, `noc_luz_cable_${i}`, M.deepSteel, 0.012, 0.35, lx, y0 + 2.05, lz, 6);
  decoCyl(R, `noc_luz_${i}`, M.lampWarm, 0.16, 0.06, lx, y0 + 1.85, lz, 12);
});
// Escritorios NOC (models/desk.glb) — ancla inmediata para animaciones/picking por nombre
const nocRoot = new THREE.Group(); nocRoot.name = 'noc'; R.add(nocRoot);
placePlant('desk', 'noc_modelo', NX, NZ, 1.65, Math.PI, nocRoot, y0);
placePlant('desk', 'deco_noc2', NX + 3.5, NZ - 0.35, 1.55, Math.PI, R, y0);
plantsReady.then(() => {
  if (!nocRoot.children.length) console.error('Falta escritorio NOC');
});
// Proxies con nombre fijo que usan las animaciones / validación
box(R, 'noc_cubierta', M.deepSteel, 0.01, 0.01, 0.01, NX, y0 + 1.6, NZ);
box(R, 'noc_pantalla_imagen', M.screenBlue, 0.55, 0.34, 0.02, NX - 0.15, y0 + 1.15, NZ - 0.55);
// ambientación: plantas, pósters de estado, rack de networking lateral
planta(R, 'noc_planta_1', NX - 1.4, y0, NZ + 1.3);
planta(R, 'noc_planta_2', NX + 5.0, y0, NZ + 0.9);
decoBox(R, 'noc_poster_1', M.screenBlue, 0.55, 0.4, 0.02, NX + 1.6, y0 + 1.15, NZ - 1.0);
decoBox(R, 'noc_poster_2', M.screenMint, 0.45, 0.55, 0.02, NX + 2.3, y0 + 1.1, NZ - 1.0);
decoBox(R, 'noc_poster_marco_1', M.cabinetWhite, 0.6, 0.05, 0.03, NX + 1.6, y0 + 1.37, NZ - 1.0);
decoBox(R, 'noc_poster_marco_2', M.cabinetWhite, 0.5, 0.05, 0.03, NX + 2.3, y0 + 1.4, NZ - 1.0);
decoBox(R, 'noc_side_rack', M.rack, 0.45, 1.1, 0.55, NX + 5.4, y0 + 0.58, NZ - 0.6);
decoBox(R, 'noc_side_front', M.rackFront, 0.4, 1.0, 0.03, NX + 5.4, y0 + 0.58, NZ - 0.32);
decoBox(R, 'noc_papelera', M.deepSteel, 0.22, 0.32, 0.22, NX - 1.2, y0 + 0.16, NZ + 0.9);
decoCyl(R, 'noc_papelera_aro', M.steelLight, 0.12, 0.03, NX - 1.2, y0 + 0.33, NZ + 0.9, 12);
for (let r = 0; r < rows; r++) {
  const s = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 12), M.led);
  s.name = `sensor_fila_${r + 1}`; s.position.set(HX + (perRow * rackPitch) / 2 + 0.42, fy + rackH + 0.22, zFila(r)); R.add(s); s.visible = r < filasIniciales; filas[r].userData.sensor = s;
}
line(R, 'bus_monitoreo', M.steelLight, [HX + (perRow * rackPitch) / 2 + 0.42, fy + rackH + 0.22, zFila(0)], [HX + (perRow * rackPitch) / 2 + 0.42, fy + rackH + 0.22, zFila(rows - 1)], 0.02);
line(R, 'bus_monitoreo_noc', M.steelLight, [HX + (perRow * rackPitch) / 2 + 0.42, fy + rackH + 0.22, zFila(rows - 1)], [NX, y0 + 1.55, NZ], 0.02);
box(R, 'estacion_meteo_mastil', M.cabinetWhite, 0.07, 2.4, 0.07, HX + HW / 2 - 0.6, RY + 1.3, HZ + HD / 2 - 0.6);
{ const an = cyl(R, 'estacion_meteo_anemometro', M.steelLight, 0.28, 0.045, HX + HW / 2 - 0.6, RY + 2.55, HZ + HD / 2 - 0.6, 16);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const cup = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), M.cabinetWhite);
    cup.name = `deco_anemo_copa_${i}`; cup.position.set(Math.cos(a) * 0.28, 0, Math.sin(a) * 0.28); an.add(cup);
  }
  decoBox(R, 'meteo_panel', M.screenBlue, 0.3, 0.2, 0.04, HX + HW / 2 - 0.6, RY + 1.7, HZ + HD / 2 - 0.55);
  decoCyl(R, 'meteo_veleta', M.deepSteel, 0.02, 0.7, HX + HW / 2 - 0.6, RY + 2.3, HZ + HD / 2 - 0.6, 8, [0, 0, Math.PI / 2]); }
  Object.assign(ctx, { R, lucesNoc, nocRoot });
}
