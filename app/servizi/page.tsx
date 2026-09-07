import { pageMetadata } from "@/lib/seo";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "@/components/site-image";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { getServices } from "@/lib/content";
import { longestWordLength } from "@/lib/format";

export const metadata: Metadata = pageMetadata("/servizi", "Servizi", "SIAMO Studio affianca artisti, brand ed etichette con contenuti, identità visive, eventi, partnership, masterclass e progetti di serigrafia.");

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <PageHero kicker="SIAMO Studio" title="I NOSTRI SERVIZI." intro="Per brand, etichette, artisti e progetti culturali che vogliono costruire qualcosa di riconoscibile." />
      {services.length ? <section className="services-grid shell">
        {services.map((service, index) => {
          const cardImage = service.gallery?.[0] || service.cover;

          return (
            <Link className="service-card" href={`/servizi/${service.slug}`} key={service.id}>
              {cardImage ? (
                <Image
                  src={cardImage}
                  alt=""
                  width={1200}
                  height={900}
                  sizes="(max-width: 900px) 100vw, 50vw"
                />
              ) : null}
              <span className="service-number">{String(index + 1).padStart(2, "0")}</span>
              <div><h2 style={{ "--title-chars": longestWordLength(service.title) } as CSSProperties}>{service.title}</h2><p>{service.tagline}</p></div>
              <span className="row-arrow">↗</span>
            </Link>
          );
        })}
      </section> : null}
    </>
  );
}
