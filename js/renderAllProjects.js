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

// Rendre la fonction globale
window.loadAllProjects = loadAllProjects;

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
  } = project;

  const maintainerLinks = maintainers.map((m) => {
    const githubId = m.trim().toLowerCase();
    return `<a href="https://github.com/${githubId}" target="_blank" rel="noopener">${m}</a>`;
  });

  return `
    <div class="project-card">
      ${
        logo
          ? `<img src="../${logo}" alt="${name} logo">`
          : ""
      }
      <h3>${name}</h3>
      <p>${description}</p>

      ${status ? `<p><strong data-i18n="status">Statut :</strong> ${status}</p>` : ""}
      ${
        lastUpdate
          ? `<p><strong data-i18n="last_update">Dernière mise à jour :</strong> ${formatDate(
              lastUpdate
            )}</p>`
          : ""
      }
      ${
        maintainers.length
          ? `<p><strong data-i18n="${maintainers.length > 1 ? 'maintainers_plural' : 'maintainers'}">Mainteneur${
              maintainers.length > 1 ? "s" : ""
            } :</strong> ${maintainerLinks.join(", ")}</p>`
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

      <a class="button" href="${repo}" target="_blank" rel="noopener">
        ${external ? '<span data-i18n="view_external">Voir le projet externe ↗</span>' : '<span data-i18n="view_github">Voir sur GitHub ↗</span>'}
      </a>
    </div>
  `;
}

function formatDate(dateStr) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", options);
}
