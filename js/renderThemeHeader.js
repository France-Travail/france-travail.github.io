/* En-tête des pages de domaine : fil d'Ariane du DS (<ft-breadcrumb>), titre et
   description du domaine lus dans data/themes.json. */
async function loadThemeHeader() {
  const host = document.getElementById("theme-header");
  const container = document.querySelector("#projects-container[data-category]");
  if (!host || !container) return;

  const meta = window.projectTheme(container.dataset.category);
  const lang = window.getCurrentLanguage?.() || localStorage.getItem("lang") || "fr";
  const escape = window.ftUi.escape;

  try {
    const response = await fetch(withAssetVersion(lang === "en" ? "../data/themes-en.json" : "../data/themes.json"));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const themes = await response.json();
    const theme = themes.find((item) => item.slug === meta.slug);
    if (!theme) return;

    const crumbs = [
      { label: lang === "en" ? "Home" : "Accueil", href: "../index.html" },
      { label: "Catalogue", href: "../projets.html" },
      { label: theme.title },
    ].map((crumb) => ({ ...crumb, label: escape(crumb.label) }));

    host.className = `theme-page-header tone-${meta.tone}`;
    host.innerHTML = `
      <ft-breadcrumb links="${escape(JSON.stringify(crumbs))}"></ft-breadcrumb>
      <p class="eyebrow">${lang === "en" ? "Area" : "Domaine"}</p>
      <div class="theme-page-title">
        <span class="theme-icon" aria-hidden="true"><span class="icon icon-${meta.icon}"></span></span>
        <h1>${escape(theme.title)}</h1>
      </div>
      <p>${escape(theme.longDescription)}</p>`;
  } catch (error) {
    console.error("Erreur de chargement du thème", error);
  }
}

window.loadThemeHeader = loadThemeHeader;
document.addEventListener("DOMContentLoaded", loadThemeHeader);
