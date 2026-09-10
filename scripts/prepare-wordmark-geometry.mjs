/** Trace the supplied alpha silhouette offline. No image/font/trace work on the client. */
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const source = new URL('../public/brand/siamo-wordmark-black.png', import.meta.url);
const bytes = await readFile(source);
const { data, info: { width, height } } = await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const mask = Uint8Array.from({ length: width * height }, (_, i) => Number(data[i * 4 + 3] >= 128));
const filled = (x, y) => x >= 0 && y >= 0 && x < width && y < height && mask[y * width + x];
const area = points => points.reduce((sum, [x, y], i) => {
  const [nx, ny] = points[(i + 1) % points.length];
  return sum + x * ny - nx * y;
}, 0) / 2;

function simplify(points) {
  if (points.length < 3) return points;
  const [ax, ay] = points[0], [bx, by] = points.at(-1);
  const dx = bx - ax, dy = by - ay, length = dx * dx + dy * dy;
  let farthest = 0, distance = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = points[i];
    const t = length ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / length)) : 0;
    const d = (x - ax - t * dx) ** 2 + (y - ay - t * dy) ** 2;
    if (d > distance) { distance = d; farthest = i; }
  }
  return distance > 0.55 ** 2
    ? [...simplify(points.slice(0, farthest + 1)).slice(0, -1), ...simplify(points.slice(farthest))]
    : [points[0], points.at(-1)];
}

function contains(ring, [x, y]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [a, b] = ring[i], [c, d] = ring[j];
    if ((b > y) !== (d > y) && x < (c - a) * (y - b) / (d - b) + a) inside = !inside;
  }
  return inside;
}

function trace([left, top, right, bottom]) {
  const edges = new Map();
  const key = (x, y) => y * (width + 1) + x;
  const point = key => [key % (width + 1), Math.floor(key / (width + 1))];
  const add = (x, y, nx, ny, direction) => {
    const start = key(x, y);
    if (!edges.has(start)) edges.set(start, []);
    edges.get(start).push({ end: key(nx, ny), direction });
  };
  const inside = (x, y) => x >= left && x < right && y >= top && y < bottom && filled(x, y);
  for (let y = top; y < bottom; y++) for (let x = left; x < right; x++) {
    if (!inside(x, y)) continue;
    if (!inside(x, y - 1)) add(x, y, x + 1, y, 0);
    if (!inside(x + 1, y)) add(x + 1, y, x + 1, y + 1, 1);
    if (!inside(x, y + 1)) add(x + 1, y + 1, x, y + 1, 2);
    if (!inside(x - 1, y)) add(x, y + 1, x, y, 3);
  }
  const rings = [];
  while (edges.size) {
    const start = edges.keys().next().value;
    let cursor = start, previous = edges.get(start)[0].direction;
    const points = [];
    do {
      points.push(point(cursor));
      const candidates = edges.get(cursor);
      if (!candidates?.length) throw new Error('Open silhouette contour');
      // At diagonal pixel contacts, turn into the same filled region.
      const order = [(previous + 1) % 4, previous, (previous + 3) % 4, (previous + 2) % 4];
      candidates.sort((a, b) => order.indexOf(a.direction) - order.indexOf(b.direction));
      const edge = candidates.shift();
      if (!candidates.length) edges.delete(cursor);
      cursor = edge.end; previous = edge.direction;
    } while (cursor !== start);
    if (Math.abs(area(points)) < 2) continue;
    const reduced = simplify([...points, points[0]]).slice(0, -1);
    if (reduced.length >= 3 && Math.abs(area(reduced)) >= 2) rings.push(reduced);
  }
  const shapes = rings.filter(ring => area(ring) > 0).map(outer => ({ outer, holes: [] }));
  for (const hole of rings.filter(ring => area(ring) < 0)) {
    const parent = shapes.filter(shape => contains(shape.outer, hole[0]))
      .sort((a, b) => area(a.outer) - area(b.outer))[0];
    if (!parent) throw new Error('Unattached silhouette hole');
    parent.holes.push(hole);
  }
  return shapes;
}

function measure(bounds) {
  const [left, top, right, bottom] = bounds;
  let count = 0, minX = right, minY = bottom, maxX = left, maxY = top;
  for (let y = top; y < bottom; y++) for (let x = left; x < right; x++) if (filled(x, y)) {
    count++; minX = Math.min(minX, x); maxX = Math.max(maxX, x + 1);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y + 1);
  }
  return { bounds, count, extent: [minX, minY, maxX, maxY] };
}

// Split occupied regions along their longest dimension: 35 actual blocks,
// including the stars, rather than full-height strips or empty grid cells.
const leaves = [measure([0, 0, width, height])];
while (leaves.length < 35) {
  leaves.sort((a, b) => b.count - a.count);
  const { bounds: [l, t, r, b], extent: [x0, y0, x1, y1] } = leaves.shift();
  const horizontal = x1 - x0 >= y1 - y0;
  const mid = Math.floor(horizontal ? (x0 + x1) / 2 : (y0 + y1) / 2);
  const children = (horizontal ? [[l, t, mid, b], [mid, t, r, b]] : [[l, t, r, mid], [l, mid, r, b]]).map(measure);
  if (children.some(child => !child.count)) throw new Error('Empty block');
  leaves.push(...children);
}
leaves.sort((a, b) => a.extent[0] - b.extent[0] || a.extent[1] - b.extent[1]);
const model = {
  source: 'siamo-wordmark-black.png',
  sourceSha256: createHash('sha256').update(bytes).digest('hex'),
  width, height,
  outline: trace([0, 0, width, height]),
  blocks: leaves.map(({ bounds, extent }) => ({ bounds: extent, shapes: trace(bounds) })),
};
await writeFile(new URL('../lib/wordmark-geometry.json', import.meta.url), `${JSON.stringify(model)}\n`);
console.log(`Traced ${model.outline.length} shapes, ${model.outline.reduce((sum, shape) => sum + shape.holes.length, 0)} holes and ${model.blocks.length} solid blocks from ${width}×${height} alpha pixels.`);
