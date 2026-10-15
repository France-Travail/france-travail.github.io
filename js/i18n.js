/* Version des donnees servies au navigateur. A bumper en meme temps que le ?v=
   des balises <script>/<link> et que la version de package.json : sans cela un
   visiteur deja venu garde en cache les anciens JSON apres une mise a jour. */
const ASSET_VERSION = "2.4.0";
function withAssetVersion(url) {
  return `${url}?v=${ASSET_VERSION}`;
}
window.withAssetVersion = withAssetVersion;

const defaultLang = "fr";
let currentLang = new URLSearchParams(window.location.search).get("lang") || localStorage.getItem("lang") || defaultLang;
if (!['fr', 'en'].includes(currentLang)) currentLang = defaultLang;

function localeBasePath() {
  return window.location.pathname.includes("/themes/") ? "../" : "./";
}

async function loadLocale(lang) {
  const response = await fetch(withAssetVersion(`${localeBasePath()}local/${lang}.json`));
  if (!response.ok) throw new Error(`Locale ${lang} indisponible`);
  return response.json();
}

function applyTranslations(dict) {
  document.documentElement.lang = currentLang;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = dict[element.dataset.i18n];
    if (value) element.textContent = value;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const value = dict[element.dataset.i18nPlaceholder];
    if (value) element.setAttribute("placeholder", value);
  });

  // Chaque page a sa propre cle de titre. Sans correspondance, on laisse
  // le <title> ecrit dans le HTML plutot que de retomber sur celui de l'accueil.
  const path = window.location.pathname;
  const titleKey = path.endsWith("projets.html")
    ? "title_projects"
    : path.endsWith("mentions.html")
      ? "title_mentions"
      : path.includes("/themes/")
        ? `title_${path.split("/").pop().replace(".html", "")}`
        : path.endsWith("/") || path.endsWith("/index.html")
          ? "title_home"
          : null;
  if (titleKey && dict[titleKey]) document.title = dict[titleKey];
}

async function reloadDynamicContent() {
  const loaders = [];
  if (typeof window.loadHome === "function" && document.getElementById("featured-projects")) loaders.push(window.loadHome());
  if (typeof window.loadAllProjects === "function" && document.getElementById("project-search")) loaders.push(window.loadAllProjects());
  if (typeof window.loadProjects === "function" && document.querySelector("#projects-container[data-category]")) loaders.push(window.loadProjects());
  if (typeof window.loadThemeHeader === "function" && document.querySelector("#projects-container[data-category]")) loaders.push(window.loadThemeHeader());
  await Promise.all(loaders);
}

async function initializeTranslations() {
  try {
    const dict = await loadLocale(currentLang);
    applyTranslations(dict);
    const switcher = document.getElementById("lang-switch");
    if (!switcher) return;
    switcher.textContent = currentLang === "fr" ? "EN" : "FR";
    switcher.setAttribute("aria-label", currentLang === "fr" ? "Afficher le site en anglais" : "Display the website in French");
    switcher.addEventListener("click", async () => {
      currentLang = currentLang === "fr" ? "en" : "fr";
      localStorage.setItem("lang", currentLang);
      const nextDict = await loadLocale(currentLang);
      applyTranslations(nextDict);
      switcher.textContent = currentLang === "fr" ? "EN" : "FR";
      switcher.setAttribute("aria-label", currentLang === "fr" ? "Afficher le site en anglais" : "Display the website in French");
      await reloadDynamicContent();
    });
  } catch (error) {
    console.error("Impossible de charger les traductions", error);
  }
}

window.applyTranslations = applyTranslations;
window.getCurrentLanguage = () => currentLang;
document.addEventListener("DOMContentLoaded", initializeTranslations);
