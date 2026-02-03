document.addEventListener("DOMContentLoaded", () => {
  const footer = document.getElementById("custom-footer");
  if (!footer) return;

  // Déterminer le chemin de base selon la page
  const path = window.location.pathname;
  const isInSubfolder = path.includes("/themes/");
  const basePath = isInSubfolder ? ".." : ".";

  const currentYear = new Date().getFullYear();

  footer.innerHTML = `
    <div class="ds-footer">
      <div class="ds-footer-top">
        <div class="ds-footer-logo">
          <img src="${basePath}/img/logos/logo-ft.png" alt="France Travail" height="48" />
        </div>
        <div class="ds-footer-description">
          <p data-i18n="footer_description">
            Catalogue des projets Open Source de France Travail pour l'innovation dans les services publics numériques.
          </p>
        </div>
      </div>

      <div class="ds-footer-links">
        <div class="ds-footer-links-section">
          <h3 class="ds-footer-links-title" data-i18n="footer_navigation">Navigation</h3>
          <ul class="ds-footer-links-list">
            <li><a href="${basePath}/index.html" class="ds-footer-link" data-i18n="home">Accueil</a></li>
            <li><a href="${basePath}/projets.html" class="ds-footer-link" data-i18n="projects">Projets</a></li>
          </ul>
        </div>
        <div class="ds-footer-links-section">
          <h3 class="ds-footer-links-title" data-i18n="footer_themes">Thèmes</h3>
          <ul class="ds-footer-links-list">
            <li><a href="${basePath}/themes/accessibilite-inclusion.html" class="ds-footer-link" data-i18n="theme_accessibility">Accessibilité & Inclusion</a></li>
            <li><a href="${basePath}/themes/eco.html" class="ds-footer-link" data-i18n="theme_eco">Éco-conception</a></li>
            <li><a href="${basePath}/themes/ia.html" class="ds-footer-link" data-i18n="theme_ia">Intelligence Artificielle</a></li>
            <li><a href="${basePath}/themes/architecture.html" class="ds-footer-link" data-i18n="theme_architecture">Architecture</a></li>
            <li><a href="${basePath}/themes/si-plateforme.html" class="ds-footer-link" data-i18n="theme_platform">SI Plateforme</a></li>
          </ul>
        </div>
        <div class="ds-footer-links-section">
          <h3 class="ds-footer-links-title" data-i18n="footer_external">Liens externes</h3>
          <ul class="ds-footer-links-list">
            <li>
              <a href="https://github.com/France-Travail" target="_blank" rel="noopener" class="ds-footer-link">
                <img src="${basePath}/img/icons/icon-github.png" alt="GitHub" class="ds-footer-icon" />
                GitHub
              </a>
            </li>
            <li>
              <a href="https://francetravail.io" target="_blank" rel="noopener" class="ds-footer-link">
                <img src="${basePath}/img/logos/icon-francetravail-io.svg" alt="FranceTravail.io" class="ds-footer-icon ds-footer-icon-color" />
                FranceTravail.io
              </a>
            </li>
            <li>
              <a href="https://www.francetravail.fr" target="_blank" rel="noopener" class="ds-footer-link">
                <img src="${basePath}/img/logos/logo-ft-only.png" alt="France Travail" class="ds-footer-icon ds-footer-icon-color" />
                France Travail
              </a>
            </li>
          </ul>
        </div>
        <div class="ds-footer-links-section">
          <h3 class="ds-footer-links-title" data-i18n="footer_contact">Contact</h3>
          <ul class="ds-footer-links-list">
            <li>
              <a href="mailto:sioss.00006@francetravail.fr" class="ds-footer-link">
                <img src="${basePath}/img/icons/icon-mail.svg" alt="Mail" class="ds-footer-icon" />
                sioss.00006@francetravail.fr
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="ds-footer-bottom">
        <div class="ds-footer-copyright">
          &copy; ${currentYear} France Travail — Open Source
        </div>
      </div>
    </div>
  `;
});
