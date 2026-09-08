import { getRssFeed } from "@/lib/rss";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return new Response(await getRssFeed(), {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    console.error("[rss] Contenuti Sanity non disponibili");
    return new Response("Feed temporaneamente non disponibile.", {
      status: 503,
      headers: { "Cache-Control": "no-store", "Retry-After": "300" },
    });
  }
}
