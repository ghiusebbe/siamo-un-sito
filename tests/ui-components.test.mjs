import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const vite = await createServer({
  appType: "custom",
  configFile: false,
  root,
  resolve: { alias: { "@": root } },
  server: { middlewareMode: true },
});

after(async () => {
  await vite.close();
});

async function readCssTree(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const contents = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return readCssTree(entryPath);
      }
      return entry.name.endsWith(".css") ? readFile(entryPath, "utf8") : "";
    }),
  );
  return contents.join("\n");
}

test("emits the catalog's animation and scrolling utilities", async () => {
  const css = await readCssTree(path.join(root, "dist"));

  assert.match(css, /--tw-enter-opacity/);
  assert.match(css, /scrollbar-width:\s*thin/);
  assert.match(css, /scrollbar-width:\s*none/);
  assert.match(css, /scrollbar-gutter:\s*stable/);
  assert.match(css, /scroll-fade-reveal-b/);
  assert.match(css, /mask-image:/);
  assert.match(css, /tw-shimmer/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test("forwards progress semantics to the primitive", async () => {
  const { Progress } = await vite.ssrLoadModule("/components/ui/progress.tsx");
  const html = renderToStaticMarkup(React.createElement(Progress, { value: 37 }));

  assert.match(html, /aria-valuenow="37"/);
  assert.match(html, /aria-valuetext="37%"/);
  assert.match(html, /data-state="loading"/);
});

test("emits chart themes for the starter's media dark mode", async () => {
  const { ChartStyle } = await vite.ssrLoadModule("/components/ui/chart.tsx");
  const html = renderToStaticMarkup(
    React.createElement(ChartStyle, {
      id: "contract",
      config: {
        latency: { theme: { light: "#ffffff", dark: "#000000" } },
      },
    }),
  );

  assert.match(html, /\[data-chart=contract\]/);
  assert.match(html, /@media \(prefers-color-scheme: dark\)/);
  assert.doesNotMatch(html, /\.dark/);
});

test("renders sidebar skeletons deterministically", async () => {
  const { SidebarMenuSkeleton } = await vite.ssrLoadModule(
    "/components/ui/sidebar.tsx",
  );
  const first = renderToStaticMarkup(React.createElement(SidebarMenuSkeleton));
  const second = renderToStaticMarkup(React.createElement(SidebarMenuSkeleton));

  assert.equal(first, second);
  assert.match(first, /--skeleton-width:70%/);
});

test("inserts inline article content only after the third block of long copy", async () => {
  const { RichTextContent } = await vite.ssrLoadModule("/components/rich-text.tsx");
  const marker = React.createElement("aside", { "data-test-ad": true }, "Ad");
  const longCopy = ["One", "Two", "Three", "Four", "Five"];
  const shortCopy = ["One", "Two", "Three", "Four"];

  const longHtml = renderToStaticMarkup(
    React.createElement(RichTextContent, {
      inlineContent: marker,
      value: longCopy,
    }),
  );
  const shortHtml = renderToStaticMarkup(
    React.createElement(RichTextContent, {
      inlineContent: marker,
      value: shortCopy,
    }),
  );

  assert.match(longHtml, /<p>Three<\/p><aside data-test-ad="true">Ad<\/aside><p>Four<\/p>/);
  assert.doesNotMatch(shortHtml, /data-test-ad/);
});

test("keeps advertising imports scoped to article detail pages", async () => {
  const appRoot = path.join(root, "app");
  const importers = [];

  async function findImporters(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    await Promise.all(entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return findImporters(entryPath);
      if (!entry.name.endsWith(".tsx")) return;
      const source = await readFile(entryPath, "utf8");
      if (source.includes("@/components/article-ad-slot")) {
        importers.push(path.relative(root, entryPath));
      }
    }));
  }

  await findImporters(appRoot);
  assert.deepEqual(importers.sort(), ["app/articoli/[slug]/page.tsx"]);
});
