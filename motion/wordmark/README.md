# SIAMO — Three.js wordmark

The homepage uses Three.js 0.186.0 and a WebGL2 renderer. The wordmark is a
triangulated, extruded solid with front and back caps and side walls, including
the holes in the letters. It is built from the alpha outline of the original
`public/brand/siamo-wordmark-black.png`; the bitmap is only the accessible fallback.
No font substitution, image planes, Canvas2D extrusion or video is used by the
active animation.

## Source

- `scripts/prepare-wordmark-geometry.mjs` traces the original silhouette with a
  one-source-pixel tolerance, retaining the holes and stars. It clips this shared
  contour into blocks, so their exterior matches the solid exactly. Run
  `npm run wordmark:prepare` after replacing the source PNG. The generated JSON
  records its SHA-256 and simplification tolerance.
- `lib/wordmark-geometry.json` contains the complete outline and 35 occupied blocks.
  Longest-axis subdivision produces blocks instead of full-height columns.
- `lib/wordmark-model.ts` creates actual `THREE.ExtrudeGeometry` objects, with
  0.72 units of depth for a 16-unit-wide logo, then merges the blocks into one
  geometry with a centre attribute for each block.
- `lib/wordmark-material.ts` moves the blocks rigidly in its vertex shader and
  shades the caps and walls in one material. The travelling radial wave uses the
  earlier composition's speed, wavelength, width and decay, with added depth.
- `lib/wordmark-scene.ts` owns the camera, interactions and GPU resource lifecycle.
- `components/wordmark.tsx` imports the engine after the visible hero has mounted
  and the browser has an idle slot. The original image stays visible until the
  first successful render, with no change to the hero's dimensions.

## Interaction

An entrance wave crosses the assembled logo after the intro curtain. Click or
tap sends a radial ripple from that point; Enter or Space sends one from the
centre. Blocks lift and roll locally, then return to the original silhouette.
There is no scattered assembly, global burst or hover tilt.

Drag horizontally to rotate through 360 degrees; vertical rotation is limited.
Arrow keys rotate; Escape, R or a double-click return to the initial view and stop
the wave. Touch scrolling and pinch zoom remain available. Reduced motion uses
the original static logo and skips loading Three.js.

## Rendering budget

The same 35 solid blocks are used on desktop and phones. One mesh draws them all;
only the wave age and origin change, with no per-block JavaScript transforms.
When settled, the mesh uses the complete outline to hide subdivision seams.
Camera size is independent of animation time.

Compared with the first Three.js version (`5f0cd28`):

| Measure | Before | Now |
| --- | ---: | ---: |
| Animated triangles | 18,488 | 3,716 |
| Settled triangles | 18,202 | 3,160 |
| Logo draws per animated frame, before extra scene passes | 70 | 1 |
| Geometry JSON, bytes | 98,626 | 21,776 |
| Geometry JSON, gzip bytes | 19,376 | 4,260 |
| Deferred scene chunk including Three.js, gzip bytes (Vinext) | 167,043 | 147,764 |

There are no environment bakes, shadow maps, reflection render targets or extra
camera passes. Desktop adds only a two-triangle soft contact patch: two draws
total; phones use one. Desktop density is capped at 1.5, mobile at 1, and the
drawing buffer is capped at 1.2 million pixels. Animation is limited to 60fps
desktop / 30fps mobile. These are rendering limits, not measured frame rates.

Rendering stops when settled, outside the viewport or in a hidden tab. A timer
waits out the entry curtain without rendering frames behind it. Merely moving
the pointer over the logo does not start a render loop. Geometry, materials,
observers, timers and listeners are disposed on cleanup. WebGL failures retain
the static fallback.

## Verification

`node --test tests/wordmark-three.test.mjs tests/rendered-html.test.mjs` passes
16 checks: closed surfaces, positive volume, all 35 blocks and their GPU pivots,
triangle and pixel budgets, travelling-wave behaviour, exact settled poses,
source-silhouette overlap, and unclipped desktop/phone framing during the wave
and full horizontal rotation. HTML checks cover the fallback and keyboard control.
TypeScript, Vinext and Next.js production builds also pass.

The actual wave shaders were compiled, linked and rendered offline with OpenGL ES
3.2 using the Three.js geometry and camera matrices. Six frames rendered without
GL errors, and the two settled frames matched exactly. The authoring cloud browser
has WebGL disabled, so this is not an end-to-end WebGL browser or gesture test.
No physical-phone frame-rate measurement is claimed.

## Previous HyperFrames composition

`public/brand/wordmark-motion.mjs`, `assets/`, `index.html`, `preview.html` and
`scripts/prepare-wordmark-motion.mjs` remain as the earlier Canvas2D/HyperFrames
composition. They are not imported by the homepage. Its old tests describe that
archived renderer; they do not validate the new Three.js scene.
