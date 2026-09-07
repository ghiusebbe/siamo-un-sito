import type { ImageLoaderProps } from "next/image";

export function isSanityImage(src: string): boolean {
  try {
    const url = new URL(src);
    return url.protocol === "https:" && url.hostname === "cdn.sanity.io" && url.pathname.startsWith("/images/");
  } catch {
    return false;
  }
}

/** Resize at the original CDN; no Vercel or Sites image endpoint is needed. */
export function sanityImageLoader({ src, width, quality }: ImageLoaderProps): string {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality || 75));
  url.searchParams.set("auto", "format");
  if (!url.searchParams.has("fit")) url.searchParams.set("fit", "max");
  return url.toString();
}
