document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  navbar.innerHTML = `
    <nav class="navbar">
      <div class="navbar-container">
        <a href="../index.html" class="navbar-logo">
          <img src="../img/logo-ft.png" alt="France Travail logo" height="80" />
        </a>
        <ul class="navbar-links">
          <li><a href="../index.html" data-i18n="home">Accueil</a></li>
          <li><a href="../projets.html" data-i18n="projects">Projets</a></li>
          <li><button id="lang-switch" class="lang-button">En</button></li>
        </ul>
      </div>
    </nav>
  `;
});
