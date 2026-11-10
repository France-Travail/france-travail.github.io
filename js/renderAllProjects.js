/* Catalogue : recherche, filtres par domaine, tri (fiche commune : js/projectLifecycle.js). */
const catalogueState = { projects: [], metrics: new Map(), contribution: null, category: "all", query: "", sort: "recent" };

function catalogueLang() {
  return window.getCurrentLanguage?.() || localStorage.getItem("lang") || "fr";
}

function normalizeText(value) {
  return String(value ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function repoName(repoUrl) {
  return repoUrl?.match(/github\.com\/[^/]+\/([^/#?]+)/i)?.[1] || "";
}

function formatCatalogueTimestamp(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(catalogueLang() === "en" ? "en-GB" : "fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function themeLabel(category, lang) {
  const theme = window.projectTheme(category);
  return theme[lang] || theme.fr;
}

function renderCatalogue() {
  const container = document.getElementById("projects-container");
  if (!container) return;
  const lang = catalogueLang();
  const query = normalizeText(catalogueState.query);

  const filtered = catalogueState.projects.filter((project) => {
    const inCategory = catalogueState.category === "all" || project.category === catalogueState.category;
    const haystack = normalizeText([project.name, project.description, project.category, themeLabel(project.category, lang), ...(project.tags || []), ...(project.maintainers || []), ...(project.variants || []).map((variant) => variant.label)].join(" "));
    return inCategory && (!query || haystack.includes(query));
  });

  filtered.sort((a, b) => {
    if (catalogueState.sort === "name") return a.name.localeCompare(b.name, lang);
    if (catalogueState.sort === "category") {
      return themeLabel(a.category, lang).localeCompare(themeLabel(b.category, lang), lang) || a.name.localeCompare(b.name, lang);
    }
    return String(b.lastUpdate || "").localeCompare(String(a.lastUpdate || ""));
  });

  const count = filtered.length;
  const countText = lang === "en" ? `${count} ${count === 1 ? "project" : "projects"}` : `${count} ${count === 1 ? "projet" : "projets"}`;
  document.getElementById("results-count").textContent = countText;
  const reset = `<p class="alert-content"><button class="btn btn-secondary btn-sm" type="button" data-catalogue-reset>${lang === "en" ? "Reset search and filters" : "Réinitialiser la recherche et les filtres"}</button></p>`;
  container.innerHTML = count
    ? filtered.map((project) => window.projectCardHtml(project, catalogueState.metrics.get(repoName(project.repo)), lang, catalogueState.contribution)).join("")
    : `<div class="empty-state">${window.ftUi.alert(
        "info",
        lang === "en" ? "No project found" : "Aucun projet trouvé",
        lang === "en" ? "Try another search or reset the filters." : "Essayez une autre recherche ou réinitialisez les filtres.",
        reset,
      )}</div>`;
}

async function loadCatalogueData() {
  const lang = catalogueLang();
  const container = document.getElementById("projects-container");
  if (container && !container.children.length) container.innerHTML = window.ftUi.loadingState(lang);
  try {
    const [projectResponse, metricResponse, contribution] = await Promise.all([
      fetch(withAssetVersion(lang === "en" ? "./data/projects-en.json" : "./data/projects.json")),
      fetch(withAssetVersion("./data/metrics_public.json")),
      window.ftContribution?.load("./") ?? null,
    ]);
    if (!projectResponse.ok || !metricResponse.ok) throw new Error("Données indisponibles");
    catalogueState.projects = await projectResponse.json();
    catalogueState.contribution = contribution;
    const metrics = await metricResponse.json();
    catalogueState.metrics = new Map((metrics.repositories || []).map((repo) => [repo.name, repo]));
    const freshness = document.getElementById("catalogue-freshness");
    if (freshness) {
      freshness.dateTime = metrics.collected_at || "";
      freshness.textContent = formatCatalogueTimestamp(metrics.collected_at);
    }
    const total = document.getElementById("catalogue-total");
    if (total) total.textContent = catalogueState.projects.length;
    renderCatalogue();
  } catch (error) {
    console.error("Erreur de chargement du catalogue", error);
    if (container) {
      container.innerHTML = `<div class="empty-state">${window.ftUi.alert(
        "error",
        lang === "en" ? "Catalogue unavailable" : "Catalogue indisponible",
        lang === "en" ? "Please try again in a few moments." : "Veuillez réessayer dans quelques instants.",
      )}</div>`;
    }
  }
}

function resetCatalogue() {
  const search = document.getElementById("project-search");
  catalogueState.query = "";
  catalogueState.category = "all";
  if (search) search.value = "";
  document.querySelectorAll(".filter-chip").forEach((chip) => chip.setAttribute("aria-pressed", String(chip.dataset.category === "all")));
  renderCatalogue();
  search?.focus();
}

function bindCatalogueControls() {
  const search = document.getElementById("project-search");
  const sort = document.getElementById("project-sort");
  const chips = document.querySelectorAll(".filter-chip");
  const container = document.getElementById("projects-container");
  if (!search || !sort) return;

  search.addEventListener("input", () => {
    catalogueState.query = search.value;
    renderCatalogue();
  });
  sort.addEventListener("change", () => {
    catalogueState.sort = sort.value;
    renderCatalogue();
  });
  chips.forEach((chip) => chip.addEventListener("click", () => {
    catalogueState.category = chip.dataset.category;
    chips.forEach((item) => item.setAttribute("aria-pressed", String(item === chip)));
    renderCatalogue();
  }));
  container?.addEventListener("click", (event) => {
    if (event.target.closest("[data-catalogue-reset]")) resetCatalogue();
  });
}

/* Guide de lecture : collapse du DS fermé par défaut, ouvert quand on arrive
   par un lien vers lui (accueil, étape « Lire l'état d'un projet »). */
async function openReadingGuideFromHash() {
  const guide = document.getElementById("reading-guide");
  const hash = window.location.hash.slice(1);
  const target = hash && document.getElementById(hash);
  if (!target || !guide?.contains(target)) return;
  // La directive doit être initialisée avant de pouvoir ouvrir le collapse.
  await window.ftAutoloader?.registerDirective?.("ft-collapse-directive.mjs").catch(() => null);
  const trigger = guide.querySelector("[data-ft-collapse]");
  if (trigger?.getAttribute("aria-expanded") === "false") trigger.click();
  trigger?.scrollIntoView({ block: "start" });
}

async function loadAllProjects() {
  await loadCatalogueData();
}

window.loadAllProjects = loadAllProjects;
document.addEventListener("DOMContentLoaded", () => {
  bindCatalogueControls();
  loadCatalogueData();
});
window.addEventListener("load", openReadingGuideFromHash);
window.addEventListener("hashchange", openReadingGuideFromHash);
