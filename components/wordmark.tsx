"use client";

import { useEffect, useRef } from "react";
import Image from "@/components/site-image";
import { homeTitle } from "@/lib/seo";
import { INTRO_DURATION } from "@/lib/intro";
import { drawWordmark, drawWordmarkMobile, WIDTH, HEIGHT, DURATION } from "@/public/brand/wordmark-motion.mjs";

const source = { src: "/brand/siamo-wordmark-black.png", width: WIDTH, height: HEIGHT };

export function Wordmark() {
  const heading = useRef<HTMLHeadingElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const control = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const element = heading.current;
    const surface = canvas.current;
    const button = control.current;
    const ctx = surface?.getContext("2d");
    if (!element || !surface || !button || !ctx) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = matchMedia("(max-width: 767px), (pointer: coarse) and (max-width: 1020px)");
    const logo = new window.Image();
    let disposed = false;
    let ready = false;
    let visible = true;
    let frame = 0;
    let start = performance.now() + (document.documentElement.dataset.intro === "play" ? INTRO_DURATION : 0);
    let last = 0;
    let lastPaint = 0;
    let pulseStart = -Infinity;
    const pointer = { x: -9999, y: -9999, strength: 0 };
    const pulse = { x: WIDTH / 2, y: HEIGHT / 2, age: 99 };
    let targetStrength = 0;

    function schedule() {
      if (!frame && ready && visible && !document.hidden && !preference.matches && !disposed) frame = requestAnimationFrame(paint);
    }
    function paint(now: number) {
      frame = 0;
      if (!ctx || !element) return;
      // Keep animation time continuous while limiting phone raster work to 30fps.
      if (mobile.matches && lastPaint && now - lastPaint < 1000 / 30 - 1) { schedule(); return; }
      lastPaint = now;
      const dt = Math.min((now - (last || now)) / 1000, 0.05);
      last = now;
      pointer.strength += (targetStrength - pointer.strength) * (1 - Math.exp(-dt * 12));
      pulse.age = (now - pulseStart) / 1000;
      const time = Math.max(0, (now - start) / 1000);
      const render = mobile.matches ? drawWordmarkMobile : drawWordmark;
      render(ctx, logo, time, pointer, pulse);
      element.dataset.motion = "ready";
      if (time < DURATION || pulse.age < 1.6 || Math.abs(targetStrength - pointer.strength) > 0.001) schedule();
    }
    function resize() {
      if (!surface || !element || !ctx) return;
      const box = element.getBoundingClientRect();
      const scale = Math.min(box.width / WIDTH, box.height / HEIGHT);
      const density = Math.min(devicePixelRatio || 1, mobile.matches ? 1.25 : 2);
      surface.width = Math.max(1, Math.round(WIDTH * scale * density));
      surface.height = Math.max(1, Math.round(HEIGHT * scale * density));
      surface.style.width = `${WIDTH * scale}px`;
      surface.style.height = `${HEIGHT * scale}px`;
      ctx.setTransform(surface.width / WIDTH, 0, 0, surface.height / HEIGHT, 0, 0);
      lastPaint = 0;
      schedule();
    }
    function locate(event: PointerEvent) {
      if (!surface) return;
      const box = surface.getBoundingClientRect();
      pointer.x = (event.clientX - box.left) / box.width * WIDTH;
      pointer.y = (event.clientY - box.top) / box.height * HEIGHT;
    }
    function move(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      locate(event);
      targetStrength = 1;
      schedule();
    }
    function release() { targetStrength = 0; schedule(); }
    function down(event: PointerEvent) { locate(event); }
    function activate(event: MouseEvent) {
      if (preference.matches) return;
      pulse.x = event.detail === 0 ? WIDTH / 2 : pointer.x;
      pulse.y = event.detail === 0 ? HEIGHT / 2 : pointer.y;
      pulseStart = performance.now();
      schedule();
    }
    function motionPreference() {
      cancelAnimationFrame(frame);
      frame = 0;
      delete element!.dataset.motion;
      if (!preference.matches) { start = performance.now(); schedule(); }
    }
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
      else { cancelAnimationFrame(frame); frame = 0; targetStrength = 0; }
    });
    visibility.observe(element);
    logo.onload = () => { if (!disposed) { ready = true; resize(); } };
    logo.src = source.src;
    button.addEventListener("pointermove", move, { passive: true });
    button.addEventListener("pointerdown", down, { passive: true });
    button.addEventListener("pointerleave", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("blur", release);
    button.addEventListener("click", activate);
    document.addEventListener("visibilitychange", schedule);
    preference.addEventListener("change", motionPreference);
    mobile.addEventListener("change", resize);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      visibility.disconnect();
      logo.onload = null;
      delete element.dataset.motion;
      button.removeEventListener("pointermove", move);
      button.removeEventListener("pointerdown", down);
      button.removeEventListener("pointerleave", release);
      button.removeEventListener("pointercancel", release);
      button.removeEventListener("blur", release);
      button.removeEventListener("click", activate);
      document.removeEventListener("visibilitychange", schedule);
      preference.removeEventListener("change", motionPreference);
      mobile.removeEventListener("change", resize);
    };
  }, []);

  return (
    <h1 className="wordmark" ref={heading}>
      <span className="sr-only">{homeTitle}</span>
      <span className="wordmark-stack">
        <Image alt="" className="wordmark-face" {...source} sizes="100vw" priority />
        <canvas className="wordmark-canvas" ref={canvas} aria-hidden="true" />
        <button className="wordmark-interaction" ref={control} type="button" aria-label="Anima il logo" />
      </span>
    </h1>
  );
}
