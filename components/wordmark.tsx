"use client";

import { useEffect, useRef } from "react";
import Image from "@/components/site-image";
import { homeTitle } from "@/lib/seo";
import { INTRO_DURATION } from "@/lib/intro";

const source = { src: "/brand/siamo-wordmark-black.png", width: 1600, height: 397 };

export function Wordmark() {
  const heading = useRef<HTMLHeadingElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const control = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const element = heading.current, surface = canvas.current, button = control.current;
    if (!element || !surface || !button) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const introEnds = performance.now() + (document.documentElement.dataset.intro === "play" ? INTRO_DURATION : 0);
    let disposed = false, loading = false, visible = false;
    let scene: { dispose: () => void } | undefined;
    let idle: number | undefined, timer: ReturnType<typeof setTimeout> | undefined;
    const fallback = () => { delete element.dataset.motion; };

    async function load() {
      idle = undefined; timer = undefined;
      if (disposed || loading || scene || preference.matches || !visible || document.hidden) return;
      loading = true;
      try {
        // The engine and vector data stay outside the initial page bundle.
        const { createWordmarkScene } = await import("@/lib/wordmark-scene");
        if (disposed || preference.matches || !visible || document.hidden) return;
        scene = createWordmarkScene({
          canvas: surface!, container: element!, interaction: button!,
          introDelay: Math.max(0, introEnds - performance.now()),
          onReady: () => { if (!disposed) element!.dataset.motion = "ready"; },
          onError: fallback,
        });
      } catch {
        // The original, accessible logo remains visible if WebGL cannot start.
        fallback();
      } finally { loading = false; }
    }
    function schedule() {
      if (disposed || scene || loading || idle !== undefined || timer !== undefined || preference.matches || !visible || document.hidden) return;
      if ("requestIdleCallback" in window) idle = window.requestIdleCallback(load, { timeout: 1800 });
      else timer = setTimeout(load, 100);
    }
    function motionChanged() {
      if (preference.matches) { scene?.dispose(); scene = undefined; fallback(); }
      else schedule();
    }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) schedule(); });
    observer.observe(element);
    preference.addEventListener("change", motionChanged);
    document.addEventListener("visibilitychange", schedule);
    return () => {
      disposed = true;
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) clearTimeout(timer);
      observer.disconnect();
      preference.removeEventListener("change", motionChanged);
      document.removeEventListener("visibilitychange", schedule);
      scene?.dispose(); fallback();
    };
  }, []);

  return (
    <h1 className="wordmark" ref={heading} aria-labelledby="wordmark-title">
      <span className="sr-only" id="wordmark-title">{homeTitle}</span>
      <span className="wordmark-stack">
        <Image alt="" className="wordmark-face" {...source} sizes="100vw" priority />
        <canvas className="wordmark-canvas" ref={canvas} aria-hidden="true" />
        <button
          className="wordmark-interaction" ref={control} type="button"
          aria-label="Ruota il logo SIAMO" aria-describedby="wordmark-instructions"
          title="Tocca per creare un’onda. Trascina per ruotare."
        />
        <span id="wordmark-instructions" className="sr-only">
          Trascina in orizzontale o usa i tasti freccia per ruotare il logo.
          Tocca il logo oppure premi invio o spazio per creare un’onda.
          Esc riporta il logo alla vista iniziale.
        </span>
      </span>
    </h1>
  );
}
