import type { Metadata } from "next";
import Image from "@/components/site-image";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { getEvents } from "@/lib/content";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Eventi" };

export default async function EventsPage() {
  const events = await getEvents();
  const upcoming = events.filter((event) => event.status === "upcoming");
  const archived = events.filter((event) => event.status !== "upcoming");

  return (
    <>
      <PageHero kicker="Dal vivo" title="EVENTI" intro="Le serate, i format e gli incontri che trasformano una scena in comunità." />
      <section className="events-section shell">
        <h2 className="section-label">Prossimamente</h2>
        {upcoming.length ? upcoming.map((event) => <EventCard key={event.id} event={event} />) : <p className="empty-state">Nuove date in arrivo. Nel frattempo, scendi nell’archivio.</p>}
        <h2 className="section-label archive-label">Archivio</h2>
        {archived.map((event) => <EventCard key={event.id} event={event} />)}
      </section>
    </>
  );
}

function EventCard({ event }: { event: Awaited<ReturnType<typeof getEvents>>[number] }) {
  return (
    <Link className="event-card" href={`/eventi/${event.slug}`}>
      <Image
        src={event.cover}
        alt=""
        width={620}
        height={485}
        sizes="(max-width: 620px) 100vw, (max-width: 900px) 220px, 310px"
      />
      <div>
        <span className="eyebrow">{formatDate(event.date)}{event.city ? ` · ${event.city}` : ""}</span>
        <h2>{event.title}</h2>
        <p>{event.lineup.join(" · ")}</p>
      </div>
      <span className="row-arrow">↗</span>
    </Link>
  );
}
