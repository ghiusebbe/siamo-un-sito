import NextImage, { type ImageProps } from "next/image";
import { preload as preloadResource } from "react-dom";
import { isSanityImage, sanityImageLoader } from "@/lib/sanity-image";
import { localImageVariants } from "@/lib/local-image";

const widths = [320, 480, 640, 750, 828, 1080, 1200, 1600, 1920, 2400];

export default function SiteImage(props: ImageProps) {
  const localVariants = typeof props.src === "string" ? localImageVariants(props.src) : undefined;
  if (typeof props.src !== "string" || (!localVariants && !isSanityImage(props.src)) || props.unoptimized || props.loader || props.placeholder === "blur") {
    // Keep logos, unsupported sources and explicit opt-outs on their existing path.
    return <NextImage {...props} unoptimized={props.unoptimized ?? true} />;
  }

  const { src, alt, width, height, sizes = "100vw", quality, priority, preload, fill, style, loading, fetchPriority, className, id, title, onLoad, onError, decoding } = props;
  const srcSet = localVariants
    ? localVariants.map((variant) => `${variant.src} ${variant.width}w`).join(", ")
    : widths.map((candidate) => `${sanityImageLoader({ src, width: candidate, quality: Number(quality) || 75 })} ${candidate}w`).join(", ");
  const fallback = localVariants?.find((variant) => variant.width >= (Number(width) || 1280)) || localVariants?.at(-1);
  const imageSrc = fallback?.src || sanityImageLoader({ src, width: Number(width) || 1600, quality: Number(quality) || 75 });
  const eager = priority || preload;
  if (eager) preloadResource(imageSrc, { as: "image", imageSrcSet: srcSet, imageSizes: sizes, fetchPriority: "high" });

  // Vinext's custom NextImage loader emits only one URL, without srcset.
  // Native responsive markup works with both prebuilt local files and Sanity CDN.
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Resized at build time or by Sanity CDN, with responsive preload.
    <img
      id={id}
      title={title}
      src={imageSrc}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={className}
      style={fill ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style } : style}
      loading={eager ? "eager" : loading || "lazy"}
      fetchPriority={fetchPriority || (eager ? "high" : undefined)}
      decoding={decoding || "async"}
      onLoad={onLoad}
      onError={onError}
    />
  );
}
