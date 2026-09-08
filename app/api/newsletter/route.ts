import { NextResponse } from "next/server";
import { subscribeToNewsletter } from "@/lib/beehiiv";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!emailPattern.test(email) || email.length > 254) return NextResponse.json({ message: "Inserisci un’email valida." }, { status: 400 });
  if (body?.consent !== true) return NextResponse.json({ message: "Serve il consenso per iscriverti." }, { status: 400 });

  const outcome = await subscribeToNewsletter(email, request.headers.get("referer") ?? undefined);
  if (!outcome.ok) return NextResponse.json({ message: outcome.message }, { status: outcome.status });

  return NextResponse.json({ ok: true, pendingConfirmation: outcome.pendingConfirmation });
}
