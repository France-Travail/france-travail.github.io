async function loadThemeHeader() {
  const main = document.querySelector("main");
  const container = document.querySelector("#projects-container");

  if (!main || !container) return;

  const category = container.dataset.category;
  if (!category) return;

  try {
    // Supprimer les anciens en-têtes de thème s'ils existent
    const existingHeaders = main.querySelectorAll('.theme-header-h1, .theme-header-p');
    existingHeaders.forEach(header => header.remove());

    // Déterminer la langue actuelle
    const currentLang = localStorage.getItem("lang") || "fr";
    const themesFile = currentLang === "en" ? "../data/themes-en.json" : "../data/themes.json";
    
    const res = await fetch(themesFile);
    const themes = await res.json();

    // Mapping des catégories vers les slugs
    const categoryToSlug = {
      "accessibilite&inclusion": "accessibilite-inclusion",
      "eco": "eco",
      "architecture": "architecture", 
      "si-plateforme": "si-plateforme",
      "ia": "ia"
    };
    
    const slug = categoryToSlug[category] || category;
    const theme = themes.find((t) => t.slug === slug);
    if (!theme) return;

    // Création du H1 avec image
    const h1 = document.createElement("h1");
    h1.className = "theme-header-h1"; // Classe pour identifier les éléments à supprimer
    h1.style.display = "flex";
    h1.style.alignItems = "center";
    h1.style.gap = "0.75rem";

    if (theme.icon) {
      const img = document.createElement("img");
      img.src = theme.icon;
      img.alt = `${theme.title} icon`;
      img.style.height = "32px";
      img.style.verticalAlign = "middle";
      h1.appendChild(img);
    }

    const span = document.createElement("span");
    span.textContent = theme.title;
    h1.appendChild(span);

    // Paragraphe description
    const p = document.createElement("p");
    p.className = "theme-header-p"; // Classe pour identifier les éléments à supprimer
    p.textContent = theme.longDescription;

    // Injecter dans le DOM
    main.insertBefore(h1, container);
    main.insertBefore(p, container);
  } catch (e) {
    console.error("Erreur de chargement des thèmes :", e);
  }
}

// Rendre la fonction globale
window.loadThemeHeader = loadThemeHeader;

document.addEventListener("DOMContentLoaded", loadThemeHeader);
