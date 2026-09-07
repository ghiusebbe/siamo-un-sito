// Run after `npx next build --webpack`; exercises the actual production server.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { request } from "node:http";

const origin = "https://siamounmagazine.com";
const port = process.env.SEO_TEST_PORT || "3102";
const local = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", port], { stdio: ["ignore", "pipe", "pipe"] });
let logs = "";
server.stdout.on("data", (data) => { logs += data; });
server.stderr.on("data", (data) => { logs += data; });
try {
  await new Promise((resolve, reject) => {
    const deadline = setTimeout(() => reject(new Error(`Next did not start: ${logs}`)), 15000);
    server.stdout.on("data", (data) => {
      if (String(data).includes("Ready")) { clearTimeout(deadline); resolve(); }
    });
    server.on("error", (error) => { clearTimeout(deadline); reject(error); });
    server.on("exit", (code) => { clearTimeout(deadline); reject(new Error(`Next exited ${code}: ${logs}`)); });
  });
  for (const path of ["/", "/articoli", "/articoli/titolo-format-2026", "/eventi/ancora-kasino", "/servizi/masterclass", "/robots.txt", "/sitemap.xml"]) {
    const response = await fetch(`${local}${path}`, { signal: AbortSignal.timeout(15000) });
    const html = await response.text();
    assert.equal(response.status, 200, path);
    if (path.endsWith(".xml") || path.endsWith(".txt")) {
      assert.ok(html.includes(origin), path);
    } else {
      const canonical = html.match(/rel="canonical" href="([^"]+)"/);
      assert.ok(canonical, path);
      assert.equal(new URL(canonical[1]).href, `${origin}${path}`, path);
      assert.match(html, /name="twitter:card" content="summary_large_image"/);
      assert.doesNotMatch(html, /<meta[^>]+content="[^"]*noindex/);
    }
    assert.equal(response.headers.get("x-robots-tag"), null, path);
    console.log(`${path}: OK`);
  }
  for (const host of ["www.siamounmagazine.com", "siamo-un-sito.vercel.app", "test-preview.vercel.app", "siamounmagazine.com"]) {
    // Node fetch replaces a custom Host header; use HTTP for domain routing tests.
    const response = await new Promise((resolve, reject) => {
      const req = request(`${local}/articoli?ref=instagram`, { headers: { host } }, (res) => {
        res.resume();
        res.on("end", () => resolve({
          status: res.statusCode,
          headers: { get: (name) => res.headers[name] ?? null },
        }));
      });
      req.setTimeout(15000, () => req.destroy(new Error("Request timed out")));
      req.on("error", reject);
      req.end();
    });
    if (host === "test-preview.vercel.app") {
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("x-robots-tag"), "noindex, follow");
    } else if (host === "siamounmagazine.com") {
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("x-robots-tag"), null);
    } else {
      assert.equal(response.status, 308, host);
      assert.equal(response.headers.get("location"), `${origin}/articoli?ref=instagram`, host);
    }
    console.log(`${host}: OK`);
  }
} finally {
  server.kill("SIGTERM");
}
