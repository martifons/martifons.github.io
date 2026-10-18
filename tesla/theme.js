// GOODBYE — el fondo es la carretera al anochecer: cielo azul profundo, árboles en silueta, farolas,
// la carretera en perspectiva y el resplandor del coche patrulla que tiñe los bordes de rojo y azul,
// despacio. El coche plateado está en la carretera al principio y, a medida que se avanza, despega
// sobre cuatro chorros y se va haciendo pequeño en el cielo. Tocar la carretera da un golpe de luces.
// Cada prompt está bajo una multa que se arranca por la línea de puntos. Copiar choca dos puños. Las
// reglas están a oscuras y las barre la linterna del agente. Cámara "liftoff".
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");

  // ---------- la carretera al anochecer ----------
  const cv = document.createElement("canvas");
  cv.id = "road"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  const fondo = document.createElement("canvas"), fx = fondo.getContext("2d");
  let W, H, dpr, horizonte, farolas = [];

  const pintaFondo = () => {
    const c = fx;
    let g = c.createLinearGradient(0, 0, 0, horizonte);
    g.addColorStop(0, "#0B1636"); g.addColorStop(.7, "#22386A"); g.addColorStop(1, "#465A86");
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    // árboles en silueta a los dos lados
    c.fillStyle = "#070B14";
    for (const lado of [0, 1]) for (let k = 0; k < 14; k++) {
      const x = lado ? W - rnd(0, W * .42) : rnd(0, W * .42), r = rnd(30, 70) * dpr, y = horizonte - rnd(.02, .2) * H;
      c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill();
    }
    c.fillRect(0, horizonte - H * .03, W, H * .04);
    // el suelo y la carretera en perspectiva
    c.fillStyle = "#0A0D15"; c.fillRect(0, horizonte, W, H - horizonte);
    c.fillStyle = "#1A1D26";
    c.beginPath(); c.moveTo(W * .47, horizonte); c.lineTo(W * .53, horizonte); c.lineTo(W * 1.1, H); c.lineTo(-W * .1, H); c.closePath(); c.fill();
    c.strokeStyle = "rgba(235,235,225,.5)"; c.lineWidth = 2 * dpr;
    c.beginPath(); c.moveTo(W * .475, horizonte); c.lineTo(-W * .05, H); c.moveTo(W * .525, horizonte); c.lineTo(W * 1.05, H); c.stroke();
    c.strokeStyle = "rgba(240,200,80,.75)";
    for (let k = 0; k < 9; k++) {
      const a = Math.pow(k / 9, 1.8), b = Math.pow((k + .5) / 9, 1.8);
      c.lineWidth = (1 + a * 7) * dpr;
      c.beginPath(); c.moveTo(W * .5, horizonte + (H - horizonte) * a); c.lineTo(W * .5, horizonte + (H - horizonte) * b); c.stroke();
    }
  };
  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = fondo.width = Math.round(innerWidth * dpr); H = cv.height = fondo.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    horizonte = H * .62;
    farolas = [[W * .12, horizonte - H * .14], [W * .3, horizonte - H * .06], [W * .7, horizonte - H * .06], [W * .88, horizonte - H * .14]];
    pintaFondo();
  };
  tam();
  addEventListener("resize", tam);

  // el coche, de lado: chapa plateada en cuña, ventanilla con luz roja, ruedas y, al volar, cuatro chorros
  const coche = (x, y, s, chorro, t) => {
    cx.save(); cx.translate(x, y); cx.scale(s, s);
    if (chorro > 0) {
      for (const jx of [-48, -22, 22, 48]) {
        const L = (30 + 25 * Math.sin(t * .03 + jx)) * chorro;
        const g = cx.createLinearGradient(0, 10, 0, 10 + L);
        g.addColorStop(0, "rgba(255,255,255,.95)"); g.addColorStop(1, "rgba(200,220,255,0)");
        cx.fillStyle = g; cx.beginPath(); cx.moveTo(jx - 5, 10); cx.lineTo(jx + 5, 10); cx.lineTo(jx + 2, 10 + L); cx.lineTo(jx - 2, 10 + L); cx.fill();
      }
    }
    const g = cx.createLinearGradient(0, -30, 0, 10);
    g.addColorStop(0, "#D9DCE0"); g.addColorStop(.5, "#9EA3AA"); g.addColorStop(1, "#5F646B");
    cx.fillStyle = g;
    cx.beginPath(); cx.moveTo(-70, 6); cx.lineTo(-66, -12); cx.lineTo(-10, -30); cx.lineTo(70, -14); cx.lineTo(72, 6); cx.closePath(); cx.fill();
    cx.fillStyle = "rgba(255,60,60,.75)"; cx.beginPath(); cx.moveTo(-40, -13); cx.lineTo(-10, -24); cx.lineTo(30, -16); cx.lineTo(28, -8); cx.lineTo(-38, -8); cx.fill();
    cx.fillStyle = "#111"; for (const wx of [-44, 44]) { cx.beginPath(); cx.arc(wx, 7, 10, 0, 6.283); cx.fill(); }
    cx.fillStyle = "#fff"; cx.fillRect(66, -12, 5, 3);
    cx.restore();
  };

  let p = 0, objP = 0, ultimo = 0, golpe = 0;
  const humo = [];
  const pinta = (t) => {
    const dt = Math.min(50, t - (ultimo || t)), f = dt / 16.7; ultimo = t;
    p += (objP - p) * (quieto ? 1 : Math.min(1, dt / 900));
    cx.drawImage(fondo, 0, 0);
    // farolas
    for (const [x, y] of farolas) {
      const R = 46 * dpr, g = cx.createRadialGradient(x, y, 0, x, y, R);
      g.addColorStop(0, "rgba(255,200,120,.95)"); g.addColorStop(.15, "rgba(255,170,80,.4)"); g.addColorStop(1, "rgba(255,150,60,0)");
      cx.fillStyle = g; cx.fillRect(x - R, y - R, R * 2, R * 2);
    }
    // el coche: en la carretera hasta un poco y luego despega, cada vez más arriba y más pequeño
    const vuelo = Math.max(0, (p - .15) / .85), suelo = H * .86;
    const y = suelo - (suelo - H * .12) * Math.pow(vuelo, 1.3), s = dpr * Math.min(W, H) / 470 * (1 - .78 * vuelo);
    if (vuelo > 0 && vuelo < .5 && !quieto && Math.random() < .5 * f) humo.push({ x: W * .5 + rnd(-60, 60) * dpr, y: suelo + 8 * dpr, r: rnd(10, 22) * dpr, v: 1 });
    for (let k = humo.length - 1; k >= 0; k--) {
      const h = humo[k]; h.r += .6 * dpr * f; h.v -= .012 * f; h.x += rnd(-.5, .5) * f;
      if (h.v <= 0) { humo.splice(k, 1); continue; }
      cx.fillStyle = `rgba(225,230,240,${.35 * h.v})`; cx.beginPath(); cx.arc(h.x, h.y, h.r, 0, 6.283); cx.fill();
    }
    coche(W * .5, y, s, vuelo > 0 ? Math.min(1, vuelo * 6) : 0, t);
    // el resplandor del coche patrulla: rojo a la izquierda, azul a la derecha, alternando despacio
    const fase = quieto ? .5 : (Math.sin(t * .0045) + 1) / 2, extra = golpe > 0 ? golpe : 0;
    for (const [lado, color, a] of [[0, "255,42,31", fase], [1, "60,110,255", 1 - fase]]) {
      const x = lado ? W : 0, R = W * .9, g = cx.createRadialGradient(x, H * .55, 0, x, H * .55, R);
      g.addColorStop(0, `rgba(${color},${.28 * a + .3 * extra})`); g.addColorStop(1, `rgba(${color},0)`);
      cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    }
    if (golpe > 0) golpe -= dt / 500;
  };
  const bucle = (t) => { pinta(t); requestAnimationFrame(bucle); };
  if (quieto) pinta(0); else requestAnimationFrame(bucle);
  addEventListener("resize", () => { if (quieto) pinta(0); });

  addEventListener("flyview", (e) => {
    const { index, total, dir } = e.detail;
    objP = total > 1 ? index / (total - 1) : 0;
    if (dir) zum(dir > 0 ? [8, 20, 8] : 8);
    if (quieto) pinta(0);
  });

  // tocar la carretera: un golpe de luces
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a")) return;
    zum([20, 40, 20, 40]);
    if (quieto) return;
    golpe = 1;
  });

  // ---------- cada prompt bajo una multa: se arranca por la línea de puntos ----------
  document.querySelectorAll(".code").forEach((code, n) => {
    const caja = document.createElement("div");
    caja.className = "fine on";
    code.replaceWith(caja); caja.appendChild(code);
    caja.insertAdjacentHTML("beforeend", `<div class="ticket" data-nofly role="button" tabindex="0" aria-label="Tear off the ticket to reveal the prompt"><div class="perf"><i class="rip"></i><span class="tab">Tear ⟶</span></div><p class="head">CITATION</p><dl><dt>No.</dt><dd>GB-0${n + 1}</dd><dt>Violation</dt><dd>Unauthorized takeoff</dd><dt>Vehicle</dt><dd>Silver, two seats, four jets</dd><dt>Statement</dt><dd>“Goodbye.”</dd></dl><span class="stamp">PROMPT INSIDE</span></div>`);
    const multa = caja.querySelector(".ticket");
    let rasgado = 0, hecho = false, arr = null;
    const pon = (v) => {
      const viejo = rasgado;
      rasgado = Math.max(rasgado, Math.min(1, v));   // lo que se ha rasgado no se vuelve a pegar
      caja.style.setProperty("--tear", rasgado.toFixed(3));
      if (Math.floor(rasgado * 12) !== Math.floor(viejo * 12)) zum(5);
      if (rasgado >= .85) suelta();
    };
    const suelta = () => {
      if (hecho) return;
      hecho = true; arr = null;
      caja.style.setProperty("--tear", "1");
      caja.classList.remove("on"); caja.classList.add("off");
      zum([20, 30, 40]);
      setTimeout(() => multa.remove(), quieto ? 0 : 900);
    };
    multa.addEventListener("pointerdown", (e) => {
      if (hecho) return;
      const r = multa.getBoundingClientRect();
      arr = { x0: e.clientX, desde: rasgado, ancho: r.width, movido: false };
      try { multa.setPointerCapture(e.pointerId); } catch {}
    });
    multa.addEventListener("pointermove", (e) => {
      if (!arr || hecho) return;
      const dx = e.clientX - arr.x0;
      if (Math.abs(dx) > 5) arr.movido = true;
      if (arr.movido && dx > 0) pon(arr.desde + dx / arr.ancho * 1.1);
    });
    multa.addEventListener("pointerup", () => { if (!arr) return; const movido = arr.movido; arr = null; if (!movido && !hecho) pon(rasgado + .34); });
    multa.addEventListener("pointercancel", () => { arr = null; });
    multa.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pon(rasgado + .34); } });
    caja.parentElement.querySelector(".cp")?.addEventListener("click", suelta);
  });

  // al copiar: dos puños chocan sobre el botón
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    zum([15, 30, 15]);
    if (quieto) return;
    const r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top - 6;
    for (const lado of ["l", "r"]) {
      const f = document.createElement("span");
      f.className = "fist " + lado; f.textContent = lado === "l" ? "🤜" : "🤛";
      f.style.left = x + "px"; f.style.top = y + "px";
      document.body.appendChild(f); f.addEventListener("animationend", () => f.remove());
    }
    const pum = document.createElement("i");
    pum.className = "bump"; pum.style.left = x + "px"; pum.style.top = y + "px";
    document.body.appendChild(pum); pum.addEventListener("animationend", () => pum.remove());
  }));

  // ---------- reglas: a oscuras, las barre la linterna ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((s) => {
    s.insertAdjacentHTML("beforeend", `<i class="night" aria-hidden="true"></i><span class="hint" aria-hidden="true">Tap for the flashlight</span>`);
    s.classList.add("dark");
    s.setAttribute("role", "button"); s.tabIndex = 0;
    const noche = s.querySelector(".night");
    let anim = 0;
    s._alumbra = () => {
      cancelAnimationFrame(anim);
      s.classList.add("dark"); s.classList.remove("lit");
      zum([8, 20, 8]);
      if (quieto) { s.classList.remove("dark"); s.classList.add("lit"); return; }
      const t0 = performance.now(), ms = 1300;
      // el haz entra por la izquierda, recorre la targeta en zigzag y se abre del todo
      const paso = (ahora) => {
        const e = Math.min(1, (ahora - t0) / ms);
        const x = -10 + 120 * e, y = 35 + Math.sin(e * Math.PI * 3) * 22, r = 70 + Math.max(0, e - .7) / .3 * 400;
        noche.style.setProperty("--fx", x + "%"); noche.style.setProperty("--fy", y + "%"); noche.style.setProperty("--fr", r + "px");
        if (e < 1) anim = requestAnimationFrame(paso); else { s.classList.remove("dark"); s.classList.add("lit"); }
      };
      anim = requestAnimationFrame(paso);
    };
    s.addEventListener("click", s._alumbra);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); s._alumbra(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s) && s.classList.contains("dark") && !s._encendida)
      .forEach((s, n) => setTimeout(() => { if (!s._encendida) { s._encendida = true; s._alumbra(); } }, (quieto ? 0 : 1150) + n * 520));
  });
})();
