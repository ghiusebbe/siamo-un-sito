"use client";

import { useEffect, useRef, useState } from "react";
import type { AdPlacement } from "@/lib/advertising";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdsenseAdSlotProps = {
  clientId: string;
  placement: AdPlacement;
  slotId: string;
};

/**
 * The AdSense counterpart of the Ad Manager slot, used while the account has
 * no Ad Manager network. AdSense marks a unit it could not fill with
 * `data-ad-status="unfilled"`, which is the cue to collapse the space instead
 * of leaving an empty frame in the middle of the article.
 */
export function AdsenseAdSlot({ clientId, placement, slotId }: AdsenseAdSlotProps) {
  const unit = useRef<HTMLModElement>(null);
  const requested = useRef(false);
  const [unfilled, setUnfilled] = useState(false);

  useEffect(() => {
    const element = unit.current;
    if (!element || requested.current) return;
    requested.current = true;

    const watchFill = new MutationObserver(() => {
      if (element.dataset.adStatus === "unfilled") setUnfilled(true);
    });
    watchFill.observe(element, { attributeFilter: ["data-ad-status"] });

    try {
      (window.adsbygoogle ??= []).push({});
    } catch {
      // The tag is missing or blocked: the space stays as it is, unfilled.
    }

    return () => watchFill.disconnect();
  }, []);

  if (unfilled) return null;

  return (
    <aside aria-label="Pubblicità" className={`article-ad article-ad--${placement}`}>
      <span className="article-ad__label">Pubblicità</span>
      <ins
        className="adsbygoogle article-ad__frame"
        data-ad-client={clientId}
        data-ad-format="horizontal"
        data-ad-slot={slotId}
        data-full-width-responsive="false"
        ref={unit}
        style={{ display: "block" }}
      />
    </aside>
  );
}
