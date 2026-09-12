/** PROCESOS: pabellón, racks, CRAC, chillers, UPS. */

export function buildProcesos(ctx) {
  const {
    THREE, SUB, M, box, cyl, decoBox, decoCyl, aspas, placePlant,
    y0, HX, HZ, HW, HD, HH, WT, RY, UX, UZ, chillerPos,
  } = ctx;
// ===== PROCESOS: pabellón de cristal + hall de racks =====
const P = SUB.procesos;
// Muros tabique del edificio (estilo maqueta de la referencia: gris claro, coronación blanca)
const muroH = 1.5;
decoBox(P, 'muro_perim_norte', M.wallMuro, 34, muroH, 0.35, 2.5, y0 + muroH / 2, -10.5, 0, true);
decoBox(P, 'muro_perim_sur', M.wallMuro, 34, muroH, 0.35, 2.5, y0 + muroH / 2, 9.2, 0, true);
decoBox(P, 'muro_perim_este', M.wallMuro, 0.35, muroH, 19.9, 19.5, y0 + muroH / 2, -0.72, 0, true);
decoBox(P, 'muro_perim_oeste', M.wallMuro, 0.35, muroH, 19.9, -14.5, y0 + muroH / 2, -0.72, 0, true);
// particiones interiores que crean las salas de la referencia
decoBox(P, 'tabique_1', M.wallMuro, 0.3, muroH, 9.5, -2.2, y0 + muroH / 2, -5.8, 0, true);
decoBox(P, 'tabique_2', M.wallMuro, 12, muroH, 0.3, 6.5, y0 + muroH / 2, -6.2, 0, true);
decoBox(P, 'tabique_3', M.wallMuro, 0.3, muroH, 15.6, 7.2, y0 + muroH / 2, 1.4, 0, true);
decoBox(P, 'tabique_4', M.wallMuro, 11.5, muroH, 0.3, 1.6, y0 + muroH / 2, 2.8, 0, true);
[[-14.5, -10.5], [19.5, -10.5], [-14.5, 9.2], [19.5, 9.2]].forEach(([x, z], i) =>
  decoBox(P, `pilar_edificio_${i}`, M.cabinetWhite, 0.5, muroH + 0.15, 0.5, x, y0 + (muroH + 0.15) / 2, z, 0, true));
box(P, 'sala_muro_norte', M.glass, HW, HH, WT, HX, y0 + HH / 2, HZ - HD / 2 + WT / 2);
box(P, 'sala_muro_oeste', M.glass, WT, HH, HD, HX - HW / 2 + WT / 2, y0 + HH / 2, HZ);
box(P, 'sala_muro_este', M.glass, WT, HH, HD, HX + HW / 2 - WT / 2, y0 + HH / 2, HZ);
box(P, 'sala_antepecho_sur', M.cabinetWhite, HW, 0.28, WT, HX, y0 + 0.14, HZ + HD / 2 - WT / 2);
box(P, 'sala_marco_norte', M.cabinetWhite, HW + 0.16, 0.1, WT + 0.04, HX, y0 + HH + 0.02, HZ - HD / 2);
box(P, 'sala_marco_oeste', M.cabinetWhite, WT + 0.04, 0.1, HD + 0.16, HX - HW / 2, y0 + HH + 0.02, HZ);
box(P, 'sala_marco_este', M.cabinetWhite, WT + 0.04, 0.1, HD + 0.16, HX + HW / 2, y0 + HH + 0.02, HZ);
box(P, 'piso_tecnico', M.floorDark, HW - 2 * WT, 0.06, HD - 2 * WT, HX, y0 + 0.03, HZ);
box(P, 'cubierta', M.cabinetWhite, HW + 0.7, 0.16, HD + 0.7, HX, RY + 0.08, HZ);
// pretil de cubierta + rejilla perimetral deco
decoBox(P, 'cubierta_petril_n', M.cabinetWhite, HW + 0.7, 0.22, 0.08, HX, RY + 0.25, HZ - HD / 2 - 0.31);
decoBox(P, 'cubierta_petril_s', M.cabinetWhite, HW + 0.7, 0.22, 0.08, HX, RY + 0.25, HZ + HD / 2 + 0.31);
[[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz], i) =>
  box(P, `columna_${i + 1}`, M.paper, 0.22, HH, 0.22, HX + sx * (HW / 2 + 0.12), y0 + HH / 2, HZ + sz * (HD / 2 + 0.12)));
