// TORNADO — el fondo es la pantalla del radar de un cazador de tormentas: anillos de distancia,
// carreteras, el haz que barre, tu posición (YOU) y una célula de tormenta con su gancho que se acerca
// a medida que se avanza; a mitad del recorrido aparece la marca del tornado (TVS) y el aviso pasa a
// TORNADO WARNING. Tocar el radar lanza un ping. Cada prompt se desbloquea sintonizando la radio del
// tiempo: se arrastra el dial hasta la frecuencia y el ruido se aclara. Copiar levanta un remolino de
// polvo. Las reglas se revelan con el barrido del radar. Cámara "track": en diagonal, como una
// tormenta que avanza por el radar.
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");

  // ---------- el radar ----------
  const cv = document.createElement("canvas");
  cv.id = "radar"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  const lectura = document.createElement("div");
  lectura.id = "readout"; lectura.setAttribute("aria-hidden", "true");
  document.body.appendChild(lectura);
  let W, H, dpr, C, R, sz, carreteras = [], gotas = [], pings = [];
  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = Math.round(innerWidth * dpr); H = cv.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    C = [W * .5, H * .56]; R = Math.hypot(W, H) * .62; sz = Math.min(W, H) * .2;
    // carreteras y lindes de condado: caminos quebrados de borde a borde
    carreteras = Array.from({ length: 8 }, (_, k) => {
      const vertical = k % 2, pts = [];
      let x = vertical ? rnd(.1, .9) * W : 0, y = vertical ? 0 : rnd(.1, .9) * H;
      for (let n = 0; n <= 10; n++) { pts.push([x, y]); if (vertical) { y += H / 10; x += rnd(-.03, .03) * W; } else { x += W / 10; y += rnd(-.03, .03) * H; } }
      return pts;
    });
    // la célula: gotas con su intensidad (más fuerte cuanto más cerca del núcleo)
    gotas = Array.from({ length: 28 }, (_, k) => {
      const a = rnd(0, 6.283), d = Math.pow(Math.random(), .7) * .9;
      return { ox: Math.cos(a) * d * 1.25, oy: Math.sin(a) * d * .8, r: rnd(.22, .42) * (1.1 - d * .5), i: 1 - d, ph: rnd(0, 6.28) };
    });
  };
  tam();
  addEventListener("resize", tam);

  let obj = 0, s = 0, ultimo = 0;
  const celda = (p) => [W * (.16 + .34 * p), H * (.16 + .34 * p)];
  const tu = () => [W * .62, H * .64];
  // las bandas de reflectividad, de fuera adentro: verde, amarillo, naranja, rojo y magenta
  const BANDAS = [
    [0, 1.7, "#1F8F45"], [.35, 1.1, "#D9C531"], [.55, .75, "#F08227"],
    [.7, .48, "#FF2A1F"], [.86, .24, "#D23AB8"],
  ];
  // la célula se pinta a un cuarto de resolución y se amplía suavizada: así las bandas se funden
  // como en un radar de verdad en vez de verse como círculos sueltos
  const cel = document.createElement("canvas"), ce = cel.getContext("2d");
  const pinta = (t) => {
    const dt = Math.min(50, t - (ultimo || t)); ultimo = t;
    s += (obj - s) * (quieto ? 1 : Math.min(1, dt / 600));
    cx.globalCompositeOperation = "source-over";
    cx.fillStyle = "#031009"; cx.fillRect(0, 0, W, H);
    // carreteras
    cx.strokeStyle = "rgba(110,210,140,.09)"; cx.lineWidth = 1.2 * dpr;
    for (const pts of carreteras) { cx.beginPath(); pts.forEach(([x, y], k) => k ? cx.lineTo(x, y) : cx.moveTo(x, y)); cx.stroke(); }
    // anillos de distancia y la cruz
    cx.strokeStyle = "rgba(110,220,140,.16)"; cx.lineWidth = 1 * dpr;
    cx.font = `${10 * dpr}px ui-monospace, Menlo, monospace`; cx.fillStyle = "rgba(120,230,150,.35)";
    for (let k = 1; k <= 5; k++) { const r = R * k / 5; cx.beginPath(); cx.arc(C[0], C[1], r, 0, 6.283); cx.stroke(); cx.fillText(`${k * 10} MI`, C[0] + 4 * dpr, C[1] - r + 12 * dpr); }
    cx.beginPath(); cx.moveTo(C[0] - R, C[1]); cx.lineTo(C[0] + R, C[1]); cx.moveTo(C[0], C[1] - R); cx.lineTo(C[0], C[1] + R); cx.stroke();
    // la célula de tormenta, banda a banda, y su gancho al suroeste
    const [px, py] = celda(s), giro = quieto ? 0 : t * .00018, q = 4;
    if (cel.width !== Math.ceil(W / q)) { cel.width = Math.ceil(W / q); cel.height = Math.ceil(H / q); }
    ce.clearRect(0, 0, cel.width, cel.height);
    for (const [umbral, k, color] of BANDAS) {
      ce.fillStyle = color;
      for (const g of gotas) {
        if (g.i < umbral) continue;
        const a = giro + g.ph, x = px + (g.ox + Math.cos(a) * .04) * sz, y = py + (g.oy + Math.sin(a) * .04) * sz;
        ce.beginPath(); ce.arc(x / q, y / q, g.r * k * sz * .55 / q, 0, 6.283); ce.fill();
      }
      // el gancho: una cola que se enrosca, más fina hacia la punta
      for (let n = 0; n < 12; n++) {
        const f = n / 11, a = Math.PI * .35 + f * Math.PI * 1.25 + giro * 2, rr = sz * (.62 - .3 * f);
        const x = px - sz * .35 + Math.cos(a) * rr, y = py + sz * .5 + Math.sin(a) * rr * .8, ii = .75 - f * .45;
        if (ii < umbral) continue;
        ce.beginPath(); ce.arc(x / q, y / q, sz * (.16 - .08 * f) * k * .9 / q, 0, 6.283); ce.fill();
      }
    }
    cx.save(); cx.globalAlpha = .78; cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = "high";
    cx.drawImage(cel, 0, 0, W, H);
    cx.restore();
    const fG = 1, aG = Math.PI * .35 + fG * Math.PI * 1.25 + giro * 2, rG = sz * .32;
    const punta = [px - sz * .35 + Math.cos(aG) * rG, py + sz * .5 + Math.sin(aG) * rG * .8];
    // el haz que barre
    if (!quieto) {
      const th = t * .0012;
      for (let k = 0; k < 26; k++) {
        const a0 = th - k * .028, a1 = th - (k + 1) * .028;
        cx.fillStyle = `rgba(90,235,130,${.13 * (1 - k / 26)})`;
        cx.beginPath(); cx.moveTo(C[0], C[1]); cx.lineTo(C[0] + Math.cos(a0) * R, C[1] + Math.sin(a0) * R); cx.lineTo(C[0] + Math.cos(a1) * R, C[1] + Math.sin(a1) * R); cx.fill();
      }
      cx.strokeStyle = "rgba(150,255,180,.55)"; cx.lineWidth = 1.5 * dpr;
      cx.beginPath(); cx.moveTo(C[0], C[1]); cx.lineTo(C[0] + Math.cos(th) * R, C[1] + Math.sin(th) * R); cx.stroke();
    }
    // la marca del tornado en la punta del gancho
    const aviso = s >= .45;
    if (aviso && (quieto || t % 900 < 620)) {
      const [x, y] = punta, k = 9 * dpr;
      cx.fillStyle = "#FF2A1F"; cx.strokeStyle = "#FFF"; cx.lineWidth = 1.5 * dpr;
      cx.beginPath(); cx.moveTo(x - k, y - k); cx.lineTo(x + k, y - k); cx.lineTo(x, y + k * .9); cx.closePath(); cx.fill(); cx.stroke();
      cx.fillStyle = "#FFF"; cx.fillText("TVS", x + k * 1.4, y + 3 * dpr);
    }
    // tú
    const [ux, uy] = tu();
    cx.fillStyle = "#5AA8FF"; cx.beginPath(); cx.arc(ux, uy, 5 * dpr, 0, 6.283); cx.fill();
    cx.strokeStyle = `rgba(90,168,255,${.5 + .3 * Math.sin(t * .006)})`; cx.lineWidth = 1.5 * dpr;
    cx.beginPath(); cx.arc(ux, uy, 11 * dpr, 0, 6.283); cx.stroke();
    cx.fillStyle = "#BFDDFF"; cx.fillText("YOU", ux + 14 * dpr, uy + 4 * dpr);
    // pings al tocar
    for (let k = pings.length - 1; k >= 0; k--) {
      const p = pings[k], e = (t - p.t0) / 1100;
      if (e >= 1) { pings.splice(k, 1); continue; }
      cx.strokeStyle = `rgba(150,255,180,${.8 * (1 - e)})`; cx.lineWidth = 2 * dpr;
      cx.beginPath(); cx.arc(p.x, p.y, (6 + e * 90) * dpr, 0, 6.283); cx.stroke();
      cx.fillStyle = `rgba(150,255,180,${1 - e})`; cx.beginPath(); cx.arc(p.x, p.y, 3 * dpr, 0, 6.283); cx.fill();
    }
    // la lectura
    const millas = (.4 + (1 - s) * 17.6).toFixed(1); // de 18 millas al principio a 0,4 al final
    const txt = aviso ? `TORNADO WARNING · TVS ${millas} MI NW · 35 MPH` : `SEVERE T-STORM · CELL ${millas} MI NW · 35 MPH`;
    if (lectura.textContent !== txt) { lectura.textContent = txt; lectura.classList.toggle("warn", aviso); }
  };
  const bucle = (t) => { pinta(t); requestAnimationFrame(bucle); };
  if (quieto) pinta(0); else requestAnimationFrame(bucle);
  addEventListener("resize", () => { if (quieto) pinta(0); });

  addEventListener("flyview", (e) => {
    const { index, total, dir } = e.detail;
    const antes = obj >= .45;
    obj = total > 1 ? index / (total - 1) : 0;
    if (!antes && obj >= .45) zum([60, 40, 60, 40, 60]);
    else if (dir) zum(8);
    if (quieto) pinta(0);
  });

  // tocar el radar: un ping
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a")) return;
    pings.push({ x: e.clientX * dpr, y: e.clientY * dpr, t0: performance.now() });
    if (pings.length > 8) pings.shift();
    zum(10);
    if (quieto) pinta(0);
  });

  // ---------- cada prompt: sintonizar la radio del tiempo ----------
  const MIN = 162.3, MAX = 162.65;
  const CANALES = [162.55, 162.475, 162.425];
  const NOAA = [162.4, 162.425, 162.45, 162.475, 162.5, 162.525, 162.55];
  const radios = [];
  document.querySelectorAll(".code").forEach((code, n) => {
    const caja = document.createElement("div");
    caja.className = "radio static";
    code.replaceWith(caja); caja.appendChild(code);
    const marcas = NOAA.map((f) => `<i style="left:${((f - MIN) / (MAX - MIN) * 100).toFixed(2)}%"></i>`).join("");
    caja.insertAdjacentHTML("beforeend", `<canvas class="snow" width="72" height="96" aria-hidden="true"></canvas><div class="lcd" aria-hidden="true"><span class="fq">162.300</span><small>MHz</small><span class="bars"><i></i><i></i><i></i><i></i><i></i></span></div><div class="tune-hint" aria-hidden="true">Tune to the weather channel</div><div class="dial" data-nofly><span class="ticks" aria-hidden="true">${marcas}</span><button class="knob" type="button" role="slider" aria-label="Tuning dial, find the weather channel" aria-valuemin="${MIN}" aria-valuemax="${MAX}" aria-valuenow="${MIN}"></button></div>`);
    const fq = caja.querySelector(".fq"), barras = caja.querySelectorAll(".bars i"), dial = caja.querySelector(".dial"), mando = caja.querySelector(".knob");
    const nieve = caja.querySelector(".snow"), nx = nieve.getContext("2d");
    const meta = CANALES[n % CANALES.length];
    let f = MIN, fijo = false, arr = null, anim = 0;
    const r = { caja, nieve, nx, senal: 0, fijo: () => fijo };
    radios.push(r);
    const pon = (v) => {
      f = Math.max(MIN, Math.min(MAX, v));
      const u = (f - MIN) / (MAX - MIN);
      mando.style.left = (u * 100).toFixed(2) + "%";
      mando.setAttribute("aria-valuenow", f.toFixed(3));
      fq.textContent = f.toFixed(3);
      const sen = Math.max(0, 1 - Math.abs(f - meta) / .05);
      r.senal = sen;
      caja.style.setProperty("--sig", sen.toFixed(3));
      barras.forEach((b, k) => b.classList.toggle("on", sen > k / 5 + .02));
      if (!fijo && Math.abs(f - meta) < .007) fija();
    };
    const fija = () => {
      if (fijo) return;
      fijo = true; cancelAnimationFrame(anim);
      f = meta; pon(meta);
      caja.classList.remove("static"); caja.classList.add("locked");
      fq.textContent = meta.toFixed(3) + " WX";
      zum([20, 40, 20]);
      setTimeout(() => { dial.remove(); caja.querySelector(".tune-hint")?.remove(); }, quieto ? 0 : 900);
    };
    // barrido automático hasta el canal (un toque en el mando, o Enter)
    const busca = () => {
      if (fijo) return;
      if (quieto) { fija(); return; }
      cancelAnimationFrame(anim);
      const desde = f, t0 = performance.now(), ms = 1400;
      const paso = (ahora) => {
        const e = Math.min(1, (ahora - t0) / ms), q = e < .5 ? 2 * e * e : 1 - Math.pow(-2 * e + 2, 2) / 2;
        pon(desde + (meta - desde) * q);
        if (e < 1 && !fijo) anim = requestAnimationFrame(paso); else fija();
      };
      anim = requestAnimationFrame(paso);
    };
    const aFrecuencia = (x) => { const b = dial.getBoundingClientRect(); return MIN + Math.max(0, Math.min(1, (x - b.left) / b.width)) * (MAX - MIN); };
    mando.addEventListener("pointerdown", (e) => {
      if (fijo) return;
      cancelAnimationFrame(anim);
      arr = { x: e.clientX, movido: false };
      try { mando.setPointerCapture(e.pointerId); } catch {}
    });
    mando.addEventListener("pointermove", (e) => {
      if (!arr || fijo) return;
      if (Math.abs(e.clientX - arr.x) > 4) arr.movido = true;
      if (arr.movido) {
        const antes = Math.round(f * 200);
        pon(aFrecuencia(e.clientX));
        if (Math.round(f * 200) !== antes) zum(4);
      }
    });
    mando.addEventListener("pointerup", () => { if (!arr) return; const movido = arr.movido; arr = null; if (!movido) busca(); });
    mando.addEventListener("pointercancel", () => { arr = null; });
    dial.addEventListener("click", (e) => { if (e.target === dial || e.target.closest(".ticks")) pon(aFrecuencia(e.clientX)); });
    mando.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); pon(f + (e.shiftKey ? .025 : .005)); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); pon(f - (e.shiftKey ? .025 : .005)); }
      else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); busca(); }
    });
    mando.addEventListener("click", (e) => { if (e.detail === 0) busca(); });
    caja.parentElement.querySelector(".cp")?.addEventListener("click", fija);
    pon(MIN);
  });
  // el ruido de la radio: estática que se aclara con la senal
  let ultimaNieve = 0;
  const nieva = (t) => {
    if (t - ultimaNieve > 66) {
      ultimaNieve = t;
      for (const r of radios) {
        if (r.fijo()) continue;
        const { nx } = r, img = nx.createImageData(72, 96), d = img.data;
        for (let k = 0; k < d.length; k += 4) { const v = Math.random() * 255; d[k] = d[k + 1] = d[k + 2] = v; d[k + 3] = 255; }
        nx.putImageData(img, 0, 0);
        // bandas horizontales, como en una mala senal
        nx.fillStyle = "rgba(0,0,0,.35)";
        for (let b = 0; b < 3; b++) nx.fillRect(0, Math.random() * 96, 72, rnd(2, 8));
      }
    }
    if (radios.some((r) => !r.fijo())) requestAnimationFrame(nieva);
  };
  if (!quieto) requestAnimationFrame(nieva);
  else radios.forEach((r) => { r.nx.fillStyle = "#555"; r.nx.fillRect(0, 0, 72, 96); });

  // al copiar: un remolino de polvo que sube desde el botón
  const sw = document.createElement("canvas");
  sw.id = "swirl"; sw.setAttribute("aria-hidden", "true");
  document.body.appendChild(sw);
  const sx = sw.getContext("2d");
  const motas = [];
  let girando = false, ultimoG = 0;
  const gira = (t) => {
    const d = Math.min(50, t - (ultimoG || t)) / 16.7; ultimoG = t;
    if (sw.width !== Math.round(innerWidth * dpr)) { sw.width = Math.round(innerWidth * dpr); sw.height = Math.round(innerHeight * dpr); sw.style.width = innerWidth + "px"; sw.style.height = innerHeight + "px"; }
    sx.clearRect(0, 0, sw.width, sw.height);
    for (let k = motas.length - 1; k >= 0; k--) {
      const m = motas[k];
      m.a += m.va * d; m.h += m.vh * d; m.r = 6 * dpr + m.h * .35; m.vida -= .012 * d;
      if (m.vida <= 0) { motas.splice(k, 1); continue; }
      const x = m.x + Math.cos(m.a) * m.r, y = m.y - m.h;
      sx.fillStyle = `rgba(${m.c},${m.vida * .85})`;
      sx.fillRect(x, y, m.s, m.s);
    }
    if (motas.length) requestAnimationFrame(gira); else { girando = false; sx.clearRect(0, 0, sw.width, sw.height); }
  };
  const remolino = (x, y) => {
    for (let k = 0; k < 90; k++) motas.push({ x: x * dpr, y: y * dpr, a: rnd(0, 6.28), va: rnd(.16, .3), h: rnd(0, 20) * dpr, vh: rnd(2.2, 4.4) * dpr, r: 0, vida: rnd(.7, 1), s: rnd(1.5, 3.5) * dpr, c: Math.random() < .5 ? "150,120,80" : "190,190,180" });
    if (!girando) { girando = true; ultimoG = 0; requestAnimationFrame(gira); }
  };
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    zum([10, 20, 10, 20, 10]);
    if (quieto) return;
    const r = b.getBoundingClientRect();
    remolino(r.left + r.width / 2, r.top + r.height / 2);
  }));

  // ---------- reglas: el barrido del radar las revela ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((s) => {
    const dentro = document.createElement("div");
    dentro.className = "inner";
    [...s.childNodes].forEach((n) => dentro.appendChild(n));
    s.appendChild(dentro);
    s.insertAdjacentHTML("beforeend", `<i class="beam" aria-hidden="true"></i><span class="hint" aria-hidden="true">Tap to sweep</span>`);
    s.setAttribute("role", "button"); s.tabIndex = 0;
    s._barre = () => {
      s.classList.remove("swept"); void s.offsetWidth; s.classList.add("swept");
      zum([6, 30, 6]);
    };
    s.addEventListener("click", s._barre);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); s._barre(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s) && !s.classList.contains("swept"))
      .forEach((s, n) => setTimeout(() => { if (!s.classList.contains("swept")) s._barre(); }, (quieto ? 0 : 1150) + n * 520));
  });
})();
