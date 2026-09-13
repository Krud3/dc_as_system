/** Curva ease cúbica compartida por las animaciones TGS. */
export const easeInOutCubic = (u) =>
  u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
