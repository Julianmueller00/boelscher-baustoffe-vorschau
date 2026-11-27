// Baustoff-Rechner – Tabs + Live-Berechnung.
// Ergebnisse sind gerundete Richtwerte (siehe Hinweis auf der Seite).
// Laeuft nur auf rechner.html (Feature-Guard).

document.addEventListener("DOMContentLoaded", () => {
  const calc = document.querySelector(".calc");
  if (!calc) return;

  // ===== Tabs (barrierefrei) =====
  const tabs = Array.from(calc.querySelectorAll('[role="tab"]'));
  const panels = Array.from(calc.querySelectorAll('[role="tabpanel"]'));

  function selectTab(tab) {
    tabs.forEach((t) => {
      const active = t === tab;
      t.setAttribute("aria-selected", active ? "true" : "false");
      t.tabIndex = active ? 0 : -1;
      t.classList.toggle("is-active", active);
    });
    panels.forEach((p) => {
      p.hidden = p.id !== tab.getAttribute("aria-controls");
    });
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", (e) => {
      let target = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") target = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") target = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") target = tabs[0];
      else if (e.key === "End") target = tabs[tabs.length - 1];
      if (target) {
        e.preventDefault();
        selectTab(target);
        target.focus();
      }
    });
  });

  // ===== Hilfsfunktionen =====
  const val = (id) => {
    const el = document.getElementById(id);
    const n = parseFloat((el && el.value || "").replace(",", "."));
    return isFinite(n) ? n : NaN;
  };
  const fmt = (n, dec = 2) =>
    n.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: dec });

  // Verbindet ein Ergebnis mit dem Anfrage-Button (Vorbefuellung des Kontaktformulars)
  function setResult(resultId, anfrageId, html, summary) {
    const r = document.getElementById(resultId);
    const a = document.getElementById(anfrageId);
    if (r) r.innerHTML = html;
    if (a) a.href = summary ? "kontakt.html?anfrage=" + encodeURIComponent(summary) : "kontakt.html";
  }

  // ===== Pflaster / Fläche =====
  function calcPflaster() {
    const l = val("pf-laenge"), b = val("pf-breite");
    const v = isNaN(val("pf-verschnitt")) ? 0 : val("pf-verschnitt");
    const bett = isNaN(val("pf-bettung")) ? 0 : val("pf-bettung");
    if (isNaN(l) || isNaN(b) || l <= 0 || b <= 0) {
      return setResult("pf-result", "pf-anfrage", "Bitte Länge und Breite eingeben.", "");
    }
    const area = l * b;
    const areaV = area * (1 + v / 100);
    const vol = area * (bett / 100);
    const t = vol * 1.6;
    setResult(
      "pf-result", "pf-anfrage",
      `<strong>Fläche:</strong> ${fmt(area)} m² &nbsp;·&nbsp; inkl. ${fmt(v, 0)} % Verschnitt: <strong>${fmt(areaV)} m²</strong>` +
      (bett > 0 ? `<br /><strong>Splittbettung (${fmt(bett, 1)} cm):</strong> ${fmt(vol)} m³ &nbsp;≈&nbsp; ${fmt(t, 1)} t` : ""),
      `Pflaster-/Flächenrechner: Fläche ${fmt(areaV)} m² (inkl. ${fmt(v,0)} % Verschnitt)` +
      (bett > 0 ? `, Splittbettung ${fmt(vol)} m³ (≈ ${fmt(t,1)} t)` : "") + "."
    );
  }

  // ===== Beton / Mörtel =====
  function calcBeton() {
    const l = val("be-laenge"), b = val("be-breite"), d = val("be-dicke");
    const sack = parseFloat(document.getElementById("be-sack").value);
    if (isNaN(l) || isNaN(b) || isNaN(d) || l <= 0 || b <= 0 || d <= 0) {
      return setResult("be-result", "be-anfrage", "Bitte Maße eingeben.", "");
    }
    const vol = l * b * (d / 100);
    const yieldPerSack = sack === 25 ? 0.0125 : 0.02; // m³ pro Sack (Richtwert Fertigbeton)
    const saecke = Math.ceil(vol / yieldPerSack);
    setResult(
      "be-result", "be-anfrage",
      `<strong>Beton-Volumen:</strong> ${fmt(vol)} m³<br />benötigt ca. <strong>${saecke} Säcke</strong> à ${sack} kg Fertigbeton`,
      `Beton-/Mörtelrechner: Volumen ${fmt(vol)} m³, ca. ${saecke} Säcke à ${sack} kg.`
    );
  }

  // ===== Estrich / Putz =====
  function calcEstrich() {
    const a = val("es-flaeche"), d = val("es-dicke");
    if (isNaN(a) || isNaN(d) || a <= 0 || d <= 0) {
      return setResult("es-result", "es-anfrage", "Bitte Fläche und Dicke eingeben.", "");
    }
    const kg = a * d * 20; // Richtwert: ~20 kg Trockenmörtel je m² und cm
    const saecke = Math.ceil(kg / 40);
    setResult(
      "es-result", "es-anfrage",
      `<strong>Material:</strong> ca. ${fmt(kg, 0)} kg<br />≈ <strong>${saecke} Säcke</strong> à 40 kg`,
      `Estrich-/Putzrechner: ${fmt(a)} m² × ${fmt(d,1)} cm = ca. ${fmt(kg,0)} kg (≈ ${saecke} Säcke à 40 kg).`
    );
  }

  // ===== Schüttgut =====
  function calcSchuettgut() {
    const l = val("sg-laenge"), b = val("sg-breite"), h = val("sg-hoehe");
    const sel = document.getElementById("sg-material");
    const dichte = parseFloat(sel.value);
    const material = sel.options[sel.selectedIndex].textContent.trim();
    if (isNaN(l) || isNaN(b) || isNaN(h) || l <= 0 || b <= 0 || h <= 0) {
      return setResult("sg-result", "sg-anfrage", "Bitte Maße eingeben.", "");
    }
    const vol = l * b * (h / 100);
    const t = vol * dichte;
    setResult(
      "sg-result", "sg-anfrage",
      `<strong>Volumen:</strong> ${fmt(vol)} m³<br /><strong>Gewicht (${material}):</strong> ca. ${fmt(t, 1)} t`,
      `Schüttgut-Rechner (${material}): Volumen ${fmt(vol)} m³, ca. ${fmt(t,1)} t.`
    );
  }

  // ===== Verdrahtung: bei jeder Eingabe neu rechnen =====
  const wire = (ids, fn) =>
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) { el.addEventListener("input", fn); el.addEventListener("change", fn); }
    });

  wire(["pf-laenge", "pf-breite", "pf-verschnitt", "pf-bettung"], calcPflaster);
  wire(["be-laenge", "be-breite", "be-dicke", "be-sack"], calcBeton);
  wire(["es-flaeche", "es-dicke"], calcEstrich);
  wire(["sg-laenge", "sg-breite", "sg-hoehe", "sg-material"], calcSchuettgut);
});
