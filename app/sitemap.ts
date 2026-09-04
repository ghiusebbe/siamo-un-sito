import type { MetadataRoute } from "next";
import { getArticles, getEvents, getServices } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL) || "http://localhost:3000";
  const [articles, events, services] = await Promise.all([getArticles(), getEvents(), getServices()]);
  const staticPages = ["", "/articoli", "/eventi", "/timeline", "/servizi", "/chi-siamo"];
  return [
    ...staticPages.map((path) => ({ url: `${base}${path}`, changeFrequency: "weekly" as const })),
    ...articles.map((item) => ({ url: `${base}/articoli/${item.slug}`, lastModified: item.publishedAt })),
    ...events.map((item) => ({ url: `${base}/eventi/${item.slug}`, lastModified: item.date })),
    ...services.map((item) => ({ url: `${base}/servizi/${item.slug}`, changeFrequency: "monthly" as const })),
  ];
}
