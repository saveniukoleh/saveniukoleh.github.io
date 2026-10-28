const ACCENT = { r: 255, g: 107, b: 53 };
const LIME = { r: 184, g: 243, b: 107 };
const INK = { r: 243, g: 240, b: 233 };

function mix(a, b, t) {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t
  };
}

function rgba(c, a) {
  return "rgba(" + (c.r | 0) + "," + (c.g | 0) + "," + (c.b | 0) + "," + a + ")";
}

export function initHeroCanvas(canvas, options) {
  const reducedMotion = Boolean(options && options.reducedMotion);
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    return null;
  }

  const pointer = { x: 0.62, y: 0.42, active: false };
  let width = 0;
  let height = 0;
  let dpr = 1;
  let raf = 0;
  let running = false;
  let cols = 0;
  let rows = 0;
  const gap = 22;
  const time0 = performance.now();

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, Math.max(rect.height, canvas.parentElement ? canvas.parentElement.clientHeight : 0));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(width / gap) + 1;
    rows = Math.ceil(height / gap) + 1;
  }

  function draw(now) {
    const t = reducedMotion ? 0 : (now - time0) * 0.00035;
    ctx.clearRect(0, 0, width, height);

    const px = pointer.x * width;
    const py = pointer.y * height;
    const influence = pointer.active ? 160 : 110;

    ctx.lineWidth = 1;
    ctx.lineCap = "square";

    for (let j = 0; j < rows; j += 1) {
      for (let i = 0; i < cols; i += 1) {
        const x = i * gap;
        const y = j * gap;
        const dx = px - x;
        const dy = py - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const falloff = Math.max(0, 1 - dist / influence);
        const angle =
          Math.sin(x * 0.018 + t) * 0.55 +
          Math.cos(y * 0.02 - t * 0.8) * 0.45 +
          Math.atan2(dy, dx) * falloff * 0.9;
        const len = 8 + falloff * 12;
        const x2 = x + Math.cos(angle) * len;
        const y2 = y + Math.sin(angle) * len;
        const tone = mix(INK, falloff > 0.45 ? ACCENT : LIME, falloff);
        ctx.strokeStyle = rgba(tone, 0.28 + falloff * 0.55);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }

    ctx.beginPath();
    ctx.strokeStyle = rgba(ACCENT, 0.35);
    ctx.arc(px, py, 18, 0, Math.PI * 2);
    ctx.stroke();
  }

  function tick(now) {
    if (!running) {
      return;
    }
    draw(now);
    raf = window.requestAnimationFrame(tick);
  }

  function start() {
    if (reducedMotion || document.hidden || running) {
      if (reducedMotion) {
        draw(time0);
      }
      return;
    }
    running = true;
    raf = window.requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
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

  function setPointer(event, active) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return;
    }
    pointer.x = (event.clientX - rect.left) / rect.width;
    pointer.y = (event.clientY - rect.top) / rect.height;
    pointer.active = active;
    if (reducedMotion) {
      draw(time0);
    }
  }

  function onPointerMove(event) {
    setPointer(event, true);
  }

  function onPointerLeave() {
    pointer.active = false;
  }

  const observer = new ResizeObserver(function () {
    resize();
    if (reducedMotion || !running) {
      draw(performance.now());
    }
  });

  resize();
  draw(time0);
  observer.observe(canvas.parentElement || canvas);
  canvas.addEventListener("pointermove", onPointerMove, { passive: true });
  canvas.addEventListener("pointerdown", onPointerMove, { passive: true });
  canvas.addEventListener("pointerleave", onPointerLeave);
  document.addEventListener("visibilitychange", onVisibility);
  start();

  return {
    destroy: function () {
      stop();
      observer.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    }
  };
}
