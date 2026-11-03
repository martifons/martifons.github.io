// FREE (reel92) — "I made this video for free". La cala con su velero que cruza al avanzar; cada prompt bajo una vela
// plegada que se iza tirando de la cuerda hacia abajo (la vela del velero sube con cada prompt destapado); el contador
// real de créditos (foto 0, clip 15, de 50 al día); una gaviota al copiar; banderas en las reglas; recibo al final.
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const vibra = (ms) => { try { navigator.vibrate && navigator.vibrate(ms); } catch {} };

  // ---------- la cala ----------
  const bay = document.createElement("div");
  bay.id = "bay"; bay.setAttribute("aria-hidden", "true");
  bay.innerHTML = `<div class="sun"></div><svg class="cliff" viewBox="0 0 1000 200" preserveAspectRatio="none"><path fill="#C9A98C" d="M0 200V128l70-22 60 12 58-52 62-20 44 34 66 6 40 40 96 14 62-20 88 10 82-34 72-12 100 40v84z"/><path fill="#A98D76" d="M0 200v-38l130-18 110 14 150-20 170 26 140-22 300 28v30z"/><g fill="#F7ECD9"><rect x="616" y="122" width="26" height="20"/><rect x="646" y="112" width="20" height="30"/><rect x="670" y="124" width="30" height="18"/><rect x="706" y="108" width="24" height="34"/><rect x="734" y="120" width="28" height="22"/></g></svg><div class="sea"></div><canvas></canvas><div class="boat"><svg viewBox="0 0 150 170"><g class="mainsail"><path fill="#F7EEDD" d="M72 16 L72 118 L22 118 Z"/></g><path fill="#EFE3CC" d="M80 34 L80 118 L122 118 Z"/><rect x="72" y="8" width="7" height="122" rx="3" fill="#8A5428"/><path fill="#7A4A22" d="M14 128h124l-16 26H36z"/><path fill="#F4F1E8" d="M14 128h124l-3 6H17z"/></svg></div>`;
  document.body.prepend(bay);
  const sol = bay.querySelector(".sun"), barco = bay.querySelector(".boat"), vela = bay.querySelector(".mainsail");

  // destellos sobre el agua, y anillos al tocar el mar
  const lienzo = bay.querySelector("canvas"), ctx = lienzo.getContext("2d");
  let W = 0, H = 0, chispas = [], anillos = [];
  const mide = () => {
    W = lienzo.width = lienzo.clientWidth; H = lienzo.height = lienzo.clientHeight;
    chispas = Array.from({ length: Math.round(W * H / 5000) }, () => { const y = Math.random(); return { x: Math.random() * W, y: y * y * H, f: Math.random() * 6.28, v: .6 + Math.random() * 1.6 }; });
    anillos = [];
  };
  mide(); addEventListener("resize", mide);
  const pinta = (t) => {
    if (!quieto) requestAnimationFrame(pinta); // antes de pintar: un error no debe parar el bucle
    ctx.clearRect(0, 0, W, H);
    for (const c of chispas) {
      const a = Math.pow(Math.max(0, Math.sin(t / 900 * c.v + c.f)), 6);
      if (a < .02) continue;
      const k = .5 + (c.y / H) * 1.8;
      ctx.fillStyle = `rgba(255,246,214,${a * .85})`;
      ctx.fillRect(c.x - 7 * k, c.y, 14 * k, 1.5 * k);
    }
    anillos = anillos.filter((r) => t - r.t < 1400);
    for (const r of anillos) {
      const u = (t - r.t) / 1400;
      ctx.strokeStyle = `rgba(255,255,255,${.6 * (1 - u)})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(r.x, r.y, 8 + u * 110, 3 + u * 34, 0, 0, 6.29); ctx.stroke();
    }
  };
  requestAnimationFrame(pinta);
  addEventListener("pointerdown", (e) => {
    if (e.target.closest && e.target.closest(".slab, button, a, nav")) return;
    const r = lienzo.getBoundingClientRect();
    if (e.clientY < r.top) return;
    anillos.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() });
    vibra(6);
  });

  // ---------- el barco cruza y el sol baja ----------
  const izadas = new Set();
  const velaBarco = () => { const total = document.querySelectorAll(".sailbox").length || 1; vela.style.transform = `scaleY(${.16 + .84 * izadas.size / total})`; };
  velaBarco();
  const coloca = (i, n) => {
    const u = n > 1 ? i / (n - 1) : 0;
    barco.style.transform = `translateX(${(.1 + .8 * u) * innerWidth}px)`;
    sol.style.top = 12 + u * 30 + "%";
  };
  coloca(0, 2);
  addEventListener("flyview", (e) => coloca(e.detail.index, e.detail.total));
  addEventListener("resize", () => coloca(0, 2));

  // ---------- créditos ----------
  let creditos = 50;
  const hud = document.createElement("div");
  hud.id = "credits"; hud.setAttribute("aria-live", "polite");
  hud.innerHTML = `<span>CREDITS TODAY</span><span class="track"><i></i></span><span class="val">50</span>`;
  document.body.append(hud);
  const gasta = (n) => {
    creditos = Math.max(0, creditos - n);
    hud.querySelector(".val").textContent = creditos;
    hud.querySelector("i").style.width = creditos * 2 + "%";
    hud.classList.remove("hit"); void hud.offsetWidth; hud.classList.add("hit");
  };

  // ---------- la vela sobre cada prompt ----------
  const iza = (box) => {
    if (box.classList.contains("open")) return;
    box.classList.add("open");
    izadas.add(box); velaBarco();
    vibra(18);
  };
  document.querySelectorAll(".slab .code").forEach((pre) => {
    const box = document.createElement("div");
    box.className = "sailbox"; box.dataset.nofly = "";
    pre.before(box); box.append(pre);
    box.insertAdjacentHTML("beforeend", `<div class="sail"><b>Hoist the sail</b><span>pull the rope down</span></div><button class="rope" type="button" aria-label="Pull the rope to show the prompt"><i></i></button>`);
    const sail = box.querySelector(".sail"), rope = box.querySelector(".rope"), mango = rope.querySelector("i");
    let y0 = null, u = 0;
    const pon = (v) => {
      u = v;
      sail.style.transform = `translateY(${-v * 100}%) scaleY(${1 - v * .35})`;
      mango.style.transform = `translateY(${v * Math.max(0, box.clientHeight - 80)}px)`;
    };
    const suelta = () => {
      box.classList.remove("pull");
      if (u > .4) { iza(box); return; }
      sail.style.transition = mango.style.transition = "transform .4s cubic-bezier(.3,1.5,.5,1)";
      pon(0);
      setTimeout(() => { sail.style.transition = mango.style.transition = ""; }, 420);
    };
    rope.addEventListener("pointerdown", (e) => {
      y0 = e.clientY; box.classList.add("pull");
      try { rope.setPointerCapture(e.pointerId); } catch {}
      e.stopPropagation();
    });
    rope.addEventListener("pointermove", (e) => {
      if (y0 === null) return;
      e.stopPropagation();
      const d = Math.max(0, e.clientY - y0), alto = box.getBoundingClientRect().height || 1;
      pon(Math.min(1, d / (alto * .75)));
    });
    const fin = (e) => {
      if (y0 === null) return;
      const quieto = Math.abs(e.clientY - y0) < 6;
      y0 = null;
      if (quieto) { iza(box); return; } // un toque también sirve: nadie se queda sin el prompt
      suelta();
    };
    rope.addEventListener("pointerup", fin);
    rope.addEventListener("pointercancel", () => { y0 = null; suelta(); });
    rope.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); iza(box); } });
    ["touchstart", "touchmove", "mousedown", "wheel"].forEach((t) => rope.addEventListener(t, (e) => e.stopPropagation(), { passive: true }));
  });

  // ---------- al copiar: la gaviota, y los créditos si es un clip ----------
  const cobrados = new Set();
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    const stop = b.closest(".stop");
    const box = b.closest(".slab")?.querySelector(".sailbox");
    if (box) iza(box);
    const r = b.getBoundingClientRect();
    const clip = /^Clip/.test(stop?.dataset.label || "");
    if (clip && !cobrados.has(b)) { cobrados.add(b); gasta(15); }
    const coste = /^Clip/.test(stop?.dataset.label || "") ? "−15" : /photo/.test(stop?.dataset.label || "") ? "0 credits" : "";
    if (coste) {
      const s = document.createElement("div");
      s.className = "spent"; s.textContent = coste;
      s.style.left = r.left + r.width - 90 + "px"; s.style.top = r.top - 8 + "px";
      document.body.append(s); setTimeout(() => s.remove(), 1000);
    }
    if (quieto) return;
    const g = document.createElement("div");
    g.className = "gull"; g.style.left = r.left + "px"; g.style.top = r.top - 10 + "px";
    g.innerHTML = `<svg viewBox="0 0 54 24" width="54" height="24"><path d="M2 8 Q14 -2 27 13 Q40 -2 52 8 Q40 6 27 20 Q14 6 2 8Z" fill="#fff" stroke="#23343A" stroke-width="1.2"/></svg>`;
    document.body.append(g); setTimeout(() => g.remove(), 1000);
  }));

  // ---------- banderas ----------
  const colores = ["#FF2A1F", "#F8E08A", "#3FB6B2"];
  document.querySelectorAll(".slab.rule").forEach((s, i) => {
    s.insertAdjacentHTML("afterbegin", `<div class="flag" aria-hidden="true"><svg viewBox="0 0 50 32"><path d="M0 0H50L38 16 50 32H0Z" fill="${colores[i % 3]}"/></svg></div>`);
  });

  // ---------- recibo: lo que costó de verdad ----------
  const fuera = [...document.querySelectorAll(".stop")].find((s) => /outro/i.test(s.dataset.label || ""));
  const texto = fuera && fuera.querySelector(".slab p");
  if (texto) texto.insertAdjacentHTML("beforebegin", `<div class="receipt"><div><span>2 photos × 0</span><span>0 credits</span></div><div><span>3 clips × 15</span><span>45 credits</span></div><div><span>Free today</span><span>50 credits</span></div><div class="tot"><span>Paid to Flow</span><span>$0.00</span></div></div>`);
})();
