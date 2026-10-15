import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceUrl = "https://www.francetravail.org/digitalinnovation/";
const output = resolve(root, "maquettes/francetravail-org-open-source.html");
// Adresse du catalogue vers laquelle pointe la maquette : le serveur local par
// défaut, l'URL publique (https://france-travail.github.io/) pour une démo en ligne.
const catalogueUrl = (process.env.CATALOGUE_URL || "http://127.0.0.1:4173/").replace(/\/?$/, "/");
// Même format que le « Publié le » des articles de francetravail.org.
const buildDate = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date());

const response = await fetch(sourceUrl);
if (!response.ok) throw new Error(`Impossible de récupérer ${sourceUrl} (${response.status})`);
let source = await response.text();

/* francetravail.org ne sert pas ses polices aux autres origines (pas d'en-tête
   CORS) : servie en local, la maquette perdait Roboto et la police d'icônes du
   header et du footer. On embarque donc ces polices en data: URI, avec les mêmes
   descripteurs que les @font-face d'origine, pour un rendu identique où que la
   maquette soit ouverte. */
const FONT_FORMATS = [["woff2", "font/woff2"], ["woff", "font/woff"], ["truetype", "font/ttf"], ["ttf", "font/ttf"]];

function fontDescriptor(block, name) {
  return block.match(new RegExp(`${name}\\s*:\\s*([^;}]+)`, "i"))?.[1].trim() || null;
}

