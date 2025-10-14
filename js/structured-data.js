// Script pour ajouter les données structurées JSON-LD aux pages de projets
function addProjectStructuredData(project) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": project.name,
    "description": project.description,
    "url": project.repo,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web",
    "programmingLanguage": "Multiple",
    "license": "Open Source",
    "author": {
      "@type": "Organization",
      "name": "France Travail",
      "url": "https://france-travail.github.io/"
    },
    "keywords": project.tags.join(", "),
    "datePublished": project.lastUpdate,
    "dateModified": project.lastUpdate,
    "maintainer": project.maintainers.length > 0 ? {
      "@type": "Person",
      "name": project.maintainers[0]
    } : {
      "@type": "Organization", 
      "name": "France Travail"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR"
    }
  };

  // Créer et ajouter le script JSON-LD
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
}

// Fonction pour ajouter les données structurées de la page d'accueil
function addHomepageStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "France Travail Open Source",
    "url": "https://france-travail.github.io/",
    "description": "Catalogue des projets open source de France Travail pour l'innovation dans les services publics numériques",
    "inLanguage": ["fr", "en"],
    "publisher": {
      "@type": "Organization",
      "name": "France Travail",
      "url": "https://france-travail.github.io/",
      "logo": "https://france-travail.github.io/img/logo-ft.png"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://france-travail.github.io/projets.html?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
}

// Fonction pour ajouter les données structurées d'une page de thème
function addThemeStructuredData(theme) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": theme.title,
    "description": theme.longDescription,
    "url": `https://france-travail.github.io/themes/${theme.slug}.html`,
    "inLanguage": ["fr", "en"],
    "mainEntity": {
      "@type": "ItemList",
      "name": `Projets ${theme.title}`,
      "description": theme.longDescription
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Accueil",
          "item": "https://france-travail.github.io/"
        },
        {
          "@type": "ListItem", 
          "position": 2,
          "name": theme.title,
          "item": `https://france-travail.github.io/themes/${theme.slug}.html`
        }
      ]
    }
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
}
