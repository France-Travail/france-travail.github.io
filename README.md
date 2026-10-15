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

## 💬 Contact

Pour toute question ou suggestion, vous pouvez ouvrir une issue ou nous contacter via [sioss.00006@francetravail.fr](mailto:sioss.00006@francetravail.fr).

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
