// HIPPO — el fondo es un río tranquilo por la mañana: cielo pálido, la otra orilla con árboles y su reflejo, cañizos en
// los bordes y nenúfares a la deriva. Un hipopótamo cruza el río de derecha a izquierda a medida que se avanza, con un
// patito en la cabeza; cada toque en el río suelta otro patito que nada hasta él y se le sube. Cada prompt está detrás de
// la misma escena en pequeño: hay que arrastrar al hipopótamo hasta la orilla de la madre sin correr (si vas rápido, el
// patito se tambalea y se cae al agua, y vuelve a subir); al llegar, el patito baja con su madre y los dos hermanos se
// suben. Al copiar sale un "Quack!". Las reglas llegan en fila como patitos. Cámara "ferry".
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");

  const PATITO = `<svg viewBox="0 0 24 20" aria-hidden="true"><ellipse cx="13" cy="13" rx="9" ry="6" fill="#E3C24E"/><path d="M8 9q6-4 13 2q-4 3-9 2Z" fill="#6B4E2A"/><circle cx="6" cy="7" r="5" fill="#E3C24E"/><path d="M2 5q4-4 8 0" fill="#6B4E2A"/><path d="M3 7h6" stroke="#4A3420" stroke-width="1.2"/><path d="M1 8l-1 1.5 2.5.5Z" fill="#E08A2A"/><circle cx="5" cy="6.6" r=".9" fill="#111"/></svg>`;
  const MAMA = `<svg viewBox="0 0 50 40" aria-hidden="true"><ellipse cx="22" cy="26" rx="18" ry="11" fill="#8A6A44"/><path d="M8 24q10-8 26-2" stroke="#6A4E30" stroke-width="3" fill="none"/><g fill="#B8946A"><circle cx="16" cy="26" r="1.4"/><circle cx="24" cy="30" r="1.4"/><circle cx="30" cy="24" r="1.4"/></g><path d="M34 22q4-12 8-12q5 0 5 6q0 4-6 6Z" fill="#8A6A44"/><path d="M36 14h10" stroke="#3E2E1C" stroke-width="1.6"/><path d="M47 15l3 1.5-3 1.5Z" fill="#E08A2A"/><circle cx="43" cy="13.5" r="1.1" fill="#111"/></svg>`;
  const HIPO = `<svg viewBox="0 0 120 64" aria-hidden="true"><ellipse cx="72" cy="42" rx="46" ry="24" fill="#8E7F86"/><ellipse cx="28" cy="46" rx="26" ry="18" fill="#9A8A90"/><ellipse cx="40" cy="54" rx="30" ry="9" fill="rgba(220,150,150,.35)"/><ellipse cx="20" cy="38" rx="4" ry="2.5" fill="#4A3E44"/><ellipse cx="33" cy="36" rx="4" ry="2.5" fill="#4A3E44"/><ellipse cx="62" cy="24" rx="9" ry="7" fill="#8E7F86"/><circle cx="60" cy="23" r="3" fill="#1A1416"/><ellipse cx="88" cy="16" rx="5" ry="7" fill="#8E7F86"/><ellipse cx="88" cy="17" rx="2.4" ry="4" fill="#C98A90"/></svg>`;

  // ---------- el río ----------
  const cv = document.createElement("canvas");
  cv.id = "stream"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  let W, H, dpr, fondo = null, linea = 0, nenufares = [];
  const nadadores = [];
  let pasajeros = 1;

  const pintaFondo = () => {
    fondo = document.createElement("canvas"); fondo.width = W; fondo.height = H;
    const c = fondo.getContext("2d");
    linea = H * .42;
    let g = c.createLinearGradient(0, 0, 0, linea);
    g.addColorStop(0, "#EEF0DA"); g.addColorStop(1, "#D6DFC0");
    c.fillStyle = g; c.fillRect(0, 0, W, linea);
    // la otra orilla: árboles y su reflejo desenfocado
    const arboles = []; for (let k = 0; k < 24; k++) arboles.push([rnd(-.05, 1.05) * W, rnd(.05, .12) * H]);
    c.fillStyle = "#6F8058"; for (const [x, r] of arboles) { c.beginPath(); c.arc(x, linea - r * .4, r * .7, 0, 6.283); c.fill(); }
    c.fillStyle = "#5E6E48"; c.fillRect(0, linea - H * .02, W, H * .02);
    g = c.createLinearGradient(0, linea, 0, H);
    g.addColorStop(0, "#8C9A74"); g.addColorStop(1, "#56664A");
    c.fillStyle = g; c.fillRect(0, linea, W, H - linea);
    c.save(); c.filter = `blur(${8 * dpr}px)`; c.globalAlpha = .35; c.fillStyle = "#5E6E48";
    for (const [x, r] of arboles) { c.beginPath(); c.arc(x, linea + r * .4, r * .7, 0, 6.283); c.fill(); }
    c.restore();
    // cañizos en los bordes
    c.strokeStyle = "rgba(96,120,60,.9)"; c.lineWidth = Math.max(1, 1.4 * dpr);
    for (let k = 0; k < 120; k++) { const lado = k % 2, x = lado ? W - rnd(0, W * .12) : rnd(0, W * .12), y = H - rnd(0, H * .05), h = rnd(.1, .3) * H; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + rnd(-8, 8) * dpr, y - h * .6, x + rnd(-16, 16) * dpr, y - h); c.stroke(); }
    nenufares = []; for (let k = 0; k < 9; k++) nenufares.push({ x: rnd(0, W), y: rnd(linea + H * .08, H * .95), r: rnd(10, 22) * dpr, v: rnd(.004, .01) * dpr, a: rnd(0, 6) });
  };
  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = Math.round(innerWidth * dpr); H = cv.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    pintaFondo();
    nadadores.length = 0;
  };
  tam();
  addEventListener("resize", tam);

  const patito = (x, y, s, nadando) => {
    cx.save(); cx.translate(x, y); cx.scale(s, s);
    cx.fillStyle = "#E3C24E"; cx.beginPath(); cx.ellipse(4, 0, 8, 5, 0, 0, 6.283); cx.fill();
    cx.fillStyle = "#6B4E2A"; cx.beginPath(); cx.ellipse(6, -2, 6, 3, 0, 0, 6.283); cx.fill();
    cx.fillStyle = "#E3C24E"; cx.beginPath(); cx.arc(-3, -5, 4, 0, 6.283); cx.fill();
    cx.fillStyle = "#E08A2A"; cx.beginPath(); cx.moveTo(-7, -5); cx.lineTo(-10, -4); cx.lineTo(-7, -3); cx.fill();
    if (nadando) { cx.strokeStyle = "rgba(255,255,255,.45)"; cx.lineWidth = 1; cx.beginPath(); cx.ellipse(4, 4, 11, 2.5, 0, 0, 6.283); cx.stroke(); }
    cx.restore();
  };
  const hipo = (x, y, s, t) => {
    cx.save(); cx.translate(x, y); cx.scale(s, s);
    cx.fillStyle = "#8E7F86"; cx.beginPath(); cx.ellipse(18, 0, 40, 18, 0, Math.PI, 0); cx.fill();
    cx.fillStyle = "#9A8A90"; cx.beginPath(); cx.ellipse(-20, 2, 22, 13, 0, Math.PI, 0); cx.fill();
    cx.fillStyle = "#4A3E44"; cx.beginPath(); cx.ellipse(-30, -8, 3, 2, 0, 0, 6.283); cx.ellipse(-18, -10, 3, 2, 0, 0, 6.283); cx.fill();
    cx.fillStyle = "#8E7F86"; cx.beginPath(); cx.ellipse(8, -16, 7, 5, 0, 0, 6.283); cx.ellipse(30, -21 + Math.sin(t * .004) * 1.5, 4, 6, 0, 0, 6.283); cx.fill();
    cx.fillStyle = "#1A1416"; cx.beginPath(); cx.arc(6, -17, 2.4, 0, 6.283); cx.fill();
    cx.strokeStyle = "rgba(255,255,255,.4)"; cx.lineWidth = 1.2; cx.beginPath(); cx.ellipse(10, 2, 52, 5, 0, 0, 6.283); cx.stroke();
    cx.restore();
  };

  let p = 0, objP = 0, ultimo = 0;
  const pinta = (t) => {
    const dt = Math.min(50, t - (ultimo || t)); ultimo = t;
    p += (objP - p) * (quieto ? 1 : Math.min(1, dt / 1400));
    cx.drawImage(fondo, 0, 0);
    // brillos del agua
    cx.strokeStyle = "rgba(255,255,240,.18)"; cx.lineWidth = 1.2 * dpr;
    for (let k = 0; k < 40; k++) { const y = linea + (H - linea) * ((k * .618) % 1), x = ((k * .37 + t * .00002 * (1 + k % 3)) % 1.1) * W; cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x + W * .05, y); cx.stroke(); }
    // nenúfares
    for (const n of nenufares) {
      if (!quieto) { n.x += n.v * dt; if (n.x > W + n.r) n.x = -n.r; }
      cx.fillStyle = "#5E8A44"; cx.beginPath(); cx.ellipse(n.x, n.y, n.r, n.r * .45, 0, n.a, n.a + 5.6); cx.lineTo(n.x, n.y); cx.fill();
    }
    // el hipopótamo del fondo, que cruza con el avance, y sus pasajeros
    const s = dpr * Math.min(1.6, Math.min(W, H) / dpr / 380), hx = W * (.82 - .62 * p), hy = linea + (H - linea) * .38;
    hipo(hx, hy, s, t);
    for (let k = 0; k < pasajeros; k++) patito(hx + (8 + (k % 3) * 14 - 14) * s, hy - (24 + Math.floor(k / 3) * 9) * s, s * .9, false);
    // los patitos que nadan hacia él
    for (let k = nadadores.length - 1; k >= 0; k--) {
      const n = nadadores[k], dx = hx - n.x, dy = hy - n.y, d = Math.hypot(dx, dy);
      if (d < 20 * s) { nadadores.splice(k, 1); pasajeros = Math.min(6, pasajeros + 1); zum(8); continue; }
      n.x += dx / d * .09 * dpr * dt; n.y += dy / d * .09 * dpr * dt;
      patito(n.x, n.y, s * .9, true);
    }
  };
  const bucle = (t) => { requestAnimationFrame(bucle); pinta(t); };
  if (quieto) pinta(0); else requestAnimationFrame(bucle);
  addEventListener("resize", () => { if (quieto) pinta(0); });

  addEventListener("flyview", (e) => {
    const { index, total, dir } = e.detail;
    objP = total > 1 ? index / (total - 1) : 0;
    if (dir) zum(dir > 0 ? [10, 30, 6] : 6);
    if (quieto) pinta(0);
  });

  // tocar el río: otro patito nada hasta el hipopótamo y se sube
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a")) return;
    zum(10);
    if (quieto) { pasajeros = Math.min(6, pasajeros + 1); pinta(0); return; }
    if (pasajeros + nadadores.length >= 6) return;
    nadadores.push({ x: e.clientX * dpr, y: Math.max(linea + 10 * dpr, e.clientY * dpr) });
  });

  // ---------- cada prompt, detrás del río: lleva al patito a la orilla sin correr ----------
  document.querySelectorAll(".code").forEach((code) => {
    const caja = document.createElement("div");
    caja.className = "crossing on";
    code.replaceWith(caja); caja.appendChild(code);
    caja.insertAdjacentHTML("beforeend", `<div class="ferry" data-nofly role="button" tabindex="0" aria-label="Drag the hippo slowly to the bank to reveal the prompt"><i class="orilla"></i><span class="ave mama">${MAMA}</span><span class="ave p1">${PATITO}</span><span class="ave p2">${PATITO}</span><span class="hipo">${HIPO}<span class="pas">${PATITO}</span></span><i class="agua"></i><p class="count">Ferry: <b>0</b>%</p><p class="cue">Drag him to the bank. Gently.</p></div>`);
    const rio = caja.querySelector(".ferry"), hip = rio.querySelector(".hipo"), pas = rio.querySelector(".pas");
    const mama = rio.querySelector(".mama"), hermanos = [rio.querySelector(".p1"), rio.querySelector(".p2")];
    const cuenta = rio.querySelector(".count b"), aviso = rio.querySelector(".cue");
    let x = null, inicio = 0, meta = 0, ultX = 0, ultT = 0, rapido = 0, cayendo = false, hecho = false, arrastra = false;
    const mide = () => { const w = rio.clientWidth; inicio = w * .86; meta = w * .26 + 50; if (x === null) x = inicio; x = Math.max(meta, Math.min(inicio, x)); hip.style.left = x + "px"; cuenta.textContent = Math.round((inicio - x) / (inicio - meta) * 100); };
    const di = (txt, mal) => { aviso.textContent = txt; aviso.classList.toggle("bad", !!mal); };
    const abre = () => {
      if (caja.classList.contains("off")) return;
      hecho = true; caja.classList.remove("on"); caja.classList.add("off");
      zum([15, 30, 50]);
      setTimeout(() => rio.remove(), quieto ? 0 : 1100);
    };
    // de su sitio a un punto de la escena, en px de la targeta (sin las transformaciones 3D)
    const lleva = (el, tx, ty) => { el.style.transform = `translate(${(tx - el.offsetLeft).toFixed(0)}px,${(ty - el.offsetTop).toFixed(0)}px)`; };
    const llega = () => {
      hecho = true; arrastra = false; rio.classList.remove("held"); pas.classList.remove("wob");
      di("Home."); zum([10, 40, 10]);
      // el patito baja con su madre (sale del hipopótamo a la escena para poder moverlo)
      const px = hip.offsetLeft + pas.offsetLeft, py = hip.offsetTop + pas.offsetTop;
      pas.remove(); pas.style.cssText = `position:absolute;left:${px}px;top:${py}px;width:20px`; pas.classList.add("ave"); rio.appendChild(pas);
      requestAnimationFrame(() => lleva(pas, mama.offsetLeft + 44, mama.offsetTop + 14));
      // y los hermanos se suben a la cabeza
      setTimeout(() => { di("Then his brothers saw the ride."); hermanos.forEach((h, k) => setTimeout(() => { lleva(h, hip.offsetLeft + 40 + k * 24, hip.offsetTop + 3); zum(8); }, k * 300)); }, quieto ? 0 : 700);
      setTimeout(abre, quieto ? 0 : 2200);
    };
    const cae = () => {
      cayendo = true; arrastra = false; rio.classList.remove("held");
      pas.classList.remove("wob"); pas.classList.add("fall"); di("Too fast! He fell in.", true); zum([40, 30, 40]);
      const s = document.createElement("i"); s.className = "splash"; s.style.left = (hip.offsetLeft + 40) + "px"; s.style.top = (hip.offsetTop + hip.offsetHeight * .8) + "px"; rio.appendChild(s); s.addEventListener("animationend", () => s.remove());
      setTimeout(() => { pas.classList.remove("fall"); cayendo = false; rapido = 0; di("Back on. Gently this time."); }, 1300);
    };
    rio.addEventListener("pointerdown", (e) => {
      if (hecho || cayendo) return;
      if (quieto) { x -= (inicio - meta) * .34; mide(); if (x <= meta) llega(); return; }
      arrastra = true; rio.classList.add("held"); ultX = e.clientX; ultT = performance.now();
      try { rio.setPointerCapture(e.pointerId); } catch {}
    });
    rio.addEventListener("pointermove", (e) => {
      if (!arrastra || hecho || cayendo) return;
      const r = rio.getBoundingClientRect(), k = rio.offsetWidth / (r.width || 1), ahora = performance.now();
      const dx = (e.clientX - ultX) * k, dt = Math.max(1, ahora - ultT); ultX = e.clientX; ultT = ahora;
      x += dx; mide();
      // demasiado deprisa: se tambalea, y si sigue, se cae
      const v = Math.abs(dx) / dt;
      if (v > .45) { rapido += dt; pas.classList.add("wob"); di("Easy… easy…", true); } else { rapido = Math.max(0, rapido - dt * 2); if (!rapido) { pas.classList.remove("wob"); di("Drag him to the bank. Gently."); } }
      if (rapido > 60) return cae();
      if (x <= meta) llega();
    });
    const suelta = () => { arrastra = false; rio.classList.remove("held"); };
    rio.addEventListener("pointerup", suelta);
    rio.addEventListener("pointercancel", suelta);
    rio.addEventListener("keydown", (e) => {
      if (hecho || cayendo) return;
      if (e.key === "ArrowLeft" || e.key === "Enter" || e.key === " ") { e.preventDefault(); x -= e.key === "ArrowLeft" ? 24 : (inicio - meta) * .25; mide(); if (x <= meta) llega(); }
    });
    caja.parentElement.querySelector(".cp")?.addEventListener("click", abre);
    mide(); addEventListener("resize", mide);
  });

  // al copiar: un "Quack!"
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    zum([8, 20, 8]);
    if (quieto) return;
    const r = b.getBoundingClientRect(), q = document.createElement("span");
    q.className = "quack"; q.textContent = "Quack!";
    q.style.cssText = `left:${r.left + r.width / 2 - 30}px;top:${r.top - 20}px;--dx:${rnd(-40, 40).toFixed(0)}px`;
    document.body.appendChild(q); q.addEventListener("animationend", () => q.remove());
  }));

  // ---------- reglas: llegan en fila como patitos ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((s) => {
    if (!quieto) s.classList.add("lejos");
    s.setAttribute("role", "button"); s.tabIndex = 0;
    s._fila = () => {
      if (quieto) return;
      s.classList.remove("lejos", "fila"); void s.offsetWidth; s.classList.add("fila");
      zum([6, 30, 6]);
    };
    s.addEventListener("click", s._fila);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); s._fila(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s) && !s._vista)
      .forEach((s, n) => { s._vista = true; setTimeout(s._fila, (quieto ? 0 : 500) + n * 350); });
  });
})();
