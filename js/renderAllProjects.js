const CATALOGUE_THEMES = {
  "accessibilite&inclusion": { color: "#008ecf", fr: "Accessibilité & inclusion", en: "Accessibility & inclusion" },
  eco: { color: "#fddc0b", fr: "Numérique responsable", en: "Responsible digital" },
  ia: { color: "#e10211", fr: "IA & données", en: "AI & data" },
  "services-usagers": { color: "#f29fc5", fr: "Services aux usagers", en: "Services for users" },
  "outils-equipes": { color: "#283276", fr: "Outils et pratiques pour les équipes", en: "Tools and practices for teams" },
};

const catalogueState = { projects: [], metrics: new Map(), contribution: null, category: "all", query: "", sort: "recent" };

function catalogueLang() {
  return window.getCurrentLanguage?.() || localStorage.getItem("lang") || "fr";
}

function escapeHtml(value) {
  const node = document.createElement("span");
  node.textContent = value ?? "";
  return node.innerHTML;
}

function normalizeText(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function repoName(repoUrl) {
  return repoUrl?.match(/github\.com\/[^/]+\/([^/#?]+)/i)?.[1] || "";
}

function formatCatalogueDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(catalogueLang() === "en" ? "en-GB" : "fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function formatCatalogueTimestamp(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(catalogueLang() === "en" ? "en-GB" : "fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function projectCard(project) {
  const lang = catalogueLang();
  const theme = CATALOGUE_THEMES[project.category] || { color: "#008ecf", fr: project.category, en: project.category };
  const metric = catalogueState.metrics.get(repoName(project.repo)) || {};
  const pagesUrl = metric.pages_url || null;
  const lifecycle = window.getProjectLifecycle?.(project) || "maintained";
  const inProgress = lifecycle === "opening";
  const labels = lang === "en"
    ? { update: "Updated", maintainer: "Maintainer", github: "View code", site: "View website", license: "Licence", documentation: "Documentation", readme: "Repository README", siteReadme: "Website + README", variants: "Variants" }
    : { update: "Mise à jour", maintainer: "Mainteneur", github: "Voir le code", site: "Voir le site", license: "Licence", documentation: "Documentation", readme: "README du dépôt", siteReadme: "Site + README", variants: "Déclinaisons" };
  const tags = (project.tags || []).slice(0, 4);
  const statusLabel = window.projectLifecycleLabel?.(lifecycle, lang) || lifecycle;
  // GitHub renvoie NOASSERTION quand un fichier de licence existe sans être reconnu.
  const license = metric.license === "NOASSERTION"
    ? (lang === "en" ? "Not detected" : "Non détectée")
    : metric.license || (lang === "en" ? "Not specified" : "Non renseignée");

  return `
    <article class="project-card" style="--theme-color:${theme.color}">
      <div class="project-card-top">
        <span class="category-label">${escapeHtml(theme[lang] || theme.fr)}</span>
        <span class="project-status project-status-${escapeHtml(lifecycle)}">${escapeHtml(statusLabel)}</span>
      </div>
      <h3>${escapeHtml(project.name)}</h3>
      <p class="project-description">${escapeHtml(project.description || (lang === "en" ? "Description coming soon." : "Description à venir."))}</p>
      ${tags.length ? `<div class="project-tags">${tags.map((tag) => `<span class="project-tag">${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
      ${project.variants?.length ? `<div class="project-variants"><span>${labels.variants}</span>${project.variants.map((variant) => `<a href="${escapeHtml(variant.repo)}" target="_blank" rel="noopener">${escapeHtml(variant.label)}</a>`).join("")}</div>` : ""}
      <div class="project-details">
        <div class="project-detail"><span>${labels.update}</span><strong>${escapeHtml(formatCatalogueDate(project.lastUpdate))}</strong></div>
        <div class="project-detail"><span>${labels.license}</span><strong>${escapeHtml(license)}</strong></div>
        <div class="project-detail"><span>${labels.documentation}</span><strong>${escapeHtml(pagesUrl ? labels.siteReadme : labels.readme)}</strong></div>
        ${project.maintainers?.length ? `<div class="project-detail"><span>${labels.maintainer}</span><strong>${escapeHtml(project.maintainers.join(", "))}</strong></div>` : ""}
      </div>
      ${window.ftContribution?.render(project, catalogueState.contribution, lang, lifecycle) || ""}
      <div class="project-actions">
        ${!project.inProgress && project.repo ? `<a class="button button-primary" href="${escapeHtml(project.repo)}" target="_blank" rel="noopener"><span>${labels.github}</span><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"/></svg></a>` : ""}
        ${pagesUrl ? `<a class="button button-secondary" href="${escapeHtml(pagesUrl)}" target="_blank" rel="noopener"><span>${labels.site}</span><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"/></svg></a>` : ""}
      </div>
    </article>`;
}

function renderCatalogue() {
  const container = document.getElementById("projects-container");
  if (!container) return;
  const lang = catalogueLang();
  const query = normalizeText(catalogueState.query);

  const filtered = catalogueState.projects.filter((project) => {
    const inCategory = catalogueState.category === "all" || project.category === catalogueState.category;
    const haystack = normalizeText([project.name, project.description, project.category, ...(project.tags || []), ...(project.maintainers || []), ...(project.variants || []).map((variant) => variant.label)].join(" "));
    return inCategory && (!query || haystack.includes(query));
  });

  filtered.sort((a, b) => {
    if (catalogueState.sort === "name") return a.name.localeCompare(b.name, lang);
    if (catalogueState.sort === "category") {
      const categoryOrder = (CATALOGUE_THEMES[a.category]?.[lang] || a.category).localeCompare(CATALOGUE_THEMES[b.category]?.[lang] || b.category, lang);
      return categoryOrder || a.name.localeCompare(b.name, lang);
    }
    return String(b.lastUpdate || "").localeCompare(String(a.lastUpdate || ""));
  });

  const count = filtered.length;
  const countText = lang === "en" ? `${count} ${count === 1 ? "project" : "projects"}` : `${count} ${count === 1 ? "projet" : "projets"}`;
  document.getElementById("results-count").textContent = countText;
  container.innerHTML = count
    ? filtered.map(projectCard).join("")
    : `<div class="empty-state"><h3>${lang === "en" ? "No project found" : "Aucun projet trouvé"}</h3><p>${lang === "en" ? "Try another search or reset the filters." : "Essayez une autre recherche ou réinitialisez les filtres."}</p></div>`;
}

async function loadCatalogueData() {
  const lang = catalogueLang();
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
    const container = document.getElementById("projects-container");
    if (container) container.innerHTML = `<div class="empty-state"><h3>Catalogue indisponible</h3><p>Veuillez réessayer dans quelques instants.</p></div>`;
  }
}

function bindCatalogueControls() {
  const search = document.getElementById("project-search");
  const sort = document.getElementById("project-sort");
  const chips = document.querySelectorAll(".filter-chip");
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
}

async function loadAllProjects() {
  await loadCatalogueData();
}

window.loadAllProjects = loadAllProjects;
document.addEventListener("DOMContentLoaded", () => {
  bindCatalogueControls();
  loadCatalogueData();
});
