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
            <div class="theme-bubble" style="background: ${getThemeColor(theme.slug)};">
            </div>
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

// Fonction pour obtenir la couleur correspondante à chaque thème
function getThemeColor(slug) {
  const themeColors = {
    "accessibilite-inclusion": "#008ece",  // Bleu clair pour accessibilité
    "eco": "#ffe000",                      // Jaune pour éco-conception
    "ia": "#e1010e",                       // Rouge pour IA
    "architecture": "#283276",            // Bleu foncé pour architecture
    "si-plateforme": "#f29fc4"           // Rose pour SI plateforme
  };
  
  return themeColors[slug] || "#0053a4"; // Couleur par défaut
}

// Rendre la fonction globale
window.loadThemes = loadThemes;
window.getThemeColor = getThemeColor;

document.addEventListener("DOMContentLoaded", loadThemes);
