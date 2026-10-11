// WINTER — el fondo partido por una capa de nube: verano arriba, invierno con nieve debajo. A cada
// paso la nube sube, como si la cámara se metiera debajo. Tocar por encima de la nube suelta una
// bocanada que se une a ella; tocar por debajo deja una bola de nieve. Cada prompt está tapado por
// la nube: se arrastra hacia abajo el botón para atravesarla (o se toca y baja solo). Copiar
// suelta copos; las reglas están cubiertas de nieve que se sacude.
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");

  // ---------- el cielo partido ----------
  const cv = document.createElement("canvas");
  cv.id = "weather"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  let W, H, dpr, copos = [], bultos = [];
  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = Math.round(innerWidth * dpr); H = cv.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    copos = Array.from({ length: Math.round(innerWidth / 5) }, () => ({ x: Math.random(), y: Math.random(), r: rnd(.8, 2.4), v: rnd(.0012, .0035), f: rnd(0, 6.3) }));
    bultos = Array.from({ length: Math.round(innerWidth / 26) + 8 }, () => ({ x: Math.random(), dy: rnd(-.6, .6), r: rnd(.06, .13), v: rnd(.000004, .000014), a: rnd(.55, .95) }));
  };
  tam();
  let ny = .7, objY = .7;                 // altura de la nube (fracción de la pantalla)
  const extra = [], bolas = [];           // bocanadas y copos sueltos; bolas de nieve
  const pinta = (t) => {
    ny += (objY - ny) * (quieto ? 1 : .035);
    const L = ny * H, th = H * .075;
    // verano: cielo azul que se calienta hacia la nube, y el sol
    let g = cx.createLinearGradient(0, 0, 0, L);
    g.addColorStop(0, "#4F84BE"); g.addColorStop(.7, "#A9C7E2"); g.addColorStop(1, "#F2D2A6");
    cx.fillStyle = g; cx.fillRect(0, 0, W, L);
    const sol = cx.createRadialGradient(W * .8, L * .22, 0, W * .8, L * .22, W * .4);
    sol.addColorStop(0, "rgba(255,244,214,.7)"); sol.addColorStop(1, "rgba(255,244,214,0)");
    cx.fillStyle = sol; cx.fillRect(0, 0, W, L);
    // invierno: oscuro y frío
    g = cx.createLinearGradient(0, L, 0, H);
    g.addColorStop(0, "#3C4756"); g.addColorStop(1, "#0B1016");
    cx.fillStyle = g; cx.fillRect(0, L, W, H - L);
    // la nieve cae solo por debajo de la nube
    cx.fillStyle = "#fff";
    for (const c of copos) {
      if (!quieto) { c.y += c.v; c.f += .02; if (c.y > 1) { c.y = 0; c.x = Math.random(); } }
      const y = L + th * .6 + c.y * (H - L), x = (c.x + Math.sin(c.f) * .01) * W;
      if (y > H) continue;
      cx.globalAlpha = .75; cx.beginPath(); cx.arc(x, y, c.r * dpr, 0, 6.283); cx.fill();
    }
    cx.globalAlpha = 1;
    // la nube: la panza gris por debajo y la cara blanca al sol por arriba
    for (const pase of [0, 1]) {
      for (const b of bultos) {
        const x = ((b.x + t * b.v) % 1.2 - .1) * W, R = b.r * W * (pase ? .9 : 1.05);
        const y = L + (pase ? -th * .35 : th * .35) + b.dy * th * .5;
        const n = cx.createRadialGradient(x, y, 0, x, y, R);
        if (pase) { n.addColorStop(0, `rgba(255,255,255,${b.a})`); n.addColorStop(.55, `rgba(236,236,240,${b.a * .6})`); n.addColorStop(1, "rgba(236,236,240,0)"); }
        else { n.addColorStop(0, `rgba(96,104,116,${b.a})`); n.addColorStop(.6, `rgba(80,88,100,${b.a * .55})`); n.addColorStop(1, "rgba(80,88,100,0)"); }
        cx.fillStyle = n; cx.fillRect(x - R, y - R, R * 2, R * 2);
      }
    }
    // bocanadas y copos sueltos
    for (let k = extra.length - 1; k >= 0; k--) {
      const p = extra[k];
      p.x += p.vx * dpr; p.y += p.vy * dpr; p.vida -= p.dec;
      if (p.nube) { p.vy += (L - p.y) * .0009; p.r += .15 * dpr; } else { p.vy += .06; }
      if (p.vida <= 0) { extra.splice(k, 1); continue; }
      if (p.nube) { const n = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r); n.addColorStop(0, `rgba(255,255,255,${.8 * p.vida})`); n.addColorStop(1, "rgba(255,255,255,0)"); cx.fillStyle = n; cx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2); }
      else { cx.globalAlpha = p.vida; cx.fillStyle = "#fff"; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fill(); cx.globalAlpha = 1; }
    }
    // bolas de nieve
    for (let k = bolas.length - 1; k >= 0; k--) {
      const b = bolas[k]; b.vida -= .0025; if (b.vida <= 0) { bolas.splice(k, 1); continue; }
      const s = Math.min(1, (1 - b.vida) * 12), r = b.r * s;
      cx.globalAlpha = Math.min(1, b.vida * 3);
      const n = cx.createRadialGradient(b.x - r * .35, b.y - r * .4, r * .1, b.x, b.y, r);
      n.addColorStop(0, "#FFFFFF"); n.addColorStop(.7, "#E3EAF2"); n.addColorStop(1, "#AFC0D2");
      cx.fillStyle = "rgba(0,0,0,.25)"; cx.beginPath(); cx.ellipse(b.x, b.y + r * .85, r * .9, r * .25, 0, 0, 6.283); cx.fill();
      cx.fillStyle = n; cx.beginPath(); cx.arc(b.x, b.y, r, 0, 6.283); cx.fill(); cx.globalAlpha = 1;
    }
  };
  const bucle = (t) => { pinta(t); requestAnimationFrame(bucle); };
  if (quieto) pinta(0); else requestAnimationFrame(bucle);
  addEventListener("resize", () => { tam(); if (quieto) pinta(0); });

  const copitos = (x, y, n = 14, fuerza = 1) => {
    if (quieto) return;
    for (let k = 0; k < n; k++) { const a = rnd(-Math.PI, 0); extra.push({ x: x * dpr, y: y * dpr, vx: Math.cos(a) * rnd(.6, 2.6) * fuerza, vy: Math.sin(a) * rnd(1, 3.2) * fuerza, r: rnd(1.2, 3) * dpr, vida: 1, dec: rnd(.012, .022) }); }
  };

  // tocar: por encima de la nube, una bocanada que sube a unirse; por debajo, una bola de nieve
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a")) return;
    if (e.clientY < ny * innerHeight) {
      for (let k = 0; k < 5; k++) extra.push({ nube: true, x: (e.clientX + rnd(-18, 18)) * dpr, y: (e.clientY + rnd(-10, 10)) * dpr, vx: rnd(-.3, .3), vy: 0, r: rnd(14, 26) * dpr, vida: 1, dec: .006 });
      zum(8);
    } else {
      bolas.push({ x: e.clientX * dpr, y: e.clientY * dpr, r: rnd(11, 17) * dpr, vida: 1 });
      if (bolas.length > 12) bolas.shift();
      copitos(e.clientX, e.clientY, 12); zum([12, 20, 12]);
    }
  });

  // al avanzar, la nube sube: la cámara se mete debajo
  addEventListener("flyview", (e) => {
    const p = e.detail.total > 1 ? e.detail.index / (e.detail.total - 1) : 0;
    objY = .72 - p * .54;
    if (e.detail.dir) setTimeout(() => zum(8), quieto ? 0 : 900);
  });

  // el título: verano arriba, invierno abajo
  // (lo hace el CSS; aquí nada)

  // ---------- cada prompt, tapado por la nube: arrastra hacia abajo para atravesarla ----------
  document.querySelectorAll(".code").forEach((code) => {
    const caja = document.createElement("div");
    caja.className = "divebox clouded";
    code.replaceWith(caja); caja.appendChild(code);
    caja.insertAdjacentHTML("beforeend", `<i class="cover" aria-hidden="true"></i><button class="diver" type="button" data-nofly aria-label="Drag down through the cloud to reveal the prompt"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v15M6 13l6 6 6-6"/></svg><span>Drag down to dive</span></button>`);
    const boton = caja.querySelector(".diver");
    let d = 0, abierto = false, y0 = null, d0 = 0, movido = 0, auto = 0;
    const pon = () => caja.style.setProperty("--d", d.toFixed(3));
    const abre = () => {
      if (abierto) return;
      abierto = true; cancelAnimationFrame(auto); d = 1; pon();
      caja.classList.add("open"); caja.classList.remove("clouded");
      zum([10, 30, 10]);
      const r = caja.getBoundingClientRect(); copitos(r.left + r.width / 2, r.bottom - 20, 22, 1.3);
      setTimeout(() => { boton.remove(); caja.querySelector(".cover")?.remove(); }, 650);
    };
    const pasa = (antes) => { if (Math.floor(antes * 4) !== Math.floor(d * 4)) zum(6); if (d >= .92) abre(); };
    boton.addEventListener("pointerdown", (e) => {
      if (abierto) return;
      e.preventDefault(); boton.setPointerCapture(e.pointerId); y0 = e.clientY; d0 = d; movido = 0;
    });
    boton.addEventListener("pointermove", (e) => {
      if (y0 === null || abierto || auto) return;
      const dy = e.clientY - y0; movido = Math.max(movido, Math.abs(dy));
      const antes = d; d = Math.max(0, Math.min(1, d0 + dy / Math.max(120, caja.offsetHeight - 56))); pon(); pasa(antes);
    });
    // un toque sin arrastrar: baja sola
    const solo = () => {
      if (abierto || auto) return;
      if (quieto) { abre(); return; }
      const desde = d, t0 = performance.now();
      const paso = (t) => { const p = Math.min(1, (t - t0) / 900), antes = d; d = desde + (1 - desde) * (p * p * (3 - 2 * p)); pon(); pasa(antes); if (p < 1 && !abierto) auto = requestAnimationFrame(paso); else abre(); };
      auto = requestAnimationFrame(paso);
    };
    boton.addEventListener("pointerup", () => { if (y0 === null) return; y0 = null; if (!abierto && movido < 6) solo(); });
    boton.addEventListener("pointercancel", () => { y0 = null; });
    boton.addEventListener("click", (e) => { if (e.detail === 0) solo(); }); // teclado
    caja.parentElement.querySelector(".cp")?.addEventListener("click", () => { if (!abierto) abre(); });
  });

  // al copiar: copos
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    const r = b.getBoundingClientRect(); copitos(r.left + r.width / 2, r.top, 26, 1.2); zum(12);
  }));

  // ---------- reglas: cubiertas de nieve que se sacude ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((s) => {
    s.insertAdjacentHTML("afterbegin", `<i class="drift" aria-hidden="true"></i>`);
    s.insertAdjacentHTML("beforeend", `<div class="hint">Tap to shake off the snow</div>`);
    s.setAttribute("role", "button"); s.tabIndex = 0;
    s._sacude = () => {
      const r = s.getBoundingClientRect();
      if (!s.classList.contains("clear")) { s.classList.add("clear"); s.setAttribute("aria-expanded", "true"); }
      copitos(r.left + r.width / 2, r.top + r.height * .6, 18); zum([8, 20, 8]);
    };
    s.addEventListener("click", s._sacude);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); s._sacude(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s) && !s.classList.contains("clear"))
      .forEach((s, n) => setTimeout(() => { if (!s.classList.contains("clear")) s._sacude(); }, (quieto ? 0 : 1250) + n * 500));
  });
})();
