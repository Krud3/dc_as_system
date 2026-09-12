/** FRONTERA: placa, cerco, portón. */

export function buildFrontera(ctx) {
  const {
    SUB, M, box, decoBox,
    W, D, T, y0,
  } = ctx;
// ===== FRONTERA =====
const F = SUB.frontera;
box(F, 'placa_sitio', M.concrete, W, T, D, 0, 0.2 + T / 2, 0);
// borde superior claro tipo maqueta
decoBox(F, 'placa_borde_norte', M.wallTop, W + 0.25, 0.1, 0.25, 0, 0.2 + T + 0.02, -D / 2);
decoBox(F, 'placa_borde_sur', M.wallTop, W + 0.25, 0.1, 0.25, 0, 0.2 + T + 0.02, D / 2);
decoBox(F, 'placa_borde_oeste', M.wallTop, 0.25, 0.1, D + 0.25, -W / 2, 0.2 + T + 0.02, 0);
decoBox(F, 'placa_borde_este', M.wallTop, 0.25, 0.1, D + 0.25, W / 2, 0.2 + T + 0.02, 0);
box(F, 'piso_baldosas', M.tile, W - 0.35, 0.02, D - 0.35, 0, y0 + 0.011, 0);
// Piso oscuro del edificio (como la referencia): gran losa gris pizarra
decoBox(F, 'piso_edificio_deco', M.floorDark, 34, 0.03, 20, 2.5, y0 + 0.02, -0.6);
const fenceH = 1.45, inset = 0.45;
const px = W / 2 - inset, pz = D / 2 - inset;
const postsAlong = (from, to, fixed, axis, n, tag) => {
  for (let i = 0; i <= n; i++) {
    const t = from + (to - from) * i / n;
    const [x, z] = axis === 'x' ? [t, fixed] : [fixed, t];
    if (tag === 'sur' && Math.abs(x) < 3) continue;
    box(F, `cerco_${tag}_poste_${i + 1}`, M.paper, 0.08, fenceH, 0.08, x, y0 + fenceH / 2, z);
  }
};
postsAlong(-px, px, -pz, 'x', 18, 'norte'); postsAlong(-px, px, pz, 'x', 18, 'sur');
postsAlong(-pz, pz, -px, 'z', 12, 'oeste'); postsAlong(-pz, pz, px, 'z', 12, 'este');
[0.45, 1.0, 1.4].forEach((h, i) => {
  box(F, `cerco_norte_riel_${i + 1}`, M.steelLight, W - 2 * inset, 0.03, 0.03, 0, y0 + h, -pz);
  box(F, `cerco_sur_riel_${i + 1}_a`, M.steelLight, (W - 2 * inset) / 2 - 3, 0.03, 0.03, -(W - 2 * inset) / 4 - 1.5, y0 + h, pz);
  box(F, `cerco_sur_riel_${i + 1}_b`, M.steelLight, (W - 2 * inset) / 2 - 3, 0.03, 0.03, (W - 2 * inset) / 4 + 1.5, y0 + h, pz);
  box(F, `cerco_oeste_riel_${i + 1}`, M.steelLight, 0.03, 0.03, D - 2 * inset, -px, y0 + h, 0);
  box(F, `cerco_este_riel_${i + 1}`, M.steelLight, 0.03, 0.03, D - 2 * inset, px, y0 + h, 0);
});
box(F, 'porton', M.cabinetWhite, 5.6, 1.35, 0.06, 0, y0 + 0.68, pz);
// barrotes deco del portón
for (let i = -5; i <= 5; i++) decoBox(F, `porton_barrote_${i}`, M.steelLight, 0.06, 1.1, 0.04, i * 0.48, y0 + 0.68, pz + 0.02);
decoBox(F, 'porton_riel', M.deepSteel, 6.2, 0.08, 0.12, 0, y0 + 0.06, pz);
[[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz], i) => {
  const mx = sx * (W / 2 - 0.22), mz = sz * (D / 2 - 0.22);
  box(F, `marca_${i + 1}_h`, M.steelLight, 0.42, 0.02, 0.035, mx, y0 + 0.02, mz);
  box(F, `marca_${i + 1}_v`, M.steelLight, 0.035, 0.02, 0.42, mx, y0 + 0.021, mz);
});
  Object.assign(ctx, { F });
}
