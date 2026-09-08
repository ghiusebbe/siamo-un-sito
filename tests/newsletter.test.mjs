import assert from "node:assert/strict";
import test from "node:test";

const workerUrl = new URL("../dist/server/index.js", import.meta.url);

/** Ogni import valuta di nuovo i moduli, così ogni test può avere il suo process.env. */
async function loadWorker() {
  const url = new URL(workerUrl);
  url.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(url.href);
  return worker;
}

/** Sostituisce Brevo con una risposta finta e registra la richiesta in uscita. */
function stubBrevo(reply) {
  const calls = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input.url;
    if (!url.startsWith("https://api.brevo.com/")) return original(input, init);
    calls.push({ url, init });
    return reply();
  };
  return { calls, restore: () => { globalThis.fetch = original; } };
}

async function subscribe(body, env = {}) {
  const previous = {};
  for (const [key, value] of Object.entries(env)) {
    previous[key] = process.env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }

  try {
    const worker = await loadWorker();
    const response = await worker.fetch(
      new Request("http://localhost/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json", referer: "https://siamounmagazine.com/" },
        body: JSON.stringify(body),
      }),
      { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
      { waitUntil() {}, passThroughOnException() {} },
    );
    return { response, payload: await response.json() };
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

const configured = {
  BREVO_API_KEY: "test-key",
  BREVO_LIST_ID: "42",
};

test("rifiuta email non valide senza contattare Brevo", async () => {
  const brevo = stubBrevo(() => new Response("{}", { status: 201 }));
  try {
    const { response, payload } = await subscribe({ email: "non-una-email", consent: true }, configured);
    assert.equal(response.status, 400);
    assert.match(payload.message, /email valida/i);
    assert.equal(brevo.calls.length, 0);
  } finally {
    brevo.restore();
  }
});

test("rifiuta l'iscrizione senza consenso esplicito", async () => {
  const brevo = stubBrevo(() => new Response("{}", { status: 201 }));
  try {
    const { response, payload } = await subscribe({ email: "lettrice@example.com" }, configured);
    assert.equal(response.status, 400);
    assert.match(payload.message, /consenso/i);
    assert.equal(brevo.calls.length, 0);
  } finally {
    brevo.restore();
  }
});

test("crea l'iscrizione su Brevo", async () => {
  const brevo = stubBrevo(() =>
    new Response(JSON.stringify({ id: 21 }), {
      status: 201,
      headers: { "content-type": "application/json" },
    }),
  );

  try {
    const { response, payload } = await subscribe({ email: "  Lettrice@Example.com ", consent: true }, configured);

    assert.equal(response.status, 200);
    assert.deepEqual(payload, { ok: true });

    assert.equal(brevo.calls.length, 1);
    const [call] = brevo.calls;
    assert.equal(call.url, "https://api.brevo.com/v3/contacts");
    assert.equal(call.init.method, "POST");
    assert.equal(call.init.headers["api-key"], "test-key");
    assert.equal(call.init.cache, "no-store");
    const sent = JSON.parse(call.init.body);
    assert.equal(sent.email, "lettrice@example.com");
    assert.deepEqual(sent.listIds, [42]);
    assert.equal(sent.updateEnabled, true);
    assert.equal(Object.hasOwn(sent, "emailBlacklisted"), false);
    assert.equal(Object.hasOwn(sent, "forceMerge"), false);
    assert.ok(Number.isFinite(Date.parse(sent.attributes.SIAMO_CONSENT_AT)));
    assert.equal(sent.attributes.SIAMO_CONSENT_VERSION, "2026-09-08");
    assert.equal(sent.attributes.SIAMO_CONSENT_SOURCE, "https://siamounmagazine.com/#newsletter");
  } finally {
    brevo.restore();
  }
});

test("un contatto esistente può restituire 204 senza corpo", async () => {
  const brevo = stubBrevo(() => new Response(null, { status: 204 }));
  try {
    const { response, payload } = await subscribe({ email: "lettrice@example.com", consent: true }, configured);
    assert.equal(response.status, 200);
    assert.deepEqual(payload, { ok: true });
  } finally { brevo.restore(); }
});

test("non espone gli errori di Brevo a chi si iscrive", async () => {
  const brevo = stubBrevo(() =>
    new Response(JSON.stringify({ errors: [{ message: "Invalid API key" }] }), {
      status: 401,
      headers: { "content-type": "application/json" },
    }),
  );
  try {
    const { response, payload } = await subscribe({ email: "lettrice@example.com", consent: true }, configured);
    assert.equal(response.status, 502);
    assert.doesNotMatch(payload.message, /api key/i);
  } finally {
    brevo.restore();
  }
});

test("senza credenziali Brevo la newsletter risponde 503", async () => {
  const brevo = stubBrevo(() => new Response("{}", { status: 201 }));
  try {
    const { response, payload } = await subscribe(
      { email: "lettrice@example.com", consent: true },
      { BREVO_API_KEY: undefined, BREVO_LIST_ID: undefined },
    );
    assert.equal(response.status, 503);
    assert.match(payload.message, /non è ancora attiva/i);
    assert.equal(brevo.calls.length, 0);
  } finally {
    brevo.restore();
  }
});

test("la home mostra il form solo quando Brevo è configurato", async () => {
  async function renderHome(env) {
    const previous = {};
    for (const [key, value] of Object.entries(env)) {
      previous[key] = process.env[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    try {
      const worker = await loadWorker();
      const response = await worker.fetch(
        new Request("http://localhost/", { headers: { accept: "text/html" } }),
        { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
        { waitUntil() {}, passThroughOnException() {} },
      );
      return await response.text();
    } finally {
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    }
  }

  const withoutBrevo = await renderHome({ BREVO_API_KEY: undefined, BREVO_LIST_ID: undefined });
  assert.doesNotMatch(withoutBrevo, /newsletter-section/);

  const withBrevo = await renderHome(configured);
  assert.match(withBrevo, /class="newsletter-section/);
  assert.match(withBrevo, /id="newsletter-email"/);
  assert.match(withBrevo, /rel="alternate"[^>]*type="application\/rss\+xml"[^>]*href="\/feed.xml"/);
  assert.doesNotMatch(withBrevo, /test-key|api.brevo.com|beehiiv/);
  // Nessun link al precedente sottodominio newsletter.
  assert.doesNotMatch(withBrevo, /staff\.siamounmagazine\.com/);
});

test("rifiuta ID lista non validi senza contattare Brevo", async () => {
  const brevo = stubBrevo(() => new Response(null, { status: 204 }));
  try {
    for (const id of ["", "0", "-1", "1.2", "1e2", "abc", "9007199254740992"]) {
      const { response } = await subscribe({ email: "lettrice@example.com", consent: true }, { ...configured, BREVO_LIST_ID: id });
      assert.equal(response.status, 503, id);
    }
    assert.equal(brevo.calls.length, 0);
  } finally { brevo.restore(); }
});

test("gestisce rate limit e errori di rete senza esporre dati", async () => {
  for (const [reply, status] of [
    [() => new Response("private contact data", { status: 429 }), 429],
    [() => { throw new Error("test-key lettrice@example.com"); }, 502],
  ]) {
    const brevo = stubBrevo(reply);
    const lines = [];
    const original = console.error;
    console.error = (...args) => lines.push(args.join(" "));
    try {
      const { response, payload } = await subscribe({ email: "lettrice@example.com", consent: true }, configured);
      assert.equal(response.status, status);
      assert.doesNotMatch(JSON.stringify(payload) + lines.join(" "), /private contact|test-key|lettrice@example/);
    } finally { console.error = original; brevo.restore(); }
  }
});
