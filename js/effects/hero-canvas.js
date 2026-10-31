import * as THREE from "../vendor/three.module.js";

const RADIUS = 1.15;
const HALF_WIDTH = 0.38;
const U_SEGMENTS = 100;
const V_SEGMENTS = 8;
const BOUND = 1.64;

function pushPoint(list, u, v) {
  const half = u * 0.5;
  const ring = RADIUS + v * Math.cos(half);
  list.push(ring * Math.cos(u), ring * Math.sin(u), v * Math.sin(half));
}

function createMobius() {
  const row = V_SEGMENTS + 1;
  const positions = [];
  const indices = [];

  for (let i = 0; i < U_SEGMENTS; i += 1) {
    const u = (i / U_SEGMENTS) * Math.PI * 2;
    for (let j = 0; j <= V_SEGMENTS; j += 1) {
      const v = -HALF_WIDTH + (j / V_SEGMENTS) * HALF_WIDTH * 2;
      pushPoint(positions, u, v);
    }
  }

  for (let i = 0; i < U_SEGMENTS; i += 1) {
    const reverse = i === U_SEGMENTS - 1;
    const next = (i + 1) % U_SEGMENTS;
    for (let j = 0; j < V_SEGMENTS; j += 1) {
      const a = i * row + j;
      const b = a + 1;
      const c = next * row + (reverse ? V_SEGMENTS - j : j);
      const d = next * row + (reverse ? V_SEGMENTS - j - 1 : j + 1);
      indices.push(a, c, b, b, c, d);
    }
  }

  const surface = new THREE.BufferGeometry();
  surface.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  surface.setIndex(indices);

  const grid = [];
  for (let i = 0; i < U_SEGMENTS; i += 1) {
    const u0 = (i / U_SEGMENTS) * Math.PI * 2;
    const u1 = ((i + 1) / U_SEGMENTS) * Math.PI * 2;
    pushPoint(grid, u0, -HALF_WIDTH);
    pushPoint(grid, u0, HALF_WIDTH);
    for (let j = 1; j < V_SEGMENTS; j += 1) {
      const v = -HALF_WIDTH + (j / V_SEGMENTS) * HALF_WIDTH * 2;
      pushPoint(grid, u0, v);
      pushPoint(grid, u1, v);
    }
  }

  const center = [];
  for (let i = 0; i < U_SEGMENTS; i += 1) {
    const u0 = (i / U_SEGMENTS) * Math.PI * 2;
    const u1 = ((i + 1) / U_SEGMENTS) * Math.PI * 2;
    pushPoint(center, u0, 0);
    pushPoint(center, u1, 0);
  }

  const edge = [];
  const edgeSteps = U_SEGMENTS * 2;
  for (let i = 0; i < edgeSteps; i += 1) {
    const u0 = (i / edgeSteps) * Math.PI * 4;
    const u1 = ((i + 1) / edgeSteps) * Math.PI * 4;
    pushPoint(edge, u0, HALF_WIDTH);
    pushPoint(edge, u1, HALF_WIDTH);
  }

  function lines(points, color) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    return new THREE.LineSegments(
      geometry,
      new THREE.LineBasicMaterial({ color: color })
    );
  }

  return {
    surface: surface,
    grid: lines(grid, 0xc8c2b6),
    center: lines(center, 0xb8f36b),
    edge: lines(edge, 0xff6b35)
  };
}

