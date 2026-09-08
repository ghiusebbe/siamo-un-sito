/** Server-only contact registration. Campaign scheduling and delivery live in Brevo. */
const listValue = process.env.BREVO_LIST_ID?.trim() ?? "";
const listId = /^\d+$/.test(listValue) ? Number(listValue) : 0;
const validList = Number.isSafeInteger(listId) && listId > 0;
export const newsletterConfigured = Boolean(process.env.BREVO_API_KEY?.trim() && validList);

type SubscribeOutcome = { ok: true } | { ok: false; status: number; message: string };
const failed = "Non siamo riusciti a iscriverti. Riprova tra poco.";

export async function subscribeToNewsletter(email: string): Promise<SubscribeOutcome> {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (!apiKey || !validList) {
    return { ok: false, status: 503, message: "La newsletter non è ancora attiva. Riprova tra qualche giorno." };
  }

  let response: Response;
  try {
    response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        email,
        listIds: [listId],
        updateEnabled: true,
        // Never reset emailBlacklisted: existing unsubscribes must remain effective.
        attributes: {
          SIAMO_CONSENT_AT: new Date().toISOString(),
          SIAMO_CONSENT_VERSION: "2026-09-08",
          SIAMO_CONSENT_SOURCE: "https://siamounmagazine.com/#newsletter",
        },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    console.error("[newsletter] Brevo irraggiungibile");
    return { ok: false, status: 502, message: failed };
  }

  // New contacts return 201; existing ones may return 204 without a body.
  // Do not log response bodies or addresses: API errors can contain contact data.
  if (response.ok) return { ok: true };
  console.error(`[newsletter] Brevo ha risposto ${response.status}`);
  if (response.status === 429) {
    return { ok: false, status: 429, message: "Troppe richieste. Aspetta un momento e riprova." };
  }
  return { ok: false, status: 502, message: failed };
}
