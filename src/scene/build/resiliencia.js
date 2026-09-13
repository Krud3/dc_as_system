/** RESILIENCIA: generadores, humo, luminarias, point lights. */
import { buildGenerator } from '../buildGenerator.js';

export function buildResiliencia(ctx) {
  const {
    THREE, SUB, M, mat, box, cyl, decoBox, decoCyl, line, placePlant,
    y0, HX, HZ, UX, UZ, TX, TZ, GX, GZ, fy, F, P,
  } = ctx;
  const genCtx = { THREE, M, box, cyl, decoBox, decoCyl };
  const makeGen = (parent, opts) => buildGenerator(parent, opts, genCtx);
// ===== RESILIENCIA =====
const S = SUB.resiliencia;
// Bancada de concreto para generadores
decoBox(S, 'gen_bancada', M.concrete, 4.6, 0.18, 7.8, GX + 0.2, y0 + 0.09, GZ + 2.15, 0, true);
// Tres generadores diésel (estilo industrial beige / ventilador axial / cabina blanca)
makeGen(S, {
  bodyName: 'generador', fanName: 'generador_ventilador', tag: 'gen',
  x: GX, y: y0 + 0.18, z: GZ, intakes: 3, named: true, withControls: true,
});
makeGen(S, {
  bodyName: 'generador_reserva', fanName: 'generador_reserva_ventilador', tag: 'genres',
  x: GX, y: y0 + 0.18, z: GZ + 2.15, intakes: 4, named: true, withControls: true,
});
makeGen(S, {
  bodyName: 'generador_3', fanName: 'generador_3_ventilador', tag: 'gen3',
  x: GX, y: y0 + 0.18, z: GZ + 4.3, intakes: 3, named: false, withControls: true,
});
// Escape + humo del generador principal (sobre el bloque motor)
cyl(S, 'generador_escape', M.deepSteel, 0.09, 0.7, GX - 0.55, y0 + 1.55, GZ - 0.28, 12);
decoCyl(S, 'gen_escape_codo', M.deepSteel, 0.09, 0.32, GX - 0.35, y0 + 1.88, GZ - 0.28, 10, [0, 0, Math.PI / 2.4]);
M.humo = mat('humo', 0x98989b, 1, 0, { transparent: true, opacity: 0, depthWrite: false });
const humo = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.1, 1.6, 22, 1, true), M.humo);
humo.name = 'generador_humo'; humo.position.set(GX - 0.55, y0 + 2.55, GZ - 0.28); humo.visible = false; S.add(humo);
M.genLed = mat('gen_led', 0x1d1f20, 0.5, 0, { emissive: 0x000000, emissiveIntensity: 1 });
box(S, 'generador_indicador', M.genLed, 0.12, 0.12, 0.02, GX + 1.54, y0 + 1.35, GZ);
cyl(S, 'tanque_combustible', M.cabinetWhite, 0.55, 2.6, GX + 2.55, y0 + 0.52, GZ + 0.85, 36, [Math.PI / 2, 0, 0]);
[-0.9, 0.9].forEach((o, i) => box(S, `tanque_combustible_apoyo_${i + 1}`, M.deepSteel, 0.22, 0.28, 1.15, GX + 2.55, y0 + 0.14, GZ + 0.85 + o));
decoCyl(S, 'tanque_nivel_tubo', M.pipeRed, 0.05, 1.8, GX + 2.55, y0 + 0.5, GZ - 0.3, 8, [Math.PI / 2, 0, 0]);
decoBox(S, 'tanque_etiqueta', M.sticker, 0.4, 0.3, 0.02, GX + 2.55, y0 + 0.6, GZ + 1.42);
line(S, 'alimentador_generador', M.ink, [GX - 1.2, y0 + 0.42, GZ], [UX + 2.4, y0 + 0.42, UZ + 0.8], 0.045);
box(S, 'poste_acometida_2', M.deepSteel, 0.18, 6.4, 0.18, TX + 2.6, y0 + 3.2, TZ + 10.5);
line(S, 'acometida_electrica_redundante', M.ink, [30, 8.6, 1.5], [TX + 2.6, y0 + 6.4, TZ + 10.5]);
line(S, 'acometida_electrica_redundante_2', M.ink, [TX + 2.6, y0 + 6.4, TZ + 10.5], [TX, y0 + 1.95, TZ + 0.5]);
[[HX + 5.4, HZ + 0.2], [HX + 5.4, HZ + 1.1]].forEach(([x, z], i) => {
  placePlant('extinguisher', `deco_cilindro_extincion_${i + 1}`, x, z, 1.2, -Math.PI / 2, S, fy);
  decoBox(S, `ext_cartel_${i}`, M.fire, 0.3, 0.4, 0.03, x, fy + 1.7, z - 0.4);
  decoBox(S, `ext_cartel_txt_${i}`, M.paper, 0.24, 0.1, 0.012, x, fy + 1.7, z - 0.38);
});

M.lampara = mat('lampara', 0xf0e8f8, 0.32, 0, { emissive: 0xb497cf, emissiveIntensity: 1.7 });
const lamparas = [];
[[-17, -11], [-17, 11], [17, -11], [17, 11], [0, 11.6]].forEach(([x, z], i) => {
  box(F, `luminaria_${i + 1}_poste`, M.deepSteel, 0.12, 4.4, 0.12, x, y0 + 2.2, z);
  box(F, `luminaria_${i + 1}_lampara`, M.lampara, 0.56, 0.12, 0.3, x, y0 + 4.42, z);
  decoBox(F, `luminaria_cap_${i}`, M.deepSteel, 0.64, 0.07, 0.36, x, y0 + 4.52, z);
  decoBox(F, `luminaria_base_${i}`, M.concrete, 0.5, 0.18, 0.5, x, y0 + 0.09, z, 0, true);
  const pl = new THREE.PointLight(0xb497cf, 0, 14, 1.6); pl.position.set(x, y0 + 4.2, z); pl.name = `luminaria_${i + 1}_luz`; F.add(pl); lamparas.push(pl);
});
const luzSala = new THREE.PointLight(0xb8a8d4, 0, 22, 1.4); luzSala.position.set(HX, y0 + 3.1, HZ); luzSala.name = 'luz_sala'; P.add(luzSala);
const luzGen = new THREE.PointLight(0xb497cf, 0, 8, 1.6); luzGen.position.set(GX, y0 + 1.8, GZ); luzGen.name = 'luz_generador'; S.add(luzGen);
  Object.assign(ctx, { S, humo, lamparas, luzSala, luzGen });
}
