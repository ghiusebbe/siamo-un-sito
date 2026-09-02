import type { Metadata } from "next";
import Image from "@/components/site-image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleAdSlot } from "@/components/article-ad-slot";
import { RichTextContent } from "@/components/rich-text";
import { getArticle, getArticles } from "@/lib/content";
import { formatDate } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

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
        <span className="eyebrow">{article.category}</span>
        <h1>{article.title}</h1>
        <p className="editorial-subtitle">{article.subtitle}</p>
        <div className="editorial-meta"><span>{article.author}</span><span>{formatDate(article.publishedAt)}</span></div>
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
          inlineContent={<ArticleAdSlot placement="inline" />}
          value={article.body}
        />
      </div>
      <ArticleAdSlot placement="footer" />
      {next ? <Link className="next-content" href={`/articoli/${next.slug}`}><span>Continua a leggere</span><strong>{next.title} ↗</strong></Link> : null}
    </article>
  );
}
