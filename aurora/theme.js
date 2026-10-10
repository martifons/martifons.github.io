// AURORA — cielo de noche con cortinas de aurora que se doblan hacia el dedo; tocar el cielo
// suelta un trocito de luz que vuela al tarro de abajo (y tocar el tarro las devuelve al cielo);
// cada prompt está dentro de un tarro cerrado: se gira la tapa arrastrando (o con un toque) y la
// luz se escapa; copiar atrapa otra luz; las reglas se encienden cuando la aurora cae dentro.
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");

  // ---------- el cielo: estrellas quietas, cortinas que ondulan, nieve e iglesia ----------
  const cv = document.createElement("canvas");
  cv.id = "sky"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  // un rayo: el degradado vertical se pinta una vez y se estira en cada raya
  const rayo = document.createElement("canvas"); rayo.width = 1; rayo.height = 256;
  {
    const g = rayo.getContext("2d"), lg = g.createLinearGradient(0, 256, 0, 0);
    lg.addColorStop(0, "rgba(90,255,170,0)"); lg.addColorStop(.05, "rgba(90,255,170,.95)");
    lg.addColorStop(.32, "rgba(60,235,190,.55)"); lg.addColorStop(.6, "rgba(80,170,255,.28)");
    lg.addColorStop(.82, "rgba(165,110,255,.18)"); lg.addColorStop(1, "rgba(255,110,220,0)");
    g.fillStyle = lg; g.fillRect(0, 0, 1, 256);
  }
  const cortinas = [
    { y: .40, a: .06, f: 1.1, v: .00009, h: .30, fase: 0, al: .5 },
    { y: .50, a: .05, f: 1.7, v: -.00007, h: .24, fase: 2.1, al: .36 },
    { y: .33, a: .04, f: .8, v: .00005, h: .20, fase: 4.2, al: .26 },
  ];
  let W, H, dpr, estrellas = [];
  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = Math.round(innerWidth * dpr); H = cv.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    estrellas = [];
    for (let k = 0; k < Math.round(innerWidth * innerHeight / 7000); k++) estrellas.push({ x: Math.random() * W, y: Math.random() * H * .84, r: rnd(.6, 1.6) * dpr, a: rnd(.25, .9), v: rnd(.0008, .003), f: rnd(0, 6.3) });
  };
  tam();
  const ptr = { x: -1, y: 0, f: 0 };
  const apunta = (e) => { ptr.x = e.clientX * dpr; ptr.y = e.clientY * dpr; ptr.f = 1; };
  addEventListener("pointermove", apunta, { passive: true });
  addEventListener("pointerdown", apunta, { passive: true });
  let surge = 0;

  const iglesia = (s) => {
    const gx = W * .72, gy = H * .885;
    cx.fillStyle = "rgba(205,216,230,.34)";
    cx.fillRect(gx, gy - 30 * s, 74 * s, 30 * s);
    cx.beginPath(); cx.moveTo(gx - 4 * s, gy - 30 * s); cx.lineTo(gx + 37 * s, gy - 48 * s); cx.lineTo(gx + 78 * s, gy - 30 * s); cx.fill();
    cx.fillRect(gx - 2 * s, gy - 60 * s, 15 * s, 60 * s);
    cx.beginPath(); cx.moveTo(gx - 4 * s, gy - 60 * s); cx.lineTo(gx + 5.5 * s, gy - 88 * s); cx.lineTo(gx + 15 * s, gy - 60 * s); cx.fill();
    cx.fillStyle = "rgba(255,198,96,.95)"; cx.shadowColor = "rgba(255,176,64,.95)"; cx.shadowBlur = 12 * s;
    for (let k = 0; k < 4; k++) cx.fillRect(gx + (22 + k * 13) * s, gy - 22 * s, 5 * s, 9 * s);
    cx.shadowBlur = 0;
    cx.fillStyle = "rgba(3,7,11,.96)";
    const abeto = (x, h) => {
      for (let k = 0; k < 4; k++) { const y = gy - h + k * h * .21, w = h * (.12 + k * .07); cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x - w, y + h * .34); cx.lineTo(x + w, y + h * .34); cx.fill(); }
    };
    abeto(gx + 112 * s, 104 * s); abeto(gx + 150 * s, 62 * s); abeto(gx - 46 * s, 46 * s);
  };

  const pinta = (t) => {
    cx.clearRect(0, 0, W, H);
    cx.fillStyle = "#fff";
    for (const e of estrellas) { cx.globalAlpha = e.a * (quieto ? 1 : .65 + .35 * Math.sin(t * e.v + e.f)); cx.fillRect(e.x, e.y, e.r, e.r); }
    cx.globalCompositeOperation = "lighter";
    const st = Math.max(3, Math.round(3 * dpr));
    for (const c of cortinas) {
      for (let x = 0; x < W; x += st) {
        const u = x / W;
        let base = H * (c.y + c.a * Math.sin(u * c.f * 6.283 + t * c.v * 6 + c.fase));
        const n = .5 + .5 * Math.sin(u * 61 + t * .0006 + c.fase) * Math.sin(u * 23 - t * .00035 + c.fase * 2);
        let luz = c.al * (.3 + .7 * n) * (1 + surge);
        if (ptr.f > .01 && ptr.x >= 0) {
          const d = (x - ptr.x) / (W * .16), k = Math.exp(-d * d) * ptr.f;
          base += (ptr.y - base) * .22 * k; luz *= 1 + 1.3 * k;
        }
        const alto = H * c.h * (.55 + .45 * n);
        cx.globalAlpha = Math.min(1, luz);
        cx.drawImage(rayo, x, base - alto, st + 1, alto);
      }
    }
    cx.globalCompositeOperation = "source-over"; cx.globalAlpha = 1;
    // la nieve, con el reflejo verde de la aurora
    const gy = H * .885, sg = cx.createLinearGradient(0, gy, 0, H);
    sg.addColorStop(0, `rgba(200,225,245,${.16 + surge * .06})`); sg.addColorStop(1, "rgba(140,175,205,.05)");
    cx.fillStyle = sg; cx.fillRect(0, gy, W, H - gy);
    cx.fillStyle = `rgba(90,255,170,${.035 + surge * .05})`; cx.fillRect(0, gy, W, H - gy);
    iglesia(Math.max(.55, Math.min(1, innerWidth / 1300)) * dpr);
  };
  const bucle = (t) => {
    surge *= .975; ptr.f *= .985;
    pinta(t);
    requestAnimationFrame(bucle);
  };
  if (quieto) pinta(0); else requestAnimationFrame(bucle);
  addEventListener("resize", () => { tam(); if (quieto) pinta(0); });

  // ---------- el tarro de abajo: atrapa las luces ----------
  const tarro = document.createElement("button");
  tarro.id = "jar"; tarro.className = "hud"; tarro.type = "button";
  tarro.setAttribute("aria-label", "Release the lights you caught");
  tarro.innerHTML = `<i class="lid"></i><i class="glass"><i class="fill"></i></i><b>0</b>`;
  document.body.appendChild(tarro);
  let cogidas = 0;
  const nivel = () => {
    tarro.style.setProperty("--n", Math.min(1, cogidas / 8));
    tarro.querySelector("b").textContent = cogidas;
    tarro.classList.toggle("has", cogidas > 0);
  };
  const boca = () => { const r = tarro.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height * .55]; };
  // un trocito de luz que vuela de un punto a otro en curva
  const vuela = (x, y, tx, ty, fin) => {
    if (quieto) { fin && fin(); return; }
    const w = document.createElement("i"); w.className = "wisp"; w.setAttribute("aria-hidden", "true");
    document.body.appendChild(w);
    const mx = (x + tx) / 2 + rnd(-90, 90), my = Math.min(y, ty) - rnd(70, 170);
    const a = w.animate([
      { transform: `translate(${x}px, ${y}px) scale(.6)`, opacity: 0 },
      { transform: `translate(${x}px, ${y}px) scale(1)`, opacity: 1, offset: .12 },
      { transform: `translate(${mx}px, ${my}px) scale(.85)`, opacity: 1, offset: .55 },
      { transform: `translate(${tx}px, ${ty}px) scale(.3)`, opacity: .85 },
    ], { duration: 1300, easing: "cubic-bezier(.45,0,.3,1)" });
    a.onfinish = () => { w.remove(); fin && fin(); };
  };
  const atrapa = () => {
    cogidas++; nivel();
    tarro.classList.remove("gulp"); void tarro.offsetWidth; tarro.classList.add("gulp");
    zum(12);
  };
  const alTarro = (x, y) => { const [tx, ty] = boca(); vuela(x, y, tx, ty, atrapa); };
  tarro.addEventListener("click", () => {
    if (!cogidas) { tarro.classList.remove("gulp"); void tarro.offsetWidth; tarro.classList.add("gulp"); return; }
    const [x, y] = boca();
    for (let k = 0; k < Math.min(cogidas, 8); k++) setTimeout(() => vuela(x, y, rnd(.1, .9) * innerWidth, rnd(.06, .3) * innerHeight, null), k * 90);
    cogidas = 0; nivel(); surge = 1.2; zum([10, 30, 10, 30, 20]);
  });

  // tocar el cielo suelta un trocito de aurora que cae al tarro
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a")) return;
    alTarro(e.clientX, e.clientY);
    surge = Math.max(surge, .5); zum(8);
  });

  // al llegar a cada parada, la aurora se aviva
  addEventListener("flyview", (e) => { if (e.detail.dir) { surge = Math.max(surge, .8); setTimeout(() => zum(10), quieto ? 0 : 900); } });

  // ---------- cada prompt, dentro de un tarro: gira la tapa ----------
  const VUELTAS = 240; // px de arrastre para dos vueltas de rosca
  document.querySelectorAll(".code").forEach((code) => {
    const j = document.createElement("div");
    j.className = "jarred sealed";
    code.replaceWith(j); j.appendChild(code);
    j.insertAdjacentHTML("afterbegin", `<button class="twist" type="button" aria-label="Twist the lid to open the prompt"><span class="ridges" aria-hidden="true"></span><span class="lbl"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5"/></svg>Twist to open</span></button>`);
    j.insertAdjacentHTML("beforeend", `<i class="caught" aria-hidden="true"></i>`);
    const tapa = j.querySelector(".twist");
    let giro = 0, abierto = false, auto = 0, x0 = null, movido = 0;
    const pon = () => { j.style.setProperty("--twist", Math.min(1, giro / VUELTAS).toFixed(3)); j.style.setProperty("--rx", giro + "px"); };
    const abre = () => {
      if (abierto) return;
      abierto = true; giro = VUELTAS; pon();
      j.classList.add("open"); j.classList.remove("sealed");
      zum([15, 40, 25]);
      // la luz se escapa del tarro y vuelve al cielo
      const r = j.getBoundingClientRect();
      for (let k = 0; k < 3; k++) setTimeout(() => vuela(r.left + r.width * (.3 + .2 * k), r.top + r.height * .45, r.left + r.width * (.15 + .35 * k) + rnd(-60, 60), rnd(.04, .22) * innerHeight, null), k * 130);
      surge = 1;
    };
    // un toque: la tapa da las dos vueltas sola
    const autogiro = () => {
      if (abierto || auto) return;
      if (quieto) { abre(); return; }
      const desde = giro, t0 = performance.now();
      const paso = (t) => {
        const p = Math.min(1, (t - t0) / 700);
        giro = desde + (VUELTAS - desde) * (1 - (1 - p) * (1 - p)); pon();
        if (p < 1) auto = requestAnimationFrame(paso); else { auto = 0; abre(); }
      };
      auto = requestAnimationFrame(paso);
      zum(10);
    };
    tapa.addEventListener("pointerdown", (e) => {
      if (abierto) return;
      e.preventDefault(); tapa.setPointerCapture(e.pointerId); x0 = e.clientX; movido = 0;
    });
    tapa.addEventListener("pointermove", (e) => {
      if (x0 === null || abierto || auto) return;
      const dx = Math.abs(e.clientX - x0); x0 = e.clientX; movido += dx;
      const antes = giro; giro = Math.min(VUELTAS, giro + dx); pon();
      if (Math.floor(giro / 40) !== Math.floor(antes / 40)) zum(4); // el clic de la rosca
      if (giro >= VUELTAS) abre();
    });
    tapa.addEventListener("pointerup", () => { if (x0 === null) return; x0 = null; if (!abierto && movido < 8) autogiro(); });
    tapa.addEventListener("pointercancel", () => { x0 = null; });
    // teclado y lectores de pantalla: un clic sin puntero
    tapa.addEventListener("click", (e) => { if (e.detail === 0) autogiro(); });
    j.parentElement.querySelector(".cp")?.addEventListener("click", () => { if (!abierto) abre(); });
  });

  // al copiar: la luz sale del botón y cae en el tarro
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    const r = b.getBoundingClientRect();
    setTimeout(() => alTarro(r.left + r.width / 2, r.top + r.height / 2), 250);
  }));

  // ---------- reglas: la aurora cae dentro y las enciende ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((s) => {
    s.insertAdjacentHTML("afterbegin", `<i class="fall" aria-hidden="true"></i>`);
    s.insertAdjacentHTML("beforeend", `<div class="hint">Tap to light it</div>`);
    s.setAttribute("role", "button"); s.tabIndex = 0;
    s._luz = () => {
      s.classList.remove("lit"); void s.offsetWidth; s.classList.add("lit");
      s.setAttribute("aria-expanded", "true"); zum(10);
    };
    s.addEventListener("click", s._luz);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); s._luz(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s) && !s.classList.contains("lit"))
      .forEach((s, k) => setTimeout(() => { if (!s.classList.contains("lit")) s._luz(); }, (quieto ? 0 : 1250) + k * 480));
  });
})();
