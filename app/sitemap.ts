import type { MetadataRoute } from "next";
import { getArticles, getEvents, getServices } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, events, services] = await Promise.all([getArticles(), getEvents(), getServices()]);
  const staticPages = ["", "/articoli", "/eventi", "/timeline", "/servizi", "/chi-siamo", "/privacy"];
  return [
    ...staticPages.map((path) => ({ url: `${siteUrl}${path}`, changeFrequency: "weekly" as const })),
    ...articles.map((item) => ({ url: `${siteUrl}/articoli/${item.slug}`, lastModified: item.publishedAt })),
    ...events.map((item) => ({ url: `${siteUrl}/eventi/${item.slug}`, lastModified: item.date })),
    ...services.map((item) => ({ url: `${siteUrl}/servizi/${item.slug}`, changeFrequency: "monthly" as const })),
  ];
}
