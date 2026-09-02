import Link from "next/link";
import Image from "@/components/site-image";
import { DynamicTitle } from "@/components/dynamic-title";
import { NewsletterForm } from "@/components/newsletter-form";
import {
  getArticles,
  getEvents,
  getMagazines,
  getServices,
  getSiteSettings,
  getTimeline,
} from "@/lib/content";
import { formatDate } from "@/lib/format";

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

  return (
    <>
      <section className="home-intro shell">
        <div className="wordmark" aria-label="SIAMO">
          <span>S</span><span>I</span><span>A</span><span>M</span><span>O</span>
        </div>
        <div className="home-intro-row">
          <p className="home-intro-copy">Musica, immagini, persone e tutto quello che sta per esplodere.</p>
          <span className="home-intro-index">Magazine indipendente · Italia</span>
        </div>

        <div className="bento-grid">
          <Link className="bento-card bento-small card-hover" href="/articoli">
            <span>Articoli</span><span aria-hidden="true">↗</span>
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
              <small>{leadArticle?.category || "In evidenza"}</small>
              <strong>{leadArticle?.title || "Le storie che stanno muovendo la scena."}</strong>
            </span>
            <span aria-hidden="true">↗</span>
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
              <small>Eventi</small>
              <strong>{leadEvent?.title || "SIAMO dal vivo"}</strong>
            </span>
            <span aria-hidden="true">↗</span>
          </Link>

          <Link className="bento-card bento-photo media-card" href="/timeline">
            <Image
              src="/media/home-poster.webp"
              alt=""
              width={900}
              height={1100}
              sizes="(max-width: 620px) 100vw, (max-width: 900px) 50vw, 25vw"
            />
            <span>Timeline</span><span aria-hidden="true">↗</span>
          </Link>

          <div className="bento-stack">
            <Link className="bento-card card-hover" href="/servizi"><span>Servizi</span><span>↗</span></Link>
            <Link className="bento-card card-hover" href="/chi-siamo"><span>Chi siamo?</span><span>↗</span></Link>
          </div>
        </div>
      </section>

      <section className="dark-section latest-section">
        <div className="shell split-heading">
          <div className="heading-lockup">
            <span className="section-count">01</span>
            <DynamicTitle lines={["Ultime storie"]} />
          </div>
          <Link className="text-link compact-link" href="/articoli">Tutti gli articoli ↗</Link>
        </div>
        <div className="shell latest-grid">
          {articles.slice(0, 3).map((article) => (
            <Link className="latest-card" href={`/articoli/${article.slug}`} key={article.id}>
              <Image src={article.cover} alt="" width={900} height={830} sizes="(max-width: 900px) 76vw, 33vw" />
              <span className="eyebrow">{article.category} · {formatDate(article.publishedAt)}</span>
              <h3>{article.title}</h3>
              <p>{article.excerpt}</p>
            </Link>
          ))}
          {articles.length < 3 && leadEvent ? (
            <Link className="latest-card latest-event" href={`/eventi/${leadEvent.slug}`}>
              <Image src={leadEvent.cover} alt="" width={900} height={830} sizes="(max-width: 900px) 76vw, 33vw" />
              <span className="eyebrow">Evento · {formatDate(leadEvent.date)}</span>
              <h3>{leadEvent.title}</h3>
              <p>{leadEvent.lineup.join(" · ")}</p>
            </Link>
          ) : null}
        </div>
      </section>

      <section className="dark-section magazine-section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="section-count">02</span>
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
                  <a className="acid-button" href={magazine.checkoutUrl} target="_blank" rel="noreferrer">Acquista ↗</a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="dark-section studio-section">
        <div className="shell split-heading">
          <div className="heading-lockup">
            <span className="section-count">03</span>
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
          <Image className="story-image story-image-one" src="/media/community.webp" alt="Comunità SIAMO durante un evento" width={1400} height={1000} sizes="(max-width: 620px) 100vw, 58vw" />
          <Image className="story-image story-image-two" src="/media/service-serigrafia.jpg" alt="Laboratorio di serigrafia SIAMO" width={1000} height={1200} sizes="(max-width: 620px) 100vw, 42vw" />
          <div className="latest-strip">
            <span className="eyebrow">Dall’archivio</span>
            {timeline.slice(0, 4).map((item) => <span key={item.id}>{item.year} — {item.title}</span>)}
            <Link href="/timeline">Apri la timeline ↗</Link>
          </div>
        </div>
      </section>

      {leadEvent ? (
        <section className="dark-section event-promo">
          <div className="shell event-promo-grid">
            <Link className="event-promo-poster" href={`/eventi/${leadEvent.slug}`}>
              <Image src={leadEvent.cover} alt="" width={960} height={1200} sizes="(max-width: 620px) 100vw, 44vw" />
            </Link>
            <div className="event-promo-copy">
              <span className="eyebrow">Evento · {formatDate(leadEvent.date)}</span>
              <DynamicTitle lines={[leadEvent.title]} />
              <p>{leadEvent.lineup.join(" · ")}</p>
              <Link className="acid-button" href={`/eventi/${leadEvent.slug}`}>Scopri l’evento ↗</Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="metrics-section dark-section">
        <div className="shell metrics-grid">
          {settings.metrics.map((metric) => (
            <div key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span></div>
          ))}
        </div>
      </section>

      <section className="newsletter-section dark-section">
        <div className="shell newsletter-inner">
          <span className="eyebrow">La nostra newsletter</span>
          <DynamicTitle lines={["Le cose giuste,", "prima che diventino ovvie."]} />
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
