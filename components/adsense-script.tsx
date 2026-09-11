"use client";

import { usePathname } from "next/navigation";

/**
 * The Studio shares this origin and keeps the editor's session in it, so no
 * third-party script may run there: the ad tag stays on the public pages.
 * React hoists the async script into the head, where AdSense expects it.
 */
export function AdsenseScript({ clientId }: { clientId: string }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/studio")) return null;

  return (
    <script
      async
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
    />
  );
}
