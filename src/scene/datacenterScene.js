/** Escena datacenter (Three.js imperativo). Montada desde React sin R3F. */
import { createMaterials } from './materials.js';
import { createPrimitives } from './primitives.js';
import { createRootHierarchy, createCampusLayout } from './layout.js';
import { createPlantSystem } from './plants.js';
import { buildEntorno } from './build/entorno.js';
import { buildFrontera } from './build/frontera.js';
import { buildProcesos } from './build/procesos.js';
import { buildEntradas } from './build/entradas.js';
import { buildSalidas } from './build/salidas.js';
import { buildRetroalimentacion } from './build/retroalimentacion.js';
import { buildResiliencia } from './build/resiliencia.js';
import { buildProps } from './build/props.js';
import { createScriptedCamera } from './cameraScripted.js';
import { easeInOutCubic } from './ease.js';

/**
 * @param {HTMLElement} stage — instancia de <three-d-stage> ya en el DOM
 */
export async function mountDatacenterScene(stage) {
const { THREE } = await stage.ready;

const { M, mat } = createMaterials(THREE);
const { box, cyl, line, decoBox, decoCyl, aspas } = createPrimitives(THREE, M);
const { ROOT, SUB } = createRootHierarchy(THREE);
const layout = createCampusLayout();
const { placePlant, plantsReady } = createPlantSystem(THREE, SUB.entorno);

const ctx = {
  THREE, ROOT, SUB, M, mat,
  box, cyl, line, decoBox, decoCyl, aspas,
  placePlant, plantsReady,
  ...layout,
};

buildEntorno(ctx);
buildFrontera(ctx);
buildProcesos(ctx);
buildEntradas(ctx);
buildSalidas(ctx);
buildRetroalimentacion(ctx);
buildResiliencia(ctx);
buildProps(ctx);

const {
  E, P, I, R, S,
  rayo, faroles, ciudadNueva,
  filas, filasIniciales, rows, perRow, rackH, fy,
  lucesNoc, humo, lamparas, luzSala, luzGen,
  termo, bladeRef, rackRef, chipRef,
  W, D, y0, HX, HZ, HW, HD, RY,
  UX, UZ, TX, TZ, WX, WZ, MX, MZ, NX, NZ, chillerPos,
} = ctx;

const { lockScriptedCam, unlockScriptedCam, aimScriptedCam } = createScriptedCamera(stage);

M.heat.side = THREE.DoubleSide; M.humo.side = THREE.DoubleSide;

// ===== ANIMACIÓN: rayo → apagón → planta eléctrica =====
const energia = { linea: E.getObjectByName('linea_at'), acom: [I.getObjectByName('acometida_electrica_1'), I.getObjectByName('acometida_electrica_2'), I.getObjectByName('alimentador_ups')], gen: [S.getObjectByName('alimentador_generador')] };
M.lineaOn = mat('linea_activa', 0x1d1f20, 0.6, 0.1, { emissive: 0x5980a6, emissiveIntensity: 0.8 });
M.lineaOff = mat('linea_caida', 0x98989b, 0.9, 0);
const ledBase = { color: M.led.color.clone(), em: M.led.emissive.clone(), ei: M.led.emissiveIntensity };
const ledGreenBase = { ei: M.ledGreen.emissiveIntensity };
let anim = null;
const estado = document.getElementById('estado');
const setLeds = (on, k = 1) => { M.led.emissiveIntensity = on ? ledBase.ei * k : 0; M.led.color.copy(ledBase.color).multiplyScalar(on ? 1 : 0.35); M.ledGreen.emissiveIntensity = on ? ledGreenBase.ei * k : 0; M.lampara.emissiveIntensity = on ? 1.8 * k : 0; lamparas.forEach(l => l.intensity = on ? lampBase * k : 0); luzSala.intensity = on ? salaBase * k : 0; };
let calleOn = true;
const setCalle = on => { calleOn = on; M.farol.emissiveIntensity = on ? 1.6 : 0; faroles.forEach(l => l.intensity = on ? farolBase : 0); if (!on) M.ventana.emissiveIntensity = 0; };
const reset = () => { setLeds(true); setCalle(true); rayo.visible = false; M.rayo.opacity = 0; energia.linea.material = M.ink; energia.acom.forEach(l => l.material = M.ink); energia.gen.forEach(l => l.material = M.ink); humo.visible = false; M.humo.opacity = 0; M.genLed.emissive.setHex(0); luzGen.intensity = 0; estado.textContent = ''; };
const rnd = () => Math.random();
function simularRayo(modo = 'entorno') {
  if (anim) return; reset(); const t0 = performance.now(); btnRayo.disabled = true; btnRes.disabled = true;
  const res = modo === 'resiliencia';
  anim = requestAnimationFrame(function step(now) {
    const t = (now - t0) / 1000;
    if (t < 0.6) { // descarga: destellos
      rayo.visible = true; M.rayo.opacity = (Math.floor(t * 24) % 3 === 0) ? 1 : 0.15; estado.textContent = 'Descarga atmosférica en torre AT';
    } else if (t < 0.9) { rayo.visible = false; energia.linea.material = M.lineaOff; energia.acom.forEach(l => l.material = M.lineaOff); estado.textContent = res ? 'Apagón: la ciudad y el datacenter pierden la red' : 'Pérdida de la acometida eléctrica'; setLeds(false); setCalle(false); }
    else if (t < 3.0) { // parpadeo de luces bajo UPS
      setLeds(rnd() > 0.35, 0.6 + rnd() * 0.6); estado.textContent = 'Parpadeo · UPS sosteniendo la carga';
    } else if (t < 4.2) { // arranque de planta
      const k = (t - 3.0) / 1.2; humo.visible = true; M.humo.opacity = 0.35 * k; M.genLed.emissive.setHex(0xb5d9fd).multiplyScalar(k); luzGen.intensity = 40 * k; setLeds(rnd() > 0.15, 0.8);
      if (k > 0.5) energia.gen.forEach(l => l.material = M.lineaOn); estado.textContent = 'Arranque del generador';
    } else if (t < (res ? 9.5 : 7.5)) { // operación en planta
      setLeds(true); M.humo.opacity = 0.3 + Math.sin(t * 6) * 0.05; humo.position.y = y0 + 2.6 + Math.sin(t * 2) * 0.1; estado.textContent = res ? 'Resiliencia: el datacenter opera con su planta; la calle sigue a oscuras' : 'Operando con planta eléctrica interna';
    } else if (t < (res ? 10.5 : 8.5)) { // retorno de red
      energia.linea.material = M.ink; energia.acom.forEach(l => l.material = M.lineaOn); setCalle(true); estado.textContent = 'Retorno de la red · retransferencia';
    } else { reset(); anim = null; btnRayo.disabled = false; btnRes.disabled = false; return; }
    anim = requestAnimationFrame(step);
  });
}
stage.setObject(ROOT);
{ const cam = stage._camera, ctl = stage._controls;
  cam.position.set(15, 12.5, 19); ctl.target.set(1.5, 0.9, 0);
  cam.near = 0.4; cam.far = 220; cam.updateProjectionMatrix(); ctl.update(); }

// ===== ANIMACIÓN: zoom al termómetro =====
let zoomAnim = null;
function zoomTermometro() {
  if (zoomAnim) return;
  const cam = stage._camera, ctl = stage._controls;
  const p0 = cam.position.clone(), t0 = ctl.target.clone(), wasAuto = ctl.autoRotate;
  const foco = termo.userData.foco, p1 = foco.clone().add(new THREE.Vector3(0.04, 0.05, 0.42));
  const near0 = cam.near; cam.near = 0.05; cam.updateProjectionMatrix();
  const wasDamp = lockScriptedCam(ctl); btnZoom.disabled = true;
  const ease = easeInOutCubic;
  const start = performance.now(), IN = 2.2, HOLD = 2.5, OUT = 2.0;
  const tmpP = new THREE.Vector3(), tmpT = new THREE.Vector3();
  zoomAnim = requestAnimationFrame(function step(now) {
    const t = (now - start) / 1000; let u;
    if (t < IN) { u = ease(t / IN); estado.textContent = 'Acercando al servidor'; }
    else if (t < IN + HOLD) { u = 1; estado.textContent = 'Chip a 20 °C · bajo el umbral térmico'; }
    else if (t < IN + HOLD + OUT) { u = 1 - ease((t - IN - HOLD) / OUT); estado.textContent = 'Regresando'; }
    else {
      unlockScriptedCam(ctl, { wasDamp, wasAuto, cam, near0, p0, t0 });
      estado.textContent = ''; btnZoom.disabled = false; zoomAnim = null; return;
    }
    aimScriptedCam(cam, ctl, tmpP.lerpVectors(p0, p1, u), tmpT.lerpVectors(t0, foco, u));
    zoomAnim = requestAnimationFrame(step);
  });
}

// ===== ANIMACIÓN: jerarquía (chip → blade → rack → sistema) =====
let jerAnim = null;
const blinkCache = new Map();
function parpadear(objs, on, fase) {
  objs.forEach(o => { if (!o.isMesh) return;
    if (!on) { if (blinkCache.has(o)) { o.material = blinkCache.get(o); blinkCache.delete(o); } return; }
    if (!blinkCache.has(o)) { blinkCache.set(o, o.material); const m = o.material.clone(); m.emissive = new THREE.Color(0xb5d9fd); m.emissiveIntensity = 1.4; m.color = new THREE.Color(0xb5d9fd); o.userData.blink = m; }
    o.material = fase ? o.userData.blink : blinkCache.get(o);
  });
}
const meshesDe = g => { const a = []; g.traverse(o => { if (o.isMesh) a.push(o); }); return a; };
function animarJerarquia() {
  if (jerAnim || zoomAnim) return;
  const cam = stage._camera, ctl = stage._controls;
  const p0 = cam.position.clone(), t0 = ctl.target.clone(), wasAuto = ctl.autoRotate, near0 = cam.near;
  const cbJer = layers.querySelector('input[data-k="jerarquia"]'), jerOn = !!(cbJer && cbJer.checked);
  if (jerOn) resaltar(CAPAS.jerarquia.resaltar, false);
  const wasDamp = lockScriptedCam(ctl);
  cam.near = 0.05; cam.updateProjectionMatrix();
  if (btnJer) btnJer.disabled = true;
  const V = (a, b) => new THREE.Vector3(a.x, a.y, a.z).add(b);
  // Matrices al día: tras el montaje React / GLBs diferidos puede haber un frame stale.
  ROOT.updateMatrixWorld(true);
  const fChip = chipRef.getWorldPosition(new THREE.Vector3());
  const fBlade = bladeRef.getWorldPosition(new THREE.Vector3());
  const gabinete = rackRef.getObjectByName('rack_2_6_gabinete');
  const fRack = gabinete.getWorldPosition(new THREE.Vector3());
  // El rediseño bonito añadió una puerta frontal opaca con textura de leds
  // (deco_rack_2_6_puerta) que tapa el blade y los servidores al parpadear.
  // Se oculta durante la animación y se restaura al final; la etapa 3 además
  // filtra los deco_* para parpadear el mismo conjunto que el modelo original.
  const puertaRack6 = rackRef.getObjectByName('deco_rack_2_6_puerta');
  const puertaVis0 = puertaRack6 ? puertaRack6.visible : null;
  if (puertaRack6) puertaRack6.visible = false;
  const meshesRack6 = meshesDe(rackRef).filter(o => !o.name.startsWith('deco_'));
  // Etapa 4 (global): el pulso debe afectar solo a los grupos resaltados del
  // sistema; antes recorría hlCache completo y hacía parpadear también los
  // edificios y farolas del entorno (atenuados pero con material emisivo).
  const mallasJer = [];
  CAPAS.jerarquia.resaltar.forEach(n => { const g = SUB[n]; if (g) g.traverse(o => { if (o.isMesh) mallasJer.push(o); }); });
  // Offsets un poco más abiertos: a 0.28 m los LEDs emisivos llenan el FOV y
  // parecen “desenfoque”; el damping de Orbit peores el encuadre.
  const etapas = [
    { foco: fChip, cam: V(fChip, new THREE.Vector3(0.12, 0.1, 0.55)), objs: [chipRef], txt: '1 · Microprocesador' },
    { foco: fBlade, cam: V(fBlade, new THREE.Vector3(0.35, 0.25, 1.55)), objs: [bladeRef], txt: '2 · Blade (servidor)' },
    { foco: fRack, cam: V(fRack, new THREE.Vector3(1.6, 1.1, 4.6)), objs: meshesRack6, txt: '3 · Rack completo' },
    { foco: t0, cam: p0, objs: [], global: true, txt: '4 · Datacenter como sistema' },
  ];
  const MOVE = 1.8, HOLD = 2.4, ease = easeInOutCubic;
  let pFrom = p0.clone(), tFrom = t0.clone(), etapa = 0, tEtapa = performance.now(), fase = 'move', globalOn = false;
  const tmpP = new THREE.Vector3(), tmpT = new THREE.Vector3();
  const finishJer = () => {
    if (globalOn) resaltar(CAPAS.jerarquia.resaltar, false);
    if (jerOn) resaltar(CAPAS.jerarquia.resaltar, true);
    if (puertaRack6) puertaRack6.visible = puertaVis0;
    unlockScriptedCam(ctl, { wasDamp, wasAuto, cam, near0, p0, t0 });
    estado.textContent = '';
    if (btnJer) btnJer.disabled = false;
    jerAnim = null;
  };
  jerAnim = requestAnimationFrame(function step(now) {
    const e = etapas[etapa], t = (now - tEtapa) / 1000;
    if (fase === 'move') {
      const u = ease(Math.min(t / MOVE, 1));
      aimScriptedCam(cam, ctl, tmpP.lerpVectors(pFrom, e.cam, u), tmpT.lerpVectors(tFrom, e.foco, u));
      estado.textContent = 'Jerarquía · ' + e.txt;
      if (t >= MOVE) { fase = 'hold'; tEtapa = now; if (e.global) { resaltar(CAPAS.jerarquia.resaltar, true); globalOn = true; } }
    } else {
      const on = Math.floor(t * 4) % 2 === 0;
      if (e.global) { mallasJer.forEach(o => { const base = hlCache.get(o); if (base && o.material !== base && o.material.emissive) o.material.emissiveIntensity = on ? 0.9 : 0.25; }); }
      else parpadear(e.objs, true, on);
      if (t >= HOLD) {
        parpadear(e.objs, false); etapa++; fase = 'move'; tEtapa = now; pFrom = cam.position.clone(); tFrom = ctl.target.clone();
        if (etapa < etapas.length && etapas[etapa].global && puertaRack6) puertaRack6.visible = puertaVis0;
        if (etapa >= etapas.length) { finishJer(); return; }
      }
    }
    jerAnim = requestAnimationFrame(step);
  });
}

// ===== ANIMACIÓN: complejidad (flujo de energía + todo en conjunto) =====
let cpxAnim = null;
const pulsos = new THREE.Group(); pulsos.name = 'pulsos_energia'; pulsos.visible = false; pulsos.userData = { label: 'Complejidad', desc: 'Pulso de energía en tránsito' }; ROOT.add(pulsos);
// Trayectorias externas. Entradas: red eléctrica (torre → poste → transformador → UPS → sala) y fibra (poste telecom → meet-me → sala). Salidas: datos (sala → meet-me → ciudad) y calor (chillers → cielo).
const V3 = a => a.map(p => new THREE.Vector3(...p));
const curva = pts => new THREE.CatmullRomCurve3(V3(pts), false, 'catmullrom', 0.15);
const rutas = [
  { c: curva([[30, 8.6, -6], [TX + 2.6, y0 + 6.4, TZ - 3.6], [TX, y0 + 1.95, TZ], [TX - 0.85, y0 + 0.5, TZ], [UX + 2.4, y0 + 0.5, UZ], [UX, y0 + 1.6, UZ], [HX + HW / 2 + 0.3, fy + rackH + 0.45, HZ], [HX, fy + rackH + 0.45, HZ]]), n: 8, tipo: 'energia', cables: ['linea_at', 'acometida_electrica_1', 'acometida_electrica_2', 'alimentador_ups'] },
  { c: curva([[30, 8.6, 1.5], [TX + 2.6, y0 + 6.4, TZ + 10.5], [TX, y0 + 1.95, TZ + 0.5], [TX - 0.85, y0 + 0.5, TZ], [UX + 2.4, y0 + 0.5, UZ]]), n: 4, tipo: 'energia', cables: ['acometida_electrica_redundante', 'acometida_electrica_redundante_2'] },
  { c: curva([[-30, y0 + 5.6, 10], [MX, y0 + 1.8, MZ], [HX - HW / 2 + 0.3, fy + rackH + 0.45, MZ], [HX, fy + rackH + 0.45, HZ]]), n: 6, tipo: 'datos', cables: ['fibra_entrada'] },
  { c: curva([[HX, fy + rackH + 0.45, HZ], [HX - HW / 2 + 0.3, fy + rackH + 0.45, MZ], [MX, y0 + 1.7, MZ + 0.35], [-26, 7, -16]]), n: 6, tipo: 'datos', cables: ['fibra_salida_datos'] },
  ...chillerPos.map(([x, y, z]) => ({ c: curva([[x, y + 0.4, z], [x, y + 3.6, z]]), n: 2, tipo: 'calor', cables: [] })),
];
M.pulsoEnergia = mat('pulso_energia', 0xeef6ff, 0.2, 0, { emissive: 0xb5d9fd, emissiveIntensity: 2.5 });
M.pulsoDatos = mat('pulso_datos', 0x94bce3, 0.2, 0, { emissive: 0x5980a6, emissiveIntensity: 2.5 });
M.pulsoCalor = mat('pulso_calor', 0xd4d4d7, 0.9, 0, { emissive: 0x98989b, emissiveIntensity: 0.6, transparent: true, opacity: 0.6 });
M.cableOn = mat('cable_activo', 0xb5d9fd, 0.4, 0.1, { emissive: 0x94bce3, emissiveIntensity: 1.2 });
const cablesCpx = []; rutas.forEach(r => r.cables.forEach(n => { const o = ROOT.getObjectByName(n); if (o) cablesCpx.push(o); }));
const cableBase = new Map();
let cpxBolas = [];
function animarFlujo(on) {
  if (!on) {
    if (cpxAnim) cancelAnimationFrame(cpxAnim); cpxAnim = null;
    pulsos.visible = false; pulsos.clear(); cpxBolas = [];
    cablesCpx.forEach(o => { if (cableBase.has(o)) o.material = cableBase.get(o); o.scale.set(1, 1, 1); }); cableBase.clear();
    M.heat.opacity = 0.35; M.genLed.emissive.setHex(0); luzGen.intensity = 0; if (!anim) setLeds(true); estado.textContent = ''; return;
  }
  if (cpxAnim) return;
  pulsos.visible = true; pulsos.clear(); cpxBolas = [];
  rutas.forEach((r, ri) => { for (let i = 0; i < r.n; i++) {
    const geo = r.tipo === 'calor' ? new THREE.SphereGeometry(0.6, 14, 10) : new THREE.SphereGeometry(0.42, 16, 12);
    const b = new THREE.Mesh(geo, r.tipo === 'energia' ? M.pulsoEnergia : r.tipo === 'datos' ? M.pulsoDatos : M.pulsoCalor);
    b.name = `pulso_${r.tipo}_${ri + 1}_${i + 1}`; b.userData = { ruta: r.c, off: i / r.n, vel: r.tipo === 'calor' ? 0.6 : 1 }; pulsos.add(b); cpxBolas.push(b); } });
  cablesCpx.forEach(o => { cableBase.set(o, o.material); o.material = M.cableOn; o.scale.set(3, 1, 3); });
  const start = performance.now();
  cpxAnim = requestAnimationFrame(function step(now) {
    const t = (now - start) / 1000, k = Math.min(t / 4, 1);
    const vel = 0.25 + k * 0.45; // acelera hasta estabilizarse
    cpxBolas.forEach(b => { let u = (b.userData.off + t * vel * b.userData.vel) % 1; u = Math.min(Math.max(u, 0.001), 0.999); const p = b.userData.ruta.getPointAt(u); if (p) b.position.copy(p); b.scale.setScalar(0.75 + 0.35 * Math.sin(u * Math.PI)); });
    // Cables pulsan y el interior respira suavemente en conjunto
    const ritmo = 0.5 + 0.5 * Math.sin(t * 1.6);
    M.cableOn.emissiveIntensity = 0.8 + 1.0 * ritmo;
    M.led.emissiveIntensity = ledBase.ei * (0.8 + 0.5 * ritmo);
    M.lampara.emissiveIntensity = 1.4 + 0.8 * ritmo;
    luzSala.intensity = salaBase * (0.8 + 0.35 * ritmo); lamparas.forEach(l => l.intensity = lampBase * (0.8 + 0.3 * ritmo));
    luzGen.intensity = 25 * ritmo; M.genLed.emissive.setHex(0xb5d9fd).multiplyScalar(ritmo);
    for (let i = 1; i <= 4; i++) { const f = ROOT.getObjectByName(`chiller_${i}_ventilador`); if (f) f.rotation.y += 0.1 + k * 0.3; }
    const an = ROOT.getObjectByName('estacion_meteo_anemometro'); if (an) an.rotation.y += 0.1 + k * 0.2;
    M.heat.opacity = 0.2 + 0.3 * ritmo;
    if (!emAnim) estado.textContent = `Sinergia · entra energía y datos · salen datos y calor`;
    cpxAnim = requestAnimationFrame(step);
  });
}

// ===== ANIMACIÓN: complejidad (zoom a la sala; filas 2 → 4 → 6) =====
let cpxAnim2 = null, filasVisibles = filasIniciales;
function mostrarFilas(n) { filasVisibles = n; filas.forEach((f, i) => { f.visible = i < n; f.scale.set(1, 1, 1); if (f.userData.sensor) f.userData.sensor.visible = i < n; }); ciudadNueva.forEach(b => { b.visible = n > filasIniciales; b.scale.set(1, 1, 1); b.position.y = 0.2 + b.userData.h / 2; }); if (typeof sincronizarCiudad === 'function') sincronizarCiudad(); }
function animarComplejidad() {
  if (cpxAnim2 || jerAnim || zoomAnim) return;
  const cam = stage._camera, ctl = stage._controls;
  const p0 = cam.position.clone(), t0 = ctl.target.clone(), wasAuto = ctl.autoRotate;
  ctl.autoRotate = false; ctl.enabled = false; btnCpx.disabled = true;
  mostrarFilas(filasIniciales);
  const foco = new THREE.Vector3(HX - 0.5, fy + 0.9, HZ - 0.5), pIn = new THREE.Vector3(HX + 7.5, y0 + 2.9, HZ + HD / 2 + 6.0);
  const focoCiudad = new THREE.Vector3(-27, 4, -13), pCiudad = new THREE.Vector3(-8, 12, 14);
  ciudadNueva.forEach(b => { b.visible = false; b.scale.set(1, 1, 1); b.position.y = 0.2 + b.userData.h / 2; });
  // Vista baja desde el sureste, por debajo de la cubierta: el techo nunca se interpone
  // entre la cámara y los racks. Se oculta la cubierta + todo lo apoyado en ella
  // (chillers, UMA, meteo y sus decos) para que no queden piezas flotando en cuadro.
  const techo = [];
  ROOT.traverse(o => { if (/^(cubierta|uma_cubierta|uma_ventilador|uma_rejilla|uma_aro|chiller_|calor_chiller_|estacion_meteo|meteo_panel|meteo_veleta|deco_(cubierta|uma_|chiller_|meteo_|anemo_))/.test(o.name)) techo.push(o); });
  const techoVis = techo.map(o => o.visible);
  const ease = easeInOutCubic;
  const IN = 2.0, PAUSA = 1.2, CREC = 0.9, OUT = 2.0;
  // Etapa 1: la ciudad crece (demanda)
  const C_IN = 2.0, C_EDIF = 0.7, C_PASO = 0.45, C_HOLD = 1.0;
  const cEventos = ciudadNueva.map((b, i) => [C_IN + i * C_PASO, b]);
  const cFin = C_IN + (ciudadNueva.length - 1) * C_PASO + C_EDIF + C_HOLD;
  const eventos = []; // [tiempo, fila]: cada etapa duplica: 2→4, 4→6
  let tt = cFin + IN + PAUSA; [[2, 3], [4, 5]].forEach(par => { par.forEach((f, i) => eventos.push([tt + i * 0.35, f])); tt += CREC + PAUSA; });
  const fin = tt, start = performance.now();
  cpxAnim2 = requestAnimationFrame(function step(now) {
    const t = (now - start) / 1000;
    if (t < C_IN) { const u = ease(t / C_IN); cam.position.lerpVectors(p0, pCiudad, u); ctl.target.lerpVectors(t0, focoCiudad, u); estado.textContent = 'Complejidad · la demanda crece'; }
    else if (t < cFin) {
      cEventos.forEach(([te, b]) => { const k = Math.min(Math.max((t - te) / C_EDIF, 0), 1); if (k > 0) { b.visible = true; const s = ease(k); b.scale.y = Math.max(s, 0.001); b.position.y = 0.2 + b.userData.h * s / 2; } }); sincronizarCiudad();
      const n = 3 + cEventos.filter(([te]) => t >= te + C_EDIF * 0.5).length; estado.textContent = `Complejidad · ${n} edificios demandan servicio`;
    }
    else if (t < cFin + IN) { const u = ease((t - cFin) / IN); cam.position.lerpVectors(pCiudad, pIn, u); ctl.target.lerpVectors(focoCiudad, foco, u); if (u > 0.6) techo.forEach(o => o.visible = false); estado.textContent = 'Complejidad · 2 filas'; }
    else if (t < fin) {
      eventos.forEach(([te, f]) => { const g = filas[f]; const k = Math.min(Math.max((t - te) / CREC, 0), 1);
        if (k > 0) { g.visible = true; if (g.userData.sensor) g.userData.sensor.visible = k >= 1; const s = ease(k); g.scale.set(1, Math.max(s, 0.001), 1); g.position.y = 0; } });
      const n = 2 + eventos.filter(([te]) => t >= te + CREC * 0.5).length; estado.textContent = `Complejidad · ${n} filas · ${n * perRow} racks · ${n * perRow * 6} servidores`;
    }
    else if (t < fin + OUT) { const u = ease((t - fin) / OUT); if (u > 0.4) techo.forEach((o, i) => o.visible = techoVis[i]); cam.position.lerpVectors(pIn, p0, u); ctl.target.lerpVectors(foco, t0, u); estado.textContent = 'Complejidad · 6 filas'; }
    else { techo.forEach((o, i) => o.visible = techoVis[i]); mostrarFilas(rows); layers.querySelector('input[data-k="complejidad"]').checked = true; cam.position.copy(p0); ctl.target.copy(t0); ctl.update(); ctl.enabled = true; ctl.autoRotate = wasAuto; estado.textContent = ''; btnCpx.disabled = false; cpxAnim2 = null; return; }
    ctl.update(); cpxAnim2 = requestAnimationFrame(step);
  });
}

// ===== ANIMACIÓN: emergencia (interacción → nube → servicio a la ciudad) =====
let emAnim = null, emFlujo = false;
M.hilo = mat('hilo', 0xb5d9fd, 0.3, 0, { emissive: 0x94bce3, emissiveIntensity: 1.5, transparent: true, opacity: 0.9 });
M.nube = mat('nube', 0xb5d9fd, 1, 0, { emissive: 0x94bce3, emissiveIntensity: 0.5, transparent: true, opacity: 0, depthWrite: false });
M.ventana = mat('ventana', 0xb5d9fd, 0.4, 0, { emissive: 0xb5d9fd, emissiveIntensity: 0, transparent: true, opacity: 0.95 });
const emergente = new THREE.Group(); emergente.name = 'emergencia'; emergente.visible = false; emergente.userData = { label: 'Emergencia', desc: 'Propiedad que surge de la interacción del conjunto' }; ROOT.add(emergente);
// Nube: cúmulo de esferas sobre la cubierta
const nubeC = new THREE.Vector3(HX, RY + 5.5, HZ), nube = new THREE.Group(); nube.name = 'nube'; emergente.add(nube);
[[0, 0, 0, 3.2], [-3, -0.4, 0.6, 2.4], [3, -0.3, -0.5, 2.5], [-1.5, 1.2, -1, 2.1], [1.6, 1.3, 1, 2.2], [-5, -0.9, -0.4, 1.7], [5, -0.8, 0.5, 1.8], [0, -0.6, 2, 2.0], [0.4, -0.7, -2.2, 1.9]].forEach(([x, y, z, r], i) => {
  const s = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), M.nube); s.name = `nube_${i + 1}`; s.position.set(nubeC.x + x, nubeC.y + y, nubeC.z + z); nube.add(s);
});
// Ventanas en los edificios (se iluminan cuando llega el servicio)
const edificios = []; E.traverse(o => { if (o.isMesh && /^ciudad_/.test(o.name)) edificios.push(o); });
edificios.forEach((b, i) => { const p = b.geometry.parameters; for (let f = 0; f < Math.floor(p.height / 1.4); f++) for (let c = 0; c < 2; c++) {
  const w = box(emergente, `ventana_${i + 1}_${f + 1}_${c + 1}`, M.ventana, 0.5, 0.6, 0.02, b.position.x - p.width / 4 + c * p.width / 2, 0.2 + 0.9 + f * 1.4, b.position.z + p.depth / 2 + 0.02); w.userData.edificio = b; } });
