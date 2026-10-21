// TSUNAMI — el fondo es el mar visto desde la azotea: un muro de agua turquesa oscura que crece en el horizonte
// y se traga el muelle; al avanzar, la azotea (con el vaso de té) cae hacia abajo porque despegamos, la cresta se
// curva por encima y al final pasa por debajo. A la izquierda, un altímetro: nuestra altura en lima y la de la
// ola en rojo; al final la nuestra la supera. Tocar el mar levanta espuma. Cada prompt está bajo la azotea: hay
// que apretar los dos mandos alternando izquierda y derecha (repetir el mismo lado petardea) hasta llenar el
// empuje y despegar. Al copiar saltan cubitos de hielo. Las reglas están bajo el agua y se vacían. Cámara
// "barrel".
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");

  // ---------- el mar ----------
  const cv = document.createElement("canvas");
  cv.id = "sea"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  let W, H, dpr, espuma = [], rayas = [];
  const gotas = [];

  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = Math.round(innerWidth * dpr); H = cv.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    // los copos de espuma a lo largo de la cresta y las rayas de espuma del mar
    espuma = []; for (let k = 0; k < 70; k++) espuma.push({ x: rnd(0, 1), r: rnd(.008, .03), dy: rnd(-.02, .015), f: rnd(0, 6.283) });
    rayas = []; for (let k = 0; k < 40; k++) rayas.push({ x: rnd(0, 1), y: rnd(0, 1), w: rnd(.04, .16), f: rnd(0, 6.283) });
    gotas.length = 0;
  };
  tam();
  addEventListener("resize", tam);

  const altimetro = (yo, ola) => {
    const x = 14 * dpr, y0 = H * .26, y1 = H * .74, m = (v) => y1 - (y1 - y0) * v / 80;
    cx.strokeStyle = "rgba(230,245,245,.55)"; cx.lineWidth = 1.5 * dpr;
    cx.beginPath(); cx.moveTo(x, y0); cx.lineTo(x, y1); cx.stroke();
    cx.font = `700 ${9 * dpr}px ui-monospace, Menlo, monospace`; cx.fillStyle = "rgba(230,245,245,.6)";
    for (let v = 0; v <= 80; v += 10) { const y = m(v); cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x + (v % 20 ? 4 : 8) * dpr, y); cx.stroke(); if (v % 20 === 0) cx.fillText(v + "m", x + 11 * dpr, y + 3 * dpr); }
    for (const [v, col, txt] of [[ola, "#FF2A1F", "WAVE"], [yo, "#CCFF00", "YOU"]]) {
      const y = m(v); cx.fillStyle = col;
      cx.beginPath(); cx.moveTo(x - 2 * dpr, y); cx.lineTo(x + 9 * dpr, y - 5 * dpr); cx.lineTo(x + 9 * dpr, y + 5 * dpr); cx.closePath(); cx.fill();
      cx.fillText(txt + " " + Math.round(v), x + 12 * dpr, y + 3 * dpr);
    }
  };

  let p = 0, objP = 0, ultimo = 0;
  const pinta = (t) => {
    const dt = Math.min(50, t - (ultimo || t)); ultimo = t;
    p += (objP - p) * (quieto ? 1 : Math.min(1, dt / 900));
    const sube = Math.max(0, Math.min(1, (p - .5) / .5));
    const yh = H * (.34 + .16 * sube);
    // el cielo
    let g = cx.createLinearGradient(0, 0, 0, yh);
    g.addColorStop(0, "#9AA2A6"); g.addColorStop(1, "#C9CDCD");
    cx.fillStyle = g; cx.fillRect(0, 0, W, yh + 1);
    // el mar y sus rayas de espuma
    g = cx.createLinearGradient(0, yh, 0, H);
    g.addColorStop(0, "#4E6E70"); g.addColorStop(1, "#24474B");
    cx.fillStyle = g; cx.fillRect(0, yh, W, H - yh);
    cx.strokeStyle = "rgba(230,245,242,.35)"; cx.lineWidth = 1.5 * dpr;
    for (const r of rayas) {
      const y = yh + (H - yh) * r.y, x = ((r.x + t * .00002 * (1 + r.y)) % 1.2 - .1) * W, w = r.w * W * (.4 + r.y);
      cx.beginPath(); cx.moveTo(x, y); cx.quadraticCurveTo(x + w / 2, y - 3 * dpr * Math.sin(t * .002 + r.f), x + w, y); cx.stroke();
    }
    // el muelle, que el muro se traga
    cx.strokeStyle = "#3C3530"; cx.lineWidth = 3 * dpr;
    cx.beginPath(); cx.moveTo(W * .04, yh + H * .08); cx.lineTo(W * .58, yh + H * .035); cx.stroke();
    // el tsunami: crece, se curva encima y al final pasa por debajo
    const alto = p < .75 ? H * (.015 + .345 * Math.pow(p / .75, 1.4)) : H * .36;
    const cresta = p < .75 ? yh - alto : yh - alto + (p - .75) / .25 * H * 1.15;
    const base = Math.max(cresta + H * .02, yh + H * (.01 + .07 * Math.min(1, p / .75)) + (p > .75 ? (p - .75) / .25 * H : 0));
    g = cx.createLinearGradient(0, cresta, 0, base);
    g.addColorStop(0, "#2E8C8E"); g.addColorStop(.3, "#16595D"); g.addColorStop(1, "#0D3E43");
    cx.fillStyle = g;
    cx.beginPath(); cx.moveTo(0, base);
    for (let i = 0, x = 0; i <= 24; i++, x = W * i / 24) cx.lineTo(x, cresta + Math.sin(x / W * 6 + t * .0015) * H * .006);
    cx.lineTo(W, base); cx.closePath(); cx.fill();
    // el labio que se curva hacia nosotros
    const curva = Math.min(1, p / .7) * H * .05;
    if (curva > 1) {
      cx.fillStyle = "rgba(60,170,168,.75)";
      cx.beginPath(); cx.moveTo(0, cresta);
      for (let i = 0, x = 0; i <= 24; i++, x = W * i / 24) cx.lineTo(x, cresta + Math.sin(x / W * 6 + t * .0015) * H * .006);
      for (let i = 24, x = W; i >= 0; i--, x = W * i / 24) cx.lineTo(x, cresta + curva + Math.sin(x / W * 5 + t * .002) * curva * .3);
      cx.closePath(); cx.fill();
    }
    // la espuma de la cresta
    cx.fillStyle = "rgba(240,250,250,.9)";
    for (const e of espuma) {
      const x = e.x * W, y = cresta + e.dy * H + Math.sin(t * .003 + e.f) * 2 * dpr, r = e.r * H * .6 * (.25 + .75 * Math.min(1, p / .7));
      cx.beginPath(); cx.arc(x, y, r, 0, 6.283); cx.fill();
    }
    // la azotea con el vaso: cae hacia abajo al despegar
    const techo = H * (.72 + .55 * sube);
    if (techo < H) {
      g = cx.createLinearGradient(0, techo, 0, H);
      g.addColorStop(0, "#A6A49C"); g.addColorStop(1, "#7F7D77");
      cx.fillStyle = g; cx.fillRect(0, techo, W, H - techo);
      cx.fillStyle = "#8E8C85"; cx.fillRect(0, techo - 10 * dpr, W, 10 * dpr);
      const vx = W * .5, vy = techo + H * .1, s = dpr * (1 - .5 * sube);
      cx.fillStyle = "#B8662A"; cx.fillRect(vx - 12 * s, vy - 30 * s, 24 * s, 30 * s);
      cx.strokeStyle = "rgba(255,255,255,.7)"; cx.lineWidth = 2 * s; cx.strokeRect(vx - 12 * s, vy - 36 * s, 24 * s, 36 * s);
    }
    // la espuma que salta (toques y, al final, la cresta)
    if (!quieto && p > .62 && p < .95 && Math.random() < .5) gotas.push({ x: rnd(0, W), y: cresta, vx: rnd(-1, 1) * W * .05, vy: -rnd(.1, .4) * H, r: rnd(1.5, 4) * dpr, v: 1 });
    cx.fillStyle = "rgba(240,250,250,.85)";
    for (let k = gotas.length - 1; k >= 0; k--) {
      const d = gotas[k], s = dt / 1000;
      d.vy += H * 1.1 * s; d.x += d.vx * s; d.y += d.vy * s; d.v -= s * .8;
      if (d.v <= 0 || d.y > H) { gotas.splice(k, 1); continue; }
      cx.globalAlpha = d.v; cx.beginPath(); cx.arc(d.x, d.y, d.r, 0, 6.283); cx.fill(); cx.globalAlpha = 1;
    }
    altimetro(10 + 65 * sube, 12 + 48 * Math.min(1, p / .7));
  };
  const bucle = (t) => { requestAnimationFrame(bucle); pinta(t); };
  if (quieto) pinta(0); else requestAnimationFrame(bucle);
  addEventListener("resize", () => { if (quieto) pinta(0); });

  addEventListener("flyview", (e) => {
    const { index, total, dir } = e.detail;
    objP = total > 1 ? index / (total - 1) : 0;
    if (dir) zum(dir > 0 ? [10, 20, 10] : 8);
    if (quieto) pinta(0);
  });

  // tocar el mar: un golpe de espuma
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a")) return;
    zum([12, 24, 12]);
    if (quieto) return;
    for (let k = 0; k < 40; k++) gotas.push({ x: e.clientX * dpr, y: e.clientY * dpr, vx: rnd(-1, 1) * W * .15, vy: -rnd(.2, .7) * H, r: rnd(1.5, 4.5) * dpr, v: 1 });
  });

  // ---------- cada prompt, bajo la azotea: los mandos, alternando, hasta despegar ----------
  const PASO = .19;   // seis apretones alternos despegan, aunque se pierda algo de empuje entre uno y otro
  document.querySelectorAll(".code").forEach((code) => {
    const caja = document.createElement("div");
    caja.className = "roof on";
    code.replaceWith(caja); caja.appendChild(code);
    caja.insertAdjacentHTML("beforeend", `<div class="deck" data-nofly><i class="crack"></i><span class="glass"><i></i><i></i><i></i></span><span class="lbl">THRUST</span><span class="thrust"><i></i></span><p class="hint">Press <b>left</b>, then right</p><button class="grip l" type="button" aria-label="Left grip"><b></b></button><button class="grip r" type="button" aria-label="Right grip"><b></b></button></div>`);
    const deck = caja.querySelector(".deck"), pista = deck.querySelector(".hint");
    let empuje = 0, ultimoLado = null, hecho = false, antes = 0, corre = false;
    const pon = () => caja.style.setProperty("--thrust", empuje.toFixed(3));
    const despega = () => {
      if (hecho) return;
      hecho = true; empuje = 1; pon();
      pista.innerHTML = "<b>Liftoff</b>";
      zum([30, 20, 60, 20, 90]);
      setTimeout(() => { caja.classList.remove("on"); caja.classList.add("off"); }, quieto ? 0 : 250);
      setTimeout(() => deck.remove(), quieto ? 0 : 1300);
    };
    // el empuje se va perdiendo si se deja de apretar
    const decae = (t) => {
      const dt = Math.min(60, t - (antes || t)) / 1000; antes = t;
      if (hecho) { corre = false; return; }
      empuje = Math.max(0, empuje - dt * .06); pon();
      if (empuje > 0) requestAnimationFrame(decae); else { corre = false; antes = 0; }
    };
    const aprieta = (lado) => {
      if (hecho) return;
      const boton = deck.querySelector(".grip." + lado);
      boton.classList.add("down"); setTimeout(() => boton.classList.remove("down"), 120);
      if (lado === ultimoLado) {
        // el mismo lado dos veces: petardea, no empuja
        caja.classList.remove("shake"); void caja.offsetWidth; caja.classList.add("shake");
        pista.innerHTML = `Now the <b>${lado === "l" ? "right" : "left"}</b> one`;
        zum([20, 15, 20]);
        return;
      }
      ultimoLado = lado; empuje = Math.min(1, empuje + PASO); pon(); zum(10);
      pista.innerHTML = `Now the <b>${lado === "l" ? "right" : "left"}</b> one`;
      if (empuje >= .999) { despega(); return; }
      if (!corre && !quieto) { corre = true; antes = 0; requestAnimationFrame(decae); }
    };
    deck.querySelectorAll(".grip").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); aprieta(b.classList.contains("l") ? "l" : "r"); }));
    deck.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); aprieta("l"); }
      else if (e.key === "ArrowRight") { e.preventDefault(); aprieta("r"); }
    });
    caja.parentElement.querySelector(".cp")?.addEventListener("click", despega);
  });

  // al copiar: saltan cubitos de hielo del botón
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    zum([6, 20, 6, 20, 6]);
    if (quieto) return;
    const r = b.getBoundingClientRect();
    for (let k = 0; k < 7; k++) {
      const c = document.createElement("i");
      c.className = "cube";
      c.style.cssText = `left:${r.left + r.width / 2 + rnd(-r.width * .3, r.width * .3)}px;top:${r.top}px;--dx:${rnd(-80, 80).toFixed(0)}px;--r:${rnd(-240, 240).toFixed(0)}deg;animation-delay:${k * 40}ms`;
      document.body.appendChild(c); c.addEventListener("animationend", () => c.remove());
    }
  }));

  // ---------- reglas: bajo el agua, que se vacía ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((s) => {
    s.insertAdjacentHTML("beforeend", `<i class="flood" aria-hidden="true"></i>`);
    s.classList.add("under");
    s.setAttribute("role", "button"); s.tabIndex = 0;
    s._vacia = () => {
      s.classList.remove("drained"); void s.offsetWidth;
      s.classList.add("drained"); s.classList.remove("under");
      zum([8, 40, 8]);
    };
    s.addEventListener("click", s._vacia);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); s._vacia(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s) && !s._vista)
      .forEach((s, n) => { s._vista = true; setTimeout(s._vacia, (quieto ? 0 : 700) + n * 400); });
  });
})();
