"use client";

import { usePathname } from "next/navigation";

/**
 * The embedded Studio claims the whole viewport for itself. With the site
 * header stacked above it the document pane grows past the fold and its
 * action bar — where Publish lives — ends up off screen, so the chrome steps
 * aside on /studio and the Studio owns the window.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/studio")) return null;
  return <>{children}</>;
}