// Hilos: interacción entre racks (aleatorios, breves) y nube → edificios (persistentes)
const hilosRack = new THREE.Group(); hilosRack.name = 'hilos_interaccion'; emergente.add(hilosRack);
const hilosCiudad = new THREE.Group(); hilosCiudad.name = 'hilos_servicio'; emergente.add(hilosCiudad);
const puntoNube = new THREE.Vector3(HX, RY + 0.3, HZ); // convergen en el datacenter (centro de la cubierta)
edificios.forEach((b, i) => { const p = b.geometry.parameters; const B = puntoNube.clone(), A = new THREE.Vector3(b.position.x, 0.2 + p.height + 0.2, b.position.z); const len = A.distanceTo(B);
  const geo = new THREE.CylinderGeometry(0.05, 0.05, len, 10); geo.translate(0, len / 2, 0); // origen en el edificio; crece hacia la nube
  const h = new THREE.Mesh(geo, M.hilo); h.name = `hilo_servicio_${i + 1}`; h.userData.edificio = b; h.position.copy(A); h.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()); h.scale.y = 0.001; hilosCiudad.add(h); });
// Ventanas y haces siguen la visibilidad de su edificio (Complejidad on/off)
function sincronizarCiudad() { emergente.traverse(o => { if (o.userData && o.userData.edificio) o.visible = o.userData.edificio.visible; }); }
const topeRack = r => { const g = r.getObjectByName(`${r.name}_gabinete`); return g ? g.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, rackH / 2 + 0.15, 0)) : null; };
function animarEmergencia(on) {
  if (!on) { if (emAnim) cancelAnimationFrame(emAnim); emAnim = null; emergente.visible = false; hilosRack.clear(); M.nube.opacity = 0; M.ventana.emissiveIntensity = 0; hilosCiudad.children.forEach(h => h.scale.y = 0.001); estado.textContent = ''; return; }
  if (emAnim) return;
  emergente.visible = true; sincronizarCiudad(); const start = performance.now(); let ultimo = 0; const activos = [];
  emAnim = requestAnimationFrame(function step(now) {
    const t = (now - start) / 1000;
    // 1) interacción: hilos entre racks, cada vez más densos (0–3 s)
    const dens = Math.min(t / 3, 1), intervalo = 0.5 - 0.4 * dens;
    const vis = filas.filter(f => f.visible).flatMap(f => f.children.filter(c => c.name.startsWith('rack_')));
    if (t - ultimo > intervalo && vis.length > 1) { ultimo = t; const a = vis[Math.floor(Math.random() * vis.length)], b = vis[Math.floor(Math.random() * vis.length)]; const pa = topeRack(a), pb = topeRack(b);
      if (a !== b && pa && pb) { const mid = pa.clone().lerp(pb, 0.5); mid.y += 0.4 + pa.distanceTo(pb) * 0.15; const cv = new THREE.QuadraticBezierCurve3(pa, mid, pb); const h = new THREE.Mesh(new THREE.TubeGeometry(cv, 12, 0.02, 6), M.hilo.clone()); h.name = 'hilo_interaccion'; h.userData.t0 = t; hilosRack.add(h); activos.push(h); } }
    for (let i = activos.length - 1; i >= 0; i--) { const h = activos[i], a = t - h.userData.t0; h.material.opacity = a < 0.3 ? a / 0.3 : Math.max(0, 1 - (a - 0.3) / 1.2); if (a > 1.5) { hilosRack.remove(h); h.geometry.dispose(); h.material.dispose(); activos.splice(i, 1); } }
    // 2) emergencia: la nube se condensa (3–6 s) como consecuencia de las conexiones, y respira
    const k = Math.min(Math.max((t - 3) / 3, 0), 1), resp = 0.5 + 0.5 * Math.sin(t * 0.9);
    M.nube.opacity = 0.55 * k; M.nube.emissiveIntensity = 0.35 + 0.35 * resp * k; nube.scale.setScalar(0.4 + 0.6 * k + 0.03 * resp);
    nube.position.y = 0.15 * Math.sin(t * 0.6);
    // 1b) haces desde los edificios hacia el punto de encuentro (0–3 s): las conexiones crecen desde la ciudad
    const s = Math.min(t / 3, 1); hilosCiudad.children.forEach((h, i) => { const u = Math.min(Math.max((s * hilosCiudad.children.length - i * 0.5) / 1.5, 0), 1); h.scale.y = Math.max(u, 0.001); });
    M.ventana.emissiveIntensity = calleOn ? 1.6 * Math.min(t / 1.5, 1) * (0.8 + 0.2 * resp) : 0;
    estado.textContent = t < 3 ? 'Emergencia · los edificios se conectan, las interacciones aumentan' : t < 6 ? 'Emergencia · de la interacción surge una propiedad nueva: la nube' : 'Emergencia · la nube existe solo en el conjunto';
    emAnim = requestAnimationFrame(step);
  });
}

