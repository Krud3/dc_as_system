/** Generador diésel y maceta decorativa. */

/** Generador diésel estilo referencia: skid negro, cuerpo beige, ventilador axial, cabina blanca y panel. */
export function buildGenerator(parent, {
  bodyName, fanName, tag, x, y, z, intakes = 3, named = true, withControls = true,
}, { THREE, M, box, cyl, decoBox, decoCyl }) {
  const addB = named ? box : decoBox;
  const addC = named ? cyl : decoCyl;
  const yBase = y + 0.06;
  // Skid / base negra
  decoBox(parent, `${tag}_skid`, M.genSkid, 3.15, 0.1, 1.22, x, yBase, z, 0, true);
  decoBox(parent, `${tag}_skid_labio`, M.ink, 3.18, 0.03, 1.26, x, yBase - 0.04, z);
  // Bloque motor central (beige) — cuerpo principal con nombre fijo
  const bodyH = 0.72, bodyY = yBase + 0.05 + bodyH / 2;
  addB(parent, bodyName, M.genTan, 1.6, bodyH, 1.0, x - 0.12, bodyY, z, 0, true);
  // Aletas verticales gruesas (lado inferior del motor) + horizontales en el flanco
  for (let i = 0; i < 7; i++) {
    decoBox(parent, `${tag}_aleta_v_${i}`, M.genTanDark, 0.08, 0.42, 0.06, x - 0.7 + i * 0.2, yBase + 0.32, z + 0.5);
    decoBox(parent, `${tag}_aleta_vb_${i}`, M.genTanDark, 0.08, 0.42, 0.06, x - 0.7 + i * 0.2, yBase + 0.32, z - 0.5);
  }
  for (let i = 0; i < 5; i++) {
    decoBox(parent, `${tag}_aleta_h_${i}`, M.genTanDeep, 1.4, 0.04, 0.035, x - 0.15, yBase + 0.55 + i * 0.08, z + 0.515);
  }
  // Bloque superior del motor + tomas de aire (bocas hacia el ventilador)
  decoBox(parent, `${tag}_tapa`, M.genTan, 1.4, 0.26, 0.82, x - 0.15, yBase + 0.96, z, 0, true);
  for (let k = 0; k < intakes; k++) {
    const ix = x - 0.65 + k * (1.05 / Math.max(intakes - 1, 1));
    decoCyl(parent, `${tag}_intake_${k}`, M.genIntake, 0.115, 0.36, ix, yBase + 1.2, z, 14, [0, 0, Math.PI / 2]);
    decoCyl(parent, `${tag}_intake_boca_${k}`, M.genTanDeep, 0.09, 0.06, ix - 0.17, yBase + 1.2, z, 14, [0, 0, Math.PI / 2]);
    decoCyl(parent, `${tag}_intake_hueco_${k}`, M.ink, 0.058, 0.04, ix - 0.2, yBase + 1.2, z, 12, [0, 0, Math.PI / 2]);
  }
  // Puente entre motor y carcasa alta
  decoBox(parent, `${tag}_puente`, M.genTan, 0.35, 0.62, 0.92, x + 0.72, yBase + 0.42, z);
  // Carcasa trasera alta (lado panel / alternador)
  const cabX = x + 1.12, cabH = 1.32, cabY = yBase + 0.05 + cabH / 2;
  decoBox(parent, `${tag}_cabina`, M.genTan, 0.92, cabH, 1.02, cabX, cabY, z, 0, true);
  // Panel de acceso lateral atornillado
  decoBox(parent, `${tag}_tapa_lat`, M.genTanDark, 0.02, 0.58, 0.64, cabX, cabY - 0.08, z + 0.52);
  [[-0.25, 0.22], [0.25, 0.22], [-0.25, -0.22], [0.25, -0.22]].forEach(([dz, dy], i) => {
    decoCyl(parent, `${tag}_tornillo_${i}`, M.genMetal, 0.025, 0.03, cabX + 0.02, cabY - 0.08 + dy, z + 0.52 + dz, 8, [0, 0, Math.PI / 2]);
  });
  // Gabinete eléctrico blanco con triángulo de peligro
  decoBox(parent, `${tag}_elec`, M.cabinetWhite, 0.26, 1.12, 0.48, cabX + 0.05, yBase + 0.62, z - 0.72, 0, true);
  decoBox(parent, `${tag}_elec_manija`, M.ink, 0.035, 0.1, 0.055, cabX + 0.05, yBase + 0.58, z - 0.97);
  decoBox(parent, `${tag}_hazard`, M.genHazard, 0.2, 0.2, 0.015, cabX + 0.05, yBase + 0.95, z - 0.975);
  // Panel de control (cara +X)
  if (withControls) {
    decoBox(parent, `${tag}_panel_fondo`, M.ink, 0.04, 0.48, 0.58, cabX + 0.47, yBase + 0.88, z);
    decoBox(parent, `${tag}_panel`, M.genPanel, 0.015, 0.4, 0.52, cabX + 0.495, yBase + 0.88, z);
    decoBox(parent, `${tag}_lcd`, M.genScreen, 0.012, 0.1, 0.18, cabX + 0.51, yBase + 0.98, z - 0.08);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      decoCyl(parent, `${tag}_btn_g_${r}_${c}`, M.genBtnGreen, 0.02, 0.018, cabX + 0.51, yBase + 1.05 - r * 0.065, z + 0.12 + c * 0.065, 10, [0, 0, Math.PI / 2]);
    }
    decoCyl(parent, `${tag}_estop`, M.fire, 0.055, 0.045, cabX + 0.515, yBase + 0.72, z - 0.14, 14, [0, 0, Math.PI / 2]);
    decoCyl(parent, `${tag}_btn_1`, M.genBtnGrey, 0.03, 0.022, cabX + 0.515, yBase + 0.72, z + 0.02, 10, [0, 0, Math.PI / 2]);
    decoCyl(parent, `${tag}_btn_2`, M.fire, 0.022, 0.02, cabX + 0.515, yBase + 0.72, z + 0.14, 10, [0, 0, Math.PI / 2]);
  }
  // Conjunto ventilador axial (cara −X): placa con orificio circular + aspas pétalo
  const fx = x - 1.48, fy = yBase + 0.58;
  const plate = 1.18, holeR = 0.5, half = plate / 2, rim = half - holeR;
  // Marco cuadrado alrededor del orificio (no placa sólida que tape las aspas)
  decoBox(parent, `${tag}_fan_marco_sup`, M.genFanPlate, 0.08, rim, plate, fx, fy + holeR + rim / 2, z);
  decoBox(parent, `${tag}_fan_marco_inf`, M.genFanPlate, 0.08, rim, plate, fx, fy - holeR - rim / 2, z);
  decoBox(parent, `${tag}_fan_marco_izq`, M.genFanPlate, 0.08, holeR * 2, rim, fx, fy, z - holeR - rim / 2);
  decoBox(parent, `${tag}_fan_marco_der`, M.genFanPlate, 0.08, holeR * 2, rim, fx, fy, z + holeR + rim / 2);
  [[-0.48, -0.48], [0.48, -0.48], [-0.48, 0.48], [0.48, 0.48]].forEach(([dz, dy], i) => {
    decoCyl(parent, `${tag}_fan_perno_${i}`, M.genMetal, 0.035, 0.05, fx - 0.03, fy + dy, z + dz, 8, [0, 0, Math.PI / 2]);
    decoCyl(parent, `${tag}_fan_agujero_${i}`, M.ink, 0.02, 0.035, fx - 0.055, fy + dy, z + dz, 8, [0, 0, Math.PI / 2]);
  });
  // Fondo del orificio + labio circular
  decoCyl(parent, `${tag}_fan_fondo`, M.ink, holeR - 0.02, 0.03, fx + 0.04, fy, z, 20, [0, 0, Math.PI / 2]);
  {
    const aro = new THREE.Mesh(new THREE.TorusGeometry(holeR, 0.028, 6, 24), M.genMetal);
    aro.name = `deco_${tag}_fan_aro`; aro.position.set(fx - 0.01, fy, z);
    aro.rotation.y = Math.PI / 2; parent.add(aro);
  }
  // Aspa estilo referencia: pétalo alargado, más estrecho, con pitch
  if (!buildGenerator._bladeGeo) {
    const sh = new THREE.Shape();
    // base cerca del hub → punta afilada (como aspa axial industrial)
    sh.moveTo(0.01, 0.12);
    sh.lineTo(0.045, 0.14);
    sh.quadraticCurveTo(0.055, 0.26, 0.04, 0.38);
    sh.quadraticCurveTo(0.025, 0.46, 0.0, 0.485);
    sh.quadraticCurveTo(-0.02, 0.46, -0.035, 0.38);
    sh.quadraticCurveTo(-0.05, 0.26, -0.04, 0.14);
    sh.lineTo(-0.01, 0.12);
    sh.closePath();
    buildGenerator._bladeGeo = new THREE.ExtrudeGeometry(sh, { depth: 0.028, bevelEnabled: false });
    buildGenerator._bladeGeo.translate(0, 0, -0.014);
    buildGenerator._bladeGeo.rotateY(Math.PI / 2);
  }
  // Spinner: eje local X = eje del ventilador
  const spinner = new THREE.Group();
  spinner.position.set(fx - 0.05, fy, z);
  parent.add(spinner);
  const hubMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.07, 12), M.fan);
  hubMesh.name = named ? fanName : `deco_${fanName}`;
  hubMesh.rotation.z = Math.PI / 2;
  spinner.add(hubMesh);
  for (let i = 0; i < 8; i++) {
    const piv = new THREE.Group();
    piv.rotation.x = (i / 8) * Math.PI * 2;
    spinner.add(piv);
    const blade = new THREE.Mesh(buildGenerator._bladeGeo, M.genBlade);
    blade.name = `deco_${tag}_aspa_${i}`;
    blade.rotation.y = 0.55; // pitch visible (giro sobre eje radial Y: no saca la punta del plano)
    blade.rotation.z = 0;
    piv.add(blade);
  }
  const hubRing = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.018, 6, 16), M.genMetal);
  hubRing.name = `deco_${tag}_hubring`; hubRing.rotation.y = Math.PI / 2; spinner.add(hubRing);
  const hubCap = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.045, 12), M.genMetal);
  hubCap.name = `deco_${tag}_hubcap`; hubCap.rotation.z = Math.PI / 2; hubCap.position.x = -0.035; spinner.add(hubCap);
  const hubNose = new THREE.Mesh(new THREE.SphereGeometry(0.042, 10, 8), M.ink);
  hubNose.name = `deco_${tag}_hubnose`; hubNose.scale.set(0.65, 1, 1); hubNose.position.x = -0.06; spinner.add(hubNose);
  return hubMesh;
}
export function plantaMaceta(parent, tag, x, y, z, { M, decoBox, decoCyl }) {
  decoCyl(parent, `${tag}_maceta`, M.orange, 0.12, 0.16, x, y + 0.08, z, 10);
  decoCyl(parent, `${tag}_tierra`, M.trunk, 0.1, 0.04, x, y + 0.16, z, 10);
  decoCyl(parent, `${tag}_tallo`, M.trunk, 0.02, 0.22, x, y + 0.28, z, 6);
  decoBox(parent, `${tag}_hoja_1`, M.leafGreen, 0.22, 0.04, 0.12, x + 0.06, y + 0.4, z, 0.4);
  decoBox(parent, `${tag}_hoja_2`, M.grassGreen, 0.18, 0.035, 0.1, x - 0.05, y + 0.36, z + 0.04, -0.5);
  decoBox(parent, `${tag}_hoja_3`, M.leafGreen, 0.14, 0.03, 0.08, x, y + 0.46, z - 0.04, 0.2);
}
