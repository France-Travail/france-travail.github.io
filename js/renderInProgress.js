async function loadInProgress() {
  const section = document.getElementById("inprogress-section");
  const grid = document.getElementById("inprogress-grid");
  if (!section || !grid) return;

  try {
    const currentLang = localStorage.getItem("lang") || "fr";
    const file = currentLang === "en" ? "./data/projects-en.json" : "./data/projects.json";
    const response = await fetch(file);
    const all = await response.json();
    const items = all.filter((p) => p.inProgress === true);

    if (!items.length) {
      section.style.display = "none";
      grid.innerHTML = "";
      return;
    }

    section.style.display = "block";
    grid.innerHTML = items
      .map((p) => {
        const name = p.name || "";
        const description = p.description || "";
        const logo = (p.logo || "").trim();
        const repo = p.repo || "#";
        const lastUpdate = p.lastUpdate || "";

        return `
          <article class="inprogress-card">
            ${
              logo
                ? `<img src="${logo.startsWith("/") ? logo : "./" + logo}" alt="${name} logo" class="inprogress-logo">`
                : `<div class="project-icon" aria-hidden="true">${name.charAt(0).toUpperCase()}</div>`
            }
            <h3>${name}</h3>
            <p class="inprogress-resume">${description}</p>
            <p class="inprogress-meta"><strong data-i18n="last_update">Dernière mise à jour</strong>: <span>${lastUpdate}</span></p>
            <a class="button inprogress-button" href="${repo}" target="_blank" rel="noopener noreferrer" data-i18n="view_github">Voir sur GitHub ↗</a>
          </article>
        `;
      })
      .join("");
  } catch (e) {
    console.error("Erreur chargement inProgress:", e);
    if (grid) {
      grid.innerHTML = `<p data-i18n="load_error">Erreur lors du chargement des projets.</p>`;
      section.style.display = "block";
    }
  }
}

window.loadInProgress = loadInProgress;
document.addEventListener("DOMContentLoaded", loadInProgress);



