import NextImage, { type ImageProps } from "next/image";

export default function SiteImage(props: ImageProps) {
  // Sites already serves bundled media through its edge cache. Sending local
  // WebP assets through Vinext's image endpoint can break cards in production.
  return (
    <NextImage
      {...props}
      unoptimized={props.unoptimized ?? true}
    />
  );
}
