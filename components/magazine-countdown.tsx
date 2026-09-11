"use client";

import { useEffect, useState } from "react";

// A fixed zone keeps the server and the first client render identical.
const releaseFormat = new Intl.DateTimeFormat("it-IT", {
  day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome",
});

function remaining(milliseconds: number) {
  const total = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(total / 86400);
  const pad = (value: number) => String(value).padStart(2, "0");
  const clock = `${pad(Math.floor((total % 86400) / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
  return days ? `${days} ${days === 1 ? "giorno" : "giorni"} ${clock}` : clock;
}

/**
 * Counts down to a release. The purchase link is not on the page: the server
 * adds it on the first render after the release, so at zero this only says so.
 */
export function MagazineCountdown({ releaseAt }: { releaseAt: string }) {
  const target = Date.parse(releaseAt);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const current = Date.now();
      setNow(current);
      if (current >= target) window.clearInterval(timer);
    };
    // First tick right after hydration, then once a second.
    const first = window.setTimeout(tick, 0);
    const timer = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, [target]);

  if (now !== null && now >= target) return <span className="magazine-countdown">Disponibile a breve</span>;

  const date = releaseFormat.format(target);
  return (
    <time className="magazine-countdown" dateTime={releaseAt}>
      {/* The ticking clock is visual only: a screen reader hears the date once. */}
      <span className="sr-only">Esce il {date}</span>
      <span aria-hidden="true">{now === null ? `Esce il ${date}` : `Esce tra ${remaining(target - now)}`}</span>
    </time>
  );
}
