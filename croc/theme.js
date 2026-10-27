// CROC — el fondo es un río africano a la hora dorada visto desde la otra orilla: cielo cálido, el sol que baja al
// avanzar, acacias de copa plana a lo lejos, cañizos en las orillas y el agua parda con brillos que tiemblan. De vez en
// cuando, y donde se toca el río, asoman los ojos y las fosas nasales de un cocodrilo con sus ondas, y se vuelven a
// hundir. Cada prompt está detrás de una cabeza de cocodrilo con la boca abierta que se va cerrando sola: hay que tocar
// los cinco restos que tiene entre los dientes (el chorlito salta a cada uno y lo picotea) antes de que se cierre; si
// se cierra antes, el pájaro sale volando, la boca chasquea y vuelve a abrirse. Al terminar, el pájaro sale, la boca
// chasquea sobre nada y el pájaro se posa en la cabeza. Al copiar, el botón da un bocado. Las reglas se limpian a
// picotazos. Cámara "jaws".
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");

  // ---------- el río ----------
  const cv = document.createElement("canvas");
  cv.id = "river"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  let W, H, dpr, fondo = null, brillos = [], agua = 0;
  const ojos = [];

  const acacia = (c, x, base, h) => {
    c.strokeStyle = c.fillStyle = "rgba(70,66,44,.75)"; c.lineWidth = Math.max(1, h * .05);
    c.beginPath(); c.moveTo(x, base); c.lineTo(x + h * .05, base - h * .7); c.stroke();
    c.beginPath(); c.ellipse(x + h * .05, base - h * .78, h * .55, h * .12, 0, 0, 6.283); c.fill();
    c.beginPath(); c.ellipse(x + h * .3, base - h * .72, h * .3, h * .08, 0, 0, 6.283); c.fill();
  };
  const canizo = (c, x0, x1, base, alto, n) => {
    c.strokeStyle = "rgba(120,118,64,.85)"; c.lineWidth = Math.max(1, dpr);
    for (let k = 0; k < n; k++) { const x = rnd(x0, x1), h = alto * rnd(.4, 1); c.beginPath(); c.moveTo(x, base); c.quadraticCurveTo(x + rnd(-6, 6) * dpr, base - h * .6, x + rnd(-10, 10) * dpr, base - h); c.stroke(); }
  };
  const pintaFondo = () => {
    fondo = document.createElement("canvas"); fondo.width = W; fondo.height = H;
    const c = fondo.getContext("2d");
    agua = H * .56;
    // la orilla de enfrente, las acacias y los cañizos (el cielo se pinta cada fotograma)
    c.fillStyle = "#9C8A5A"; c.fillRect(0, agua - H * .05, W, H * .05);
    for (let k = 0; k < 7; k++) acacia(c, rnd(0, W), agua - H * .045, H * rnd(.08, .15));
    canizo(c, 0, W * .35, agua, H * .1, 140); canizo(c, W * .6, W, agua, H * .09, 120);
    // el agua
    const g = c.createLinearGradient(0, agua, 0, H);
    g.addColorStop(0, "#9A8664"); g.addColorStop(1, "#5E5040");
    c.fillStyle = g; c.fillRect(0, agua, W, H - agua);
    brillos = []; for (let k = 0; k < 70; k++) brillos.push({ x: rnd(0, 1), y: rnd(0, 1), w: rnd(.02, .08), f: rnd(0, 6) });
  };
  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = Math.round(innerWidth * dpr); H = cv.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    pintaFondo();
    ojos.length = 0;
  };
  tam();
  addEventListener("resize", tam);

  // unos ojos de cocodrilo que asoman, miran y se hunden en 2,8 s
  const asoma = (x, y, t) => ojos.push({ x, y: Math.max(agua + 20 * dpr, y), t0: t, s: (.6 + .8 * (Math.max(agua, y) - agua) / (H - agua)) * dpr });
  const pintaOjos = (o, t) => {
    const e = (t - o.t0) / 2800; if (e < 0 || e > 1) return e <= 1;
    const a = Math.min(1, Math.sin(e * Math.PI) * 1.6), sube = Math.sin(e * Math.PI) * 4 * o.s;
    cx.save(); cx.translate(o.x, o.y - sube); cx.globalAlpha = a;
    cx.fillStyle = "#4E5034";
    for (const dx of [-14, 14]) { cx.beginPath(); cx.ellipse(dx * o.s, 0, 9 * o.s, 6 * o.s, 0, Math.PI, 0); cx.fill(); }
    cx.fillStyle = "#D8C24A"; for (const dx of [-14, 14]) { cx.beginPath(); cx.ellipse(dx * o.s, -2 * o.s, 3 * o.s, 2 * o.s, 0, 0, 6.283); cx.fill(); }
    cx.fillStyle = "#1A1A10"; for (const dx of [-14, 14]) { cx.fillRect(dx * o.s - .6 * o.s, -3.6 * o.s, 1.2 * o.s, 3.2 * o.s); }
    cx.fillStyle = "#4E5034"; for (const dx of [-5, 5]) { cx.beginPath(); cx.ellipse(dx * o.s, 26 * o.s, 3 * o.s, 2 * o.s, 0, Math.PI, 0); cx.fill(); }
    cx.strokeStyle = `rgba(255,240,210,${(.5 * a).toFixed(2)})`; cx.lineWidth = 1.5 * dpr;
    for (const r of [1, 1.6]) { cx.beginPath(); cx.ellipse(0, 4 * o.s, (30 + e * 30) * r * o.s, (8 + e * 8) * r * o.s, 0, 0, 6.283); cx.stroke(); }
    cx.restore();
    return true;
  };

  let p = 0, objP = 0, ultimo = 0, proximo = 3000;
  const pinta = (t) => {
    const dt = Math.min(50, t - (ultimo || t)); ultimo = t;
    p += (objP - p) * (quieto ? 1 : Math.min(1, dt / 900));
    // el cielo: de dorado a naranja de atardecer, y el sol que baja
    const g = cx.createLinearGradient(0, 0, 0, agua);
    g.addColorStop(0, `rgb(${Math.round(243 - 10 * p)},${Math.round(214 - 60 * p)},${Math.round(160 - 70 * p)})`);
    g.addColorStop(1, `rgb(${Math.round(250 - 5 * p)},${Math.round(226 - 50 * p)},${Math.round(180 - 70 * p)})`);
    cx.fillStyle = g; cx.fillRect(0, 0, W, agua);
    const sy = agua * (.45 + .45 * p);
    cx.fillStyle = `rgba(255,${Math.round(230 - 60 * p)},${Math.round(150 - 60 * p)},.9)`; cx.beginPath(); cx.arc(W * .7, sy, Math.min(W, H) * .06, 0, 6.283); cx.fill();
    cx.drawImage(fondo, 0, 0);
    // brillos del agua que tiemblan, y el reflejo del sol
    cx.strokeStyle = "rgba(255,236,190,.28)"; cx.lineWidth = 1.5 * dpr;
    for (const b of brillos) {
      const y = agua + (H - agua) * b.y, x = ((b.x + Math.sin(t * .0004 + b.f) * .01) % 1) * W, w = b.w * W * (.4 + b.y);
      cx.globalAlpha = .5 + .5 * Math.sin(t * .003 + b.f * 3); cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x + w, y); cx.stroke();
    }
    cx.globalAlpha = 1;
    cx.fillStyle = "rgba(255,210,140,.18)"; cx.fillRect(W * .7 - W * .05, agua, W * .1, H - agua);
    // ojos de cocodrilo: uno de vez en cuando y donde se toque
    if (!quieto) { proximo -= dt; if (proximo <= 0) { asoma(rnd(.1, .9) * W, agua + rnd(.15, .7) * (H - agua), t); proximo = rnd(5000, 9000); } }
    for (let k = ojos.length - 1; k >= 0; k--) if (!pintaOjos(ojos[k], t)) ojos.splice(k, 1);
  };
  const bucle = (t) => { requestAnimationFrame(bucle); pinta(t); };
  if (quieto) pinta(0); else requestAnimationFrame(bucle);
  addEventListener("resize", () => { if (quieto) pinta(0); });

  addEventListener("flyview", (e) => {
    const { index, total, dir } = e.detail;
    objP = total > 1 ? index / (total - 1) : 0;
    if (dir) zum(dir > 0 ? [10, 30, 6] : 6);
    if (quieto) pinta(0);
  });

  // tocar el río: asoma un cocodrilo
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a")) return;
    zum(10);
    if (!quieto) asoma(e.clientX * dpr, e.clientY * dpr, performance.now());
  });

  // ---------- cada prompt, detrás de la boca: limpia cinco restos antes de que se cierre ----------
  const RESTOS = [[72, 127, 0], [118, 126, 0], [168, 126, 0], [96, 121, 1], [150, 120, 1]];
  const dientes = (y, x0, x1, abajo) => { let s = ""; for (let x = x0; x < x1; x += 11) s += `M${x} ${y}l4 ${abajo ? 7 : -7}l4 ${abajo ? -7 : 7}`; return s; };
  const CABEZA = `<svg class="head" viewBox="0 0 300 200" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
    <rect x="0" y="150" width="300" height="50" fill="#6E5E46"/>
    <path d="M236 98Q270 90 300 102V158H236Z" fill="#5E5D3C"/><path d="M246 100v54M262 98v58M278 98v58M294 100v58" stroke="#4A4A2E" stroke-width="2"/>
    <path d="M240 126L48 128Q24 130 24 142Q30 152 62 151L240 152Z" fill="#6B6A44"/>
    <path d="M232 125L50 127Q42 128 46 132L232 134Z" fill="#E9B9A0"/>
    <path d="${dientes(129, 52, 226, false)}" fill="#F3E6C2"/>
    <g class="upper">
      <path d="M246 126L46 123Q22 121 22 111Q26 99 62 99L182 91Q230 84 252 100Z" fill="#6B6A44"/>
      <path d="M236 124L54 121Q46 120 48 117L236 118Z" fill="#D9A48C"/>
      <path d="${dientes(122, 54, 226, true)}" fill="#F3E6C2"/>
      <path d="M70 104h20M100 100h22M134 96h22M168 93h20" stroke="#55542F" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="34" cy="104" r="5" fill="#5E5D3C"/><circle cx="34" cy="103" r="1.6" fill="#1A1A10"/>
      <ellipse cx="206" cy="88" rx="11" ry="8" fill="#5E5D3C"/><ellipse cx="203" cy="87" rx="5" ry="3.6" fill="#D8C24A"/><rect x="202.4" y="84" width="1.4" height="6" fill="#1A1A10"/>
      ${RESTOS.filter((r) => r[2]).map((r, k) => `<g class="bit" data-i="${3 + k}"><circle cx="${r[0]}" cy="${r[1]}" r="4.5" fill="#4A3826"/><circle cx="${r[0] - 1.4}" cy="${r[1] - 1.4}" r="1.4" fill="#8A6A44"/></g>`).join("")}
    </g>
    ${RESTOS.filter((r) => !r[2]).map((r, k) => `<g class="bit" data-i="${k}"><circle cx="${r[0]}" cy="${r[1]}" r="4.5" fill="#4A3826"/><circle cx="${r[0] - 1.4}" cy="${r[1] - 1.4}" r="1.4" fill="#8A6A44"/></g>`).join("")}
    <g class="plover">
      <path d="M-2 0v-6M3 0v-6" stroke="#8A8A8A" stroke-width="1.4"/>
      <path d="M11-12l7-3-1 5Z" fill="#2A2A2A"/>
      <ellipse cx="2" cy="-11" rx="10" ry="6" fill="#8FA3B5"/>
      <ellipse cx="-1" cy="-8" rx="7" ry="3.6" fill="#F2C9A0"/>
      <path d="M-8-13q4 3 8 0" stroke="#141414" stroke-width="2" fill="none"/>
      <g class="cab"><circle cx="-7" cy="-17" r="4.6" fill="#FFFFFF"/><path d="M-11.5-18.5q4-5 9-1.5l-1 1.6q-3-2-7 0Z" fill="#141414"/><path d="M-11-16.6h6" stroke="#141414" stroke-width="1.6"/></g>
      <path class="pico" d="M-11-17l-5 1 5 1Z" fill="#222"/>
    </g>
  </svg>`;
  document.querySelectorAll(".code").forEach((code) => {
    const caja = document.createElement("div");
    caja.className = "mouth on";
    code.replaceWith(caja); caja.appendChild(code);
    caja.insertAdjacentHTML("beforeend", `<div class="bank" data-nofly role="button" tabindex="0" aria-label="Tap the five bits between the crocodile's teeth before the jaw closes to reveal the prompt">${CABEZA}<p class="count">Teeth: <b>0</b> / 5</p><p class="cue">Tap the bits before it closes</p></div>`);
    const orilla = caja.querySelector(".bank"), arriba = orilla.querySelector(".upper"), pajaro = orilla.querySelector(".plover");
    const cuenta = orilla.querySelector(".count b"), aviso = orilla.querySelector(".cue");
    const restos = [...orilla.querySelectorAll(".bit")].sort((a, b) => a.dataset.i - b.dataset.i);
    const ABIERTA = 26, TARDA = 7000;
    let quedan = new Set(restos), angulo = ABIERTA, cerrando = 0, antes = 0, hecho = false, parado = false;
    const pon = (a) => { angulo = a; arriba.style.transform = `rotate(${a.toFixed(2)}deg)`; };
    const ave = (x, y, extra = "") => { pajaro.style.transform = `translate(${x}px,${y}px)${extra}`; };
    const di = (txt, mal) => { aviso.textContent = txt; aviso.classList.toggle("bad", !!mal); };
    const ola = () => { if (quieto) return; const o = document.createElement("i"); o.className = "ola"; orilla.appendChild(o); o.addEventListener("animationend", () => o.remove()); };
    ave(130, 128);
    const abre = () => {
      if (caja.classList.contains("off")) return;
      hecho = true; caja.classList.remove("on"); caja.classList.add("off");
      zum([15, 30, 50]);
      setTimeout(() => orilla.remove(), quieto ? 0 : 1100);
    };
    // el pájaro sale volando y la boca chasquea; si "bien", sobre nada y se posa en la cabeza; si no, vuelve a abrirse
    const chasquea = (bien) => {
      parado = true; orilla.classList.add("away"); ave(-30, 20, " rotate(-25deg)");
      setTimeout(() => {
        orilla.classList.add("snap"); pon(0); ola(); zum([30, 20, 60]);
        if (bien) {
          di("Snap. On nothing.");
          setTimeout(() => { orilla.classList.remove("away"); ave(196, 84); }, 380);
          setTimeout(abre, quieto ? 0 : 1500);
        } else {
          di("Too slow! Again", true);
          setTimeout(() => {
            orilla.classList.remove("snap", "away"); orilla.classList.add("reopen"); pon(ABIERTA); ave(130, 128);
            setTimeout(() => { orilla.classList.remove("reopen"); cerrando = 0; parado = false; di("Tap the bits before it closes"); }, 520);
          }, 700);
        }
      }, quieto ? 0 : 260);
    };
    const pica = (bit) => {
      quedan.delete(bit);
      const c = bit.querySelector("circle"), x = +c.getAttribute("cx");
      ave(x + 9, 128); pajaro.classList.remove("peck"); void pajaro.getBoundingClientRect(); pajaro.classList.add("peck");
      setTimeout(() => bit.classList.add("gone"), quieto ? 0 : 180);
      cuenta.textContent = 5 - quedan.size; zum(12);
      if (!quedan.size) { hecho = true; chasquea(true); }
    };
    const bucleBoca = (t) => {
      if (!orilla.isConnected || caja.classList.contains("off")) return;
      const dt = Math.min(50, t - (antes || t)); antes = t;
      const visible = !!caja.closest(".slab.on");
      if (!hecho && !parado && visible) {
        cerrando += dt; pon(ABIERTA * Math.max(0, 1 - cerrando / TARDA));
        if (cerrando >= TARDA) chasquea(false);
      }
      requestAnimationFrame(bucleBoca);
    };
    orilla.addEventListener("pointerdown", (e) => {
      if (hecho || parado) return;
      if (quieto) { const b = restos.find((r) => quedan.has(r)); if (b) pica(b); return; }
      let mejor = null, dmin = 30;
      for (const b of quedan) { const r = b.getBoundingClientRect(), d = Math.hypot(r.left + r.width / 2 - e.clientX, r.top + r.height / 2 - e.clientY); if (d < dmin) { dmin = d; mejor = b; } }
      if (mejor) pica(mejor); else { di("Aim for the dark bits"); zum(6); }
    });
    orilla.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      if (hecho || parado) return;
      const b = restos.find((r) => quedan.has(r)); if (b) pica(b);
    });
    caja.parentElement.querySelector(".cp")?.addEventListener("click", abre);
    pon(ABIERTA);
    if (!quieto) requestAnimationFrame(bucleBoca);
  });

  // al copiar: el botón da un bocado
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    zum([20, 30, 20]);
    if (quieto) return;
    const r = b.getBoundingClientRect();
    for (const lado of ["top", "bot"]) {
      const m = document.createElement("i"); m.className = "chomp " + lado;
      m.style.left = r.left + "px"; m.style.width = r.width + "px"; m.style.top = (lado === "top" ? r.top : r.top + r.height / 2) + "px"; m.style.height = r.height / 2 + "px";
      document.body.appendChild(m); m.addEventListener("animationend", () => m.remove());
    }
  }));

  // ---------- reglas: se limpian a picotazos ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  const fly = document.documentElement.classList.contains("fly");
  reglas.forEach((s) => {
    s.setAttribute("role", "button"); s.tabIndex = 0;
    if (fly && !quieto) for (let k = 0; k < 6; k++) { const m = document.createElement("i"); m.className = "speck"; m.style.left = rnd(8, 88) + "%"; m.style.top = rnd(14, 84) + "%"; s.appendChild(m); }
    s._limpia = () => { [...s.querySelectorAll(".speck")].forEach((m, k) => setTimeout(() => { m.classList.add("pecked"); zum(4); }, k * 140)); };
    s._ensucia = () => {
      if (quieto) return;
      s.querySelectorAll(".speck").forEach((m) => { m.classList.remove("pecked"); m.style.left = rnd(8, 88) + "%"; m.style.top = rnd(14, 84) + "%"; });
      setTimeout(s._limpia, 300);
    };
    s.addEventListener("click", s._ensucia);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); s._ensucia(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s) && !s._vista)
      .forEach((s, n) => { s._vista = true; setTimeout(s._limpia, (quieto ? 0 : 500) + n * 350); });
  });
})();
