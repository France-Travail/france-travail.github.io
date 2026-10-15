const THEME_PAGE_META = {
  "accessibilite&inclusion": { slug: "accessibilite-inclusion", color: "#008ecf" },
  eco: { slug: "eco", color: "#fddc0b" },
  ia: { slug: "ia", color: "#e10211" },
  "services-usagers": { slug: "services-usagers", color: "#f29fc5" },
  "outils-equipes": { slug: "outils-equipes", color: "#283276" },
};

async function loadThemeHeader() {
  const host = document.getElementById("theme-header");
  const container = document.querySelector("#projects-container[data-category]");
  if (!host || !container) return;

  const category = container.dataset.category;
  const meta = THEME_PAGE_META[category] || { slug: category, color: "#008ecf" };
  const lang = window.getCurrentLanguage?.() || localStorage.getItem("lang") || "fr";

  try {
    const response = await fetch(withAssetVersion(lang === "en" ? "../data/themes-en.json" : "../data/themes.json"));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const themes = await response.json();
    const theme = themes.find((item) => item.slug === meta.slug);
    if (!theme) return;

    host.className = "theme-page-header";
    host.style.setProperty("--theme-color", meta.color);
    host.innerHTML = `
      <nav class="breadcrumbs" aria-label="${lang === "en" ? "Breadcrumb" : "Fil d’Ariane"}">
        <a href="../index.html">${lang === "en" ? "Home" : "Accueil"}</a><span aria-hidden="true">/</span>
        <a href="../projets.html">${lang === "en" ? "Catalogue" : "Catalogue"}</a><span aria-hidden="true">/</span>
        <span>${escapeThemeText(theme.title)}</span>
      </nav>
      <p class="eyebrow">${lang === "en" ? "Area" : "Domaine"}</p>
      <h1>${escapeThemeText(theme.title)}</h1>
      <p>${escapeThemeText(theme.longDescription)}</p>`;
  } catch (error) {
    console.error("Erreur de chargement du thème", error);
  }
}

function escapeThemeText(value) {
  const node = document.createElement("span");
  node.textContent = value ?? "";
  return node.innerHTML;
}

window.loadThemeHeader = loadThemeHeader;
document.addEventListener("DOMContentLoaded", loadThemeHeader);
