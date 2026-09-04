"use client";

import { useEffect, useId, useState } from "react";

type AdPlacement = "inline" | "footer";
type AdSize = [number, number];

type SizeMappingBuilder = {
  addSize(viewport: AdSize, sizes: AdSize[]): SizeMappingBuilder;
  build(): unknown;
};

type PublisherAdsService = {
  addEventListener(
    event: "slotRenderEnded",
    listener: (event: SlotRenderEndedEvent) => void,
  ): void;
  collapseEmptyDivs(collapseBeforeAdFetch?: boolean): boolean;
  enableLazyLoad(config: {
    fetchMarginPercent: number;
    mobileScaling: number;
    renderMarginPercent: number;
  }): void;
  removeEventListener(
    event: "slotRenderEnded",
    listener: (event: SlotRenderEndedEvent) => void,
  ): void;
};

type PublisherSlot = {
  addService(service: PublisherAdsService): PublisherSlot;
  defineSizeMapping(mapping: unknown): PublisherSlot;
};

type SlotRenderEndedEvent = {
  isEmpty: boolean;
  slot: PublisherSlot;
};

type GoogleTag = {
  apiReady?: boolean;
  cmd: Array<() => void>;
  defineSlot(path: string, sizes: AdSize[], elementId: string): PublisherSlot | null;
  destroySlots(slots?: PublisherSlot[]): boolean;
  display(elementId: string): void;
  enableServices(): void;
  pubads(): PublisherAdsService;
  sizeMapping(): SizeMappingBuilder;
};

declare global {
  interface Window {
    googletag?: GoogleTag;
  }
}

const GPT_SOURCE = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";

const sizes: Record<AdPlacement, AdSize[]> = {
  inline: [[728, 90], [320, 100], [300, 100]],
  footer: [[970, 90], [728, 90], [320, 100], [300, 100]],
};

let gptLoadPromise: Promise<void> | null = null;
let gptConfigured = false;

function loadGooglePublisherTag() {
  if (window.googletag?.apiReady) return Promise.resolve();
  if (gptLoadPromise) return gptLoadPromise;

  window.googletag ??= { cmd: [] } as unknown as GoogleTag;

  gptLoadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GPT_SOURCE}"]`,
    );

    const handleLoad = () => resolve();
    const handleError = () => reject(new Error("Google Publisher Tag unavailable"));

    if (existing) {
      window.googletag?.cmd.push(resolve);
      existing.addEventListener("error", handleError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = GPT_SOURCE;
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    document.head.append(script);
  });

  return gptLoadPromise;
}

function buildSizeMapping(googletag: GoogleTag, placement: AdPlacement) {
  const mapping = googletag
    .sizeMapping()
    .addSize([0, 0], [[300, 100]])
    .addSize([360, 0], [[320, 100], [300, 100]])
    .addSize([768, 0], [[728, 90]]);

  if (placement === "footer") {
    mapping.addSize([1100, 0], [[970, 90], [728, 90]]);
  }

  return mapping.build();
}

type ArticleAdSlotProps = {
  placement: AdPlacement;
  /** Ad unit path from the server (GAM_ARTICLE_*_PATH); the slot renders nothing without it. */
  unitPath?: string;
};

export function ArticleAdSlot({ placement, unitPath }: ArticleAdSlotProps) {
  const reactId = useId();
  const slotId = `siamo-ad-${placement}-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [state, setState] = useState<"loading" | "filled" | "empty" | "error">(
    "loading",
  );

  useEffect(() => {
    if (!unitPath) return;

    let active = true;
    let slot: PublisherSlot | null = null;
    let renderListener: ((event: SlotRenderEndedEvent) => void) | null = null;

    loadGooglePublisherTag()
      .then(() => {
        const googletag = window.googletag;
        if (!active || !googletag) return;

        googletag.cmd.push(() => {
          if (!active) return;

          const pubads = googletag.pubads();
          slot = googletag
            .defineSlot(unitPath, sizes[placement], slotId)
            ?.defineSizeMapping(buildSizeMapping(googletag, placement))
            .addService(pubads) ?? null;

          if (!slot) {
            setState("error");
            return;
          }

          renderListener = (event) => {
            if (event.slot === slot && active) {
              setState(event.isEmpty ? "empty" : "filled");
            }
          };
          pubads.addEventListener("slotRenderEnded", renderListener);

          if (!gptConfigured) {
            pubads.enableLazyLoad({
              fetchMarginPercent: 200,
              renderMarginPercent: 50,
              mobileScaling: 2,
            });
            pubads.collapseEmptyDivs(false);
            googletag.enableServices();
            gptConfigured = true;
          }

          googletag.display(slotId);
        });
      })
      .catch(() => {
        if (active) setState("error");
      });

    return () => {
      active = false;
      const googletag = window.googletag;
      if (!googletag || !slot) return;

      googletag.cmd.push(() => {
        const pubads = googletag.pubads();
        if (renderListener) {
          pubads.removeEventListener("slotRenderEnded", renderListener);
        }
        if (slot) googletag.destroySlots([slot]);
      });
    };
  }, [placement, slotId, unitPath]);

  if (!unitPath || state === "empty" || state === "error") return null;

  return (
    <aside
      aria-label="Pubblicità"
      className={`article-ad article-ad--${placement}`}
      data-state={state}
    >
      <span className="article-ad__label">Pubblicità</span>
      <div className="article-ad__frame" id={slotId} />
    </aside>
  );
}
