const PROJECT_LIFECYCLE_OVERRIDES = {
  gabarit: "archived",
  TradEmploi: "transition",
};

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

function projectLifecycleLabel(lifecycle, lang = "fr") {
  const labels = {
    fr: { active: "Actif", maintained: "Maintenu", archived: "Archivé", transition: "En transition", opening: "Ouverture en cours" },
    en: { active: "Active", maintained: "Maintained", archived: "Archived", transition: "In transition", opening: "Opening in progress" },
  };
  return labels[lang]?.[lifecycle] || labels.fr[lifecycle] || lifecycle;
}

window.getProjectLifecycle = getProjectLifecycle;
window.projectLifecycleLabel = projectLifecycleLabel;
