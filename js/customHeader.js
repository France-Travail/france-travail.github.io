document.addEventListener("DOMContentLoaded", () => {
  const host = document.getElementById("custom-header");
  if (!host) return;

  const inTheme = window.location.pathname.includes("/themes/");
  const base = inTheme ? ".." : ".";
  const path = window.location.pathname;
  const page = path.endsWith("projets.html")
    ? "projects"
    : inTheme
      ? "themes"
      : "home";
  // Sur l'accueil, l'ancre seule evite un rechargement complet de la page.
  // Ailleurs (mentions, catalogue, themes), il faut pointer vers index.html.
  const onHome = path.endsWith("/") || path.endsWith("/index.html");
  const contributeHref = onHome ? "#contribuer" : `${base}/index.html#contribuer`;

  host.className = "site-header";
  host.innerHTML = `
    <div class="shell header-main">
      <div class="header-identity">
        <a class="header-logo" href="${base}/index.html" aria-label="France Travail Open Source, accueil">
          <img src="${base}/img/logos/logo-ft.png" alt="France Travail" width="186">
        </a>
        <div class="header-product">
          <strong>Open Source</strong>
          <span data-i18n="header_catalogue">Catalogue des communs numériques</span>
        </div>
      </div>

      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-navigation" aria-label="Ouvrir le menu">
        <i></i><i></i><i></i>
      </button>

      <div class="header-right" id="main-navigation">
        <nav aria-label="Navigation principale">
          <ul class="header-nav-list">
            <li><a class="header-nav-link" href="${base}/index.html" ${page === "home" ? 'aria-current="page"' : ""} data-i18n="home">Accueil</a></li>
            <li><a class="header-nav-link" href="${base}/projets.html" ${page === "projects" || page === "themes" ? 'aria-current="page"' : ""} data-i18n="explore">Explorer</a></li>
            <li><a class="header-nav-link" href="${contributeHref}" data-i18n="contribute">Contribuer</a></li>
          </ul>
        </nav>
        <div class="header-actions">
          <a class="header-github" href="https://github.com/France-Travail" target="_blank" rel="noopener">
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 .7a11.6 11.6 0 0 0-3.7 22.6c.6.1.8-.3.8-.6v-2.2c-3.4.7-4.1-1.4-4.1-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.2 1.9 1.2 1.1 1.9 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.6 11.6 0 0 0 12 .7Z"/></svg>
            <span>GitHub</span>
          </a>
          <button id="lang-switch" class="lang-switch" type="button" aria-label="Changer de langue">EN</button>
        </div>
      </div>
    </div>`;

  const toggle = host.querySelector(".menu-toggle");
  const menu = host.querySelector(".header-right");
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    toggle.setAttribute("aria-label", open ? "Ouvrir le menu" : "Fermer le menu");
    menu.classList.toggle("is-open", !open);
    document.body.classList.toggle("menu-open", !open);
  });

  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Ouvrir le menu");
    menu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  menu.addEventListener("click", (event) => {
    if (event.target.closest("a") && window.innerWidth <= 860) closeMenu();
  });

  // Échap referme le menu mobile et rend le focus au bouton qui l'a ouvert.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("is-open")) {
      closeMenu();
      toggle.focus();
    }
  });
});
