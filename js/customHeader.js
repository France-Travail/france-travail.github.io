document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("custom-header");
  if (!header) return;

  // Déterminer le chemin de base selon la page
  const path = window.location.pathname;
  const isInSubfolder = path.includes("/themes/");
  const basePath = isInSubfolder ? ".." : ".";

  header.innerHTML = `
    <nav class="ds-header">
      <div class="ds-header-container">
        <div class="ds-header-left">
          <a href="${basePath}/index.html" class="ds-header-logo" aria-label="Accueil France Travail Open Source">
            <img src="${basePath}/img/logos/logo-ft.png" alt="France Travail" height="48" />
          </a>
          <div class="ds-header-brand">
            <span class="ds-header-title">Open Source</span>
            <span class="ds-header-subtitle">Catalogue des projets</span>
          </div>
        </div>

        <div class="ds-header-right">
          <nav class="ds-header-nav" aria-label="Navigation principale">
            <ul class="ds-header-nav-list">
              <li>
                <a href="${basePath}/index.html" class="ds-header-nav-link" data-i18n="home">
                  Accueil
                </a>
              </li>
              <li>
                <a href="${basePath}/projets.html" class="ds-header-nav-link" data-i18n="projects">
                  Projets
                </a>
              </li>
            </ul>
          </nav>

          <div class="ds-header-actions">
            <button id="lang-switch" class="ds-lang-switch" type="button" aria-label="Changer de langue">
              EN
            </button>
          </div>
        </div>
      </div>
    </nav>
  `;
});
