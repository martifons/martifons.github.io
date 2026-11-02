// APPLE — el fondo es un manzanar a la hora dorada: cielo de miel, el sol bajo a la izquierda que se hunde al avanzar,
// filas de manzanos desenfocados con manzanas rojas, una valla, el prado y motas de polvo que brillan a contraluz. Tocar
// el prado suelta una manzana de los árboles que cae, bota y rueda. Cada prompt está tapado por una rama con una manzana
// y un erizo debajo: hay que ser el caballo, tirar de la rama hacia abajo y soltarla; un tirón flojo solo la balancea,
// uno de verdad suelta la manzana, que cae delante del erizo, bota y él la empuja rodando: al rodar se lleva la escena y
// destapa el prompt. Al copiar, un erizo cruza por debajo del botón empujando una manzana. Las reglas llegan verdes y
// maduran. Cámara "roll".
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");

  // ---------- el manzanar ----------
  const cv = document.createElement("canvas");
  cv.id = "orchard"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  let W, H, dpr, fondo = null, prado = 0;
  const motas = [], caidas = [];

  const manzana = (c, x, y, r, giro = 0) => {
    c.save(); c.translate(x, y); c.rotate(giro);
    c.fillStyle = "#B8231C"; c.beginPath(); c.arc(0, 0, r, 0, 6.283); c.fill();
    c.fillStyle = "rgba(255,210,170,.55)"; c.beginPath(); c.ellipse(-r * .35, -r * .35, r * .28, r * .18, -.6, 0, 6.283); c.fill();
    c.strokeStyle = "#4A3020"; c.lineWidth = Math.max(1, r * .12); c.beginPath(); c.moveTo(0, -r * .85); c.lineTo(r * .1, -r * 1.25); c.stroke();
    c.fillStyle = "#5E8A32"; c.beginPath(); c.ellipse(r * .35, -r * 1.1, r * .3, r * .13, -.5, 0, 6.283); c.fill();
    c.restore();
  };
  const pintaFondo = () => {
    fondo = document.createElement("canvas"); fondo.width = W; fondo.height = H;
    const c = fondo.getContext("2d");
    prado = H * .64;
    // el cielo de miel
    let g = c.createLinearGradient(0, 0, 0, prado);
    g.addColorStop(0, "#F1B562"); g.addColorStop(1, "#F8DDA6");
    c.fillStyle = g; c.fillRect(0, 0, W, prado);
    // tres filas de manzanos desenfocados, más pequeñas y claras cuanto más lejos
    for (const [fy, r0, a] of [[.44, 26, .2], [.5, 38, .28], [.57, 54, .36]]) {
      const r = r0 * dpr;
      for (let x = -r; x < W + r; x += r * rnd(1.3, 1.8)) {
        const y = H * fy + rnd(-.015, .015) * H, rr = r * rnd(.8, 1.2);
        c.fillStyle = `rgba(78,104,46,${a})`; c.beginPath(); c.arc(x, y, rr, 0, 6.283); c.fill();
        c.fillStyle = `rgba(190,40,30,${a + .15})`;
        for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(x + rnd(-.6, .6) * rr, y + rnd(-.5, .5) * rr, rr * .12, 0, 6.283); c.fill(); }
      }
    }
    // la valla
    c.fillStyle = "rgba(107,74,46,.6)";
    for (let x = 0; x < W; x += 64 * dpr) c.fillRect(x, prado - H * .06, 5 * dpr, H * .06);
    c.fillRect(0, prado - H * .05, W, 3 * dpr); c.fillRect(0, prado - H * .025, W, 3 * dpr);
    // el prado, con briznas y sombras largas hacia la derecha
    g = c.createLinearGradient(0, prado, 0, H);
    g.addColorStop(0, "#A9BD5C"); g.addColorStop(1, "#62802E");
    c.fillStyle = g; c.fillRect(0, prado, W, H - prado);
    c.fillStyle = "rgba(40,50,20,.12)";
    for (let k = 0; k < 6; k++) { const x = rnd(0, W), y = rnd(prado, H); c.beginPath(); c.moveTo(x, y); c.lineTo(x + W * .5, y + H * .08); c.lineTo(x + W * .5, y + H * .1); c.lineTo(x, y + H * .02); c.closePath(); c.fill(); }
    c.strokeStyle = "rgba(60,80,25,.45)"; c.lineWidth = 1.5 * dpr;
    for (let k = 0; k < 160; k++) { const x = rnd(0, W), y = rnd(prado + 6 * dpr, H); c.beginPath(); c.moveTo(x, y); c.lineTo(x + rnd(-3, 3) * dpr, y - rnd(5, 11) * dpr); c.stroke(); }
  };
  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = Math.round(innerWidth * dpr); H = cv.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    pintaFondo();
    caidas.length = 0; motas.length = 0;
    for (let k = 0; k < 45; k++) motas.push({ x: rnd(0, W), y: rnd(0, H), r: rnd(1, 2.4) * dpr, vx: rnd(.004, .015) * dpr, vy: rnd(-.012, -.003) * dpr, ph: rnd(0, 6) });
  };
  tam();
  addEventListener("resize", tam);

  // una manzana que se suelta de los árboles, cae, bota dos veces y se va rodando
  const suelta = (x, suelo) => caidas.push({ x, y: H * rnd(.42, .55), vy: 0, suelo, rebotes: 0, vx: 0, giro: 0, r: rnd(7, 10) * dpr, vida: 0 });

  let p = 0, objP = 0, ultimo = 0;
  const pinta = (t) => {
    const dt = Math.min(50, t - (ultimo || t)); ultimo = t;
    p += (objP - p) * (quieto ? 1 : Math.min(1, dt / 1200));
    cx.drawImage(fondo, 0, 0);
    // manzanas sueltas
    for (let k = caidas.length - 1; k >= 0; k--) {
      const m = caidas[k]; m.vida += dt;
      if (m.y < m.suelo - m.r || m.vy < 0) {
        m.vy += .0016 * dpr * dt; m.y += m.vy * dt;
        if (m.y >= m.suelo - m.r) { m.y = m.suelo - m.r; if (m.rebotes < 2) { m.vy = -m.vy * .38; m.rebotes++; } else { m.vy = 0; m.vx = .05 * dpr; } }
      } else { m.vx = Math.max(0, m.vx - .00002 * dpr * dt); m.x += m.vx * dt; m.giro += m.vx * dt / m.r; }
      if (m.vida > 6000 || m.x > W + 20) { caidas.splice(k, 1); continue; }
      cx.globalAlpha = Math.min(1, (6000 - m.vida) / 800); manzana(cx, m.x, m.y, m.r, m.giro); cx.globalAlpha = 1;
    }
    // el sol bajo a la izquierda, que se hunde al avanzar: un velo de luz sobre todo
    const sy = H * (.2 + .3 * p);
    cx.globalCompositeOperation = "screen";
    const g = cx.createRadialGradient(W * .08, sy, 0, W * .08, sy, Math.max(W, H) * .65);
    g.addColorStop(0, "rgba(255,226,150,.85)"); g.addColorStop(.35, "rgba(255,190,110,.25)"); g.addColorStop(1, "rgba(255,190,110,0)");
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    cx.globalCompositeOperation = "source-over";
    cx.fillStyle = `rgba(230,120,40,${(.04 + .14 * p).toFixed(3)})`; cx.fillRect(0, 0, W, H);
    // motas de polvo a contraluz
    for (const o of motas) {
      if (!quieto) { o.x += o.vx * dt; o.y += o.vy * dt; if (o.x > W + 5) o.x = -5; if (o.y < -5) o.y = H + 5; }
      cx.fillStyle = `rgba(255,240,200,${(.25 + .3 * Math.sin(t / 500 + o.ph)).toFixed(3)})`;
      cx.beginPath(); cx.arc(o.x, o.y, o.r, 0, 6.283); cx.fill();
    }
  };
  const bucle = (t) => { requestAnimationFrame(bucle); pinta(t); };
  if (quieto) pinta(0); else requestAnimationFrame(bucle);
  addEventListener("resize", () => { if (quieto) pinta(0); });

  addEventListener("flyview", (e) => {
    const { index, total, dir } = e.detail;
    objP = total > 1 ? index / (total - 1) : 0;
    if (dir > 0 && !quieto) suelta(rnd(.1, .9) * W, prado + rnd(.1, .3) * (H - prado));
    if (dir) zum(dir > 0 ? [10, 40, 10] : 6);
    if (quieto) pinta(0);
  });

  // tocar el prado: cae una manzana de los árboles
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a, .tug")) return;
    zum(10);
    if (quieto) return;
    const y = e.clientY * dpr;
    suelta(e.clientX * dpr, y > prado ? y : prado + rnd(.1, .3) * (H - prado));
  });

  // ---------- cada prompt, tapado por una rama: tira de ella como el caballo ----------
  const NS = "http://www.w3.org/2000/svg";
  const UMBRAL = .22;
  document.querySelectorAll(".code").forEach((code) => {
    const caja = document.createElement("div");
    caja.className = "bough on";
    code.replaceWith(caja); caja.appendChild(code);
    caja.insertAdjacentHTML("beforeend", `<div class="tug" data-nofly role="button" tabindex="0" aria-label="Pull the branch down and let go to drop the apple and reveal the prompt"><svg class="scene" aria-hidden="true"></svg><p class="cue">Be the horse. Pull the branch down and let go.</p><span class="meter"><i></i><b></b></span></div>`);
    const tug = caja.querySelector(".tug"), svg = tug.querySelector(".scene"), aviso = tug.querySelector(".cue"), barra = tug.querySelector(".meter i");
    let w = 0, h = 0, u = 1, base, punta0, C0, suelo, hx0 = 0, tira = 0, y0 = 0, tirando = false, rama = 0, vRama = 0, auto = 0;
    let fase = "colgada", M = null, vy = 0, rebotes = 0, quieta = 0, giro = 0, antes = 0;
    let ramaP, hojas = [], tallo, fruta, erizo;
    const el = (tag, attrs, padre = svg) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); padre.appendChild(n); return n; };
    const di = (txt) => { aviso.textContent = txt; };
    // un punto de la rama (curva cuadrática de la base a la punta), con la punta bajada "rama" px
    const enRama = (s) => {
      const P = [punta0[0], punta0[1] + rama], C = [C0[0], C0[1] + rama * .35], a = (1 - s) * (1 - s), b = 2 * s * (1 - s), c = s * s;
      return [a * base[0] + b * C[0] + c * P[0], a * base[1] + b * C[1] + c * P[1]];
    };
    const R = () => 11 * u;
    const colgada = () => { const [x, y] = enRama(.66); return [x, y + 16 * u]; };
    const dibuja = () => {
      if (!w) return;
      const P = [punta0[0], punta0[1] + rama], C = [C0[0], C0[1] + rama * .35];
      ramaP.setAttribute("d", `M${base[0]} ${base[1]}Q${C[0]} ${C[1]} ${P[0]} ${P[1]}`);
      hojas.forEach((o) => { const [x, y] = enRama(o.s); o.n.setAttribute("transform", `translate(${x} ${y}) rotate(${o.a + rama * .15})`); });
      const [sx, sy] = enRama(.66);
      if (fase === "colgada") {
        const [ax, ay] = colgada();
        tallo.setAttribute("x1", sx); tallo.setAttribute("y1", sy); tallo.setAttribute("x2", ax); tallo.setAttribute("y2", ay - R());
        fruta.setAttribute("transform", `translate(${ax} ${ay}) rotate(${Math.max(-20, Math.min(20, vRama * 80)).toFixed(1)})`);
      } else {
        tallo.setAttribute("x1", sx); tallo.setAttribute("y1", sy); tallo.setAttribute("x2", sx); tallo.setAttribute("y2", sy + 5 * u);
        fruta.setAttribute("transform", `translate(${M[0]} ${M[1]}) rotate(${giro})`);
      }
      // el erizo, siempre con el hocico pegado a la manzana cuando rueda
      const ex = fase === "rueda" || fase === "fuera" ? M[0] - 26 * u : hx0;
      erizo.setAttribute("transform", `translate(${ex} ${suelo})`);
      barra.style.width = Math.min(100, tira / (h * UMBRAL * 1.6) * 100).toFixed(1) + "%";
      if (fase === "rueda" || fase === "fuera") tug.style.clipPath = `inset(0 0 0 ${Math.max(0, (M[0] - 48 * u) / w * 100).toFixed(2)}%)`;
    };
    const monta = () => {
      w = tug.clientWidth; h = tug.clientHeight; if (!w || !h) return;
      u = Math.min(w, h * .66) / 210;
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`); svg.innerHTML = ""; hojas = [];
      base = [w * .09, h * .2]; punta0 = [w * .78, h * .24]; C0 = [w * .42, h * .1]; suelo = h * .9;
      // el erizo, quieto con el hocico a un palmo de donde caerá la manzana (la x de la manzana no cambia al tirar)
      hx0 = .1156 * base[0] + .4488 * C0[0] + .4356 * punta0[0] - 34 * u;
      if (fase !== "colgada" && M) M = [Math.min(M[0], w + 40 * u), Math.min(M[1], suelo - R())];
      // el tronco, la rama y sus hojas
      el("rect", { x: 0, y: 0, width: w * .09, height: h, fill: "#6B4F36" });
      for (let k = 0; k < 4; k++) el("line", { x1: w * (.015 + k * .02), y1: h * rnd(.05, .4), x2: w * (.02 + k * .02), y2: h * rnd(.6, .95), stroke: "rgba(40,28,18,.45)", "stroke-width": 1.4 * u });
      el("rect", { x: w * .03, y: h * .3, width: w * .03, height: h * .2, fill: "rgba(110,140,60,.45)" });
      ramaP = el("path", { fill: "none", stroke: "#5A4230", "stroke-width": 4 * u, "stroke-linecap": "round" });
      for (const [s, a] of [[.3, -30], [.42, 40], [.55, -50], [.72, 35], [.84, -35], [.95, 20], [1, -10]]) {
        const n = el("ellipse", { cx: 0, cy: -6 * u, rx: 3.6 * u, ry: 8 * u, fill: s > .6 ? "#6A9440" : "#5E8A32" });
        hojas.push({ s, a, n });
      }
      tallo = el("line", { stroke: "#4A3020", "stroke-width": 1.8 * u, "stroke-linecap": "round" });
      // la manzana
      fruta = el("g", { class: "fruta" });
      el("circle", { cx: 0, cy: 0, r: R(), fill: "#B8231C" }, fruta);
      el("ellipse", { cx: -4 * u, cy: -4 * u, rx: 3 * u, ry: 2 * u, fill: "rgba(255,210,170,.55)", transform: "rotate(-35)" }, fruta);
      el("ellipse", { cx: 4 * u, cy: -11 * u, rx: 3.4 * u, ry: 1.5 * u, fill: "#5E8A32", transform: "rotate(-28)" }, fruta);
      // el erizo, mirando a la derecha: (0, 0) es el suelo bajo su barriga
      erizo = el("g", { class: "erizo" });
      el("ellipse", { cx: 0, cy: 3 * u, rx: 14 * u, ry: 2.2 * u, fill: "rgba(40,50,20,.3)" }, erizo);
      for (let k = 0; k < 15; k++) {
        const a = Math.PI * (1.05 + k * .062), x0 = Math.cos(a) * 11 * u - 2 * u, y0 = Math.sin(a) * 9 * u - 7 * u;
        el("line", { x1: x0, y1: y0, x2: x0 + Math.cos(a) * 5 * u, y2: y0 + Math.sin(a) * 5 * u, stroke: k % 2 ? "#6E5640" : "#C9B48E", "stroke-width": 1.6 * u, "stroke-linecap": "round" }, erizo);
      }
      el("ellipse", { cx: -2 * u, cy: -7 * u, rx: 12 * u, ry: 8 * u, fill: "#7A6248" }, erizo);
      el("path", { d: `M${7 * u} ${-10 * u}Q${16 * u} ${-7 * u} ${19 * u} ${-3 * u}Q${12 * u} ${0} ${6 * u} ${-1 * u}Z`, fill: "#E3CFA8" }, erizo);
      el("circle", { cx: 19 * u, cy: -3.4 * u, r: 1.6 * u, fill: "#1A120C" }, erizo);
      el("circle", { cx: 11 * u, cy: -6.6 * u, r: 1.2 * u, fill: "#1A120C" }, erizo);
      for (const x of [-7, 3]) el("line", { x1: x * u, y1: -1 * u, x2: x * u, y2: 1.5 * u, stroke: "#4A3828", "stroke-width": 2 * u, "stroke-linecap": "round" }, erizo);
      dibuja();
    };
    const abre = () => {
      if (caja.classList.contains("off")) return;
      fase = "fuera"; caja.classList.remove("on"); caja.classList.add("off");
      zum([15, 30, 50]);
      setTimeout(() => tug.remove(), quieto ? 0 : 900);
    };
    const soltar = () => {
      tirando = false; auto = 0;
      if (fase !== "colgada") return;
      if (tira >= h * UMBRAL) {
        M = colgada(); vy = 0; fase = "cae"; zum([10, 20, 30]);
        di("There it goes.");
      } else if (tira > 2) di("Harder. One real tug.");
      tira = 0; dibuja();
    };
    const paso = (dt) => {
      // la rama: sigue al dedo mientras se tira; al soltar, vuelve como un muelle amortiguado
      if (auto && fase === "colgada") { tira = Math.min(h * UMBRAL * 1.3, (performance.now() - auto) / 400 * h * UMBRAL * 1.3); rama = tira; if (tira >= h * UMBRAL * 1.3) soltar(); }
      else if (!tirando) for (let q = dt; q > 0; q -= 8) { const d = Math.min(8, q); vRama += (-.00032 * rama - .0045 * vRama) * d; rama += vRama * d; }
      if (fase === "cae") {
        vy += .0022 * u * dt; M = [M[0], M[1] + vy * dt];
        if (M[1] >= suelo - R()) {
          M[1] = suelo - R();
          if (rebotes < 1) { vy = -vy * .32; rebotes++; zum(8); }
          else { fase = "posada"; quieta = 0; di("He sniffs it… and starts nudging it home."); }
        }
      } else if (fase === "posada") {
        quieta += dt; if (quieta > 450) fase = "rueda";
      } else if (fase === "rueda") {
        const v = .1 * u * (.35 + .65 * Math.abs(Math.sin(performance.now() / 200)));
        M = [M[0] + v * dt, M[1]]; giro += v * dt / R() * 57.3;
        if (M[0] - 48 * u > w) abre();
      }
      dibuja();
    };
    const bucle = (t) => {
      if (!tug.isConnected) return;
      const dt = Math.min(50, t - (antes || t)); antes = t;
      if (w) paso(dt);
      requestAnimationFrame(bucle);
    };
    const pos = (e) => { const r = tug.getBoundingClientRect(); return (e.clientY - r.top) * tug.offsetHeight / (r.height || 1); };
    tug.addEventListener("pointerdown", (e) => {
      if (!w || fase !== "colgada") return;
      if (quieto) { di("There it goes."); return abre(); }
      tirando = true; y0 = pos(e); tira = 0; vRama = 0; zum(6);
      try { tug.setPointerCapture(e.pointerId); } catch {}
    });
    tug.addEventListener("pointermove", (e) => {
      if (!tirando) return;
      tira = Math.max(0, Math.min(h * .5, pos(e) - y0)); rama = tira;
      di(tira >= h * UMBRAL ? "That's a real tug. Let go." : "Further…");
    });
    tug.addEventListener("pointerup", soltar);
    tug.addEventListener("pointercancel", soltar);
    tug.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      if (fase !== "colgada") return;
      if (quieto) return abre();
      auto = performance.now();
    });
    caja.parentElement.querySelector(".cp")?.addEventListener("click", abre);
    monta(); addEventListener("resize", monta);
    if (!w) requestAnimationFrame(monta);
    if (!quieto) requestAnimationFrame(bucle);
  });

  // al copiar: un erizo cruza por debajo del botón empujando una manzana
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    zum([8, 30, 8]);
    if (quieto) return;
    const r = b.getBoundingClientRect();
    [["🍎", 0], ["🦔", 24]].forEach(([emoji, dx]) => {
      const s = document.createElement("span");
      s.className = "cruza" + (dx ? "" : " rueda"); s.textContent = emoji; s.setAttribute("aria-hidden", "true");
      s.style.cssText = `left:${r.right - 30 + dx}px;top:${r.bottom - 12}px;--w:${-(r.width - 20).toFixed(0)}px`;
      document.body.appendChild(s); s.addEventListener("animationend", () => s.remove());
    });
  }));

  // ---------- reglas: llegan verdes y maduran ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((r) => {
    const f = document.createElement("i");
    f.className = "madura"; f.setAttribute("aria-hidden", "true");
    r.appendChild(f);
    if (!quieto) r.classList.add("verde");
    r.setAttribute("role", "button"); r.tabIndex = 0;
    r._cae = () => { if (quieto) return; f.classList.remove("cae"); void f.offsetWidth; f.classList.add("cae"); zum([6, 30, 6]); };
    r.addEventListener("click", r._cae);
    r.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); r._cae(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((r) => e.detail.els.includes(r) && !r._vista)
      .forEach((r, n) => { r._vista = true; setTimeout(() => { r.classList.remove("verde"); zum(8); }, (quieto ? 0 : 450) + n * 400); });
  });
})();
