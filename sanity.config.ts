import { createStudioConfig } from "@/sanity/studio-config";

// Used by the Sanity CLI only (schema extraction, deploy): runs in Node, where
// the server-side variables are available. The embedded Studio gets its
// configuration from app/studio via components/studio-client.tsx.
export default createStudioConfig({
  projectId: process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "demo1234",
  dataset: process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
});
