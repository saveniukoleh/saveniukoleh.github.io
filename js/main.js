import { initNavigation } from "./navigation.js";
import { initInteractions } from "./interactions.js";
import { initHeroCanvas } from "./effects/hero-canvas.js";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

initNavigation(document);
initInteractions();

const canvas = document.querySelector("[data-hero-canvas]");
if (canvas) {
  const frame = canvas.closest(".hero-canvas-frame");
  const hero = initHeroCanvas(canvas, { reducedMotion: reducedMotion });
  if (hero && frame) {
    frame.classList.add("has-canvas");
  }
}
