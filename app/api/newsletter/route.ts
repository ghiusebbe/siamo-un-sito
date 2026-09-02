import { NextResponse } from "next/server";
import { getSanityWriteClient } from "@/lib/sanity";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!emailPattern.test(email)) return NextResponse.json({ message: "Inserisci un’email valida." }, { status: 400 });

  const client = getSanityWriteClient();
  if (!client) return NextResponse.json({ message: "La newsletter verrà attivata insieme al CMS." }, { status: 503 });

  await client.createIfNotExists({
    _id: `subscriber-${Buffer.from(email).toString("base64url")}`,
    _type: "subscriber",
    email,
    subscribedAt: new Date().toISOString(),
    active: true,
  });

  return NextResponse.json({ ok: true });
}
