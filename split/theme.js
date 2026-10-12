// SPLIT — de fondo, la luna sobre el mar: a medida que se avanza se agrieta, se parte en dos y la
// mitad de abajo cae ardiendo al mar y sube una bola de fuego sobre el horizonte. Tocar el cielo trae una
// estrella fugaz. Cada prompt está tapado por una placa de roca lunar que se parte de un tajo con el
// dedo (o con un toque). Copiar suelta un meteorito que cae al mar. El contenido de las reglas cae
// dentro de la targeta como un trozo de luna. Cámara en diagonal (fly "meteor").
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");

  // ---------- la noche, la luna y el mar ----------
  const cv = document.createElement("canvas");
  cv.id = "night"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  let W, H, dpr, estrellas = [], manchas = [], gotas = [];
  // la línea de rotura, de arriba a la derecha a abajo a la izquierda (en radios de la luna)
  const rotura = [[.75, -.66], [.5, -.4], [.36, -.32], [.22, -.08], [.06, -.02], [-.08, .2], [-.24, .3], [-.4, .52], [-.75, .66]];
  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = Math.round(innerWidth * dpr); H = cv.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    estrellas = Array.from({ length: Math.round(innerWidth * innerHeight / 6000) }, () => ({ x: Math.random() * W, y: Math.random() * H * .75, r: rnd(.5, 1.5) * dpr, a: rnd(.2, .8) }));
    manchas = Array.from({ length: 9 }, () => ({ x: rnd(-.55, .55), y: rnd(-.55, .55), r: rnd(.12, .32), a: rnd(.1, .22) }));
  };
  tam();
  let p = 0, objP = 0;                      // progreso de la página: 0 entera, 1 el mar revienta
  const fugaces = [];
  const luna = (x, y, R, mitad, brillo) => {
    cx.save();
    cx.beginPath(); cx.arc(x, y, R, 0, 6.283); cx.clip();
    if (mitad) {
      cx.beginPath();
      if (mitad === "arriba") { cx.moveTo(x - R * 1.2, y - R * 1.2); cx.lineTo(x + R * .75 + R * .4, y - R * 1.2); }
      else { cx.moveTo(x + R * 1.2, y - R * .9); cx.lineTo(x + R * 1.2, y + R * 1.2); cx.lineTo(x - R * 1.2, y + R * 1.2); }
      for (const [rx, ry] of (mitad === "arriba" ? rotura : [...rotura].reverse())) cx.lineTo(x + rx * R, y + ry * R);
      if (mitad === "arriba") cx.lineTo(x - R * 1.2, y + R * 1.2);
      cx.closePath(); cx.clip();
    }
    const g = cx.createRadialGradient(x - R * .3, y - R * .3, R * .1, x, y, R);
    g.addColorStop(0, `rgba(238,236,228,${brillo})`); g.addColorStop(1, `rgba(170,170,165,${brillo})`);
    cx.fillStyle = g; cx.fillRect(x - R, y - R, R * 2, R * 2);
    for (const m of manchas) { cx.fillStyle = `rgba(90,92,96,${m.a * brillo})`; cx.beginPath(); cx.arc(x + m.x * R, y + m.y * R, m.r * R, 0, 6.283); cx.fill(); }
    cx.restore();
  };
  const pinta = (t) => {
    p += (objP - p) * (quieto ? 1 : .03);
    const hor = H * .78;
    let g = cx.createLinearGradient(0, 0, 0, hor);
    g.addColorStop(0, "#0A0F1C"); g.addColorStop(1, "#1E2A3D");
    cx.fillStyle = g; cx.fillRect(0, 0, W, hor);
    cx.fillStyle = "#fff";
    for (const e of estrellas) { cx.globalAlpha = e.a; cx.fillRect(e.x, e.y, e.r, e.r); }
    cx.globalAlpha = 1;
    // el mar y la arena
    g = cx.createLinearGradient(0, hor, 0, H);
    g.addColorStop(0, "#0E1726"); g.addColorStop(.35, "#0A0F18"); g.addColorStop(.36, "#1A1712"); g.addColorStop(1, "#0D0B08");
    cx.fillStyle = g; cx.fillRect(0, hor, W, H - hor);
    const movil = innerWidth <= 760, mx = W * (movil ? .8 : .85), my = H * (movil ? .14 : .19), R = Math.min(W, H) * (movil ? .08 : .1);
    // estela de luz de luna sobre el agua
    cx.fillStyle = "rgba(220,226,240,.10)"; cx.fillRect(mx - R * .5, hor, R, H * .08);
    const grieta = Math.min(1, p * 4), hueco = Math.max(0, Math.min(1, (p - .2) * 3)), caida = Math.max(0, Math.min(1, (p - .42) / .4)), mar = Math.max(0, Math.min(1, (p - .84) / .16));
    // mitad de arriba: siempre en su sitio
    if (hueco === 0) {
      luna(mx, my, R, null, 1);
      // la grieta, creciendo de arriba a la derecha hacia abajo a la izquierda
      cx.strokeStyle = "rgba(20,20,22,.9)"; cx.lineWidth = 1.6 * dpr; cx.beginPath();
      const n = Math.max(1, Math.round(grieta * (rotura.length - 1)));
      cx.moveTo(mx + rotura[0][0] * R, my + rotura[0][1] * R);
      for (let k = 1; k <= n; k++) cx.lineTo(mx + rotura[k][0] * R, my + rotura[k][1] * R);
      cx.stroke();
    } else {
      luna(mx - hueco * R * .08, my - hueco * R * .08, R, "arriba", 1);
      if (caida < 1) {
        const e = caida * caida, lx = mx + hueco * R * .1 + e * R * .2, ly = my + hueco * R * .1 + e * (hor - my - R * .2);
        const S = 1 + e * .5;
        if (caida > 0) {
          // estela de fuego y humo detrás, y el brillo del aire ardiendo delante
          const tg = cx.createLinearGradient(lx, ly, lx - R * .4, ly - R * 3 * e - R);
          tg.addColorStop(0, "rgba(255,200,120,.75)"); tg.addColorStop(.4, "rgba(150,120,110,.35)"); tg.addColorStop(1, "rgba(90,90,95,0)");
          cx.strokeStyle = tg; cx.lineWidth = R * .8 * S; cx.lineCap = "round";
          cx.beginPath(); cx.moveTo(lx, ly); cx.lineTo(lx - R * .4, ly - R * 3 * e - R); cx.stroke();
          const gl = cx.createRadialGradient(lx, ly + R * .3 * S, 0, lx, ly + R * .3 * S, R * 1.3 * S);
          gl.addColorStop(0, `rgba(255,236,190,${.9 * Math.min(1, caida * 3)})`); gl.addColorStop(1, "rgba(255,170,90,0)");
          cx.fillStyle = gl; cx.fillRect(lx - R * 2 * S, ly - R * 2 * S, R * 4 * S, R * 4 * S);
        }
        luna(lx, ly, R * S, "abajo", 1 - caida * .75);
      }
    }
    // el impacto: una bola de fuego que sube sobre el horizonte
    if (mar > 0) {
      const fy = hor - H * .16 * mar, fr = R * (1 + mar * 1.6);
      const fg = cx.createRadialGradient(mx, fy, 0, mx, fy, fr * 1.6);
      fg.addColorStop(0, `rgba(255,236,190,${.9 * mar})`); fg.addColorStop(.35, `rgba(255,150,70,${.75 * mar})`); fg.addColorStop(1, "rgba(255,110,50,0)");
      cx.fillStyle = fg; cx.fillRect(mx - fr * 2, fy - fr * 2, fr * 4, fr * 4);
      const sg = cx.createLinearGradient(0, hor - H * .08, 0, hor);
      sg.addColorStop(0, "rgba(255,170,100,0)"); sg.addColorStop(1, `rgba(255,190,130,${.5 * mar})`);
      cx.fillStyle = sg; cx.fillRect(0, hor - H * .08, W, H * .08);
      if (!quieto && gotas.length < 220) for (let k = 0; k < 4; k++) gotas.push({ x: mx + rnd(-R, R) * 1.2, y: fy + rnd(-R, R) * .5, vx: rnd(-.6, .6) * dpr, vy: -rnd(.6, 1.6) * dpr, r: rnd(8, 22) * dpr, vida: 1 });
    }
    for (let k = gotas.length - 1; k >= 0; k--) {
      const d = gotas[k]; d.x += d.vx; d.y += d.vy; d.r += .25 * dpr; d.vida -= .006;
      if (d.vida <= 0) { gotas.splice(k, 1); continue; }
      const q = cx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r);
      q.addColorStop(0, `rgba(${d.vida > .6 ? "255,170,90" : "120,105,100"},${d.vida * .55})`); q.addColorStop(1, "rgba(90,80,80,0)");
      cx.fillStyle = q; cx.fillRect(d.x - d.r, d.y - d.r, d.r * 2, d.r * 2);
    }
    cx.globalAlpha = 1;
    // estrellas fugaces
    for (let k = fugaces.length - 1; k >= 0; k--) {
      const f = fugaces[k]; f.t += .045; if (f.t >= 1.3) { fugaces.splice(k, 1); continue; }
      const a = Math.min(1, f.t), b = Math.max(0, f.t - .3);
      const x1 = f.x0 + (f.x1 - f.x0) * a, y1 = f.y0 + (f.y1 - f.y0) * a, x0 = f.x0 + (f.x1 - f.x0) * b, y0 = f.y0 + (f.y1 - f.y0) * b;
      const lg = cx.createLinearGradient(x0, y0, x1, y1); lg.addColorStop(0, "rgba(255,255,255,0)"); lg.addColorStop(1, "rgba(255,240,210,.95)");
      cx.strokeStyle = lg; cx.lineWidth = 2 * dpr; cx.lineCap = "round"; cx.beginPath(); cx.moveTo(x0, y0); cx.lineTo(x1, y1); cx.stroke();
    }
  };
  const bucle = (t) => { pinta(t); requestAnimationFrame(bucle); };
  if (quieto) pinta(0); else requestAnimationFrame(bucle);
  addEventListener("resize", () => { tam(); if (quieto) pinta(0); });

  // tocar el cielo: una estrella fugaz que acaba donde tocas
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a")) return;
    const x = e.clientX * dpr, y = e.clientY * dpr;
    fugaces.push({ x0: x - rnd(140, 260) * dpr, y0: y - rnd(120, 220) * dpr, x1: x, y1: y, t: 0 });
    zum([10, 20, 10]);
  });

  // al avanzar, la luna se rompe un poco más
  addEventListener("flyview", (e) => {
    objP = e.detail.total > 1 ? e.detail.index / (e.detail.total - 1) : 0;
    if (e.detail.dir) setTimeout(() => zum(objP > .84 ? [30, 40, 60] : 10), quieto ? 0 : 900);
  });

  // ---------- cada prompt, bajo una placa de roca lunar: pártela de un tajo ----------
  document.querySelectorAll(".code").forEach((code) => {
    const caja = document.createElement("div");
    caja.className = "plate whole";
    code.replaceWith(caja); caja.appendChild(code);
    caja.insertAdjacentHTML("beforeend", `<div class="rock" data-nofly aria-hidden="true"><i class="half a"></i><i class="half b"></i><i class="slash"></i><span class="tip">Swipe across to split it</span></div><button class="splitbtn" type="button" aria-label="Split the cover to reveal the prompt">Split</button>`);
    const roca = caja.querySelector(".rock"), tajo = caja.querySelector(".slash"), boton = caja.querySelector(".splitbtn");
    let abierto = false, ini = null, largo = 0;
    const parte = () => {
      if (abierto) return;
      abierto = true;
      caja.classList.add("split"); caja.classList.remove("whole");
      zum([25, 30, 15, 30, 10]);
      setTimeout(() => { roca.remove(); boton.remove(); }, 1100);
    };
    const pos = (e) => { const r = roca.getBoundingClientRect(); return [(e.clientX - r.left) * roca.offsetWidth / r.width, (e.clientY - r.top) * roca.offsetHeight / r.height]; };
    roca.addEventListener("pointerdown", (e) => { if (abierto) return; e.preventDefault(); roca.setPointerCapture(e.pointerId); ini = pos(e); largo = 0; tajo.style.opacity = "1"; });
    roca.addEventListener("pointermove", (e) => {
      if (!ini || abierto) return;
      const [x, y] = pos(e), dx = x - ini[0], dy = y - ini[1]; largo = Math.hypot(dx, dy);
      tajo.style.left = ini[0] + "px"; tajo.style.top = ini[1] + "px"; tajo.style.width = largo + "px";
      tajo.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
      if (largo > roca.offsetWidth * .5) { ini = null; parte(); }
    });
    const suelta = () => { if (!ini) return; const corto = largo < 6; ini = null; tajo.style.opacity = "0"; if (corto && !abierto) solo(); };
    roca.addEventListener("pointerup", suelta);
    roca.addEventListener("pointercancel", () => { ini = null; tajo.style.opacity = "0"; });
    // un toque o el botón: el tajo se da solo, en diagonal
    const solo = () => {
      if (abierto) return;
      if (quieto) { parte(); return; }
      const w = roca.offsetWidth, h = roca.offsetHeight;
      tajo.style.left = w * .92 + "px"; tajo.style.top = h * .08 + "px"; tajo.style.transform = `rotate(${Math.atan2(h * .84, -w * .84)}rad)`; tajo.style.opacity = "1";
      tajo.animate([{ width: "0px" }, { width: Math.hypot(w * .84, h * .84) + "px" }], { duration: 260, easing: "ease-in", fill: "forwards" }).onfinish = parte;
      zum(8);
    };
    boton.addEventListener("click", solo);
    caja.parentElement.querySelector(".cp")?.addEventListener("click", () => { if (!abierto) parte(); });
  });

  // al copiar: un meteorito pequeño cae desde el botón hasta el mar
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    zum([10, 20, 10]);
    if (quieto) return;
    const r = b.getBoundingClientRect(), m = document.createElement("i");
    m.className = "meteorito"; m.style.left = r.left + r.width / 2 + "px"; m.style.top = r.top + "px";
    document.body.appendChild(m);
    const dx = rnd(60, 140), dy = innerHeight * .78 - r.top;
    m.animate([
      { transform: "translate(-50%, -50%) rotate(55deg) scale(.4)", opacity: 0 },
      { transform: "translate(-50%, -50%) rotate(55deg) scale(1)", opacity: 1, offset: .12 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(55deg) scale(1)`, opacity: 1 },
    ], { duration: 1100, easing: "cubic-bezier(.5,0,.9,.6)" }).onfinish = () => {
      m.remove();
      const o = document.createElement("i"); o.className = "splash";
      o.style.left = r.left + r.width / 2 + dx + "px"; o.style.top = r.top + dy + "px";
      document.body.appendChild(o); o.addEventListener("animationend", () => o.remove());
      zum(20);
    };
  }));

  // ---------- reglas: su contenido cae dentro de la targeta ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((s) => {
    const dentro = document.createElement("div"); dentro.className = "drop-in";
    while (s.firstChild) dentro.appendChild(s.firstChild);
    s.appendChild(dentro);
    s.insertAdjacentHTML("beforeend", `<div class="hint">Tap to drop it in again</div>`);
    s.setAttribute("role", "button"); s.tabIndex = 0;
    s._cae = () => {
      s.classList.remove("landed"); void s.offsetWidth; s.classList.add("landed");
      s.setAttribute("aria-expanded", "true");
      setTimeout(() => zum([20, 30, 10]), quieto ? 0 : 520);
    };
    s.addEventListener("click", s._cae);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); s._cae(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s) && !s.classList.contains("landed"))
      .forEach((s, n) => setTimeout(() => { if (!s.classList.contains("landed")) s._cae(); }, (quieto ? 0 : 1250) + n * 480));
  });
})();
