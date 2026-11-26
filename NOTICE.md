# Mentions relatives aux licences et à l'identité visuelle

## Code source

Sauf mention contraire, le code source de ce site est mis à disposition sous
licence MIT. Le texte complet figure dans le fichier [`LICENSE`](./LICENSE).

## Éléments exclus de la licence MIT

La licence MIT du code source ne couvre pas :

- les marques, noms, logotypes et éléments d'identité visuelle de France
  Travail et de la République française ;
- les fichiers présents dans `img/logos/` et les déclinaisons de ces éléments ;
- la typographie Marianne présente dans `fonts/`, qui est soumise à ses propres
  conditions d'utilisation ;
- les contenus, noms, logotypes et marques propres aux projets référencés dans
  le catalogue, qui restent soumis à leurs licences et conditions respectives.

Le fait que ces éléments soient accessibles dans un dépôt public ne leur
confère pas une licence open source et n'autorise pas leur réutilisation hors
du cadre prévu par leurs titulaires.

## Réutilisation et forks

Une personne ou une organisation qui réutilise le code de ce site sans agir
pour le compte de France Travail doit notamment :

1. remplacer les logotypes et autres éléments de marque de France Travail et
   de la République française ;
2. remplacer la typographie Marianne par une police dont la licence autorise
   son usage (par exemple une police libre ou une police système) ;
3. adopter une identité visuelle qui ne crée aucune confusion avec un service
   officiel de France Travail ou de l'État ;
4. vérifier séparément la licence de chaque projet présenté ou réutilisé.

## Design System France Travail

Le site utilise le Design System France Travail (DSFT) : sa feuille de style
(tokens de couleurs, typographie, espacements, classes), sa police d'icônes et
plusieurs de ses webcomposants. GitHub Pages n'ayant pas accès au registre npm
interne de France Travail, une copie de ces fichiers est embarquée dans
`vendor/dsft/`. Elle provient des builds de production publiés sur le CDN du DS
(`cdn.francetravail.fr`) ; les sources sont publiques sur
<https://github.com/France-Travail/webco-design-system>.

| Dossier | Contenu | Version | Licence |
| --- | --- | --- | --- |
| `vendor/dsft/design-system/` | `styles.css` et police d'icônes `ft-icons.woff2` | 1.63.0 | `styles.css` : MIT (France Travail), embarque Bootstrap 4.6.2 (MIT) ; `ft-icons.woff2` : police distribuée par le DS avec sa feuille de style, sans licence propre indiquée dans le fichier |
| `vendor/dsft/ft-alert/` | webcomposant `<ft-alert>` | 1.8.3 | MIT (France Travail) |
| `vendor/dsft/ft-breadcrumb/` | webcomposant `<ft-breadcrumb>` | 1.2.2 | MIT (France Travail) |
| `vendor/dsft/ft-spinner/` | webcomposant `<ft-spinner>` | 1.1.0 | MIT (France Travail) |
| `vendor/dsft/ft-collapse-directive/` | directive `data-ft-collapse` | 1.3.2 | MIT (France Travail) |
| `vendor/dsft/ft-tooltip-directive/` | directive `data-ft-tooltip` | 1.5.0 | MIT (France Travail) ; embarque Floating UI et le sanitizer de Bootstrap, MIT (voir `THIRD_PARTY_LICENCES.txt`) |
| `vendor/dsft/ft-dropdown-directive/` | directive `data-ft-dropdown`, utilisée par le fil d'Ariane sur mobile | 1.7.0 | MIT (France Travail) |

Chaque dossier contient le texte de sa licence. Le fichier
`vendor/dsft/manifest.json` donne la source, l'empreinte SHA-256 et les
correctifs de chaque fichier. Deux correctifs seulement sont appliqués par
`scripts/vendor-dsft.mjs` : les composants chargent la copie locale de la
feuille de style (via `globalThis.FT_DS_STYLE_URL`, défini dans `js/dsft.js`)
au lieu de celle du CDN, et les polices Marianne déclarées par `styles.css`
pointent vers le dossier `fonts/` du site. Pour mettre la copie à jour :
`npm run vendor:dsft`.

Les éléments de marque et autres ressources du Design System soumis à des
conditions spécifiques (logotypes, Marianne, illustrations) restent exclus de
la licence MIT, comme indiqué plus haut.

Pour toute question relative à la réutilisation de ce site ou à l'open source
chez France Travail : `_ldr_tech_daeu_ospo@francetravail.fr`.
