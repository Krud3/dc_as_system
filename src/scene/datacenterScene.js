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
import { PRINCIPIOS_TGS } from '../data/principiosTgs.js';

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
  filas, filasIniciales, rows, perRow, rackH, fy, zFila,
  lucesNoc, humo, lamparas, luzSala, luzGen,
  termo, bladeRef, rackRef, chipRef, ramRefs, ssdRef, dieRefs, cellRefs, sitioDr,
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
const guideEl = document.getElementById('anim-guide');
const guideNum = document.getElementById('anim-guide-num');
const guideName = document.getElementById('anim-guide-name');
const guideEvid = document.getElementById('anim-guide-evidencia');
const estado = document.getElementById('estado');
const padN = n => String(n).padStart(2, '0');
/** Abre la tarjeta de guía con datos de principiosTgs + estado vivo de la animación. */
function openGuide(n) {
  const p = PRINCIPIOS_TGS.find(x => x.n === n);
  if (!guideEl || !p) return;
  if (guideNum) guideNum.textContent = padN(p.n);
  if (guideName) guideName.textContent = p.nombre;
  if (guideEvid) guideEvid.textContent = p.ejemplo;
  if (estado) estado.textContent = p.aplicacion;
  guideEl.hidden = false;
  guideEl.classList.add('is-on');
}
function closeGuide() {
  if (estado) estado.textContent = '';
  if (guideEl) {
    guideEl.classList.remove('is-on');
    guideEl.hidden = true;
  }
}
const guideCloseBtn = document.getElementById('anim-guide-close');
if (guideCloseBtn) guideCloseBtn.addEventListener('click', ev => { ev.preventDefault(); closeGuide(); });
const setLeds = (on, k = 1) => { M.led.emissiveIntensity = on ? ledBase.ei * k : 0; M.led.color.copy(ledBase.color).multiplyScalar(on ? 1 : 0.35); M.ledGreen.emissiveIntensity = on ? ledGreenBase.ei * k : 0; M.lampara.emissiveIntensity = on ? 1.8 * k : 0; lamparas.forEach(l => l.intensity = on ? lampBase * k : 0); luzSala.intensity = on ? salaBase * k : 0; };
let calleOn = true;
const setCalle = on => { calleOn = on; M.farol.emissiveIntensity = on ? 1.6 : 0; faroles.forEach(l => l.intensity = on ? farolBase : 0); if (!on) M.ventana.emissiveIntensity = 0; };
const reset = () => { setLeds(true); setCalle(true); rayo.visible = false; M.rayo.opacity = 0; energia.linea.material = M.ink; energia.acom.forEach(l => l.material = M.ink); energia.gen.forEach(l => l.material = M.ink); humo.visible = false; M.humo.opacity = 0; M.genLed.emissive.setHex(0); luzGen.intensity = 0; };
const rnd = () => Math.random();
function simularRayo(modo = 'entorno') {
  if (anim) return; reset(); openGuide(modo === 'resiliencia' ? 9 : 2); const t0 = performance.now(); btnRayo.disabled = true; btnRes.disabled = true;
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

// ===== ANIMACIÓN: equifinalidad (A/B/C → mismo servicio disponible) =====
let eqfAnim = null;
const srvA = ROOT.getObjectByName('rack_2_4_servidor_3');
const srvB = ROOT.getObjectByName('rack_2_4_servidor_4');
const ledA = ROOT.getObjectByName('rack_2_4_servidor_3_led');
const ledB = ROOT.getObjectByName('rack_2_4_servidor_4_led');
const rackRepA = ROOT.getObjectByName('rack_2_4');
const rackRepB = ROOT.getObjectByName('rack_2_6');
const puertaEqf = ROOT.getObjectByName('deco_rack_2_4_puerta');
const puertaEqfB = ROOT.getObjectByName('deco_rack_2_6_puerta');
M.srvFail = mat('srv_fail', 0x3a3a3c, 0.8, 0.2, { emissive: 0xc0392b, emissiveIntensity: 0.35 });
M.srvOk = mat('srv_ok', 0x1d2d3d, 0.4, 0.2, { emissive: 0xb5d9fd, emissiveIntensity: 1.4 });
M.eqfPulso = mat('eqf_pulso', 0xeef6ff, 0.2, 0, { emissive: 0xb5d9fd, emissiveIntensity: 2.4 });
const eqfFx = new THREE.Group(); eqfFx.name = 'equifinalidad_fx'; eqfFx.visible = false; ROOT.add(eqfFx);
const eqfRotulo = (() => {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 160; const c = cv.getContext('2d');
  const pintar = (titulo, sub) => {
    c.clearRect(0, 0, 512, 160);
    c.fillStyle = 'rgba(13, 18, 24, 0.92)'; c.fillRect(0, 0, 512, 160);
    c.strokeStyle = '#94bce3'; c.lineWidth = 6; c.strokeRect(4, 4, 504, 152);
    c.fillStyle = '#b5d9fd'; c.font = '700 44px "Barlow Condensed", sans-serif';
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(titulo, 256, sub ? 58 : 80);
    if (sub) { c.fillStyle = '#f2f2f3'; c.font = '600 28px "Barlow Condensed", sans-serif'; c.fillText(sub, 256, 112); }
    tex.needsUpdate = true;
  };
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 1.5), m);
  mesh.name = 'eqf_servicio_disponible'; mesh.renderOrder = 20; mesh.visible = false; eqfFx.add(mesh);
  mesh.userData.pintar = pintar; pintar('SERVICIO', 'DISPONIBLE');
  return mesh;
})();
const eqfPulsos = new THREE.Group(); eqfPulsos.name = 'eqf_pulsos'; eqfFx.add(eqfPulsos);
function setEqfBtns(on) {
  const selEqf = document.getElementById('selEqf');
  if (selEqf) selEqf.disabled = !on;
}
function animarEquifinalidad(ruta) {
  if (eqfAnim || jerAnim || cpxAnim2) return;
  openGuide(4);
  const cam = stage._camera, ctl = stage._controls;
  const p0 = cam.position.clone(), t0 = ctl.target.clone(), wasAuto = ctl.autoRotate, near0 = cam.near;
  const wasDamp = lockScriptedCam(ctl);
  cam.near = 0.08; cam.updateProjectionMatrix();
  setEqfBtns(false);
  ROOT.updateMatrixWorld(true);
  const puertaVisA = puertaEqf ? puertaEqf.visible : null;
  const puertaVisB = puertaEqfB ? puertaEqfB.visible : null;
  if (puertaEqf) puertaEqf.visible = false;
  if (puertaEqfB) puertaEqfB.visible = false;
  const matCache = new Map();
  const saveMat = o => { if (o && o.isMesh && !matCache.has(o)) matCache.set(o, o.material); };
  [srvA, srvB, ledA, ledB].forEach(saveMat);
  const gabA = rackRepA?.getObjectByName('rack_2_4_gabinete');
  const gabB = rackRepB?.getObjectByName('rack_2_6_gabinete');
  [gabA, gabB].forEach(saveMat);
  sitioDr.traverse(o => { if (o.isMesh) saveMat(o); });
  const winBase = M.ventana.emissiveIntensity;
  const fSrv = srvB.getWorldPosition(new THREE.Vector3());
  const fRackA = gabA.getWorldPosition(new THREE.Vector3());
  const fRackB = gabB.getWorldPosition(new THREE.Vector3());
  const fDr = sitioDr.userData.foco.clone();
  const fSala = new THREE.Vector3(HX, y0 + 1.6, HZ);
  const fCiudad = new THREE.Vector3(-24, 3, -12);
  const ease = easeInOutCubic;
  const V = (a, b) => a.clone().add(b);
  const metas = {
    A: {
      titulo: 'Opción A · Redundancia de servidores',
      camIn: V(fSrv, new THREE.Vector3(0.55, 0.35, 1.8)),
      focoIn: fSrv.clone(),
    },
    B: {
      titulo: 'Opción B · Replicación',
      camIn: V(fRackA.clone().lerp(fRackB, 0.5), new THREE.Vector3(2.8, 2.2, 6.5)),
      focoIn: fRackA.clone().lerp(fRackB, 0.5),
    },
    C: {
      titulo: 'Opción C · Disaster Recovery',
      camIn: new THREE.Vector3(HX + 11, y0 + 8, HZ + 15),
      focoIn: new THREE.Vector3(HX, y0 + 1.4, HZ),
    },
  };
  const m = metas[ruta];

  // ——— Opción C: secuencia por etapas (principal → falla → DR → servicio) ———
  if (ruta === 'C') {
    SUB.resiliencia.visible = true;
    const cbRes = layers.querySelector('input[data-k="resiliencia"]');
    if (cbRes) cbRes.checked = true;
    sitioDr.visible = true;
    M.drLed.emissiveIntensity = 0;
    if (M.drBeacon) M.drBeacon.emissiveIntensity = 0;
    eqfFx.visible = true; eqfRotulo.visible = false; eqfPulsos.clear();

    const camMain = new THREE.Vector3(HX + 11, y0 + 8, HZ + 15);
    const focoMain = new THREE.Vector3(HX, y0 + 1.4, HZ);
    const camDr = fDr.clone().add(new THREE.Vector3(8.5, 5.5, 11));
    const focoDr = fDr.clone().add(new THREE.Vector3(0, 0.6, 0));
    const camOkC = fDr.clone().add(new THREE.Vector3(7, 5, 10));
    const focoOkC = fDr.clone().add(new THREE.Vector3(0, 1.2, 0));

    const rutaDr = new THREE.CatmullRomCurve3([
      fDr.clone().add(new THREE.Vector3(0, 2.2, 0)),
      new THREE.Vector3((fDr.x + fCiudad.x) / 2, 7, (fDr.z + fCiudad.z) / 2),
      fCiudad.clone().add(new THREE.Vector3(0, 2, 0)),
    ], false, 'catmullrom', 0.15);
    const bolas = [];
    for (let i = 0; i < 5; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 10), M.eqfPulso);
      b.name = `eqf_pulso_${i}`; b.userData.off = i / 5; b.visible = false; eqfPulsos.add(b); bolas.push(b);
    }

    const MOVE = 2.2, HOLD = 2.2, ease = easeInOutCubic;
    // 0 → principal, 1 → falla (mismo plano), 2 → pan al DR, 3 → activa, 4 → servicio, 5 → salida
    const etapas = [
      { cam: camMain, foco: focoMain, txt: 'Opción C · sitio principal del Data Center' },
      { cam: camMain, foco: focoMain, hold: true, fail: true, instant: true, txt: 'Falla el sitio principal · aquí se apaga el servicio' },
      { cam: camDr, foco: focoDr, txt: 'Disaster Recovery · la cámara va al sitio secundario' },
      { cam: camDr, foco: focoDr, hold: true, act: true, instant: true, txt: 'Sitio DR activo · asume la carga del servicio' },
      { cam: camOkC, foco: focoOkC, hold: true, ok: true, instant: true, txt: 'Equifinalidad · distinto camino → servicio disponible' },
      { cam: p0, foco: t0, out: true, txt: 'Equifinalidad · diferentes caminos, mismo resultado' },
    ];
    let etapa = 0, tEtapa = performance.now(), fase = 'move';
    let pFrom = p0.clone(), tFrom = t0.clone();
    const tmpP = new THREE.Vector3(), tmpT = new THREE.Vector3();

    const finishC = () => {
      matCache.forEach((mat0, o) => { o.material = mat0; });
      matCache.clear();
      eqfFx.visible = false; eqfRotulo.visible = false; eqfPulsos.clear();
      sitioDr.visible = false; M.drLed.emissiveIntensity = 0;
      if (M.drBeacon) M.drBeacon.emissiveIntensity = 0;
      M.ventana.emissiveIntensity = winBase;
      if (puertaEqf) puertaEqf.visible = puertaVisA;
      if (puertaEqfB) puertaEqfB.visible = puertaVisB;
      setLeds(true);
      unlockScriptedCam(ctl, { wasDamp, wasAuto, cam, near0, p0, t0 });
      setEqfBtns(true);
      eqfAnim = null;
    };

    const applyHoldFx = (e) => {
      if (e.fail) setLeds(false);
      if (e.act) {
        M.drLed.emissiveIntensity = 2.2;
        if (M.drBeacon) M.drBeacon.emissiveIntensity = 2.5;
        bolas.forEach(b => { b.visible = true; });
      }
      if (e.ok) {
        eqfRotulo.visible = true;
        eqfRotulo.userData.pintar('SERVICIO', 'DISPONIBLE');
        M.ventana.emissiveIntensity = 2.0;
      }
    };

    eqfAnim = requestAnimationFrame(function step(now) {
      const e = etapas[etapa], t = (now - tEtapa) / 1000;
      const moveDur = e.instant ? 0.05 : MOVE;
      if (fase === 'move') {
        const u = ease(Math.min(t / moveDur, 1));
        aimScriptedCam(cam, ctl, tmpP.lerpVectors(pFrom, e.cam, u), tmpT.lerpVectors(tFrom, e.foco, u));
        estado.textContent = e.txt;
        if (t >= moveDur) {
          if (e.out) { finishC(); return; }
          applyHoldFx(e);
          fase = 'hold'; tEtapa = now;
        }
      } else {
        aimScriptedCam(cam, ctl, e.cam, e.foco);
        if (e.fail) {
          setLeds(false);
          estado.textContent = e.txt;
        } else if (e.act) {
          M.drLed.emissiveIntensity = 1.4 + 0.9 * (0.5 + 0.5 * Math.sin(t * 7));
          if (M.drBeacon) M.drBeacon.emissiveIntensity = 1.6 + 1.2 * (0.5 + 0.5 * Math.sin(t * 5));
          bolas.forEach(b => {
            let uB = (b.userData.off + t * 0.35) % 1;
            b.position.copy(rutaDr.getPointAt(Math.min(Math.max(uB, 0.001), 0.999)));
            b.scale.setScalar(0.8 + 0.35 * Math.sin(uB * Math.PI));
          });
          estado.textContent = e.txt;
        } else if (e.ok) {
          eqfRotulo.visible = true;
          eqfRotulo.position.copy(fDr.clone().add(new THREE.Vector3(0, 4.2, 0)));
          eqfRotulo.quaternion.copy(cam.quaternion);
          eqfRotulo.scale.setScalar(0.85 + 0.15 * Math.min(t * 2, 1));
          M.drLed.emissiveIntensity = 2.2;
          if (M.drBeacon) M.drBeacon.emissiveIntensity = 2.4;
          bolas.forEach(b => {
            let uB = (b.userData.off + t * 0.3) % 1;
            b.position.copy(rutaDr.getPointAt(Math.min(Math.max(uB, 0.001), 0.999)));
          });
          M.ventana.emissiveIntensity = 1.6 + 0.6 * Math.sin(t * 4);
          estado.textContent = e.txt;
        } else {
          estado.textContent = e.txt;
        }
        if (t >= HOLD) {
          etapa++;
          if (etapa >= etapas.length) { finishC(); return; }
          fase = 'move'; tEtapa = now;
          pFrom = cam.position.clone(); tFrom = ctl.target.clone();
          if (etapas[etapa].out) eqfRotulo.visible = false;
        }
      }
      eqfAnim = requestAnimationFrame(step);
    });
    return;
  }

  // En A el zoom es muy cercano: al mostrar el letrero abrimos un poco el plano
  const camOk = ruta === 'A' ? V(fSrv, new THREE.Vector3(1.05, 0.7, 3.2)) : m.camIn.clone();
  const focoOk = ruta === 'A' ? fSrv.clone().add(new THREE.Vector3(0, 0.2, 0)) : m.focoIn.clone();
  const IN = 1.8, SHOW = 2.2, PROC = 1.6, OK = 2.8, OUT = 1.8;
  const T1 = IN, T2 = T1 + SHOW, T3 = T2 + PROC, T4 = T3 + OK, T5 = T4 + OUT;
  const start = performance.now();
  const tmpP = new THREE.Vector3(), tmpT = new THREE.Vector3();
  eqfFx.visible = true; eqfRotulo.visible = false; eqfPulsos.clear();
  sitioDr.visible = false;
  M.drLed.emissiveIntensity = 0;
  const rutaSync = new THREE.CatmullRomCurve3([
    fRackA.clone().add(new THREE.Vector3(0, 0.4, 0.5)),
    fRackA.clone().lerp(fRackB, 0.5).add(new THREE.Vector3(0, 1.2, 1.2)),
    fRackB.clone().add(new THREE.Vector3(0, 0.4, 0.5)),
  ], false, 'catmullrom', 0.2);
  const bolas = [];
  if (ruta === 'B') {
    for (let i = 0; i < 4; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), M.eqfPulso);
      b.name = `eqf_pulso_${i}`; b.userData.off = i / 4; eqfPulsos.add(b); bolas.push(b);
    }
  }
  const finish = () => {
    matCache.forEach((mat0, o) => { o.material = mat0; });
    matCache.clear();
    eqfFx.visible = false; eqfRotulo.visible = false; eqfPulsos.clear();
    sitioDr.visible = false; M.drLed.emissiveIntensity = 0;
    M.ventana.emissiveIntensity = winBase;
    if (puertaEqf) puertaEqf.visible = puertaVisA;
    if (puertaEqfB) puertaEqfB.visible = puertaVisB;
    setLeds(true);
    unlockScriptedCam(ctl, { wasDamp, wasAuto, cam, near0, p0, t0 });
    setEqfBtns(true);
    eqfAnim = null;
  };
  eqfAnim = requestAnimationFrame(function step(now) {
    const t = (now - start) / 1000;
    if (t < T1) {
      const u = ease(t / IN);
      aimScriptedCam(cam, ctl, tmpP.lerpVectors(p0, m.camIn, u), tmpT.lerpVectors(t0, m.focoIn, u));
      estado.textContent = 'Equifinalidad · el Data Center necesita mantener un servicio disponible';
    } else if (t < T2) {
      const u = (t - T1) / SHOW;
      aimScriptedCam(cam, ctl, m.camIn, m.focoIn);
      if (ruta === 'A') {
        const on = Math.floor(t * 5) % 2 === 0;
        if (srvA) srvA.material = on ? M.srvOk : matCache.get(srvA);
        if (srvB) srvB.material = on ? M.srvOk : matCache.get(srvB);
        if (ledA) ledA.material = M.srvOk;
        if (ledB) ledB.material = M.srvOk;
        estado.textContent = `${m.titulo} · dos servidores activos`;
      } else {
        if (gabA) gabA.material = M.srvOk;
        if (gabB) gabB.material = M.srvOk;
        bolas.forEach(b => {
          let uB = (b.userData.off + u * 1.4) % 1;
          b.position.copy(rutaSync.getPointAt(Math.min(Math.max(uB, 0.001), 0.999)));
        });
        estado.textContent = `${m.titulo} · datos sincronizados entre sistemas`;
      }
    } else if (t < T3) {
      if (ruta === 'A') {
        if (srvA) srvA.material = M.srvFail;
        if (ledA) ledA.material = M.srvFail;
        if (srvB) srvB.material = M.srvOk;
        if (ledB) ledB.material = M.srvOk;
        M.srvOk.emissiveIntensity = 0.6 + 1.2 * (0.5 + 0.5 * Math.sin(t * 10));
        estado.textContent = 'Estrategia elegida · un servidor falla · el otro continúa · procesamiento';
      } else {
        bolas.forEach(b => {
          let uB = (b.userData.off + t * 0.55) % 1;
          b.position.copy(rutaSync.getPointAt(Math.min(Math.max(uB, 0.001), 0.999)));
          b.scale.setScalar(0.7 + 0.4 * Math.sin(uB * Math.PI));
        });
        estado.textContent = 'Estrategia elegida · réplica activa · procesamiento';
      }
    } else if (t < T4) {
      const u = (t - T3) / OK;
      if (ruta === 'A') {
        const uCam = ease(Math.min(u * 1.4, 1));
        aimScriptedCam(cam, ctl, tmpP.lerpVectors(m.camIn, camOk, uCam), tmpT.lerpVectors(m.focoIn, focoOk, uCam));
      }
      eqfRotulo.visible = true;
      eqfRotulo.userData.pintar('SERVICIO', 'DISPONIBLE');
      const posLabel = ruta === 'A'
        ? fSrv.clone().add(new THREE.Vector3(0.25, 0.55, 0.85))
        : m.focoIn.clone().add(new THREE.Vector3(0, 2.6, 0));
      const labelScale = ruta === 'A'
        ? 0.28 + 0.1 * ease(Math.min(u * 2, 1))
        : 0.55 + 0.45 * ease(Math.min(u * 2, 1));
      eqfRotulo.position.copy(posLabel);
      eqfRotulo.quaternion.copy(cam.quaternion);
      eqfRotulo.scale.setScalar(labelScale);
      M.ventana.emissiveIntensity = 1.4 + 0.8 * Math.sin(t * 4);
      if (ruta === 'A') {
        if (srvA) srvA.material = M.srvFail;
        if (ledA) ledA.material = M.srvFail;
        if (srvB) srvB.material = M.srvOk;
        if (ledB) ledB.material = M.srvOk;
      } else {
        bolas.forEach(b => {
          let uB = (b.userData.off + t * 0.4) % 1;
          b.position.copy(rutaSync.getPointAt(Math.min(Math.max(uB, 0.001), 0.999)));
        });
      }
      estado.textContent = 'Equifinalidad · distintas estrategias → mismo estado final: servicio disponible';
    } else if (t < T5) {
      const u = ease((t - T4) / OUT);
      eqfRotulo.visible = u < 0.55;
      aimScriptedCam(cam, ctl, tmpP.lerpVectors(camOk, p0, u), tmpT.lerpVectors(focoOk, t0, u));
      estado.textContent = 'Equifinalidad · diferentes caminos, mismo resultado';
    } else {
      finish();
      return;
    }
    eqfAnim = requestAnimationFrame(step);
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
  if (jerAnim || eqfAnim) return;
  openGuide(5);
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
    M.heat.opacity = 0.35; M.genLed.emissive.setHex(0); luzGen.intensity = 0; if (!anim) setLeds(true); return;
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

// ===== ANIMACIÓN: complejidad (componentes e interacciones que se incorporan) =====
let cpxAnim2 = null, filasVisibles = filasIniciales;
function mostrarFilas(n) { filasVisibles = n; filas.forEach((f, i) => { f.visible = i < n; f.scale.set(1, 1, 1); if (f.userData.sensor) f.userData.sensor.visible = i < n; }); ciudadNueva.forEach(b => { b.visible = n > filasIniciales; b.scale.set(1, 1, 1); b.position.y = 0.2 + b.userData.h / 2; }); if (typeof sincronizarCiudad === 'function') sincronizarCiudad(); }
function animarComplejidad() {
  if (cpxAnim2 || jerAnim || eqfAnim) return;
  openGuide(6);
  const cam = stage._camera, ctl = stage._controls;
  const p0 = cam.position.clone(), t0 = ctl.target.clone(), wasAuto = ctl.autoRotate, near0 = cam.near;
  const wasDamp = lockScriptedCam(ctl);
  btnCpx.disabled = true;
  cam.near = 0.1; cam.updateProjectionMatrix();
  ROOT.updateMatrixWorld(true);

  const techo = [];
  ROOT.traverse(o => { if (/^(cubierta|uma_cubierta|uma_ventilador|uma_rejilla|uma_aro|estacion_meteo|meteo_panel|meteo_veleta|deco_(cubierta|uma_|meteo_|anemo_))/.test(o.name)) techo.push(o); });
  const techoVis = techo.map(o => o.visible);
  techo.forEach(o => { o.visible = false; });
  const puertasVis = estPuertas.map(p => p.visible);
  estPuertas.forEach(p => { p.visible = false; });
  const tabiquesNoc = [];
  ROOT.traverse(o => { if (/^(tabique_3|tabique_4)$/.test(o.name)) tabiquesNoc.push(o); });
  const tabiquesVis = tabiquesNoc.map(o => o.visible);
  tabiquesNoc.forEach(o => { o.visible = false; });

  const pick = (test) => {
    const out = [];
    ROOT.traverse(o => {
      if (!o.isMesh || !o.visible) return;
      if (/^(deco_rack_.*_puerta|lluvia|inundacion|nube|pulso|hilo|rayo|calor_|generador_humo|humo_emergencia|cielo|sol|luna|eqf_|est_|ventana|complejidad_)/.test(o.name)) return;
      if (test(o.name)) out.push(o);
    });
    return out;
  };
  const visInFila = o => o.visible && o.parent && o.parent.parent && o.parent.parent.visible;
  const servidores = estPartes.servidores.filter(visInFila);
  const switches = estPartes.switches.filter(visInFila);
  const almacenamiento = pick(n => /ssd|banco_baterias|ups_rojo_bat/.test(n));
  const energia = [
    ...estPartes.energia.filter(visInFila),
    ...pick(n => /^(sala_ups|ups_extra|ups_puerta|ups_display|ups_sticker|ups_zocalo|ups_rojo_bastidor|transformador|acometida|alimentador|generador$|poste_acometida|bus_electrico|pdu_azul)/.test(n) || /_power|_pdu|_power_base/.test(n)),
  ];
  const refrigeracion = [
    ...estPartes.cracs.filter(o => o.visible),
    ...pick(n => /^(crac_|chiller_|calor_chiller)/.test(n)),
  ];
  const red = [
    ...estPartes.red.filter(visInFila),
    ...estPartes.bandejas.filter(o => o.visible && o.parent && o.parent.visible),
  ];
  const noc = [];
  const nocRoot = ROOT.getObjectByName('noc');
  if (nocRoot) nocRoot.traverse(o => { if (o.isMesh && o.visible) noc.push(o); });
  pick(n => /^(noc_|deco_noc|bus_monitoreo_noc)/.test(n)).forEach(o => { if (!noc.includes(o)) noc.push(o); });

  const ocultar = [...new Set([...servidores, ...switches, ...almacenamiento, ...energia, ...refrigeracion, ...red, ...noc])];
  const vis0 = new Map();
  ocultar.forEach(o => { vis0.set(o, o.visible); o.visible = false; });

  const cpxLinks = new THREE.Group(); cpxLinks.name = 'complejidad_links'; cpxLinks.visible = false; ROOT.add(cpxLinks);
  const linkMat = (M.hilo ? M.hilo.clone() : M.cableOn.clone());
  if (linkMat.transparent !== undefined) { linkMat.transparent = true; linkMat.opacity = 0.95; }
  const addLink = (a, b) => {
    if (!a || !b) return;
    const pa = a.getWorldPosition(new THREE.Vector3());
    const pb = b.getWorldPosition(new THREE.Vector3());
    if (pa.distanceTo(pb) < 0.4) return;
    const mid = pa.clone().lerp(pb, 0.5);
    mid.y += 0.45 + pa.distanceTo(pb) * 0.1;
    const cv = new THREE.QuadraticBezierCurve3(pa, mid, pb);
    const h = new THREE.Mesh(new THREE.TubeGeometry(cv, 14, 0.03, 6), linkMat);
    h.name = 'complejidad_link'; cpxLinks.add(h);
  };
  const rep = (list) => list.find(o => o && o.visible) || list[0];
  const buildLinks = () => {
    cpxLinks.clear();
    const nodes = [rep(servidores), rep(switches), rep(almacenamiento), rep(energia), rep(refrigeracion), rep(noc)].filter(Boolean);
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) addLink(nodes[i], nodes[j]);
    const srvVis = servidores.filter(o => o.visible).slice(0, 6);
    const swVis = switches.filter(o => o.visible).slice(0, 6);
    srvVis.forEach((s, i) => { if (swVis[i]) addLink(s, swVis[i]); });
    if (srvVis.length) red.filter(o => o.visible).slice(0, 8).forEach((r, i) => addLink(r, srvVis[i % srvVis.length]));
  };

  const cpxHlMats = new Map();
  const cpxClearHl = () => {
    cpxHlMats.forEach(prev => {
      const mat = prev.mat;
      if (!mat) return;
      if (prev.emissive) { mat.emissive.copy(prev.emissive); mat.emissiveIntensity = prev.ei; }
      else if (mat.emissive) { mat.emissive.setHex(0x000000); mat.emissiveIntensity = 0; }
    });
    cpxHlMats.clear();
  };
  const cpxHighlight = (objs) => {
    cpxClearHl();
    if (!objs || !objs.length) return;
    objs.forEach(o => {
      if (!o || !o.isMesh || !o.visible || !o.material || Array.isArray(o.material)) return;
      const mat = o.material;
      if (cpxHlMats.has(mat.uuid)) return;
      cpxHlMats.set(mat.uuid, { mat, emissive: mat.emissive ? mat.emissive.clone() : null, ei: mat.emissiveIntensity || 0 });
      if (!mat.emissive) mat.emissive = new THREE.Color(0x000000);
      mat.emissive.setHex(0xb497cf);
      mat.emissiveIntensity = Math.max(mat.emissiveIntensity || 0, 0.35) + 0.9;
    });
  };
  const show = (list) => { list.forEach(o => { o.visible = true; }); };

  const focoSala = new THREE.Vector3(HX, fy + 1.1, HZ);
  const camSala = new THREE.Vector3(HX + 10, y0 + 4.5, HZ + HD / 2 + 8);
  const camSrv = new THREE.Vector3(HX + 4.5, fy + 2.4, HZ + HD / 2 + 4.2);
  const focoSrv = new THREE.Vector3(HX, fy + 1.0, zFila(0));
  const camSw = new THREE.Vector3(HX + 3.2, fy + 3.0, HZ + HD / 2 + 3.6);
  const focoSw = new THREE.Vector3(HX, fy + rackH * 0.75, zFila(0));
  const ups = ROOT.getObjectByName('sala_ups') || ROOT.getObjectByName('ups_extra_0') || ROOT.getObjectByName('banco_baterias_1');
  const fUps = ups ? ups.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(HX - 6, fy + 1, HZ);
  const camAlm = fUps.clone().add(new THREE.Vector3(5, 3.2, 6));
  const focoAlm = fUps.clone().add(new THREE.Vector3(0, 0.8, 0));
  const camElec = fUps.clone().add(new THREE.Vector3(7, 4.2, 8));
  const focoElec = fUps.clone().lerp(focoSala, 0.35);
  const crac = ROOT.getObjectByName('crac_1');
  const fCrac = crac ? crac.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(HX - 4, fy + 1, HZ - HD / 2);
  const camFrio = fCrac.clone().add(new THREE.Vector3(5, 3.5, 7));
  const focoFrio = fCrac.clone().lerp(focoSala, 0.4);
  const camNoc = new THREE.Vector3(NX + 1.7, y0 + 4.8, NZ + 8.5);
  const focoNoc = new THREE.Vector3(NX + 1.7, y0 + 0.9, NZ - 0.2);
  const camTodo = new THREE.Vector3(HX + 12, y0 + 5.5, HZ + HD / 2 + 10);
  const focoTodo = new THREE.Vector3(HX, fy + 1.3, HZ);

  const ease = easeInOutCubic;
  const MOVE = 1.45, HOLD = 1.55, HOLD_LINKS = 2.6;
  let acumulado = [];
  const etapas = [
    { cam: camSala, foco: focoSala, txt: 'Complejidad · el Data Center y sus componentes', reveal: null },
    { cam: camSrv, foco: focoSrv, txt: 'Complejidad · aparecen los servidores', reveal: () => { show(servidores); acumulado = [...servidores]; } },
    { cam: camSw, foco: focoSw, txt: 'Complejidad · se incorporan los switches', reveal: () => { show(switches); acumulado = [...acumulado, ...switches]; } },
    { cam: camAlm, foco: focoAlm, txt: 'Complejidad · se conectan los sistemas de almacenamiento', reveal: () => { show(almacenamiento); acumulado = [...acumulado, ...almacenamiento]; } },
    { cam: camElec, foco: focoElec, txt: 'Complejidad · se incorpora la UPS y la energía', reveal: () => { show(energia); acumulado = [...acumulado, ...energia]; } },
    { cam: camFrio, foco: focoFrio, txt: 'Complejidad · se incorpora la refrigeración', reveal: () => { show(refrigeracion); acumulado = [...acumulado, ...refrigeracion]; } },
    { cam: camNoc, foco: focoNoc, txt: 'Complejidad · se muestra el NOC / monitoreo', reveal: () => { show(noc); acumulado = [...acumulado, ...noc]; } },
    { cam: camTodo, foco: focoTodo, txt: 'Complejidad · más elementos y más relaciones entre ellos', links: true, reveal: () => {
      show(red); acumulado = [...new Set([...acumulado, ...red])];
      ROOT.updateMatrixWorld(true);
      buildLinks(); cpxLinks.visible = true;
    } },
    { cam: p0, foco: t0, txt: 'Complejidad · mayor complejidad del sistema', out: true },
  ];

  let etapa = 0, tEtapa = performance.now(), fase = 'move';
  let pFrom = p0.clone(), tFrom = t0.clone();
  const tmpP = new THREE.Vector3(), tmpT = new THREE.Vector3();
  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    if (cpxAnim2) cancelAnimationFrame(cpxAnim2);
    cpxAnim2 = null;
    try { cpxClearHl(); } catch (_) { /* ignore */ }
    ocultar.forEach(o => { o.visible = vis0.has(o) ? vis0.get(o) : true; });
    cpxLinks.traverse(o => { if (o.geometry) o.geometry.dispose(); });
    ROOT.remove(cpxLinks);
    estPuertas.forEach((p, i) => { p.visible = puertasVis[i]; });
    techo.forEach((o, i) => { o.visible = techoVis[i]; });
    tabiquesNoc.forEach((o, i) => { o.visible = tabiquesVis[i]; });
    unlockScriptedCam(ctl, { wasDamp, wasAuto, cam, near0, p0, t0 });
    btnCpx.disabled = false;
  };

  cpxAnim2 = requestAnimationFrame(function step(now) {
    if (finished) return;
    const e = etapas[etapa];
    if (!e) { finish(); return; }
    const t = (now - tEtapa) / 1000;
    if (fase === 'move') {
      const u = ease(Math.min(t / MOVE, 1));
      aimScriptedCam(cam, ctl, tmpP.lerpVectors(pFrom, e.cam, u), tmpT.lerpVectors(tFrom, e.foco, u));
      estado.textContent = e.txt;
      if (t >= MOVE) {
        if (e.out) { finish(); return; }
        if (e.reveal) e.reveal();
        cpxHighlight(acumulado);
        if (e.links && linkMat.emissive) linkMat.emissiveIntensity = 1.6;
        fase = 'hold';
        tEtapa = performance.now();
      }
    } else {
      aimScriptedCam(cam, ctl, e.cam, e.foco);
      estado.textContent = e.txt;
      if (e.links && linkMat.emissive) {
        const ritmo = 0.5 + 0.5 * Math.sin(t * 3.2);
        linkMat.emissiveIntensity = 1.2 + 1.2 * ritmo;
      }
      const holdT = e.links ? HOLD_LINKS : HOLD;
      if (t >= holdT) {
        etapa++;
        if (etapa >= etapas.length) { finish(); return; }
        fase = 'move';
        tEtapa = performance.now();
        pFrom = cam.position.clone();
        tFrom = ctl.target.clone();
      }
    }
    cpxAnim2 = requestAnimationFrame(step);
  });
}

