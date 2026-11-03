// TURTLE (v1 → v2, reel91) — "the photo beats the prompt". El fondo es la foto de inicio de la versión que se
// está leyendo, desenfocada, con una flecha gigante hacia donde mira la garceta: ← roja en la v1, → verde al
// llegar al arreglo (gira). La intro compara la v1 y la v2 con una línea que se arrastra. En los prompts se marcan
// las frases que deciden la dirección y el traspaso del pez. Al copiar, una flecha cruza el botón.
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- fondo: la foto de inicio y la flecha ----------
  const fondo = document.createElement("div");
  fondo.id = "facing"; fondo.setAttribute("aria-hidden", "true");
  fondo.innerHTML = `<div class="ph" style="background-image:url(v1-start.jpg)"></div><div class="ph" style="background-image:url(v2-start.jpg)"></div><div class="arrow none">←</div>`;
  document.body.prepend(fondo);
  const [ph1, ph2] = fondo.querySelectorAll(".ph");
  const flecha = fondo.querySelector(".arrow");

  // qué versión es cada parada, por su etiqueta
  const version = (label) => (/^V1/.test(label) ? 1 : /^(V2|The fix)/.test(label) ? 2 : 0);
  const pon = (v) => {
    ph1.classList.toggle("on", v === 1);
    ph2.classList.toggle("on", v === 2 || v === 0);
    flecha.classList.toggle("right", v === 2);
    flecha.classList.toggle("none", v === 0);
  };
  pon(0);
  const paradas = [...document.querySelectorAll(".stop")];
  addEventListener("flyview", (e) => {
    const el = e.detail.els && e.detail.els[0];
    const stop = el ? el.closest(".stop") : paradas[e.detail.index];
    pon(stop ? version(stop.dataset.label || "") : 0);
  });

  // ---------- sello de versión en cada paso ----------
  paradas.forEach((s) => {
    const v = version(s.dataset.label || "");
    const num = s.querySelector(".num");
    if (!v || !num) return;
    const b = document.createElement("span");
    b.className = "vstamp " + (v === 1 ? "bad" : "good");
    b.textContent = v === 1 ? "✕ V1 · FAILED" : "✓ V2 · WORKED";
    num.after(b);
  });

  // ---------- comparador v1 | v2 en la intro ----------
  const clip = document.getElementById("clip");
  if (clip) {
    const shot = clip.closest(".shot");
    shot.classList.add("cmp");
    const v1 = document.createElement("video");
    Object.assign(v1, { src: "v1.mp4", muted: true, loop: true, playsInline: true, preload: "metadata" });
    v1.className = "v1"; v1.setAttribute("playsinline", ""); v1.poster = "v1-f1.jpg";
    shot.append(v1);
    shot.insertAdjacentHTML("beforeend", `<div class="line"></div><span class="tagv l">V1 ✕</span><span class="tagv r">V2 ✓</span>`);
    // los dos a la vez, en el mismo segundo
    const sync = () => { if (Math.abs(v1.currentTime - clip.currentTime) > .15) v1.currentTime = clip.currentTime; };
    clip.addEventListener("play", () => { v1.play().catch(() => {}); });
    clip.addEventListener("pause", () => v1.pause());
    clip.addEventListener("timeupdate", sync);
    const mueve = (x) => {
      const r = shot.getBoundingClientRect();
      const p = Math.max(0, Math.min(100, ((x - r.left) / r.width) * 100));
      shot.style.setProperty("--x", p.toFixed(1) + "%");
    };
    let arrastra = false;
    shot.addEventListener("pointerdown", (e) => { arrastra = true; mueve(e.clientX); e.stopPropagation(); try { shot.setPointerCapture(e.pointerId); } catch {} });
    shot.addEventListener("pointermove", (e) => { if (arrastra) { mueve(e.clientX); e.stopPropagation(); } });
    const suelta = () => { arrastra = false; };
    shot.addEventListener("pointerup", suelta); shot.addEventListener("pointercancel", suelta);
    // que no lo confunda con deslizar entre targetas
    ["touchstart", "touchmove", "mousedown", "wheel"].forEach((t) => shot.addEventListener(t, (e) => e.stopPropagation(), { passive: true }));
    // un vaivén al principio para que se vea que se arrastra
    if (!quieto) {
      let t0 = null;
      const vaiven = (t) => {
        if (arrastra) return;
        t0 ??= t; const k = (t - t0) / 1800;
        if (k > 1) { shot.style.setProperty("--x", "50%"); return; }
        shot.style.setProperty("--x", (50 + 22 * Math.sin(k * Math.PI * 2)).toFixed(1) + "%");
        requestAnimationFrame(vaiven);
      };
      setTimeout(() => requestAnimationFrame(vaiven), 900);
    }
  }

  // ---------- frases marcadas en los prompts ----------
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const marca = (pre, reglas) => {
    let html = esc(pre.textContent);
    for (const [re, cls, why] of reglas) html = html.replace(re, (m) => `<mark class="${cls}" title="${why}">${m}</mark>`);
    pre.innerHTML = html; // textContent queda igual: copiar sigue dando el prompt limpio
  };
  const leyenda = (pre, items) => {
    const d = document.createElement("div"); d.className = "legend";
    d.innerHTML = items.map(([c, t]) => `<span class="${c}">${t}</span>`).join("");
    pre.before(d);
  };
  const porEtiqueta = (l) => paradas.find((s) => s.dataset.label === l)?.querySelector(".code");
  const i1 = porEtiqueta("V1 frame"), v1p = porEtiqueta("V1 take"), i2 = porEtiqueta("The fix"), v2p = porEtiqueta("V2 take");
  if (i1) { marca(i1, [[/its head lowered as it looks at the water/, "vague", "No direction: Soul 2 picked left"]]); leyenda(i1, [["vague", "no direction: the model picks one"]]); }
  if (v1p) {
    marca(v1p, [[/facing right/g, "lie", "The photo said left"], [/the egret lets the fish drop into it/, "vague", "One line for the handoff"]]);
    leyenda(v1p, [["lie", "the photo said left"], ["vague", "handoff in one line"]]);
  }
  if (i2) { marca(i2, [[/facing right/g, "truth", "Direction in the photo"], [/a hand's width in front of the turtle's face/, "truth", "The action, posed"]]); leyenda(i2, [["truth", "direction and action, in the photo"]]); }
  if (v2p) { marca(v2p, [[/facing right/g, "truth", "Matches the photo"], [/never in the water/g, "truth", "Where it ends"]]); leyenda(v2p, [["truth", "matches the photo · says where it ends"]]); }

  // ---------- copiar: una flecha cruza el botón ----------
  if (!quieto) document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    setTimeout(() => {
      const s = document.createElement("span"); s.className = "shoot"; s.textContent = "→";
      b.append(s); setTimeout(() => s.remove(), 800);
    }, 20);
  }));
})();
