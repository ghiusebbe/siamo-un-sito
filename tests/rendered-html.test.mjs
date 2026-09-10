import assert from "node:assert/strict";
import test from "node:test";

async function loadWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker;
}

async function render(pathname) {
  const worker = await loadWorker();
  const response = await worker.fetch(
    new Request(`http://localhost${pathname}`, {
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
  return { response, html: await response.text() };
}

test("renders the accessible responsive site shell", async () => {
  const { response, html } = await render("/");

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  assert.match(html, /<html lang="it">/i);
  assert.match(html, /class="skip-link"[^>]*href="#contenuto"/i);
  assert.match(html, /aria-label="Navigazione principale"/i);
  assert.match(html, /aria-controls="mobile-menu"/i);
  assert.match(html, /class="home-feed"/i);
  assert.match(html, /aria-label="Esplora SIAMO"/i);
  assert.match(html, /<h1 class="wordmark"[^>]*aria-labelledby="wordmark-title"[\s\S]*?SIAMO — magazine di musica e cultura emergente/i);
  assert.match(html, /class="dynamic-title[^"']*"[^>]*aria-label="Dal feed\."/i);
  assert.doesNotMatch(html, /class="article-ad(?:\s|"|-)/i);
  // Placeholder figures are gone from the fallback content.
  assert.doesNotMatch(html, /1200\+/);
  // Entry animation: the overlay is server-rendered and gated by the inline session check.
  assert.match(html, /class="site-intro"/);
  assert.match(html, /sessionStorage\.getItem\("siamo-intro"\)/);
  // Fonts: only the two valid cuts, preloaded as WOFF2.
  assert.match(html, /rel="preload"[^>]*href="\/fonts\/Helvetica-Regular\.woff2"/i);
  assert.doesNotMatch(html, /Helvetica-Oblique/);
});

test("renders a branded 404 page", async () => {
  const { response, html } = await render("/pagina-che-non-esiste");

  assert.equal(response.status, 404);
  assert.match(html, /aria-label="Navigazione principale"/i);
  assert.match(html, /Pagina non trovata/);
  assert.match(html, /aria-label="Sezioni del sito"/i);
});

test("gives the Studio the whole viewport", async () => {
  const { response, html } = await render("/studio");

  assert.equal(response.status, 200);
  // Header and footer would push the Studio past the fold and hide its
  // publish action bar, so /studio renders without the site chrome.
  assert.doesNotMatch(html, /aria-label="Navigazione principale"/i);
  assert.doesNotMatch(html, /class="skip-link"/i);
  assert.doesNotMatch(html, /class="site-intro"/);
  assert.doesNotMatch(html, /aria-label="Sezioni del sito"/i);
});

test("carries the AdSense tag only once an account is configured", async () => {
  const { html: unconfigured } = await render("/");
  assert.doesNotMatch(unconfigured, /adsbygoogle/);

  process.env.ADSENSE_PUBLISHER_ID = "ca-pub-0000000000000000";
  try {
    const { html } = await render("/");
    const head = html.slice(0, html.indexOf("</head>"));
    // Google requires the tag in the head, loaded async and anonymously.
    assert.match(head, /<script[^>]*src="https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=ca-pub-0000000000000000"/);
    assert.match(head, /<script[^>]*async[^>]*adsbygoogle/);
    assert.match(head, /<script[^>]*crossorigin="anonymous"[^>]*adsbygoogle/);
  } finally {
    delete process.env.ADSENSE_PUBLISHER_ID;
  }
});

test("serves no ads.txt until an advertising account is configured", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(
    new Request("http://localhost/ads.txt"),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );

  assert.equal(response.status, 404);
});

test("publishes the privacy and cookie policy", async () => {
  const { response, html } = await render("/privacy");

  assert.equal(response.status, 200);
  assert.match(html, /PRIVACY E COOKIE/);
  assert.match(html, /Titolare del trattamento/);
  assert.match(html, /garanteprivacy\.it/);

  // The footer links it from every page.
  const { html: home } = await render("/");
  assert.match(home, /href="\/privacy"/);
});

test("fills the article ad spaces only for a configured account", async () => {
  const { html: unconfigured } = await render("/articoli/titolo-format-2026");
  assert.doesNotMatch(unconfigured, /class="article-ad/);

  process.env.ADSENSE_PUBLISHER_ID = "ca-pub-0000000000000000";
  process.env.ADSENSE_ARTICLE_FOOTER_SLOT = "1234567890";
  try {
    const { html } = await render("/articoli/titolo-format-2026");
    assert.match(html, /class="[^"]*adsbygoogle[^"]*"/);
    assert.match(html, /data-ad-client="ca-pub-0000000000000000"/);
    assert.match(html, /data-ad-slot="1234567890"/);
  } finally {
    delete process.env.ADSENSE_PUBLISHER_ID;
    delete process.env.ADSENSE_ARTICLE_FOOTER_SLOT;
  }
});

test("keeps an accessible image fallback and keyboard control for the wordmark", async () => {
  const { html } = await render("/");

  assert.match(html, /<span class="sr-only" id="wordmark-title">SIAMO — magazine di musica e cultura emergente<\/span>/);
  assert.match(html, /<canvas[^>]*aria-hidden="true"/);
  assert.match(html, /<button[^>]*type="button"[^>]*aria-label="Ruota il logo SIAMO"[^>]*aria-describedby="wordmark-instructions"/);
});

test("caps editorial titles to what their container can hold", async () => {
  // The size ceiling in globals.css needs the longest word of each title; without
  // it the fixed floors (74px/65px on the hero, 40px on the cards) pushed long
  // names such as "Masterclass" off the page on phones and off the shell on desktop.
  const { html: detail } = await render("/servizi/masterclass");
  assert.match(detail, /<h1[^>]*style="[^"]*--title-chars:\s*11[^"]*"[^>]*>Masterclass<\/h1>/i);

  const { html: listing } = await render("/servizi");
  assert.match(listing, /<h2[^>]*style="[^"]*--title-chars:\s*11[^"]*"[^>]*>Masterclass<\/h2>/i);

  const { html: home } = await render("/");
  assert.match(home, /<h3[^>]*style="[^"]*--title-chars:\s*11[^"]*"[^>]*>Masterclass<\/h3>/i);
});

test("links the icon relative to whatever host serves the page", async () => {
  const { html } = await render("/");

  // Resolved against metadataBase, the icon used to ship as an absolute URL on
  // another origin: localhost when SITE_URL was unset, the production domain on
  // a preview deployment.
  assert.match(html, /<link[^>]*rel="icon"[^>]*href="\/icon\.png"/i);
  assert.doesNotMatch(html, /rel="icon"[^>]*href="https?:\/\//i);
});

test("keeps the editorial domain for robots and the sitemap on other deployments", async () => {
  // Deployment hostnames must never enter public discovery URLs.
  process.env.VERCEL_PROJECT_PRODUCTION_URL = "siamo.example";
  const worker = await loadWorker();
  const fetchText = async (pathname) => {
    const response = await worker.fetch(
      new Request(`http://localhost${pathname}`),
      { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
      { waitUntil() {}, passThroughOnException() {} },
    );
    return response.text();
  };

  try {
    // Without SITE_URL both files used to advertise http://localhost:3000.
    assert.match(await fetchText("/robots.txt"), /Sitemap: https:\/\/siamounmagazine\.com\/sitemap\.xml/);
    assert.match(await fetchText("/sitemap.xml"), /<loc>https:\/\/siamounmagazine\.com\/servizi<\/loc>/);
  } finally {
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
  }
});
