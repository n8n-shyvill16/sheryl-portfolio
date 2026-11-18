document.documentElement.classList.add("js");

const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector(".primary-nav");

if (menuToggle && primaryNav) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    primaryNav.classList.toggle("is-open", !expanded);
  });

  primaryNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      menuToggle.setAttribute("aria-expanded", "false");
      primaryNav.classList.remove("is-open");
    }
  });
}

const currentPage = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".primary-nav a[href]").forEach((link) => {
  if (link.getAttribute("href") === currentPage) {
    link.setAttribute("aria-current", "page");
    link.closest(".nav-dropdown")?.classList.add("is-current");
  }
});

document.querySelectorAll("[data-year]").forEach((year) => {
  year.textContent = String(new Date().getFullYear());
});

const revealItems = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  revealItems.forEach((item) => item.classList.add("will-reveal"));
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
}

function createLightbox() {
  const dialog = document.createElement("dialog");
  dialog.className = "lightbox";
  dialog.setAttribute("aria-label", "Image preview");
  dialog.innerHTML = `
    <div class="lightbox-inner">
      <button class="lightbox-close" type="button" aria-label="Close image preview">&times;</button>
      <img alt="">
      <p class="lightbox-caption"></p>
    </div>`;
  document.body.append(dialog);
  const image = dialog.querySelector("img");
  const caption = dialog.querySelector(".lightbox-caption");
  dialog.querySelector(".lightbox-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-lightbox]");
    if (!trigger) return;
    const source = trigger.querySelector("img");
    if (!source) return;
    image.src = source.currentSrc || source.src;
    image.alt = source.alt || trigger.getAttribute("aria-label") || "Portfolio image preview";
    caption.textContent = trigger.dataset.caption || image.alt;
    dialog.showModal();
  });
}

if ("HTMLDialogElement" in window) createLightbox();

document.querySelectorAll(".video-frame video").forEach((video) => {
  video.addEventListener("play", () => video.closest(".video-frame")?.classList.add("is-playing"), { once: true });
});

function renderGallery(target, items, label, caption) {
  if (!target || !Array.isArray(items)) return;
  target.replaceChildren();
  items.forEach((src, index) => {
    const card = document.createElement("article");
    card.className = "gallery-item";

    const button = document.createElement("button");
    button.className = "work-image";
    button.type = "button";
    button.dataset.lightbox = "";
    button.dataset.caption = `${caption}, sample ${index + 1}`;
    button.setAttribute("aria-label", `Enlarge ${caption.toLowerCase()}, sample ${index + 1}`);

    const image = document.createElement("img");
    image.src = src;
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    button.append(image);

    const title = document.createElement("div");
    title.className = "gallery-caption";
    title.textContent = `${label} · ${String(index + 1).padStart(2, "0")}`;
    card.append(button, title);
    target.append(card);
  });
}

function renderVideos(target, items, title, description) {
  if (!target || !Array.isArray(items)) return;
  target.replaceChildren();
  items.forEach((item, index) => {
    const videoItem = typeof item === "string" ? { src: item } : item;
    const videoTitle = videoItem.title || `${title} · ${String(index + 1).padStart(2, "0")}`;
    const card = document.createElement("article");
    card.className = "video-card";

    const frame = document.createElement("div");
    frame.className = "video-frame";
    const video = document.createElement("video");
    video.controls = true;
    video.preload = "none";
    video.playsInline = true;
    video.setAttribute("aria-label", `${videoTitle} video`);
    const posterPath = videoItem.poster || "assets/images/brand/video-poster.svg";
    video.poster = posterPath;
    const source = document.createElement("source");
    source.src = location.hostname.endsWith("github.io") && videoItem.sourceUrl
      ? videoItem.sourceUrl
      : videoItem.src;
    source.type = videoItem.src.toLowerCase().endsWith(".webm") ? "video/webm" : "video/mp4";
    video.append(source);

    const poster = document.createElement("img");
    poster.className = "video-poster";
    poster.src = posterPath;
    poster.alt = "";
    poster.loading = "lazy";
    poster.decoding = "async";
    poster.setAttribute("aria-hidden", "true");

    const placeholder = document.createElement("button");
    placeholder.className = "video-placeholder";
    placeholder.type = "button";
    placeholder.setAttribute("aria-label", `Play ${videoTitle}`);
    placeholder.addEventListener("click", () => {
      video.play().catch((error) => {
        if (error.name === "AbortError" || error.name === "NotAllowedError") return;
        placeholder.dataset.error = "true";
        placeholder.textContent = "This video could not be played.";
        placeholder.setAttribute("aria-label", `Unable to play ${videoTitle}`);
      });
    });
    video.addEventListener("playing", () => frame.classList.add("is-playing"), { once: true });
    video.addEventListener("error", () => {
      placeholder.dataset.error = "true";
      placeholder.textContent = "This video could not be loaded.";
      placeholder.setAttribute("aria-label", `Unable to load ${videoTitle}`);
    }, { once: true });
    frame.append(video, poster, placeholder);

    const body = document.createElement("div");
    body.className = "video-card-body";
    const heading = document.createElement("h2");
    heading.textContent = videoTitle;
    const note = document.createElement("p");
    note.textContent = videoItem.description || description;
    body.append(heading, note);
    card.append(frame, body);
    target.append(card);
  });
}

