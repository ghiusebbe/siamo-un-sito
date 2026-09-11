import assert from "node:assert/strict";
import test from "node:test";

const article = {
  id: "article-test", slug: "articolo-prova", title: "Articolo di prova",
  category: "Musica", author: "Redazione", publishedAt: "2026-09-01T12:00:00Z",
  cover: "/media/home-magazine.jpg",
};
const event = {
  id: "event-test", slug: "evento-prova", title: "Evento di prova",
  date: "2026-09-12T20:00:00Z", status: "upcoming", cover: "/media/event-ancora-kasino.jpg",
};
const service = {
  id: "service-test", slug: "servizio-prova", title: "Servizio di prova",
  tagline: "Il progetto prende forma", intro: "Progetti editoriali e culturali.",
};
const settings = { title: "SIAMO", email: "redazione@example.com" };
const blankBlock = { _type: "block", children: [{ _type: "span", text: " \n\t\u00a0 " }] };

/** Exercise the built pages through the real Sanity client, with no live dataset. */
async function render(pathname, fixtures = {}) {
  const originalFetch = globalThis.fetch;
  const originalProject = process.env.SANITY_PROJECT_ID;
  const requests = [];
  process.env.SANITY_PROJECT_ID = "emptyfields";
  globalThis.fetch = async (input) => {
    const url = new URL(input instanceof Request ? input.url : input);
    assert.equal(url.hostname, "emptyfields.apicdn.sanity.io");
    const tag = url.searchParams.get("tag");
    requests.push(tag);
    const collections = {
      "siamo.articles": fixtures.articles ?? [article],
      "siamo.events": fixtures.events ?? [event],
      "siamo.services": fixtures.services ?? [service],
      "siamo.magazines": fixtures.magazines ?? [],
      "siamo.timeline": fixtures.timeline ?? [],
      "siamo.settings": { ...settings, ...fixtures.settings },
      "siamo.dataset-state": 1,
    };
    const singular = { "siamo.article": "siamo.articles", "siamo.event": "siamo.events", "siamo.service": "siamo.services" };
    const result = singular[tag]
      ? collections[singular[tag]].find((item) => item.slug === JSON.parse(url.searchParams.get("$slug"))) ?? null
      : collections[tag];
    assert.notEqual(result, undefined, `Unexpected query: ${tag}`);
    return Response.json({ result });
  };

  try {
    const workerUrl = new URL("../dist/server/index.js", import.meta.url);
    workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
    const { default: worker } = await import(workerUrl.href);
    const response = await worker.fetch(
      new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
      { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
      { waitUntil() {}, passThroughOnException() {} },
    );
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.ok(requests.includes("siamo.dataset-state"), "The page must use the Sanity fixture, not fallback content");
    // Ignore the serialized React payload when checking visible elements.
    return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<!--[\s\S]*?-->/g, "");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalProject === undefined) delete process.env.SANITY_PROJECT_ID;
    else process.env.SANITY_PROJECT_ID = originalProject;
  }
}

test("omits missing, null and whitespace-only article fields and their containers", async () => {
  for (const empty of [undefined, null, "", " \n\t\u00a0 "]) {
    const item = { ...article, subtitle: empty, excerpt: empty, body: empty == null ? empty : [blankBlock] };
    const detail = await render("/articoli/articolo-prova", { articles: [item] });
    assert.match(detail, /Articolo di prova/);
    assert.doesNotMatch(detail, /class="editorial-subtitle"|class="editorial-body"|class="prose"/);
    const listing = await render("/articoli", { articles: [item] });
    assert.doesNotMatch(listing, /<p>\s*<\/p>/);
  }
});

test("omits empty event fields on detail, listing and home without crashing", async () => {
  for (const lineup of [undefined, null, [], [null, "", " \t "]]) {
    const item = { ...event, lineup, venue: " \t ", city: null, ticketUrl: " ", description: [blankBlock] };
    for (const pathname of ["/eventi/evento-prova", "/eventi", "/"]) {
      const html = await render(pathname, { events: [item] });
      assert.match(html, /Evento di prova/);
      assert.doesNotMatch(html, /class="lineup"|class="prose"|Biglietti|<p>\s*<\/p>/);
      if (pathname === "/eventi") assert.doesNotMatch(html, />Archivio<\/h2>/);
    }
  }
});

