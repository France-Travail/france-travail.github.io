const defaultLang = "fr";
let currentLang = localStorage.getItem("lang") || defaultLang;

async function loadLocale(lang) {
  // Détecter le bon chemin selon l'emplacement de la page
  const isInThemesFolder = window.location.pathname.includes('/themes/');
  const basePath = isInThemesFolder ? '../' : './';
  const response = await fetch(`${basePath}local/${lang}.json`);
  return await response.json();
}

function applyTranslations(dict) {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (dict[key]) el.textContent = dict[key];
  });
  if (dict["title_home"]) {
    document.title = dict["title_home"];
  }
}

// Rendre la fonction globale
window.applyTranslations = applyTranslations;

async function initI18n() {
  const dict = await loadLocale(currentLang);
  applyTranslations(dict);

  const switcher = document.getElementById("lang-switch");
  if (switcher) {
    switcher.textContent = dict["lang_switch"];
    switcher.addEventListener("click", async () => {
      const newLang = currentLang === "fr" ? "en" : "fr";
      localStorage.setItem("lang", newLang);
      currentLang = newLang;
      
      // Recharger les traductions
      const newDict = await loadLocale(newLang);
      applyTranslations(newDict);
      
      // Recharger tous les contenus dynamiques
      await reloadAllDynamicContent();
    });
  }
}

async function reloadAllDynamicContent() {
  // Recharger les thèmes sur la page d'accueil
  if (document.getElementById("themes-grid")) {
    if (typeof window.loadThemes === 'function') {
      await window.loadThemes();
    }
  }
  
  // Recharger les projets sur les pages de thèmes
  if (document.getElementById("projects-container")) {
    if (typeof window.loadProjects === 'function') {
      await window.loadProjects();
    }
    // Recharger tous les projets sur la page "Tous les projets"
    if (typeof window.loadAllProjects === 'function') {
      await window.loadAllProjects();
    }
  }
  
  // Recharger les en-têtes de thèmes
  if (document.querySelector("#projects-container")) {
    if (typeof window.loadThemeHeader === 'function') {
      await window.loadThemeHeader();
    }
  }
  
  // Appliquer les traductions aux nouveaux éléments
  const currentLang = localStorage.getItem("lang") || "fr";
  const dict = await loadLocale(currentLang);
  applyTranslations(dict);
}

document.addEventListener("DOMContentLoaded", initI18n);