// ===== ANIMACIÓN: emergencia (interacción → humo interior → nube) =====
let emAnim = null;
M.hilo = mat('hilo', 0xb5d9fd, 0.3, 0, { emissive: 0x94bce3, emissiveIntensity: 1.5, transparent: true, opacity: 0.9 });
M.ventana = mat('ventana', 0xb5d9fd, 0.4, 0, { emissive: 0xb5d9fd, emissiveIntensity: 0, transparent: true, opacity: 0.95 });
M.humoEmerg = mat('humo_emergencia', 0x7a7a7e, 1, 0, { transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
M.nube = mat('nube', 0x8e9399, 0.85, 0.02, { emissive: 0x6e7378, emissiveIntensity: 0.08, transparent: true, opacity: 0, depthWrite: false });
M.nubeBorde = mat('nube_borde', 0x6a6e74, 0.7, 0.04, { emissive: 0x55595e, emissiveIntensity: 0.1, transparent: true, opacity: 0, depthWrite: false });
const emergente = new THREE.Group(); emergente.name = 'emergencia'; emergente.visible = false; emergente.userData = { label: 'Emergencia', desc: 'Condición nueva que surge de la interacción del conjunto' }; ROOT.add(emergente);
// Ventanas de ciudad (otras animaciones las usan vía M.ventana / edificios)
const edificios = []; E.traverse(o => { if (o.isMesh && /^ciudad_/.test(o.name)) edificios.push(o); });
edificios.forEach((b, i) => { const p = b.geometry.parameters; for (let f = 0; f < Math.floor(p.height / 1.4); f++) for (let c = 0; c < 2; c++) {
  const w = box(emergente, `ventana_${i + 1}_${f + 1}_${c + 1}`, M.ventana, 0.5, 0.6, 0.02, b.position.x - p.width / 4 + c * p.width / 2, 0.2 + 0.9 + f * 1.4, b.position.z + p.depth / 2 + 0.02); w.userData.edificio = b; } });
// Hilos: interacción entre racks (aleatorios, breves)
const hilosRack = new THREE.Group(); hilosRack.name = 'hilos_interaccion'; emergente.add(hilosRack);
// Humo pequeño dentro de la sala (sobre pasillos entre racks)
const humoSala = new THREE.Group(); humoSala.name = 'humo_emergencia'; emergente.add(humoSala);
[
  [HX - 0.8, fy + rackH + 0.15, HZ - 0.35, 0.35, 0.55, 0.32],
  [HX + 0.9, fy + rackH + 0.2, HZ + 0.45, 0.4, 0.65, 0.36],
  [HX + 0.1, fy + rackH + 0.35, HZ - 0.9, 0.3, 0.5, 0.28],
].forEach(([x, y, z, sx, sy, sz], i) => {
  const s = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), M.humoEmerg);
  s.name = `humo_emergencia_${i + 1}`;
  s.scale.set(sx, sy, sz);
  s.position.set(x, y, z);
  s.userData.base = s.position.clone();
  s.userData.baseScale = new THREE.Vector3(sx, sy, sz);
  s.userData.phase = i * 0.9;
  humoSala.add(s);
});
// Nube exterior: el humo interior se acumula y forma la nube sobre el edificio
const nubeC = new THREE.Vector3(HX, RY + 5.4, HZ);
const nube = new THREE.Group(); nube.name = 'nube'; emergente.add(nube);
nube.position.copy(nubeC);
const addNubeLobulo = (name, matRef, rx, ry, rz, x, y, z) => {
  const s = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), matRef);
  s.name = name; s.scale.set(rx, ry, rz); s.position.set(x, y, z); nube.add(s); return s;
};
[
  ['nube_base', M.nube, 4.2, 1.55, 2.4, 0, 0, 0],
  ['nube_lob_izq', M.nube, 2.1, 1.9, 2.0, -2.6, 0.55, 0.15],
  ['nube_lob_cen', M.nube, 2.6, 2.35, 2.2, 0.1, 1.15, -0.1],
  ['nube_lob_der', M.nube, 2.2, 2.0, 2.05, 2.7, 0.65, 0.2],
  ['nube_lob_atras', M.nube, 2.0, 1.7, 1.9, -0.8, 0.85, -1.3],
].forEach(([n, m, rx, ry, rz, x, y, z]) => addNubeLobulo(n, m, rx, ry, rz, x, y, z));
[
  ['nube_halo_1', M.nubeBorde, 4.6, 1.75, 2.7, 0, -0.05, 0],
  ['nube_halo_2', M.nubeBorde, 2.9, 2.55, 2.4, 0.1, 1.2, -0.1],
].forEach(([n, m, rx, ry, rz, x, y, z]) => addNubeLobulo(n, m, rx, ry, rz, x, y, z));
nube.scale.setScalar(0.01);
function sincronizarCiudad() { emergente.traverse(o => { if (o.userData && o.userData.edificio) o.visible = o.userData.edificio.visible; }); }
const topeRack = r => { const g = r.getObjectByName(`${r.name}_gabinete`); return g ? g.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, rackH / 2 + 0.15, 0)) : null; };
function resetHumoEmergencia() {
  M.humoEmerg.opacity = 0;
  M.nube.opacity = 0; M.nubeBorde.opacity = 0;
  nube.scale.setScalar(0.01); nube.position.copy(nubeC);
  humoSala.children.forEach(s => {
    s.position.copy(s.userData.base);
    s.scale.copy(s.userData.baseScale).multiplyScalar(0.01);
  });
}
resetHumoEmergencia();
function animarEmergencia(on) {
  if (!on) {
    if (emAnim) cancelAnimationFrame(emAnim); emAnim = null; emergente.visible = false; hilosRack.clear();
    resetHumoEmergencia();
    return;
  }
  if (emAnim) return;
  openGuide(8);
  emergente.visible = true; sincronizarCiudad(); resetHumoEmergencia();
  const start = performance.now(); let ultimo = 0; const activos = [];
  emAnim = requestAnimationFrame(function step(now) {
    const t = (now - start) / 1000;
    // 1) interacción: hilos entre racks, cada vez más densos (0–2.5 s)
    const dens = Math.min(t / 2.5, 1), intervalo = 0.5 - 0.4 * dens;
    const vis = filas.filter(f => f.visible).flatMap(f => f.children.filter(c => c.name.startsWith('rack_')));
    if (t - ultimo > intervalo && vis.length > 1) { ultimo = t; const a = vis[Math.floor(Math.random() * vis.length)], b = vis[Math.floor(Math.random() * vis.length)]; const pa = topeRack(a), pb = topeRack(b);
      if (a !== b && pa && pb) { const mid = pa.clone().lerp(pb, 0.5); mid.y += 0.4 + pa.distanceTo(pb) * 0.15; const cv = new THREE.QuadraticBezierCurve3(pa, mid, pb); const h = new THREE.Mesh(new THREE.TubeGeometry(cv, 12, 0.02, 6), M.hilo.clone()); h.name = 'hilo_interaccion'; h.userData.t0 = t; hilosRack.add(h); activos.push(h); } }
    for (let i = activos.length - 1; i >= 0; i--) { const h = activos[i], a = t - h.userData.t0; h.material.opacity = a < 0.3 ? a / 0.3 : Math.max(0, 1 - (a - 0.3) / 1.2); if (a > 1.5) { hilosRack.remove(h); h.geometry.dispose(); h.material.dispose(); activos.splice(i, 1); } }
    // 2) humo pequeño dentro de la sala (desde ~2.0 s)
    const kIn = Math.min(Math.max((t - 2.0) / 2.8, 0), 1);
    const easeIn = kIn * kIn * (3 - 2 * kIn);
    M.humoEmerg.opacity = 0.55 * easeIn;
    humoSala.children.forEach(s => {
      const base = s.userData.base;
      const bs = s.userData.baseScale;
      const ph = s.userData.phase;
      const grow = 0.35 + 0.7 * easeIn;
      const rise = easeIn * (0.35 + 0.12 * Math.sin(t * 1.2 + ph));
      s.scale.set(bs.x * grow, bs.y * grow, bs.z * grow);
      s.position.set(
        base.x + Math.sin(t * 1.1 + ph) * 0.05 * easeIn,
        base.y + rise,
        base.z + Math.cos(t * 0.9 + ph) * 0.04 * easeIn,
      );
    });
    // 3) el humo se acumula y forma la nube sobre el edificio (desde ~4.2 s)
    const kOut = Math.min(Math.max((t - 4.2) / 3.0, 0), 1);
    const easeOut = kOut * kOut * (3 - 2 * kOut);
    const resp = 0.5 + 0.5 * Math.sin(t * 0.8);
    M.nube.opacity = 0.88 * easeOut;
    M.nube.emissiveIntensity = 0.06 + 0.06 * resp * easeOut;
    M.nubeBorde.opacity = 0.45 * easeOut;
    M.nubeBorde.emissiveIntensity = 0.08 + 0.08 * resp * easeOut;
    nube.scale.setScalar(0.12 + 0.95 * easeOut);
    nube.position.set(nubeC.x, nubeC.y + 0.35 * Math.sin(t * 0.65) * easeOut, nubeC.z);
    estado.textContent = t < 2.0
      ? 'Emergencia · las interacciones entre componentes aumentan'
      : t < 4.2
        ? 'Emergencia · aparece humo dentro del Data Center: una condición nueva'
        : 'Emergencia · el humo se acumula y forma una nube sobre el sistema';
    emAnim = requestAnimationFrame(step);
  });
}

