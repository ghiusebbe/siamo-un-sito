/**
 * Google spells the same account two ways: `ca-pub-…` in the AdSense tag and
 * `pub-…` in ads.txt. One variable holds it in either form and both callers
 * get the spelling they need, so the account is configured once.
 */
export function adsenseAccount(): { publisherId: string; clientId: string } | null {
  const configured = process.env.ADSENSE_PUBLISHER_ID?.trim();
  if (!configured) return null;

  const publisherId = configured.replace(/^ca-/, "");
  if (!/^pub-\d+$/.test(publisherId)) return null;

  return { publisherId, clientId: `ca-${publisherId}` };
}

export type AdPlacement = "inline" | "footer";

export type ArticleAd =
  | { source: "adManager"; unitPath: string }
  | { source: "adSense"; clientId: string; slotId: string };

const gamUnitPaths: Record<AdPlacement, () => string | undefined> = {
  inline: () => process.env.GAM_ARTICLE_INLINE_PATH || process.env.NEXT_PUBLIC_GAM_ARTICLE_INLINE_PATH,
  footer: () => process.env.GAM_ARTICLE_FOOTER_PATH || process.env.NEXT_PUBLIC_GAM_ARTICLE_FOOTER_PATH,
};

const adSenseSlotIds: Record<AdPlacement, () => string | undefined> = {
  inline: () => process.env.ADSENSE_ARTICLE_INLINE_SLOT,
  footer: () => process.env.ADSENSE_ARTICLE_FOOTER_SLOT,
};

/**
 * Ad Manager wins where it is configured: it can serve AdSense demand
 * alongside everything else. AdSense units on their own are the fallback for
 * an account that has no Ad Manager network yet. Neither configured means no
 * advertising at all, which is the state the site ships in.
 */
export function articleAd(placement: AdPlacement): ArticleAd | null {
  const unitPath = gamUnitPaths[placement]()?.trim();
  if (unitPath) return { source: "adManager", unitPath };

  const account = adsenseAccount();
  const slotId = adSenseSlotIds[placement]()?.trim();
  if (account && slotId) return { source: "adSense", clientId: account.clientId, slotId };

  return null;
}
