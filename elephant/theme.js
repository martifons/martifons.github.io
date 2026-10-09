// ELEPHANT — cada llegada es un paso que retumba; tocar el suelo deja huellas; el polvo corre
// con el viento; cada prompt está pisado por una pata que se levanta manteniendo pulsado
// (como el elefante, que aguanta la pata en el aire); las reglas están bajo huellas.
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");
  const planta = () => { const s = document.createElement("div"); s.className = "sole"; s.setAttribute("aria-hidden", "true"); return s; };

  // ---------- polvo que corre con el viento ----------
  const cv = document.createElement("canvas");
  cv.id = "dust"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  let W, H, dpr;
  const tam = () => { dpr = Math.min(2, devicePixelRatio || 1); W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr; cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px"; };
  tam(); addEventListener("resize", tam);
  const motas = [], nubes = [];
  for (let k = 0; k < (quieto ? 0 : Math.round(innerWidth / 12)); k++) motas.push({ x: Math.random(), y: rnd(.35, 1), r: rnd(.5, 1.8), v: rnd(.0004, .0016), f: rnd(0, 6.3), a: rnd(.12, .4) });
  const nube = (x, y, n = 14) => {
    if (quieto) return;
    for (let k = 0; k < n; k++) { const a = rnd(Math.PI * .95, Math.PI * 2.05); nubes.push({ x: x * dpr, y: y * dpr, vx: Math.cos(a) * rnd(.8, 3) * dpr, vy: Math.sin(a) * rnd(.2, 1.4) * dpr, r: rnd(8, 24) * dpr, vida: 1, dec: rnd(.01, .022) }); }
  };
  let viento = 1, t0 = performance.now();
  const anima = (t) => {
    const dt = Math.min(50, t - t0) / 16.7; t0 = t;
    cx.clearRect(0, 0, W, H);
    viento += (1 - viento) * .02;
    for (const m of motas) {
      m.x += m.v * viento * dt; m.f += .03 * dt;
      if (m.x > 1.02) { m.x = -.02; m.y = rnd(.35, 1); }
      cx.globalAlpha = m.a; cx.fillStyle = "#E8C99A";
      cx.beginPath(); cx.arc(m.x * W, (m.y + Math.sin(m.f) * .004) * H, m.r * dpr, 0, 6.283); cx.fill();
    }
    for (let k = nubes.length - 1; k >= 0; k--) {
      const p = nubes[k];
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .96; p.vy *= .96; p.r += .45 * dt * dpr; p.vida -= p.dec * dt;
      if (p.vida <= 0) { nubes.splice(k, 1); continue; }
      const g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, `rgba(196, 150, 100, ${.3 * p.vida})`); g.addColorStop(1, "rgba(196,150,100,0)");
      cx.globalAlpha = 1; cx.fillStyle = g; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fill();
    }
    requestAnimationFrame(anima);
  };
  if (!quieto) requestAnimationFrame(anima);

  // ---------- el paso que retumba ----------
  const retumba = (fuerte = 30) => {
    zum(fuerte);
    stage.classList.remove("stomp"); void stage.offsetWidth; stage.classList.add("stomp");
    viento = 4;
  };
  addEventListener("flyview", (e) => {
    if (!e.detail.dir) return;
    setTimeout(() => { retumba(35); nube(innerWidth / 2, innerHeight * .92, 18); }, quieto ? 0 : 1050);
  });

  // ---------- tocar el suelo deja una huella ----------
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a")) return;
    const p = document.createElement("div");
    p.className = "print";
    p.style.left = e.clientX + "px"; p.style.top = e.clientY + "px";
    p.style.setProperty("--r", rnd(-25, 25) + "deg");
    p.appendChild(planta());
    document.body.appendChild(p);
    p.addEventListener("animationend", () => p.remove());
    retumba(25); nube(e.clientX, e.clientY + 40, 10);
  });

  // ---------- el título cae con peso ----------
  const em = document.querySelector(".hero h1.big em");
  if (em && !quieto) {
    em.animate([{ transform: "translateY(-60px)", opacity: 0 }, { transform: "translateY(-60px)", opacity: 0, offset: .55 }, { transform: "translateY(6px)", opacity: 1, offset: .8 }, { transform: "none", opacity: 1 }], { duration: 1500, easing: "cubic-bezier(.5,0,.4,1)" })
      .finished.then(() => { retumba(30); const r = em.getBoundingClientRect(); nube(r.left + r.width / 2, r.bottom, 12); });
  }

  // ---------- cada prompt, pisado: mantener pulsado para levantar la pata ----------
  const DUR = 900;
  const libera = (press) => {
    press.classList.add("gone");
    press.style.setProperty("--lift", 1);
    zum([20, 40, 30]);
    const r = press.getBoundingClientRect(); nube(r.left + r.width * .2, r.bottom - 10, 12);
    setTimeout(() => press.classList.remove("stepped"), 250);
  };
  document.querySelectorAll(".code").forEach((code) => {
    const press = document.createElement("div");
    press.className = "press stepped";
    code.replaceWith(press); press.appendChild(code);
    const shade = document.createElement("i"); shade.className = "shade"; press.appendChild(shade);
    press.appendChild(planta());
    press.insertAdjacentHTML("beforeend", `<button class="hold-btn" type="button" aria-label="Hold to lift the foot off the prompt"><svg viewBox="0 0 36 36"><circle class="track" cx="18" cy="18" r="15.9" pathLength="100"/><circle class="fill" cx="18" cy="18" r="15.9" pathLength="100"/></svg>Hold to lift</button>`);
    const btn = press.querySelector(".hold-btn");
    let lift = 0, objetivo = 0, ultimo = 0, corriendo = false;
    const pinta = () => press.style.setProperty("--lift", lift.toFixed(3));
    const bucle = (t) => {
      const dt = t - ultimo; ultimo = t;
      if (objetivo > lift) lift = Math.min(1, lift + dt / DUR);
      else lift = Math.max(0, lift - dt / 260);
      pinta();
      if (lift >= 1) { corriendo = false; libera(press); return; }
      if (lift <= 0 && objetivo === 0) { corriendo = false; return; }
      requestAnimationFrame(bucle);
    };
    const arranca = () => { if (!corriendo) { corriendo = true; ultimo = performance.now(); requestAnimationFrame(bucle); } };
    btn.addEventListener("pointerdown", (e) => { e.preventDefault(); btn.setPointerCapture(e.pointerId); objetivo = 1; zum(10); arranca(); });
    const suelta = () => { if (objetivo === 1 && lift < 1) { objetivo = 0; if (lift > .15) { retumba(15); } arranca(); } };
    btn.addEventListener("pointerup", suelta);
    btn.addEventListener("pointercancel", suelta);
    // con teclado (o si alguien solo hace clic): la levanta entera
    btn.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); objetivo = 1; arranca(); } });
    btn.addEventListener("contextmenu", (e) => e.preventDefault());
    if (quieto) btn.addEventListener("click", () => libera(press));
    press.parentElement.querySelector(".cp")?.addEventListener("click", () => { if (press.classList.contains("stepped")) libera(press); });
  });

  // al copiar: una tortuguita cruza el botón
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    if (quieto) return;
    // va en la targeta, no dentro del botón: el botón cambia su texto al copiar y la borraría
    const t = document.createElement("i"); t.className = "tortoise"; t.style.setProperty("--w", b.offsetWidth + "px");
    t.style.left = b.offsetLeft - 40 + "px"; t.style.top = b.offsetTop + b.offsetHeight - 16 + "px"; t.style.bottom = "auto";
    (b.offsetParent || b.parentElement).appendChild(t); t.addEventListener("animationend", () => t.remove());
  }));

  // ---------- reglas: debajo de una huella ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((slab) => {
    slab.appendChild(planta());
    slab.insertAdjacentHTML("beforeend", `<div class="hint">Tap the footprint</div>`);
    slab.setAttribute("role", "button"); slab.tabIndex = 0;
    slab._abre = (si) => {
      const abierto = si ?? !slab.classList.contains("open");
      slab.classList.toggle("open", abierto); slab.setAttribute("aria-expanded", abierto);
      if (abierto) { retumba(20); const r = slab.getBoundingClientRect(); nube(r.left + r.width / 2, r.bottom - 20, 8); }
    };
    slab.addEventListener("click", () => slab._abre());
    slab.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); slab._abre(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s)).forEach((s, k) => setTimeout(() => { if (!s.classList.contains("open")) s._abre(true); }, (quieto ? 0 : 1300) + k * 520));
  });
})();
