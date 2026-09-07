import assert from "node:assert/strict";
import test from "node:test";

const origin = "https://siamounmagazine.com";
const cover = "https://cdn.sanity.io/images/seofixture/production/photo-1600x1000.jpg";
const article = {
  id: "article-seo", slug: "articolo-seo", title: 'Musica <nuova> & cultura',
  category: "Musica", author: "Autore di prova", excerpt: 'Una storia </script><script>alert(1)</script>',
  publishedAt: "2026-08-01T10:00:00Z", _updatedAt: "2026-09-06T12:30:00Z",
  cover, coverAlt: "Artista sul palco", body: [],
};
const event = { id: "event-seo", slug: "evento-seo", title: "Evento", date: "2027-05-01T20:00:00Z", _updatedAt: "2026-09-05T10:00:00Z", status: "upcoming", cover };
const service = { id: "service-seo", slug: "servizio-seo", title: "Servizio", intro: "Progetti culturali", _updatedAt: "2026-09-04T10:00:00Z" };

async function render(path, { host = origin, fixture = false } = {}) {
  const fetch = globalThis.fetch;
  const oldProject = process.env.SANITY_PROJECT_ID;
  if (fixture) {
    process.env.SANITY_PROJECT_ID = "seofixture";
    globalThis.fetch = async (input) => {
      const url = new URL(input instanceof Request ? input.url : input);
      assert.equal(url.hostname, "seofixture.apicdn.sanity.io");
      const tag = url.searchParams.get("tag");
      const results = { "siamo.settings": { title: "SIAMO", email: "siamounmagazine@gmail.com", metrics: [] }, "siamo.dataset-state": 1, "siamo.article": article, "siamo.articles": [article], "siamo.events": [event], "siamo.services": [service] };
      assert.ok(tag in results, `Unexpected Sanity request: ${tag}`);
      if (["siamo.article", "siamo.articles", "siamo.events", "siamo.services"].includes(tag)) assert.match(url.searchParams.get("query"), /_updatedAt/);
      return Response.json({ result: results[tag] });
    };
  }
  try {
    const url = new URL("../dist/server/index.js", import.meta.url);
    url.searchParams.set("test", `${Date.now()}-${Math.random()}`);
    const { default: worker } = await import(url.href);
    const response = await worker.fetch(new Request(`${host}${path}`, { headers: { accept: "text/html", host: new URL(host).host } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
    return { response, html: await response.text() };
  } finally {
    globalThis.fetch = fetch;
    if (oldProject === undefined) delete process.env.SANITY_PROJECT_ID;
    else process.env.SANITY_PROJECT_ID = oldProject;
  }
}

function jsonLd(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
}

test("public pages each have one matching canonical, specific descriptions and large social cards", async () => {
  for (const path of ["/", "/articoli", "/eventi", "/servizi", "/timeline", "/chi-siamo", "/privacy", "/articoli/titolo-format-2026", "/eventi/ancora-kasino", "/servizi/masterclass"]) {
    const { response, html } = await render(path);
    assert.equal(response.status, 200, path);
    assert.equal(response.headers.get("x-robots-tag"), null, path);
    assert.equal(html.match(/rel="canonical"/g)?.length, 1, path);
    assert.ok(html.includes(`rel="canonical" href="${origin}${path}"`), path);
    assert.match(html, /name="description" content="[^"]{20,}"/);
    assert.match(html, /name="twitter:card" content="summary_large_image"/);
    assert.doesNotMatch(html, /<meta[^>]+content="[^"]*noindex/);
    assert.doesNotMatch(html, /(?:href|content)="https?:\/\/(?:siamo-un-sito\.vercel\.app|siamounmagazine\.it)/);
    const graph = jsonLd(html).find((data) => data["@graph"])["@graph"];
    assert.equal(graph[0]["@type"], "Organization");
    assert.equal(graph[1]["@type"], "WebSite");
  }
});

test("Sanity drives article metadata, escaped JSON-LD and responsive priority cover", async () => {
  const { html } = await render("/articoli/articolo-seo", { fixture: true });
  assert.match(html, /property="og:type" content="article"/);
  assert.match(html, /property="og:title" content="Musica &lt;nuova&gt; &amp; cultura"/);
  assert.match(html, /property="og:image" content="https:\/\/cdn\.sanity\.io/);
  assert.match(html, /name="twitter:image" content="https:\/\/cdn\.sanity\.io/);
  const data = jsonLd(html).find((data) => data["@type"] === "Article");
  assert.equal(data.headline, article.title);
  assert.equal(data.description, article.excerpt);
  assert.equal(data.author.name, article.author);
  assert.equal(data.datePublished, "2026-08-01T10:00:00.000Z");
  assert.equal(data.dateModified, "2026-09-06T12:30:00.000Z");
  assert.equal(data.publisher["@id"], `${origin}/#organization`);
  assert.equal(data.mainEntityOfPage["@id"], `${origin}/articoli/articolo-seo`);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  assert.match(html, /src[Ss]et="[^"]*w=640[^"\s]* 640w/);
  assert.match(html, /alt="Artista sul palco"/);
  assert.match(html, /fetch[Pp]riority="high"|rel="preload"[^>]*as="image"/);
});

test("sitemap uses content updates rather than event dates", async () => {
  const { html } = await render("/sitemap.xml", { fixture: true });
  assert.match(html, /articoli\/articolo-seo<\/loc>\s*<lastmod>2026-09-06T12:30:00.000Z/);
  assert.match(html, /eventi\/evento-seo<\/loc>\s*<lastmod>2026-09-05T10:00:00.000Z/);
  assert.match(html, /servizi\/servizio-seo<\/loc>\s*<lastmod>2026-09-04T10:00:00.000Z/);
  assert.doesNotMatch(html, /2027-05-01/);
  const fallback = await render("/sitemap.xml");
  assert.doesNotMatch(fallback.html, /eventi\/ancora-kasino<\/loc>\s*<lastmod>/);
});

test("secondary hosts redirect permanently, retaining paths and query parameters", async () => {
  for (const host of ["https://www.siamounmagazine.com", "https://siamo-un-sito.vercel.app"]) {
    const { response } = await render("/articoli/articolo-seo?ref=instagram", { host });
    assert.equal(response.status, 308);
    assert.equal(response.headers.get("location"), `${origin}/articoli/articolo-seo?ref=instagram`);
  }
});

test("Vercel previews cannot be indexed; Studio alone is excluded on production", async () => {
  const preview = await render("/articoli", { host: "https://siamo-preview.vercel.app" });
  assert.equal(preview.response.headers.get("x-robots-tag"), "noindex, follow");
  assert.ok(preview.html.includes(`${origin}/articoli`));
  const studio = await render("/studio");
  assert.match(studio.html, /name="robots" content="noindex, nofollow"/);
});
