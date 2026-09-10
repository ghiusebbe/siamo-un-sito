/** Trace the supplied alpha silhouette offline. No image/font/trace work on the client. */
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { ShapeUtils, Vector2 } from 'three';

const source = new URL('../public/brand/siamo-wordmark-black.png', import.meta.url);
const bytes = await readFile(source);
const { data, info: { width, height } } = await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const mask = Uint8Array.from({ length: width * height }, (_, i) => Number(data[i * 4 + 3] >= 128));
const filled = (x, y) => x >= 0 && y >= 0 && x < width && y < height && mask[y * width + x];
// One source pixel removes the raster staircase, below a display pixel even on desktop.
const tolerance = 1;
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
  return distance > tolerance ** 2
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

function groupRings(rings) {
  const shapes = rings.filter(ring => area(ring) > 0).map(outer => ({ outer, holes: [] }));
  for (const hole of rings.filter(ring => area(ring) < 0)) {
    const parent = shapes.filter(shape => contains(shape.outer, hole[0]))
      .sort((a, b) => area(a.outer) - area(b.outer))[0];
    if (!parent) throw new Error('Unattached silhouette hole');
    parent.holes.push(hole);
  }
  return shapes;
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
  return groupRings(rings);
}

// Clip the already-simplified silhouette, so every block shares the exact same
// exterior contour as the solid. Retracing each block would simplify it differently.
function clipTriangles(triangles, [left, top, right, bottom]) {
  const edges = new Map();
  const key = point => point.map(n => Number(n.toFixed(6))).join(',');
  for (const triangle of triangles) {
    let polygon = triangle;
    for (const [axis, limit, sign] of [[0, left, 1], [0, right, -1], [1, top, 1], [1, bottom, -1]]) {
      const clipped = [];
      for (let i = 0; i < polygon.length; i++) {
        const a = polygon[i], b = polygon[(i + 1) % polygon.length];
        const aIn = (a[axis] - limit) * sign >= 0, bIn = (b[axis] - limit) * sign >= 0;
        if (aIn) clipped.push(a);
        if (aIn !== bIn) {
          const t = (limit - a[axis]) / (b[axis] - a[axis]);
          const p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
          p[axis] = limit; clipped.push(p);
        }
      }
      polygon = clipped;
    }
    if (polygon.length < 3 || Math.abs(area(polygon)) < 1e-8) continue;
    if (area(polygon) < 0) polygon.reverse();
    for (let i = 0; i < polygon.length; i++) {
      const a = key(polygon[i]), b = key(polygon[(i + 1) % polygon.length]);
      if (a === b) continue;
      if (edges.has(`${b}|${a}`)) edges.delete(`${b}|${a}`);
      else edges.set(`${a}|${b}`, [a, b]);
    }
  }
  const outgoing = new Map();
  for (const [a, b] of edges.values()) {
    if (!outgoing.has(a)) outgoing.set(a, []);
    outgoing.get(a).push(b);
  }
  const point = key => key.split(',').map(Number);
  const rings = [];
  while (outgoing.size) {
    const start = outgoing.keys().next().value;
    let cursor = start, previous = null;
    const ring = [];
    do {
      const p = point(cursor); ring.push(p);
      const candidates = outgoing.get(cursor);
      if (!candidates?.length) throw new Error('Open clipped contour');
      if (previous && candidates.length > 1) {
        const dx = p[0] - previous[0], dy = p[1] - previous[1];
        const turn = candidate => {
          const q = point(candidate), x = q[0] - p[0], y = q[1] - p[1];
          return Math.atan2(dx * y - dy * x, dx * x + dy * y);
        };
        candidates.sort((a, b) => turn(b) - turn(a));
      }
      const next = candidates.shift();
      if (!candidates.length) outgoing.delete(cursor);
      previous = p; cursor = next;
    } while (cursor !== start);
    // Clipping introduces points on straight cut lines. Remove only collinear
    // points; applying the raster tolerance again would change the silhouette.
    const reduced = ring.filter((b, i) => {
      const a = ring[(i + ring.length - 1) % ring.length], c = ring[(i + 1) % ring.length];
      return Math.abs((b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0])) > 1e-5;
    });
    if (reduced.length >= 3 && Math.abs(area(reduced)) > 1e-8) rings.push(reduced);
  }
  return groupRings(rings);
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

// Split occupied regions along their longest dimension: 60 actual blocks,
// including the stars, rather than full-height strips or empty grid cells.
const leaves = [measure([0, 0, width, height])];
while (leaves.length < 60) {
  leaves.sort((a, b) => b.count - a.count);
  const { bounds: [l, t, r, b], extent: [x0, y0, x1, y1] } = leaves.shift();
  const horizontal = x1 - x0 >= y1 - y0;
  const mid = Math.floor(horizontal ? (x0 + x1) / 2 : (y0 + y1) / 2);
  const children = (horizontal ? [[l, t, mid, b], [mid, t, r, b]] : [[l, t, r, mid], [l, mid, r, b]]).map(measure);
  if (children.some(child => !child.count)) throw new Error('Empty block');
  leaves.push(...children);
}
leaves.sort((a, b) => a.extent[0] - b.extent[0] || a.extent[1] - b.extent[1]);
const outline = trace([0, 0, width, height]);
const triangles = outline.flatMap(shape => {
  const rings = [shape.outer, ...shape.holes].map(ring => ring.map(([x, y]) => new Vector2(x, y)));
  const points = [shape.outer, ...shape.holes].flat();
  return ShapeUtils.triangulateShape(rings[0], rings.slice(1)).map(face => face.map(i => points[i]));
});
const model = {
  source: 'siamo-wordmark-black.png',
  sourceSha256: createHash('sha256').update(bytes).digest('hex'),
  tolerance,
  width, height,
  outline,
  blocks: leaves.map(({ bounds, extent }) => ({ bounds: extent, shapes: clipTriangles(triangles, bounds) })),
};
await writeFile(new URL('../lib/wordmark-geometry.json', import.meta.url), `${JSON.stringify(model)}\n`);
console.log(`Traced ${model.outline.length} shapes, ${model.outline.reduce((sum, shape) => sum + shape.holes.length, 0)} holes and ${model.blocks.length} solid blocks from ${width}×${height} alpha pixels.`);
