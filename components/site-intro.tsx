"use client";

import { useEffect } from "react";
import Image from "@/components/site-image";
import { connectIntro } from "@/lib/intro";

/**
 * The SIAMO symbol covers loading; the curtain lifts only after the first 3D frame.
 * Before hydration the inline bootstrap owns visibility and a bounded fallback.
 */
export function SiteIntro() {
  useEffect(() => connectIntro(), []);

  return (
    <div className="site-intro" aria-hidden="true">
      <Image src="/brand/siamo-symbol-white.png" alt="" width={900} height={730} sizes="200px" priority />
    </div>
  );
}
