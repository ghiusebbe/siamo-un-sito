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
