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

const slotIds: Record<AdPlacement, () => string | undefined> = {
  inline: () => process.env.ADSENSE_ARTICLE_INLINE_SLOT,
  footer: () => process.env.ADSENSE_ARTICLE_FOOTER_SLOT,
};

/**
 * Account plus unit id, or nothing: no advertising at all is the state the
 * site ships in.
 */
export function articleAd(placement: AdPlacement) {
  const account = adsenseAccount();
  const slotId = slotIds[placement]()?.trim();
  if (!account || !slotId) return null;

  return { clientId: account.clientId, slotId };
}
