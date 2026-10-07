// SNAP — atardecer que se pone al avanzar, polvo dorado, prompts que suben desde detrás de
// una cresta al chasquear (clic, o la tecla S) y reglas que caen como cascos.
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const raiz = document.documentElement;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const NS = "http://www.w3.org/2000/svg";

  // ---------- cielo, sol y tres crestas ----------
  const cresta = (seed, alto, picos) => {
    let d = "M0 300 L0 " + (300 - alto);
    for (let k = 1; k <= picos; k++) {
      const x = (1400 / picos) * k;
      const y = 300 - alto + Math.sin(k * 1.7 + seed) * alto * 0.35 + Math.cos(k * 0.9 + seed * 2) * alto * 0.2;
      d += ` L${x.toFixed(0)} ${y.toFixed(0)}`;
    }
    return d + " L1400 300 Z";
  };
  const fondo = document.createElement("div");
  fondo.innerHTML = `<div id="sky"></div><div id="sun"></div>
    <div id="ridges"><svg viewBox="0 0 1400 300" preserveAspectRatio="none" data-k="10"><path d="${cresta(1, 170, 9)}" fill="#3B1712"/></svg>
    <svg viewBox="0 0 1400 300" preserveAspectRatio="none" data-k="22"><path d="${cresta(4, 120, 7)}" fill="#22100C"/></svg>
    <svg viewBox="0 0 1400 300" preserveAspectRatio="none" data-k="40"><path d="${cresta(7, 70, 5)}" fill="#0E0807"/></svg></div>`;
  document.body.prepend(...fondo.children);
  const capas = [...document.querySelectorAll("#ridges svg")];

  addEventListener("flyview", (e) => {
    const p = e.detail.total > 1 ? e.detail.index / (e.detail.total - 1) : 0;
    raiz.style.setProperty("--dusk", (p * 0.42).toFixed(3));
    raiz.style.setProperty("--sunY", `${(p * 20).toFixed(1)}vh`);
    capas.forEach((c) => { c.style.transform = `translateX(${-e.detail.index * c.dataset.k}px)`; });
  });

  // ---------- polvo dorado (y nubes de polvo a ras de suelo) ----------
  const cv = document.createElement("canvas");
  cv.id = "motes"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  let W, H, dpr;
  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr;
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
  };
  tam(); addEventListener("resize", tam);
  const motas = [];
  const N = quieto ? 0 : Math.round(Math.min(90, innerWidth / 14));
  for (let k = 0; k < N; k++) motas.push({ x: Math.random(), y: Math.random(), r: rnd(.6, 2), vy: rnd(.006, .02), f: rnd(0, 6.3), a: rnd(.15, .5) });
  const polvo = [];
  const nube = (x, y, n, dir = 0) => {
    if (quieto) return;
    for (let k = 0; k < n; k++) {
      const lado = dir || (Math.random() < .5 ? -1 : 1);
      polvo.push({ x: x * dpr, y: y * dpr, vx: lado * rnd(.6, 3.4) * dpr, vy: -rnd(.1, 1.2) * dpr, r: rnd(6, 22) * dpr, life: 1, dec: rnd(.008, .02) });
    }
  };
  let t0 = performance.now();
  const anima = (t) => {
    const dt = Math.min(50, t - t0) / 16.7; t0 = t;
    cx.clearRect(0, 0, W, H);
    for (const m of motas) {
      m.y -= m.vy * dt * .01; m.f += .02 * dt;
      if (m.y < -.02) { m.y = 1.02; m.x = Math.random(); }
      cx.globalAlpha = m.a; cx.fillStyle = "#FFC9A0";
      cx.beginPath(); cx.arc((m.x + Math.sin(m.f) * .004) * W, m.y * H, m.r * dpr, 0, 6.283); cx.fill();
    }
    for (let k = polvo.length - 1; k >= 0; k--) {
      const p = polvo[k];
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .97; p.vy *= .97; p.r += .35 * dt * dpr; p.life -= p.dec * dt;
      if (p.life <= 0) { polvo.splice(k, 1); continue; }
      const g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, `rgba(217, 160, 112, ${.32 * p.life})`); g.addColorStop(1, "rgba(217, 160, 112, 0)");
      cx.globalAlpha = 1; cx.fillStyle = g; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fill();
    }
    requestAnimationFrame(anima);
  };
  if (!quieto) requestAnimationFrame(anima);

  // ---------- el chasquido ----------
  const ondas = (x, y, { color = "", to = 7 } = {}) => {
    if (quieto) return;
    for (let k = 0; k < 3; k++) {
      const r = document.createElement("i");
      r.className = "ring " + color;
      r.style.left = x + "px"; r.style.top = y + "px";
      r.style.setProperty("--to", to + k * 2);
      r.style.animationDelay = k * 90 + "ms";
      document.body.appendChild(r);
      r.addEventListener("animationend", () => r.remove());
    }
  };

  // el título: chasquido y la segunda línea sube
  const h1 = document.querySelector(".hero h1.big");
  const em = h1?.querySelector("em");
  if (em) {
    const rise = document.createElement("span");
    rise.className = "rise"; em.replaceWith(rise); rise.appendChild(em);
    let hecho = false;
    addEventListener("flyview", (e) => {
      if (hecho || e.detail.index !== 0) return;
      hecho = true;
      setTimeout(() => {
        const r = h1.getBoundingClientRect();
        ondas(r.left + r.width * .82, r.top + r.height * .25, { to: 5 });
        setTimeout(() => h1.classList.add("up"), quieto ? 0 : 160);
      }, quieto ? 0 : 900);
    });
  }

  // los prompts, detrás de una cresta
  const forma = "M0 120 L0 46 L60 30 L120 52 L190 18 L260 44 L330 26 L400 50 L470 14 L540 40 L600 24 L600 120 Z";
  const revela = (crest, x, y) => {
    if (!crest.classList.contains("locked")) return;
    const r = crest.getBoundingClientRect();
    if (x == null) { x = r.left + r.width / 2; y = r.top + r.height * .76; }
    ondas(x, y, { to: 9 });
    setTimeout(() => {
      crest.classList.remove("locked");
      crest.querySelector(".snap-btn")?.remove();
      // el polvo sale a los dos lados de la base, como cuando el caballo se encabrita
      nube(r.left + r.width * .2, r.bottom - 10, 9, -1);
      nube(r.left + r.width * .8, r.bottom - 10, 9, 1);
    }, quieto ? 0 : 140);
  };
  document.querySelectorAll(".code").forEach((code) => {
    const crest = document.createElement("div");
    crest.className = "crest locked";
    code.replaceWith(crest); crest.appendChild(code);
    crest.insertAdjacentHTML("beforeend", `<div class="ridge" aria-hidden="true"><svg viewBox="0 0 600 120" preserveAspectRatio="none"><path d="${forma}" fill="#0E0807"/><path d="M0 46 L60 30 L120 52 L190 18 L260 44 L330 26 L400 50 L470 14 L540 40 L600 24" fill="none" stroke="rgba(255,120,70,.55)" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg></div>
      <button class="snap-btn" type="button" aria-label="Snap to reveal the prompt"><i></i>Snap to reveal <kbd>S</kbd></button>`);
    crest.querySelector(".snap-btn").addEventListener("click", (e) => revela(crest, e.clientX || null, e.clientY || null));
    // copiar también lo revela
    crest.parentElement.querySelector(".cp")?.addEventListener("click", () => revela(crest));
  });

  // la tecla S chasquea la cresta que tienes delante
  addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() !== "s" || e.metaKey || e.ctrlKey || e.altKey) return;
    const delante = document.querySelector(".slab.on .crest.locked");
    if (delante) revela(delante);
    else ondas(innerWidth / 2, innerHeight / 2, { color: "bone", to: 10 });
  });

  // al copiar: ondas desde el botón
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    const r = b.getBoundingClientRect();
    ondas(r.left + r.width / 2, r.top + r.height / 2, { color: "bone", to: 6 });
  }));

  // ---------- reglas: caen como cascos y se abren ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((slab, k) => {
    const p = slab.querySelector("p:not(.k)");
    const more = document.createElement("div");
    more.className = "more"; more.innerHTML = "<div></div>";
    more.firstChild.appendChild(p);
    const num = document.createElement("div");
    num.className = "hoof-num"; num.textContent = String(k + 1).padStart(2, "0");
    slab.querySelector(".k").after(num);
    slab.appendChild(more);
    slab.insertAdjacentHTML("beforeend", `<div class="hint">Tap to open</div>`);
    slab.setAttribute("role", "button"); slab.tabIndex = 0;
    const toggle = () => { slab.classList.toggle("open"); slab.setAttribute("aria-expanded", slab.classList.contains("open")); };
    slab.addEventListener("click", toggle);
    slab.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); toggle(); } });
  });
  addEventListener("flyview", (e) => {
    const aqui = reglas.filter((s) => e.detail.els.includes(s));
    aqui.forEach((s, k) => setTimeout(() => {
      if (s.classList.contains("open")) return;
      s.classList.add("open", "thud");
      s.setAttribute("aria-expanded", "true");
      const r = s.getBoundingClientRect();
      nube(r.left + r.width / 2, r.bottom, 7);
      s.addEventListener("animationend", () => s.classList.remove("thud"), { once: true });
    }, (quieto ? 0 : 650) + k * 340));
  });
})();
