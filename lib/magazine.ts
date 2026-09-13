import type { Magazine } from "@/types/content";

type MagazineOffer =
  | { kind: "buy"; url: string }
  | { kind: "coming-soon"; releaseAt?: string }
  | { kind: "none" };

/**
 * What a magazine card offers, decided on the server: while a volume is
 * coming soon its purchase link never reaches the page, not even hidden. Once
 * the optional release time has passed it is on sale like any other, from the
 * next render of the page on.
 */
export function magazineOffer(magazine: Magazine, now = Date.now()): MagazineOffer {
  const release = magazine.releaseAt ? Date.parse(magazine.releaseAt) : Number.NaN;
  const hasRelease = Number.isFinite(release);
  if (magazine.comingSoon && !(hasRelease && release <= now)) {
    return { kind: "coming-soon", releaseAt: hasRelease ? magazine.releaseAt : undefined };
  }
  return magazine.checkoutUrl ? { kind: "buy", url: magazine.checkoutUrl } : { kind: "none" };
}
