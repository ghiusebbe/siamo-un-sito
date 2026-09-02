import NextImage, { type ImageProps } from "next/image";

export default function SiteImage(props: ImageProps) {
  return (
    <NextImage
      {...props}
      unoptimized={props.unoptimized ?? process.env.NODE_ENV === "development"}
    />
  );
}
