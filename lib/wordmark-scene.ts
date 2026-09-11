import {
  Group, MathUtils, Mesh, OrthographicCamera, PlaneGeometry, Scene,
  ShaderMaterial, SRGBColorSpace, Vector3, WebGLRenderer,
} from "three";
import {
  LOGO_HEIGHT, LOGO_WIDTH, REST_ROTATION, WAVE, cameraFrame,
  createWordmarkGeometry, renderBudget,
} from "./wordmark-model";
import { createWordmarkMaterial } from "./wordmark-material";

type Options = {
  canvas: HTMLCanvasElement;
  container: HTMLElement;
  interaction: HTMLButtonElement;
  onReady: () => void;
  onError: () => void;
};

export function createWordmarkScene({ canvas, container, interaction, onReady, onError }: Options) {
  const mobile = matchMedia("(max-width: 767px), (pointer: coarse) and (max-width: 1020px)");
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  const scene = new Scene();
  const camera = new OrthographicCamera(-10, 10, 3, -3, 0.1, 80);
  camera.position.set(0, 2, 30);
  camera.lookAt(0, -0.25, 0);

  const geometry = createWordmarkGeometry();
  const material = createWordmarkMaterial();
  const logo = new Group();
  logo.rotation.order = "YXZ";
  logo.rotation.set(REST_ROTATION.x, REST_ROTATION.y, 0);
  scene.add(logo);
  // Both poses use one mesh. The solid removes subdivision seams at rest.
  const mark = new Mesh(geometry.animated, material);
  mark.frustumCulled = false; // The wave moves vertices on the GPU.
  logo.add(mark);

  // A tiny soft contact patch: no shadow map, environment bake or reflection target.
  const shadowGeometry = new PlaneGeometry(17, 0.5);
  const shadowMaterial = new ShaderMaterial({
    transparent: true, depthWrite: false,
    vertexShader: `varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `varying vec2 vUv;
      void main() {
        float soft = max(0.0, 1.0 - length((vUv - 0.5) * 2.0));
        gl_FragColor = vec4(0.0, 0.0, 0.0, soft * soft * 0.3);
      }`,
  });
  const shadow = new Mesh(shadowGeometry, shadowMaterial);
  shadow.position.set(0, -LOGO_HEIGHT / 2 - 0.14, -1);
  shadow.visible = !mobile.matches;
  scene.add(shadow);

  let disposed = false, failed = false, visible = true, ready = false;
  let frame = 0, last = 0, lastPaint = 0;
  let waveStart = -Infinity, interval = 1000 / 60;
  const target = { ...REST_ROTATION };
  let drag: { id: number; x: number; y: number; angleX: number; angleY: number; moved: boolean } | null = null;
  let ignoreClick = false;

  function stop() {
    cancelAnimationFrame(frame); frame = 0; last = 0;
  }
  function schedule() {
    if (disposed || failed || (!visible && ready) || document.hidden || frame) return;
    frame = requestAnimationFrame(paint);
  }
  function paint(now: number) {
    frame = 0;
    if (disposed || failed || (!visible && ready) || document.hidden) return;
    if (lastPaint && now - lastPaint < interval - 1) { schedule(); return; }
    lastPaint = now;
    const dt = Math.min((now - (last || now - interval)) / 1000, 0.05);
    last = now;
    const age = (now - waveStart) / 1000;
    const waving = age < WAVE.duration;
    material.uniforms.waveAge.value = waving ? age : WAVE.duration;
    mark.geometry = waving || !ready ? geometry.animated : geometry.solid;
    logo.rotation.x = MathUtils.damp(logo.rotation.x, target.x, 12, dt);
    logo.rotation.y = MathUtils.damp(logo.rotation.y, target.y, 12, dt);
    const settling = Math.abs(logo.rotation.x - target.x) + Math.abs(logo.rotation.y - target.y) > 0.0001;
    if (!settling) { logo.rotation.x = target.x; logo.rotation.y = target.y; }
    shadow.scale.x = Math.max(0.12, Math.abs(Math.cos(logo.rotation.y)));
    try {
      renderer.render(scene, camera);
      if (failed) return;
      // Upload both poses and compile the real shader before revealing the canvas.
      if (!ready) {
        mark.geometry = geometry.solid;
        renderer.render(scene, camera);
        if (failed) return;
        ready = true; onReady();
      }
    } catch { failed = true; stop(); onError(); return; }
    if (waving || settling) schedule();
    else last = 0;
  }
  function resize() {
    const { width, height } = container.getBoundingClientRect();
    const framing = cameraFrame(width, height);
    camera.left = -framing.width / 2; camera.right = framing.width / 2;
    camera.top = framing.height / 2; camera.bottom = -framing.height / 2;
    camera.updateProjectionMatrix();
    const budget = renderBudget(width, height, devicePixelRatio, mobile.matches);
    interval = budget.interval;
    renderer.setPixelRatio(budget.pixelRatio);
    renderer.setSize(Math.max(1, width), Math.max(1, height), false);
    shadow.visible = !mobile.matches;
    lastPaint = 0; schedule();
  }
  function move(event: PointerEvent) {
    if (drag?.id !== event.pointerId) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (Math.hypot(dx, dy) > 6) drag.moved = true;
    target.y = drag.angleY + dx / Math.max(160, container.clientWidth) * Math.PI * 2;
    target.x = MathUtils.clamp(drag.angleX + dy / Math.max(90, container.clientHeight) * 0.4, -0.3, 0.22);
    schedule();
  }
  function down(event: PointerEvent) {
    if (event.button !== 0 || !event.isPrimary) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, angleX: target.x, angleY: target.y, moved: false };
    ignoreClick = false;
    interaction.setPointerCapture(event.pointerId);
    interaction.dataset.dragging = "true";
  }
  function release(event?: PointerEvent) {
    if (event && drag && event.pointerId !== drag.id) return;
    if (drag) {
      const current = drag;
      ignoreClick = current.moved || event?.type === "pointercancel";
      drag = null;
      if (interaction.hasPointerCapture(current.id)) interaction.releasePointerCapture(current.id);
    }
    delete interaction.dataset.dragging;
  }
  function blur() { release(); }
  const near = new Vector3(), far = new Vector3();
  function activate(event: MouseEvent) {
    if (ignoreClick && event.detail !== 0) { ignoreClick = false; return; }
    const origin = material.uniforms.waveOrigin.value;
    origin.set(0, 0);
    if (event.detail !== 0) {
      const box = container.getBoundingClientRect();
      const x = (event.clientX - box.left) / Math.max(1, box.width) * 2 - 1;
      const y = 1 - (event.clientY - box.top) / Math.max(1, box.height) * 2;
      camera.updateMatrixWorld(); logo.updateMatrixWorld(true);
      logo.worldToLocal(near.set(x, y, -1).unproject(camera));
      logo.worldToLocal(far.set(x, y, 1).unproject(camera));
      const dz = far.z - near.z;
      if (Math.abs(dz) > 0.0001) {
        near.lerp(far, -near.z / dz);
        origin.set(MathUtils.clamp(near.x, -LOGO_WIDTH / 2, LOGO_WIDTH / 2),
          MathUtils.clamp(near.y, -LOGO_HEIGHT / 2, LOGO_HEIGHT / 2));
      }
    }
    waveStart = performance.now(); schedule();
  }
  function reset() {
    target.x = REST_ROTATION.x;
    target.y = logo.rotation.y + MathUtils.euclideanModulo(REST_ROTATION.y - logo.rotation.y + Math.PI, Math.PI * 2) - Math.PI;
    waveStart = -Infinity; schedule();
  }
  function keydown(event: KeyboardEvent) {
    if (event.key === "ArrowLeft") target.y -= Math.PI / 8;
    else if (event.key === "ArrowRight") target.y += Math.PI / 8;
    else if (event.key === "ArrowUp") target.x = Math.max(-0.3, target.x - 0.08);
    else if (event.key === "ArrowDown") target.x = Math.min(0.22, target.x + 0.08);
    else if (event.key === "Escape" || event.key.toLowerCase() === "r") reset();
    else return;
    event.preventDefault(); schedule();
  }
  function visibilityChanged() {
    if (document.hidden) { release(); stop(); } else schedule();
  }
  function contextLost(event: Event) {
    event.preventDefault(); failed = true; stop(); onError();
  }
  function contextRestored() {
    failed = false; ready = false; waveStart = -Infinity; resize();
  }
  renderer.debug.onShaderError = () => { failed = true; stop(); onError(); };
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible || !ready) schedule(); else { release(); stop(); }
  });
  intersection.observe(container);
  interaction.addEventListener("pointerdown", down);
  interaction.addEventListener("pointermove", move, { passive: true });
  interaction.addEventListener("pointerup", release);
  interaction.addEventListener("pointercancel", release);
  interaction.addEventListener("lostpointercapture", release);
  interaction.addEventListener("blur", blur);
  interaction.addEventListener("click", activate);
  interaction.addEventListener("dblclick", reset);
  interaction.addEventListener("keydown", keydown);
  canvas.addEventListener("webglcontextlost", contextLost);
  canvas.addEventListener("webglcontextrestored", contextRestored);
  document.addEventListener("visibilitychange", visibilityChanged);
  mobile.addEventListener("change", resize);
  canvas.dataset.renderer = "threejs";
  resize();

  return {
    playEntrance() {
      if (disposed || failed || !ready) return;
      material.uniforms.waveOrigin.value.set(-8.4, 0);
      waveStart = performance.now(); schedule();
    },
    dispose() {
      disposed = true; stop(); release(); observer.disconnect(); intersection.disconnect();
      interaction.removeEventListener("pointerdown", down);
      interaction.removeEventListener("pointermove", move);
      interaction.removeEventListener("pointerup", release);
      interaction.removeEventListener("pointercancel", release);
      interaction.removeEventListener("lostpointercapture", release);
      interaction.removeEventListener("blur", blur);
      interaction.removeEventListener("click", activate);
      interaction.removeEventListener("dblclick", reset);
      interaction.removeEventListener("keydown", keydown);
      canvas.removeEventListener("webglcontextlost", contextLost);
      canvas.removeEventListener("webglcontextrestored", contextRestored);
      document.removeEventListener("visibilitychange", visibilityChanged);
      mobile.removeEventListener("change", resize);
      geometry.solid.dispose(); geometry.animated.dispose(); material.dispose();
      shadowGeometry.dispose(); shadowMaterial.dispose();
      renderer.dispose();
      delete canvas.dataset.renderer;
    },
  };
}
