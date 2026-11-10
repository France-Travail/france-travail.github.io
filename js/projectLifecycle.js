const PROJECT_LIFECYCLE_OVERRIDES = {
  gabarit: "archived",
  TradEmploi: "transition",
};

/* Domaines du catalogue : teinte de la palette décorative du DS (classes
   .tone-* de css/style.css) et icône de la police d'icônes du DS. */
const PROJECT_THEMES = {
  "accessibilite&inclusion": { slug: "accessibilite-inclusion", tone: "blue", icon: "handicap", fr: "Accessibilité & inclusion", en: "Accessibility & inclusion" },
  eco: { slug: "eco", tone: "yellow", icon: "trees", fr: "Numérique responsable", en: "Responsible digital" },
  ia: { slug: "ia", tone: "red", icon: "sparkle", fr: "IA & données", en: "AI & data" },
  "services-usagers": { slug: "services-usagers", tone: "pink", icon: "users-group", fr: "Services aux usagers", en: "Services for users" },
  "outils-equipes": { slug: "outils-equipes", tone: "purple", icon: "tool", fr: "Outils et pratiques pour les équipes", en: "Tools and practices for teams" },
};

function projectTheme(categoryOrSlug) {
  if (PROJECT_THEMES[categoryOrSlug]) return { category: categoryOrSlug, ...PROJECT_THEMES[categoryOrSlug] };
  const entry = Object.entries(PROJECT_THEMES).find(([, theme]) => theme.slug === categoryOrSlug);
  return entry
    ? { category: entry[0], ...entry[1] }
    : { category: categoryOrSlug, slug: categoryOrSlug, tone: "blue", icon: "folder", fr: categoryOrSlug, en: categoryOrSlug };
}

