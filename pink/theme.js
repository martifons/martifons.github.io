// PINK — el mundo en blanco y negro y solo el rosa con color. Detrás, una tormenta con su tornado;
// donde tocas el cielo cae un rayo. Cada prompt está bajo una capa de imprimación gris que se pinta
// de rosa arrastrando el dedo (o con un toque); el vídeo y los fotogramas salen en gris y el rosa
// vuelve al tocarlos; copiar salpica pintura; las reglas se encienden cuando les cae un rayo.
// La cámara da la vuelta en círculo (fly "orbit"), como el paseo alrededor de los coches.
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");

  // ---------- la tormenta ----------
  const cv = document.createElement("canvas");
  cv.id = "storm"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  const destello = document.createElement("div");
  destello.id = "flash"; destello.setAttribute("aria-hidden", "true");
  document.body.prepend(destello);

  let W, H, dpr, nubes = [], gotas = [], restos = [], sierra = [];
  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = Math.round(innerWidth * dpr); H = cv.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    nubes = Array.from({ length: 14 }, () => ({ x: Math.random() * W, y: rnd(-.05, .42) * H, r: rnd(.2, .45) * Math.max(W, H * .7), v: rnd(.04, .14) * dpr, a: rnd(.35, .7) }));
    gotas = Array.from({ length: Math.round(innerWidth / 4) }, () => ({ x: Math.random() * W, y: Math.random() * H, l: rnd(10, 22) * dpr, v: rnd(9, 15) * dpr }));
    restos = Array.from({ length: 70 }, () => ({ a: rnd(0, 6.28), h: Math.random(), r: rnd(.6, 1.8) * dpr, v: rnd(.02, .05) }));
    sierra = []; for (let x = -20; x <= W + 20; x += 26 * dpr) sierra.push([x, H * .86 - rnd(8, 60) * dpr * (Math.sin(x / W * 9) * .5 + .8)]);
  };
  tam();

  // un rayo: una línea quebrada del cielo al punto, con dos o tres ramas
  const rayos = [];
  const quiebra = (x0, y0, x1, y1, n, j) => {
    const p = [[x0, y0]];
    for (let k = 1; k < n; k++) { const f = k / n; p.push([x0 + (x1 - x0) * f + rnd(-j, j), y0 + (y1 - y0) * f + rnd(-j * .3, j * .3)]); }
    p.push([x1, y1]); return p;
  };
  const rayo = (x, y, fuerte = 1) => {
    if (quieto) return;
    const X = x * dpr, Y = y * dpr, p = quiebra(X + rnd(-60, 60) * dpr, -10, X, Y, 16, 26 * dpr);
    const ramas = [];
    for (let k = 0; k < 3; k++) { const o = p[2 + Math.floor(Math.random() * (p.length - 6))]; ramas.push(quiebra(o[0], o[1], o[0] + rnd(-120, 120) * dpr, o[1] + rnd(60, 160) * dpr, 7, 14 * dpr)); }
    rayos.push({ p, ramas, vida: 1 });
    destello.style.setProperty("--f", (.16 * fuerte).toFixed(3));
    destello.classList.remove("on"); void destello.offsetWidth; destello.classList.add("on");
  };
  const trueno = (lejos) => setTimeout(() => zum(lejos ? [20, 30, 30] : [35, 40, 60]), lejos ? 700 : 260);

  let viento = 1;
  const linea = (p, ancho) => { cx.lineWidth = ancho; cx.beginPath(); cx.moveTo(p[0][0], p[0][1]); for (const q of p) cx.lineTo(q[0], q[1]); cx.stroke(); };
  const pinta = (t) => {
    cx.clearRect(0, 0, W, H);
    // nubes bajas y oscuras
    for (const n of nubes) {
      n.x += n.v * viento; if (n.x - n.r > W) n.x = -n.r;
      const g = cx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
      g.addColorStop(0, `rgba(18,19,22,${n.a})`); g.addColorStop(1, "rgba(18,19,22,0)");
      cx.fillStyle = g; cx.fillRect(n.x - n.r, n.y - n.r, n.r * 2, n.r * 2);
    }
    // el tornado, en el horizonte
    const tx = W * .5 + Math.sin(t * .0004) * 18 * dpr, arriba = H * .28, suelo = H * .86;
    for (let k = 0; k <= 46; k++) {
      const f = k / 46, y = arriba + (suelo - arriba) * f;
      const w = (W * .14 * (1 - f) + 7 * dpr) * (1 + .12 * Math.sin(t * .004 + k * .7));
      const x = tx + Math.sin(t * .0016 + f * 4) * 16 * dpr * f;
      cx.fillStyle = `rgba(14,14,16,${.10 + f * .05})`;
      cx.beginPath(); cx.ellipse(x, y, w, w * .22, 0, 0, 6.283); cx.fill();
    }
    cx.fillStyle = "rgba(120,122,128,.55)";
    for (const r of restos) {
      r.a += r.v * (quieto ? 0 : 1); const rad = (14 + r.h * 60) * dpr, y = suelo - r.h * 90 * dpr;
      cx.fillRect(tx + Math.cos(r.a) * rad, y + Math.sin(r.a) * rad * .2, r.r, r.r);
    }
    // montañas y la pista mojada
    cx.fillStyle = "#16171A"; cx.beginPath(); cx.moveTo(0, H); for (const [x, y] of sierra) cx.lineTo(x, y); cx.lineTo(W, H); cx.fill();
    const pista = cx.createLinearGradient(0, H * .86, 0, H);
    pista.addColorStop(0, "#202225"); pista.addColorStop(1, "#0D0E10");
    cx.fillStyle = pista; cx.fillRect(0, H * .86, W, H * .14);
    cx.fillStyle = "rgba(255,255,255,.035)"; cx.fillRect(0, H * .86, W, 1.5 * dpr);
    // lluvia en diagonal
    cx.strokeStyle = "rgba(205,210,220,.22)"; cx.lineWidth = 1 * dpr; cx.beginPath();
    for (const g of gotas) {
      if (!quieto) { g.y += g.v * viento; g.x += g.v * .28 * viento; if (g.y > H) { g.y = -g.l; g.x = Math.random() * W * 1.2 - W * .2; } }
      cx.moveTo(g.x, g.y); cx.lineTo(g.x - g.l * .28, g.y - g.l);
    }
    cx.stroke();
    // los rayos
    for (let k = rayos.length - 1; k >= 0; k--) {
      const r = rayos[k];
      cx.save(); cx.shadowColor = "rgba(190,205,255,1)"; cx.shadowBlur = 22 * dpr * r.vida; cx.lineJoin = "round";
      cx.strokeStyle = `rgba(235,240,255,${r.vida})`; linea(r.p, 2.6 * dpr);
      cx.strokeStyle = `rgba(215,225,255,${r.vida * .7})`; for (const b of r.ramas) linea(b, 1.2 * dpr);
      cx.restore();
      r.vida -= r.vida > .6 ? .09 : .045; if (r.vida <= 0) rayos.splice(k, 1);
    }
  };
  const bucle = (t) => { viento += (1 - viento) * .03; pinta(t); requestAnimationFrame(bucle); };
  if (quieto) pinta(0); else requestAnimationFrame(bucle);
  addEventListener("resize", () => { tam(); if (quieto) pinta(0); });

  // rayos lejanos, cada pocos segundos, detrás del tornado
  const lejano = () => {
    if (!document.hidden) { rayo(innerWidth * rnd(.3, .7), innerHeight * rnd(.42, .6), .5); trueno(true); }
    setTimeout(lejano, rnd(5000, 9000));
  };
  if (!quieto) setTimeout(lejano, 2500);

  // tocar el cielo: cae un rayo justo ahí, y una onda rosa en el suelo
  const onda = (x, y) => {
    if (quieto) return;
    const o = document.createElement("i"); o.className = "ring"; o.style.left = x + "px"; o.style.top = y + "px";
    document.body.appendChild(o); o.addEventListener("animationend", () => o.remove());
  };
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a")) return;
    rayo(e.clientX, e.clientY); onda(e.clientX, e.clientY); trueno(false); viento = 3;
  });

  // ---------- el color vuelve al llegar ----------
  addEventListener("flyview", (e) => {
    e.detail.els.forEach((el) => el.classList.add("painted"));
    if (e.detail.dir) { viento = 2.5; zum(8); }
  });

  // el vídeo y los fotogramas, en gris: al tocarlos vuelve el rosa
  document.querySelectorAll(".shot, .frames figure, .step-img").forEach((m) => {
    m.classList.add("greyed");
    if (m.classList.contains("shot")) m.insertAdjacentHTML("beforeend", `<span class="pinkhint" aria-hidden="true">Tap for pink</span>`);
    m.setAttribute("data-nofly", "");
    m.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      m.classList.toggle("pinked"); zum(10);
    });
  });

  // ---------- pintura que salpica ----------
  const salpica = (x, y, n = 16) => {
    if (quieto) return;
    for (let k = 0; k < n; k++) {
      const d = document.createElement("i"); d.className = "splat";
      const s = rnd(5, 15), a = rnd(0, 6.283), r = rnd(30, 120);
      d.style.width = d.style.height = s + "px"; d.style.left = x + "px"; d.style.top = y + "px";
      document.body.appendChild(d);
      d.animate([
        { transform: "translate(-50%, -50%) scale(.3)", opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * r}px), calc(-50% + ${Math.sin(a) * r + 30}px)) scale(1)`, opacity: 0 },
      ], { duration: rnd(550, 900), easing: "cubic-bezier(.2,.8,.3,1)" }).onfinish = () => d.remove();
    }
  };

  // ---------- cada prompt, bajo la imprimación: píntalo de rosa ----------
  const lata = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="9" width="10" height="13" rx="2"/><path d="M9 9V6h4v3M11 6V4M17 4l3-1M17 6h4M17 8l3 1"/></svg>`;
  document.querySelectorAll(".code").forEach((code) => {
    const caja = document.createElement("div");
    caja.className = "spray sealed";
    code.replaceWith(caja); caja.appendChild(code);
    const capa = document.createElement("canvas");
    capa.className = "primer"; capa.setAttribute("aria-hidden", "true"); capa.setAttribute("data-nofly", "");
    caja.appendChild(capa);
    caja.insertAdjacentHTML("beforeend", `<button class="spray-btn" type="button" data-nofly aria-label="Spray the cover pink to reveal the prompt">${lata}<span>Spray to reveal</span></button>`);
    const boton = caja.querySelector(".spray-btn");
    const lc = capa.getContext("2d");
    let k = 1, abierto = false, auto = 0, trazos = 0, ultimo = null, movido = 0;

    const imprima = () => {
      k = Math.min(2, devicePixelRatio || 1);
      capa.width = Math.max(1, Math.round(code.offsetWidth * k)); capa.height = Math.max(1, Math.round(code.offsetHeight * k));
      const g = lc.createLinearGradient(0, 0, capa.width, capa.height);
      g.addColorStop(0, "#47484C"); g.addColorStop(1, "#2E2F33");
      lc.globalCompositeOperation = "source-over"; lc.fillStyle = g; lc.fillRect(0, 0, capa.width, capa.height);
      for (let n = 0; n < capa.width * capa.height / 260; n++) { lc.fillStyle = `rgba(255,255,255,${rnd(0, .05)})`; lc.fillRect(Math.random() * capa.width, Math.random() * capa.height, k, k); }
    };
    // tamaño de layout, sin la perspectiva: offsetWidth, no getBoundingClientRect
    requestAnimationFrame(imprima);
    addEventListener("resize", () => { if (!abierto) imprima(); });

    const rocia = (x, y) => {
      const R = 34 * k;
      lc.globalCompositeOperation = "destination-out";
      const g = lc.createRadialGradient(x, y, 0, x, y, R);
      g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(.6, "rgba(0,0,0,.9)"); g.addColorStop(1, "rgba(0,0,0,0)");
      lc.fillStyle = g; lc.beginPath(); lc.arc(x, y, R, 0, 6.283); lc.fill();
      // la niebla rosa se queda pegada a la imprimación que queda alrededor
      lc.globalCompositeOperation = "source-atop";
      for (let n = 0; n < 18; n++) { const a = rnd(0, 6.283), r = rnd(R * .7, R * 1.5); lc.fillStyle = `rgba(255,79,168,${rnd(.25, .8)})`; lc.beginPath(); lc.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, rnd(.6, 2.2) * k, 0, 6.283); lc.fill(); }
      if (++trazos % 8 === 0) { zum(5); if (limpio() > .5) abre(); }
    };
    const limpio = () => {
      const paso = Math.max(6, Math.round(14 * k)), d = lc.getImageData(0, 0, capa.width, capa.height).data;
      let n = 0, v = 0;
      for (let y = paso / 2; y < capa.height; y += paso) for (let x = paso / 2; x < capa.width; x += paso) { n++; if (d[(Math.floor(y) * capa.width + Math.floor(x)) * 4 + 3] < 60) v++; }
      return n ? v / n : 1;
    };
    const abre = () => {
      if (abierto) return;
      abierto = true; cancelAnimationFrame(auto);
      caja.classList.add("open"); caja.classList.remove("sealed");
      zum([15, 30, 15]);
      const r = caja.getBoundingClientRect(); salpica(r.left + r.width / 2, r.top + r.height / 2, 20);
      setTimeout(() => { capa.remove(); boton.remove(); }, 700);
    };
    const local = (e) => [e.offsetX * capa.width / capa.offsetWidth, e.offsetY * capa.height / capa.offsetHeight];
    capa.addEventListener("pointerdown", (e) => {
      if (abierto) return;
      e.preventDefault(); capa.setPointerCapture(e.pointerId);
      ultimo = local(e); movido = 0; rocia(...ultimo);
    });
    capa.addEventListener("pointermove", (e) => {
      if (!ultimo || abierto) return;
      const [x, y] = local(e), dx = x - ultimo[0], dy = y - ultimo[1], d = Math.hypot(dx, dy);
      movido += d / k;
      for (let s = 12 * k; s < d; s += 12 * k) rocia(ultimo[0] + dx * s / d, ultimo[1] + dy * s / d);
      rocia(x, y); ultimo = [x, y];
    });
    const suelta = () => { if (!ultimo) return; ultimo = null; if (!abierto && movido < 6) pintaSolo(); };
    capa.addEventListener("pointerup", suelta);
    capa.addEventListener("pointercancel", () => { ultimo = null; });

    // un toque o el botón: el spray barre solo, en zigzag
    const pintaSolo = () => {
      if (abierto || auto) return;
      if (quieto) { abre(); return; }
      boton.classList.add("busy");
      const t0 = performance.now(), filas = 5;
      const paso = (t) => {
        const p = Math.min(1, (t - t0) / 1000), fila = Math.min(filas - 1, Math.floor(p * filas)), f = p * filas - fila;
        const x = (fila % 2 ? 1 - f : f) * capa.width, y = (fila + .5) / filas * capa.height;
        for (let s = -1; s <= 1; s++) rocia(x + s * 10 * k, y + s * 8 * k);
        if (p < 1 && !abierto) auto = requestAnimationFrame(paso); else abre();
      };
      auto = requestAnimationFrame(paso);
    };
    boton.addEventListener("click", pintaSolo);
    caja.parentElement.querySelector(".cp")?.addEventListener("click", () => { if (!abierto) abre(); });
  });

  // al copiar: salpicadura rosa y un rayo lejano
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    const r = b.getBoundingClientRect();
    salpica(r.left + r.width / 2, r.top + r.height / 2, 18);
    rayo(innerWidth * rnd(.3, .7), innerHeight * .5, .5); trueno(true);
  }));

  // ---------- reglas: les cae un rayo y se encienden ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((s) => {
    s.insertAdjacentHTML("beforeend", `<div class="hint">Tap for lightning</div>`);
    s.setAttribute("role", "button"); s.tabIndex = 0;
    s._golpe = () => {
      const r = s.getBoundingClientRect();
      rayo(r.left + r.width / 2, r.top + 4, .8); trueno(false);
      s.classList.remove("struck"); void s.offsetWidth; s.classList.add("struck");
      s.setAttribute("aria-expanded", "true");
    };
    s.addEventListener("click", s._golpe);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); s._golpe(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s) && !s.classList.contains("struck"))
      .forEach((s, n) => setTimeout(() => { if (!s.classList.contains("struck")) s._golpe(); }, (quieto ? 0 : 1250) + n * 600));
  });
})();
