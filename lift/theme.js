// LIFT — el fondo es el patio de un santuario de elefantes por la mañana: neblina cálida, palmeras lejanas, una valla de
// madera, el polvo del suelo, un tamarindo con la copa de lado a lado y una elefanta a la derecha. Al avanzar, la trompa
// sube a la cabrita: primero de pie contra el árbol, luego en alto comiendo de la rama que cuelga y al final de pie
// encima de su cabeza. Tocar el patio sacude la copa y caen hojas. Cada prompt está tapado por ramitas de hojas:
// manteniendo pulsado, la trompa se enrosca en la cabrita y la sube hacia el dedo, y se come las hojas que toca; al
// soltar, la baja despacio (nunca la deja caer). Con todas comidas, la deja encima de su cabeza. Al copiar, una cabrita
// sube encima del botón. Las reglas llegan aupadas desde abajo. Cámara "hoist".
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");
  const lerp = (a, b, t) => a + (b - a) * t;
  const suave = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
  const VERDES = ["#4F7A32", "#6A9440", "#86A852"];

  // ---------- el patio ----------
  const cv = document.createElement("canvas");
  cv.id = "yard"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  let W, H, dpr, fondo = null, suelo = 0, s = 0, ex = 0, ey = 0, tx = 0;
  const caen = [], angRamita = [];
  for (let k = 0; k < 12; k++) angRamita.push(rnd(0, 3.14));
  let meneo = 0;

  const hoja = (c, x, y, r, a) => { c.beginPath(); c.ellipse(x, y, r, r * .42, a, 0, 6.283); c.fill(); };
  const palmera = (c, x, base, h, lado) => {
    c.strokeStyle = "#9A8C72"; c.lineWidth = Math.max(2, h * .03); c.lineCap = "round";
    const px = x + lado * h * .12, py = base - h;
    c.beginPath(); c.moveTo(x, base); c.quadraticCurveTo(x + lado * h * .02, base - h * .6, px, py); c.stroke();
    c.strokeStyle = "#7E9670"; c.lineWidth = Math.max(2, h * .025);
    for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * .5; c.beginPath(); c.moveTo(px, py); c.quadraticCurveTo(px + Math.cos(a) * h * .25, py + Math.sin(a) * h * .18, px + Math.cos(a) * h * .34, py + Math.sin(a) * h * .1 + h * .08); c.stroke(); }
  };
  const pintaFondo = () => {
    fondo = document.createElement("canvas"); fondo.width = W; fondo.height = H;
    const c = fondo.getContext("2d");
    suelo = H * .64;
    s = Math.min(W * .5, H * .32); ex = W - s * .95; ey = H * .93 - s * .95; tx = Math.max(0, ex - s * 1.05);
    // la neblina de la mañana y el sol bajo a la derecha
    let g = c.createLinearGradient(0, 0, 0, suelo);
    g.addColorStop(0, "#F1E3C6"); g.addColorStop(1, "#F7EEDD");
    c.fillStyle = g; c.fillRect(0, 0, W, suelo);
    g = c.createRadialGradient(W * .92, H * .34, 0, W * .92, H * .34, Math.max(W, H) * .45);
    g.addColorStop(0, "rgba(255,238,196,.95)"); g.addColorStop(1, "rgba(255,238,196,0)");
    c.fillStyle = g; c.fillRect(0, 0, W, suelo);
    // palmeras lejanas, apagadas por la neblina
    c.globalAlpha = .5;
    for (let k = 0; k < 7; k++) palmera(c, W * (k + .5) / 7 + rnd(-20, 20) * dpr, suelo - H * .05, H * rnd(.22, .32), k % 2 ? 1 : -1);
    c.globalAlpha = 1;
    // la valla de madera
    c.fillStyle = "#BDB19D";
    const paso = 13 * dpr;
    for (let x = 0, k = 0; x < W; x += paso, k++) c.fillRect(x, suelo - H * .075 + (k % 3) * dpr, 8 * dpr, H * .075);
    c.fillRect(0, suelo - H * .055, W, 3 * dpr); c.fillRect(0, suelo - H * .025, W, 3 * dpr);
    // el suelo de polvo
    g = c.createLinearGradient(0, suelo, 0, H);
    g.addColorStop(0, "#E0C8A0"); g.addColorStop(1, "#CDAE82");
    c.fillStyle = g; c.fillRect(0, suelo, W, H - suelo);
    c.fillStyle = "rgba(110,82,52,.3)";
    for (let k = 0; k < 40; k++) { c.beginPath(); c.ellipse(rnd(0, W), rnd(suelo + H * .02, H), rnd(2, 5) * dpr, rnd(1, 2.5) * dpr, 0, 0, 6.283); c.fill(); }
    // el tamarindo
    c.fillStyle = "#6B5038";
    c.beginPath(); c.moveTo(tx, H); c.lineTo(tx + s * .22, H); c.lineTo(tx + s * .15, 0); c.lineTo(tx + s * .03, 0); c.closePath(); c.fill();
    c.strokeStyle = "rgba(60,42,28,.45)"; c.lineWidth = 2 * dpr;
    for (let k = 0; k < 6; k++) { const x = tx + s * (.05 + k * .028); c.beginPath(); c.moveTo(x, H * rnd(.05, .3)); c.lineTo(x + s * .01, H * rnd(.5, .95)); c.stroke(); }
    // la copa, de lado a lado
    c.strokeStyle = "#5A4230"; c.lineWidth = s * .045;
    c.beginPath(); c.moveTo(tx + s * .1, H * .22); c.quadraticCurveTo(W * .6, H * .05, W + 10, H * .1); c.stroke();
    c.beginPath(); c.moveTo(tx + s * .1, H * .18); c.quadraticCurveTo(tx * .5, H * .06, -10, H * .08); c.stroke();
    for (let k = 0; k < 220; k++) { c.fillStyle = VERDES[k % 3]; hoja(c, rnd(-10, W + 10), H * Math.pow(Math.random(), 1.6) * .2, rnd(6, 11) * dpr, rnd(0, 3.14)); }
  };
  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = Math.round(innerWidth * dpr); H = cv.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    pintaFondo();
    caen.length = 0;
  };
  tam();
  addEventListener("resize", tam);

  // la cabrita de fondo, mirando a la izquierda; (x, y) es el centro del cuerpo y las pezuñas quedan a 0,44 g por debajo
  const cabraFondo = (c, x, y, g, rot) => {
    c.save(); c.translate(x, y); c.rotate(rot); c.lineCap = "round";
    for (const lx of [-.3, -.18, .2, .32]) {
      c.strokeStyle = "#E6E0D4"; c.lineWidth = g * .07; c.beginPath(); c.moveTo(lx * g, g * .1); c.lineTo(lx * g, g * .4); c.stroke();
      c.strokeStyle = "#3A2E26"; c.beginPath(); c.moveTo(lx * g, g * .4); c.lineTo(lx * g, g * .44); c.stroke();
    }
    c.strokeStyle = "#F6F3EC"; c.lineWidth = g * .06; c.beginPath(); c.moveTo(g * .42, -g * .12); c.lineTo(g * .5, -g * .26); c.stroke();
    c.fillStyle = "#F6F3EC"; c.beginPath(); c.ellipse(0, 0, g * .46, g * .24, 0, 0, 6.283); c.fill();
    c.fillStyle = "#7C4A2A";
    c.beginPath(); c.ellipse(-g * .42, -g * .2, g * .13, g * .2, .5, 0, 6.283); c.fill();
    c.beginPath(); c.ellipse(-g * .56, -g * .36, g * .17, g * .12, -.2, 0, 6.283); c.fill();
    c.fillStyle = "#F6F3EC"; c.beginPath(); c.ellipse(-g * .6, -g * .4, g * .1, g * .03, -.2, 0, 6.283); c.fill();
    c.fillStyle = "#5E3820"; c.beginPath(); c.ellipse(-g * .46, -g * .3, g * .05, g * .14, .5, 0, 6.283); c.fill();
    c.fillStyle = "#1A120C"; c.beginPath(); c.arc(-g * .56, -g * .4, g * .025, 0, 6.283); c.fill();
    c.restore();
  };
  // la elefanta, de lado y mirando a la izquierda (sin la trompa)
  const elefanta = (c) => {
    c.fillStyle = "#8A8580";
    c.beginPath(); c.ellipse(ex + s * .62, ey + s * .25, s * .62, s * .42, 0, 0, 6.283); c.fill();
    for (const lx of [.08, .34, .92, 1.14]) { c.beginPath(); c.roundRect(ex + s * lx, ey + s * .35, s * .2, s * .6, s * .06); c.fill(); }
    c.fillStyle = "#A29C95";
    for (const lx of [.08, .34]) for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(ex + s * (lx + .04 + k * .06), ey + s * .93, s * .022, 0, 6.283); c.fill(); }
    c.fillStyle = "#8E8984"; c.beginPath(); c.arc(ex, ey, s * .32, 0, 6.283); c.fill();
    c.fillStyle = "#827C77"; c.beginPath(); c.ellipse(ex + s * .24, ey + s * .02, s * .16, s * .24, 0, 0, 6.283); c.fill();
    c.fillStyle = "rgba(215,167,154,.75)";
    for (let k = 0; k < 9; k++) { c.beginPath(); c.arc(ex - s * (.08 + (k % 3) * .06), ey + s * (.02 + Math.floor(k / 3) * .05), s * .012, 0, 6.283); c.fill(); }
    for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(ex + s * (.18 + (k % 3) * .05), ey + s * (.18 + Math.floor(k / 3) * .04), s * .012, 0, 6.283); c.fill(); }
    c.fillStyle = "#2A2018"; c.beginPath(); c.arc(ex - s * .13, ey - s * .04, s * .025, 0, 6.283); c.fill();
  };
  // la trompa, con la punta en "punta" y su curva en "ctrl"; va por delante de la cabrita
  const trompaFondo = (c, punta, ctrl) => {
    c.lineCap = "round"; c.strokeStyle = "#8E8984"; c.lineWidth = s * .14;
    c.beginPath(); c.moveTo(ex - s * .2, ey + s * .12); c.quadraticCurveTo(ctrl[0], ctrl[1], punta[0], punta[1]); c.stroke();
    c.strokeStyle = "#77726D"; c.setLineDash([s * .012, s * .05]); c.stroke(); c.setLineDash([]);
  };

  let p = 0, objP = 0, ultimo = 0;
  const pinta = (t) => {
    const dt = Math.min(50, t - (ultimo || t)); ultimo = t;
    p += (objP - p) * (quieto ? 1 : Math.min(1, dt / 1200));
    meneo = Math.max(0, meneo - dt);
    cx.drawImage(fondo, 0, 0);
    // la ramita que cuelga hasta la cabeza de la elefanta, que se mece
    const amp = (4 + 14 * meneo / 900) * dpr, mece = quieto ? 0 : Math.sin(t / 420) * amp;
    const r0 = [ex - s * .25, H * .14], r1 = [ex - s * .32 + mece, ey - s * .62], rc = [ex - s * .4 + mece * .5, (r0[1] + r1[1]) / 2];
    cx.strokeStyle = "#5A4230"; cx.lineWidth = 2.5 * dpr; cx.lineCap = "round";
    cx.beginPath(); cx.moveTo(r0[0], r0[1]); cx.quadraticCurveTo(rc[0], rc[1], r1[0], r1[1]); cx.stroke();
    angRamita.forEach((a, k) => {
      const q = .35 + k * .055, x = (1 - q) * (1 - q) * r0[0] + 2 * q * (1 - q) * rc[0] + q * q * r1[0], y = (1 - q) * (1 - q) * r0[1] + 2 * q * (1 - q) * rc[1] + q * q * r1[1];
      cx.fillStyle = VERDES[k % 3]; hoja(cx, x + (k % 2 ? 6 : -6) * dpr, y, 8 * dpr, a);
    });
    // la cabrita y la trompa según el avance: contra el árbol, en alto en la ramita y encima de la cabeza
    const g = s * .3;
    const G0 = [tx + s * .22 + g * .5, H * .95 - g * .48], G1 = [r1[0] + g * .525, r1[1] + g * .54], G2 = [ex + s * .04, ey - s * .3 - g * .44];
    let G, rot;
    if (p < .25) { G = G0; rot = .9; }
    else if (p < .6) { const q = suave((p - .25) / .35); G = [lerp(G0[0], G1[0], q), lerp(G0[1], G1[1], q)]; rot = lerp(.9, .3, q); }
    else if (p < .8) { const q = suave((p - .6) / .2); G = [lerp(G1[0], G2[0], q), lerp(G1[1], G2[1], q) - Math.sin(Math.PI * q) * s * .08]; rot = lerp(.3, 0, q); }
    else { G = G2; rot = 0; }
    const sujeta = p < .15 ? 0 : p < .25 ? suave((p - .15) / .1) : p < .8 ? 1 : p < .9 ? 1 - suave((p - .8) / .1) : 0;
    const panza = [G[0] - Math.sin(rot) * g * .2, G[1] + Math.cos(rot) * g * .2];
    const cuelga = [ex - s * .36, ey + s * .8], cuelgaC = [ex - s * .42, ey + s * .4];
    const sujC = [Math.min(ex - s * .2, panza[0]) - s * .22, (ey + s * .12 + panza[1]) / 2 + s * .08];
    const punta = [lerp(cuelga[0], panza[0], sujeta), lerp(cuelga[1], panza[1], sujeta)], ctrl = [lerp(cuelgaC[0], sujC[0], sujeta), lerp(cuelgaC[1], sujC[1], sujeta)];
    elefanta(cx);
    cabraFondo(cx, G[0], G[1], g, rot);
    trompaFondo(cx, punta, ctrl);
    // hojas que caen meciéndose
    for (let k = caen.length - 1; k >= 0; k--) {
      const o = caen[k]; o.y += o.vy * dt; o.x += Math.sin(t / 300 + o.ph) * .25 * dpr * dt / 16; o.a += o.va * dt;
      if (o.y > H) { caen.splice(k, 1); continue; }
      cx.fillStyle = VERDES[o.c]; hoja(cx, o.x, o.y, 7 * dpr, o.a);
    }
  };
  const bucle = (t) => { requestAnimationFrame(bucle); pinta(t); };
  if (quieto) pinta(0); else requestAnimationFrame(bucle);
  addEventListener("resize", () => { if (quieto) pinta(0); });

  const suelta = (x, n) => { if (quieto) return; for (let k = 0; k < n; k++) caen.push({ x: x + rnd(-60, 60) * dpr, y: rnd(.02, .2) * H, vy: rnd(.05, .11) * dpr, a: rnd(0, 3), va: rnd(-.004, .004), ph: rnd(0, 6), c: k % 3 }); };
  addEventListener("flyview", (e) => {
    const { index, total, dir } = e.detail;
    objP = total > 1 ? index / (total - 1) : 0;
    if (dir > 0) suelta(rnd(.1, .9) * W, 4);
    if (dir) zum(dir > 0 ? [10, 40, 10] : 6);
    if (quieto) pinta(0);
  });

  // tocar el patio: se sacude la copa y caen hojas
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a, .hoist")) return;
    zum(10); meneo = 900; suelta(e.clientX * dpr, 9);
  });

  // ---------- cada prompt, tapado de hojas: la trompa sube a la cabrita para que se las coma ----------
  const NS = "http://www.w3.org/2000/svg";
  const NHOJAS = 12;
  document.querySelectorAll(".code").forEach((code) => {
    const caja = document.createElement("div");
    caja.className = "perch on";
    code.replaceWith(caja); caja.appendChild(code);
    caja.insertAdjacentHTML("beforeend", `<div class="hoist" data-nofly role="button" tabindex="0" aria-label="Hold to lift the goat with the elephant's trunk and let him eat the leaves off the prompt"><svg class="scene" aria-hidden="true"></svg><p class="count">Leaves: <b>0</b> / ${NHOJAS}</p><p class="cue">Hold to lift. Let go and she sets him down.</p><span class="meter"><i></i></span></div>`);
    const patio = caja.querySelector(".hoist"), svg = patio.querySelector(".scene"), cuenta = patio.querySelector(".count b"), aviso = patio.querySelector(".cue"), barra = patio.querySelector(".meter i");
    // las hojas, en fracciones del patio para que sobrevivan a un cambio de tamaño
    const hojas = [];
    for (let k = 0; k < NHOJAS; k++) hojas.push({ fx: .2 + (k % 4) * .17 + rnd(-.03, .03), fy: .24 + Math.floor(k / 4) * .16 + rnd(-.03, .03), comida: false, g: null });
    let w = 0, h = 0, u = 1, E, G0, G2, G = null, rot = 38, trompaA = 0, obj = null, sube = false, auto = false, hecho = false, fin = null, antes = 0, comidas = 0;
    let trompa, arrugas, cabra;
    const el = (tag, attrs, padre = svg) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); padre.appendChild(n); return n; };
    const gira = (x, y, gr) => { const r = gr * Math.PI / 180; return [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)]; };
    // la boca de la cabrita, en coordenadas del patio
    const boca = () => { const [bx, by] = gira(-33 * u, -15 * u, rot); return [G[0] + bx, G[1] + by]; };
    const di = (txt) => { aviso.textContent = txt; };
    const dibuja = () => {
      if (!w) return;
      const B = [E[0] - 28 * u, E[1] + 14 * u];
      const [px, py] = gira(0, 15 * u, rot), panza = [G[0] + px, G[1] + py];
      const cuelga = [E[0] - 40 * u, h - 8 * u], cC = [E[0] - 46 * u, E[1] + 64 * u];
      const hC = [Math.min(B[0], panza[0]) - 30 * u, (B[1] + panza[1]) / 2 + 24 * u];
      const T = [lerp(cuelga[0], panza[0], trompaA), lerp(cuelga[1], panza[1], trompaA)], C = [lerp(cC[0], hC[0], trompaA), lerp(cC[1], hC[1], trompaA)];
      const d = `M${B[0]} ${B[1]}Q${C[0]} ${C[1]} ${T[0]} ${T[1]}`;
      trompa.setAttribute("d", d); arrugas.setAttribute("d", d);
      cabra.setAttribute("transform", `translate(${G[0]} ${G[1]}) rotate(${rot})`);
      cuenta.textContent = comidas; barra.style.width = (comidas / NHOJAS * 100).toFixed(1) + "%";
    };
    const monta = () => {
      w = patio.clientWidth; h = patio.clientHeight; if (!w || !h) return;
      u = Math.min(w, h * .66) / 210;
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`); svg.innerHTML = "";
      E = [w - 50 * u, h * .62];
      const tronco = w * .12;
      G0 = [tronco + 14 * u + 23 * u, h - 34 * u];
      G2 = [E[0] + 2 * u, E[1] - 36 * u - 21 * u];
      if (!G || !hecho) G = [...G0];
      if (hecho) G = [...G2];
      // el tronco del tamarindo y las ramitas que cuelgan de la copa
      el("rect", { x: tronco, y: 0, width: 14 * u, height: h, fill: "#6B5038" });
      el("line", { x1: tronco + 5 * u, y1: h * .1, x2: tronco + 6 * u, y2: h * .7, stroke: "rgba(60,42,28,.45)", "stroke-width": 1.5 * u });
      hojas.forEach((o, k) => {
        const x = o.fx * w, y = o.fy * h;
        el("path", { d: `M${x + (k % 2 ? 10 : -10) * u} 0Q${x + (k % 2 ? -6 : 6) * u} ${y * .5} ${x} ${y}`, stroke: "#6B5A3A", "stroke-width": 1.3 * u, fill: "none" });
        if (o.comida) { o.g = null; return; }
        o.g = el("g", { class: "hoja" });
        for (let j = 0; j < 4; j++) {
          const hx = x + Math.cos(j * 1.7 + k) * 7 * u, hy = y + Math.sin(j * 1.7 + k) * 5 * u;
          el("ellipse", { cx: hx, cy: hy, rx: 8 * u, ry: 3.4 * u, fill: VERDES[(j + k) % 3], transform: `rotate(${j * 47 + k * 13} ${hx} ${hy})` }, o.g);
        }
      });
      // la elefanta asomando por la derecha: la pata, la oreja, la cabeza y el ojo
      el("rect", { x: E[0] - 8 * u, y: E[1] + 16 * u, width: 30 * u, height: h - E[1], rx: 9 * u, fill: "#7E7A76" });
      el("ellipse", { cx: E[0] + 32 * u, cy: E[1] + 2 * u, rx: 22 * u, ry: 30 * u, fill: "#827C77" });
      el("ellipse", { cx: E[0], cy: E[1], rx: 40 * u, ry: 36 * u, fill: "#8E8984" });
      for (let k = 0; k < 9; k++) el("circle", { cx: E[0] - (12 + (k % 3) * 7) * u, cy: E[1] + (2 + Math.floor(k / 3) * 6) * u, r: 1.6 * u, fill: "#D7A79A" });
      el("circle", { cx: E[0] - 16 * u, cy: E[1] - 8 * u, r: 3 * u, fill: "#2A2018" });
      el("path", { d: `M${E[0] - 21 * u} ${E[1] - 13 * u}q${5 * u} ${-4 * u} ${10 * u} 0`, stroke: "#6E6964", "stroke-width": 1.4 * u, fill: "none" });
      // la cabrita, mirando a la izquierda: (0, 0) es el centro del cuerpo y las pezuñas quedan a 21 u por debajo
      cabra = el("g", { class: "cabra" });
      for (const x of [-13, -7, 9, 15]) {
        el("line", { x1: x * u, y1: 5 * u, x2: x * u, y2: 18 * u, stroke: "#E8E2D6", "stroke-width": 3.4 * u, "stroke-linecap": "round" }, cabra);
        el("line", { x1: x * u, y1: 18 * u, x2: x * u, y2: 21 * u, stroke: "#3A2E26", "stroke-width": 3.4 * u, "stroke-linecap": "round" }, cabra);
      }
      el("path", { d: `M${19 * u} ${-5 * u}l${4 * u} ${-7 * u}`, stroke: "#F6F3EC", "stroke-width": 2.6 * u, "stroke-linecap": "round" }, cabra);
      el("ellipse", { cx: 0, cy: 0, rx: 21 * u, ry: 11 * u, fill: "#F6F3EC", stroke: "#D8D0C0", "stroke-width": .8 * u }, cabra);
      el("ellipse", { cx: -19 * u, cy: -9 * u, rx: 6 * u, ry: 9.5 * u, fill: "#7C4A2A", transform: `rotate(28 ${-19 * u} ${-9 * u})` }, cabra);
      el("ellipse", { cx: -26 * u, cy: -16 * u, rx: 8 * u, ry: 5.6 * u, fill: "#7C4A2A", transform: `rotate(-12 ${-26 * u} ${-16 * u})` }, cabra);
      el("ellipse", { cx: -28 * u, cy: -17.5 * u, rx: 5 * u, ry: 1.4 * u, fill: "#F6F3EC", transform: `rotate(-12 ${-28 * u} ${-17.5 * u})` }, cabra);
      el("ellipse", { cx: -21 * u, cy: -13 * u, rx: 2.4 * u, ry: 6.5 * u, fill: "#5E3820", transform: `rotate(-28 ${-21 * u} ${-13 * u})` }, cabra);
      el("circle", { cx: -26 * u, cy: -18.6 * u, r: 1.2 * u, fill: "#1A120C" }, cabra);
      // la trompa, por delante de la cabrita
      trompa = el("path", { fill: "none", stroke: "#8E8984", "stroke-width": 15 * u, "stroke-linecap": "round" });
      arrugas = el("path", { fill: "none", stroke: "#77726D", "stroke-width": 15 * u, "stroke-dasharray": `${1.4 * u} ${6 * u}` });
      dibuja();
    };
    const abre = () => {
      if (caja.classList.contains("off")) return;
      hecho = true; caja.classList.remove("on"); caja.classList.add("off");
      zum([15, 30, 50]);
      setTimeout(() => patio.remove(), quieto ? 0 : 1100);
    };
    const termina = () => {
      hecho = true; sube = false; auto = false;
      if (quieto) { G = [...G2]; rot = 0; trompaA = 0; dibuja(); di("Best seat in the yard."); return abre(); }
      fin = { t: 0, a: [...G], r: rot, dicho: false };
      di("Then she put him on her head.");
    };
    const come = (o) => {
      o.comida = true; comidas++;
      if (o.g) o.g.classList.add("comida");
      zum(6);
      di(comidas < NHOJAS ? `Munch. ${NHOJAS - comidas} to go.` : "That's breakfast.");
      if (comidas === NHOJAS) termina();
    };
    // adónde va el cuerpo para que la boca quede en el dedo (o, con teclado, en la siguiente hoja)
    const destino = () => {
      if (auto) { const o = hojas.find((q) => !q.comida); if (o) obj = [o.fx * w, o.fy * h]; }
      const [bx, by] = gira(-33 * u, -15 * u, 12);
      return [Math.max(w * .12 + 30 * u, Math.min(w - 24 * u, obj[0] - bx)), Math.max(20 * u, Math.min(h - 34 * u, obj[1] - by))];
    };
    const paso = (dt) => {
      if (fin) {
        // la trompa la pasa por encima de la frente y la deja de pie encima de la cabeza; luego la suelta
        fin.t += dt / 900; const q = suave(fin.t);
        G = [lerp(fin.a[0], G2[0], q), lerp(fin.a[1], G2[1], q) - Math.sin(Math.PI * Math.min(1, fin.t)) * 26 * u];
        rot = lerp(fin.r, 0, q);
        if (fin.t >= 1) {
          trompaA = Math.max(0, trompaA - dt / 300);
          if (!fin.dicho) { fin.dicho = true; di("Best seat in the yard."); zum([20, 40, 20]); setTimeout(abre, 1000); }
        }
        return dibuja();
      }
      const enSuelo = Math.hypot(G[0] - G0[0], G[1] - G0[1]) < 1;
      // la trompa se enrosca en cuanto se pulsa y solo se suelta con la cabrita otra vez en el suelo
      const quiere = sube || !enSuelo ? 1 : 0;
      trompaA += Math.sign(quiere - trompaA) * Math.min(Math.abs(quiere - trompaA), dt / 250);
      if (trompaA > .95) {
        const meta = sube ? destino() : G0;
        const v = (sube ? .42 : .3) * u * dt, dx = meta[0] - G[0], dy = meta[1] - G[1], d = Math.hypot(dx, dy);
        G = d <= v ? [...meta] : [G[0] + dx / d * v, G[1] + dy / d * v];
      }
      const abajo = Math.hypot(G[0] - G0[0], G[1] - G0[1]) < 1;
      const rotObj = abajo ? (trompaA > .5 ? 24 : 38) : 12;
      rot += (rotObj - rot) * Math.min(1, dt / 200);
      if (!abajo && trompaA > .95) {
        const [mx, my] = boca();
        for (const o of hojas) if (!o.comida && Math.hypot(o.fx * w - mx, o.fy * h - my) < 24 * u) { come(o); if (hecho) break; }
      }
      dibuja();
    };
    const bucle = (t) => {
      if (!patio.isConnected) return;
      const dt = Math.min(50, t - (antes || t)); antes = t;
      if (w) paso(dt);
      requestAnimationFrame(bucle);
    };
    const pos = (e) => {
      const r = patio.getBoundingClientRect();
      return [(e.clientX - r.left) * patio.offsetWidth / (r.width || 1), (e.clientY - r.top) * patio.offsetHeight / (r.height || 1)];
    };
    patio.addEventListener("pointerdown", (e) => {
      if (hecho || !w) return;
      if (quieto) {
        hojas.filter((o) => !o.comida).slice(0, Math.ceil(NHOJAS / 3)).forEach((o) => { if (!hecho) come(o); });
        return dibuja();
      }
      sube = true; obj = pos(e); zum(8);
      di("Up he goes. Find the leaves.");
      try { patio.setPointerCapture(e.pointerId); } catch {}
    });
    patio.addEventListener("pointermove", (e) => { if (sube && !auto) obj = pos(e); });
    const corta = () => { if (auto || hecho) return; sube = false; di("Gently. She sets him down."); };
    patio.addEventListener("pointerup", corta);
    patio.addEventListener("pointercancel", corta);
    patio.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      if (hecho || !w) return;
      // con teclado: la trompa la lleva sola de hoja en hoja
      if (quieto) { hojas.filter((o) => !o.comida).forEach((o) => { if (!hecho) come(o); }); return; }
      auto = true; sube = true; obj = [G[0], G[1]];
    });
    caja.parentElement.querySelector(".cp")?.addEventListener("click", abre);
    monta(); addEventListener("resize", monta);
    if (!w) requestAnimationFrame(monta);
    if (!quieto) requestAnimationFrame(bucle);
  });

  // al copiar: una cabrita sube de un salto encima del botón
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    zum([8, 30, 8]);
    if (quieto) return;
    const r = b.getBoundingClientRect(), c = document.createElement("span");
    c.className = "cabrita"; c.textContent = "🐐"; c.setAttribute("aria-hidden", "true");
    c.style.cssText = `left:${r.left + r.width / 2}px;top:${r.top}px`;
    document.body.appendChild(c); c.addEventListener("animationend", () => c.remove());
    b.classList.remove("carga"); void b.offsetWidth; b.classList.add("carga");
  }));

  // ---------- reglas: llegan aupadas desde abajo ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((r) => {
    if (!quieto) r.classList.add("abajo");
    r.setAttribute("role", "button"); r.tabIndex = 0;
    r._aupa = () => { if (quieto) return; r.classList.remove("aupa"); void r.offsetWidth; r.classList.add("aupa"); zum([6, 40, 6]); };
    r.addEventListener("click", r._aupa);
    r.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); r._aupa(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((r) => e.detail.els.includes(r) && !r._vista)
      .forEach((r, n) => { r._vista = true; setTimeout(() => { r.classList.remove("abajo"); zum(8); }, (quieto ? 0 : 450) + n * 380); });
  });
})();
