import type { Metadata } from "next";
import Image from "@/components/site-image";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { getArticles } from "@/lib/content";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Articoli" };

export default async function ArticlesPage() {
  const articles = await getArticles();
  return (
    <>
      <PageHero kicker="Archivio editoriale" title="ARTICOLI" intro="Interviste, approfondimenti e tutto ciò che si muove nella scena emergente." />
      <section className="listing-section shell">
        {articles.map((article, index) => (
          <Link className="article-row" href={`/articoli/${article.slug}`} key={article.id}>
            <span className="row-number">{String(index + 1).padStart(2, "0")}</span>
            <Image
              src={article.cover}
              alt=""
              width={440}
              height={440}
              sizes="(max-width: 620px) 100vw, (max-width: 900px) 160px, 220px"
            />
            <div className="article-row-copy">
              <span className="eyebrow">{article.category} · {formatDate(article.publishedAt)}</span>
              <h2>{article.title}</h2>
              <p>{article.excerpt}</p>
              <span className="row-author">{article.author}</span>
            </div>
            <span className="row-arrow">↗</span>
          </Link>
        ))}
      </section>
    </>
  );
}
