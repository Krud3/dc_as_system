/** Materiales y texturas canvas de la escena datacenter. */
export function createMaterials(THREE) {
const mat = (name, color, roughness = 0.7, metalness = 0.1, extra = {}) =>
  Object.assign(new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra }), { name });

// Paleta maqueta premium: Industry DS (neutros + accent azul) + acento lilac del home (#b497cf).
// Mate ilustrativo, sin plásticos brillantes; emisivos suaves para noche.
const M = {
  paper: mat('paper', 0xf5f5f8, 0.62, 0.02),
  cabinetWhite: mat('cabinet_white', 0xeef1f5, 0.52, 0.04),
  ground: mat('ground', 0x5f6874, 0.97, 0),
  concrete: mat('concrete', 0xc2c7ce, 0.86, 0.02),
  wallMuro: mat('wall_muro', 0xb4bcc6, 0.8, 0.02),
  wallTop: mat('wall_top', 0xe6ebf0, 0.68, 0.02),
  grey: mat('grey', 0x878e97, 0.78, 0.05),
  steel: mat('steel', 0x4a6785, 0.48, 0.28),
  steelLight: mat('steel_light', 0x749dc4, 0.46, 0.18),
  deepSteel: mat('deep_steel', 0x1d2228, 0.5, 0.22),
  ink: mat('ink', 0x141618, 0.55, 0.16),
  led: mat('led', 0xb8d8ff, 0.35, 0, { emissive: 0x6a9fd4, emissiveIntensity: 1.55 }),
  ledGreen: mat('led_green', 0x9aefb4, 0.32, 0, { emissive: 0x2bbf66, emissiveIntensity: 1.45 }),
  heat: mat('heat', 0xb5cfe3, 1, 0, { transparent: true, opacity: 0.28, depthWrite: false }),
  water: mat('water', 0x4a86ad, 0.22, 0.12),
  glass: mat('glass', 0xa8c8e0, 0.08, 0.06, { transparent: true, opacity: 0.26 }),
  glassDark: mat('glass_dark', 0x1a2430, 0.14, 0.32),
  wall: mat('wall', 0xb3bac3, 0.74, 0.03),
  wallDark: mat('wall_dark', 0x939ba5, 0.72, 0.04),
  rack: mat('rack', 0x1c2127, 0.4, 0.22),
  rackWhite: mat('rack_white', 0xeef1f5, 0.5, 0.05),
  rackDoor: mat('rack_door', 0x121820, 0.26, 0.28),
  yellow: mat('yellow', 0xe8a01a, 0.4, 0.1),
  yellowDark: mat('yellow_dark', 0xb8780c, 0.5, 0.08),
  fire: mat('fire', 0xc93a30, 0.4, 0.06),
  carRed: mat('car_red', 0xd6453f, 0.32, 0.16),
  carGlass: mat('car_glass', 0x18222c, 0.14, 0.38),
  fan: mat('fan', 0x262b32, 0.45, 0.2),
  fanBlade: mat('fan_blade', 0x3a424b, 0.48, 0.2),
  desk: mat('desk', 0x7d6348, 0.58, 0.04),
  deskTop: mat('desk_top', 0x947456, 0.52, 0.04),
  deskEdge: mat('desk_edge', 0x634a36, 0.6, 0.03),
  chairFabric: mat('chair_fabric', 0x262e38, 0.82, 0),
  chairAccent: mat('chair_accent', 0x4a6f96, 0.6, 0.04),
  mug: mat('mug', 0xe8eef4, 0.5, 0.04),
  mugAccent: mat('mug_accent', 0x5980a6, 0.45, 0.06),
  lampWarm: mat('lamp_warm', 0xffe4bc, 0.4, 0, { emissive: 0xffb45a, emissiveIntensity: 1.25 }),
  screenCyan: mat('screen_cyan', 0xc8e8ff, 0.22, 0, { emissive: 0x6eb8e8, emissiveIntensity: 1.5 }),
  screenMint: mat('screen_mint', 0xc0f0d8, 0.22, 0, { emissive: 0x3ed49a, emissiveIntensity: 1.3 }),
  wallAccent: mat('wall_accent', 0xd5e0ea, 0.76, 0.02),
  pdu: mat('pdu', 0xb0352a, 0.42, 0.1),
  pduBlue: mat('pdu_blue', 0x5980a6, 0.42, 0.1),
  orange: mat('orange', 0xd85a28, 0.48, 0.05),
  roofOrange: mat('roof_orange', 0xd85a28, 0.55, 0.03),
  asphalt: mat('asphalt', 0x2c3036, 0.92, 0),
  parking: mat('parking', 0x6d5545, 0.88, 0),
  grassGreen: mat('grass_green', 0x5fa870, 0.85, 0),
  leafGreen: mat('leaf_green', 0x458a56, 0.8, 0),
  trunk: mat('trunk', 0x6d5545, 0.85, 0),
  // Ventanas ciudad: cyan → lilac-azul (cohesión con home en noche)
  screenBlue: mat('screen_blue', 0xb8c4e8, 0.26, 0, { emissive: 0x9a88c4, emissiveIntensity: 1.45 }),
  // Fachadas ciudad (variedad en la maqueta urbana)
  facadeCool: mat('facade_cool', 0xa8b2be, 0.78, 0.02),
  facadeWarm: mat('facade_warm', 0xc5cbd4, 0.74, 0.02),
  facadeDeep: mat('facade_deep', 0x8e98a4, 0.76, 0.03),
  winWarm: mat('win_warm', 0xe8d9b8, 0.28, 0, { emissive: 0xd4a86a, emissiveIntensity: 1.35 }),
  winDim: mat('win_dim', 0x1c2430, 0.2, 0.2),
  roofTile: mat('roof_tile', 0x5a626c, 0.82, 0.04),
  skin: mat('skin', 0xd4a686, 0.65, 0),
  shirt: mat('shirt', 0x283440, 0.7, 0),
  shirtBlue: mat('shirt_blue', 0x3a6a9a, 0.66, 0),
  pants: mat('pants', 0x3d648f, 0.7, 0),
  pantsDark: mat('pants_dark', 0x273140, 0.74, 0),
  pipeRed: mat('pipe_red', 0xc93a30, 0.4, 0.1),
  pipeBlue: mat('pipe_blue', 0x5980a6, 0.4, 0.1),
  grille: mat('grille', 0x2a3037, 0.6, 0.16),
  sticker: mat('sticker', 0xe8bc20, 0.55, 0),
  tire: mat('tire', 0x181a1c, 0.75, 0.04),
  // Generador de reserva (industrial beige / negro / blanco, más mate)
  genTan: mat('gen_tan', 0xd2a06c, 0.62, 0.06),
  genTanDark: mat('gen_tan_dark', 0xba8550, 0.64, 0.08),
  genTanDeep: mat('gen_tan_deep', 0x9e6f3e, 0.66, 0.08),
  genSkid: mat('gen_skid', 0x16181b, 0.6, 0.14),
  genMetal: mat('gen_metal', 0x262a30, 0.48, 0.24),
  genIntake: mat('gen_intake', 0xae8454, 0.55, 0.1),
  genBtnGreen: mat('gen_btn_green', 0x3ecf6a, 0.4, 0.04, { emissive: 0x1a8a3a, emissiveIntensity: 0.3 }),
  genBtnGrey: mat('gen_btn_grey', 0x656d76, 0.5, 0.1),
  genScreen: mat('gen_screen', 0x8ec8f0, 0.28, 0, { emissive: 0x5a9fd4, emissiveIntensity: 1.35 }),
  genBlade: mat('gen_blade', 0x2a2f36, 0.42, 0.4),
};
// Texturas canvas: pisos oscuros con retícula, baldosa clara, puerta rack con leds, asfalto
function canvasTex(w, h, draw, rx = 1, ry = 1) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  draw(cv.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
{ const tex = canvasTex(256, 256, (c) => {
    c.fillStyle = '#2a2f36'; c.fillRect(0, 0, 256, 256);
    c.fillStyle = '#232830'; for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) if ((x + y) % 2) c.fillRect(x * 64, y * 64, 64, 64);
    c.strokeStyle = '#4a525c'; c.lineWidth = 2.5;
    for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64, 256); c.stroke(); c.beginPath(); c.moveTo(0, i * 64); c.lineTo(256, i * 64); c.stroke(); }
  }, 10, 7);
  M.floorDark = Object.assign(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, metalness: 0.03 }), { name: 'floor_dark' }); }
{ const tex = canvasTex(128, 128, (c) => {
    c.fillStyle = '#c5ccd6'; c.fillRect(0, 0, 128, 128); c.strokeStyle = '#9aa3ae'; c.lineWidth = 1.5;
    for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(i * 32, 0); c.lineTo(i * 32, 128); c.stroke(); c.beginPath(); c.moveTo(0, i * 32); c.lineTo(128, i * 32); c.stroke(); }
  }, 28, 18);
  M.tile = Object.assign(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.92, metalness: 0 }), { name: 'tile' }); }
{ const tex = canvasTex(128, 256, (c) => {
    c.fillStyle = '#0e141a'; c.fillRect(0, 0, 128, 256);
    for (let r = 0; r < 12; r++) for (let col = 0; col < 4; col++) {
      const on = (r * 7 + col * 3) % 5 !== 0;
      const lilac = (r + col) % 4 === 0;
      c.fillStyle = on ? (lilac ? '#b497cf' : ((r + col) % 3 === 0 ? '#3ecf6a' : '#7ec4ef')) : '#1a2430';
      c.fillRect(10 + col * 29, 10 + r * 20, 18, 5);
    }
    c.strokeStyle = '#273240'; c.lineWidth = 3; c.strokeRect(1, 1, 126, 254);
  });
  M.rackFront = Object.assign(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4, metalness: 0.2, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.48 }), { name: 'rack_front' }); }
{ const tex = canvasTex(128, 256, (c) => {
    c.fillStyle = '#eef1f4'; c.fillRect(0, 0, 128, 256);
    c.fillStyle = '#d5dbe2'; c.fillRect(0, 0, 128, 256);
    for (let r = 0; r < 10; r++) { c.fillStyle = '#1b2530'; c.fillRect(12, 12 + r * 24, 104, 14); c.fillStyle = '#3ecf6a'; for (let k = 0; k < 6; k++) c.fillRect(16 + k * 16, 16 + r * 24, 8, 3); }
  });
  M.rackWhiteFront = Object.assign(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, metalness: 0.06 }), { name: 'rack_white_front' }); }
{ const tex = canvasTex(256, 128, (c) => {
    c.fillStyle = '#947456'; c.fillRect(0, 0, 256, 128);
    for (let i = 0; i < 28; i++) {
      c.strokeStyle = i % 3 ? 'rgba(80,55,32,0.16)' : 'rgba(190,160,120,0.2)';
      c.lineWidth = 1 + (i % 2);
      c.beginPath(); c.moveTo(0, 4 + i * 4.5); c.bezierCurveTo(80, 2 + i * 4.5, 160, 8 + i * 4.5, 256, 3 + i * 4.5); c.stroke();
    }
  }, 2, 1);
  M.deskTop = Object.assign(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55, metalness: 0.03 }), { name: 'desk_top' });
  M.desk = Object.assign(new THREE.MeshStandardMaterial({ map: tex, color: 0xa48462, roughness: 0.6, metalness: 0.02 }), { name: 'desk' }); }
{ const tex = canvasTex(128, 128, (c) => {
    c.fillStyle = '#323a46'; c.fillRect(0, 0, 128, 128);
    c.fillStyle = '#3a4452';
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if ((x + y) % 2) c.fillRect(x * 16, y * 16, 16, 16);
    c.strokeStyle = 'rgba(180,160,210,0.14)'; c.lineWidth = 1;
    for (let i = 0; i <= 8; i++) { c.beginPath(); c.moveTo(i * 16, 0); c.lineTo(i * 16, 128); c.stroke(); c.beginPath(); c.moveTo(0, i * 16); c.lineTo(128, i * 16); c.stroke(); }
  }, 6, 3);
  M.carpetNoc = Object.assign(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.94, metalness: 0 }), { name: 'carpet_noc' }); }
{ const tex = canvasTex(128, 96, (c) => {
    c.fillStyle = '#0e1824'; c.fillRect(0, 0, 128, 96);
    c.fillStyle = '#6a9fd4'; c.fillRect(8, 10, 50, 28); c.fillRect(66, 10, 54, 12);
    c.fillStyle = '#3ecf6a'; c.fillRect(66, 28, 24, 10); c.fillRect(96, 28, 24, 10);
    c.fillStyle = '#b497cf';
    for (let i = 0; i < 6; i++) c.fillRect(10 + i * 9, 50, 6, 8 + (i * 5) % 28);
    c.fillStyle = '#e8dcf4'; c.font = 'bold 10px sans-serif'; c.fillText('NOC', 10, 90);
  });
  M.screenDash = Object.assign(new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.75, roughness: 0.4 }), { name: 'screen_dash' }); }
{ const tex = canvasTex(256, 256, (c) => {
    c.fillStyle = '#262a30'; c.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 90; i++) {
      const x = Math.random() * 256, y = Math.random() * 256;
      c.strokeStyle = `rgba(${180 + Math.random() * 50},${180 + Math.random() * 40},${160 + Math.random() * 40},${0.08 + Math.random() * 0.18})`;
      c.lineWidth = 0.6 + Math.random() * 1.4;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + (Math.random() - 0.5) * 70, y + (Math.random() - 0.5) * 18); c.stroke();
    }
  });
  M.genFanPlate = Object.assign(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, metalness: 0.3 }), { name: 'gen_fan_plate' }); }
{ const tex = canvasTex(128, 128, (c) => {
    c.fillStyle = '#eef1f5'; c.fillRect(0, 0, 128, 128);
    c.fillStyle = '#e8bc20'; c.beginPath();
    c.moveTo(64, 18); c.lineTo(108, 98); c.lineTo(20, 98); c.closePath(); c.fill();
    c.fillStyle = '#1d1f20'; c.beginPath();
    c.moveTo(64, 34); c.lineTo(96, 90); c.lineTo(32, 90); c.closePath(); c.fill();
    c.fillStyle = '#e8bc20'; c.font = 'bold 42px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('!', 64, 72);
  });
  M.genHazard = Object.assign(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.58, metalness: 0.02 }), { name: 'gen_hazard' }); }
{ const tex = canvasTex(256, 192, (c) => {
    c.fillStyle = '#16181b'; c.fillRect(0, 0, 256, 192);
    c.fillStyle = '#0a1018'; c.fillRect(18, 22, 110, 58);
    c.fillStyle = '#6a9fd4'; c.fillRect(24, 28, 98, 46);
    c.fillStyle = '#e8dcf4'; c.font = 'bold 22px monospace'; c.fillText('GEN OK', 38, 58);
    for (let r = 0; r < 3; r++) for (let col = 0; col < 3; col++) {
      c.fillStyle = '#3ecf6a'; c.beginPath(); c.arc(158 + col * 28, 38 + r * 26, 8, 0, Math.PI * 2); c.fill();
    }
    c.fillStyle = '#c93a30'; c.beginPath(); c.arc(48, 140, 22, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#ffffff'; c.beginPath(); c.arc(48, 140, 10, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#656d76'; c.beginPath(); c.arc(108, 140, 14, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#b0352a'; c.beginPath(); c.arc(152, 140, 10, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#656d76'; c.beginPath(); c.arc(192, 140, 12, 0, Math.PI * 2); c.fill();
  });
  M.genPanel = Object.assign(new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.4, roughness: 0.45, metalness: 0.12 }), { name: 'gen_panel' }); }

  return { M, mat, canvasTex };
}
