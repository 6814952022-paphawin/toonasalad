export const referenceTips = [
  [-24, -130],
  [126, -30],
  [21, 39],
  [-82, 19],
];

export function scaleTips(tips, scale) {
  return tips.map(([x, y]) => [x * scale, y * scale]);
}

export function sparkleGeometry(tips, pinch = 0.06, centerX = 0, centerY = 0) {
  if (!Array.isArray(tips) || tips.length !== 4) {
    throw new TypeError('A sparkle requires exactly four clockwise tip points.');
  }
  if (pinch < 0 || pinch > 1) {
    throw new RangeError('Pinch must be between 0 and 1.');
  }

  const absoluteTips = tips.map(([x, y]) => [centerX + x, centerY + y]);
  const controls = [];
  let d = `M ${absoluteTips[0][0]} ${absoluteTips[0][1]}`;

  for (let index = 0; index < 4; index += 1) {
    const a = tips[index];
    const b = tips[(index + 1) % 4];
    const control = [
      centerX + ((a[0] + b[0]) / 2) * pinch,
      centerY + ((a[1] + b[1]) / 2) * pinch,
    ];
    controls.push(control);
    const end = absoluteTips[(index + 1) % 4];
    d += ` C ${control[0]} ${control[1]} ${control[0]} ${control[1]} ${end[0]} ${end[1]}`;
  }

  return { d: `${d} Z`, tips: absoluteTips, controls };
}

export const starPlacements = [
  { x: 720, y: 455, scale: 2.8, pinch: 0.045, rotate: -5 },
  { x: 1270, y: 106, scale: 1.15, pinch: 0.055, rotate: 11 },
  { x: 118, y: 795, scale: 0.76, pinch: 0.06, rotate: -9 },
  { x: 390, y: 245, scale: 0.39, pinch: 0.07, rotate: 8 },
  { x: 1030, y: 685, scale: 0.45, pinch: 0.065, rotate: -12 },
  { x: 980, y: 205, scale: 0.24, pinch: 0.08, rotate: 6 },
  { x: 230, y: 520, scale: 0.17, pinch: 0.085, rotate: -7 },
  { x: 1340, y: 495, scale: 0.2, pinch: 0.08, rotate: 13 },
  { x: 605, y: 100, scale: 0.16, pinch: 0.09, rotate: -14 },
  { x: 787, y: 760, scale: 0.15, pinch: 0.09, rotate: 10 },
  { x: 292, y: 812, scale: 0.14, pinch: 0.095, rotate: -5 },
];
