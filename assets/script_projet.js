/* ==========================================================
   REDIRECTION DU SCROLL FLUIDE VERS LA GALERIE D'IMAGES
   ========================================================== */
const galerieProjet = document.querySelector(".projets_image");

if (galerieProjet) {
  let scrollCible = galerieProjet.scrollTop;
  let enCoursDAnimation = false;

  // Ajuste cette valeur entre 0.06 (très doux/lent) et 0.15 (plus réactif)
  const souplesse = 0.08;

  function animerScroll() {
    const distance = scrollCible - galerieProjet.scrollTop;

    if (Math.abs(distance) > 0.5) {
      galerieProjet.scrollTop += distance * souplesse;
      requestAnimationFrame(animerScroll);
    } else {
      galerieProjet.scrollTop = scrollCible;
      enCoursDAnimation = false;
    }
  }

  window.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();

      // Synchronise si l'utilisateur a scrollé autrement (ex. barre d'espace)
      if (!enCoursDAnimation) {
        scrollCible = galerieProjet.scrollTop;
      }

      const maxScroll = galerieProjet.scrollHeight - galerieProjet.clientHeight;
      scrollCible = Math.max(0, Math.min(scrollCible + e.deltaY, maxScroll));

      if (!enCoursDAnimation) {
        enCoursDAnimation = true;
        requestAnimationFrame(animerScroll);
      }
    },
    { passive: false }
  );
}

/* ==========================================================
     LOUPE RECTANGULAIRE AU SURVOL DES IMAGES DE PROJETS
     ========================================================== */
  const imagesProjet = document.querySelectorAll(".projets_image img");

  if (imagesProjet.length > 0) {
    const loupe = document.createElement("div");
    loupe.classList.add("loupe-projet");
    document.body.appendChild(loupe);

    const niveauZoom = 2.2;
    let imageActive = null;
    let dernierePosX = 0;
    let dernierePosY = 0;

    function mettreAJourLoupe() {
      if (!imageActive) return;

      const rect = imageActive.getBoundingClientRect();

      // Vérifie si le curseur est toujours au-dessus de l'image pendant/après le scroll
      const estSurImage =
        dernierePosX >= rect.left &&
        dernierePosX <= rect.right &&
        dernierePosY >= rect.top &&
        dernierePosY <= rect.bottom;

      if (!estSurImage) {
        loupe.classList.remove("est-visible");
        imageActive = null;
        return;
      }

      loupe.style.left = `${dernierePosX}px`;
      loupe.style.top = `${dernierePosY}px`;

      const posX = dernierePosX - rect.left;
      const posY = dernierePosY - rect.top;

      const largeurZoom = rect.width * niveauZoom;
      const hauteurZoom = rect.height * niveauZoom;
      const bgX = -(posX * niveauZoom - loupe.offsetWidth / 2);
      const bgY = -(posY * niveauZoom - loupe.offsetHeight / 2);

      loupe.style.backgroundSize = `${largeurZoom}px ${hauteurZoom}px`;
      loupe.style.backgroundPosition = `${bgX}px ${bgY}px`;
    }

    imagesProjet.forEach((img) => {
      img.addEventListener("mouseenter", (e) => {
        imageActive = img;
        dernierePosX = e.clientX;
        dernierePosY = e.clientY;
        loupe.style.backgroundImage = `url("${img.src}")`;
        loupe.classList.add("est-visible");
        mettreAJourLoupe();
      });

      img.addEventListener("mousemove", (e) => {
        imageActive = img;
        dernierePosX = e.clientX;
        dernierePosY = e.clientY;
        mettreAJourLoupe();
      });

      img.addEventListener("mouseleave", () => {
        loupe.classList.remove("est-visible");
        imageActive = null;
      });
    });

    // Met à jour le zoom en continu pendant que la galerie défile sous le curseur
    const conteneurGalerie = document.querySelector(".projets_image");
    if (conteneurGalerie) {
      conteneurGalerie.addEventListener("scroll", mettreAJourLoupe);
    }
    window.addEventListener("scroll", mettreAJourLoupe);
  }



  // Réinitialise la mémoire du loader au clic sur le logo
  document.querySelectorAll(".logo-link").forEach((logo) => {
    logo.addEventListener("click", () => {
      sessionStorage.removeItem("loaderDejaVu");
    });
  });