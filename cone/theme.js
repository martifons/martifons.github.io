// CONE — el fondo es una heladería en colores pastel: pared a rayas menta y nata, toldo de rayas rosas con el borde
// festoneado, suelo de cuadros y virutas de colores que caen despacio. Abajo a la derecha, un cucurucho gigante cuyo
// helado (blanco con manchas negras) sube un piso a cada parada; en la última le salen orejas y ojos de gato. Tocar la
// tienda echa un puñado de virutas. Cada prompt está detrás de una máquina de helado: la boquilla va de lado a lado y
// suelta gatitos-bola; hay que mover el cucurucho (arrastrando o tocando donde ir) para coger tres; el de arriba abre los
// ojos y saluda con la pata. Al copiar sale un helado girando. Las reglas caen como helado y tiemblan como gelatina.
// Cámara "swirl".
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");
  const COLORES = ["#FF5A7A", "#FFD23F", "#5AD1FF", "#7CE07C", "#B98AFF", "#FFFFFF"];

  // ---------- la heladería ----------
  const cv = document.createElement("canvas");
  cv.id = "shop"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  let W, H, dpr, fondo = null, manchas = [];
  const virutas = [];

  const pintaFondo = () => {
    fondo = document.createElement("canvas"); fondo.width = W; fondo.height = H;
    const c = fondo.getContext("2d");
    const raya = 40 * dpr, suelo = H * .82, toldo = H * .1;
    for (let x = 0, k = 0; x < W; x += raya, k++) { c.fillStyle = k % 2 ? "#FFF4E4" : "#CFEFE2"; c.fillRect(x, 0, raya, suelo); }
    // el toldo a rayas con el borde festoneado
    for (let x = 0, k = 0; x < W; x += raya, k++) {
      c.fillStyle = k % 2 ? "#FFFFFF" : "#FF8FA8"; c.fillRect(x, 0, raya, toldo);
      c.beginPath(); c.arc(x + raya / 2, toldo, raya / 2, 0, Math.PI); c.fill();
    }
    c.fillStyle = "rgba(0,0,0,.08)"; c.fillRect(0, toldo + raya / 2, W, 4 * dpr);
    // el suelo de cuadros
    const t = 46 * dpr;
    for (let y = suelo, f = 0; y < H; y += t, f++) for (let x = 0, k = 0; x < W; x += t, k++) { c.fillStyle = (k + f) % 2 ? "#FFE3EA" : "#FFFFFF"; c.fillRect(x, y, t, t); }
    c.fillStyle = "rgba(0,0,0,.1)"; c.fillRect(0, suelo, W, 3 * dpr);
    manchas = []; for (let k = 0; k < 14; k++) manchas.push([rnd(-.8, .8), rnd(0, 1), rnd(.12, .26)]);
  };

  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = Math.round(innerWidth * dpr); H = cv.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    pintaFondo();
    virutas.length = 0;
  };
  tam();
  addEventListener("resize", tam);

  // el cucurucho gigante: el helado sube un piso por parada; en la última, orejas y ojos
  const gigante = (p, fin) => {
    const s = Math.min(W, H) * .16, x = W * .84, base = H * .9, conoH = s * 1.3;
    cx.fillStyle = "#E7AE64";
    cx.beginPath(); cx.moveTo(x - s * .5, base - conoH); cx.lineTo(x + s * .5, base - conoH); cx.lineTo(x, base); cx.closePath(); cx.fill();
    cx.save(); cx.clip(); cx.strokeStyle = "rgba(150,90,30,.45)"; cx.lineWidth = 2 * dpr;
    for (let k = -8; k < 8; k++) { cx.beginPath(); cx.moveTo(x + k * s * .14, base - conoH); cx.lineTo(x + k * s * .14 + conoH, base); cx.moveTo(x + k * s * .14, base - conoH); cx.lineTo(x + k * s * .14 - conoH, base); cx.stroke(); }
    cx.restore();
    const pisos = 1 + Math.round(p * 5);
    let y = base - conoH;
    for (let k = 0; k < pisos; k++) {
      const r = s * (.58 - k * .07), h = s * .22;
      cx.fillStyle = "#FBF9F6"; cx.beginPath(); cx.ellipse(x + (k % 2 ? 4 : -4) * dpr, y - h * .4, r, h * .7, 0, 0, 6.283); cx.fill();
      cx.fillStyle = "#1B1B1D";
      for (const [dx, dy, rr] of manchas.slice(k * 2, k * 2 + 2)) { cx.beginPath(); cx.ellipse(x + dx * r * .7, y - h * .4 + (dy - .5) * h * .6, r * rr, h * rr * 1.4, 0, 0, 6.283); cx.fill(); }
      y -= h * .75;
    }
    if (fin) {
      const r = s * (.58 - (pisos - 1) * .07);
      cx.fillStyle = "#1B1B1D";
      for (const lado of [-1, 1]) { cx.beginPath(); cx.moveTo(x + lado * r * .2, y + s * .02); cx.lineTo(x + lado * r * .55, y - s * .2); cx.lineTo(x + lado * r * .8, y + s * .08); cx.closePath(); cx.fill(); }
      for (const lado of [-1, 1]) { cx.fillStyle = "#C88A2A"; cx.beginPath(); cx.arc(x + lado * r * .3, y + s * .12, s * .05, 0, 6.283); cx.fill(); cx.fillStyle = "#1B1B1D"; cx.beginPath(); cx.arc(x + lado * r * .3, y + s * .12, s * .022, 0, 6.283); cx.fill(); }
    }
  };

  let p = 0, objP = 0, ultimo = 0, nacer = 0, fin = false;
  const pinta = (t) => {
    const dt = Math.min(50, t - (ultimo || t)); ultimo = t;
    p += (objP - p) * (quieto ? 1 : Math.min(1, dt / 900));
    cx.drawImage(fondo, 0, 0);
    gigante(p, fin);
    nacer -= dt;
    if (nacer <= 0 && !quieto && virutas.length < 60) { virutas.push({ x: rnd(0, W), y: -10 * dpr, vx: rnd(-.01, .01) * dpr, vy: rnd(.04, .08) * dpr, a: rnd(0, 6.283), va: rnd(-.004, .004), c: COLORES[Math.floor(rnd(0, 6))], g: 0 }); nacer = 260; }
    cx.lineCap = "round"; cx.lineWidth = 3.4 * dpr;
    for (let k = virutas.length - 1; k >= 0; k--) {
      const v = virutas[k]; v.vy += v.g * dt; v.x += v.vx * dt; v.y += v.vy * dt; v.a += v.va * dt;
      if (v.y > H + 20 * dpr || v.x < -20 * dpr || v.x > W + 20 * dpr) { virutas.splice(k, 1); continue; }
      cx.strokeStyle = v.c; cx.beginPath(); cx.moveTo(v.x - Math.cos(v.a) * 5 * dpr, v.y - Math.sin(v.a) * 5 * dpr); cx.lineTo(v.x + Math.cos(v.a) * 5 * dpr, v.y + Math.sin(v.a) * 5 * dpr); cx.stroke();
    }
  };
  const bucle = (t) => { requestAnimationFrame(bucle); pinta(t); };
  if (quieto) pinta(0); else requestAnimationFrame(bucle);
  addEventListener("resize", () => { if (quieto) pinta(0); });

  addEventListener("flyview", (e) => {
    const { index, total, dir } = e.detail;
    objP = total > 1 ? index / (total - 1) : 0;
    fin = total > 1 && index === total - 1;
    if (dir) zum(dir > 0 ? [10, 30, 6] : 6);
    if (quieto) pinta(0);
  });

  // tocar la tienda: un puñado de virutas
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a")) return;
    zum(10);
    if (quieto) return;
    for (let k = 0; k < 26; k++) {
      const a = rnd(0, 6.283), v = rnd(.15, .45) * dpr;
      virutas.push({ x: e.clientX * dpr, y: e.clientY * dpr, vx: Math.cos(a) * v, vy: Math.sin(a) * v - .2 * dpr, a: rnd(0, 6.283), va: rnd(-.02, .02), c: COLORES[k % 6], g: .0009 * dpr });
    }
  });

  // ---------- cada prompt, detrás de la máquina: coge tres gatitos con el cucurucho ----------
  const HACEN = 3;
  document.querySelectorAll(".code").forEach((code, n) => {
    const caja = document.createElement("div");
    caja.className = "serve on";
    code.replaceWith(caja); caja.appendChild(code);
    caja.insertAdjacentHTML("beforeend", `<div class="machine" data-nofly role="button" tabindex="0" aria-label="Move the cone under the nozzle and catch three scoops to reveal the prompt"><i class="steel"></i><i class="noz"></i><p class="count">Catch: <b>0</b> / ${HACEN}</p><p class="hint" aria-hidden="true">← slide the cone →</p><i class="tray"></i><span class="cone"></span></div>`);
    const maq = caja.querySelector(".machine"), noz = maq.querySelector(".noz"), cono = maq.querySelector(".cone"), cuenta = maq.querySelector(".count b");
    const pila = [];
    let coneX = null, cae = null, espera = 700, antes = 0, hecho = false, fin3 = false, guiado = false;
    const w = () => maq.clientWidth, h = () => maq.clientHeight;
    const colocaCono = () => { if (coneX === null) coneX = w() / 2; coneX = Math.max(32, Math.min(w() - 32, coneX)); cono.style.left = coneX + "px"; };
    const abre = () => {
      if (caja.classList.contains("off")) return;
      hecho = true; caja.classList.remove("on"); caja.classList.add("off");
      zum([15, 30, 50]);
      setTimeout(() => maq.remove(), quieto ? 0 : 1100);
    };
    const apila = (kit) => {
      kit.style.transform = ""; kit.style.left = "32px"; kit.style.top = `${92 - 74 - 10 - pila.length * 20}px`;
      cono.appendChild(kit); pila.push(kit);
      cuenta.textContent = pila.length; zum([10, 30, 10]); maq.classList.add("started");
      if (pila.length >= HACEN) final();
    };
    const final = () => {
      fin3 = true;
      const top = pila[pila.length - 1]; top.classList.add("face");
      if (quieto) return abre();
      const pata = document.createElement("i"); pata.className = "paw";
      pata.style.left = "62px"; pata.style.top = `${92 - 74 - 10 - (pila.length - 1) * 20 - 4}px`;
      cono.appendChild(pata);
      setTimeout(abre, 1500);
    };
    const suelta = (x) => {
      const kit = document.createElement("i"); kit.className = "kit";
      maq.appendChild(kit);
      cae = { el: kit, x, y: h() * .17 + 30, vy: 0 };
    };
    const mueve = (t) => {
      if (hecho || !maq.isConnected) return;
      const dt = Math.min(50, t - (antes || t)); antes = t;
      colocaCono();
      const nx = w() * (.5 + .34 * Math.sin(t * .0011 + n * 2));
      noz.style.left = nx + "px";
      if (!fin3) {
        if (!cae) { espera -= dt; if (espera <= 0) { suelta(nx); espera = 900; } }
        else {
          cae.vy += 1.5 * h() / 1e6 * dt; cae.y += cae.vy * dt;
          cae.el.style.transform = `translate(${cae.x.toFixed(1)}px,${cae.y.toFixed(1)}px)`;
          // se juzga una sola vez, al cruzar la boca del cucurucho (con el panel oculto un paso puede saltarse la franja)
          const tope = h() * .92 - 74 - pila.length * 20;
          if (!cae.juzgado && cae.y >= tope - 8) {
            cae.juzgado = true;
            if (Math.abs(cae.x - coneX) < 30) { const k = cae.el; cae = null; apila(k); }
          }
          if (cae && cae.y > h() * .9) { const k = cae.el; cae = null; k.classList.add("miss"); k.addEventListener("animationend", () => k.remove()); }
        }
      }
      requestAnimationFrame(mueve);
    };
    // mover el cucurucho: arrastrando o tocando donde ir (con ratón, también pasando por encima)
    const apunta = (e) => {
      const r = maq.getBoundingClientRect(), k = maq.offsetWidth / (r.width || 1);
      coneX = (e.clientX - r.left) * k; colocaCono();
    };
    maq.addEventListener("pointerdown", (e) => {
      if (hecho) return;
      if (quieto) { if (!fin3) { const kit = document.createElement("i"); kit.className = "kit"; apila(kit); } return; }
      guiado = true; try { maq.setPointerCapture(e.pointerId); } catch {}
      apunta(e);
    });
    maq.addEventListener("pointermove", (e) => { if (!hecho && !quieto && (guiado || e.pointerType === "mouse")) apunta(e); });
    const suelto = () => { guiado = false; };
    maq.addEventListener("pointerup", suelto);
    maq.addEventListener("pointercancel", suelto);
    maq.addEventListener("keydown", (e) => {
      if (hecho || fin3) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); coneX += e.key === "ArrowLeft" ? -30 : 30; colocaCono(); return; }
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      if (cae) { coneX = cae.x; colocaCono(); }
      else { const kit = document.createElement("i"); kit.className = "kit"; apila(kit); }
    });
    caja.parentElement.querySelector(".cp")?.addEventListener("click", abre);
    colocaCono();
    if (!quieto) requestAnimationFrame(mueve);
    else noz.style.left = "50%";
  });

  // al copiar: sale un helado girando
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    zum([8, 20, 8]);
    if (quieto) return;
    const r = b.getBoundingClientRect(), y = document.createElement("span");
    y.className = "yum"; y.textContent = "🍦";
    y.style.cssText = `left:${r.left + r.width / 2}px;top:${r.top}px;--dx:${rnd(-80, 80).toFixed(0)}px`;
    document.body.appendChild(y); y.addEventListener("animationend", () => y.remove());
  }));

  // ---------- reglas: caen como helado y tiemblan como gelatina ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((s) => {
    if (!quieto) s.classList.add("drip");
    s.setAttribute("role", "button"); s.tabIndex = 0;
    s._tiembla = () => {
      if (quieto) return;
      s.classList.remove("jelly", "melt"); void s.offsetWidth; s.classList.add("jelly");
      zum([6, 20, 6]);
    };
    s.addEventListener("click", s._tiembla);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); s._tiembla(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s) && !s._vista)
      .forEach((s, n) => { s._vista = true; setTimeout(() => { s.classList.remove("drip"); s.classList.add("melt"); zum([6, 30, 6]); }, (quieto ? 0 : 500) + n * 350); });
  });
})();
