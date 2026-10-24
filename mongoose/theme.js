// MONGOOSE — el fondo es una carretera del desierto a la hora dorada vista desde el asfalto: cielo azul, montañas
// moradas, saguaros, la hierba dorada de la cuneta, la fila de coches blancos parados en el carril de la izquierda
// con los parabrisas llenos de cielo, y la calima que tiembla en el horizonte. Al avanzar, los coches encienden los
// warnings y la luz se calienta. Tocar la carretera echa a rodar un matojo. Cada prompt está detrás de una
// serpiente de cascabel y una mangosta: la serpiente se mece y, de vez en cuando, echa la cabeza atrás y ataca; hay
// que tocar en ese momento para que la mangosta salte atrás, dos veces, y luego tocar para morder. Al copiar, el
// botón cascabelea. Las reglas mudan la piel. Cámara "strike".
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");

  // ---------- el desierto ----------
  const cv = document.createElement("canvas");
  cv.id = "desert"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  let W, H, dpr, vx, vy, fondo = null, coches = [];
  const matojos = [];

  const saguaro = (c, x, base, h) => {
    const w = h * .16;
    c.fillStyle = "#4B6436"; c.strokeStyle = "#4B6436"; c.lineCap = "round"; c.lineWidth = w;
    c.beginPath(); c.moveTo(x, base); c.lineTo(x, base - h); c.stroke();
    c.lineWidth = w * .8;
    c.beginPath(); c.moveTo(x, base - h * .45); c.lineTo(x - h * .22, base - h * .45); c.lineTo(x - h * .22, base - h * .78); c.stroke();
    c.beginPath(); c.moveTo(x, base - h * .58); c.lineTo(x + h * .2, base - h * .58); c.lineTo(x + h * .2, base - h * .86); c.stroke();
  };

  const pintaFondo = () => {
    fondo = document.createElement("canvas"); fondo.width = W; fondo.height = H;
    const c = fondo.getContext("2d");
    let g = c.createLinearGradient(0, 0, 0, vy);
    g.addColorStop(0, "#3C76B6"); g.addColorStop(.8, "#A9C8E2"); g.addColorStop(1, "#F0D6A8");
    c.fillStyle = g; c.fillRect(0, 0, W, vy + 2);
    // montañas: una capa lejana y otra cercana
    for (const [alto, color, paso] of [[.09, "#9A7E94", .07], [.05, "#755C6E", .045]]) {
      c.fillStyle = color; c.beginPath(); c.moveTo(0, vy);
      for (let x = 0; x <= 1.0001; x += paso) c.lineTo(x * W, vy - H * alto * rnd(.35, 1));
      c.lineTo(W, vy); c.closePath(); c.fill();
    }
    // el suelo del desierto
    g = c.createLinearGradient(0, vy, 0, H);
    g.addColorStop(0, "#D2B27C"); g.addColorStop(1, "#B48C58");
    c.fillStyle = g; c.fillRect(0, vy, W, H - vy);
    // perspectiva: la cámara a 1,4 m del suelo, cerca del borde derecho de la calzada. A la distancia d (m), un punto
    // del suelo cae en y = vy + (H - vy) · 2,5 / d y un metro mide m(d) = (H - vy) · 2,5 / (1,4 · d) px
    const m = (d) => (H - vy) * 2.5 / (1.4 * d), sueloY = (d) => vy + (H - vy) * 2.5 / d;
    const tira = (L0, L1, d0, d1, color) => {
      c.fillStyle = color; c.beginPath();
      c.moveTo(vx + L0 * m(d0), sueloY(d0)); c.lineTo(vx + L1 * m(d0), sueloY(d0));
      c.lineTo(vx + L1 * m(d1), sueloY(d1)); c.lineTo(vx + L0 * m(d1), sueloY(d1)); c.closePath(); c.fill();
    };
    // la calzada: dos carriles de 3,6 m, del borde izquierdo (-6,1 m) al derecho (+1,1 m)
    g = c.createLinearGradient(0, vy, 0, H);
    g.addColorStop(0, "#8A827B"); g.addColorStop(1, "#57514D");
    tira(-6.4, 1.4, 2.5, 4000, g);
    tira(1, 1.2, 2.5, 4000, "#EDEBE3"); tira(-6.2, -6, 2.5, 4000, "#EDEBE3");
    for (let d = 3; d < 400; d += 12) tira(-2.6, -2.45, d, d + 4, "#E3B93A");
    // la hierba dorada de la cuneta derecha
    c.strokeStyle = "rgba(226,190,110,.9)"; c.lineWidth = Math.max(1, dpr);
    for (let k = 0; k < 220; k++) {
      const d = 2.5 + Math.pow(Math.random(), 2.2) * 120, x = vx + rnd(1.5, 4.5) * m(d), y = sueloY(d), h = .35 * m(d);
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + rnd(-.1, .1) * m(d), y - h); c.stroke();
    }
    // saguaros a los dos lados, más pequeños al fondo
    for (let k = 0; k < 10; k++) {
      const d = 18 + k * k * 4, L = k % 2 ? rnd(5, 12) : -rnd(11, 22);
      saguaro(c, vx + L * m(d), sueloY(d), rnd(3.5, 7) * m(d));
    }
    // la fila de coches parados en el carril izquierdo, de frente, uno cada 7 m desde los 7 m; los lejanos primero.
    // Cada coche mide 1,9 × 1,8 m y va por el centro del carril izquierdo (-4,4 m); s son los px de un metro a su distancia
    coches = [];
    for (let k = 18; k >= 0; k--) {
      const d = 7 + 7 * k, s = m(d), y = sueloY(d);
      const w = 1.9 * s, h = 1.8 * s, x = vx - 4.4 * s, top = y - h;
      c.fillStyle = "rgba(40,30,30,.22)";
      c.beginPath(); c.moveTo(x - w * .5, y); c.lineTo(x + w * .5, y); c.lineTo(x - w * .2, y + h * .1); c.lineTo(x - w * 1.5, y + h * .1); c.closePath(); c.fill();
      c.fillStyle = "#1E1E22"; c.fillRect(x - w * .47, y - h * .14, w * .17, h * .14); c.fillRect(x + w * .3, y - h * .14, w * .17, h * .14);
      c.fillStyle = "#F1F1EC"; c.beginPath(); c.roundRect ? c.roundRect(x - w * .5, top + h * .05, w, h * .83, w * .08) : c.rect(x - w * .5, top + h * .05, w, h * .83); c.fill();
      c.fillStyle = "#DCDDD9"; c.fillRect(x - w * .5, top + h * .05, w, h * .06);
      g = c.createLinearGradient(0, top + h * .12, 0, top + h * .42);
      g.addColorStop(0, "#D3E4F0"); g.addColorStop(1, "#6E90AE");
      c.fillStyle = g; c.beginPath(); c.moveTo(x - w * .36, top + h * .12); c.lineTo(x + w * .36, top + h * .12); c.lineTo(x + w * .44, top + h * .42); c.lineTo(x - w * .44, top + h * .42); c.closePath(); c.fill();
      c.fillStyle = "#3A3D42"; c.fillRect(x - w * .28, top + h * .56, w * .56, h * .14);
      c.fillStyle = "#FFF8E6"; c.fillRect(x - w * .46, top + h * .56, w * .14, h * .07); c.fillRect(x + w * .32, top + h * .56, w * .14, h * .07);
      c.fillStyle = "#C3C5C3"; c.fillRect(x - w * .5, top + h * .74, w, h * .1);
      coches.push([x, top + h * .6, w]);
    }
  };

  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = Math.round(innerWidth * dpr); H = cv.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    vx = W * .5; vy = H * .5;
    pintaFondo();
    matojos.length = 0;
  };
  tam();
  addEventListener("resize", tam);

  let p = 0, objP = 0, ultimo = 0, warnT = -1e9;
  const pinta = (t) => {
    const dt = Math.min(50, t - (ultimo || t)); ultimo = t;
    p += (objP - p) * (quieto ? 1 : Math.min(1, dt / 900));
    cx.drawImage(fondo, 0, 0);
    // la calima: la franja del horizonte tiembla
    if (!quieto) {
      const y0 = Math.round(vy - H * .05), y1 = Math.round(vy + H * .015), paso = Math.max(2, Math.round(2 * dpr));
      for (let y = y0; y < y1; y += paso) cx.drawImage(fondo, 0, y, W, paso, Math.sin(t * .004 + y * .07) * 1.6 * dpr, y, W, paso);
    }
    // los warnings de los coches, dos parpadeos al avanzar
    const e = (t - warnT) / 900;
    if (e >= 0 && e < 1 && Math.sin(e * Math.PI * 4) > 0) {
      cx.fillStyle = "#FFB020";
      for (const [x, y, w] of coches) { const r = Math.max(1.2 * dpr, w * .045); for (const lado of [-1, 1]) { cx.beginPath(); cx.arc(x + lado * w * .43, y, r, 0, 6.283); cx.fill(); } }
    }
    // la luz se calienta con el avance
    cx.fillStyle = `rgba(255,140,60,${(.14 * p).toFixed(3)})`; cx.fillRect(0, 0, W, H);
    // matojos que ruedan
    cx.strokeStyle = "rgba(122,92,52,.9)"; cx.lineWidth = Math.max(1, dpr);
    for (let k = matojos.length - 1; k >= 0; k--) {
      const m = matojos[k]; m.x += m.v * dt * dpr; m.f += dt * .012; m.a += m.v * dt / m.r * dpr;
      if (m.x - m.r > W) { matojos.splice(k, 1); continue; }
      const y = m.y - Math.abs(Math.sin(m.f)) * m.r * 1.1;
      cx.save(); cx.translate(m.x, y); cx.rotate(m.a);
      for (const [a, b, s] of m.ramas) { cx.beginPath(); cx.arc(0, 0, m.r * s, a, b); cx.stroke(); }
      cx.restore();
    }
  };
  const bucle = (t) => { requestAnimationFrame(bucle); pinta(t); };
  if (quieto) pinta(0); else requestAnimationFrame(bucle);
  addEventListener("resize", () => { if (quieto) pinta(0); });

  addEventListener("flyview", (e) => {
    const { index, total, dir } = e.detail;
    objP = total > 1 ? index / (total - 1) : 0;
    if (dir > 0) warnT = performance.now();
    if (dir) zum(dir > 0 ? [10, 30, 6] : 6);
    if (quieto) pinta(0);
  });

  // tocar la carretera: rueda un matojo
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a")) return;
    zum(10);
    if (quieto) return;
    const y = Math.max(vy + 6 * dpr, e.clientY * dpr), t = (y - vy) / (H - vy), r = (5 + 26 * t) * dpr;
    const ramas = []; for (let k = 0; k < 9; k++) { const a = rnd(0, 6.283); ramas.push([a, a + rnd(1.2, 3), rnd(.4, 1)]); }
    matojos.push({ x: e.clientX * dpr, y: y - r, r, v: rnd(.12, .2) * (.4 + t), f: 0, a: 0, ramas });
  });

  // ---------- cada prompt, detrás del duelo: esquiva dos veces y muerde ----------
  const RONDAS = 2;
  const DUELO = `<svg class="duel" viewBox="40 66 262 100" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
    <ellipse cx="160" cy="152" rx="140" ry="9" fill="rgba(0,0,0,.18)"/>
    <ellipse class="dust" cx="200" cy="142" rx="20" ry="6" fill="rgba(222,200,160,.7)"/>
    <g class="snake">
      <ellipse cx="88" cy="146" rx="40" ry="10" fill="#C9A86A" stroke="#5A4128" stroke-width="5" stroke-dasharray="6 7"/>
      <ellipse cx="90" cy="137" rx="30" ry="8.5" fill="#C9A86A" stroke="#5A4128" stroke-width="4.5" stroke-dasharray="5 6"/>
      <path d="M54 142C46 136 46 126 50 118" fill="none" stroke="#E9E4D8" stroke-width="5" stroke-linecap="round"/>
      <path d="M54 142C46 136 46 126 50 118" fill="none" stroke="#1E1A16" stroke-width="5" stroke-dasharray="3 3"/>
      <g class="rattle"><ellipse cx="50.5" cy="114" rx="3.2" ry="2.6" fill="#E3D3AE"/><ellipse cx="51" cy="109.5" rx="2.8" ry="2.3" fill="#D8C59B"/><ellipse cx="51.5" cy="105.5" rx="2.3" ry="2" fill="#CDB98C"/></g>
      <g class="neck">
        <path d="M104 132C96 116 122 110 114 92" fill="none" stroke="#C9A86A" stroke-width="9" stroke-linecap="round"/>
        <path d="M104 132C96 116 122 110 114 92" fill="none" stroke="#5A4128" stroke-width="9" stroke-dasharray="4 7"/>
        <path d="M110 86Q122 84 133 90Q122 96 110 95Q106 90 110 86Z" fill="#B8955A"/>
        <circle cx="119" cy="88.5" r="1.4" fill="#141008"/>
        <path d="M133 90l7-1.5M133 90l7 1.8" stroke="#C0283A" stroke-width="1"/>
      </g>
      <g class="lunge">
        <path d="M104 128L190 106" stroke="#C9A86A" stroke-width="9" stroke-linecap="round"/>
        <path d="M104 128L190 106" stroke="#5A4128" stroke-width="9" stroke-dasharray="4 7"/>
        <path d="M186 100L207 98L190 106Z" fill="#B8955A"/><path d="M190 106L205 113L186 112Z" fill="#B8955A"/>
        <path d="M200 99l-1 5M196 99.5l-1 4.5" stroke="#F4F1E8" stroke-width="1.2"/>
      </g>
    </g>
    <g class="goose">
      <path d="M262 130C280 128 292 138 298 150C288 142 276 138 262 137Z" fill="#7A6A54"/>
      <path d="M226 136l-3 12M234 138l-1 11M254 138l1 11M262 136l3 11" stroke="#6E604C" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="245" cy="128" rx="27" ry="12" fill="#8C7B62"/>
      <path d="M232 119v16M240 117v20M248 117v20M256 119v16" stroke="#4E4232" stroke-width="2.4" opacity=".75"/>
      <ellipse cx="218" cy="121" rx="12" ry="8" fill="#9A8A70"/>
      <path d="M208 116L194 123L208 127Z" fill="#9A8A70"/>
      <circle cx="195" cy="123" r="1.7" fill="#1A1410"/><circle cx="224" cy="114" r="3" fill="#7A6A54"/><circle cx="211" cy="119.5" r="1.5" fill="#141008"/>
    </g>
  </svg>`;
  document.querySelectorAll(".code").forEach((code) => {
    const caja = document.createElement("div");
    caja.className = "arena on";
    code.replaceWith(caja); caja.appendChild(code);
    caja.insertAdjacentHTML("beforeend", `<div class="road" data-nofly role="button" tabindex="0" aria-label="Dodge the snake twice, then bite, to reveal the prompt"><p class="count">Dodge: <b>0</b> / ${RONDAS}</p><p class="cue">Tap when it pulls back</p>${DUELO}</div>`);
    const pista = caja.querySelector(".road"), cuenta = pista.querySelector(".count b"), aviso = pista.querySelector(".cue");
    let esquivas = 0, ventana = false, toco = false, lista = false, hecho = false, reloj = null;
    const di = (txt, tipo) => { aviso.textContent = txt; aviso.className = "cue" + (tipo ? " " + tipo : ""); };
    const abre = () => {
      if (caja.classList.contains("off")) return;
      hecho = true; clearTimeout(reloj); caja.classList.remove("on"); caja.classList.add("off");
      zum([15, 30, 50]);
      setTimeout(() => pista.remove(), quieto ? 0 : 1100);
    };
    const programa = () => { clearTimeout(reloj); if (!hecho && !lista && !quieto) reloj = setTimeout(arma, rnd(1100, 2300)); };
    // la serpiente echa la cabeza atrás: es el momento de tocar
    const arma = () => {
      if (hecho) return;
      ventana = true; toco = false;
      pista.classList.add("cock"); di("Now!", "now");
      reloj = setTimeout(ataca, 650);
    };
    const ataca = () => {
      ventana = false;
      pista.classList.remove("cock"); pista.classList.add("strike");
      if (!toco) { pista.classList.add("flinch"); di("Too slow", "bad"); zum(30); }
      reloj = setTimeout(() => {
        pista.classList.remove("strike", "flinch", "hop");
        if (esquivas >= RONDAS) { lista = true; di("Now bite!", "now"); }
        else { di("Tap when it pulls back"); programa(); }
      }, 420);
    };
    const muerde = () => {
      hecho = true; clearTimeout(reloj);
      pista.classList.remove("cock", "strike", "hop"); pista.classList.add("bite");
      di("Got it", "ok"); zum([20, 40, 60]);
      setTimeout(abre, quieto ? 0 : 950);
    };
    const esquiva = () => {
      esquivas++; cuenta.textContent = esquivas;
      pista.classList.add("hop"); di("Dodged!", "ok"); zum([10, 30, 10]);
    };
    const toca = () => {
      if (hecho) return;
      if (lista) return muerde();
      // con movimiento reducido o con teclado no se pide reflejo: cada toque es una esquiva
      if (quieto) {
        esquiva(); pista.classList.remove("hop");
        if (esquivas >= RONDAS) { lista = true; di("Now bite!", "now"); }
        return;
      }
      if (ventana && !toco) { toco = true; esquiva(); return; }
      if (!ventana) { di("Too early", "bad"); pista.classList.remove("fidget"); void pista.offsetWidth; pista.classList.add("fidget"); zum(8); }
    };
    pista.addEventListener("click", toca);
    pista.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      if (hecho) return;
      if (lista) return muerde();
      if (ventana && !toco) { toco = true; esquiva(); return; }
      esquiva(); setTimeout(() => pista.classList.remove("hop"), 300);
      if (esquivas >= RONDAS) { clearTimeout(reloj); pista.classList.remove("cock"); ventana = false; lista = true; di("Now bite!", "now"); }
    });
    caja.parentElement.querySelector(".cp")?.addEventListener("click", abre);
    programa();
  });

  // al copiar: el botón cascabelea y salen ondas
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    zum([5, 15, 5, 15, 5]);
    if (quieto) return;
    b.classList.remove("buzz"); void b.offsetWidth; b.classList.add("buzz");
    const r = b.getBoundingClientRect();
    for (const [x, txt, dx] of [[r.left - 6, "(((", "-26px"], [r.right + 6, ")))", "26px"]]) {
      const s = document.createElement("span");
      s.className = "ss"; s.textContent = txt;
      s.style.cssText = `left:${x + (dx[0] === "-" ? -30 : 0)}px;top:${r.top + r.height / 2}px;--dx:${dx}`;
      document.body.appendChild(s); s.addEventListener("animationend", () => s.remove());
    }
  }));

  // ---------- reglas: mudan la piel ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((s) => {
    if (!quieto) s.classList.add("skin");
    s.setAttribute("role", "button"); s.tabIndex = 0;
    s._suena = () => {
      if (quieto) return;
      s.classList.remove("rattle"); void s.offsetWidth; s.classList.add("rattle");
      zum([5, 15, 5, 15, 5]);
    };
    s.addEventListener("click", s._suena);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); s._suena(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s) && !s._vista)
      .forEach((s, n) => { s._vista = true; setTimeout(() => { s.classList.remove("skin"); zum([6, 30, 6]); }, (quieto ? 0 : 500) + n * 350); });
  });
})();
