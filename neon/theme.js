// NEON — el fondo es la fachada de LED de la torre: columnas de tiras cortas de luz blanco-lila sobre
// la noche morada, recorridas por ondas lentas que suben. Cuanto más se avanza, más se enciende la
// torre, y cada llegada a una vista lanza una banda de luz que la recorre de abajo arriba. Tocar la
// fachada abre una onda circular. Cada prompt está apagado: se arrastra el enchufe del cable de neón
// hasta la toma y el letrero parpadea hasta encenderse. Copiar manda una ola de luz desde el botón. Las
// reglas se encienden como un rótulo de neón, a trompicones. Cámara "arc": un cuarto de vuelta.
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");

  // ---------- la fachada de LED ----------
  // cada tira es un píxel de un canvas pequeño (columnas × filas) que se amplía sin suavizar; encima,
  // una rejilla oscura ya pintada separa las tiras. Así se mueven miles de luces sin coste.
  const cv = document.createElement("canvas");
  cv.id = "facade"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  const leds = document.createElement("canvas"), lx = leds.getContext("2d");
  const rejilla = document.createElement("canvas");
  const PASO_X = 12, PASO_Y = 17; // px CSS entre tiras
  let W, H, dpr, cols, filas, img;
  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = rejilla.width = Math.round(innerWidth * dpr); H = cv.height = rejilla.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    cols = Math.ceil(innerWidth / PASO_X); filas = Math.ceil(innerHeight / PASO_Y);
    leds.width = cols; leds.height = filas; img = lx.createImageData(cols, filas);
    const g = rejilla.getContext("2d");
    g.fillStyle = "#0D0618";
    for (let c = 0; c <= cols; c++) g.fillRect(c * PASO_X * dpr - 3.5 * dpr, 0, 7 * dpr, H);           // hueco entre columnas
    for (let f = 0; f <= filas; f++) g.fillRect(0, f * PASO_Y * dpr - 1.5 * dpr, W, 3 * dpr);           // hueco entre tiras
    // los perfiles verticales de la torre, cada 9 columnas, un poco más anchos
    g.fillStyle = "#07030E";
    for (let c = 0; c <= cols; c += 9) g.fillRect(c * PASO_X * dpr - 6 * dpr, 0, 12 * dpr, H);
  };
  tam();
  addEventListener("resize", tam);

  let p = 0, objP = 0, ultimo = 0, banda = -1;
  const ondas = [];
  const pinta = (t) => {
    const dt = Math.min(50, t - (ultimo || t)); ultimo = t;
    p += (objP - p) * (quieto ? 1 : Math.min(1, dt / 700));
    const d = img.data, tt = quieto ? 0 : t * .001;
    const base = .05 + .16 * p, amp = .45 + .45 * p;
    if (banda >= 0) banda += dt * .0011; if (banda > 1.3) banda = -1;
    for (let f = 0; f < filas; f++) {
      const yf = f / filas;
      for (let c = 0; c < cols; c++) {
        const xf = c / cols;
        // dos ondas lentas que suben por la fachada, como en el vídeo
        let v = base + amp * Math.max(0, Math.sin((yf * 5 - tt * .9) + Math.sin(xf * 3 + tt * .3) * 1.4)) * .7
          + amp * .35 * Math.max(0, Math.sin(yf * 11 + xf * 4 - tt * 1.7));
        // la banda que sube al llegar a una vista
        if (banda >= 0) { const dy = Math.abs(1 - yf - banda); if (dy < .06) v += (1 - dy / .06) * .9; }
        // las ondas circulares de los toques
        for (const o of ondas) {
          const r = (t - o.t0) * o.vel, dx = c * PASO_X - o.x, dy2 = f * PASO_Y - o.y, dist = Math.sqrt(dx * dx + dy2 * dy2);
          const e = Math.abs(dist - r);
          if (e < 26) v += (1 - e / 26) * o.fuerza * Math.max(0, 1 - r / o.alcance);
        }
        v = Math.min(1, v);
        const k = (f * cols + c) * 4;
        d[k] = 50 + 205 * v; d[k + 1] = 28 + 212 * v; d[k + 2] = 92 + 163 * v; d[k + 3] = 255;
      }
    }
    for (let k = ondas.length - 1; k >= 0; k--) if ((t - ondas[k].t0) * ondas[k].vel > ondas[k].alcance) ondas.splice(k, 1);
    lx.putImageData(img, 0, 0);
    cx.fillStyle = "#12081F"; cx.fillRect(0, 0, W, H);
    cx.imageSmoothingEnabled = false;
    cx.drawImage(leds, 0, 0, cols * PASO_X * dpr, filas * PASO_Y * dpr);
    cx.drawImage(rejilla, 0, 0);
    // la neblina morada por encima, más densa abajo
    const g = cx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "rgba(40,10,60,.35)"); g.addColorStop(.7, "rgba(60,15,80,.15)"); g.addColorStop(1, "rgba(120,30,110,.45)");
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);
  };
  const bucle = (t) => { pinta(t); requestAnimationFrame(bucle); };
  if (quieto) pinta(0); else requestAnimationFrame(bucle);
  addEventListener("resize", () => { if (quieto) pinta(0); });

  const onda = (x, y, fuerza, alcance) => {
    if (quieto) return;
    ondas.push({ x, y, t0: performance.now(), vel: .45, fuerza, alcance });
    if (ondas.length > 6) ondas.shift();
  };

  // al avanzar, la torre se enciende un poco más y una banda de luz la recorre
  addEventListener("flyview", (e) => {
    const { index, total, dir } = e.detail;
    objP = total > 1 ? index / (total - 1) : 0;
    if (dir && !quieto) banda = 0;
    if (dir) zum([6, 14, 6]);
    if (quieto) pinta(0);
  });

  // tocar la fachada: una onda de luz
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a")) return;
    onda(e.clientX, e.clientY, .9, Math.max(innerWidth, innerHeight) * .7);
    zum(10);
  });

  // ---------- cada prompt, apagado: se enchufa el cable de neón ----------
  document.querySelectorAll(".code").forEach((code) => {
    const caja = document.createElement("div");
    caja.className = "sign off";
    code.replaceWith(caja); caja.appendChild(code);
    caja.insertAdjacentHTML("beforeend", `<div class="unlit" aria-hidden="true"><span class="tube">PROMPT</span></div><svg class="cable" aria-hidden="true"><path d=""/></svg><i class="outlet" aria-hidden="true"><b></b><b></b></i><button class="plug" type="button" data-nofly aria-label="Plug in the neon sign to reveal the prompt"></button><span class="plug-hint" aria-hidden="true">Plug it in</span>`);
    const enchufe = caja.querySelector(".plug"), toma = caja.querySelector(".outlet"), ruta = caja.querySelector(".cable path");
    let puesto = false, arr = null, anim = 0, pos = null;
    const casa = () => { const w = caja.clientWidth, h = caja.clientHeight; return { w, h, ini: [44, h - 46], fin: [w - 44, h - 46] }; };
    const dibuja = () => {
      const { h } = casa(), [x, y] = pos;
      const caida = Math.max(30, 90 - Math.abs(x - 14) * .1);
      ruta.setAttribute("d", `M -10 ${h - 20} C ${x * .35} ${h + caida}, ${x - 40} ${y + caida}, ${x - 16} ${y}`);
      enchufe.style.left = x + "px"; enchufe.style.top = y + "px";
    };
    const coloca = () => { if (arr) return; pos = puesto ? casa().fin : casa().ini; dibuja(); };
    const enciende = () => {
      if (puesto) return;
      puesto = true; cancelAnimationFrame(anim);
      pos = casa().fin; dibuja();
      caja.classList.add("plugged");
      zum([12, 40, 12, 60, 30]);
      // parpadeo de neón y, al final, el prompt
      setTimeout(() => { caja.classList.remove("off"); caja.classList.add("on"); }, quieto ? 0 : 1100);
      setTimeout(() => { caja.querySelector(".plug-hint")?.remove(); }, quieto ? 0 : 400);
    };
    const lleva = (ms) => {
      if (puesto) return;
      if (quieto) { enciende(); return; }
      cancelAnimationFrame(anim);
      const desde = pos.slice(), hasta = casa().fin, t0 = performance.now();
      const paso = (ahora) => {
        const e = Math.min(1, (ahora - t0) / ms), q = 1 - Math.pow(1 - e, 3);
        pos = [desde[0] + (hasta[0] - desde[0]) * q, desde[1] + (hasta[1] - desde[1]) * q - Math.sin(q * Math.PI) * 30];
        dibuja();
        if (e < 1) anim = requestAnimationFrame(paso); else enciende();
      };
      anim = requestAnimationFrame(paso);
    };
    enchufe.addEventListener("pointerdown", (e) => {
      if (puesto) return;
      cancelAnimationFrame(anim);
      const r = caja.getBoundingClientRect();
      arr = { dx: e.clientX - r.left - pos[0], dy: e.clientY - r.top - pos[1], x0: e.clientX, y0: e.clientY, movido: false };
      try { enchufe.setPointerCapture(e.pointerId); } catch {}
      caja.classList.add("dragging");
    });
    enchufe.addEventListener("pointermove", (e) => {
      if (!arr || puesto) return;
      if (Math.hypot(e.clientX - arr.x0, e.clientY - arr.y0) > 5) arr.movido = true;
      if (!arr.movido) return;
      const r = caja.getBoundingClientRect(), { w, h, fin } = casa();
      pos = [Math.max(20, Math.min(w - 20, e.clientX - r.left - arr.dx)), Math.max(20, Math.min(h - 20, e.clientY - r.top - arr.dy))];
      dibuja();
      // cerca de la toma, se nota el tirón
      const cerca = Math.hypot(pos[0] - fin[0], pos[1] - fin[1]) < 40;
      if (cerca && !caja.classList.contains("near")) zum(8);
      caja.classList.toggle("near", cerca);
      if (Math.hypot(pos[0] - fin[0], pos[1] - fin[1]) < 22) { arr = null; caja.classList.remove("dragging", "near"); enciende(); }
    });
    const suelta = () => {
      if (!arr) return;
      const movido = arr.movido; arr = null; caja.classList.remove("dragging");
      if (puesto) return;
      const { fin } = casa();
      if (!movido || Math.hypot(pos[0] - fin[0], pos[1] - fin[1]) < 40) lleva(700); // un toque, o cerca: se enchufa solo
    };
    enchufe.addEventListener("pointerup", suelta);
    enchufe.addEventListener("pointercancel", () => { arr = null; caja.classList.remove("dragging"); });
    enchufe.addEventListener("click", (e) => { if (e.detail === 0) lleva(700); }); // teclado
    caja.parentElement.querySelector(".cp")?.addEventListener("click", () => { if (!puesto) { pos = casa().fin; enciende(); } });
    pos = casa().ini;
    requestAnimationFrame(coloca);
    addEventListener("resize", coloca);
    addEventListener("flyview", () => requestAnimationFrame(coloca));
  });

  // al copiar: una ola de luz sale del botón y recorre toda la fachada
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    zum([10, 20, 10]);
    const r = b.getBoundingClientRect();
    onda(r.left + r.width / 2, r.top + r.height / 2, 1.2, Math.hypot(innerWidth, innerHeight));
  }));

  // ---------- reglas: se encienden como un rótulo de neón ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((s) => {
    s.classList.add("dark");
    s.insertAdjacentHTML("beforeend", `<span class="hint" aria-hidden="true">Tap to switch on</span>`);
    s.setAttribute("role", "button"); s.tabIndex = 0;
    s._enciende = () => {
      s.classList.remove("lit"); s.classList.add("dark"); void s.offsetWidth;
      s.classList.remove("dark"); s.classList.add("lit");
      zum([8, 40, 8, 80, 12]);
    };
    s.addEventListener("click", s._enciende);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); s._enciende(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s) && s.classList.contains("dark"))
      .forEach((s, n) => setTimeout(() => { if (s.classList.contains("dark")) s._enciende(); }, (quieto ? 0 : 1150) + n * 520));
  });
})();
