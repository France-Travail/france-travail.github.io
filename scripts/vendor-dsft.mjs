/* Vendorisation du Design System France Travail (DSFT) dans vendor/dsft/.

   GitHub Pages ne voit pas le registre npm interne de France Travail : le site
   embarque donc ses propres copies des composants du DS. Le script récupère les
   builds de production publiés sur le CDN public du DS (les mêmes fichiers que
   ceux que charge l'autoloader sur francetravail.fr), ainsi que leurs licences
   depuis le dépôt public France-Travail/webco-design-system, puis il écrit
   vendor/dsft/manifest.json (versions, sources, empreintes, correctifs).

   Deux correctifs seulement, appliqués à l'identique à chaque mise à jour :
   1. les composants injectent dans leur shadow DOM la feuille de style du DS
      depuis le CDN ; ils lisent d'abord globalThis.FT_DS_STYLE_URL, que
      js/dsft.js fait pointer sur la copie locale ;
   2. dans styles.css, les polices Marianne pointent vers le dossier fonts/ du
      site au lieu d'un dossier fonts/marianne/ qui n'existe pas ici.

   Usage : node scripts/vendor-dsft.mjs  (ou npm run vendor:dsft)
   Derrière un proxy : NODE_USE_ENV_PROXY=1 node scripts/vendor-dsft.mjs */
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const vendorRoot = join(root, "vendor", "dsft");
const CDN = "https://cdn.francetravail.fr";
const REPO = "https://github.com/France-Travail/webco-design-system";
const RAW = "https://raw.githubusercontent.com/France-Travail/webco-design-system/main";
const CDN_STYLE_URL = `${CDN}/studio/design-system/css/styles.css`;

/* Composants et directives réellement utilisés par le site. `repo` est le
   dossier du composant dans le dépôt public, d'où viennent les licences. */
const PACKAGES = [
  { name: "ft-alert", file: "ft-alert.js", repo: "FTAlert" },
  { name: "ft-breadcrumb", file: "ft-breadcrumb.js", repo: "FTBreadcrumb" },
  { name: "ft-spinner", file: "ft-spinner.js", repo: "FTSpinner" },
  { name: "ft-collapse-directive", file: "ft-collapse-directive.mjs.js", repo: "FTCollapseDirective" },
  { name: "ft-tooltip-directive", file: "ft-tooltip-directive.mjs.js", repo: "FTTooltipDirective", thirdParty: true },
  // Dépendance du fil d'Ariane : son menu déroulant sur mobile.
  { name: "ft-dropdown-directive", file: "ft-dropdown-directive.mjs.js", repo: "FTDropdownDirective" },
];

async function download(url, binary = false) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} : HTTP ${response.status}`);
  return binary ? Buffer.from(await response.arrayBuffer()) : response.text();
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function write(relativePath, content) {
  const target = join(vendorRoot, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
  return `vendor/dsft/${relativePath}`;
}

/* La feuille de style est référencée dans les builds sous la forme d'une
   chaîne littérale. On la remplace par une expression qui garde le CDN en repli. */
function patchStyleUrl(code, name) {
  const pattern = /"https:\/\/cdn\.francetravail\.fr\/studio\/design-system\/css\/styles\.css(\?[^"]*)?"/g;
  let count = 0;
  const patched = code.replace(pattern, (literal) => {
    count += 1;
    return `(globalThis.FT_DS_STYLE_URL||${literal})`;
  });
  return { patched, count, name };
}

const manifest = {
  description: "Copies locales du Design System France Travail utilisées par le site. Fichier généré par scripts/vendor-dsft.mjs, ne pas modifier à la main.",
  generated_at: new Date().toISOString(),
  licence: "MIT, voir le fichier LICENCE.txt de chaque dossier",
  repository: REPO,
  style_url_override: "globalThis.FT_DS_STYLE_URL (défini par js/dsft.js)",
  packages: [],
};

const designSystemLicence = await download(`${RAW}/LICENCE.txt`);

// 1. Fondations : feuille de style du DS (tokens, polices, classes) et police d'icônes.
const stylesheet = await download(CDN_STYLE_URL);
const cssVersion = stylesheet.match(/@version\s+"([^"]+)"/)?.[1] || "inconnue";
const marianneRefs = (stylesheet.match(/url\(\.\.\/fonts\/marianne\//g) || []).length;
const patchedStylesheet = stylesheet.replace(/url\(\.\.\/fonts\/marianne\//g, "url(../../../../fonts/");
const iconFont = await download(`${CDN}/studio/design-system/fonts/ft-icons.woff2`, true);
manifest.packages.push({
  name: "design-system",
  version: cssVersion,
  files: [
    {
      path: write("design-system/css/styles.css", patchedStylesheet),
      source: CDN_STYLE_URL,
      sha256_source: sha256(stylesheet),
      patches: [`${marianneRefs} url(../fonts/marianne/…) remplacées par url(../../../../fonts/…) : Marianne est servie depuis fonts/ du site`],
    },
    {
      path: write("design-system/fonts/ft-icons.woff2", iconFont),
      source: `${CDN}/studio/design-system/fonts/ft-icons.woff2`,
      sha256_source: sha256(iconFont),
      patches: [],
    },
  ],
  notes: "styles.css embarque Bootstrap 4.6.2 (MIT, en-tête conservé dans le fichier).",
});
write("design-system/LICENCE.txt", designSystemLicence);

// 2. Webcomposants et directives.
for (const pkg of PACKAGES) {
  const source = `${CDN}/webco/v1/${pkg.file}`;
  const code = await download(source);
  const version = code.match(/^\/\/ version v?(\S+)/)?.[1] || "inconnue";
  const { patched, count } = patchStyleUrl(code, pkg.name);
  const licence = await download(`${RAW}/webcomponents/${pkg.repo}/LICENCE.txt`).catch(() => designSystemLicence);
  write(`${pkg.name}/LICENCE.txt`, licence);
  if (pkg.thirdParty) {
    write(`${pkg.name}/THIRD_PARTY_LICENCES.txt`, await download(`${RAW}/webcomponents/${pkg.repo}/THIRD_PARTY_LICENCES.txt`));
  }
  manifest.packages.push({
    name: pkg.name,
    version,
    files: [
      {
        path: write(`${pkg.name}/${pkg.file}`, patched),
        source,
        sha256_source: sha256(code),
        patches: count ? [`${count} URL de feuille de style remplacée(s) par (globalThis.FT_DS_STYLE_URL||URL du CDN)`] : [],
      },
    ],
    sources: `${REPO}/tree/main/webcomponents/${pkg.repo}`,
  });
  console.log(`${pkg.name} v${version}${count ? ` (${count} URL de style redirigée)` : ""}`);
}

write("manifest.json", `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`design-system v${cssVersion} (${marianneRefs} références Marianne redirigées vers fonts/)`);
console.log("vendor/dsft/manifest.json écrit.");
