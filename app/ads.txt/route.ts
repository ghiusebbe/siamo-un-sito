/**
 * Both AdSense and Ad Manager only pay out on domains that authorise the
 * seller in /ads.txt. The lines carry account identifiers rather than
 * secrets, but they change with the account setup, so they come from the
 * environment instead of being committed: unset means no file at all, which
 * is what an unmonetised deploy should serve.
 */
const ADSENSE_EXCHANGE_ID = "f08c47fec0942fa0";

function adsTxtBody(): string | null {
  const verbatim = process.env.ADS_TXT?.trim();
  if (verbatim) return `${verbatim}\n`;

  const publisherId = process.env.ADSENSE_PUBLISHER_ID?.trim();
  if (!publisherId) return null;

  return `google.com, ${publisherId}, DIRECT, ${ADSENSE_EXCHANGE_ID}\n`;
}

export function GET() {
  const body = adsTxtBody();
  if (!body) return new Response("Not found", { status: 404 });

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
