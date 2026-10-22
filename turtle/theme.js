// TURTLE — el fondo es el lago visto con teleobjetivo desde la orilla: la orilla de árboles desenfocada y su
// reflejo, el agua gris verdosa con ondas, y en el centro la garceta de pie sobre la tortuga, las dos mirando a la
// derecha, con su reflejo debajo. Cada vez que se avanza, la garceta pica delante de la cara de la tortuga y deja
// un anillo. Tocar el lago hace saltar un pez. Cada prompt está bajo el agua: hay que arrastrar dos de los peces
// que nadan hasta la boca de la tortuga, que se abre cuando el pez se acerca. Al copiar salta un pez del botón.
// Las reglas salen de su reflejo. Cámara "lotus".
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");

  // ---------- el lago ----------
  const cv = document.createElement("canvas");
  cv.id = "lake"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  let W, H, dpr, fondo = null, rizos = [];
  const anillos = [], saltos = [];

  const pintaFondo = () => {
    fondo = document.createElement("canvas"); fondo.width = W; fondo.height = H;
    const c = fondo.getContext("2d");
    let g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#C9D2CC"); g.addColorStop(.12, "#9AAAA1"); g.addColorStop(1, "#56695F");
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    // la orilla de árboles, desenfocada, y su reflejo
    c.filter = `blur(${6 * dpr}px)`;
    for (const [y0, al] of [[H * .02, .95], [H * .2, .35]]) {
      for (let k = 0; k < 26; k++) {
        const x = rnd(-.05, 1.05) * W, r = rnd(.04, .09) * W;
        c.fillStyle = `rgba(${Math.round(rnd(50, 75))},${Math.round(rnd(80, 100))},${Math.round(rnd(55, 70))},${al})`;
        c.beginPath(); c.ellipse(x, y0 + H * .06, r, r * .8, 0, 0, 6.283); c.fill();
      }
    }
    c.filter = "none";
    c.fillStyle = "rgba(220,228,222,.55)"; c.fillRect(0, H * .13, W, H * .012);
  };

  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = Math.round(innerWidth * dpr); H = cv.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    pintaFondo();
    rizos = []; for (let k = 0; k < 60; k++) rizos.push({ x: rnd(0, 1), y: rnd(.16, 1), w: rnd(.03, .1), f: rnd(0, 6.283) });
    anillos.length = 0; saltos.length = 0;
  };
  tam();
  addEventListener("resize", tam);

  // la garceta sobre la tortuga, mirando a la derecha; "pica" de 0 (de pie) a 1 (pico en el agua)
  const pareja = (x, y, s, pica, alfa) => {
    cx.save(); cx.translate(x, y); cx.scale(s, s); cx.globalAlpha = alfa;
    // la tortuga: caparazón abombado y la cabeza a la derecha
    cx.fillStyle = "#3E4430"; cx.beginPath(); cx.ellipse(0, 0, 42, 16, 0, Math.PI, 0); cx.fill();
    cx.fillStyle = "#5C6638"; cx.beginPath(); cx.ellipse(48, -4, 10, 7, -.2, 0, 6.283); cx.fill();
    // la garceta: patas, cuerpo, cuello en S y pico naranja
    cx.strokeStyle = "#141414"; cx.lineWidth = 2.2;
    cx.beginPath(); cx.moveTo(-8, -15); cx.lineTo(-10, -52); cx.moveTo(4, -15); cx.lineTo(2, -52); cx.stroke();
    cx.fillStyle = "#F7F7F3"; cx.beginPath(); cx.ellipse(-4, -62, 22, 12, -.15, 0, 6.283); cx.fill();
    const hx = 22 + 26 * pica, hy = -98 + 92 * pica;
    cx.strokeStyle = "#F7F7F3"; cx.lineWidth = 7; cx.lineCap = "round";
    cx.beginPath(); cx.moveTo(12, -66); cx.quadraticCurveTo(26 - 10 * pica, -84 + 20 * pica, hx, hy); cx.stroke();
    cx.fillStyle = "#F7F7F3"; cx.beginPath(); cx.arc(hx, hy, 5, 0, 6.283); cx.fill();
    cx.strokeStyle = "#E39A2A"; cx.lineWidth = 2.5;
    const ang = -.15 + 1.25 * pica;
    cx.beginPath(); cx.moveTo(hx + 3, hy); cx.lineTo(hx + 3 + Math.cos(ang) * 26, hy + Math.sin(ang) * 26); cx.stroke();
    cx.restore();
  };

  let p = 0, objP = 0, ultimo = 0, picaT = -1e9;
  const pica = () => { picaT = performance.now(); };
  const pinta = (t) => {
    const dt = Math.min(50, t - (ultimo || t)); ultimo = t;
    p += (objP - p) * (quieto ? 1 : Math.min(1, dt / 900));
    cx.drawImage(fondo, 0, 0);
    // las ondas del agua
    cx.strokeStyle = "rgba(235,242,238,.22)"; cx.lineWidth = 1.2 * dpr;
    for (const r of rizos) {
      const y = H * r.y, x = ((r.x + t * .000008 * (1 + r.y)) % 1.1) * W, w = r.w * W * (.4 + r.y);
      cx.beginPath(); cx.moveTo(x, y + Math.sin(t * .002 + r.f) * dpr); cx.lineTo(x + w, y + Math.sin(t * .002 + r.f + 1) * dpr); cx.stroke();
    }
    // la pareja, y su reflejo
    const s = dpr * Math.min(1.6, W / dpr / 300), x0 = W * .42, y0 = H * .56;
    const e = Math.min(1, (t - picaT) / 700), golpe = quieto ? 0 : (e < 1 ? Math.sin(e * Math.PI) : 0);
    pareja(x0, y0, s, golpe, 1);
    cx.save(); cx.translate(0, y0 * 2 + 4 * dpr); cx.scale(1, -1); pareja(x0, y0, s, golpe, .22); cx.restore();
    if (e > .45 && e < .5 && !quieto) anillos.push({ x: x0 + 58 * s, y: y0, r: 4 * dpr, v: 1 });
    // los peces que saltan al tocar
    cx.fillStyle = "#DDE4E6";
    for (let k = saltos.length - 1; k >= 0; k--) {
      const f = saltos[k]; f.vy += .0016 * dt * dpr; f.x += f.vx * dt; f.y += f.vy * dt;
      if (f.y > f.y0 && f.vy > 0) { anillos.push({ x: f.x, y: f.y0, r: 4 * dpr, v: 1 }); saltos.splice(k, 1); continue; }
      cx.save(); cx.translate(f.x, f.y); cx.rotate(Math.atan2(f.vy, f.vx)); cx.beginPath(); cx.ellipse(0, 0, 9 * dpr, 3.5 * dpr, 0, 0, 6.283); cx.fill();
      cx.beginPath(); cx.moveTo(-8 * dpr, 0); cx.lineTo(-14 * dpr, -4 * dpr); cx.lineTo(-14 * dpr, 4 * dpr); cx.fill(); cx.restore();
    }
    // los anillos
    cx.lineWidth = 1.6 * dpr;
    for (let k = anillos.length - 1; k >= 0; k--) {
      const a = anillos[k]; a.r += .04 * dt * dpr; a.v -= dt / 1800;
      if (a.v <= 0) { anillos.splice(k, 1); continue; }
      cx.strokeStyle = `rgba(240,248,244,${.6 * a.v})`;
      cx.beginPath(); cx.ellipse(a.x, a.y, a.r, a.r * .3, 0, 0, 6.283); cx.stroke();
    }
  };
  const bucle = (t) => { requestAnimationFrame(bucle); pinta(t); };
  if (quieto) pinta(0); else requestAnimationFrame(bucle);
  addEventListener("resize", () => { if (quieto) pinta(0); });

  addEventListener("flyview", (e) => {
    const { index, total, dir } = e.detail;
    objP = total > 1 ? index / (total - 1) : 0;
    if (dir > 0) pica();
    if (dir) zum(dir > 0 ? [10, 30, 6] : 6);
    if (quieto) pinta(0);
  });

  // tocar el lago: salta un pez
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a")) return;
    zum(10);
    if (quieto) return;
    const y0 = e.clientY * dpr;
    anillos.push({ x: e.clientX * dpr, y: y0, r: 4 * dpr, v: 1 });
    saltos.push({ x: e.clientX * dpr, y: y0, y0, vx: rnd(-.15, .15) * dpr, vy: -rnd(.5, .7) * dpr });
  });

  // ---------- cada prompt, bajo el agua: dos peces a la boca de la tortuga ----------
  const HACEN = 2;
  document.querySelectorAll(".code").forEach((code, n) => {
    const caja = document.createElement("div");
    caja.className = "pond on";
    code.replaceWith(caja); caja.appendChild(code);
    caja.insertAdjacentHTML("beforeend", `<div class="water" data-nofly role="button" tabindex="0" aria-label="Drag two fish into the turtle's mouth to reveal the prompt"><p class="count">Feed the turtle: <b>0</b> / ${HACEN}</p><span class="head"><i class="mouth"></i></span>${'<i class="fish"></i>'.repeat(3)}</div>`);
    const agua = caja.querySelector(".water"), boca = agua.querySelector(".mouth"), cuenta = agua.querySelector(".count b");
    const peces = [...agua.querySelectorAll(".fish")].map((el, k) => ({ el, f: k * 2.1 + n, x: .3, y: .5, suelto: true, fuera: false, vx: 1 }));
    let comidos = 0, hecho = false, cogido = null, antes = 0;
    const anillo = (x, y) => { if (quieto) return; const r = document.createElement("i"); r.className = "ring"; r.style.left = x + "px"; r.style.top = y + "px"; agua.appendChild(r); r.addEventListener("animationend", () => r.remove()); };
    const centroBoca = () => { const a = agua.getBoundingClientRect(), b = boca.getBoundingClientRect(); return [b.left + b.width / 2 - a.left, b.top + b.height / 2 - a.top]; };
    const coloca = (q, w, h) => { q.el.style.transform = `translate(${(q.x * w).toFixed(1)}px,${(q.y * h).toFixed(1)}px) scaleX(${q.vx < 0 ? -1 : 1})`; };
    const abre = () => {
      if (hecho) return;
      hecho = true; caja.classList.remove("on"); caja.classList.add("off");
      zum([15, 30, 50]);
      setTimeout(() => agua.remove(), quieto ? 0 : 1100);
    };
    const come = (q) => {
      q.fuera = true; q.el.classList.add("gone"); agua.classList.remove("near");
      agua.classList.remove("gulp"); void agua.offsetWidth; agua.classList.add("gulp");
      comidos++; cuenta.textContent = comidos; zum([10, 40, 10]);
      if (comidos >= HACEN) setTimeout(abre, quieto ? 0 : 500);
    };
    const nada = (t) => {
      if (hecho) return;
      const dt = Math.min(50, t - (antes || t)); antes = t;
      const r = agua.getBoundingClientRect();
      for (const q of peces) {
        if (q.fuera || q === cogido) continue;
        // nadan en ochos lentos por la mitad izquierda del agua
        const nx = .34 + .24 * Math.sin(t * .0006 + q.f), ny = .3 + .45 * (.5 + .5 * Math.sin(t * .0009 + q.f * 1.7));
        q.vx = nx - q.x || q.vx; q.x += (nx - q.x) * Math.min(1, dt / 400); q.y += (ny - q.y) * Math.min(1, dt / 400);
        coloca(q, r.width, r.height);
      }
      requestAnimationFrame(nada);
    };
    agua.addEventListener("pointerdown", (e) => {
      if (hecho) return;
      const q = peces.find((p) => p.el === e.target && !p.fuera);
      if (!q) return;
      cogido = q; q.el.classList.add("held"); zum(8);
      try { agua.setPointerCapture(e.pointerId); } catch {}
    });
    agua.addEventListener("pointermove", (e) => {
      if (!cogido) return;
      const r = agua.getBoundingClientRect();
      cogido.x = (e.clientX - r.left) / r.width; cogido.y = (e.clientY - r.top) / r.height; cogido.vx = 1;
      coloca(cogido, r.width, r.height);
      const [bx, by] = centroBoca();
      agua.classList.toggle("near", Math.hypot(e.clientX - r.left - bx, e.clientY - r.top - by) < 60);
    });
    const suelta = (e) => {
      if (!cogido) return;
      const q = cogido; cogido = null; q.el.classList.remove("held");
      const r = agua.getBoundingClientRect(), [bx, by] = centroBoca();
      if (Math.hypot(e.clientX - r.left - bx, e.clientY - r.top - by) < 60) come(q);
      else { anillo(e.clientX - r.left, e.clientY - r.top); agua.classList.remove("near"); }
    };
    agua.addEventListener("pointerup", suelta);
    agua.addEventListener("pointercancel", (e) => suelta(e));
    agua.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); const q = peces.find((p) => !p.fuera); if (q) come(q); } });
    caja.parentElement.querySelector(".cp")?.addEventListener("click", abre);
    if (quieto) { peces.forEach((q, k) => { q.x = .25 + .15 * k; q.y = .5; }); requestAnimationFrame(() => { const r = agua.getBoundingClientRect(); peces.forEach((q) => coloca(q, r.width, r.height)); }); }
    else requestAnimationFrame(nada);
  });

  // al copiar: un pez salta del botón
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    zum([8, 20, 8]);
    if (quieto) return;
    const r = b.getBoundingClientRect(), f = document.createElement("span");
    f.className = "jump"; f.textContent = "🐟";
    f.style.cssText = `left:${r.left + r.width / 2}px;top:${r.top}px;--dx:${rnd(-90, 90).toFixed(0)}px`;
    document.body.appendChild(f); f.addEventListener("animationend", () => f.remove());
  }));

  // ---------- reglas: salen de su reflejo ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((s) => {
    if (!quieto) s.classList.add("mirror");
    s.setAttribute("role", "button"); s.tabIndex = 0;
    s._sale = () => {
      if (quieto) return;
      s.classList.add("mirror"); void s.offsetWidth;
      setTimeout(() => s.classList.remove("mirror"), 60);
      zum([6, 30, 6]);
    };
    s.addEventListener("click", s._sale);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); s._sale(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s) && !s._vista)
      .forEach((s, n) => { s._vista = true; setTimeout(() => { s.classList.remove("mirror"); zum([6, 30, 6]); }, (quieto ? 0 : 500) + n * 350); });
  });
})();