export function initHeroCanvas(canvas, options) {
  const reducedMotion = Boolean(options && options.reducedMotion);
  const frame = canvas.parentElement;
  if (!frame) {
    return null;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      premultipliedAlpha: false
    });
  } catch (error) {
    return null;
  }

  if (!renderer.getContext()) {
    renderer.dispose();
    return null;
  }

  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40);
  const parts = createMobius();
  const band = new THREE.Group();
  const pivot = new THREE.Group();

  const fill = new THREE.Mesh(
    parts.surface,
    new THREE.MeshBasicMaterial({
      color: 0xf3f0e9,
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );

  parts.edge.material.polygonOffset = true;
  parts.edge.material.polygonOffsetFactor = -2;
  parts.edge.material.polygonOffsetUnits = -2;

  band.add(fill, parts.grid, parts.center, parts.edge);
  band.rotation.x = 0.95;
  pivot.add(band);
  scene.add(pivot);

  let width = 0;
  let height = 0;
  let raf = 0;
  let running = false;
  let visible = true;
  let last = 0;
  let elapsed = 0;
  let yaw = reducedMotion ? 0.7 : 0;
  let pitch = 0.95;
  let spinY = 0;
  let spinX = 0;
  let dragging = false;
  let activeId = null;
  let gesture = null;
  let originX = 0;
  let originY = 0;
  let lastX = 0;
  let lastY = 0;
  let lastMove = 0;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function draw() {
    pivot.rotation.y = yaw;
    band.rotation.x = pitch;
    renderer.render(scene, camera);
  }

  function fit() {
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
    const distance = Math.max(BOUND / Math.sin(vFov / 2), BOUND / Math.sin(hFov / 2));
    camera.position.set(0, 0, distance * 1.12);
    camera.lookAt(0, 0, 0);
  }

  function resize() {
    const nextWidth = frame.clientWidth;
    const nextHeight = frame.clientHeight;
    if (nextWidth < 2 || nextHeight < 2) {
      return;
    }
    width = nextWidth;
    height = nextHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    fit();
    if (!running) {
      draw();
    }
  }

  function render(now) {
    if (!last) {
      last = now;
    }
    const delta = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!dragging && !reducedMotion) {
      elapsed += delta;
      spinY *= Math.pow(0.16, delta);
      spinX *= Math.pow(0.12, delta);
      if (Math.abs(spinY) < 0.01) {
        spinY = 0;
      }
      if (Math.abs(spinX) < 0.01) {
        spinX = 0;
      }
      yaw += (0.32 + spinY) * delta;
      pitch += spinX * delta;
      if (spinX === 0) {
        const rest = 0.95 + Math.sin(elapsed * 0.4) * 0.1;
        pitch += (rest - pitch) * Math.min(1, delta * 1.1);
      }
      pitch = clamp(pitch, 0.15, 1.75);
    }
    draw();
  }

  function applyDrag(dx, dy, dt) {
    const yawDelta = dx * ((Math.PI * 2) / Math.max(width, 1));
    const pitchDelta = dy * ((Math.PI * 0.55) / Math.max(height, 1));
    yaw += yawDelta;
    pitch = clamp(pitch + pitchDelta, 0.15, 1.75);
    if (!reducedMotion && dt > 0) {
      spinY = clamp(yawDelta / dt, -8, 8);
      spinX = clamp(pitchDelta / dt, -5, 5);
    }
  }

  function onPointerDown(event) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }
    if (activeId !== null) {
      return;
    }
    activeId = event.pointerId;
    originX = lastX = event.clientX;
    originY = lastY = event.clientY;
    lastMove = performance.now();
    spinX = 0;
    spinY = 0;
    if (event.pointerType === "touch") {
      gesture = "pending";
      return;
    }
    gesture = "spin";
    dragging = true;
    frame.classList.add("is-dragging");
    canvas.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event) {
    if (event.pointerId !== activeId || gesture === "scroll") {
      return;
    }
    const now = performance.now();
    const dt = Math.max(0.016, (now - lastMove) / 1000);
    if (gesture === "pending") {
      const travelX = Math.abs(event.clientX - originX);
      const travelY = Math.abs(event.clientY - originY);
      if (travelX < 8 && travelY < 8) {
        return;
      }
      if (travelY > travelX) {
        gesture = "scroll";
        activeId = null;
        return;
      }
      gesture = "spin";
      dragging = true;
      frame.classList.add("is-dragging");
      canvas.setPointerCapture(event.pointerId);
    }
    applyDrag(event.clientX - lastX, event.clientY - lastY, dt);
    lastX = event.clientX;
    lastY = event.clientY;
    lastMove = now;
    if (reducedMotion) {
      draw();
    } else if (!running) {
      start();
    }
  }

  function endDrag(event) {
    if (activeId === null || (event && event.pointerId !== activeId && gesture !== "scroll")) {
      return;
    }
    const wasDragging = dragging;
    dragging = false;
    activeId = null;
    gesture = null;
    frame.classList.remove("is-dragging");
    if (reducedMotion) {
      spinX = 0;
      spinY = 0;
      if (wasDragging) {
        draw();
      }
    }
  }

  function onKeyDown(event) {
    if (event.altKey || event.metaKey || event.ctrlKey) {
      return;
    }
    const step = event.shiftKey ? 0.2 : 0.08;
    if (event.key === "ArrowLeft") {
      yaw -= step;
    } else if (event.key === "ArrowRight") {
      yaw += step;
    } else if (event.key === "ArrowUp") {
      pitch = clamp(pitch - step, 0.15, 1.75);
    } else if (event.key === "ArrowDown") {
      pitch = clamp(pitch + step, 0.15, 1.75);
    } else {
      return;
    }
    event.preventDefault();
    spinX = 0;
    spinY = 0;
    if (reducedMotion || !running) {
      draw();
    }
  }

  function tick(now) {
    if (!running) {
      return;
    }
    render(now);
    raf = window.requestAnimationFrame(tick);
  }

  function start() {
    if (reducedMotion || document.hidden || !visible || running) {
      return;
    }
    running = true;
    last = 0;
    raf = window.requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    last = 0;
    if (raf) {
      window.cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  function onVisibility() {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  }

  const resizeObserver = new ResizeObserver(resize);
  const intersectionObserver = new IntersectionObserver(
    function (entries) {
      visible = entries.some(function (entry) {
        return entry.isIntersecting;
      });
      if (visible) {
        start();
      } else {
        stop();
      }
    },
    { threshold: 0.05 }
  );

  resize();
  draw();
  resizeObserver.observe(frame);
  intersectionObserver.observe(frame);
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("resize", resize);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);
  canvas.addEventListener("keydown", onKeyDown);
  start();

  return {
    destroy: function () {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", endDrag);
      canvas.removeEventListener("pointercancel", endDrag);
      canvas.removeEventListener("keydown", onKeyDown);
      band.traverse(function (node) {
        if (node.geometry) {
          node.geometry.dispose();
        }
        if (node.material) {
          node.material.dispose();
        }
      });
      renderer.dispose();
    }
  };
}
