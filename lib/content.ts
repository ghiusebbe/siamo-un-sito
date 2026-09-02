import {
  fallbackArticles,
  fallbackEvents,
  fallbackMagazines,
  fallbackServices,
  fallbackSettings,
  fallbackTimeline,
} from "@/lib/fallback-content";
import { sanityClient } from "@/lib/sanity";
import type { Article, EventItem, Magazine, Service, SiteSettings, TimelineItem } from "@/types/content";

type QueryOptions = { revalidate?: number; requestTag?: string };

const CACHE = {
  editorial: 300,
  events: 300,
  services: 3600,
  archive: 3600,
  magazines: 86400,
  settings: 3600,
} as const;

async function queryOrFallback<T>(
  query: string,
  fallback: T,
  params: Record<string, unknown> = {},
  { revalidate = CACHE.editorial, requestTag = "content" }: QueryOptions = {},
): Promise<T> {
  if (!sanityClient) return fallback;

  try {
    const value = await sanityClient.fetch<T>(query, params, {
      next: { revalidate },
      tag: requestTag,
    });
    return value ?? fallback;
  } catch (error) {
    console.error(`[sanity:${requestTag}] query failed; serving fallback content`, error);
    return fallback;
  }
}

const articleProjection = `{
  "id": _id,
  title,
  "slug": slug.current,
  category,
  subtitle,
  excerpt,
  body,
  "cover": coverImage.asset->url,
  author,
  publishedAt,
  featured
}`;

const eventProjection = `{
  "id": _id,
  title,
  "slug": slug.current,
  date,
  venue,
  city,
  lineup,
  description,
  "cover": coverImage.asset->url,
  ticketUrl,
  status
}`;

const serviceProjection = `{
  "id": _id,
  title,
  "slug": slug.current,
  tagline,
  intro,
  "cover": coverImage.asset->url,
  "gallery": gallery[].asset->url,
  deliverables,
  faq
}`;

export async function getArticles(): Promise<Article[]> {
  return queryOrFallback(`*[_type == "article" && defined(slug.current)] | order(publishedAt desc) ${articleProjection}`, fallbackArticles, {}, { revalidate: CACHE.editorial, requestTag: "articles" });
}

export async function getArticle(slug: string): Promise<Article | undefined> {
  const fallback = fallbackArticles.find((item) => item.slug === slug);
  return queryOrFallback(`*[_type == "article" && slug.current == $slug][0] ${articleProjection}`, fallback, { slug }, { revalidate: CACHE.editorial, requestTag: "article" });
}

export async function getEvents(): Promise<EventItem[]> {
  return queryOrFallback(`*[_type == "event" && defined(slug.current)] | order(date desc) ${eventProjection}`, fallbackEvents, {}, { revalidate: CACHE.events, requestTag: "events" });
}

export async function getEvent(slug: string): Promise<EventItem | undefined> {
  const fallback = fallbackEvents.find((item) => item.slug === slug);
  return queryOrFallback(`*[_type == "event" && slug.current == $slug][0] ${eventProjection}`, fallback, { slug }, { revalidate: CACHE.events, requestTag: "event" });
}

export async function getServices(): Promise<Service[]> {
  return queryOrFallback(`*[_type == "service" && defined(slug.current)] | order(order asc) ${serviceProjection}`, fallbackServices, {}, { revalidate: CACHE.services, requestTag: "services" });
}

export async function getService(slug: string): Promise<Service | undefined> {
  const fallback = fallbackServices.find((item) => item.slug === slug);
  return queryOrFallback(`*[_type == "service" && slug.current == $slug][0] ${serviceProjection}`, fallback, { slug }, { revalidate: CACHE.services, requestTag: "service" });
}

export async function getTimeline(): Promise<TimelineItem[]> {
  return queryOrFallback(`*[_type == "timelineItem"] | order(year desc, order asc) { "id": _id, year, title, description, "image": image.asset->url }`, fallbackTimeline, {}, { revalidate: CACHE.archive, requestTag: "timeline" });
}

export async function getMagazines(): Promise<Magazine[]> {
  return queryOrFallback(`*[_type == "magazine"] | order(volume asc) { "id": _id, volume, title, "cover": coverImage.asset->url, checkoutUrl }`, fallbackMagazines, {}, { revalidate: CACHE.magazines, requestTag: "magazines" });
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return queryOrFallback(`*[_type == "siteSettings"][0] { title, description, email, instagramHandle, instagramUrl, metrics }`, fallbackSettings, {}, { revalidate: CACHE.settings, requestTag: "settings" });
}
