async function loadAllProjects() {
  const container = document.getElementById("projects-container");

  if (!container) {
    console.warn("❌ Impossible de charger les projets : container manquant.");
    return;
  }

  try {
    // Déterminer la langue actuelle
    const currentLang = localStorage.getItem("lang") || "fr";
    const projectsFile = currentLang === "en" ? "../data/projects-en.json" : "../data/projects.json";
    
    const res = await fetch(projectsFile);
    const allProjects = await res.json();

    if (allProjects.length === 0) {
      container.innerHTML = `<p data-i18n="no_projects">Aucun projet trouvé pour le moment.</p>`;
      return;
    }

    container.innerHTML = allProjects.map((p) => renderProjectCard(p)).join("");
  } catch (error) {
    console.error("Erreur lors du chargement des projets :", error);
    container.innerHTML = `<p data-i18n="load_error">Erreur lors du chargement des projets.</p>`;
  }
}

// Fonction pour générer des couleurs aléatoires pour les bulles de projets
function getRandomProjectColor() {
  const colors = [
    "#008ece",
    "#283276", 
    "#e1010e",
    "#ffe000",
    "#f29fc4"
  ];
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

// Rendre la fonction globale
window.loadAllProjects = loadAllProjects;
window.getRandomProjectColor = getRandomProjectColor;

document.addEventListener("DOMContentLoaded", loadAllProjects);

function renderProjectCard(project) {
  const {
    name,
    description,
    repo,
    tags = [],
    logo,
    maintainers = [],
    lastUpdate,
    status,
    external,
    inProgress,
  } = project;

  const maintainerLinks = maintainers.map((m) => {
    const githubId = m.trim().toLowerCase();
    return `<a href="https://github.com/${githubId}" target="_blank" rel="noopener">${m}</a>`;
  });

  // Associer une couleur fixe à chaque catégorie
  const categoryColors = {
    "accessibilite&inclusion": "#008ece",  // Bleu clair pour accessibilité
    "eco": "#ffe000",                       // Jaune pour éco-conception
    "ia": "#e1010e",                        // Rouge pour IA
    "architecture": "#283276",              // Bleu foncé pour architecture
    "si-plateforme": "#f29fc4"             // Rose pour SI plateforme
  };
  
  const projectColor = categoryColors[project.category] || "#0053a4"; // Couleur par défaut
  console.log(`Projet ${name} (${project.category}): couleur ${projectColor}`);

  return `
    <div class="project-card">
      ${
        logo && logo.trim() !== ""
          ? `<img src="../${logo}" alt="${name} logo">`
          : `<div class="project-icon" style="width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: bold; color: white; margin: 0 auto 1rem auto; background: ${projectColor} !important; box-shadow: 0 4px 12px rgba(0, 83, 164, 0.3); transition: all 0.3s ease;">${name.charAt(0).toUpperCase()}</div>`
      }
      <h3>${name}</h3>
      <p>${description}</p>

      ${status ? `<p><strong data-i18n="status">Statut</strong>: ${status}</p>` : ""}
      ${
        lastUpdate
          ? `<p><strong data-i18n="last_update">Dernière mise à jour</strong>: ${formatDate(
              lastUpdate
            )}</p>`
          : ""
      }
      ${
        maintainers.length
          ? `<p><strong data-i18n="${maintainers.length > 1 ? 'maintainers_plural' : 'maintainers'}">Mainteneur${
              maintainers.length > 1 ? "s" : ""
            }</strong>: ${maintainerLinks.join(", ")}</p>`
          : ""
      }

      ${
        tags.length
          ? `
        <div style="margin: 0.5rem 0;">
          ${tags.map((tag) => `<span class="tag">${tag}</span>`).join(" ")}
        </div>`
          : ""
      }

      <div class="project-actions">
        ${!inProgress ? `<a class="button" href="${repo}" target="_blank" rel="noopener">
          ${external ? '<span data-i18n="view_external">Voir le projet externe ↗</span>' : '<span data-i18n="view_github">Voir sur GitHub ↗</span>'}
        </a>` : ''}
        <div class="share-buttons">
          <button class="share-btn" onclick="shareProject('${name}', '${repo}')" title="Partager ce projet">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
            </svg>
          </button>
          <button class="share-btn" onclick="copyProjectLink('${repo}')" title="Copier le lien">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

function formatDate(dateStr) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", options);
}

// Fonctions de partage
function shareProject(name, repo) {
  if (navigator.share) {
    navigator.share({
      title: `Projet ${name} - France Travail Open Source`,
      text: `Découvrez le projet ${name} sur le catalogue open source de France Travail`,
      url: repo
    });
  } else {
    // Fallback : copier le lien
    copyProjectLink(repo);
  }
}

function copyProjectLink(repo) {
  navigator.clipboard.writeText(repo).then(() => {
    // Afficher une notification temporaire
    const notification = document.createElement('div');
    notification.textContent = 'Lien copié !';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #0053a4;
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      z-index: 1000;
      font-size: 14px;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  });
}

// Rendre les fonctions globales
window.shareProject = shareProject;
window.copyProjectLink = copyProjectLink;