// ===== ANIMACIÓN: adaptabilidad (el sitio sube a una loma; llega la inundación y no lo alcanza) =====
let adAnim = null;
const LOMA_H = 3.0;
M.loma = mat('loma', 0xd4d4d7, 0.95, 0);
M.agua = mat('agua', 0x749dc4, 0.15, 0.1, { transparent: true, opacity: 0, depthWrite: false });
const loma = new THREE.Mesh(new THREE.BoxGeometry(W + 6, LOMA_H, D + 6), M.loma); loma.name = 'loma'; loma.position.set(0, 0.2, 0); loma.scale.y = 0.001; loma.visible = false; E.add(loma);
const agua = new THREE.Mesh(new THREE.BoxGeometry(70, 1, 50), M.agua); agua.name = 'inundacion'; agua.position.set(0, 0.2, 0); agua.scale.y = 0.001; agua.visible = false; E.add(agua);
// Grupos que suben con el sitio (todo salvo el entorno)
const sitio = ['frontera', 'entradas', 'procesos', 'salidas', 'retroalimentacion', 'resiliencia', 'pulsos_energia'].map(n => ROOT.getObjectByName(n)).filter(Boolean).concat([nube, hilosRack]);
// Líneas externas: un extremo en el entorno (fijo) y otro en el sitio (sube)
const reaim = (m, A, B) => { const len = A.distanceTo(B); m.geometry.dispose(); m.geometry = new THREE.CylinderGeometry(m.userData.r, m.userData.r, len, 10); m.position.copy(A.clone().add(B).multiplyScalar(0.5)); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()); };
const externas = [
  ['acometida_electrica_1', [30, 8.6, -6], [TX + 2.6, y0 + 6.4, TZ - 3.6]],
  ['acometida_electrica_redundante', [30, 8.6, 1.5], [TX + 2.6, y0 + 6.4, TZ + 10.5]],
  ['fibra_entrada', [-30, y0 + 5.6, 10], [MX, y0 + 1.8, MZ]],
  ['fibra_salida_datos', [-26, 7, -16], [MX, y0 + 1.7, MZ + 0.35]],
].map(([n, fijo, movil]) => { const m = ROOT.getObjectByName(n); m.userData.r = m.geometry.parameters.radiusTop; return { m, fijo: new THREE.Vector3(...fijo), movil: new THREE.Vector3(...movil) }; });
function elevarSitio(h) { sitio.forEach(g => g.position.y = h); loma.visible = h > 0.01; loma.scale.y = Math.max(h / LOMA_H, 0.001); loma.position.y = 0.2 + h / 2; externas.forEach(e => reaim(e.m, e.fijo.clone().sub(new THREE.Vector3(0, h, 0)), e.movil)); const cb = layers.querySelector('input[data-k="adaptabilidad"]'); if (cb) cb.checked = h > LOMA_H / 2; }
// Lluvia: partículas sobre todo el terreno
M.lluvia = new THREE.PointsMaterial({ color: 0xb5d9fd, size: 0.18, transparent: true, opacity: 0, depthWrite: false }); M.lluvia.name = 'lluvia';
const N_LLUVIA = 2600, lluviaPos = new Float32Array(N_LLUVIA * 3);
for (let i = 0; i < N_LLUVIA; i++) { lluviaPos[i * 3] = (Math.random() - 0.5) * 70; lluviaPos[i * 3 + 1] = Math.random() * 30; lluviaPos[i * 3 + 2] = (Math.random() - 0.5) * 50; }
const lluviaGeo = new THREE.BufferGeometry(); lluviaGeo.setAttribute('position', new THREE.BufferAttribute(lluviaPos, 3));
const lluvia = new THREE.Points(lluviaGeo, M.lluvia); lluvia.name = 'lluvia'; lluvia.visible = false; E.add(lluvia);
function caerLluvia(dt) { const a = lluviaGeo.attributes.position.array; for (let i = 0; i < N_LLUVIA; i++) { a[i * 3 + 1] -= 18 * dt; if (a[i * 3 + 1] < 0.2) a[i * 3 + 1] = 30; } lluviaGeo.attributes.position.needsUpdate = true; }
function animarAdaptabilidad() {
  if (adAnim) return; btnAd.disabled = true; elevarSitio(0);
  const ease = easeInOutCubic;
  const LLUVIA = 3.0, SUBE = 2.5, PAUSA = 0.6, INUNDA = 3.0, HOLD = 2.5, BAJA = 2.5, AGUA_H = 2.2;
  const T1 = LLUVIA, T2 = T1 + SUBE, T3 = T2 + PAUSA, T4 = T3 + INUNDA, T5 = T4 + HOLD, T6 = T5 + BAJA;
  const start = performance.now(); let prev = start; agua.visible = true; lluvia.visible = true;
  adAnim = requestAnimationFrame(function step(now) {
    const t = (now - start) / 1000, dt = Math.min((now - prev) / 1000, 0.05); prev = now;
    // la lluvia acompaña toda la secuencia y amaina al final
    caerLluvia(dt); M.lluvia.opacity = t < 1 ? 0.8 * t : t > T5 ? Math.max(0, 0.8 * (1 - (t - T5) / BAJA)) : 0.8;
    if (t < T1) { estado.textContent = 'Adaptabilidad · empieza a llover'; }
    else if (t < T2) { elevarSitio(LOMA_H * ease((t - T1) / SUBE)); estado.textContent = 'Adaptabilidad · el sitio se eleva sobre una loma'; }
    else if (t < T3) { estado.textContent = 'Adaptabilidad · el sistema se anticipa al entorno'; }
    else if (t < T4) { const k = ease((t - T3) / INUNDA); M.agua.opacity = 0.55 * Math.min(k * 3, 1); agua.scale.y = Math.max(AGUA_H * k, 0.001); agua.position.y = 0.2 + AGUA_H * k / 2; estado.textContent = 'Adaptabilidad · el entorno se inunda'; }
    else if (t < T5) { agua.position.y = 0.2 + AGUA_H / 2 + 0.05 * Math.sin(t * 2); estado.textContent = 'Adaptabilidad · el datacenter queda a salvo'; }
    else if (t < T6) { const k = 1 - ease((t - T5) / BAJA); M.agua.opacity = 0.55 * k; agua.scale.y = Math.max(AGUA_H * k, 0.001); agua.position.y = 0.2 + AGUA_H * k / 2; estado.textContent = 'Adaptabilidad · el agua se retira'; }
    else { agua.visible = false; M.agua.opacity = 0; lluvia.visible = false; M.lluvia.opacity = 0; estado.textContent = ''; btnAd.disabled = false; adAnim = null; return; }
    adAnim = requestAnimationFrame(step);
  });
}

