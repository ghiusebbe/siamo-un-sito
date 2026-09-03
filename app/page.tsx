import Link from "next/link";
import Image from "@/components/site-image";
import { DynamicTitle } from "@/components/dynamic-title";
import { NewsletterForm } from "@/components/newsletter-form";
import { NewTabNote } from "@/components/new-tab-note";
import {
  getArticles,
  getEvents,
  getMagazines,
  getServices,
  getSiteSettings,
  getTimeline,
} from "@/lib/content";
import { formatDate } from "@/lib/format";
import { instagramAssets } from "@/lib/instagram-assets";
import { newsletterConfigured } from "@/lib/sanity";

export default async function HomePage() {
  const [articles, events, magazines, services, settings, timeline] = await Promise.all([
    getArticles(),
    getEvents(),
    getMagazines(),
    getServices(),
    getSiteSettings(),
    getTimeline(),
  ]);

  const leadArticle = articles[0];
  const leadEvent = events[0];
  const upcomingEvent = events.find((event) => event.status === "upcoming");
  const latestArticles = articles.slice(0, 3);

  // Sections earn their place with content: a "latest" rail with one card or a
  // promo for an event already in the bento would only repeat what is above.
  const showLatest = latestArticles.length >= 2;
  const showEventPromo = Boolean(upcomingEvent);
  const showMetrics = settings.metrics.length > 0;
  const showNewsletter = newsletterConfigured;
  const sectionNumbers = ["01", "02", "03", "04"];
  let sectionIndex = 0;
  const nextSectionNumber = () => sectionNumbers[sectionIndex++];

  return (
    <div className="home-feed">
      <section className="home-intro shell">
        <h1 className="wordmark">
          <Image
            src="/brand/siamo-wordmark-black.png"
            alt="SIAMO"
            width={2200}
            height={546}
            sizes="100vw"
            priority
          />
        </h1>
        <div className="home-intro-row">
          <p className="home-intro-copy">Musica, immagini, persone e tutto quello che sta per esplodere.</p>
          <span className="home-intro-index">Magazine indipendente · Italia</span>
        </div>

        <nav className="bento-grid" aria-label="Esplora SIAMO">
          <Link className="bento-card bento-small bento-nav-card card-hover" href="/articoli">
            <Image
              className="bento-brand-symbol"
              src="/brand/siamo-symbol-black.png"
              alt=""
              width={900}
              height={730}
              sizes="(max-width: 767px) 84vw, 25vw"
            />
            <span className="bento-card-copy">
              <small>Archivio editoriale</small>
              <strong>Articoli</strong>
            </span>
            <span className="bento-card-arrow" aria-hidden="true">↗</span>
          </Link>

          <Link className="bento-card bento-wide bento-feature media-card" href={leadArticle ? `/articoli/${leadArticle.slug}` : "/articoli"}>
            <Image
              src={leadArticle?.cover || "/media/home-magazine.jpg"}
              alt=""
              width={1600}
              height={1000}
              sizes="(max-width: 620px) 100vw, (max-width: 900px) 100vw, 75vw"
              priority
            />
            <span className="bento-card-copy">
              <small>In evidenza · {leadArticle?.category || "Storie"}</small>
              <strong>{leadArticle?.title || "Le storie che stanno muovendo la scena."}</strong>
            </span>
            <span className="bento-card-arrow" aria-hidden="true">↗</span>
          </Link>

          <Link className="bento-card bento-timeline media-card" href={leadEvent ? `/eventi/${leadEvent.slug}` : "/eventi"}>
            <Image
              src={leadEvent?.cover || "/media/event-ancora-kasino.jpg"}
              alt=""
              width={1400}
              height={1000}
              sizes="(max-width: 620px) 100vw, (max-width: 900px) 100vw, 50vw"
            />
            <span className="bento-card-copy">
              <small>Dal vivo · Eventi</small>
              <strong>{leadEvent?.title || "SIAMO dal vivo"}</strong>
            </span>
            <span className="bento-card-arrow" aria-hidden="true">↗</span>
          </Link>

          <Link className="bento-card bento-photo media-card" href="/timeline">
            <Image
              src="/media/home-poster.webp"
              alt=""
              width={900}
              height={1100}
              sizes="(max-width: 620px) 100vw, (max-width: 900px) 50vw, 25vw"
            />
            <span className="bento-card-copy">
              <small>Archivio visivo</small>
              <strong>Timeline</strong>
            </span>
            <span className="bento-card-arrow" aria-hidden="true">↗</span>
          </Link>

          <div className="bento-stack">
            <Link className="bento-card bento-nav-card card-hover" href="/servizi">
              <span className="bento-card-copy"><small>Progetti</small><strong>Servizi</strong></span>
              <span className="bento-card-arrow" aria-hidden="true">↗</span>
            </Link>
            <Link className="bento-card bento-nav-card card-hover" href="/chi-siamo">
              <Image
                className="bento-brand-illustration"
                src="/brand/siamo-illustration.png"
                alt=""
                width={1000}
                height={920}
                sizes="(max-width: 767px) 84vw, 25vw"
                loading="lazy"
              />
              <span className="bento-card-copy"><small>Il magazine</small><strong>Chi siamo?</strong></span>
              <span className="bento-card-arrow" aria-hidden="true">↗</span>
            </Link>
          </div>
        </nav>
      </section>

      {showLatest ? (
        <section className="dark-section latest-section">
          <div className="shell split-heading">
            <div className="heading-lockup">
              <span className="section-count">{nextSectionNumber()}</span>
              <DynamicTitle lines={["Ultime storie"]} />
            </div>
            <Link className="text-link compact-link" href="/articoli">Tutti gli articoli ↗</Link>
          </div>
          <div className="shell latest-grid">
            {latestArticles.map((article) => (
              <Link className="latest-card" href={`/articoli/${article.slug}`} key={article.id}>
                <Image src={article.cover} alt="" width={900} height={830} sizes="(max-width: 900px) 76vw, 33vw" />
                <span className="eyebrow">{article.category} · {formatDate(article.publishedAt)}</span>
                <h3>{article.title}</h3>
                <p>{article.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="dark-section instagram-section">
        <div className="shell split-heading">
          <div className="heading-lockup">
            <span className="section-count">{nextSectionNumber()}</span>
            <DynamicTitle lines={["Dal feed."]} />
          </div>
          <a
            className="text-link compact-link"
            href={settings.instagramUrl}
            target="_blank"
            rel="noreferrer"
          >
            Segui {settings.instagramHandle} ↗<NewTabNote />
          </a>
        </div>
        <div className="shell instagram-grid">
          {instagramAssets.map((asset) => (
            <a
              className={`instagram-card instagram-card-${asset.layout}`}
              href={asset.href}
              key={asset.id}
              target="_blank"
              rel="noreferrer"
            >
              <Image
                src={asset.src}
                alt={asset.alt}
                width={asset.width}
                height={asset.height}
                sizes="(max-width: 620px) 82vw, (max-width: 900px) 50vw, 42vw"
              />
              <span className="instagram-card-copy">
                <small>{asset.category}</small>
                <strong>{asset.title}<NewTabNote /></strong>
              </span>
              <span className="instagram-card-arrow" aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </section>

      <section className="dark-section magazine-section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="section-count">{nextSectionNumber()}</span>
              <span className="eyebrow">I nostri cartacei in digitale</span>
            </div>
            <DynamicTitle lines={["Tre volumi.", "Una scena intera."]} />
          </div>
          <div className="magazine-grid">
            {magazines.map((magazine) => (
              <article className="magazine-card" key={magazine.id}>
                <div className="magazine-cover">
                  <Image
                    src={magazine.cover}
                    alt={`Copertina ${magazine.title}`}
                    width={900}
                    height={1200}
                    sizes="(max-width: 620px) 78vw, (max-width: 900px) 46vw, 33vw"
                  />
                </div>
                <div>
                  <span>Volume {magazine.volume}</span>
                  <h3>{magazine.title}</h3>
                  <a className="acid-button" href={magazine.checkoutUrl} target="_blank" rel="noreferrer">
                    Acquista ↗<span className="sr-only"> {magazine.title}</span><NewTabNote />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="dark-section studio-section">
        <div className="shell split-heading">
          <div className="heading-lockup">
            <span className="section-count">{nextSectionNumber()}</span>
            <DynamicTitle lines={["SIAMO Studio"]} />
          </div>
          <Link className="text-link compact-link" href="/servizi">Tutti i servizi ↗</Link>
        </div>
        <div className="shell home-services-grid">
          {services.map((service, index) => {
            const cardImage = service.gallery?.[0] || service.cover;

            return (
              <Link className="home-service-card" href={`/servizi/${service.slug}`} key={service.id}>
                {cardImage ? (
                  <Image
                    src={cardImage}
                    alt=""
                    width={900}
                    height={760}
                    sizes="(max-width: 620px) 86vw, (max-width: 900px) 46vw, 33vw"
                    loading="lazy"
                  />
                ) : null}
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{service.title}</h3>
                <p>{service.tagline}</p>
                <strong aria-hidden="true">↗</strong>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="dark-section story-section">
        <div className="shell story-grid">
          <div className="story-statement">
            <span className="eyebrow">SIAMO attivi</span>
            <DynamicTitle lines={["La scena non", "si osserva", "da lontano."]} />
            <p>La raccontiamo su carta, la portiamo dal vivo e costruiamo progetti insieme a chi la rende possibile.</p>
            <Link className="text-link" href="/chi-siamo">Conosci SIAMO ↗</Link>
          </div>
          <Image className="story-image story-image-one" src="/media/instagram/festival-recap.jpg" alt="Artista sul palco durante SIAMO il terzo festival" width={1080} height={1350} sizes="(max-width: 620px) 100vw, 58vw" loading="lazy" />
          <Image className="story-image story-image-two" src="/media/instagram/magazine-third-issue.jpg" alt="Terzo magazine SIAMO" width={720} height={900} sizes="(max-width: 620px) 100vw, 42vw" loading="lazy" />
          <div className="latest-strip">
            <span className="eyebrow">Dall’archivio</span>
            {timeline.slice(0, 4).map((item) => <span key={item.id}>{item.year} — {item.title}</span>)}
            <Link href="/timeline">Apri la timeline ↗</Link>
          </div>
        </div>
      </section>

      {showEventPromo && upcomingEvent ? (
        <section className="dark-section event-promo">
          <div className="shell event-promo-grid">
            <Link className="event-promo-poster" href={`/eventi/${upcomingEvent.slug}`}>
              <Image src={upcomingEvent.cover} alt="" width={960} height={1200} sizes="(max-width: 620px) 100vw, 44vw" loading="lazy" />
            </Link>
            <div className="event-promo-copy">
              <span className="eyebrow">Prossimo evento · {formatDate(upcomingEvent.date)}</span>
              <DynamicTitle lines={[upcomingEvent.title]} />
              <p>{upcomingEvent.lineup.join(" · ")}</p>
              <Link className="acid-button" href={`/eventi/${upcomingEvent.slug}`}>Scopri l’evento ↗</Link>
            </div>
          </div>
        </section>
      ) : null}

      {showMetrics ? (
        <section className="metrics-section dark-section">
          <div className="shell metrics-grid">
            {settings.metrics.map((metric) => (
              <div key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span></div>
            ))}
          </div>
        </section>
      ) : null}

      {showNewsletter ? (
        <section className="newsletter-section dark-section">
          <div className="shell newsletter-inner">
            <span className="eyebrow">La nostra newsletter</span>
            <DynamicTitle lines={["Le cose giuste,", "prima che diventino ovvie."]} />
            <NewsletterForm />
          </div>
        </section>
      ) : null}
    </div>
  );
}
