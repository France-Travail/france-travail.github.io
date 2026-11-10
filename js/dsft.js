/* Design System France Travail : chargement des webcomposants et directives
   vendorisés dans vendor/dsft/ (provenance et versions : vendor/dsft/manifest.json).

   Sur francetravail.fr, l'autoloader du CDN charge les composants à la demande.
   Ici tout est servi par le site : ce fichier pointe les composants sur la copie
   locale de la feuille de style du DS, charge les modules utilisés par les pages
   et expose la petite partie de l'API de l'autoloader dont les composants se
   servent pour charger leurs propres dépendances (le menu déroulant du fil
   d'Ariane sur mobile, par exemple). */
(() => {
  const DS_VERSION = "1.63.0";
  const script = document.currentScript;
  const vendor = new URL("../vendor/dsft/", script?.src || window.location.href);

  // Même URL, requête comprise, que la balise <link> des pages : un seul téléchargement.
  window.FT_DS_STYLE_URL = new URL(`design-system/css/styles.css?v=${DS_VERSION}`, vendor).href;

  const FILES = {
    "ft-alert": "ft-alert/ft-alert.js",
    "ft-breadcrumb": "ft-breadcrumb/ft-breadcrumb.js",
    "ft-spinner": "ft-spinner/ft-spinner.js",
    "ft-collapse-directive.mjs": "ft-collapse-directive/ft-collapse-directive.mjs.js",
    "ft-tooltip-directive.mjs": "ft-tooltip-directive/ft-tooltip-directive.mjs.js",
    "ft-dropdown-directive.mjs": "ft-dropdown-directive/ft-dropdown-directive.mjs.js",
  };
  const modules = new Map();

  function load(name) {
    const file = FILES[name];
    if (!file) return Promise.reject(new Error(`Design System : module non vendorisé ${name}`));
    if (!modules.has(name)) {
      modules.set(name, import(new URL(file, vendor).href).catch((error) => {
        console.error(`Design System : chargement impossible de ${name}`, error);
        throw error;
      }));
    }
    return modules.get(name);
  }

  const camelCase = (value) => value.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());

  if (!window.ftAutoloader) {
    window.ftAutoloader = {
      registerFile: load,
      registerDirective: load,
      registerWebcomponent: (element) => load(element.localName),
      registerDirectiveInShadowRoot: (name, root) =>
        load(`${name}.mjs`).then((module) => {
          const manager = module[`${camelCase(name)}Manager`];
          manager?.initAll(root);
          manager?.observeNode(root);
        }),
      knownComponents: new Set(Object.keys(FILES).filter((name) => !name.endsWith(".mjs"))),
    };
  }

  // Composants utilisés par les pages du site, y compris ceux insérés après
  // coup par les scripts de rendu (indicateur de chargement, alertes).
  Object.keys(FILES).forEach((name) => load(name).catch(() => {}));
})();
