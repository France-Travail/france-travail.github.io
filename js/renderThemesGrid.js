async function loadThemes() {
  const grid = document.getElementById("themes-grid");
  if (!grid) return;

  try {
    // Déterminer la langue actuelle
    const currentLang = localStorage.getItem("lang") || "fr";
    const themesFile = currentLang === "en" ? "./data/themes-en.json" : "./data/themes.json";
    
    const response = await fetch(themesFile);
    const themes = await response.json();

    grid.innerHTML = themes
      .map(
        (theme) => `
        <a class="theme-card" href="./themes/${theme.slug}.html">
          <div class="theme-icon-wrapper">
            <img src="${theme.icon}" alt="${theme.title} icon" class="theme-icon" />
          </div>
          <h2>${theme.title}</h2>
          <p>${theme.shortDescription}</p>
        </a>
      `
      )
      .join("");
  } catch (error) {
    console.error("Erreur lors du chargement des thèmes :", error);
    grid.innerHTML = "<p data-i18n='themes_load_error'>Impossible de charger les thèmes pour le moment.</p>";
  }
}

// Rendre la fonction globale
window.loadThemes = loadThemes;

document.addEventListener("DOMContentLoaded", loadThemes);