const media = window.PORTFOLIO_MEDIA;
const imageGalleries = {
  "funnels-websites": ["funnelsWebsites", "Funnel & website design", "Funnel & website portfolio work"],
  "static-ads": ["staticAds", "Static ad & social design", "Static ad and social design portfolio work"]
};
const pageGallery = document.querySelector("[data-gallery]");
if (pageGallery && media?.images) {
  const configuration = imageGalleries[pageGallery.dataset.gallery];
  if (configuration) {
    const [key, label, caption] = configuration;
    const items = media.images[key] || [];
    renderGallery(pageGallery, items, label, caption);
    const count = document.querySelector("[data-gallery-count]");
    if (count) count.textContent = `${items.length} original portfolio images`;
  }
}

const videoGalleries = {
  reels: ["Short video / reel", "Original video sample"],
  calendar: ["Content calendar video", "Original content planning sample"],
  invitations: ["Video invitation", "Original invitation video"]
};
const videoGallery = document.querySelector("[data-video-gallery]");
if (videoGallery && media?.videos) {
  const configuration = videoGalleries[videoGallery.dataset.videoGallery];
  if (configuration) {
    const [title, description] = configuration;
    const allItems = media.videos[videoGallery.dataset.videoGallery] || [];
    const videoLimit = Number(videoGallery.dataset.videoLimit);
    const items = Number.isInteger(videoLimit) && videoLimit > 0
      ? allItems.slice(0, videoLimit)
      : allItems;
    renderVideos(videoGallery, items, title, description);
    const count = document.querySelector("[data-gallery-count]");
    if (count) count.textContent = `${items.length} original video samples`;
  }
}

const featuredGrid = document.querySelector("[data-featured-work]");
if (featuredGrid && media?.images) {
  const featured = [
    { title: "Divine Birthing: Healing the Womb", meta: "Featured · Book funnel", description: "A story-led book funnel centered on an author’s guide to healing and personal growth.", image: "assets/images/funnels-websites/6a4921461bf938e547f4114a.webp", href: "funnels-websites.html", action: "Explore the funnel gallery" },
    { title: "The Joy of Forgiveness", meta: "Featured · Book funnel", description: "A faith-led book funnel introducing the author’s work, its core themes, and the book.", image: "assets/images/funnels-websites/6960f0b02dd5fd3f854a3327.webp", href: "funnels-websites.html", action: "Explore the funnel gallery" },
    { title: "Quit Smoking for Good", meta: "Featured · Wellness funnel", description: "A focused wellness funnel presenting a quit-smoking program and its book offer.", image: "assets/images/funnels-websites/6960f08d65a0d7811b745fc0.webp", href: "funnels-websites.html", action: "Explore the funnel gallery" }
  ];

  featuredGrid.replaceChildren();
  featured.forEach((item) => {
    const card = document.createElement("article");
    card.className = "work-card";
    const imageButton = document.createElement("button");
    imageButton.className = "work-image";
    imageButton.type = "button";
    imageButton.dataset.lightbox = "";
    imageButton.dataset.caption = item.title;
    imageButton.setAttribute("aria-label", `Enlarge ${item.title}`);
    const image = document.createElement("img");
    image.src = item.image;
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    imageButton.append(image);

    const body = document.createElement("div");
    body.className = "work-card-body";
    const meta = document.createElement("div");
    meta.className = "work-meta";
    meta.textContent = item.meta;
    const heading = document.createElement("h3");
    heading.textContent = item.title;
    const text = document.createElement("p");
    text.textContent = item.description;
    const link = document.createElement("a");
    link.className = "text-link";
    link.href = item.href;
    link.textContent = item.action;
    if (item.external) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    body.append(meta, heading, text, link);
    card.append(imageButton, body);
    featuredGrid.append(card);
  });
}
