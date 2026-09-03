"use client";

import { useEffect, useState } from "react";
import Image from "@/components/site-image";
import { INTRO_DURATION, INTRO_STORAGE_KEY } from "@/lib/intro";

/**
 * Entry animation: the SIAMO symbol on black, then the curtain lifts.
 * Plays once per browser session; `html[data-intro]` is set by an inline
 * script in the layout before first paint, so there is no flash either way.
 */
export function SiteIntro() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const playing = document.documentElement.dataset.intro === "play";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (playing) {
      try {
        window.sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
      } catch {
        // Storage can be unavailable (private mode): the intro simply plays again next time.
      }
    }

    const timeout = window.setTimeout(() => setDone(true), playing && !reduceMotion ? INTRO_DURATION : 0);
    return () => window.clearTimeout(timeout);
  }, []);

  if (done) return null;

  return (
    <div className="site-intro" aria-hidden="true">
      <Image src="/brand/siamo-symbol-white.png" alt="" width={900} height={730} sizes="200px" priority />
    </div>
  );
}
