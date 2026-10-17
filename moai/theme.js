// MOAI — el fondo es la isla: cielo con nubes que pasan, la ladera verde del volcán en diagonal, el mar
// y una fila de moáis en la costa. Un moái pequeño sobre su tabla baja surfeando la ladera a medida
// que se avanza, dejando un surco de hierba arrancada, y al final llega a la costa. Tocar la ladera
// toca el tambor: la colina tiembla y sale un anillo. Cada prompt está bajo una losa de basalto que hay
// que empujar, pesada (si sueltas, se para donde está; un toque la empuja un poco). Copiar manda un
// moái surfeando desde el botón. Las reglas son estelas tumbadas que se levantan. Cámara "slalom".
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");

  // ---------- la isla ----------
  const cv = document.createElement("canvas");
  cv.id = "island"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  const fondo = document.createElement("canvas"), fx = fondo.getContext("2d");
  let W, H, dpr, A, B, Cc, horizonte, nubes = [];

  // un moái de frente, en cuclillas: (x, y) es el pie, h la altura
  const moai = (c, x, y, h, giro) => {
    c.save(); c.translate(x, y); c.rotate(giro || 0);
    c.fillStyle = "#3A3532";
    c.beginPath(); c.roundRect(-.2 * h, -h, .4 * h, .46 * h, [.05 * h, .05 * h, .02 * h, .02 * h]); c.fill();      // cabeza
    c.fillRect(-.25 * h, -.95 * h + .12 * h, .06 * h, .2 * h); c.fillRect(.19 * h, -.95 * h + .12 * h, .06 * h, .2 * h); // orejas
    c.beginPath(); c.moveTo(-.27 * h, -.55 * h); c.lineTo(.27 * h, -.55 * h); c.lineTo(.24 * h, -.3 * h); c.lineTo(-.24 * h, -.3 * h); c.fill(); // torso
    c.beginPath(); c.roundRect(-.29 * h, -.34 * h, .24 * h, .34 * h, .06 * h); c.fill();                                  // piernas dobladas
    c.beginPath(); c.roundRect(.05 * h, -.34 * h, .24 * h, .34 * h, .06 * h); c.fill();
    c.fillStyle = "#24201E"; c.fillRect(-.17 * h, -.86 * h, .34 * h, .05 * h);                                          // la ceja
    c.fillRect(-.04 * h, -.81 * h, .08 * h, .17 * h);                                                                   // la nariz
    c.fillStyle = "rgba(200,200,180,.55)";
    for (const [lx, ly] of [[-.1, -.7], [.12, -.6], [-.15, -.45], [.1, -.2], [-.2, -.15]]) c.fillRect(lx * h, ly * h, .035 * h, .03 * h); // liquen
    c.restore();
  };
  const tabla = (c, x, y, h, giro) => {
    c.save(); c.translate(x, y); c.rotate(giro);
    c.fillStyle = "#7A5235"; c.beginPath(); c.ellipse(0, .04 * h, .7 * h, .09 * h, 0, 0, 6.283); c.fill();
    c.fillStyle = "#9A6B45"; c.beginPath(); c.ellipse(0, .02 * h, .66 * h, .06 * h, 0, 0, 6.283); c.fill();
    c.restore();
  };
  // la ladera: una curva de arriba a la izquierda a abajo a la derecha
  const P = (u) => { const v = 1 - u; return [v * v * A[0] + 2 * v * u * B[0] + u * u * Cc[0], v * v * A[1] + 2 * v * u * B[1] + u * u * Cc[1]]; };
  const pendiente = (u) => { const a = P(Math.max(0, u - .01)), b = P(Math.min(1, u + .01)); return Math.atan2(b[1] - a[1], b[0] - a[0]); };

  const pintaFondo = () => {
    const c = fx;
    let g = c.createLinearGradient(0, 0, 0, horizonte);
    g.addColorStop(0, "#6FA9E0"); g.addColorStop(1, "#D3E8F5");
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    // el mar, a la derecha
    g = c.createLinearGradient(0, horizonte, 0, H);
    g.addColorStop(0, "#2D6DA6"); g.addColorStop(1, "#4D8DC2");
    c.fillStyle = g; c.fillRect(0, horizonte, W, H - horizonte);
    // la franja de costa y la fila de moáis sobre su plataforma
    const cy = horizonte + H * .035;
    c.fillStyle = "#7DA455"; c.fillRect(W * .5, cy, W * .5, H * .05);
    c.fillStyle = "#6E6862"; c.fillRect(W * .6, cy - H * .006, W * .34, H * .008);
    for (let k = 0; k < 8; k++) moai(c, W * (.62 + k * .042), cy - H * .006, H * .04);
    // la ladera
    c.beginPath(); c.moveTo(A[0], A[1]); c.quadraticCurveTo(B[0], B[1], Cc[0], Cc[1]); c.lineTo(W, H); c.lineTo(0, H); c.closePath();
    g = c.createLinearGradient(0, 0, W * .4, H);
    g.addColorStop(0, "#7DB24A"); g.addColorStop(1, "#3F7A2B");
    c.fillStyle = g; c.fill();
    c.save(); c.clip();
    // hierba y calvas de tierra
    for (let k = 0; k < 900; k++) {
      const x = rnd(0, W), y = rnd(0, H);
      c.strokeStyle = Math.random() < .5 ? "rgba(40,80,25,.35)" : "rgba(170,210,110,.3)"; c.lineWidth = dpr;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + rnd(-2, 2) * dpr, y - rnd(3, 7) * dpr); c.stroke();
    }
    for (let k = 0; k < 10; k++) { c.fillStyle = "rgba(120,90,55,.35)"; c.beginPath(); c.ellipse(rnd(0, W), rnd(H * .2, H), rnd(10, 40) * dpr, rnd(4, 10) * dpr, rnd(-.5, .5), 0, 6.283); c.fill(); }
    c.restore();
  };

  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = fondo.width = Math.round(innerWidth * dpr); H = cv.height = fondo.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    horizonte = H * .6;
    A = [-W * .05, H * .1]; B = [W * .35, H * .32]; Cc = [W * 1.02, H * .74];
    nubes = Array.from({ length: 6 }, () => [rnd(0, W), rnd(H * .04, H * .3), rnd(40, 90) * dpr, rnd(.03, .09) * dpr]);
    pintaFondo();
  };
  tam();
  addEventListener("resize", tam);

  let u = .16, objU = .16, ultimo = 0, temblor = 0;
  const motas = [], anillos = [];
  const pinta = (t) => {
    const dt = Math.min(50, t - (ultimo || t)), f = dt / 16.7; ultimo = t;
    const antes = u;
    u += (objU - u) * (quieto ? 1 : Math.min(1, dt / 900));
    cx.save();
    if (temblor > 0 && !quieto) { cx.translate(rnd(-1, 1) * temblor * 4 * dpr, rnd(-1, 1) * temblor * 3 * dpr); temblor -= dt / 220; }
    cx.drawImage(fondo, 0, 0);
    // nubes que pasan
    for (const n of nubes) {
      if (!quieto) { n[0] += n[3] * f; if (n[0] > W + n[2] * 2) n[0] = -n[2] * 2; }
      cx.fillStyle = "rgba(255,255,255,.85)";
      for (const [ox, oy, r] of [[0, 0, 1], [.8, .15, .75], [-.8, .2, .7], [.3, -.35, .65]]) { cx.beginPath(); cx.arc(n[0] + ox * n[2], n[1] + oy * n[2], r * n[2] * .7, 0, 6.283); cx.fill(); }
    }
    // el surco de hierba arrancada desde arriba hasta donde va
    cx.strokeStyle = "rgba(110,78,48,.55)"; cx.lineWidth = 7 * dpr; cx.lineCap = "round";
    cx.beginPath(); for (let k = 0; k <= 40; k++) { const q = P(.16 + (u - .16) * k / 40); k ? cx.lineTo(q[0], q[1] + 3 * dpr) : cx.moveTo(q[0], q[1] + 3 * dpr); } cx.stroke();
    // el moái sobre su tabla
    const [mx, my] = P(u), ang = pendiente(u), h = Math.min(W, H) * .09;
    tabla(cx, mx, my, h, ang);
    moai(cx, mx, my - .02 * h, h, ang * .25);
    // hierba y tierra que salta mientras baja
    if (!quieto && u - antes > .00005) for (let k = 0; k < 3; k++) motas.push({ x: mx - Math.cos(ang) * h * .5, y: my, vx: rnd(-2, .5) * dpr, vy: rnd(-3, -1) * dpr, v: 1, c: Math.random() < .5 ? "86,140,52" : "120,88,55" });
    for (let k = motas.length - 1; k >= 0; k--) {
      const m = motas[k]; m.vy += .18 * dpr * f; m.x += m.vx * f; m.y += m.vy * f; m.v -= .025 * f;
      if (m.v <= 0) { motas.splice(k, 1); continue; }
      cx.fillStyle = `rgba(${m.c},${m.v})`; cx.fillRect(m.x, m.y, 2.5 * dpr, 2.5 * dpr);
    }
    // el anillo del tambor
    for (let k = anillos.length - 1; k >= 0; k--) {
      const a = anillos[k], e = (t - a.t0) / 700;
      if (e >= 1) { anillos.splice(k, 1); continue; }
      cx.strokeStyle = `rgba(255,255,255,${.7 * (1 - e)})`; cx.lineWidth = 3 * dpr;
      cx.beginPath(); cx.ellipse(a.x, a.y, (10 + e * 120) * dpr, (4 + e * 40) * dpr, 0, 0, 6.283); cx.stroke();
    }
    cx.restore();
  };
  const bucle = (t) => { pinta(t); requestAnimationFrame(bucle); };
  if (quieto) pinta(0); else requestAnimationFrame(bucle);
  addEventListener("resize", () => { if (quieto) pinta(0); });

  addEventListener("flyview", (e) => {
    const { index, total, dir } = e.detail;
    objU = .16 + .8 * (total > 1 ? index / (total - 1) : 0);
    if (dir) zum(dir > 0 ? [6, 20, 6] : 8);
    if (quieto) pinta(0);
  });

  // tocar la ladera: el tambor
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a")) return;
    zum([30]);
    if (quieto) return;
    anillos.push({ x: e.clientX * dpr, y: e.clientY * dpr, t0: performance.now() });
    temblor = 1;
  });

  // ---------- cada prompt bajo una losa de basalto: se empuja ----------
  document.querySelectorAll(".code").forEach((code) => {
    const caja = document.createElement("div");
    caja.className = "vault shut";
    code.replaceWith(caja); caja.appendChild(code);
    caja.insertAdjacentHTML("beforeend", `<div class="stone" data-nofly role="button" tabindex="0" aria-label="Push the stone aside to reveal the prompt"><span class="carve">PUSH</span><span class="arrows" aria-hidden="true">›››</span></div>`);
    const losa = caja.querySelector(".stone");
    let x = 0, abierta = false, arr = null, anim = 0, v = 0;
    const ancho = () => caja.clientWidth;
    const pon = (nx) => {
      const viejo = x;
      x = Math.max(0, Math.min(ancho() * 1.05, nx));
      losa.style.transform = `translateX(${x}px)`;
      caja.style.setProperty("--open", (x / ancho()).toFixed(3));
      if (Math.floor(x / 26) !== Math.floor(viejo / 26)) zum(6);   // el roce de la piedra
    };
    const abre = () => {
      if (abierta) return;
      abierta = true; cancelAnimationFrame(anim);
      losa.style.transition = quieto ? "none" : "transform .7s cubic-bezier(.3,0,.2,1)";
      pon(ancho() * 1.05);
      caja.classList.remove("shut"); caja.classList.add("open");
      zum([40, 30, 20]);
      setTimeout(() => losa.remove(), quieto ? 0 : 800);
    };
    // la inercia: una losa pesada se para enseguida
    const desliza = () => {
      v *= .82;
      pon(x + v);
      if (x > ancho() * .7) { abre(); return; }
      if (Math.abs(v) > .3) anim = requestAnimationFrame(desliza);
    };
    const empuja = () => {
      if (abierta) return;
      losa.style.transition = quieto ? "none" : "transform .35s cubic-bezier(.2,.8,.3,1)";
      pon(x + ancho() * .26);
      caja.classList.remove("thud"); void caja.offsetWidth; caja.classList.add("thud");
      zum([30]);
      if (x > ancho() * .7) setTimeout(abre, quieto ? 0 : 300);
    };
    losa.addEventListener("pointerdown", (e) => {
      if (abierta) return;
      cancelAnimationFrame(anim);
      losa.style.transition = "none";
      arr = { x0: e.clientX, x: e.clientX, desde: x, t: performance.now(), movido: false };
      try { losa.setPointerCapture(e.pointerId); } catch {}
    });
    losa.addEventListener("pointermove", (e) => {
      if (!arr || abierta) return;
      if (Math.abs(e.clientX - arr.x0) > 5) arr.movido = true;
      if (!arr.movido) return;
      const ahora = performance.now();
      v = (e.clientX - arr.x) * .55 / Math.max(1, (ahora - arr.t) / 16.7);
      arr.x = e.clientX; arr.t = ahora;
      pon(arr.desde + (e.clientX - arr.x0) * .55);            // pesa: se mueve menos que el dedo
    });
    const suelta = () => {
      if (!arr) return;
      const movido = arr.movido; arr = null;
      if (abierta) return;
      if (!movido) { empuja(); return; }
      if (x > ancho() * .7) abre(); else anim = requestAnimationFrame(desliza);
    };
    losa.addEventListener("pointerup", suelta);
    losa.addEventListener("pointercancel", () => { arr = null; });
    losa.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); empuja(); } });
    caja.parentElement.querySelector(".cp")?.addEventListener("click", abre);
  });

  // al copiar: un moái pequeño sale surfeando del botón
  const svgMoai = `<svg viewBox="0 0 60 70" aria-hidden="true"><ellipse cx="30" cy="64" rx="29" ry="5" fill="#7A5235"/><rect x="21" y="4" width="18" height="22" rx="3" fill="#3A3532"/><rect x="18" y="12" width="3" height="9" fill="#3A3532"/><rect x="39" y="12" width="3" height="9" fill="#3A3532"/><rect x="23" y="9" width="14" height="2.5" fill="#24201E"/><rect x="28" y="11" width="4" height="8" fill="#24201E"/><path d="M17 26h26l-2 12H19z" fill="#3A3532"/><rect x="16" y="37" width="12" height="23" rx="3" fill="#3A3532"/><rect x="32" y="37" width="12" height="23" rx="3" fill="#3A3532"/></svg>`;
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    zum([10, 20, 10]);
    if (quieto) return;
    const r = b.getBoundingClientRect(), el = document.createElement("div");
    el.className = "surfer"; el.innerHTML = svgMoai; document.body.appendChild(el);
    const x0 = r.left + r.width * .2, y0 = r.top, dx = innerWidth - x0 + 80, kf = [];
    for (let n = 0; n <= 20; n++) { const e = n / 20; kf.push({ transform: `translate(${x0 + dx * e}px, ${y0 - 40 + Math.sin(e * 9) * 10 + e * 60}px) rotate(${Math.sin(e * 9) * 10}deg)` }); }
    el.animate(kf, { duration: 1300, easing: "ease-in", fill: "forwards" }).onfinish = () => el.remove();
    const t0 = performance.now();
    const hierba = setInterval(() => {
      const e = Math.min(1, (performance.now() - t0) / 1300), m = document.createElement("i");
      m.className = "blade"; m.style.left = x0 + dx * e * e + "px"; m.style.top = y0 + 6 + e * 60 + "px";
      document.body.appendChild(m); m.addEventListener("animationend", () => m.remove());
      if (e >= 1) clearInterval(hierba);
    }, 50);
  }));

  // ---------- reglas: estelas tumbadas que se levantan ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((s) => {
    const estela = document.createElement("div");
    estela.className = "stele";
    [...s.childNodes].forEach((n) => estela.appendChild(n));
    s.appendChild(estela);
    s.insertAdjacentHTML("beforeend", `<span class="hint" aria-hidden="true">Tap to raise it</span>`);
    s.classList.add("fallen");
    s.setAttribute("role", "button"); s.tabIndex = 0;
    s._levanta = () => {
      if (s.classList.contains("raised")) { s.classList.add("snap"); s.classList.remove("raised"); s.classList.add("fallen"); void s.offsetWidth; s.classList.remove("snap"); }
      s.classList.remove("fallen"); s.classList.add("raised");
      setTimeout(() => zum([40]), quieto ? 0 : 1000);
    };
    s.addEventListener("click", s._levanta);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); s._levanta(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s) && s.classList.contains("fallen"))
      .forEach((s, n) => setTimeout(() => { if (s.classList.contains("fallen")) s._levanta(); }, (quieto ? 0 : 1150) + n * 520));
  });
})();
