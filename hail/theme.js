// HAIL — el fondo es la carretera en primera persona: campos llanos, la línea blanca, las bandas sonoras del
// arcén y una fila de postes, bajo una nube de arco en capas. Al avanzar, el borde de la nube sube y sale por
// arriba (pasa por encima), queda la panza oscura, baja la cortina de granizo, el granizo cae en rayas y el
// suelo se va poniendo blanco. Tocar el cielo suelta una granizada. Cada prompt está detrás del visor de un
// móvil: hay que mantener pulsado el botón de grabar tres segundos (si se suelta antes, rebobina). Al copiar
// caen piedras que botan en el botón. Las reglas se hielan desde las esquinas. Cámara "bounce".
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
  const suelo = document.createElement("canvas"), sx = suelo.getContext("2d");
  let W, H, dpr, hz, vx, piedras = [], bultos = [];
  const extra = [], rayas = [], botes = [];

  // el suelo: campos, la carretera en perspectiva, la línea blanca, las bandas sonoras y los postes
  const pintaSuelo = () => {
    const c = sx;
    c.clearRect(0, 0, W, H);
    let g = c.createLinearGradient(0, hz, 0, H);
    g.addColorStop(0, "#6B8159"); g.addColorStop(.25, "#557243"); g.addColorStop(1, "#3D5A30");
    c.fillStyle = g; c.fillRect(0, hz, W, H - hz);
    // árboles lejanos en el horizonte
    c.fillStyle = "#3E4A3B";
    for (let k = 0; k < 7; k++) { const x = rnd(.3, 1) * W, w = rnd(10, 34) * dpr; c.beginPath(); c.ellipse(x, hz, w, w * .22, 0, Math.PI, 0); c.fill(); }
    // la carretera
    g = c.createLinearGradient(0, hz, 0, H);
    g.addColorStop(0, "#80858A"); g.addColorStop(1, "#55595E");
    c.fillStyle = g;
    c.beginPath(); c.moveTo(vx - W * .012, hz); c.lineTo(vx + W * .022, hz); c.lineTo(W * .78, H); c.lineTo(-W * .6, H); c.closePath(); c.fill();
    // la línea blanca del borde
    c.fillStyle = "#EDEDE8";
    c.beginPath(); c.moveTo(vx + W * .002, hz); c.lineTo(vx + W * .006, hz); c.lineTo(W * .14, H); c.lineTo(W * .1, H); c.closePath(); c.fill();
    // las bandas sonoras del arcén: rayas cada vez más separadas y gruesas al acercarse
    c.fillStyle = "rgba(40,42,46,.55)";
    for (let k = 1; k < 34; k++) {
      const t = Math.pow(k / 34, 2.1), y = hz + (H - hz) * t, x0 = vx + W * .009 + (W * .2 - vx) * t, ancho = (2 + 34 * t) * dpr, alto = (1 + 7 * t) * dpr;
      c.fillRect(x0, y, ancho, alto);
    }
    // los postes de la valla, del horizonte hacia la derecha
    c.strokeStyle = "rgba(40,40,36,.5)"; c.lineWidth = dpr;
    c.beginPath(); c.moveTo(vx + W * .06, hz + 2 * dpr); c.lineTo(W * 1.1, H * .66); c.stroke();
    c.fillStyle = "#2E2C27";
    for (let k = 0; k < 16; k++) {
      const t = Math.pow(k / 16, 1.6), x = vx + W * .06 + (W * 1.1 - vx - W * .06) * t, y = hz + 2 * dpr + (H * .66 - hz) * t, alto = (4 + 46 * t) * dpr;
      c.fillRect(x, y - alto, (1 + 3 * t) * dpr, alto);
    }
  };

  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = suelo.width = Math.round(innerWidth * dpr);
    H = cv.height = suelo.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    hz = H * .5; vx = W * .2;
    pintaSuelo();
    // las piedras que se quedan en el suelo, más grandes y más juntas cuanto más cerca
    piedras = [];
    for (let k = 0; k < 1600; k++) { const t = Math.pow(Math.random(), .7), y = hz + (H - hz) * t; piedras.push([rnd(0, W), y, (.6 + 3 * t) * dpr]); }
    // los bultos de la panza de la nube
    bultos = [];
    for (let k = 0; k < 40; k++) bultos.push([rnd(-.1, 1.1), rnd(0, 1), rnd(.06, .16), Math.random() < .5]);
    extra.length = 0;
    rayas.length = 0; botes.length = 0;   // las que caían con el tamaño anterior apuntan a otro suelo
  };
  tam();
  addEventListener("resize", tam);

  // la nube de arco: bandas en capas por encima de su borde; por debajo, la panza oscura y la franja clara
  const nube = (E, cortina) => {
    let g = cx.createLinearGradient(0, 0, 0, Math.max(E, H * .1));
    g.addColorStop(0, "#4E5862"); g.addColorStop(1, "#6C7680");
    cx.fillStyle = g; cx.fillRect(0, 0, W, hz);
    const inclina = (x) => (x / W - .5) * H * .07 - Math.sin(x / W * Math.PI) * H * .03, bh = H * .055;
    for (let i = 7; i >= 0; i--) {
      const yb = E - i * bh, yt = yb - bh;
      g = cx.createLinearGradient(0, yt, 0, yb);
      g.addColorStop(0, "#7E8892"); g.addColorStop(.7, "#56606A"); g.addColorStop(1, "#47505A");
      cx.fillStyle = g;
      cx.beginPath(); cx.moveTo(-W * .1, yt + inclina(0));
      for (let x = 0; x <= W * 1.1; x += W / 12) cx.lineTo(x, yt + inclina(x) + Math.sin(x * .004 / dpr + i) * bh * .12);
      for (let x = W * 1.1; x >= -W * .1; x -= W / 12) cx.lineTo(x, yb + inclina(x));
      cx.closePath(); cx.fill();
      cx.strokeStyle = "rgba(170,178,186,.35)"; cx.lineWidth = 1.5 * dpr;
      cx.beginPath(); for (let x = -W * .1; x <= W * 1.1; x += W / 12) cx.lineTo(x, yt + inclina(x) + Math.sin(x * .004 / dpr + i) * bh * .12); cx.stroke();
    }
    // la panza: desde el borde de la nube hasta el horizonte
    const ab = Math.max(0, hz - H * .025 - E);
    if (ab > 0) {
      cx.fillStyle = "#3E4750"; cx.fillRect(0, E, W, ab);
      for (const [bx, by, br, claro] of bultos) {
        const x = bx * W, y = E + by * ab, r = br * W;
        const rg = cx.createRadialGradient(x, y, 0, x, y, r);
        rg.addColorStop(0, claro ? "rgba(110,120,130,.5)" : "rgba(30,36,42,.5)"); rg.addColorStop(1, "rgba(60,70,80,0)");
        cx.fillStyle = rg; cx.fillRect(x - r, y - r, r * 2, r * 2);
      }
    }
    // la franja clara del horizonte, bajo la nube
    g = cx.createLinearGradient(0, hz - H * .03, 0, hz);
    g.addColorStop(0, "rgba(214,210,196,0)"); g.addColorStop(.5, "#D8D4C6"); g.addColorStop(1, "#E4E1D6");
    cx.fillStyle = g; cx.fillRect(0, hz - H * .03, W, H * .03);
    // la cortina de granizo, que baja de la nube hasta los campos
    if (cortina > 0) {
      g = cx.createLinearGradient(0, Math.max(0, E), 0, hz + H * .02);
      g.addColorStop(0, `rgba(205,212,220,${.15 * cortina})`); g.addColorStop(1, `rgba(225,230,236,${.7 * cortina})`);
      cx.fillStyle = g; cx.fillRect(0, Math.max(0, E), W, hz + H * .02 - Math.max(0, E));
    }
  };

  let p = 0, objP = 0, ultimo = 0, acum = 0;
  const lanza = (n) => { for (let k = 0; k < n && rayas.length < 500; k++) rayas.push({ x: rnd(-.05, 1.05) * W, y: rnd(-.3, 0) * H, v: rnd(1.4, 2) * H, fin: rnd(hz, H), L: rnd(16, 34) * dpr }); };
  const pinta = (t) => {
    const dt = Math.min(50, t - (ultimo || t)) / 1000; ultimo = t;
    p += (objP - p) * (quieto ? 1 : Math.min(1, dt * 1.3));
    const E = H * (.46 - .62 * p), cortina = Math.max(0, Math.min(1, (p - .22) / .4));
    nube(E, cortina);
    cx.drawImage(suelo, 0, 0);
    // el suelo se pone blanco: piedras que se quedan y una capa blanca encima
    const hielo = Math.pow(Math.max(0, Math.min(1, (p - .42) / .5)), 1.3);
    cx.fillStyle = `rgba(236,240,244,${.5 * hielo})`; cx.fillRect(0, hz, W, H - hz);
    cx.fillStyle = "rgba(246,248,250,.92)";
    const n = Math.floor(piedras.length * hielo);
    for (let k = 0; k < n; k++) { const [x, y, r] = piedras[k]; cx.beginPath(); cx.arc(x, y, r, 0, 6.283); cx.fill(); }
    for (const [x, y, r] of extra) { cx.beginPath(); cx.arc(x, y, r, 0, 6.283); cx.fill(); }
    if (quieto) return;
    // el granizo que cae: rayas finas y rectas, con algo de viento; al llegar al suelo bota una vez
    acum += Math.max(0, p - .3) * 520 * dt; const nn = Math.floor(acum); acum -= nn; lanza(nn);
    cx.strokeStyle = "rgba(240,244,248,.75)"; cx.lineWidth = 1.3 * dpr; cx.lineCap = "round";
    cx.beginPath();
    for (let k = rayas.length - 1; k >= 0; k--) {
      const r = rayas[k]; r.y += r.v * dt; r.x += r.v * dt * .08;
      if (r.y >= r.fin) {
        const cerca = (r.fin - hz) / (H - hz);
        botes.push({ x: r.x, y: r.fin, vy: -rnd(.08, .2) * H * (.3 + Math.max(0, cerca)), y0: r.fin, r: Math.max(.5, (.6 + 3 * cerca) * dpr) });
        rayas.splice(k, 1); continue;
      }
      cx.moveTo(r.x, r.y); cx.lineTo(r.x - r.L * .08, r.y - r.L);
    }
    cx.stroke();
    cx.fillStyle = "#F4F6F8";
    for (let k = botes.length - 1; k >= 0; k--) {
      const b = botes[k]; b.vy += H * 2.4 * dt; b.y += b.vy * dt;
      if (b.y >= b.y0 && b.vy > 0) { if (extra.length < 1500) extra.push([b.x, b.y0, b.r]); botes.splice(k, 1); continue; }
      cx.beginPath(); cx.arc(b.x, b.y, b.r, 0, 6.283); cx.fill();
    }
  };
  const bucle = (t) => { requestAnimationFrame(bucle); pinta(t); };
  if (quieto) pinta(0); else requestAnimationFrame(bucle);
  addEventListener("resize", () => { if (quieto) pinta(0); });

  addEventListener("flyview", (e) => {
    const { index, total, dir } = e.detail;
    objP = total > 1 ? index / (total - 1) : 0;
    if (dir) zum(dir > 0 ? [6, 30, 6] : 6);
    if (quieto) pinta(0);
  });

  // tocar el cielo: una granizada
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a")) return;
    zum([8, 20, 8, 20, 8]);
    if (!quieto) lanza(120);
  });

  // ---------- cada prompt, detrás del visor de un móvil: mantener pulsado grabar tres segundos ----------
  const DUR = 2.4;
  document.querySelectorAll(".code").forEach((code) => {
    const caja = document.createElement("div");
    caja.className = "rec on";
    code.replaceWith(caja); caja.appendChild(code);
    caja.insertAdjacentHTML("beforeend", `<div class="vf" data-nofly role="button" tabindex="0" aria-label="Hold to record and reveal the prompt"><i class="streaks"></i><span class="pill"><i></i><span class="t">REC 00:00</span></span><p class="hint">Hold to record</p><span class="shutter"><svg viewBox="0 0 74 74" aria-hidden="true"><circle class="bg" cx="37" cy="37" r="34"/><circle class="fg" cx="37" cy="37" r="34"/></svg><b></b></span></div>`);
    const vf = caja.querySelector(".vf"), reloj = vf.querySelector(".pill .t"), pista = vf.querySelector(".hint");
    let prog = 0, pulsado = false, hecho = false, corre = false, antes = 0, seg = 0;
    const pon = () => {
      caja.style.setProperty("--p", prog.toFixed(3));
      const s = Math.min(3, Math.floor(prog * 3 + 1e-6));
      reloj.textContent = "REC 00:0" + s;
      if (pulsado && s !== seg) { seg = s; zum(10); }
    };
    const suelta = () => {
      if (hecho) return;
      hecho = true; pulsado = false; prog = 1; pon();
      caja.classList.remove("on", "going"); caja.classList.add("off");
      zum([20, 30, 60]);
      setTimeout(() => vf.remove(), quieto ? 0 : 800);
    };
    const mueve = (t) => {
      const dt = Math.min(60, t - (antes || t)) / 1000; antes = t;
      if (hecho) { corre = false; return; }
      prog = pulsado ? prog + dt / DUR : Math.max(0, prog - dt / .8);   // soltar antes de tiempo rebobina
      pon();
      if (prog >= 1) { suelta(); corre = false; return; }
      if (pulsado || prog > 0) requestAnimationFrame(mueve); else { corre = false; antes = 0; }
    };
    const empieza = () => {
      if (hecho) return;
      if (quieto) { suelta(); return; }
      pulsado = true; caja.classList.add("going"); pista.textContent = "Keep holding";
      zum(12);
      if (!corre) { corre = true; antes = 0; requestAnimationFrame(mueve); }
    };
    const para = () => {
      if (!pulsado) return;
      pulsado = false; caja.classList.remove("going");
      if (!hecho) pista.textContent = "Hold to record";
    };
    vf.addEventListener("pointerdown", (e) => { try { vf.setPointerCapture(e.pointerId); } catch {} empieza(); });
    vf.addEventListener("pointerup", para);
    vf.addEventListener("pointercancel", para);
    vf.addEventListener("contextmenu", (e) => e.preventDefault());
    vf.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (!pulsado) empieza(); } });
    vf.addEventListener("keyup", (e) => { if (e.key === "Enter" || e.key === " ") para(); });
    caja.parentElement.querySelector(".cp")?.addEventListener("click", suelta);
  });

  // al copiar: piedras de granizo que caen, botan en el botón y salen rodando
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    zum([6, 20, 6, 20, 6]);
    if (quieto) return;
    const r = b.getBoundingClientRect();
    for (let k = 0; k < 9; k++) {
      const s = document.createElement("i");
      s.className = "stone";
      s.style.cssText = `left:${r.left + r.width / 2 + rnd(-r.width * .4, r.width * .4)}px;top:${r.top}px;--dx:${rnd(-70, 70).toFixed(0)}px;animation-delay:${k * 55}ms`;
      document.body.appendChild(s); s.addEventListener("animationend", () => s.remove());
    }
  }));

  // ---------- reglas: se hielan desde las esquinas ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((s) => {
    s.insertAdjacentHTML("beforeend", `<i class="frost" aria-hidden="true"></i><span class="hint" aria-hidden="true">Tap to freeze</span>`);
    s.classList.add("warm");
    s.setAttribute("role", "button"); s.tabIndex = 0;
    s._hiela = () => {
      s.classList.remove("iced");
      void s.offsetWidth;
      s.classList.add("iced"); s.classList.remove("warm");
      zum([6, 40, 6]);
    };
    s.addEventListener("click", s._hiela);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); s._hiela(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s) && !s._vista)
      .forEach((s, n) => { s._vista = true; setTimeout(s._hiela, (quieto ? 0 : 1150) + n * 450); });
  });
})();
