import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "@/sanity/schemaTypes";

export type StudioTarget = { projectId: string; dataset: string };

/**
 * Studio configuration for a given project and dataset. Kept free of any
 * environment access so it can be bundled for the browser: the server page
 * decides project and dataset and passes them in.
 */
export function createStudioConfig({ projectId, dataset }: StudioTarget) {
  return defineConfig({
    name: "siamo",
    title: dataset === "production" ? "SIAMO Studio" : `SIAMO Studio (${dataset})`,
    basePath: "/studio",
    projectId,
    dataset,
    plugins: [structureTool()],
    schema: { types: schemaTypes },
  });
}
