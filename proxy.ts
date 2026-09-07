import { NextResponse, type NextRequest } from "next/server";
import { siteUrl } from "@/lib/site-url";

export function proxy(request: NextRequest) {
  const url = new URL(request.url);
  // Next's Node server may construct request.url with its internal hostname.
  // Host represents the visitor-facing domain on both Next and Vinext.
  const hostname = (request.headers.get("host") || url.host).replace(/:\d+$/, "").toLowerCase();
  if (hostname === "www.siamounmagazine.com" || hostname === "siamo-un-sito.vercel.app") {
    // Keep both pathname and query; changing only the origin avoids losing UTM tags.
    const destination = new URL(siteUrl);
    destination.pathname = url.pathname;
    destination.search = url.search;
    return NextResponse.redirect(destination, 308);
  }
  const response = NextResponse.next();
  if (hostname.endsWith(".vercel.app")) response.headers.set("X-Robots-Tag", "noindex, follow");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|_vinext/|assets/).*)"],
};
