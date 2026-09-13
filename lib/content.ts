import {
  fallbackArticles,
  fallbackEvents,
  fallbackMagazines,
  fallbackServices,
  fallbackSettings,
  fallbackTimeline,
} from "@/lib/fallback-content";
import { sanityClient } from "@/lib/sanity";
import { contentText, hasText, richTextBlocks } from "@/lib/content-presence";
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

/**
 * Sanity's CDN resizes and converts on request. The site serves images
 * unoptimised, so ask the CDN for a sensible size and format up front.
 */
const IMAGE_PARAMS = "auto=format&fit=max&w=1600&q=78";

function sanityImage(url: string | null | undefined): string {
  url = contentText(url);
  if (!url) return "";
  if (!url.includes("cdn.sanity.io") || url.includes("?")) return url;
  return `${url}?${IMAGE_PARAMS}`;
}

const normalizeContent = {
  article: (item: Article): Article => ({
    ...item,
    cover: sanityImage(item.cover),
    coverAlt: contentText(item.coverAlt),
    subtitle: contentText(item.subtitle),
    excerpt: contentText(item.excerpt),
    body: richTextBlocks(item.body),
  }),
  event: (item: EventItem): EventItem => ({
    ...item,
    cover: sanityImage(item.cover),
    venue: contentText(item.venue),
    city: contentText(item.city),
    ticketUrl: contentText(item.ticketUrl),
    lineup: (item.lineup ?? []).map(contentText).filter(hasText),
    description: richTextBlocks(item.description),
  }),
  service: (item: Service): Service => ({
    ...item,
    cover: sanityImage(item.cover),
    gallery: (item.gallery ?? []).map(sanityImage).filter(hasText),
    deliverables: (item.deliverables ?? [])
      .filter((entry) => hasText(entry?.title))
      .map((entry) => ({ ...entry, description: contentText(entry.description) })),
    // An accordion without an answer offers no content when opened.
    faq: (item.faq ?? []).filter((entry) => hasText(entry?.question) && hasText(entry?.answer)),
  }),
  timeline: (item: TimelineItem): TimelineItem => ({
    ...item,
    image: sanityImage(item.image),
    description: contentText(item.description),
    link: contentText(item.link),
  }),
  magazine: (item: Magazine): Magazine => ({
    ...item,
    cover: sanityImage(item.cover),
    checkoutUrl: contentText(item.checkoutUrl),
    comingSoon: item.comingSoon === true,
    releaseAt: contentText(item.releaseAt),
  }),
};

const CONTENT_TYPES = ["article", "event", "service", "timelineItem", "magazine", "siteSettings"];

/**
 * A freshly created dataset has no documents at all. Until the first import
 * the site keeps serving the bundled content instead of going blank; once
 * anything is published, an intentionally empty collection stays empty.
 */
async function datasetHasContent(): Promise<boolean> {
  if (!sanityClient) return false;
  try {
    const count = await sanityClient.fetch<number>(
      `count(*[_type in $types])`,
      { types: CONTENT_TYPES },
      { next: { revalidate: 60 }, tag: "dataset-state" },
    );
    return count > 0;
  } catch (error) {
    console.error("[sanity:dataset-state] query failed; serving fallback content", error);
    return false;
  }
}

async function queryOrFallback<T>(
  query: string,
  fallback: T,
  params: Record<string, unknown> = {},
  { revalidate = CACHE.editorial, requestTag = "content" }: QueryOptions = {},
): Promise<T> {
  if (!sanityClient) return fallback;
  if (!(await datasetHasContent())) return fallback;

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
  _updatedAt,
  title,
  "slug": slug.current,
  category,
  subtitle,
  excerpt,
  body,
  "cover": coverImage.asset->url,
  "coverAlt": coverImage.alt,
  author,
  publishedAt,
  featured
}`;

const eventProjection = `{
  "id": _id,
  _updatedAt,
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
  _updatedAt,
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
  const items = await queryOrFallback(`*[_type == "article" && defined(slug.current)] | order(publishedAt desc) ${articleProjection}`, fallbackArticles, {}, { revalidate: CACHE.editorial, requestTag: "articles" });
  return items.map(normalizeContent.article);
}

export async function getArticle(slug: string): Promise<Article | undefined> {
  const fallback = fallbackArticles.find((item) => item.slug === slug);
  const item = await queryOrFallback(`*[_type == "article" && slug.current == $slug][0] ${articleProjection}`, fallback, { slug }, { revalidate: CACHE.editorial, requestTag: "article" });
  return item && normalizeContent.article(item);
}

export async function getEvents(): Promise<EventItem[]> {
  const items = await queryOrFallback(`*[_type == "event" && defined(slug.current)] | order(date desc) ${eventProjection}`, fallbackEvents, {}, { revalidate: CACHE.events, requestTag: "events" });
  return items.map(normalizeContent.event);
}

export async function getEvent(slug: string): Promise<EventItem | undefined> {
  const fallback = fallbackEvents.find((item) => item.slug === slug);
  const item = await queryOrFallback(`*[_type == "event" && slug.current == $slug][0] ${eventProjection}`, fallback, { slug }, { revalidate: CACHE.events, requestTag: "event" });
  return item && normalizeContent.event(item);
}

export async function getServices(): Promise<Service[]> {
  const items = await queryOrFallback(`*[_type == "service" && defined(slug.current)] | order(order asc) ${serviceProjection}`, fallbackServices, {}, { revalidate: CACHE.services, requestTag: "services" });
  return items.map(normalizeContent.service);
}

export async function getService(slug: string): Promise<Service | undefined> {
  const fallback = fallbackServices.find((item) => item.slug === slug);
  const item = await queryOrFallback(`*[_type == "service" && slug.current == $slug][0] ${serviceProjection}`, fallback, { slug }, { revalidate: CACHE.services, requestTag: "service" });
  return item && normalizeContent.service(item);
}

export async function getTimeline(): Promise<TimelineItem[]> {
  const items = await queryOrFallback(`*[_type == "timelineItem"] | order(year desc, order asc) { "id": _id, year, title, description, link, "image": image.asset->url }`, fallbackTimeline, {}, { revalidate: CACHE.archive, requestTag: "timeline" });
  return items.map(normalizeContent.timeline);
}

export async function getMagazines(): Promise<Magazine[]> {
  const items = await queryOrFallback(`*[_type == "magazine"] | order(volume asc) { "id": _id, volume, title, "cover": coverImage.asset->url, checkoutUrl, comingSoon, releaseAt }`, fallbackMagazines, {}, { revalidate: CACHE.magazines, requestTag: "magazines" });
  return items.map(normalizeContent.magazine);
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const settings = await queryOrFallback(`*[_type == "siteSettings"][0] { title, description, email, instagramHandle, instagramUrl, metrics }`, fallbackSettings, {}, { revalidate: CACHE.settings, requestTag: "settings" });
  return {
    ...settings,
    description: contentText(settings.description),
    instagramHandle: contentText(settings.instagramHandle),
    instagramUrl: contentText(settings.instagramUrl),
    metrics: (settings.metrics ?? []).filter((metric) => hasText(metric?.value) && hasText(metric?.label)),
  };
}
