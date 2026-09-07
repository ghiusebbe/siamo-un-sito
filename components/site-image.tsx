import NextImage, { type ImageProps } from "next/image";
import { preload as preloadResource } from "react-dom";
import { isSanityImage, sanityImageLoader } from "@/lib/sanity-image";

const widths = [320, 480, 640, 750, 828, 1080, 1200, 1600, 1920, 2400];

export default function SiteImage(props: ImageProps) {
  if (typeof props.src !== "string" || !isSanityImage(props.src) || props.unoptimized || props.loader || props.placeholder === "blur") {
    // Keep bundled media direct, as required by the existing Sites runtime.
    return <NextImage {...props} unoptimized={props.unoptimized ?? true} />;
  }

  const { src, alt, width, height, sizes = "100vw", quality, priority, preload, fill, style, loading, fetchPriority, className, id, title, onLoad, onError, decoding } = props;
  const srcSet = widths.map((candidate) => `${sanityImageLoader({ src, width: candidate, quality: Number(quality) || 75 })} ${candidate}w`).join(", ");
  const imageSrc = sanityImageLoader({ src, width: Number(width) || 1600, quality: Number(quality) || 75 });
  const eager = priority || preload;
  if (eager) preloadResource(imageSrc, { as: "image", imageSrcSet: srcSet, imageSizes: sizes, fetchPriority: "high" });

  // Vinext's custom NextImage loader emits only one URL, without srcset.
  // Native responsive markup lets both runtimes select the same Sanity variants.
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Resized and converted by Sanity CDN, with responsive preload.
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
