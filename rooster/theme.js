// ROOSTER — el fondo es una habitación de ratán al amanecer: la pared trenzada, el suelo de tablillas de bambú y una
// ventana a la derecha cuyo cielo pasa de noche a mañana al avanzar, con la luz que entra cada vez más fuerte; suben
// zetas lentas de alguien que duerme. Tocar la pared es cantar: sale una onda y las zetas salen volando. Cada prompt
// está detrás de la gata dormida en su cojín y el gallo a su lado, que canta notas hacia ella: hay que reventar cinco
// antes de que le lleguen; entonces la gata salta sobre él, lo calla, el gallo se sienta con los ojos cerrados y ella
// se vuelve a dormir. Al copiar caen plumas negras. Las reglas se desperezan. Cámara "zzz".
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");
  const mezcla = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;

  // plumas negras que caen meciéndose
  const plumas = (padre, x, y, n, fijo) => {
    if (quieto) return;
    for (let k = 0; k < n; k++) {
      const p = document.createElement("i");
      p.className = "pl" + (fijo ? " fixed" : "");
      p.style.cssText = `left:${x + rnd(-14, 14)}px;top:${y + rnd(-6, 6)}px;--dx:${rnd(-40, 40).toFixed(0)}px;--r:${rnd(-60, 60).toFixed(0)}deg;animation-delay:${(k * .08).toFixed(2)}s`;
      padre.appendChild(p); p.addEventListener("animationend", () => p.remove());
    }
  };

  // ---------- la habitación ----------
  const cv = document.createElement("canvas");
  cv.id = "room"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  let W, H, dpr, fondo = null, ven = null;
  const zetas = [], ondas = [];

  const pintaFondo = () => {
    fondo = document.createElement("canvas"); fondo.width = W; fondo.height = H;
    const c = fondo.getContext("2d");
    // la pared de ratán: tejido de cesta, celdas que alternan tiras horizontales y verticales
    c.fillStyle = "#A47A4A"; c.fillRect(0, 0, W, H);
    const t = Math.round(26 * dpr), suelo = H * .8;
    for (let y = 0; y < suelo; y += t) for (let x = 0; x < W; x += t) {
      const hor = ((x / t) + (y / t)) % 2 === 0;
      for (let k = 0; k < 3; k++) {
        c.fillStyle = k % 2 ? "rgba(255,226,180,.12)" : "rgba(60,34,12,.12)";
        if (hor) c.fillRect(x, y + k * t / 3, t, t / 3 - dpr); else c.fillRect(x + k * t / 3, y, t / 3 - dpr, t);
      }
    }
    // el suelo de tablillas de bambú, en perspectiva
    let g = c.createLinearGradient(0, suelo, 0, H);
    g.addColorStop(0, "#CDB88E"); g.addColorStop(1, "#E3D4B0");
    c.fillStyle = g; c.fillRect(0, suelo, W, H - suelo);
    c.strokeStyle = "rgba(120,92,52,.35)"; c.lineWidth = Math.max(1, dpr);
    for (let k = -30; k <= 30; k++) { const x0 = W / 2 + k * W * .03, x1 = W / 2 + k * W * .09; c.beginPath(); c.moveTo(x0, suelo); c.lineTo(x1, H); c.stroke(); }
    c.fillStyle = "rgba(60,34,12,.35)"; c.fillRect(0, suelo - 3 * dpr, W, 3 * dpr);
    // la ventana a la derecha (el cielo se pinta en cada fotograma)
    ven = { x: W * .64, y: H * .1, w: W * .26, h: H * .34 };
    c.fillStyle = "#4A3220"; c.fillRect(ven.x - 8 * dpr, ven.y - 8 * dpr, ven.w + 16 * dpr, ven.h + 16 * dpr);
    // cestos colgados a la izquierda
    for (const [x, y, r] of [[.12, .12, .07], [.26, .16, .05]]) {
      c.fillStyle = "#C8A06A"; c.beginPath(); c.ellipse(W * x, H * y, W * r, W * r * .9, 0, 0, 6.283); c.fill();
      c.strokeStyle = "rgba(90,60,30,.5)"; for (let k = 1; k < 5; k++) { c.beginPath(); c.ellipse(W * x, H * y, W * r * k / 5, W * r * .9 * k / 5, 0, 0, 6.283); c.stroke(); }
    }
  };

  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = Math.round(innerWidth * dpr); H = cv.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    pintaFondo();
    zetas.length = 0; ondas.length = 0;
  };
  tam();
  addEventListener("resize", tam);

  // el cielo de la ventana: noche (0) → amanecer (0,5) → mañana (1)
  const NOCHE = [[14, 26, 58], [43, 63, 110]], ALBA = [[242, 166, 90], [247, 215, 160]], DIA = [[191, 224, 245], [255, 255, 255]];
  const cielo = (p) => p < .5 ? [0, 1].map((i) => mezcla(NOCHE[i], ALBA[i], p * 2)) : [0, 1].map((i) => mezcla(ALBA[i], DIA[i], p * 2 - 1));

  let p = 0, objP = 0, ultimo = 0, nacer = 0;
  const pinta = (t) => {
    const dt = Math.min(50, t - (ultimo || t)); ultimo = t;
    p += (objP - p) * (quieto ? 1 : Math.min(1, dt / 900));
    cx.drawImage(fondo, 0, 0);
    const [arriba, abajo] = cielo(p), { x, y, w, h } = ven;
    const g = cx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, rgb(arriba)); g.addColorStop(1, rgb(abajo));
    cx.fillStyle = g; cx.fillRect(x, y, w, h);
    if (p < .45) { cx.fillStyle = `rgba(255,255,255,${(.8 * (1 - p / .45)).toFixed(2)})`; for (let k = 0; k < 7; k++) { cx.beginPath(); cx.arc(x + w * ((k * .37) % 1), y + h * ((k * .53) % .7), 1.4 * dpr, 0, 6.283); cx.fill(); } }
    if (p > .3) { const s = Math.min(1, (p - .3) / .4); cx.fillStyle = `rgba(255,236,170,${s.toFixed(2)})`; cx.beginPath(); cx.arc(x + w * .3, y + h * (1.05 - .55 * s), w * .12, 0, 6.283); cx.fill(); }
    cx.strokeStyle = "#4A3220"; cx.lineWidth = 6 * dpr; cx.beginPath(); cx.moveTo(x + w / 2, y); cx.lineTo(x + w / 2, y + h); cx.moveTo(x, y + h / 2); cx.lineTo(x + w, y + h / 2); cx.stroke();
    // la luz que entra y cae en el suelo
    cx.fillStyle = `rgba(255,224,160,${(.22 * p).toFixed(3)})`;
    cx.beginPath(); cx.moveTo(x, y + h); cx.lineTo(x + w, y + h); cx.lineTo(x + w * .6, H); cx.lineTo(x - w * 1.1, H); cx.closePath(); cx.fill();
    // zetas que suben desde abajo a la izquierda
    nacer -= dt;
    if (nacer <= 0 && !quieto) { zetas.push({ x: W * rnd(.08, .3), y: H * .82, vx: rnd(.004, .012) * dpr, vy: -rnd(.03, .045) * dpr, s: rnd(14, 30) * dpr, v: 1 }); nacer = 900; }
    cx.textAlign = "center";
    for (let k = zetas.length - 1; k >= 0; k--) {
      const z = zetas[k]; z.x += z.vx * dt; z.y += z.vy * dt; z.v -= dt / (z.huye ? 900 : 6000);
      if (z.v <= 0 || z.y < -40) { zetas.splice(k, 1); continue; }
      cx.font = `800 ${Math.round(z.s)}px ui-monospace, monospace`;
      cx.fillStyle = `rgba(255,246,232,${(.55 * z.v).toFixed(2)})`; cx.fillText("z", z.x, z.y);
    }
    // ondas del canto
    cx.lineWidth = 2 * dpr;
    for (let k = ondas.length - 1; k >= 0; k--) {
      const o = ondas[k]; o.r += .35 * dt * dpr; o.v -= dt / 700;
      if (o.v <= 0) { ondas.splice(k, 1); continue; }
      cx.strokeStyle = `rgba(204,255,0,${(.7 * o.v).toFixed(2)})`;
      for (const d of [0, 18 * dpr]) { if (o.r > d) { cx.beginPath(); cx.arc(o.x, o.y, o.r - d, -.9, .9); cx.stroke(); } }
    }
  };
  const bucle = (t) => { requestAnimationFrame(bucle); pinta(t); };
  if (quieto) pinta(0); else requestAnimationFrame(bucle);
  addEventListener("resize", () => { if (quieto) pinta(0); });

  addEventListener("flyview", (e) => {
    const { index, total, dir } = e.detail;
    objP = total > 1 ? index / (total - 1) : 0;
    if (dir) zum(dir > 0 ? [10, 30, 6] : 6);
    if (quieto) pinta(0);
  });

  // tocar la pared: el gallo canta y las zetas salen volando
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a")) return;
    zum([8, 20, 8, 20, 30]);
    if (quieto) return;
    const x = e.clientX * dpr, y = e.clientY * dpr;
    ondas.push({ x, y, r: 0, v: 1 });
    for (const z of zetas) { const a = Math.atan2(z.y - y, z.x - x); z.vx = Math.cos(a) * .6 * dpr; z.vy = Math.sin(a) * .6 * dpr; z.huye = true; }
  });

  // ---------- cada prompt, detrás de la siesta: revienta cinco notas ----------
  const HACEN = 5;
  const ESCENA = `<svg class="scene" viewBox="0 0 300 200" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
    <path d="M0 150H300V200H0Z" fill="#DCCAA4"/>
    <path d="M40 150L10 200M90 150L70 200M140 150L130 200M190 150L190 200M240 150L250 200M290 150L310 200" stroke="#BFA97F" stroke-width="1.5"/>
    <rect x="118" y="130" width="176" height="28" rx="9" fill="#C8322E"/><rect x="118" y="130" width="176" height="7" rx="4" fill="#DA4A40"/>
    <g fill="#E3B24A"><circle cx="135" cy="146" r="2"/><circle cx="160" cy="146" r="2"/><circle cx="185" cy="146" r="2"/><circle cx="210" cy="146" r="2"/><circle cx="235" cy="146" r="2"/><circle cx="260" cy="146" r="2"/><circle cx="282" cy="146" r="2"/></g>
    <g class="cat">
      <path d="M150 126q-22 2-17-15" fill="none" stroke="#8A7E72" stroke-width="6" stroke-linecap="round"/>
      <ellipse cx="198" cy="122" rx="52" ry="14" fill="#9A8E82"/>
      <path d="M165 110q4 10 0 22M180 108q4 12 0 26M195 108q4 12 0 26M210 108q4 12 0 26M225 110q4 10 0 22" stroke="#5E554C" stroke-width="3" fill="none"/>
      <ellipse cx="205" cy="131" rx="38" ry="5" fill="#F4F0EA"/>
      <ellipse cx="236" cy="133" rx="11" ry="4" fill="#F4F0EA"/><ellipse cx="226" cy="136" rx="10" ry="3.5" fill="#F4F0EA"/>
      <path d="M241 108L244 94L252 104Z" fill="#8A7E72"/>
      <g class="ear"><path d="M258 104L266 92L268 108Z" fill="#8A7E72"/></g>
      <circle cx="254" cy="116" r="14" fill="#9A8E82"/>
      <path d="M248 106l2 6M254 104v6M260 106l-2 6" stroke="#5E554C" stroke-width="1.6"/>
      <ellipse cx="258" cy="123" rx="8" ry="5" fill="#F4F0EA"/>
      <path d="M246 116q3 2 6 0M258 116q3 2 6 0" stroke="#2A221C" stroke-width="1.4" fill="none"/>
      <path d="M256 120h4l-2 2Z" fill="#E68A8A"/>
    </g>
    <g class="roo">
      <path d="M62 150v-26M76 150v-26M56 150h10M70 150h10" stroke="#E0B23A" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M40 98Q14 72 34 40Q32 70 52 86Z" fill="#141414"/><path d="M44 102Q20 92 22 64Q34 86 54 94Z" fill="#1E2A24"/>
      <ellipse cx="68" cy="104" rx="30" ry="24" fill="#16181A"/>
      <ellipse cx="62" cy="98" rx="18" ry="10" fill="#1F3A2E" opacity=".6"/>
      <g class="wing"><path d="M50 98q20-8 40 6q-18 14-40 4Z" fill="#0B0C0D"/></g>
      <path d="M76 94Q80 64 92 52Q106 58 104 72Q98 86 94 98Z" fill="#C4562A"/>
      <circle cx="100" cy="50" r="10" fill="#C4562A"/>
      <path d="M91 42l3-10 3 7 3-10 3 8 3-8 2 11Z" fill="#E0242A"/>
      <ellipse cx="107" cy="62" rx="3.5" ry="6.5" fill="#E0242A"/>
      <circle class="ojo" cx="103" cy="47" r="1.7" fill="#141008"/><path class="ojo2" d="M101 47h4" stroke="#141008" stroke-width="1.4"/>
      <path d="M108 47l10 3-10 2.5Z" fill="#E8C24A"/>
      <path class="jaw" d="M108 52.5l9 1.5-9 2Z" fill="#D9AF38"/>
    </g>
  </svg>`;
  document.querySelectorAll(".code").forEach((code) => {
    const caja = document.createElement("div");
    caja.className = "nap on";
    code.replaceWith(caja); caja.appendChild(code);
    caja.insertAdjacentHTML("beforeend", `<div class="coop" data-nofly role="button" tabindex="0" aria-label="Pop the rooster's notes before they reach the cat to reveal the prompt">${ESCENA}<p class="count">Shush: <b>0</b> / ${HACEN}</p><i class="zz">z</i><i class="zz">z</i><i class="zz">z</i></div>`);
    const coop = caja.querySelector(".coop"), svg = coop.querySelector(".scene"), cuenta = coop.querySelector(".count b");
    const zz = [...coop.querySelectorAll(".zz")];
    const notas = [];
    let hechas = 0, hecho = false, fin = false, antes = 0, sale = 600;
    // del viewBox (300×200, centrado y pegado abajo) a px de la targeta, sin las transformaciones 3D
    const aPx = (vx, vy) => {
      const cw = coop.clientWidth, ch = coop.clientHeight, s = Math.min(cw / 300, ch / 200);
      return [(cw - 300 * s) / 2 + vx * s, ch - 200 * s + vy * s, s];
    };
    const colocaZetas = () => { const [x, y] = aPx(262, 98); zz.forEach((z) => { z.style.left = x + "px"; z.style.top = y + "px"; }); };
    const abre = () => {
      if (caja.classList.contains("off")) return;
      hecho = true; caja.classList.remove("on"); caja.classList.add("off");
      zum([15, 30, 50]);
      setTimeout(() => coop.remove(), quieto ? 0 : 1100);
    };
    const canta = () => { coop.classList.add("crow"); setTimeout(() => coop.classList.remove("crow"), 260); };
    const final = () => {
      fin = true; notas.forEach((n) => n.el.remove()); notas.length = 0;
      if (quieto) return abre();
      canta(); coop.classList.add("awake");
      setTimeout(() => { coop.classList.add("leap"); zum([20, 30, 20, 30, 60]); const [x, y] = aPx(80, 70); plumas(coop, x, y, 5); }, 380);
      setTimeout(() => { coop.classList.remove("leap"); coop.classList.add("settle"); }, 1300);
      setTimeout(abre, 2300);
    };
    const revienta = (n) => {
      n.vivo = false; n.el.classList.add("pop"); n.el.addEventListener("animationend", () => n.el.remove());
      hechas++; cuenta.textContent = hechas; zum(10);
      if (hechas >= HACEN) final();
    };
    const suelta = () => {
      const el = document.createElement("span");
      el.className = "nt"; el.textContent = notas.length % 2 ? "♫" : "♪";
      coop.appendChild(el); notas.push({ el, t: 0, vivo: true, f: rnd(0, 6) });
      canta();
    };
    const mueve = (now) => {
      if (hecho || !coop.isConnected) return;
      const dt = Math.min(50, now - (antes || now)); antes = now;
      if (!fin && !quieto) {
        sale -= dt;
        if (sale <= 0 && notas.filter((n) => n.vivo).length < 3) { suelta(); sale = rnd(800, 1200); }
        const [bx, by, s] = aPx(118, 50), [gx, gy] = aPx(254, 108);
        for (let k = notas.length - 1; k >= 0; k--) {
          const n = notas[k];
          if (!n.vivo) { if (!n.el.isConnected) notas.splice(k, 1); continue; }
          n.t += dt / 2600;
          if (n.t >= 1) { n.el.remove(); notas.splice(k, 1); coop.classList.remove("twitch"); void coop.offsetWidth; coop.classList.add("twitch"); continue; }
          const x = bx + (gx - bx) * n.t + Math.sin(n.t * 9 + n.f) * 8 * s, y = by + (gy - by) * n.t - Math.sin(n.t * Math.PI) * 46 * s;
          n.x = x; n.y = y; n.el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
        }
      }
      requestAnimationFrame(mueve);
    };
    coop.addEventListener("pointerdown", (e) => {
      if (hecho || fin) return;
      if (quieto) { hechas++; cuenta.textContent = hechas; if (hechas >= HACEN) final(); return; }
      const r = coop.getBoundingClientRect(), k = coop.offsetWidth / (r.width || 1);
      const px = (e.clientX - r.left) * k, py = (e.clientY - r.top) * k;
      let mejor = null, dmin = 38;
      for (const n of notas) { if (!n.vivo) continue; const d = Math.hypot(n.x - px, n.y - py); if (d < dmin) { dmin = d; mejor = n; } }
      if (mejor) revienta(mejor);
    });
    coop.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      if (hecho || fin) return;
      const n = notas.find((q) => q.vivo);
      if (n) revienta(n); else { hechas++; cuenta.textContent = hechas; if (hechas >= HACEN) final(); }
    });
    caja.parentElement.querySelector(".cp")?.addEventListener("click", abre);
    colocaZetas(); addEventListener("resize", colocaZetas);
    requestAnimationFrame(mueve);
  });

  // al copiar: caen plumas negras del botón
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    zum([8, 20, 8]);
    const r = b.getBoundingClientRect();
    plumas(document.body, r.left + r.width / 2, r.top, 6, true);
  }));

  // ---------- reglas: se desperezan ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((s) => {
    if (!quieto) s.classList.add("sleepy");
    s.setAttribute("role", "button"); s.tabIndex = 0;
    s._estira = () => {
      if (quieto) return;
      s.classList.remove("wake"); void s.offsetWidth; s.classList.add("wake");
      zum([6, 30, 6]);
    };
    s.addEventListener("click", s._estira);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); s._estira(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s) && !s._vista)
      .forEach((s, n) => { s._vista = true; setTimeout(() => { s.classList.remove("sleepy"); s._estira(); }, (quieto ? 0 : 500) + n * 350); });
  });
})();