// ===== ANIMACIÓN: adaptabilidad (el sitio sube a una loma; llega la inundación y no lo alcanza) =====
let adAnim = null;
const LOMA_H = 3.0;
M.loma = mat('loma', 0xd4d4d7, 0.95, 0);
M.agua = mat('agua', 0x749dc4, 0.15, 0.1, { transparent: true, opacity: 0, depthWrite: false });
const loma = new THREE.Mesh(new THREE.BoxGeometry(W + 9, LOMA_H, D + 6), M.loma); loma.name = 'loma'; loma.position.set(0, 0.2, 0); loma.scale.y = 0.001; loma.visible = false; E.add(loma);
const agua = new THREE.Mesh(new THREE.BoxGeometry(70, 1, 50), M.agua); agua.name = 'inundacion'; agua.position.set(0, 0.2, 0); agua.scale.y = 0.001; agua.visible = false; E.add(agua);
// Grupos que suben con el sitio (todo salvo el entorno)
const sitio = ['frontera', 'entradas', 'procesos', 'salidas', 'retroalimentacion', 'resiliencia', 'pulsos_energia'].map(n => ROOT.getObjectByName(n)).filter(Boolean).concat([humoSala, hilosRack, nube]);
// Vegetación del perímetro dentro de la loma (árboles/arbustos viven en entorno y cargan async)
const LOMA_HX = (W + 6) / 2 + 1.2, LOMA_HZ = (D + 6) / 2 + 1.2;
function vegetacionEnLoma() {
  const out = [];
  E.children.forEach(o => {
    if (!/^(arbol_|deco_arbusto_)/.test(o.name)) return;
    if (Math.abs(o.position.x) > LOMA_HX || Math.abs(o.position.z) > LOMA_HZ) return;
    if (o.userData.baseY == null) o.userData.baseY = o.position.y;
    out.push(o);
  });
  return out;
}
// Líneas externas: un extremo en el entorno (fijo) y otro en el sitio (sube)
const reaim = (m, A, B) => { const len = A.distanceTo(B); m.geometry.dispose(); m.geometry = new THREE.CylinderGeometry(m.userData.r, m.userData.r, len, 10); m.position.copy(A.clone().add(B).multiplyScalar(0.5)); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()); };
const externas = [
  ['acometida_electrica_1', [30, 8.6, -6], [TX + 2.6, y0 + 6.4, TZ - 3.6]],
  ['acometida_electrica_redundante', [30, 8.6, 1.5], [TX + 2.6, y0 + 6.4, TZ + 10.5]],
  ['fibra_entrada', [-30, y0 + 5.6, 10], [MX, y0 + 1.8, MZ]],
  ['fibra_salida_datos', [-26, 7, -16], [MX, y0 + 1.7, MZ + 0.35]],
].map(([n, fijo, movil]) => { const m = ROOT.getObjectByName(n); m.userData.r = m.geometry.parameters.radiusTop; return { m, fijo: new THREE.Vector3(...fijo), movil: new THREE.Vector3(...movil) }; });
function elevarSitio(h) {
  sitio.forEach(g => g.position.y = h);
  vegetacionEnLoma().forEach(o => { o.position.y = o.userData.baseY + h; });
  loma.visible = h > 0.01; loma.scale.y = Math.max(h / LOMA_H, 0.001); loma.position.y = 0.2 + h / 2;
  externas.forEach(e => reaim(e.m, e.fijo.clone().sub(new THREE.Vector3(0, h, 0)), e.movil));
  const cb = layers.querySelector('input[data-k="adaptabilidad"]'); if (cb) cb.checked = h > LOMA_H / 2;
}
// Lluvia: partículas sobre todo el terreno
M.lluvia = new THREE.PointsMaterial({ color: 0xb5d9fd, size: 0.18, transparent: true, opacity: 0, depthWrite: false }); M.lluvia.name = 'lluvia';
const N_LLUVIA = 2600, lluviaPos = new Float32Array(N_LLUVIA * 3);
for (let i = 0; i < N_LLUVIA; i++) { lluviaPos[i * 3] = (Math.random() - 0.5) * 70; lluviaPos[i * 3 + 1] = Math.random() * 30; lluviaPos[i * 3 + 2] = (Math.random() - 0.5) * 50; }
const lluviaGeo = new THREE.BufferGeometry(); lluviaGeo.setAttribute('position', new THREE.BufferAttribute(lluviaPos, 3));
const lluvia = new THREE.Points(lluviaGeo, M.lluvia); lluvia.name = 'lluvia'; lluvia.visible = false; E.add(lluvia);
function caerLluvia(dt) { const a = lluviaGeo.attributes.position.array; for (let i = 0; i < N_LLUVIA; i++) { a[i * 3 + 1] -= 18 * dt; if (a[i * 3 + 1] < 0.2) a[i * 3 + 1] = 30; } lluviaGeo.attributes.position.needsUpdate = true; }
function animarAdaptabilidad() {
  if (adAnim) return; openGuide(10); btnAd.disabled = true; elevarSitio(0);
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
    else { agua.visible = false; M.agua.opacity = 0; lluvia.visible = false; M.lluvia.opacity = 0; btnAd.disabled = false; adAnim = null; return; }
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
const deterioro = []; const noDet = /^(deco_|rayo|pulso|hilo|nube|ventana|termometro|generador_humo|humo_emergencia|calor_|loma|inundacion|lluvia|sensor_|luminaria_\d+_luz|luz_|placa_sitio|piso_tecnico|piso_baldosas|marca_|escombro|auto_|sitio_dr|eqf_|equifinalidad)/;
sitio.forEach(g => g.traverse(o => { if (o.isMesh && !noDet.test(o.name) && o.material !== M.led && o.material !== M.ledGreen && o.material !== M.heat && o.material !== M.humo && o.material !== M.humoEmerg) deterioro.push(o); }));
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
const BG_DIA = 0xf0ebe6, BG_NOCHE = 0x111114;
function mezclaLuz(noche) { // 0 = día, 1 = noche (continuo)
  const d = 1 - noche;
  stage._hemi.intensity = 0.38 + 0.57 * d; stage._hemi.color.setHex(0xe8f0f8).lerp(new THREE.Color(0xb8c4d4), noche); stage._hemi.groundColor.setHex(0xc0ccd8).lerp(new THREE.Color(BG_NOCHE), noche);
  stage._key.intensity = 0.68 + 1.17 * d; stage._key.color.setHex(0xfff4ea).lerp(new THREE.Color(0xdde4ee), noche); stage._fill.intensity = 0.2 + 0.32 * d;
  if (stage._rim) { stage._rim.intensity = 0.18 + 0.14 * d; stage._rim.color.setHex(0xdde4ee); }
  const bg = new THREE.Color(BG_DIA).lerp(new THREE.Color(BG_NOCHE), noche); stage.style.setProperty('--stage-bg', '#' + bg.getHexString());
  (stage.closest('.dc-page') || document.body).classList.toggle('noche', noche > 0.5); stage.style.setProperty('--stage-note', noche > 0.5 ? '#c9b6df' : 'rgba(26, 25, 21, 0.5)');
  stage.style.setProperty('--stage-toolbar-bg', noche > 0.5 ? 'rgba(10, 10, 10, 0.78)' : 'rgba(255, 255, 255, 0.92)');
  stage.style.setProperty('--stage-toolbar-ink', noche > 0.5 ? '#f4f7ff' : '#2c4a64');
  stage.style.setProperty('--stage-toolbar-border', noche > 0.5 ? 'rgba(244, 247, 255, 0.14)' : 'rgba(29, 45, 61, 0.14)');
}
function animarEntropia() {
  if (enAnim) return; openGuide(11); btnEn.disabled = true; aplicarDeterioro(0);
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
  if (ngAnim || enAnim) return; openGuide(12); btnNg.disabled = true;
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
    else { if (ngFlujo) { animarFlujo(false); ngFlujo = false; } btnNg.disabled = false; ngAnim = null; return; }
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
  if (hoAnim || enAnim) return; openGuide(13); btnHo.disabled = true;
  const DUR = 16, CICLOS = 2, start = performance.now(); cielo.visible = true; const noche0 = modoNoche;
  hoAnim = requestAnimationFrame(function step(now) {
    const t = (now - start) / 1000, k = Math.min(t / DUR, 1);
    const fase = ((noche0 ? 0.5 : 0) + k * CICLOS) % 1; posCielo(fase);
    const nocheCont = 0.5 - 0.5 * Math.cos(fase * Math.PI * 2); mezclaLuz(nocheCont);
    const carga = 0.15 + 0.85 * (1 - nocheCont); cargaRefrigeracion(carga);
    ventiladores.forEach(v => v.rotation.y += 0.04 + 0.5 * carga);
    estado.textContent = `Homeóstasis · ${nocheCont < 0.5 ? 'día' : 'noche'} · refrigeración ${Math.round(carga * 100)} % · chips 20 °C`;
    if (t >= DUR + 1.5) { cielo.visible = false; setModo(modoNoche); plumas.forEach(p => { p.scale.set(1, 1, 1); p.position.y = p.userData.baseY || RY + 1.8; }); M.heat.opacity = 0.35; rejillas.forEach(r => r.material = M.grille); btnHo.disabled = false; hoAnim = null; return; }
    hoAnim = requestAnimationFrame(step);
  });
}

// ===== ANIMACIÓN: equilibrio (carga → sobrecarga → redistribución → estado estable) =====
let eqAnim = null;
M.eqReq = mat('eq_req', 0xb5d9fd, 0.2, 0, { emissive: 0x94bce3, emissiveIntensity: 2.4 });
M.eqReqHot = mat('eq_req_hot', 0xe74c3c, 0.2, 0, { emissive: 0xc0392b, emissiveIntensity: 2.8 });
M.eqHalo = mat('eq_halo', 0xc0392b, 0.3, 0, { emissive: 0xe74c3c, emissiveIntensity: 1.8, transparent: true, opacity: 0.55, depthWrite: false });
M.eqOk = mat('eq_ok', 0x2bbf66, 0.3, 0, { emissive: 0x2bbf66, emissiveIntensity: 1.4, transparent: true, opacity: 0.5, depthWrite: false });
M.eqBeam = mat('eq_beam', 0xe8a01a, 0.2, 0, { emissive: 0xe8a01a, emissiveIntensity: 2.2, transparent: true, opacity: 0.85 });
M.eqBar = mat('eq_bar', 0xb5d9fd, 0.3, 0, { emissive: 0x94bce3, emissiveIntensity: 1.6 });
M.eqBarHot = mat('eq_bar_hot', 0xe74c3c, 0.3, 0, { emissive: 0xc0392b, emissiveIntensity: 2.0 });
const eqFx = new THREE.Group(); eqFx.name = 'equilibrio_fx'; eqFx.visible = false; ROOT.add(eqFx);
const eqReqs = new THREE.Group(); eqReqs.name = 'equilibrio_reqs'; eqFx.add(eqReqs);
const eqExtras = new THREE.Group(); eqExtras.name = 'equilibrio_extras'; eqFx.add(eqExtras);
function eqLabel(txt, color = '#e74c3c') {
  const cv = document.createElement('canvas'); cv.width = 768; cv.height = 192;
  const c = cv.getContext('2d');
  c.fillStyle = 'rgba(18,22,28,0.94)'; c.fillRect(0, 0, 768, 192);
  c.strokeStyle = color; c.lineWidth = 10; c.strokeRect(8, 8, 752, 176);
  c.fillStyle = '#f7f8fa'; c.font = '700 68px "Barlow Condensed", "Arial Narrow", sans-serif';
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 384, 100);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.15), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false }));
  m.renderOrder = 30; return m;
}
function animarEquilibrio() {
  if (eqAnim || enAnim || hoAnim || totAnim || esAnim) return;
  openGuide(14);
  const cam = stage._camera, ctl = stage._controls;
  const p0 = cam.position.clone(), t0 = ctl.target.clone(), wasAuto = ctl.autoRotate, near0 = cam.near;
  const wasDamp = lockScriptedCam(ctl);
  if (btnEq) btnEq.disabled = true;
  cam.near = 0.08; cam.updateProjectionMatrix();
  ROOT.updateMatrixWorld(true);

  const techo = [];
  ROOT.traverse(o => {
    if (/^(cubierta|uma_cubierta|uma_ventilador|uma_rejilla|uma_aro|chiller_|calor_chiller_|estacion_meteo|meteo_|bandeja_|contencion_|pipe_|deco_(cubierta|uma_|chiller_|meteo_|anemo_|bandeja_|contencion_|tubo_|crac_tubo|chiller_tubo))/.test(o.name)) techo.push(o);
  });
  const techoVis = techo.map(o => o.visible);
  techo.forEach(o => { o.visible = false; });

  // Fila frontal: saturamos un rack de delante; ocultamos el resto de filas
  const filaFrontIdx = Math.min(1, filas.length - 1);
  const fila = filas[filaFrontIdx];
  const filaPrefix = `rack_${filaFrontIdx + 1}_`;
  const nodos = (fila ? fila.children.filter(c => c.name.startsWith(filaPrefix)) : []).sort((a, b) => a.name.localeCompare(b.name));
  const gabs = nodos.map(r => r.getObjectByName(`${r.name}_gabinete`)).filter(Boolean);
  const focos = gabs.map(g => g.getWorldPosition(new THREE.Vector3()));
  const primary = Math.min(3, Math.max(0, gabs.length - 1));
  const nSrv = gabs.length;
  const filasVisEq = filas.map(f => f.visible);
  filas.forEach((f, i) => { f.visible = i === filaFrontIdx; });
  if (nSrv < 3) {
    filas.forEach((f, i) => { f.visible = filasVisEq[i]; });
    techo.forEach((o, i) => { o.visible = techoVis[i]; });
    unlockScriptedCam(ctl, { wasDamp, wasAuto, cam, near0, p0, t0 });
    if (btnEq) btnEq.disabled = false;
    return;
  }

  const puertasEq = [];
  nodos.forEach(r => {
    r.traverse(o => {
      if (o.isMesh && /puerta/.test(o.name)) { puertasEq.push([o, o.visible]); o.visible = false; }
    });
  });

  const loads = new Array(nSrv).fill(0);
  const matBase = gabs.map(g => g.material);
  const matLoad = gabs.map((_, i) => {
    const m = M.rack.clone();
    m.emissive = new THREE.Color(i === primary ? 0x5980a6 : 0x2a3038);
    m.emissiveIntensity = i === primary ? 0.45 : 0.08;
    return m;
  });
  gabs.forEach((g, i) => { g.material = matLoad[i]; });

  eqFx.visible = true;
  while (eqExtras.children.length) eqExtras.remove(eqExtras.children[0]);
  while (eqReqs.children.length) eqReqs.remove(eqReqs.children[0]);

  const halo = new THREE.Mesh(new THREE.BoxGeometry(0.72, 2.25, 1.1), M.eqHalo);
  halo.name = 'eq_halo_primary';
  halo.position.copy(focos[primary]);
  halo.visible = false;
  eqExtras.add(halo);

  // Halos receptores (naranja al recibir carga)
  const recvHalos = gabs.map((g, i) => {
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.72, 2.2, 1.1), M.eqBeam.clone());
    h.name = `eq_halo_recv_${i}`;
    h.position.copy(focos[i]);
    h.visible = false;
    h.userData.until = 0;
    h.material.transparent = true;
    h.material.opacity = 0.5;
    h.material.depthWrite = false;
    eqExtras.add(h);
    return h;
  });

  const bars = gabs.map((g, i) => {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1, 0.22), M.eqBar.clone());
    bar.name = `eq_bar_${i}`;
    bar.position.copy(focos[i]).add(new THREE.Vector3(0, 1.5, 0.7));
    bar.scale.y = 0.08;
    eqExtras.add(bar);
    return bar;
  });

  // Carteles delante y un poco más bajos para que entren al alejar la cámara
  const labY = focos[primary].y + 3.35;
  const labZ = focos[primary].z + 2.1;
  const labCentral = eqLabel('SERVIDOR CENTRAL', '#94bce3');
  labCentral.position.set(focos[primary].x, labY, labZ);
  eqExtras.add(labCentral);
  const labOver = eqLabel('SOBRECARGA', '#e74c3c');
  labOver.position.set(focos[primary].x, labY + 1.15, labZ);
  labOver.visible = false;
  eqExtras.add(labOver);
  const labBal = eqLabel('CARGA REDISTRIBUIDA', '#e8a01a');
  labBal.position.set(focos[primary].x, labY + 1.15, labZ);
  labBal.visible = false;
  eqExtras.add(labBal);
  const labOk = eqLabel('EQUILIBRIO ESTABLE', '#2bbf66');
  labOk.position.set(focos[primary].x, labY + 1.15, labZ);
  labOk.visible = false;
  eqExtras.add(labOk);

  const users = [];
  for (let i = 0; i < 6; i++) {
    users.push(new THREE.Vector3(
      focos[primary].x - 2.2 + i * 0.9,
      fy + 0.7 + (i % 2) * 0.22,
      focos[primary].z + 4.2,
    ));
  }
  users.forEach((p, i) => {
    const u = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), M.eqReq.clone());
    u.name = `eq_user_${i + 1}`;
    u.position.copy(p);
    eqReqs.add(u);
  });

  // Cámara más alejada para ver carteles + arcos de redirección
  const camIn = focos[primary].clone().add(new THREE.Vector3(0.2, 5.8, 10.4));
  const focoIn = focos[primary].clone().add(new THREE.Vector3(0, 1.7, 0.2));
  const ease = easeInOutCubic;
  const IN = 2.0, NORMAL = 3.0, OVER = 4.0, BAL = 6.0, STABLE = 3.6, OUT = 2.0;
  const T0 = IN, T1 = T0 + NORMAL, T2 = T1 + OVER, T3 = T2 + BAL, T4 = T3 + STABLE, T5 = T4 + OUT;
  const start = performance.now();
  let lastSpawn = 0, lastBeam = 0, balCursor = 0;
  const particles = [];
  const beams = [];
  // Orden de destinos: vecinos cercanos hacia afuera (más legible)
  const destOrder = [];
  for (let d = 1; d < nSrv; d++) {
    if (primary - d >= 0) destOrder.push(primary - d);
    if (primary + d < nSrv) destOrder.push(primary + d);
  }

  const setLoadVisual = (t) => {
    loads.forEach((L, i) => {
      const u = Math.min(Math.max(L, 0), 1);
      const m = matLoad[i];
      const receiving = recvHalos[i].visible && i !== primary;
      if (i === primary && t >= T1 && t < T3) {
        m.emissive.setHex(0xc0392b);
        m.emissiveIntensity = 0.6 + 1.8 * u;
        m.color.setHex(0x4a1515);
      } else if (t >= T3) {
        m.emissive.setHex(0x2bbf66);
        m.emissiveIntensity = 0.35 + 0.9 * Math.min(u + 0.25, 1);
        m.color.setHex(0x1a2a22);
      } else if (receiving) {
        m.emissive.setHex(0xe8a01a);
        m.emissiveIntensity = 0.7 + 0.9 * u;
        m.color.setHex(0x3a2a12);
      } else if (i === primary) {
        m.emissive.setHex(0x5980a6);
        m.emissiveIntensity = 0.5 + 0.9 * u;
        m.color.setHex(0x1c2127);
      } else {
        m.emissive.setHex(0x2a3038);
        m.emissiveIntensity = 0.08 + 0.55 * u;
        m.color.setHex(0x1c2127);
      }
      const bar = bars[i];
      const h = 0.12 + 1.15 * u;
      bar.scale.y = h;
      bar.position.y = focos[i].y + 1.25 + h * 0.5;
      if (i === primary && t >= T1 && t < T3) bar.material = M.eqBarHot;
      else if (receiving) bar.material = M.eqBeam;
      else if (t >= T3) bar.material = M.eqOk;
      else bar.material = M.eqBar;
    });
    const over = t >= T1 && t < T3;
    halo.visible = (t >= T0 && t < T1) || over;
    if (halo.visible) {
      const pulse = 1 + 0.08 * Math.sin(t * 8);
      const s = over ? (1.05 + 0.25 * Math.min(loads[primary], 1)) * pulse : 1.05;
      halo.scale.set(s, s, s);
      M.eqHalo.opacity = over ? 0.35 + 0.35 * Math.min(loads[primary], 1) : 0.22;
      M.eqHalo.emissiveIntensity = over ? 1.6 + Math.sin(t * 10) * 0.6 : 0.9;
      halo.material = over ? M.eqHalo : M.eqOk;
      if (!over) M.eqOk.opacity = 0.25;
    }
    recvHalos.forEach((h, i) => {
      if (i === primary) { h.visible = false; return; }
      if (h.userData.until > t) {
        h.visible = true;
        const pulse = 1 + 0.06 * Math.sin(t * 12);
        h.scale.set(pulse, pulse, pulse);
        h.material.opacity = 0.45;
        h.material.emissiveIntensity = 1.4;
      } else h.visible = false;
    });
  };

  const spawnBeam = (fromIdx, toIdx) => {
    const A = focos[fromIdx].clone().add(new THREE.Vector3(0, 1.35, 0.85));
    const B = focos[toIdx].clone().add(new THREE.Vector3(0, 1.35, 0.85));
    const lift = 2.4 + Math.min(Math.abs(toIdx - fromIdx), 4) * 0.45;
    const mid = A.clone().lerp(B, 0.5).add(new THREE.Vector3(0, lift, 2.0));
    const curve = new THREE.QuadraticBezierCurve3(A, mid, B);
    const matBeam = M.eqBeam.clone();
    matBeam.transparent = true;
    matBeam.opacity = 0.95;
    matBeam.emissiveIntensity = 2.6;
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 28, 0.11, 10, false), matBeam);
    tube.name = 'eq_beam';
    tube.userData.life = 1.6;
    tube.renderOrder = 20;
    eqExtras.add(tube);
    beams.push(tube);
    // Punta tipo flecha en el destino
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.45, 10), M.eqReqHot.clone());
    tip.position.copy(B);
    tip.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(mid).normalize());
    tip.userData.life = 1.6;
    tip.renderOrder = 21;
    eqExtras.add(tip);
    beams.push(tip);
    // 5 paquetes grandes recorriendo el arco
    for (let k = 0; k < 5; k++) {
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.26 - k * 0.02, 14, 12), M.eqReqHot);
      eqReqs.add(ball);
      particles.push({
        mesh: ball, target: toIdx, u: -k * 0.1, speed: 0.85, curve, redistribute: true,
      });
    }
    loads[fromIdx] = Math.max(0.18, loads[fromIdx] - 0.26);
    loads[toIdx] = Math.min(1.2, loads[toIdx] + 0.26);
    recvHalos[toIdx].userData.until = ((performance.now() - start) / 1000) + 1.4;
  };

  const spawnReq = (t, forceTarget = null) => {
    let target = forceTarget;
    if (target == null) {
      let best = 0, bestL = loads[0];
      for (let i = 1; i < nSrv; i++) if (loads[i] < bestL) { best = i; bestL = loads[i]; }
      target = best;
    }
    const from = users[Math.floor(Math.random() * users.length)].clone();
    const hot = target === primary && t >= T1 && t < T2;
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(hot ? 0.16 : 0.13, 12, 10), hot ? M.eqReqHot : M.eqReq);
    mesh.position.copy(from);
    eqReqs.add(mesh);
    const mid = from.clone().lerp(focos[target], 0.45).add(new THREE.Vector3(0, 1.5 + Math.random() * 0.5, 0.4));
    particles.push({ mesh, from, mid, target, u: 0, speed: 0.5 + Math.random() * 0.25 });
    loads[target] = Math.min(loads[target] + (hot ? 0.16 : 0.1), 1.4);
  };

  const finish = () => {
    particles.forEach(p => { if (p.mesh.parent) p.mesh.parent.remove(p.mesh); if (p.mesh.geometry) p.mesh.geometry.dispose(); });
    particles.length = 0;
    while (eqReqs.children.length) eqReqs.remove(eqReqs.children[0]);
    while (eqExtras.children.length) {
      const c = eqExtras.children[0];
      eqExtras.remove(c);
      if (c.geometry) c.geometry.dispose();
    }
    beams.length = 0;
    gabs.forEach((g, i) => { g.material = matBase[i]; });
    puertasEq.forEach(([p, vis]) => { p.visible = vis; });
    filas.forEach((f, i) => { f.visible = filasVisEq[i]; });
    eqFx.visible = false;
    techo.forEach((o, i) => { o.visible = techoVis[i]; });
    unlockScriptedCam(ctl, { wasDamp, wasAuto, cam, near0, p0, t0 });
    if (btnEq) btnEq.disabled = false;
    eqAnim = null;
  };

  const tmpP = new THREE.Vector3(), tmpT = new THREE.Vector3();
  eqAnim = requestAnimationFrame(function step(now) {
    const t = (now - start) / 1000;
    [labCentral, labOver, labBal, labOk].forEach(l => l.lookAt(cam.position));

    if (t < T0) {
      const u = ease(t / IN);
      aimScriptedCam(cam, ctl, tmpP.lerpVectors(p0, camIn, u), tmpT.lerpVectors(t0, focoIn, u));
    } else if (t < T4) {
      aimScriptedCam(cam, ctl, camIn, focoIn);
    } else if (t < T5) {
      const u = ease((t - T4) / OUT);
      aimScriptedCam(cam, ctl, tmpP.lerpVectors(camIn, p0, u), tmpT.lerpVectors(focoIn, t0, u));
    }

    labCentral.visible = t >= T0 && t < T2;
    labOver.visible = t >= T1 && t < T2;
    labBal.visible = t >= T2 && t < T3;
    labOk.visible = t >= T3 && t < T5;

    // Entrada de datos (normal + sobrecarga). En redistribución NO entran: se ve solo el vaciado.
    let interval = 99;
    if (t >= T0 && t < T1) interval = 0.3;
    else if (t >= T1 && t < T2) interval = 0.28 - 0.2 * ease((t - T1) / OVER);
    else if (t >= T3 && t < T4) interval = 0.28;
    if (t >= T0 && t < T4 && interval < 90 && t - lastSpawn > interval) {
      lastSpawn = t;
      if (t < T2) {
        const burst = (t >= T1) ? 2 + Math.floor(3 * ((t - T1) / OVER)) : 1;
        for (let k = 0; k < burst; k++) spawnReq(t, primary);
      } else if (t >= T3) {
        spawnReq(t);
      }
    }

    // Redistribución: 2 destinos a la vez (izq/der) con arcos muy visibles
    if (t >= T2 && t < T3 && t - lastBeam > 0.28) {
      lastBeam = t;
      if (loads[primary] > 0.22) {
        const a = destOrder[balCursor % destOrder.length];
        const b = destOrder[(balCursor + 1) % destOrder.length];
        balCursor += 2;
        spawnBeam(primary, a);
        if (b !== a) spawnBeam(primary, b);
      }
    }

    for (let i = beams.length - 1; i >= 0; i--) {
      const b = beams[i];
      b.userData.life -= 0.016;
      if (b.material && b.material.opacity != null) {
        const life = Math.max(0, b.userData.life);
        b.material.opacity = Math.min(0.95, life);
        if (b.material.emissiveIntensity != null) b.material.emissiveIntensity = 2.2 + Math.sin(t * 16) * 0.7;
      }
      if (b.userData.life <= 0) {
        eqExtras.remove(b);
        if (b.geometry) b.geometry.dispose();
        beams.splice(i, 1);
      }
    }

    const dt = 0.016;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.u = Math.min(p.u + p.speed * dt, 1);
      if (p.u < 0) continue;
      if (p.curve) {
        p.curve.getPoint(p.u, p.mesh.position);
        const s = 1 + 0.35 * Math.sin(p.u * Math.PI);
        p.mesh.scale.setScalar(s);
      } else {
        const a = p.from, b = p.mid, c = focos[p.target];
        const u = p.u, omu = 1 - u;
        p.mesh.position.set(
          omu * omu * a.x + 2 * omu * u * b.x + u * u * c.x,
          omu * omu * a.y + 2 * omu * u * b.y + u * u * c.y,
          omu * omu * a.z + 2 * omu * u * b.z + u * u * c.z,
        );
      }
      if (p.u >= 1) {
        if (!p.redistribute) loads[p.target] = Math.max(0, loads[p.target] - 0.04);
        if (p.mesh.parent) p.mesh.parent.remove(p.mesh);
        if (p.mesh.geometry) p.mesh.geometry.dispose();
        particles.splice(i, 1);
      }
    }

    const decay = t >= T3 ? 0.008 : (t >= T2 ? 0.002 : 0.003);
    for (let i = 0; i < nSrv; i++) loads[i] = Math.max(0, loads[i] - decay);
    if (t >= T3 && t < T4) {
      const avg = loads.reduce((s, v) => s + v, 0) / nSrv;
      for (let i = 0; i < nSrv; i++) loads[i] += (avg - loads[i]) * 0.08;
    }
    if (t >= T1 && t < T2) loads[primary] = Math.min(1.4, Math.max(loads[primary], 0.55 + 0.7 * ((t - T1) / OVER)));

    setLoadVisual(t);

    if (t < T0) estado.textContent = 'Equilibrio · usuarios envían solicitudes al Data Center';
    else if (t < T1) estado.textContent = 'Equilibrio · el servidor central atiende con normalidad';
    else if (t < T2) estado.textContent = 'Equilibrio · sobrecarga: demasiadas solicitudes en un solo servidor';
    else if (t < T3) estado.textContent = 'Equilibrio · redistribución: la carga sale del saturado hacia los demás';
    else if (t < T4) estado.textContent = 'Equilibrio · estado estable: la carga queda balanceada';
    else if (t < T5) estado.textContent = 'Equilibrio · el sistema se reajustó ante la perturbación';
    else { finish(); return; }

    eqAnim = requestAnimationFrame(step);
  });
}

