document.addEventListener("DOMContentLoaded", () => {
  const host = document.getElementById("custom-footer");
  if (!host) return;

  const inTheme = window.location.pathname.includes("/themes/");
  const base = inTheme ? ".." : ".";
  const year = new Date().getFullYear();
  // Sur l'accueil, l'ancre seule evite un rechargement complet de la page.
  // Ailleurs (mentions, catalogue, themes), il faut pointer vers index.html.
  const path = window.location.pathname;
  const onHome = path.endsWith("/") || path.endsWith("/index.html");
  const contributeHref = onHome ? "#contribuer" : `${base}/index.html#contribuer`;

  host.className = "site-footer";
  host.innerHTML = `
    <div class="shell footer-top">
      <div class="footer-brand">
        <img src="${base}/img/logos/logo-ft-negatif.png" alt="République française, France Travail" width="210">
        <p data-i18n="footer_description">Nous partageons des logiciels, ressources et pratiques numériques pour les rendre utiles au plus grand nombre.</p>
      </div>
      <div class="footer-column">
        <h2 data-i18n="footer_explore">Explorer</h2>
        <ul>
          <li><a href="${base}/projets.html" data-i18n="all_projects">Tous les projets</a></li>
          <li><a href="${base}/themes/accessibilite-inclusion.html" data-i18n="filter_accessibility">Accessibilité &amp; inclusion</a></li>
          <li><a href="${base}/themes/eco.html" data-i18n="filter_eco">Numérique responsable</a></li>
          <li><a href="${base}/themes/ia.html" data-i18n="filter_ai">IA &amp; données</a></li>
          <li><a href="${base}/themes/services-usagers.html" data-i18n="filter_services">Services aux usagers</a></li>
          <li><a href="${base}/themes/outils-equipes.html" data-i18n="filter_tools">Outils et pratiques pour les équipes</a></li>
        </ul>
      </div>
      <div class="footer-column">
        <h2 data-i18n="footer_participate">Participer</h2>
        <ul>
          <li><a href="${contributeHref}" data-i18n="contribute">Contribuer</a></li>
          <li><a href="https://github.com/France-Travail" target="_blank" rel="noopener">GitHub France Travail ↗</a></li>
          <li><a href="mailto:sioss.00006@francetravail.fr" data-i18n="contact_ospo">Contacter l’OSPO</a></li>
        </ul>
      </div>
      <div class="footer-column">
        <h2 data-i18n="footer_around">Autour de France Travail</h2>
        <ul>
          <li><a href="https://www.francetravail.fr" target="_blank" rel="noopener">francetravail.fr ↗</a></li>
          <li><a href="https://francetravail.io" target="_blank" rel="noopener">francetravail.io ↗</a></li>
          <li><a href="https://designsystem.francetravail.io" target="_blank" rel="noopener">Design System ↗</a></li>
        </ul>
      </div>
    </div>
    <div class="shell footer-bottom">
      <span>© ${year} France Travail · Open Source</span>
      <div class="footer-legal">
        <a href="${base}/mentions.html" data-i18n="legal_notice">Mentions et licences</a>
        <a href="https://github.com/France-Travail/france-travail.github.io" target="_blank" rel="noopener" data-i18n="source_code">Code source</a>
        <a href="mailto:sioss.00006@francetravail.fr">sioss.00006@francetravail.fr</a>
      </div>
    </div>`;
});
