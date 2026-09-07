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

// Fixed orthographic composition: leave room for the floor without changing
// the canvas or the responsive header at the end of the entrance.
const STAGE = { x: 58, y: 16, sx: 0.94, sy: 0.72, floor: 446 };
const sprites = new WeakMap();

function surface(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(width);
  canvas.height = Math.ceil(height);
  return canvas;
}

/** Bake the volume once per bitmap, not on every animation frame. */
function volumeTiles(logo) {
  if (sprites.has(logo)) return sprites.get(logo);
  const w = WIDTH / 32, h = HEIGHT / 4;
  const face = surface(WIDTH, HEIGHT);
  const faceCtx = face.getContext('2d');
  // Thicken the original silhouette before slicing: no seams or substituted font.
  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
    faceCtx.drawImage(logo, Math.cos(angle) * 2.2, Math.sin(angle) * 2.2, WIDTH, HEIGHT);
  }
  faceCtx.drawImage(logo, 0, 0, WIDTH, HEIGHT);
  const result = [];
  const pad = 42;
  for (let col = 0; col < 32; col++) for (let row = 0; row < 4; row++) {
    const mask = surface(w + pad * 2, h + pad * 2);
    const maskCtx = mask.getContext('2d');
    maskCtx.drawImage(face, col * w, row * h, w, h, pad, pad, w + 0.35, h + 0.35);
    const ink = (color) => {
      const layer = surface(mask.width, mask.height);
      const c = layer.getContext('2d');
      c.drawImage(mask, 0, 0);
      c.globalCompositeOperation = 'source-in';
      c.fillStyle = color;
      c.fillRect(0, 0, layer.width, layer.height);
      return layer;
    };
    const body = surface(mask.width, mask.height);
    const c = body.getContext('2d');
    const side = ink('#444442');
    // A 32-unit extruded silhouette, viewed from above and to the left.
    for (let depth = 32; depth >= 1; depth--) {
      c.drawImage(side, depth * 0.65, depth);
    }
    c.drawImage(ink('#858580'), 0, 1.8);
    c.drawImage(ink('#101010'), 0, 0);
    const shadow = surface(mask.width, mask.height);
    const shadowCtx = shadow.getContext('2d');
    shadowCtx.filter = 'blur(9px)';
    shadowCtx.drawImage(ink('#080808'), 0, 0);
    result.push({ col, row, body, shadow, pad });
  }
  sprites.set(logo, result);
  return result;
}

/** Shared deterministic Canvas extrusion for the website and HyperFrames. */
export function drawWordmark(ctx, logo, time, pointer, pulse) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  const w = WIDTH / 32, h = HEIGHT / 4;
  // The input arrives in canvas coordinates; interaction follows the visible face.
  const localPointer = pointer && { ...pointer,
    x: (pointer.x - STAGE.x) / STAGE.sx, y: (pointer.y - STAGE.y) / STAGE.sy };
  const localPulse = pulse && { ...pulse,
    x: (pulse.x - STAGE.x) / STAGE.sx, y: (pulse.y - STAGE.y) / STAGE.sy };
  const tiles = volumeTiles(logo).map(tile => {
    const pose = tilePose(tile.col, tile.row, time, localPointer, localPulse);
    const lift = pose.echo * 100 + Math.abs(pose.y) * 0.12;
    return { ...tile, pose, lift,
      x: STAGE.x + ((tile.col + 0.5) * w + pose.x) * STAGE.sx,
      y: STAGE.y + ((tile.row + 0.5) * h + pose.y) * STAGE.sy - lift };
  });
  // Shadow and reflection share the exact moving fragments. Reflections are
  // compressed onto the floor and fade with distance from its contact edge.
  for (const tile of tiles) {
    const { pose, x, y, pad, lift } = tile;
    ctx.save();
    ctx.globalAlpha = pose.alpha * 0.12 / (1 + lift / 80);
    ctx.translate(x + 14, STAGE.floor + 8 + (y - STAGE.floor) * 0.055);
    ctx.scale(STAGE.sx * pose.scale, 0.08 * pose.scale);
    ctx.rotate(pose.angle);
    ctx.drawImage(tile.shadow, -w / 2 - pad, -h / 2 - pad);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = pose.alpha * 0.13 * clamp((y + h / 2) / STAGE.floor);
    ctx.translate(x, STAGE.floor + (STAGE.floor - y) * 0.18);
    ctx.scale(STAGE.sx * pose.scale, -STAGE.sy * pose.scale * 0.18);
    ctx.rotate(pose.angle);
    ctx.drawImage(tile.body, -w / 2 - pad, -h / 2 - pad);
    ctx.restore();
  }
  // Far fragments first: the nearer extrusions correctly cover their neighbours.
  tiles.sort((a, b) => a.y - b.y || b.x - a.x);
  for (const { pose, x, y, body, pad } of tiles) {
    ctx.save();
    ctx.globalAlpha = pose.alpha;
    ctx.translate(x, y);
    ctx.scale(STAGE.sx * pose.scale, STAGE.sy * pose.scale);
    ctx.rotate(pose.angle);
    ctx.drawImage(body, -w / 2 - pad, -h / 2 - pad);
    ctx.restore();
  }
}
