import type { Metadata } from "next";
import Image from "@/components/site-image";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { getServices } from "@/lib/content";

export const metadata: Metadata = { title: "Servizi" };

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <PageHero kicker="SIAMO Studio" title="I NOSTRI SERVIZI." intro="Per brand, etichette, artisti e progetti culturali che vogliono costruire qualcosa di riconoscibile." />
      <section className="services-grid shell">
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
              <div><h2>{service.title}</h2><p>{service.tagline}</p></div>
              <span className="row-arrow">↗</span>
            </Link>
          );
        })}
      </section>
    </>
  );
}
