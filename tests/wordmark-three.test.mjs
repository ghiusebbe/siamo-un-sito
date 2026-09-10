import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { Euler, Group, Mesh, OrthographicCamera, Vector3 } from 'three';
import {
  LOGO_DEPTH, REST_ROTATION, WAVE, cameraFrame, createWordmarkGeometry,
  renderBudget, waveAmount, wavePose,
} from '../lib/wordmark-model.ts';

test('the original silhouette and all 60 blocks have closed front, back and side surfaces', () => {
  const model = createWordmarkGeometry();
  assert.equal(model.blocks.length, 60);
  const surfaces = [{ geometry: model.solid, start: 0, count: model.solid.attributes.position.count },
    ...model.blocks.map(block => ({ ...block, geometry: model.animated }))];
  for (const { geometry, start, count } of surfaces) {
    const position = geometry.getAttribute('position');
    assert.ok(Math.abs(geometry.boundingBox.max.z - geometry.boundingBox.min.z - LOGO_DEPTH) < 1e-6);
    const edges = new Map();
    const vertex = i => [position.getX(i), position.getY(i), position.getZ(i)].map(n => n.toFixed(5)).join(',');
    let volume = 0;
    for (let i = start; i < start + count; i += 3) {
      const a = new Vector3().fromBufferAttribute(position, i);
      const b = new Vector3().fromBufferAttribute(position, i + 1);
      const c = new Vector3().fromBufferAttribute(position, i + 2);
      // Ignore exactly degenerate triangles at pixel contacts.
      if (b.clone().sub(a).cross(c.clone().sub(a)).lengthSq() < 1e-15) continue;
      volume += a.dot(b.clone().cross(c)) / 6;
      for (const [a, b] of [[i, i + 1], [i + 1, i + 2], [i + 2, i]]) {
        const edge = [vertex(a), vertex(b)].sort().join('|');
        edges.set(edge, (edges.get(edge) || 0) + 1);
      }
    }
    assert.ok(volume > 0, 'a solid must enclose a positive volume');
    // Earcut may replace several collinear boundary edges with one long edge.
    // Compare coverage, including those T-junctions, rather than vertex identity.
    const unmatched = [...edges].filter(([, count]) => count % 2).map(([key]) => key.split('|').map(p => new Vector3(...p.split(',').map(Number))));
    for (const [a, b] of unmatched) {
      const direction = b.clone().sub(a), length = direction.length();
      direction.normalize();
      const intervals = unmatched.filter(edge => edge[0] !== a).flatMap(([c, d]) => {
        const ca = c.clone().sub(a), da = d.clone().sub(a);
        if (ca.clone().cross(direction).length() > 1e-4 || da.clone().cross(direction).length() > 1e-4) return [];
        const values = [ca.dot(direction), da.dot(direction)].sort((a, b) => a - b);
        return [[Math.max(0, values[0]), Math.min(length, values[1])]];
      }).filter(([start, end]) => end > start).sort((a, b) => a[0] - b[0]);
      let covered = 0;
      for (const [start, end] of intervals) {
        if (start > covered + 1e-4) break;
        covered = Math.max(covered, end);
      }
      assert.ok(covered >= length - 1e-4, 'each surface edge has a neighbouring face along its full length');
    }
    const normals = geometry.attributes.normal;
    const z = Array.from({ length: count }, (_, i) => normals.getZ(start + i));
    assert.ok(z.some(n => n > 0.99) && z.some(n => n < -0.99), 'front and back caps');
    assert.ok(z.some(n => Math.abs(n) < 0.01), 'side walls');
  }
  assert.equal(model.animated.groups.length, 0, 'all blocks use a single draw/material');
  assert.ok(model.animated.attributes.position.count / 3 < 4500, 'animation triangle budget');
  for (const { x, y, start, count } of model.blocks) {
    const centers = model.animated.attributes.blockCenter;
    for (let i = start; i < start + count; i++) {
      assert.ok(Math.abs(centers.getX(i) - x) < 1e-6 && Math.abs(centers.getY(i) - y) < 1e-6,
        'every vertex of a solid shares its block pivot');
    }
  }
  model.solid.dispose(); model.animated.dispose();
});

test('the ripple travels outward, is local, and returns to the original positions', () => {
  const model = createWordmarkGeometry();
  model.blocks.forEach(({ x, y }) => {
    const rest = { x, y, z: 0, rx: 0, rz: 0 };
    const normalize = pose => Object.fromEntries(Object.entries(pose).map(([k, v]) => [k, v === 0 ? 0 : v]));
    for (const age of [-1, 0, WAVE.duration, 10, Infinity]) {
      assert.deepEqual(normalize(wavePose(x, y, age)), rest);
    }
  });
  const crest = age => {
    let peak = { radius: 0, height: 0 };
    for (let r = 0; r < 16; r += 0.01) {
      const height = waveAmount(r, age);
      if (height > peak.height) peak = { radius: r, height };
    }
    return peak;
  };
  const early = crest(0.3), later = crest(0.8);
  assert.ok(early.height > 0.25 && later.height > 0.15, 'a visible crest crosses the logo');
  assert.ok(Math.abs(later.radius - early.radius - WAVE.speed * 0.5) < 0.02, 'constant travelling speed');
  assert.ok(Math.abs(waveAmount(12, 0.3)) < 0.001, 'distant blocks stay assembled');
  assert.equal(wavePose(3, 4, 0.4).z, wavePose(-3, -4, 0.4).z, 'radial symmetry');
  assert.ok(Math.abs(waveAmount(1, 0.0001)) < 0.00001, 'no jump on activation');
  model.solid.dispose(); model.animated.dispose();
});