const rackW = 0.58, rackH = 2.05, rackD = 0.95, gap = 0.08, rows = 6, filasIniciales = 2, perRow = 8, rowPitch = 1.52, rackPitch = rackW + gap;
const fy = y0 + 0.12;
const filas = [], zFila = r => HZ - HD / 2 + 1.15 + r * rowPitch;
for (let r = 0; r < rows; r++) {
  const fila = new THREE.Group(); fila.name = `fila_${r + 1}`; P.add(fila); filas.push(fila);
  const z = zFila(r);
  for (let c = 0; c < perRow; c++) {
    const x = HX - ((perRow - 1) * rackPitch) / 2 + c * rackPitch;
    const rack = new THREE.Group(); rack.name = `rack_${r + 1}_${c + 1}`; fila.add(rack);
    box(rack, `${rack.name}_gabinete`, M.rack, rackW, rackH, rackD, x, fy + rackH / 2, z);
    for (let s = 0; s < 6; s++) {
      box(rack, `${rack.name}_servidor_${s + 1}`, M.ink, rackW - 0.1, 0.2, 0.02, x, fy + 0.32 + s * 0.28, z + rackD / 2 + 0.011);
      box(rack, `${rack.name}_servidor_${s + 1}_led`, M.led, 0.04, 0.03, 0.01, x + 0.16, fy + 0.32 + s * 0.28, z + rackD / 2 + 0.024);
      box(rack, `${rack.name}_servidor_${s + 1}_led2`, M.led, 0.025, 0.025, 0.01, x + 0.1, fy + 0.32 + s * 0.28, z + rackD / 2 + 0.024);
    }
    // puerta frontal con textura de leds (ilustración) + zócalo + tirador
    decoBox(rack, `rack_${r + 1}_${c + 1}_puerta`, M.rackFront, rackW - 0.06, rackH - 0.12, 0.025, x, fy + rackH / 2, z + rackD / 2 + 0.012);
    decoBox(rack, `rack_${r + 1}_${c + 1}_zocalo`, M.deepSteel, rackW, 0.08, rackD, x, fy + 0.04, z);
    decoBox(rack, `rack_${r + 1}_${c + 1}_techo`, M.deepSteel, rackW, 0.05, rackD, x, fy + rackH + 0.025, z);
  }
  box(fila, `bandeja_cables_${r + 1}`, M.steelLight, perRow * rackPitch + 0.3, 0.06, 0.22, HX, fy + rackH + 0.45, z);
  // cables de colores sobre la bandeja (rojo/azul como la referencia)
  decoBox(fila, `bandeja_cable_rojo_${r + 1}`, M.pipeRed, perRow * rackPitch + 0.2, 0.035, 0.07, HX, fy + rackH + 0.5, z - 0.05);
  decoBox(fila, `bandeja_cable_azul_${r + 1}`, M.pipeBlue, perRow * rackPitch + 0.2, 0.035, 0.07, HX, fy + rackH + 0.5, z + 0.06);
  // contención pasillo frío: pórticos blancos sobre filas pares (como la imagen)
  if (r % 2 === 0) {
    for (let c = 0; c <= perRow; c += 2) {
      const x = HX - ((perRow - 1) * rackPitch) / 2 + (c - 0.5) * rackPitch;
      decoBox(fila, `contencion_poste_${r}_${c}`, M.cabinetWhite, 0.07, 0.7, 0.07, x, fy + rackH + 0.85, z);
    }
    decoBox(fila, `contencion_techo_${r}`, M.glass, perRow * rackPitch + 0.3, 0.04, 1.1, HX, fy + rackH + 1.2, z);
  }
  fila.visible = r < filasIniciales;
}
for (let i = 0; i < 3; i++) {
  const x = HX - 4.4 + i * 4.4;
  box(P, `crac_${i + 1}`, M.cabinetWhite, 1.45, 2.05, 0.7, x, fy + 1.02, HZ - HD / 2 + WT + 0.42);
  box(P, `crac_${i + 1}_rejilla`, M.grille, 1.15, 0.9, 0.03, x, fy + 1.35, HZ - HD / 2 + WT + 0.78);
  decoBox(P, `crac_panel_${i}`, M.deepSteel, 1.15, 0.5, 0.03, x, fy + 0.45, HZ - HD / 2 + WT + 0.78);
  decoBox(P, `crac_led_${i}`, M.ledGreen, 0.12, 0.06, 0.02, x + 0.4, fy + 1.85, HZ - HD / 2 + WT + 0.78);
  decoBox(P, `crac_tubo_${i}`, M.pipeBlue, 0.09, 1.9, 0.09, x - 0.85, fy + 0.95, HZ - HD / 2 + WT + 0.4);
}
chillerPos.forEach(([x, y, z], i) => {
  const ch = box(P, `chiller_${i + 1}`, M.cabinetWhite, 1.85, 0.52, 1.15, x, y, z);
  const fan = cyl(P, `chiller_${i + 1}_ventilador`, M.fan, 0.4, 0.05, x, y + 0.3, z);
  aspas(fan, `chiller_${i + 1}`);
  decoCyl(P, `chiller_aro_${i}`, M.deepSteel, 0.46, 0.07, x, y + 0.3, z, 24);
  decoBox(P, `chiller_rejilla_lat_${i}`, M.grille, 1.7, 0.3, 0.03, x, y, z + 0.59);
  decoBox(P, `chiller_rejilla_lat2_${i}`, M.grille, 1.7, 0.3, 0.03, x, y, z - 0.59);
  decoBox(P, `chiller_base_${i}`, M.deepSteel, 2.0, 0.08, 1.3, x, y - 0.3, z);
  decoBox(P, `chiller_tubo_${i}`, M.pipeBlue, 0.07, 0.07, 1.6, x + 0.6, y - 0.1, z + 0.8);
});
box(P, 'uma_cubierta', M.cabinetWhite, 3.4, 0.7, 1.5, HX + 2.4, RY + 0.48, HZ + 3.65);
{ const u1 = cyl(P, 'uma_ventilador_1', M.fan, 0.32, 0.04, HX + 1.7, RY + 0.86, HZ + 3.65); aspas(u1, 'uma_1', 0.26);
  const u2 = cyl(P, 'uma_ventilador_2', M.fan, 0.32, 0.04, HX + 3.1, RY + 0.86, HZ + 3.65); aspas(u2, 'uma_2', 0.26);
  decoBox(P, 'uma_rejilla', M.grille, 3.2, 0.3, 0.04, HX + 2.4, RY + 0.45, HZ + 4.42);
  decoCyl(P, 'uma_aro_1', M.deepSteel, 0.37, 0.06, HX + 1.7, RY + 0.86, HZ + 3.65, 20);
  decoCyl(P, 'uma_aro_2', M.deepSteel, 0.37, 0.06, HX + 3.1, RY + 0.86, HZ + 3.65, 20); }
