// DOLLAR — el fondo es la pista de noche: hangar, luces de pista y un cielo donde un chorro de
// trazadoras va dibujando un "$" gigante a medida que se avanza (primero la S, luego la raya); al
// llegar al final se deshace en chispas. Tocar el cielo dispara una ráfaga y los casquillos caen en
// la pista. Cada prompt está debajo de un fajo de billetes: se rompe la faja y se lanzan los billetes
// (tocando o deslizando) hasta que llueven. Copiar escupe casquillos. Las reglas las escribe una
// trazadora. Cámara en S hacia abajo (fly "ess").
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");

  // ---------- el cielo, la pista y el dólar ----------
  const cv = document.createElement("canvas");
  cv.id = "sky"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  const fondo = document.createElement("canvas"), fx = fondo.getContext("2d");
  let W, H, dpr, P = [], acc = [], largo = 1, G = [0, 0], horizonte = 0, luces = [], hangar = [0, 0];

  // el signo en unidades de radio: la S son dos arcos (de arriba a la derecha por encima hasta el
  // centro; luego por la derecha hasta abajo a la izquierda) y la raya, recta, de arriba abajo
  const U = [];
  const arco = (cy, a0, a1, n) => { for (let k = 0; k <= n; k++) { const a = (a0 + (a1 - a0) * k / n) * Math.PI / 180; U.push([Math.cos(a), cy + Math.sin(a)]); } };
  arco(-1, -35, -270, 90);
  arco(1, -90, 145, 90);
  const nS = U.length;
  for (let k = 0; k <= 40; k++) U.push([0, -2.45 + 4.9 * k / 40]);

  const pintaFondo = () => {
    const c = fx;
    let g = c.createLinearGradient(0, 0, 0, horizonte);
    g.addColorStop(0, "#04050A"); g.addColorStop(.6, "#0B0D16"); g.addColorStop(1, "#1D1B22");
    c.fillStyle = g; c.fillRect(0, 0, W, horizonte);
    for (let k = 0; k < 90; k++) {
      c.fillStyle = `rgba(230,230,255,${rnd(.12, .55)})`;
      const s = dpr * rnd(.6, 1.4);
      c.fillRect(rnd(0, W), rnd(0, horizonte * .7), s, s);
    }
    // nubes bajas, gris azulado
    for (let k = 0; k < 9; k++) {
      const x = rnd(-.1, 1.1) * W, y = rnd(.08, .75) * horizonte, rx = rnd(.25, .55) * Math.max(W, H * .6), ry = rx * rnd(.16, .28);
      c.save(); c.translate(x, y); c.scale(1, ry / rx);
      const q = c.createRadialGradient(0, 0, 0, 0, 0, rx);
      q.addColorStop(0, "rgba(72,76,96,.2)"); q.addColorStop(1, "rgba(72,76,96,0)");
      c.fillStyle = q; c.beginPath(); c.arc(0, 0, rx, 0, 6.283); c.fill(); c.restore();
    }
    // la pista
    g = c.createLinearGradient(0, horizonte, 0, H);
    g.addColorStop(0, "#19181D"); g.addColorStop(1, "#0A0A0D");
    c.fillStyle = g; c.fillRect(0, horizonte, W, H - horizonte);
    c.save(); c.setLineDash([14 * dpr, 20 * dpr]); c.strokeStyle = "rgba(240,220,160,.16)"; c.lineWidth = 2 * dpr;
    c.beginPath(); c.moveTo(W * .58, horizonte); c.lineTo(W * .86, H); c.stroke(); c.restore();
    // el hangar: tejado curvo y la boca iluminada, con su resplandor
    const hw = Math.min(W * .32, 280 * dpr), hh = hw * .3, hx = W * .02;
    g = c.createRadialGradient(hx + hw / 2, horizonte, 0, hx + hw / 2, horizonte, hw * 1.6);
    g.addColorStop(0, "rgba(255,200,130,.24)"); g.addColorStop(1, "rgba(255,200,130,0)");
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.fillStyle = "#131218";
    c.beginPath(); c.moveTo(hx, horizonte); c.lineTo(hx, horizonte - hh * .7);
    c.quadraticCurveTo(hx + hw / 2, horizonte - hh * 1.3, hx + hw, horizonte - hh * .7); c.lineTo(hx + hw, horizonte); c.fill();
    g = c.createLinearGradient(0, horizonte - hh * .55, 0, horizonte);
    g.addColorStop(0, "#FFE4B4"); g.addColorStop(1, "#E9A85A");
    c.fillStyle = g; c.fillRect(hx + hw * .14, horizonte - hh * .55, hw * .72, hh * .55);
    hangar = [hx + hw / 2, horizonte - hh];
    // el deportivo rojo, aparcado: una silueta baja y sus pilotos
    const ax = hx + hw * 1.15, aw = Math.min(W * .1, 70 * dpr);
    c.fillStyle = "#2A0D0B";
    c.beginPath(); c.moveTo(ax, horizonte + 6 * dpr); c.lineTo(ax + aw * .2, horizonte - aw * .09); c.lineTo(ax + aw * .62, horizonte - aw * .11); c.lineTo(ax + aw, horizonte + 1 * dpr); c.lineTo(ax + aw, horizonte + 6 * dpr); c.fill();
    c.fillStyle = "#FF2A1F"; c.fillRect(ax + aw - 4 * dpr, horizonte - 1 * dpr, 3 * dpr, 2 * dpr);
  };

  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = fondo.width = Math.round(innerWidth * dpr);
    H = cv.height = fondo.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    horizonte = H * .87;
    const alto = Math.min(H * .8, W * 2.1), r = alto / 4.9, ox = W * .5, oy = H * .045 + alto / 2;
    P = U.map(([x, y]) => [ox + x * r, oy + y * r]);
    acc = [0];
    for (let k = 1; k < P.length; k++) acc.push(acc[k - 1] + (k === nS ? 0 : Math.hypot(P[k][0] - P[k - 1][0], P[k][1] - P[k - 1][1])));
    largo = acc[acc.length - 1];
    G = [W * .05, H * 1.01];
    luces = [];
    for (let x = 4 * dpr, k = 0; x < W; x += 15 * dpr, k++) luces.push([x, horizonte - 1 * dpr, k % 3 === 0]);
    pintaFondo();
  };
  tam();

  // un punto a la distancia d del principio del trazo (la raya empieza sin unirse a la S)
  const en = (d) => {
    let lo = 1, hi = acc.length - 1;
    while (lo < hi) { const m = (lo + hi) >> 1; if (acc[m] < d) lo = m + 1; else hi = m; }
    const k = lo, L0 = acc[k - 1], L1 = acc[k], f = L1 > L0 ? Math.min(1, (d - L0) / (L1 - L0)) : 1;
    return [P[k - 1][0] + (P[k][0] - P[k - 1][0]) * f, P[k - 1][1] + (P[k][1] - P[k - 1][1]) * f];
  };
  const camino = (d) => {
    const p = new Path2D();
    p.moveTo(P[0][0], P[0][1]);
    for (let k = 1; k < P.length; k++) {
      if (k === nS) { if (acc[k] >= d) return p; p.moveTo(P[k][0], P[k][1]); continue; }
      if (acc[k] > d) { const q = en(d); p.lineTo(q[0], q[1]); return p; }
      p.lineTo(P[k][0], P[k][1]);
    }
    return p;
  };

  let objetivo = 0, hecho = 0, vel = 1 / 2600, alfa = 1, rompe = 0, roto = false, ultimo = 0, chorro = 0;
  const chispas = [], vainas = [], rafagas = [];
  const chispa = (x, y, vx, vy, d) => {
    chispas.push({ x, y, vx, vy, v: 1, d, s: rnd(1, 2.4) * dpr });
    if (chispas.length > 900) chispas.splice(0, chispas.length - 900);
  };
  const vaina = () => {
    vainas.push({ x: G[0] + rnd(0, W * .06), y: H, vx: rnd(1.2, 4.5) * dpr, vy: rnd(-9, -5) * dpr, rot: rnd(0, 6.28), vr: rnd(-.35, .35), suelo: horizonte + rnd(.12, .95) * (H - horizonte), botes: 0, quieta: false });
    if (vainas.length > 150) { const k = vainas.findIndex((v) => v.quieta); vainas.splice(k < 0 ? 0 : k, 1); }
  };
  // la ráfaga: un chorro de trazadoras desde la minigun, abajo a la izquierda, hasta q
  const chorrito = (q, a, t) => {
    cx.save();
    cx.lineCap = "round";
    cx.strokeStyle = `rgba(255,140,40,${.16 * a})`; cx.lineWidth = 10 * dpr;
    cx.beginPath(); cx.moveTo(G[0], G[1]); cx.lineTo(q[0], q[1]); cx.stroke();
    cx.setLineDash([16 * dpr, 22 * dpr]); cx.lineDashOffset = -t * 1.3 * dpr;
    cx.strokeStyle = `rgba(255,205,130,${.95 * a})`; cx.lineWidth = 2.6 * dpr; cx.stroke();
    cx.restore();
    const R = 130 * dpr, g = cx.createRadialGradient(G[0], G[1], 0, G[0], G[1], R);
    g.addColorStop(0, `rgba(255,190,90,${.6 * a * rnd(.6, 1)})`); g.addColorStop(1, "rgba(255,120,30,0)");
    cx.fillStyle = g; cx.fillRect(G[0] - R, G[1] - R, R * 2, R * 2);
  };
  const deshace = () => {
    for (let d = 0; d < largo; d += 6 * dpr) { const q = en(d); chispa(q[0], q[1], rnd(-.7, .7) * dpr, rnd(-1.2, .2) * dpr, rnd(.005, .011)); }
    zum([10, 20, 10, 20, 10]);
  };

  const pinta = (t) => {
    const dt = Math.min(50, t - (ultimo || t)), f = dt / 16.7; ultimo = t;
    cx.globalCompositeOperation = "source-over";
    cx.drawImage(fondo, 0, 0);
    // luces de pista, con el destello que corre de derecha a izquierda, y la baliza del hangar
    const corre = 1 - (t / 1700) % 1;
    luces.forEach(([x, y, azul], k) => {
      const flash = Math.abs(k / luces.length - corre) < .012;
      cx.fillStyle = flash ? "#FFFFFF" : azul ? "rgba(90,140,255,.9)" : "rgba(255,236,200,.75)";
      const s = (flash ? 3.4 : 1.8) * dpr;
      cx.fillRect(x - s / 2, y - s / 2, s, s);
    });
    if (t % 1400 < 600) { cx.fillStyle = "#FF2A1F"; cx.beginPath(); cx.arc(hangar[0], hangar[1], 2.2 * dpr, 0, 6.283); cx.fill(); }

    // el dólar avanza hacia el objetivo
    const antes = hecho;
    if (quieto) hecho = objetivo;
    else { const v = vel * dt; hecho = Math.abs(objetivo - hecho) <= v ? objetivo : hecho + Math.sign(objetivo - hecho) * v; }
    const tirando = hecho > antes + 1e-5;
    chorro += ((tirando ? 1 : 0) - chorro) * (quieto ? 1 : Math.min(1, .14 * f));
    if (rompe && t > rompe && !roto) { roto = true; deshace(); }
    alfa = roto ? Math.max(0, alfa - dt / 1100) : Math.min(1, alfa + dt / 400);

    cx.globalCompositeOperation = "lighter";
    const d = hecho * largo;
    if (d > 0 && alfa > 0) {
      const p = camino(d);
      cx.lineCap = "round"; cx.lineJoin = "round";
      cx.strokeStyle = `rgba(255,120,30,${.1 * alfa})`; cx.lineWidth = 30 * dpr; cx.stroke(p);
      cx.strokeStyle = `rgba(255,170,70,${.26 * alfa})`; cx.lineWidth = 12 * dpr; cx.stroke(p);
      cx.strokeStyle = `rgba(255,214,150,${.5 * alfa})`; cx.lineWidth = 2 * dpr; cx.stroke(p);
      cx.setLineDash([2 * dpr, 6 * dpr]); cx.lineDashOffset = -t * .02 * dpr;
      cx.strokeStyle = `rgba(255,246,220,${alfa})`; cx.lineWidth = 3.4 * dpr; cx.stroke(p);
      cx.setLineDash([]);
      // destellos sueltos a lo largo del trazo, como una bengala
      if (!quieto) for (let k = 0; k < 28; k++) {
        const q = en(Math.random() * d), s = rnd(1, 2.6) * dpr;
        cx.fillStyle = `rgba(255,228,170,${alfa * rnd(.3, 1)})`;
        cx.fillRect(q[0] + rnd(-7, 7) * dpr, q[1] + rnd(-7, 7) * dpr, s, s);
      }
    }
    if (chorro > .02 && d > 0) {
      const q = en(d);
      chorrito(q, chorro, t);
      if (!quieto) {
        for (let k = 0; k < 3; k++) chispa(q[0], q[1], rnd(-1.6, 1.6) * dpr, rnd(-1.8, .6) * dpr, rnd(.012, .03));
        if (Math.random() < .5 * f) vaina();
      }
    }
    // ráfagas al tocar el cielo
    for (let k = rafagas.length - 1; k >= 0; k--) {
      const r = rafagas[k], e = (t - r.t0) / 320;
      if (e < 1) { chorrito([G[0] + (r.x - G[0]) * e, G[1] + (r.y - G[1]) * e], 1, t); if (Math.random() < .6) vaina(); }
      else {
        for (let n = 0; n < 46; n++) { const a = rnd(0, 6.283), v = rnd(.5, 3.4) * dpr; chispa(r.x, r.y, Math.cos(a) * v, Math.sin(a) * v - 1 * dpr, rnd(.01, .022)); }
        rafagas.splice(k, 1);
      }
    }
    // chispas, que caen
    for (let k = chispas.length - 1; k >= 0; k--) {
      const c = chispas[k];
      c.vy += .035 * dpr * f; c.vx *= .992; c.x += c.vx * f; c.y += c.vy * f; c.v -= c.d * f;
      if (c.v <= 0 || c.y > H) { chispas.splice(k, 1); continue; }
      cx.fillStyle = `rgba(255,${190 + c.v * 50 | 0},${110 + c.v * 100 | 0},${c.v})`;
      cx.fillRect(c.x, c.y, c.s, c.s);
    }
    // casquillos: saltan de la minigun y se quedan en la pista
    cx.globalCompositeOperation = "source-over";
    for (const v of vainas) {
      if (!v.quieta) {
        v.vy += .45 * dpr * f; v.x += v.vx * f; v.y += v.vy * f; v.rot += v.vr * f;
        if (v.y >= v.suelo && v.vy > 0) {
          if (v.botes++ < 1) { v.vy *= -.3; v.vx *= .5; v.y = v.suelo; } else { v.y = v.suelo; v.quieta = true; }
        }
      }
      cx.save(); cx.translate(v.x, v.y); cx.rotate(v.rot);
      cx.fillStyle = "#C8922F"; cx.fillRect(-1.3 * dpr, -3.6 * dpr, 2.6 * dpr, 7.2 * dpr);
      cx.fillStyle = "#FFE3A0"; cx.fillRect(-1.3 * dpr, -3.6 * dpr, 1 * dpr, 7.2 * dpr);
      cx.restore();
    }
  };
  const bucle = (t) => { pinta(t); requestAnimationFrame(bucle); };
  if (quieto) pinta(0); else requestAnimationFrame(bucle);
  addEventListener("resize", () => { tam(); if (quieto) pinta(0); });

  // al avanzar, el chorro sigue dibujando: la S y después la raya; al final, se deshace
  addEventListener("flyview", (e) => {
    const { index, total, dir } = e.detail;
    const p = total > 1 ? index / (total - 1) : 0;
    if (index < total - 1) { if (roto) { hecho = 0; alfa = 1; } roto = false; rompe = 0; }
    objetivo = .06 + .94 * p;
    vel = Math.max(1 / 2600, Math.abs(objetivo - hecho) / 900);
    if (index === total - 1 && !rompe && !quieto) rompe = performance.now() + 1700 + Math.abs(objetivo - hecho) / vel;
    if (dir) setTimeout(() => zum([5, 10, 5, 10, 5, 10, 5]), quieto ? 0 : 200);
    if (quieto) pinta(0);
  });

  // tocar el cielo: una ráfaga que estalla en chispas donde tocas
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a")) return;
    zum([5, 10, 5, 10, 5, 10, 5, 10, 5]);
    if (quieto) return;
    rafagas.push({ x: e.clientX * dpr, y: Math.min(e.clientY * dpr, horizonte - 24 * dpr), t0: performance.now() });
  });

  // ---------- cada prompt, debajo de un fajo: se rompe la faja y se lanzan los billetes ----------
  const NB = 5, ANTES = 3; // billetes del fajo; los que se lanzan a mano antes de que lluevan los demás
  const billete = `<b class="frame"></b><b class="seal"></b><b class="med">$</b><b class="no a">100</b><b class="no b">100</b><b class="ser">MF 060 1410</b>`;

  // un billete que sale volando con un giro y cae revoloteando
  const vuela = (r, vx, vy, mini) => {
    const b = document.createElement("span");
    b.className = "bill flying" + (mini ? " mini" : "");
    b.innerHTML = billete;
    b.style.width = r.width + "px"; b.style.height = r.height + "px";
    document.body.appendChild(b);
    const x0 = r.left, y0 = r.top, g = 1300, giro = rnd(-260, 260), fase = rnd(0, 6), dur = mini ? rnd(2.2, 3.4) : 1.7;
    const kf = [];
    for (let n = 0; n <= 24; n++) {
      const t = dur * n / 24, aire = 1 - Math.min(.7, t * .45);
      const x = x0 + vx * t * aire + Math.sin(t * 5 + fase) * (mini ? 40 : 18);
      const y = y0 + (mini ? 230 * t + Math.sin(t * 3 + fase) * 20 : vy * t + .5 * g * t * t * .55);
      kf.push({ transform: `translate(${x}px, ${y}px) perspective(600px) rotate(${giro * t}deg) rotateX(${Math.sin(t * 9 + fase) * 55}deg)`, opacity: n > 17 ? 1 - (n - 17) / 7 : 1 });
    }
    b.animate(kf, { duration: dur * 1000, easing: "linear", fill: "forwards" }).onfinish = () => b.remove();
  };

  document.querySelectorAll(".code").forEach((code) => {
    const caja = document.createElement("div");
    caja.className = "stash wrapped";
    code.replaceWith(caja); caja.appendChild(code);
    const fajo = document.createElement("button");
    fajo.type = "button"; fajo.className = "cash";
    fajo.setAttribute("aria-label", "Snap the strap and flick the bills to reveal the prompt");
    fajo.innerHTML = Array.from({ length: NB }, (_, k) => `<span class="bill" style="--k:${k}">${billete}</span>`).join("") + `<span class="strap"><i></i><i></i></span>`;
    caja.appendChild(fajo);
    caja.insertAdjacentHTML("beforeend", `<span class="cash-hint" aria-hidden="true">Tap to snap the strap</span><span class="tally" aria-hidden="true"></span>`);
    const pista = caja.querySelector(".cash-hint"), cuenta = caja.querySelector(".tally");
    let fase = 0, lanzados = 0, ini = null; // fase 0 atado, 1 sin faja, 2 abierto

    const tira = (bill, dx, dy) => {
      const r = bill.getBoundingClientRect();
      bill.classList.add("gone");
      if (quieto) return;
      const m = Math.hypot(dx, dy);
      const [vx, vy] = m > 18 ? [dx / m * 900, dy / m * 900] : [rnd(-1, 1) * 500, -rnd(600, 850)];
      vuela(r, vx, vy, false);
    };
    const llueve = () => {
      if (fase === 2) return;
      fase = 2;
      caja.classList.add("snapped", "open"); caja.classList.remove("wrapped");
      zum([20, 30, 20, 30, 40]);
      if (!quieto) {
        fajo.querySelectorAll(".bill:not(.gone)").forEach((b, n) => setTimeout(() => tira(b, rnd(-1, 1), -1), n * 70));
        const ancho = Math.min(96, innerWidth * .22);
        for (let n = 0; n < 16; n++) setTimeout(() => vuela({ left: rnd(-20, innerWidth - 40), top: -60, width: ancho, height: ancho / 2.35 }, rnd(-60, 60), 0, true), n * 85);
      }
      setTimeout(() => { fajo.remove(); pista.remove(); }, quieto ? 0 : 700);
    };
    const golpe = (dx, dy) => {
      if (fase === 2) return;
      if (fase === 0) {
        fase = 1; caja.classList.add("snapped"); pista.textContent = "Flick the bills"; zum(30);
        if (quieto) llueve();
        return;
      }
      const arriba = [...fajo.querySelectorAll(".bill:not(.gone)")].pop();
      if (arriba) tira(arriba, dx, dy);
      lanzados++;
      cuenta.textContent = `$${lanzados * 100}`;
      cuenta.classList.remove("pop"); void cuenta.offsetWidth; cuenta.classList.add("pop");
      zum(14);
      if (lanzados >= ANTES) setTimeout(llueve, quieto ? 0 : 160);
    };
    // el gesto se captura: el dedo suele soltar fuera del fajo al lanzar
    fajo.addEventListener("pointerdown", (e) => { ini = { x: e.clientX, y: e.clientY }; try { fajo.setPointerCapture(e.pointerId); } catch {} });
    fajo.addEventListener("pointerup", (e) => { if (!ini) return; const dx = e.clientX - ini.x, dy = e.clientY - ini.y; ini = null; golpe(dx, dy); });
    fajo.addEventListener("pointercancel", () => { ini = null; });
    fajo.addEventListener("click", (e) => { if (e.detail === 0) golpe(0, 0); }); // teclado
    caja.parentElement.querySelector(".cp")?.addEventListener("click", llueve);
  });

  // al copiar: la minigun escupe tres casquillos que botan en el suelo
  const casquillo = (x0, y0) => {
    const el = document.createElement("i");
    el.className = "casing"; document.body.appendChild(el);
    const suelo = innerHeight - 12, kf = [];
    let x = x0, y = y0, vx = rnd(160, 340), vy = rnd(-760, -540), rot = 0, botes = 0;
    const vr = rnd(700, 1400) * (Math.random() < .5 ? -1 : 1), dt = 1 / 40;
    for (let n = 0; n <= 56; n++) {
      kf.push({ transform: `translate(${x}px, ${y}px) rotate(${rot}deg)`, opacity: n > 46 ? 1 - (n - 46) / 10 : 1 });
      vy += 2100 * dt; x += vx * dt; y += vy * dt; rot += vr * dt;
      if (y >= suelo && vy > 0) { y = suelo; if (botes++ < 2) { vy *= -.38; vx *= .55; } else { vy = 0; vx *= .3; } }
    }
    el.animate(kf, { duration: 1400, easing: "linear", fill: "forwards" }).onfinish = () => el.remove();
  };
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    zum([8, 30, 8, 30, 8]);
    if (quieto) return;
    const r = b.getBoundingClientRect();
    for (let k = 0; k < 3; k++) setTimeout(() => casquillo(r.right - 46 - k * 8, r.top + r.height / 2), k * 90);
  }));

  // ---------- reglas: las escribe una trazadora, línea a línea ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((s) => {
    s.classList.add("dark");
    s.insertAdjacentHTML("beforeend", `<i class="tracer" aria-hidden="true"></i><span class="hint" aria-hidden="true">Tap to fire</span>`);
    s.setAttribute("role", "button"); s.tabIndex = 0;
    s._escribe = () => {
      const [k, h, p] = [s.querySelector(".k"), s.querySelector("h3"), s.querySelector("h3 + p")];
      if (k && h && p) {
        s.style.setProperty("--x0", k.offsetLeft + "px");
        s.style.setProperty("--x1", k.offsetLeft + k.offsetWidth + "px");
        [k, h, p].forEach((el, n) => s.style.setProperty(`--y${n + 1}`, el.offsetTop + el.offsetHeight / 2 + "px"));
      }
      s.classList.remove("lit"); s.classList.add("dark"); void s.offsetWidth;
      s.classList.remove("dark"); s.classList.add("lit");
      zum([5, 10, 5, 10, 5, 10, 5]);
    };
    s.addEventListener("click", s._escribe);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); s._escribe(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s) && s.classList.contains("dark"))
      .forEach((s, n) => setTimeout(() => { if (s.classList.contains("dark")) s._escribe(); }, (quieto ? 0 : 1150) + n * 520));
  });
})();
