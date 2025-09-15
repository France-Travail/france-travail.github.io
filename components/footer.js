document.addEventListener("DOMContentLoaded", () => {
  const footer = document.querySelector("footer");
  if (!footer) return;

  footer.innerHTML = `
    <div class="footer-content">
      <img
        src="../img/logo-ft-only.png"
        alt="France Travail"
        class="icon"
      />
      <p>
        <a href="https://francetravail.io" target="_blank" rel="noopener">
          &copy; <span id="year">${new Date().getFullYear()}</span> France Travail
        </a>
        —
        <img src="../img/icon-mail.svg" alt="Mail" class="icon" />
        <a href="mailto:oss.00619@francetravail.fr">oss.00619@francetravail.fr</a>
        —
        <img src="../img/icon-github.png" alt="GitHub" class="icon" />
        <a href="https://github.com/France-Travail" target="_blank" rel="noopener">GitHub</a>
        —
        <img src="../img/icon-francetravail-io.svg" alt="Site" class="icon" />
        <a href="https://francetravail.io" target="_blank" rel="noopener">FranceTravail.io</a>
      </p>
      <img
        src="../img/logo-ft-only.png"
        alt="France Travail"
        class="icon"
      />
    </div>
  `;
});
