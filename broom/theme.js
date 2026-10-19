// BROOM — el fondo es el pinar visto desde el asiento del copiloto: troncos en tres capas que pasan a distinta
// velocidad, el musgo, la pista de tierra, el retrovisor y el marco de la puerta. Fuera va la chica con la
// escoba: al principio andando al lado del coche, luego salta y vuela a su lado, y al final sube por encima de
// los pinos mientras la vista se inclina hacia arriba. Tocar el bosque acelera el coche un momento. Cada
// prompt está bajo un montón de hojas que se barren con el dedo (o se apartan a toques). Al copiar sale una
// escoba volando del botón. Las reglas pasan por la ventanilla y frenan. Cámara "loop".
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");

  // ---------- el bosque desde la ventanilla ----------
  const cv = document.createElement("canvas");
  cv.id = "drive"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  let W, H, dpr, capas = [], suelo = null;

  // una capa de pinos en una tira que empalma consigo misma; más alto que la pantalla para poder mirar arriba
  const capa = (n, ancho, tronco, copa, base) => {
    const c = document.createElement("canvas"), g = c.getContext("2d");
    c.width = W; c.height = Math.round(H * 1.4);
    const pie = H * 1.02;
    for (let k = 0; k < n; k++) {
      const x = rnd(0, W), w = rnd(ancho[0], ancho[1]) * dpr, alto = rnd(.25, .4) * H;
      for (const dx of [-W, 0, W]) {
        const X = x + dx; if (X < -w * 4 || X > W + w * 4) continue;
        // la copa: un pino estrecho, en pisos
        g.fillStyle = copa;
        for (let p = 0; p < 6; p++) { const y = alto * .3 + p * H * .05, r = w * (2.2 + p * .55); g.beginPath(); g.moveTo(X, y - H * .06); g.lineTo(X + r, y + H * .04); g.lineTo(X - r, y + H * .04); g.closePath(); g.fill(); }
        // el tronco, con el lado de la sombra
        const gr = g.createLinearGradient(X - w / 2, 0, X + w / 2, 0);
        gr.addColorStop(0, tronco[0]); gr.addColorStop(.6, tronco[1]); gr.addColorStop(1, tronco[2]);
        g.fillStyle = gr; g.fillRect(X - w / 2, alto, w, pie - alto);
        if (base) { g.fillStyle = base; g.beginPath(); g.ellipse(X, pie, w * 1.4, w * .35, 0, Math.PI, 0); g.fill(); }
      }
    }
    return c;
  };

  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = Math.round(innerWidth * dpr); H = cv.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    const k = Math.min(1.4, W / dpr / 500);
    capas = [
      { v: .02, c: capa(46, [2.5 * k, 5 * k], ["#5E564A", "#6E6457", "#4C463D"], "rgba(38,52,36,.8)", null) },
      { v: .06, c: capa(20, [7 * k, 13 * k], ["#6A4630", "#8B5D3E", "#4E3424"], "#24321F", "rgba(70,88,44,.9)") },
      { v: .17, c: capa(7, [22 * k, 38 * k], ["#55361F", "#7E5235", "#3E2817"], "#1E2A19", "rgba(80,100,48,.95)") },
    ];
    // la pista de tierra con sus piedrecitas, también en tira
    suelo = document.createElement("canvas"); suelo.width = W; suelo.height = Math.round(H * .3);
    const g = suelo.getContext("2d");
    g.fillStyle = "#B6A083"; g.fillRect(0, 0, W, suelo.height);
    for (let i = 0; i < 260; i++) {
      const x = rnd(0, W), y = rnd(0, suelo.height), r = (.6 + 2.6 * y / suelo.height) * dpr;
      g.fillStyle = Math.random() < .5 ? "rgba(120,104,84,.55)" : "rgba(230,220,200,.5)";
      for (const dx of [-W, 0, W]) { g.beginPath(); g.ellipse(x + dx, y, r * 1.3, r, 0, 0, 6.283); g.fill(); }
    }
  };
  tam();
  addEventListener("resize", tam);

  // la chica en la escoba, de perfil mirando hacia donde va el coche
  const bruja = (x, y, s, sentada, t) => {
    cx.save(); cx.translate(x, y); cx.scale(s, s);
    const paso = Math.sin(t * .012);
    // el palo y las ramitas
    cx.strokeStyle = "#D9C49A"; cx.lineWidth = 2.2; cx.lineCap = "round";
    cx.beginPath(); cx.moveTo(-34, -40); cx.lineTo(40, -56); cx.stroke();
    cx.fillStyle = "#6B4A2B";
    cx.beginPath(); cx.moveTo(-30, -41); cx.lineTo(-64, -54); cx.lineTo(-70, -38); cx.lineTo(-64, -24); cx.closePath(); cx.fill();
    cx.strokeStyle = "#4F3520"; cx.lineWidth = .8;
    for (let k = 0; k < 7; k++) { cx.beginPath(); cx.moveTo(-31, -40); cx.lineTo(-68, -52 + k * 4); cx.stroke(); }
    // las piernas y las botas
    cx.strokeStyle = "#111"; cx.lineWidth = 5;
    if (sentada) {
      cx.beginPath(); cx.moveTo(-4, -44); cx.lineTo(-2, -26); cx.lineTo(-16, -14); cx.stroke();
      cx.beginPath(); cx.moveTo(2, -44); cx.lineTo(6, -27); cx.lineTo(-8, -16); cx.stroke();
    } else {
      cx.beginPath(); cx.moveTo(-2, -42); cx.lineTo(-2 + paso * 8, -20); cx.lineTo(paso * 10, 0); cx.stroke();
      cx.beginPath(); cx.moveTo(2, -42); cx.lineTo(2 - paso * 8, -20); cx.lineTo(-paso * 10, 0); cx.stroke();
    }
    // la falda gris, el jersey rojo, el cinturón, la cabeza y el pelo
    cx.fillStyle = "#8D9095"; cx.beginPath(); cx.moveTo(-9, -66); cx.lineTo(9, -66); cx.lineTo(13, -38); cx.lineTo(-13, -38); cx.closePath(); cx.fill();
    cx.fillStyle = "#B3172A"; cx.beginPath(); cx.moveTo(-10, -92); cx.lineTo(9, -92); cx.lineTo(10, -66); cx.lineTo(-10, -66); cx.closePath(); cx.fill();
    cx.strokeStyle = "#B3172A"; cx.lineWidth = 5; cx.beginPath(); cx.moveTo(4, -86); cx.lineTo(16, -66); cx.lineTo(24, -52); cx.stroke();
    cx.fillStyle = "#111"; cx.fillRect(-10, -68, 20, 3);
    cx.fillStyle = "#E5C2A6"; cx.beginPath(); cx.arc(2, -100, 7, 0, 6.283); cx.fill();
    cx.fillStyle = "#3A2418"; cx.beginPath(); cx.moveTo(-6, -106); cx.quadraticCurveTo(2, -112, 8, -104); cx.quadraticCurveTo(2, -100, -2, -96); cx.quadraticCurveTo(-8, -84, -12, -70); cx.quadraticCurveTo(-12, -86, -6, -106); cx.fill();
    cx.restore();
  };

  let p = 0, objP = 0, ultimo = 0, camino = 0, prisa = 0;
  const pinta = (t) => {
    const dt = Math.min(50, t - (ultimo || t)); ultimo = t;
    p += (objP - p) * (quieto ? 1 : Math.min(1, dt / 900));
    if (prisa > 0) prisa = Math.max(0, prisa - dt / 1200);
    camino += quieto ? 0 : dt * dpr * (1 + 2.5 * prisa);
    const sube = Math.max(0, (p - .65) / .35), mira = H * .48 * sube;   // al final la vista se inclina hacia arriba
    // el cielo y el fondo verde del bosque
    let g = cx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#DCDFDA"); g.addColorStop(.35 + sube * .2, "#C3C9BE"); g.addColorStop(.62, "#4A573C");
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    cx.save(); cx.translate(0, mira);
    g = cx.createLinearGradient(0, H * .2, 0, H * .62);
    g.addColorStop(0, "rgba(58,72,48,0)"); g.addColorStop(1, "rgba(58,72,48,.9)");
    cx.fillStyle = g; cx.fillRect(0, H * .2, W, H * .45);
    // las capas de pinos, de lejos a cerca, cada una a su velocidad
    for (const { v, c } of capas) { const off = (camino * v) % W; cx.drawImage(c, -off, -H * .4); cx.drawImage(c, W - off, -H * .4); }
    // el musgo y la pista
    cx.fillStyle = "#5C6C37"; cx.fillRect(0, H * .62, W, H * .12);
    const off = (camino * .22) % W; cx.drawImage(suelo, -off, H * .74); cx.drawImage(suelo, W - off, H * .74);
    cx.restore();
    // ella: andando, el salto, volando al lado del coche y subiendo por encima de los pinos
    const tam0 = Math.min(W, H * .6) / 260, pies = H * .9 + mira;
    const vuela = Math.max(0, Math.min(1, (p - .28) / .12)), alto = H * .07 * vuela + Math.sin(t * .004) * H * .004 * vuela;
    const yy = pies - alto - (H * .9 + mira - H * .1) * Math.pow(sube, 1.2);
    bruja(W * (.6 + .12 * sube), yy, tam0 * dpr * (1 - .82 * sube), vuela > .5, quieto ? 0 : t);
    // el coche: el marco de la puerta y el retrovisor
    cx.fillStyle = "#121314";
    cx.beginPath(); cx.moveTo(0, H * .8); cx.lineTo(W * .62, H); cx.lineTo(0, H); cx.closePath(); cx.fill();
    const mx = 0, my = H * .56, mw = Math.min(W * .2, 130 * dpr), mh = mw * .55;
    cx.fillStyle = "#1A1C1E"; cx.beginPath(); cx.ellipse(mx + mw * .45, my, mw * .62, mh * .62, 0, 0, 6.283); cx.fill();
    g = cx.createLinearGradient(0, my - mh / 2, 0, my + mh / 2);
    g.addColorStop(0, "#B9C1C4"); g.addColorStop(1, "#6E777B");
    cx.fillStyle = g; cx.beginPath(); cx.ellipse(mx + mw * .42, my, mw * .5, mh * .45, 0, 0, 6.283); cx.fill();
  };
  const bucle = (t) => { requestAnimationFrame(bucle); pinta(t); };
  if (quieto) pinta(0); else requestAnimationFrame(bucle);
  addEventListener("resize", () => { if (quieto) pinta(0); });

  addEventListener("flyview", (e) => {
    const { index, total, dir } = e.detail;
    objP = total > 1 ? index / (total - 1) : 0;
    if (dir) zum(dir > 0 ? [8, 24, 8] : 8);
    if (quieto) pinta(0);
  });

  // tocar el bosque: el coche acelera un momento
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a")) return;
    zum([14, 30, 14]);
    prisa = 1;
  });

  // ---------- cada prompt, bajo un montón de hojas que se barren ----------
  const tonos = ["#C4572A", "#D88A2E", "#8C3B1E", "#E3B04B", "#A4652E", "#6E4A2A"];
  document.querySelectorAll(".code").forEach((code) => {
    const caja = document.createElement("div");
    caja.className = "leaves on";
    code.replaceWith(caja); caja.appendChild(code);
    caja.insertAdjacentHTML("beforeend", `<canvas class="leafbed" data-nofly role="button" tabindex="0" aria-label="Sweep the leaves to reveal the prompt"></canvas><p class="hint"><b>Sweep</b> the leaves</p>`);
    const lienzo = caja.querySelector(".leafbed"), g = lienzo.getContext("2d");
    let w = 0, h = 0, r = 1, hojas = [], hecho = false, corre = false, antes = 0, arr = null, marca = 0, intentos = 0;
    const mide = () => {
      const b = lienzo.getBoundingClientRect();
      if (!b.width || !b.height) return false;
      const nw = b.width, nh = b.height;
      if (hojas.length && w) for (const o of hojas) { o.x *= nw / w; o.y *= nh / h; }
      w = nw; h = nh; r = Math.min(2, devicePixelRatio || 1);
      lienzo.width = Math.round(w * r); lienzo.height = Math.round(h * r);
      if (!hojas.length) {
        const n = Math.max(140, Math.min(420, Math.round(w * h / 230)));
        for (let k = 0; k < n; k++) hojas.push({ x: rnd(-6, w + 6), y: rnd(-6, h + 6), vx: 0, vy: 0, a: rnd(0, 6.283), va: 0, s: rnd(7, 14), c: tonos[k % tonos.length], aguja: Math.random() < .22, fuera: false });
      }
      dibuja(); return true;
    };
    const dibuja = () => {
      g.setTransform(r, 0, 0, r, 0, 0);
      g.fillStyle = "#2A2219"; g.fillRect(0, 0, w, h);
      const m = g.createRadialGradient(w * .3, h * .7, 0, w * .3, h * .7, w * .8);
      m.addColorStop(0, "rgba(80,96,44,.35)"); m.addColorStop(1, "rgba(80,96,44,0)");
      g.fillStyle = m; g.fillRect(0, 0, w, h);
      for (const o of hojas) {
        if (o.fuera) continue;
        g.save(); g.translate(o.x, o.y); g.rotate(o.a);
        if (o.aguja) {
          g.strokeStyle = "#5B4326"; g.lineWidth = 1;
          for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(0, 0); g.lineTo(o.s * Math.cos(k * .3), o.s * Math.sin(k * .3)); g.stroke(); }
        } else {
          g.fillStyle = o.c; g.beginPath(); g.ellipse(0, 0, o.s, o.s * .55, 0, 0, 6.283); g.fill();
          g.strokeStyle = "rgba(60,30,10,.5)"; g.lineWidth = .8; g.beginPath(); g.moveTo(-o.s, 0); g.lineTo(o.s, 0); g.stroke();
        }
        g.restore();
      }
    };
    const suelta = (lado) => {
      if (hecho) return;
      hecho = true;
      for (const o of hojas) { o.vx += (lado || 1) * rnd(500, 900); o.vy -= rnd(80, 260); o.va += rnd(-10, 10); }
      caja.classList.remove("on"); caja.classList.add("off");
      zum([20, 30, 50]);
      arranca();
      setTimeout(() => lienzo.remove(), quieto ? 0 : 1000);
    };
    const mueve = (t) => {
      const dt = Math.min(50, t - (antes || t)) / 1000; antes = t;
      const roce = Math.pow(.03, dt);
      let vivas = 0, fuera = 0;
      for (const o of hojas) {
        if (o.fuera) { fuera++; continue; }
        o.x += o.vx * dt; o.y += o.vy * dt; o.a += o.va * dt;
        o.vx *= roce; o.vy *= roce; o.va *= roce;
        if (o.x < -24 || o.x > w + 24 || o.y < -24 || o.y > h + 24) { o.fuera = true; fuera++; continue; }
        if (Math.abs(o.vx) + Math.abs(o.vy) > 4) vivas++;
      }
      dibuja();
      const quitado = hojas.length ? fuera / hojas.length : 0;
      if (Math.floor(quitado * 10) > marca) { marca = Math.floor(quitado * 10); zum(6); }
      if (!hecho && quitado > .45) suelta(arr && arr.vx < 0 ? -1 : 1);
      if (vivas || arr) requestAnimationFrame(mueve); else { corre = false; antes = 0; }
    };
    const arranca = () => { if (!corre) { corre = true; antes = 0; requestAnimationFrame(mueve); } };
    // la escoba: empuja las hojas que pilla en el sentido del gesto y un poco hacia fuera
    const barre = (x, y, vx, vy, radio, fuerza) => {
      for (const o of hojas) {
        if (o.fuera) continue;
        const dx = o.x - x, dy = o.y - y, d = Math.hypot(dx, dy);
        if (d > radio) continue;
        const k = 1 - d / radio, nx = d ? dx / d : rnd(-1, 1), ny = d ? dy / d : rnd(-1, 1);
        o.vx += (vx * 1.1 + nx * fuerza) * k; o.vy += (vy * 1.1 + ny * fuerza - 40) * k; o.va += rnd(-9, 9) * k;
      }
      arranca();
    };
    const punto = (e) => { const b = lienzo.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
    lienzo.addEventListener("pointerdown", (e) => {
      if (hecho || (!w && !mide())) return;
      try { lienzo.setPointerCapture(e.pointerId); } catch {}
      const [x, y] = punto(e);
      arr = { x, y, t: performance.now(), vx: 0, movido: false };
      barre(x, y, 0, 0, 64, 360);   // un toque aparta las hojas de alrededor
      zum(8);
    });
    lienzo.addEventListener("pointermove", (e) => {
      if (!arr || hecho) return;
      const [x, y] = punto(e), ahora = performance.now(), dt = Math.max(8, ahora - arr.t) / 1000;
      const vx = (x - arr.x) / dt, vy = (y - arr.y) / dt;
      if (Math.hypot(x - arr.x, y - arr.y) > 2) { arr.movido = true; barre(x, y, vx, vy, 46, 80); }
      arr.x = x; arr.y = y; arr.t = ahora; arr.vx = vx;
    });
    const fin = () => { arr = null; };
    lienzo.addEventListener("pointerup", fin);
    lienzo.addEventListener("pointercancel", fin);
    lienzo.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      if (!w && !mide()) return;
      intentos++;
      // con el teclado: una pasada de escoba de lado a lado por una franja
      const y = h * (.25 + .25 * ((intentos - 1) % 3));
      for (let x = 0; x <= w; x += 20) barre(x, y, 900, 0, 70, 60);
      if (intentos >= 3) suelta(1);
    });
    caja.parentElement.querySelector(".cp")?.addEventListener("click", () => { if (!w) mide(); suelta(1); });
    if (quieto) { caja.classList.remove("on"); caja.classList.add("off"); lienzo.remove(); hecho = true; return; }
    if (!mide()) new ResizeObserver((_, ob) => { if (mide()) ob.disconnect(); }).observe(lienzo);
    addEventListener("resize", () => { if (!hecho && w) mide(); });
  });

  // al copiar: una escoba sale volando del botón dejando un rastro
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    zum([10, 30, 10]);
    if (quieto) return;
    const r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top, dx = rnd(60, 140);
    const f = document.createElement("span");
    f.className = "flyer"; f.textContent = "🧹";
    f.style.cssText = `left:${x}px;top:${y}px;--dx:${dx.toFixed(0)}px`;
    document.body.appendChild(f); f.addEventListener("animationend", () => f.remove());
    for (let k = 1; k <= 8; k++) setTimeout(() => {
      const q = Math.pow(k / 9, 1.8), d = document.createElement("i");
      d.className = "trail"; d.style.left = (x + dx * q) + "px"; d.style.top = (y - innerHeight * .7 * q) + "px";
      document.body.appendChild(d); d.addEventListener("animationend", () => d.remove());
    }, k * 110);
  }));

  // ---------- reglas: pasan por la ventanilla y frenan ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((s) => {
    s.classList.add("wait");
    s.setAttribute("role", "button"); s.tabIndex = 0;
    s._pasa = () => {
      s.classList.remove("pass", "wait");
      void s.offsetWidth;
      s.classList.add("pass");
      zum([6, 20, 12]);
    };
    s.addEventListener("click", s._pasa);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); s._pasa(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s) && !s._vista)
      .forEach((s, n) => { s._vista = true; setTimeout(s._pasa, (quieto ? 0 : 650) + n * 380); });
  });
})();
