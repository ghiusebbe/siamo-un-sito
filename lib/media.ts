import type { CSSProperties } from "react";

/**
 * Sanity encodes the asset's pixel size in the file name it serves
 * (`…-1200x1600.jpg`), which is the only place the real proportions of an
 * editorial photo are available without measuring it in the browser. Reading
 * them lets a cover keep its own shape instead of being cropped into the one
 * the layout guessed.
 */
const DIMENSIONS = /-(\d{2,5})x(\d{2,5})\.(?:jpg|jpeg|png|webp|avif|gif)(?:$|\?)/i;

export type ImageSize = { width: number; height: number };

export function imageSize(url: string | undefined, fallback: ImageSize): ImageSize {
  const match = url?.match(DIMENSIONS);
  if (!match) return fallback;

  const width = Number(match[1]);
  const height = Number(match[2]);
  return width && height ? { width, height } : fallback;
}

/**
 * Props for a cover that should keep its own proportions: the declared size
 * plus the ratio as a custom property, so the stylesheet can cap the height
 * without guessing the shape of the photo.
 */
export function coverProps(url: string | undefined, fallback: ImageSize) {
  const { width, height } = imageSize(url, fallback);
  return { width, height, style: { "--cover-ratio": width / height } as CSSProperties };
}
