import type { Metadata } from "next";
import Image from "@/components/site-image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getService, getServices } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getService((await params).slug);
  return service ? { title: service.title, description: service.intro } : {};
}

export default async function ServiceDetailPage({ params }: Props) {
  const service = await getService((await params).slug);
  if (!service) notFound();
  const services = await getServices();

  return (
    <article className="service-detail">
      <header className="service-detail-hero shell">
        <span className="eyebrow">SIAMO Studio</span>
        <h1>{service.title}</h1>
        <p className="service-tagline">{service.tagline}</p>
        <p className="service-intro">{service.intro}</p>
      </header>
      {service.cover ? (
        <div className="service-cover shell">
          <Image
            src={service.cover}
            alt={`Progetto ${service.title}`}
            width={1600}
            height={1000}
            sizes="(max-width: 1220px) 100vw, 1180px"
            priority
          />
        </div>
      ) : null}
      <section className="deliverables shell">
        <span className="section-label">Cosa facciamo?</span>
        {service.deliverables.map((item, index) => (
          <article key={item.title}>
            <span>{String(index + 1).padStart(2, "0")}</span><h2>{item.title}</h2><p>{item.description}</p>
          </article>
        ))}
      </section>
      {service.gallery?.length ? (
        <section className="service-gallery shell">
          {service.gallery.map((image) => (
            <Image
              src={image}
              alt=""
              width={900}
              height={1200}
              sizes="(max-width: 620px) 100vw, 50vw"
              key={image}
            />
          ))}
        </section>
      ) : null}
      {service.faq.length ? (
        <section className="faq-section shell">
          <h2>Domande frequenti</h2>
          {service.faq.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}
        </section>
      ) : null}
      <nav className="services-nav shell" aria-label="Altri servizi">
        {services.filter((item) => item.slug !== service.slug).map((item) => <Link href={`/servizi/${item.slug}`} key={item.id}>{item.title} ↗</Link>)}
      </nav>
    </article>
  );
}
