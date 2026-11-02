export function initInteractions() {
  document.querySelectorAll("[data-youtube-lazy]").forEach(function (root) {
    const videoId = root.getAttribute("data-youtube-id");
    const title = root.getAttribute("data-youtube-title") || "Project demonstration video";
    if (!videoId) {
      return;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "video-lazy-play";
    button.setAttribute("aria-label", title);

    const thumb = document.createElement("img");
    thumb.src = "https://i.ytimg.com/vi/" + videoId + "/hqdefault.jpg";
    thumb.alt = "";
    thumb.width = 480;
    thumb.height = 360;
    thumb.loading = "lazy";
    thumb.decoding = "async";
    button.appendChild(thumb);

    function loadPlayer() {
      if (root.querySelector("iframe")) {
        return;
      }
      const iframe = document.createElement("iframe");
      iframe.src =
        "https://www.youtube.com/embed/" +
        videoId +
        "?autoplay=1&rel=0";
      iframe.title = title;
      iframe.loading = "lazy";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      root.replaceChildren(iframe);
    }

    button.addEventListener("click", loadPlayer);
    root.appendChild(button);
  });

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