// ===== ANIMACIÓN: entropía (paso del tiempo → deterioro → ruinas) =====
let enAnim = null, modoNoche = true, entropiaK = 0;
M.sol = mat('sol', 0xf5f5f8, 0.4, 0, { emissive: 0xffffff, emissiveIntensity: 1.6 });
M.luna = mat('luna', 0xd4d4d7, 0.8, 0, { emissive: 0xb5d9fd, emissiveIntensity: 0.8 });
M.escombro = mat('escombro', 0x98989b, 0.95, 0);
const cielo = new THREE.Group(); cielo.name = 'cielo'; cielo.visible = false; E.add(cielo);
const sol = new THREE.Mesh(new THREE.SphereGeometry(2.2, 24, 16), M.sol); sol.name = 'sol'; cielo.add(sol);
const luna = new THREE.Mesh(new THREE.SphereGeometry(1.5, 24, 16), M.luna); luna.name = 'luna'; cielo.add(luna);
const R_CIELO = 42;
function posCielo(fase) { // fase 0..1: 0 = mediodía, 0.5 = medianoche
  const a = fase * Math.PI * 2; sol.position.set(Math.sin(a) * R_CIELO, Math.cos(a) * R_CIELO, -8); luna.position.set(-Math.sin(a) * R_CIELO, -Math.cos(a) * R_CIELO, -8);
}
// Objetos que se deterioran: mallas del sitio (salvo luces y animáticos)
const deterioro = []; const noDet = /^(deco_|rayo|pulso|hilo|nube|ventana|termometro|generador_humo|calor_|loma|inundacion|lluvia|sensor_|luminaria_\d+_luz|luz_|placa_sitio|piso_tecnico|piso_baldosas|marca_|escombro|auto_)/;
sitio.forEach(g => g.traverse(o => { if (o.isMesh && !noDet.test(o.name) && o.material !== M.led && o.material !== M.ledGreen && o.material !== M.heat && o.material !== M.humo) deterioro.push(o); }));
const detBase = new Map(); // o -> { mat, pos, rot, scale, seed }
const escombros = new THREE.Group(); escombros.name = 'escombros'; escombros.visible = false; P.add(escombros);
for (let i = 0; i < 60; i++) { const s = 0.3 + Math.random() * 0.9; const e = new THREE.Mesh(new THREE.BoxGeometry(s, s * 0.5, s * 0.7), M.escombro); e.name = `escombro_${i + 1}`; e.position.set(HX + (Math.random() - 0.5) * (HW + 4), y0 + s * 0.25, HZ + (Math.random() - 0.5) * (HD + 4)); e.rotation.y = Math.random() * Math.PI; escombros.add(e); }
function detObj(o, k, flash = 0) { // aplica deterioro k (0..1) a un objeto; flash resalta la reparación
  if (!detBase.has(o)) { detBase.set(o, { mat: o.material, pos: o.position.clone(), rot: o.rotation.clone(), scale: o.scale.clone(), seed: Math.random(), seed2: Math.random() - 0.5, seed3: Math.random() - 0.5, det: o.material.clone() }); }
  const b = detBase.get(o), m = b.det; o.material = m;
  m.color.copy(b.mat.color).lerp(new THREE.Color(0x6b6b6e), k * 0.85); m.roughness = Math.min(1, (b.mat.roughness || 0.7) + k * 0.4);
  if (m.emissive) { m.emissive.copy(b.mat.emissive || new THREE.Color(0)); m.emissiveIntensity = (b.mat.emissiveIntensity || 0) * (1 - k); if (flash > 0) { m.emissive.lerp(new THREE.Color(0xb5d9fd), flash); m.emissiveIntensity = Math.max(m.emissiveIntensity, 1.2 * flash); } }
  const u = Math.min(Math.max((k - b.seed * 0.7) / 0.3, 0), 1);
  const p = o.geometry.parameters || {}; const alto = p.height || (p.radius ? p.radius * 2 : 1); const ancho = Math.max(p.width || 0, p.depth || 0, p.radiusTop ? p.radiusTop * 2 : 0, p.radius ? p.radius * 2 : 0, 0.2);
  const f = Math.min(1, 2.5 / ancho);
  o.rotation.set(b.rot.x + b.seed2 * 0.5 * u * f, b.rot.y + b.seed3 * 0.3 * u, b.rot.z + b.seed3 * 0.6 * u * f);
  const caida = ancho > 6 ? Math.min(alto * 0.5 + 1.0, 3.5) * u : alto * 0.5 * u;
  o.position.set(b.pos.x + b.seed2 * 0.4 * u * f, b.pos.y - caida, b.pos.z + b.seed3 * 0.4 * u * f);
}
function aplicarDeterioro(k) {
  entropiaK = k;
  if (k <= 0) { detBase.forEach((b, o) => { o.material = b.mat; o.position.copy(b.pos); o.rotation.copy(b.rot); o.scale.copy(b.scale); }); detBase.clear(); escombros.visible = false; if (!anim) setLeds(true); M.led.emissiveIntensity = ledBase.ei; M.ledGreen.emissiveIntensity = ledGreenBase.ei; return; }
  deterioro.forEach(o => detObj(o, k));
  M.led.emissiveIntensity = ledBase.ei * Math.max(0, 1 - k * 1.6); M.ledGreen.emissiveIntensity = ledGreenBase.ei * Math.max(0, 1 - k * 1.6); M.lampara.emissiveIntensity = 1.8 * Math.max(0, 1 - k * 1.4); lamparas.forEach(l => l.intensity = lampBase * Math.max(0, 1 - k * 1.4)); luzSala.intensity = salaBase * Math.max(0, 1 - k * 1.6);
  escombros.visible = k > 0.55; escombros.children.forEach((e, i) => { const u = Math.min(Math.max((k - 0.55 - (i / 60) * 0.4) / 0.08, 0), 1); e.scale.setScalar(Math.max(u, 0.001)); });
}
function mezclaLuz(noche) { // 0 = día, 1 = noche (continuo)
  const d = 1 - noche;
  stage._hemi.intensity = 0.38 + 0.57 * d; stage._hemi.color.setHex(0xe8f0f8).lerp(new THREE.Color(0xb497cf), noche); stage._hemi.groundColor.setHex(0xc0ccd8).lerp(new THREE.Color(0x0a0a0a), noche);
  stage._key.intensity = 0.68 + 1.17 * d; stage._key.color.setHex(0xfff4ea).lerp(new THREE.Color(0xd7c6ea), noche); stage._fill.intensity = 0.2 + 0.32 * d;
  if (stage._rim) { stage._rim.intensity = 0.18 + 0.14 * d; stage._rim.color.setHex(0xd7c6ea); }
  const bg = new THREE.Color(0xd8e6f2).lerp(new THREE.Color(0x0a0a0a), noche); stage.style.setProperty('--stage-bg', '#' + bg.getHexString());
  (stage.closest('.dc-page') || document.body).classList.toggle('noche', noche > 0.5); stage.style.setProperty('--stage-note', noche > 0.5 ? '#c9b6df' : 'rgba(26, 25, 21, 0.5)');
  stage.style.setProperty('--stage-toolbar-bg', noche > 0.5 ? 'rgba(10, 10, 10, 0.78)' : 'rgba(255, 255, 255, 0.92)');
  stage.style.setProperty('--stage-toolbar-ink', noche > 0.5 ? '#f4f7ff' : '#2c4a64');
  stage.style.setProperty('--stage-toolbar-border', noche > 0.5 ? 'rgba(244, 247, 255, 0.14)' : 'rgba(29, 45, 61, 0.14)');
}
function animarEntropia() {
  if (enAnim) return; btnEn.disabled = true; aplicarDeterioro(0);
  const DUR = 16, CICLOS = 6, start = performance.now(); cielo.visible = true;
  const noche0 = modoNoche;
  enAnim = requestAnimationFrame(function step(now) {
    const t = (now - start) / 1000, k = Math.min(t / DUR, 1);
    const fase = (noche0 ? 0.5 : 0) + k * CICLOS; posCielo(fase % 1);
    const nocheCont = 0.5 - 0.5 * Math.cos((fase % 1) * Math.PI * 2); mezclaLuz(nocheCont);
    aplicarDeterioro(k * k); // el deterioro se acelera
    const dias = Math.floor(k * CICLOS); estado.textContent = k < 1 ? `Entropía · pasa el tiempo · ${dias} ciclos · deterioro ${Math.round(k * k * 100)} %` : 'Entropía · ruinas: sin mantenimiento, el sistema se desordena';
    if (t >= DUR + 2.5) { cielo.visible = false; setModo(modoNoche); layers.querySelector('input[data-k="entropia"]').checked = true; btnEn.disabled = false; enAnim = null; return; }
    enAnim = requestAnimationFrame(step);
  });
}

// ===== ANIMACIÓN: neguentropía (energía del entorno → reparación por frente → orden) =====
let ngAnim = null, ngFlujo = false;
function animarNeguentropia() {
  if (ngAnim || enAnim) return; btnNg.disabled = true;
  if (entropiaK < 0.99) aplicarDeterioro(1); // parte de las ruinas
  const xs = deterioro.map(o => detBase.get(o).pos.x), xMax = Math.max(...xs) + 1, xMin = Math.min(...xs) - 1;
  const ENTRA = 2.0, REPARA = 9.0, CIERRE = 2.5, ANCHO = 4.0, start = performance.now();
  if (!cpxAnim) { animarFlujo(true); ngFlujo = true; } // energía e información entran del entorno
  ngAnim = requestAnimationFrame(function step(now) {
    const t = (now - start) / 1000;
    if (t < ENTRA) { estado.textContent = 'Neguentropía · entra energía e información del entorno'; setCalle(true); }
    else if (t < ENTRA + REPARA) {
      const frente = xMax - (xMax - xMin + ANCHO) * (t - ENTRA) / REPARA; // avanza de la acometida (este) hacia el oeste
      deterioro.forEach(o => { const b = detBase.get(o); const d = frente - b.pos.x; const k = Math.min(Math.max(d / ANCHO, 0), 1); const flash = d > 0 && d < ANCHO ? 1 - d / ANCHO : 0; detObj(o, k, flash); });
      const kGlobal = 1 - (t - ENTRA) / REPARA; entropiaK = kGlobal;
      escombros.children.forEach(e => { const k = Math.min(Math.max((frente - e.position.x) / ANCHO, 0), 1); e.scale.setScalar(Math.max(k, 0.001)); });
      M.led.emissiveIntensity = ledBase.ei * (1 - kGlobal); M.lampara.emissiveIntensity = 1.8 * (1 - kGlobal); lamparas.forEach(l => l.intensity = lampBase * (1 - kGlobal)); luzSala.intensity = salaBase * (1 - kGlobal);
      estado.textContent = `Neguentropía · mantenimiento en curso · orden ${Math.round((1 - kGlobal) * 100)} %`;
    }
    else if (t < ENTRA + REPARA + CIERRE) { if (entropiaK !== 0) { aplicarDeterioro(0); layers.querySelector('input[data-k="entropia"]').checked = false; } estado.textContent = 'Neguentropía · el orden se mantiene a costa de energía del entorno'; }
    else { if (ngFlujo) { animarFlujo(false); ngFlujo = false; } estado.textContent = ''; btnNg.disabled = false; ngAnim = null; return; }
    ngAnim = requestAnimationFrame(step);
  });
}

// ===== ANIMACIÓN: homeostasis (día/noche → la refrigeración se regula; la temperatura no cambia) =====
let hoAnim = null;
const plumas = [1, 2, 3, 4].map(i => ROOT.getObjectByName(`calor_chiller_${i}`)).filter(Boolean);
const ventiladores = [1, 2, 3, 4].map(i => ROOT.getObjectByName(`chiller_${i}_ventilador`)).filter(Boolean);
const rejillas = [1, 2, 3].map(i => ROOT.getObjectByName(`crac_${i}_rejilla`)).filter(Boolean);
M.rejillaCarga = mat('rejilla_carga', 0xd4d4d7, 0.6, 0, { emissive: 0xb5d9fd, emissiveIntensity: 0 });
function cargaRefrigeracion(c) { // c 0..1
  plumas.forEach(p => { p.scale.set(0.6 + 0.6 * c, 0.35 + 1.4 * c, 0.6 + 0.6 * c); p.position.y = (p.userData.baseY || RY + 1.8) + 1.15 * (p.scale.y - 1); });
  M.heat.opacity = 0.08 + 0.42 * c;
  rejillas.forEach(r => { r.material = M.rejillaCarga; }); M.rejillaCarga.emissiveIntensity = 1.4 * c;
}
function animarHomeostasis() {
  if (hoAnim || enAnim) return; btnHo.disabled = true;
  const DUR = 16, CICLOS = 2, start = performance.now(); cielo.visible = true; const noche0 = modoNoche;
  hoAnim = requestAnimationFrame(function step(now) {
    const t = (now - start) / 1000, k = Math.min(t / DUR, 1);
    const fase = ((noche0 ? 0.5 : 0) + k * CICLOS) % 1; posCielo(fase);
    const nocheCont = 0.5 - 0.5 * Math.cos(fase * Math.PI * 2); mezclaLuz(nocheCont);
    const carga = 0.15 + 0.85 * (1 - nocheCont); cargaRefrigeracion(carga);
    ventiladores.forEach(v => v.rotation.y += 0.04 + 0.5 * carga);
    estado.textContent = `Homeóstasis · ${nocheCont < 0.5 ? 'día' : 'noche'} · refrigeración ${Math.round(carga * 100)} % · chips 20 °C`;
    if (t >= DUR + 1.5) { cielo.visible = false; setModo(modoNoche); plumas.forEach(p => { p.scale.set(1, 1, 1); p.position.y = p.userData.baseY || RY + 1.8; }); M.heat.opacity = 0.35; rejillas.forEach(r => r.material = M.grille); estado.textContent = ''; btnHo.disabled = false; hoAnim = null; return; }
    hoAnim = requestAnimationFrame(step);
  });
}

