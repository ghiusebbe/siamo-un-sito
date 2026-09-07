import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // SiteImage keeps local assets direct and resizes remote media at Sanity.
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

export default nextConfig;
