import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from "next/constants";
import { prepareImages } from "./scripts/prepare-images.mjs";

const nextConfig: NextConfig = {
  images: {
    // SiteImage uses prebuilt local WebP variants and resizes remote media at Sanity.
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    qualities: [75],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
        pathname: "/images/**",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/articoli-cms", destination: "/articoli", permanent: true },
      {
        source: "/articoli-cms/titolo2026",
        destination: "/articoli/titolo-format-2026",
        permanent: true,
      },
      {
        source: "/articoli-cms/ciao",
        destination: "/articoli/news-della-settimana-2",
        permanent: true,
      },
      { source: "/eventi-cms", destination: "/eventi", permanent: true },
      {
        source: "/eventi-cms/nome-evento",
        destination: "/eventi/ancora-kasino",
        permanent: true,
      },
    ];
  },
};

export default async function config(phase: string): Promise<NextConfig> {
  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
    await prepareImages();
  }
  return nextConfig;
}
