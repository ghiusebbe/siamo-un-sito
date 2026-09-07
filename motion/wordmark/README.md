# SIAMO — campo tipografico in rilievo

128 fragments of the original transparent logo assemble along a fan-shaped field.
The website adds local pointer displacement and a tap/keyboard impulse. The
HyperFrames composition demonstrates those same interactions deterministically.
Both use `public/brand/wordmark-motion.mjs`; no video is loaded by the website.

The shared Canvas renderer now bakes a 32-unit silhouette extrusion with charcoal
sides and a narrow bevel. It thickens the original bitmap mask before slicing,
retaining the custom wordmark rather than replacing it with a font. Each moving
block casts a soft floor shadow and a compressed, subdued reflection. This is a
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
