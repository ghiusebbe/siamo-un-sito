import { getRssFeed } from "@/lib/rss";
import { getSiteSettings } from "@/lib/content";
import { isShopOnly } from "@/lib/shop";

export const dynamic = "force-dynamic";

export async function GET() {
  if (isShopOnly(await getSiteSettings())) return new Response("Feed temporaneamente sospeso.", {
    status: 503, headers: { "Cache-Control": "no-store", "Retry-After": "300" },
  });
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
