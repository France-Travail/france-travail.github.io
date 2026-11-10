import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const required = ["index.html", "projets.html", "mentions.html", "LICENSE", "NOTICE.md"];

function fail(message) {
  failures.push(message);
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(join(root, path), "utf8"));
  } catch (error) {
    fail(`${path}: JSON invalide (${error.message})`);
    return [];
  }
}

for (const path of required) {
  if (!existsSync(join(root, path))) fail(`${path}: fichier obligatoire manquant`);
}

const projectsFr = readJson("data/projects.json");
const projectsEn = readJson("data/projects-en.json");
const themesFr = readJson("data/themes.json");
const themesEn = readJson("data/themes-en.json");
readJson("data/metrics_public.json");
const contribution = readJson("data/contribution.json");
for (const project of projectsFr) {
  const key = project.repo?.match(/github\.com\/([^/]+\/[^/#?]+)/i)?.[1]?.toLowerCase();
  if (key && !contribution.repositories?.[key]) fail(`data/contribution.json: dépôt absent ${key} (relancer scripts/collect-contribution.mjs)`);
}
readJson("local/fr.json");
readJson("local/en.json");

const allowedCategories = new Set(["accessibilite&inclusion", "eco", "ia", "services-usagers", "outils-equipes"]);
const projectNames = new Set();
const projectRepos = new Set();

for (const [index, project] of projectsFr.entries()) {
  const label = `data/projects.json[${index}]`;
  for (const field of ["name", "description", "repo", "category"]) {
    if (!project[field]) fail(`${label}: champ ${field} manquant`);
  }
  if (!allowedCategories.has(project.category)) fail(`${label}: catégorie inconnue ${project.category}`);
  if (projectNames.has(project.name)) fail(`${label}: nom dupliqué ${project.name}`);
  if (projectRepos.has(project.repo)) fail(`${label}: dépôt dupliqué ${project.repo}`);
  projectNames.add(project.name);
  projectRepos.add(project.repo);
  for (const variant of project.variants || []) {
    if (!variant.label || !variant.repo) fail(`${label}: déclinaison sans libellé ou sans dépôt`);
    if (projectRepos.has(variant.repo)) fail(`${label}: dépôt dupliqué ${variant.repo}`);
    projectRepos.add(variant.repo);
  }
}

if (projectsFr.length !== projectsEn.length) {
  fail(`Les catalogues FR (${projectsFr.length}) et EN (${projectsEn.length}) n'ont pas la même taille`);
}

if (themesFr.length !== themesEn.length) {
  fail(`Les thèmes FR (${themesFr.length}) et EN (${themesEn.length}) n'ont pas la même taille`);
}

for (const theme of themesFr) {
  const page = join(root, "themes", `${theme.slug}.html`);
  if (!existsSync(page)) fail(`Page de thème manquante: themes/${theme.slug}.html`);
}

const htmlFiles = [
  ...readdirSync(root).filter((name) => extname(name) === ".html").map((name) => join(root, name)),
  ...readdirSync(join(root, "themes")).filter((name) => extname(name) === ".html").map((name) => join(root, "themes", name)),
];

for (const htmlFile of htmlFiles) {
  const html = readFileSync(htmlFile, "utf8");
  const references = [...html.matchAll(/(?:href|src)=["']([^"']+)["']/g)].map((match) => match[1]);
  for (const reference of references) {
    if (/^(?:https?:|mailto:|tel:|#|data:)/.test(reference)) continue;
    const clean = reference.split(/[?#]/)[0];
    if (!clean) continue;
    const target = normalize(resolve(dirname(htmlFile), clean));
    if (!target.startsWith(root) || !existsSync(target)) {
      fail(`${htmlFile.slice(root.length + 1)}: référence locale introuvable ${reference}`);
    }
  }
}

// Versions : package.json, ASSET_VERSION de js/i18n.js et le ?v= des css/js du
// site doivent avancer ensemble, sinon un visiteur garde d'anciens fichiers en cache.
const siteVersion = readJson("package.json").version;
const assetVersion = readFileSync(join(root, "js", "i18n.js"), "utf8").match(/ASSET_VERSION = "([^"]+)"/)?.[1];
if (assetVersion !== siteVersion) fail(`js/i18n.js: ASSET_VERSION ${assetVersion} différente de package.json ${siteVersion}`);

// Design System vendorisé : fichiers présents, même version de styles.css dans
// les pages et dans js/dsft.js (les composants partagent l'URL de la page).
const dsManifest = readJson("vendor/dsft/manifest.json");
const dsVersion = dsManifest.packages?.find((pkg) => pkg.name === "design-system")?.version;
for (const pkg of dsManifest.packages || []) {
  for (const file of pkg.files || []) {
    if (!existsSync(join(root, file.path))) fail(`vendor/dsft/manifest.json: fichier absent ${file.path}`);
  }
  if (!existsSync(join(root, "vendor", "dsft", pkg.name, "LICENCE.txt"))) fail(`vendor/dsft/${pkg.name}: LICENCE.txt manquant`);
}
const dsLoaderVersion = readFileSync(join(root, "js", "dsft.js"), "utf8").match(/DS_VERSION = "([^"]+)"/)?.[1];
if (dsLoaderVersion !== dsVersion) fail(`js/dsft.js: DS_VERSION ${dsLoaderVersion} différente de vendor/dsft/manifest.json ${dsVersion}`);

for (const htmlFile of htmlFiles) {
  const html = readFileSync(htmlFile, "utf8");
  const name = htmlFile.slice(root.length + 1);
  for (const [, path, version] of html.matchAll(/(?:href|src)=["']([^"']*?(?:css|js)\/[^"'?]+\.(?:css|js))\?v=([^"']+)["']/g)) {
    const expected = path.includes("vendor/dsft/") ? dsVersion : siteVersion;
    if (version !== expected) fail(`${name}: ${path}?v=${version} (attendu ?v=${expected})`);
  }
  if (/cdn\.francetravail\.fr/.test(html)) fail(`${name}: ressource chargée depuis cdn.francetravail.fr au lieu de vendor/dsft/`);
}

const jsFiles = readdirSync(join(root, "js")).filter((name) => name.endsWith(".js"));
for (const jsFile of jsFiles) {
  try {
    execFileSync(process.execPath, ["--check", join(root, "js", jsFile)], { stdio: "pipe" });
  } catch (error) {
    fail(`js/${jsFile}: syntaxe JavaScript invalide`);
  }
}

if (failures.length) {
  console.error(`Validation échouée (${failures.length} erreur${failures.length > 1 ? "s" : ""}) :`);
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`Site valide : ${projectsFr.length} projets, ${themesFr.length} thèmes, ${htmlFiles.length} pages HTML et ${jsFiles.length} scripts vérifiés.`);
