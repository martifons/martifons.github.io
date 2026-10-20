// MANE — el fondo es el salón con el sol bajo de la tarde: la pared con tres rectángulos de luz que se alargan
// y se vuelven más naranjas al avanzar, motas de polvo flotando en la luz, el sofá gris, la puerta del pasillo y
// la moqueta de pelo largo, donde van apareciendo las huellas del león desde la puerta hasta el centro. Tocar
// la moqueta deja una huella. Cada prompt está tapado por la cara de un león: hay que acariciarlo cinco veces,
// despacio, hasta que cierra los ojos y se duerme; si se le toca deprisa, se sobresalta y abre los ojos. Al
// copiar, unas huellas se alejan del botón. Las reglas respiran y salen palabra a palabra. Cámara "curl".
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");

  // ---------- el salón ----------
  const cv = document.createElement("canvas");
  cv.id = "room"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  let W, H, dpr, suelo, alfombra = null, motas = [], camino = [];
  const mias = [];

  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = Math.round(innerWidth * dpr); H = cv.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    suelo = H * .64;
    // la moqueta de pelo largo, pintada una vez
    alfombra = document.createElement("canvas"); alfombra.width = W; alfombra.height = Math.ceil(H - suelo);
    const g = alfombra.getContext("2d"), ah = alfombra.height;
    const gr = g.createLinearGradient(0, 0, 0, ah);
    gr.addColorStop(0, "#A8977D"); gr.addColorStop(1, "#8C7A61");
    g.fillStyle = gr; g.fillRect(0, 0, W, ah);
    const tonos = ["#C7B597", "#B4A284", "#9C896E", "#83725B", "#D3C3A6"];
    const n = Math.min(12000, Math.round(W * ah / (26 * dpr * dpr)));
    g.lineCap = "round";
    for (let k = 0; k < n; k++) {
      const x = rnd(0, W), y = rnd(0, ah), cerca = y / ah, L = (2 + 9 * cerca) * dpr;
      g.strokeStyle = tonos[k % tonos.length]; g.lineWidth = (.8 + 1.6 * cerca) * dpr;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + rnd(-2, 2) * dpr, y - L * .6, x + rnd(-3, 3) * dpr, y - L); g.stroke();
    }
    // las motas de polvo en la luz
    motas = [];
    for (let k = 0; k < 46; k++) motas.push({ x: rnd(0, .6) * W, y: rnd(.12, .6) * H, r: rnd(.7, 2.2) * dpr, f: rnd(0, 6.283), v: rnd(.4, 1.2) });
    // el camino del león: de la puerta al centro de la moqueta, en curva
    camino = [];
    for (let k = 0; k < 11; k++) {
      const t = k / 10, x0 = W * .78, y0 = suelo + H * .03, xc = W * .72, yc = H * .86, x1 = W * .44, y1 = H * .88;
      const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * xc + t * t * x1, y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * yc + t * t * y1;
      const lado = k % 2 ? 1 : -1;
      camino.push([x + lado * (6 + 14 * t) * dpr, y, .5 + .9 * ((y - suelo) / (H - suelo))]);
    }
    mias.length = 0;
  };
  tam();
  addEventListener("resize", tam);

  const huella = (x, y, s) => {
    cx.fillStyle = "rgba(70,50,30,.34)";
    const u = 13 * s * dpr;
    cx.beginPath(); cx.ellipse(x, y, u * 1.1, u * .85, 0, 0, 6.283); cx.fill();
    for (const [dx, dy] of [[-1.25, -1.2], [-.45, -1.75], [.45, -1.75], [1.25, -1.2]]) { cx.beginPath(); cx.ellipse(x + dx * u, y + dy * u, u * .38, u * .48, 0, 0, 6.283); cx.fill(); }
  };

  let p = 0, objP = 0, ultimo = 0;
  const pinta = (t) => {
    const dt = Math.min(50, t - (ultimo || t)); ultimo = t;
    p += (objP - p) * (quieto ? 1 : Math.min(1, dt / 900));
    // la pared
    let g = cx.createLinearGradient(0, 0, 0, suelo);
    g.addColorStop(0, "#7E756A"); g.addColorStop(1, "#988E80");
    cx.fillStyle = g; cx.fillRect(0, 0, W, suelo);
    // los tres rectángulos de sol: se alargan, se tumban y se vuelven más naranjas al avanzar
    const c = [255, Math.round(222 - 40 * p), Math.round(168 - 60 * p)];
    cx.globalCompositeOperation = "screen";
    for (let k = 0; k < 3; k++) {
      const x = W * (.04 + .17 * k + .12 * p), w = W * .11, y0 = H * (.18 + .03 * p), y1 = suelo - H * .16, sk = W * (.04 + .1 * p);
      cx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${.6 + .15 * p})`;
      cx.beginPath(); cx.moveTo(x, y0); cx.lineTo(x + w, y0); cx.lineTo(x + w + sk, y1); cx.lineTo(x + sk, y1); cx.closePath(); cx.fill();
    }
    cx.globalCompositeOperation = "source-over";
    // la puerta del pasillo, a la derecha
    cx.fillStyle = "#3A322A"; cx.fillRect(W * .7, suelo - H * .3, W * .16, H * .3);
    cx.strokeStyle = "#CFC6B7"; cx.lineWidth = 4 * dpr; cx.strokeRect(W * .7, suelo - H * .3, W * .16, H * .3);
    // el zócalo y la moqueta
    cx.fillStyle = "#CFC6B7"; cx.fillRect(0, suelo - 3 * dpr, W, 3 * dpr);
    cx.drawImage(alfombra, 0, suelo);
    // el sofá gris, a la izquierda
    cx.fillStyle = "#6F7072";
    const sx = W * .02, sw = W * .62, sy = suelo - H * .13;
    cx.beginPath(); cx.roundRect(sx, sy, sw, H * .13, 14 * dpr); cx.fill();
    cx.fillStyle = "#7E7F82";
    cx.beginPath(); cx.roundRect(sx + sw * .04, sy - H * .06, sw * .92, H * .08, 12 * dpr); cx.fill();
    cx.fillStyle = "#86878A";
    for (let k = 0; k < 2; k++) { cx.beginPath(); cx.roundRect(sx + sw * (.06 + .45 * k), sy + H * .015, sw * .42, H * .05, 10 * dpr); cx.fill(); }
    // las huellas del león, de la puerta al centro, según se avanza; y las que deja el dedo
    const n = Math.round(p * camino.length * 1.05);
    for (let k = 0; k < Math.min(n, camino.length); k++) huella(...camino[k]);
    for (const m of mias) huella(...m);
    // motas de polvo flotando en la luz
    if (!quieto) for (const m of motas) {
      m.x += m.v * .02 * dt * dpr; m.y += Math.sin(t * .001 + m.f) * .05 * dpr;
      if (m.x > W * .75) m.x = 0;
      cx.fillStyle = `rgba(255,228,180,${.35 + .25 * Math.sin(t * .002 + m.f)})`;
      cx.beginPath(); cx.arc(m.x, m.y, m.r, 0, 6.283); cx.fill();
    }
    // la tarde se calienta
    cx.fillStyle = `rgba(255,140,50,${.07 * p})`; cx.fillRect(0, 0, W, H);
  };
  const bucle = (t) => { requestAnimationFrame(bucle); pinta(t); };
  if (quieto) pinta(0); else requestAnimationFrame(bucle);
  addEventListener("resize", () => { if (quieto) pinta(0); });

  addEventListener("flyview", (e) => {
    const { index, total, dir } = e.detail;
    objP = total > 1 ? index / (total - 1) : 0;
    if (dir) zum(dir > 0 ? [6, 40, 6] : 6);
    if (quieto) pinta(0);
  });

  // tocar la moqueta: una huella donde se toca (en la pared no)
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a")) return;
    const y = e.clientY * dpr;
    if (y < suelo) return;
    zum(10);
    mias.push([e.clientX * dpr, y, .5 + .9 * ((y - suelo) / (H - suelo))]);
    if (mias.length > 30) mias.shift();
    if (quieto) pinta(0);
  });

  // ---------- cada prompt, bajo la cara de un león que hay que dormir a caricias ----------
  const PASOS = 5, PRISA = 380;
  document.querySelectorAll(".code").forEach((code) => {
    const caja = document.createElement("div");
    caja.className = "nap on";
    code.replaceWith(caja); caja.appendChild(code);
    caja.insertAdjacentHTML("beforeend", `<div class="lionface" data-nofly role="button" tabindex="0" aria-label="Pat the lion slowly until he falls asleep to reveal the prompt"><div class="face"><span class="eye l"><i></i></span><span class="eye r"><i></i></span><span class="nose"></span><span class="mouth"></span></div><div class="dots">${"<i></i>".repeat(PASOS)}</div><p class="hint"><b>Pat</b> him slowly</p></div>`);
    const cara = caja.querySelector(".lionface"), pista = cara.querySelector(".hint"), puntos = [...cara.querySelectorAll(".dots i")];
    let n = 0, antes = -1e9, hecho = false, ini = null;
    const pon = () => { caja.style.setProperty("--sleep", (n / PASOS).toFixed(2)); puntos.forEach((d, k) => d.classList.toggle("full", k < n)); };
    const golpe = (clase) => { caja.classList.remove("pat", "startle"); void caja.offsetWidth; caja.classList.add(clase); };
    const duerme = () => {
      if (hecho) return;
      hecho = true; n = PASOS; pon(); pista.innerHTML = "<b>Asleep</b>";
      zum([10, 80, 10, 80, 10]);
      if (!quieto) { const z = document.createElement("span"); z.className = "zzz"; z.textContent = "Zzz"; cara.appendChild(z); }
      setTimeout(() => { caja.classList.remove("on"); caja.classList.add("off"); }, quieto ? 0 : 650);
      setTimeout(() => cara.remove(), quieto ? 0 : 1700);
    };
    const acaricia = () => {
      if (hecho) return;
      const ahora = performance.now();
      if (ahora - antes < PRISA && n > 0) {
        // demasiado deprisa: se sobresalta y abre un poco los ojos
        n = Math.max(0, n - 1); antes = ahora; pon(); golpe("startle");
        pista.innerHTML = "<b>Gently</b>, slower"; zum([25, 20, 25]);
        return;
      }
      antes = ahora; n++; pon(); golpe("pat"); zum(8);
      pista.innerHTML = n < PASOS - 1 ? "<b>Again</b>, slowly" : "<b>One more</b>";
      if (n >= PASOS) duerme();
    };
    cara.addEventListener("pointerdown", (e) => { try { cara.setPointerCapture(e.pointerId); } catch {} ini = [e.clientX, e.clientY]; });
    cara.addEventListener("pointerup", () => { if (!ini) return; ini = null; acaricia(); });   // un toque o una caricia larga cuentan igual
    cara.addEventListener("pointercancel", () => { ini = null; });
    cara.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); acaricia(); } });
    caja.parentElement.querySelector(".cp")?.addEventListener("click", duerme);
  });

  // al copiar: unas huellas que se alejan del botón en zigzag
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    zum([8, 30, 8]);
    if (quieto) return;
    const r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top;
    for (let k = 0; k < 6; k++) {
      const s = document.createElement("span");
      s.className = "paw"; s.textContent = "🐾";
      s.style.cssText = `left:${x + (k % 2 ? 14 : -14) - k * 6}px;top:${y - 18 - k * 30}px;--r:${-20 + (k % 2 ? 10 : -10)}deg;animation-delay:${k * 160}ms`;
      document.body.appendChild(s); s.addEventListener("animationend", () => s.remove());
    }
  }));

  // ---------- reglas: respiran y salen palabra a palabra ----------
  const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((s) => {
    let i = 0;
    s.querySelectorAll("h3, p:not(.k)").forEach((el) => {
      el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w" style="--i:${i++}">${esc(w)}</span>`).join(" ");
    });
    s.setAttribute("role", "button"); s.tabIndex = 0;
    s._despierta = () => { s.classList.remove("awake"); void s.offsetWidth; s.classList.add("awake"); zum([6, 50, 6]); };
    s.addEventListener("click", s._despierta);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); s._despierta(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s) && !s._vista)
      .forEach((s, n) => { s._vista = true; setTimeout(s._despierta, (quieto ? 0 : 600) + n * 350); });
  });
})();
