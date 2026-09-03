import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const sanityConfigured = Boolean(projectId);

/** The newsletter needs a write token: without it the form would only produce errors. */
export const newsletterConfigured = Boolean(projectId && process.env.SANITY_API_WRITE_TOKEN);

export const sanityClient = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion: "2026-08-01",
      useCdn: true,
      perspective: "published",
      requestTagPrefix: "siamo",
    })
  : null;

export function getSanityWriteClient() {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!projectId || !token) return null;

  return createClient({
    projectId,
    dataset,
    apiVersion: "2026-08-01",
    useCdn: false,
    token,
  });
}