test("omits empty service sections, unanswered FAQs and related navigation", async () => {
  for (const empty of [undefined, null, []]) {
    const html = await render("/servizi/servizio-prova", {
      services: [{ ...service, cover: " ", gallery: empty, deliverables: empty, faq: empty }],
    });
    assert.match(html, /Servizio di prova/);
    assert.doesNotMatch(html, /class="(?:deliverables|service-cover|service-gallery|faq-section|services-nav)\b/);
  }
  const html = await render("/servizi/servizio-prova", {
    services: [{ ...service, gallery: [null, "", " \t "], deliverables: [null, {}, { title: " " }], faq: [null, {}, { question: "Domanda senza risposta", answer: " " }] }],
  });
  assert.doesNotMatch(html, /Cosa facciamo|Domande frequenti|Domanda senza risposta|class="service-gallery/);
});

test("omits empty home sections and incomplete metrics and Instagram links", async () => {
  for (const metrics of [undefined, null, [], [null, {}, { value: "22k", label: " " }, { value: " ", label: "Lettori" }]]) {
    const html = await render("/", {
      articles: [], events: [], services: [], magazines: [], timeline: [],
      settings: { metrics, instagramHandle: " \t ", instagramUrl: " " },
    });
    assert.doesNotMatch(html, /class="[^"]*(?:magazine-section|studio-section|latest-strip|metrics-section|latest-section|event-promo)[^"]*"/);
    assert.doesNotMatch(html, /class="compact-link"[^>]*href=""|<a[^>]*href="\s*"|>Instagram<\/span>/);
  }
  for (const [pathname, section] of [["/articoli", "listing-section"], ["/eventi", "events-section"], ["/servizi", "services-grid"], ["/timeline", "timeline-section"]]) {
    const html = await render(pathname, { articles: [], events: [], services: [], timeline: [] });
    assert.doesNotMatch(html, new RegExp(`class="${section}\\b`));
  }
});

test("keeps populated content, links and formatting while removing blank entries", async () => {
  const body = [blankBlock, {
    _type: "block", children: [
      { text: "Ascolta", marks: ["strong"] }, { text: " " },
      { text: "il brano", marks: ["em", "link-1"] },
    ],
    markDefs: [{ _key: "link-1", _type: "link", href: "https://example.com/brano" }],
  }, blankBlock];
  const articleHtml = await render("/articoli/articolo-prova", { articles: [{ ...article, subtitle: "Sottotitolo presente", body }] });
  assert.match(articleHtml, /class="editorial-subtitle">Sottotitolo presente/);
  assert.match(articleHtml, /class="editorial-body"/);
  assert.match(articleHtml, /<strong>Ascolta<\/strong> /);
  assert.match(articleHtml, /href="https:\/\/example.com\/brano"[^>]*><em>il brano<\/em>/);
  assert.doesNotMatch(articleHtml, /<p>\s*<\/p>/);

  const eventHtml = await render("/eventi/evento-prova", { events: [{ ...event, lineup: ["", " Artista A ", " ", "Artista B"], venue: "Sala concerti", ticketUrl: "https://example.com/biglietti" }] });
  assert.match(eventHtml, /class="lineup">Artista A · Artista B<\/p>/);
  assert.match(eventHtml, /Sala concerti/);
  assert.match(eventHtml, /href="https:\/\/example.com\/biglietti"/);

  const serviceHtml = await render("/servizi/servizio-prova", { services: [{
    ...service, deliverables: [{ title: "Ufficio stampa", description: " " }, { title: "Social", description: "Contenuti editoriali" }],
    faq: [{ question: "Quando?", answer: "Scrivici per le date." }, { question: "Domanda incompleta", answer: null }],
    gallery: [" ", "/media/home-magazine.jpg"],
  }] });
  assert.match(serviceHtml, /Cosa facciamo\?/);
  assert.match(serviceHtml, /Ufficio stampa/);
  assert.match(serviceHtml, /Contenuti editoriali/);
  assert.match(serviceHtml, /<summary>Quando\?<\/summary><p>Scrivici per le date\.<\/p>/);
  assert.match(serviceHtml, /class="service-gallery/);
  assert.doesNotMatch(serviceHtml, /Domanda incompleta|<p>\s*<\/p>/);

  const homeHtml = await render("/", { settings: {
    metrics: [{ value: "22k", label: "Lettori" }, { value: "", label: "Vuoto" }],
    instagramHandle: "@siamounmagazine", instagramUrl: "https://www.instagram.com/siamounmagazine/",
  } });
  assert.match(homeHtml, /class="metrics-section dark-section"/);
  assert.match(homeHtml, /<strong>22k<\/strong><span>Lettori<\/span>/);
  assert.match(homeHtml, /Segui @siamounmagazine/);
  assert.doesNotMatch(homeHtml, /<span>Vuoto<\/span>/);
});

test("keeps the purchase link of a coming-soon magazine off the page until its release", async () => {
  const cover = "/media/volume-1.png";
  const html = await render("/", { magazines: [
    { id: "mag-soon", volume: 4, title: "Volume in arrivo", cover, checkoutUrl: "https://example.com/buy-4", comingSoon: true, releaseAt: "2999-01-01T10:00:00Z" },
    { id: "mag-undated", volume: 5, title: "Volume senza data", cover, checkoutUrl: "https://example.com/buy-5", comingSoon: true },
    { id: "mag-out", volume: 6, title: "Volume uscito", cover, checkoutUrl: "https://example.com/buy-6", comingSoon: true, releaseAt: "2020-01-01T10:00:00Z" },
    { id: "mag-nolink", volume: 7, title: "Volume senza link", cover },
  ] });
  assert.match(html, /class="[^"]*magazine-section/);
  assert.doesNotMatch(html, /buy-4|buy-5/);
  assert.match(html, /href="https:\/\/example.com\/buy-6"/);
  assert.equal(html.match(/Coming soon/g)?.length, 2);
  assert.match(html, /<time[^>]*datetime="2999-01-01T10:00:00Z"/i);
  assert.equal(html.match(/class="acid-button"[^>]*href="https:\/\/example.com/g)?.length, 1);
});

test("omits blank timeline text, links and images while keeping the entry", async () => {
  const html = await render("/timeline", { timeline: [{
    id: "timeline-test", year: 2026, title: "Progetto in archivio", description: " \t ", image: " ", link: " ",
  }] });
  assert.match(html, /<h2>Progetto in archivio<\/h2>/);
  assert.doesNotMatch(html, /<p>\s*<\/p>|<a[^>]*href="\s*"|<img[^>]*src="\s*"/);
});

test("counts only populated paragraphs for inline ads and preserves their position", async () => {
  const keys = ["ADSENSE_PUBLISHER_ID", "ADSENSE_ARTICLE_INLINE_SLOT"];
  const previous = keys.map((key) => process.env[key]);
  process.env.ADSENSE_PUBLISHER_ID = "ca-pub-0000000000000000";
  process.env.ADSENSE_ARTICLE_INLINE_SLOT = "1234567890";
  try {
    const short = await render("/articoli/articolo-prova", { articles: [{
      ...article, body: ["Primo", "", " \t ", "Secondo", " "],
    }] });
    assert.doesNotMatch(short, /data-ad-slot="1234567890"|<p>\s*<\/p>/);

    const long = await render("/articoli/articolo-prova", { articles: [{
      ...article, body: ["", "Primo", "Secondo", " ", "Terzo", "Quarto", "Quinto"],
    }] });
    const ad = long.indexOf('data-ad-slot="1234567890"');
    assert.ok(ad > long.indexOf("<p>Terzo</p>") && ad < long.indexOf("<p>Quarto</p>"));
    assert.doesNotMatch(long, /<p>\s*<\/p>/);
  } finally {
    keys.forEach((key, index) => {
      if (previous[index] === undefined) delete process.env[key];
      else process.env[key] = previous[index];
    });
  }
});
