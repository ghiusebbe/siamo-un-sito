import assert from "node:assert/strict";
import test from "node:test";

const article = {
  id: "article-one", title: 'Musica & cultura <oggi> "🎶"', slug: "musica-oggi",
  publishedAt: "2026-01-01T12:00:00Z", author: "Redazione & amici",
  excerpt: 'Un disco <speciale> & una storia.\u0001', category: "Musica",
  cover: "https://cdn.sanity.io/images/feedtest/production/cover-1200x800.jpg",
};

async function requestFeed(result = [article], options = {}) {
  const keys = ["SANITY_PROJECT_ID", "NEXT_PUBLIC_SANITY_PROJECT_ID", "SANITY_DATASET"];
  const previous = keys.map((key) => process.env[key]);
  const originalFetch = globalThis.fetch;
  process.env.SANITY_PROJECT_ID = options.unconfigured ? "" : "feedtest";
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = "";
  process.env.SANITY_DATASET = "production";
  const requests = [];
  globalThis.fetch = async (input) => {
    const url = new URL(input instanceof Request ? input.url : input);
    assert.equal(url.hostname, "feedtest.apicdn.sanity.io");
    assert.equal(url.searchParams.get("tag"), "siamo.rss");
    requests.push(url);
    if (options.error) return Response.json({ error: "Unauthorized" }, { status: 401 });
    return Response.json({ result });
  };
  try {
    const url = new URL("../dist/server/index.js", import.meta.url);
    url.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
    const { default: worker } = await import(url.href);
    const response = await worker.fetch(new Request("http://localhost/feed.xml"),
      { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
      { waitUntil() {}, passThroughOnException() {} });
    return { response, xml: await response.text(), requests };
  } finally {
    globalThis.fetch = originalFetch;
    keys.forEach((key, i) => {
      if (previous[i] === undefined) delete process.env[key];
      else process.env[key] = previous[i];
    });
  }
}

test("RSS pubblico con XML escaped, date, immagini e link canonici", async () => {
  const { response, xml, requests } = await requestFeed();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "application/rss+xml; charset=utf-8");
  assert.match(response.headers.get("cache-control"), /max-age=300/);
  assert.match(xml, /<title>Musica &amp; cultura &lt;oggi&gt; &quot;🎶&quot;<\/title>/);
  assert.match(xml, /<link>https:\/\/siamounmagazine.com\/articoli\/musica-oggi<\/link>/);
  assert.match(xml, /<dc:creator>Redazione &amp; amici<\/dc:creator>/);
  assert.match(xml, /<pubDate>Thu, 01 Jan 2026 12:00:00 GMT<\/pubDate>/);
  assert.match(xml, /&lt;speciale|&amp;lt;speciale/);
  assert.match(xml, /<media:content url="https:\/\/cdn.sanity.io\/.*&amp;fm=jpg/);
  assert.doesNotMatch(xml, /\u0001|localhost|<speciale>/);
  assert.equal(requests.length, 1);
  const query = requests[0].searchParams.get("query");
  assert.match(query, /drafts\.\*\*/);
  assert.match(query, /dateTime\(publishedAt\) <= dateTime\(now\(\)\)/);
  assert.match(query, /\[0\.\.\.50\]/);
  assert.equal(requests[0].searchParams.get("perspective"), "published");
});

test("esclude bozze, date future, date non valide e documenti incompleti", async () => {
  const { xml } = await requestFeed([
    article, { ...article, id: "drafts.draft" }, { ...article, id: "future", publishedAt: "2999-01-01" },
    { ...article, id: "bad-date", publishedAt: "invalid" }, { ...article, id: "empty-title", title: " " },
    { ...article, id: "empty-slug", slug: "" }, null,
  ]);
  assert.equal((xml.match(/<item>/g) ?? []).length, 1);
  assert.doesNotMatch(xml, /drafts\.draft|siamo:article:future|bad-date|empty-title|empty-slug/);
});

test("correzioni e riletture non cambiano GUID e data di pubblicazione", async () => {
  const first = await requestFeed();
  const second = await requestFeed([{ ...article, title: "Titolo corretto", slug: "nuovo-slug", _updatedAt: "2026-02-01T12:00:00Z" }]);
  for (const pattern of [/<guid[^>]*>.*?<\/guid>/, /<pubDate>.*?<\/pubDate>/]) {
    assert.equal(first.xml.match(pattern)[0], second.xml.match(pattern)[0]);
  }
  assert.equal(first.xml, (await requestFeed()).xml);
});

test("dataset vuoto resta vuoto; errori e configurazione mancante non pubblicano fallback", async () => {
  const empty = await requestFeed([]);
  assert.equal(empty.response.status, 200);
  assert.match(empty.xml, /<channel>/);
  assert.doesNotMatch(empty.xml, /<item>/);
  for (const options of [{ unconfigured: true }, { error: true }]) {
    const result = await requestFeed([], options);
    assert.equal(result.response.status, 503);
    assert.equal(result.response.headers.get("cache-control"), "no-store");
    assert.doesNotMatch(result.xml, /<item>|<rss/);
  }
  assert.equal((await requestFeed(null)).response.status, 503);
});

test("campi facoltativi assenti e immagini non HTTP non rompono il feed", async () => {
  const { response, xml } = await requestFeed([{ ...article, excerpt: null, subtitle: null, author: null, category: null, cover: "javascript:alert(1)" }]);
  assert.equal(response.status, 200);
  assert.doesNotMatch(xml, /<media:content|<dc:creator>|<category>|javascript:/);
  assert.match(xml, /Leggi l’articolo su SIAMO/);
});
