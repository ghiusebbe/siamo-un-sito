import { ExtrudeGeometry, Path, Shape, Vector2 } from "three";
import { mergeGroups } from "three/addons/utils/BufferGeometryUtils.js";
import silhouette from "./wordmark-geometry.json" with { type: "json" };

export const LOGO_WIDTH = 16;
export const LOGO_HEIGHT = silhouette.height / silhouette.width * LOGO_WIDTH;
export const LOGO_DEPTH = 0.72;
export const ASSEMBLY_DURATION = 2.6;
export const BURST_DURATION = 1.5;
export const REST_ROTATION = { x: -0.22, y: -0.24 };
const scale = LOGO_WIDTH / silhouette.width;
type Outline = { outer: number[][]; holes: number[][][] };

function shapes(outlines: Outline[], cx = 0, cy = 0) {
  const points = (ring: number[][]) => ring.map(([x, y]) => new Vector2(
    (x - silhouette.width / 2) * scale - cx,
    (silhouette.height / 2 - y) * scale - cy,
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
    const geometry = new ExtrudeGeometry(shapes(outlines, cx, cy), {
      depth: LOGO_DEPTH, steps: 1, bevelEnabled: false, curveSegments: 1,
    });
    geometry.translate(0, 0, -LOGO_DEPTH / 2);
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    // Two material draws per solid, independent of disconnected contours.
    return mergeGroups(geometry);
  };
  return {
    solid: extrude(silhouette.outline),
    blocks: silhouette.blocks.map(({ bounds: [x0, y0, x1, y1], shapes: outlines }) => {
      const x = ((x0 + x1) / 2 - silhouette.width / 2) * scale;
      const y = (silhouette.height / 2 - (y0 + y1) / 2) * scale;
      return { x, y, geometry: extrude(outlines, x, y) };
    }),
  };
}

const clamp = (n: number) => Math.max(0, Math.min(1, n));

/** Absolute-time poses always return exactly to the original silhouette. */
export function blockPose(index: number, x: number, y: number, time: number, burstAge = Infinity) {
  const progress = clamp((time - (x / LOGO_WIDTH + 0.5) * 0.5 - index % 3 * 0.045) / 1.8);
  const remaining = (1 - progress) ** 3;
  const burst = burstAge >= 0 && burstAge < BURST_DURATION
    ? Math.sin(Math.PI * burstAge / BURST_DURATION) ** 2 : 0;
  const spread = remaining * 0.16 + burst * 0.06;
  return {
    x: x * (1 + spread),
    y: y + remaining * (0.2 + index % 4 * 0.06) + burst * 0.16,
    z: remaining * (0.6 + index % 5 * 0.12) + burst * (0.2 + index % 4 * 0.07),
    rx: remaining * Math.sin(index * 2.1) * 0.25 + burst * Math.sin(index) * 0.08,
    ry: remaining * Math.cos(index * 1.7) * 0.3 + burst * Math.cos(index) * 0.12,
  };
}

/** Fixed camera framing; independent of animation time, with space for the floor. */
export function cameraFrame(width: number, height: number) {
  const aspect = Math.max(1, width) / Math.max(1, height);
  const viewHeight = Math.max(5.1, 18.9 / aspect);
  return { width: viewHeight * aspect, height: viewHeight };
}
