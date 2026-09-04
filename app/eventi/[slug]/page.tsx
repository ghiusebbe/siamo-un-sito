import type { Metadata } from "next";
import Image from "@/components/site-image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichTextContent } from "@/components/rich-text";
import { NewTabNote } from "@/components/new-tab-note";
import { getEvent, getEvents } from "@/lib/content";
import { coverProps } from "@/lib/media";
import { formatDate } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await getEvent((await params).slug);
  return event ? { title: event.title, description: event.lineup.join(", ") } : {};
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const [event, events] = await Promise.all([getEvent(slug), getEvents()]);
  if (!event) notFound();
  const others = events.filter((item) => item.slug !== slug).slice(0, 4);

  return (
    <article className="event-detail shell">
      <div className="event-detail-copy">
        <Link className="back-link" href="/eventi">← Tutti gli eventi</Link>
        <span className="eyebrow">{event.status === "upcoming" ? "Prossimo evento" : "Dall’archivio"}</span>
        <h1>{event.title}</h1>
        <div className="event-facts">
          <span>{formatDate(event.date)}</span>
          {event.venue ? <span>{event.venue}</span> : null}
          {event.city ? <span>{event.city}</span> : null}
        </div>
        <p className="lineup">{event.lineup.join(" · ")}</p>
        <RichTextContent value={event.description} />
        {event.ticketUrl ? (
          <a className="acid-button" href={event.ticketUrl} target="_blank" rel="noreferrer">Biglietti ↗<NewTabNote /></a>
        ) : null}
        {others.length ? (
          <nav className="related-nav" aria-label="Altri eventi">
            <span className="eyebrow">Altri eventi</span>
            {others.map((item) => <Link href={`/eventi/${item.slug}`} key={item.id}>{item.title} ↗</Link>)}
          </nav>
        ) : null}
      </div>
      <Image
        className="event-detail-poster"
        src={event.cover}
        alt={`Locandina ${event.title}`}
        {...coverProps(event.cover, { width: 1000, height: 1250 })}
        sizes="(max-width: 900px) 100vw, 42vw"
        priority
      />
    </article>
  );
}
