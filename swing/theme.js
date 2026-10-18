// SWING — el fondo es el sueño: cielo azul, un mar de cúmulos que deriva despacio con la luz lima subiendo
// entre ellos, la ladera de hierba en S a la derecha y un columpio azul colgado de dos cuerdas que salen del
// cielo. El columpio es un péndulo de verdad (una ida y vuelta cada tres segundos): tocar el cielo lo empuja
// y cada cambio de parada le da un empujón. Al avanzar, la mirada sube: el horizonte baja, la hierba se va
// abajo y el columpio se acerca. Cada prompt está tapado por una ventana de cielo con un columpio pequeño que
// hay que empujar cada vez más alto hasta que da la vuelta y el cielo se deshace. Copiar suelta nubecitas.
// Las reglas tienen los ojos cerrados y se despiertan parpadeando. Cámara "swing".
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");

  // ---------- el sueño ----------
  const cv = document.createElement("canvas");
  cv.id = "dream"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  const mar = document.createElement("canvas"), mx = mar.getContext("2d");
  const prado = document.createElement("canvas"), px = prado.getContext("2d");
  let W, H, dpr, Hm;

  // el borde de la ladera: una S que baja de arriba a la derecha hacia abajo a la izquierda
  const Y0 = .42;
  const borde = (y) => { const s = Math.max(0, (y / H - Y0) / (1 - Y0)); return W * (.64 - .66 * s + .11 * Math.sin(s * Math.PI * 2)); };
  const cresta = (x) => H * (Y0 - .05 * Math.max(0, (x / W - .64) / .36));
  const dentro = (x, y) => y > cresta(x) && (y < H * Y0 ? x > W * .64 : x > borde(y));

  // un cúmulo: un montón de bolas con la cima al sol (arriba a la derecha) y la base gris
  const cumulo = (c, x, y, s) => {
    const bolas = [], nb = Math.min(34, 12 + Math.round(s / (7 * dpr)));
    for (let k = 0; k < nb; k++) {
      const u = rnd(-1, 1);   // perfil de cúpula: más alto en el centro
      bolas.push([x + u * s, y - (1 - u * u) * s * rnd(.15, .85), s * rnd(.16, .42) * (1.2 - Math.abs(u) * .5)]);
    }
    // tres pasadas: la sombra de abajo teñida de lima, el gris de los flancos y la cima blanca al sol
    for (const [col, ox, oy, k] of [["#BCD3A0", -.12, .18, 1], ["#D8DFE9", -.05, .07, .97], ["#FBFCFE", .07, -.09, .86]]) {
      c.fillStyle = col;
      for (const [bx, by, r] of bolas) { c.beginPath(); c.arc(bx + r * ox, by + r * oy, r * k, 0, 6.283); c.fill(); }
    }
  };

  // el mar de nubes, en una tira que empalma consigo misma para poder derivar sin fin
  const pintaMar = () => {
    const c = mx;
    let g = c.createLinearGradient(0, 0, 0, Hm);
    g.addColorStop(0, "#D9E7F3"); g.addColorStop(.08, "#D2EDA8"); g.addColorStop(.22, "#C8F43A"); g.addColorStop(1, "#BDF01C");
    c.fillStyle = g; c.fillRect(0, 0, W, Hm);
    for (let k = 0; k < 22; k++) {
      const x = rnd(0, W), y = rnd(.12, 1) * Hm, R = rnd(.12, .28) * W;
      for (const dx of [-W, 0, W]) {
        const rg = c.createRadialGradient(x + dx, y, 0, x + dx, y, R);
        rg.addColorStop(0, "rgba(214,255,40,.9)"); rg.addColorStop(1, "rgba(204,255,0,0)");
        c.fillStyle = rg; c.fillRect(x + dx - R, y - R, R * 2, R * 2);
      }
    }
    // filas de lejos a cerca: cada vez más grandes
    for (let y = Hm * .02, f = 0; y < Hm * 1.05; f++) {
      const s = (9 + 170 * Math.pow(y / Hm, 1.15)) * dpr * Math.min(1.3, W / dpr / 420);
      const n = Math.ceil(W / (s * 2.6));
      for (let k = 0; k < n; k++) {
        const x = (k + rnd(-.3, .3) + (f % 2) * .5) * W / n;
        for (const dx of [-W, 0, W]) if (x + dx > -s * 2 && x + dx < W + s * 2) cumulo(c, x + dx, y + rnd(-.2, .2) * s, s);
      }
      y += s * .75;
    }
    // la neblina del horizonte
    g = c.createLinearGradient(0, 0, 0, Hm * .3);
    g.addColorStop(0, "rgba(222,236,248,.85)"); g.addColorStop(1, "rgba(222,236,248,0)");
    c.fillStyle = g; c.fillRect(0, 0, W, Hm * .3);
  };

  // la ladera: hierba de prado, más clara al sol por la derecha, con briznas que asoman por el borde
  const pintaPrado = () => {
    const c = px;
    c.clearRect(0, 0, W, H);
    c.beginPath(); c.moveTo(W, cresta(W));
    for (let x = W; x >= W * .64; x -= 4 * dpr) c.lineTo(x, cresta(x));
    for (let y = H * Y0; y <= H; y += 4 * dpr) c.lineTo(borde(y), y);
    c.lineTo(Math.min(0, borde(H)), H); c.lineTo(W, H); c.closePath();
    const g = c.createLinearGradient(W * .3, H * .4, W, H);
    g.addColorStop(0, "#2C5210"); g.addColorStop(.5, "#22440B"); g.addColorStop(1, "#193408");
    c.fillStyle = g; c.fill();
    c.save(); c.clip();
    const tonos = ["#1E3A09", "#2A4D0E", "#386214", "#4A7A1C", "#6E9B34"];
    const n = Math.min(14000, Math.round(W * H / (30 * dpr * dpr)));
    c.lineCap = "round";
    for (let k = 0; k < n; k++) {
      const x = rnd(W * .02, W), y = rnd(H * .36, H * 1.02);
      if (!dentro(x, y)) continue;
      const cerca = y / H, L = (5 + 26 * cerca * cerca) * dpr, sol = x / W;
      c.strokeStyle = tonos[Math.min(4, Math.floor(rnd(0, 3) + sol * 2))];
      c.lineWidth = (.6 + 1.6 * cerca) * dpr;
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + rnd(-2, 2) * dpr, y - L * .6, x + rnd(-6, 6) * dpr * cerca, y - L); c.stroke();
    }
    c.restore();
    // briznas que asoman por el borde y por la cresta, a contraluz
    for (let y = H * Y0; y < H; y += 3 * dpr) {
      const x = borde(y), cerca = y / H, L = rnd(6, 18) * dpr * (.6 + cerca);
      c.strokeStyle = Math.random() < .3 ? "#7FAE3E" : "#2E5410"; c.lineWidth = (.7 + cerca) * dpr;
      c.beginPath(); c.moveTo(x + 3 * dpr, y); c.quadraticCurveTo(x - L * .2, y - L * .5, x - rnd(2, 9) * dpr, y - L); c.stroke();
    }
    for (let x = W * .64; x < W; x += 3 * dpr) {
      const y = cresta(x), L = rnd(4, 11) * dpr;
      c.strokeStyle = Math.random() < .4 ? "#8DBB4B" : "#386214"; c.lineWidth = .8 * dpr;
      c.beginPath(); c.moveTo(x, y + 3 * dpr); c.lineTo(x + rnd(-3, 3) * dpr, y - L); c.stroke();
    }
  };

  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = mar.width = prado.width = Math.round(innerWidth * dpr);
    H = cv.height = prado.height = Math.round(innerHeight * dpr);
    Hm = mar.height = Math.round(H * .8);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    pintaMar(); pintaPrado();
  };
  tam();
  addEventListener("resize", tam);

  // el columpio grande: un péndulo, una ida y vuelta cada 3,2 s
  const w0 = 2 * Math.PI / 3.2;
  let th = .06, om = 0, p = 0, objP = 0, ultimo = 0;
  let geo = null;
  const columpio = (t) => {
    const hz = H * (.4 + .18 * p);
    const piv = [W * (.52 - .04 * p), -H * .9];
    const sy = hz + H * .07, L = sy - piv[1];
    const sx = piv[0] + L * Math.sin(th), syy = piv[1] + L * Math.cos(th);
    const ancho = Math.min(W, H * .6) * (.2 + .14 * p), grueso = ancho * .1;
    geo = { x: sx, y: syy };
    cx.save(); cx.translate(sx, syy); cx.rotate(-th);
    // las cuerdas: suben paralelas hasta salir por arriba, brillando al sol
    cx.strokeStyle = "rgba(255,255,255,.92)"; cx.lineWidth = Math.max(1.2, ancho / 90) * dpr * .8;
    cx.shadowColor = "rgba(255,255,255,.8)"; cx.shadowBlur = 6 * dpr;
    for (const lado of [-.43, .43]) { cx.beginPath(); cx.moveTo(ancho * lado, 0); cx.lineTo(ancho * lado, -syy * 1.2 - 40 * dpr); cx.stroke(); }
    cx.shadowBlur = 0;
    // el asiento: tablas pintadas de azul cielo, con el canto más oscuro y los nudos
    cx.fillStyle = "#5B92B6"; cx.fillRect(-ancho / 2, 0, ancho, grueso);
    const g = cx.createLinearGradient(0, -grueso * .9, 0, 0);
    g.addColorStop(0, "#CDEBF9"); g.addColorStop(1, "#93C8E5");
    cx.fillStyle = g; cx.fillRect(-ancho / 2, -grueso * .9, ancho, grueso * .9);
    cx.strokeStyle = "rgba(60,110,150,.45)"; cx.lineWidth = dpr;
    for (const k of [-1 / 6, 1 / 6]) { cx.beginPath(); cx.moveTo(ancho * k, -grueso * .9); cx.lineTo(ancho * k, 0); cx.stroke(); }
    cx.fillStyle = "#E9E4D6";
    for (const lado of [-.43, .43]) { cx.beginPath(); cx.arc(ancho * lado, -grueso * 1.2, grueso * .38, 0, 6.283); cx.fill(); }
    cx.restore();
  };

  const pinta = (t) => {
    const dt = Math.min(50, t - (ultimo || t)) / 1000; ultimo = t;
    p += (objP - p) * (quieto ? 1 : Math.min(1, dt * 1.2));
    if (!quieto) {
      // el péndulo, con algo de rozamiento y una brisa que nunca lo deja parado del todo
      const brisa = .022 * Math.sin(t / 1000 * w0);
      om += (-w0 * w0 * Math.sin(th) - .22 * om + brisa) * dt;
      th = Math.max(-.4, Math.min(.4, th + om * dt));
    }
    const hz = H * (.4 + .18 * p);
    // el cielo
    const g = cx.createLinearGradient(0, 0, 0, hz);
    g.addColorStop(0, "#1A49A2"); g.addColorStop(.6, "#4F86D4"); g.addColorStop(1, "#B9D3EE");
    cx.fillStyle = g; cx.fillRect(0, 0, W, hz + 2);
    // el mar de nubes, derivando a la izquierda
    const off = quieto ? 0 : (t * .006 * dpr) % W;
    cx.drawImage(mar, -off, hz); cx.drawImage(mar, W - off, hz);
    if (hz + Hm < H) { cx.fillStyle = "#B6EA1E"; cx.fillRect(0, hz + Hm, W, H - hz - Hm); }
    // el columpio, más allá del borde; la hierba, más cerca, va delante
    columpio(t);
    cx.drawImage(prado, 0, hz - H * .4);
  };
  const bucle = (t) => { pinta(t); requestAnimationFrame(bucle); };
  if (quieto) pinta(0); else requestAnimationFrame(bucle);
  addEventListener("resize", () => { if (quieto) pinta(0); });

  addEventListener("flyview", (e) => {
    const { index, total, dir } = e.detail;
    objP = total > 1 ? index / (total - 1) : 0;
    if (dir) { om += dir * .22; zum(8); }
    if (quieto) pinta(0);
  });

  // tocar el cielo: un empujón, alejándolo del dedo
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a")) return;
    zum([10, 30, 10]);
    if (quieto || !geo) return;
    om += (e.clientX * dpr < geo.x ? 1 : -1) * .45;
  });

  // ---------- cada prompt, tapado por una ventana de cielo con un columpio que hay que empujar ----------
  const wc = 2 * Math.PI / 1.7;
  const tapas = [];
  let corre = false, antes = 0;
  const mueve = (t) => {
    const dt = Math.min(50, t - (antes || t)) / 1000; antes = t;
    let alguno = false;
    for (const s of tapas) {
      if (s.hecho) continue;
      s.om += (-wc * wc * Math.sin(s.th) - .4 * s.om) * dt;
      s.th += s.om * dt;
      s.mini.style.transform = `rotate(${s.th.toFixed(4)}rad)`;
      if (Math.abs(s.th) > .95) s.suelta(Math.sign(s.th));
      else if (Math.abs(s.th) > .002 || Math.abs(s.om) > .01) alguno = true;
    }
    corre = alguno;
    if (alguno) requestAnimationFrame(mueve); else antes = 0;
  };
  const arranca = () => { if (!corre) { corre = true; antes = 0; requestAnimationFrame(mueve); } };

  document.querySelectorAll(".code").forEach((code) => {
    const caja = document.createElement("div");
    caja.className = "perch on";
    code.replaceWith(caja); caja.appendChild(code);
    caja.insertAdjacentHTML("beforeend", `<div class="skywin" data-nofly role="button" tabindex="0" aria-label="Push the swing until it lets go to reveal the prompt"><span class="lbl">Prompt inside</span><i class="mini"><b class="plank"></b></i><p class="hint"><b>Push</b> the swing</p></div>`);
    const win = caja.querySelector(".skywin"), hint = win.querySelector(".hint");
    const s = { th: 0, om: 0, hecho: false, mini: win.querySelector(".mini"), empujes: 0 };
    s.suelta = (lado) => {
      if (s.hecho) return;
      s.hecho = true;
      // da la vuelta entera por encima y el cielo se deshace
      s.mini.style.transform = `rotate(${(lado || 1) * 2 * Math.PI}rad)`;
      caja.classList.remove("on"); caja.classList.add("off");
      zum([20, 30, 50]);
      setTimeout(() => win.remove(), quieto ? 0 : 1400);
    };
    const empuja = (fuerza) => {
      if (s.hecho) return;
      if (quieto) { s.suelta(1); return; }
      const dir = Math.abs(s.om) > .4 ? Math.sign(s.om) : (s.th < 0 ? 1 : s.th > 0 ? -1 : 1);
      s.om += dir * fuerza;
      s.empujes++;
      hint.innerHTML = s.empujes < 2 ? "<b>Higher</b>" : "<b>Higher</b>, it's about to let go";
      zum(12);
      arranca();
    };
    s.empuja = empuja;
    tapas.push(s);
    let arr = null;
    win.addEventListener("pointerdown", (e) => { if (s.hecho) return; arr = { x0: e.clientX, movido: false }; try { win.setPointerCapture(e.pointerId); } catch {} });
    win.addEventListener("pointermove", (e) => { if (arr && Math.abs(e.clientX - arr.x0) > 8) arr.movido = true; });
    win.addEventListener("pointerup", (e) => {
      if (!arr) return;
      const dx = e.clientX - arr.x0, movido = arr.movido; arr = null;
      if (!movido) { empuja(2.2); return; }
      // un barrido empuja hacia su lado, con más fuerza cuanto más largo
      if (s.hecho) return;
      s.om += Math.sign(dx) * Math.min(3.6, 1.4 + Math.abs(dx) / 60);
      s.empujes++; hint.innerHTML = "<b>Higher</b>"; zum(12); arranca();
    });
    win.addEventListener("pointercancel", () => { arr = null; });
    win.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); empuja(2.2); } });
    caja.parentElement.querySelector(".cp")?.addEventListener("click", () => s.suelta(1));
  });

  // al copiar: suben nubecitas con luz lima desde el botón
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    zum([15, 30, 15]);
    if (quieto) return;
    const r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top;
    for (let k = 0; k < 6; k++) {
      const n = document.createElement("i"), d = rnd(12, 26);
      n.className = "puff";
      n.style.cssText = `left:${x + rnd(-r.width * .35, r.width * .35) - d / 2}px;top:${y - d / 2}px;width:${d}px;height:${d}px;--dx:${rnd(-40, 40).toFixed(0)}px;animation-delay:${k * 70}ms`;
      document.body.appendChild(n); n.addEventListener("animationend", () => n.remove());
    }
  }));

  // ---------- reglas: con los ojos cerrados; se despiertan parpadeando ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((s) => {
    s.insertAdjacentHTML("beforeend", `<i class="lid up" aria-hidden="true"></i><i class="lid dn" aria-hidden="true"></i><span class="hint" aria-hidden="true">Tap to wake up</span>`);
    s.classList.add("sleep");
    s.setAttribute("role", "button"); s.tabIndex = 0;
    s._despierta = () => {
      s.classList.remove("awake");
      void s.offsetWidth;
      s.classList.add("awake"); s.classList.remove("sleep");
      zum([8, 60, 8]);
    };
    s.addEventListener("click", s._despierta);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); s._despierta(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s) && !s._vista)
      .forEach((s, n) => { s._vista = true; setTimeout(s._despierta, (quieto ? 0 : 1150) + n * 450); });
  });
})();