box(P, 'sala_ups', M.floorDark, 5.6, 0.1, 5.6, UX, y0 + 0.05, UZ);
box(P, 'sala_ups_cubierta', M.cabinetWhite, 0.2, 0.04, 0.2, UX, y0 + 1.72, UZ);
// Bancos de baterías como gabinetes blancos UPS de la referencia (con display + sticker)
[[-1.35, -1.35], [1.35, -1.35], [-1.35, 1.35], [1.35, 1.35]].forEach(([dx, dz], i) => {
  box(P, `banco_baterias_${i + 1}`, M.cabinetWhite, 1.55, 1.55, 1.55, UX + dx, y0 + 0.85, UZ + dz);
  decoBox(P, `ups_puerta_${i}`, M.wallMuro, 0.04, 1.3, 0.02, UX + dx - 0.3, y0 + 0.85, UZ + dz + 0.79);
  decoBox(P, `ups_puerta2_${i}`, M.wallMuro, 0.04, 1.3, 0.02, UX + dx + 0.3, y0 + 0.85, UZ + dz + 0.79);
  decoBox(P, `ups_display_${i}`, M.glassDark, 0.34, 0.22, 0.03, UX + dx, y0 + 1.25, UZ + dz + 0.79);
  decoBox(P, `ups_display_luz_${i}`, M.screenBlue, 0.26, 0.14, 0.012, UX + dx, y0 + 1.25, UZ + dz + 0.81);
  decoBox(P, `ups_sticker_${i}`, M.sticker, 0.16, 0.2, 0.012, UX + dx, y0 + 0.7, UZ + dz + 0.79);
  decoBox(P, `ups_zocalo_${i}`, M.deepSteel, 1.6, 0.1, 1.6, UX + dx, y0 + 0.12, UZ + dz);
});
// Fila extra de UPS blancos al estilo de la imagen (deco, 2 unidades más)
[[UX - 1.35, UZ + 3.4], [UX + 1.35, UZ + 3.4]].forEach(([x, z], i) => {
  decoBox(P, `ups_extra_${i}`, M.cabinetWhite, 1.55, 1.55, 1.55, x, y0 + 0.85, z, 0, true);
  decoBox(P, `ups_extra_display_${i}`, M.screenBlue, 0.26, 0.14, 0.02, x, y0 + 1.25, z + 0.79);
  decoBox(P, `ups_extra_sticker_${i}`, M.sticker, 0.16, 0.2, 0.012, x, y0 + 0.7, z + 0.79);
});
// Baterías rojas + PDU azules (como la referencia, sala eléctrica)
for (let i = 0; i < 3; i++) {
  const x = 3.2 + i * 1.9;
  decoBox(P, `ups_rojo_bastidor_${i}`, M.pdu, 1.2, 1.9, 0.9, x, y0 + 0.95, -8.6, 0, true);
  for (let s = 0; s < 4; s++) decoBox(P, `ups_rojo_bat_${i}_${s}`, M.grey, 1.0, 0.28, 0.7, x, y0 + 0.35 + s * 0.42, -8.6);
  decoBox(P, `pdu_azul_${i}`, M.pduBlue, 0.6, 1.9, 0.9, x + 0.95, y0 + 0.95, -8.6, 0, true);
  decoBox(P, `pdu_azul_led_${i}`, M.ledGreen, 0.1, 0.08, 0.02, x + 0.95, y0 + 1.5, -8.14);
}
// Sala TI blanca adicional (contención blanca izquierda, como la referencia)
for (let c = 0; c < 5; c++) {
  const x = -12.6 + c * 0.72, z = 2.6;
  decoBox(P, `sala_blanca_rack_${c}`, M.cabinetWhite, 0.6, 2.0, 0.9, x, fy + 1.0, z, 0, true);
  decoBox(P, `sala_blanca_frente_${c}`, M.rackWhiteFront, 0.5, 1.8, 0.03, x, fy + 1.0, z + 0.46);
}
decoBox(P, 'sala_blanca_techo', M.glass, 4.2, 0.05, 1.3, -11.2, fy + 2.15, 2.6);
for (let c = 0; c < 3; c++) decoBox(P, `sala_blanca_pilar_${c}`, M.cabinetWhite, 0.08, 0.6, 0.08, -13 + c * 1.8, fy + 1.9, 2.0);
// Tuberías roja/azul vistas sobre racks (como la imagen)
decoCyl(P, 'tubo_rojo_sala', M.pipeRed, 0.05, 12, HX - 1, fy + 2.6, HZ + 1.2, 10, [0, 0, Math.PI / 2]);
decoCyl(P, 'tubo_azul_sala', M.pipeBlue, 0.05, 12, HX - 1, fy + 2.45, HZ + 1.35, 10, [0, 0, Math.PI / 2]);
// Gabinetes eléctricos + extintores junto a salas (como la referencia)
[[-13.8, -0.5], [-1.2, 3.4]].forEach(([x, z], i) => {
  decoBox(P, `tablero_electrico_${i}`, M.cabinetWhite, 0.7, 1.5, 0.4, x, y0 + 0.75, z, 0, true);
  decoBox(P, `tablero_sticker_${i}`, M.sticker, 0.14, 0.18, 0.02, x, y0 + 1.0, z + 0.21);
});
[[-13.1, -0.5], [-0.5, 3.4]].forEach(([x, z], i) => {
  placePlant('extinguisher', `deco_extintor_${i * 2 + 1}`, x, z, 0.72, Math.PI, P, y0);
  placePlant('extinguisher', `deco_extintor_${i * 2 + 2}`, x + 0.28, z, 0.72, Math.PI, P, y0);
});
  Object.assign(ctx, {
    P, filas, filasIniciales, rows, perRow, rackH, rackPitch, fy, zFila, rackW, rackD, gap,
  });
}
