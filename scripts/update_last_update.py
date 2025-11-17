#!/usr/bin/env python3
"""
Script pour mettre à jour les dates lastUpdate dans projects.json et projects-en.json
à partir des données de metrics_public.json
"""

import json
import re
import sys
from pathlib import Path
from typing import Dict, Optional


def extract_repo_name(repo_url: str) -> Optional[str]:
    """Extrait le nom du repository depuis une URL GitHub."""
    if not repo_url:
        return None
    match = re.search(r"github\.com/[^/]+/([^/]+)", repo_url)
    return match.group(1) if match else None


def normalize_repo_url(url: str) -> str:
    """Normalise une URL de repository pour la comparaison."""
    return url.rstrip('/').lower()


def load_metrics_mapping(metrics_path: Path) -> Dict[str, str]:
    """
    Charge metrics_public.json et crée un mapping:
    - repo_name -> last_update
    - repo_url -> last_update
    """
    with open(metrics_path, 'r', encoding='utf-8') as f:
        metrics_data = json.load(f)
    
    mapping = {}
    
    if 'repositories' in metrics_data:
        for repo in metrics_data['repositories']:
            repo_name = repo.get('name')
            repo_url = repo.get('url', '')
            last_update = repo.get('last_update')
            
            if last_update:
                # Mapping par nom de repo
                if repo_name:
                    mapping[repo_name.lower()] = last_update
                
                # Mapping par URL normalisée
                if repo_url:
                    mapping[normalize_repo_url(repo_url)] = last_update
    
    return mapping


def update_projects_file(projects_path: Path, metrics_mapping: Dict[str, str]) -> bool:
    """
    Met à jour les dates lastUpdate dans un fichier de projets.
    Retourne True si des modifications ont été faites.
    """
    with open(projects_path, 'r', encoding='utf-8') as f:
        projects = json.load(f)
    
    updated = False
    
    for project in projects:
        repo_url = project.get('repo', '')
        if not repo_url:
            continue
        
        # Essayer de trouver la date par URL normalisée
        normalized_url = normalize_repo_url(repo_url)
        last_update = metrics_mapping.get(normalized_url)
        
        # Si pas trouvé par URL, essayer par nom de repo
        if not last_update:
            repo_name = extract_repo_name(repo_url)
            if repo_name:
                last_update = metrics_mapping.get(repo_name.lower())
        
        # Mettre à jour si on a trouvé une date et qu'elle est différente
        if last_update and project.get('lastUpdate') != last_update:
            project['lastUpdate'] = last_update
            updated = True
            print(f"✓ Mis à jour {project.get('name', 'Unknown')}: {project.get('lastUpdate')} -> {last_update}")
    
    if updated:
        # Sauvegarder avec indentation pour garder le format lisible
        with open(projects_path, 'w', encoding='utf-8') as f:
            json.dump(projects, f, ensure_ascii=False, indent=2)
            f.write('\n')  # Ajouter un saut de ligne à la fin
    
    return updated


def main():
    """Fonction principale."""
    # Déterminer le répertoire de base (racine du projet)
    script_dir = Path(__file__).parent
    base_dir = script_dir.parent
    
    data_dir = base_dir / 'data'
    metrics_path = data_dir / 'metrics_public.json'
    projects_fr_path = data_dir / 'projects.json'
    projects_en_path = data_dir / 'projects-en.json'
    
    # Vérifier que les fichiers existent
    if not metrics_path.exists():
        print(f"❌ Erreur: {metrics_path} n'existe pas", file=sys.stderr)
        sys.exit(1)
    
    if not projects_fr_path.exists():
        print(f"❌ Erreur: {projects_fr_path} n'existe pas", file=sys.stderr)
        sys.exit(1)
    
    if not projects_en_path.exists():
        print(f"❌ Erreur: {projects_en_path} n'existe pas", file=sys.stderr)
        sys.exit(1)
    
    print("📊 Chargement des métriques...")
    metrics_mapping = load_metrics_mapping(metrics_path)
    print(f"   {len(metrics_mapping)} repositories trouvés dans metrics_public.json\n")
    
    print("🔄 Mise à jour de projects.json...")
    updated_fr = update_projects_file(projects_fr_path, metrics_mapping)
    
    print("\n🔄 Mise à jour de projects-en.json...")
    updated_en = update_projects_file(projects_en_path, metrics_mapping)
    
    if updated_fr or updated_en:
        print("\n✅ Mise à jour terminée avec succès!")
        sys.exit(0)
    else:
        print("\nℹ️  Aucune mise à jour nécessaire.")
        sys.exit(0)


if __name__ == '__main__':
    main()

