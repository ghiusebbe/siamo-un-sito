import { NextResponse } from "next/server";
import { subscribeToNewsletter } from "@/lib/brevo";
import { siteUrl } from "@/lib/site-url";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A per-instance brake on scripted bursts. Serverless instances do not share
// it, so the platform's rate limiting (Vercel WAF) remains the real limit.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, number[]>();

function clientAddress(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")?.trim()
    || "";
}

function rateLimited(address: string, now = Date.now()): boolean {
  if (!address) return false;
  const recent = (attempts.get(address) ?? []).filter((at) => now - at < WINDOW_MS);
  recent.push(now);
  attempts.set(address, recent);
  if (attempts.size > 5000) {
    for (const [key, times] of attempts) if (now - times[times.length - 1] >= WINDOW_MS) attempts.delete(key);
  }
  return recent.length > MAX_ATTEMPTS;
}

/** Browsers send Origin on every cross-site POST: only this site's own form may subscribe. */
function foreignOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const { host } = new URL(origin);
    return host !== new URL(siteUrl).host && host !== request.headers.get("host");
  } catch {
    return true;
  }
}

export async function POST(request: Request) {
  if (foreignOrigin(request)) return NextResponse.json({ message: "Richiesta non consentita." }, { status: 403 });
  // A JSON body cannot be sent cross-site by a plain HTML form.
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ message: "Richiesta non valida." }, { status: 415 });
  }
  if (rateLimited(clientAddress(request))) {
    return NextResponse.json({ message: "Troppe richieste. Aspetta un momento e riprova." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  // The hidden field is invisible to people; a filled one means a bot. Answer as
  // if it worked so the script learns nothing, and never contact Brevo.
  if (typeof body?.website === "string" && body.website.trim()) return NextResponse.json({ ok: true });

  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!emailPattern.test(email) || email.length > 254) return NextResponse.json({ message: "Inserisci un’email valida." }, { status: 400 });
  if (body?.consent !== true) return NextResponse.json({ message: "Serve il consenso per iscriverti." }, { status: 400 });

  const outcome = await subscribeToNewsletter(email);
  if (!outcome.ok) return NextResponse.json({ message: outcome.message }, { status: outcome.status });

  return NextResponse.json(outcome.pending ? { ok: true, pending: true } : { ok: true });
}
