/* Collecte, pour chaque dépôt du catalogue, ce qui permet de contribuer :
   issues ouvertes, bonnes premières issues, guide de contribution, modèles
   d'issue et discussions. Sortie : data/contribution.json, lue par les cartes
   projet et la section « Contribuer » de l'accueil.

   Jeton facultatif mais conseillé (GITHUB_TOKEN ou GH_TOKEN) : sans lui,
   l'API publique plafonne à 60 requêtes par heure. */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "data/contribution.json");
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
const GOOD_FIRST_LABEL = /good[ -]?first[ -]?issue|first[ -]?timers?|d[ée]butant/i;

async function github(path) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "france-travail-ospo-vitrine",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`GitHub ${path} : HTTP ${response.status}`);
  return response.json();
}

async function openIssues(fullName) {
  const issues = [];
  for (let page = 1; page <= 10; page += 1) {
    const batch = await github(`/repos/${fullName}/issues?state=open&per_page=100&page=${page}`);
    if (!batch?.length) break;
    issues.push(...batch.filter((item) => !item.pull_request));
    if (batch.length < 100) break;
  }
  return issues;
}

async function collectRepository(fullName) {
  const repo = await github(`/repos/${fullName}`);
  if (!repo) return { available: false };

  const [profile, issues] = await Promise.all([
    github(`/repos/${fullName}/community/profile`),
    repo.has_issues ? openIssues(fullName) : Promise.resolve([]),
  ]);

  const goodFirst = issues.filter((issue) => issue.labels.some((label) => GOOD_FIRST_LABEL.test(label.name)));
  const goodFirstLabel = goodFirst[0]?.labels.find((label) => GOOD_FIRST_LABEL.test(label.name))?.name || null;

  return {
    available: true,
    archived: repo.archived,
    issues_enabled: repo.has_issues && !repo.archived,
    open_issues: issues.length,
    good_first_issues: goodFirst.length,
    good_first_label: goodFirstLabel,
    issue_templates: Boolean(profile?.files?.issue_template),
    discussions: Boolean(repo.has_discussions),
    contributing_url: profile?.files?.contributing?.html_url || null,
    code_of_conduct_url: profile?.files?.code_of_conduct_file?.html_url || profile?.files?.code_of_conduct?.html_url || null,
  };
}

const projects = JSON.parse(readFileSync(resolve(root, "data/projects.json"), "utf8"));
const fullNames = [...new Set(projects
  .map((project) => project.repo?.match(/github\.com\/([^/]+\/[^/#?]+)/i)?.[1])
  .filter(Boolean))];

const repositories = {};
for (const fullName of fullNames) {
  repositories[fullName.toLowerCase()] = await collectRepository(fullName);
}

const available = Object.values(repositories).filter((repo) => repo.available);
const report = {
  collected_at: new Date().toISOString(),
  summary: {
    repositories: available.length,
    repositories_with_issues: available.filter((repo) => repo.issues_enabled).length,
    open_issues: available.reduce((total, repo) => total + repo.open_issues, 0),
    good_first_issues: available.reduce((total, repo) => total + repo.good_first_issues, 0),
    repositories_with_guide: available.filter((repo) => repo.contributing_url).length,
  },
  repositories,
};

writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`Contribution : ${available.length} dépôts lus, ${report.summary.open_issues} issues ouvertes, ${report.summary.good_first_issues} bonnes premières issues -> data/contribution.json`);
