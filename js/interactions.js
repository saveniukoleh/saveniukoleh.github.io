export function initInteractions() {
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    const id = link.getAttribute("href").slice(1);
    if (!id) {
      return;
    }
    const target = document.getElementById(id);
    if (!target) {
      return;
    }
    link.addEventListener("click", function () {
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });
}
