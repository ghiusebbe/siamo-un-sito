import {
  Color, DirectionalLight, Group, HemisphereLight, MathUtils, Mesh,
  MeshStandardMaterial, OrthographicCamera, PCFSoftShadowMap, PlaneGeometry,
  PMREMGenerator, Scene, ShadowMaterial, SRGBColorSpace, WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { Reflector } from "three/addons/objects/Reflector.js";
import {
  ASSEMBLY_DURATION, BURST_DURATION, LOGO_HEIGHT, REST_ROTATION,
  blockPose, cameraFrame, createWordmarkGeometry,
} from "./wordmark-model";

type Options = {
  canvas: HTMLCanvasElement;
  container: HTMLElement;
  interaction: HTMLButtonElement;
  introDelay: number;
  onReady: () => void;
  onError: () => void;
};

export function createWordmarkScene({ canvas, container, interaction, introDelay, onReady, onError }: Options) {
  const mobile = matchMedia("(max-width: 767px), (pointer: coarse) and (max-width: 1020px)");
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  const scene = new Scene();
  const camera = new OrthographicCamera(-10, 10, 3, -3, 0.1, 80);
  camera.position.set(0, 2, 30);
  camera.lookAt(0, -0.25, 0);

  function makeEnvironment() {
    const environment = new RoomEnvironment();
    const pmrem = new PMREMGenerator(renderer);
    try {
      return pmrem.fromScene(environment, 0.04, 0.1, 100, { size: mobile.matches ? 64 : 128 });
    } finally { environment.dispose(); pmrem.dispose(); }
  }
  let environmentMap = makeEnvironment();
  scene.environment = environmentMap.texture;
  const front = new MeshStandardMaterial({ color: 0x151719, roughness: 0.3, metalness: 0.48, envMapIntensity: 0.8 });
  const side = new MeshStandardMaterial({ color: 0x747c83, roughness: 0.28, metalness: 0.82, envMapIntensity: 1.15 });
  const materials = [front, side];
  const geometry = createWordmarkGeometry();
  const logo = new Group();
  logo.rotation.order = "YXZ";
  logo.rotation.set(REST_ROTATION.x, REST_ROTATION.y, 0);
  scene.add(logo);
  const solid = new Mesh(geometry.solid, materials);
  solid.castShadow = true;
  logo.add(solid);
  const pieces = geometry.blocks.map(({ geometry: shape, x, y }) => {
    const mesh = new Mesh(shape, materials);
    mesh.position.set(x, y, 0);
    mesh.castShadow = true;
    logo.add(mesh);
    return mesh;
  });

  scene.add(new HemisphereLight(0xffffff, 0x656874, 2));
  const key = new DirectionalLight(0xffffff, 3.1);
  key.position.set(-4, 10, 8);
  key.castShadow = true;
  key.shadow.mapSize.setScalar(mobile.matches ? 512 : 1024);
  key.shadow.camera.left = -11;
  key.shadow.camera.right = 11;
  key.shadow.camera.top = 6;
  key.shadow.camera.bottom = -6;
  key.shadow.camera.near = 0.1;
  key.shadow.camera.far = 35;
  key.shadow.normalBias = 0.025;
  key.shadow.bias = -0.0001;
  scene.add(key);
  const rim = new DirectionalLight(0xe5eeff, 2.2);
  rim.position.set(7, 3, -6);
  scene.add(rim);

  const floorY = -LOGO_HEIGHT / 2 - 0.14;
  const shadowGeometry = new PlaneGeometry(70, 70);
  const shadowMaterial = new ShadowMaterial({ color: 0x20232a, opacity: 0.18, depthWrite: false });
  const shadow = new Mesh(shadowGeometry, shadowMaterial);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = floorY + 0.003;
  shadow.receiveShadow = true;
  scene.add(shadow);

  // A true mirrored camera render, faded into the site's own paper colour.
  // Mobile skips this second scene pass while keeping the same solid geometry.
  const paper = new Color(getComputedStyle(container).getPropertyValue("--white").trim() || "#f5f5f2");
  const reflection = new Reflector(new PlaneGeometry(70, 70), {
    color: paper, textureWidth: 768, textureHeight: 256, multisample: 0,
    shader: {
      name: "WordmarkFloor",
      uniforms: { color: { value: paper }, tDiffuse: { value: null }, textureMatrix: { value: null } },
      vertexShader: `uniform mat4 textureMatrix;
        varying vec4 vReflection; varying vec3 vFloor;
        void main() {
          vReflection = textureMatrix * vec4(position, 1.0); vFloor = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `uniform vec3 color; uniform sampler2D tDiffuse;
        varying vec4 vReflection; varying vec3 vFloor;
        void main() {
          vec4 reflected = texture2DProj(tDiffuse, vReflection);
          float fade = (1.0 - smoothstep(0.0, 3.0, -vFloor.y)) * 0.16;
          gl_FragColor = vec4(mix(color, reflected.rgb, fade * reflected.a), 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    },
  });
  reflection.rotation.x = -Math.PI / 2;
  reflection.position.y = floorY;
  reflection.visible = !mobile.matches;
  scene.add(reflection);

  let disposed = false, failed = false, visible = true, ready = false;
  let frame = 0, last = 0, lastPaint = 0;
  const start = performance.now() + introDelay;
  let burstStart = -Infinity;
  const target = { ...REST_ROTATION };
  const hover = { x: 0, y: 0 };
  let drag: { id: number; x: number; y: number; angleX: number; angleY: number; moved: boolean } | null = null;
  let ignoreClick = false;

  function stop() { cancelAnimationFrame(frame); frame = 0; last = 0; }
  function schedule() {
    if (!disposed && !failed && visible && !document.hidden && !frame) frame = requestAnimationFrame(paint);
  }
  function paint(now: number) {
    frame = 0;
    if (disposed || failed || !visible || document.hidden) return;
    const interval = 1000 / (mobile.matches ? 30 : 60);
    if (lastPaint && now - lastPaint < interval - 1) { schedule(); return; }
    lastPaint = now;
    const dt = Math.min((now - (last || now - interval)) / 1000, 0.05);
    last = now;
    const time = Math.max(0, (now - start) / 1000);
    const burstAge = (now - burstStart) / 1000;
    const assembling = time < ASSEMBLY_DURATION || burstAge < BURST_DURATION;
    solid.visible = !assembling;
    pieces.forEach((mesh, i) => {
      mesh.visible = assembling;
      if (!assembling) return;
      const { x, y } = geometry.blocks[i];
      const pose = blockPose(i, x, y, time, burstAge);
      mesh.position.set(pose.x, pose.y, pose.z);
      mesh.rotation.set(pose.rx, pose.ry, 0);
    });
    const tx = target.x + hover.x, ty = target.y + hover.y;
    logo.rotation.x = MathUtils.damp(logo.rotation.x, tx, 12, dt);
    logo.rotation.y = MathUtils.damp(logo.rotation.y, ty, 12, dt);
    const settling = Math.abs(logo.rotation.x - tx) + Math.abs(logo.rotation.y - ty) > 0.0001;
    if (!settling) { logo.rotation.x = tx; logo.rotation.y = ty; }
    try {
      renderer.render(scene, camera);
      if (!ready && now >= start) { ready = true; onReady(); }
    } catch { failed = true; stop(); onError(); return; }
    if (now < start || assembling || settling) schedule();
  }
  function resize() {
    const { width, height } = container.getBoundingClientRect();
    const framing = cameraFrame(width, height);
    camera.left = -framing.width / 2; camera.right = framing.width / 2;
    camera.top = framing.height / 2; camera.bottom = -framing.height / 2;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile.matches ? 1.25 : 2));
    renderer.setSize(Math.max(1, width), Math.max(1, height), false);
    reflection.visible = !mobile.matches;
    const shadowSize = mobile.matches ? 512 : 1024;
    if (key.shadow.mapSize.x !== shadowSize) {
      key.shadow.map?.dispose(); key.shadow.map = null; key.shadow.mapSize.setScalar(shadowSize);
    }
    lastPaint = 0; schedule();
  }
  function move(event: PointerEvent) {
    if (drag?.id === event.pointerId) {
      const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      if (Math.hypot(dx, dy) > 6) drag.moved = true;
      target.y = drag.angleY + dx / Math.max(160, container.clientWidth) * Math.PI * 2;
      target.x = MathUtils.clamp(drag.angleX + dy / Math.max(90, container.clientHeight) * 0.4, -0.3, 0.22);
    } else if (event.pointerType !== "touch") {
      const box = container.getBoundingClientRect();
      hover.y = ((event.clientX - box.left) / box.width - 0.5) * 0.16;
      hover.x = ((event.clientY - box.top) / box.height - 0.5) * 0.08;
    }
    schedule();
  }
  function down(event: PointerEvent) {
    if (event.button !== 0 || !event.isPrimary) return;
    hover.x = hover.y = 0;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, angleX: target.x, angleY: target.y, moved: false };
    ignoreClick = false;
    interaction.setPointerCapture(event.pointerId);
    interaction.dataset.dragging = "true";
  }
  function release(event?: PointerEvent) {
    if (event && drag && event.pointerId !== drag.id) return;
    if (drag) {
      const current = drag;
      ignoreClick = current.moved;
      drag = null;
      if (interaction.hasPointerCapture(current.id)) interaction.releasePointerCapture(current.id);
    }
    drag = null;
    delete interaction.dataset.dragging;
    hover.x = hover.y = 0;
    schedule();
  }
  function leave() { if (!drag) { hover.x = hover.y = 0; schedule(); } }
  function blur() { release(); }
  function activate(event: MouseEvent) {
    if (ignoreClick && event.detail !== 0) { ignoreClick = false; return; }
    burstStart = performance.now(); schedule();
  }
  function reset() {
    target.x = REST_ROTATION.x;
    // Return along the shortest arc, including after several complete turns.
    target.y = logo.rotation.y + MathUtils.euclideanModulo(REST_ROTATION.y - logo.rotation.y + Math.PI, Math.PI * 2) - Math.PI;
    hover.x = hover.y = 0; schedule();
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
    try {
      // Render-target contents are lost with the context: bake the lighting again.
      environmentMap.dispose();
      environmentMap = makeEnvironment();
      scene.environment = environmentMap.texture;
      failed = false; ready = false; resize();
    } catch { failed = true; onError(); }
  }
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) schedule(); else { release(); stop(); }
  });
  intersection.observe(container);
  interaction.addEventListener("pointerdown", down);
  interaction.addEventListener("pointermove", move, { passive: true });
  interaction.addEventListener("pointerup", release);
  interaction.addEventListener("pointercancel", release);
  interaction.addEventListener("lostpointercapture", release);
  interaction.addEventListener("pointerleave", leave);
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
    dispose() {
      disposed = true; stop(); release(); observer.disconnect(); intersection.disconnect();
      interaction.removeEventListener("pointerdown", down);
      interaction.removeEventListener("pointermove", move);
      interaction.removeEventListener("pointerup", release);
      interaction.removeEventListener("pointercancel", release);
      interaction.removeEventListener("lostpointercapture", release);
      interaction.removeEventListener("pointerleave", leave);
      interaction.removeEventListener("blur", blur);
      interaction.removeEventListener("click", activate);
      interaction.removeEventListener("dblclick", reset);
      interaction.removeEventListener("keydown", keydown);
      canvas.removeEventListener("webglcontextlost", contextLost);
      canvas.removeEventListener("webglcontextrestored", contextRestored);
      document.removeEventListener("visibilitychange", visibilityChanged);
      mobile.removeEventListener("change", resize);
      geometry.solid.dispose(); geometry.blocks.forEach(block => block.geometry.dispose());
      front.dispose(); side.dispose(); shadowGeometry.dispose(); shadowMaterial.dispose();
      reflection.geometry.dispose(); reflection.dispose(); environmentMap.dispose(); key.shadow.dispose();
      // Keep the canvas context reusable when reduced motion is toggled.
      renderer.dispose();
      delete canvas.dataset.renderer;
    },
  };
}
