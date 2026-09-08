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

/** Sostituisce beehiiv con una risposta finta e registra la richiesta in uscita. */
function stubBeehiiv(reply) {
  const calls = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input.url;
    if (!url.startsWith("https://api.beehiiv.com/")) return original(input, init);
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
  BEEHIIV_API_KEY: "test-key",
  BEEHIIV_PUBLICATION_ID: "0f7940ed-115a-5e63-a038-fa6facf9be63",
};

test("rifiuta email non valide senza contattare beehiiv", async () => {
  const beehiiv = stubBeehiiv(() => new Response("{}", { status: 201 }));
  try {
    const { response, payload } = await subscribe({ email: "non-una-email", consent: true }, configured);
    assert.equal(response.status, 400);
    assert.match(payload.message, /email valida/i);
    assert.equal(beehiiv.calls.length, 0);
  } finally {
    beehiiv.restore();
  }
});

test("rifiuta l'iscrizione senza consenso esplicito", async () => {
  const beehiiv = stubBeehiiv(() => new Response("{}", { status: 201 }));
  try {
    const { response, payload } = await subscribe({ email: "lettrice@example.com" }, configured);
    assert.equal(response.status, 400);
    assert.match(payload.message, /consenso/i);
    assert.equal(beehiiv.calls.length, 0);
  } finally {
    beehiiv.restore();
  }
});

test("crea l'iscrizione su beehiiv", async () => {
  const beehiiv = stubBeehiiv(() =>
    new Response(JSON.stringify({ data: { id: "sub_1", email: "lettrice@example.com", status: "active" } }), {
      status: 201,
      headers: { "content-type": "application/json" },
    }),
  );

  try {
    const { response, payload } = await subscribe({ email: "  Lettrice@Example.com ", consent: true }, configured);

    assert.equal(response.status, 200);
    assert.deepEqual(payload, { ok: true });

    assert.equal(beehiiv.calls.length, 1);
    const [call] = beehiiv.calls;
    // L'id senza prefisso viene normalizzato nella forma pub_… richiesta da beehiiv.
    assert.equal(call.url, `https://api.beehiiv.com/v2/publications/pub_${configured.BEEHIIV_PUBLICATION_ID}/subscriptions`);
    assert.equal(call.init.method, "POST");
    assert.equal(call.init.headers.authorization, "Bearer test-key");

    const sent = JSON.parse(call.init.body);
    assert.equal(sent.email, "lettrice@example.com");
    assert.equal(sent.reactivate_existing, true);
    assert.equal(sent.referring_site, "https://siamounmagazine.com/");
  } finally {
    beehiiv.restore();
  }
});

test("l'iscrizione è immediata qualunque stato restituisca beehiiv", async () => {
  const beehiiv = stubBeehiiv(() =>
    new Response(JSON.stringify({ data: { status: "validating" } }), {
      status: 201,
      headers: { "content-type": "application/json" },
    }),
  );
  try {
    const { response, payload } = await subscribe({ email: "lettrice@example.com", consent: true }, configured);
    assert.equal(response.status, 200);
    // Nessuna conferma via email: al browser non arriva nessuno stato intermedio.
    assert.deepEqual(payload, { ok: true });
  } finally {
    beehiiv.restore();
  }
});

test("non espone gli errori di beehiiv a chi si iscrive", async () => {
  const beehiiv = stubBeehiiv(() =>
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
    beehiiv.restore();
  }
});

test("senza credenziali beehiiv la newsletter risponde 503", async () => {
  const beehiiv = stubBeehiiv(() => new Response("{}", { status: 201 }));
  try {
    const { response, payload } = await subscribe(
      { email: "lettrice@example.com", consent: true },
      { BEEHIIV_API_KEY: undefined, BEEHIIV_PUBLICATION_ID: undefined },
    );
    assert.equal(response.status, 503);
    assert.match(payload.message, /non è ancora attiva/i);
    assert.equal(beehiiv.calls.length, 0);
  } finally {
    beehiiv.restore();
  }
});

test("la home mostra il form solo quando beehiiv è configurato", async () => {
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

  const withoutBeehiiv = await renderHome({ BEEHIIV_API_KEY: undefined, BEEHIIV_PUBLICATION_ID: undefined });
  assert.doesNotMatch(withoutBeehiiv, /newsletter-section/);

  const withBeehiiv = await renderHome(configured);
  assert.match(withBeehiiv, /class="newsletter-section/);
  assert.match(withBeehiiv, /id="newsletter-email"/);
  // Il dominio beehiiv serve solo a inviare le email: dal sito non ci si linka.
  assert.doesNotMatch(withBeehiiv, /staff\.siamounmagazine\.com/);
});

test("registra nei log lo stato restituito da beehiiv", async () => {
  const beehiiv = stubBeehiiv(() =>
    new Response(JSON.stringify({ data: { id: "sub_42", status: "active" } }), {
      status: 201,
      headers: { "content-type": "application/json" },
    }),
  );
  const lines = [];
  const log = console.log;
  console.log = (...args) => lines.push(args.join(" "));

  try {
    const { response } = await subscribe({ email: "lettrice@example.com", consent: true }, configured);
    assert.equal(response.status, 200);
    const line = lines.find((entry) => entry.includes("[newsletter]"));
    assert.ok(line, "manca la riga di log dell'iscrizione");
    assert.match(line, /id=sub_42/);
    assert.match(line, /stato=active/);
    // L'indirizzo non finisce nei log: per risalire all'iscritto basta l'id beehiiv.
    assert.doesNotMatch(line, /lettrice@example\.com/);
  } finally {
    console.log = log;
    beehiiv.restore();
  }
});
