/**
 * Iscrizioni alla newsletter su beehiiv (API v2).
 *
 * La chiave resta lato server: il form del sito invia a /api/newsletter, che a
 * sua volta chiama beehiiv. Niente iframe di terze parti e niente prefisso
 * NEXT_PUBLIC_, coerentemente con il resto delle integrazioni.
 */

const apiOrigin = "https://api.beehiiv.com/v2";
const requestTimeoutMs = 10_000;

/** beehiiv espone l'id nella forma prefissata `pub_…`: accettiamo anche l'UUID nudo. */
function normalisePublicationId(raw: string): string {
  const id = raw.trim();
  if (!id) return "";
  return id.startsWith("pub_") ? id : `pub_${id}`;
}

export const beehiivPublicationId = normalisePublicationId(process.env.BEEHIIV_PUBLICATION_ID || "");

/** Senza chiave e publication id il form produrrebbe solo errori: la sezione resta nascosta. */
export const newsletterConfigured = Boolean(beehiivPublicationId && process.env.BEEHIIV_API_KEY);

export type SubscribeOutcome =
  | { ok: true }
  | { ok: false; status: number; message: string };

const unavailable = "La newsletter non è ancora attiva. Riprova tra qualche giorno.";
const generic = "Iscrizione non riuscita, riprova tra poco.";

/**
 * Crea l'iscrizione su beehiiv. L'email è già validata e normalizzata a monte.
 * `referrer` finisce nelle statistiche di acquisizione di beehiiv.
 */
export async function subscribeToNewsletter(email: string, referrer?: string): Promise<SubscribeOutcome> {
  const apiKey = process.env.BEEHIIV_API_KEY;
  if (!apiKey || !beehiivPublicationId) return { ok: false, status: 503, message: unavailable };

  let response: Response;
  try {
    response = await fetch(`${apiOrigin}/publications/${beehiivPublicationId}/subscriptions`, {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        email,
        // Chi ricompila il form dopo essersi cancellato sta chiedendo di rientrare.
        reactivate_existing: true,
        send_welcome_email: true,
        utm_source: "siamounmagazine.com",
        utm_medium: "organic",
        referring_site: referrer,
      }),
      signal: AbortSignal.timeout(requestTimeoutMs),
    });
  } catch (error) {
    console.error("[newsletter] beehiiv irraggiungibile", error);
    return { ok: false, status: 502, message: generic };
  }

  // L'iscrizione è immediata: il double opt-in va tenuto disattivo su beehiiv.
  if (response.ok) return { ok: true };

  const payload = await response.json().catch(() => null);
  console.error(`[newsletter] beehiiv ha risposto ${response.status}`, payload);

  // 401/403 sono errori di configurazione nostri: all'utente non diciamo altro.
  if (response.status === 400) return { ok: false, status: 400, message: "Questa email non è stata accettata. Controllala e riprova." };
  if (response.status === 429) return { ok: false, status: 429, message: "Troppe richieste in questo momento. Riprova tra un minuto." };
  return { ok: false, status: 502, message: generic };
}
