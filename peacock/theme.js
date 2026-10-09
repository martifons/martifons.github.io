// PEACOCK — noche de fuegos artificiales sobre un lago que los refleja: salen solos, al llegar
// a cada parada, al hacer clic en el cielo y al copiar. Cada prompt se enciende con una mecha
// que recorre su borde; las reglas se abren como ojos de pluma; el título se enciende letra a letra.
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const raiz = document.documentElement;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const NS = "http://www.w3.org/2000/svg";
  // respuesta táctil en el móvil (Android; en iPhone no hace nada)
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };

  // ---------- el cielo, el lago y los fuegos (un solo canvas) ----------
  const cv = document.createElement("canvas");
  cv.id = "night"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  let W, H, dpr, horizonte = 0.8, horizonteObjetivo = 0.8;
  const estrellas = [];
  const colinas = [];
  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr;
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    estrellas.length = 0;
    for (let k = 0; k < Math.round(innerWidth / 5); k++) estrellas.push({ x: Math.random(), y: Math.random() * .75, r: rnd(.4, 1.4), f: rnd(0, 6.3) });
    colinas.length = 0;
    for (let k = 0; k <= 24; k++) colinas.push(Math.sin(k * .7) * .5 + Math.sin(k * 1.9 + 1) * .3 + Math.random() * .2);
  };
  tam(); addEventListener("resize", tam);

  const PALETAS = {
    gold: ["#FFD27A", "#FFC66B", "#FFF1C9"],
    red: ["#FF2A1F", "#FF6A4A", "#FFD0B0"],
    peacock: ["#3FE0D0", "#2B6BFF", "#9B7BFF"],
    bone: ["#F3EEEB", "#FFFFFF", "#FFE2C0"],
  };
  const cohetes = [], chispas = [];
  const lanza = (xFrac, yFrac, tipo = "chrys", paleta = "gold") => {
    if (quieto) return;
    const x = xFrac * W, y0 = H * (horizonte - .01), y1 = yFrac * H;
    const t = rnd(.9, 1.2) * 60; // frames de subida
    cohetes.push({ x, y: y0, vx: (x - x) / t, vy: (y1 - y0) / t, y1, tipo, paleta, vida: t });
  };
  const estalla = (x, y, tipo, paleta) => {
    const col = PALETAS[paleta] || PALETAS.gold;
    const add = (px, py, vx, vy, c, vida, r = 1.6) => chispas.push({ x: px, y: py, vx, vy, c, vida, v0: vida, r: r * dpr, px, py });
    if (tipo === "peacock") {
      // abanico de ojos de pluma: hilos dorados del centro a cada ojo, y cada ojo un anillo
      const ojos = 11, R = Math.min(W, H) * rnd(.16, .2);
      for (let k = 0; k < ojos; k++) {
        const a = Math.PI + (k / (ojos - 1)) * Math.PI; // de izquierda a derecha por arriba
        const ex = Math.cos(a), ey = Math.sin(a);
        for (let s = 0; s < 6; s++) { const sp = (R / 55) * (s / 6 + .2); add(x, y, ex * sp, ey * sp, PALETAS.gold[s % 3], 70, 1.2); }
        const ox = x + ex * R, oy = y + ey * R;
        for (let s = 0; s < 14; s++) { const b = (s / 14) * Math.PI * 2; add(ox, oy, Math.cos(b) * 1.1 * dpr + ex * .6, Math.sin(b) * 1.1 * dpr + ey * .6, PALETAS.peacock[0], 85, 1.7); }
        for (let s = 0; s < 5; s++) { const b = (s / 5) * Math.PI * 2; add(ox, oy, Math.cos(b) * .4 * dpr + ex * .6, Math.sin(b) * .4 * dpr + ey * .6, s % 2 ? PALETAS.peacock[1] : PALETAS.peacock[2], 90, 2); }
      }
      for (let s = 0; s < 18; s++) add(x, y, rnd(-.3, .3) * dpr, -rnd(.5, 2.4) * dpr, PALETAS.peacock[1], 80, 1.8);
    } else if (tipo === "ring") {
      const n = 44, sp = rnd(2.4, 3.2) * dpr;
      for (let s = 0; s < n; s++) { const b = (s / n) * Math.PI * 2; add(x, y, Math.cos(b) * sp, Math.sin(b) * sp, col[s % 3], 75, 1.7); }
    } else {
      const n = 70;
      for (let s = 0; s < n; s++) { const b = Math.random() * Math.PI * 2, sp = rnd(.6, 3.4) * dpr; add(x, y, Math.cos(b) * sp, Math.sin(b) * sp, col[s % 3], rnd(55, 85), 1.6); }
    }
  };
  // chispitas sueltas (la mecha, las letras)
  const chisporrotea = (sx, sy, n = 6, paleta = "gold") => {
    if (quieto) return;
    const col = PALETAS[paleta];
    for (let k = 0; k < n; k++) chispas.push({ x: sx * dpr, y: sy * dpr, px: sx * dpr, py: sy * dpr, vx: rnd(-1.6, 1.6) * dpr, vy: rnd(-2.2, .4) * dpr, c: col[k % 3], vida: rnd(18, 32), v0: 32, r: 1.2 * dpr });
  };

  let t0 = performance.now(), proximo = 1800;
  const dibuja = (t) => {
    const dt = Math.min(2.5, (t - t0) / 16.7); t0 = t;
    horizonte += (horizonteObjetivo - horizonte) * .04 * dt;
    const hy = horizonte * H;
    // cielo
    const g = cx.createLinearGradient(0, 0, 0, hy);
    g.addColorStop(0, "#03040A"); g.addColorStop(.6, "#0A1230"); g.addColorStop(1, "#1C2A5C");
    cx.globalCompositeOperation = "source-over"; cx.globalAlpha = 1; cx.fillStyle = g; cx.fillRect(0, 0, W, hy);
    for (const e of estrellas) {
      if (e.y * H > hy - 4) continue;
      cx.globalAlpha = .35 + Math.sin(t * .002 + e.f) * .25; cx.fillStyle = "#DCE6FF";
      cx.fillRect(e.x * W, e.y * H, e.r * dpr, e.r * dpr);
    }
    // colinas y lago
    cx.globalAlpha = 1; cx.fillStyle = "#04050B"; cx.beginPath(); cx.moveTo(0, hy);
    colinas.forEach((c, k) => cx.lineTo((k / 24) * W, hy - (18 + c * 26) * dpr));
    cx.lineTo(W, hy); cx.closePath(); cx.fill();
    const l = cx.createLinearGradient(0, hy, 0, H);
    l.addColorStop(0, "#111A3D"); l.addColorStop(1, "#04050A");
    cx.fillStyle = l; cx.fillRect(0, hy, W, H - hy);

    // fuegos
    cx.globalCompositeOperation = "lighter";
    for (let k = cohetes.length - 1; k >= 0; k--) {
      const c = cohetes[k];
      c.y += c.vy * dt; c.vida -= dt;
      cx.globalAlpha = .9; cx.strokeStyle = "#FFC66B"; cx.lineWidth = 1.6 * dpr;
      cx.beginPath(); cx.moveTo(c.x, c.y); cx.lineTo(c.x, c.y - c.vy * 5); cx.stroke();
      if (c.y <= c.y1 || c.vida <= 0) { estalla(c.x, c.y, c.tipo, c.paleta); cohetes.splice(k, 1); }
    }
    for (let k = chispas.length - 1; k >= 0; k--) {
      const s = chispas[k];
      s.px = s.x; s.py = s.y;
      s.vx *= .985; s.vy = s.vy * .985 + .035 * dpr * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vida -= dt;
      if (s.vida <= 0 || chispas.length > 2600) { chispas.splice(k, 1); continue; }
      const a = Math.max(0, s.vida / s.v0);
      cx.globalAlpha = a; cx.strokeStyle = s.c; cx.lineWidth = s.r;
      cx.beginPath(); cx.moveTo(s.px, s.py); cx.lineTo(s.x, s.y); cx.stroke();
      // reflejo en el lago
      if (s.y < hy) {
        const ry = hy + (hy - s.y) * .55;
        if (ry < H) { cx.globalAlpha = a * .28; cx.fillStyle = s.c; cx.fillRect(s.x + Math.sin(ry * .05 + t * .004) * 3 * dpr, ry, s.r * 1.4, s.r * 2.4); }
      }
    }
    // alguno suelto, de vez en cuando
    proximo -= dt * 16.7;
    if (proximo <= 0 && !document.hidden) {
      lanza(rnd(.15, .85), rnd(.12, .35), Math.random() < .3 ? "ring" : "chrys", ["gold", "red", "bone", "peacock"][Math.floor(rnd(0, 4))]);
      proximo = rnd(2600, 4600);
    }
    requestAnimationFrame(dibuja);
  };
  requestAnimationFrame(dibuja);

  // al subir de parada: el lago se va quedando abajo y salta una andanada
  addEventListener("flyview", (e) => {
    const p = e.detail.total > 1 ? e.detail.index / (e.detail.total - 1) : 0;
    horizonteObjetivo = .8 + p * .3;
    if (e.detail.dir) {
      for (let k = 0; k < 3; k++) setTimeout(() => lanza(rnd(.2, .8), rnd(.12, .3), "chrys", k === 1 ? "red" : "gold"), 300 + k * 220);
    }
    // las targetas que llegan se abren en abanico
    e.detail.els.forEach((el, k) => {
      el.classList.remove("fanin"); void el.offsetWidth;
      el.style.animationDelay = k * 110 + "ms";
      el.classList.add("fanin");
    });
  });

  // clic en el cielo (fuera de las targetas): un cohete hasta donde has hecho clic
  document.getElementById("stage").addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a")) return;
    zum(15);
    lanza(e.clientX / innerWidth, Math.min(e.clientY / innerHeight, horizonte - .1), Math.random() < .5 ? "peacock" : "ring", "peacock");
  });

  // ---------- el título se enciende letra a letra ----------
  const em = document.querySelector(".hero h1.big em");
  if (em) {
    const texto = em.textContent; em.textContent = "";
    const letras = [...texto].map((ch) => { const s = document.createElement("span"); s.textContent = ch; em.appendChild(s); return s; });
    let hecho = false;
    addEventListener("flyview", (e) => {
      if (hecho || e.detail.index !== 0) return;
      hecho = true;
      letras.forEach((s, k) => setTimeout(() => {
        s.classList.add("lit");
        if (s.textContent.trim()) { const r = s.getBoundingClientRect(); chisporrotea(r.left + r.width / 2, r.top + r.height * .4, 4, "red"); }
      }, (quieto ? 0 : 900) + k * 70));
      setTimeout(() => lanza(.5, .18, "peacock", "peacock"), quieto ? 0 : 900 + letras.length * 70 + 200);
    });
  }

  // ---------- la mecha de cada prompt ----------
  const enciende = (wick, rapido) => {
    if (!wick.classList.contains("locked") || wick.classList.contains("burning")) return;
    const rect = wick.querySelector("rect.burn"), head = wick.querySelector(".head");
    const fin = () => {
      wick.classList.remove("locked", "burning");
      wick.querySelector(".light-btn")?.remove();
      const r = wick.getBoundingClientRect();
      zum([20, 40, 60]);
      lanza((r.left + r.width / 2) / innerWidth, Math.max(.1, (r.top - 60) / innerHeight), "peacock", "peacock");
      chisporrotea(r.left + r.width / 2, r.top + r.height / 2, 24, "gold");
    };
    if (rapido || quieto) { rect.style.strokeDasharray = "100 0"; fin(); return; }
    wick.classList.add("burning");
    const total = rect.getTotalLength(), dur = 1300, ini = performance.now();
    const paso = (t) => {
      const p = Math.min(1, (t - ini) / dur);
      rect.style.strokeDasharray = `${p * 100} 100`;
      const pt = rect.getPointAtLength(p * total);
      const svg = rect.ownerSVGElement.getBoundingClientRect(), w = wick.getBoundingClientRect();
      const sx = (pt.x / svg.width) * svg.width + (svg.left - w.left), sy = (pt.y / svg.height) * svg.height + (svg.top - w.top);
      head.style.transform = `translate(${sx}px, ${sy}px)`;
      if (Math.random() < .6) chisporrotea(svg.left + pt.x, svg.top + pt.y, 2, "gold");
      if (p < 1) requestAnimationFrame(paso); else fin();
    };
    requestAnimationFrame(paso);
  };

  document.querySelectorAll(".code").forEach((code) => {
    const wick = document.createElement("div");
    wick.className = "wick locked";
    code.replaceWith(wick); wick.appendChild(code);
    wick.insertAdjacentHTML("beforeend", `<svg aria-hidden="true"><defs><linearGradient id="ember" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFC66B"/><stop offset="1" stop-color="#FF2A1F"/></linearGradient></defs>
      <rect class="cord" x="1" y="1" rx="16" ry="16"/><rect class="burn" pathLength="100" x="1" y="1" rx="16" ry="16"/></svg>
      <i class="head" aria-hidden="true"></i>
      <button class="light-btn" type="button" aria-label="Light the fuse to reveal the prompt"><span class="flame"></span>Light the fuse <kbd>L</kbd></button>`);
    const ajusta = () => {
      const r = wick.getBoundingClientRect();
      wick.querySelectorAll("rect").forEach((q) => { q.setAttribute("width", Math.max(0, r.width + 8)); q.setAttribute("height", Math.max(0, r.height + 8)); });
    };
    ajusta(); addEventListener("resize", ajusta);
    addEventListener("flyview", ajusta);
    wick.querySelector(".light-btn").addEventListener("click", () => { ajusta(); enciende(wick); });
    wick.parentElement.querySelector(".cp")?.addEventListener("click", () => enciende(wick, true));
  });

  addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() !== "l" || e.metaKey || e.ctrlKey || e.altKey) return;
    const w = document.querySelector(".slab.on .wick.locked");
    if (w) enciende(w); else lanza(rnd(.25, .75), rnd(.15, .3), "peacock", "peacock");
  });

  // al copiar: un cohete sale del botón
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    const r = b.getBoundingClientRect();
    zum(25);
    lanza((r.left + r.width / 2) / innerWidth, Math.max(.08, (r.top - 220) / innerHeight), "ring", "red");
  }));

  // ---------- reglas: ojos de pluma que se abren ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((slab) => {
    const p = slab.querySelector("p:not(.k)");
    const more = document.createElement("div"); more.className = "more"; more.appendChild(p);
    const ojo = document.createElement("div"); ojo.className = "feye"; ojo.setAttribute("aria-hidden", "true");
    slab.querySelector(".k").after(ojo);
    slab.appendChild(more);
    slab.insertAdjacentHTML("beforeend", `<div class="hint">Tap the eye</div>`);
    slab.setAttribute("role", "button"); slab.tabIndex = 0;
    const abre = (si) => {
      const abierto = si ?? !slab.classList.contains("open");
      slab.classList.toggle("open", abierto); slab.setAttribute("aria-expanded", abierto);
      if (abierto) { zum(12); const r = ojo.getBoundingClientRect(); chisporrotea(r.left + r.width / 2, r.top + r.height / 2, 14, "peacock"); }
    };
    slab.addEventListener("click", () => abre());
    slab.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); abre(); } });
    slab._abre = abre;
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s)).forEach((s, k) => setTimeout(() => { if (!s.classList.contains("open")) s._abre(true); }, (quieto ? 0 : 800) + k * 380));
  });
})();
