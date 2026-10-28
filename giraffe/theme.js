// GIRAFFE — el fondo es la sabana al atardecer: cielo cálido, sol bajo, acacias en el horizonte, una jirafa a contraluz
// a la derecha que baja el cuello a medida que se avanza y una tortuga que cruza abajo, muy despacio, una parada cada
// vez; hierba que se mece delante. Tocar la hierba hace brotar una flor roja. Cada prompt está detrás de la escena del
// vídeo: hay que arrastrar la cabeza de la jirafa (el cuello se curva siguiéndola) hasta la flor para arrancarla y luego
// hasta la tortuga para dejársela; ella se la come y la jirafa le da un lametazo al caparazón. Al copiar caen pétalos.
// Una tortuguita destapa cada regla caminando por encima. Cámara "drop".
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");

  // ---------- la sabana ----------
  const cv = document.createElement("canvas");
  cv.id = "savanna"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  let W, H, dpr, fondo = null, horizonte = 0, briznas = [];
  const flores = [];

  const pintaFondo = () => {
    fondo = document.createElement("canvas"); fondo.width = W; fondo.height = H;
    const c = fondo.getContext("2d");
    horizonte = H * .62;
    let g = c.createLinearGradient(0, 0, 0, horizonte);
    g.addColorStop(0, "#E9B57A"); g.addColorStop(1, "#F6DDA8");
    c.fillStyle = g; c.fillRect(0, 0, W, horizonte);
    c.fillStyle = "rgba(255,236,190,.9)"; c.beginPath(); c.arc(W * .3, horizonte - H * .06, Math.min(W, H) * .07, 0, 6.283); c.fill();
    g = c.createLinearGradient(0, horizonte, 0, H);
    g.addColorStop(0, "#D9AE66"); g.addColorStop(1, "#A8743E");
    c.fillStyle = g; c.fillRect(0, horizonte, W, H - horizonte);
    // acacias de copa plana a contraluz
    c.fillStyle = "rgba(86,62,36,.8)"; c.strokeStyle = "rgba(86,62,36,.8)";
    for (let k = 0; k < 6; k++) {
      const x = rnd(0, W), h = H * rnd(.05, .11);
      c.lineWidth = Math.max(1, h * .05); c.beginPath(); c.moveTo(x, horizonte); c.lineTo(x + h * .05, horizonte - h * .7); c.stroke();
      c.beginPath(); c.ellipse(x + h * .05, horizonte - h * .78, h * .6, h * .12, 0, 0, 6.283); c.fill();
    }
    briznas = []; for (let k = 0; k < 140; k++) briznas.push({ x: rnd(0, W), y: rnd(horizonte + H * .05, H), h: rnd(.03, .09) * H, f: rnd(0, 6) });
  };
  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = Math.round(innerWidth * dpr); H = cv.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    pintaFondo();
    flores.length = 0;
  };
  tam();
  addEventListener("resize", tam);

  const silueta = "rgba(70,46,24,.85)";
  // la jirafa a contraluz en el horizonte; "p" inclina el cuello de casi vertical (0) a bajado hacia la izquierda (1)
  const jirafa = (p) => {
    const u = H * .0011, x = W * .82, base = horizonte + 4 * dpr, lomo = base - 110 * u;
    cx.strokeStyle = cx.fillStyle = silueta; cx.lineCap = "round";
    cx.lineWidth = 9 * u;
    for (const dx of [-40, -28, 26, 38]) { cx.beginPath(); cx.moveTo(x + dx * u, base); cx.lineTo(x + dx * u, lomo); cx.stroke(); }
    cx.beginPath(); cx.ellipse(x, lomo, 60 * u, 26 * u, -.1, 0, 6.283); cx.fill();
    const th = .35 + 1.55 * p, L = 150 * u, sx = x - 44 * u, sy = lomo - 10 * u, hx = sx - Math.sin(th) * L, hy = sy - Math.cos(th) * L;
    cx.lineWidth = 18 * u; cx.beginPath(); cx.moveTo(sx, sy); cx.lineTo(hx, hy); cx.stroke();
    cx.beginPath(); cx.ellipse(hx, hy, 20 * u, 9 * u, Math.PI / 2 - th + .4, 0, 6.283); cx.fill();
  };
  const tortuga = (x, y, s) => {
    cx.fillStyle = silueta;
    cx.beginPath(); cx.ellipse(x, y, 26 * s, 16 * s, 0, Math.PI, 0); cx.fill();
    cx.beginPath(); cx.ellipse(x + 30 * s, y - 4 * s, 7 * s, 5 * s, 0, 0, 6.283); cx.fill();
    cx.fillRect(x - 18 * s, y, 6 * s, 7 * s); cx.fillRect(x + 12 * s, y, 6 * s, 7 * s);
  };
  const flor = (x, y, r, a) => {
    cx.save(); cx.translate(x, y); cx.globalAlpha = a; cx.fillStyle = "#D8231E";
    for (let k = 0; k < 5; k++) { const t = k / 5 * 6.283; cx.beginPath(); cx.ellipse(Math.cos(t) * r * .55, Math.sin(t) * r * .55, r * .5, r * .32, t, 0, 6.283); cx.fill(); }
    cx.fillStyle = "#F2C14E"; cx.beginPath(); cx.arc(0, 0, r * .22, 0, 6.283); cx.fill(); cx.restore();
  };

  let p = 0, objP = 0, ultimo = 0;
  const pinta = (t) => {
    const dt = Math.min(50, t - (ultimo || t)); ultimo = t;
    p += (objP - p) * (quieto ? 1 : Math.min(1, dt / 1400));
    cx.drawImage(fondo, 0, 0);
    jirafa(p);
    tortuga(W * (.12 + .45 * p), H * .9, dpr * Math.min(1.6, Math.min(W, H) / dpr / 360));
    for (let k = flores.length - 1; k >= 0; k--) {
      const f = flores[k], e = (t - f.t0) / 6000;
      if (e > 1) { flores.splice(k, 1); continue; }
      flor(f.x, f.y, f.r * Math.min(1, e * 8), e > .8 ? (1 - e) / .2 : 1);
    }
    cx.strokeStyle = "rgba(150,104,52,.8)"; cx.lineWidth = Math.max(1, dpr);
    for (const b of briznas) { const vaiven = quieto ? 0 : Math.sin(t * .0015 + b.f) * 4 * dpr; cx.beginPath(); cx.moveTo(b.x, b.y); cx.quadraticCurveTo(b.x + vaiven * .5, b.y - b.h * .5, b.x + vaiven, b.y - b.h); cx.stroke(); }
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

  // tocar la hierba: brota una flor roja
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a")) return;
    zum(10);
    const y = Math.max(horizonte + 10 * dpr, e.clientY * dpr);
    flores.push({ x: e.clientX * dpr, y, r: rnd(10, 16) * dpr * (.6 + .6 * (y - horizonte) / (H - horizonte)), t0: performance.now() });
    if (quieto) pinta(0);
  });

  // ---------- cada prompt, detrás de la escena: cabeza a la flor, flor a la tortuga ----------
  const NS = "http://www.w3.org/2000/svg";
  document.querySelectorAll(".code").forEach((code) => {
    const caja = document.createElement("div");
    caja.className = "reach on";
    code.replaceWith(caja); caja.appendChild(code);
    caja.insertAdjacentHTML("beforeend", `<div class="plain" data-nofly role="button" tabindex="0" aria-label="Drag the giraffe's head to the flower, then to the tortoise, to reveal the prompt"><svg class="scene" aria-hidden="true"></svg><p class="count">Step <b>1</b> / 2</p><p class="cue">Lower her head to the flower</p></div>`);
    const llano = caja.querySelector(".plain"), svg = llano.querySelector(".scene"), cuenta = llano.querySelector(".count b"), aviso = llano.querySelector(".cue");
    let w = 0, h = 0, s = 1, A, F, T, M, cab = null, paso = 0, hecho = false, arrastra = false, florEn = null;
    const el = (tag, attrs, padre = svg) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); padre.appendChild(n); return n; };
    let rama, florG, tort, cabeza, cuello, manchas, testa, lengua;
    const boca = () => [cab[0], cab[1] + 34 * s];
    const dibujaCuello = () => {
      const [hx, hy] = cab, c1 = [A[0] + (hx - A[0]) * .85, A[1] + (hy - A[1]) * .15], d = `M${A[0].toFixed(1)} ${A[1].toFixed(1)}Q${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${hx.toFixed(1)} ${(hy - 6 * s).toFixed(1)}`;
      cuello.setAttribute("d", d); manchas.setAttribute("d", d);
      const ang = Math.atan2(hy - c1[1], hx - c1[0]) * 180 / Math.PI - 90;
      testa.setAttribute("transform", `translate(${hx.toFixed(1)} ${hy.toFixed(1)}) rotate(${(ang * .35).toFixed(1)})`);
      if (florEn === "boca") { const [bx, by] = boca(); florG.setAttribute("transform", `translate(${bx.toFixed(1)} ${by.toFixed(1)})`); }
    };
    const monta = () => {
      w = llano.clientWidth; h = llano.clientHeight; if (!w || !h) return;
      s = Math.min(w, h * .66) / 210;
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`); svg.innerHTML = "";
      A = [-.25 * w, -.12 * h]; F = [.72 * w, .42 * h]; T = [.32 * w, .86 * h]; M = [T[0] + 64 * s, T[1] - 8 * s];
      if (!cab) cab = [.46 * w, .14 * h];
      el("rect", { x: 0, y: h * .58, width: w, height: h * .42, fill: "rgba(150,104,52,.18)" });
      rama = el("path", { d: `M${w + 6} ${h * .34}Q${w * .86} ${h * .4} ${F[0] + 6 * s} ${F[1] + 2 * s}M${w * .9} ${h * .37}l${-6 * s} ${-14 * s}M${w * .8} ${h * .405}l${-4 * s} ${10 * s}`, stroke: "#5A3A20", "stroke-width": 2.5 * s, fill: "none", "stroke-linecap": "round" });
      tort = el("g", { class: "tortuga", transform: `translate(${T[0]} ${T[1]})` });
      el("path", { d: `M${-48 * s} 0A${48 * s} ${34 * s} 0 0 1 ${48 * s} 0Z`, fill: "#C8B486" }, tort);
      for (const [x, y] of [[-24, -14], [0, -22], [24, -14], [-12, -2], [12, -2]]) el("path", { d: `M${(x - 8) * s} ${y * s}l${8 * s} ${-6 * s}l${8 * s} ${6 * s}l${-8 * s} ${6 * s}Z`, fill: "none", stroke: "#3E3020", "stroke-width": 2 * s }, tort);
      el("path", { d: `M${-48 * s} 0H${48 * s}V${4 * s}H${-48 * s}Z`, fill: "#8E8070" }, tort);
      for (const x of [-30, 22]) el("rect", { x: x * s, y: 2 * s, width: 10 * s, height: 14 * s, rx: 4 * s, fill: "#8E8A80" }, tort);
      const cabT = el("g", { class: "cabeza" }, tort);
      el("path", { d: `M${40 * s} ${-6 * s}Q${54 * s} ${-14 * s} ${66 * s} ${-10 * s}Q${70 * s} ${-4 * s} ${62 * s} ${-2 * s}Q${50 * s} 0 ${40 * s} ${2 * s}Z`, fill: "#8E8A80" }, cabT);
      el("circle", { cx: 58 * s, cy: -9 * s, r: 1.6 * s, fill: "#111" }, cabT);
      florG = el("g", { class: "flor", transform: `translate(${F[0]} ${F[1]})` });
      for (let k = 0; k < 5; k++) { const t = k / 5 * 6.283; el("ellipse", { cx: Math.cos(t) * 6 * s, cy: Math.sin(t) * 6 * s, rx: 6 * s, ry: 4 * s, transform: `rotate(${t * 57.3} ${Math.cos(t) * 6 * s} ${Math.sin(t) * 6 * s})`, fill: "#D8231E" }, florG); }
      el("circle", { cx: 0, cy: 0, r: 2.6 * s, fill: "#F2C14E" }, florG);
      cuello = el("path", { fill: "none", stroke: "#D9A456", "stroke-width": 26 * s, "stroke-linecap": "round" });
      manchas = el("path", { fill: "none", stroke: "#8A5226", "stroke-width": 14 * s, "stroke-dasharray": `${10 * s} ${16 * s}`, "stroke-linecap": "round", opacity: .8 });
      lengua = el("path", { fill: "none", stroke: "#4A2A5A", "stroke-width": 5 * s, "stroke-linecap": "round", d: "M0 0", opacity: 0 });
      testa = el("g", { class: "testa" });
      el("ellipse", { cx: 0, cy: 6 * s, rx: 14 * s, ry: 18 * s, fill: "#D9A456" }, testa);
      el("ellipse", { cx: 0, cy: 26 * s, rx: 9 * s, ry: 10 * s, fill: "#E8C48A" }, testa);
      for (const x of [-1, 1]) {
        el("line", { x1: 6 * x * s, y1: -8 * s, x2: 8 * x * s, y2: -22 * s, stroke: "#5A3A20", "stroke-width": 3.4 * s, "stroke-linecap": "round" }, testa);
        el("ellipse", { cx: 18 * x * s, cy: -4 * s, rx: 8 * s, ry: 3.6 * s, fill: "#D9A456" }, testa);
        el("circle", { cx: 8 * x * s, cy: 4 * s, r: 2.4 * s, fill: "#1A120A" }, testa);
        el("circle", { cx: 4 * x * s, cy: 31 * s, r: 1.2 * s, fill: "#3A2414" }, testa);
      }
      for (const [x, y] of [[-6, -2], [7, 12], [-4, 14]]) el("ellipse", { cx: x * s, cy: y * s, rx: 3.4 * s, ry: 2.6 * s, fill: "#8A5226" }, testa);
      if (florEn === "suelo") florG.setAttribute("transform", `translate(${M[0] + 4 * s} ${M[1] + 6 * s})`);
      dibujaCuello();
    };
    const di = (txt) => { aviso.textContent = txt; };
    const abre = () => {
      if (caja.classList.contains("off")) return;
      hecho = true; caja.classList.remove("on"); caja.classList.add("off");
      zum([15, 30, 50]);
      setTimeout(() => llano.remove(), quieto ? 0 : 1100);
    };
    // mueve la cabeza hasta un punto en "ms" (o de golpe)
    const lleva = (destino, ms, luego) => {
      if (quieto || !ms) { cab = destino; dibujaCuello(); return luego && luego(); }
      const desde = cab.slice(), t0 = performance.now();
      const paso1 = (t) => { const e = Math.min(1, (t - t0) / ms), k = e * e * (3 - 2 * e); cab = [desde[0] + (destino[0] - desde[0]) * k, desde[1] + (destino[1] - desde[1]) * k]; dibujaCuello(); if (e < 1) requestAnimationFrame(paso1); else if (luego) luego(); };
      requestAnimationFrame(paso1);
    };
    const coge = () => { paso = 1; florEn = "boca"; cuenta.textContent = 2; di("Now bring it down to him"); zum([10, 30, 10]); dibujaCuello(); };
    const deja = () => {
      paso = 2; hecho = true; arrastra = false; llano.classList.remove("held");
      florEn = "suelo"; florG.setAttribute("transform", `translate(${M[0] + 4 * s} ${M[1] + 6 * s})`);
      di("He says thanks. She says you're welcome."); zum([10, 30, 10]);
      tort.classList.add("chew");
      // el lametazo: la cabeza sube un poco sobre el caparazón y la lengua baja hasta él
      setTimeout(() => lleva([T[0] + 6 * s, T[1] - 80 * s], 600, () => {
        const [bx, by] = boca();
        lengua.setAttribute("d", `M${bx} ${by}Q${bx - 10 * s} ${by + 14 * s} ${T[0]} ${T[1] - 30 * s}`);
        const largo = lengua.getTotalLength ? lengua.getTotalLength() : 60;
        lengua.style.strokeDasharray = largo; lengua.style.strokeDashoffset = largo; lengua.setAttribute("opacity", 1);
        lengua.animate ? lengua.animate([{ strokeDashoffset: largo }, { strokeDashoffset: 0 }, { strokeDashoffset: largo }], { duration: 700, easing: "ease-in-out" }) : null;
        zum([20, 20, 20]);
        setTimeout(abre, quieto ? 0 : 1100);
      }), quieto ? 0 : 500);
    };
    const comprueba = () => {
      const [bx, by] = boca();
      if (paso === 0 && Math.hypot(bx - F[0], by - F[1]) < 24 * s) coge();
      else if (paso === 1 && Math.hypot(bx - M[0], by - (M[1] - 12 * s)) < 30 * s) deja();
    };
    llano.addEventListener("pointerdown", (e) => {
      if (hecho) return;
      if (quieto) { if (paso === 0) { cab = [F[0], F[1] - 34 * s]; dibujaCuello(); coge(); } else { cab = [M[0], M[1] - 46 * s]; dibujaCuello(); deja(); } return; }
      arrastra = true; llano.classList.add("held");
      try { llano.setPointerCapture(e.pointerId); } catch {}
    });
    llano.addEventListener("pointermove", (e) => {
      if (!arrastra || hecho) return;
      const r = llano.getBoundingClientRect(), k = llano.offsetWidth / (r.width || 1);
      const x = (e.clientX - r.left) * k, y = (e.clientY - r.top) * k;
      cab = [Math.max(10, Math.min(w - 10, x)), Math.max(10, Math.min(h - 40 * s, y - 34 * s))];
      dibujaCuello(); comprueba();
    });
    const suelta = () => { arrastra = false; llano.classList.remove("held"); };
    llano.addEventListener("pointerup", suelta);
    llano.addEventListener("pointercancel", suelta);
    llano.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      if (hecho) return;
      if (paso === 0) lleva([F[0], F[1] - 34 * s], 500, coge); else lleva([M[0], M[1] - 46 * s], 600, deja);
    });
    caja.parentElement.querySelector(".cp")?.addEventListener("click", abre);
    monta(); addEventListener("resize", monta);
    if (!w) requestAnimationFrame(monta);
  });

  // al copiar: caen pétalos rojos
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    zum([8, 20, 8]);
    if (quieto) return;
    const r = b.getBoundingClientRect();
    for (let k = 0; k < 7; k++) {
      const p = document.createElement("i"); p.className = "petal";
      p.style.cssText = `left:${r.left + r.width * rnd(.2, .8)}px;top:${r.top}px;--dx:${rnd(-50, 50).toFixed(0)}px;--r:${rnd(0, 180).toFixed(0)}deg;animation-delay:${(k * .07).toFixed(2)}s`;
      document.body.appendChild(p); p.addEventListener("animationend", () => p.remove());
    }
  }));

  // ---------- reglas: una tortuguita las destapa caminando ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  const fly = document.documentElement.classList.contains("fly");
  reglas.forEach((s) => {
    s.setAttribute("role", "button"); s.tabIndex = 0;
    if (fly && !quieto) { s.classList.add("hidden"); const t = document.createElement("i"); t.className = "walker"; t.textContent = "🐢"; s.appendChild(t); }
    s._camina = () => {
      if (quieto || !fly) return;
      s.classList.remove("walking"); s.classList.add("hidden"); void s.offsetWidth;
      s.classList.remove("hidden"); s.classList.add("walking");
      zum([6, 30, 6]);
    };
    s.addEventListener("click", s._camina);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); s._camina(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s) && !s._vista)
      .forEach((s, n) => { s._vista = true; setTimeout(s._camina, (quieto ? 0 : 500) + n * 350); });
  });
})();
