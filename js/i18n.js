const defaultLang = "fr";
let currentLang = localStorage.getItem("lang") || defaultLang;

async function loadLocale(lang) {
  const response = await fetch(`../locales/${lang}.json`);
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

async function initI18n() {
  const dict = await loadLocale(currentLang);
  applyTranslations(dict);

  const switcher = document.getElementById("lang-switch");
  if (switcher) {
    switcher.textContent = dict["lang_switch"];
    switcher.addEventListener("click", () => {
      const newLang = currentLang === "fr" ? "en" : "fr";
      localStorage.setItem("lang", newLang);
      location.reload();
    });
  }
}

document.addEventListener("DOMContentLoaded", initI18n);
