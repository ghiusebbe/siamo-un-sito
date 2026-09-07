import manifest from "@/lib/local-image-manifest.json";

type Variant = { src: string; width: number };
const images: Record<string, Variant[]> = manifest;

export function localImageVariants(src: string) {
  return Object.hasOwn(images, src) ? images[src] : undefined;
}
