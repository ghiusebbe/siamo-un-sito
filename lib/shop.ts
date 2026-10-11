import type { Magazine, SiteSettings } from "@/types/content";

/** Published Sanity settings win. The optional default also supports local review. */
export function isShopOnly(settings: SiteSettings): boolean {
  return settings.shopOnly ?? process.env.SIAMO_DEFAULT_SITE_MODE !== "editorial";
}

export const editorialPaths = ["/articoli", "/articoli-cms", "/eventi", "/eventi-cms", "/timeline", "/servizi", "/chi-siamo"];

export function isEditorialPath(pathname: string): boolean {
  return editorialPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function shopPurchase(magazine: Magazine, now = Date.now()) {
  const date = magazine.preorderUntil ?? "";
  const parsed = new Date(`${date}T12:00:00Z`);
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(parsed.getTime())
    && parsed.toISOString().slice(0, 10) === date;
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Rome" }).format(new Date(now));
  const preorder = valid && today <= date;
  const deadline = preorder ? new Intl.DateTimeFormat("it-IT", {
    day: "numeric", month: "long", timeZone: "Europe/Rome",
  }).format(parsed) : undefined;
  return { preorder, deadline, label: `${preorder ? "Preordina" : "Acquista"} il vol. ${magazine.volume}` };
}
