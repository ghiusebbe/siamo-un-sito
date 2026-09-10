import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import {
  INTRO_SCRIPT, INTRO_MIN_DURATION, INTRO_EXIT_DURATION, INTRO_LOAD_TIMEOUT,
  INTRO_FINISHED_EVENT, WORDMARK_READY_EVENT, connectIntro,
} from '../lib/intro.ts';

function browser({ seen = false, reduce = false, pathname = '/', storageError = false } = {}) {
  const win = new EventTarget(), overlay = new EventTarget(), preference = new EventTarget();
  overlay.isConnected = true;
  preference.matches = reduce;
  let now = 0, nextTimer = 0, finished = 0;
  const timers = new Map();
  const document = { documentElement: { dataset: {} }, hidden: false, querySelector: () => overlay };
  Object.assign(win, {
    document, Event, performance: { now: () => now }, matchMedia: () => preference,
    sessionStorage: { getItem() { if (storageError) throw Error('Storage unavailable'); return seen ? '1' : null; }, setItem() {} },
    setTimeout(fn, delay) { const id = ++nextTimer; timers.set(id, { fn, at: now + delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
  });
  win.addEventListener(INTRO_FINISHED_EVENT, () => finished++);
  vm.runInNewContext(INTRO_SCRIPT, {
    window: win, document, Event, location: { pathname }, performance: win.performance,
    matchMedia: win.matchMedia, sessionStorage: win.sessionStorage, setTimeout: win.setTimeout,
  });
  return {
    win, document, preference, overlay, data: document.documentElement.dataset,
    finished: () => finished,
    pendingTimers: () => timers.size,
    connect: () => connectIntro(win),
    ready(status = 'ready') { document.documentElement.dataset.wordmark = status; win.dispatchEvent(new Event(WORDMARK_READY_EVENT)); },
    end(animationName = 'intro-curtain') {
      const event = new Event('animationend'); event.animationName = animationName; overlay.dispatchEvent(event);
    },
    advance(ms) {
      const until = now + ms;
      while (true) {
        const next = [...timers].filter(([, timer]) => timer.at <= until).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        const [id, timer] = next; now = timer.at; timers.delete(id); timer.fn();
      }
      now = until;
    },
  };
}

test('slow loading keeps the curtain closed until the real 3D frame is ready', () => {
  const b = browser(), disconnect = b.connect();
  assert.equal(b.data.js, 'true');
  assert.equal(b.data.wordmark, 'loading');
  b.advance(INTRO_MIN_DURATION + 3000);
  assert.equal(b.data.intro, 'play');
  assert.equal(b.finished(), 0, 'the old fixed intro deadline must not start the wave');
  b.ready();
  assert.equal(b.data.intro, 'reveal');
  b.end('intro-mark');
  assert.equal(b.finished(), 0, 'the symbol animation must not release the curtain');
  b.end();
  assert.equal(b.data.intro, 'skip');
  assert.equal(b.finished(), 1, 'the wave starts only when the curtain has exited');
  b.document.hidden = true;
  b.advance(INTRO_LOAD_TIMEOUT);
  assert.equal(b.data.wordmark, 'ready');
  assert.equal(b.finished(), 1);
  assert.equal(b.pendingTimers(), 0, 'a completed loader must not poll in a background tab');
  disconnect();
});

test('a return visit still covers loading and reveals immediately when ready', () => {
  const b = browser({ seen: true }), disconnect = b.connect();
  assert.equal(b.data.intro, 'play');
  b.advance(20); b.ready();
  assert.equal(b.data.intro, 'reveal', 'no repeated minimum delay on a cached visit');
  b.end(); assert.equal(b.data.intro, 'skip');
  disconnect();
});

test('readiness before hydration is retained and interrupted CSS has an exit fallback', () => {
  const b = browser(); b.ready(); b.advance(INTRO_MIN_DURATION);
  let disconnect = b.connect();
  assert.equal(b.data.intro, 'reveal');
  disconnect(); disconnect = b.connect();
  b.advance(INTRO_EXIT_DURATION + 80);
  assert.equal(b.data.intro, 'skip');
  assert.equal(b.finished(), 1);
  disconnect();
});

test('a missing client bundle cannot leave the loading screen blocking the site', () => {
  const b = browser();
  b.advance(INTRO_LOAD_TIMEOUT - 1);
  assert.equal(b.data.wordmark, 'loading');
  b.advance(1);
  assert.equal(b.data.wordmark, 'fallback');
  assert.equal(b.data.intro, 'skip');
  assert.equal(b.finished(), 1);
});

test('WebGL failure releases the curtain through the same readiness path', () => {
  const b = browser(), disconnect = b.connect();
  b.advance(INTRO_MIN_DURATION); b.ready('fallback');
  assert.equal(b.data.intro, 'reveal');
  b.end();
  assert.equal(b.data.wordmark, 'fallback');
  assert.equal(b.data.intro, 'skip');
  disconnect();
});

test('reduced motion uses the original logo immediately and skips the curtain', () => {
  const b = browser({ reduce: true }), disconnect = b.connect();
  assert.equal(b.data.wordmark, 'fallback');
  assert.equal(b.data.intro, 'skip');
  b.advance(INTRO_LOAD_TIMEOUT);
  assert.equal(b.data.intro, 'skip');
  disconnect();
});

test('other routes and unavailable session storage never wait for a nonexistent wordmark', () => {
  const b = browser({ pathname: '/articoli', storageError: true }), disconnect = b.connect();
  assert.equal(b.data.wordmark, undefined);
  b.advance(INTRO_MIN_DURATION);
  assert.equal(b.data.intro, 'reveal');
  b.end(); assert.equal(b.data.intro, 'skip');
  disconnect();
  const returning = browser({ pathname: '/articoli', seen: true });
  assert.equal(returning.data.intro, 'skip');
});

test('background tabs defer the emergency fallback until the page is visible', () => {
  const b = browser(); b.document.hidden = true;
  b.advance(INTRO_LOAD_TIMEOUT + 2000);
  assert.equal(b.data.wordmark, 'loading');
  b.document.hidden = false; b.advance(1000);
  assert.equal(b.data.wordmark, 'fallback');
  assert.equal(b.data.intro, 'skip');
});

test('Studio routes never lock scrolling, including navigation during loading', () => {
  for (const pathname of ['/studio', '/studio/desk/articoli']) {
    const b = browser({ pathname });
    assert.equal(b.data.intro, 'skip');
    assert.equal(b.data.wordmark, undefined);
  }
  const b = browser(), disconnect = b.connect();
  assert.equal(b.data.intro, 'play');
  b.overlay.isConnected = false; disconnect();
  assert.equal(b.data.intro, 'skip');
});
