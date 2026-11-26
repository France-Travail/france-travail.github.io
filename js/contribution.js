/* Contribution actionnable : transforme data/contribution.json (collecté par
   scripts/collect-contribution.mjs) en liens directs vers les issues, les bonnes
   premières issues, le guide de contribution et les discussions de chaque dépôt.
   Un projet archivé ou pas encore ouvert ne pousse pas à ouvrir des issues qui
   resteraient sans réponse : il renvoie vers l'OSPO, avec une alerte du DS. */
const CONTRIBUTION_CONTACT = "_ldr_tech_daeu_ospo@francetravail.fr";
const contributionCache = new Map();

function contributionEscape(value) {
  const node = document.createElement("span");
  node.textContent = value ?? "";
  return node.innerHTML.replace(/"/g, "&quot;");
}

function contributionKey(repoUrl) {
  return repoUrl?.match(/github\.com\/([^/]+\/[^/#?]+)/i)?.[1]?.toLowerCase() || "";
}

function loadContributionData(basePath = "./") {
  if (!contributionCache.has(basePath)) {
    contributionCache.set(basePath, fetch(withAssetVersion(`${basePath}data/contribution.json`))
      .then((response) => (response.ok ? response.json() : null))
      .catch(() => null));
  }
  return contributionCache.get(basePath);
}

function contributionLabels(lang) {
  return lang === "en"
    ? {
        title: "Contribute",
        report: "Report an issue",
        issues: (count) => (count === 1 ? "1 open issue" : `${count} open issues`),
        goodFirst: (count) => (count === 1 ? "1 good first issue" : `${count} good first issues`),
        guide: "Contribution guide",
        discussions: "Discussions",
        usage: "Share how you use it",
        archivedTitle: "No active maintenance",
        archived: "Reuse it freely, feedback may go unanswered.",
        openingTitle: "Repository not public yet",
        opening: "Follow its opening with the OSPO.",
        closedTitle: "Issues are closed",
        closed: "Write to the OSPO about this repository.",
        contact: "Contact the OSPO",
        newTab: "(opens a new tab)",
      }
    : {
        title: "Contribuer",
        report: "Signaler un problème",
        issues: (count) => (count === 1 ? "1 issue ouverte" : `${count} issues ouvertes`),
        goodFirst: (count) => (count === 1 ? "1 issue pour débuter" : `${count} issues pour débuter`),
        guide: "Guide de contribution",
        discussions: "Discussions",
        usage: "Raconter votre usage",
        archivedTitle: "Sans maintenance active",
        archived: "Réutilisez-le librement, les retours peuvent rester sans réponse.",
        openingTitle: "Dépôt pas encore public",
        opening: "Suivez son ouverture avec l’OSPO.",
        closedTitle: "Issues fermées",
        closed: "Écrivez à l’OSPO au sujet de ce dépôt.",
        contact: "Contacter l’OSPO",
        newTab: "(nouvel onglet)",
      };
}

function contributionMailto(subject) {
  return `mailto:${CONTRIBUTION_CONTACT}?subject=${encodeURIComponent(subject)}`;
}

function goodFirstUrl(repoUrl, labels) {
  const list = labels.map((label) => `"${label}"`).join(",");
  return `${repoUrl}/issues?q=${encodeURIComponent(`is:issue is:open label:${list}`)}`;
}

function contributionLink(href, text, newTabLabel) {
  const target = newTabLabel ? ' target="_blank" rel="noopener"' : "";
  const hint = newTabLabel ? `<span class="sr-only"> ${contributionEscape(newTabLabel)}</span>` : "";
  return `<li><a class="text-link" href="${contributionEscape(href)}"${target}>${contributionEscape(text)}${hint}</a></li>`;
}

/* Alerte compacte du DS (titre obligatoire, pas d'annonce à l'affichage). */
function contributionAlert(version, title, text) {
  return `<ft-alert version="${version}" notify="false"><p class="alert-title">${contributionEscape(title)}</p><p class="alert-content">${contributionEscape(text)}</p></ft-alert>`;
}

function renderContribution(project, data, lang, lifecycle) {
  const labels = contributionLabels(lang);
  const repoUrl = project.repo?.replace(/\/+$/, "");
  const info = data?.repositories?.[contributionKey(repoUrl)];
  const usageSubject = lang === "en" ? `Usage feedback: ${project.name}` : `Retour d’usage : ${project.name}`;
  const contactSubject = lang === "en" ? `About ${project.name}` : `À propos de ${project.name}`;
  const block = (body) => `<div class="project-contribute"><p class="project-contribute-title">${labels.title}</p>${body}</div>`;

  if (lifecycle === "opening" || info?.available === false) {
    return block(`${contributionAlert("info", labels.openingTitle, labels.opening)}<ul>${contributionLink(contributionMailto(contactSubject), labels.contact)}</ul>`);
  }
  if (!info) return "";

  const links = [];
  if (lifecycle === "archived") {
    if (info.contributing_url) links.push(contributionLink(info.contributing_url, labels.guide, labels.newTab));
    links.push(contributionLink(contributionMailto(usageSubject), labels.usage));
    return block(`${contributionAlert("warning", labels.archivedTitle, labels.archived)}<ul>${links.join("")}</ul>`);
  }
  if (!info.issues_enabled) {
    links.push(contributionLink(contributionMailto(contactSubject), labels.contact));
    if (info.contributing_url) links.push(contributionLink(info.contributing_url, labels.guide, labels.newTab));
    return block(`${contributionAlert("info", labels.closedTitle, labels.closed)}<ul>${links.join("")}</ul>`);
  }

  links.push(contributionLink(`${repoUrl}/issues/new${info.issue_templates ? "/choose" : ""}`, labels.report, labels.newTab));
  if (info.open_issues) links.push(contributionLink(`${repoUrl}/issues`, labels.issues(info.open_issues), labels.newTab));
  if (info.good_first_issues && info.good_first_label) {
    links.push(contributionLink(goodFirstUrl(repoUrl, [info.good_first_label]), labels.goodFirst(info.good_first_issues), labels.newTab));
  }
  if (info.contributing_url) links.push(contributionLink(info.contributing_url, labels.guide, labels.newTab));
  if (info.discussions) links.push(contributionLink(`${repoUrl}/discussions`, labels.discussions, labels.newTab));
  links.push(contributionLink(contributionMailto(usageSubject), labels.usage));
  return block(`<ul>${links.join("")}</ul>`);
}

/* Chiffres de la section « Contribuer » de l'accueil : seuls comptent les dépôts
   où une contribution a une chance d'être relue (ni archivés, ni fermés). */
function contributionSummary(projects, data) {
  const repos = [];
  for (const project of projects) {
    const lifecycle = window.getProjectLifecycle?.(project) || "maintained";
    const info = data?.repositories?.[contributionKey(project.repo)];
    if (!info?.available || !info.issues_enabled || ["archived", "opening"].includes(lifecycle)) continue;
    repos.push({ fullName: project.repo.match(/github\.com\/([^/]+\/[^/#?]+)/i)[1], info });
  }
  const withIssues = repos.filter((repo) => repo.info.open_issues);
  const withGoodFirst = repos.filter((repo) => repo.info.good_first_issues && repo.info.good_first_label);
  const search = (query) => `https://github.com/search?type=issues&q=${encodeURIComponent(query)}`;
  const scope = (list) => list.map((repo) => `repo:${repo.fullName}`).join(" ");
  const goodFirstLabels = [...new Set(withGoodFirst.map((repo) => repo.info.good_first_label))].map((label) => `"${label}"`).join(",");

  return {
    openIssues: withIssues.reduce((total, repo) => total + repo.info.open_issues, 0),
    goodFirstIssues: withGoodFirst.reduce((total, repo) => total + repo.info.good_first_issues, 0),
    issuesUrl: withIssues.length ? search(`is:issue is:open ${scope(withIssues)}`) : null,
    goodFirstUrl: withGoodFirst.length ? search(`is:issue is:open label:${goodFirstLabels} ${scope(withGoodFirst)}`) : null,
  };
}

window.ftContribution = {
  contact: CONTRIBUTION_CONTACT,
  load: loadContributionData,
  render: renderContribution,
  summary: contributionSummary,
  mailto: contributionMailto,
};
