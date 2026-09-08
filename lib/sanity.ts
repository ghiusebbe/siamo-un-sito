import { createClient } from "@sanity/client";

// Server-side only: Vercel does not allow the NEXT_PUBLIC_ prefix on sensitive
// variables, so nothing here is exposed to the browser. The Studio receives
// project and dataset from the server page. The old names are still read so an
// existing .env.local keeps working.
export const sanityProjectId =
  process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
export const sanityDataset =
  process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const sanityConfigured = Boolean(sanityProjectId);

export const sanityClient = sanityProjectId
  ? createClient({
      projectId: sanityProjectId,
      dataset: sanityDataset,
      apiVersion: "2026-08-01",
      useCdn: true,
      perspective: "published",
      requestTagPrefix: "siamo",
    })
  : null;

