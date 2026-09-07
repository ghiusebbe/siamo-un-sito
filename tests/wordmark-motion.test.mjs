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

test("the final frame keeps the fragment geometry instead of swapping render mode", () => {
  const calls = [];
  const context = {
    clearRect() {}, save() {}, restore() {}, translate() {}, rotate() {}, scale() {},
    set globalAlpha(value) {},
    drawImage(...args) { calls.push(args); },
  };
  const logo = { naturalWidth: 1600, naturalHeight: 397 };
  drawWordmark(context, logo, DURATION);
  assert.equal(calls.length, 32 * 4);
  assert.equal(Math.max(...calls.map(args => args[1] + args[3])), logo.naturalWidth);
  assert.equal(Math.max(...calls.map(args => args[2] + args[4])), logo.naturalHeight);
  assert.equal(calls[0][3], 50);
});
