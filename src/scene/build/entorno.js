/** ENTORNO: terreno, rayo, faroles, torres, ciudad, plantings. */

/** Detalle arquitectónico de un edificio urbano (hijas del mesh → crecen con Complejidad). */
function decorateCityBuilding(THREE, M, b, tag, seed = 0) {
  const { width: w, height: h, depth: d } = b.geometry.parameters;
  const add = (name, matRef, gw, gh, gd, lx, ly, lz, cast = true) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(gw, gh, gd), matRef);
    m.name = `deco_${tag}_${name}`;
    m.position.set(lx, ly, lz);
    if (cast) m.castShadow = true;
    b.add(m);
    return m;
  };
  const litMat = (f, c) => {
    const r = (seed * 17 + f * 7 + c * 13) % 10;
    if (r < 2) return M.winDim;
    if (r < 4) return M.winWarm;
    if (r < 7) return M.screenBlue;
    return M.screenCyan;
  };

  // Zócalo / plinto
  add('plinto', M.concrete, w + 0.38, 0.32, d + 0.38, 0, -h / 2 + 0.16, 0);
  // Franja de acento a media altura (rompe la caja)
  if (h > 5) {
    add('banda', M.cabinetWhite, w + 0.06, 0.22, d + 0.06, 0, -h / 2 + h * 0.42, 0, false);
  }
  // Pilares esquina (relieve de fachada)
  const pw = 0.18, pd = 0.18;
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz], i) => {
    add(`pilar_${i}`, M.wallTop, pw, h - 0.35, pd,
      sx * (w / 2 - pw / 2 - 0.02), 0.05, sz * (d / 2 - pd / 2 - 0.02), false);
  });
  // Cornisa + techo con voladizo + pretil
  add('cornisa', M.cabinetWhite, w + 0.28, 0.12, d + 0.28, 0, h / 2 - 0.18, 0);
  add('techo', M.roofTile, w + 0.5, 0.16, d + 0.5, 0, h / 2 + 0.08, 0);
  const rim = 0.1, rh = 0.28;
  add('pretil_n', M.wallMuro, w + 0.4, rh, rim, 0, h / 2 + 0.22, -(d / 2 + 0.12));
  add('pretil_s', M.wallMuro, w + 0.4, rh, rim, 0, h / 2 + 0.22, d / 2 + 0.12);
  add('pretil_e', M.wallMuro, rim, rh, d + 0.2, w / 2 + 0.12, h / 2 + 0.22, 0);
  add('pretil_o', M.wallMuro, rim, rh, d + 0.2, -(w / 2 + 0.12), h / 2 + 0.22, 0);
  // Equipo de azotea (HVAC + antena en edificios altos)
  const hx = (seed % 3 - 1) * w * 0.18;
  const hz = ((seed + 1) % 3 - 1) * d * 0.15;
  add('hvac', M.grey, Math.min(1.1, w * 0.28), 0.55, Math.min(0.9, d * 0.28), hx, h / 2 + 0.45, hz);
  add('hvac_rejilla', M.grille, Math.min(0.95, w * 0.24), 0.35, 0.04, hx, h / 2 + 0.48, hz + Math.min(0.45, d * 0.14) + 0.02, false);
  if (h >= 8) {
    add('antena_mastil', M.deepSteel, 0.06, 1.4, 0.06, -hx * 0.7, h / 2 + 0.9, -hz * 0.6, false);
    add('antena_plato', M.steelLight, 0.35, 0.06, 0.35, -hx * 0.7, h / 2 + 1.55, -hz * 0.6, false);
  }

  // Ventanas en las 4 fachadas (maqueta legible desde cualquier ángulo)
  const floorH = 1.25;
  const floors = Math.max(2, Math.floor((h - 1.0) / floorH));
  const winW = 0.48, winH = 0.58;
  const placeWins = (face, cols) => {
    const span = face === 's' || face === 'n' ? w : d;
    const margin = 0.55;
    const usable = Math.max(span - margin * 2, 0.01);
    const gap = cols > 1 ? usable / (cols - 1) : 0;
    const dens = face === 's' || face === 'e' ? 1 : 0.65; // N/O un poco más abiertas
    for (let f = 0; f < floors; f++) {
      if (face === 's' && f > 0) {
        add(`piso_${f}`, M.wallDark, w + 0.04, 0.06, 0.08, 0, -h / 2 + 0.55 + f * floorH - 0.35, d / 2 + 0.02, false);
      }
      for (let c = 0; c < cols; c++) {
        if (dens < 1 && (f + c + seed) % 3 === 0) continue;
        const along = -span / 2 + margin + c * gap;
        const y = -h / 2 + 0.85 + f * floorH;
        const matPane = litMat(f, c + (face === 'e' ? 20 : face === 'n' ? 40 : face === 'o' ? 60 : 0));
        if (face === 's') {
          add(`marco_s_${f}_${c}`, M.ink, winW + 0.1, winH + 0.1, 0.035, along, y, d / 2 + 0.018, false);
          add(`win_s_${f}_${c}`, matPane, winW, winH, 0.045, along, y, d / 2 + 0.042, false);
        } else if (face === 'n') {
          add(`marco_n_${f}_${c}`, M.ink, winW + 0.1, winH + 0.1, 0.035, along, y, -(d / 2 + 0.018), false);
          add(`win_n_${f}_${c}`, matPane, winW, winH, 0.045, along, y, -(d / 2 + 0.042), false);
        } else if (face === 'e') {
          add(`marco_e_${f}_${c}`, M.ink, 0.035, winH + 0.1, winW + 0.1, w / 2 + 0.018, y, along, false);
          add(`win_e_${f}_${c}`, matPane, 0.045, winH, winW, w / 2 + 0.042, y, along, false);
        } else {
          add(`marco_o_${f}_${c}`, M.ink, 0.035, winH + 0.1, winW + 0.1, -(w / 2 + 0.018), y, along, false);
          add(`win_o_${f}_${c}`, matPane, 0.045, winH, winW, -(w / 2 + 0.042), y, along, false);
        }
      }
    }
  };
  const colsZ = Math.max(2, Math.floor(w / 1.05));
  const colsX = Math.max(2, Math.floor(d / 1.15));
  placeWins('s', colsZ);
  placeWins('n', colsZ);
  placeWins('e', colsX);
  placeWins('o', colsX);

  // Acceso planta baja (puerta + marquesina)
  const doorW = Math.min(0.9, w * 0.22);
  add('puerta', M.glassDark, doorW, 1.15, 0.06, 0, -h / 2 + 0.75, d / 2 + 0.03, false);
  add('puerta_marco', M.deepSteel, doorW + 0.14, 1.28, 0.05, 0, -h / 2 + 0.78, d / 2 + 0.015, false);
  add('marquesina', M.steel, doorW + 0.5, 0.06, 0.45, 0, -h / 2 + 1.42, d / 2 + 0.28, false);
  // Escalon de entrada
  add('escalon', M.concrete, doorW + 0.35, 0.1, 0.35, 0, -h / 2 + 0.05, d / 2 + 0.22, false);

  // Volumen lateral (setback) en edificios anchos: rompe la silueta
  if (w >= 5 && h >= 5) {
    const sw = w * 0.32, sh = h * 0.55, sd = 0.35;
    add('setback', M.facadeDeep, sw, sh, sd, -w / 2 + sw / 2 + 0.05, -h / 2 + sh / 2 + 0.4, d / 2 + sd / 2 - 0.02, false);
  }
}

