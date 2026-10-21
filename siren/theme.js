// SIREN — el fondo es el banco de arena visto desde la puerta abierta del helicóptero: el mar azul al fondo, el
// agua turquesa con manchas de coral y destellos, la orilla con su espuma, la arena con sus ondas y, a la izquierda,
// el marco de la puerta y el asidero. Al avanzar, la sirena se arrastra hacia el agua dejando un surco, entra,
// levanta la aleta y se va: queda una sombra que se aleja y anillos en el agua. Tocar el agua hace ondas. Cada
// prompt está bajo el agua: hay que seguir una perla que se mueve (con el dedo pulsado, o con el ratón encima)
// hasta llenar el anillo, y el agua se abre desde la perla. Al copiar suben burbujas. Las reglas salen a la
// superficie: el texto tiembla como visto a través del agua y se aclara. Cámara "tide".
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");

  // ---------- el banco de arena ----------
  const cv = document.createElement("canvas");
  cv.id = "shoal"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  let W, H, dpr, hz, yw, fondo = null;
  const ondas = [];

  // lo que no se mueve: cielo, mar, corales y arena con sus ondas
  const pintaFondo = () => {
    fondo = document.createElement("canvas"); fondo.width = W; fondo.height = H;
    const c = fondo.getContext("2d");
    let g = c.createLinearGradient(0, 0, 0, hz);
    g.addColorStop(0, "#BFD9EE"); g.addColorStop(1, "#E4F0F6");
    c.fillStyle = g; c.fillRect(0, 0, W, hz);
    g = c.createLinearGradient(0, hz, 0, yw);
    g.addColorStop(0, "#1E4F8E"); g.addColorStop(.35, "#1F8DA6"); g.addColorStop(.75, "#3EC4C2"); g.addColorStop(1, "#8DE3D8");
    c.fillStyle = g; c.fillRect(0, hz, W, yw - hz);
    // las manchas de coral, más pequeñas al fondo
    for (let k = 0; k < 16; k++) {
      const t = Math.pow(Math.random(), .8), y = hz + (yw - hz) * (.08 + .8 * t), x = rnd(.1, 1.05) * W, r = (8 + 38 * t) * dpr * Math.min(1.4, W / dpr / 400);
      c.fillStyle = `rgba(40,70,68,${.2 + .2 * t})`;
      for (let b = 0; b < 6; b++) { c.beginPath(); c.ellipse(x + rnd(-r, r), y + rnd(-r, r) * .35, r * rnd(.4, .8), r * rnd(.15, .3), 0, 0, 6.283); c.fill(); }
    }
    g = c.createLinearGradient(0, yw, 0, H);
    g.addColorStop(0, "#F3EEE2"); g.addColorStop(1, "#E4DAC4");
    c.fillStyle = g; c.fillRect(0, yw, W, H - yw);
    c.strokeStyle = "rgba(170,150,115,.25)"; c.lineWidth = 1.2 * dpr;
    for (let k = 0; k < 70; k++) {
      const y = rnd(yw + 8 * dpr, H), x = rnd(-.1, 1) * W, w = rnd(.1, .3) * W;
      c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + w * .3, y - 6 * dpr, x + w * .7, y + 6 * dpr, x + w, y); c.stroke();
    }
  };

  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = Math.round(innerWidth * dpr); H = cv.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    hz = H * .07; yw = H * .4;
    pintaFondo(); ondas.length = 0;
  };
  tam();
  addEventListener("resize", tam);

  // la sirena vista desde arriba y desde detrás; la cabeza mira hacia el agua (arriba)
  const sirena = (x, y, L, t, hundida) => {
    cx.save(); cx.translate(x, y); cx.globalAlpha = 1 - .55 * hundida;
    const brazo = Math.sin(t * .006), cola = Math.sin(t * .004) * L * .06;
    // la aleta en abanico, translúcida
    cx.fillStyle = "rgba(90,160,225,.8)";
    cx.beginPath(); cx.moveTo(cola, L * .82);
    cx.quadraticCurveTo(cola - L * .2, L * .95, cola - L * .17, L * 1.05); cx.quadraticCurveTo(cola, L * .98, cola + L * .17, L * 1.05); cx.quadraticCurveTo(cola + L * .2, L * .95, cola, L * .82); cx.fill();
    // la cola de escamas
    const g = cx.createLinearGradient(-L * .1, 0, L * .1, 0);
    g.addColorStop(0, "#2C6FB8"); g.addColorStop(.5, "#9FD3F2"); g.addColorStop(1, "#2E64A8");
    cx.fillStyle = g;
    cx.beginPath(); cx.moveTo(-L * .085, L * .3); cx.quadraticCurveTo(-L * .08, L * .62, cola - L * .025, L * .84); cx.lineTo(cola + L * .025, L * .84); cx.quadraticCurveTo(L * .08, L * .62, L * .085, L * .3); cx.closePath(); cx.fill();
    cx.strokeStyle = "rgba(230,245,255,.45)"; cx.lineWidth = L * .006;
    for (let k = 0; k < 7; k++) { const yy = L * (.36 + k * .065), w = L * (.07 - k * .007); cx.beginPath(); cx.arc(cola * k / 7, yy, w, .2, Math.PI - .2); cx.stroke(); }
    // la espalda, el top azul y los brazos que tiran
    cx.fillStyle = "#C98E64";
    cx.beginPath(); cx.ellipse(0, L * .2, L * .09, L * .14, 0, 0, 6.283); cx.fill();
    cx.strokeStyle = "#C98E64"; cx.lineWidth = L * .035; cx.lineCap = "round";
    for (const lado of [-1, 1]) {
      const a = lado * (.9 + .35 * brazo * lado);
      cx.beginPath(); cx.moveTo(lado * L * .07, L * .12); cx.lineTo(lado * L * .17, L * .04 - L * .05 * a * lado); cx.lineTo(lado * L * .14, -L * .06 - L * .03 * brazo * lado); cx.stroke();
    }
    cx.fillStyle = "#2B6BB0"; cx.fillRect(-L * .085, L * .17, L * .17, L * .035);
    // el pelo largo azul verdoso
    cx.fillStyle = "#1C8A92";
    cx.beginPath(); cx.ellipse(0, L * .02, L * .065, L * .07, 0, 0, 6.283); cx.fill();
    cx.beginPath(); cx.moveTo(-L * .05, L * .03); cx.quadraticCurveTo(-L * .06, L * .2, -L * .02, L * .26); cx.lineTo(L * .02, L * .26); cx.quadraticCurveTo(L * .06, L * .2, L * .05, L * .03); cx.fill();
    if (hundida > 0) { cx.globalAlpha = .45 * hundida; cx.fillStyle = "#2BB3B5"; cx.beginPath(); cx.ellipse(0, L * .5, L * .25, L * .6, 0, 0, 6.283); cx.fill(); }
    cx.restore();
  };

  let p = 0, objP = 0, ultimo = 0, entrada = null;
  const pinta = (t) => {
    const dt = Math.min(50, t - (ultimo || t)); ultimo = t;
    p += (objP - p) * (quieto ? 1 : Math.min(1, dt / 900));
    cx.drawImage(fondo, 0, 0);
    // destellos en el agua turquesa
    if (!quieto) {
      cx.strokeStyle = "rgba(235,255,250,.16)"; cx.lineWidth = 1.2 * dpr;
      for (let k = 0; k < 18; k++) {
        const y = hz + (yw - hz) * (.3 + .7 * k / 18);
        cx.beginPath();
        for (let x = 0; x <= W; x += W / 30) cx.lineTo(x, y + Math.sin(x * .02 / dpr + t * .002 + k) * 3 * dpr + Math.sin(x * .007 / dpr - t * .001 + k * 2) * 4 * dpr);
        cx.stroke();
      }
    }
    // la espuma de la orilla, que va y viene
    const orilla = yw + Math.sin(t * .0012) * H * .006;
    cx.fillStyle = "rgba(255,255,255,.75)";
    cx.beginPath(); cx.moveTo(0, orilla);
    for (let i = 0; i <= 30; i++) { const x = W * i / 30; cx.lineTo(x, orilla + Math.sin(x * .03 / dpr + t * .003) * 2.5 * dpr); }
    for (let i = 30; i >= 0; i--) { const x = W * i / 30; cx.lineTo(x, orilla + 5 * dpr + Math.sin(x * .025 / dpr + t * .002) * 3 * dpr); }
    cx.closePath(); cx.fill();
    // el camino de la sirena: de abajo a la orilla, y luego dentro del agua
    const avance = Math.min(1, p / .7), x0 = W * .56, y0 = H * .6, x1 = W * .5, y1 = yw - H * .015;
    const hx = x0 + (x1 - x0) * avance, hy = y0 + (y1 - y0) * avance;
    const L = H * (.26 - .07 * avance);
    // el surco en la arena, con los bordes amontonados
    if (avance > .02) {
      const a = Math.max(hy + L * .9, yw);
      cx.strokeStyle = "rgba(205,190,160,.85)"; cx.lineWidth = L * .2;
      cx.beginPath(); cx.moveTo(x0, y0 + L * .95); cx.lineTo(hx, Math.max(a - L * .1, hy + L * .5)); cx.stroke();
      cx.strokeStyle = "rgba(250,246,236,.9)"; cx.lineWidth = L * .03;
      for (const lado of [-1, 1]) { cx.beginPath(); cx.moveTo(x0 + lado * L * .11, y0 + L * .95); cx.lineTo(hx + lado * L * .11, Math.max(a - L * .1, hy + L * .5)); cx.stroke(); }
    }
    const hundida = Math.max(0, Math.min(1, (p - .7) / .15));
    if (p < .86) sirena(hx, hy - (hundida * H * .05), L, quieto ? 0 : t, hundida);
    else {
      // ya bajo el agua: una sombra que se aleja hacia el coral
      const q = (p - .86) / .14;
      cx.fillStyle = `rgba(20,60,70,${.45 * (1 - q)})`;
      cx.beginPath(); cx.ellipse(x1 + q * W * .1, y1 - H * .06 - q * H * .12, L * .12 * (1 - .5 * q), L * .45 * (1 - .5 * q), .2, 0, 6.283); cx.fill();
    }
    if (p > .7 && !entrada) entrada = [x1, y1 - H * .02];
    if (p < .65) entrada = null;
    if (entrada && !quieto && Math.random() < .03) ondas.push({ x: entrada[0], y: entrada[1], r: 4 * dpr, v: 1 });
    // las ondas en el agua
    cx.lineWidth = 2 * dpr;
    for (let k = ondas.length - 1; k >= 0; k--) {
      const o = ondas[k]; o.r += .05 * dt * dpr; o.v -= dt / 2200;
      if (o.v <= 0) { ondas.splice(k, 1); continue; }
      cx.strokeStyle = `rgba(240,255,252,${.7 * o.v})`;
      cx.beginPath(); cx.ellipse(o.x, o.y, o.r, o.r * .38, 0, 0, 6.283); cx.stroke();
    }
    // la puerta del helicóptero y el asidero, a la izquierda
    cx.fillStyle = "#151719"; cx.fillRect(0, 0, W * .07, H);
    cx.fillStyle = "#2B2E31";
    cx.beginPath(); cx.moveTo(0, H * .8); cx.lineTo(W * .3, H); cx.lineTo(0, H); cx.closePath(); cx.fill();
    cx.strokeStyle = "#9AA0A4"; cx.lineWidth = 9 * dpr; cx.lineCap = "round";
    cx.beginPath(); cx.moveTo(W * .085, H * .3); cx.lineTo(W * .11, H * .32); cx.lineTo(W * .11, H * .5); cx.lineTo(W * .085, H * .52); cx.stroke();
  };
  const bucle = (t) => { requestAnimationFrame(bucle); pinta(t); };
  if (quieto) pinta(0); else requestAnimationFrame(bucle);
  addEventListener("resize", () => { if (quieto) pinta(0); });

  addEventListener("flyview", (e) => {
    const { index, total, dir } = e.detail;
    objP = total > 1 ? index / (total - 1) : 0;
    if (dir) zum(dir > 0 ? [8, 30, 8] : 8);
    if (quieto) pinta(0);
  });

  // tocar el agua (o la arena mojada): ondas
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a")) return;
    zum(10);
    if (quieto) return;
    for (let k = 0; k < 3; k++) setTimeout(() => ondas.push({ x: e.clientX * dpr, y: e.clientY * dpr, r: 3 * dpr, v: 1 }), k * 180);
  });

  // ---------- cada prompt, bajo el agua: seguir la perla ----------
  const DUR = 2.2, RADIO = 46;
  document.querySelectorAll(".code").forEach((code, n) => {
    const caja = document.createElement("div");
    caja.className = "lure on";
    code.replaceWith(caja); caja.appendChild(code);
    caja.insertAdjacentHTML("beforeend", `<div class="depth" data-nofly role="button" tabindex="0" aria-label="Follow the pearl to open the water and reveal the prompt"><i class="pearl"></i><svg class="ring" viewBox="0 0 64 64" aria-hidden="true"><circle class="bg" cx="32" cy="32" r="30"/><circle class="fg" cx="32" cy="32" r="30"/></svg><p class="hint"><b>Follow</b> the pearl</p></div>`);
    const agua = caja.querySelector(".depth"), pista = agua.querySelector(".hint");
    let prog = 0, hecho = false, antes = 0, dedo = null, pulsado = false, marca = 0, px = .5, py = .45;
    const fase = n * 1.7;
    const abre = () => {
      if (hecho) return;
      hecho = true; prog = 1; caja.style.setProperty("--prog", "1");
      caja.classList.remove("on"); caja.classList.add("off");
      zum([15, 30, 40]);
      if (quieto) { agua.remove(); return; }
      const t0 = performance.now();
      const paso = (t) => {
        const e = Math.min(1, (t - t0) / 900);
        caja.style.setProperty("--hole", (160 * e * e).toFixed(1) + "%");
        if (e < 1) requestAnimationFrame(paso); else agua.remove();
      };
      requestAnimationFrame(paso);
    };
    const mueve = (t) => {
      if (hecho) return;
      const dt = Math.min(60, t - (antes || t)) / 1000; antes = t;
      // la perla nada en un ocho lento
      px = .5 + .3 * Math.sin(t * .0007 + fase); py = .42 + .22 * Math.sin(t * .0011 + fase * 2);
      caja.style.setProperty("--x", (px * 100).toFixed(2) + "%"); caja.style.setProperty("--y", (py * 100).toFixed(2) + "%");
      let cerca = false;
      if (dedo) {
        const r = agua.getBoundingClientRect();
        cerca = Math.hypot(dedo.x - (r.left + r.width * px), dedo.y - (r.top + r.height * py)) < RADIO && (pulsado || dedo.raton);
      }
      prog = cerca ? prog + dt / DUR : Math.max(0, prog - dt / 1.6);
      caja.style.setProperty("--prog", prog.toFixed(3));
      if (Math.floor(prog * 4) > marca) { marca = Math.floor(prog * 4); zum(8); }
      if (prog < .25) marca = 0;
      pista.innerHTML = cerca ? "<b>Keep</b> following" : "<b>Follow</b> the pearl";
      if (prog >= 1) { abre(); return; }
      requestAnimationFrame(mueve);
    };
    const pon = (e) => { dedo = { x: e.clientX, y: e.clientY, raton: e.pointerType === "mouse" }; };
    agua.addEventListener("pointerdown", (e) => { pulsado = true; pon(e); try { agua.setPointerCapture(e.pointerId); } catch {} });
    agua.addEventListener("pointermove", pon);
    agua.addEventListener("pointerup", () => { pulsado = false; });
    agua.addEventListener("pointercancel", () => { pulsado = false; dedo = null; });
    agua.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") dedo = null; });
    agua.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); prog += .34; if (prog >= 1) abre(); } });
    caja.parentElement.querySelector(".cp")?.addEventListener("click", abre);
    if (quieto) { caja.style.setProperty("--x", "50%"); caja.style.setProperty("--y", "45%"); }
    else requestAnimationFrame(mueve);
  });

  // al copiar: suben burbujas
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    zum([6, 20, 6]);
    if (quieto) return;
    const r = b.getBoundingClientRect();
    for (let k = 0; k < 10; k++) {
      const s = document.createElement("i"), d = rnd(8, 20);
      s.className = "bub";
      s.style.cssText = `left:${r.left + r.width / 2 + rnd(-r.width * .35, r.width * .35) - d / 2}px;top:${r.top - d / 2}px;width:${d}px;height:${d}px;--dx:${rnd(-30, 30).toFixed(0)}px;animation-delay:${k * 70}ms`;
      document.body.appendChild(s); s.addEventListener("animationend", () => s.remove());
    }
  }));

  // ---------- reglas: salen a la superficie, el texto tiembla como bajo el agua y se aclara ----------
  const NS = "http://www.w3.org/2000/svg";
  const defs = document.createElementNS(NS, "svg");
  defs.setAttribute("width", "0"); defs.setAttribute("height", "0"); defs.setAttribute("aria-hidden", "true");
  defs.style.position = "absolute";
  document.body.appendChild(defs);
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((s, n) => {
    const id = "agua-" + n;
    defs.insertAdjacentHTML("beforeend", `<filter id="${id}" x="-10%" y="-20%" width="120%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.05" numOctaves="2" seed="${n + 3}" result="r"/><feDisplacementMap in="SourceGraphic" in2="r" scale="30" xChannelSelector="R" yChannelSelector="G"/></filter>`);
    const mapa = defs.querySelector(`#${id} feDisplacementMap`), ruido = defs.querySelector(`#${id} feTurbulence`);
    const hijos = [...s.children];
    const pon = (on) => hijos.forEach((h) => { h.style.filter = on ? `url(#${id})` : ""; });
    if (!quieto) { pon(true); s.classList.add("deep"); }
    s.setAttribute("role", "button"); s.tabIndex = 0;
    let anim = 0;
    s._sale = () => {
      if (quieto) return;
      cancelAnimationFrame(anim);
      pon(true); s.classList.remove("deep");
      zum([8, 30, 8]);
      const t0 = performance.now();
      const paso = (t) => {
        const e = Math.min(1, (t - t0) / 1500);
        mapa.setAttribute("scale", (30 * (1 - e) * (1 - e)).toFixed(2));
        ruido.setAttribute("baseFrequency", `0.012 ${(0.05 + 0.02 * Math.sin(t * .01)).toFixed(3)}`);
        if (e < 1) anim = requestAnimationFrame(paso); else pon(false);
      };
      anim = requestAnimationFrame(paso);
    };
    s.addEventListener("click", s._sale);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); s._sale(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s) && !s._vista)
      .forEach((s, n) => { s._vista = true; setTimeout(s._sale, 600 + n * 400); });
  });
})();
