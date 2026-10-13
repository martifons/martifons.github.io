// OCTOPUS — el fondo es el casco blanco del crucero, con el mar abajo; dos tentáculos suben por los
// bordes a medida que se avanza, cubierta a cubierta. Tocar el casco suelta una nube de tinta. Cada
// prompt lo tiene agarrado un tentáculo: se revientan sus ventosas una a una hasta que se suelta.
// Copiar deja la marca de una ventosa. Las reglas están tras un párpado que se abre, como el ojo del
// pulpo. Cámara en zigzag hacia arriba (fly "climb").
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");

  // ---------- el mar, los tentáculos y la tinta ----------
  const cv = document.createElement("canvas");
  cv.id = "hull"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  let W, H, dpr;
  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = Math.round(innerWidth * dpr); H = cv.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
  };
  tam();
  let alto = .28, objAlto = .28;      // hasta dónde llegan los tentáculos (fracción de la pantalla)
  const tintas = [];
  // un tentáculo: círculos que adelgazan a lo largo de una curva que ondula, con ventosas en un lado
  const tentaculo = (x0, lado, largo, t, fase) => {
    const n = 46, base = Math.min(W, H) * .07, suelo = H * .9;
    const pts = [];
    for (let k = 0; k <= n; k++) {
      const f = k / n, y = suelo - f * largo;
      const x = x0 + lado * (Math.sin(f * 4 + t * .0012 + fase) * Math.min(W, H) * .035 * f + f * f * Math.min(W, H) * .05);
      pts.push([x, y, base * (1 - f * .88)]);
    }
    for (const [x, y, r] of pts) {
      const g = cx.createRadialGradient(x - r * .3 * lado, y - r * .3, r * .1, x, y, r);
      g.addColorStop(0, "#B45A40"); g.addColorStop(.7, "#7E3324"); g.addColorStop(1, "#4F1E15");
      cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, r, 0, 6.283); cx.fill();
    }
    // ventosas, del lado de dentro
    for (let k = 2; k < n; k += 3) {
      const [x, y, r] = pts[k];
      cx.fillStyle = "#E9C3A6"; cx.beginPath(); cx.arc(x - lado * r * .55, y, r * .32, 0, 6.283); cx.fill();
      cx.fillStyle = "rgba(120,60,45,.55)"; cx.beginPath(); cx.arc(x - lado * r * .55, y, r * .14, 0, 6.283); cx.fill();
    }
  };
  const pinta = (t) => {
    alto += (objAlto - alto) * (quieto ? 1 : .03);
    cx.clearRect(0, 0, W, H);
    // tentáculos por los bordes
    const L = H * alto;
    tentaculo(W * .04, 1, L, t, 0);
    tentaculo(W * .96, -1, L * .82, t, 2.1);
    // el mar al pie del casco, con la ola de proa
    const mar = H * .9;
    const g = cx.createLinearGradient(0, mar, 0, H);
    g.addColorStop(0, "#2C6E73"); g.addColorStop(1, "#123A40");
    cx.fillStyle = g; cx.beginPath(); cx.moveTo(0, H);
    for (let x = 0; x <= W; x += 12 * dpr) cx.lineTo(x, mar + Math.sin(x / (40 * dpr) + t * .002) * 5 * dpr + Math.sin(x / (17 * dpr) - t * .003) * 3 * dpr);
    cx.lineTo(W, H); cx.fill();
    cx.strokeStyle = "rgba(255,255,255,.7)"; cx.lineWidth = 2.5 * dpr; cx.beginPath();
    for (let x = 0; x <= W; x += 12 * dpr) { const y = mar + Math.sin(x / (40 * dpr) + t * .002) * 5 * dpr + Math.sin(x / (17 * dpr) - t * .003) * 3 * dpr; x ? cx.lineTo(x, y) : cx.moveTo(x, y); }
    cx.stroke();
    // nubes de tinta
    for (let k = tintas.length - 1; k >= 0; k--) {
      const n = tintas[k]; n.r += (n.R - n.r) * .06; n.vida -= .006;
      if (n.vida <= 0) { tintas.splice(k, 1); continue; }
      for (const b of n.bolas) {
        const x = n.x + b[0] * n.r, y = n.y + b[1] * n.r, r = b[2] * n.r;
        const q = cx.createRadialGradient(x, y, 0, x, y, r);
        q.addColorStop(0, `rgba(28,14,32,${.85 * n.vida})`); q.addColorStop(1, "rgba(28,14,32,0)");
        cx.fillStyle = q; cx.fillRect(x - r, y - r, r * 2, r * 2);
      }
    }
  };
  const bucle = (t) => { pinta(t); requestAnimationFrame(bucle); };
  if (quieto) pinta(0); else requestAnimationFrame(bucle);
  addEventListener("resize", () => { tam(); if (quieto) pinta(0); });

  // tocar el casco: el pulpo suelta tinta
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a")) return;
    tintas.push({ x: e.clientX * dpr, y: e.clientY * dpr, r: 4 * dpr, R: rnd(60, 95) * dpr, vida: 1, bolas: Array.from({ length: 7 }, () => [rnd(-.6, .6), rnd(-.6, .6), rnd(.4, .8)]) });
    if (tintas.length > 6) tintas.shift();
    zum([25, 15, 25]);
  });

  // al avanzar, los tentáculos suben una cubierta más
  addEventListener("flyview", (e) => {
    const p = e.detail.total > 1 ? e.detail.index / (e.detail.total - 1) : 0;
    objAlto = .28 + p * .55;
    if (e.detail.dir) setTimeout(() => zum([14, 30, 14]), quieto ? 0 : 900);
  });

  // ---------- cada prompt, agarrado por un tentáculo: revienta sus ventosas ----------
  const NV = 6, BASTA = 4;
  document.querySelectorAll(".code").forEach((code) => {
    const caja = document.createElement("div");
    caja.className = "grip held";
    code.replaceWith(caja); caja.appendChild(code);
    const brazo = document.createElement("div");
    brazo.className = "arm";
    for (let k = 0; k < NV; k++) brazo.insertAdjacentHTML("beforeend", `<button class="sucker" type="button" aria-label="Pop sucker ${k + 1} of ${NV}" style="--k:${k}"></button>`);
    caja.appendChild(brazo);
    caja.insertAdjacentHTML("beforeend", `<span class="pop-hint" aria-hidden="true">Pop the suckers</span>`);
    let rotas = 0, libre = false;
    const suelta = () => {
      if (libre) return;
      libre = true;
      caja.classList.add("free"); caja.classList.remove("held");
      zum([20, 30, 40]);
      setTimeout(() => { brazo.remove(); caja.querySelector(".pop-hint")?.remove(); }, 900);
    };
    brazo.querySelectorAll(".sucker").forEach((s) => s.addEventListener("click", () => {
      if (libre || s.classList.contains("popped")) return;
      s.classList.add("popped"); rotas++; zum(12);
      brazo.style.setProperty("--loose", rotas / BASTA);
      if (rotas >= BASTA) suelta();
    }));
    // tocar el brazo fuera de las ventosas revienta la siguiente
    brazo.addEventListener("click", (e) => { if (e.target === brazo) brazo.querySelector(".sucker:not(.popped)")?.click(); });
    caja.parentElement.querySelector(".cp")?.addEventListener("click", () => { if (!libre) suelta(); });
  });

  // al copiar: la marca redonda de una ventosa sobre el botón
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    zum([10, 20, 10]);
    if (quieto) return;
    const r = b.getBoundingClientRect(), m = document.createElement("i");
    m.className = "suckmark"; m.style.left = r.left + r.width * rnd(.25, .75) + "px"; m.style.top = r.top + r.height / 2 + "px";
    document.body.appendChild(m); m.addEventListener("animationend", () => m.remove());
  }));

  // ---------- reglas: detrás de un párpado ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((s) => {
    s.insertAdjacentHTML("beforeend", `<i class="lid up" aria-hidden="true"></i><i class="lid down" aria-hidden="true"></i><div class="hint">Tap to open the eye</div>`);
    s.setAttribute("role", "button"); s.tabIndex = 0;
    s._abre = () => {
      const abierto = !s.classList.contains("awake");
      s.classList.toggle("awake", abierto); s.setAttribute("aria-expanded", abierto);
      zum(abierto ? [10, 40, 10] : 10);
    };
    s.addEventListener("click", s._abre);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); s._abre(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s) && !s.classList.contains("awake"))
      .forEach((s, n) => setTimeout(() => { if (!s.classList.contains("awake")) s._abre(); }, (quieto ? 0 : 1250) + n * 480));
  });
})();