function stylesheetUrls(html, baseUrl) {
  return [...html.matchAll(/<link\b[^>]*>/gi)]
    .map(([tag]) => tag)
    .filter((tag) => /rel=["']?stylesheet/i.test(tag))
    .map((tag) => tag.match(/href=["']([^"']+)["']/i)?.[1])
    .filter(Boolean)
    .map((href) => new URL(href, baseUrl).href);
}

async function embeddedFontFaces(stylesheets) {
  const faces = [];
  for (const cssUrl of stylesheets) {
    const cssResponse = await fetch(cssUrl);
    if (!cssResponse.ok) continue;
    const css = await cssResponse.text();
    for (const [block] of css.matchAll(/@font-face\s*{[^}]*}/gi)) {
      const sources = [...block.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)(?:\s*format\(\s*["']?([^"')]+)["']?\s*\))?/gi)]
        .map(([, url, format]) => ({ url: new URL(url, cssUrl).href, format: (format || url.split(/[?#]/)[0].split(".").pop()).toLowerCase() }));
      const chosen = FONT_FORMATS.map(([format, mime]) => ({ source: sources.find((item) => item.format === format), format, mime })).find((item) => item.source);
      const family = fontDescriptor(block, "font-family");
      if (!chosen || !family) continue;
      const fontResponse = await fetch(chosen.source.url);
      if (!fontResponse.ok) continue;
      const data = Buffer.from(await fontResponse.arrayBuffer()).toString("base64");
      const descriptors = ["font-weight", "font-style", "font-stretch", "unicode-range"]
        .map((name) => [name, fontDescriptor(block, name)])
        .filter(([, value]) => value)
        .map(([name, value]) => `${name}:${value};`)
        .join("");
      const cssFormat = chosen.format === "ttf" ? "truetype" : chosen.format;
      faces.push(`@font-face{font-family:${family};src:url(data:${chosen.mime};base64,${data}) format("${cssFormat}");${descriptors}font-display:swap;}`);
    }
  }
  return faces;
}

/* La page Digital & innovation n'embarque pas la feuille de style propre aux
   articles (picto du temps de lecture, etc.). On reprend celles d'un article
   publié de la rubrique, détectées par différence pour suivre leurs noms générés. */
const referenceArticleUrl = "https://www.francetravail.org/accueil/actualites/2023/incubateur-pole-emploi--lutilisateur-au-coeur-de-la-conception-de-loffre-de-service.html?type=article";
const shellStylesheets = stylesheetUrls(source, sourceUrl);
const articleResponse = await fetch(referenceArticleUrl);
const articleStylesheets = articleResponse.ok
  ? stylesheetUrls(await articleResponse.text(), referenceArticleUrl).filter((href) => !shellStylesheets.includes(href))
  : [];
const fontFaces = await embeddedFontFaces([...shellStylesheets, ...articleStylesheets]);

const start = source.indexOf('<main class="main" id="contents" role="main">');
const end = source.indexOf("</main>", start);
if (start < 0 || end < 0) throw new Error("Structure <main> de francetravail.org introuvable");

const contentStyles = `
<style id="ospo-mock-styles">
  .ospo-mock-three { margin:30px -15px 40px; }
  .ospo-mock-three article { min-height:245px; border-top:5px solid #008ecf; background:#f4f5f7; padding:24px; margin-bottom:20px; }
  .ospo-mock-three article.pink { border-color:#eaa3c7; }
  .ospo-mock-three article.yellow { border-color:#ffca00; }
  .ospo-mock-three .t-uppercase { color:#566080; }
  .ospo-mock-ecosystem { margin:40px 0; padding:35px; background:#edf7fb; border-left:6px solid #008ecf; }
  .ospo-mock-cta { margin:40px 0; padding:38px; background:#15235c; color:#fff; }
  .ospo-mock-cta h2, .ospo-mock-cta p { color:#fff; }
  .ospo-mock-cta p a { color:#fff; text-decoration:underline; }
  .ospo-mock-ecosystem ul { margin:18px 0 0; padding:0; list-style:none; display:flex; flex-wrap:wrap; gap:10px 28px; }
  .ospo-mock-ecosystem li a { font-weight:700; }
  .ospo-mock-actions { margin-top:25px; display:flex; flex-wrap:wrap; gap:12px; }
  .ospo-mock-primary { display:inline-block; background:#fff; color:#15235c !important; padding:13px 20px; font-weight:700; text-decoration:none !important; }
  .ospo-mock-secondary { display:inline-block; border:2px solid #fff; color:#fff !important; padding:11px 20px; font-weight:700; text-decoration:none !important; }
  @media (max-width:600px) {
    .ospo-mock-ecosystem, .ospo-mock-cta { padding:24px; }
  }
</style>`;

// Carte « Ailleurs sur le site » au balisage exact des articles de francetravail.org,
// pointant vers les deux autres pages de la rubrique Digital & innovation.
function elsewhereItem({ image, href, title }) {
  const linkTitle = `En savoir plus sur&nbsp;${title}&nbsp;(nouvelle fenêtre)`;
  return `<div class="col-sm-12 col-md-6">
            <div class="news-item">
              <div class="news-item-img">
                <img src="${image}" alt=""></div>
              <div class="news-content with-bg-gray">
                <p class="t16 t-uppercase">Article</p>
                <h3 class="t24 t-bold">
                  <a href='${href}' title="${linkTitle}" target=_blank>${title}</a>
                </h3>
                <div class="media media-link">
                  <span class="media-left"><span class="icon-arrow" aria-hidden="true"></span></span>
                  <span class="media-body"><a href='${href}' title="${linkTitle}" target=_blank>En savoir plus</a></span>
                </div>
              </div>
            </div>
          </div>`;
}

const main = `<main class="main article" id="contents" role="main">
  <div class="container-fluid with-bg-blue-light">
    <div class="container">
      <nav aria-label="fil d'Ariane" role="navigation">
        <ol class="breadcrumb">
          <li class="home-link">
            <a href="/accueil/" title="Retourner à l'accueil de francetravail.org">
              <span class="icon-accueil" aria-hidden="true"></span>
              <span class="sr-only">Accueil</span>
            </a>
          </li>
          <li typeof="ListItem" property="itemListElement">
            <a href="/digitalinnovation/" typeof="WebPage" property="item">Digital & innovation</a>
          </li>
          <li class="active">L’open source à France Travail</li>
        </ol>
      </nav>
    </div>
  </div>
  <div class="container-wrapper">
    <div class="container block-head">
      <img src="/files/live/sites/peorg/files/images/Digital_innovation/lab_org_new.jpg" alt="Atelier collaboratif au Lab France Travail">
      <div class="head-content">
        <p class="t14 t-bold edito">
          Article<img src="/modules/pr012-cmsftorg-module/img/chronometre.png" class="picto-reading-time" alt="">
          <span id="reading-time" data-text-selector="#text-to-read"></span>
          min de lecture</p>
        <h1 class="t40 t-bold">L’open source à France Travail</h1>
        <p class="t18">France Travail développe, utilise et partage des solutions ouvertes pour favoriser la coopération et construire des services numériques utiles au plus grand nombre.</p>
      </div>
    </div>

    <div class="container block-action">
      <div class="row with-bg-blue-light">
        <div class="col-md-5 col-sm-12 col-xs-12 block-action-text">
          <p>
            Proposition de contenu du&nbsp;
            ${buildDate}</p>
          <div class="container-tag">
            <span class="icon-tag" aria-hidden="true"></span>
            <ul class="tag list-unstyled">
              <li>
                <a href="/accueil/mot-cle.html?tagId=64bb62d4-fad1-47aa-bae2-2a79e58a4e37" title="Accéder aux articles Innovation">Innovation</a>
              </li>
            </ul>
          </div>
        </div>
        <!-- Barre d'actions des articles : seul le centre d'accessibilité est repris,
             « être alerté » et « lire plus tard » sont liés à un article publié. -->
        <ul class="hidden-xs col-md-7 col-sm-12 col-xs-12 list-unstyled">
          <li class="col-md-3 col-sm-3">
            <ft-accessibility-center></ft-accessibility-center>
          </li>
        </ul>
      </div>
    </div>

    <div class="container container-article" id="text-to-read">
      <p>L’open source permet d’étudier, d’utiliser, d’adapter et de partager un logiciel dans le respect de sa licence. Pour France Travail, cette démarche contribue à rendre les investissements numériques plus réutilisables et à renforcer les coopérations entre acteurs publics, entreprises, associations et communautés techniques.</p>

      <h2 class="t20 t-blue-light t-bold intertitre">Pourquoi France Travail publie son code</h2>
      <div class="row ospo-mock-three">
        <div class="col-sm-4"><article><p class="t-uppercase t14 t-bold">Coopération</p><h3 class="t24 t-bold">Travailler avec d’autres organisations</h3><p>D’autres administrations, entreprises ou associations peuvent reprendre un projet publié, l’adapter et proposer leurs corrections.</p></article></div>
        <div class="col-sm-4"><article class="pink"><p class="t-uppercase t14 t-bold">Innovation</p><h3 class="t24 t-bold">Essayer plus vite</h3><p>Un code ouvert peut être testé et adapté par une autre équipe sans attendre une convention entre organisations.</p></article></div>
        <div class="col-sm-4"><article class="yellow"><p class="t-uppercase t14 t-bold">Mutualisation</p><h3 class="t24 t-bold">Ne pas redévelopper ce qui existe</h3><p>Une brique publiée par une équipe peut servir à d’autres équipes, à France Travail comme ailleurs.</p></article></div>
      </div>

      <h2 class="t20 t-blue-light t-bold intertitre">Le rôle de l’OSPO</h2>
      <p>L’Open Source Program Office de France Travail accompagne les équipes qui utilisent ou publient des logiciels open source : conditions de publication, choix de la licence, documentation, contributions à des projets extérieurs. Il suit aussi les licences des logiciels utilisés et représente France Travail dans les réseaux open source.</p>

      <div class="ospo-mock-ecosystem">
        <h2 class="t24 t-bold">Les réseaux auxquels France Travail participe</h2>
        <p>France Travail échange avec d’autres acteurs publics et privés engagés dans l’open source, notamment au sein du TOSIT, de la communauté BlueHats animée par la DINUM et des réseaux d’OSPO publics.</p>
        <ul>
          <li><a href="https://tosit.fr/" target="_blank" rel="noopener">Le TOSIT</a></li>
          <li><a href="https://code.gouv.fr/fr/bluehats/" target="_blank" rel="noopener">La communauté BlueHats</a></li>
          <li><a href="${catalogueUrl}#contribuer">Contribuer aux projets de France Travail</a></li>
        </ul>
      </div>

      <h2 class="t20 t-blue-light t-bold intertitre">Le catalogue des projets</h2>
      <p>Le catalogue rassemble les logiciels, référentiels et formations publiés par les équipes de France Travail. Pour chaque projet, il indique la licence, la documentation, l’état du dépôt et comment signaler un problème ou proposer une amélioration.</p>
      <div class="ospo-mock-cta">
        <p class="t-uppercase t14 t-bold">Catalogue vivant</p>
        <h2 class="t35 t-bold">Explorer les projets open source de France Travail</h2>
        <p>Les projets, leur documentation, des indicateurs mis à jour chaque semaine et <a href="${catalogueUrl}#contribuer">les façons de contribuer</a>.</p>
        <div class="ospo-mock-actions">
          <a class="ospo-mock-primary" href="${catalogueUrl}">Découvrir le catalogue</a>
          <a class="ospo-mock-secondary" href="https://github.com/France-Travail" target="_blank" rel="noopener">Voir l’organisation GitHub</a>
        </div>
      </div>

      <h2 class="t20 t-blue-light t-bold intertitre">Contacter l’équipe open source</h2>
      <p>Vous souhaitez réutiliser un projet, contribuer ou échanger avec l’OSPO ? Écrivez-nous à <a href="mailto:sioss.00006@francetravail.fr">sioss.00006@francetravail.fr</a>.</p>
    </div>

    <div class="container">
      <div class="block-elsewhere">
        <h2 class="t50">Ailleurs sur le site</h2>
        <div class="row no-gutters">
          ${elsewhereItem({
            image: "/files/live/sites/peorg/files/images/Digital_innovation/Le-lab.jpg",
            href: "/digitalinnovation/le-lab/le-lab-pole-emploi---un-accelera.html?type=article",
            title: "Le LAB France Travail : quand tout un écosystème se mobilise au service de l’innovation et de l’emploi",
          })}
          ${elsewhereItem({
            image: "/files/live/sites/peorg/files/images/Actualit%c3%a9/incubateur_pe_art_org.jpg",
            href: "/accueil/actualites/2023/incubateur-pole-emploi--lutilisateur-au-coeur-de-la-conception-de-loffre-de-service.html?type=article",
            title: "Incubateur Pôle emploi : l’utilisateur au cœur de la conception de l’offre de service",
          })}
        </div>
      </div>
    </div>
  </div>
</main>`;

// Temps de lecture calculé comme le fait le site (readingTimeSpeed = 200 mots par minute).
const articleText = main.split('id="text-to-read"')[1]?.split('<div class="block-elsewhere">')[0] || "";
const words = articleText.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
const readingMinutes = Math.max(1, Math.ceil(words / 200));

source = source.slice(0, start) + main.replace('data-text-selector="#text-to-read"></span>', `data-text-selector="#text-to-read">${readingMinutes}</span>`) + source.slice(end + "</main>".length);
source = source.replace(/<title>[\s\S]*?<\/title>/, "<title>L’open source à France Travail | maquette locale francetravail.org</title>");
source = source.replace(/<link rel="canonical"[^>]*>/, "");
source = source.replace("<head>", '<head>\n        <base href="https://www.francetravail.org/">\n        <meta name="robots" content="noindex, nofollow">');
source = source.replace("</head>", `${articleStylesheets.map((href) => `<link rel="stylesheet" href="${href}" media="screen, print" type="text/css">`).join("\n")}\n<style id="ospo-mock-fonts">${fontFaces.join("\n")}</style>\n${contentStyles}\n</head>`);
source = source.replace("<body class=\"pe-org\">", '<body class="pe-org" data-maquette-locale="true">');

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, source, "utf8");
console.log(`Maquette reconstruite depuis ${sourceUrl} -> ${output} (catalogue : ${catalogueUrl}, ${fontFaces.length} polices embarquées)`);
