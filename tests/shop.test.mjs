import assert from "node:assert/strict";
import test from "node:test";
import { isEditorialPath, isShopOnly, shopPurchase } from "../lib/shop.ts";

const product = {
  id: "magazine-four", volume: 4, title: "Il quarto numero",
  cover: "https://cdn.sanity.io/images/shopfixture/production/cover-1086x1536.jpg",
  productImage: "https://cdn.sanity.io/images/shopfixture/production/photo-1086x1536.jpg",
  checkoutUrl: "https://checkout.example.com/volume-four",
  description: "Musica e cultura, sulla carta.", price: 15, shippingNote: "Spedizione al checkout.",
};
const editorialTags = ["siamo.articles", "siamo.events", "siamo.services", "siamo.timeline", "siamo.magazines"];

async function request(path = "/", { settings = {}, magazines = [product], unconfigured = false, host = "http://localhost" } = {}) {
  const keys = ["SANITY_PROJECT_ID", "NEXT_PUBLIC_SANITY_PROJECT_ID", "SIAMO_DEFAULT_SITE_MODE"];
  const old = keys.map((key) => process.env[key]);
  const originalFetch = globalThis.fetch;
  const queries = [];
  process.env.SANITY_PROJECT_ID = unconfigured ? "" : "shopfixture";
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = "";
  delete process.env.SIAMO_DEFAULT_SITE_MODE;
  globalThis.fetch = async (input) => {
    const url = new URL(input instanceof Request ? input.url : input);
    assert.equal(url.hostname, "shopfixture.apicdn.sanity.io");
    queries.push(url);
    const tag = url.searchParams.get("tag");
    const values = {
      "siamo.dataset-state": 1,
      "siamo.settings": { title: "SIAMO", email: "test@example.com", ...settings },
      "siamo.articles": [], "siamo.events": [], "siamo.services": [], "siamo.timeline": [], "siamo.magazines": [],
    };
    if (tag === "siamo.shop-magazines") {
      assert.equal(url.searchParams.get("perspective"), "published");
      assert.match(url.searchParams.get("query"), /productImage\.asset->url/);
      const featured = JSON.parse(url.searchParams.get("$featuredOnly"));
      const id = JSON.parse(url.searchParams.get("$featuredId"));
      return Response.json({ result: magazines.filter((item) => !featured || (id ? item.id === id : item.volume === 4)) });
    }
    assert.ok(tag in values, `Unexpected query ${tag}`);
    return Response.json({ result: values[tag] });
  };
  try {
    const url = new URL("../dist/server/index.js", import.meta.url);
    url.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
    const { default: worker } = await import(url.href);
    const response = await worker.fetch(new Request(`${host}${path}`, { headers: { accept: "text/html", host: new URL(host).host } }),
      { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
      { waitUntil() {}, passThroughOnException() {} });
    return { response, html: await response.text(), queries };
  } finally {
    globalThis.fetch = originalFetch;
    keys.forEach((key, i) => old[i] === undefined ? delete process.env[key] : process.env[key] = old[i]);
  }
}

test("launch defaults to shop, while published Sanity settings always win", () => {
  const previous = process.env.SIAMO_DEFAULT_SITE_MODE;
  try {
    delete process.env.SIAMO_DEFAULT_SITE_MODE;
    assert.equal(isShopOnly({}), true);
    assert.equal(isShopOnly({ shopOnly: false }), false);
    process.env.SIAMO_DEFAULT_SITE_MODE = "editorial";
    assert.equal(isShopOnly({}), false);
    assert.equal(isShopOnly({ shopOnly: true }), true);
  } finally {
    if (previous === undefined) delete process.env.SIAMO_DEFAULT_SITE_MODE;
    else process.env.SIAMO_DEFAULT_SITE_MODE = previous;
  }
  assert.equal(isEditorialPath("/servizi/masterclass"), true);
  for (const path of ["/shop", "/studio/desk", "/privacy", "/condizioni-vendita", "/brand/siamo-wordmark-black.png", "/articolista"]) assert.equal(isEditorialPath(path), false);
});

test("preorders include the last day in Rome, then change to purchase", () => {
  const magazine = { ...product, preorderUntil: "2026-10-31" };
  assert.equal(shopPurchase(magazine, Date.parse("2026-10-31T22:59:59Z")).label, "Preordina il vol. 4");
  assert.equal(shopPurchase(magazine, Date.parse("2026-10-31T23:00:00Z")).label, "Acquista il vol. 4");
  assert.equal(shopPurchase(magazine, Date.parse("2026-10-01")).deadline, "31 ottobre");
  for (const date of ["", "invalid", "2026-02-30", "2026-13-01"]) assert.equal(shopPurchase({ ...product, preorderUntil: date }).preorder, false);
});

test("home and permanent shop show only the CMS volume, with original header logo and checkout", async () => {
  for (const path of ["/", "/shop"]) {
    const { response, html, queries } = await request(path, { magazines: [product, { ...product, id: "old", volume: 3, title: "Vecchio numero" }] });
    assert.equal(response.status, 200);
    assert.match(html, /<h1[^>]*>SHOP\.<\/h1>/);
    assert.match(html, /src="\/brand\/siamo-wordmark-black.png"/);
    assert.match(html, /href="https:\/\/checkout.example.com\/volume-four"/);
    assert.match(html, /photo-1086x1536/);
    assert.match(html, /15,00/);
    assert.match(html, /Spedizione al checkout/);
    assert.doesNotMatch(html, /Vecchio numero|class="home-feed"|class="site-intro"|href="\/(?:articoli|eventi|timeline|servizi|chi-siamo)"|href="\/feed.xml"/);
    assert.equal(queries.some((url) => editorialTags.includes(url.searchParams.get("tag"))), false);
  }
});

test("a published reference selects its product instead of volume 4", async () => {
  const { html, queries } = await request("/", { settings: { featuredMagazineId: "selected" }, magazines: [product, { ...product, id: "selected", volume: 5, title: "Numero selezionato" }] });
  assert.match(html, /Numero selezionato/);
  assert.doesNotMatch(html, /Il quarto numero/);
  assert.ok(queries.some((url) => url.searchParams.get("$featuredId") === '"selected"'));
  const missing = await request("/", { settings: { featuredMagazineId: "draft-only" } });
  assert.doesNotMatch(missing.html, /volume-four|Il quarto numero/);
});

test("missing CMS never substitutes old static covers or payment links", async () => {
  for (const options of [{ magazines: [] }, { unconfigured: true }]) {
    const { response, html } = await request("/", options);
    assert.equal(response.status, 200);
    assert.match(html, /Il nuovo cartaceo sarà disponibile a breve/);
    assert.doesNotMatch(html, /shop-buy|checkout.example|magazine-vol[123]/);
  }
  const { html } = await request("/", { magazines: [{ ...product, productImage: null, cover: " ", checkoutUrl: " " }] });
  assert.match(html, /Immagine in arrivo/);
  assert.match(html, /Acquisto disponibile a breve/);
  assert.doesNotMatch(html, /class="shop-buy"/);
});

test("Coming Soon withholds checkout from the complete HTML, including React payload", async () => {
  for (const releaseAt of [undefined, "2999-01-01T12:00:00Z", "invalid"]) {
    const { html } = await request("/", { magazines: [{ ...product, comingSoon: true, releaseAt }] });
    assert.match(html, /Disponibile prossimamente/);
    assert.doesNotMatch(html, /checkout.example|volume-four/);
  }
  const available = await request("/", { magazines: [{ ...product, comingSoon: true, releaseAt: "2020-01-01T00:00:00Z" }] });
  assert.match(available.html, /href="https:\/\/checkout.example/);
  const unsafe = await request("/", { magazines: [{ ...product, checkoutUrl: "javascript:alert(1)" }] });
  assert.doesNotMatch(unsafe.html, /javascript:alert|class="shop-buy"/);
});

test("editorial URLs temporarily redirect without caching or losing campaign parameters", async () => {
  for (const path of ["/articoli", "/articoli/nascosto", "/eventi", "/eventi/nascosto", "/timeline", "/servizi/masterclass", "/chi-siamo"]) {
    const { response, html } = await request(`${path}?ref=instagram`);
    assert.equal(response.status, 307, path);
    assert.equal(response.headers.get("location"), "http://localhost/?ref=instagram");
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.doesNotMatch(html, /home-feed|editorial-body/);
  }
  // Historical aliases retain their existing permanent canonical redirect first.
  const alias = await request("/articoli-cms");
  assert.equal(alias.response.status, 308);
  assert.equal(new URL(alias.response.headers.get("location"), "http://localhost").pathname, "/articoli");
  const preview = await request("/articoli", { host: "https://preview.vercel.app" });
  assert.equal(preview.response.headers.get("x-robots-tag"), "noindex, follow");
});

test("temporary discovery hides editorial sitemap entries and suspends RSS", async () => {
  const { html, queries } = await request("/sitemap.xml");
  assert.equal((html.match(/<loc>/g) ?? []).length, 4);
  assert.match(html, /\/shop<\/loc>/);
  assert.match(html, /\/condizioni-vendita<\/loc>/);
  assert.doesNotMatch(html, /\/articoli|\/eventi|\/servizi|\/timeline|\/chi-siamo/);
  assert.equal(queries.some((url) => editorialTags.includes(url.searchParams.get("tag"))), false);
  const feed = await request("/feed.xml");
  assert.equal(feed.response.status, 503);
  assert.equal(feed.response.headers.get("cache-control"), "no-store");
  assert.doesNotMatch(feed.html, /<rss|<item>/);
});

test("published switch restores existing site and retains the full shop", async () => {
  const { response, html } = await request("/", { settings: { shopOnly: false } });
  assert.equal(response.status, 200);
  assert.match(html, /class="home-feed"/);
  assert.match(html, /href="\/articoli"/);
  assert.match(html, /href="\/shop"/);
  const page = await request("/articoli", { settings: { shopOnly: false } });
  assert.equal(page.response.status, 200);
  const shop = await request("/shop", { settings: { shopOnly: false }, magazines: [product, { ...product, id: "old", volume: 3, title: "Terzo numero" }] });
  assert.match(shop.html, /Terzo numero/);
  assert.match(shop.html, /Il quarto numero/);
});

test("privacy and Studio remain accessible; 404 navigation has no editorial links", async () => {
  const privacy = await request("/privacy");
  assert.equal(privacy.response.status, 200);
  // No CMS configuration avoids loading the unrelated Studio runtime in Node.
  const studio = await request("/studio", { unconfigured: true });
  assert.equal(studio.response.status, 200);
  assert.doesNotMatch(studio.html, /class="shop-header|aria-label="Navigazione principale"/);
  const missing = await request("/nessuna-pagina");
  assert.equal(missing.response.status, 404);
  assert.doesNotMatch(missing.html, /href="\/(?:articoli|eventi|timeline|servizi|chi-siamo)"/);
});

test("sale terms and purchase privacy stay accessible and linked in both site modes", async () => {
  for (const shopOnly of [true, false]) {
    const { response, html } = await request("/condizioni-vendita", { settings: { shopOnly } });
    assert.equal(response.status, 200);
    assert.match(html, /97928370010/);
    assert.match(html, /mailto:test@example.com/);
    assert.match(html, /Stripe/);
    assert.match(html, /art\. 59, comma 1, lettera l\)/);
    assert.match(html, /non si estende agli abbonamenti/);
    assert.match(html, /garanzia legale di conformità/);
    assert.match(html, /href="\/privacy"/);
    const footer = html.match(/<footer[\s\S]*?<\/footer>/)?.[0];
    assert.match(footer, /href="\/condizioni-vendita"/);
    assert.match(footer, /href="\/privacy"/);
    if (shopOnly) assert.doesNotMatch(html, /href="\/(?:articoli|eventi|timeline|servizi|chi-siamo)"/);
    const privacy = await request("/privacy", { settings: { shopOnly } });
    assert.equal(privacy.response.status, 200);
    assert.match(privacy.html, /indirizzo di\s*spedizione/);
    assert.match(privacy.html, /https:\/\/stripe.com\/it\/privacy/);
    assert.match(privacy.html, /href="\/condizioni-vendita"/);
  }
});
