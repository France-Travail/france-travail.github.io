document.addEventListener("DOMContentLoaded", async () => {
  const main = document.querySelector("main");
  const container = document.querySelector("#projects-container");

  if (!main || !container) return;

  const category = container.dataset.category;
  if (!category) return;

  try {
    const res = await fetch("../data/themes.json");
    const themes = await res.json();

    const theme = themes.find((t) => t.slug === category);
    if (!theme) return;

    // Création du H1 avec image
    const h1 = document.createElement("h1");
    h1.style.display = "flex";
    h1.style.alignItems = "center";
    h1.style.gap = "0.75rem";

    if (theme.icon) {
      const img = document.createElement("img");
      img.src = theme.icon;
      img.alt = `${theme.title} icon`;
      img.style.height = "32px";
      img.style.verticalAlign = "middle";
      h1.appendChild(img);
    }

    const span = document.createElement("span");
    span.textContent = theme.title;
    h1.appendChild(span);

    // Paragraphe description
    const p = document.createElement("p");
    p.textContent = theme.longDescription;

    // Injecter dans le DOM
    main.insertBefore(h1, container);
    main.insertBefore(p, container);
  } catch (e) {
    console.error("Erreur de chargement des thèmes :", e);
  }
});