// ===== ANIMACIÓN: equilibrio (balanza entra/sale; perturbación y retorno amortiguado) =====
let eqAnim = null;
M.fiel = mat('fiel', 0xd4d4d7, 0.5, 0.3);
M.platoIn = mat('plato_entra', 0xeef6ff, 0.2, 0, { emissive: 0xb5d9fd, emissiveIntensity: 1.8 });
M.platoOut = mat('plato_sale', 0x94bce3, 0.2, 0, { emissive: 0x5980a6, emissiveIntensity: 1.8 });
const balanza = new THREE.Group(); balanza.name = 'balanza'; balanza.visible = false; balanza.position.set(HX, RY + 6.5, HZ); P.add(balanza);
const fiel = new THREE.Group(); fiel.name = 'balanza_fiel'; balanza.add(fiel);
box(fiel, 'balanza_barra', M.fiel, 12, 0.18, 0.18, 0, 0, 0);
box(fiel, 'balanza_brazo_entra', M.fiel, 0.08, 1.6, 0.08, -5.6, -0.8, 0); box(fiel, 'balanza_brazo_sale', M.fiel, 0.08, 1.6, 0.08, 5.6, -0.8, 0);
const platoIn = new THREE.Mesh(new THREE.SphereGeometry(0.9, 24, 16), M.platoIn); platoIn.name = 'balanza_plato_entra'; platoIn.position.set(-5.6, -2.0, 0); fiel.add(platoIn);
const platoOut = new THREE.Mesh(new THREE.SphereGeometry(0.9, 24, 16), M.platoOut); platoOut.name = 'balanza_plato_sale'; platoOut.position.set(5.6, -2.0, 0); fiel.add(platoOut);
box(balanza, 'balanza_pivote', M.deepSteel, 0.3, 2.2, 0.3, 0, -1.1, 0); box(balanza, 'balanza_base', M.deepSteel, 2.2, 0.15, 1.2, 0, -2.2, 0);
// rótulos ENTRA / SALE en canvas
const rotulo = (txt, x) => { const cv = document.createElement('canvas'); cv.width = 256; cv.height = 96; const c = cv.getContext('2d'); c.fillStyle = '#1d2d3d'; c.fillRect(0, 0, 256, 96); c.fillStyle = '#f2f2f3'; c.font = '600 64px "Barlow Condensed", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 128, 50); const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; const m = new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.7 }); const r = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1), m); r.name = `balanza_rotulo_${txt.toLowerCase()}`; r.position.set(x, 1.0, 0); fiel.add(r); return r; };
rotulo('ENTRA', -5.6); rotulo('SALE', 5.6);
function animarEquilibrio() {
  if (eqAnim || enAnim || hoAnim) return; btnEq.disabled = true;
  const cam = stage._camera, ctl = stage._controls; const p0 = cam.position.clone(), t0 = ctl.target.clone(), wasAuto = ctl.autoRotate;
  ctl.autoRotate = false; ctl.enabled = false;
  const foco = new THREE.Vector3(HX, RY + 3.5, HZ), pIn = new THREE.Vector3(HX + 14, RY + 10, HZ + 26);
  const ease = easeInOutCubic;
  const IN = 2.0, ESTABLE = 2.5, PERT = 2.0, COMP = 6.0, CIERRE = 1.5, OUT = 2.0;
  const T1 = IN, T2 = T1 + ESTABLE, T3 = T2 + PERT, T4 = T3 + COMP, T5 = T4 + CIERRE, T6 = T5 + OUT;
  const start = performance.now(); const flujoPropio = !cpxAnim; if (flujoPropio) animarFlujo(true);
  balanza.visible = true; const winBase = M.ventana.emissiveIntensity;
  eqAnim = requestAnimationFrame(function step(now) {
    const t = (now - start) / 1000; let entra = 1, sale = 1, temp = 20, ang = 0;
    if (t < T1) { const u = ease(t / IN); cam.position.lerpVectors(p0, pIn, u); ctl.target.lerpVectors(t0, foco, u); }
    else if (t < T2) { ang = 0.02 * Math.sin(t * 3); }
    else if (t < T3) { const u = ease((t - T2) / PERT); entra = 1 + 0.6 * u; sale = 1; temp = 20 + 4 * u; ang = -0.28 * u; M.ventana.emissiveIntensity = 1.6 + 1.2 * u; }
    else if (t < T4) { const u = (t - T3) / COMP; const amort = Math.exp(-3 * u) * Math.cos(u * Math.PI * 4); entra = 1.6 - 0.6 * Math.min(u * 1.5, 1); sale = 1 + 0.6 * Math.min(u * 2, 1) * (1 - Math.min(u * 1.5, 1)) + (1.6 - entra) * 0.5; temp = 20 + 4 * Math.max(amort, 0) * (1 - u); ang = -0.28 * amort; M.ventana.emissiveIntensity = 1.6 + 1.2 * (1 - Math.min(u * 1.5, 1)); }
    else if (t < T5) { ang = 0; M.ventana.emissiveIntensity = 1.6; }
    else if (t < T6) { const u = ease((t - T5) / OUT); cam.position.lerpVectors(pIn, p0, u); ctl.target.lerpVectors(foco, t0, u); }
    else { balanza.visible = false; if (flujoPropio) animarFlujo(false); cargaRefrigeracion(0.5); plumas.forEach(p => { p.scale.set(1, 1, 1); p.position.y = p.userData.baseY || RY + 1.8; }); M.heat.opacity = 0.35; rejillas.forEach(r => r.material = M.grille); termo.userData.pintarTemp(20); M.ventana.emissiveIntensity = winBase; cam.position.copy(p0); ctl.target.copy(t0); ctl.update(); ctl.enabled = true; ctl.autoRotate = wasAuto; estado.textContent = ''; btnEq.disabled = false; eqAnim = null; return; }
    fiel.rotation.z = ang; platoIn.scale.setScalar(0.7 + 0.3 * entra); platoOut.scale.setScalar(0.7 + 0.3 * sale);
    cargaRefrigeracion(Math.min(Math.max((sale - 0.6) / 1.0, 0), 1)); ventiladores.forEach(v => v.rotation.y += 0.05 + 0.4 * sale);
    const tInt = Math.round(temp); if (termo.userData.ultimo !== tInt) { termo.userData.ultimo = tInt; termo.userData.pintarTemp(tInt); }
    M.led.emissiveIntensity = ledBase.ei * (0.8 + 0.6 * (temp - 20) / 4);
    estado.textContent = t < T2 ? 'Equilibrio · entradas = salidas' : t < T3 ? `Equilibrio · perturbación: la demanda sube · entra ${Math.round(entra * 100)} % · sale ${Math.round(sale * 100)} % · chips ${tInt} °C` : t < T4 ? `Equilibrio · compensación · entra ${Math.round(entra * 100)} % · sale ${Math.round(sale * 100)} % · chips ${tInt} °C` : 'Equilibrio dinámico · entradas = salidas · chips 20 °C';
    ctl.update(); eqAnim = requestAnimationFrame(step);
  });
}

// ===== ANIMACIÓN: retroalimentación (sensor → NOC → actuador → efecto) =====
let rfAnim = null;
M.senal = mat('senal', 0xeef6ff, 0.2, 0, { emissive: 0xb5d9fd, emissiveIntensity: 2.6 });
M.caliente = mat('rack_caliente', 0x5980a6, 0.4, 0.3, { emissive: 0xc0392b, emissiveIntensity: 0 });
const COLOR_FRIO = new THREE.Color(0x5980a6), COLOR_CALOR = new THREE.Color(0xc0392b);
const pintarCalor = u => { M.caliente.color.copy(COLOR_FRIO).lerp(COLOR_CALOR, u); M.caliente.emissiveIntensity = 0.9 * u; };
M.pantallaAlerta = mat('pantalla_alerta', 0xb5d9fd, 0.4, 0, { emissive: 0xb5d9fd, emissiveIntensity: 0.6 });
const rackRf = ROOT.getObjectByName('rack_2_3'), gabRf = rackRf.getObjectByName('rack_2_3_gabinete'), sensorRf = filas[1].userData.sensor, pantallaRf = ROOT.getObjectByName('noc_pantalla_imagen'), cracRf = ROOT.getObjectByName('crac_1'), rejillaRf = ROOT.getObjectByName('crac_1_rejilla');
const pSensor = sensorRf.position.clone(), pNoc = new THREE.Vector3(NX, y0 + 1.55, NZ), pCrac = cracRf.position.clone().add(new THREE.Vector3(0, 1.1, 0.4));
const rutaMed = new THREE.CatmullRomCurve3([pSensor, new THREE.Vector3(pSensor.x, pSensor.y, HZ + HD / 2 - 0.3), pNoc], false, 'catmullrom', 0.1);
const rutaAct = new THREE.CatmullRomCurve3([pNoc, new THREE.Vector3(HX - HW / 2 + 0.6, fy + rackH + 0.9, HZ + HD / 2 - 0.3), new THREE.Vector3(HX - HW / 2 + 0.6, fy + rackH + 0.9, pCrac.z), pCrac], false, 'catmullrom', 0.1);
const senal = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), M.senal); senal.name = 'senal_retroalimentacion'; senal.visible = false; R.add(senal);
// Pantalla del NOC con texto
const nocCv = document.createElement('canvas'); nocCv.width = 256; nocCv.height = 128; const nocCtx = nocCv.getContext('2d');
const pintarNoc = (txt, alerta) => { nocCtx.fillStyle = alerta ? '#5980a6' : '#1d2d3d'; nocCtx.fillRect(0, 0, 256, 128); nocCtx.fillStyle = alerta ? '#f2f2f3' : '#b5d9fd'; nocCtx.font = '600 44px "Barlow Condensed", sans-serif'; nocCtx.textAlign = 'center'; nocCtx.textBaseline = 'middle'; nocCtx.fillText(txt, 128, 66); nocTex.needsUpdate = true; };
const nocTex = new THREE.CanvasTexture(nocCv); nocTex.colorSpace = THREE.SRGBColorSpace;
M.nocDisplay = Object.assign(new THREE.MeshStandardMaterial({ map: nocTex, emissive: 0xffffff, emissiveMap: nocTex, emissiveIntensity: 1.0, roughness: 0.4 }), { name: 'noc_display' });
function animarRetroalimentacion() {
  if (rfAnim || enAnim) return; btnRf.disabled = true;
  const cam = stage._camera, ctl = stage._controls; const p0 = cam.position.clone(), t0 = ctl.target.clone(), wasAuto = ctl.autoRotate;
  ctl.autoRotate = false; ctl.enabled = false;
  const foco = new THREE.Vector3(HX + 2, y0 + 2, HZ + 2), pIn = new THREE.Vector3(HX + 16, y0 + 12, HZ + 20);
  const techo = ['cubierta', 'uma_cubierta', 'uma_ventilador_1', 'uma_ventilador_2', 'chiller_1', 'chiller_2', 'chiller_3', 'chiller_4', 'chiller_1_ventilador', 'chiller_2_ventilador', 'chiller_3_ventilador', 'chiller_4_ventilador', 'noc_cubierta'].map(n => ROOT.getObjectByName(n)).filter(Boolean); const techoVis = techo.map(o => o.visible);
  const ease = easeInOutCubic;
  const gabMat = gabRf.material, pantMat = pantallaRf.material, rejMat = rejillaRf.material, sensMat = sensorRf.material;
  const IN = 2.0, CAL = 1.8, MED = 1.6, DEC = 1.2, ACT = 1.6, EFE = 2.5, OK = 1.2, OUT = 2.0;
  const T1 = IN, T2 = T1 + CAL, T3 = T2 + MED, T4 = T3 + DEC, T5 = T4 + ACT, T6 = T5 + EFE, T7 = T6 + OK, T8 = T7 + OUT;
  const start = performance.now(); pantallaRf.material = M.nocDisplay; pintarNoc('OK · 20 °C', false); gabRf.material = M.caliente; pintarCalor(0); sensorRf.material = M.senal.clone();
  rfAnim = requestAnimationFrame(function step(now) {
    const t = (now - start) / 1000; let temp = 20;
    if (t < T1) { const u = ease(t / IN); cam.position.lerpVectors(p0, pIn, u); ctl.target.lerpVectors(t0, foco, u); if (u > 0.6) techo.forEach(o => o.visible = false); estado.textContent = 'Retroalimentación · lazo sensor → NOC → actuador'; }
    else if (t < T2) { const u = (t - T1) / CAL; temp = 20 + 6 * u; pintarCalor(u); estado.textContent = `Retroalimentación · 1 perturbación: el rack 2‑3 se calienta · ${Math.round(temp)} °C`; }
    else if (t < T3) { const u = (t - T2) / MED; temp = 26; senal.visible = true; senal.position.copy(rutaMed.getPointAt(Math.min(u, 0.999))); sensorRf.material.emissiveIntensity = Math.floor(t * 8) % 2 ? 3 : 0.5; estado.textContent = 'Retroalimentación · 2 medición: el sensor envía la señal al NOC'; }
    else if (t < T4) { temp = 26; senal.visible = false; pintarNoc('T↑ 26 °C · +FRÍO', Math.floor(t * 6) % 2 === 0); estado.textContent = 'Retroalimentación · 3 decisión: el NOC ordena más refrigeración'; }
    else if (t < T5) { const u = (t - T4) / ACT; temp = 26; senal.visible = true; senal.position.copy(rutaAct.getPointAt(Math.min(u, 0.999))); pintarNoc('T↑ 26 °C · +FRÍO', true); estado.textContent = 'Retroalimentación · 4 acción: la orden llega al CRAC'; }
    else if (t < T6) { const u = (t - T5) / EFE; senal.visible = false; rejillaRf.material = M.rejillaCarga; M.rejillaCarga.emissiveIntensity = 1.6; temp = 26 - 6 * ease(u); pintarCalor(1 - ease(u)); plumas[0].scale.set(1.3, 1 + 1.2 * Math.sin(u * Math.PI), 1.3); estado.textContent = `Retroalimentación · 5 efecto: el rack se enfría · ${Math.round(temp)} °C`; }
    else if (t < T7) { const u = (t - T6) / OK; temp = 20; senal.visible = true; senal.position.copy(rutaMed.getPointAt(Math.min(u, 0.999))); M.rejillaCarga.emissiveIntensity = 0.6; if (u > 0.9) pintarNoc('OK · 20 °C', false); estado.textContent = 'Retroalimentación · 6 re‑medición: el sensor confirma 20 °C'; }
    else if (t < T8) { const u = ease((t - T7) / OUT); senal.visible = false; if (u > 0.4) techo.forEach((o, i) => o.visible = techoVis[i]); cam.position.lerpVectors(pIn, p0, u); ctl.target.lerpVectors(foco, t0, u); estado.textContent = 'Retroalimentación · lazo cerrado'; }
    else { techo.forEach((o, i) => o.visible = techoVis[i]); gabRf.material = gabMat; pantallaRf.material = pantMat; rejillaRf.material = rejMat; sensorRf.material = sensMat; plumas[0].scale.set(1, 1, 1); termo.userData.pintarTemp(20); cam.position.copy(p0); ctl.target.copy(t0); ctl.update(); ctl.enabled = true; ctl.autoRotate = wasAuto; estado.textContent = ''; btnRf.disabled = false; rfAnim = null; return; }
    const tInt = Math.round(temp); if (termo.userData.ultimo !== tInt) { termo.userData.ultimo = tInt; termo.userData.pintarTemp(tInt); }
    ctl.update(); rfAnim = requestAnimationFrame(step);
  });
}