// ===== ANIMACIÓN: retroalimentación (ciclo continuo medición → control → ajuste) =====
let rfAnim = null;
M.senal = mat('senal', 0xeef6ff, 0.2, 0, { emissive: 0xb5d9fd, emissiveIntensity: 2.6 });
M.senalHot = mat('senal_hot', 0xe74c3c, 0.2, 0, { emissive: 0xc0392b, emissiveIntensity: 2.8 });
M.senalCool = mat('senal_cool', 0x7ec8ff, 0.2, 0, { emissive: 0x4aa3e0, emissiveIntensity: 2.4 });
M.caliente = mat('rack_caliente', 0x5980a6, 0.4, 0.3, { emissive: 0xc0392b, emissiveIntensity: 0 });
M.rfHalo = mat('rf_halo', 0xc0392b, 0.3, 0, { emissive: 0xe74c3c, emissiveIntensity: 1.4, transparent: true, opacity: 0.4, depthWrite: false });
M.rfAir = mat('rf_air', 0xb5d9fd, 0.2, 0, { emissive: 0x7ec8ff, emissiveIntensity: 2.0, transparent: true, opacity: 0.85 });
const COLOR_FRIO = new THREE.Color(0x5980a6), COLOR_CALOR = new THREE.Color(0xc0392b);
const pintarCalor = u => { M.caliente.color.copy(COLOR_FRIO).lerp(COLOR_CALOR, u); M.caliente.emissiveIntensity = 0.9 * u; };
M.pantallaAlerta = mat('pantalla_alerta', 0xb5d9fd, 0.4, 0, { emissive: 0xb5d9fd, emissiveIntensity: 0.6 });
const rackRf = ROOT.getObjectByName('rack_2_3'), gabRf = rackRf.getObjectByName('rack_2_3_gabinete'), sensorRf = filas[1].userData.sensor, pantallaRf = ROOT.getObjectByName('noc_pantalla_imagen'), cracRf = ROOT.getObjectByName('crac_1'), rejillaRf = ROOT.getObjectByName('crac_1_rejilla');
const pSensor = sensorRf.position.clone(), pNoc = new THREE.Vector3(NX, y0 + 1.55, NZ), pCrac = cracRf.position.clone().add(new THREE.Vector3(0, 1.1, 0.4));
const pRackRf = () => gabRf.getWorldPosition(new THREE.Vector3());
const rutaMed = new THREE.CatmullRomCurve3([pSensor, new THREE.Vector3(pSensor.x, pSensor.y, HZ + HD / 2 - 0.3), pNoc], false, 'catmullrom', 0.1);
const rutaAct = new THREE.CatmullRomCurve3([pNoc, new THREE.Vector3(HX - HW / 2 + 0.6, fy + rackH + 0.9, HZ + HD / 2 - 0.3), new THREE.Vector3(HX - HW / 2 + 0.6, fy + rackH + 0.9, pCrac.z), pCrac], false, 'catmullrom', 0.1);
const senal = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), M.senal); senal.name = 'senal_retroalimentacion'; senal.visible = false; R.add(senal);
const rfFx = new THREE.Group(); rfFx.name = 'retro_fx'; rfFx.visible = false; ROOT.add(rfFx);
const rfTrail = new THREE.Group(); rfTrail.name = 'retro_trail'; rfFx.add(rfTrail);
const rfAirG = new THREE.Group(); rfAirG.name = 'retro_aire'; rfFx.add(rfAirG);
// Pantalla del NOC con texto
const nocCv = document.createElement('canvas'); nocCv.width = 256; nocCv.height = 128; const nocCtx = nocCv.getContext('2d');
const pintarNoc = (txt, alerta) => { nocCtx.fillStyle = alerta ? '#5980a6' : '#1d2d3d'; nocCtx.fillRect(0, 0, 256, 128); nocCtx.fillStyle = alerta ? '#f2f2f3' : '#b5d9fd'; nocCtx.font = '600 40px "Barlow Condensed", sans-serif'; nocCtx.textAlign = 'center'; nocCtx.textBaseline = 'middle'; nocCtx.fillText(txt, 128, 66); nocTex.needsUpdate = true; };
const nocTex = new THREE.CanvasTexture(nocCv); nocTex.colorSpace = THREE.SRGBColorSpace;
M.nocDisplay = Object.assign(new THREE.MeshStandardMaterial({ map: nocTex, emissive: 0xffffff, emissiveMap: nocTex, emissiveIntensity: 1.0, roughness: 0.4 }), { name: 'noc_display' });

function rfLabel(txt, color = '#94bce3') {
  const cv = document.createElement('canvas'); cv.width = 640; cv.height = 160;
  const c = cv.getContext('2d');
  c.fillStyle = 'rgba(18,22,28,0.94)'; c.fillRect(0, 0, 640, 160);
  c.strokeStyle = color; c.lineWidth = 8; c.strokeRect(6, 6, 628, 148);
  c.fillStyle = '#f7f8fa'; c.font = '700 54px "Barlow Condensed", "Arial Narrow", sans-serif';
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 320, 84);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 0.7), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false }));
  m.renderOrder = 28; return m;
}
function rfTempBoard() {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256;
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.2), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false }));
  mesh.renderOrder = 29;
  mesh.userData.paint = (temp, mode) => {
    const c = cv.getContext('2d');
    const col = mode === 'hot' ? '#e74c3c' : mode === 'cool' ? '#4aa3e0' : '#2bbf66';
    c.clearRect(0, 0, 512, 256);
    c.fillStyle = 'rgba(18,22,28,0.94)'; c.fillRect(0, 0, 512, 256);
    c.strokeStyle = col; c.lineWidth = 10; c.strokeRect(8, 8, 496, 240);
    c.fillStyle = '#9aa3ad'; c.font = '600 36px "Barlow Condensed", sans-serif';
    c.textAlign = 'center'; c.fillText('TEMPERATURA', 256, 70);
    c.fillStyle = col; c.font = '700 96px "Barlow Condensed", sans-serif';
    c.fillText(`${Math.round(temp)} °C`, 256, 170);
    tex.needsUpdate = true;
  };
  return mesh;
}

