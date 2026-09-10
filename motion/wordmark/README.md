# SIAMO — Three.js wordmark

The homepage uses Three.js 0.186.0 and a WebGL2 renderer. The wordmark is a
triangulated, extruded solid with front and back caps and side walls, including
the holes in the letters. It is built from the alpha outline of the original
`public/brand/siamo-wordmark-black.png`; the bitmap is only the accessible fallback.
No font substitution, image planes, Canvas2D extrusion or video is used by the
active animation.

## Source

- `scripts/prepare-wordmark-geometry.mjs` traces and simplifies the original
  silhouette offline, retaining the holes and stars. Run `npm run wordmark:prepare`
  after replacing the source PNG. The generated JSON records its SHA-256.
- `lib/wordmark-geometry.json` contains the complete outline and 35 occupied blocks.
  Longest-axis subdivision produces blocks instead of full-height columns.
- `lib/wordmark-model.ts` creates actual `THREE.ExtrudeGeometry` objects, with
  0.72 units of depth for a 16-unit-wide logo. Absolute-time assembly and impulse
  poses return exactly to the original positions.
- `lib/wordmark-scene.ts` owns the camera, materials, lights, shadow map, desktop
  planar reflection, interactions and GPU resource lifecycle.
- `components/wordmark.tsx` imports the engine after the visible hero has mounted
  and the browser has an idle slot. The original image stays visible until the
  first successful render, with no change to the hero's dimensions.

## Interaction

Drag horizontally to rotate through 360 degrees; vertical rotation is limited
so the logo remains above its floor. Hover adds a small tilt. Click, tap,
Enter or Space trigger the block impulse. Arrow keys rotate; Escape, R or a
double-click return to the initial view. Touch scrolling and pinch zoom remain
available. Reduced motion uses the original static logo and skips loading Three.js.

## Rendering budget

The same 35 solid blocks are used on desktop and phones. When settled, a complete
solid replaces the coplanar blocks to eliminate internal seams and reduce material
draws to two. Assembly uses 70 material groups. The solid has 18,202 triangles;
the blocks together have 18,488. Camera size is independent of animation time.

Desktop density is capped at 2, with a 1024px shadow map and a 768×256 reflection
render target. Mobile caps density at 1.25 and animation at 30fps, uses a 512px
shadow map and skips the reflection pass. Environment lighting is baked once at
128px desktop / 64px mobile. Rendering stops when settled, outside the viewport
or in a hidden tab. Geometry, materials, render targets, observers and event
listeners are disposed on cleanup. WebGL failures retain the static fallback.

## Verification

`node --test tests/wordmark-three.test.mjs` verifies closed surfaces, positive
volume, all 35 blocks, exact settled poses, and camera framing across phone and
desktop aspect ratios and a full horizontal rotation. The existing rendered-HTML
checks cover the fallback and keyboard control. TypeScript and the production
build are also checked.

The authoring cloud browser has WebGL disabled. It displayed the fallback correctly,
but could not exercise the GPU animation, materials, shadows or gestures. An offline
Three.js SVG projection was used to inspect the solid silhouette. This is not a
WebGL rendering test, and no physical-phone frame-rate measurement is claimed.

## Previous HyperFrames composition

`public/brand/wordmark-motion.mjs`, `assets/`, `index.html`, `preview.html` and
`scripts/prepare-wordmark-motion.mjs` remain as the earlier Canvas2D/HyperFrames
composition. They are not imported by the homepage. Its old tests describe that
archived renderer; they do not validate the new Three.js scene.
