document.addEventListener("DOMContentLoaded", () => {
  /* ==========================================================
     0. ÉCRAN DE CHARGEMENT (PREMIÈRE ARRIVÉE, F5 OU CLIC LOGO)
     ========================================================== */
  const loader = document.getElementById("loader");

  // Réinitialise la mémoire du loader au clic sur le logo
  document.querySelectorAll(".logo-link").forEach((logo) => {
    logo.addEventListener("click", () => {
      sessionStorage.removeItem("loaderDejaVu");
    });
  });

  if (loader) {
    const navEntries = performance.getEntriesByType("navigation");
    const estUnRechargement =
      navEntries.length > 0 && navEntries[0].type === "reload";

    const dejaVu = sessionStorage.getItem("loaderDejaVu");

    if (!dejaVu || estUnRechargement) {
      document.body.classList.add("is-loading");
      sessionStorage.setItem("loaderDejaVu", "true");

      // 2.5s sur mobile pour laisser le temps de lire le message, 1.5s sur PC
      const dureeLoader = window.innerWidth <= 768 ? 2500 : 1500;

      setTimeout(() => {
        loader.classList.add("loader-hidden");
        document.body.classList.remove("is-loading");
      }, dureeLoader);
    } else {
      loader.style.display = "none";
    }
  }

  /* ==========================================================
     1. TRI DYNAMIQUE DES PROJETS (AVEC ANIMATION FLIP)
     ========================================================== */
  const filtres = document.querySelectorAll(".filtres a");
  const conteneurProjets = document.querySelector(".all_projets");

  if (conteneurProjets) {
    const lignesProjets = Array.from(
      conteneurProjets.querySelectorAll(".projets_div")
    );

    // Mémorise l'ordre de tri actuel pour chaque colonne (true = croissant, false = décroissant)
    const ordreTri = {
      nom: true,
      type: true,
      contexte: true,
      date: false, // Par défaut, les dates sont du plus récent au plus ancien (2026 -> 2024)
    };

    filtres.forEach((filtre) => {
      filtre.addEventListener("click", (e) => {
        e.preventDefault();

        const critere = filtre.dataset.sort;
        const croissant = ordreTri[critere];

        // 1. FIRST : Enregistre la position verticale de chaque carte avant le tri
        const positionsInitiales = new Map();
        lignesProjets.forEach((projet) => {
          positionsInitiales.set(projet, projet.getBoundingClientRect().top);
        });

        // Trie le tableau
        lignesProjets.sort((a, b) => {
          const valeurA = a
            .querySelector(`.projets_${critere}`)
            .textContent.trim();
          const valeurB = b
            .querySelector(`.projets_${critere}`)
            .textContent.trim();

          if (critere === "date") {
            return croissant
              ? Number(valeurA) - Number(valeurB)
              : Number(valeurB) - Number(valeurA);
          }

          return croissant
            ? valeurA.localeCompare(valeurB, "fr", { sensitivity: "base" })
            : valeurB.localeCompare(valeurA, "fr", { sensitivity: "base" });
        });

        ordreTri[critere] = !croissant;

        filtres.forEach((f) => f.classList.remove("actif"));
        filtre.classList.add("actif");

        // Réorganise les éléments dans le DOM
        lignesProjets.forEach((projet) => conteneurProjets.appendChild(projet));

        // 2. LAST & INVERT : Replace visuellement chaque carte à son point de départ
        lignesProjets.forEach((projet) => {
          const anciennePos = positionsInitiales.get(projet);
          const nouvellePos = projet.getBoundingClientRect().top;
          const decalageY = anciennePos - nouvellePos;

          if (decalageY !== 0) {
            projet.style.transition = "none";
            projet.style.transform = `translateY(${decalageY}px)`;
            projet.style.position = "relative";
            // Les cartes qui remontent passent visuellement au-dessus des autres
            projet.style.zIndex = decalageY > 0 ? "10" : "1";
          }
        });

        // Force le navigateur à enregistrer la position de départ
        conteneurProjets.offsetHeight;

        // 3. PLAY : Fait glisser chaque carte vers sa nouvelle place
        lignesProjets.forEach((projet) => {
          projet.style.transition =
            "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)";
          projet.style.transform = "translateY(0)";

          projet.addEventListener(
            "transitionend",
            () => {
              projet.style.transition = "";
              projet.style.transform = "";
              projet.style.zIndex = "";
              projet.style.position = "";
            },
            { once: true }
          );
        });
      });
    });
  }

  /* ==========================================================
     1B. PREVIEW FLOTTANTE AU SURVOL DES PROJETS (DESKTOP)
     ========================================================== */
  const cadrePreview = document.getElementById("project-preview");
  const imgPreview = cadrePreview ? cadrePreview.querySelector("img") : null;
  const cartesProjets = document.querySelectorAll(".projets_div");

  if (cadrePreview && imgPreview && cartesProjets.length > 0) {
    let sourisX = 0;
    let sourisY = 0;
    let cadreX = 0;
    let cadreY = 0;
    let estVisible = false;

    function animerPreview() {
      // Suivi fluide avec légère inertie
      cadreX += (sourisX - cadreX) * 0.16;
      cadreY += (sourisY - cadreY) * 0.16;

      cadrePreview.style.left = `${cadreX}px`;
      cadrePreview.style.top = `${cadreY}px`;

      if (estVisible) {
        requestAnimationFrame(animerPreview);
      }
    }

    cartesProjets.forEach((carte) => {
      carte.addEventListener("mouseenter", (e) => {
        if (window.innerWidth <= 768) return;

        const srcImage = carte.dataset.preview;
        if (!srcImage) return;

        imgPreview.src = srcImage;

        // Place instantanément le cadre au curseur à l'entrée pour éviter un saut depuis (0,0)
        if (!estVisible) {
          sourisX = e.clientX;
          sourisY = e.clientY;
          cadreX = sourisX;
          cadreY = sourisY;
          cadrePreview.style.left = `${cadreX}px`;
          cadrePreview.style.top = `${cadreY}px`;
          estVisible = true;
          requestAnimationFrame(animerPreview);
        }

        cadrePreview.classList.add("is-visible");
      });

      carte.addEventListener("mousemove", (e) => {
        if (window.innerWidth <= 768) return;
        sourisX = e.clientX;
        sourisY = e.clientY;
      });

      carte.addEventListener("mouseleave", () => {
        estVisible = false;
        cadrePreview.classList.remove("is-visible");
      });
    });
  }

  /* ==========================================================
     2. MENU ACTIF AU SCROLL ET AU CLIC (SCROLLSPY)
     ========================================================== */
  const liensMenu = document.querySelectorAll("header .menu a");

  const sections = [
    { id: "accueil", element: document.querySelector(".hero") },
    { id: "projets", element: document.querySelector(".projets") },
    { id: "propos", element: document.querySelector(".propos") },
    { id: "contact", element: document.querySelector(".contact") },
  ];

  function mettreAJourMenuActif() {
    const positionScroll = window.scrollY + 250;
    let sectionActuelle = "accueil";

    sections.forEach((sec) => {
      if (sec.element && positionScroll >= sec.element.offsetTop) {
        sectionActuelle = sec.id;
      }
    });

    if (
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 50
    ) {
      sectionActuelle = "contact";
    }

    liensMenu.forEach((lien) => {
      lien.classList.toggle(
        "active",
        lien.getAttribute("href") === `#${sectionActuelle}`
      );
    });
  }

  window.addEventListener("scroll", mettreAJourMenuActif);
  mettreAJourMenuActif();

  liensMenu.forEach((lien) => {
    lien.addEventListener("click", () => {
      liensMenu.forEach((l) => l.classList.remove("active"));
      lien.classList.add("active");
    });
  });

  /* ==========================================================
     3. APPARITION FLUIDE DES ÉLÉMENTS AU SCROLL (SCROLL REVEAL)
     ========================================================== */
  const elementsAAnimer = document.querySelectorAll(
    ".hero_content, .hero_text_div > *, .projets h1, .filtres, .projets_div, .propos_content h1, .propos_text h2, .propos_text p, .propos_img, .contact h1, .contact_text > *, .contact_form form > *"
  );

  elementsAAnimer.forEach((el) => {
    el.classList.add("reveal");
  });

  const conteneursCascade = document.querySelectorAll(
    ".hero_text_div, .all_projets, .propos_text, .contact_text, .contact_form form"
  );

  conteneursCascade.forEach((conteneur) => {
    Array.from(conteneur.children).forEach((enfant, index) => {
      enfant.style.transitionDelay = `${index * 0.1}s`;
    });
  });

  const observateurScroll = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");

          setTimeout(() => {
            entry.target.style.transitionDelay = "0s";
          }, 1200);

          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.05,
      rootMargin: "0px 0px -30px 0px",
    }
  );

  elementsAAnimer.forEach((el) => observateurScroll.observe(el));

  /* ==========================================================
     4. ENVOI DU FORMULAIRE SANS RECHARGER LA PAGE (AJAX)
     ========================================================== */
  const formulaireContact = document.querySelector(".contact_form form");

  if (formulaireContact) {
    formulaireContact.addEventListener("submit", async (e) => {
      e.preventDefault();
      const bouton = formulaireContact.querySelector("button[type='submit']");
      const texteInitial = bouton.textContent;

      bouton.textContent = "Envoi en cours...";
      bouton.disabled = true;

      try {
        const reponse = await fetch(formulaireContact.action, {
          method: "POST",
          body: new FormData(formulaireContact),
          headers: { Accept: "application/json" },
        });

        if (reponse.ok) {
          bouton.textContent = "Message envoyé !";
          formulaireContact.reset();
        } else {
          bouton.textContent = "Erreur lors de l'envoi";
        }
      } catch (erreur) {
        bouton.textContent = "Erreur réseau";
      }

      setTimeout(() => {
        bouton.textContent = texteInitial;
        bouton.disabled = false;
      }, 4000);
    });
  }
});