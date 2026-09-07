/**
 * Public origin of the deployment, for metadata, robots.txt and sitemap.xml.
 *
 * `SITE_URL` stays authoritative. Without it the previous fallback was
 * `http://localhost:3000`, which shipped in production: the sitemap listed
 * localhost URLs and every page carried an absolute favicon link that no
 * visitor could load. Vercel exposes the hostname to the build, so the
 * platform values fill the gap before the local default is used:
 * `VERCEL_PROJECT_PRODUCTION_URL` is the stable production domain, while
 * `VERCEL_URL` is the per-deployment hostname that preview builds get.
 */
function origin() {
  const explicit = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit;

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return vercel.startsWith("http") ? vercel : `https://${vercel}`;

  return "http://localhost:3000";
}

/** Without a trailing slash, so `${siteUrl}${path}` composes cleanly. */
export const siteUrl = origin().replace(/\/+$/, "");
