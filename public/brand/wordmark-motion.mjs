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
const STAGE = { x: 58, y: 16, sx: 0.94, sy: 0.72, floor: 432 };
const sprites = new WeakMap();
const frames = new WeakMap();
const FLOOR_TOP = 380;
const FLOOR_HEIGHT = HEIGHT - FLOOR_TOP;

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
    const front = ink('#101010');
    c.drawImage(front, 0, 0);
    result.push({ col, row, body, face: front, pad });
  }
  sprites.set(logo, result);
  return result;
}

/** Internal raster size follows the output canvas, never the CSS viewport alone. */
export function frameResolution(width = WIDTH, height = HEIGHT) {
  const scale = Math.min(1, Math.max(1, width) / WIDTH, Math.max(1, height) / HEIGHT);
  return { width: Math.max(1, Math.ceil(WIDTH * scale)), height: Math.max(1, Math.ceil(HEIGHT * scale)),
    floorHeight: Math.max(1, Math.ceil(FLOOR_HEIGHT * scale)), scale };
}

function frameBuffers(ctx) {
  const size = frameResolution(ctx.canvas?.width, ctx.canvas?.height);
  let buffers = frames.get(ctx);
  if (buffers && buffers.width === size.width && buffers.height === size.height) return buffers;
  buffers = { ...size,
    scene: surface(size.width, size.height),
    reflection: surface(size.width, size.floorHeight),
    shadow: surface(size.width, size.floorHeight),
  };
  buffers.scene.getContext('2d').setTransform(size.scale, 0, 0, size.scale, 0, 0);
  for (const layer of [buffers.reflection, buffers.shadow]) {
    layer.getContext('2d').setTransform(size.scale, 0, 0, size.scale, 0, -FLOOR_TOP * size.scale);
  }
  const fade = buffers.reflection.getContext('2d').createLinearGradient(0, STAGE.floor, 0, HEIGHT - 12);
  fade.addColorStop(0, 'rgba(0,0,0,0.17)');
  fade.addColorStop(0.6, 'rgba(0,0,0,0.045)');
  fade.addColorStop(1, 'rgba(0,0,0,0)');
  buffers.fade = fade;
  frames.set(ctx, buffers);
  return buffers;
}

/** Shared deterministic Canvas extrusion for the website and HyperFrames. */
export function drawWordmark(ctx, logo, time, pointer, pulse) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  // Nothing is visible yet; defer sprite baking until the first visible frame.
  if (time <= 0) return;
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
  const buffers = frameBuffers(ctx);
  const scene = buffers.scene.getContext('2d');
  scene.clearRect(0, 0, WIDTH, HEIGHT);
  // All blocks occupy the same face plane. Finish the complete back volume
  // before painting ANY front faces: screen-y sorting let a neighbour's side
  // cut through an already painted face, exposing the rectangular tile grid.
  for (const layer of ['body', 'face']) {
    for (const tile of tiles) {
      const { pose, x, y, pad } = tile;
      if (pose.alpha === 0) continue;
      scene.save();
      scene.globalAlpha = pose.alpha;
      scene.translate(x, y);
      scene.scale(STAGE.sx * pose.scale, STAGE.sy * pose.scale);
      scene.rotate(pose.angle);
      scene.drawImage(tile[layer], -w / 2 - pad, -h / 2 - pad);
      scene.restore();
    }
  }
  // Project the assembled silhouette once. Per-tile alpha/blur used to stack
  // at overlaps, and rotating after floor compression produced dark stripes.
  const shadow = buffers.shadow.getContext('2d');
  shadow.clearRect(0, FLOOR_TOP, WIDTH, FLOOR_HEIGHT);
  shadow.save();
  shadow.translate(14, STAGE.floor - STAGE.floor * 0.07);
  shadow.scale(1, 0.07);
  shadow.drawImage(buffers.scene, 0, 0, buffers.width, buffers.height, 0, 0, buffers.width / buffers.scale, buffers.height / buffers.scale);
  shadow.restore();
  shadow.save();
  shadow.globalCompositeOperation = 'source-in';
  shadow.fillStyle = '#080808';
  shadow.fillRect(0, 0, WIDTH, HEIGHT);
  shadow.restore();

  const reflection = buffers.reflection.getContext('2d');
  reflection.clearRect(0, FLOOR_TOP, WIDTH, FLOOR_HEIGHT);
  reflection.save();
  reflection.translate(0, STAGE.floor * 1.2);
  reflection.scale(1, -0.2);
  reflection.drawImage(buffers.scene, 0, 0, buffers.width, buffers.height, 0, 0, buffers.width / buffers.scale, buffers.height / buffers.scale);
  reflection.restore();
  reflection.save();
  reflection.globalCompositeOperation = 'destination-in';
  reflection.fillStyle = buffers.fade;
  reflection.fillRect(0, 0, WIDTH, HEIGHT);
  reflection.restore();

  ctx.save();
  ctx.drawImage(buffers.reflection, 0, FLOOR_TOP, buffers.width / buffers.scale, buffers.floorHeight / buffers.scale);
  ctx.globalAlpha = 0.16;
  ctx.filter = 'blur(5px)';
  ctx.drawImage(buffers.shadow, 0, FLOOR_TOP, buffers.width / buffers.scale, buffers.floorHeight / buffers.scale);
  ctx.restore();
  ctx.drawImage(buffers.scene, 0, 0, buffers.width / buffers.scale, buffers.height / buffers.scale);
}