// ===== ANIMACIÓN: recursividad (mismo diagrama a tres escalas) =====
let rcAnim = null;
const diagrama = new THREE.Group(); diagrama.name = 'diagrama_sistema'; diagrama.visible = false; ROOT.add(diagrama); diagrama.userData = { label: 'Recursividad', desc: 'Esquema del sistema' };
const rotuloLibre = (txt, esc = 1) => { const cv = document.createElement('canvas'); cv.width = 320; cv.height = 96; const c = cv.getContext('2d'); c.fillStyle = '#1d2d3d'; c.fillRect(0, 0, 320, 96); c.strokeStyle = '#94bce3'; c.lineWidth = 4; c.strokeRect(2, 2, 316, 92); c.fillStyle = '#f2f2f3'; c.font = '600 56px "Barlow Condensed", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 160, 50); const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false }); const r = new THREE.Mesh(new THREE.PlaneGeometry(3.2 * esc, 0.96 * esc), m); r.name = `rotulo_${txt.toLowerCase()}`; r.renderOrder = 10; diagrama.add(r); return r; };
const rotFront = rotuloLibre('FRONTERA'), rotIn = rotuloLibre('ENTRA'), rotProc = rotuloLibre('PROCESA'), rotOut = rotuloLibre('SALE'), rotReg = rotuloLibre('REGULA');
M.flecha = mat('flecha', 0xb5d9fd, 0.3, 0, { emissive: 0x94bce3, emissiveIntensity: 1.6, depthTest: false }); M.flecha.transparent = true;
const flechas = [0, 1, 2, 3].map(i => { const f = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1, 8), M.flecha); f.name = `flecha_${i + 1}`; f.renderOrder = 9; diagrama.add(f); return f; });
const colocarFlecha = (f, A, B, r) => { const len = A.distanceTo(B); f.geometry.dispose(); f.geometry = new THREE.CylinderGeometry(r, r, len, 8); f.position.copy(A.clone().add(B).multiplyScalar(0.5)); f.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()); };
// Escalas: cada una define el centro del sistema, su radio y qué objetos resaltar por rol
const escalas = [
  { nombre: 'Rack', foco: () => gabRf.getWorldPosition(new THREE.Vector3()), r: 1.4, cam: [1.6, 1.2, 3.2], roles: { frontera: /^rack_2_3_gabinete$/, entra: /^bandeja_cables_2$/, procesa: /^rack_2_3_servidor_\d$/, sale: /^rack_2_3_servidor_\d_led$/, regula: /^sensor_fila_2$/ } },
  { nombre: 'Datacenter', foco: () => new THREE.Vector3(HX, y0 + 2, HZ), r: 14, cam: [16, 14, 26], roles: { frontera: /^cerco_/, entra: /^(transformador$|acometida_electrica_1$|alimentador_ups$)/, procesa: /^rack_\d_\d_gabinete$/, sale: /^(chiller_\d$|calor_chiller_)/, regula: /^(noc$|sensor_fila_)/ } },
  { nombre: 'Ciudad', foco: () => new THREE.Vector3(0, 2, 0), r: 34, cam: [30, 34, 58], roles: { frontera: /^terreno$/, entra: /^(torre_at_.*|linea_at)$/, procesa: /^(sala_muro_|cubierta$|placa_sitio$)/, sale: /^(fibra_salida_datos|ciudad_)/, regula: /^estacion_meteo_/ } },
];
function ponerDiagrama(e) {
  const c = e.foco(), r = e.r, esc = r * 0.125; // ancho de rótulo ≈ 0.4·r, menor que el espaciado 0.75·r
  [rotFront, rotIn, rotProc, rotOut, rotReg].forEach(m => m.scale.setScalar(esc));
  rotFront.position.set(c.x, c.y + r * 0.95, c.z); rotIn.position.set(c.x - r * 0.75, c.y + r * 0.45, c.z); rotProc.position.set(c.x, c.y + r * 0.45, c.z); rotOut.position.set(c.x + r * 0.75, c.y + r * 0.45, c.z); rotReg.position.set(c.x, c.y - r * 0.05, c.z);
  const g = 0.012 * r + 0.005;
  colocarFlecha(flechas[0], rotIn.position.clone().add(new THREE.Vector3(r * 0.2, 0, 0)), rotProc.position.clone().add(new THREE.Vector3(-r * 0.2, 0, 0)), g);
  colocarFlecha(flechas[1], rotProc.position.clone().add(new THREE.Vector3(r * 0.2, 0, 0)), rotOut.position.clone().add(new THREE.Vector3(-r * 0.2, 0, 0)), g);
  colocarFlecha(flechas[2], rotOut.position.clone().add(new THREE.Vector3(0, -r * 0.1, 0)), rotReg.position.clone().add(new THREE.Vector3(r * 0.2, 0, 0)), g);
  colocarFlecha(flechas[3], rotReg.position.clone().add(new THREE.Vector3(-r * 0.2, 0, 0)), rotIn.position.clone().add(new THREE.Vector3(0, -r * 0.1, 0)), g);
  diagrama.children.forEach(m => { if (m.isMesh && m.geometry.type === 'PlaneGeometry') m.lookAt(stage._camera.position); });
}
const r0 = e => e.r;
function animarRecursividad() {
  if (rcAnim || enAnim) return; btnRc.disabled = true;
  const cam = stage._camera, ctl = stage._controls; const p0 = cam.position.clone(), t0 = ctl.target.clone(), wasAuto = ctl.autoRotate;
  ctl.autoRotate = false; ctl.enabled = false; const near0 = cam.near; cam.near = 0.05; cam.updateProjectionMatrix();
  const ease = easeInOutCubic;
  const MOVE = 2.0, HOLD = 3.2, start = performance.now();
  let etapa = 0, fase = 'move', tEt = start, pFrom = p0.clone(), tFrom = t0.clone(), hlOn = false;
  const todosRoles = e => n => Object.values(e.roles).some(rx => rx.test(n));
  rcAnim = requestAnimationFrame(function step(now) {
    const t = (now - tEt) / 1000;
    if (etapa >= escalas.length) { // regreso
      if (fase !== 'out') { fase = 'out'; tEt = now; pFrom = cam.position.clone(); tFrom = ctl.target.clone(); diagrama.visible = false; if (hlOn) { resaltarNombre(null, false); hlOn = false; } }
      const u = ease(Math.min(t / MOVE, 1)); cam.position.lerpVectors(pFrom, p0, u); ctl.target.lerpVectors(tFrom, t0, u); ctl.update(); estado.textContent = 'Recursividad · el mismo patrón a cada escala';
      if (t >= MOVE) { cam.near = near0; cam.updateProjectionMatrix(); ctl.enabled = true; ctl.autoRotate = wasAuto; estado.textContent = ''; btnRc.disabled = false; rcAnim = null; return; }
      rcAnim = requestAnimationFrame(step); return;
    }
    const e = escalas[etapa], foco = e.foco(), dir = new THREE.Vector3(...e.cam).normalize(), pCam = foco.clone().add(new THREE.Vector3(0, r0(e) * 0.45, 0)).add(dir.multiplyScalar(2.7 * e.r));
    if (fase === 'move') {
      const u = ease(Math.min(t / MOVE, 1)); cam.position.lerpVectors(pFrom, pCam, u); ctl.target.lerpVectors(tFrom, foco.clone().add(new THREE.Vector3(0, e.r * 0.45, 0)), u); ctl.update();
      if (hlOn) { resaltarNombre(null, false); hlOn = false; } diagrama.visible = false;
      estado.textContent = `Recursividad · escala ${etapa + 1}/3: ${e.nombre}`;
      if (t >= MOVE) { fase = 'hold'; tEt = now; resaltarNombre(todosRoles(e), true); hlOn = true; diagrama.visible = true; ponerDiagrama(e); }
    } else {
      ponerDiagrama(e); M.flecha.emissiveIntensity = 1.2 + 0.8 * Math.sin(t * 4);
      estado.textContent = `Recursividad · ${e.nombre}: frontera → entra → procesa → sale → regula`;
      if (t >= HOLD) { etapa++; fase = 'move'; tEt = now; pFrom = cam.position.clone(); tFrom = ctl.target.clone(); }
    }
    rcAnim = requestAnimationFrame(step);
  });
}

// ===== COMPLEMENTARIEDAD: fuentes complementarias en el entorno + hilos hacia lo que complementan =====
let cpAnim = null;
const complementos = new THREE.Group(); complementos.name = 'complementos'; complementos.visible = false; complementos.userData = { label: 'Complementariedad', desc: 'Fuente complementaria del entorno' }; E.add(complementos);
M.panel = mat('panel_solar', 0x1d2d3d, 0.3, 0.5, { emissive: 0x5980a6, emissiveIntensity: 0.25 });
M.hiloComp = mat('hilo_complemento', 0x94bce3, 0.3, 0, { emissive: 0x94bce3, emissiveIntensity: 1.2, transparent: true, opacity: 0.85 });
// 1) Central eléctrica junto a las torres AT
box(complementos, 'central_nave', M.concrete, 6, 3.5, 4, 30, 0.2 + 1.75, -22);
box(complementos, 'central_cubierta', M.deepSteel, 6.4, 0.15, 4.4, 30, 0.2 + 3.58, -22);
[28.5, 31.5].forEach((x, i) => cyl(complementos, `central_chimenea_${i + 1}`, M.grey, 0.45, 5, x, 0.2 + 3.5 + 2.5, -23, 24));
line(complementos, 'central_linea', M.ink, [30, 0.2 + 6, -22], [30, 8.7, -14], 0.03);
// 2) Parque solar (hilera de paneles inclinados)
for (let i = 0; i < 6; i++) { const p = box(complementos, `panel_solar_${i + 1}`, M.panel, 2.4, 0.08, 1.4, 22 + i * 2.6 - 6.5, 0.2 + 0.9, 12); p.rotation.x = -0.5; box(complementos, `panel_solar_${i + 1}_apoyo`, M.deepSteel, 0.1, 0.8, 0.1, 22 + i * 2.6 - 6.5, 0.2 + 0.4, 12.3); }
box(complementos, 'inversor_solar', M.deepSteel, 1.0, 1.2, 0.6, 31, 0.2 + 0.6, 12);
// 3) Satélite alto sobre el sitio + antena parabólica en la cubierta
const satelite = new THREE.Group(); satelite.name = 'satelite'; satelite.position.set(HX + 6, 30, HZ - 6); complementos.add(satelite);
box(satelite, 'satelite_cuerpo', M.concrete, 1.2, 1.2, 1.6, 0, 0, 0);
box(satelite, 'satelite_panel_1', M.panel, 4, 0.06, 1.2, -3, 0, 0); box(satelite, 'satelite_panel_2', M.panel, 4, 0.06, 1.2, 3, 0, 0);
const satAnt = new THREE.Mesh(new THREE.SphereGeometry(0.6, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.grey); satAnt.name = 'satelite_antena'; satAnt.position.set(0, -0.9, 0); satAnt.rotation.x = Math.PI; satelite.add(satAnt);
const antena = new THREE.Mesh(new THREE.SphereGeometry(0.75, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.paper); antena.name = 'antena_parabolica'; antena.position.set(HX + 4.2, RY + 0.72, HZ + 1.6); antena.rotation.x = -0.6; complementos.add(antena);
box(complementos, 'antena_parabolica_base', M.paper, 0.2, 0.55, 0.2, HX + 4.2, RY + 0.4, HZ + 1.6);
// 4) Pozo de agua junto al tanque
cyl(complementos, 'pozo_brocal', M.concrete, 1.0, 0.8, WX, y0 + 0.4, WZ + 4.5, 28);
cyl(complementos, 'pozo_bomba', M.deepSteel, 0.3, 1.2, WX, y0 + 1.4, WZ + 4.5, 16);
// Hilos fuente → elemento complementado
const hilosComp = [
  ['hilo_central_transformador', [30, 0.2 + 3.6, -22], [TX, y0 + 1.8, TZ]],
  ['hilo_solar_ups', [31, y0 + 1.2, 12], [UX, y0 + 1.6, UZ]],
  ['hilo_satelite_antena', [HX + 6, 29.1, HZ - 6], [HX + 4.2, RY + 1.1, HZ + 1.6]],
  ['hilo_antena_meetme', [HX + 4.2, RY + 0.72, HZ + 1.6], [MX, y0 + 1.8, MZ]],
  ['hilo_pozo_tanque', [WX, y0 + 1.6, WZ + 4.5], [WX, y0 + 1.6, WZ]],
].map(([n, a, b]) => { const h = line(complementos, n, M.hiloComp, a, b, 0.05); h.userData.curva = new THREE.LineCurve3(new THREE.Vector3(...a), new THREE.Vector3(...b)); return h; });
const pulsosComp = hilosComp.map((h, i) => { const p = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 10), M.pulsoDatos); p.name = `pulso_complemento_${i + 1}`; complementos.add(p); return p; });
function animarComplementariedad(on) {
  if (!on) { if (cpAnim) cancelAnimationFrame(cpAnim); cpAnim = null; complementos.visible = false; if (!enAnim && !anim) estado.textContent = ''; return; }
  if (cpAnim) return; complementos.visible = true; const start = performance.now();
  cpAnim = requestAnimationFrame(function step(now) {
    const t = (now - start) / 1000;
    pulsosComp.forEach((p, i) => { const u = (t * 0.25 + i * 0.2) % 1; hilosComp[i].userData.curva.getPointAt(u, p.position); });
    satelite.rotation.y = t * 0.15; satelite.position.y = 30 + Math.sin(t * 0.5) * 0.4;
    M.hiloComp.emissiveIntensity = 0.9 + 0.5 * Math.sin(t * 1.5);
    if (!anim && !enAnim) estado.textContent = 'Complementariedad · energía + solar + satélite + agua: ninguna fuente basta sola';
    cpAnim = requestAnimationFrame(step);
  });
}