test('desktop and phone camera frames contain the solid during complete horizontal rotation', () => {
  const model = createWordmarkGeometry();
  const group = new Group();
  group.rotation.order = 'YXZ';
  group.add(new Mesh(model.solid));
  const position = model.animated.attributes.position;
  const poses = [new Float32Array(model.solid.attributes.position.array)];
  for (const origin of [{ x: -8.4, y: 0 }, { x: 0, y: 0 }]) {
    for (const age of [0.12, 0.4, 0.7, 1.1]) {
      const posed = new Float32Array(position.array.length);
      for (const block of model.blocks) {
        const pose = wavePose(block.x, block.y, age, origin);
        const rotation = new Euler(pose.rx, 0, pose.rz, 'ZXY');
        for (let i = block.start; i < block.start + block.count; i++) {
          const point = new Vector3().fromBufferAttribute(position, i);
          point.sub(new Vector3(block.x, block.y, 0)).applyEuler(rotation).add(new Vector3(pose.x, pose.y, pose.z));
          point.toArray(posed, i * 3);
        }
      }
      poses.push(posed);
    }
  }
  for (const [width, height] of [[1440, 317], [390, 104], [320, 70], [844, 120], [1920, 380]]) {
    const view = cameraFrame(width, height);
    const camera = new OrthographicCamera(-view.width / 2, view.width / 2, view.height / 2, -view.height / 2, 0.1, 80);
    camera.position.set(0, 2, 30); camera.lookAt(0, -0.25, 0); camera.updateMatrixWorld();
    for (let angle = 0; angle <= Math.PI * 2; angle += Math.PI / 12) {
      group.rotation.set(REST_ROTATION.x, angle, 0); group.updateMatrixWorld(true);
      for (const positions of poses) for (let i = 0; i < positions.length; i += 3) {
        const p = new Vector3().fromArray(positions, i).applyMatrix4(group.matrixWorld).project(camera);
        assert.ok(Math.abs(p.x) < 1 && Math.abs(p.y) < 1, `clipped at ${width}×${height}, angle ${angle}`);
      }
    }
  }
  model.solid.dispose(); model.animated.dispose();
});

test('simplified silhouettes retain the original lettering, apertures and stars', async () => {
  const model = JSON.parse(await readFile(new URL('../lib/wordmark-geometry.json', import.meta.url), 'utf8'));
  const original = await sharp(new URL('../public/brand/siamo-wordmark-black.png', import.meta.url).pathname).ensureAlpha().raw().toBuffer();
  assert.equal(model.outline.reduce((sum, shape) => sum + shape.holes.length, 0), 4);
  const masks = [];
  for (const shapes of [model.outline, model.blocks.flatMap(block => block.shapes)]) {
    const paths = shapes.map(shape => `<path fill-rule="evenodd" d="${[shape.outer, ...shape.holes]
      .map(ring => `M${ring.map(point => point.join(',')).join('L')}Z`).join('')}"/>`).join('');
    const raster = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${model.width}" height="${model.height}">${paths}</svg>`)).ensureAlpha().raw().toBuffer();
    masks.push(raster);
    let intersection = 0, union = 0;
    for (let i = 3; i < original.length; i += 4) {
      const a = original[i] >= 128, b = raster[i] >= 128;
      intersection += a && b; union += a || b;
    }
    assert.ok(intersection / union > 0.985, 'source-resolution silhouette overlap');
  }
  let difference = 0, area = 0;
  for (let i = 3; i < masks[0].length; i += 4) {
    const a = masks[0][i] >= 128, b = masks[1][i] >= 128;
    difference += a !== b; area += a || b;
  }
  assert.ok(difference / area < 0.006, 'no visible silhouette jump when the blocks settle');
});

test('phone and high-density desktop rendering stay within their pixel budget', () => {
  const phone = renderBudget(390, 104, 3, true);
  assert.equal(phone.pixelRatio, 1);
  assert.equal(phone.interval, 1000 / 30);
  for (const [width, height] of [[1440, 317], [1920, 380], [3840, 760]]) {
    const budget = renderBudget(width, height, 3, false);
    assert.ok(budget.pixelRatio <= 1.5);
    assert.ok(width * height * budget.pixelRatio ** 2 <= 1_200_001);
  }
});