function animarRetroalimentacion() {
  if (rfAnim || enAnim || hoAnim || eqAnim || totAnim || esAnim) return;
  openGuide(15);
  const cam = stage._camera, ctl = stage._controls;
  const p0 = cam.position.clone(), t0 = ctl.target.clone(), wasAuto = ctl.autoRotate, near0 = cam.near;
  const wasDamp = lockScriptedCam(ctl);
  if (btnRf) btnRf.disabled = true;
  cam.near = 0.08; cam.updateProjectionMatrix();
  ROOT.updateMatrixWorld(true);

  const techo = [];
  ROOT.traverse(o => {
    if (/^(cubierta|uma_cubierta|uma_ventilador|uma_rejilla|uma_aro|chiller_|calor_chiller_|estacion_meteo|meteo_|deco_(cubierta|uma_|chiller_|meteo_|anemo_))/.test(o.name)) techo.push(o);
  });
  const techoVis = techo.map(o => o.visible);
  techo.forEach(o => { o.visible = false; });

  // Tabiques que separan la sala NOC de la sala de racks (bloquean el encuadre)
  const tabiquesNoc = [];
  ROOT.traverse(o => {
    if (/^(tabique_3|tabique_4)$/.test(o.name)) tabiquesNoc.push(o);
  });
  const tabiquesVis = tabiquesNoc.map(o => o.visible);
  tabiquesNoc.forEach(o => { o.visible = false; });

  const gabMat = gabRf.material, pantMat = pantallaRf.material, rejMat = rejillaRf.material, sensMat = sensorRf.material;
  pantallaRf.material = M.nocDisplay;
  gabRf.material = M.caliente;
  pintarCalor(0);
  sensorRf.material = M.senal.clone();
  sensorRf.material.emissiveIntensity = 1.2;
  pintarNoc('OK · 20 °C', false);

  rfFx.visible = true;
  while (rfTrail.children.length) { const c = rfTrail.children[0]; rfTrail.remove(c); if (c.geometry) c.geometry.dispose(); }
  while (rfAirG.children.length) { const c = rfAirG.children[0]; rfAirG.remove(c); if (c.geometry) c.geometry.dispose(); }
  for (let i = rfFx.children.length - 1; i >= 0; i--) {
    const c = rfFx.children[i];
    if (c === rfTrail || c === rfAirG) continue;
    rfFx.remove(c);
    if (c.geometry) c.geometry.dispose();
    if (c.material?.map) c.material.map.dispose();
  }
  if (!rfFx.children.includes(rfTrail)) rfFx.add(rfTrail);
  if (!rfFx.children.includes(rfAirG)) rfFx.add(rfAirG);

  const rackPos = pRackRf();
  const halo = new THREE.Mesh(new THREE.BoxGeometry(0.75, 2.3, 1.15), M.rfHalo);
  halo.position.copy(rackPos);
  halo.visible = false;
  rfFx.add(halo);

  const board = rfTempBoard();
  board.position.copy(rackPos).add(new THREE.Vector3(0, 2.7, 1.1));
  board.userData.paint(20, 'ok');
  rfFx.add(board);

  const labSensor = rfLabel('SENSOR', '#94bce3');
  labSensor.position.copy(pSensor).add(new THREE.Vector3(0, 0.55, 0.4));
  rfFx.add(labSensor);
  const labControl = rfLabel('CONTROL (NOC)', '#e8a01a');
  labControl.position.set(NX + 1.7, y0 + 2.4, NZ + 0.6);
  rfFx.add(labControl);
  const labCrac = rfLabel('REFRIGERACIÓN', '#4aa3e0');
  labCrac.position.copy(pCrac).add(new THREE.Vector3(0.3, 1.3, 0.5));
  rfFx.add(labCrac);
  const labFase = rfLabel('MEDICIÓN', '#b5d9fd');
  labFase.position.set(NX + 1.7, y0 + 4.6, NZ - 1.2);
  rfFx.add(labFase);

  let lastFase = '';
  const setFase = (txt, color) => {
    if (txt === lastFase) return;
    lastFase = txt;
    const cv = document.createElement('canvas'); cv.width = 640; cv.height = 160;
    const c = cv.getContext('2d');
    c.fillStyle = 'rgba(18,22,28,0.94)'; c.fillRect(0, 0, 640, 160);
    c.strokeStyle = color; c.lineWidth = 8; c.strokeRect(6, 6, 628, 148);
    c.fillStyle = '#f7f8fa'; c.font = '700 54px "Barlow Condensed", "Arial Narrow", sans-serif';
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 320, 84);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    if (labFase.material.map) labFase.material.map.dispose();
    labFase.material.map = tex;
    labFase.material.needsUpdate = true;
  };

  // Cámara alta desde el SE: racks + sala NOC (escritorios) en el mismo plano
  const camIn = new THREE.Vector3(NX + 11.5, y0 + 12.5, NZ + 9.5);
  const focoIn = new THREE.Vector3(
    (rackPos.x + NX + 1.7) * 0.5,
    y0 + 1.15,
    rackPos.z * 0.35 + NZ * 0.65,
  );
  const ease = easeInOutCubic;
  const IN = 2.0, OUT = 2.0;
  // Un ciclo: calor → medir → decidir → actuar → enfriar → re-medir
  const CAL = 2.4, MED = 1.8, DEC = 1.2, ACT = 1.8, EFE = 2.8, REM = 1.6;
  const CYCLE = CAL + MED + DEC + ACT + EFE + REM;
  const LOOPS = 3;
  const T0 = IN;
  const TLoopsEnd = T0 + CYCLE * LOOPS;
  const TEnd = TLoopsEnd + OUT;
  const start = performance.now();
  const trail = [];
  const airParts = [];

  const clearTrail = () => {
    while (rfTrail.children.length) {
      const c = rfTrail.children[0];
      rfTrail.remove(c);
      if (c.geometry) c.geometry.dispose();
      if (c.material) c.material.dispose();
    }
    trail.length = 0;
  };
  const clearAir = () => {
    while (rfAirG.children.length) {
      const c = rfAirG.children[0];
      rfAirG.remove(c);
      if (c.geometry) c.geometry.dispose();
      if (c.material && c.material !== M.rfAir) c.material.dispose();
    }
    airParts.length = 0;
  };

  const spawnTrail = (pos, hot) => {
    const matT = (hot ? M.senalHot : M.senalCool).clone();
    matT.transparent = true;
    matT.opacity = 0.9;
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), matT);
    b.position.copy(pos);
    rfTrail.add(b);
    trail.push({ mesh: b, life: 0.7 });
    if (trail.length > 18) {
      const old = trail.shift();
      if (old.mesh.parent) old.mesh.parent.remove(old.mesh);
      if (old.mesh.geometry) old.mesh.geometry.dispose();
      if (old.mesh.material) old.mesh.material.dispose();
    }
  };

  const spawnAir = () => {
    const from = pCrac.clone().add(new THREE.Vector3(0.2, 0, 0.2));
    const to = rackPos.clone().add(new THREE.Vector3(0, 0.4, 0.4));
    const mid = from.clone().lerp(to, 0.45).add(new THREE.Vector3(0, 1.2, 0.6));
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), M.rfAir);
    mesh.position.copy(from);
    rfAirG.add(mesh);
    airParts.push({ mesh, from, mid, to, u: 0, speed: 0.55 + Math.random() * 0.25 });
  };

  const finish = () => {
    clearTrail(); clearAir();
    for (let i = rfFx.children.length - 1; i >= 0; i--) {
      const c = rfFx.children[i];
      if (c === rfTrail || c === rfAirG) continue;
      rfFx.remove(c);
      if (c.geometry) c.geometry.dispose();
      if (c.material?.map) c.material.map.dispose();
    }
    rfFx.visible = false;
    senal.visible = false;
    senal.material = M.senal;
    techo.forEach((o, i) => { o.visible = techoVis[i]; });
    tabiquesNoc.forEach((o, i) => { o.visible = tabiquesVis[i]; });
    gabRf.material = gabMat;
    pantallaRf.material = pantMat;
    rejillaRf.material = rejMat;
    sensorRf.material = sensMat;
    if (plumas[0]) plumas[0].scale.set(1, 1, 1);
    termo.userData.pintarTemp(20);
    unlockScriptedCam(ctl, { wasDamp, wasAuto, cam, near0, p0, t0 });
    if (btnRf) btnRf.disabled = false;
    rfAnim = null;
  };

  const tmpP = new THREE.Vector3(), tmpT = new THREE.Vector3();
  rfAnim = requestAnimationFrame(function step(now) {
    const t = (now - start) / 1000;
    [labSensor, labControl, labCrac, labFase, board].forEach(l => l.lookAt(cam.position));

    if (t < T0) {
      const u = ease(t / IN);
      aimScriptedCam(cam, ctl, tmpP.lerpVectors(p0, camIn, u), tmpT.lerpVectors(t0, focoIn, u));
      setFase('LAZO DE RETROALIMENTACIÓN', '#94bce3');
      estado.textContent = 'Retroalimentación · refrigeración + sensor listos para el ciclo';
      board.userData.paint(20, 'ok');
      pintarCalor(0);
      senal.visible = false;
    } else if (t < TLoopsEnd) {
      aimScriptedCam(cam, ctl, camIn, focoIn);
      const local = t - T0;
      const loopI = Math.floor(local / CYCLE);
      const lt = local - loopI * CYCLE;
      // En ciclos siguientes el calor es un poco menor (ya regulado) pero sigue el lazo
      const peak = loopI === 0 ? 28 : (loopI === 1 ? 26 : 24);
      const base = 20;
      const rise = peak - base;

      let temp = base;
      let heatU = 0;
      let phase = '';

      if (lt < CAL) {
        const u = lt / CAL;
        heatU = u;
        temp = base + rise * u;
        phase = 'calor';
        setFase('1 · TEMPERATURA SUBE', '#e74c3c');
        estado.textContent = `Retroalimentación · ciclo ${loopI + 1}/${LOOPS}: el ambiente se calienta · ${Math.round(temp)} °C`;
        senal.visible = false;
        clearTrail();
        pintarNoc(`${Math.round(temp)} °C`, true);
        sensorRf.material.emissiveIntensity = 0.8 + u * 1.4;
      } else if (lt < CAL + MED) {
        const u = (lt - CAL) / MED;
        heatU = 1;
        temp = peak;
        phase = 'med';
        setFase('2 · SENSOR → CONTROL', '#e74c3c');
        estado.textContent = `Retroalimentación · ciclo ${loopI + 1}/${LOOPS}: el sensor mide y envía la señal al control`;
        senal.visible = true;
        senal.material = M.senalHot;
        const pos = rutaMed.getPointAt(Math.min(u, 0.999));
        senal.position.copy(pos);
        spawnTrail(pos, true);
        sensorRf.material.emissiveIntensity = Math.floor(t * 10) % 2 ? 3.2 : 0.6;
        pintarNoc(`T↑ ${peak} °C`, true);
      } else if (lt < CAL + MED + DEC) {
        heatU = 1;
        temp = peak;
        phase = 'dec';
        setFase('3 · CONTROL AJUSTA', '#e8a01a');
        estado.textContent = `Retroalimentación · ciclo ${loopI + 1}/${LOOPS}: el NOC decide aumentar la refrigeración`;
        senal.visible = false;
        clearTrail();
        pintarNoc(`T↑ ${peak} °C · +FRÍO`, Math.floor(t * 6) % 2 === 0);
        labControl.visible = true;
      } else if (lt < CAL + MED + DEC + ACT) {
        const u = (lt - CAL - MED - DEC) / ACT;
        heatU = 1;
        temp = peak;
        phase = 'act';
        setFase('4 · ORDEN → CRAC', '#4aa3e0');
        estado.textContent = `Retroalimentación · ciclo ${loopI + 1}/${LOOPS}: la orden viaja al sistema de refrigeración`;
        senal.visible = true;
        senal.material = M.senalCool;
        const pos = rutaAct.getPointAt(Math.min(u, 0.999));
        senal.position.copy(pos);
        spawnTrail(pos, false);
        pintarNoc(`+FRÍO · CRAC`, true);
        rejillaRf.material = M.rejillaCarga;
        M.rejillaCarga.emissiveIntensity = 0.8 + u * 1.0;
      } else if (lt < CAL + MED + DEC + ACT + EFE) {
        const u = ease((lt - CAL - MED - DEC - ACT) / EFE);
        heatU = 1 - u;
        temp = peak - rise * u;
        phase = 'efe';
        setFase('5 · REFRIGERACIÓN BAJA T°', '#4aa3e0');
        estado.textContent = `Retroalimentación · ciclo ${loopI + 1}/${LOOPS}: el CRAC enfría · ${Math.round(temp)} °C`;
        senal.visible = false;
        clearTrail();
        rejillaRf.material = M.rejillaCarga;
        M.rejillaCarga.emissiveIntensity = 1.8;
        if (Math.random() < 0.45) spawnAir();
        if (plumas[0]) plumas[0].scale.set(1.2, 1 + 1.1 * Math.sin(u * Math.PI), 1.2);
        pintarNoc(`${Math.round(temp)} °C · FRÍO`, false);
      } else {
        const u = (lt - CAL - MED - DEC - ACT - EFE) / REM;
        heatU = 0;
        temp = base;
        phase = 'rem';
        setFase('6 · NUEVA MEDICIÓN', '#2bbf66');
        estado.textContent = `Retroalimentación · ciclo ${loopI + 1}/${LOOPS}: el sensor vuelve a medir y cierra el lazo`;
        senal.visible = true;
        senal.material = M.senal;
        const pos = rutaMed.getPointAt(Math.min(u, 0.999));
        senal.position.copy(pos);
        spawnTrail(pos, false);
        sensorRf.material.emissiveIntensity = Math.floor(t * 10) % 2 ? 2.8 : 0.7;
        M.rejillaCarga.emissiveIntensity = 0.55;
        if (u > 0.75) pintarNoc(`OK · ${base} °C`, false);
      }

      pintarCalor(heatU);
      halo.visible = heatU > 0.08;
      if (halo.visible) {
        const pulse = 1 + 0.06 * Math.sin(t * 9);
        halo.scale.setScalar((1 + 0.2 * heatU) * pulse);
        M.rfHalo.opacity = 0.2 + 0.35 * heatU;
      }
      const mode = heatU > 0.55 ? 'hot' : heatU > 0.12 ? 'cool' : 'ok';
      board.userData.paint(temp, mode);
      termo.userData.pintarTemp(Math.round(temp));
      labSensor.visible = phase === 'med' || phase === 'rem' || phase === 'calor';
      labControl.visible = phase === 'dec' || phase === 'act';
      labCrac.visible = phase === 'act' || phase === 'efe';
    } else if (t < TEnd) {
      const u = ease((t - TLoopsEnd) / OUT);
      aimScriptedCam(cam, ctl, tmpP.lerpVectors(camIn, p0, u), tmpT.lerpVectors(focoIn, t0, u));
      senal.visible = false;
      clearTrail(); clearAir();
      halo.visible = false;
      setFase('LAZO CERRADO · CONTINUO', '#2bbf66');
      board.userData.paint(20, 'ok');
      pintarNoc('OK · 20 °C', false);
      pintarCalor(0);
      if (u > 0.45) techo.forEach((o, i) => { o.visible = techoVis[i]; });
      estado.textContent = 'Retroalimentación · el ciclo medición → ajuste → medición se repite';
    } else {
      finish();
      return;
    }

    // Actualizar trail / aire
    for (let i = trail.length - 1; i >= 0; i--) {
      const p = trail[i];
      p.life -= 0.016;
      if (p.mesh.material && p.mesh.material.opacity != null) p.mesh.material.opacity = Math.max(0, p.life);
      p.mesh.scale.setScalar(Math.max(0.2, p.life));
      if (p.life <= 0) {
        if (p.mesh.parent) p.mesh.parent.remove(p.mesh);
        if (p.mesh.geometry) p.mesh.geometry.dispose();
        if (p.mesh.material) p.mesh.material.dispose();
        trail.splice(i, 1);
      }
    }
    for (let i = airParts.length - 1; i >= 0; i--) {
      const p = airParts[i];
      p.u = Math.min(1, p.u + p.speed * 0.016);
      const a = p.from, b = p.mid, c = p.to, u = p.u, omu = 1 - u;
      p.mesh.position.set(
        omu * omu * a.x + 2 * omu * u * b.x + u * u * c.x,
        omu * omu * a.y + 2 * omu * u * b.y + u * u * c.y,
        omu * omu * a.z + 2 * omu * u * b.z + u * u * c.z,
      );
      if (p.u >= 1) {
        if (p.mesh.parent) p.mesh.parent.remove(p.mesh);
        if (p.mesh.geometry) p.mesh.geometry.dispose();
        airParts.splice(i, 1);
      }
    }

    rfAnim = requestAnimationFrame(step);
  });
}

