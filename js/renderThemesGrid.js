document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("themes-grid");
  if (!grid) return;

  try {
    const response = await fetch("./data/themes.json");
    const themes = await response.json();

    grid.innerHTML = themes
      .map(
        (theme) => `
        <a class="theme-card" href="./themes/${theme.slug}.html">
          <div class="theme-icon-wrapper">
            <img src="${theme.icon}" alt="${theme.title} icon" class="theme-icon" />
          </div>
          <h2>${theme.title}</h2>
          <p>${theme.shortDescription}</p>
        </a>
      `
      )
      .join("");
  } catch (error) {
    console.error("Erreur lors du chargement des thèmes :", error);
    grid.innerHTML = "<p>Impossible de charger les thèmes pour le moment.</p>";
  }
});
