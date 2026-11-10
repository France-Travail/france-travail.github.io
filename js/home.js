/* Sélection éditoriale de la page d'accueil : trois portes d'entrée tenues par l'OSPO.
   L'ordre du tableau est l'ordre d'affichage, `repo` est le nom du dépôt GitHub.
   Un projet dont le dépôt n'est pas encore public s'affiche sans lien. */
const HOME_FEATURED_PICKS = [
  {
    repo: "webco-design-system",
    role: { fr: "Socle d’interface", en: "Interface foundation" },
    pitch: {
      fr: "La bibliothèque de composants web, de tokens et de styles qui donne une base commune aux interfaces France Travail.",
      en: "The library of web components, tokens and styles that gives France Travail interfaces a shared foundation.",
    },
  },
  {
    repo: "cej",
    role: { fr: "Application métier", en: "Business application" },
    pitch: {
      fr: "L’application d’accompagnement du Contrat d’Engagement Jeune, côté conseiller comme côté usager. L’ouverture du dépôt est en cours.",
      en: "The support application behind the Contrat d’Engagement Jeune, for advisers and users alike. The repository is being opened.",
    },
  },
  {
    repo: "si_plateforme",
    role: { fr: "Guide de prise en main", en: "Onboarding guide" },
    pitch: {
      fr: "Le parcours pas à pas pour consommer les API France Travail : cinématiques d’implémentation, collections Postman et kits d’appropriation.",
      en: "The step-by-step path to consuming France Travail APIs: implementation walkthroughs, Postman collections and starter kits.",
    },
  },
];

function homeLanguage() {
  return window.getCurrentLanguage?.() || localStorage.getItem("lang") || "fr";
}

function safeText(value) {
  const node = document.createElement("span");
  node.textContent = value ?? "";
  return node.innerHTML;
}

