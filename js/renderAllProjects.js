document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("projects-container");

  if (!container) {
    console.warn("❌ Impossible de charger les projets : container manquant.");
    return;
  }

  try {
    const res = await fetch("../data/projects.json");
    const allProjects = await res.json();

    if (allProjects.length === 0) {
      container.innerHTML = `<p>Aucun projet trouvé pour le moment.</p>`;
      return;
    }

    container.innerHTML = allProjects.map((p) => renderProjectCard(p)).join("");
  } catch (error) {
    console.error("Erreur lors du chargement des projets :", error);
    container.innerHTML = `<p>Erreur lors du chargement des projets.</p>`;
  }
});

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
          ? `<img src="../${logo}" alt="${name} logo" style="max-height: 60px; margin-bottom: 0.5rem;">`
          : ""
      }
      <h3>${name}</h3>
      <p>${description}</p>

      ${status ? `<p><strong>Statut :</strong> ${status}</p>` : ""}
      ${
        lastUpdate
          ? `<p><strong>Dernière mise à jour :</strong> ${formatDate(
              lastUpdate
            )}</p>`
          : ""
      }
      ${
        maintainers.length
          ? `<p><strong>Mainteneur${
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
        ${external ? "Voir le projet externe ↗" : "Voir sur GitHub ↗"}
      </a>
    </div>
  `;
}

function formatDate(dateStr) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", options);
}
