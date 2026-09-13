import type { Metadata } from "next";
import type { Article } from "@/types/content";
import { canonicalUrl, siteUrl } from "@/lib/site-url";

const siteName = "SIAMO";
export const homeTitle = "SIAMO — magazine di musica e cultura emergente";
export const siteDescription = "SIAMO è il magazine indipendente dedicato alla musica e alla cultura emergente italiana: interviste, approfondimenti, eventi e progetti editoriali.";
const publisherId = `${siteUrl}/#organization`;

export function validDate(value?: string): string | undefined {
  return value && !Number.isNaN(Date.parse(value)) ? new Date(value).toISOString() : undefined;
}

export function pageMetadata(path: string, title: string, description: string, cover?: string, alt = title): Metadata {
  const url = canonicalUrl(path);
  const images = [{ url: canonicalUrl(cover || "/icon.png"), alt }];
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName, locale: "it_IT", type: "website", images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export function articleMetadata(article: Article): Metadata {
  const description = article.excerpt || article.subtitle || `${article.title}: leggi l’articolo su SIAMO, magazine di musica e cultura emergente.`;
  const metadata = pageMetadata(`/articoli/${article.slug}`, article.title, description, article.cover, article.coverAlt || article.title);
  return {
    ...metadata,
    authors: article.author ? [{ name: article.author }] : undefined,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: validDate(article.publishedAt),
      modifiedTime: validDate(article._updatedAt),
      authors: article.author ? [article.author] : undefined,
      section: article.category,
    },
  };
}

export const siteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": publisherId,
      name: siteName,
      url: canonicalUrl(),
      logo: { "@type": "ImageObject", url: canonicalUrl("/icon.png"), width: 512, height: 512 },
      sameAs: ["https://www.instagram.com/siamounmagazine/"],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: siteName,
      alternateName: "SIAMO un magazine",
      url: canonicalUrl(),
      description: siteDescription,
      inLanguage: "it-IT",
      publisher: { "@id": publisherId },
    },
  ],
};

export function articleStructuredData(article: Article) {
  const url = canonicalUrl(`/articoli/${article.slug}`);
  const author = article.author?.trim();
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: article.title,
    description: article.excerpt || article.subtitle || undefined,
    image: article.cover ? [canonicalUrl(article.cover)] : undefined,
    author: !author || /^(siamo|redazione(?: siamo)?)$/i.test(author)
      ? { "@type": "Organization", "@id": publisherId, name: author || siteName }
      : { "@type": "Person", name: author },
    datePublished: validDate(article.publishedAt),
    dateModified: validDate(article._updatedAt) || validDate(article.publishedAt),
    publisher: { "@id": publisherId },
    articleSection: article.category,
    inLanguage: "it-IT",
    isPartOf: { "@id": `${siteUrl}/#website` },
  };
}

/** Sanity text must never be able to terminate the JSON-LD script element. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