// ===== ANIMACIÓN: multicausalidad (tres causas convergen en un efecto) =====
let mcAnim = null;
M.causa = mat('causa', 0xc0392b, 0.3, 0, { emissive: 0xc0392b, emissiveIntensity: 1.4, transparent: true, opacity: 0.9, depthTest: false });
const causas = new THREE.Group(); causas.name = 'causas'; causas.visible = false; causas.userData = { label: 'Multicausalidad', desc: 'Causa que converge en el efecto' }; ROOT.add(causas);
const efectoP = new THREE.Vector3(HX, fy + rackH + 0.3, HZ); // dentro de la sala, sobre los racks
const rotCausa = (txt, n) => { const cv = document.createElement('canvas'); cv.width = 384; cv.height = 96; const c = cv.getContext('2d'); c.fillStyle = '#1d2d3d'; c.fillRect(0, 0, 384, 96); c.strokeStyle = '#c0392b'; c.lineWidth = 4; c.strokeRect(2, 2, 380, 92); c.fillStyle = '#f2f2f3'; c.font = '600 48px "Barlow Condensed", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 192, 50); const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; const r = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.5), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false })); r.name = n; r.renderOrder = 10; causas.add(r); return r; };
const causaDefs = [
  { n: 'causa_sol', txt: 'SOL INTENSO', origen: () => sol.position.clone(), objs: () => [sol] },
  { n: 'causa_demanda', txt: 'PICO DE DEMANDA', origen: () => new THREE.Vector3(-27, 9, -13), objs: () => edificios },
  { n: 'causa_crac', txt: 'CRAC AVERIADO', origen: () => cracRf.position.clone().add(new THREE.Vector3(0, 1.6, 0)), objs: () => [cracRf, rejillaRf] },
];
causaDefs.forEach(d => { d.rot = rotCausa(d.txt, d.n + '_rotulo'); d.hilo = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1, 8), M.causa); d.hilo.name = d.n + '_hilo'; d.hilo.renderOrder = 9; causas.add(d.hilo); d.pulso = new THREE.Mesh(new THREE.SphereGeometry(0.35, 14, 10), M.causa); d.pulso.name = d.n + '_pulso'; d.pulso.renderOrder = 9; causas.add(d.pulso); });
const rotEfecto = rotCausa('EFECTO: SALA +6 °C', 'efecto_rotulo');
function animarMulticausalidad() {
  if (mcAnim || enAnim || hoAnim || rfAnim) return; btnMc.disabled = true;
  const cam = stage._camera, ctl = stage._controls; const p0 = cam.position.clone(), t0 = ctl.target.clone(), wasAuto = ctl.autoRotate; ctl.autoRotate = false; ctl.enabled = false;
  const foco = new THREE.Vector3(HX - 6, y0 + 2, HZ - 2), pIn = new THREE.Vector3(HX + 22, RY + 20, HZ + 40);
  const techoMc = ['cubierta', 'uma_cubierta', 'uma_ventilador_1', 'uma_ventilador_2', 'chiller_1', 'chiller_2', 'chiller_3', 'chiller_4', 'chiller_1_ventilador', 'chiller_2_ventilador', 'chiller_3_ventilador', 'chiller_4_ventilador', 'calor_chiller_1', 'calor_chiller_2', 'calor_chiller_3', 'calor_chiller_4', 'antena_parabolica', 'antena_parabolica_base'].map(n => ROOT.getObjectByName(n)).filter(Boolean); const techoMcVis = techoMc.map(o => o.visible);
  const ease = easeInOutCubic;
  const IN = 2.0, CAUSA = 1.6, CONV = 2.5, HOLD = 3.0, OUT = 2.0; const T1 = IN, T2 = T1 + CAUSA * 3, T3 = T2 + CONV, T4 = T3 + HOLD, T5 = T4 + OUT;
  const start = performance.now(); cielo.visible = true; posCielo(0.05); sol.position.set(HX - 14, RY + 9, HZ + 6); luna.visible = false;
  const hl = new Map(); const marcar = (objs, on) => objs.forEach(o => { if (!o.isMesh) return; if (on) { if (!hl.has(o)) hl.set(o, o.material); const m = hl.get(o).clone(); m.emissive = new THREE.Color(0xc0392b); m.emissiveIntensity = 0.9; o.material = m; } else if (hl.has(o)) o.material = hl.get(o); });
  const winBase = M.ventana.emissiveIntensity; causas.visible = true; causaDefs.forEach(d => { d.rot.visible = false; d.hilo.visible = false; d.pulso.visible = false; }); rotEfecto.visible = false;
  mcAnim = requestAnimationFrame(function step(now) {
    const t = (now - start) / 1000; let temp = 20;
    causas.children.forEach(m => { if (m.geometry.type === 'PlaneGeometry') m.lookAt(cam.position); });
    if (t < T1) { const u = ease(t / IN); cam.position.lerpVectors(p0, pIn, u); ctl.target.lerpVectors(t0, foco, u); if (u > 0.6) techoMc.forEach(o => o.visible = false); estado.textContent = 'Multicausalidad · un efecto, varias causas'; }
    else if (t < T2) { const i = Math.min(Math.floor((t - T1) / CAUSA), 2); causaDefs.forEach((d, j) => { if (j <= i) { d.rot.visible = true; const o = d.origen(); d.rot.position.copy(o).add(new THREE.Vector3(0, 2.2, 0)); marcar(d.objs(), true); } }); if (i >= 1) M.ventana.emissiveIntensity = 2.6; estado.textContent = `Multicausalidad · causa ${i + 1}/3: ${causaDefs[i].txt.toLowerCase()}`; }
    else if (t < T3) { const u = (t - T2) / CONV; causaDefs.forEach(d => { const o = d.origen(); const A = o, B = efectoP; d.hilo.visible = true; const len = A.distanceTo(B) * Math.min(u * 1.4, 1); d.hilo.scale.set(1, len, 1); d.hilo.position.copy(A.clone().lerp(B, Math.min(u * 1.4, 1) / 2)); d.hilo.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()); d.pulso.visible = true; d.pulso.position.copy(A.clone().lerp(B, Math.min(u * 1.4, 1))); }); temp = 20 + 6 * ease(u); estado.textContent = `Multicausalidad · las tres causas convergen · sala ${Math.round(temp)} °C`; }
    else if (t < T4) { temp = 26; rotEfecto.visible = true; rotEfecto.position.copy(efectoP).add(new THREE.Vector3(0, 1.6, 0)); M.causa.emissiveIntensity = 1.0 + 0.6 * Math.sin(t * 3); causaDefs.forEach(d => d.pulso.position.copy(efectoP)); estado.textContent = 'Multicausalidad · ninguna causa explica el efecto por sí sola'; }
    else if (t < T5) { const u = ease((t - T4) / OUT); if (u > 0.3) { causas.visible = false; marcar([...edificios, sol, cracRf, rejillaRf], false); M.ventana.emissiveIntensity = winBase; cielo.visible = false; techoMc.forEach((o, i) => o.visible = techoMcVis[i]); luna.visible = true; } temp = 26 - 6 * u; cam.position.lerpVectors(pIn, p0, u); ctl.target.lerpVectors(foco, t0, u); }
    else { causas.visible = false; marcar([...edificios, sol, cracRf, rejillaRf], false); M.ventana.emissiveIntensity = winBase; cielo.visible = false; techoMc.forEach((o, i) => o.visible = techoMcVis[i]); luna.visible = true;
      termo.userData.pintarTemp(20); cam.position.copy(p0); ctl.target.copy(t0); ctl.update(); ctl.enabled = true; ctl.autoRotate = wasAuto; estado.textContent = ''; btnMc.disabled = false; mcAnim = null; return; }
    const tInt = Math.round(temp); if (termo.userData.ultimo !== tInt) { termo.userData.ultimo = tInt; termo.userData.pintarTemp(tInt); }
    M.led.emissiveIntensity = ledBase.ei * (0.8 + 0.6 * (temp - 20) / 6);
    ctl.update(); mcAnim = requestAnimationFrame(step);
  });
}

