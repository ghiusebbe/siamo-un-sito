import test from 'node:test';
import assert from 'node:assert/strict';
import { Group, Mesh, OrthographicCamera, Vector3 } from 'three';
import {
  ASSEMBLY_DURATION, BURST_DURATION, LOGO_DEPTH, REST_ROTATION,
  blockPose, cameraFrame, createWordmarkGeometry,
} from '../lib/wordmark-model.ts';

test('the original silhouette and all 35 blocks have closed front, back and side surfaces', () => {
  const model = createWordmarkGeometry();
  assert.equal(model.blocks.length, 35);
  for (const geometry of [model.solid, ...model.blocks.map(block => block.geometry)]) {
    const position = geometry.getAttribute('position');
    assert.ok(Math.abs(geometry.boundingBox.max.z - geometry.boundingBox.min.z - LOGO_DEPTH) < 1e-6);
    const edges = new Map();
    const vertex = i => [position.getX(i), position.getY(i), position.getZ(i)].map(n => n.toFixed(5)).join(',');
    let volume = 0;
    for (let i = 0; i < position.count; i += 3) {
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
    assert.ok(geometry.groups.some(group => group.materialIndex === 0), 'cap material');
    assert.ok(geometry.groups.some(group => group.materialIndex === 1), 'side-wall material');
    geometry.dispose();
  }
});

test('assembly and click return to precisely the original positions without a size jump', () => {
  const model = createWordmarkGeometry();
  model.blocks.forEach(({ x, y, geometry }, index) => {
    const rest = { x, y, z: 0, rx: 0, ry: 0 };
    const normalize = pose => Object.fromEntries(Object.entries(pose).map(([k, v]) => [k, v === 0 ? 0 : v]));
    assert.deepEqual(normalize(blockPose(index, x, y, ASSEMBLY_DURATION)), rest);
    assert.deepEqual(normalize(blockPose(index, x, y, 10, BURST_DURATION)), rest);
    assert.deepEqual(blockPose(index, x, y, 0.9), blockPose(index, x, y, 0.9));
    geometry.dispose();
  });
  model.solid.dispose();
});

test('desktop and phone camera frames contain the solid during complete horizontal rotation', () => {
  const model = createWordmarkGeometry();
  const group = new Group();
  group.rotation.order = 'YXZ';
  group.add(new Mesh(model.solid));
  for (const [width, height] of [[1440, 317], [390, 104], [320, 70], [844, 120], [1920, 380]]) {
    const view = cameraFrame(width, height);
    const camera = new OrthographicCamera(-view.width / 2, view.width / 2, view.height / 2, -view.height / 2, 0.1, 80);
    camera.position.set(0, 2, 30); camera.lookAt(0, -0.25, 0); camera.updateMatrixWorld();
    for (let angle = 0; angle <= Math.PI * 2; angle += Math.PI / 12) {
      group.rotation.set(REST_ROTATION.x, angle, 0); group.updateMatrixWorld(true);
      const positions = model.solid.getAttribute('position');
      for (let i = 0; i < positions.count; i += 3) {
        const p = new Vector3().fromBufferAttribute(positions, i).applyMatrix4(group.matrixWorld).project(camera);
        assert.ok(Math.abs(p.x) < 1 && Math.abs(p.y) < 1, `clipped at ${width}×${height}, angle ${angle}`);
      }
    }
  }
  model.solid.dispose(); model.blocks.forEach(block => block.geometry.dispose());
});
