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
- `lib/wordmark-geometry.json` contains the complete outline and 60 occupied blocks.
  Longest-axis subdivision produces blocks instead of full-height columns.
- `lib/wordmark-model.ts` creates actual `THREE.ExtrudeGeometry` objects, with
  0.72 units of depth for a 16-unit-wide logo, then merges the blocks into one
  geometry with a centre attribute for each block.
- `lib/wordmark-material.ts` moves the blocks rigidly in its vertex shader and
  shades the caps and walls in one material. The travelling radial wave uses the
  earlier composition's speed, wavelength, width and decay, with added depth.
- `lib/wordmark-scene.ts` owns the camera, interactions and GPU resource lifecycle.
- `components/wordmark.tsx` imports the engine immediately when the hero mounts.
  The original image is reserved for reduced motion, unavailable WebGL, or a
  failed load. It is hidden before first paint while enhanced loading is pending.
- `lib/intro.ts` and `components/site-intro.tsx` hold the entry curtain until the
  scene has actually rendered both the animated and settled geometry. The wave
  starts on curtain exit, after shaders and buffers are ready. Initial home loads,
  including return visits, cannot expose the bitmap before the 3D canvas.

The loader has an eight-second fallback, including an inline pre-hydration guard
if the client bundle fails to arrive. Timed-out imports cannot replace the fallback
later. Without JavaScript the original image is visible immediately. Other routes
do not wait for a wordmark; client navigation to the home uses a local loading label
until its canvas is ready. Neither path changes the hero's dimensions.

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

The same 60 solid blocks are used on desktop and phones. One mesh draws them all;
only the wave age and origin change, with no per-block JavaScript transforms.
When settled, the mesh uses the complete outline to hide subdivision seams.
Camera size is independent of animation time.

Compared with the first Three.js version (`5f0cd28`):

| Measure | Before | Now |
| --- | ---: | ---: |
| Animated triangles | 18,488 | 4,068 |
| Settled triangles | 18,202 | 3,160 |
| Logo draws per animated frame, before extra scene passes | 70 | 1 |
| Geometry JSON, bytes | 98,626 | 24,991 |
| Geometry JSON, gzip bytes | 19,376 | 4,933 |

There are no environment bakes, shadow maps, reflection render targets or extra
camera passes. Desktop adds only a two-triangle soft contact patch: two draws
total; phones use one. Desktop density is capped at 1.5, mobile at 1, and the
drawing buffer is capped at 1.2 million pixels. Animation is limited to 60fps
desktop / 30fps mobile. These are rendering limits, not measured frame rates.

Increasing the blocks from 35 to 60 adds only 352 triangles (9.5%) to the optimized
animation, with the same single logo draw and unchanged mobile pixel/frame limits.

At startup two settled renders warm the geometry and shader behind the curtain,
then rendering stops until it exits. After entry, rendering stops when settled,
outside the viewport or in a hidden tab. Merely moving the pointer over the logo
does not start a render loop. Geometry, materials, observers, timers and listeners
are disposed on cleanup. WebGL failures retain the static fallback.

## Verification

`node --test tests/wordmark-three.test.mjs tests/wordmark-loading.test.mjs tests/rendered-html.test.mjs`
covers closed surfaces, positive volume, all 60 blocks and their GPU pivots,
triangle and pixel budgets, travelling-wave behaviour, exact settled poses,
source-silhouette overlap, and unclipped desktop/phone framing during the wave
and full horizontal rotation. Nine loader checks cover slow/cached loads, early
readiness, interrupted CSS, missing JavaScript, WebGL failure, reduced motion,
other routes, Studio navigation, private storage and background tabs. HTML checks cover the bootstrap
order, initially hidden enhanced logo, fallback and keyboard control. TypeScript,
Vinext and Next.js production builds also pass.

The unchanged wave shaders were compiled, linked and rendered offline with OpenGL ES
3.2 using the Three.js geometry and camera matrices. Six frames rendered without
GL errors, and the two settled frames matched exactly. The authoring cloud browser
has WebGL disabled, so this is not an end-to-end WebGL browser or gesture test.
The user confirmed the optimized 35-block version was fluid on mobile. The 60-block
revision retains its rendering limits; no new physical-phone frame-rate measurement
is claimed.

## Previous HyperFrames composition

`public/brand/wordmark-motion.mjs`, `assets/`, `index.html`, `preview.html` and
`scripts/prepare-wordmark-motion.mjs` remain as the earlier Canvas2D/HyperFrames
composition. They are not imported by the homepage. Its old tests describe that
archived renderer; they do not validate the new Three.js scene.
