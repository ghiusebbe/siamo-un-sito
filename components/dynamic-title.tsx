"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type DynamicTitleProps = {
  as?: "h1" | "h2" | "h3";
  lines: string[];
  className?: string;
  eager?: boolean;
};

const TYPE_INTERVAL = 26;
const LINE_PAUSE = 105;

export function DynamicTitle({ as: Tag = "h2", lines, className = "", eager = false }: DynamicTitleProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const key = useMemo(() => lines.join("\u0000"), [lines]);
  const [visibleLines, setVisibleLines] = useState(lines);
  const [activeLine, setActiveLine] = useState(-1);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const title = titleRef.current;
    if (!title) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let cancelled = false;
    let timeout = 0;
    let preparationFrame = 0;
    let observer: IntersectionObserver | undefined;

    const typeTitle = (lineIndex = 0, characterIndex = 0) => {
      if (cancelled) return;

      if (lineIndex >= lines.length) {
        setActiveLine(-1);
        setIsTyping(false);
        return;
      }

      const line = lines[lineIndex];
      setActiveLine(lineIndex);
      setIsTyping(true);

      if (characterIndex <= line.length) {
        setVisibleLines((current) => {
          const next = [...current];
          next[lineIndex] = line.slice(0, characterIndex);
          return next;
        });
        timeout = window.setTimeout(
          () => typeTitle(lineIndex, characterIndex + 1),
          TYPE_INTERVAL,
        );
        return;
      }

      timeout = window.setTimeout(() => typeTitle(lineIndex + 1, 0), LINE_PAUSE);
    };

    const start = () => {
      title.dataset.typed = "true";
      typeTitle();
    };

    preparationFrame = window.requestAnimationFrame(() => {
      setVisibleLines(lines.map(() => ""));
      setActiveLine(-1);
      setIsTyping(false);

      if (eager || !("IntersectionObserver" in window)) {
        timeout = window.setTimeout(start, 90);
      } else {
        observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting) return;
            observer?.disconnect();
            start();
          },
          { rootMargin: "0px 0px -12%", threshold: 0.12 },
        );
        observer.observe(title);
      }
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(preparationFrame);
      window.clearTimeout(timeout);
      observer?.disconnect();
    };
  }, [eager, key, lines]);

  return (
    <Tag
      ref={titleRef}
      className={`dynamic-title ${isTyping ? "is-typing" : "is-complete"} ${className}`.trim()}
      aria-label={lines.join(" ")}
    >
      {lines.map((line, index) => (
        <span className="dynamic-title-line" aria-hidden="true" key={`${line}-${index}`}>
          <span className="dynamic-title-measure">{line || "\u00a0"}</span>
          <span className={`dynamic-title-text ${activeLine === index ? "has-caret" : ""}`}>
            {visibleLines[index] || "\u00a0"}
          </span>
        </span>
      ))}
    </Tag>
  );
}
