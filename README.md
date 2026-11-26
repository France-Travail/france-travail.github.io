# 🇫🇷 France Travail Open Source

Ce site présente les projets open source soutenus ou développés par France Travail, organisés autour de plusieurs thématiques comme :

- 🧩 Inclusion & Accessibilité
- 🌿 Éco-conception
- 🏛️ Architecture
- 🧬 SI Plateforme
- 🧠 Intelligence Artificielle

## 📍 Objectif

Mettre en valeur les logiciels, outils et démarches open source portés par France Travail.

## 🛠 Démo

👉 https://france-travail.github.io

## 🔄 Données

- `data/projects.json` et `data/projects-en.json` : le catalogue, tenu par l'OSPO.
- `data/metrics_public.json` : métriques GitHub publiées chaque semaine par le collecteur de l'OSPO.
- `data/contribution.json` : pour chaque dépôt du catalogue, les issues ouvertes, les issues pour débuter, le guide de contribution et les discussions. Il alimente le bloc « Contribuer » des cartes et la section contribution de l'accueil.

Le workflow `update-last-update.yml` rafraîchit chaque dimanche les dates de mise à jour et les liens de contribution. En local :

```bash
GITHUB_TOKEN=$(gh auth token) node scripts/collect-contribution.mjs
npm run validate
```

## 🎨 Design System France Travail

Le site est construit avec le [Design System France Travail](https://github.com/France-Travail/webco-design-system) :

- `vendor/dsft/design-system/css/styles.css` fournit les tokens (`--ft-color-*`, `--ft-spacer-*`, `--ft-font-*`, `--ft-radius-default`), Marianne pour les titres, la police d'icônes et les classes `.btn`, `.tag`, `.badge`, `.form-control`, `.ds-collapse`, `.text-link` ;
- `css/style.css` compose les pages avec ces tokens : couleurs, typographie, espacements et rayons renvoient au DS (seules les ombres et les filets translucides sont calculés à partir du marine du DS) ;
- `js/dsft.js` charge les webcomposants `<ft-breadcrumb>`, `<ft-alert>`, `<ft-spinner>` et les directives `data-ft-collapse`, `data-ft-tooltip` (et `data-ft-dropdown` pour le fil d'Ariane mobile).

GitHub Pages ne voit pas le registre npm interne : ces fichiers sont copiés dans `vendor/dsft/` (provenance, versions et empreintes dans `vendor/dsft/manifest.json`). Mise à jour :

```bash
npm run vendor:dsft   # derrière un proxy : NODE_USE_ENV_PROXY=1 npm run vendor:dsft
npm run validate
```

Après une montée de version du DS, reporter la version de `styles.css` (`?v=` des pages et `DS_VERSION` de `js/dsft.js`) : `npm run validate` signale tout écart.

## 💬 Contact

Pour toute question ou suggestion, vous pouvez ouvrir une issue ou nous contacter via [_ldr_tech_daeu_ospo@francetravail.fr](mailto:_ldr_tech_daeu_ospo@francetravail.fr).

## Licence et identité visuelle

Le code source de ce site est publié sous [licence MIT](./LICENSE).

La licence du code **ne couvre pas** les logotypes, marques et éléments
d'identité visuelle de France Travail et de la République française, ni la
typographie Marianne. Ces ressources restent soumises à leurs conditions
d'utilisation propres. Un fork extérieur à France Travail doit les remplacer
et ne pas créer de confusion avec un service officiel.

Voir [`NOTICE.md`](./NOTICE.md) pour le détail des exclusions et les consignes
de réutilisation.

---
