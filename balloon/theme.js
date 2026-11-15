// BALLOON (reel99) — "She's not real. Neither is the balloon." El valle al amanecer: el cielo se aclara y las agujas
// de roca bajan a medida que subes; una docena de globos lejanos flotan en canvas y tocar el cielo suelta uno más.
// Cada prompt va dentro de un globo deshinchado: se mantiene pulsado el quemador y el globo se llena y sube.
// Arriba a la izquierda, los globos que has soltado (0/3). Al copiar cae un saco de arena. En las reglas, un globo
// atado a cada tarjeta; al final, el cuaderno de vuelo con los créditos reales (foto 0, clip de 10 s 15, de 6 s 10).
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const vibra = (ms) => { try { navigator.vibrate && navigator.vibrate(ms); } catch {} };
  const rayas = [["#FF2A1F", "#F3EEEB"], ["#F2A93B", "#FFF3D6"], ["#3F7FB5", "#F3EEEB"], ["#2F8C6E", "#F6E7C8"], ["#B4436C", "#FBE3D2"]];

  // ---------- el valle ----------
  const sky = document.createElement("div");
  sky.id = "valley"; sky.setAttribute("aria-hidden", "true");
  sky.innerHTML = `<div class="dawn"></div><div class="sun"></div><canvas></canvas><svg class="spires far" viewBox="0 0 1000 220" preserveAspectRatio="none"><path d="M0 220V150l40-10 18-62 14 58 40 6 22-90 16 84 60 8 30-40 26 34 48-6 20-74 16 70 70 10 24-52 22 46 64-4 18-88 18 84 58 6 30-36 30 30 50-4 22-70 18 66 54 8 30-30 40 26v62z"/></svg><svg class="spires near" viewBox="0 0 1000 220" preserveAspectRatio="none"><path d="M0 220V170l60-6 24-96 22 92 80 8 34-58 30 52 90 0 26-118 26 112 100 6 40-46 36 40 90-2 30-92 26 86 80 8 46-28 60 22v42z"/></svg>`;
  document.body.prepend(sky);
  const dawn = sky.querySelector(".dawn"), sol = sky.querySelector(".sun"), lejos = sky.querySelector(".far"), cerca = sky.querySelector(".near");

  const lienzo = sky.querySelector("canvas"), ctx = lienzo.getContext("2d");
  let W = 0, H = 0, globos = [], sueltos = [], dpr = 1;
  const nuevo = (x, y, s, propio) => ({ x, y, s, c: rayas[Math.floor(Math.random() * rayas.length)], f: Math.random() * 6.28, v: propio ? 38 + Math.random() * 18 : 4 + Math.random() * 5, d: 6 + Math.random() * 8, t: performance.now() });
  const mide = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = lienzo.clientWidth; H = lienzo.clientHeight;
    lienzo.width = W * dpr; lienzo.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    globos = Array.from({ length: 12 }, () => { const y = .12 + Math.random() * .6; return nuevo(Math.random() * W, y * H, 7 + y * 16 + Math.random() * 5, false); });
    sueltos = [];
  };
  mide(); addEventListener("resize", mide);
  const globo = (g, x, y, a) => {
    const r = g.s, n = 5;
    ctx.globalAlpha = a;
    for (let i = 0; i < n; i++) { // gajos: elipses cada vez más estrechas, una sí y otra no
      ctx.fillStyle = g.c[i % 2];
      ctx.beginPath(); ctx.ellipse(x, y, r * (1 - i / n), r * 1.12, 0, 0, 6.29); ctx.fill();
    }
    ctx.strokeStyle = "rgba(60,40,30,.5)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x - r * .45, y + r * 1.0); ctx.lineTo(x - r * .2, y + r * 1.55); ctx.moveTo(x + r * .45, y + r * 1.0); ctx.lineTo(x + r * .2, y + r * 1.55); ctx.stroke();
    ctx.fillStyle = "#6B4A2E"; ctx.fillRect(x - r * .22, y + r * 1.55, r * .44, r * .34);
    ctx.globalAlpha = 1;
  };
  let ultimo = performance.now();
  const pinta = (t) => {
    if (!quieto) requestAnimationFrame(pinta); // antes de pintar: un error no debe parar el bucle
    const dt = Math.min(.05, (t - ultimo) / 1000); ultimo = t;
    ctx.clearRect(0, 0, W, H);
    for (const g of globos) {
      g.y -= g.v * dt * .35; g.x += Math.sin(t / 4000 + g.f) * g.d * dt;
      if (g.y < -40) { g.y = H * .8; g.x = Math.random() * W; }
      globo(g, g.x, g.y, .8);
    }
    sueltos = sueltos.filter((g) => g.y > -80);
    for (const g of sueltos) {
      g.y -= g.v * dt; g.x += Math.sin(t / 900 + g.f) * 14 * dt;
      g.s = Math.max(8, g.s - dt * 2.5);
      globo(g, g.x, g.y, 1);
    }
  };
  requestAnimationFrame(pinta);
  addEventListener("pointerdown", (e) => {
    if (e.target.closest && e.target.closest(".slab, button, a, nav, [data-nofly]")) return;
    if (sueltos.length > 14) sueltos.shift();
    sueltos.push(nuevo(e.clientX, e.clientY, 22, true));
    vibra(6);
  });

  // ---------- al subir: el valle se queda abajo y amanece ----------
  const coloca = (i, n) => {
    const u = n > 1 ? i / (n - 1) : 0;
    cerca.style.transform = `translateY(${u * 70}%)`;
    lejos.style.transform = `translateY(${u * 38}%)`;
    dawn.style.opacity = 1 - u * .85;
    sol.style.top = 70 - u * 46 + "%";
  };
  coloca(0, 2);
  addEventListener("flyview", (e) => coloca(e.detail.index, e.detail.total));

  // ---------- los globos soltados ----------
  const cajas = [];
  const hud = document.createElement("div");
  hud.id = "aloft"; hud.setAttribute("aria-live", "polite");
  document.body.append(hud);
  const cuenta = () => {
    const n = cajas.filter((b) => b.classList.contains("open")).length;
    hud.innerHTML = `<span>PROMPTS ALOFT</span><span class="dots">${cajas.map((b, i) => `<i class="${b.classList.contains("open") ? "up" : ""}" style="--c:${rayas[i % rayas.length][0]}"></i>`).join("")}</span><span class="val">${n}/${cajas.length}</span>`;
  };

  // ---------- el globo deshinchado sobre cada prompt ----------
  const sube = (box) => {
    if (box.classList.contains("open")) return;
    box.style.setProperty("--fill", 1);
    box.classList.add("lift");
    vibra([10, 30, 18]);
    setTimeout(() => { box.classList.add("open"); cuenta(); }, quieto ? 0 : 900);
  };
  document.querySelectorAll(".slab .code").forEach((pre, i) => {
    const box = document.createElement("div");
    box.className = "envbox"; box.dataset.nofly = "";
    const [a, b] = rayas[i % rayas.length];
    box.style.setProperty("--a", a); box.style.setProperty("--b", b);
    pre.before(box); box.append(pre);
    box.insertAdjacentHTML("beforeend", `<div class="env"><div class="rig"><div class="bag"></div><svg class="lines" viewBox="0 0 70 20"><path d="M3 0L22 20M67 0L48 20M26 0L30 20M44 0L40 20" stroke="#A47F5A" stroke-width="1.6"/></svg><div class="basket"></div></div><p><b>Fill the balloon</b><span>hold the burner</span></p></div><button class="burner" type="button" aria-label="Hold the burner to fill the balloon and show the prompt"><i></i><em></em></button>`);
    cajas.push(box);
    const burner = box.querySelector(".burner");
    let lleno = 0, apretado = false, raf = 0, t0 = 0, desde = 0;
    const pon = (v) => { lleno = v; box.style.setProperty("--fill", v.toFixed(3)); };
    const paso = (t) => {
      if (box.classList.contains("lift")) return;
      const dt = Math.min(.05, (t - t0) / 1000); t0 = t;
      pon(Math.max(0, Math.min(1, lleno + (apretado ? dt / 1.1 : -dt / .7))));
      if (lleno >= 1) { sube(box); return; }
      if (apretado || lleno > 0) raf = requestAnimationFrame(paso); else raf = 0;
    };
    const arranca = () => { if (!raf) { t0 = performance.now(); raf = requestAnimationFrame(paso); } };
    burner.addEventListener("pointerdown", (e) => {
      apretado = true; desde = performance.now(); box.classList.add("fire");
      try { burner.setPointerCapture(e.pointerId); } catch {}
      e.stopPropagation(); vibra(8); arranca();
    });
    const suelta = () => {
      if (!apretado) return;
      apretado = false; box.classList.remove("fire");
      if (performance.now() - desde < 220) sube(box); // un toque también sirve: nadie se queda sin el prompt
    };
    burner.addEventListener("pointerup", suelta);
    burner.addEventListener("pointercancel", () => { apretado = false; box.classList.remove("fire"); });
    burner.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); sube(box); } });
    burner.addEventListener("contextmenu", (e) => e.preventDefault());
    ["touchstart", "touchmove", "mousedown", "wheel"].forEach((t) => burner.addEventListener(t, (e) => e.stopPropagation(), { passive: true }));
  });
  cuenta();

  // ---------- al copiar: cae un saco de arena ----------
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    const box = b.closest(".slab")?.querySelector(".envbox");
    if (box) sube(box);
    if (quieto) return;
    const r = b.getBoundingClientRect();
    const s = document.createElement("div");
    s.className = "sandbag"; s.style.left = r.left + r.width / 2 - 15 + "px"; s.style.top = r.top + "px";
    s.innerHTML = `<svg viewBox="0 0 30 36" width="30" height="36"><path d="M15 2v6" stroke="#8F6A3A" stroke-width="2"/><path d="M8 10h14l5 20c1 4-2 6-6 6H9c-4 0-7-2-6-6z" fill="#C9A26E" stroke="#6B4A2E" stroke-width="1.5"/><path d="M8 10q7 4 14 0" fill="none" stroke="#6B4A2E" stroke-width="1.5"/></svg>`;
    document.body.append(s); setTimeout(() => s.remove(), 1100);
    sueltos.push(nuevo(r.left + r.width / 2, r.top, 20, true));
  }));

  // ---------- reglas: un globo atado a cada tarjeta ----------
  document.querySelectorAll(".slab.rule").forEach((s, i) => {
    const [a, b] = rayas[i % rayas.length];
    s.insertAdjacentHTML("afterbegin", `<div class="tether" aria-hidden="true"><svg viewBox="0 0 40 70"><ellipse cx="20" cy="20" rx="17" ry="19" fill="${b}"/><ellipse cx="20" cy="20" rx="10" ry="19" fill="${a}"/><ellipse cx="20" cy="20" rx="3.5" ry="19" fill="${b}"/><path d="M8 34l8 12M32 34l-8 12" stroke="#6B4A2E" stroke-width="1.3"/><rect x="15" y="46" width="10" height="7" rx="1.5" fill="#6B4A2E"/><path d="M20 53v17" stroke="#8F6A3A" stroke-width="1.4" stroke-dasharray="3 2"/></svg></div>`);
  });

  // ---------- el cuaderno de vuelo: lo que costó de verdad ----------
  const fuera = [...document.querySelectorAll(".stop")].find((s) => /outro/i.test(s.dataset.label || ""));
  const texto = fuera && fuera.querySelector(".slab p");
  if (texto) texto.insertAdjacentHTML("beforebegin", `<div class="flightlog"><div class="h">FLIGHT LOG</div><div><span>1 photo, Nano Banana Pro</span><span>0 credits</span></div><div><span>Clip 1, 10 s</span><span>15 credits</span></div><div><span>Clip 2, 6 s</span><span>10 credits</span></div><div class="tot"><span>Spent of 50 free today</span><span>25</span></div></div>`);
})();
