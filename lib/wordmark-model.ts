import { ExtrudeGeometry, Float32BufferAttribute, Path, Shape, Vector2 } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import silhouette from "./wordmark-geometry.json" with { type: "json" };

export const LOGO_WIDTH = 16;
export const LOGO_HEIGHT = silhouette.height / silhouette.width * LOGO_WIDTH;
export const LOGO_DEPTH = 0.72;
// The earlier radial ripple, scaled from its 2200px composition into world units.
export const WAVE = {
  duration: 1.6, speed: 1600 * 16 / 2200, width: 210 * 16 / 2200,
  wavelength: 95 * 16 / 2200, rise: 30 * 16 / 2200, depth: 0.6,
  tilt: 0.035, roll: 0.1, attack: 0.1,
};
export const REST_ROTATION = { x: -0.22, y: -0.24 };
const scale = LOGO_WIDTH / silhouette.width;
type Outline = { outer: number[][]; holes: number[][][] };

function shapes(outlines: Outline[]) {
  const points = (ring: number[][]) => ring.map(([x, y]) => new Vector2(
    (x - silhouette.width / 2) * scale,
    (silhouette.height / 2 - y) * scale,
  ));
  return outlines.map(({ outer, holes }) => {
    const shape = new Shape(points(outer));
    shape.holes = holes.map(hole => new Path(points(hole)));
    return shape;
  });
}

/** Both cap surfaces and all contour/hole walls are triangulated solid geometry. */
export function createWordmarkGeometry() {
  const extrude = (outlines: Outline[], cx = 0, cy = 0) => {
    const geometry = new ExtrudeGeometry(shapes(outlines), {
      depth: LOGO_DEPTH, steps: 1, bevelEnabled: false, curveSegments: 1,
    });
    geometry.translate(0, 0, -LOGO_DEPTH / 2);
    geometry.deleteAttribute("uv");
    geometry.clearGroups();
    const centers = new Float32Array(geometry.attributes.position.count * 2);
    for (let i = 0; i < centers.length; i += 2) { centers[i] = cx; centers[i + 1] = cy; }
    geometry.setAttribute("blockCenter", new Float32BufferAttribute(centers, 2));
    geometry.computeBoundingBox(); geometry.computeBoundingSphere();
    return geometry;
  };
  let offset = 0;
  const parts: ExtrudeGeometry[] = [];
  const blocks = silhouette.blocks.map(({ bounds: [x0, y0, x1, y1], shapes: outlines }) => {
    const x = ((x0 + x1) / 2 - silhouette.width / 2) * scale;
    const y = (silhouette.height / 2 - (y0 + y1) / 2) * scale;
    const geometry = extrude(outlines, x, y);
    parts.push(geometry);
    const block = { x, y, start: offset, count: geometry.attributes.position.count };
    offset += block.count;
    return block;
  });
  // One draw for all 60 pieces. The GPU moves each block around its own centre.
  const animated = mergeGeometries(parts)!;
  parts.forEach(part => part.dispose());
  animated.computeBoundingBox(); animated.computeBoundingSphere();
  return { solid: extrude(silhouette.outline), animated, blocks };
}

/** Reference for previews and bounds checks; the live scene evaluates this on the GPU. */
export function waveAmount(radius: number, age: number) {
  if (age <= 0 || age >= WAVE.duration) return 0;
  const offset = radius - age * WAVE.speed;
  const attack = Math.min(1, age / WAVE.attack);
  return Math.sin(offset / WAVE.wavelength) * Math.exp(-((offset / WAVE.width) ** 2))
    * (1 - age / WAVE.duration) * attack * attack * (3 - 2 * attack);
}

export function wavePose(x: number, y: number, age: number, origin = { x: 0, y: 0 }) {
  const wave = waveAmount(Math.hypot(x - origin.x, y - origin.y), age);
  return {
    x, y: y + wave * WAVE.rise, z: wave * WAVE.depth,
    rx: wave * WAVE.roll, rz: wave * WAVE.tilt,
  };
}

export function renderBudget(width: number, height: number, density: number, mobile: boolean) {
  const pixels = Math.max(1, width * height);
  return {
    pixelRatio: Math.min(density > 0 ? density : 1, mobile ? 1 : 1.5, Math.sqrt(1_200_000 / pixels)),
    interval: 1000 / (mobile ? 30 : 60),
  };
}

/** Fixed camera framing; independent of animation time, with space for the floor. */
export function cameraFrame(width: number, height: number) {
  const aspect = Math.max(1, width) / Math.max(1, height);
  const viewHeight = Math.max(5.1, 18.9 / aspect);
  return { width: viewHeight * aspect, height: viewHeight };
}
