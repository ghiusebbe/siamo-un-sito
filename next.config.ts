import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from "next/constants";
import { prepareImages } from "./scripts/prepare-images.mjs";

const securityHeaders = [
  // Nothing here is meant to be framed. Above all the Studio, whose Publish and
  // Delete buttons must not be clickable through someone else's page.
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
];

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
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Content-hashed file names: a new image always gets a new URL.
      { source: "/optimized-media/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      // Stable names that could be replaced in place: long, but not forever.
      { source: "/fonts/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }] },
      { source: "/brand/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
      { source: "/media/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
    ];
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
