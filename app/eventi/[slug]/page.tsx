import type { Metadata } from "next";
import Image from "@/components/site-image";
import { notFound } from "next/navigation";
import { RichTextContent } from "@/components/rich-text";
import { getEvent } from "@/lib/content";
import { formatDate } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await getEvent((await params).slug);
  return event ? { title: event.title, description: event.lineup.join(", ") } : {};
}

export default async function EventDetailPage({ params }: Props) {
  const event = await getEvent((await params).slug);
  if (!event) notFound();

  return (
    <article className="event-detail shell">
      <div className="event-detail-copy">
        <span className="eyebrow">{event.status === "upcoming" ? "Prossimo evento" : "Dall’archivio"}</span>
        <h1>{event.title}</h1>
        <div className="event-facts">
          <span>{formatDate(event.date)}</span>
          {event.venue ? <span>{event.venue}</span> : null}
          {event.city ? <span>{event.city}</span> : null}
        </div>
        <p className="lineup">{event.lineup.join(" · ")}</p>
        <RichTextContent value={event.description} />
        {event.ticketUrl ? <a className="acid-button" href={event.ticketUrl} target="_blank" rel="noreferrer">Biglietti ↗</a> : null}
      </div>
      <Image
        className="event-detail-poster"
        src={event.cover}
        alt={`Locandina ${event.title}`}
        width={1000}
        height={1250}
        sizes="(max-width: 900px) 100vw, 42vw"
        priority
      />
    </article>
  );
}
