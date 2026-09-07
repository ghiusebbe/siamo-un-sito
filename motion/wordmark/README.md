# SIAMO — campo tipografico in rilievo

128 fragments of the original transparent logo assemble along a fan-shaped field.
The website adds local pointer displacement and a tap/keyboard impulse. The
HyperFrames composition demonstrates those same interactions deterministically.
Both use `public/brand/wordmark-motion.mjs`; no video is loaded by the website.

The shared Canvas renderer now bakes a 32-unit silhouette extrusion with charcoal
sides and a narrow bevel. It thickens the original bitmap mask before slicing,
retaining the custom wordmark rather than replacing it with a font. The moving
blocks share a soft floor shadow and a compressed, subdued reflection. This is a
Canvas 2.5D extrusion, not a WebGL mesh or a freely orbitable 3D model.

The fixed stage leaves space below for the floor at every timestamp. Source
pixels are normalized before slicing, and the same draw path is used during the
entrance and final hold, preventing a final-frame size jump. Cached per-block
surfaces avoid rebuilding the extrusion in the animation loop.

Run `node scripts/prepare-wordmark-motion.mjs` from the repository root after
changing the shared renderer, then from `motion/wordmark`:

```sh
npx --yes hyperframes@0.8.30 lint
npx --yes hyperframes@0.8.30 check --snapshots
npx --yes hyperframes@0.8.30 render --fps 60 --quality high --output wordmark.mp4
```

The fixed 2200 × 546 composition lasts 7.5 seconds. The website entrance lasts
2.8 seconds, waits for the entry curtain, and preserves the existing responsive
hero dimensions. Canvas resolution is capped at 2× device density. Animation
stops when settled or outside the viewport. Reduced motion and JavaScript/image
loading failures keep the original accessible image visible.

`preview.html` is a standalone interactive preview generated from the same source;
open it in a browser, move the pointer over the logo, click/tap, or use Enter/Space.
It is not the HyperFrames render. The HyperFrames CLI installation was blocked
by a canceled network approval in the authoring environment, so CLI rendering
and browser snapshot validation have not been completed here.

GSAP 3.15.0 is included only for the authoring composition; its license notice is
preserved in `assets/gsap.min.js`. It is not bundled into the website component.

## Occlusion and floor rendering

Side volumes are painted in a separate pass before all front faces. Sorting
whole block sprites by screen Y was incorrect for this coplanar extrusion and
made the internal cutting grid show through neighbouring faces.

Shadow and reflection are projected from the completed scene, once per frame.
The reflection uses one common floor transform and a continuous alpha gradient.
The shadow is blurred after projection, with opacity applied once, preventing
stacked dark strips at overlaps. Offscreen frame buffers are reused.

Verified in browser at 1100px and 390px canvas widths: assembly, final hold,
pointer displacement and tap-wave frames. The CLI export limitation above
still applies; browser verification uses the shared renderer directly.

## Rendering budget

Frame buffers now follow the output canvas pixel dimensions, capped at the
2200 × 546 composition size. Reflection and shadow buffers only cover the
166-unit floor band. At a 390px CSS width and 2× density (780 × 194 canvas),
the three frame buffers use 243,360 pixels instead of 3,603,600 (93.2% fewer).
At full composition resolution they use 1,931,600 pixels (46.4% fewer).
These figures describe frame-buffer storage/coverage, not an FPS improvement
or total memory, which also includes cached sprites.

Buffers and their fade gradient are reused until the output size changes.
Completely transparent tiles skip both paint passes; frame zero skips sprite
baking entirely. Each tile's front texture is also shared between the bake
and the front-face pass. Geometry, timing, interactions and full-resolution
HyperFrames output are unchanged.

Focused geometry and buffer-size tests pass. The browser timing comparison
was interrupted, so no measured frame-time improvement is claimed.

## Mobile-only quality profile

The website selects `drawWordmarkMobile` below 768px, or on coarse-pointer
screens up to 1020px (including phone landscape). Desktop and HyperFrames keep
`drawWordmark` and the full composition. Media-query changes resize and redraw
without restarting the entrance.

Mobile uses 20 full-height strips, half-resolution cached face/side sprites,
a cached contact shadow, and no animated reflection or full-frame compositing
buffers. A settled frame needs 41 draw calls instead of the desktop renderer’s
256 fragment draws plus composition passes. Output density is capped at 1.25×
and drawing at 30fps, with movement still driven by elapsed time. Tap/keyboard
impulses, reduced motion, offscreen suspension and the stable final size remain.
No FPS claim is made for physical phones; this bounds the work per frame.
