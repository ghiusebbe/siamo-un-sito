import { sanityClient } from "@/lib/sanity";
import { contentText } from "@/lib/content-presence";
import { canonicalUrl } from "@/lib/site-url";
import { siteDescription } from "@/lib/seo";

type FeedArticle = {
  id: string;
  title: string;
  slug: string;
  publishedAt: string;
  excerpt?: string;
  subtitle?: string;
  author?: string;
  category?: string;
  cover?: string;
};

/** XML 1.0 text/attributes, including control characters and isolated surrogates. */
function xml(value: string): string {
  return value.replace(/[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/gu, "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function imageUrl(value?: string): string | undefined {
  if (!contentText(value)) return undefined;
  try {
    const url = new URL(value!, canonicalUrl());
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    if (url.hostname === "cdn.sanity.io") {
      url.searchParams.set("w", "1200");
      url.searchParams.set("fit", "max");
      url.searchParams.set("fm", "jpg");
      url.searchParams.set("q", "80");
    }
    return url.href;
  } catch {
    return undefined;
  }
}

export async function getRssFeed(): Promise<string> {
  // Do not reuse getArticles: its demo fallback must never enter an email campaign.
  if (!sanityClient) throw new Error("Sanity is not configured");
  const articles = await sanityClient.fetch<FeedArticle[]>(
    `*[_type == "article" && !(_id in path("drafts.**"))
      && defined(slug.current) && defined(publishedAt)
      && dateTime(publishedAt) <= dateTime(now())]
      | order(publishedAt desc, _id asc)[0...50]{
        "id": _id, title, "slug": slug.current, publishedAt,
        excerpt, subtitle, author, category, "cover": coverImage.asset->url
      }`,
    {},
    { perspective: "published", tag: "rss", cache: "no-store", timeout: 10_000 },
  );
  if (!Array.isArray(articles)) throw new Error("Invalid RSS query response");

  const now = Date.now();
  const published = articles.filter((article) => article && contentText(article.id)
    && !article.id.startsWith("drafts.") && contentText(article.slug) && contentText(article.title)
    && Number.isFinite(Date.parse(article.publishedAt)) && Date.parse(article.publishedAt) <= now)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.id.localeCompare(b.id));

  const items = published.map((article) => {
    const link = canonicalUrl(`/articoli/${encodeURIComponent(article.slug)}`);
    const cover = imageUrl(article.cover);
    const description = contentText(article.excerpt) || contentText(article.subtitle);
    // RSS description contains escaped HTML; readers decode XML before rendering it.
    const html = `${cover ? `<p><img src="${xml(cover)}" alt="${xml(article.title)}" /></p>` : ""}`
      + `${description ? `<p>${xml(description)}</p>` : ""}`
      + `<p><a href="${xml(link)}">Leggi l’articolo su SIAMO</a></p>`;
    return `<item>
      <title>${xml(article.title)}</title>
      <link>${xml(link)}</link>
      <guid isPermaLink="false">${xml(`siamo:article:${article.id}`)}</guid>
      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
      <description>${xml(html)}</description>
      ${contentText(article.author) ? `<dc:creator>${xml(article.author!)}</dc:creator>` : ""}
      ${contentText(article.category) ? `<category>${xml(article.category!)}</category>` : ""}
      ${cover ? `<media:content url="${xml(cover)}" medium="image" />` : ""}
    </item>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>SIAMO — musica e cultura emergente</title>
    <link>${xml(canonicalUrl())}</link>
    <description>${xml(siteDescription)}</description>
    <language>it-IT</language>
    <atom:link href="${xml(canonicalUrl("/feed.xml"))}" rel="self" type="application/rss+xml" />
    ${items.join("\n")}
  </channel>
</rss>`;
}
