"use client";

import type { ComponentProps } from "react";
import { track } from "@vercel/analytics";

type TrackedLinkProps = ComponentProps<"a"> & {
  event: string;
  // Vercel Pro keeps two properties per custom event; anything past that is dropped.
  properties?: Record<string, string | number>;
};

/** An external link that reports its click to Vercel Web Analytics before leaving. */
export function TrackedLink({ event, properties, onClick, ...props }: TrackedLinkProps) {
  return <a {...props} onClick={(click) => { track(event, properties); onClick?.(click); }} />;
}