function homeRepoName(repoUrl) {
  return repoUrl?.match(/github\.com\/[^/]+\/([^/#?]+)/i)?.[1] || "";
}

function homeCategoryLabel(category, lang = homeLanguage()) {
  const theme = window.projectTheme(category);
  return theme[lang] || theme.fr;
}

function formatHomeDate(value, lang = homeLanguage()) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "fr-FR", {
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

async function loadHomeStats() {
  const grid = document.getElementById("stats-grid");
  if (!grid) return;
  const lang = homeLanguage();

  const labels = lang === "en"
    ? ["public repositories", "active repositories", "contributors"]
    : ["dépôts publics", "dépôts actifs", "contributrices et contributeurs"];

  const render = (values) => {
    grid.innerHTML = values
      .map((value, index) => `<div class="metric"><strong>${safeText(value)}</strong><span>${safeText(labels[index])}</span></div>`)
      .join("");
  };

  try {
    const response = await fetch(withAssetVersion("./data/metrics_public.json"));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const { summary = {} } = await response.json();
    render([
      summary.total_repositories ?? "—",
      summary.active_repositories ?? "—",
      summary.total_contributors ?? "—",
    ]);
  } catch (error) {
    console.error("Impossible de charger les métriques", error);
    render(["—", "—", "—"]);
  }
}

async function loadHomeThemes() {
  const grid = document.getElementById("themes-grid");
  if (!grid) return;
  const lang = homeLanguage();
  if (!grid.children.length) grid.innerHTML = window.ftUi.loadingState(lang);

  try {
    const [themeResponse, projectResponse] = await Promise.all([
      fetch(withAssetVersion(lang === "en" ? "./data/themes-en.json" : "./data/themes.json")),
      fetch(withAssetVersion(lang === "en" ? "./data/projects-en.json" : "./data/projects.json")),
    ]);
    if (!themeResponse.ok || !projectResponse.ok) throw new Error("Données indisponibles");
    const [themes, projects] = await Promise.all([themeResponse.json(), projectResponse.json()]);

    grid.innerHTML = themes.map((theme) => {
      const meta = window.projectTheme(theme.slug);
      const count = projects.filter((project) => project.category === meta.category).length;
      const projectWord = lang === "en" ? (count > 1 ? "projects" : "project") : (count > 1 ? "projets" : "projet");
      return `
        <a class="card theme-card has-accent tone-${meta.tone}" href="./themes/${safeText(theme.slug)}.html">
          <div class="theme-card-head">
            <span class="theme-icon" aria-hidden="true"><span class="icon icon-${meta.icon}"></span></span>
            <span class="theme-count">${count} ${projectWord}</span>
          </div>
          <div class="theme-card-body">
            <h3>${safeText(theme.title)}<span class="icon icon-arrow-right" aria-hidden="true"></span></h3>
            <p>${safeText(theme.shortDescription)}</p>
          </div>
        </a>`;
    }).join("");
  } catch (error) {
    console.error("Impossible de charger les thèmes", error);
    grid.innerHTML = window.ftUi.alert("error", lang === "en" ? "Areas unavailable" : "Domaines indisponibles", lang === "en" ? "Please try again in a few moments." : "Impossible de charger les domaines pour le moment.");
  }
}

async function loadFeaturedProjects() {
  const grid = document.getElementById("featured-projects");
  if (!grid) return;
  const lang = homeLanguage();
  if (!grid.children.length) grid.innerHTML = window.ftUi.loadingState(lang);

  try {
    const response = await fetch(withAssetVersion(lang === "en" ? "./data/projects-en.json" : "./data/projects.json"));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const projects = await response.json();
    const byRepo = new Map(projects.map((project) => [homeRepoName(project.repo), project]));

    const selected = HOME_FEATURED_PICKS
      .map((pick) => {
        const project = byRepo.get(pick.repo);
        if (!project) return null;
        return {
          ...project,
          pitch: pick.pitch[lang] || pick.pitch.fr,
          role: pick.role[lang] || pick.role.fr,
        };
      })
      .filter(Boolean);

    if (!selected.length) throw new Error("Aucun projet mis en avant n’a été trouvé dans le catalogue");

    const labels = lang === "en"
      ? { updated: "Updated", openRepo: "View repository", soon: "Repository not open yet", newTab: "(opens a new tab)" }
      : { updated: "Actualisé", openRepo: "Voir le dépôt", soon: "Dépôt pas encore ouvert", newTab: "(nouvel onglet)" };

    grid.innerHTML = selected.map((project) => {
      const theme = window.projectTheme(project.category);
      const lifecycle = window.getProjectLifecycle?.(project) || "maintained";
      // Un projet en cours d'ouverture n'a pas encore de dépôt public : pas de lien.
      const isOpening = lifecycle === "opening";
      const tag = isOpening ? "article" : "a";
      const linkAttributes = isOpening
        ? ""
        : ` href="${safeText(project.repo)}" target="_blank" rel="noopener"`;

      return `
        <${tag} class="card featured-card has-accent tone-${theme.tone}${isOpening ? " featured-card-pending" : ""}"${linkAttributes}>
          <div class="card-top">
            ${window.projectCategoryTag(project.category, lang, project.role)}
            ${window.projectStatusBadge(lifecycle, lang, { tooltip: false })}
          </div>
          <h3>${safeText(project.name)}</h3>
          <p>${safeText(project.pitch)}</p>
          <div class="featured-meta">
            <span>${safeText(homeCategoryLabel(project.category, lang))}</span>
            <span>${labels.updated} <strong>${safeText(formatHomeDate(project.lastUpdate, lang))}</strong></span>
            <span class="featured-cta">${isOpening ? safeText(labels.soon) : `<span class="featured-cta-label">${safeText(labels.openRepo)}</span><span class="icon icon-launch" aria-hidden="true"></span><span class="sr-only"> ${labels.newTab}</span>`}</span>
          </div>
        </${tag}>`;
    }).join("");
  } catch (error) {
    console.error("Impossible de charger les projets mis en avant", error);
    grid.innerHTML = window.ftUi.alert("error", lang === "en" ? "Projects unavailable" : "Projets indisponibles", lang === "en" ? "Please try again in a few moments." : "Veuillez réessayer dans quelques instants.");
  }
}

async function loadHomeCatalogueLink() {
  const target = document.getElementById("catalogue-link-label");
  if (!target) return;
  const lang = homeLanguage();

  try {
    const response = await fetch(withAssetVersion(lang === "en" ? "./data/projects-en.json" : "./data/projects.json"));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const count = (await response.json()).length;
    target.textContent = lang === "en" ? `See all ${count} projects` : `Voir les ${count} projets`;
  } catch (error) {
    console.error("Impossible de compter les projets du catalogue", error);
  }
}

/* Les liens de la section « Contribuer » pointent vers les issues réellement
   ouvertes des dépôts maintenus, avec leur nombre. Sans données, les liens
   statiques du HTML (recherche sur toute l'organisation) restent en place. */
async function loadHomeContribution() {
  const issuesLink = document.getElementById("contribute-issues-link");
  const firstLink = document.getElementById("contribute-first-link");
  if (!issuesLink || !firstLink || !window.ftContribution) return;
  const lang = homeLanguage();

  try {
    const [projectResponse, data] = await Promise.all([
      fetch(withAssetVersion(lang === "en" ? "./data/projects-en.json" : "./data/projects.json")),
      window.ftContribution.load("./"),
    ]);
    if (!projectResponse.ok || !data) throw new Error("Données de contribution indisponibles");
    const summary = window.ftContribution.summary(await projectResponse.json(), data);

    if (summary.issuesUrl) {
      issuesLink.href = summary.issuesUrl;
      issuesLink.textContent = lang === "en"
        ? `See the ${summary.openIssues} open ${summary.openIssues === 1 ? "issue" : "issues"}`
        : `Voir les ${summary.openIssues} ${summary.openIssues === 1 ? "issue ouverte" : "issues ouvertes"}`;
    }

    firstLink.parentElement.hidden = !summary.goodFirstUrl;
    if (summary.goodFirstUrl) {
      firstLink.href = summary.goodFirstUrl;
      firstLink.textContent = lang === "en"
        ? `${summary.goodFirstIssues} good first ${summary.goodFirstIssues === 1 ? "issue" : "issues"}`
        : `${summary.goodFirstIssues} ${summary.goodFirstIssues === 1 ? "issue" : "issues"} pour débuter`;
    }

    const usageLink = document.getElementById("contribute-usage-link");
    if (usageLink) usageLink.href = window.ftContribution.mailto(lang === "en" ? "Usage feedback" : "Retour d’usage");
  } catch (error) {
    console.error("Impossible de charger les données de contribution", error);
  }
}

async function loadHome() {
  await Promise.all([loadHomeStats(), loadHomeThemes(), loadFeaturedProjects(), loadHomeCatalogueLink(), loadHomeContribution()]);
}

window.loadHome = loadHome;
window.loadStats = loadHomeStats;
window.loadThemes = loadHomeThemes;
document.addEventListener("DOMContentLoaded", loadHome);