export function buildEntorno(ctx) {
  const {
    THREE, SUB, M, mat, box, decoBox, decoCyl, line, placePlant,
  } = ctx;
// ===== ENTORNO =====
const E = SUB.entorno;
box(E, 'terreno', M.ground, 70, 0.2, 50, 0, 0.1, 0);
M.rayo = mat('rayo', 0xf4eefc, 0.2, 0, { emissive: 0xb497cf, emissiveIntensity: 2, transparent: true, opacity: 0 });
const rayo = new THREE.Group(); rayo.name = 'rayo'; rayo.visible = false; E.add(rayo);
{ const pts = [[30, 30, -14], [31.5, 24, -13], [29.5, 18, -14.5], [30.8, 13, -13.6], [30, 9, -14]];
  for (let i = 0; i < pts.length - 1; i++) line(rayo, `rayo_seg_${i + 1}`, M.rayo, pts[i], pts[i + 1], 0.09);
  line(rayo, 'rayo_rama', M.rayo, [29.5, 18, -14.5], [26.5, 14, -16.5], 0.05); }
box(E, 'via_publica', M.asphalt, 70, 0.03, 3.6, 0, 0.215, 19.6);
// línea central segmentada (deco, no interfiere)
for (let x = -34; x < 34; x += 2.4) decoBox(E, `via_linea_${x}`, M.paper, 1.2, 0.012, 0.12, x, 0.235, 19.6);
M.farol = mat('farol', 0xf2efe8, 0.32, 0, { emissive: 0xe8d9b8, emissiveIntensity: 1.55 });
const faroles = [];
[-30, -20, -10, 0, 10, 20, 30].forEach((x, i) => {
  box(E, `farol_${i + 1}_poste`, M.deepSteel, 0.12, 4.2, 0.12, x, 0.2 + 2.1, 21.8);
  box(E, `farol_${i + 1}_brazo`, M.deepSteel, 0.08, 0.08, 1.1, x, 0.2 + 4.15, 21.35);
  box(E, `farol_${i + 1}_lampara`, M.farol, 0.46, 0.1, 0.28, x, 0.2 + 4.1, 20.85);
  decoBox(E, `farol_cap_${i + 1}`, M.deepSteel, 0.54, 0.06, 0.34, x, 0.2 + 4.18, 20.85);
  // Una PointLight cada dos faroles: el resto se ve por emisión del mesh.
  if (i % 2 === 0) {
    const pl = new THREE.PointLight(0xe8d9b8, 0, 14, 1.6); pl.position.set(x, 0.2 + 3.85, 20.8); pl.name = `farol_${i + 1}_luz`; E.add(pl); faroles.push(pl);
  }
});
const tower = (x, z, n) => {
  box(E, `${n}_mastil`, M.deepSteel, 0.26, 9, 0.26, x, 4.7, z);
  box(E, `${n}_cruceta`, M.deepSteel, 3.0, 0.14, 0.14, x, 8.6, z);
  box(E, `${n}_cruceta_2`, M.deepSteel, 2.2, 0.14, 0.14, x, 7.4, z);
  // aisladores deco
  [-1.2, -0.6, 0, 0.6, 1.2].forEach((o, k) => decoCyl(E, `${n}_aislador_${k}`, M.cabinetWhite, 0.07, 0.3, x + o, 8.45, z, 8));
  decoBox(E, `${n}_base`, M.concrete, 1.2, 0.3, 1.2, x, 0.35, z, 0, true);
};
tower(30, -14, 'torre_at_1'); tower(30, 2, 'torre_at_2');
line(E, 'linea_at', M.ink, [30, 8.7, -14], [30, 8.7, 2]);

// Ciudad base (siempre visible) + edificios de Complejidad (crecen en animación)
const facadeMats = [M.facadeCool, M.facadeWarm, M.wallAccent, M.facadeDeep, M.cabinetWhite];
const ciudadBase = [
  ['ciudad_1', -28, 7, 5, -16, 5, 0],
  ['ciudad_2', -22, 10, 4, -19, 4, 1],
  ['ciudad_3', -30, 5, 6, -8, 4, 2],
];
ciudadBase.forEach(([name, x, h, w, z, d, seed], i) => {
  const body = box(E, name, facadeMats[i % facadeMats.length], w, h, d, x, 0.2 + h / 2, z);
  body.userData.h = h;
  decorateCityBuilding(THREE, M, body, name, seed);
});

const ciudadSpecs = [
  [-33, 8, 4, -14, 4, 3],
  [-25, 12, 4, -12, 4, 4],
  [-32, 6, 5, -2, 5, 5],
  [-20, 9, 3.5, -22, 3.5, 6],
  [-27, 14, 4, -22, 4, 0],
  [-33, 9, 4, -20, 4, 1],
  [-36, 6, 4, -8, 4, 2],
  [-26, 16, 3.5, -4, 3.5, 7],
];
const ciudadNueva = ciudadSpecs.map(([x, h, w, z, d, seed], i) => {
  const b = box(E, `ciudad_nueva_${i + 1}`, facadeMats[(i + 2) % facadeMats.length], w, h, d, x, 0.2 + h / 2, z);
  b.visible = false;
  b.userData.h = h;
  decorateCityBuilding(THREE, M, b, `ciudad_nueva_${i + 1}`, seed);
  return b;
});

// Paisajismo ligero: pocos grupos que enmarcan el sitio (sin saturar el perímetro)
// [x, z, modelo, altura_m, rotY]
const plantings = [
  // Sur — solo flancos del portón (hueco |x|<6)
  [-17.5, 16.2, 'tree4', 3.8, 0.4],
  [-15.8, 15.6, 'bush1', 0.8, 1.0],
  [-14.5, 16.4, 'tree1', 3.1, -0.5],
  [14.2, 16.3, 'tree5', 3.3, 0.6],
  [16.0, 15.7, 'bush1', 0.75, -0.8],
  [17.8, 16.2, 'tree3', 3.0, 0.2],
  // Norte — dos acentos, no una hilera
  [-10.5, -16.8, 'tree4', 4.0, 0.3],
  [-8.8, -17.2, 'bush1', 0.85, 0.9],
  [8.5, -16.9, 'tree2', 3.6, -0.4],
  [10.2, -16.5, 'bush1', 0.7, 1.2],
  // Suroeste — un solo grupo hacia la ciudad
  [-26.5, 14.5, 'tree4', 3.9, 0.7],
  [-24.8, 15.8, 'tree1', 3.2, -0.3],
  [-25.5, 13.2, 'bush1', 0.9, 0.5],
  // Noroeste — un árbol junto a edificios
  [-22.8, -3.2, 'bush1', 0.8, -1.0],
  // Este — lejos de las torres (x≈30), un grupo limpio
  [24.5, 8.0, 'tree3', 3.15, -0.6],
  [26.0, 9.5, 'bush1', 0.78, 0.4],
  [25.2, -6.5, 'tree2', 3.5, 0.25],
];
plantings.forEach(([x, z, key, h, ry], i) => {
  const isBush = key.startsWith('bush');
  placePlant(key, isBush ? `deco_arbusto_${i + 1}` : `arbol_${i + 1}`, x, z, h, ry);
});
  Object.assign(ctx, { E, rayo, faroles, ciudadNueva });
}
