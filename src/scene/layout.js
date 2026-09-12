/** Layout del campus y jerarquía de subsistemas. */

export const SUBSYSTEMS = [
  ['entorno', 'Entorno', 'Terreno, red eléctrica, ciudad y atmósfera que rodean al sistema'],
  ['frontera', 'Frontera', 'Cerco perimetral y placa del sitio: qué pertenece y qué no'],
  ['entradas', 'Entradas', 'Energía (línea + transformador), agua y fibra óptica que ingresan'],
  ['procesos', 'Procesos', 'Sala de racks, UPS y climatización que transforman energía en cómputo'],
  ['salidas', 'Salidas', 'Calor disipado, datos que salen por fibra, residuos electrónicos'],
  ['retroalimentacion', 'Retroalimentación', 'Sensores y sala NOC que monitorean y corrigen'],
  ['resiliencia', 'Resiliencia', 'Generador, tanque y segunda acometida: redundancia ante fallos'],
];

export function createRootHierarchy(THREE) {
  const ROOT = new THREE.Group();
  ROOT.name = 'datacenter';
  const SUB = {};
  for (const [k, label, desc] of SUBSYSTEMS) {
    const g = new THREE.Group();
    g.name = k;
    g.userData = { label, desc };
    ROOT.add(g);
    SUB[k] = g;
  }
  return { ROOT, SUB, subsystems: SUBSYSTEMS };
}

/** Constantes de layout (las animaciones leen estos valores). */
export function createCampusLayout() {
  const W = 42, D = 28, T = 0.48;
  const y0 = 0.2 + T;
  const HX = -7, HZ = -4.2, HW = 14.5, HD = 10.4, HH = 3.45, WT = 0.12;
  const RY = y0 + HH + 0.02;
  const UX = 10.2, UZ = -2.2;
  const TX = 15.2, TZ = -6.4;
  const WX = -18.8, WZ = -6.5;
  const MX = -16.5, MZ = 4.8;
  const NX = 2.2, NZ = 7.4;
  const GX = 15.0, GZ = 3.2;
  const chillerPos = [
    [HX - 4.2, RY + 0.42, HZ - 1.6],
    [HX - 1.4, RY + 0.42, HZ - 1.6],
    [HX + 1.4, RY + 0.42, HZ - 1.6],
    [HX + 4.0, RY + 0.42, HZ + 3.0],
  ];
  return {
    W, D, T, y0, HX, HZ, HW, HD, HH, WT, RY,
    UX, UZ, TX, TZ, WX, WZ, MX, MZ, NX, NZ, GX, GZ, chillerPos,
  };
}
