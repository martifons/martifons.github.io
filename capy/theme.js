// CAPY — el fondo es un onsen en la nieve: ladera blanca con pinos y rocas nevadas, la poza turquesa que humea, nieve que
// cae y vapor que sube. La página empieza helada (tinte azul y escarcha en los bordes) y se calienta al avanzar; la
// capibara flota en la poza con la mandarina en la cabeza y el monito pasa de tiritar en la roca a su lomo y a comerse la
// mandarina. Tocar el agua hace ondas y suelta vapor; tocar la nieve la levanta. Cada prompt está dentro de una
// mandarina: se pela tira a tira arrastrando hacia abajo y, pelada, se parte en dos tirando hacia los lados. Al copiar,
// un gajo salta del botón y un mono lo atrapa desde el borde. Las reglas llegan con un gorro de nieve que se derrite.
// Cámara "peel".
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");
  const lerp = (a, b, t) => a + (b - a) * t;
  const suave = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

  // ---------- el onsen ----------
  const cv = document.createElement("canvas");
  cv.id = "onsen"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  let W, H, dpr, fondo = null, agua = 0, s = 0, cx0 = 0;
  const copos = [], vapor = [], ondas = [];

  const pino = (c, x, base, h) => {
    for (let k = 0; k < 3; k++) {
      const y = base - h * k * .26, w = h * (.36 - k * .09);
      c.fillStyle = "#3A5546"; c.beginPath(); c.moveTo(x - w, y); c.lineTo(x, y - h * .42); c.lineTo(x + w, y); c.closePath(); c.fill();
      c.fillStyle = "rgba(255,255,255,.9)"; c.beginPath(); c.moveTo(x - w * .55, y - h * .16); c.lineTo(x, y - h * .42); c.lineTo(x + w * .55, y - h * .16); c.quadraticCurveTo(x, y - h * .2, x - w * .55, y - h * .16); c.fill();
    }
  };
  const roca = (c, x, y, rx, ry) => {
    c.fillStyle = "#3E4446"; c.beginPath(); c.ellipse(x, y, rx, ry, 0, Math.PI, 0); c.fill();
    c.fillStyle = "#FBFCFD"; c.beginPath(); c.ellipse(x, y - ry * .86, rx * .78, ry * .3, 0, 0, 6.283); c.fill();
  };
  const pintaFondo = () => {
    fondo = document.createElement("canvas"); fondo.width = W; fondo.height = H;
    const c = fondo.getContext("2d");
    agua = H * .62;
    // en horizontal, la capibara se va a la derecha para que no quede detrás de las tarjetas
    s = Math.min(W * .45, H * .28); cx0 = W > H ? W * .88 : W * .64;
    // el cielo de nieve y la ladera
    let g = c.createLinearGradient(0, 0, 0, agua);
    g.addColorStop(0, "#D9E2E8"); g.addColorStop(1, "#F1F5F7");
    c.fillStyle = g; c.fillRect(0, 0, W, agua);
    c.fillStyle = "#F6F8FA";
    c.beginPath(); c.ellipse(W * .2, agua, W * .7, H * .2, 0, Math.PI, 0); c.fill();
    c.beginPath(); c.ellipse(W * .9, agua, W * .6, H * .27, 0, Math.PI, 0); c.fill();
    // pinos nevados, apagados por la nieve que cae
    c.globalAlpha = .55;
    for (let k = 0; k < 10; k++) pino(c, rnd(0, W), agua - H * rnd(.04, .14), H * rnd(.12, .22));
    c.globalAlpha = 1;
    // rocas nevadas en la orilla
    for (let k = 0; k < 8; k++) roca(c, W * (k + .5) / 8 + rnd(-15, 15) * dpr, agua + 2 * dpr, H * rnd(.04, .07), H * rnd(.03, .05));
    // la poza turquesa
    g = c.createLinearGradient(0, agua, 0, H);
    g.addColorStop(0, "#A9DAD6"); g.addColorStop(1, "#6EAEAC");
    c.fillStyle = g; c.fillRect(0, agua, W, H - agua);
    // la roca grande, detrás de los hombros de la capibara
    roca(c, cx0 + s * .15, agua + s * .02, s * .42, s * .5);
  };
  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = Math.round(innerWidth * dpr); H = cv.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    pintaFondo();
    copos.length = 0; vapor.length = 0; ondas.length = 0;
    for (let k = 0; k < 70; k++) copos.push({ x: rnd(0, W), y: rnd(0, H), r: rnd(1, 2.6) * dpr, vy: rnd(.02, .05) * dpr, ph: rnd(0, 6) });
  };
  tam();
  addEventListener("resize", tam);

  const mandarina = (c, x, y, r) => {
    c.fillStyle = "#F28C1E"; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill();
    c.fillStyle = "#4E7A32"; c.beginPath(); c.ellipse(x + r * .2, y - r * .95, r * .35, r * .15, -.4, 0, 6.283); c.fill();
  };
  const mitad = (c, x, y, r, lado) => {
    c.fillStyle = "#F28C1E"; c.beginPath(); c.arc(x, y, r, lado < 0 ? Math.PI / 2 : -Math.PI / 2, lado < 0 ? Math.PI * 1.5 : Math.PI / 2); c.fill();
    c.fillStyle = "#F9B04E"; c.beginPath(); c.ellipse(x, y, r * .3, r * .9, 0, 0, 6.283); c.fill();
  };
  const capibara = (c, y0, conMandarina) => {
    const x = cx0, y = agua + y0;
    c.fillStyle = "#8A6142";
    c.beginPath(); c.ellipse(x + s * .2, y, s * .55, s * .2, 0, Math.PI, 0); c.fill();
    c.beginPath(); c.roundRect(x - s * .62, y - s * .3, s * .5, s * .3, s * .1); c.fill();
    c.fillStyle = "#6E4A30"; c.beginPath(); c.roundRect(x - s * .64, y - s * .22, s * .14, s * .2, s * .05); c.fill();
    c.fillStyle = "#5A3C26"; c.beginPath(); c.ellipse(x - s * .2, y - s * .3, s * .04, s * .05, 0, 0, 6.283); c.fill();
    c.strokeStyle = "#3A2616"; c.lineWidth = 2 * dpr; c.lineCap = "round";
    c.beginPath(); c.moveTo(x - s * .38, y - s * .2); c.quadraticCurveTo(x - s * .34, y - s * .17, x - s * .3, y - s * .2); c.stroke();
    if (conMandarina) mandarina(c, x - s * .38, y - s * .36, s * .065);
    c.fillStyle = "rgba(255,255,255,.3)"; c.fillRect(x - s * .66, y - dpr, s * 1.42, 2 * dpr);
  };
  // el monito: (x, y) son los pies y m el alto; "abrazo" es encogido de frío y "delante" con las manos al frente
  const mono = (c, x, y, m, manos) => {
    c.save(); c.translate(x, y);
    c.fillStyle = "#8C8072";
    c.beginPath(); c.ellipse(0, -m * .32, m * .26, m * .32, 0, 0, 6.283); c.fill();
    for (const ox of [-.19, .19]) { c.beginPath(); c.arc(ox * m, -m * .82, m * .06, 0, 6.283); c.fill(); }
    c.beginPath(); c.arc(0, -m * .78, m * .2, 0, 6.283); c.fill();
    c.fillStyle = "#E7A5A0"; c.beginPath(); c.ellipse(-m * .03, -m * .76, m * .12, m * .13, 0, 0, 6.283); c.fill();
    c.fillStyle = "#2A1E18"; for (const ox of [-.07, .02]) { c.beginPath(); c.arc(ox * m, -m * .8, m * .02, 0, 6.283); c.fill(); }
    c.strokeStyle = "#7C7064"; c.lineWidth = m * .09; c.lineCap = "round"; c.beginPath();
    if (manos === "abrazo") { c.moveTo(-m * .2, -m * .52); c.quadraticCurveTo(0, -m * .3, m * .2, -m * .52); }
    else { c.moveTo(-m * .18, -m * .52); c.lineTo(-m * .24, -m * .44); c.moveTo(m * .18, -m * .52); c.lineTo(-m * .04, -m * .44); }
    c.stroke(); c.restore();
  };

  let p = 0, objP = 0, ultimo = 0, sigVapor = 0;
  const pinta = (t) => {
    const dt = Math.min(50, t - (ultimo || t)); ultimo = t;
    p += (objP - p) * (quieto ? 1 : Math.min(1, dt / 1200));
    cx.drawImage(fondo, 0, 0);
    // ondas en el agua
    for (let k = ondas.length - 1; k >= 0; k--) {
      const o = ondas[k], e = (t - o.t0) / 1400;
      if (e > 1) { ondas.splice(k, 1); continue; }
      cx.strokeStyle = `rgba(255,255,255,${(.6 * (1 - e)).toFixed(3)})`; cx.lineWidth = 2 * dpr;
      cx.beginPath(); cx.ellipse(o.x, o.y, 10 * dpr + e * 70 * dpr, (10 * dpr + e * 70 * dpr) * .3, 0, 0, 6.283); cx.stroke();
    }
    // la capibara con la mandarina y el monito según el avance: tiritando en la roca, en su lomo y comiendo
    const flota = quieto ? 0 : Math.sin(t / 1300) * 2 * dpr, m = s * .42;
    const M0 = [cx0 + s * .15, agua - s * .46], M1 = [cx0 - s * .05, agua - s * .17 + flota];
    capibara(cx, flota, p < .55);
    let M, manos = "delante";
    if (p < .25) { M = [M0[0] + (quieto ? 0 : Math.sin(t / 28) * 1.2 * dpr), M0[1]]; manos = "abrazo"; }
    else if (p < .5) { const q = suave((p - .25) / .25); M = [lerp(M0[0], M1[0], q), lerp(M0[1], M1[1], q) - Math.sin(Math.PI * q) * s * .06]; }
    else M = M1;
    mono(cx, M[0], M[1], m, manos);
    const mano = [M[0] - m * .16, M[1] - m * .44];
    if (p >= .55 && p < .75) mandarina(cx, mano[0], mano[1], s * .065);
    else if (p >= .75) {
      const sep = p < .9 ? s * .12 : s * .03, alto = p < .9 ? 0 : -m * .26;
      mitad(cx, mano[0] - sep, mano[1] + alto, s * .065, -1); mitad(cx, mano[0] + sep, mano[1] + alto, s * .065, 1);
    }
    // vapor que sube de la poza
    if (!quieto && t > sigVapor && vapor.length < 30) { vapor.push({ x: rnd(0, W), y: agua + rnd(0, H * .06), r: rnd(8, 16) * dpr, a: rnd(.1, .18), vx: rnd(-.01, .01) * dpr }); sigVapor = t + 140; }
    for (let k = vapor.length - 1; k >= 0; k--) {
      const v = vapor[k]; v.y -= .025 * dpr * dt; v.x += v.vx * dt; v.r += .012 * dpr * dt; v.a -= .00012 * dt;
      if (v.a <= 0) { vapor.splice(k, 1); continue; }
      cx.fillStyle = `rgba(255,255,255,${v.a.toFixed(3)})`; cx.beginPath(); cx.arc(v.x, v.y, v.r, 0, 6.283); cx.fill();
    }
    // la nieve: se derrite al tocar el agua
    cx.fillStyle = "rgba(255,255,255,.9)";
    for (const f of copos) {
      if (!quieto) { f.y += f.vy * dt; f.x += Math.sin(t / 900 + f.ph) * .15 * dpr * dt / 16; }
      if (f.y > agua + (f.ph / 6) * (H - agua) || f.x < -10 || f.x > W + 10) { f.y = -10; f.x = rnd(0, W); }
      cx.beginPath(); cx.arc(f.x, f.y, f.r, 0, 6.283); cx.fill();
    }
    // el frío: tinte azul y escarcha en los bordes, que se van al avanzar
    const frio = 1 - p;
    cx.fillStyle = `rgba(150,190,235,${(.2 * frio).toFixed(3)})`; cx.fillRect(0, 0, W, H);
    const g = cx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .35, W / 2, H / 2, Math.max(W, H) * .75);
    g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(1, `rgba(240,248,255,${(.6 * frio).toFixed(3)})`);
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);
  };
  const bucle = (t) => { requestAnimationFrame(bucle); pinta(t); };
  if (quieto) pinta(0); else requestAnimationFrame(bucle);
  addEventListener("resize", () => { if (quieto) pinta(0); });

  addEventListener("flyview", (e) => {
    const { index, total, dir } = e.detail;
    objP = total > 1 ? index / (total - 1) : 0;
    if (dir > 0) ondas.push({ x: cx0, y: agua + s * .05, t0: performance.now() });
    if (dir) zum(dir > 0 ? [10, 40, 10] : 6);
    if (quieto) pinta(0);
  });

  // tocar el agua: onda y vapor; tocar la nieve: un puñado de copos
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a, .rind")) return;
    zum(10);
    const x = e.clientX * dpr, y = e.clientY * dpr, t = performance.now();
    if (y > agua) {
      ondas.push({ x, y, t0: t });
      if (!quieto) for (let k = 0; k < 5; k++) vapor.push({ x: x + rnd(-30, 30) * dpr, y, r: rnd(10, 18) * dpr, a: .22, vx: rnd(-.02, .02) * dpr });
    } else if (!quieto) for (let k = 0; k < 12; k++) copos.push({ x: x + rnd(-40, 40) * dpr, y: y + rnd(-30, 10) * dpr, r: rnd(1.5, 3) * dpr, vy: rnd(.03, .07) * dpr, ph: rnd(0, 6) });
    if (copos.length > 140) copos.splice(70, copos.length - 140);
    if (quieto) pinta(0);
  });

  // ---------- cada prompt, dentro de una mandarina: se pela tira a tira y se parte en dos ----------
  const NS = "http://www.w3.org/2000/svg";
  const TIRAS = 6;
  document.querySelectorAll(".code").forEach((code, nc) => {
    const caja = document.createElement("div");
    caja.className = "fruit on";
    code.replaceWith(caja); caja.appendChild(code);
    caja.insertAdjacentHTML("beforeend", `<div class="rind" data-nofly role="button" tabindex="0" aria-label="Peel the mandarin strip by strip, then pull it in half to reveal the prompt"><svg class="scene" aria-hidden="true"></svg><p class="count">Peeled: <b>0</b> / ${TIRAS}</p><p class="cue">Drag a strip down to peel it.</p></div>`);
    const piel = caja.querySelector(".rind"), svg = piel.querySelector(".scene"), cuenta = piel.querySelector(".count b"), aviso = piel.querySelector(".cue");
    const tiras = Array.from({ length: TIRAS }, () => ({ fuera: false, y: 0 }));
    let w = 0, h = 0, activa = null, y0 = 0, x0 = 0, movido = 0, partiendo = false, fase = "pelar", peladas = 0, izq, der;
    const el = (tag, attrs, padre = svg) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); padre.appendChild(n); return n; };
    const di = (txt) => { aviso.textContent = txt; };
    const pintaTira = (t) => {
      if (!t.recorte) return;
      t.recorte.setAttribute("y", t.y); t.recorte.setAttribute("height", Math.max(0, h - t.y));
      t.solapa.setAttribute("y", t.y); t.solapa.setAttribute("height", Math.min(t.y, h - t.y));
    };
    const monta = () => {
      w = piel.clientWidth; h = piel.clientHeight; if (!w || !h) return;
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`); svg.innerHTML = "";
      const defs = el("defs", {}), tw = w / TIRAS;
      // la pulpa, en dos mitades que se separan al partirla
      [izq, der] = [0, 1].map((lado) => {
        const g = el("g", { class: "mitad " + (lado ? "der" : "izq") });
        el("rect", { x: lado * w / 2, y: 0, width: w / 2, height: h, fill: "#F7A23A" }, g);
        for (let k = 1; k < 4; k++) {
          const x = lado * w / 2 + k * w / 8;
          el("path", { d: `M${x} 0Q${x + (lado ? 8 : -8)} ${h / 2} ${x} ${h}`, stroke: "#FBD08A", "stroke-width": 2.5, fill: "none" }, g);
        }
        for (let k = 0; k < 5; k++) {
          const x = lado * w / 2 + rnd(.1, .9) * w / 2;
          el("path", { d: `M${x} 0C${x + rnd(-20, 20)} ${h * .3} ${x + rnd(-20, 20)} ${h * .6} ${x + rnd(-10, 10)} ${h}`, stroke: "rgba(255,248,232,.85)", "stroke-width": 1.2, fill: "none" }, g);
        }
        return g;
      });
      if (fase === "hecha") { izq.classList.add("abierta"); der.classList.add("abierta"); }
      // las tiras de piel, cada una recortada desde donde se ha despegado
      tiras.forEach((t, i) => {
        t.recorte = t.solapa = t.g = null;
        if (t.fuera) return;
        const id = `piel${nc}-${i}`;
        t.recorte = el("rect", { x: i * tw - 1, y: t.y, width: tw + 2, height: h - t.y }, el("clipPath", { id }, defs));
        t.g = el("g", { class: "tira" });
        const cuerpo = el("g", { "clip-path": `url(#${id})` }, t.g);
        el("rect", { x: i * tw, y: 0, width: tw + .5, height: h, fill: i % 2 ? "#EF8A1D" : "#F2911F" }, cuerpo);
        const n = Math.min(90, Math.round(tw * h / 380));
        for (let k = 0; k < n; k++) el("circle", { cx: i * tw + rnd(2, tw - 2), cy: rnd(2, h - 2), r: rnd(.8, 1.8), fill: "#D97412" }, cuerpo);
        el("line", { x1: (i + 1) * tw, y1: 0, x2: (i + 1) * tw, y2: h, stroke: "#D9741A", "stroke-width": 1 }, cuerpo);
        t.solapa = el("rect", { x: i * tw + 1, y: t.y, width: tw - 2, height: Math.min(t.y, h - t.y), rx: 4, fill: "#FFF0D2", stroke: "#F2C98A", "stroke-width": 1 }, t.g);
      });
    };
    const abre = () => {
      if (caja.classList.contains("off")) return;
      fase = "hecha"; caja.classList.remove("on"); caja.classList.add("off");
      zum([15, 30, 50]);
      setTimeout(() => piel.remove(), quieto ? 0 : 1000);
    };
    const arranca = (i) => {
      const t = tiras[i];
      if (t.fuera || fase !== "pelar") return;
      t.fuera = true; peladas++;
      if (t.g) { const g = t.g; g.classList.add("cae"); g.style.setProperty("--giro", (i % 2 ? 14 : -14) + "deg"); setTimeout(() => g.remove(), quieto ? 0 : 700); }
      cuenta.textContent = peladas; zum(12);
      if (peladas < TIRAS) di(`${TIRAS - peladas} strip${TIRAS - peladas > 1 ? "s" : ""} to go.`);
      else { fase = "partir"; di("Now pull it in half."); }
    };
    const parte = () => {
      if (fase !== "partir") return;
      fase = "hecha"; izq.style.transform = der.style.transform = "";
      izq.classList.add("abierta"); der.classList.add("abierta");
      di("He kept both halves."); zum([20, 40, 20]);
      setTimeout(abre, quieto ? 0 : 900);
    };
    const siguiente = (i) => {
      if (!tiras[i].fuera) return i;
      let mejor = null;
      tiras.forEach((t, k) => { if (!t.fuera && (mejor === null || Math.abs(k - i) < Math.abs(mejor - i))) mejor = k; });
      return mejor;
    };
    const pos = (e) => {
      const r = piel.getBoundingClientRect();
      return [(e.clientX - r.left) * piel.offsetWidth / (r.width || 1), (e.clientY - r.top) * piel.offsetHeight / (r.height || 1)];
    };
    piel.addEventListener("pointerdown", (e) => {
      if (!w || fase === "hecha") return;
      const [x, y] = pos(e);
      if (quieto) {
        if (fase === "pelar") { arranca(siguiente(0)); if (fase === "pelar") arranca(siguiente(0)); }
        else parte();
        return;
      }
      try { piel.setPointerCapture(e.pointerId); } catch {}
      x0 = x; y0 = y; movido = 0;
      if (fase === "pelar") { activa = siguiente(Math.max(0, Math.min(TIRAS - 1, Math.floor(x / (w / TIRAS))))); zum(6); }
      else partiendo = true;
    });
    piel.addEventListener("pointermove", (e) => {
      if (activa === null && !partiendo) return;
      const [x, y] = pos(e);
      movido = Math.max(movido, Math.hypot(x - x0, y - y0));
      if (activa !== null) {
        const t = tiras[activa];
        t.y = Math.max(0, Math.min(h, (y - y0) * 1.8)); pintaTira(t);
        if (t.y >= h * .6) { arranca(activa); activa = null; }
      } else if (partiendo) {
        const d = Math.abs(x - x0);
        izq.style.transform = `translateX(${-d * .4}px)`; der.style.transform = `translateX(${d * .4}px)`;
        if (d >= w * .16) { partiendo = false; parte(); }
      }
    });
    const suelta = () => {
      if (activa !== null) {
        const t = tiras[activa]; activa = null;
        if (t.y > 0) { t.y = 0; pintaTira(t); di("Pull it further down."); }
      }
      if (partiendo) {
        partiendo = false;
        // un toque sin arrastrar también la parte
        if (movido < 6) parte(); else if (fase === "partir") { izq.style.transform = der.style.transform = ""; di("Pull harder. Sideways."); }
      }
    };
    piel.addEventListener("pointerup", suelta);
    piel.addEventListener("pointercancel", suelta);
    piel.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      if (fase === "pelar") arranca(siguiente(0)); else parte();
    });
    caja.parentElement.querySelector(".cp")?.addEventListener("click", abre);
    monta(); addEventListener("resize", monta);
    if (!w) requestAnimationFrame(monta);
  });

  // al copiar: un gajo salta del botón y un mono lo atrapa desde el borde
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    zum([8, 30, 8]);
    if (quieto) return;
    const r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    const gajo = document.createElement("span"), mono = document.createElement("span");
    gajo.className = "gajo"; gajo.textContent = "🍊"; gajo.setAttribute("aria-hidden", "true");
    gajo.style.cssText = `left:${x}px;top:${y}px;--dx:${(innerWidth - 30 - x).toFixed(0)}px`;
    mono.className = "manita"; mono.textContent = "🐒"; mono.setAttribute("aria-hidden", "true");
    mono.style.top = `${Math.max(8, y - 50)}px`;
    document.body.append(gajo, mono);
    gajo.addEventListener("animationend", () => gajo.remove());
    mono.addEventListener("animationend", () => mono.remove());
  }));

  // ---------- reglas: llegan con un gorro de nieve que se derrite ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((r) => {
    const gorro = document.createElement("i");
    gorro.className = "gorro"; gorro.setAttribute("aria-hidden", "true");
    r.appendChild(gorro);
    if (!quieto) r.classList.add("nieve");
    r.setAttribute("role", "button"); r.tabIndex = 0;
    r._nieva = () => { if (quieto) return; r.classList.add("nieve"); void r.offsetWidth; setTimeout(() => r.classList.remove("nieve"), 700); zum([6, 30, 6]); };
    r.addEventListener("click", r._nieva);
    r.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); r._nieva(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((r) => e.detail.els.includes(r) && !r._vista)
      .forEach((r, n) => { r._vista = true; setTimeout(() => { r.classList.remove("nieve"); zum(8); }, (quieto ? 0 : 500) + n * 400); });
  });
})();
