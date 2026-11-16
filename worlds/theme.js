// WORLDS (reel100) — "One snap. Four worlds." Detrás, uno de los cuatro mundos del reel (habitación, duna, calle con
// lluvia, glaciar), con su partícula en canvas (motas, arena, lluvia, nieve). El mundo cambia en seco, sin fundido,
// como el corte por acción: al avanzar (cada paso tiene su mundo y el final vuelve a la habitación, como el bucle),
// al tocar el fondo y al abrir un prompt. Cada prompt está tapado por una mano en pose de chasquido: se arrastra el
// pulgar hacia abajo deprisa (<400 ms, >44 px) y suena un chasquido sintetizado; despacio no vale y lo dice. Al copiar,
// una manita chasquea encima del botón. Las reglas llevan un timecode que corre; al final, el recibo de los créditos.
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const vibra = (ms) => { try { navigator.vibrate && navigator.vibrate(ms); } catch {} };
  const MUNDOS = [
    { id: "room", nombre: "ROOM", still: "#3A322B" },
    { id: "dune", nombre: "DUNE", still: "#4A2F1C" },
    { id: "street", nombre: "STREET", still: "#1C1830" },
    { id: "ice", nombre: "GLACIER", still: "#24394F" },
  ];

  // ---------- el chasquido, sintetizado (solo tras un gesto) ----------
  let ac = null;
  const chasquido = () => {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const t = ac.currentTime, n = Math.floor(ac.sampleRate * .09);
      const buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ac.sampleRate * .009));
      const src = ac.createBufferSource(); src.buffer = buf;
      const hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 1200;
      const pk = ac.createBiquadFilter(); pk.type = "peaking"; pk.frequency.value = 2700; pk.Q.value = 1.4; pk.gain.value = 10;
      const g = ac.createGain(); g.gain.value = .5;
      src.connect(hp).connect(pk).connect(g).connect(ac.destination); src.start(t);
    } catch {}
  };
  const anillo = (x, y) => {
    if (quieto) return;
    const r = document.createElement("div");
    r.className = "snapring"; r.style.left = x + "px"; r.style.top = y + "px";
    document.body.append(r); setTimeout(() => r.remove(), 500);
  };

  // ---------- los cuatro mundos ----------
  const fondo = document.createElement("div");
  fondo.id = "worlds"; fondo.setAttribute("aria-hidden", "true");
  const bokeh = Array.from({ length: 16 }, (_, i) => {
    const c = ["#FF4FA3", "#38E1FF", "#FFB347", "#B26CFF"][i % 4], s = 18 + (i * 37) % 60;
    return `<i style="left:${(i * 61) % 100}%;top:${8 + (i * 29) % 58}%;width:${s}px;height:${s}px;background:${c}"></i>`;
  }).join("");
  fondo.innerHTML = `
    <div class="w room"><div class="window"></div><div class="curtain"></div><div class="shelf"></div><div class="books"></div></div>
    <div class="w dune"><div class="sun"></div><svg class="far" viewBox="0 0 1000 200" preserveAspectRatio="none"><path d="M0 200V96C120 60 220 40 330 70S560 150 700 96 900 30 1000 60V200z"/></svg><svg class="near" viewBox="0 0 1000 200" preserveAspectRatio="none"><path d="M0 200V120C160 70 300 30 420 80S640 170 780 120 930 70 1000 90V200z"/></svg></div>
    <div class="w street"><div class="bokeh">${bokeh}</div><div class="wet"></div></div>
    <div class="w ice"><svg class="far" viewBox="0 0 1000 200" preserveAspectRatio="none"><path d="M0 200V110l90-30 70 26 110-58 90 44 120-36 100 40 140-50 120 34 160-20V200z"/></svg><svg class="near" viewBox="0 0 1000 200" preserveAspectRatio="none"><path d="M0 200V140l140-34 120 30 170-46 150 40 160-30 260 20V200z"/></svg></div>
    <canvas></canvas>`;
  document.body.prepend(fondo);
  const capas = [...fondo.querySelectorAll(".w")];

  let actual = 0;
  const hud = document.createElement("div");
  hud.id = "worldhud"; hud.setAttribute("aria-live", "polite");
  document.body.append(hud);
  const pinta_hud = () => {
    hud.innerHTML = `<span>WORLD</span><span class="sq">${MUNDOS.map((_, i) => `<i class="${i === actual ? "on" : ""}"></i>`).join("")}</span><span class="val">${MUNDOS[actual].nombre}</span>`;
  };
  // corte seco: ni transición ni fundido
  const mundo = (i) => {
    actual = ((i % 4) + 4) % 4;
    capas.forEach((c, k) => c.classList.toggle("on", k === actual));
    document.documentElement.style.setProperty("--still", MUNDOS[actual].still);
    pinta_hud(); reparte();
  };

  // ---------- partículas: motas, arena, lluvia, nieve ----------
  const lienzo = fondo.querySelector("canvas"), ctx = lienzo.getContext("2d");
  let W = 0, H = 0, ps = [];
  const reparte = () => {
    const n = [26, 70, 140, 90][actual];
    ps = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random(), v: Math.random() }));
  };
  const mide = () => {
    const dpr = Math.min(2, devicePixelRatio || 1);
    W = lienzo.clientWidth; H = lienzo.clientHeight;
    lienzo.width = W * dpr; lienzo.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    reparte();
  };
  mide(); addEventListener("resize", mide);
  let ultimo = performance.now();
  const paso = (t) => {
    if (!quieto) requestAnimationFrame(paso); // antes de pintar: un error no para el bucle
    const dt = Math.min(.05, (t - ultimo) / 1000); ultimo = t;
    ctx.clearRect(0, 0, W, H);
    for (const p of ps) {
      if (actual === 0) { // motas de polvo en la luz de la ventana
        p.y -= (4 + p.v * 6) * dt; p.x += Math.sin(t / 1800 + p.r * 9) * 6 * dt;
        ctx.fillStyle = `rgba(255,250,235,${.35 + p.r * .4})`; ctx.beginPath(); ctx.arc(p.x, p.y, 1 + p.r * 1.6, 0, 6.29); ctx.fill();
      } else if (actual === 1) { // arena que barre el viento a ras de la cresta
        p.x += (60 + p.v * 120) * dt; p.y += Math.sin(t / 300 + p.r * 20) * 8 * dt;
        if (p.y < H * .62) p.y = H * (.62 + Math.random() * .36);
        ctx.fillStyle = `rgba(255,214,160,${.3 + p.r * .4})`; ctx.fillRect(p.x, p.y, 2 + p.r * 2, 1);
      } else if (actual === 2) { // lluvia
        p.y += (700 + p.v * 500) * dt; p.x -= 40 * dt;
        ctx.strokeStyle = `rgba(190,215,255,${.18 + p.r * .3})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - 3, p.y - 14 - p.r * 10); ctx.stroke();
      } else { // nieve
        p.y += (22 + p.v * 30) * dt; p.x += Math.sin(t / 1400 + p.r * 9) * 14 * dt;
        ctx.fillStyle = `rgba(255,255,255,${.6 + p.r * .4})`; ctx.beginPath(); ctx.arc(p.x, p.y, 1.2 + p.r * 2.2, 0, 6.29); ctx.fill();
      }
      if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }
      if (p.y < -20) { p.y = H + 10; p.x = Math.random() * W; }
      if (p.x > W + 20) p.x = -10; else if (p.x < -20) p.x = W + 10;
    }
  };
  requestAnimationFrame(paso);

  // tocar el fondo = chasquear: siguiente mundo
  addEventListener("pointerdown", (e) => {
    if (e.target.closest && e.target.closest(".slab, button, a, nav, [data-nofly]")) return;
    chasquido(); vibra(12); anillo(e.clientX, e.clientY); mundo(actual + 1);
  });

  // al avanzar: cada paso tiene su mundo; el final vuelve a la habitación (el bucle del reel)
  const deEtiqueta = (lab) => /dune/i.test(lab) ? 1 : /street/i.test(lab) ? 2 : /glacier|how to/i.test(lab) ? 3 : 0;
  addEventListener("flyview", (e) => {
    const el = e.detail.els && e.detail.els[0];
    const stop = el && el.closest ? el.closest(".stop") : null;
    const lab = (stop && stop.dataset.label) || (el && el.closest && el.closest("[data-label]")?.dataset.label) || "";
    const m = deEtiqueta(lab);
    if (m !== actual) { mundo(m); if (e.detail.dir) chasquido(); }
  });
  mundo(0);

  // ---------- la mano sobre cada prompt ----------
  const MANO = `<svg viewBox="0 0 104 140" aria-hidden="true"><g fill="#F3D2B8" stroke="#2A1E18" stroke-width="2.2" stroke-linejoin="round">
    <path d="M30 136V86c-6-6-12-16-14-26-2-8 6-11 10-4l8 14V40c0-6 9-6 9 0v30"/>
    <path d="M43 70V16c0-7 10-7 10 0v54"/><path d="M53 70V24c0-7 10-7 10 0v48"/><path d="M63 72V36c0-7 9-7 9 0v46"/>
    <path d="M72 82c0 22-6 34-14 54H30"/></g>
    <path d="M44 72q-6-8-14-14" fill="none" stroke="#2A1E18" stroke-width="2.2"/></svg>`;
  const abre = (box, x, y) => {
    if (box.classList.contains("open")) return;
    chasquido(); vibra([8, 24, 12]); anillo(x, y);
    box.classList.add("open"); // corte seco: el tapón desaparece de golpe
    mundo(actual + 1);
  };
  document.querySelectorAll(".slab .code").forEach((pre, i) => {
    const box = document.createElement("div");
    box.className = "snapbox"; box.dataset.nofly = "";
    pre.before(box); box.append(pre);
    box.insertAdjacentHTML("beforeend", `<div class="still"><div class="hand">${MANO}<button class="thumb" type="button" aria-label="Snap to show the prompt"></button></div><div class="say"><b>Snap to open</b><span>flick the thumb down, fast</span><em></em></div><div class="tc">07:00</div></div>`);
    const still = box.querySelector(".still"), thumb = box.querySelector(".thumb"), aviso = box.querySelector("em");
    let y0 = 0, t0 = 0, dy = 0, tirando = false, fallos = 0;
    const centro = () => { const r = thumb.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
    thumb.addEventListener("pointerdown", (e) => {
      tirando = true; y0 = e.clientY; t0 = performance.now(); dy = 0;
      box.classList.add("drag");
      try { thumb.setPointerCapture(e.pointerId); } catch {}
      e.stopPropagation(); e.preventDefault();
    });
    thumb.addEventListener("pointermove", (e) => {
      if (!tirando) return;
      dy = Math.max(0, Math.min(70, e.clientY - y0));
      // la tarjeta va escalada en 3D: los px de pantalla no son px de la tarjeta
      const k = box.offsetWidth / Math.max(1, box.getBoundingClientRect().width);
      thumb.style.setProperty("--dy", dy * k + "px");
      if (dy > 44 && performance.now() - t0 < 400) { tirando = false; const [x, y] = centro(); abre(box, x, y); }
    });
    const suelta = () => {
      if (!tirando) return;
      tirando = false; box.classList.remove("drag");
      const dur = performance.now() - t0;
      thumb.style.setProperty("--dy", "0px");
      if (dy <= 6) { // un toque
        fallos++;
        aviso.textContent = fallos > 1 ? "Fine, here it is." : "Drag the thumb down, fast.";
        if (fallos > 1) { const [x, y] = centro(); abre(box, x, y); } // nadie se queda sin el prompt
      } else if (dur >= 400) {
        fallos++;
        aviso.textContent = fallos > 1 ? "Close enough. Snap!" : "Too slow. A snap is quick.";
        if (fallos > 1) { const [x, y] = centro(); abre(box, x, y); }
      }
    };
    thumb.addEventListener("pointerup", suelta);
    thumb.addEventListener("pointercancel", () => { tirando = false; box.classList.remove("drag"); thumb.style.setProperty("--dy", "0px"); });
    thumb.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); const [x, y] = centro(); abre(box, x, y); } });
    thumb.addEventListener("contextmenu", (e) => e.preventDefault());
    ["touchstart", "touchmove", "mousedown", "wheel"].forEach((t) => thumb.addEventListener(t, (e) => e.stopPropagation(), { passive: true }));
    still.addEventListener("pointerdown", (e) => e.stopPropagation());
  });

  // ---------- al copiar: una manita chasquea encima del botón ----------
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    const r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top;
    const box = b.closest(".slab")?.querySelector(".snapbox");
    if (box && !box.classList.contains("open")) { abre(box, x, y); return; }
    chasquido(); vibra(10); anillo(x, y);
    if (quieto) return;
    const m = document.createElement("div");
    m.className = "minisnap"; m.style.left = x - 17 + "px"; m.style.top = y - 44 + "px";
    m.innerHTML = MANO.replace("<svg", '<svg width="34" height="44"');
    document.body.append(m); setTimeout(() => m.remove(), 700);
  }));

  // ---------- reglas: un timecode que corre mientras están en pantalla ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((s, i) => {
    s.insertAdjacentHTML("afterbegin", `<div class="clock" aria-hidden="true"><i></i><span>00:0${7 * i % 10}:00</span></div>`);
  });
  const fmt = (f) => { const s = Math.floor(f / 24); return `00:${String(s).padStart(2, "0")}:${String(f % 24).padStart(2, "0")}`; };
  let f = 0;
  setInterval(() => {
    f = (f + 1) % (24 * 28);
    reglas.forEach((s, i) => { if (s.classList.contains("on") && !quieto) s.querySelector(".clock span").textContent = fmt((f + i * 167) % (24 * 28)); });
  }, 1000 / 24);

  // ---------- el recibo: lo que costó de verdad ----------
  const fuera = [...document.querySelectorAll(".stop")].find((s) => /outro/i.test(s.dataset.label || ""));
  const texto = fuera && fuera.querySelector(".slab p");
  if (texto) texto.insertAdjacentHTML("beforebegin", `<div class="receipt"><div class="h">RECEIPT</div><div><span>3 world photos, Nano Banana Pro</span><span>0</span></div><div><span>4 clips × 8 s, Omni Flash</span><span>4 × 12</span></div><div><span>Camera, crew, flights</span><span>0</span></div><div class="tot"><span>Credits spent of 50 free</span><span>48</span></div></div>`);
})();
