import type { Metadata } from "next";
import Image from "@/components/site-image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdsenseAdSlot } from "@/components/adsense-ad-slot";
import { ArticleAdSlot } from "@/components/article-ad-slot";
import { RichTextContent } from "@/components/rich-text";
import { articleAd, type AdPlacement } from "@/lib/advertising";
import { getArticle, getArticles } from "@/lib/content";
import { formatDate } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

// Account details stay server-side and reach the client slot as props.
function adSlot(placement: AdPlacement) {
  const ad = articleAd(placement);
  if (!ad) return null;

  return ad.source === "adManager"
    ? <ArticleAdSlot placement={placement} unitPath={ad.unitPath} />
    : <AdsenseAdSlot clientId={ad.clientId} placement={placement} slotId={ad.slotId} />;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  return article ? { title: article.title, description: article.excerpt } : {};
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();
  const articles = await getArticles();
  const next = articles.find((item) => item.slug !== slug);

  return (
    <article className="editorial-page shell">
      <header className="editorial-header">
        <Link className="back-link" href="/articoli">← Tutti gli articoli</Link>
        <span className="eyebrow">{article.category}</span>
        <h1>{article.title}</h1>
        <p className="editorial-subtitle">{article.subtitle}</p>
        <div className="editorial-meta">
          <span>{article.author}</span>
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
        </div>
      </header>
      <Image
        className="editorial-cover"
        src={article.cover}
        alt={`Copertina: ${article.title}`}
        width={1600}
        height={1000}
        sizes="(max-width: 1220px) 100vw, 1180px"
        priority
      />
      <div className="editorial-body">
        <RichTextContent
          inlineContent={adSlot("inline")}
          value={article.body}
        />
      </div>
      {adSlot("footer")}
      {next ? <Link className="next-content" href={`/articoli/${next.slug}`}><span>Continua a leggere</span><strong>{next.title} ↗</strong></Link> : null}
    </article>
  );
}
