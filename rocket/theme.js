// ROCKET — el fondo es el cielo de noche sobre la urbanización: palmeras, farolas y la casa club
// abajo; un cohete sale de detrás de los árboles y sube a medida que se avanza. Al llegar a la luz
// del sol suelta su nubecilla y se le hincha alrededor la burbuja azul, la "medusa", que crece hasta
// el final. Un reloj de misión (T+, altitud, velocidad) lo acompaña. Tocar el cielo lanza un cohete
// pequeño que florece donde tocas. Cada prompt va dentro de la cofia: se sube el acelerador y la
// cofia se abre en dos. Copiar lanza un cohetito que florece arriba. Las reglas se revelan dentro de
// una burbuja que se hincha. Cámara "launch": sube cada vez más deprisa y se tumba a la izquierda.
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");

  // ---------- el cielo, la urbanización y el cohete ----------
  const cv = document.createElement("canvas");
  cv.id = "sky"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  const cielo = document.createElement("canvas"), tierra = document.createElement("canvas");
  let W, H, dpr, suelo, P0, P1, P2, estrellas = [], soplos = [];

  const palmera = (c, x, base, h, s) => {
    c.strokeStyle = "#03050A"; c.lineCap = "round";
    c.lineWidth = 5 * s;
    c.beginPath(); c.moveTo(x, base); c.quadraticCurveTo(x + h * .06, base - h * .5, x + h * .02, base - h); c.stroke();
    const x0 = x + h * .02, y0 = base - h;
    c.lineWidth = 3 * s;
    for (let k = 0; k < 12; k++) {
      const a = -Math.PI + k / 11 * Math.PI + rnd(-.1, .1), L = h * rnd(.26, .36);
      const ex = x0 + Math.cos(a) * L, ey = y0 + Math.sin(a) * L * .6 + L * .45 * Math.abs(Math.cos(a));
      c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x0 + Math.cos(a) * L * .55, y0 + Math.sin(a) * L * .75 - L * .1, ex, ey); c.stroke();
    }
    // los puntales de madera
    c.lineWidth = 1.6 * s; c.strokeStyle = "#0A0D16";
    c.beginPath(); c.moveTo(x, base - h * .24); c.lineTo(x - h * .13, base); c.moveTo(x, base - h * .24); c.lineTo(x + h * .13, base); c.stroke();
  };

  const pintaFondo = () => {
    let c = cielo.getContext("2d");
    let g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#03050D"); g.addColorStop(.55, "#0A1024"); g.addColorStop(.86, "#1A2240"); g.addColorStop(1, "#0C0F18");
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    g = c.createLinearGradient(0, suelo - H * .14, 0, suelo);
    g.addColorStop(0, "rgba(255,170,90,0)"); g.addColorStop(1, "rgba(255,170,90,.16)");
    c.fillStyle = g; c.fillRect(0, suelo - H * .14, W, H * .14);

    c = tierra.getContext("2d");
    c.clearRect(0, 0, W, H);
    // la casa club: tejado a cuatro aguas, torrecilla y ventanas cálidas
    const cw = Math.min(W * .5, 380 * dpr), ch = cw * .2, x0 = W * .52 - cw * .5, base = suelo;
    c.fillStyle = "#070910";
    c.beginPath(); c.moveTo(x0, base); c.lineTo(x0, base - ch * .55); c.lineTo(x0 + cw * .12, base - ch * .85); c.lineTo(x0 + cw * .88, base - ch * .85); c.lineTo(x0 + cw, base - ch * .55); c.lineTo(x0 + cw, base); c.fill();
    c.beginPath(); c.moveTo(x0 + cw * .42, base - ch * .85); c.lineTo(x0 + cw * .45, base - ch * 1.15); c.lineTo(x0 + cw * .55, base - ch * 1.15); c.lineTo(x0 + cw * .58, base - ch * .85); c.fill();
    c.fillStyle = "#FFC77A";
    for (let k = 0; k < 9; k++) c.fillRect(x0 + cw * (.1 + k * .09), base - ch * .42, cw * .035, ch * .22);
    for (let k = 0; k < 3; k++) c.fillRect(x0 + cw * (.465 + k * .03), base - ch * 1.05, cw * .016, ch * .1);
    c.fillStyle = "#04060B"; c.fillRect(0, suelo, W, H - suelo);
    // farolas con su halo
    [[.1, 1], [.34, .8], [.7, .85], [.92, 1]].forEach(([fp, e]) => {
      const x = W * fp, h = H * .11 * e, top = suelo - h, R = 42 * dpr * e;
      c.strokeStyle = "#0B0E16"; c.lineWidth = 2 * dpr; c.beginPath(); c.moveTo(x, suelo); c.lineTo(x, top); c.stroke();
      const q = c.createRadialGradient(x, top, 0, x, top, R);
      q.addColorStop(0, "rgba(255,250,235,.95)"); q.addColorStop(.12, "rgba(255,245,220,.45)"); q.addColorStop(1, "rgba(255,240,210,0)");
      c.fillStyle = q; c.fillRect(x - R, top - R, R * 2, R * 2);
    });
    const ph = Math.min(H * .2, W * .42);
    [[.05, 1.05], [.27, .78], [.6, .95], [.83, .82], [.98, .7]].forEach(([fp, e]) => palmera(c, W * fp, suelo + 2 * dpr, ph * e, dpr * e));
  };

  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = cielo.width = tierra.width = Math.round(innerWidth * dpr);
    H = cv.height = cielo.height = tierra.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    suelo = H * .87;
    P0 = [W * .74, suelo - H * .02]; P1 = [W * .7, H * .3]; P2 = [W * .24, H * .12];
    estrellas = Array.from({ length: 130 }, () => [rnd(0, W), rnd(0, suelo * .8), rnd(.5, 1.5) * dpr, rnd(0, 6.28)]);
    soplos = Array.from({ length: 8 }, () => [rnd(-.7, .7), rnd(-.6, .5), rnd(.45, .8)]);
    pintaFondo();
  };
  tam();

  const B = (s) => { const u = 1 - s; return [u * u * P0[0] + 2 * u * s * P1[0] + s * s * P2[0], u * u * P0[1] + 2 * u * s * P1[1] + s * s * P2[1]]; };
  const SOL = .34; // donde el cohete llega a la luz del sol

  const reloj = document.createElement("div");
  reloj.id = "mission"; reloj.setAttribute("aria-hidden", "true");
  document.body.appendChild(reloj);
  let textoReloj = "";

  let s = 0, obj = 0, ultimo = 0;
  const lanzas = [];

  // la burbuja: una lágrima con el cuello en la nubecilla y la punta redonda alrededor del cohete
  const burbuja = (cp, cb, rb, a) => {
    const D = Math.hypot(cp[0] - cb[0], cp[1] - cb[1]);
    if (D <= rb * 1.02 || rb < 1) return;
    const th = Math.atan2(cp[1] - cb[1], cp[0] - cb[0]), al = Math.acos(rb / D);
    const p = new Path2D();
    p.moveTo(cp[0], cp[1]);
    p.lineTo(cb[0] + Math.cos(th + al) * rb, cb[1] + Math.sin(th + al) * rb);
    p.arc(cb[0], cb[1], rb, th + al, th - al + Math.PI * 2);
    p.closePath();
    const g = cx.createRadialGradient(cb[0], cb[1], 0, cb[0], cb[1], rb);
    g.addColorStop(0, `rgba(190,225,255,${.1 * a})`); g.addColorStop(.62, `rgba(130,180,255,${.15 * a})`);
    g.addColorStop(.93, `rgba(170,215,255,${.32 * a})`); g.addColorStop(1, `rgba(215,238,255,${.5 * a})`);
    cx.fillStyle = g; cx.fill(p);
    cx.strokeStyle = `rgba(120,180,255,${.12 * a})`; cx.lineWidth = 12 * dpr; cx.stroke(p);
    cx.strokeStyle = `rgba(215,238,255,${.45 * a})`; cx.lineWidth = 1.4 * dpr; cx.stroke(p);
  };
  const punto = (x, y, blanco, t, k = 1) => {
    const R = (blanco ? 26 : 16) * dpr * k * (1 + Math.sin(t * .03) * .08);
    const g = cx.createRadialGradient(x, y, 0, x, y, R);
    if (blanco) { g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.15, "rgba(225,240,255,.8)"); g.addColorStop(1, "rgba(150,200,255,0)"); }
    else { g.addColorStop(0, "rgba(255,250,230,1)"); g.addColorStop(.2, "rgba(255,170,70,.85)"); g.addColorStop(1, "rgba(255,110,30,0)"); }
    cx.fillStyle = g; cx.fillRect(x - R, y - R, R * 2, R * 2);
  };

  const pinta = (t) => {
    const dt = Math.min(50, t - (ultimo || t)), f = dt / 16.7; ultimo = t;
    if (quieto) s = obj; else { s += (obj - s) * Math.min(1, .035 * f); if (Math.abs(obj - s) < .0005) s = obj; }
    cx.globalCompositeOperation = "source-over";
    cx.drawImage(cielo, 0, 0);
    for (const [x, y, r, ph] of estrellas) {
      cx.fillStyle = `rgba(225,232,255,${.25 + .35 * (quieto ? .5 : (Math.sin(t * .0016 + ph) + 1) / 2)})`;
      cx.fillRect(x, y, r, r);
    }
    cx.globalCompositeOperation = "lighter";
    // la estela: humo gris abajo, violeta pálido arriba, donde le da el sol
    const N = 70;
    let prev = B(0);
    for (let k = 1; k <= N; k++) {
      const q = s * k / N, p = B(q), edad = s - q;
      const sol = q > SOL;
      cx.strokeStyle = sol ? `rgba(185,165,255,${Math.max(.08, .4 - edad * .5)})` : `rgba(150,150,170,${Math.max(.05, .3 - edad * .6)})`;
      if (!sol && edad < .04) cx.strokeStyle = "rgba(255,160,70,.75)";
      cx.lineWidth = (2 + edad * 16) * dpr;
      cx.beginPath(); cx.moveTo(prev[0], prev[1]); cx.lineTo(p[0], p[1]); cx.stroke();
      prev = p;
    }
    const cab = B(s);
    if (s > SOL) {
      // la nubecilla: crema y azul pálido, con el resplandor salmón abajo
      const cp = B(SOL), Rp = Math.min(W, H) * .055 * Math.min(1, (s - SOL) / .12);
      for (const [ox, oy, r] of soplos) {
        const x = cp[0] + ox * Rp, y = cp[1] + oy * Rp, R = r * Rp * 1.3;
        const g = cx.createRadialGradient(x, y, 0, x, y, R);
        g.addColorStop(0, oy > .2 ? "rgba(255,150,110,.32)" : "rgba(255,238,220,.32)"); g.addColorStop(1, "rgba(160,190,255,0)");
        cx.fillStyle = g; cx.fillRect(x - R, y - R, R * 2, R * 2);
      }
      // la burbuja azul, que crece alrededor del cohete
      const cre = Math.max(0, Math.min(1, (s - SOL - .06) / (1 - SOL - .06)));
      if (cre > 0) {
        const d = Math.hypot(cab[0] - cp[0], cab[1] - cp[1]), u = [(cab[0] - cp[0]) / d, (cab[1] - cp[1]) / d];
        const rb = Math.min(cre * Math.min(W, H) * .27 * (1 + Math.sin(t * .0012) * .015), d / 1.85);
        burbuja(cp, [cab[0] - u[0] * rb * .72, cab[1] - u[1] * rb * .72], rb, Math.min(1, cre * 3));
        // rayos finos desde el punto, hacia fuera
        cx.strokeStyle = `rgba(220,238,255,${.16 * Math.min(1, cre * 3)})`; cx.lineWidth = 1 * dpr;
        for (let k = -3; k <= 3; k++) {
          const a = Math.atan2(u[1], u[0]) + k * .2;
          cx.beginPath(); cx.moveTo(cab[0], cab[1]); cx.lineTo(cab[0] + Math.cos(a) * rb * .9, cab[1] + Math.sin(a) * rb * .9); cx.stroke();
        }
      }
    }
    punto(cab[0], cab[1], s > SOL, t);
    // los cohetes pequeños que lanza quien toca el cielo
    for (let k = lanzas.length - 1; k >= 0; k--) {
      const L = lanzas[k], e = (t - L.t0) / 700;
      if (e < 1) {
        const q = e * e, x = L.x + (L.x1 - L.x) * q, y = L.y + (L.y1 - L.y) * q;
        cx.strokeStyle = "rgba(170,165,190,.35)"; cx.lineWidth = 2.5 * dpr;
        cx.beginPath(); cx.moveTo(L.x, L.y); cx.lineTo(x, y); cx.stroke();
        punto(x, y, false, t, .7);
      } else {
        const v = Math.min(1, (t - L.t0 - 700) / 1600), a = 1 - Math.max(0, (t - L.t0 - 1900) / 1500);
        if (a <= 0) { lanzas.splice(k, 1); continue; }
        cx.strokeStyle = `rgba(170,165,190,${.3 * a})`; cx.lineWidth = 3 * dpr;
        cx.beginPath(); cx.moveTo(L.x, L.y); cx.lineTo(L.x1, L.y1); cx.stroke();
        const rb = (8 + 46 * Math.sqrt(v)) * dpr;
        burbuja([L.x1, L.y1 + rb * 1.6], [L.x1, L.y1 + rb * .1], rb, a);
        punto(L.x1, L.y1 - rb * .5, true, t, .55 * a);
      }
    }
    cx.globalCompositeOperation = "source-over";
    cx.drawImage(tierra, 0, 0);

    // el reloj de misión
    const seg = Math.round(s * 158), alt = Math.round(Math.pow(s, 1.25) * 186), vel = (s * 7.4).toFixed(1);
    const txt = `T+ 00:${String(Math.floor(seg / 60)).padStart(2, "0")}:${String(seg % 60).padStart(2, "0")} · ALT ${alt} KM · ${vel} KM/S`;
    if (txt !== textoReloj) { reloj.textContent = txt; textoReloj = txt; }
  };
  const bucle = (t) => { pinta(t); requestAnimationFrame(bucle); };
  if (quieto) pinta(0); else requestAnimationFrame(bucle);
  addEventListener("resize", () => { tam(); if (quieto) pinta(0); });

  // al avanzar, el cohete sube: luz del sol, nubecilla y la medusa que crece
  addEventListener("flyview", (e) => {
    const { index, total, dir } = e.detail;
    obj = .03 + .97 * (total > 1 ? index / (total - 1) : 0);
    if (dir) setTimeout(() => zum(dir > 0 ? [8, 20, 8] : 8), quieto ? 0 : 300);
    if (quieto) pinta(0);
  });

  // tocar el cielo: un cohete pequeño sale de detrás de los árboles y florece donde tocas
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a")) return;
    zum([6, 14, 6]);
    if (quieto) return;
    const y1 = Math.min(e.clientY * dpr, suelo - 90 * dpr);
    lanzas.push({ x: e.clientX * dpr + rnd(-30, 30) * dpr, y: suelo, x1: e.clientX * dpr, y1, t0: performance.now() });
    if (lanzas.length > 6) lanzas.shift();
  });

  // ---------- cada prompt dentro de la cofia: se sube el acelerador y se abre ----------
  document.querySelectorAll(".code").forEach((code, n) => {
    const caja = document.createElement("div");
    caja.className = "fairing closed";
    code.replaceWith(caja); caja.appendChild(code);
    caja.insertAdjacentHTML("beforeend", `<div class="shell l" aria-hidden="true"><b>PL-0${n + 1}</b></div><div class="shell r" aria-hidden="true"><b>PROMPT</b></div><div class="glow" aria-hidden="true"></div>
      <div class="track" data-nofly><span class="pct" aria-hidden="true">0%</span><button class="thumb" type="button" aria-label="Slide up to launch and reveal the prompt">↑</button></div><span class="lift-hint" aria-hidden="true">Slide up to launch</span>`);
    const via = caja.querySelector(".track"), mando = caja.querySelector(".thumb"), pct = caja.querySelector(".pct");
    const conchas = caja.querySelectorAll(".shell");
    let t = 0, abierta = false, arr = null, anim = 0, tramo = 0;
    const recorrido = () => Math.max(40, via.clientHeight - 52);
    const pon = (v) => {
      t = Math.max(0, Math.min(1, v));
      mando.style.transform = `translateY(${-t * recorrido()}px)`;
      pct.textContent = Math.round(t * 100) + "%";
      caja.style.setProperty("--t", t.toFixed(3));
      const sacude = quieto ? 0 : t * 2.2;
      conchas.forEach((c) => { c.style.translate = `${rnd(-sacude, sacude)}px ${rnd(-sacude, sacude)}px`; });
      const nuevo = Math.floor(t * 10);
      if (nuevo > tramo) zum(6);
      tramo = nuevo;
    };
    const abre = () => {
      if (abierta) return;
      abierta = true; cancelAnimationFrame(anim);
      pon(1);
      caja.classList.add("open"); caja.classList.remove("closed");
      conchas.forEach((c) => { c.style.translate = ""; });
      zum([30, 40, 60]);
      setTimeout(() => { via.remove(); caja.querySelector(".lift-hint")?.remove(); }, quieto ? 0 : 900);
    };
    // ir solo hasta un valor (el resorte de vuelta, o el lanzamiento con un toque)
    const ve = (hasta, ms, fin) => {
      cancelAnimationFrame(anim);
      const desde = t, t0 = performance.now();
      const paso = (ahora) => {
        const e = Math.min(1, (ahora - t0) / ms);
        pon(desde + (hasta - desde) * (hasta > desde ? e * e : 1 - (1 - e) * (1 - e)));
        if (e < 1) anim = requestAnimationFrame(paso); else fin && fin();
      };
      if (quieto) { pon(hasta); fin && fin(); } else anim = requestAnimationFrame(paso);
    };
    mando.addEventListener("pointerdown", (e) => {
      if (abierta) return;
      cancelAnimationFrame(anim);
      arr = { y: e.clientY, t, movido: false };
      try { mando.setPointerCapture(e.pointerId); } catch {}
    });
    mando.addEventListener("pointermove", (e) => {
      if (!arr) return;
      const dy = arr.y - e.clientY;
      if (Math.abs(dy) > 5) arr.movido = true;
      pon(arr.t + dy / recorrido());
    });
    const suelta = () => {
      if (!arr) return;
      const movido = arr.movido; arr = null;
      if (t >= .96) abre();
      else if (!movido) ve(1, 900, abre);      // un toque: el acelerador sube solo
      else ve(0, 380);                          // no ha llegado arriba: vuelve abajo
    };
    mando.addEventListener("pointerup", suelta);
    mando.addEventListener("pointercancel", () => { arr = null; ve(0, 380); });
    mando.addEventListener("click", (e) => { if (e.detail === 0 && !abierta) ve(1, 900, abre); }); // teclado
    via.addEventListener("click", (e) => { if (e.target === via && !abierta) ve(1, 900, abre); });
    caja.parentElement.querySelector(".cp")?.addEventListener("click", abre);
  });

  // al copiar: un cohetito sale del botón, deja humo y florece arriba
  const cohetito = (x0, y0) => {
    const el = document.createElement("i");
    el.className = "minirocket"; document.body.appendChild(el);
    const alto = Math.max(140, y0 - 90), dx = -rnd(40, 110), dur = 1100;
    const pos = (e) => [x0 + dx * e * e * e, y0 - alto * e * e];
    const kf = [];
    for (let n = 0; n <= 24; n++) { const e = n / 24, [x, y] = pos(e); kf.push({ transform: `translate(${x}px, ${y}px) rotate(${dx * e * e * .3}deg)` }); }
    el.animate(kf, { duration: dur, easing: "linear", fill: "forwards" });
    const t0 = performance.now();
    const humo = setInterval(() => {
      const e = Math.min(1, (performance.now() - t0) / dur), [x, y] = pos(e);
      const p = document.createElement("i");
      p.className = "smoke"; p.style.left = x + "px"; p.style.top = y + 12 + "px";
      document.body.appendChild(p); p.addEventListener("animationend", () => p.remove());
      if (e >= 1) clearInterval(humo);
    }, 45);
    setTimeout(() => {
      el.remove();
      const [x, y] = pos(1), j = document.createElement("i");
      j.className = "jelly"; j.style.left = x + "px"; j.style.top = y + "px";
      document.body.appendChild(j); j.addEventListener("animationend", () => j.remove());
    }, dur);
  };
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    zum([10, 20, 10]);
    if (quieto) return;
    const r = b.getBoundingClientRect();
    cohetito(r.left + r.width * .5, r.top);
  }));

  // ---------- reglas: dentro de una burbuja que se hincha ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((s) => {
    const dentro = document.createElement("div");
    dentro.className = "inner";
    [...s.childNodes].forEach((n) => dentro.appendChild(n));
    s.appendChild(dentro);
    s.insertAdjacentHTML("beforeend", `<i class="halo" aria-hidden="true"></i><i class="bulb" aria-hidden="true"></i><span class="hint" aria-hidden="true">Tap to launch</span>`);
    s.setAttribute("role", "button"); s.tabIndex = 0;
    s._florece = () => {
      // el aro llega hasta donde llega el recorte: 150% del radio de referencia del círculo
      const r = Math.hypot(s.offsetWidth, s.offsetHeight) / Math.SQRT2 * 1.5;
      s.style.setProperty("--hs", (r * 2 / 10).toFixed(1));
      s.classList.remove("bloom"); void s.offsetWidth; s.classList.add("bloom");
      zum([8, 30, 8]);
    };
    s.addEventListener("click", s._florece);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); s._florece(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s) && !s.classList.contains("bloom"))
      .forEach((s, n) => setTimeout(() => { if (!s.classList.contains("bloom")) s._florece(); }, (quieto ? 0 : 1150) + n * 520));
  });
})();
