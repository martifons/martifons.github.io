// CODE (reel101) — "240 dominoes. Zero cameras." Al fons, la mateixa espiral del reel (240 peces, r 9 → 1,2, 2,5 entre
// voltes, una cada 0,42) vista des de dalt en un canvas. Cau a mesura que avances, i cada toc al terra n'empeny vuit més;
// a l'última parada l'última peça s'estira dins el rectangle crema i fa un flaix. Cada prompt és darrere d'una filera de
// dòminos: s'empeny el primer (toc o arrossegar cap a la dreta) i cauen un darrere l'altre, amb clics sintetitzats. Al
// copiar, un dominó petit cau sobre el botó. Les regles s'escriuen com codi, amb números de línia i cursor.
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const vibra = (ms) => { try { navigator.vibrate && navigator.vibrate(ms); } catch {} };

  // ---------- el clic de fusta, sintetitzat (només després d'un gest) ----------
  let ac = null;
  const clic = (fort = .35, to = 2600) => {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const t = ac.currentTime, n = Math.floor(ac.sampleRate * .03);
      const buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
      let lp = 0;
      for (let i = 0; i < n; i++) { lp += ((Math.random() * 2 - 1) - lp) * .55; d[i] = (Math.sin(2 * Math.PI * to * i / ac.sampleRate) * .6 + lp * .8) * Math.exp(-i / (ac.sampleRate * .004)); }
      const src = ac.createBufferSource(); src.buffer = buf;
      const g = ac.createGain(); g.gain.value = fort;
      src.connect(g).connect(ac.destination); src.start(t);
    } catch {}
  };

  // ---------- l'espiral ----------
  const N = 240, S = .42, R0 = 9, PAS = 2.5, b = PAS / (2 * Math.PI);
  const peces = [];
  { let th = 0, acum = S, px = R0, pz = 0;
    while (peces.length < N) {
      th += .002; const r = R0 - b * th, x = r * Math.cos(th), z = r * Math.sin(th);
      acum += Math.hypot(x - px, z - pz); px = x; pz = z;
      if (acum >= S) {
        acum -= S;
        const tx = -b * Math.cos(th) - r * Math.sin(th), tz = -b * Math.sin(th) + r * Math.cos(th), n = Math.hypot(tx, tz);
        peces.push({ x, z, tx: tx / n, tz: tz / n, a: 0 });
      }
    } }
  const ULT = peces[N - 1];

  const fons = document.createElement("div");
  fons.id = "floor"; fons.setAttribute("aria-hidden", "true");
  fons.innerHTML = "<canvas></canvas>";
  document.body.prepend(fons);
  const lienzo = fons.querySelector("canvas"), ctx = lienzo.getContext("2d");
  let W = 0, H = 0, esc = 1;
  const mide = () => {
    const dpr = Math.min(2, devicePixelRatio || 1);
    W = lienzo.clientWidth; H = lienzo.clientHeight;
    lienzo.width = W * dpr; lienzo.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    esc = Math.min(W, H) * .47 / (R0 + .6);
    dibuixa();
  };

  let caigudes = 0, objectiu = 0, flaix = 0;
  const hud = document.createElement("div");
  hud.id = "chainhud"; hud.setAttribute("aria-live", "polite");
  hud.innerHTML = `<span>FALLEN</span><span class="bar"><i></i></span><span class="val"></span>`;
  document.body.append(hud);
  const barra = hud.querySelector(".bar"), val = hud.querySelector(".val");
  const pintaHud = () => {
    const n = Math.min(N, Math.floor(caigudes));
    barra.style.setProperty("--p", (n / N * 100).toFixed(1) + "%");
    val.textContent = `${n}/${N}`;
  };

  // un dominó des de dalt: el rectangle que ocupa a terra, que s'allarga cap endavant quan cau
  const peca = (p, a) => {
    const cx = W / 2 + p.x * esc, cy = H / 2 + p.z * esc;
    const llarg = (.12 + Math.sin(a) * 1) * esc, ample = .5 * esc;
    const ang = Math.atan2(p.tz, p.tx);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
    const llum = 40 + Math.round(Math.sin(a) * 25);
    ctx.fillStyle = a > .01 ? `hsl(4, 92%, ${llum}%)` : "#C8170D";
    ctx.fillRect(-.06 * esc, -ample / 2, llarg, ample);
    if (a < .01) { ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.fillRect(.06 * esc, -ample / 2, .5 * esc, ample); } // l'ombra de la peça dreta
    ctx.restore();
  };
  const rectangle = () => {
    const m = .05, cx = W / 2 + ULT.x * esc, cy = H / 2 + ULT.z * esc;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.atan2(ULT.tz, ULT.tx));
    ctx.strokeStyle = `rgba(248,248,176,${.45 + .55 * flaix})`; ctx.lineWidth = 1.5 + 2 * flaix;
    ctx.strokeRect((-.06 - m) * esc, (-.25 - m) * esc, (1.06 + 2 * m) * esc, (.5 + 2 * m) * esc);
    ctx.restore();
  };
  function dibuixa() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#14110F"; ctx.fillRect(0, 0, W, H);
    rectangle();
    for (let i = N - 1; i >= 0; i--) peca(peces[i], peces[i].a);
  }

  // la cadena avança cap a l'objectiu a ~19 peces/s (la velocitat del reel)
  let ultim = performance.now(), sonades = 0;
  const pas = (t) => {
    if (!quieto) requestAnimationFrame(pas); // abans de pintar: un error no atura el bucle
    const dt = Math.min(.05, (t - ultim) / 1000); ultim = t;
    if (caigudes < objectiu) caigudes = Math.min(objectiu, caigudes + dt * 19);
    else if (caigudes > objectiu) caigudes = Math.max(objectiu, caigudes - dt * 60); // enrere: es tornen a aixecar
    peces.forEach((p, i) => {
      const u = Math.max(0, Math.min(1, caigudes - i));
      const fi = i === N - 1 ? Math.PI / 2 : 1.28;
      p.a = fi * u * u;
    });
    const n = Math.floor(caigudes);
    if (ac && n > sonades) { if (n - sonades < 4) clic(.18, 2400 + Math.random() * 900); }
    if (n === N && sonades < N) { flaix = 1; if (ac) clic(.6, 900); vibra(20); }
    sonades = n;
    flaix *= .93;
    dibuixa(); pintaHud();
  };
  mide(); addEventListener("resize", mide);
  if (quieto) { pintaHud(); } else requestAnimationFrame(pas);
  const posa = (k) => { objectiu = Math.max(0, Math.min(N, k)); if (quieto) { caigudes = objectiu; peces.forEach((p, i) => { p.a = i < caigudes ? (i === N - 1 ? Math.PI / 2 : 1.28) : 0; }); dibuixa(); pintaHud(); } };

  // avançar fa caure la part que toca; l'últim pas la fa caure sencera
  addEventListener("flyview", (e) => {
    const { index, total } = e.detail;
    posa(total > 1 ? Math.round(N * index / (total - 1)) : N);
  });
  // tocar el terra empeny vuit peces més
  addEventListener("pointerdown", (e) => {
    if (e.target.closest && e.target.closest(".slab, button, a, nav, [data-nofly]")) return;
    clic(.3); vibra(8); posa(Math.max(objectiu, caigudes) + 8);
  });

  // ---------- la filera sobre cada prompt ----------
  const FILA = 9;
  const tomba = (box, x, y) => {
    if (box.classList.contains("going") || box.classList.contains("open")) return;
    box.classList.add("going");
    const dms = [...box.querySelectorAll(".dm")];
    const cada = quieto ? 0 : 75;
    dms.forEach((d, i) => setTimeout(() => { d.classList.add("down"); clic(i === FILA - 1 ? .5 : .3, i === FILA - 1 ? 1000 : 2500 + i * 60); vibra(6); }, i * cada));
    setTimeout(() => box.classList.add("open"), dms.length * cada + (quieto ? 0 : 260));
  };
  document.querySelectorAll(".slab .code").forEach((pre) => {
    const box = document.createElement("div");
    box.className = "dbox"; box.dataset.nofly = "";
    pre.before(box); box.append(pre);
    box.insertAdjacentHTML("beforeend", `<div class="cover"><div class="row">${"<i class=\"dm\"></i>".repeat(FILA)}<button class="push" type="button" aria-label="Push the first domino to show the prompt"></button></div><div class="say"><b>Push the first domino</b><span>tap it, or drag it to the right</span><em></em></div></div>`);
    const push = box.querySelector(".push"), cover = box.querySelector(".cover");
    let x0 = null;
    push.addEventListener("pointerdown", (e) => { x0 = e.clientX; try { push.setPointerCapture(e.pointerId); } catch {} e.stopPropagation(); e.preventDefault(); });
    push.addEventListener("pointermove", (e) => { if (x0 !== null && e.clientX - x0 > 14) { x0 = null; tomba(box); } });
    push.addEventListener("pointerup", () => { if (x0 !== null) { x0 = null; tomba(box); } });
    push.addEventListener("pointercancel", () => { x0 = null; });
    push.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tomba(box); } });
    ["touchstart", "touchmove", "mousedown", "wheel"].forEach((t) => push.addEventListener(t, (e) => e.stopPropagation(), { passive: true }));
    // un toc a qualsevol lloc de la tapa que no sigui el primer: avisa, i al segon la tomba igualment
    let avisos = 0;
    cover.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      if (e.target === push) return;
      avisos++;
      box.querySelector("em").textContent = avisos > 1 ? "Fine. Down they go." : "Only the first one can start the chain.";
      if (avisos > 1) tomba(box);
    });
  });

  // ---------- en copiar: un dominó petit cau sobre el botó ----------
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    const box = b.closest(".slab")?.querySelector(".dbox");
    if (box && !box.classList.contains("open")) { tomba(box); return; }
    clic(.45, 1100); vibra(10);
    if (quieto) return;
    const r = b.getBoundingClientRect();
    const d = document.createElement("div");
    d.className = "minidom"; d.style.left = r.left + r.width / 2 - 9 + "px"; d.style.top = r.top - 30 + "px";
    document.body.append(d); setTimeout(() => d.remove(), 600);
  }));

  // ---------- regles: s'escriuen com codi quan arriben ----------
  document.querySelectorAll(".slab.rule").forEach((s, i) => {
    const p = s.querySelector("p:last-child");
    if (!p) return;
    const text = p.textContent;
    p.dataset.ln = Array.from({ length: 6 }, (_, k) => String(i * 6 + k + 1)).join("\n");
    s._escriu = () => {
      if (s._fet || quieto) return;
      s._fet = true;
      let n = 0;
      p.innerHTML = '<span></span><i class="caret"></i>';
      const sp = p.firstChild;
      const iv = setInterval(() => { n = Math.min(text.length, n + 3); sp.textContent = text.slice(0, n); if (n >= text.length) clearInterval(iv); }, 16);
    };
  });
  addEventListener("flyview", (e) => (e.detail.els || []).forEach((el) => { const s = el.closest && el.closest(".slab.rule"); if (s && s._escriu) s._escriu(); }));

  // ---------- el recompte del final ----------
  const fora = [...document.querySelectorAll(".stop")].find((s) => /outro/i.test(s.dataset.label || ""));
  const txt = fora && fora.querySelector(".slab p:not(.k)");
  if (txt) txt.insertAdjacentHTML("beforebegin", `<div class="frames-receipt"><div class="h">RENDER LOG</div><div><span>Frames, 30 fps</span><span>459</span></div><div><span>Cameras, AI video models</span><span>0</span></div><div class="tot"><span>Credits spent</span><span>0</span></div></div>`);
})();
