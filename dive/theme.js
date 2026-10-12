// DIVE — una caída libre sin fin al atardecer: las nubes suben de largo, y tocar el cielo trae una
// ráfaga de viento. Cada prompt va plegado como un paracaídas: se tira de la anilla hacia abajo
// (o se toca) y se despliega. Copiar suelta un paracaídas pequeño. Las reglas llegan boca abajo,
// como ella en el último plano, y se dan la vuelta. La cámara baja en espiral (fly "spiral").
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");

  // ---------- el cielo en caída libre ----------
  const cv = document.createElement("canvas");
  cv.id = "freefall"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  let W, H, dpr, capas = [], rayas = [];
  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = Math.round(innerWidth * dpr); H = cv.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    // tres capas de nube: lejos (pequeñas, lentas), en medio, cerca (grandes, rápidas, tenues)
    capas = [[.5, 14, .18, .35], [1.1, 9, .28, .3], [2.4, 5, .5, .18]].map(([v, n, r, a]) =>
      ({ v, a, nubes: Array.from({ length: n }, () => ({ x: Math.random(), y: Math.random() * 1.4 - .2, r: rnd(r * .6, r) })) }));
    rayas = Array.from({ length: 40 }, () => ({ x: Math.random(), y: Math.random(), l: rnd(.04, .12), v: rnd(.012, .03) }));
  };
  tam();
  let viento = 1;
  const pinta = () => {
    // cielo: azul de anochecer arriba, lavanda en medio, naranja abajo, y el sol
    const g = cx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#26325A"); g.addColorStop(.45, "#8B6F9E"); g.addColorStop(.8, "#E59A6A"); g.addColorStop(1, "#F6C47E");
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    const sol = cx.createRadialGradient(W * .5, H * .96, 0, W * .5, H * .96, W * .55);
    sol.addColorStop(0, "rgba(255,226,160,.85)"); sol.addColorStop(.25, "rgba(255,190,120,.35)"); sol.addColorStop(1, "rgba(255,190,120,0)");
    cx.fillStyle = sol; cx.fillRect(0, 0, W, H);
    // nubes que suben: caemos a través de ellas
    for (const c of capas) {
      for (const n of c.nubes) {
        if (!quieto) { n.y -= c.v * viento * .0016; if (n.y < -.35) { n.y = 1.25; n.x = Math.random(); } }
        const x = n.x * W, y = n.y * H, R = n.r * Math.max(W, H * .6);
        const ng = cx.createRadialGradient(x, y + R * .25, 0, x, y, R);
        ng.addColorStop(0, `rgba(255,222,190,${c.a})`); ng.addColorStop(.5, `rgba(214,170,180,${c.a * .55})`); ng.addColorStop(1, "rgba(160,130,170,0)");
        cx.fillStyle = ng; cx.fillRect(x - R, y - R, R * 2, R * 2);
      }
    }
    // rayas de viento, más con cada ráfaga
    cx.strokeStyle = "rgba(255,240,225,1)"; cx.lineWidth = 1 * dpr; cx.lineCap = "round";
    for (const r of rayas) {
      if (!quieto) { r.y -= r.v * viento; if (r.y < -r.l) { r.y = 1 + Math.random() * .2; r.x = Math.random(); } }
      cx.globalAlpha = Math.min(.5, .05 * viento);
      cx.beginPath(); cx.moveTo(r.x * W, r.y * H); cx.lineTo(r.x * W, (r.y + r.l * Math.min(3, viento)) * H); cx.stroke();
    }
    cx.globalAlpha = 1;
  };
  const bucle = () => { viento += (1 - viento) * .025; pinta(); requestAnimationFrame(bucle); };
  if (quieto) pinta(); else requestAnimationFrame(bucle);
  addEventListener("resize", () => { tam(); if (quieto) pinta(); });

  // tocar el cielo: una ráfaga
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a")) return;
    viento = 6; zum([20, 30, 20]);
  });
  addEventListener("flyview", (e) => { if (e.detail.dir) { viento = Math.max(viento, 3.5); setTimeout(() => zum(10), quieto ? 0 : 900); } });

  // ---------- el título cae letra a letra ----------
  const em = document.querySelector(".hero h1.big em");
  if (em && !quieto) {
    const txt = em.textContent; em.textContent = "";
    [...txt].forEach((ch, k) => {
      const s = document.createElement("span"); s.className = "drop"; s.textContent = ch === " " ? " " : ch;
      s.style.animationDelay = (.25 + k * .06) + "s"; em.appendChild(s);
    });
    em.setAttribute("aria-label", txt);
  }

  // ---------- cada prompt, plegado como un paracaídas: tira de la anilla ----------
  const UMBRAL = 70;
  document.querySelectorAll(".code").forEach((code) => {
    const caja = document.createElement("div");
    caja.className = "chute packed";
    code.replaceWith(caja); caja.appendChild(code);
    caja.insertAdjacentHTML("beforeend", `<i class="folds" aria-hidden="true"></i><svg class="cord" aria-hidden="true"><line/></svg><button class="ring" type="button" data-nofly aria-label="Pull the ripcord to open the prompt"><i></i><span>Pull</span></button>`);
    const anilla = caja.querySelector(".ring"), linea = caja.querySelector(".cord line");
    let abierto = false, x0 = 0, y0 = 0, tirando = false, dx = 0, dy = 0, movido = 0, auto = 0;
    const dibuja = () => {
      const w = caja.offsetWidth, h = caja.offsetHeight, ax = w / 2, ay = h * .62 - 4; // el paquete plegado acaba al 62 %
      anilla.style.transform = `translate(calc(-50% + ${dx}px), ${dy}px)`;
      linea.setAttribute("x1", ax); linea.setAttribute("y1", ay);
      linea.setAttribute("x2", ax + dx); linea.setAttribute("y2", h - 30 + dy);
      caja.style.setProperty("--tug", Math.min(1, Math.hypot(dx, dy) / UMBRAL).toFixed(3));
    };
    requestAnimationFrame(dibuja);
    addEventListener("resize", () => { if (!abierto) dibuja(); });
    const abre = () => {
      if (abierto) return;
      abierto = true; cancelAnimationFrame(auto);
      caja.classList.add("open"); caja.classList.remove("packed");
      zum([30, 40, 15, 20, 10]);
      setTimeout(() => { anilla.remove(); caja.querySelector(".cord")?.remove(); }, 450);
    };
    // vuelve a su sitio con un muelle si se suelta antes de tiempo
    const vuelve = () => {
      const fx = dx, fy = dy, t0 = performance.now();
      const paso = (t) => { const p = Math.min(1, (t - t0) / 380), k = Math.cos(p * Math.PI * 2.5) * (1 - p); dx = fx * k; dy = fy * k; dibuja(); if (p < 1 && !tirando) requestAnimationFrame(paso); };
      if (quieto) { dx = dy = 0; dibuja(); } else requestAnimationFrame(paso);
    };
    anilla.addEventListener("pointerdown", (e) => {
      if (abierto) return;
      e.preventDefault(); anilla.setPointerCapture(e.pointerId); tirando = true; x0 = e.clientX - dx; y0 = e.clientY - dy; movido = 0;
    });
    anilla.addEventListener("pointermove", (e) => {
      if (!tirando || abierto) return;
      dx = Math.max(-80, Math.min(80, e.clientX - x0)); dy = Math.max(-20, Math.min(110, e.clientY - y0));
      movido = Math.max(movido, Math.hypot(dx, dy)); dibuja();
      if (Math.hypot(dx, dy) >= UMBRAL) { tirando = false; abre(); }
    });
    // un toque sin arrastrar: la anilla se tira sola
    const sola = () => {
      if (abierto || auto) return;
      if (quieto) { abre(); return; }
      zum(8);
      const t0 = performance.now();
      const paso = (t) => { const p = Math.min(1, (t - t0) / 420); dy = UMBRAL * p * p; dibuja(); if (p < 1) auto = requestAnimationFrame(paso); else abre(); };
      auto = requestAnimationFrame(paso);
    };
    anilla.addEventListener("pointerup", () => { if (!tirando) return; tirando = false; if (movido < 6) sola(); else if (!abierto) vuelve(); });
    anilla.addEventListener("pointercancel", () => { tirando = false; if (!abierto) vuelve(); });
    anilla.addEventListener("click", (e) => { if (e.detail === 0) sola(); }); // teclado
    caja.parentElement.querySelector(".cp")?.addEventListener("click", () => { if (!abierto) abre(); });
  });

  // al copiar: un paracaídas pequeño baja desde el botón
  const paracaidas = `<svg viewBox="0 0 40 52" aria-hidden="true"><path d="M2 18 C2 6 38 6 38 18 C32 14 26 14 20 18 C14 14 8 14 2 18Z" fill="#FF2A1F"/><path d="M2 18 L20 40 M38 18 L20 40 M20 18 L20 40 M11 16 L20 40 M29 16 L20 40" stroke="#F3EEEB" stroke-width=".8" fill="none"/><rect x="17" y="39" width="6" height="8" rx="2" fill="#F3EEEB"/></svg>`;
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    zum([10, 20, 10]); viento = Math.max(viento, 3);
    if (quieto) return;
    const r = b.getBoundingClientRect(), p = document.createElement("i");
    p.className = "minichute"; p.innerHTML = paracaidas;
    p.style.left = r.left + r.width / 2 + "px"; p.style.top = r.top + "px";
    document.body.appendChild(p);
    const lado = rnd(-60, 60);
    p.animate([
      { transform: "translate(-50%, -40px) scale(.2) rotate(0deg)", opacity: 0 },
      { transform: "translate(-50%, -70px) scale(1) rotate(-8deg)", opacity: 1, offset: .15 },
      { transform: `translate(calc(-50% + ${lado * .5}px), 60px) rotate(9deg)`, opacity: 1, offset: .55 },
      { transform: `translate(calc(-50% + ${lado}px), ${innerHeight - r.top + 40}px) rotate(-6deg)`, opacity: .9 },
    ], { duration: 3600, easing: "cubic-bezier(.3,.1,.5,1)" }).onfinish = () => p.remove();
  }));

  // ---------- reglas: llegan boca abajo y se dan la vuelta ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((s) => {
    const giro = document.createElement("div"); giro.className = "flip";
    while (s.firstChild) giro.appendChild(s.firstChild);
    s.appendChild(giro);
    s.insertAdjacentHTML("beforeend", `<div class="hint">Tap to turn it the right way up</div>`);
    s.setAttribute("role", "button"); s.tabIndex = 0;
    s._gira = () => {
      const derecha = !s.classList.contains("upright");
      s.classList.toggle("upright", derecha); s.setAttribute("aria-expanded", derecha);
      zum(derecha ? [12, 30, 12] : 10); viento = Math.max(viento, 2.5);
    };
    s.addEventListener("click", s._gira);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); s._gira(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s) && !s.classList.contains("upright"))
      .forEach((s, n) => setTimeout(() => { if (!s.classList.contains("upright")) s._gira(); }, (quieto ? 0 : 1300) + n * 520));
  });
})();
