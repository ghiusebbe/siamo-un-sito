"use client";

import { useEffect, useRef } from "react";

type DynamicTitleProps = {
  as?: "h1" | "h2" | "h3";
  lines: string[];
  className?: string;
  eager?: boolean;
};

export function DynamicTitle({ as: Tag = "h2", lines, className = "", eager = false }: DynamicTitleProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (eager) return;
    const title = titleRef.current;
    if (!title) return;

    title.classList.add("is-motion-ready");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        title.classList.add("is-visible");
        observer.disconnect();
      },
      { threshold: 0.18 },
    );

    observer.observe(title);
    return () => observer.disconnect();
  }, [eager]);

  return (
    <Tag ref={titleRef} className={`dynamic-title ${eager ? "is-visible is-eager" : ""} ${className}`.trim()} aria-label={lines.join(" ")}>
      {lines.map((line, index) => (
        <span className="dynamic-title-line" aria-hidden="true" key={`${line}-${index}`}>
          <span style={{ transitionDelay: `${index * 90}ms`, animationDelay: `${index * 90}ms` }}>{line}</span>
        </span>
      ))}
    </Tag>
  );
}
