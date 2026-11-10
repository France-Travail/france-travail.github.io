/* Pages de domaine : liste des projets d'un domaine (fiche commune : js/projectLifecycle.js). */
async function loadProjects() {
  const container = document.querySelector("#projects-container[data-category]");
  if (!container) return;
  const lang = window.getCurrentLanguage?.() || localStorage.getItem("lang") || "fr";
  if (!container.children.length) container.innerHTML = window.ftUi.loadingState(lang);

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
    const repoName = (url) => url?.match(/github\.com\/[^/]+\/([^/#?]+)/i)?.[1] || "";
    container.innerHTML = filtered.length
      ? filtered.map((project) => window.projectCardHtml(project, metrics.get(repoName(project.repo)), lang, contribution)).join("")
      : `<div class="empty-state">${window.ftUi.alert("info", lang === "en" ? "No project yet" : "Aucun projet pour le moment", "")}</div>`;
  } catch (error) {
    console.error("Erreur de chargement des projets", error);
    container.innerHTML = `<div class="empty-state">${window.ftUi.alert(
      "error",
      lang === "en" ? "Catalogue unavailable" : "Catalogue indisponible",
      lang === "en" ? "Please try again in a few moments." : "Veuillez réessayer dans quelques instants.",
    )}</div>`;
  }
}

window.loadProjects = loadProjects;
document.addEventListener("DOMContentLoaded", loadProjects);
