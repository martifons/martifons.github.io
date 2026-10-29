// SHOWER — el fondo es un camino de pueblo a mediodía: cielo blanquecino de calor, el sol arriba a la derecha, palmeras,
// casas de madera sobre pilotes y el camino de polvo claro con rodadas. La página empieza "caliente" (tinte naranja) y se
// refresca al avanzar; cada avance deja manchas de agua en el camino que se van secando, y tocar el camino lo salpica.
// Cada prompt está detrás de un elefante y un perro tumbado: manteniendo pulsado sale el chorro de la trompa, y moviendo
// el dedo de lado se apunta; hay que tener el agua sobre el perro hasta que se empapa; entonces se levanta y se sacude
// hacia el elefante. Al copiar, el botón se sacude como un perro. Las reglas salen mojadas y se secan. Cámara "trunk".
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");

  const gotas = (padre, x, y, n, dx, dy, fijo) => {
    if (quieto) return;
    for (let k = 0; k < n; k++) {
      const g = document.createElement("i"); g.className = "gota" + (fijo ? " fixed" : "");
      g.style.cssText = `left:${x}px;top:${y}px;--dx:${(dx + rnd(-18, 18)).toFixed(0)}px;--dy:${(dy + rnd(-14, 14)).toFixed(0)}px`;
      padre.appendChild(g); g.addEventListener("animationend", () => g.remove());
    }
  };

  // ---------- el camino ----------
  const cv = document.createElement("canvas");
  cv.id = "road"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  let W, H, dpr, fondo = null, suelo = 0;
  const charcos = [], salpicones = [];

  const palmera = (c, x, base, h, lado) => {
    c.strokeStyle = "#7A6A50"; c.lineWidth = Math.max(2, h * .03); c.lineCap = "round";
    const tx = x + lado * h * .18, ty = base - h;
    c.beginPath(); c.moveTo(x, base); c.quadraticCurveTo(x + lado * h * .02, base - h * .6, tx, ty); c.stroke();
    c.strokeStyle = "#4E6E38"; c.lineWidth = Math.max(2, h * .025);
    for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * .5; c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(tx + Math.cos(a) * h * .25, ty + Math.sin(a) * h * .18, tx + Math.cos(a) * h * .34, ty + Math.sin(a) * h * .1 + h * .08); c.stroke(); }
  };
  const pintaFondo = () => {
    fondo = document.createElement("canvas"); fondo.width = W; fondo.height = H;
    const c = fondo.getContext("2d");
    suelo = H * .5;
    let g = c.createLinearGradient(0, 0, 0, suelo);
    g.addColorStop(0, "#E9EEF0"); g.addColorStop(1, "#F4EBD8");
    c.fillStyle = g; c.fillRect(0, 0, W, suelo);
    g = c.createRadialGradient(W * .85, H * .08, 0, W * .85, H * .08, Math.max(W, H) * .5);
    g.addColorStop(0, "rgba(255,250,225,.95)"); g.addColorStop(1, "rgba(255,250,225,0)");
    c.fillStyle = g; c.fillRect(0, 0, W, suelo);
    // casas de madera sobre pilotes
    for (const [x, w] of [[.04, .22], [.72, .2]]) {
      const bx = W * x, bw = W * w, by = suelo - H * .06;
      c.fillStyle = "#6A4A30"; for (let k = 0; k < 5; k++) c.fillRect(bx + bw * k / 4.2, by, Math.max(2, bw * .025), H * .06);
      c.fillStyle = "#8A6646"; c.fillRect(bx, by - H * .07, bw, H * .07);
      c.fillStyle = "#5A3E28"; c.beginPath(); c.moveTo(bx - bw * .08, by - H * .07); c.lineTo(bx + bw / 2, by - H * .13); c.lineTo(bx + bw * 1.08, by - H * .07); c.closePath(); c.fill();
    }
    palmera(c, W * .3, suelo, H * .3, 1); palmera(c, W * .6, suelo, H * .24, -1); palmera(c, W * .95, suelo, H * .34, -1); palmera(c, W * .12, suelo, H * .22, 1);
    // el camino de polvo, con rodadas
    g = c.createLinearGradient(0, suelo, 0, H);
    g.addColorStop(0, "#E2CDA6"); g.addColorStop(1, "#D2B484");
    c.fillStyle = g; c.fillRect(0, suelo, W, H - suelo);
    c.strokeStyle = "rgba(150,118,76,.35)"; c.lineWidth = 3 * dpr;
    for (const d of [-.12, .12]) { c.beginPath(); c.moveTo(W * (.5 + d * .2), suelo); c.lineTo(W * (.5 + d * 2.6), H); c.stroke(); }
  };
  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = Math.round(innerWidth * dpr); H = cv.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    pintaFondo();
    charcos.length = 0; salpicones.length = 0;
  };
  tam();
  addEventListener("resize", tam);

  const moja = (x, y, r, t) => charcos.push({ x, y, r, t0: t });
  let p = 0, objP = 0, ultimo = 0;
  const pinta = (t) => {
    const dt = Math.min(50, t - (ultimo || t)); ultimo = t;
    p += (objP - p) * (quieto ? 1 : Math.min(1, dt / 1200));
    cx.drawImage(fondo, 0, 0);
    // manchas mojadas que se secan en 9 s
    for (let k = charcos.length - 1; k >= 0; k--) {
      const c = charcos[k], e = (t - c.t0) / 9000;
      if (e > 1) { charcos.splice(k, 1); continue; }
      cx.fillStyle = `rgba(120,90,56,${(.35 * (1 - e)).toFixed(3)})`;
      cx.beginPath(); cx.ellipse(c.x, c.y, c.r * (1 - e * .3), c.r * .4 * (1 - e * .3), 0, 0, 6.283); cx.fill();
    }
    // gotas de los salpicones
    cx.fillStyle = "rgba(160,215,245,.9)";
    for (let k = salpicones.length - 1; k >= 0; k--) {
      const s = salpicones[k]; s.vy += .0018 * dt * dpr; s.x += s.vx * dt; s.y += s.vy * dt;
      if (s.y > s.y0) { salpicones.splice(k, 1); continue; }
      cx.beginPath(); cx.arc(s.x, s.y, 2.2 * dpr, 0, 6.283); cx.fill();
    }
    // el calor: tinte naranja que se va al avanzar
    cx.fillStyle = `rgba(255,140,40,${(.16 * (1 - p)).toFixed(3)})`; cx.fillRect(0, 0, W, H);
  };
  const bucle = (t) => { requestAnimationFrame(bucle); pinta(t); };
  if (quieto) pinta(0); else requestAnimationFrame(bucle);
  addEventListener("resize", () => { if (quieto) pinta(0); });

  addEventListener("flyview", (e) => {
    const { index, total, dir } = e.detail;
    objP = total > 1 ? index / (total - 1) : 0;
    const t = performance.now();
    if (dir > 0) for (let k = 0; k < 3; k++) moja(rnd(.1, .9) * W, rnd(suelo + H * .05, H * .97), rnd(20, 50) * dpr, t);
    if (dir) zum(dir > 0 ? [10, 30, 6] : 6);
    if (quieto) pinta(0);
  });

  // tocar el camino: salpicón y mancha
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a")) return;
    zum(10);
    const x = e.clientX * dpr, y = Math.max(suelo + 10 * dpr, e.clientY * dpr), t = performance.now();
    moja(x, y, rnd(26, 46) * dpr, t);
    if (!quieto) for (let k = 0; k < 14; k++) salpicones.push({ x, y, y0: y + rnd(0, 6) * dpr, vx: rnd(-.25, .25) * dpr, vy: -rnd(.35, .7) * dpr });
    if (quieto) pinta(0);
  });

  // ---------- cada prompt, detrás de la ducha: apunta la trompa al perro ----------
  const NS = "http://www.w3.org/2000/svg";
  const SECO = [201, 154, 94], MOJADO = [130, 96, 58];
  document.querySelectorAll(".code").forEach((code) => {
    const caja = document.createElement("div");
    caja.className = "yard on";
    code.replaceWith(caja); caja.appendChild(code);
    caja.insertAdjacentHTML("beforeend", `<div class="hose" data-nofly role="button" tabindex="0" aria-label="Hold and aim the elephant's trunk to keep the water on the dog and reveal the prompt"><svg class="scene" aria-hidden="true"></svg><p class="count">Wet: <b>0</b>%</p><p class="cue">Hold to spray. Slide to aim.</p><span class="meter"><i></i></span></div>`);
    const patio = caja.querySelector(".hose"), svg = patio.querySelector(".scene"), cuenta = patio.querySelector(".count b"), aviso = patio.querySelector(".cue"), barra = patio.querySelector(".meter i");
    let w = 0, h = 0, u = 1, E, D, apunta = null, rocia = false, mojado = 0, hecho = false, antes = 0, gotea = 0;
    let trompa, arrugas, chorro, perro, pelo = [];
    const el = (tag, attrs, padre = svg) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); padre.appendChild(n); return n; };
    const punta = () => [apunta, h * .52];
    const aterriza = () => { const [tx] = punta(); return [tx + (tx - E[0]) * .55, h * .86]; };
    const dibuja = () => {
      const [tx, ty] = punta(), d = `M${E[0]} ${E[1] + 26 * u}Q${E[0] + (tx - E[0]) * .2} ${E[1] + 90 * u} ${tx} ${ty}`;
      trompa.setAttribute("d", d); arrugas.setAttribute("d", d);
      if (rocia && !hecho) {
        const [lx, ly] = aterriza();
        chorro.setAttribute("d", `M${tx} ${ty}Q${tx + (lx - tx) * .5} ${ty - 30 * u} ${lx} ${ly}`); chorro.setAttribute("opacity", 1);
      } else chorro.setAttribute("opacity", 0);
      const col = SECO.map((v, i) => Math.round(v + (MOJADO[i] - v) * Math.min(1, mojado)));
      pelo.forEach((n) => n.setAttribute("fill", `rgb(${col.join(",")})`));
      cuenta.textContent = Math.round(Math.min(1, mojado) * 100); barra.style.width = (Math.min(1, mojado) * 100).toFixed(1) + "%";
    };
    const monta = () => {
      w = patio.clientWidth; h = patio.clientHeight; if (!w || !h) return;
      u = Math.min(w, h * .66) / 210;
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`); svg.innerHTML = ""; pelo = [];
      E = [.66 * w, .27 * h];
      if (!D) D = [rnd(.24, .5) * w, .86 * h];
      if (apunta === null) apunta = .8 * w;
      // el abrevadero
      el("rect", { x: E[0] - 54 * u, y: h * .6, width: 108 * u, height: 22 * u, rx: 4 * u, fill: "#A9B0B4" });
      el("rect", { x: E[0] - 54 * u, y: h * .6, width: 108 * u, height: 5 * u, fill: "#7FB8D8" });
      // las patas y la cabeza del elefante
      for (const dx of [-30, 30]) el("rect", { x: E[0] + dx * u - 12 * u, y: E[1] + 20 * u, width: 24 * u, height: h * .6 - E[1] - 18 * u, rx: 8 * u, fill: "#7E7A76" });
      for (const lado of [-1, 1]) {
        el("ellipse", { cx: E[0] + lado * 44 * u, cy: E[1] - 2 * u, rx: 24 * u, ry: 30 * u, fill: "#8E8A86" });
        for (let k = 0; k < 6; k++) el("circle", { cx: E[0] + lado * (36 + (k % 3) * 7) * u, cy: E[1] + (-8 + Math.floor(k / 3) * 10) * u, r: 2 * u, fill: "#D9A8A0" });
      }
      el("ellipse", { cx: E[0], cy: E[1], rx: 40 * u, ry: 36 * u, fill: "#9A9692" });
      el("path", { d: `M${E[0] - 22 * u} ${E[1] - 26 * u}q${22 * u} ${-12 * u} ${44 * u} 0`, stroke: "#7E7A76", "stroke-width": 3 * u, fill: "none" });
      for (const lado of [-1, 1]) el("circle", { cx: E[0] + lado * 18 * u, cy: E[1] - 4 * u, r: 3 * u, fill: "#2A2018" });
      trompa = el("path", { fill: "none", stroke: "#9A9692", "stroke-width": 18 * u, "stroke-linecap": "round" });
      arrugas = el("path", { fill: "none", stroke: "#7E7A76", "stroke-width": 18 * u, "stroke-dasharray": `${1.5 * u} ${6 * u}` });
      // el perro tumbado, mirando a la derecha
      perro = el("g", { class: "perro", transform: `translate(${D[0]} ${D[1]})` });
      el("path", { d: `M${-36 * u} ${-8 * u}q${-14 * u} ${-18 * u} ${-4 * u} ${-24 * u}`, stroke: "#C99A5E", "stroke-width": 5 * u, fill: "none", "stroke-linecap": "round" }, perro);
      pelo.push(el("ellipse", { cx: 0, cy: -8 * u, rx: 38 * u, ry: 11 * u }, perro));
      pelo.push(el("ellipse", { cx: 34 * u, cy: -18 * u, rx: 12 * u, ry: 10 * u }, perro));
      pelo.push(el("path", { d: `M${30 * u} ${-26 * u}l${3 * u} ${-12 * u}l${7 * u} ${10 * u}ZM${38 * u} ${-26 * u}l${4 * u} ${-11 * u}l${5 * u} ${11 * u}Z` }, perro));
      el("ellipse", { cx: 44 * u, cy: -15 * u, rx: 5 * u, ry: 4 * u, fill: "#3A2A1A" }, perro);
      el("circle", { cx: 36 * u, cy: -20 * u, r: 1.6 * u, fill: "#111" }, perro);
      el("path", { d: `M${42 * u} ${-11 * u}q${3 * u} ${6 * u} ${-2 * u} ${8 * u}`, stroke: "#D86A7A", "stroke-width": 3 * u, fill: "none", "stroke-linecap": "round" }, perro);
      for (const x of [-26, 18]) pelo.push(el("rect", { x: x * u, y: -4 * u, width: 22 * u, height: 6 * u, rx: 3 * u }, perro));
      chorro = el("path", { class: "chorro", fill: "none", stroke: "#7FC4EC", "stroke-width": 4 * u, "stroke-linecap": "round", opacity: 0 });
      dibuja();
    };
    const di = (txt) => { aviso.textContent = txt; };
    const abre = () => {
      if (caja.classList.contains("off")) return;
      hecho = true; caja.classList.remove("on"); caja.classList.add("off");
      zum([15, 30, 50]);
      setTimeout(() => patio.remove(), quieto ? 0 : 1100);
    };
    const empapado = () => {
      hecho = true; rocia = false; dibuja();
      di("Then he shook it all off. Right in her face."); zum([30, 20, 30, 20, 30]);
      perro.setAttribute("transform", `translate(${D[0]} ${D[1] - 8 * u})`); perro.classList.add("shake");
      gotas(patio, D[0] + 20 * u, D[1] - 20 * u, 16, E[0] - D[0], E[1] - D[1], false);
      setTimeout(abre, quieto ? 0 : 1300);
    };
    const bucleAgua = (t) => {
      if (!patio.isConnected || hecho) return;
      const dt = Math.min(50, t - (antes || t)); antes = t;
      if (rocia) {
        const [lx, ly] = aterriza();
        if (Math.abs(lx - (D[0] + 6 * u)) < 40 * u) {
          mojado += dt / 1800; gotea -= dt;
          if (gotea <= 0) { gotas(patio, lx, ly - 10 * u, 2, 0, -24, false); gotea = 120; }
          di("Right on him. Keep going."); if (mojado >= 1) return empapado();
        } else di("Aim at the dog.");
        dibuja();
      }
      requestAnimationFrame(bucleAgua);
    };
    const apuntaA = (e) => {
      const r = patio.getBoundingClientRect(), k = patio.offsetWidth / (r.width || 1);
      apunta = Math.max(w * .08, Math.min(w * .94, (e.clientX - r.left) * k)); dibuja();
    };
    patio.addEventListener("pointerdown", (e) => {
      if (hecho) return;
      if (quieto) { mojado += .34; dibuja(); if (mojado >= 1) empapado(); return; }
      rocia = true; apuntaA(e); zum(8);
      try { patio.setPointerCapture(e.pointerId); } catch {}
    });
    patio.addEventListener("pointermove", (e) => { if (!hecho && (rocia || e.pointerType === "mouse")) apuntaA(e); });
    const corta = () => { rocia = false; if (!hecho) { dibuja(); di("Hold to spray. Slide to aim."); } };
    patio.addEventListener("pointerup", corta);
    patio.addEventListener("pointercancel", corta);
    patio.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      if (hecho) return;
      // con teclado: la trompa apunta sola al perro y rocía hasta empaparlo
      apunta = (D[0] + 6 * u + E[0] * .55) / 1.55; rocia = true; dibuja();
      if (quieto) { mojado = 1; empapado(); }
    });
    caja.parentElement.querySelector(".cp")?.addEventListener("click", abre);
    monta(); addEventListener("resize", monta);
    if (!w) requestAnimationFrame(monta);
    if (!quieto) requestAnimationFrame(bucleAgua);
  });

  // al copiar: el botón se sacude como un perro y suelta gotas
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    zum([8, 20, 8, 20]);
    if (quieto) return;
    b.classList.remove("wet"); void b.offsetWidth; b.classList.add("wet");
    const r = b.getBoundingClientRect();
    gotas(document.body, r.left + 10, r.top + r.height / 2, 6, -50, -10, true);
    gotas(document.body, r.right - 10, r.top + r.height / 2, 6, 50, -10, true);
  }));

  // ---------- reglas: salen mojadas y se secan ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((s) => {
    if (!quieto) s.classList.add("mojada");
    s.setAttribute("role", "button"); s.tabIndex = 0;
    s._seca = () => { if (quieto) return; s.classList.add("mojada"); void s.offsetWidth; setTimeout(() => s.classList.remove("mojada"), 60); zum([6, 30, 6]); };
    s.addEventListener("click", s._seca);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); s._seca(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s) && !s._vista)
      .forEach((s, n) => { s._vista = true; setTimeout(() => { s.classList.remove("mojada"); zum([6, 30, 6]); }, (quieto ? 0 : 500) + n * 350); });
  });
})();
