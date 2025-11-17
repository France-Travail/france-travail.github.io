# Scripts d'automatisation

## update_last_update.py

Script Python qui met à jour automatiquement les dates `lastUpdate` dans les fichiers `projects.json` et `projects-en.json` à partir des données de `metrics_public.json`.

### Fonctionnement

1. Le script charge `data/metrics_public.json` qui contient les métriques de tous les repositories GitHub de l'organisation France-Travail
2. Pour chaque projet dans `projects.json` et `projects-en.json`, il :
   - Extrait le nom du repository depuis l'URL GitHub
   - Trouve le repository correspondant dans `metrics_public.json`
   - Met à jour le champ `lastUpdate` avec la valeur `last_update` du fichier de métriques

### Correspondance des projets

Le script fait la correspondance entre les projets de deux façons :
- Par URL normalisée (recommandé) : compare les URLs GitHub normalisées
- Par nom de repository : extrait le nom du repo depuis l'URL et le compare

### Utilisation

#### Exécution locale

```bash
python3 scripts/update_last_update.py
```

#### Exécution via GitHub Actions

Le script est automatiquement exécuté par le workflow GitHub Actions `.github/workflows/update-last-update.yml` dans les cas suivants :

- **Déclenchement manuel** : via l'interface GitHub Actions
- **Déclenchement automatique** : tous les jours à 6h UTC
- **Déclenchement sur modification** : quand le fichier `data/metrics_public.json` est modifié (par la CI du projet externe)

### Notes

- Si un projet n'est pas trouvé dans `metrics_public.json`, sa date `lastUpdate` n'est pas modifiée
- Le script préserve le formatage JSON avec une indentation de 2 espaces
- Les modifications sont automatiquement commitées et poussées sur la branche principale si des changements sont détectés

