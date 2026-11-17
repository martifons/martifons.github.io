// WAVE (reel102) — "15 pendulums. One word." Al fons, l'onada del reel amb els números reals (k fa 12 + k oscil·lacions
// en T = 11,72 s, 20°), vista des de dalt: la barra en vertical i les boles fent la serp. Un comptador diu quant falta per
// la pròxima alineació; tocar el terra els torna a deixar anar tots junts. Cada prompt és darrere d'una filera de 9
// pèndols vistos de cara: "Let go", es desfan i, quan tornen a estar en línia (2,4 s), sona l'acord i el prompt queda
// destapat. Copiar fa sonar l'acord i obre un anell. Registre d'alineació al final.
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const vibra = (ms) => { try { navigator.vibrate && navigator.vibrate(ms); } catch {} };

  // ---------- notes: pentatònica des de La 220, com al reel (només després d'un gest) ----------
  let ac = null;
  const PENTA = [0, 2, 4, 7, 9];
  const freq = (k) => 220 * Math.pow(2, (Math.floor(k / 5) * 12 + PENTA[k % 5]) / 12);
  const nota = (k, fort = .08, quan = 0) => {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const t = ac.currentTime + quan, f = freq(k);
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(fort, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + .7);
      o.connect(g).connect(ac.destination); o.start(t); o.stop(t + .75);
    } catch {}
  };
  const acord = (n = 9, fort = .05) => { for (let k = 0; k < n; k++) nota(k, fort); };

  // ---------- l'onada del fons ----------
  const N = 15, T = 11.72, N0 = 12, A = 20 * Math.PI / 180, G = 9.81;
  const P = Array.from({ length: N }, (_, k) => T / (N0 + k));
  const L = P.map((p) => G * (p / (2 * Math.PI)) ** 2); // metres: 0,237 … 0,0505

  const fons = document.createElement("div");
  fons.id = "swing"; fons.setAttribute("aria-hidden", "true");
  fons.innerHTML = "<canvas></canvas>";
  document.body.prepend(fons);
  const lienzo = fons.querySelector("canvas"), ctx = lienzo.getContext("2d");
  let W = 0, H = 0;
  const mide = () => {
    const dpr = Math.min(2, devicePixelRatio || 1);
    W = lienzo.clientWidth; H = lienzo.clientHeight;
    lienzo.width = W * dpr; lienzo.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (quieto) dibuixa(0);
  };

  const hud = document.createElement("div");
  hud.id = "alignhud"; hud.setAttribute("aria-hidden", "true");
  hud.innerHTML = `<span>NEXT LINE-UP</span><span class="val"></span>`;
  document.body.append(hud);
  const val = hud.querySelector(".val");

  let solta = performance.now() / 1000, flaix = 0, ultimaVolta = 0;
  // des de dalt: la barra és una línia vertical al centre; cada bola es desplaça en x segons L·sin θ
  function dibuixa(t) {
    ctx.fillStyle = "#14110F"; ctx.fillRect(0, 0, W, H);
    const y0 = H * .14, y1 = H * .86, cx = W / 2;
    const esc = Math.min(W * .42, 520) / (L[0] * Math.sin(A)) * .9; // l'excursió més gran ocupa ~42 % de l'amplada
    ctx.strokeStyle = "rgba(248,248,176,.22)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, y0 - 20); ctx.lineTo(cx, y1 + 20); ctx.stroke();
    const r = Math.max(7, Math.min(16, (y1 - y0) / N * .3));
    for (let k = 0; k < N; k++) {
      const th = A * Math.cos(2 * Math.PI * t / P[k]);
      const x = cx + Math.sin(th) * L[k] * esc, y = y0 + (y1 - y0) * k / (N - 1);
      ctx.strokeStyle = "rgba(233,226,200,.35)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx, y - 8); ctx.lineTo(x, y); ctx.lineTo(cx, y + 8); ctx.stroke();
      const g = ctx.createRadialGradient(x - r * .35, y - r * .35, r * .1, x, y, r);
      g.addColorStop(0, flaix > .05 ? "#FFD2CC" : "#FF8A80"); g.addColorStop(.45, "#FF2A1F"); g.addColorStop(1, "#8E0F08");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * (1 + .25 * flaix), 0, 2 * Math.PI); ctx.fill();
    }
    if (flaix > .02) {
      ctx.strokeStyle = `rgba(248,248,176,${.6 * flaix})`; ctx.lineWidth = 2;
      const x = cx + Math.sin(A) * L[0] * esc;
      ctx.beginPath(); ctx.moveTo(cx, y0); ctx.lineTo(x, y0); ctx.stroke();
    }
  }
  const pas = () => {
    if (!quieto) requestAnimationFrame(pas);
    const ara = performance.now() / 1000, t = ara - solta;
    const volta = Math.floor(t / T);
    if (volta > ultimaVolta) { ultimaVolta = volta; flaix = 1; hud.classList.add("now"); setTimeout(() => hud.classList.remove("now"), 700); if (ac) acord(N, .03); }
    flaix *= .94;
    val.textContent = (T - (t % T)).toFixed(1) + " s";
    dibuixa(t);
  };
  mide(); addEventListener("resize", mide);
  if (quieto) val.textContent = "—"; else requestAnimationFrame(pas);

  // tocar el terra: tots junts un altre cop, des del principi
  addEventListener("pointerdown", (e) => {
    if (e.target.closest && e.target.closest(".slab, button, a, nav, [data-nofly]")) return;
    solta = performance.now() / 1000; ultimaVolta = 0; flaix = 1; vibra(8); acord(5, .04);
  });

  // ---------- la filera de pèndols de cada prompt (vistos de cara) ----------
  const M = 9, TM = 2.4, NM = 3, AM = 26 * Math.PI / 180;
  const pinta = (cv, t) => {
    const c = cv.getContext("2d"), dpr = Math.min(2, devicePixelRatio || 1);
    const w = cv.clientWidth, h = cv.clientHeight;
    if (cv.width !== Math.round(w * dpr)) { cv.width = w * dpr; cv.height = h * dpr; }
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, w, h);
    c.fillStyle = "#3A342E"; c.fillRect(6, 4, w - 12, 4);
    const pasX = (w - 64) / (M - 1);
    for (let k = 0; k < M; k++) {
      const per = TM / (NM + k), Lk = (h - 26) * ((NM / (NM + k)) ** 2) ** .5; // més curts a la dreta
      const th = t === null ? 0 : AM * Math.cos(2 * Math.PI * t / per);
      const px = 38 + k * pasX, x = px + Math.sin(th) * Lk, y = 8 + Math.cos(th) * Lk;
      c.strokeStyle = "rgba(233,226,200,.6)"; c.lineWidth = 1; c.beginPath(); c.moveTo(px, 8); c.lineTo(x, y); c.stroke();
      c.fillStyle = "#FF2A1F"; c.beginPath(); c.arc(x, y, 7, 0, 2 * Math.PI); c.fill();
    }
  };
  const deixa = (box) => {
    if (box.classList.contains("going") || box.classList.contains("open")) return;
    box.classList.add("going");
    const cv = box.querySelector("canvas"), go = box.querySelector(".go");
    if (quieto) { box.classList.add("open"); return; }
    const t0 = performance.now() / 1000;
    // es deixen anar a l'extrem (θ = A): t comença a 0 i a TM tots tornen a coincidir
    const toca = new Set();
    const anim = () => {
      const t = performance.now() / 1000 - t0;
      pinta(cv, Math.min(t, TM));
      go.textContent = t < TM ? `lining up in ${(TM - t).toFixed(1)} s` : "in line";
      // cada bola sona a l'extrem, com al reel
      for (let k = 0; k < M; k++) { const per = TM / (NM + k), m = Math.floor(t / per); const key = k + ":" + m; if (m > 0 && t < TM - .05 && !toca.has(key)) { toca.add(key); nota(k, .035); } }
      if (t < TM) requestAnimationFrame(anim);
      else { acord(M, .06); vibra(15); setTimeout(() => box.classList.add("open"), 280); }
    };
    requestAnimationFrame(anim);
  };
  document.querySelectorAll(".slab .code").forEach((pre) => {
    const box = document.createElement("div");
    box.className = "pbox"; box.dataset.nofly = "";
    pre.before(box); box.append(pre);
    box.insertAdjacentHTML("beforeend", `<div class="cover"><canvas aria-hidden="true"></canvas><button class="go" type="button">Let go</button><div class="say">They line up again in ${TM} s. Then the prompt is yours.</div></div>`);
    const cv = box.querySelector("canvas");
    requestAnimationFrame(() => pinta(cv, 0));
    addEventListener("resize", () => { if (!box.classList.contains("going")) pinta(cv, 0); });
    const go = box.querySelector(".go");
    go.addEventListener("click", (e) => { e.stopPropagation(); deixa(box); });
    ["pointerdown", "touchstart", "touchmove", "mousedown", "wheel"].forEach((t) => box.querySelector(".cover").addEventListener(t, (e) => e.stopPropagation(), { passive: true }));
  });

  // ---------- en copiar: l'acord i un anell ----------
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    const box = b.closest(".slab")?.querySelector(".pbox");
    if (box && !box.classList.contains("open")) { deixa(box); return; }
    acord(5, .05); vibra(10);
    if (quieto) return;
    const r = b.getBoundingClientRect();
    const d = document.createElement("div");
    d.className = "ripple"; d.style.left = r.left + r.width / 2 + "px"; d.style.top = r.top + r.height / 2 + "px";
    document.body.append(d); setTimeout(() => d.remove(), 650);
  }));

  // ---------- el registre del final ----------
  const fora = [...document.querySelectorAll(".stop")].find((s) => /outro/i.test(s.dataset.label || ""));
  const txt = fora && fora.querySelector(".slab p:not(.k)");
  if (txt) txt.insertAdjacentHTML("beforebegin", `<div class="align-receipt"><div class="h">ALIGNMENT LOG</div><div><span>Longest → shortest</span><span>237.0 → 50.5 mm</span></div><div><span>Back in line on "now"</span><span>11.32 s</span></div><div><span>Cameras, AI video models</span><span>0</span></div><div class="tot"><span>Credits spent</span><span>0</span></div></div>`);
})();
