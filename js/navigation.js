export function initNavigation(root) {
  const toggle = root.querySelector("[data-nav-toggle]");
  const nav = root.querySelector("[data-nav]");
  if (!toggle || !nav) {
    return;
  }

  const mq = window.matchMedia("(min-width: 40em)");
  const focusableSelector = "a[href], button:not([disabled])";

  function setOpen(open) {
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    nav.classList.toggle("is-open", open);
    if (open) {
      const first = nav.querySelector(focusableSelector);
      if (first) {
        first.focus();
      }
    }
  }

  function isOpen() {
    return toggle.getAttribute("aria-expanded") === "true";
  }

  toggle.addEventListener("click", function () {
    setOpen(!isOpen());
  });

  root.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && isOpen() && !mq.matches) {
      setOpen(false);
      toggle.focus();
      return;
    }

    if (event.key !== "Tab" || !isOpen() || mq.matches) {
      return;
    }

    const items = [toggle].concat(Array.from(nav.querySelectorAll(focusableSelector)));
    if (!items.length) {
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  function onBreakpoint(event) {
    if (event.matches) {
      setOpen(false);
      nav.classList.remove("is-open");
    }
  }

  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", onBreakpoint);
  } else if (typeof mq.addListener === "function") {
    mq.addListener(onBreakpoint);
  }
}
