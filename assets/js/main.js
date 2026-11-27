// JS aktiv -> erlaubt progressive Enhancements (z. B. Scroll-Reveal).
// Ohne JS greift ".js .reveal" nicht, Inhalte bleiben sichtbar.
document.documentElement.classList.add("js");

document.addEventListener("includes:loaded", () => {

  // ===== Jahr im Footer =====
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  // ===== Active Menu =====
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("header .nav a").forEach(a => {
    const href = (a.getAttribute("href") || "").split("#")[0];
    if (href === path && !a.classList.contains("logo-link")) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }
  });


  // ===== Mobile-Navigation (Hamburger) =====
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    });
    // Menü schließen, sobald ein Link angetippt wird
    navLinks.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Menü öffnen");
      }
    });
  }


  // ===== Öffnungszeiten =====
  const dot = document.getElementById("openDot");
  const txt = document.getElementById("openText");

  if (dot && txt) {

    // Öffnungszeiten Verkauf/Beratung (bestätigt):
    // Mo–Fr 07:30–12:00 & 13:00–17:30 · Sa 07:30–12:30 · So geschlossen
    function isOpenNow(){
      const now = new Date();
      const day = now.getDay();
      const mins = now.getHours()*60 + now.getMinutes();

      if (day === 0) return false;                              // Sonntag
      if (day === 6) return mins >= (7*60+30) && mins <= (12*60+30); // Sa 07:30–12:30

      // Mo–Fr: Vormittag 07:30–12:00 ODER Nachmittag 13:00–17:30
      return (mins >= (7*60+30) && mins <= (12*60))
          || (mins >= (13*60)   && mins <= (17*60+30));
    }

    const open = isOpenNow();

    if (!open) {
      dot.style.background = "#d71920";
      dot.style.boxShadow = "0 0 0 6px rgba(215,25,32,.12)";
      txt.textContent = "Wir haben geschlossen";
    } else {
      txt.textContent = "Wir haben geöffnet";
    }
  }


  // ===== Ansprechpartner-Klick =====
  const people = document.querySelectorAll(".person-card");
  const topicSelect = document.getElementById("topic");
  const formCard = document.querySelector(".form-card");

  if (people.length && topicSelect && formCard) {

    function flashForm() {
      formCard.classList.add("flash");
      window.setTimeout(() => formCard.classList.remove("flash"), 900);
    }

    function setSelectByName(name) {
      const options = Array.from(topicSelect.options);
      let found = options.find(o => (o.value || "").trim() === name.trim());

      if (!found) {
        found = options.find(o => (o.textContent || "").includes(name));
      }

      if (found) {
        topicSelect.value = found.value;
      }
    }

    people.forEach(card => {
      card.style.cursor = "pointer";

      card.addEventListener("click", (e) => {
        // Wenn Tel-Link geklickt wird → normales Verhalten
        if (e.target.closest("a")) return;

        const nameEl = card.querySelector("h3");
        if (!nameEl) return;

        const name = nameEl.textContent.trim();
        setSelectByName(name);

        formCard.scrollIntoView({ behavior: "smooth", block: "start" });
        flashForm();
      });
    });
  }


  // ===== Fehleranzeige bei ?status=error =====
  const statusBox = document.getElementById("formStatus");

  if (statusBox) {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");

    if (status === "error") {
      statusBox.innerHTML = `
        <div class="form-status error">
          Beim Absenden ist ein Fehler aufgetreten. 
          Bitte prüfen Sie Ihre Eingaben und versuchen Sie es erneut.
        </div>
      `;
      statusBox.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }


  // ===== Rechner -> Kontakt: Nachricht vorbefüllen =====
  // Wird der Kontakt per "Menge anfragen" aus dem Baustoff-Rechner geöffnet,
  // steht das Ergebnis als ?anfrage=... in der URL und füllt die Nachricht vor.
  const anfrage = new URLSearchParams(window.location.search).get("anfrage");
  const msgField = document.getElementById("message");
  if (anfrage && msgField && !msgField.value) {
    msgField.value =
      "Anfrage über den Baustoff-Rechner:\n" + anfrage +
      "\n\nBitte um ein unverbindliches Angebot. Vielen Dank!";
  }


  // ===== Google Maps: Zwei-Klick-Consent =====
  // Die Karte wird erst nach aktivem Klick geladen – vorher keine Verbindung zu Google.
  document.querySelectorAll(".map-consent").forEach(box => {
    const btn = box.querySelector(".map-consent-btn");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const src = box.getAttribute("data-map-src");
      if (!src) return;

      const iframe = document.createElement("iframe");
      iframe.src = src;
      iframe.title = box.getAttribute("data-map-title") || "Karte";
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      iframe.setAttribute("allowfullscreen", "");

      box.replaceWith(iframe);
    });
  });


  // ===== Scroll-Reveal (sanfte Einblendung beim Scrollen) =====
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add("is-visible"));
  }

});