// ===== ANIMACIÓN: recursividad (zoom: DC → rack → servidor → componente → partes → salida) =====
let rcAnim = null;
function animarRecursividad() {
  if (rcAnim || jerAnim || eqfAnim || esAnim || totAnim) return;
  openGuide(17);
  const cam = stage._camera, ctl = stage._controls;
  const p0 = cam.position.clone(), t0 = ctl.target.clone(), wasAuto = ctl.autoRotate, near0 = cam.near;
  const wasDamp = lockScriptedCam(ctl);
  if (btnRc) btnRc.disabled = true;
  cam.near = 0.008; cam.updateProjectionMatrix();
  ROOT.updateMatrixWorld(true);

  const V = (a, b) => a.clone().add(b);
  const gabinete = rackRef.getObjectByName('rack_2_6_gabinete') || rackRef;
  const fRack = gabinete.getWorldPosition(new THREE.Vector3());
  const fSrv = bladeRef.getWorldPosition(new THREE.Vector3());
  const fChip = chipRef.getWorldPosition(new THREE.Vector3());
  const die0 = dieRefs[0];
  const fDie = die0 ? die0.getWorldPosition(new THREE.Vector3()) : fChip.clone().add(new THREE.Vector3(-0.014, -0.014, 0.01));

  const puerta = rackRef.getObjectByName('deco_rack_2_6_puerta');
  const puertaVis0 = puerta ? puerta.visible : null;
  if (puerta) puerta.visible = false;
  const aletas = [];
  for (let i = 1; i <= 5; i++) {
    const a = rackRef.getObjectByName(`rack_2_6_servidor_3_chip_aleta_${i}`);
    if (a) { aletas.push(a); a.visible = false; }
  }
  dieRefs.forEach(o => { if (o) o.visible = false; });
  cellRefs.forEach(o => { if (o) o.visible = false; });

  const techo = [];
  ROOT.traverse(o => { if (/^(cubierta|uma_cubierta|uma_ventilador|uma_rejilla|uma_aro|chiller_|calor_chiller_|estacion_meteo|meteo_|deco_(cubierta|uma_|chiller_|meteo_|anemo_))/.test(o.name)) techo.push(o); });
  const techoVis = techo.map(o => o.visible);

  const meshesRack = [];
  rackRef.traverse(o => { if (o.isMesh && !/^deco_/.test(o.name) && (/gabinete|servidor|switch|power|pdu|net_drop/.test(o.name))) meshesRack.push(o); });
  const meshesSrv = [bladeRef, chipRef, ssdRef, ...ramRefs].filter(Boolean);
  const meshesComp = [chipRef, ...dieRefs].filter(Boolean);
  const meshesParts = [...cellRefs, dieRefs[0]].filter(Boolean);
  // Nivel 0: el Data Center como sistema (sala + equipos, sin entorno lejano)
  const meshesDC = [];
  ['frontera', 'entradas', 'procesos', 'salidas', 'retroalimentacion', 'resiliencia'].forEach(n => {
    const g = SUB[n];
    if (!g) return;
    g.traverse(o => {
      if (!o.isMesh || !o.visible) return;
      if (/^(deco_|lluvia|inundacion|nube|pulso|hilo|rayo|calor_|generador_humo|humo_emergencia|cielo|sol|luna)/.test(o.name)) return;
      meshesDC.push(o);
    });
  });

  const camDC = new THREE.Vector3(HX + 11, y0 + 5.5, HZ + HD / 2 + 9);
  const focoDC = new THREE.Vector3(HX, fy + 1.2, HZ);
  const camRack = V(fRack, new THREE.Vector3(1.5, 1.0, 4.2));
  const focoRack = fRack.clone().add(new THREE.Vector3(0, 0.1, 0));
  const camSrv = V(fSrv, new THREE.Vector3(0.45, 0.28, 1.35));
  const focoSrv = fSrv.clone().add(new THREE.Vector3(0.04, 0, 0.02));
  const camChip = V(fChip, new THREE.Vector3(0.1, 0.08, 0.42));
  const focoChip = fChip.clone();
  const camDie = V(fDie, new THREE.Vector3(0.035, 0.03, 0.14));
  const focoDie = fDie.clone();

  const ease = easeInOutCubic;
  const MOVE = 2.0, HOLD = 2.8;
  const etapas = [
    { cam: camDC, foco: focoDC, objs: meshesDC, txt: 'Recursividad · el Data Center es un sistema', techo: true, reveal: 'none' },
    { cam: camRack, foco: focoRack, objs: meshesRack, txt: 'Recursividad · dentro hay otro sistema: el rack', techo: false, reveal: 'none' },
    { cam: camSrv, foco: focoSrv, objs: meshesSrv, txt: 'Recursividad · el servidor: procesador, memoria y almacenamiento', techo: false, reveal: 'none' },
    { cam: camChip, foco: focoChip, objs: meshesComp, txt: 'Recursividad · el procesador también es un sistema', techo: false, reveal: 'dies' },
    { cam: camDie, foco: focoDie, objs: meshesParts, txt: 'Recursividad · y dentro, otra vez: partes que forman el todo', techo: false, reveal: 'cells' },
    { cam: camSrv, foco: focoSrv, objs: meshesSrv, txt: 'Recursividad · el mismo patrón a otra escala', techo: false, reveal: 'none' },
    { cam: camRack, foco: focoRack, objs: meshesRack, txt: 'Recursividad · el rack vuelve a ser el sistema contenedor', techo: false, reveal: 'none' },
    { cam: camDC, foco: focoDC, objs: meshesDC, txt: 'Recursividad · un sistema dentro de otro, una y otra vez', techo: true, reveal: 'none' },
    { cam: p0, foco: t0, objs: [], out: true, txt: 'Recursividad · el patrón se repite en cada nivel', techo: true, reveal: 'none' },
  ];

  let etapa = 0, tEtapa = performance.now(), fase = 'move';
  let pFrom = p0.clone(), tFrom = t0.clone();
  const tmpP = new THREE.Vector3(), tmpT = new THREE.Vector3();

  const applyReveal = (mode) => {
    dieRefs.forEach(o => { if (o) o.visible = mode === 'dies' || mode === 'cells'; });
    cellRefs.forEach(o => { if (o) o.visible = mode === 'cells'; });
  };

  const finish = () => {
    parpadear(meshesDC, false);
    parpadear(meshesRack, false);
    parpadear(meshesSrv, false);
    parpadear(meshesComp, false);
    parpadear(meshesParts, false);
    applyReveal('none');
    aletas.forEach(a => { a.visible = true; });
    if (puerta) puerta.visible = puertaVis0;
    techo.forEach((o, i) => { o.visible = techoVis[i]; });
    unlockScriptedCam(ctl, { wasDamp, wasAuto, cam, near0, p0, t0 });
    if (btnRc) btnRc.disabled = false;
    rcAnim = null;
  };

  rcAnim = requestAnimationFrame(function step(now) {
    const e = etapas[etapa], t = (now - tEtapa) / 1000;
    if (fase === 'move') {
      const u = ease(Math.min(t / MOVE, 1));
      aimScriptedCam(cam, ctl, tmpP.lerpVectors(pFrom, e.cam, u), tmpT.lerpVectors(tFrom, e.foco, u));
      estado.textContent = e.txt;
      if (t >= MOVE) {
        if (e.out) { finish(); return; }
        techo.forEach((o, i) => { o.visible = e.techo ? techoVis[i] : false; });
        applyReveal(e.reveal || 'none');
        fase = 'hold'; tEtapa = now;
      }
    } else {
      aimScriptedCam(cam, ctl, e.cam, e.foco);
      const on = Math.floor(t * 3.5) % 2 === 0;
      if (e.objs.length) parpadear(e.objs, true, on);
      estado.textContent = e.txt;
      if (t >= HOLD) {
        parpadear(e.objs, false);
        etapa++;
        if (etapa >= etapas.length) { finish(); return; }
        applyReveal(etapas[etapa].reveal || 'none');
        fase = 'move'; tEtapa = now;
        pFrom = cam.position.clone(); tFrom = ctl.target.clone();
      }
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
  if (!on) { if (cpAnim) cancelAnimationFrame(cpAnim); cpAnim = null; complementos.visible = false; return; }
  if (cpAnim) return; openGuide(18); complementos.visible = true; const start = performance.now();
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
const rotCausa = (txt, n) => {
  const cv = document.createElement('canvas'); cv.width = 640; cv.height = 160;
  const c = cv.getContext('2d');
  c.fillStyle = 'rgba(18, 22, 28, 0.92)'; c.fillRect(0, 0, 640, 160);
  c.strokeStyle = '#e74c3c'; c.lineWidth = 8; c.strokeRect(6, 6, 628, 148);
  c.fillStyle = '#f7f8fa'; c.font = '700 64px "Barlow Condensed", "Arial Narrow", sans-serif';
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 320, 84);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const r = new THREE.Mesh(
    new THREE.PlaneGeometry(8.4, 2.1),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false }),
  );
  r.name = n; r.renderOrder = 20; causas.add(r); return r;
};
const causaDefs = [
  { n: 'causa_sol', txt: 'SOL INTENSO', origen: () => sol.getWorldPosition(new THREE.Vector3()), objs: () => [sol], labelOff: new THREE.Vector3(0, 4.5, 0) },
  { n: 'causa_demanda', txt: 'PICO DE DEMANDA', origen: () => new THREE.Vector3(-27, 6, -13), objs: () => edificios, labelOff: new THREE.Vector3(0, 8.5, 0) },
  { n: 'causa_crac', txt: 'CRAC AVERIADO', origen: () => cracRf.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 1.6, 0)), objs: () => [cracRf, rejillaRf], labelOff: new THREE.Vector3(0, 3.2, 0) },
];
causaDefs.forEach(d => {
  d.rot = rotCausa(d.txt, d.n + '_rotulo');
  d.hilo = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1, 8), M.causa);
  d.hilo.name = d.n + '_hilo'; d.hilo.renderOrder = 9; causas.add(d.hilo);
  d.pulso = new THREE.Mesh(new THREE.SphereGeometry(0.4, 14, 10), M.causa);
  d.pulso.name = d.n + '_pulso'; d.pulso.renderOrder = 9; causas.add(d.pulso);
});
const rotEfecto = rotCausa('EFECTO: SALA +6 °C', 'efecto_rotulo');
function animarMulticausalidad() {
  if (mcAnim || enAnim || hoAnim || rfAnim) return; openGuide(19); btnMc.disabled = true;
  const cam = stage._camera, ctl = stage._controls;
  const p0 = cam.position.clone(), t0 = ctl.target.clone(), wasAuto = ctl.autoRotate;
  ctl.autoRotate = false; ctl.enabled = false;
  const ease = easeInOutCubic;
  const V = (a, b) => a.clone().add(b);

  // Vista general más cercana + zooms a cada causa
  const focoAll = new THREE.Vector3(HX - 4, y0 + 2.2, HZ);
  const camAll = new THREE.Vector3(HX + 16, RY + 14, HZ + 28);
  const solPos = new THREE.Vector3(HX - 16, RY + 22, HZ + 4);
  const camSol = V(solPos, new THREE.Vector3(10, -2, 14));
  const focoSol = solPos.clone().add(new THREE.Vector3(2, -1, -2));
  const demPos = new THREE.Vector3(-27, 6, -13);
  const camDem = V(demPos, new THREE.Vector3(18, 10, 22));
  const focoDem = demPos.clone().add(new THREE.Vector3(4, 2, 2));
  const cracPos = cracRf.position.clone().add(new THREE.Vector3(0, 1.2, 0));
  const camCrac = V(cracPos, new THREE.Vector3(6, 4, 9));
  const focoCrac = cracPos.clone().add(new THREE.Vector3(1, 0.4, 1));
  const camEfecto = new THREE.Vector3(HX + 10, y0 + 7, HZ + 14);
  const focoEfecto = efectoP.clone().add(new THREE.Vector3(0, 0.8, 0));

  const techoMc = ['cubierta', 'uma_cubierta', 'uma_ventilador_1', 'uma_ventilador_2', 'chiller_1', 'chiller_2', 'chiller_3', 'chiller_4', 'chiller_1_ventilador', 'chiller_2_ventilador', 'chiller_3_ventilador', 'chiller_4_ventilador', 'calor_chiller_1', 'calor_chiller_2', 'calor_chiller_3', 'calor_chiller_4', 'antena_parabolica', 'antena_parabolica_base'].map(n => ROOT.getObjectByName(n)).filter(Boolean);
  const techoMcVis = techoMc.map(o => o.visible);

  // Más pausada: cada causa se presenta con zoom y se sostiene
  const MOVE = 2.2, HOLD = 3.4, CONV = 3.2, HOLD2 = 4.0, OUT = 2.4;
  const etapas = [
    { cam: camAll, foco: focoAll, txt: 'Multicausalidad · un efecto, varias causas', show: -1, lines: false, efecto: false, techo: false },
    { cam: camSol, foco: focoSol, txt: 'Multicausalidad · causa 1/3: sol intenso', show: 0, lines: false, efecto: false, techo: true },
    { cam: camDem, foco: focoDem, txt: 'Multicausalidad · causa 2/3: pico de demanda', show: 1, lines: false, efecto: false, techo: true },
    { cam: camCrac, foco: focoCrac, txt: 'Multicausalidad · causa 3/3: CRAC averiado', show: 2, lines: false, efecto: false, techo: false },
    { cam: camEfecto, foco: focoEfecto, txt: 'Multicausalidad · las tres causas convergen', show: 2, lines: true, efecto: true, techo: false, conv: true },
    { cam: camEfecto, foco: focoEfecto, txt: 'Multicausalidad · ninguna causa explica el efecto por sí sola', show: 2, lines: true, efecto: true, techo: false, holdFinal: true },
    { cam: p0, foco: t0, txt: 'Multicausalidad · varias causas, un mismo efecto', out: true, techo: true },
  ];

  const start = performance.now();
  cielo.visible = true; posCielo(0.05);
  sol.position.copy(solPos); luna.visible = false;
  const hl = new Map();
  const marcar = (objs, on) => objs.forEach(o => {
    if (!o.isMesh) return;
    if (on) {
      if (!hl.has(o)) hl.set(o, o.material);
      const m = hl.get(o).clone(); m.emissive = new THREE.Color(0xc0392b); m.emissiveIntensity = 0.95; o.material = m;
    } else if (hl.has(o)) o.material = hl.get(o);
  });
  const winBase = M.ventana.emissiveIntensity;
  causas.visible = true;
  causaDefs.forEach(d => { d.rot.visible = false; d.hilo.visible = false; d.pulso.visible = false; });
  rotEfecto.visible = false;

  let etapa = 0, tEtapa = start, fase = 'move';
  let pFrom = p0.clone(), tFrom = t0.clone();
  let convU = 0;
  const tmpP = new THREE.Vector3(), tmpT = new THREE.Vector3();

  const placeLabels = (maxI) => {
    causaDefs.forEach((d, j) => {
      if (j > maxI) { d.rot.visible = false; return; }
      d.rot.visible = true;
      const o = d.origen();
      d.rot.position.copy(o).add(d.labelOff);
      // Escala según distancia a cámara para que se lean bien
      const dist = cam.position.distanceTo(d.rot.position);
      const s = THREE.MathUtils.clamp(dist / 22, 0.85, 1.55);
      d.rot.scale.setScalar(s);
    });
  };

  const finish = () => {
    causas.visible = false;
    marcar([...edificios, sol, cracRf, rejillaRf], false);
    M.ventana.emissiveIntensity = winBase;
    cielo.visible = false;
    techoMc.forEach((o, i) => { o.visible = techoMcVis[i]; });
    luna.visible = true;
    termo.userData.pintarTemp(20);
    cam.position.copy(p0); ctl.target.copy(t0); ctl.update();
    ctl.enabled = true; ctl.autoRotate = wasAuto;
    btnMc.disabled = false; mcAnim = null;
  };

  mcAnim = requestAnimationFrame(function step(now) {
    const e = etapas[etapa], t = (now - tEtapa) / 1000;
    let temp = 20;
    causas.children.forEach(m => { if (m.isMesh && m.geometry.type === 'PlaneGeometry') m.lookAt(cam.position); });

    if (fase === 'move') {
      const u = ease(Math.min(t / MOVE, 1));
      cam.position.lerpVectors(pFrom, e.cam, u);
      ctl.target.lerpVectors(tFrom, e.foco, u);
      ctl.update();
      estado.textContent = e.txt;
      if (e.techo === false) techoMc.forEach(o => { o.visible = false; });
      if (t >= MOVE) {
        if (e.out) { finish(); return; }
        if (e.techo) techoMc.forEach((o, i) => { o.visible = techoMcVis[i]; });
        else techoMc.forEach(o => { o.visible = false; });
        // Mostrar causas hasta la actual
        causaDefs.forEach((d, j) => {
          if (j <= e.show) marcar(d.objs(), true);
        });
        if (e.show >= 1) M.ventana.emissiveIntensity = 2.6;
        placeLabels(e.show);
        if (e.efecto) {
          rotEfecto.visible = true;
          rotEfecto.position.copy(efectoP).add(new THREE.Vector3(0, 3.2, 0));
          rotEfecto.scale.setScalar(1.15);
        }
        fase = e.conv ? 'conv' : 'hold';
        tEtapa = now; convU = 0;
      }
    } else if (fase === 'conv') {
      cam.position.copy(e.cam); ctl.target.copy(e.foco); ctl.update();
      placeLabels(2);
      rotEfecto.visible = true;
      rotEfecto.position.copy(efectoP).add(new THREE.Vector3(0, 3.2, 0));
      const u = Math.min(t / CONV, 1);
      convU = u;
      causaDefs.forEach(d => {
        const A = d.origen(), B = efectoP;
        const uu = Math.min(u * 1.15, 1);
        d.hilo.visible = true; d.pulso.visible = true;
        const len = A.distanceTo(B) * uu;
        d.hilo.scale.set(1, Math.max(len, 0.01), 1);
        d.hilo.position.copy(A.clone().lerp(B, uu / 2));
        d.hilo.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
        d.pulso.position.copy(A.clone().lerp(B, uu));
      });
      temp = 20 + 6 * ease(u);
      estado.textContent = `Multicausalidad · las tres causas convergen · sala ${Math.round(temp)} °C`;
      if (t >= CONV) { fase = 'hold'; tEtapa = now; }
    } else {
      cam.position.copy(e.cam); ctl.target.copy(e.foco); ctl.update();
      placeLabels(e.show);
      if (e.efecto) {
        rotEfecto.visible = true;
        rotEfecto.position.copy(efectoP).add(new THREE.Vector3(0, 3.2 + 0.15 * Math.sin(t * 2), 0));
        M.causa.emissiveIntensity = 1.0 + 0.6 * Math.sin(t * 2.5);
        causaDefs.forEach(d => {
          d.hilo.visible = true; d.pulso.visible = true;
          const A = d.origen(), B = efectoP;
          const len = A.distanceTo(B);
          d.hilo.scale.set(1, len, 1);
          d.hilo.position.copy(A.clone().lerp(B, 0.5));
          d.hilo.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
          d.pulso.position.copy(B);
        });
        temp = 26;
      }
      estado.textContent = e.txt;
      const holdT = e.holdFinal ? HOLD2 : HOLD;
      if (t >= holdT) {
        etapa++;
        if (etapa >= etapas.length) { finish(); return; }
        fase = 'move'; tEtapa = now;
        pFrom = cam.position.clone(); tFrom = ctl.target.clone();
      }
    }

    const tInt = Math.round(temp);
    if (termo.userData.ultimo !== tInt) { termo.userData.ultimo = tInt; termo.userData.pintarTemp(tInt); }
    M.led.emissiveIntensity = ledBase.ei * (0.8 + 0.6 * (temp - 20) / 6);
    mcAnim = requestAnimationFrame(step);
  });
}

