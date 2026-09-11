import { canonicalUrl } from "@/lib/site-url";

/** Server-only contact registration. Campaign scheduling and delivery live in Brevo. */
function positiveInteger(value: string | undefined): number {
  const text = value?.trim() ?? "";
  const number = /^\d+$/.test(text) ? Number(text) : 0;
  return Number.isSafeInteger(number) && number > 0 ? number : 0;
}

const listId = positiveInteger(process.env.BREVO_LIST_ID);
const validList = listId > 0;
export const newsletterConfigured = Boolean(process.env.BREVO_API_KEY?.trim() && validList);

type SubscribeOutcome = { ok: true; pending: boolean } | { ok: false; status: number; message: string };
const failed = "Non siamo riusciti a iscriverti. Riprova tra poco.";

export async function subscribeToNewsletter(email: string): Promise<SubscribeOutcome> {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (!apiKey || !validList) {
    return { ok: false, status: 503, message: "La newsletter non è ancora attiva. Riprova tra qualche giorno." };
  }

  const attributes = {
    SIAMO_CONSENT_AT: new Date().toISOString(),
    SIAMO_CONSENT_VERSION: "2026-09-08",
    SIAMO_CONSENT_SOURCE: "https://siamounmagazine.com/#newsletter",
  };
  // With a double opt-in template Brevo adds the address to the list only after
  // its owner clicks the confirmation link: nobody can subscribe someone else.
  const templateId = positiveInteger(process.env.BREVO_DOI_TEMPLATE_ID);
  const endpoint = templateId
    ? "https://api.brevo.com/v3/contacts/doubleOptinConfirmation"
    : "https://api.brevo.com/v3/contacts";
  const payload = templateId
    ? { email, includeListIds: [listId], templateId, redirectionUrl: canonicalUrl("/"), attributes }
    // Never reset emailBlacklisted: existing unsubscribes must remain effective.
    : { email, listIds: [listId], updateEnabled: true, attributes };

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    console.error("[newsletter] Brevo irraggiungibile");
    return { ok: false, status: 502, message: failed };
  }

  // New contacts return 201; existing ones may return 204 without a body.
  // Do not log response bodies or addresses: API errors can contain contact data.
  if (response.ok) return { ok: true, pending: templateId > 0 };
  console.error(`[newsletter] Brevo ha risposto ${response.status}`);
  if (response.status === 429) {
    return { ok: false, status: 429, message: "Troppe richieste. Aspetta un momento e riprova." };
  }
  return { ok: false, status: 502, message: failed };
}
