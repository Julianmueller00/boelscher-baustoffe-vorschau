(async function () {
  const includeEls = document.querySelectorAll("[data-include]");
  await Promise.all([...includeEls].map(async (el) => {
    const file = el.getAttribute("data-include");
    // "no-cache": Browser revalidiert das Partial bei jedem Laden (304, wenn unveraendert).
    // Verhindert, dass veraltete/abgeschnittene Header/Footer aus dem Cache angezeigt werden.
    const res = await fetch(file, { cache: "no-cache" });
    if (!res.ok) {
      el.outerHTML = `<!-- include failed: ${file} -->`;
      return;
    }
    el.outerHTML = await res.text();
  }));

  document.dispatchEvent(new Event("includes:loaded"));
})();