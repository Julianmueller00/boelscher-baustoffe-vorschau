document.addEventListener("includes:loaded", () => {
  const hero = document.querySelector(".hero");
  const slidesEl = document.getElementById("slides");
  const dotsEl = document.getElementById("dots");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");

  if (!hero || !slidesEl || !dotsEl || !prevBtn || !nextBtn) return;

  const slideEls = Array.from(slidesEl.children);
  let index = 0;
  let timer = null;
  const intervalMs = 6500;

  // Nutzer-Praeferenz "reduzierte Bewegung": kein Autoplay, keine Schiebe-Animation
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) slidesEl.style.transition = "none";

  function renderDots(){
    dotsEl.innerHTML = "";
    slideEls.forEach((_, i) => {
      const b = document.createElement("button");
      b.className = "dot" + (i === index ? " active" : "");
      b.setAttribute("aria-label", `Folie ${i+1}`);
      if (i === index) b.setAttribute("aria-current", "true");
      b.addEventListener("click", () => goTo(i, true));
      dotsEl.appendChild(b);
    });
  }

  function update(){
    slidesEl.style.transform = `translateX(-${index * 100}%)`;
    dotsEl.querySelectorAll(".dot").forEach((d, i) => {
      const isActive = i === index;
      d.classList.toggle("active", isActive);
      if (isActive) d.setAttribute("aria-current", "true");
      else d.removeAttribute("aria-current");
    });
  }

  function goTo(i, userAction=false){
    index = (i + slideEls.length) % slideEls.length;
    if (userAction) restart();
    update();
  }
  function next(userAction=false){ goTo(index + 1, userAction); }
  function prev(userAction=false){ goTo(index - 1, userAction); }

  function start(){
    stop();
    if (reduceMotion) return;           // kein Autoplay bei reduzierter Bewegung
    timer = setInterval(() => next(false), intervalMs);
  }
  function stop(){
    if (timer) clearInterval(timer);
    timer = null;
  }
  function restart(){ start(); }

  nextBtn.addEventListener("click", () => next(true));
  prevBtn.addEventListener("click", () => prev(true));

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);

  // Autoplay auch bei Tastatur-Fokus pausieren (barrierefrei)
  hero.addEventListener("focusin", stop);
  hero.addEventListener("focusout", start);

  // Touch swipe
  let startX = null;
  hero.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  }, { passive:true });

  hero.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const endX = e.changedTouches[0].clientX;
    const diff = endX - startX;
    startX = null;

    if (Math.abs(diff) > 50) {
      if (diff < 0) next(true);
      else prev(true);
    }
  });

  renderDots();
  update();
  start();
});