function lifecycleRepoName(repoUrl) {
  return repoUrl?.match(/github\.com\/[^/]+\/([^/#?]+)/i)?.[1] || "";
}

function getProjectLifecycle(project) {
  if (project?.inProgress) return "opening";
  const override = PROJECT_LIFECYCLE_OVERRIDES[lifecycleRepoName(project?.repo)];
  if (override) return override;
  if (!project?.lastUpdate) return "maintained";

  const updatedAt = new Date(`${project.lastUpdate}T12:00:00Z`).getTime();
  const ageInDays = Math.max(0, (Date.now() - updatedAt) / 86400000);
  if (ageInDays <= 365) return "active";
  if (ageInDays <= 730) return "maintained";
  return "archived";
}

const PROJECT_LIFECYCLE_TEXT = {
  fr: {
    labels: { active: "Actif", maintained: "Maintenu", archived: "Archivé", transition: "En transition", opening: "Ouverture en cours" },
    hints: {
      active: "Dépôt mis à jour il y a moins d’un an.",
      maintained: "Dernière mise à jour il y a un à deux ans.",
      archived: "Pas de mise à jour depuis plus de deux ans, ou arrêt connu de l’OSPO.",
      transition: "État précisé par l’OSPO : le projet évolue, vérifiez le dépôt avant de le reprendre.",
      opening: "Le dépôt n’est pas encore public.",
    },
  },
  en: {
    labels: { active: "Active", maintained: "Maintained", archived: "Archived", transition: "In transition", opening: "Opening in progress" },
    hints: {
      active: "Repository updated less than a year ago.",
      maintained: "Last updated one to two years ago.",
      archived: "No update for more than two years, or a known end of the project.",
      transition: "Status set by the OSPO: the project is changing, check the repository before reusing it.",
      opening: "The repository is not public yet.",
    },
  },
};

function projectLifecycleLabel(lifecycle, lang = "fr") {
  return PROJECT_LIFECYCLE_TEXT[lang]?.labels[lifecycle] || PROJECT_LIFECYCLE_TEXT.fr.labels[lifecycle] || lifecycle;
}

function projectLifecycleHint(lifecycle, lang = "fr") {
  return PROJECT_LIFECYCLE_TEXT[lang]?.hints[lifecycle] || PROJECT_LIFECYCLE_TEXT.fr.hints[lifecycle] || "";
}

function lifecycleEscape(value) {
  const node = document.createElement("span");
  node.textContent = value ?? "";
  return node.innerHTML.replace(/"/g, "&quot;");
}

/* Pastille d'état : badge du DS, avec une infobulle du DS (directive
   data-ft-tooltip) qui explique l'état au survol comme au clavier. La directive
   rend la pastille focalisable : pas d'infobulle quand la carte entière est un lien. */
function projectStatusBadge(lifecycle, lang = "fr", { tooltip = true } = {}) {
  const label = lifecycleEscape(projectLifecycleLabel(lifecycle, lang));
  const hint = tooltip ? lifecycleEscape(projectLifecycleHint(lifecycle, lang)) : "";
  return `<span class="badge status-badge status-${lifecycleEscape(lifecycle)}${hint ? " has-tooltip" : ""}"${hint ? ` data-ft-tooltip="${hint}" data-ft-placement="top"` : ""}>${label}</span>`;
}

/* Étiquette de domaine : tag du DS teinté par la couleur du domaine. */
function projectCategoryTag(categoryOrSlug, lang = "fr", text) {
  const theme = projectTheme(categoryOrSlug);
  return `<span class="tag tag-sm category-tag tone-${theme.tone}"><span class="tag-content">${lifecycleEscape(text ?? (theme[lang] || theme.fr))}</span></span>`;
}

/* Indicateur de chargement du DS, posé dans un conteneur en attendant les données. */
function loadingState(lang = "fr") {
  const label = lang === "en" ? "Loading projects" : "Chargement des projets";
  return `<div class="loading-state"><ft-spinner size="lg" label="${label}"></ft-spinner></div>`;
}

/* Alerte du DS pour les données indisponibles ou une recherche sans résultat. */
function dsAlert(version, title, text, extra = "") {
  return `<ft-alert version="${version}" notify="false"><p class="alert-title">${lifecycleEscape(title)}</p>${text ? `<p class="alert-content">${lifecycleEscape(text)}</p>` : ""}${extra}</ft-alert>`;
}

function projectCardDate(value, lang) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

/* Fiche projet commune au catalogue et aux pages de domaine. `metric` vient de
   data/metrics_public.json, `contribution` de data/contribution.json. */
function projectCardHtml(project, metric = {}, lang = "fr", contribution = null) {
  const escape = lifecycleEscape;
  const theme = projectTheme(project.category);
  const lifecycle = getProjectLifecycle(project);
  const pagesUrl = metric.pages_url || null;
  const labels = lang === "en"
    ? { update: "Updated", maintainer: "Maintainer", github: "View code", site: "View website", license: "Licence", documentation: "Documentation", readme: "Repository README", siteReadme: "Website + README", variants: "Variants", noLicense: "Not specified", undetected: "Not detected", newTab: "(opens a new tab)", keywords: "Keywords", soon: "Description coming soon." }
    : { update: "Mise à jour", maintainer: "Mainteneur", github: "Voir le code", site: "Voir le site", license: "Licence", documentation: "Documentation", readme: "README du dépôt", siteReadme: "Site + README", variants: "Déclinaisons", noLicense: "Non renseignée", undetected: "Non détectée", newTab: "(nouvel onglet)", keywords: "Mots-clés", soon: "Description à venir." };
  // GitHub renvoie NOASSERTION quand un fichier de licence existe sans être reconnu.
  const license = metric.license === "NOASSERTION" ? labels.undetected : metric.license || labels.noLicense;
  const tags = (project.tags || []).slice(0, 4);
  const external = (href, text, variant) => `<a class="btn ${variant}" href="${escape(href)}" target="_blank" rel="noopener"><span class="btn-content">${text}</span><span class="icon icon-launch" aria-hidden="true"></span><span class="sr-only"> ${labels.newTab}</span></a>`;

  return `
    <article class="card project-card has-accent tone-${theme.tone}">
      <div class="card-top">
        ${projectCategoryTag(project.category, lang)}
        ${projectStatusBadge(lifecycle, lang)}
      </div>
      <h3>${escape(project.name)}</h3>
      <p class="project-description">${escape(project.description || labels.soon)}</p>
      ${tags.length ? `<ul class="project-tags" aria-label="${labels.keywords}">${tags.map((tag) => `<li class="tag tag-sm tag-gray"><span class="tag-content">${escape(tag)}</span></li>`).join("")}</ul>` : ""}
      ${project.variants?.length ? `<div class="project-variants"><span>${labels.variants}</span>${project.variants.map((variant) => `<a class="text-link" href="${escape(variant.repo)}" target="_blank" rel="noopener">${escape(variant.label)}</a>`).join("")}</div>` : ""}
      <dl class="project-details">
        <div class="project-detail"><dt>${labels.update}</dt><dd>${escape(projectCardDate(project.lastUpdate, lang))}</dd></div>
        <div class="project-detail"><dt>${labels.license}</dt><dd>${escape(license)}</dd></div>
        <div class="project-detail"><dt>${labels.documentation}</dt><dd>${escape(pagesUrl ? labels.siteReadme : labels.readme)}</dd></div>
        ${project.maintainers?.length ? `<div class="project-detail"><dt>${labels.maintainer}</dt><dd>${escape(project.maintainers.join(", "))}</dd></div>` : ""}
      </dl>
      ${window.ftContribution?.render(project, contribution, lang, lifecycle) || ""}
      <div class="project-actions">
        ${!project.inProgress && project.repo ? external(project.repo, labels.github, "btn-primary") : ""}
        ${pagesUrl ? external(pagesUrl, labels.site, "btn-secondary") : ""}
      </div>
    </article>`;
}

window.projectCardHtml = projectCardHtml;
window.getProjectLifecycle = getProjectLifecycle;
window.projectLifecycleLabel = projectLifecycleLabel;
window.projectLifecycleHint = projectLifecycleHint;
window.projectStatusBadge = projectStatusBadge;
window.projectCategoryTag = projectCategoryTag;
window.projectTheme = projectTheme;
window.ftUi = { loadingState, alert: dsAlert, escape: lifecycleEscape };
