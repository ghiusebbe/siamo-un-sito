import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("../", import.meta.url));
const publicDir = path.join(root, "public");
const outputDir = path.join(publicDir, "optimized-media");
const manifestPath = path.join(root, "lib/local-image-manifest.json");
const settings = { quality: 78, effort: 5 };
const widths = [320, 480, 640, 768, 1024, 1280, 1600];

async function imageFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await imageFiles(filename));
    else if (/\.(jpe?g|png|webp)$/i.test(entry.name)) files.push(filename);
  }
  return files.sort();
}

// Called by both framework configs before compilation, including direct `next build`.
// Originals stay intact; only generated copies are resized, without cropping/upscaling.
export async function prepareImages() {
  await mkdir(outputDir, { recursive: true });
  const manifest = {};
  for (const filename of await imageFiles(path.join(publicDir, "media"))) {
    const input = await readFile(filename);
    const metadata = await sharp(input).metadata();
    if (!metadata.width || !metadata.height || (metadata.pages || 1) > 1) continue;
    const rotated = (metadata.orientation || 1) >= 5;
    const originalWidth = rotated ? metadata.height : metadata.width;
    const maxWidth = Math.min(originalWidth, 1600);
    const candidates = [...new Set([...widths.filter((width) => width < maxWidth), maxWidth])];
    const hash = createHash("sha256").update(input)
      .update(JSON.stringify({ settings, versions: sharp.versions })).digest("hex").slice(0, 16);
    const source = `/${path.relative(publicDir, filename).split(path.sep).join("/")}`;
    const variants = [];
    for (const width of candidates) {
      const name = `${hash}-${width}.webp`;
      const destination = path.join(outputDir, name);
      const existing = await stat(destination).catch(() => null);
      if (!existing?.size) {
        await sharp(input).rotate().resize({ width, withoutEnlargement: true })
          .webp(settings).toFile(destination);
      }
      const bytes = existing?.size || (await stat(destination)).size;
      if (bytes < input.length) variants.push({ src: `/optimized-media/${name}`, width });
    }
    // Already compact PNG/WebP originals can beat a re-encode at full resolution.
    if (!variants.length || variants.at(-1).width < maxWidth) {
      variants.push({ src: source, width: originalWidth });
    }
    manifest[source] = variants;
  }
  const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
  // Avoid retriggering HMR or invalidating the build cache when nothing changed.
  if (await readFile(manifestPath, "utf8").catch(() => "") !== serialized) {
    await writeFile(manifestPath, serialized);
  }
  return manifest;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  prepareImages().then((manifest) => {
    console.log(`Prepared responsive WebP copies for ${Object.keys(manifest).length} local images.`);
  }).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
