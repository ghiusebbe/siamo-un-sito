export const WIDTH = 2200;
export const HEIGHT = 546;
export const DURATION = 2.8;
const clamp = (x) => Math.max(0, Math.min(1, x));

/** Pure, seekable geometry shared by the website and HyperFrames. */
export function tilePose(column, row, time, pointer = { x: -9999, y: -9999, strength: 0 }, pulse = { x: 1100, y: 273, age: 99 }) {
  const x = (column + 0.5) * WIDTH / 32;
  const y = (row + 0.5) * HEIGHT / 4;
  const progress = clamp((time - column * 0.023 - row * 0.045) / 1.75);
  const remaining = Math.pow(1 - progress, 4);
  const dx = x - pointer.x;
  const dy = y - pointer.y;
  const influence = Math.pow(clamp(1 - Math.hypot(dx, dy) / 420), 2) * pointer.strength;
  const radius = Math.hypot(x - pulse.x, y - pulse.y);
  const wave = pulse.age >= 0 && pulse.age < 1.6
    ? Math.sin((radius - pulse.age * 1600) / 95) * Math.exp(-Math.pow((radius - pulse.age * 1600) / 210, 2)) * (1 - pulse.age / 1.6) : 0;
  return {
    x: (1100 - x) * remaining * 0.8 + Math.sin(column * 0.38 + row) * 125 * remaining + dx * influence * 0.18,
    y: (273 - y) * remaining + Math.cos(column * 0.25) * 135 * remaining + dy * influence * 0.28 + wave * 30,
    angle: ((column - 15.5) * 0.032 + (row - 1.5) * 0.15) * remaining + influence * dx / 3200 + wave * 0.035,
    scale: 1 - remaining * 0.75 + influence * 0.045,
    alpha: clamp(progress * 7),
    echo: remaining * Math.sin(progress * Math.PI),
  };
}

/** @param {CanvasRenderingContext2D} ctx @param {CanvasImageSource} logo */
export function drawWordmark(ctx, logo, time, pointer, pulse) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  const w = WIDTH / 32;
  const h = HEIGHT / 4;
  // Source pixels and composition coordinates are different spaces. The
  // optimized PNG is 1600x397, while the composition is 2200x546.
  const sourceW = (logo.naturalWidth || WIDTH) / 32;
  const sourceH = (logo.naturalHeight || HEIGHT) / 4;
  for (let col = 0; col < 32; col++) {
    for (let row = 0; row < 4; row++) {
      const pose = tilePose(col, row, time, pointer, pulse);
      ctx.save();
      ctx.translate((col + 0.5) * w + pose.x, (row + 0.5) * h + pose.y);
      ctx.rotate(pose.angle);
      ctx.scale(pose.scale, pose.scale);
      if (pose.echo > 0.04) {
        ctx.globalAlpha = pose.echo * 0.3;
        ctx.drawImage(logo, col * sourceW, row * sourceH, sourceW, sourceH, -w / 2 - 30 * pose.echo, -h / 2 + 45 * pose.echo, w, h);
      }
      ctx.globalAlpha = pose.alpha;
      ctx.drawImage(logo, col * sourceW, row * sourceH, sourceW, sourceH, -w / 2, -h / 2, w + 0.35, h + 0.35);
      ctx.restore();
    }
  }
}
