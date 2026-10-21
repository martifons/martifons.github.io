// GOAT — el fondo es la ladera nevada en diagonal, con riscos oscuros arriba a la izquierda, la nieve que cae
// de lado con el viento y bancos de niebla que pasan. Al avanzar, las huellas de la cabra suben por la ladera
// hasta el risco y al final está ella arriba. Tocar la ladera levanta un puñado de nieve que resbala. Cada
// prompt está detrás de una pared de roca con cinco repisas: hay que tocar la repisa iluminada y la cabra salta
// a ella; al llegar arriba, la pared cae. Al copiar sale un remolino de copos. Las reglas están cubiertas de
// nieve y el viento se la lleva. Cámara "steps".
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");

  // ---------- la ladera ----------
  const cv = document.createElement("canvas");
  cv.id = "peak"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  let W, H, dpr, fondo = null, copos = [], huellas = [];
  const polvo = [];

  // la línea de la ladera: de arriba a la izquierda a abajo a la derecha
  const ladera = (x) => H * (.18 + .55 * (x / W));

  const pintaFondo = () => {
    fondo = document.createElement("canvas"); fondo.width = W; fondo.height = H;
    const c = fondo.getContext("2d");
    let g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#9AA3AA"); g.addColorStop(1, "#C4CBD0");
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    // montañas lejanas en la niebla
    c.fillStyle = "rgba(110,120,128,.55)";
    c.beginPath(); c.moveTo(W * .3, H * .62); c.lineTo(W * .55, H * .42); c.lineTo(W * .7, H * .5); c.lineTo(W * .88, H * .38); c.lineTo(W, H * .46); c.lineTo(W, H * .7); c.lineTo(W * .3, H * .7); c.fill();
    // los riscos oscuros arriba a la izquierda y algunas rocas que asoman en la nieve
    const roca = (x, y, w, h) => {
      c.fillStyle = "#33383D";
      c.beginPath(); c.moveTo(x, y + h); c.lineTo(x + w * .1, y + h * .3); c.lineTo(x + w * .35, y); c.lineTo(x + w * .6, y + h * .2); c.lineTo(x + w * .8, y + h * .05); c.lineTo(x + w, y + h); c.closePath(); c.fill();
      c.fillStyle = "rgba(246,249,251,.85)";
      c.beginPath(); c.moveTo(x + w * .3, y + h * .08); c.lineTo(x + w * .35, y); c.lineTo(x + w * .45, y + h * .1); c.closePath(); c.fill();
    };
    roca(-W * .05, H * .02, W * .42, H * .42);
    roca(W * .12, H * .08, W * .22, H * .3);
    // la nieve de la ladera, por debajo de la línea
    g = c.createLinearGradient(0, H * .2, W, H);
    g.addColorStop(0, "#F6F9FB"); g.addColorStop(1, "#D6DEE5");
    c.fillStyle = g;
    c.beginPath(); c.moveTo(0, ladera(0)); c.lineTo(W, ladera(W)); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
    for (let k = 0; k < 7; k++) { const x = rnd(.1, .95) * W, y = ladera(x) + rnd(.04, .4) * H; roca(x, y, rnd(.04, .1) * W, rnd(.015, .04) * H); }
  };

  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = Math.round(innerWidth * dpr); H = cv.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    pintaFondo();
    copos = []; for (let k = 0; k < 140; k++) copos.push({ x: rnd(0, W), y: rnd(0, H), r: rnd(.8, 2.6) * dpr, v: rnd(.4, 1) });
    // las huellas: pares de marcas que suben en zigzag de abajo a la derecha hasta el risco
    huellas = [];
    for (let k = 0; k < 18; k++) {
      const t = k / 17, x = W * (.92 - .7 * t) + Math.sin(t * 9) * W * .04, y = H * (.95 - .72 * t);
      huellas.push([x, y, (1.8 - t) * dpr]);
    }
    polvo.length = 0;
  };
  tam();
  addEventListener("resize", tam);

  // la cabra en el risco, pequeña, de perfil
  const cabra = (x, y, s) => {
    cx.save(); cx.translate(x, y); cx.scale(s, s);
    cx.fillStyle = "#F4F1EA";
    cx.beginPath(); cx.ellipse(0, 0, 14, 8, 0, 0, 6.283); cx.fill();
    cx.beginPath(); cx.ellipse(13, -7, 5, 4, -.4, 0, 6.283); cx.fill();
    cx.fillStyle = "#222"; cx.fillRect(-10, 6, 2.5, 9); cx.fillRect(-4, 6, 2.5, 9); cx.fillRect(5, 6, 2.5, 9); cx.fillRect(10, 6, 2.5, 9);
    cx.strokeStyle = "#111"; cx.lineWidth = 1.6; cx.beginPath(); cx.moveTo(12, -10); cx.quadraticCurveTo(13, -16, 9, -18); cx.stroke();
    cx.restore();
  };

  let p = 0, objP = 0, ultimo = 0;
  const pinta = (t) => {
    const dt = Math.min(50, t - (ultimo || t)); ultimo = t;
    p += (objP - p) * (quieto ? 1 : Math.min(1, dt / 900));
    cx.drawImage(fondo, 0, 0);
    // la niebla que pasa
    if (!quieto) for (let k = 0; k < 3; k++) {
      const y = H * (.25 + k * .2), x = ((t * .02 * (k + 1) * dpr) % (W * 1.6)) - W * .3;
      const g = cx.createRadialGradient(x, y, 0, x, y, W * .45);
      g.addColorStop(0, "rgba(225,230,234,.35)"); g.addColorStop(1, "rgba(225,230,234,0)");
      cx.fillStyle = g; cx.fillRect(x - W * .45, y - W * .45, W * .9, W * .9);
    }
    // las huellas que suben según se avanza
    cx.fillStyle = "rgba(90,100,110,.45)";
    const n = Math.round(p * huellas.length);
    for (let k = 0; k < n; k++) { const [x, y, s] = huellas[k]; for (const d of [-1, 1]) { cx.beginPath(); cx.ellipse(x + d * 4 * s, y, 2.2 * s, 3.4 * s, .3, 0, 6.283); cx.fill(); } }
    if (p > .9) cabra(W * .2, H * .2, dpr * (1.2 + Math.min(1, W / dpr / 600)) * Math.min(1, (p - .9) / .1));
    // el puñado de nieve de los toques, resbalando ladera abajo
    cx.fillStyle = "rgba(255,255,255,.9)";
    for (let k = polvo.length - 1; k >= 0; k--) {
      const q = polvo[k]; q.vy += .0009 * dt * dpr; q.x += q.vx * dt; q.y += q.vy * dt; q.v -= dt / 1600;
      if (q.v <= 0) { polvo.splice(k, 1); continue; }
      cx.globalAlpha = q.v; cx.beginPath(); cx.arc(q.x, q.y, q.r, 0, 6.283); cx.fill(); cx.globalAlpha = 1;
    }
    // la nieve que cae de lado con el viento
    if (!quieto) {
      cx.fillStyle = "rgba(255,255,255,.85)";
      for (const c of copos) {
        c.x += (.08 + .05 * c.v) * dt * dpr; c.y += .06 * c.v * dt * dpr;
        if (c.x > W) c.x -= W; if (c.y > H) c.y -= H;
        cx.beginPath(); cx.arc(c.x, c.y, c.r, 0, 6.283); cx.fill();
      }
    }
  };
  const bucle = (t) => { requestAnimationFrame(bucle); pinta(t); };
  if (quieto) pinta(0); else requestAnimationFrame(bucle);
  addEventListener("resize", () => { if (quieto) pinta(0); });

  addEventListener("flyview", (e) => {
    const { index, total, dir } = e.detail;
    objP = total > 1 ? index / (total - 1) : 0;
    if (dir) zum(dir > 0 ? [6, 24, 6] : 6);
    if (quieto) pinta(0);
  });

  // tocar la ladera: un puñado de nieve que resbala
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a")) return;
    zum([8, 16, 8]);
    if (quieto) return;
    for (let k = 0; k < 40; k++) polvo.push({ x: e.clientX * dpr, y: e.clientY * dpr, vx: rnd(.05, .35) * dpr, vy: rnd(-.25, .05) * dpr, r: rnd(1.2, 3.5) * dpr, v: 1 });
  });

  // ---------- cada prompt, detrás de una pared de roca: la cabra de repisa en repisa ----------
  const REPISAS = [[26, 80], [70, 64], [32, 48], [72, 32], [44, 18]];
  document.querySelectorAll(".code").forEach((code) => {
    const caja = document.createElement("div");
    caja.className = "cliff on";
    code.replaceWith(caja); caja.appendChild(code);
    caja.insertAdjacentHTML("beforeend", `<div class="face" data-nofly><p class="hint">Tap the <b>lit ledge</b></p>${REPISAS.map(([x, y], k) => `<button class="ledge" type="button" aria-label="Ledge ${k + 1}" style="left:${x}%;top:${y}%"></button>`).join("")}<span class="goat" aria-hidden="true">🐐</span><span class="puffs"></span></div>`);
    const pared = caja.querySelector(".face"), cabraEl = pared.querySelector(".goat"), pista = pared.querySelector(".hint"), nubes = pared.querySelector(".puffs");
    const repisas = [...pared.querySelectorAll(".ledge")];
    let paso = 0, hecho = false;
    const marca = () => repisas.forEach((r, k) => { r.classList.toggle("next", k === paso && !hecho); r.classList.toggle("done", k < paso); });
    const nieve = (x, y) => {
      if (quieto) return;
      for (let k = 0; k < 8; k++) {
        const i = document.createElement("i");
        i.style.cssText = `left:${x}%;top:${y}%;--dx:${rnd(-30, 30).toFixed(0)}px;--dy:${rnd(-24, 10).toFixed(0)}px;animation-delay:${k * 20}ms`;
        nubes.appendChild(i); i.addEventListener("animationend", () => i.remove());
      }
    };
    const cae = () => {
      if (hecho) return;
      hecho = true; marca();
      pista.innerHTML = "<b>Top</b> reached";
      zum([20, 30, 60]);
      setTimeout(() => { caja.classList.remove("on"); caja.classList.add("off"); }, quieto ? 0 : 400);
      setTimeout(() => pared.remove(), quieto ? 0 : 1500);
    };
    const salta = (k) => {
      if (hecho) return;
      if (k !== paso) {
        caja.classList.remove("shake"); void caja.offsetWidth; caja.classList.add("shake");
        pista.innerHTML = "Not that one: the <b>lit ledge</b>"; zum([20, 15, 20]);
        return;
      }
      const [x, y] = REPISAS[k];
      cabraEl.style.setProperty("--gx", x + "%"); cabraEl.style.setProperty("--gy", y + "%");
      nieve(x, y); zum(12);
      paso++;
      pista.innerHTML = paso < REPISAS.length ? `<b>${REPISAS.length - paso}</b> to the top` : "<b>Top</b> reached";
      marca();
      if (paso >= REPISAS.length) setTimeout(cae, quieto ? 0 : 450);
    };
    repisas.forEach((r, k) => r.addEventListener("click", (e) => { e.stopPropagation(); salta(k); }));
    pared.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target === pared) { e.preventDefault(); salta(paso); } });
    marca();
    caja.parentElement.querySelector(".cp")?.addEventListener("click", cae);
  });

  // al copiar: un remolino de copos
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    zum([6, 20, 6]);
    if (quieto) return;
    const r = b.getBoundingClientRect();
    for (let k = 0; k < 12; k++) {
      const s = document.createElement("span");
      s.className = "flake"; s.textContent = "❄";
      s.style.cssText = `left:${r.left + r.width / 2 + rnd(-r.width * .4, r.width * .4)}px;top:${r.top}px;--dx:${rnd(-60, 60).toFixed(0)}px;--r:${rnd(-200, 200).toFixed(0)}deg;animation-delay:${k * 50}ms`;
      document.body.appendChild(s); s.addEventListener("animationend", () => s.remove());
    }
  }));

  // ---------- reglas: cubiertas de nieve, el viento se la lleva ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((s) => {
    s.insertAdjacentHTML("beforeend", `<i class="drift" aria-hidden="true"></i>`);
    s.setAttribute("role", "button"); s.tabIndex = 0;
    s._sopla = () => { s.classList.remove("blown"); void s.offsetWidth; s.classList.add("blown"); zum([6, 30, 6]); };
    s.addEventListener("click", s._sopla);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); s._sopla(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s) && !s._vista)
      .forEach((s, n) => { s._vista = true; setTimeout(s._sopla, (quieto ? 0 : 600) + n * 380); });
  });
})();