// ===== ANIMACIÓN: estructura (recorrido guiado con zooms por etapa) =====
let esAnim = null;
M.aireEst = mat('aire_estructura', 0xb5d9fd, 1, 0, { emissive: 0x94bce3, emissiveIntensity: 0.8, transparent: true, opacity: 0.35, depthWrite: false });
M.estDatos = mat('est_datos', 0x94bce3, 0.2, 0, { emissive: 0x5980a6, emissiveIntensity: 2.2 });
M.estEnergia = mat('est_energia', 0xe8a01a, 0.3, 0, { emissive: 0xe8a01a, emissiveIntensity: 2.0 });
const estFx = new THREE.Group(); estFx.name = 'estructura_fx'; estFx.visible = false; ROOT.add(estFx);
const estAire = new THREE.Group(); estAire.name = 'estructura_aire'; estFx.add(estAire);
const estPulsos = new THREE.Group(); estPulsos.name = 'estructura_pulsos'; estFx.add(estPulsos);
const estHlCache = new Map();
const noRaycast = o => { if (o.isMesh) o.raycast = () => {}; };
const estPuertas = [];
filas.forEach(f => f.traverse(o => { if (/^deco_rack_.*_puerta$/.test(o.name)) estPuertas.push(o); }));
const estPartes = { racks: [], servidores: [], switches: [], red: [], energia: [], bandejas: [], cracs: [] };
ROOT.traverse(o => {
  const e = o.userData && o.userData.estructura;
  if (!e || !o.isMesh) return;
  if (e.rol === 'rack') estPartes.racks.push(o);
  else if (e.rol === 'servidor') estPartes.servidores.push(o);
  else if (e.rol === 'switch') estPartes.switches.push(o);
  else if (e.rol === 'red') estPartes.red.push(o);
  else if (e.rol === 'energia') estPartes.energia.push(o);
  else if (e.rol === 'bandeja') estPartes.bandejas.push(o);
  else if (e.rol === 'crac') estPartes.cracs.push(o);
});
filas.forEach((f, i) => {
  ['deco_bandeja_cable_rojo_', 'deco_bandeja_cable_azul_'].forEach(pref => {
    const o = f.getObjectByName(`${pref}${i + 1}`);
    if (o) { o.userData.estructura = { rol: 'red', fila: i + 1 }; estPartes.red.push(o); }
  });
});
function estSetVisible(list, on) { list.forEach(o => { o.visible = on; }); }
function estClearHl() {
  estHlCache.forEach((m, o) => { o.material = m; });
  estHlCache.clear();
}
function estHighlight(objs, on, tint = 0xb5d9fd, em = 0xb497cf, ei = 1.05) {
  if (!on) { estClearHl(); return; }
  const set = new Set(objs);
  ROOT.traverse(o => {
    if (!o.isMesh || !o.visible || /^(deco_|lluvia|inundacion|nube|pulso|hilo|rayo|calor_|generador_humo|humo_emergencia|cielo|sol|luna|eqf_|estructura_|est_)/.test(o.name)) return;
    if (!estHlCache.has(o)) estHlCache.set(o, o.material);
    const base = estHlCache.get(o), m = base.clone();
    if (set.has(o)) { m.emissive = new THREE.Color(em); m.emissiveIntensity = ei; m.color = new THREE.Color(tint); }
    else { m.color = base.color.clone().lerp(new THREE.Color(0x2b2b2d), 0.65); if (m.emissive) m.emissiveIntensity = (m.emissiveIntensity || 0) * 0.12; if (m.transparent) m.opacity *= 0.45; }
    o.material = m;
  });
}
function estStopFlujos() {
  estPulsos.clear(); estAire.clear();
  if (M.aireEst) M.aireEst.opacity = 0.2;
}
function estStartFlujos() {
  estStopFlujos();
  const filasVis = filas.filter(f => f.visible);
  for (let i = 0; i < Math.min(Math.max(filasVis.length - 1, 0), 2); i++) {
    const zMid = (zFila(i) + zFila(i + 1)) / 2;
    for (let k = 0; k < 12; k++) {
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), M.aireEst);
      p.name = `est_aire_${i}_${k}`;
      p.userData = { x0: HX - 4.2 + (k % 6) * 1.7, z: zMid, phase: k / 12, tipo: 'aire' };
      noRaycast(p); estAire.add(p);
    }
  }
  filasVis.slice(0, 2).forEach((f, fi) => {
    for (let k = 0; k < 5; k++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), M.estDatos);
      b.name = `est_dato_${fi}_${k}`;
      b.userData = { y: fy + rackH + 0.55, z: zFila(fi), off: k / 5, tipo: 'datos', x0: HX - 4.8, x1: HX + 4.8 };
      noRaycast(b); estPulsos.add(b);
    }
  });
  estPartes.energia.filter(o => /_power$/.test(o.name) && o.parent && o.parent.parent && o.parent.parent.visible).slice(0, 12).forEach((o, i) => {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), M.estEnergia);
    b.name = `est_ener_${i}`;
    const p = o.getWorldPosition(new THREE.Vector3());
    b.userData = { x: p.x, z: p.z, y0: fy + 0.12, y1: fy + rackH * 0.85, off: i / 12, tipo: 'energia' };
    noRaycast(b); estPulsos.add(b);
  });
}
function estTickFlujos(t) {
  const ritmo = 0.5 + 0.5 * Math.sin(t * 2.2);
  M.aireEst.opacity = 0.28 + 0.32 * ritmo;
  M.estDatos.emissiveIntensity = 1.4 + 1.0 * ritmo;
  M.estEnergia.emissiveIntensity = 1.2 + 1.0 * ritmo;
  estAire.children.forEach(p => {
    const ph = (p.userData.phase + t * 0.28) % 1;
    p.position.set(p.userData.x0, fy + 0.35 + ph * 1.7, p.userData.z + Math.sin(ph * Math.PI * 2) * 0.18);
    p.scale.setScalar(0.65 + 0.45 * Math.sin(ph * Math.PI));
  });
  estPulsos.children.forEach(b => {
    if (b.userData.tipo === 'datos') {
      const uB = (b.userData.off + t * 0.4) % 1;
      b.position.set(b.userData.x0 + (b.userData.x1 - b.userData.x0) * uB, b.userData.y, b.userData.z);
    } else if (b.userData.tipo === 'energia') {
      const uB = (b.userData.off + t * 0.5) % 1;
      b.position.set(b.userData.x, b.userData.y0 + (b.userData.y1 - b.userData.y0) * uB, b.userData.z);
    }
  });
}
// ===== ANIMACIÓN: totalidad (DC completo → resaltar cada parte → todas juntas) =====
let totAnim = null;
function animarTotalidad() {
  if (totAnim || esAnim || jerAnim || eqfAnim || rcAnim || mcAnim) return;
  openGuide(3);
  const cam = stage._camera, ctl = stage._controls;
  const p0 = cam.position.clone(), t0 = ctl.target.clone(), wasAuto = ctl.autoRotate, near0 = cam.near;
  const wasDamp = lockScriptedCam(ctl);
  if (btnTot) btnTot.disabled = true;
  cam.near = 0.1; cam.updateProjectionMatrix();
  ROOT.updateMatrixWorld(true);

  const techo = [];
  ROOT.traverse(o => { if (/^(cubierta|uma_cubierta|uma_ventilador|uma_rejilla|uma_aro|chiller_|calor_chiller_|estacion_meteo|meteo_|deco_(cubierta|uma_|chiller_|meteo_|anemo_))/.test(o.name)) techo.push(o); });
  const techoVis = techo.map(o => o.visible);
  techo.forEach(o => { o.visible = false; });
  estPuertas.forEach(p => { p.visible = false; });

  // Abrir paso visual a la sala NOC (detrás de tabique_3/4)
  const tabiquesNoc = [];
  ROOT.traverse(o => { if (/^(tabique_3|tabique_4)$/.test(o.name)) tabiquesNoc.push(o); });
  const tabiquesVis = tabiquesNoc.map(o => o.visible);
  tabiquesNoc.forEach(o => { o.visible = false; });

  const pick = (test) => {
    const out = [];
    ROOT.traverse(o => {
      if (!o.isMesh || !o.visible) return;
      if (/^(deco_rack_.*_puerta|lluvia|inundacion|nube|pulso|hilo|rayo|calor_|generador_humo|humo_emergencia|cielo|sol|luna|eqf_|est_|ventana)/.test(o.name)) return;
      if (test(o.name)) out.push(o);
    });
    return out;
  };
  const servidores = estPartes.servidores.filter(o => o.visible && o.parent && o.parent.parent && o.parent.parent.visible);
  const switches = estPartes.switches.filter(o => o.visible && o.parent && o.parent.parent && o.parent.parent.visible);
  const almacenamiento = pick(n => /ssd|ups_rojo_bat|ups_extra|ups_puerta|ups_display|ups_sticker|ups_zocalo|sala_ups|bater/.test(n));
  const electrico = [
    ...estPartes.energia.filter(o => o.visible),
    ...pick(n => /^(transformador|acometida|alimentador|generador$|poste_acometida|bus_electrico|pdu_azul|ups_rojo_bastidor)/.test(n) || /_power|_pdu|_power_base/.test(n)),
  ];
  const refrigeracion = [
    ...estPartes.cracs.filter(o => o.visible),
    ...pick(n => /^(crac_|chiller_|uma_|calor_chiller)/.test(n)),
  ];
  const seguridad = pick(n => /^(cerco_|porton|deco_extintor|extintor|placa_sitio)/.test(n));
  const noc = [];
  const nocRoot = ROOT.getObjectByName('noc');
  if (nocRoot) nocRoot.traverse(o => { if (o.isMesh && o.visible) noc.push(o); });
  pick(n => /^(noc_|deco_noc|bus_monitoreo_noc)/.test(n)).forEach(o => { if (!noc.includes(o)) noc.push(o); });
  const todos = [...new Set([...servidores, ...switches, ...almacenamiento, ...electrico, ...refrigeracion, ...seguridad, ...noc])];

  // Resaltado liviano: muta emissive in-place por material único (sin clonar ni recorrer ROOT).
  const totHlMats = new Map();
  const totClearHl = () => {
    totHlMats.forEach(prev => {
      const mat = prev.mat;
      if (!mat) return;
      if (prev.emissive) {
        mat.emissive.copy(prev.emissive);
        mat.emissiveIntensity = prev.ei;
      } else if (mat.emissive) {
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
      }
    });
    totHlMats.clear();
  };
  const totHighlight = (objs) => {
    totClearHl();
    if (!objs || !objs.length) return;
    objs.forEach(o => {
      if (!o || !o.isMesh || !o.visible || !o.material || Array.isArray(o.material)) return;
      const mat = o.material;
      if (totHlMats.has(mat.uuid)) return;
      totHlMats.set(mat.uuid, {
        mat,
        emissive: mat.emissive ? mat.emissive.clone() : null,
        ei: mat.emissiveIntensity || 0,
      });
      if (!mat.emissive) mat.emissive = new THREE.Color(0x000000);
      mat.emissive.setHex(0xb497cf);
      mat.emissiveIntensity = Math.max(mat.emissiveIntensity || 0, 0.35) + 0.9;
    });
  };

  const focoSala = new THREE.Vector3(HX, fy + 1.1, HZ);
  const camSala = new THREE.Vector3(HX + 10, y0 + 4.5, HZ + HD / 2 + 8);
  const camSrv = new THREE.Vector3(HX + 4.5, fy + 2.4, HZ + HD / 2 + 4.2);
  const focoSrv = new THREE.Vector3(HX, fy + 1.0, zFila(0));
  const camSw = new THREE.Vector3(HX + 3.2, fy + 3.0, HZ + HD / 2 + 3.6);
  const focoSw = new THREE.Vector3(HX, fy + rackH * 0.75, zFila(0));
  const ups = ROOT.getObjectByName('sala_ups') || ROOT.getObjectByName('ups_extra_0');
  const fUps = ups ? ups.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(HX - 6, fy + 1, HZ);
  const camAlm = fUps.clone().add(new THREE.Vector3(5, 3.2, 6));
  const focoAlm = fUps.clone().add(new THREE.Vector3(0, 0.8, 0));
  const tx = ROOT.getObjectByName('transformador');
  const fTx = tx ? tx.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(HX + 8, fy + 1, HZ);
  const camElec = fTx.clone().add(new THREE.Vector3(8, 5, 10));
  const focoElec = fTx.clone().lerp(focoSala, 0.35);
  const crac = ROOT.getObjectByName('crac_1');
  const fCrac = crac ? crac.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(HX - 4, fy + 1, HZ - HD / 2);
  const camFrio = fCrac.clone().add(new THREE.Vector3(5, 3.5, 7));
  const focoFrio = fCrac.clone().lerp(focoSala, 0.4);
  const porton = ROOT.getObjectByName('porton');
  const fPort = porton ? porton.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(0, y0 + 1, 12);
  const camSeg = fPort.clone().add(new THREE.Vector3(6, 5, 10));
  const focoSeg = fPort.clone().add(new THREE.Vector3(0, 1, -4));
  // Sala NOC (~7×3.6 m): vista frontal desde el sur, sin tabiques tapando
  const camNoc = new THREE.Vector3(NX + 1.7, y0 + 4.8, NZ + 8.5);
  const focoNoc = new THREE.Vector3(NX + 1.7, y0 + 0.9, NZ - 0.2);
  const camTodo = new THREE.Vector3(HX + 12, y0 + 5.5, HZ + HD / 2 + 10);
  const focoTodo = new THREE.Vector3(HX, fy + 1.3, HZ);

  const ease = easeInOutCubic;
  const MOVE = 1.5, HOLD = 1.8, HOLD_ALL = 2.4;
  const etapas = [
    { cam: camSala, foco: focoSala, objs: [], txt: 'Totalidad · el Data Center como un solo sistema' },
    { cam: camSrv, foco: focoSrv, objs: servidores, txt: 'Totalidad · servidores' },
    { cam: camSw, foco: focoSw, objs: switches, txt: 'Totalidad · switches de red' },
    { cam: camAlm, foco: focoAlm, objs: almacenamiento, txt: 'Totalidad · almacenamiento y respaldo' },
    { cam: camElec, foco: focoElec, objs: electrico, txt: 'Totalidad · sistemas eléctricos' },
    { cam: camFrio, foco: focoFrio, objs: refrigeracion, txt: 'Totalidad · refrigeración' },
    { cam: camNoc, foco: focoNoc, objs: noc, txt: 'Totalidad · sala NOC (monitoreo y operación)' },
    { cam: camSeg, foco: focoSeg, objs: seguridad, txt: 'Totalidad · seguridad perimetral' },
    { cam: camTodo, foco: focoTodo, objs: todos, txt: 'Totalidad · todos los elementos forman el sistema', all: true },
    { cam: p0, foco: t0, objs: [], txt: 'Totalidad · el sistema se entiende como un todo', out: true },
  ];

  let etapa = 0, tEtapa = performance.now(), fase = 'move';
  let pFrom = p0.clone(), tFrom = t0.clone();
  const tmpP = new THREE.Vector3(), tmpT = new THREE.Vector3();
  const tStart = performance.now();
  const MAX_MS = 75_000;
  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    if (totAnim) cancelAnimationFrame(totAnim);
    totAnim = null;
    try { totClearHl(); } catch (_) { /* ignore */ }
    estPuertas.forEach(p => { p.visible = true; });
    techo.forEach((o, i) => { o.visible = techoVis[i]; });
    tabiquesNoc.forEach((o, i) => { o.visible = tabiquesVis[i]; });
    unlockScriptedCam(ctl, { wasDamp, wasAuto, cam, near0, p0, t0 });
    if (btnTot) btnTot.disabled = false;
  };

  totAnim = requestAnimationFrame(function step(now) {
    if (finished) return;
    if (now - tStart > MAX_MS) { finish(); return; }
    const e = etapas[etapa];
    if (!e) { finish(); return; }
    const t = (now - tEtapa) / 1000;
    if (fase === 'move') {
      const u = ease(Math.min(t / MOVE, 1));
      aimScriptedCam(cam, ctl, tmpP.lerpVectors(pFrom, e.cam, u), tmpT.lerpVectors(tFrom, e.foco, u));
      estado.textContent = e.txt;
      if (t >= MOVE) {
        if (e.out) { finish(); return; }
        totHighlight(e.objs);
        fase = 'hold';
        tEtapa = performance.now();
      }
    } else {
      aimScriptedCam(cam, ctl, e.cam, e.foco);
      estado.textContent = e.txt;
      const holdT = e.all ? HOLD_ALL : HOLD;
      if (t >= holdT) {
        etapa++;
        if (etapa >= etapas.length) { finish(); return; }
        fase = 'move';
        tEtapa = performance.now();
        pFrom = cam.position.clone();
        tFrom = ctl.target.clone();
      }
    }
    totAnim = requestAnimationFrame(step);
  });
}
function animarEstructura() {
  if (esAnim || jerAnim || eqfAnim || cpxAnim2 || totAnim) return;
  openGuide(16);
  const cam = stage._camera, ctl = stage._controls;
  const p0 = cam.position.clone(), t0 = ctl.target.clone(), wasAuto = ctl.autoRotate, near0 = cam.near;
  const wasDamp = lockScriptedCam(ctl);
  if (btnEs) btnEs.disabled = true;
  cam.near = 0.08; cam.updateProjectionMatrix();
  ROOT.updateMatrixWorld(true);

  const techo = [];
  ROOT.traverse(o => { if (/^(cubierta|uma_cubierta|uma_ventilador|uma_rejilla|uma_aro|chiller_|calor_chiller_|estacion_meteo|meteo_|deco_(cubierta|uma_|chiller_|meteo_|anemo_))/.test(o.name)) techo.push(o); });
  const techoVis = techo.map(o => o.visible);
  techo.forEach(o => { o.visible = false; });
  estPuertas.forEach(p => { p.visible = false; });

  // Empezar ocultando equipos/conexiones; racks (gabinetes) visibles
  estSetVisible(estPartes.servidores, false);
  estSetVisible(estPartes.switches, false);
  estSetVisible(estPartes.red, false);
  estSetVisible(estPartes.energia, false);
  estPartes.cracs.forEach(o => { o.visible = false; });
  estFx.visible = true; estStopFlujos();

  const rackFocus = ROOT.getObjectByName('rack_1_4') || ROOT.getObjectByName('rack_2_4') || ROOT.getObjectByName('rack_2_3');
  const gabFocus = rackFocus && (rackFocus.getObjectByName(`${rackFocus.name}_gabinete`) || rackFocus);
  const fRack = gabFocus ? gabFocus.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(HX, fy + 1, HZ);
  const cracFocus = ROOT.getObjectByName('crac_1');
  const fCrac = cracFocus ? cracFocus.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(HX - 4.4, fy + 1, HZ - HD / 2);

  const V = (a, b) => a.clone().add(b);
  const foco = new THREE.Vector3(HX, fy + 1.0, HZ);
  const camIn = new THREE.Vector3(HX + 8.5, y0 + 3.2, HZ + HD / 2 + 5.5);
  const camRed = V(fRack, new THREE.Vector3(0.55, 2.5, 3.6));
  const focoRed = fRack.clone().add(new THREE.Vector3(0, 1.45, 0));
  // Vista trasera de la fila: se ven el bus amarillo y los whips subiendo a cada rack
  const zEnergia = zFila(0);
  const camEnergia = new THREE.Vector3(HX + 4.8, fy + 2.1, zEnergia - 3.4);
  const focoEnergia = new THREE.Vector3(HX - 0.4, fy + 0.85, zEnergia);
  const camFrio = V(fCrac, new THREE.Vector3(3.2, 2.2, 4.5));
  const focoFrio = fCrac.clone().lerp(new THREE.Vector3(HX, fy + 0.9, (zFila(0) + zFila(1)) / 2), 0.45);
  const camTodo = new THREE.Vector3(HX + 10, y0 + 4.2, HZ + HD / 2 + 7.5);
  const focoTodo = new THREE.Vector3(HX, fy + 1.2, HZ);

  const ease = easeInOutCubic;
  // 1–3: montaje progresivo en vista sala; luego zooms a red / energía / frío / conjunto
  const IN = 1.8, P1 = 3.0, P2 = 3.0, P3 = 3.0, MOVE = 1.6, HOLD = 3.0, P6 = 3.4, OUT = 1.6;
  const T0 = IN, T1 = T0 + P1, T2 = T1 + P2, T3 = T2 + P3;
  const T3m = T3 + MOVE, T3h = T3m + HOLD;
  const T4m = T3h + MOVE, T4 = T4m + HOLD;
  const T5m = T4 + MOVE, T5 = T5m + HOLD;
  const T6m = T5 + MOVE, T6 = T6m + P6, T7 = T6 + OUT;
  const start = performance.now();
  const tmpP = new THREE.Vector3(), tmpT = new THREE.Vector3();
  let eqOn = false, redOn = false, enerOn = false, frioOn = false, flujosOn = false;
  const eqAll = [...estPartes.servidores, ...estPartes.switches];

  const finish = () => {
    estClearHl();
    estStopFlujos();
    estFx.visible = false;
    estPuertas.forEach(p => { p.visible = true; });
    estSetVisible(estPartes.servidores, true);
    estSetVisible(estPartes.switches, true);
    estSetVisible(estPartes.red, true);
    estSetVisible(estPartes.energia, true);
    estPartes.cracs.forEach(o => { o.visible = true; });
    techo.forEach((o, i) => { o.visible = techoVis[i]; });
    unlockScriptedCam(ctl, { wasDamp, wasAuto, cam, near0, p0, t0 });
    if (btnEs) btnEs.disabled = false;
    esAnim = null;
  };

  const lerpCam = (fromP, toP, fromT, toT, u) => {
    aimScriptedCam(cam, ctl, tmpP.lerpVectors(fromP, toP, u), tmpT.lerpVectors(fromT, toT, u));
  };

  esAnim = requestAnimationFrame(function step(now) {
    const t = (now - start) / 1000;
    if (t < T0) {
      const u = ease(t / IN);
      lerpCam(p0, camIn, t0, foco, u);
      estado.textContent = 'Estructura · la sala se organiza para operar';
    } else if (t < T1) {
      aimScriptedCam(cam, ctl, camIn, foco);
      const u = (t - T0) / P1;
      const nShow = Math.floor(u * estPartes.racks.length);
      estHighlight(estPartes.racks.slice(0, Math.max(nShow, 1)), true);
      estado.textContent = 'Estructura · 1 · racks organizados en filas';
    } else if (t < T2) {
      aimScriptedCam(cam, ctl, camIn, foco);
      if (!eqOn) {
        eqOn = true;
        estClearHl();
        estSetVisible(estPartes.servidores, true);
        estSetVisible(estPartes.switches, true);
      }
      const u = (t - T1) / P2;
      const nShow = Math.floor(u * eqAll.length);
      estHighlight(eqAll.slice(0, Math.max(nShow, 1)), true);
      estado.textContent = 'Estructura · 2 · servidores y switches dentro de cada rack';
    } else if (t < T3) {
      aimScriptedCam(cam, ctl, camIn, foco);
      if (!redOn) {
        redOn = true;
        estSetVisible(estPartes.red, true);
        estHighlight([...estPartes.red, ...estPartes.switches, ...estPartes.bandejas], true);
        filas.filter(f => f.visible).slice(0, 2).forEach((f, fi) => {
          for (let k = 0; k < 5; k++) {
            const b = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), M.estDatos);
            b.userData = { y: fy + rackH + 0.55, z: zFila(fi), off: k / 5, tipo: 'datos', x0: HX - 4.8, x1: HX + 4.8 };
            noRaycast(b); estPulsos.add(b);
          }
        });
      }
      estTickFlujos(now / 1000);
      estado.textContent = 'Estructura · 3 · cables de red conectan los equipos';
    } else if (t < T3m) {
      const u = ease((t - T3) / MOVE);
      lerpCam(camIn, camRed, foco, focoRed, u);
      estTickFlujos(now / 1000);
      estado.textContent = 'Estructura · 3 · detalle de la red sobre los racks';
    } else if (t < T3h) {
      aimScriptedCam(cam, ctl, camRed, focoRed);
      estTickFlujos(now / 1000);
      estado.textContent = 'Estructura · 3 · detalle de la red sobre los racks';
    } else if (t < T4m) {
      const u = ease((t - T3h) / MOVE);
      lerpCam(camRed, camEnergia, focoRed, focoEnergia, u);
      if (!enerOn) {
        enerOn = true;
        // Quitar pulsos de red para no mezclar la lectura
        estPulsos.clear();
        estSetVisible(estPartes.energia, true);
        // Amarillo intenso: bus + whips + PDU (no teñir de azul)
        estHighlight(estPartes.energia, true, 0xffc14a, 0xe8a01a, 2.4);
        const whips = estPartes.energia.filter(o => /_power$/.test(o.name) && o.visible);
        const lista = whips.length ? whips : estPartes.energia.filter(o => o.visible).slice(0, 12);
        lista.forEach((o, i) => {
          const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), M.estEnergia);
          const p = o.getWorldPosition(new THREE.Vector3());
          b.userData = { x: p.x, z: p.z, y0: fy + 0.12, y1: fy + rackH * 0.85, off: i / Math.max(lista.length, 1), tipo: 'energia' };
          noRaycast(b); estPulsos.add(b);
        });
      }
      estTickFlujos(now / 1000);
      estado.textContent = 'Estructura · 4 · energía sube del piso técnico a cada rack';
    } else if (t < T4) {
      aimScriptedCam(cam, ctl, camEnergia, focoEnergia);
      estTickFlujos(now / 1000);
      estado.textContent = 'Estructura · 4 · energía sube del piso técnico a cada rack';
    } else if (t < T5m) {
      const u = ease((t - T4) / MOVE);
      lerpCam(camEnergia, camFrio, focoEnergia, focoFrio, u);
      if (!frioOn) {
        frioOn = true;
        estPartes.cracs.forEach(o => { o.visible = true; });
        estHighlight([...estPartes.cracs], true);
        for (let i = 0; i < Math.min(Math.max(filas.filter(f => f.visible).length - 1, 0), 2); i++) {
          const zMid = (zFila(i) + zFila(i + 1)) / 2;
          for (let k = 0; k < 12; k++) {
            const p = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), M.aireEst);
            p.userData = { x0: HX - 4.2 + (k % 6) * 1.7, z: zMid, phase: k / 12, tipo: 'aire' };
            noRaycast(p); estAire.add(p);
          }
        }
      }
      estTickFlujos(now / 1000);
      estado.textContent = 'Estructura · 5 · refrigeración circula por los pasillos';
    } else if (t < T5) {
      aimScriptedCam(cam, ctl, camFrio, focoFrio);
      estTickFlujos(now / 1000);
      estado.textContent = 'Estructura · 5 · refrigeración circula por los pasillos';
    } else if (t < T6m) {
      const u = ease((t - T5) / MOVE);
      lerpCam(camFrio, camTodo, focoFrio, focoTodo, u);
      if (!flujosOn) { estClearHl(); estStartFlujos(); flujosOn = true; }
      estTickFlujos(now / 1000);
      estado.textContent = 'Estructura · 6 · todo conectado: así funciona el Data Center';
    } else if (t < T6) {
      aimScriptedCam(cam, ctl, camTodo, focoTodo);
      estTickFlujos(now / 1000);
      estado.textContent = 'Estructura · 6 · todo conectado: así funciona el Data Center';
    } else if (t < T7) {
      const u = ease((t - T6) / OUT);
      lerpCam(camTodo, p0, focoTodo, t0, u);
      estado.textContent = 'Estructura · la distribución correcta forma el sistema';
    } else {
      finish();
      return;
    }
    esAnim = requestAnimationFrame(step);
  });
}

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
    desc: 'El Data Center se entiende como un todo: servidores, switches, almacenamiento, energía, refrigeración, sala NOC y seguridad, relacionados para una misma función.',
    soloBoton: true,
  },
  jerarquia: {
    label: 'Jerarquía',
    desc: 'Resalta los componentes que constituyen al datacenter como sistema (entradas, procesos, salidas, retroalimentación y resiliencia) frente a su frontera y entorno.',
    resaltar: ['entradas', 'procesos', 'salidas', 'retroalimentacion', 'resiliencia'],
    off: true, soloBoton: true,
  },
  complejidad: {
    label: 'Complejidad',
    desc: 'Se incorporan progresivamente servidores, switches, almacenamiento, energía, refrigeración y monitoreo; al final se resaltan las conexiones entre ellos.',
    anim: true, off: true,
  },
  emergencia: {
    label: 'Emergencia',
    desc: 'De la interacción de los componentes surge una condición nueva: humo dentro del Data Center que se acumula y forma una nube sobre el sistema. No estaba al inicio.',
    emergencia: true, off: true,
  },
  sinergia: {
    label: 'Sinergia',
    desc: 'La combinación de diferentes servicios operando logra el completo funcionamiento del Data Center: entra energía y datos, salen datos y calor.',
    flujo: true, off: true,
  },
  adaptabilidad: {
    label: 'Adaptabilidad',
    desc: 'El sistema cambia su estructura ante el entorno: se eleva sobre una loma y la inundación no lo alcanza.',
    loma: true, off: true,
  },
  multicausalidad: {
    label: 'Multicausalidad',
    desc: 'Un aumento de temperatura ocurre por varias causas a la vez: ola de calor exterior, fallo en el CRAC y aumento de demanda de datos. Ninguna lo explica sola.',
    soloBoton: true,
  },
  complementariedad: {
    label: 'Complementariedad',
    desc: 'Fuentes distintas que se necesitan mutuamente: central eléctrica, parque solar, satélite y pozo de agua. Ninguna basta sola para que el datacenter funcione.',
    complemento: true, off: true,
  },
  recursividad: {
    label: 'Recursividad',
    desc: 'Al acercarnos: Data Center → rack → servidor → procesador → partes. En cada nivel se repite la misma idea: un sistema dentro de otro, compuesto a su vez por subsistemas.',
    soloBoton: true,
  },
  estructura: {
    label: 'Estructura',
    desc: 'Racks en filas, servidores y switches, red, energía y refrigeración en los pasillos: esa distribución y esas relaciones forman la estructura que sostiene el servicio.',
    soloBoton: true,
  },
  equilibrio: {
    label: 'Equilibrio',
    desc: 'Ante una sobrecarga, el sistema redistribuye las solicitudes entre varios servidores hasta recuperar una distribución estable de la carga.',
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
    desc: 'Mantener un servicio crítico disponible por caminos distintos: redundancia de servidores, replicación de datos o activación de un sitio alterno ante una falla.',
    soloBoton: true,
  },
};
for (const [k, c] of Object.entries(CAPAS)) { c.objetos = []; if (c.test) ROOT.traverse(o => { if (o.isMesh && c.test(o.name)) { c.objetos.push(o); o.userData.capa = k; } }); }
// Resaltado por nombre: piezas que cumplen `test` en acento emisivo; el resto atenuado
const hlNombre = new Map();
function resaltarNombre(test, on) {
  if (!on) { hlNombre.forEach((m, o) => o.material = m); hlNombre.clear(); return; }
  ROOT.traverse(o => {
    if (!o.isMesh || !o.visible || /^(deco_|lluvia|inundacion|nube|pulso|hilo|rayo|calor_|generador_humo|humo_emergencia|sol|luna|senal|escombro|ventana)/.test(o.name)) return;
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
  else if (capa && CAPAS[capa].resaltar) { l.title = CAPAS[capa].desc; l.querySelector('input').onchange = e => resaltar(CAPAS[capa].resaltar, e.target.checked); }
  else if (capa && CAPAS[capa].entropia) { l.title = CAPAS[capa].desc; l.querySelector('input').onchange = e => { if (!enAnim) aplicarDeterioro(e.target.checked ? 1 : 0); }; }
  else if (capa && CAPAS[capa].loma) { l.title = CAPAS[capa].desc; l.querySelector('input').onchange = e => { if (!adAnim) elevarSitio(e.target.checked ? LOMA_H : 0); }; }
  else if (capa && CAPAS[capa].emergencia) { l.title = CAPAS[capa].desc; l.querySelector('input').onchange = e => { if (e.target.checked) { const cc = layers.querySelector('input[data-k="complejidad"]'); if (cc && !cc.checked) { cc.checked = true; mostrarFilas(rows); } } animarEmergencia(e.target.checked); }; }
  else if (capa && CAPAS[capa].flujo) { l.title = CAPAS[capa].desc; l.querySelector('input').onchange = e => { if (e.target.checked) openGuide(7); animarFlujo(e.target.checked); }; }
  else if (capa && CAPAS[capa].anim) { l.title = CAPAS[capa].desc; l.querySelector('input').onchange = e => mostrarFilas(e.target.checked ? rows : filasIniciales); }
  else if (capa) { l.title = CAPAS[capa].desc; l.querySelector('input').onchange = e => { const on = e.target.checked; CAPAS[capa].objetos.forEach(o => o.visible = on); (CAPAS[capa].grupos || []).forEach(g => { SUB[g].visible = on; const cb = layers.querySelector(`input[data-k="${g}"]`); if (cb) cb.checked = on; }); }; }
  if (capa === 'totalidad') { const b = document.createElement('button'); b.className = 'btn-rayo'; b.id = 'btnTot'; b.textContent = 'Todo'; b.title = 'Resalta cada parte y luego el Data Center completo'; b.onclick = ev => { ev.preventDefault(); animarTotalidad(); }; l.appendChild(b); }
  if (capa === 'complejidad') { const b = document.createElement('button'); b.className = 'btn-rayo'; b.id = 'btnCpx'; b.textContent = 'Incorporar'; b.title = 'Incorpora progresivamente componentes e interacciones del Data Center'; b.onclick = ev => { ev.preventDefault(); animarComplejidad(); }; l.appendChild(b); }
  if (capa === 'jerarquia') { const b = document.createElement('button'); b.className = 'btn-rayo'; b.id = 'btnJer'; b.textContent = 'Anim'; b.title = 'Recorrido chip → blade → rack → sistema'; b.onclick = ev => { ev.preventDefault(); animarJerarquia(); }; l.appendChild(b); }
  if (capa === 'enfriamiento') {
    const selEqf = document.createElement('select');
    selEqf.id = 'selEqf';
    selEqf.className = 'panel-select';
    selEqf.setAttribute('aria-label', 'Camino de equifinalidad');
    selEqf.title = 'Elige un camino: A redundancia, B replicación, C disaster recovery';
    [
      ['', 'Ruta'],
      ['A', 'A'],
      ['B', 'B'],
      ['C', 'C'],
    ].forEach(([value, label], i) => {
      const opt = document.createElement('option');
      opt.value = value;
      opt.textContent = label;
      if (i === 0) { opt.disabled = true; opt.selected = true; }
      selEqf.appendChild(opt);
    });
    selEqf.onchange = () => {
      const ruta = selEqf.value;
      if (!ruta) return;
      animarEquifinalidad(ruta);
      selEqf.value = '';
    };
    l.appendChild(selEqf);
  }
  if (k === 'entorno') { const b = document.createElement('button'); b.className = 'btn-rayo'; b.id = 'btnRayo'; b.textContent = 'Rayo'; b.title = 'Simular descarga sobre la red eléctrica'; b.onclick = ev => { ev.preventDefault(); simularRayo(); }; l.appendChild(b); }
  if (capa === 'adaptabilidad') { const b = document.createElement('button'); b.className = 'btn-rayo'; b.id = 'btnAd'; b.textContent = 'Inundar'; b.title = 'El sitio sube a una loma y la inundación no lo alcanza'; b.onclick = ev => { ev.preventDefault(); animarAdaptabilidad(); }; l.appendChild(b); }
  if (capa === 'entropia') { const b = document.createElement('button'); b.className = 'btn-rayo'; b.id = 'btnEn'; b.textContent = 'Tiempo'; b.title = 'Pasan días y noches; las instalaciones se deterioran hasta la ruina'; b.onclick = ev => { ev.preventDefault(); animarEntropia(); }; l.appendChild(b); }
  if (capa === 'neguentropia') { const b = document.createElement('button'); b.className = 'btn-rayo'; b.id = 'btnNg'; b.textContent = 'Reparar'; b.title = 'Con energía del entorno, el mantenimiento revierte las ruinas'; b.onclick = ev => { ev.preventDefault(); animarNeguentropia(); }; l.appendChild(b); }
  if (capa === 'homeostasis') { const b = document.createElement('button'); b.className = 'btn-rayo'; b.id = 'btnHo'; b.textContent = 'Ciclo'; b.title = 'Día y noche: la refrigeración se regula, la temperatura se mantiene'; b.onclick = ev => { ev.preventDefault(); animarHomeostasis(); }; l.appendChild(b); }
  if (capa === 'equilibrio') { const b = document.createElement('button'); b.className = 'btn-rayo'; b.id = 'btnEq'; b.textContent = 'Carga'; b.title = 'Sobrecarga y redistribución automática de solicitudes entre servidores'; b.onclick = ev => { ev.preventDefault(); animarEquilibrio(); }; l.appendChild(b); }
  if (capa === 'estructura') { const b = document.createElement('button'); b.className = 'btn-rayo'; b.id = 'btnEs'; b.textContent = 'Montar'; b.title = 'Recorrido: racks, equipos, red, energía y refrigeración'; b.onclick = ev => { ev.preventDefault(); animarEstructura(); }; l.appendChild(b); }
  if (capa === 'recursividad') { const b = document.createElement('button'); b.className = 'btn-rayo'; b.id = 'btnRc'; b.textContent = 'Niveles'; b.title = 'Zoom: Data Center → rack → servidor → componente → partes'; b.onclick = ev => { ev.preventDefault(); animarRecursividad(); }; l.appendChild(b); }
  if (capa === 'multicausalidad') { const b = document.createElement('button'); b.className = 'btn-rayo'; b.id = 'btnMc'; b.textContent = 'Causas'; b.title = 'Sol, demanda y un CRAC averiado convergen en un mismo efecto'; b.onclick = ev => { ev.preventDefault(); animarMulticausalidad(); }; l.appendChild(b); }
  if (k === 'retroalimentacion') { const b = document.createElement('button'); b.className = 'btn-rayo'; b.id = 'btnRf'; b.textContent = 'Lazo'; b.title = 'Ciclo continuo: sensor → control → refrigeración → nueva medición'; b.onclick = ev => { ev.preventDefault(); animarRetroalimentacion(); }; l.appendChild(b); }
  if (k === 'resiliencia') { const b = document.createElement('button'); b.className = 'btn-rayo'; b.id = 'btnRes'; b.textContent = 'Apagón'; b.title = 'Rayo: la calle se apaga; el datacenter vuelve con su planta'; b.onclick = ev => { ev.preventDefault(); simularRayo('resiliencia'); }; l.appendChild(b); }
  layers.appendChild(l);
});
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
let picked = null, savedMat = null;
const pickEl = stage._renderer?.domElement || stage;
const onPickDown = e => { ptr.dx = e.clientX; ptr.dy = e.clientY; };
const onPickUp = e => {
  if (Math.hypot(e.clientX - ptr.dx, e.clientY - ptr.dy) > 4) return; // fue un arrastre
  const cam = stage._camera;
  const rect = (stage._renderer?.domElement || stage).getBoundingClientRect();
  ptr.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
  ray.setFromCamera(ptr, cam);
  const noPick = o => {
    for (let p = o; p && p !== ROOT; p = p.parent) if (!p.visible) return true;
    if (o.isPoints || o.isLight) return true;
    if (/^(deco_|lluvia|inundacion|nube|pulso|hilo|rayo|calor_|generador_humo|humo_emergencia|cielo|sol|luna|eqf_|est_aire|est_dato|est_ener)/.test(o.name)) return true;
    if (o.material && o.material.transparent && o.material.opacity < 0.05) return true;
    return false;
  };
  const hits = ray.intersectObjects(ROOT.children.filter(g => g.visible), true).filter(h => h.object.isMesh && !noPick(h.object));
  if (picked) { picked.material = savedMat; picked = null; }
  if (!hits.length) { sel.textContent = '—'; return; }
  const obj = hits[0].object;
  let sub = obj; while (sub.parent && sub.parent !== ROOT) sub = sub.parent;
  picked = obj; savedMat = obj.material;
  obj.material = savedMat.clone(); obj.material.emissive = new THREE.Color(0xb497cf); obj.material.emissiveIntensity = 0.95;
  sel.innerHTML = `<b>${obj.name}</b>${sub.userData.label} — ${sub.userData.desc}` + (obj.userData.capa ? `<br><br><b>${CAPAS[obj.userData.capa].label}</b>${CAPAS[obj.userData.capa].desc}` : '');
};
pickEl.addEventListener('pointerdown', onPickDown);
pickEl.addEventListener('pointerup', onPickUp);
const btnRayo = document.getElementById('btnRayo'), btnMc = document.getElementById('btnMc'), btnRc = document.getElementById('btnRc'), btnRf = document.getElementById('btnRf'), btnEq = document.getElementById('btnEq'), btnHo = document.getElementById('btnHo'), btnNg = document.getElementById('btnNg'), btnEn = document.getElementById('btnEn'), btnAd = document.getElementById('btnAd'), btnRes = document.getElementById('btnRes'), btnJer = document.getElementById('btnJer'), btnCpx = document.getElementById('btnCpx'), btnEs = document.getElementById('btnEs'), btnTot = document.getElementById('btnTot');
// ===== Iluminación día / noche =====
let lampBase = 0, salaBase = 0, farolBase = 0;
function setModo(noche) {
  modoNoche = noche;
  (stage.closest('.dc-page') || document.body).classList.toggle('noche', noche);
  document.getElementById('mNoche').setAttribute('aria-pressed', noche); document.getElementById('mDia').setAttribute('aria-pressed', !noche);
  const bg = '#' + (noche ? BG_NOCHE : BG_DIA).toString(16).padStart(6, '0');
  stage.style.setProperty('--stage-bg', bg);
  stage.style.setProperty('--stage-note', noche ? '#c9b6df' : 'rgba(26, 25, 21, 0.5)');
  stage.style.setProperty('--stage-toolbar-bg', noche ? 'rgba(10, 10, 10, 0.78)' : 'rgba(255, 255, 255, 0.92)');
  stage.style.setProperty('--stage-toolbar-ink', noche ? '#f4f7ff' : '#2c4a64');
  stage.style.setProperty('--stage-toolbar-border', noche ? 'rgba(244, 247, 255, 0.14)' : 'rgba(29, 45, 61, 0.14)');
  stage._hemi.intensity = noche ? 0.38 : 0.95; stage._hemi.color.setHex(noche ? 0xb8c4d4 : 0xe8f0f8); stage._hemi.groundColor.setHex(noche ? BG_NOCHE : 0xc0ccd8);
  stage._key.intensity = noche ? 0.68 : 1.85; stage._key.color.setHex(noche ? 0xdde4ee : 0xfff4ea);
  stage._fill.intensity = noche ? 0.2 : 0.52;
  if (stage._rim) { stage._rim.intensity = noche ? 0.18 : 0.32; stage._rim.color.setHex(0xdde4ee); }
  lampBase = noche ? 80 : 0; salaBase = noche ? 120 : 0; farolBase = noche ? 75 : 0; M.farol.emissiveIntensity = noche ? 1.55 : 0.35; faroles.forEach(l => l.intensity = farolBase);
  ledBase.ei = noche ? 2.2 : 1.15; M.lampara.emissiveIntensity = noche ? 1.7 : 0.35;
  M.lampWarm.emissiveIntensity = noche ? 1.5 : 0.3; lucesNoc.forEach(l => l.intensity = noche ? 1.05 : 0.18);
  if (!anim) setLeds(true);
  if (entropiaK > 0) aplicarDeterioro(entropiaK);
}
document.getElementById('mDia').onclick = () => setModo(false);
document.getElementById('mNoche').onclick = () => setModo(true);
setModo(new URLSearchParams(location.search).has('dia') ? false : true);
window.datacenter = { root: ROOT, subsystems: SUB, materials: M, THREE, stage, simularRayo, setModo, animarEquifinalidad, animarJerarquia, animarComplejidad, animarFlujo, animarEmergencia, animarAdaptabilidad, animarEntropia, animarNeguentropia, animarHomeostasis, animarEquilibrio, animarRetroalimentacion, animarRecursividad, animarComplementariedad, animarMulticausalidad, animarEstructura, animarTotalidad, aplicarDeterioro, elevarSitio, mostrarFilas };
}
