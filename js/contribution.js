/* Contribution actionnable : transforme data/contribution.json (collecté par
   scripts/collect-contribution.mjs) en liens directs vers les issues, les bonnes
   premières issues, le guide de contribution et les discussions de chaque dépôt.
   Un projet archivé ou pas encore ouvert ne pousse pas à ouvrir des issues qui
   resteraient sans réponse : il renvoie vers l'OSPO. */
const CONTRIBUTION_CONTACT = "sioss.00006@francetravail.fr";
const contributionCache = new Map();

function contributionEscape(value) {
  const node = document.createElement("span");
  node.textContent = value ?? "";
  return node.innerHTML;
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
        archived: "No active maintenance: reuse it freely, feedback may go unanswered.",
        opening: "The repository is not public yet. Follow its opening with the OSPO.",
        closed: "Issues are closed on this repository: write to the OSPO.",
        contact: "Contact the OSPO",
      }
    : {
        title: "Contribuer",
        report: "Signaler un problème",
        issues: (count) => (count === 1 ? "1 issue ouverte" : `${count} issues ouvertes`),
        goodFirst: (count) => (count === 1 ? "1 issue pour débuter" : `${count} issues pour débuter`),
        guide: "Guide de contribution",
        discussions: "Discussions",
        usage: "Raconter votre usage",
        archived: "Sans maintenance active : réutilisez-le librement, les retours peuvent rester sans réponse.",
        opening: "Le dépôt n’est pas encore public. Suivez son ouverture avec l’OSPO.",
        closed: "Les issues sont fermées sur ce dépôt : écrivez à l’OSPO.",
        contact: "Contacter l’OSPO",
      };
}

function contributionMailto(subject) {
  return `mailto:${CONTRIBUTION_CONTACT}?subject=${encodeURIComponent(subject)}`;
}

function goodFirstUrl(repoUrl, labels) {
  const list = labels.map((label) => `"${label}"`).join(",");
  return `${repoUrl}/issues?q=${encodeURIComponent(`is:issue is:open label:${list}`)}`;
}

function contributionLink(href, text, external = true) {
  const target = external ? ' target="_blank" rel="noopener"' : "";
  return `<li><a href="${contributionEscape(href)}"${target}>${contributionEscape(text)}</a></li>`;
}

function renderContribution(project, data, lang, lifecycle) {
  const labels = contributionLabels(lang);
  const repoUrl = project.repo?.replace(/\/+$/, "");
  const info = data?.repositories?.[contributionKey(repoUrl)];
  const usageSubject = lang === "en" ? `Usage feedback: ${project.name}` : `Retour d’usage : ${project.name}`;
  const contactSubject = lang === "en" ? `About ${project.name}` : `À propos de ${project.name}`;
  const block = (body) => `<div class="project-contribute"><p class="project-contribute-title">${labels.title}</p>${body}</div>`;

  if (lifecycle === "opening" || info?.available === false) {
    return block(`<p class="project-contribute-note">${labels.opening}</p><ul>${contributionLink(contributionMailto(contactSubject), labels.contact, false)}</ul>`);
  }
  if (!info) return "";

  const links = [];
  if (lifecycle === "archived") {
    if (info.contributing_url) links.push(contributionLink(info.contributing_url, labels.guide));
    links.push(contributionLink(contributionMailto(usageSubject), labels.usage, false));
    return block(`<p class="project-contribute-note">${labels.archived}</p><ul>${links.join("")}</ul>`);
  }
  if (!info.issues_enabled) {
    links.push(contributionLink(contributionMailto(contactSubject), labels.contact, false));
    if (info.contributing_url) links.push(contributionLink(info.contributing_url, labels.guide));
    return block(`<p class="project-contribute-note">${labels.closed}</p><ul>${links.join("")}</ul>`);
  }

  links.push(contributionLink(`${repoUrl}/issues/new${info.issue_templates ? "/choose" : ""}`, labels.report));
  if (info.open_issues) links.push(contributionLink(`${repoUrl}/issues`, labels.issues(info.open_issues)));
  if (info.good_first_issues && info.good_first_label) {
    links.push(contributionLink(goodFirstUrl(repoUrl, [info.good_first_label]), labels.goodFirst(info.good_first_issues)));
  }
  if (info.contributing_url) links.push(contributionLink(info.contributing_url, labels.guide));
  if (info.discussions) links.push(contributionLink(`${repoUrl}/discussions`, labels.discussions));
  links.push(contributionLink(contributionMailto(usageSubject), labels.usage, false));
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
