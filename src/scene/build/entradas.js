/** ENTRADAS: transformador, acometidas, agua, fibra, meet-me. */

export function buildEntradas(ctx) {
  const {
    SUB, M, box, cyl, decoBox, decoCyl, line,
    y0, HX, HW, RY, UX, UZ, TX, TZ, WX, WZ, MX, MZ, chillerPos, E,
  } = ctx;
// ===== ENTRADAS =====
const I = SUB.entradas;
box(I, 'transformador', M.grey, 1.7, 1.55, 1.25, TX, y0 + 0.78, TZ);
decoBox(I, 'transformador_tapa', M.deepSteel, 1.8, 0.1, 1.35, TX, y0 + 1.6, TZ);
decoBox(I, 'transformador_base', M.concrete, 2.1, 0.18, 1.6, TX, y0 + 0.09, TZ, 0, true);
decoBox(I, 'transformador_aviso', M.sticker, 0.3, 0.35, 0.02, TX - 0.4, y0 + 0.9, TZ + 0.64);
decoBox(I, 'transformador_aceite', M.deepSteel, 0.5, 0.9, 0.5, TX - 1.1, y0 + 0.45, TZ);
for (let i = 0; i < 5; i++) box(I, `transformador_aleta_${i + 1}`, M.deepSteel, 0.05, 1.2, 1.05, TX + 0.88, y0 + 0.78, TZ - 0.45 + i * 0.22);
[-0.35, 0, 0.35].forEach((o, i) => cyl(I, `transformador_aislador_${i + 1}`, M.cabinetWhite, 0.07, 0.42, TX + o, y0 + 1.78, TZ, 12));
box(I, 'poste_acometida', M.deepSteel, 0.18, 6.4, 0.18, TX + 2.6, y0 + 3.2, TZ - 3.6);
line(I, 'acometida_electrica_1', M.ink, [30, 8.6, -6], [TX + 2.6, y0 + 6.4, TZ - 3.6]);
line(I, 'acometida_electrica_2', M.ink, [TX + 2.6, y0 + 6.4, TZ - 3.6], [TX, y0 + 1.95, TZ]);
line(I, 'alimentador_ups', M.ink, [TX - 0.85, y0 + 0.5, TZ], [UX + 2.4, y0 + 0.5, UZ], 0.045);
cyl(I, 'tanque_agua', M.water, 1.35, 2.6, WX, y0 + 1.3, WZ);
cyl(I, 'tanque_agua_tapa', M.cabinetWhite, 1.38, 0.12, WX, y0 + 2.66, WZ);
decoCyl(I, 'tanque_escalera', M.deepSteel, 0.04, 2.6, WX + 1.4, y0 + 1.3, WZ, 8);
for (let i = 0; i < 5; i++) decoBox(I, `tanque_peldano_${i}`, M.deepSteel, 0.3, 0.04, 0.12, WX + 1.4, y0 + 0.4 + i * 0.5, WZ);
decoBox(I, 'tanque_base', M.concrete, 3.2, 0.18, 3.2, WX, y0 + 0.09, WZ, 0, true);
decoCyl(I, 'tanque_nivel', M.screenBlue, 0.06, 1.8, WX + 1.0, y0 + 1.3, WZ + 0.9, 8);
line(I, 'tuberia_agua_1', M.steelLight, [WX, y0 + 0.35, WZ], [HX - HW / 2 - 0.15, y0 + 0.35, WZ], 0.07);
line(I, 'tuberia_agua_2', M.steelLight, [HX - HW / 2 - 0.15, y0 + 0.35, WZ], [HX - HW / 2 - 0.15, RY + 0.25, WZ], 0.07);
line(I, 'tuberia_agua_3', M.steelLight, [HX - HW / 2 - 0.15, RY + 0.25, WZ], [chillerPos[0][0], RY + 0.25, chillerPos[0][2]], 0.07);
box(I, 'sala_meet_me', M.cabinetWhite, 1.8, 1.7, 1.5, MX, y0 + 0.85, MZ);
box(I, 'sala_meet_me_cubierta', M.wallMuro, 2.0, 0.12, 1.7, MX, y0 + 1.76, MZ);
decoBox(I, 'meetme_puerta', M.glassDark, 0.7, 1.4, 0.04, MX - 0.3, y0 + 0.7, MZ + 0.76);
decoBox(I, 'meetme_patch', M.deepSteel, 1.4, 0.9, 0.06, MX, y0 + 0.9, MZ - 0.72);
for (let i = 0; i < 4; i++) decoBox(I, `meetme_led_${i}`, M.ledGreen, 0.08, 0.05, 0.02, MX - 0.45 + i * 0.3, y0 + 1.2, MZ - 0.68);
box(E, 'poste_telecom', M.deepSteel, 0.16, 5.6, 0.16, -30, y0 + 2.8, 10);
line(I, 'fibra_entrada', M.steelLight, [-30, y0 + 5.6, 10], [MX, y0 + 1.8, MZ], 0.03);
  Object.assign(ctx, { I });
}
