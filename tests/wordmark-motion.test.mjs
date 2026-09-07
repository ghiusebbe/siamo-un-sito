import test from "node:test";
import assert from "node:assert/strict";
import { drawWordmark, tilePose, DURATION } from "../public/brand/wordmark-motion.mjs";

test("all fragments return to the original logo without drift", () => {
  for (let col = 0; col < 32; col++) for (let row = 0; row < 4; row++) {
    const pose = tilePose(col, row, DURATION);
    assert.equal(Math.abs(pose.x) + Math.abs(pose.y) + Math.abs(pose.angle), 0);
    assert.equal(pose.scale, 1);
    assert.equal(pose.alpha, 1);
  }
});
test("pointer effect is local and tap wave settles completely", () => {
  const pointer = { x: 1100, y: 273, strength: 1 };
  assert.deepEqual(tilePose(0, 0, 3, pointer), tilePose(0, 0, 3));
  assert.notDeepEqual(tilePose(16, 2, 3, pointer), tilePose(16, 2, 3));
  assert.deepEqual(tilePose(16, 2, 3, undefined, { x: 1100, y: 273, age: 2 }), tilePose(16, 2, 3));
});
test("seeking backwards reproduces the same frame geometry", () => {
  const first = tilePose(12, 2, 0.8);
  tilePose(12, 2, 4);
  assert.deepEqual(tilePose(12, 2, 0.8), first);
});

test("the extrusion stays deterministic at the final pose and caches source sampling", () => {
  const calls = [];
  let sourceReads = 0;
  const logo = { naturalWidth: 1600, naturalHeight: 397 };
  const context = () => ({
    clearRect() {}, fillRect() {}, save() {}, restore() {}, translate() {}, rotate() {}, scale() {},
    drawImage(...args) { if (args[0] === logo) sourceReads++; },
  });
  const previous = globalThis.document;
  globalThis.document = { createElement: () => ({ getContext: context }) };
  try {
    const ctx = context();
    ctx.drawImage = (...args) => calls.push(args);
    drawWordmark(ctx, logo, DURATION);
    const first = [...calls];
    const reads = sourceReads;
    calls.length = 0;
    drawWordmark(ctx, logo, 7.5);
    assert.deepEqual(calls, first, "no renderer or size swap after the entrance");
    assert.equal(sourceReads, reads, "volume is baked only once");
    assert.ok(reads > 0);
    assert.equal(calls.length, 128 * 3, "each block has a volume, shadow and reflection");
  } finally {
    if (previous === undefined) delete globalThis.document;
    else globalThis.document = previous;
  }
});
