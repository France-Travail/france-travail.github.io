async function loadStats() {
  const grid = document.getElementById("stats-grid");
  if (!grid) return;

  try {
    // Afficher un état de chargement
    grid.innerHTML = `
      <div class="stat-card loading">
        <div class="loading-spinner"></div>
      </div>
      <div class="stat-card loading">
        <div class="loading-spinner"></div>
      </div>
      <div class="stat-card loading">
        <div class="loading-spinner"></div>
      </div>
      <div class="stat-card loading">
        <div class="loading-spinner"></div>
      </div>
    `;

    // Charger les données des métriques depuis le fichier principal
    const response = await fetch("./data/metrics_public.json");
    const data = await response.json();

    if (!data.summary) {
      throw new Error("Données de métriques non disponibles");
    }

    const stats = data.summary;

    // Rendu des stats en grille pour hero section bleue
    grid.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-number">${stats.total_repositories}</span>
          <span class="stat-label" data-i18n="stat_repositories">dépôts</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-number">${stats.total_stars}</span>
          <span class="stat-label" data-i18n="stat_stars">stars</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-number">${stats.total_forks}</span>
          <span class="stat-label" data-i18n="stat_forks">forks</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-number">${stats.total_contributors}</span>
          <span class="stat-label" data-i18n="stat_contributors">contributeurs</span>
        </div>
      </div>
    `;

    // Appliquer les traductions aux nouveaux éléments
    if (typeof window.applyTranslations === 'function') {
      const currentLang = localStorage.getItem("lang") || "fr";
      const basePath = "./";
      const response = await fetch(`${basePath}local/${currentLang}.json`);
      const dict = await response.json();
      window.applyTranslations(dict);
    }

  } catch (error) {
    console.error("Erreur lors du chargement des métriques :", error);
    grid.innerHTML = `
      <div class="stat-card error">
        <div class="stat-icon">⚠️</div>
        <div class="stat-label" data-i18n="stats_error">Impossible de charger les métriques</div>
      </div>
    `;
    
    // Appliquer les traductions même en cas d'erreur
    if (typeof window.applyTranslations === 'function') {
      const currentLang = localStorage.getItem("lang") || "fr";
      const basePath = "./";
      const response = await fetch(`${basePath}local/${currentLang}.json`);
      const dict = await response.json();
      window.applyTranslations(dict);
    }
  }
}

// Rendre la fonction globale
window.loadStats = loadStats;

document.addEventListener("DOMContentLoaded", loadStats);
