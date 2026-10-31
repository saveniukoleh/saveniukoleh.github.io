import { initNavigation } from "./navigation.js";
import { initInteractions } from "./interactions.js";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

initNavigation(document);
initInteractions();

const year = String(new Date().getFullYear());
document.querySelectorAll("[data-copyright-year]").forEach(function (node) {
  node.textContent = year;
});

const canvas = document.querySelector("[data-hero-canvas]");
if (canvas) {
  const frame = canvas.closest(".hero-canvas-frame");
  import("./effects/hero-canvas.js")
    .then(function (mod) {
      const hero = mod.initHeroCanvas(canvas, { reducedMotion: reducedMotion });
      if (hero && frame) {
        frame.classList.add("has-canvas");
      }
    })
    .catch(function () {
      /* The CSS fallback stays visible when WebGL cannot start. */
    });
}
