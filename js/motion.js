/* Mouvement : apparition des blocs au défilement, en-tête détaché du contenu,
   compteurs de l'accueil et bouton de retour en haut. Rien ne bouge si le
   visiteur a demandé à limiter les animations, et un bloc déjà à l'écran au
   chargement n'est jamais masqué puis réaffiché. */
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const REVEAL = [
    ".section-heading",
    ".featured-card",
    ".theme-card",
    ".ecosystem-card",
    ".contribution-steps > li",
    ".ospo-card",
    ".reading-guide",
    ".project-card",
    ".catalogue-cta",
    ".legal-page > section",
  ].join(",");
  // Conteneurs remplis après coup par les scripts de rendu.
  const DYNAMIC = ["#featured-projects", "#themes-grid", "#projects-container"];
  const STAGGER_MS = 70;
  const MAX_STAGGER = 5;
  const rendered = new WeakSet();

  function inViewport(element) {
    const rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
  }

  function settle(element, delay) {
    // Une fois apparu, le bloc rend la main à ses propres transitions (survol).
    window.setTimeout(() => {
      element.classList.remove("reveal", "reveal-quick", "is-visible");
      element.style.removeProperty("--reveal-delay");
    }, delay + 760);
  }

  const observer = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target)
          .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
        visible.forEach((element, index) => {
          observer.unobserve(element);
          const delay = Math.min(index, MAX_STAGGER) * (element.classList.contains("reveal-quick") ? 30 : STAGGER_MS);
          element.style.setProperty("--reveal-delay", `${delay}ms`);
          requestAnimationFrame(() => element.classList.add("is-visible"));
          settle(element, delay);
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 })
    : null;

  function prepare(element, { animateInView = false, quick = false } = {}) {
    if (!observer || element.dataset.motion) return;
    element.dataset.motion = "1";
    if (!animateInView && inViewport(element)) return;
    element.classList.add("reveal");
    if (quick) element.classList.add("reveal-quick");
    observer.observe(element);
  }

  function watchDynamic(container) {
    new MutationObserver((mutations) => {
      const quick = rendered.has(container);
      rendered.add(container);
      mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1 && node.matches(REVEAL)) prepare(node, { animateInView: true, quick });
      }));
    }).observe(container, { childList: true });
  }

  // Compteurs de l'accueil : une seule fois, quand la bande des chiffres est visible.
  let countedOnce = false;
  function countUp(grid) {
    if (countedOnce) return;
    const numbers = [...grid.querySelectorAll(".metric strong")].filter((node) => /^\d+$/.test(node.textContent.trim()));
    if (!numbers.length) return;
    countedOnce = true;
    grid.setAttribute("aria-busy", "true");
    const start = performance.now();
    const duration = 1100;
    const targets = numbers.map((node) => Number(node.textContent.trim()));
    const step = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 4;
      numbers.forEach((node, index) => { node.textContent = String(Math.round(targets[index] * eased)); });
      if (progress < 1) requestAnimationFrame(step);
      else grid.removeAttribute("aria-busy");
    };
    requestAnimationFrame(step);
  }

  function watchMetrics() {
    const grid = document.getElementById("stats-grid");
    if (!grid || reduceMotion || !("IntersectionObserver" in window)) return;
    const visibility = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        visibility.disconnect();
        grid.dataset.inView = "1";
        countUp(grid);
      }
    }, { threshold: 0.4 });
    visibility.observe(grid);
    new MutationObserver(() => { if (grid.dataset.inView) countUp(grid); }).observe(grid, { childList: true });
  }

  function createBackToTop() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-primary btn-lg btn-ratio-square back-to-top";
    button.innerHTML = '<span class="icon icon-chevron-u" aria-hidden="true"></span><span class="sr-only" data-i18n="back_to_top">Revenir en haut</span>';
    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      document.querySelector(".skip-link")?.focus({ preventScroll: true });
    });
    document.body.append(button);
    return button;
  }

  function watchScroll(backToTop) {
    const header = document.querySelector(".site-header");
    let ticking = false;
    const update = () => {
      ticking = false;
      header?.classList.toggle("is-scrolled", window.scrollY > 8);
      backToTop.classList.toggle("is-visible", window.scrollY > window.innerHeight * 1.2);
    };
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  document.addEventListener("DOMContentLoaded", () => {
    watchScroll(createBackToTop());
    if (reduceMotion) return;
    document.documentElement.classList.add("motion-ready");
    document.querySelectorAll(REVEAL).forEach((element) => prepare(element));
    DYNAMIC.forEach((selector) => {
      const container = document.querySelector(selector);
      if (container) watchDynamic(container);
    });
    watchMetrics();
  });
})();
