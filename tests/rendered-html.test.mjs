import assert from "node:assert/strict";
import test from "node:test";

test("renders the accessible responsive site shell", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="it">/i);
  assert.match(html, /class="skip-link"[^>]*href="#contenuto"/i);
  assert.match(html, /aria-label="Navigazione principale"/i);
  assert.match(html, /aria-controls="mobile-menu"/i);
  assert.match(html, /class="dynamic-title[^"']*"[^>]*aria-label="Ultime storie"/i);
  assert.doesNotMatch(html, /class="article-ad(?:\s|"|-)/i);
});
