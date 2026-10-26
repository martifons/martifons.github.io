// PUFFER — el fondo es una charca de roca vista desde arriba: arena y guijarros bajo agua clara, rocas oscuras en el
// borde de arriba, cáusticas de sol que se mueven por el fondo y seis peces-gatito que nadan despacio; al avanzar, uno se
// hincha un momento. Tocar la charca hace que los peces vayan a ver. Cada prompt está detrás del pez globo hinchado y
// enfadado: hay que arrastrar hacia abajo sobre él para sacarle el aire (se aplasta mientras aprietas y suelta gotas);
// cuando se queda sin aire cierra los ojos, suspira agua y se duerme. Al copiar caen gotas. Las reglas se hinchan como
// el pez. Cámara "eight".
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");

  const gotas = (padre, x, y, n, fijo) => {
    if (quieto) return;
    for (let k = 0; k < n; k++) {
      const g = document.createElement("i");
      g.className = "gota" + (fijo ? " fixed" : "");
      g.style.cssText = `left:${x + rnd(-8, 8)}px;top:${y + rnd(-4, 4)}px;--dx:${rnd(-24, 24).toFixed(0)}px;animation-delay:${(k * .06).toFixed(2)}s`;
      padre.appendChild(g); g.addEventListener("animationend", () => g.remove());
    }
  };

  // ---------- la charca ----------
  const cv = document.createElement("canvas");
  cv.id = "pool"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  let W, H, dpr, fondo = null, lineas = [];
  const peces = [];
  let cebo = null;

  const pintaFondo = () => {
    fondo = document.createElement("canvas"); fondo.width = W; fondo.height = H;
    const c = fondo.getContext("2d");
    let g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#C9B68E"); g.addColorStop(1, "#B29E76");
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    // guijarros
    for (let k = 0; k < 260; k++) {
      const x = rnd(0, W), y = rnd(H * .1, H), r = rnd(2, 9) * dpr * (Math.random() < .1 ? 2.4 : 1);
      const tono = Math.round(rnd(165, 225));
      c.fillStyle = `rgb(${tono},${Math.round(tono * .93)},${Math.round(tono * .82)})`;
      c.beginPath(); c.ellipse(x, y, r, r * rnd(.6, .9), rnd(0, 3), 0, 6.283); c.fill();
      c.fillStyle = "rgba(255,255,255,.18)"; c.beginPath(); c.ellipse(x - r * .3, y - r * .3, r * .35, r * .25, 0, 0, 6.283); c.fill();
    }
    // las rocas oscuras del borde de arriba
    c.fillStyle = "#3A3632";
    c.beginPath(); c.moveTo(0, 0);
    for (let x = 0; x <= W + 40 * dpr; x += 40 * dpr) c.lineTo(x, H * rnd(.05, .13));
    c.lineTo(W, 0); c.closePath(); c.fill();
    // el agua: un velo verde azulado más claro abajo
    g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "rgba(40,110,130,.32)"); g.addColorStop(1, "rgba(60,150,160,.12)");
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    lineas = []; for (let k = 0; k < 28; k++) lineas.push({ y: rnd(0, 1), f: rnd(.006, .016), a: rnd(18, 48), v: rnd(.0004, .0011), ph: rnd(0, 6.283), vert: k % 4 === 0 });
  };

  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = Math.round(innerWidth * dpr); H = cv.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    pintaFondo();
    peces.length = 0;
    for (let k = 0; k < 6; k++) peces.push({ x: rnd(.1, .9) * W, y: rnd(.2, .9) * H, a: rnd(0, 6.283), v: rnd(.02, .04) * dpr, s: rnd(1.5, 2.1) * dpr, f: rnd(0, 6), hincha: -1e9 });
  };
  tam();
  addEventListener("resize", tam);

  // un pez-gatito visto desde arriba: cuerpo naranja, cola, dos orejas y dos ojitos; "g" de 0 a 1 lo hincha
  const pez = (p, t, g) => {
    cx.save(); cx.translate(p.x, p.y); cx.rotate(p.a); const s = p.s * (1 + g * .9); cx.scale(s, s);
    const cola = Math.sin(t * .012 + p.f) * .4;
    cx.fillStyle = "rgba(240,150,60,.75)"; cx.beginPath(); cx.moveTo(-10, 0); cx.lineTo(-20, -6 + cola * 6); cx.lineTo(-20, 6 + cola * 6); cx.closePath(); cx.fill();
    cx.fillStyle = "#F0A04E"; cx.beginPath(); cx.ellipse(0, 0, 12 - g * 2, 8 + g * 4, 0, 0, 6.283); cx.fill();
    cx.fillStyle = "#E08A36"; cx.beginPath(); cx.moveTo(6, -6); cx.lineTo(9, -11); cx.lineTo(11, -5); cx.closePath(); cx.moveTo(6, 6); cx.lineTo(9, 11); cx.lineTo(11, 5); cx.closePath(); cx.fill();
    cx.fillStyle = "#141414"; cx.beginPath(); cx.arc(9, -3, 1.4, 0, 6.283); cx.arc(9, 3, 1.4, 0, 6.283); cx.fill();
    cx.restore();
  };

  let ultimo = 0;
  const pinta = (t) => {
    const dt = Math.min(50, t - (ultimo || t)); ultimo = t;
    cx.drawImage(fondo, 0, 0);
    // cáusticas: líneas onduladas que se suman en luz
    if (!quieto) {
      cx.save(); cx.globalCompositeOperation = "lighter"; cx.strokeStyle = "rgba(255,250,220,.045)"; cx.lineWidth = 4 * dpr;
      for (const l of lineas) {
        cx.beginPath();
        if (l.vert) { const x0 = l.y * W; for (let y = 0; y <= H; y += 24 * dpr) { const x = x0 + Math.sin(y * l.f / dpr + t * l.v + l.ph) * l.a * dpr; y ? cx.lineTo(x, y) : cx.moveTo(x, y); } }
        else { const y0 = l.y * H; for (let x = 0; x <= W; x += 24 * dpr) { const y = y0 + Math.sin(x * l.f / dpr + t * l.v + l.ph) * l.a * dpr; x ? cx.lineTo(x, y) : cx.moveTo(x, y); } }
        cx.stroke();
      }
      cx.restore();
    }
    // los peces: deambulan; si hay cebo, van hacia él
    for (const p of peces) {
      if (!quieto) {
        if (cebo && t < cebo.hasta) { const obj = Math.atan2(cebo.y - p.y, cebo.x - p.x); let d = obj - p.a; d = Math.atan2(Math.sin(d), Math.cos(d)); p.a += d * Math.min(1, dt / 300); }
        else p.a += Math.sin(t * .0007 + p.f) * .0015 * dt;
        const v = p.v * (cebo && t < cebo.hasta ? 2.2 : 1);
        p.x += Math.cos(p.a) * v * dt; p.y += Math.sin(p.a) * v * dt;
        if (p.x < 20 * dpr || p.x > W - 20 * dpr) { p.a = Math.PI - p.a; p.x = Math.max(20 * dpr, Math.min(W - 20 * dpr, p.x)); }
        if (p.y < H * .16 || p.y > H - 20 * dpr) { p.a = -p.a; p.y = Math.max(H * .16, Math.min(H - 20 * dpr, p.y)); }
      }
      const e = (t - p.hincha) / 900, g = e >= 0 && e < 1 ? Math.sin(e * Math.PI) : 0;
      pez(p, t, g);
    }
  };
  const bucle = (t) => { requestAnimationFrame(bucle); pinta(t); };
  if (quieto) pinta(0); else requestAnimationFrame(bucle);
  addEventListener("resize", () => { if (quieto) pinta(0); });

  addEventListener("flyview", (e) => {
    const { dir } = e.detail;
    if (dir > 0 && peces.length) peces[Math.floor(rnd(0, peces.length))].hincha = performance.now();
    if (dir) zum(dir > 0 ? [10, 30, 6] : 6);
    if (quieto) pinta(0);
  });

  // tocar la charca: los peces van a ver
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a")) return;
    zum(10);
    cebo = { x: e.clientX * dpr, y: e.clientY * dpr, hasta: performance.now() + 2500 };
  });

  // ---------- cada prompt, detrás del pez hinchado: sácale el aire ----------
  const pinchos = (() => { let s = ""; for (let k = 0; k <= 12; k++) { const a = (15 + k * 12.5) * Math.PI / 180, x = 100 + Math.cos(a) * 74, y = 110 + Math.sin(a) * 74, x2 = 100 + Math.cos(a) * 84, y2 = 110 + Math.sin(a) * 84, dx = -Math.sin(a) * 4, dy = Math.cos(a) * 4; s += `<path d="M${(x - dx).toFixed(1)} ${(y - dy).toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}L${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)}Z"/>`; } return s; })();
  const PEZ = (n) => `<svg class="fish" viewBox="0 0 200 200" aria-hidden="true"><defs><linearGradient id="cuerpo${n}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2A24E"/><stop offset=".48" stop-color="#F6B76A"/><stop offset=".52" stop-color="#FFF8EE"/><stop offset="1" stop-color="#F1E8DC"/></linearGradient></defs>
    <g class="cuerpo">
      <ellipse cx="20" cy="112" rx="18" ry="11" fill="rgba(240,150,60,.6)"/><ellipse cx="180" cy="112" rx="18" ry="11" fill="rgba(240,150,60,.6)"/>
      <g class="pinchos" fill="#FFF8EE">${pinchos}</g>
      <path d="M48 70L56 28L84 52Z" fill="#F2A24E"/><path d="M152 70L144 28L116 52Z" fill="#F2A24E"/>
      <path d="M56 62L60 40L74 52Z" fill="#F4B3B8"/><path d="M144 62L140 40L126 52Z" fill="#F4B3B8"/>
      <circle cx="100" cy="110" r="74" fill="url(#cuerpo${n})"/>
      <path d="M86 50l3 12M100 46v13M114 50l-3 12" stroke="#D27F2E" stroke-width="4" stroke-linecap="round"/>
      <g class="abiertos"><circle cx="76" cy="100" r="13" fill="#141414"/><circle cx="124" cy="100" r="13" fill="#141414"/><circle cx="80" cy="95" r="4" fill="#fff"/><circle cx="128" cy="95" r="4" fill="#fff"/></g>
      <path class="ceja" d="M60 80L88 88M140 80L112 88" stroke="#7A4A1E" stroke-width="4" stroke-linecap="round"/>
      <path class="cerrados" d="M64 102q12 8 24 0M112 102q12 8 24 0" stroke="#141414" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="100" cy="124" rx="22" ry="14" fill="#FFF8EE"/>
      <path d="M95 117h10l-5 6Z" fill="#F08A9A"/>
      <path d="M100 123v5M92 130q8 6 16 0" stroke="#5A3A2A" stroke-width="2" fill="none"/>
      <path d="M78 122l-28-4M78 127l-28 4M122 122l28-4M122 127l28 4" stroke="#fff" stroke-width="1.2"/>
    </g></svg>`;
  document.querySelectorAll(".code").forEach((code, n) => {
    const caja = document.createElement("div");
    caja.className = "palm on";
    code.replaceWith(caja); caja.appendChild(code);
    caja.insertAdjacentHTML("beforeend", `<div class="squeeze" data-nofly role="button" tabindex="0" aria-label="Drag down on the pufferfish to squeeze the air out and reveal the prompt">${PEZ(n)}<p class="count">Air: <b>100</b>%</p><p class="hint" aria-hidden="true">Drag down to squeeze ↓</p><span class="meter"><i></i></span></div>`);
    const caj = caja.querySelector(".squeeze"), cuerpo = caj.querySelector(".cuerpo"), pinch = caj.querySelector(".pinchos");
    const cuenta = caj.querySelector(".count b"), barra = caj.querySelector(".meter i"), pezEl = caj.querySelector(".fish");
    let aire = 1, aplasta = 0, inicio = null, ultimoY = 0, goteo = 0, hecho = false;
    const boca = () => { const c = caj.getBoundingClientRect(), f = pezEl.getBoundingClientRect(), k = caj.offsetWidth / (c.width || 1); return [(f.left - c.left + f.width / 2) * k, (f.top - c.top + f.height * .66) * k]; };
    const dibuja = () => {
      const s = .45 + .55 * aire;
      cuerpo.style.transform = `scale(${(s * (1 + .25 * aplasta)).toFixed(3)},${(s * (1 - .3 * aplasta)).toFixed(3)})`;
      pinch.style.opacity = aire.toFixed(2);
      cuenta.textContent = Math.round(aire * 100); barra.style.width = (aire * 100).toFixed(1) + "%";
    };
    const abre = () => {
      if (caja.classList.contains("off")) return;
      hecho = true; caja.classList.remove("on"); caja.classList.add("off");
      zum([15, 30, 50]);
      setTimeout(() => caj.remove(), quieto ? 0 : 1100);
    };
    const duerme = () => {
      hecho = true; aire = 0; aplasta = 0; caj.classList.remove("held"); caj.classList.add("done"); dibuja();
      caj.querySelector(".count").innerHTML = "Asleep <b>zz</b>";
      const [x, y] = boca(); gotas(caj, x, y, 4);
      zum([10, 60, 10]);
      setTimeout(abre, quieto ? 0 : 1300);
    };
    const saca = (cuanto) => {
      if (hecho) return;
      aire = Math.max(0, aire - cuanto); caj.classList.add("started");
      goteo += cuanto;
      if (goteo > .05) { goteo = 0; const [x, y] = boca(); gotas(caj, x, y, 1); zum(4); }
      dibuja();
      if (aire <= 0) duerme();
    };
    caj.addEventListener("pointerdown", (e) => {
      if (hecho) return;
      if (quieto) return saca(.34);
      inicio = e.clientY; ultimoY = e.clientY; caj.classList.add("held");
      try { caj.setPointerCapture(e.pointerId); } catch {}
    });
    caj.addEventListener("pointermove", (e) => {
      if (hecho || inicio === null) return;
      const r = caj.getBoundingClientRect(), k = caj.offsetWidth / (r.width || 1);
      aplasta = Math.max(0, Math.min(1, (e.clientY - inicio) * k / 140));
      const d = (e.clientY - ultimoY) * k; ultimoY = e.clientY;
      if (d > 0) saca(d / 300); else dibuja();
    });
    const suelta = () => { if (inicio === null) return; inicio = null; aplasta = 0; caj.classList.remove("held"); if (!hecho) dibuja(); };
    caj.addEventListener("pointerup", suelta);
    caj.addEventListener("pointercancel", suelta);
    caj.addEventListener("keydown", (e) => { if (["Enter", " ", "ArrowDown"].includes(e.key)) { e.preventDefault(); saca(.25); } });
    caja.parentElement.querySelector(".cp")?.addEventListener("click", abre);
    dibuja();
  });

  // al copiar: caen gotas del botón
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    zum([8, 20, 8]);
    const r = b.getBoundingClientRect();
    gotas(document.body, r.left + r.width / 2, r.bottom - 4, 7, true);
  }));

  // ---------- reglas: se hinchan como el pez ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((s) => {
    if (!quieto) s.classList.add("tiny");
    s.setAttribute("role", "button"); s.tabIndex = 0;
    s._boop = () => {
      if (quieto) return;
      s.classList.remove("boop", "puff"); void s.offsetWidth; s.classList.add("boop");
      zum([6, 20, 6]);
    };
    s.addEventListener("click", s._boop);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); s._boop(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s) && !s._vista)
      .forEach((s, n) => { s._vista = true; setTimeout(() => { s.classList.remove("tiny"); s.classList.add("puff"); zum([6, 30, 6]); }, (quieto ? 0 : 500) + n * 350); });
  });
})();
