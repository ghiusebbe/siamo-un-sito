"use client";

import { useEffect, useRef } from "react";
import Image from "@/components/site-image";

/** Vertical slices the logotype is assembled from on entry; they are drawn
 *  from the same file as a background, so the sequence costs no extra markup
 *  and nothing decorative reaches assistive technology. */
const SLICES = 6;

const source = {
  src: "/brand/siamo-wordmark-black.png",
  width: 2200,
  height: 546,
} as const;

/**
 * The logotype is a bitmap, so the animation is built from layers of it: six
 * vertical slices drop into place one after the other, an acid bar sweeps
 * across as they land, and afterwards the whole thing breathes and leans
 * towards the pointer. Everything is expressed in percentages so it holds at
 * any width, and the pointer lean is only wired up for devices that have one.
 */
export function Wordmark() {
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const element = heading.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let frame = 0;

    const lean = (event: PointerEvent) => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const box = element.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - 0.5;
        const y = (event.clientY - box.top) / box.height - 0.5;
        element.style.setProperty("--lean-x", x.toFixed(3));
        element.style.setProperty("--lean-y", y.toFixed(3));
      });
    };

    const settle = () => {
      element.style.setProperty("--lean-x", "0");
      element.style.setProperty("--lean-y", "0");
    };

    window.addEventListener("pointermove", lean, { passive: true });
    document.addEventListener("pointerleave", settle);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", lean);
      document.removeEventListener("pointerleave", settle);
    };
  }, []);

  return (
    <h1 className="wordmark" ref={heading}>
      <span className="wordmark-stack">
        {Array.from({ length: SLICES }, (_, index) => (
          <span
            aria-hidden="true"
            className="wordmark-slice"
            key={index}
            style={{ "--slice": index } as React.CSSProperties}
          />
        ))}
        <span className="wordmark-sweep" aria-hidden="true" />
        <Image alt="SIAMO" className="wordmark-face" {...source} sizes="100vw" priority />
      </span>
    </h1>
  );
}
