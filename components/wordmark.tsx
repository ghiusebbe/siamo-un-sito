"use client";

import { useEffect, useRef } from "react";
import Image from "@/components/site-image";
import { homeTitle } from "@/lib/seo";
import { INTRO_FINISHED_EVENT, INTRO_LOAD_TIMEOUT, WORDMARK_READY_EVENT } from "@/lib/intro";

const source = { src: "/brand/siamo-wordmark-black.png", width: 1600, height: 397 };

export function Wordmark() {
  const heading = useRef<HTMLHeadingElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const control = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const element = heading.current, surface = canvas.current, button = control.current;
    if (!element || !surface || !button) return;
    const root = document.documentElement;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const bounds = element.getBoundingClientRect();
    let visible = root.dataset.intro === "play" || (bounds.bottom > 0 && bounds.top < innerHeight);
    let disposed = false, loading = false, entranceStarted = false, revision = 0;
    let abandoned = root.dataset.wordmark === "fallback" && !preference.matches;
    let scene: { dispose: () => void; playEntrance: () => void } | undefined;
    let deadline: ReturnType<typeof setTimeout> | undefined;

    const signalReady = () => window.dispatchEvent(new Event(WORDMARK_READY_EVENT));
    function clearDeadline() { if (deadline !== undefined) { clearTimeout(deadline); deadline = undefined; } }
    function fallback() {
      clearDeadline();
      element!.dataset.motion = "fallback";
      element!.removeAttribute("aria-busy");
      root.dataset.wordmark = "fallback";
      signalReady();
    }
    function abandon() {
      if (disposed) return;
      abandoned = true; revision++;
      fallback();
      // Shader errors can arrive from inside renderer.render(). Dispose after that call returns.
      queueMicrotask(() => { if (abandoned) { scene?.dispose(); scene = undefined; } });
    }
    function loadingExpired() {
      if (document.hidden) deadline = setTimeout(loadingExpired, 1000);
      else abandon();
    }
    function startEntrance() {
      if (disposed || abandoned || entranceStarted || preference.matches || root.dataset.intro !== "skip") return;
      if (element!.dataset.motion === "ready" && scene) { entranceStarted = true; scene.playEntrance(); }
    }
    function fallbackRequested() {
      if (root.dataset.wordmark === "fallback" && element!.dataset.motion === "loading") abandon();
    }
    async function load() {
      if (disposed || abandoned || loading || scene || preference.matches || !visible || document.hidden) return;
      loading = true;
      const attempt = revision;
      element!.dataset.motion = "loading";
      element!.setAttribute("aria-busy", "true");
      root.dataset.wordmark = "loading";
      deadline = setTimeout(loadingExpired, INTRO_LOAD_TIMEOUT);
      try {
        // Start fetching immediately while the intro is visible; no idle delay or second intro timer.
        const { createWordmarkScene } = await import("@/lib/wordmark-scene");
        if (disposed || abandoned || attempt !== revision || preference.matches) return;
        scene = createWordmarkScene({
          canvas: surface!, container: element!, interaction: button!,
          onReady: () => {
            if (disposed || abandoned || attempt !== revision || preference.matches) return;
            clearDeadline();
            element!.dataset.motion = "ready";
            element!.removeAttribute("aria-busy");
            root.dataset.wordmark = "ready";
            signalReady();
            startEntrance();
          },
          onError: abandon,
        });
      } catch { if (!disposed && attempt === revision) abandon(); }
      finally {
        loading = false;
        if (!disposed && !abandoned && attempt !== revision) void load();
      }
    }
    function schedule() { void load(); }
    function motionChanged() {
      revision++; clearDeadline(); scene?.dispose(); scene = undefined; entranceStarted = false;
      if (preference.matches) { abandoned = true; fallback(); }
      else { abandoned = false; schedule(); }
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting || root.dataset.intro === "play";
      if (visible) schedule();
    });
    observer.observe(element);
    preference.addEventListener("change", motionChanged);
    document.addEventListener("visibilitychange", schedule);
    window.addEventListener(INTRO_FINISHED_EVENT, startEntrance);
    window.addEventListener(WORDMARK_READY_EVENT, fallbackRequested);
    if (preference.matches || abandoned) fallback(); else schedule();
    return () => {
      disposed = true; revision++; clearDeadline();
      observer.disconnect();
      preference.removeEventListener("change", motionChanged);
      document.removeEventListener("visibilitychange", schedule);
      window.removeEventListener(INTRO_FINISHED_EVENT, startEntrance);
      window.removeEventListener(WORDMARK_READY_EVENT, fallbackRequested);
      scene?.dispose();
      // Navigation must release a waiting curtain; StrictMode cleanup keeps the mounted node.
      if (!element.isConnected && root.dataset.wordmark === "loading") {
        root.dataset.wordmark = "fallback"; signalReady();
      }
    };
  }, []);

  return (
    <h1 className="wordmark" ref={heading} aria-labelledby="wordmark-title" data-motion="loading">
      <span className="sr-only" id="wordmark-title">{homeTitle}</span>
      <span className="wordmark-stack">
        <Image alt="" className="wordmark-face" {...source} sizes="100vw" priority />
        <canvas className="wordmark-canvas" ref={canvas} aria-hidden="true" />
        <span className="wordmark-loading" aria-hidden="true">Caricamento…</span>
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