// ===== UI: capas + selección =====
const layers = document.getElementById('layers'), sel = document.getElementById('sel');
// Los 19 principios de la TGS. `grupo` enlaza con un subsistema 3D cuando existe.
const principios = [
  ['Frontera', 'frontera'], ['Entorno', 'entorno'], ['Totalidad', null, 'totalidad'], ['Equifinalidad', null, 'enfriamiento'], ['Jerarquía', null, 'jerarquia'], ['Complejidad', null, 'complejidad'],
  ['Sinergia', null, 'sinergia'], ['Emergencia', null, 'emergencia'], ['Resiliencia', 'resiliencia'], ['Adaptabilidad', null, 'adaptabilidad'], ['Entropía', null, 'entropia'], ['Neguentropía', null, 'neguentropia'],
  ['Homeóstasis', null, 'homeostasis'], ['Equilibrio', null, 'equilibrio'], ['Retroalimentación', 'retroalimentacion'], ['Estructura', null, 'estructura'], ['Recursividad', null, 'recursividad'],
  ['Complementariedad', null, 'complementariedad'], ['Multicausalidad', null, 'multicausalidad'],
];
// Capas transversales: conjuntos de objetos que cruzan subsistemas
const CAPAS = {
  totalidad: {
    label: 'Totalidad',
    desc: 'El sistema completo con su frontera y su entorno: el datacenter y el ambiente en que está inmerso.',
    grupos: ['frontera', 'entorno', 'entradas', 'procesos', 'salidas', 'retroalimentacion', 'resiliencia'],
  },
  jerarquia: {
    label: 'Jerarquía',
    desc: 'Resalta los componentes que constituyen al datacenter como sistema (entradas, procesos, salidas, retroalimentación y resiliencia) frente a su frontera y entorno.',
    resaltar: ['entradas', 'procesos', 'salidas', 'retroalimentacion', 'resiliencia'],
    off: true, soloBoton: true,
  },
  complejidad: {
    label: 'Complejidad',
    desc: 'Crecimiento del sistema: la sala pasa de 2 a 6 filas de racks; más elementos y más interacciones entre ellos.',
    anim: true, off: true,
  },
  emergencia: {
    label: 'Emergencia',
    desc: 'Ningún rack, cable o chiller es un servicio; al interactuar emerge “la nube”: una propiedad nueva que llega a la ciudad y no existe en ninguna parte por separado.',
    emergencia: true, off: true,
  },
  sinergia: {
    label: 'Sinergia',
    desc: 'Flujo de energía y datos: entra por la red eléctrica y la fibra, sale como datos y calor. Todos los elementos trabajan en conjunto y el resultado supera la suma de las partes.',
    flujo: true, off: true,
  },
  adaptabilidad: {
    label: 'Adaptabilidad',
    desc: 'El sistema cambia su estructura ante el entorno: se eleva sobre una loma y la inundación no lo alcanza.',
    loma: true, off: true,
  },
  multicausalidad: {
    label: 'Multicausalidad',
    desc: 'Un mismo efecto (la sala se calienta) tiene varias causas simultáneas: sol intenso, pico de demanda de la ciudad y un CRAC averiado. Ninguna lo explica sola.',
    soloBoton: true,
  },
  complementariedad: {
    label: 'Complementariedad',
    desc: 'Fuentes distintas que se necesitan mutuamente: central eléctrica, parque solar, satélite y pozo de agua. Ninguna basta sola para que el datacenter funcione.',
    complemento: true, off: true,
  },
  recursividad: {
    label: 'Recursividad',
    desc: 'El mismo patrón de sistema (frontera, entra, procesa, sale, regula) se repite a cada escala: rack, datacenter y ciudad.',
    soloBoton: true,
  },
  estructura: {
    label: 'Estructura',
    desc: 'El armazón que sostiene y ordena al sistema: columnas, cubiertas, muros, piso técnico, bandejas y cerco.',
    estructura: /^(columna_|cubierta$|.*_cubierta$|sala_muro_|sala_antepecho_|piso_tecnico|placa_sitio|bandeja_cables_|cerco_.*_(poste|riel)|balanza_pivote|balanza_base|noc$|sala_ups$|sala_meet_me$|luminaria_\d+_poste)/,
    off: true,
  },
  equilibrio: {
    label: 'Equilibrio',
    desc: 'Equilibrio dinámico: lo que entra (energía, demanda) se compensa con lo que sale (calor, datos). Ante una perturbación el sistema oscila y vuelve a su punto estable.',
    soloBoton: true,
  },
  homeostasis: {
    label: 'Homeóstasis',
    desc: 'El sistema regula su interior ante los cambios del entorno: con el sol la refrigeración trabaja a tope; de noche merma. La temperatura de los chips se mantiene en 20 °C.',
    soloBoton: true,
  },
  neguentropia: {
    label: 'Neguentropía',
    desc: 'El sistema importa energía e información del entorno para contrarrestar el desorden: mantenimiento que devuelve las ruinas a su estado íntegro.',
    soloBoton: true,
  },
  entropia: {
    label: 'Entropía',
    desc: 'Sin energía ni mantenimiento el sistema tiende al desorden: con el paso del tiempo las instalaciones se deterioran hasta la ruina.',
    entropia: true, off: true,
  },
  enfriamiento: {
    label: 'Equifinalidad',
    desc: 'Los elementos que se encargan de disipar la carga térmica y mantener los chips bajo su umbral térmico (no más de 20°C) puede alcanzarse a través de diferentes trayectorias y métodos termodinámicos.',
    test: n => /^(chiller_|crac_|uma_cubierta|tanque_agua|tuberia_agua_|drenaje_agua|calor_chiller_)/.test(n),
  },
};
for (const [k, c] of Object.entries(CAPAS)) { c.objetos = []; if (c.test) ROOT.traverse(o => { if (o.isMesh && c.test(o.name)) { c.objetos.push(o); o.userData.capa = k; } }); }
// Resaltado por nombre: piezas que cumplen `test` en acento emisivo; el resto atenuado
const hlNombre = new Map();
function resaltarNombre(test, on) {
  if (!on) { hlNombre.forEach((m, o) => o.material = m); hlNombre.clear(); return; }
  ROOT.traverse(o => {
    if (!o.isMesh || !o.visible || /^(deco_|lluvia|inundacion|nube|pulso|hilo|rayo|calor_|generador_humo|sol|luna|senal|escombro|ventana)/.test(o.name)) return;
    if (!hlNombre.has(o)) hlNombre.set(o, o.material);
    const base = hlNombre.get(o), m = base.clone();
    if (test(o.name)) { m.color = new THREE.Color(0x94bce3); m.emissive = new THREE.Color(0x5980a6); m.emissiveIntensity = 0.9; }
    else { m.color = base.color.clone().lerp(new THREE.Color(0x2b2b2d), 0.6); if (m.emissive) m.emissiveIntensity = (m.emissiveIntensity || 0) * 0.15; if (m.transparent) m.opacity *= 0.5; }
    o.material = m;
  });
}
// Resaltado: clona materiales con emisión acento y atenua el resto
const hlCache = new Map();
function resaltar(grupos, on) {
  const dentro = new Set(grupos);
  ROOT.children.forEach(g => {
    const enfoque = dentro.has(g.name);
    g.traverse(o => {
      if (!o.isMesh) return;
      if (on) {
        if (!hlCache.has(o)) hlCache.set(o, o.material);
        const base = hlCache.get(o), m = base.clone();
        if (enfoque) { m.emissive = new THREE.Color(0x5980a6); m.emissiveIntensity = Math.max(m.emissiveIntensity || 0, 0.55); }
        else { m.color = base.color.clone().lerp(new THREE.Color(0x2b2b2d), 0.55); m.emissiveIntensity = (m.emissiveIntensity || 0) * 0.15; if (m.transparent) m.opacity *= 0.5; }
        o.material = m;
      } else if (hlCache.has(o)) { o.material = hlCache.get(o); }
    });
  });
  if (!on) hlCache.clear();
}
principios.forEach(([label, k, capa], i) => {
  const l = document.createElement('label'); l.className = 'row';
  const num = String(i + 1).padStart(2, '0');
  l.innerHTML = ((k || capa) && !(capa && CAPAS[capa].soloBoton))
    ? `<span class="lbl"><input type="checkbox" ${capa && CAPAS[capa].off ? '' : 'checked'} data-k="${k || capa}"><span class="k">${num}</span>${label}</span>`
    : `<span class="lbl"><span class="nocheck"></span><span class="k">${num}</span>${label}</span>`;
  if (k) l.querySelector('input').onchange = e => {
    if (k === 'frontera') { const on = e.target.checked; SUB.frontera.children.forEach(o => { if (/^(deco_)?(placa_sitio|placa_borde_|piso_baldosas|piso_edificio_deco)/.test(o.name)) return; o.visible = on; }); }
    else SUB[k].visible = e.target.checked;
  };
  if (capa && CAPAS[capa].soloBoton) { l.title = CAPAS[capa].desc; }
  else if (capa && CAPAS[capa].complemento) { l.title = CAPAS[capa].desc; l.querySelector('input').onchange = e => animarComplementariedad(e.target.checked); }
  else if (capa && CAPAS[capa].estructura) { l.title = CAPAS[capa].desc; l.querySelector('input').onchange = e => resaltarNombre(n => CAPAS[capa].estructura.test(n), e.target.checked); }
  else if (capa && CAPAS[capa].resaltar) { l.title = CAPAS[capa].desc; l.querySelector('input').onchange = e => resaltar(CAPAS[capa].resaltar, e.target.checked); }
  else if (capa && CAPAS[capa].entropia) { l.title = CAPAS[capa].desc; l.querySelector('input').onchange = e => { if (!enAnim) aplicarDeterioro(e.target.checked ? 1 : 0); }; }
  else if (capa && CAPAS[capa].loma) { l.title = CAPAS[capa].desc; l.querySelector('input').onchange = e => { if (!adAnim) elevarSitio(e.target.checked ? LOMA_H : 0); }; }
  else if (capa && CAPAS[capa].emergencia) { l.title = CAPAS[capa].desc; l.querySelector('input').onchange = e => { if (e.target.checked) { const cc = layers.querySelector('input[data-k="complejidad"]'); if (cc && !cc.checked) { cc.checked = true; mostrarFilas(rows); } } animarEmergencia(e.target.checked); }; }
  else if (capa && CAPAS[capa].flujo) { l.title = CAPAS[capa].desc; l.querySelector('input').onchange = e => animarFlujo(e.target.checked); }
  else if (capa && CAPAS[capa].anim) { l.title = CAPAS[capa].desc; l.querySelector('input').onchange = e => mostrarFilas(e.target.checked ? rows : filasIniciales); }
  else if (capa) { l.title = CAPAS[capa].desc; l.querySelector('input').onchange = e => { const on = e.target.checked; CAPAS[capa].objetos.forEach(o => o.visible = on); (CAPAS[capa].grupos || []).forEach(g => { SUB[g].visible = on; const cb = layers.querySelector(`input[data-k="${g}"]`); if (cb) cb.checked = on; }); }; }
  if (capa === 'complejidad') { const b = document.createElement('button'); b.className = 'btn-rayo'; b.id = 'btnCpx'; b.textContent = 'Crecer'; b.title = 'Zoom a la sala: las filas se duplican de 2 a 6'; b.onclick = ev => { ev.preventDefault(); animarComplejidad(); }; l.appendChild(b); }
  if (capa === 'jerarquia') { const b = document.createElement('button'); b.className = 'btn-rayo'; b.id = 'btnJer'; b.textContent = 'Anim'; b.title = 'Recorrido chip → blade → rack → sistema'; b.onclick = ev => { ev.preventDefault(); animarJerarquia(); }; l.appendChild(b); }
  if (capa === 'enfriamiento') { const b = document.createElement('button'); b.className = 'btn-rayo'; b.id = 'btnZoom'; b.textContent = 'Zoom'; b.title = 'Acercar al termómetro del servidor'; b.onclick = ev => { ev.preventDefault(); zoomTermometro(); }; l.appendChild(b); }
  if (k === 'entorno') { const b = document.createElement('button'); b.className = 'btn-rayo'; b.id = 'btnRayo'; b.textContent = 'Rayo'; b.title = 'Simular descarga sobre la red eléctrica'; b.onclick = ev => { ev.preventDefault(); simularRayo(); }; l.appendChild(b); }
  if (capa === 'adaptabilidad') { const b = document.createElement('button'); b.className = 'btn-rayo'; b.id = 'btnAd'; b.textContent = 'Inundar'; b.title = 'El sitio sube a una loma y la inundación no lo alcanza'; b.onclick = ev => { ev.preventDefault(); animarAdaptabilidad(); }; l.appendChild(b); }
  if (capa === 'entropia') { const b = document.createElement('button'); b.className = 'btn-rayo'; b.id = 'btnEn'; b.textContent = 'Tiempo'; b.title = 'Pasan días y noches; las instalaciones se deterioran hasta la ruina'; b.onclick = ev => { ev.preventDefault(); animarEntropia(); }; l.appendChild(b); }
  if (capa === 'neguentropia') { const b = document.createElement('button'); b.className = 'btn-rayo'; b.id = 'btnNg'; b.textContent = 'Reparar'; b.title = 'Con energía del entorno, el mantenimiento revierte las ruinas'; b.onclick = ev => { ev.preventDefault(); animarNeguentropia(); }; l.appendChild(b); }
  if (capa === 'homeostasis') { const b = document.createElement('button'); b.className = 'btn-rayo'; b.id = 'btnHo'; b.textContent = 'Ciclo'; b.title = 'Día y noche: la refrigeración se regula, la temperatura se mantiene'; b.onclick = ev => { ev.preventDefault(); animarHomeostasis(); }; l.appendChild(b); }
  if (capa === 'equilibrio') { const b = document.createElement('button'); b.className = 'btn-rayo'; b.id = 'btnEq'; b.textContent = 'Balanza'; b.title = 'Entradas y salidas se compensan; tras una perturbación el sistema vuelve al equilibrio'; b.onclick = ev => { ev.preventDefault(); animarEquilibrio(); }; l.appendChild(b); }
  if (capa === 'recursividad') { const b = document.createElement('button'); b.className = 'btn-rayo'; b.id = 'btnRc'; b.textContent = 'Escalas'; b.title = 'El mismo esquema de sistema en rack, datacenter y ciudad'; b.onclick = ev => { ev.preventDefault(); animarRecursividad(); }; l.appendChild(b); }
  if (capa === 'multicausalidad') { const b = document.createElement('button'); b.className = 'btn-rayo'; b.id = 'btnMc'; b.textContent = 'Causas'; b.title = 'Sol, demanda y un CRAC averiado convergen en un mismo efecto'; b.onclick = ev => { ev.preventDefault(); animarMulticausalidad(); }; l.appendChild(b); }
  if (k === 'retroalimentacion') { const b = document.createElement('button'); b.className = 'btn-rayo'; b.id = 'btnRf'; b.textContent = 'Lazo'; b.title = 'Sensor → NOC → CRAC → efecto medido de nuevo'; b.onclick = ev => { ev.preventDefault(); animarRetroalimentacion(); }; l.appendChild(b); }
  if (k === 'resiliencia') { const b = document.createElement('button'); b.className = 'btn-rayo'; b.id = 'btnRes'; b.textContent = 'Apagón'; b.title = 'Rayo: la calle se apaga; el datacenter vuelve con su planta'; b.onclick = ev => { ev.preventDefault(); simularRayo('resiliencia'); }; l.appendChild(b); }
  layers.appendChild(l);
});
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
let picked = null, savedMat = null;
stage.addEventListener('pointerdown', e => { ptr.dx = e.clientX; ptr.dy = e.clientY; });
stage.addEventListener('pointerup', e => {
  if (Math.hypot(e.clientX - ptr.dx, e.clientY - ptr.dy) > 4) return; // fue un arrastre
  const cam = stage._camera, rect = stage.getBoundingClientRect();
  ptr.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
  ray.setFromCamera(ptr, cam);
  const noPick = o => { for (let p = o; p && p !== ROOT; p = p.parent) if (!p.visible) return true; return o.isPoints || o.isLight || /^(deco_|lluvia|inundacion|nube|pulso|hilo|rayo|calor_|generador_humo|cielo|sol|luna)/.test(o.name) || (o.material && o.material.transparent && o.material.opacity < 0.05); };
  const hits = ray.intersectObjects(ROOT.children.filter(g => g.visible), true).filter(h => h.object.isMesh && !noPick(h.object));
  if (picked) { picked.material = savedMat; picked = null; }
  if (!hits.length) { sel.textContent = '—'; return; }
  const obj = hits[0].object;
  let sub = obj; while (sub.parent && sub.parent !== ROOT) sub = sub.parent;
  picked = obj; savedMat = obj.material;
  obj.material = savedMat.clone(); obj.material.emissive = new THREE.Color(0xb497cf); obj.material.emissiveIntensity = 0.95;
  sel.innerHTML = `<b>${obj.name}</b>${sub.userData.label} — ${sub.userData.desc}` + (obj.userData.capa ? `<br><br><b>${CAPAS[obj.userData.capa].label}</b>${CAPAS[obj.userData.capa].desc}` : '');
});
const btnRayo = document.getElementById('btnRayo'), btnMc = document.getElementById('btnMc'), btnRc = document.getElementById('btnRc'), btnRf = document.getElementById('btnRf'), btnEq = document.getElementById('btnEq'), btnHo = document.getElementById('btnHo'), btnNg = document.getElementById('btnNg'), btnEn = document.getElementById('btnEn'), btnAd = document.getElementById('btnAd'), btnRes = document.getElementById('btnRes'), btnZoom = document.getElementById('btnZoom'), btnJer = document.getElementById('btnJer'), btnCpx = document.getElementById('btnCpx');
// ===== Iluminación día / noche =====
let lampBase = 0, salaBase = 0, farolBase = 0;
function setModo(noche) {
  modoNoche = noche;
  (stage.closest('.dc-page') || document.body).classList.toggle('noche', noche);
  document.getElementById('mNoche').setAttribute('aria-pressed', noche); document.getElementById('mDia').setAttribute('aria-pressed', !noche);
  const bg = noche ? '#0a0a0a' : '#d8e6f2';
  stage.style.setProperty('--stage-bg', bg);
  stage.style.setProperty('--stage-note', noche ? '#c9b6df' : 'rgba(26, 25, 21, 0.5)');
  stage.style.setProperty('--stage-toolbar-bg', noche ? 'rgba(10, 10, 10, 0.78)' : 'rgba(255, 255, 255, 0.92)');
  stage.style.setProperty('--stage-toolbar-ink', noche ? '#f4f7ff' : '#2c4a64');
  stage.style.setProperty('--stage-toolbar-border', noche ? 'rgba(244, 247, 255, 0.14)' : 'rgba(29, 45, 61, 0.14)');
  stage._hemi.intensity = noche ? 0.38 : 0.95; stage._hemi.color.setHex(noche ? 0xb497cf : 0xe8f0f8); stage._hemi.groundColor.setHex(noche ? 0x0a0a0a : 0xc0ccd8);
  stage._key.intensity = noche ? 0.68 : 1.85; stage._key.color.setHex(noche ? 0xd7c6ea : 0xfff4ea);
  stage._fill.intensity = noche ? 0.2 : 0.52;
  if (stage._rim) { stage._rim.intensity = noche ? 0.18 : 0.32; stage._rim.color.setHex(0xd7c6ea); }
  lampBase = noche ? 80 : 0; salaBase = noche ? 120 : 0; farolBase = noche ? 75 : 0; M.farol.emissiveIntensity = noche ? 1.55 : 0.35; faroles.forEach(l => l.intensity = farolBase);
  ledBase.ei = noche ? 2.2 : 1.15; M.lampara.emissiveIntensity = noche ? 1.7 : 0.35;
  M.lampWarm.emissiveIntensity = noche ? 1.5 : 0.3; lucesNoc.forEach(l => l.intensity = noche ? 1.05 : 0.18);
  if (!anim) setLeds(true);
  if (entropiaK > 0) aplicarDeterioro(entropiaK);
}
document.getElementById('mDia').onclick = () => setModo(false);
document.getElementById('mNoche').onclick = () => setModo(true);
setModo(new URLSearchParams(location.search).has('dia') ? false : true);
window.datacenter = { root: ROOT, subsystems: SUB, materials: M, THREE, stage, simularRayo, setModo, zoomTermometro, animarJerarquia, animarComplejidad, animarFlujo, animarEmergencia, animarAdaptabilidad, animarEntropia, animarNeguentropia, animarHomeostasis, animarEquilibrio, animarRetroalimentacion, animarRecursividad, animarComplementariedad, animarMulticausalidad, aplicarDeterioro, elevarSitio, mostrarFilas };
}
