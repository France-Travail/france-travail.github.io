const THEME_CARD_META = {
  "accessibilite&inclusion": { color: "#008ecf", fr: "Accessibilité & inclusion", en: "Accessibility & inclusion" },
  eco: { color: "#fddc0b", fr: "Numérique responsable", en: "Responsible digital" },
  ia: { color: "#e10211", fr: "IA & données", en: "AI & data" },
  "services-usagers": { color: "#f29fc5", fr: "Services aux usagers", en: "Services for users" },
  "outils-equipes": { color: "#283276", fr: "Outils et pratiques pour les équipes", en: "Tools and practices for teams" },
};

function escapeProjectText(value) {
  const node = document.createElement("span");
  node.textContent = value ?? "";
  return node.innerHTML;
}

function themeRepoName(url) {
  return url?.match(/github\.com\/[^/]+\/([^/#?]+)/i)?.[1] || "";
}

function themeFormatDate(value, lang) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

function renderThemeProjectCard(project, metrics, lang, contribution) {
  const theme = THEME_CARD_META[project.category] || { color: "#008ecf", fr: project.category, en: project.category };
  const repoMetric = metrics.get(themeRepoName(project.repo)) || {};
  // Meme etat de cycle de vie que le catalogue et l'accueil : une page de
  // domaine ne doit pas annoncer "Actif" un projet affiche "Archive" ailleurs.
  const lifecycle = window.getProjectLifecycle?.(project) || "maintained";
  const statusLabel = window.projectLifecycleLabel?.(lifecycle, lang) || lifecycle;
  const labels = lang === "en"
    ? { update: "Updated", maintainer: "Maintainer", github: "View code", site: "View website", license: "Licence", documentation: "Documentation", readme: "Repository README", siteReadme: "Website + README", noLicense: "Not specified", undetectedLicense: "Not detected", variants: "Variants" }
    : { update: "Mise à jour", maintainer: "Mainteneur", github: "Voir le code", site: "Voir le site", license: "Licence", documentation: "Documentation", readme: "README du dépôt", siteReadme: "Site + README", noLicense: "Non renseignée", undetectedLicense: "Non détectée", variants: "Déclinaisons" };
  return `
    <article class="project-card" style="--theme-color:${theme.color}">
      <div class="project-card-top">
        <span class="category-label">${escapeProjectText(theme[lang] || theme.fr)}</span>
        <span class="project-status project-status-${lifecycle}">${escapeProjectText(statusLabel)}</span>
      </div>
      <h3>${escapeProjectText(project.name)}</h3>
      <p class="project-description">${escapeProjectText(project.description || (lang === "en" ? "Description coming soon." : "Description à venir."))}</p>
      ${project.tags?.length ? `<div class="project-tags">${project.tags.slice(0, 4).map((tag) => `<span class="project-tag">${escapeProjectText(tag)}</span>`).join("")}</div>` : ""}
      ${project.variants?.length ? `<div class="project-variants"><span>${labels.variants}</span>${project.variants.map((variant) => `<a href="${escapeProjectText(variant.repo)}" target="_blank" rel="noopener">${escapeProjectText(variant.label)}</a>`).join("")}</div>` : ""}
      <div class="project-details">
        <div class="project-detail"><span>${labels.update}</span><strong>${escapeProjectText(themeFormatDate(project.lastUpdate, lang))}</strong></div>
        <div class="project-detail"><span>${labels.license}</span><strong>${escapeProjectText(repoMetric.license === "NOASSERTION" ? labels.undetectedLicense : repoMetric.license || labels.noLicense)}</strong></div>
        <div class="project-detail"><span>${labels.documentation}</span><strong>${escapeProjectText(repoMetric.pages_url ? labels.siteReadme : labels.readme)}</strong></div>
        ${project.maintainers?.length ? `<div class="project-detail"><span>${labels.maintainer}</span><strong>${escapeProjectText(project.maintainers.join(", "))}</strong></div>` : ""}
      </div>
      ${window.ftContribution?.render(project, contribution, lang, lifecycle) || ""}
      <div class="project-actions">
        ${!project.inProgress && project.repo ? `<a class="button button-primary" href="${escapeProjectText(project.repo)}" target="_blank" rel="noopener"><span>${labels.github}</span><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"/></svg></a>` : ""}
        ${repoMetric.pages_url ? `<a class="button button-secondary" href="${escapeProjectText(repoMetric.pages_url)}" target="_blank" rel="noopener"><span>${labels.site}</span><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"/></svg></a>` : ""}
      </div>
    </article>`;
}

async function loadProjects() {
  const container = document.querySelector("#projects-container[data-category]");
  if (!container) return;
  const lang = window.getCurrentLanguage?.() || localStorage.getItem("lang") || "fr";

  try {
    const [projectResponse, metricResponse, contribution] = await Promise.all([
      fetch(withAssetVersion(lang === "en" ? "../data/projects-en.json" : "../data/projects.json")),
      fetch(withAssetVersion("../data/metrics_public.json")),
      window.ftContribution?.load("../") ?? null,
    ]);
    if (!projectResponse.ok || !metricResponse.ok) throw new Error("Données indisponibles");
    const [projects, metricData] = await Promise.all([projectResponse.json(), metricResponse.json()]);
    // Les projets vivants d'abord, puis du plus récent au plus ancien : un domaine
    // ne doit pas s'ouvrir sur des dépôts archivés.
    const lifecycleRank = { active: 0, transition: 1, maintained: 2, opening: 3, archived: 4 };
    const rank = (project) => lifecycleRank[window.getProjectLifecycle?.(project)] ?? 2;
    const filtered = projects
      .filter((project) => project.category === container.dataset.category)
      .sort((a, b) => rank(a) - rank(b) || String(b.lastUpdate || "").localeCompare(String(a.lastUpdate || "")));
    const metrics = new Map((metricData.repositories || []).map((repo) => [repo.name, repo]));
    container.innerHTML = filtered.length
      ? filtered.map((project) => renderThemeProjectCard(project, metrics, lang, contribution)).join("")
      : `<div class="empty-state"><h3>${lang === "en" ? "No project yet" : "Aucun projet pour le moment"}</h3></div>`;
  } catch (error) {
    console.error("Erreur de chargement des projets", error);
    container.innerHTML = `<div class="empty-state"><h3>Catalogue indisponible</h3></div>`;
  }
}

window.loadProjects = loadProjects;
document.addEventListener("DOMContentLoaded", loadProjects);
