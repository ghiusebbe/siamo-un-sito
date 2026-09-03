import type { Metadata } from "next";
import Image from "@/components/site-image";
import { PageHero } from "@/components/page-hero";
import { getTimeline } from "@/lib/content";

export const metadata: Metadata = { title: "Timeline" };

export default async function TimelinePage() {
  const items = await getTimeline();
  return (
    <>
      <PageHero kicker="Dal 2023 a oggi" title="TIMELINE" intro="Carta, tour, collaborazioni e progetti nati un passo alla volta." />
      <section className="timeline-section shell">
        {items.map((item, index) => {
          // Show the year once per group; keep it in the accessible name of every row.
          const firstOfYear = index === 0 || items[index - 1].year !== item.year;
          return (
            <article className="timeline-row" key={item.id}>
              <span className={firstOfYear ? "timeline-year" : "timeline-year timeline-year-repeat"}>{item.year}</span>
              <span className="timeline-index">{String(index + 1).padStart(2, "0")}</span>
              <h2>{item.title}</h2>
              {item.image ? (
                <Image
                  src={item.image}
                  alt=""
                  width={540}
                  height={420}
                  sizes="(max-width: 620px) 100vw, (max-width: 900px) 180px, 270px"
                  loading="lazy"
                />
              ) : null}
              {item.description ? <p>{item.description}</p> : null}
            </article>
          );
        })}
      </section>
    </>
  );
}
