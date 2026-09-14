/** Props de principios: chip, sitio DR (equifinalidad). */

export function buildProps(ctx) {
  const {
    THREE, ROOT, SUB, M, mat, box, plantsReady, y0,
  } = ctx;
  const S = SUB.resiliencia;
// Stub de temperatura (sin mesh): otras animaciones llaman pintarTemp sin mostrar UI 3D
const servidorRef = ROOT.getObjectByName('rack_2_4_servidor_4');
const termo = { userData: { pintarTemp: () => {}, ultimo: 20 } };

// ===== Sitio secundario DR (Equifinalidad · Opción C) =====
const DX = 24, DZ = 14;
const sitioDr = new THREE.Group(); sitioDr.name = 'sitio_dr'; sitioDr.visible = false; S.add(sitioDr);
M.drLed = mat('dr_led', 0xb5d9fd, 0.2, 0, { emissive: 0x94bce3, emissiveIntensity: 0 });
M.drBeacon = mat('dr_beacon', 0xeef6ff, 0.2, 0, { emissive: 0xb5d9fd, emissiveIntensity: 0 });
box(sitioDr, 'sitio_dr_placa', M.floorDark, 5.6, 0.1, 4.4, DX, y0 + 0.05, DZ);
box(sitioDr, 'sitio_dr_edificio', M.cabinetWhite, 4.4, 2.4, 3.2, DX, y0 + 1.28, DZ);
box(sitioDr, 'sitio_dr_cubierta', M.deepSteel, 4.8, 0.14, 3.6, DX, y0 + 2.55, DZ);
box(sitioDr, 'sitio_dr_rack_a', M.rack, 0.55, 1.6, 0.7, DX - 0.95, y0 + 0.9, DZ + 0.2);
box(sitioDr, 'sitio_dr_rack_b', M.rack, 0.55, 1.6, 0.7, DX + 0.95, y0 + 0.9, DZ + 0.2);
box(sitioDr, 'sitio_dr_led_a', M.drLed, 0.18, 0.12, 0.03, DX - 0.95, y0 + 1.45, DZ + 0.58);
box(sitioDr, 'sitio_dr_led_b', M.drLed, 0.18, 0.12, 0.03, DX + 0.95, y0 + 1.45, DZ + 0.58);
box(sitioDr, 'sitio_dr_antena', M.steelLight, 0.1, 1.2, 0.1, DX + 1.8, y0 + 3.2, DZ - 1.0);
box(sitioDr, 'sitio_dr_faro', M.drBeacon, 0.35, 0.35, 0.35, DX, y0 + 3.0, DZ);
sitioDr.userData.foco = new THREE.Vector3(DX, y0 + 1.2, DZ);

// ===== Microprocesador + interior del servidor (Jerarquía / Recursividad) =====
const bladeRef = ROOT.getObjectByName('rack_2_6_servidor_3'), rackRef = ROOT.getObjectByName('rack_2_6');
M.chip = mat('chip', 0x2b2b2d, 0.4, 0.3);
M.pines = mat('pines', 0x94bce3, 0.4, 0.4);
M.ram = mat('ram', 0x5980a6, 0.35, 0.15, { emissive: 0x3a5a78, emissiveIntensity: 0.35 });
M.ssd = mat('ssd', 0x3a424b, 0.4, 0.2);
M.die = mat('die', 0x1d2d3d, 0.35, 0.25, { emissive: 0x5980a6, emissiveIntensity: 0.4 });
M.cell = mat('cell', 0xb5d9fd, 0.2, 0, { emissive: 0x94bce3, emissiveIntensity: 1.1 });
{ const p = bladeRef.getWorldPosition(new THREE.Vector3());
  const cx = p.x + 0.08, cy = p.y, cz = p.z + 0.012;
  box(rackRef, 'rack_2_6_servidor_3_chip_base', M.pines, 0.09, 0.09, 0.006, cx, cy, cz);
  box(rackRef, 'rack_2_6_servidor_3_chip', M.chip, 0.06, 0.06, 0.008, cx, cy, cz + 0.006);
  for (let i = 0; i < 5; i++) { box(rackRef, `rack_2_6_servidor_3_chip_aleta_${i + 1}`, M.grey, 0.05, 0.004, 0.012, cx, cy - 0.024 + i * 0.012, cz + 0.016); }
  // Memoria (DIMMs) y almacenamiento junto al procesador
  box(rackRef, 'rack_2_6_servidor_3_ram_1', M.ram, 0.02, 0.11, 0.01, cx - 0.085, cy, cz + 0.01);
  box(rackRef, 'rack_2_6_servidor_3_ram_2', M.ram, 0.02, 0.11, 0.01, cx - 0.11, cy, cz + 0.01);
  box(rackRef, 'rack_2_6_servidor_3_ssd', M.ssd, 0.1, 0.045, 0.012, cx + 0.1, cy - 0.02, cz + 0.01);
  box(rackRef, 'rack_2_6_servidor_3_ssd_led', M.ledGreen, 0.012, 0.01, 0.004, cx + 0.13, cy - 0.01, cz + 0.018);
  // Núcleos / dies del procesador (subsistema dentro del chip)
  for (let i = 0; i < 4; i++) {
    const dx = ((i % 2) - 0.5) * 0.028, dy = (Math.floor(i / 2) - 0.5) * 0.028;
    box(rackRef, `rack_2_6_servidor_3_die_${i + 1}`, M.die, 0.022, 0.022, 0.004, cx + dx, cy + dy, cz + 0.014);
  }
  // Partes dentro de un die (mismo patrón a escala menor)
  const die0x = cx - 0.014, die0y = cy - 0.014, die0z = cz + 0.016;
  for (let i = 0; i < 9; i++) {
    const dx = ((i % 3) - 1) * 0.006, dy = (Math.floor(i / 3) - 1) * 0.006;
    box(rackRef, `rack_2_6_servidor_3_cell_${i + 1}`, M.cell, 0.004, 0.004, 0.002, die0x + dx, die0y + dy, die0z);
  }
}
const chipRef = ROOT.getObjectByName('rack_2_6_servidor_3_chip');
const ramRefs = [1, 2].map(i => ROOT.getObjectByName(`rack_2_6_servidor_3_ram_${i}`));
const ssdRef = ROOT.getObjectByName('rack_2_6_servidor_3_ssd');
const dieRefs = [1, 2, 3, 4].map(i => ROOT.getObjectByName(`rack_2_6_servidor_3_die_${i}`));
const cellRefs = Array.from({ length: 9 }, (_, i) => ROOT.getObjectByName(`rack_2_6_servidor_3_cell_${i + 1}`));
// Dies/células solo se revelan en la animación de recursividad
dieRefs.forEach(o => { if (o) o.visible = false; });
cellRefs.forEach(o => { if (o) o.visible = false; });
['linea_at', 'acometida_electrica_1', 'acometida_electrica_2', 'alimentador_ups', 'alimentador_generador', 'acometida_electrica_redundante', 'acometida_electrica_redundante_2', 'fibra_entrada', 'fibra_salida_datos', 'rack_2_4_servidor_4', 'rack_2_6', 'rack_2_6_servidor_3', 'rack_2_3', 'rack_2_3_gabinete', 'chiller_1', 'chiller_1_ventilador', 'calor_chiller_1', 'crac_1', 'crac_1_rejilla', 'cubierta', 'uma_cubierta', 'noc', 'noc_cubierta', 'noc_pantalla_imagen', 'sensor_fila_2', 'generador', 'generador_humo', 'generador_indicador', 'transformador', 'tanque_agua', 'sala_meet_me', 'ciudad_1', 'estacion_meteo_anemometro', 'porton', 'placa_sitio', 'sitio_dr'].forEach(n => { if (!ROOT.getObjectByName(n)) console.error('Falta objeto', n); });
plantsReady.then(() => {
  ['noc_modelo', 'deco_noc2', 'contenedor_e_waste'].forEach(n => { if (!ROOT.getObjectByName(n)) console.error('Falta objeto', n); });
});
  Object.assign(ctx, { termo, servidorRef, bladeRef, rackRef, chipRef, ramRefs, ssdRef, dieRefs, cellRefs, sitioDr });
}
