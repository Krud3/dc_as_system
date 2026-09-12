/** Props de principios: termómetro y chip. */

export function buildProps(ctx) {
  const {
    THREE, ROOT, SUB, M, mat, box, cyl, plantsReady,
  } = ctx;
  const P = SUB.procesos;
// ===== Termómetro en un servidor (Equifinalidad) =====
const servidorRef = ROOT.getObjectByName('rack_2_4_servidor_4');
const termo = new THREE.Group(); termo.name = 'termometro'; P.add(termo);
{ const p = servidorRef.getWorldPosition(new THREE.Vector3());
  const tx = p.x - 0.12, ty = p.y, tz = p.z + 0.035;
  M.vidrio = mat('vidrio', 0xf5f5f8, 0.2, 0);
  M.mercurio = mat('mercurio', 0x94bce3, 0.3, 0, { emissive: 0x94bce3, emissiveIntensity: 1.2 });
  box(termo, 'termometro_placa', M.deepSteel, 0.2, 0.2, 0.01, tx, ty, tz);
  cyl(termo, 'termometro_tubo', M.vidrio, 0.014, 0.15, tx - 0.06, ty + 0.01, tz + 0.008, 16);
  const bulbo = new THREE.Mesh(new THREE.SphereGeometry(0.024, 16, 12), M.mercurio); bulbo.name = 'termometro_bulbo'; bulbo.position.set(tx - 0.06, ty - 0.065, tz + 0.008); termo.add(bulbo);
  const columna = cyl(termo, 'termometro_columna', M.mercurio, 0.007, 0.075, tx - 0.06, ty - 0.03, tz + 0.009, 12); // 20°C ≈ mitad de la escala 0–40
  for (let i = 0; i <= 4; i++) box(termo, `termometro_marca_${i}`, M.paper, 0.02, 0.003, 0.002, tx - 0.035, ty - 0.065 + i * 0.035, tz + 0.007);
  // Pantalla digital "20°C" dibujada en canvas (solo visual; no viaja al OBJ)
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 64; const c = cv.getContext('2d');
  const pintarTemp = v => { c.fillStyle = '#1d2d3d'; c.fillRect(0, 0, 128, 64); c.fillStyle = '#b5d9fd'; c.font = '700 40px "Barlow Condensed", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(`${v}°C`, 64, 34); if (termo.userData.tex) termo.userData.tex.needsUpdate = true; };
  pintarTemp(20); termo.userData.pintarTemp = pintarTemp;
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; termo.userData.tex = tex;
  M.display = Object.assign(new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.9, roughness: 0.4 }), { name: 'display' });
  box(termo, 'termometro_display', M.display, 0.11, 0.055, 0.004, tx + 0.035, ty + 0.03, tz + 0.007);
  termo.userData.foco = new THREE.Vector3(tx, ty, tz);
}

// ===== Microprocesador en un blade (Jerarquía) =====
const bladeRef = ROOT.getObjectByName('rack_2_6_servidor_3'), rackRef = ROOT.getObjectByName('rack_2_6');
M.chip = mat('chip', 0x2b2b2d, 0.4, 0.3);
M.pines = mat('pines', 0x94bce3, 0.4, 0.4);
{ const p = bladeRef.getWorldPosition(new THREE.Vector3());
  const cx = p.x + 0.08, cy = p.y, cz = p.z + 0.012;
  box(rackRef, 'rack_2_6_servidor_3_chip_base', M.pines, 0.09, 0.09, 0.006, cx, cy, cz);
  box(rackRef, 'rack_2_6_servidor_3_chip', M.chip, 0.06, 0.06, 0.008, cx, cy, cz + 0.006);
  for (let i = 0; i < 5; i++) { box(rackRef, `rack_2_6_servidor_3_chip_aleta_${i + 1}`, M.grey, 0.05, 0.004, 0.012, cx, cy - 0.024 + i * 0.012, cz + 0.016); }
}
const chipRef = ROOT.getObjectByName('rack_2_6_servidor_3_chip');
['linea_at', 'acometida_electrica_1', 'acometida_electrica_2', 'alimentador_ups', 'alimentador_generador', 'acometida_electrica_redundante', 'acometida_electrica_redundante_2', 'fibra_entrada', 'fibra_salida_datos', 'rack_2_4_servidor_4', 'rack_2_6', 'rack_2_6_servidor_3', 'rack_2_3', 'rack_2_3_gabinete', 'chiller_1', 'chiller_1_ventilador', 'calor_chiller_1', 'crac_1', 'crac_1_rejilla', 'cubierta', 'uma_cubierta', 'noc', 'noc_cubierta', 'noc_pantalla_imagen', 'sensor_fila_2', 'generador', 'generador_humo', 'generador_indicador', 'transformador', 'tanque_agua', 'sala_meet_me', 'ciudad_1', 'estacion_meteo_anemometro', 'porton', 'placa_sitio'].forEach(n => { if (!ROOT.getObjectByName(n)) console.error('Falta objeto', n); });
plantsReady.then(() => {
  ['noc_modelo', 'deco_noc2', 'contenedor_e_waste'].forEach(n => { if (!ROOT.getObjectByName(n)) console.error('Falta objeto', n); });
});
  Object.assign(ctx, { termo, servidorRef, bladeRef, rackRef, chipRef });
}
