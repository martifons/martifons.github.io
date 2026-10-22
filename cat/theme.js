// CAT — el fondo es una calle de pueblo a la hora dorada vista desde el bordillo: cielo claro, sol bajo a la izquierda,
// casas de teja a los dos lados, árboles de otoño, postes y cables, la calzada con bordillos amarillos que se va al
// fondo y el poste de las señales a la derecha. El gato, en su escoba, se acerca por la calle al avanzar; en la última
// parada vuela hacia el poste, se estampa y el poste cae. Tocar la calle hace que te salude. Cada prompt está detrás
// de la calle: hay que devolverle el saludo al gato (mover el dedo de lado a lado) cuatro veces; entonces saluda él,
// sin dejar de mirarte vuela contra el poste y lo tumba. Al copiar saltan estrellitas de golpe. Las reglas cuelgan
// torcidas como una señal golpeada y se enderezan. Cámara "topple".
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");

  // el gato en su escoba, mirándonos; la pata que saluda es la .paw (su derecha, a la izquierda del dibujo)
  const GATO = `<svg viewBox="0 0 140 130" aria-hidden="true"><g class="bob">
    <path d="M63 100C56 110 62 118 57 127" fill="none" stroke="#E08A3C" stroke-width="7" stroke-linecap="round"/>
    <path d="M63 100C56 110 62 118 57 127" fill="none" stroke="#B9652A" stroke-width="7" stroke-dasharray="3 5"/>
    <path d="M26 99L138 92" stroke="#5A3A22" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M30 94L2 86L0 99L2 112L30 104Z" fill="#D9BC72"/>
    <path d="M30 96L4 90M30 99L2 99M30 102L4 108" stroke="#B8974E" stroke-width="1"/>
    <rect x="27" y="93" width="5" height="12" rx="1.5" fill="#6B4A2A"/>
    <ellipse cx="60" cy="103" rx="6" ry="5" fill="#FFF6EC"/><ellipse cx="81" cy="102" rx="6" ry="5" fill="#FFF6EC"/>
    <ellipse cx="70" cy="74" rx="21" ry="26" fill="#E8913F"/><ellipse cx="70" cy="79" rx="14" ry="21" fill="#FFF6EC"/>
    <rect x="75" y="68" width="9" height="30" rx="4.5" fill="#FFF6EC"/>
    <path d="M54 33L57 14L67 26Z" fill="#E8913F"/><path d="M86 33L83 14L73 26Z" fill="#E8913F"/>
    <path d="M57 30L58.5 19L64 26Z" fill="#F2B3A6"/><path d="M83 30L81.5 19L76 26Z" fill="#F2B3A6"/>
    <circle cx="70" cy="40" r="17" fill="#E8913F"/>
    <path d="M70 24C66 34 61 42 60 50C64 57 76 57 80 50C79 42 74 34 70 24Z" fill="#FFF6EC"/>
    <path d="M62 28l3 5M78 28l-3 5" stroke="#C9722E" stroke-width="1.6"/>
    <ellipse cx="63" cy="40" rx="3.6" ry="3.8" fill="#D9A23A"/><ellipse cx="77" cy="40" rx="3.6" ry="3.8" fill="#D9A23A"/>
    <ellipse cx="63" cy="40" rx="1.3" ry="2.8" fill="#1A1208"/><ellipse cx="77" cy="40" rx="1.3" ry="2.8" fill="#1A1208"/>
    <path d="M68 47L72 47L70 49.5Z" fill="#E68A8A"/>
    <path d="M60 49L46 46M60 51L46 52M80 49L94 46M80 51L94 52" stroke="#fff" stroke-width=".8"/>
    <g class="paw"><rect x="56" y="66" width="9" height="31" rx="4.5" fill="#FFF6EC"/><ellipse cx="60.5" cy="93" rx="3" ry="2.2" fill="#F2A6A0"/></g>
  </g></svg>`;
  const POSTE = `<i class="sign l"></i><i class="sign r"></i>`;
  const saluda = (el, largo) => {
    if (quieto) return;
    const c = largo ? "waving-long" : "waving";
    el.classList.remove("waving", "waving-long"); void el.offsetWidth; el.classList.add(c);
  };
  // estrellitas de golpe alrededor de un punto
  const estrellas = (padre, x, y, fijo) => {
    if (quieto) return;
    const s = document.createElement("span");
    s.className = "star" + (fijo ? " fixed" : ""); s.style.left = x + "px"; s.style.top = y + "px";
    const colores = ["#CCFF00", "#FFFFFF", "#FF2A1F"];
    for (let k = 0; k < 7; k++) {
      const i = document.createElement("i"); i.textContent = "✦";
      i.style.cssText = `--a:${(k * 51 + rnd(-12, 12)).toFixed(0)}deg;--d:${rnd(28, 46).toFixed(0)}px;--c:${colores[k % 3]}`;
      s.appendChild(i);
    }
    padre.appendChild(s); setTimeout(() => s.remove(), 900);
  };

  // ---------- la calle (estática: se pinta al cambiar de tamaño) ----------
  const cv = document.createElement("canvas");
  cv.id = "street"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  const poste = document.createElement("div");
  poste.id = "bigpost"; poste.setAttribute("aria-hidden", "true"); poste.innerHTML = POSTE;
  const vuela = document.createElement("div");
  vuela.id = "flier"; vuela.className = "cat"; vuela.setAttribute("aria-hidden", "true"); vuela.innerHTML = GATO;
  cv.after(poste, vuela);
  let W, H, dpr;

  const casa = (x, base, w, h) => {
    cx.fillStyle = "#EDE3CF"; cx.fillRect(x, base - h, w, h);
    cx.strokeStyle = "#5B3E28"; cx.lineWidth = Math.max(1, w * .012);
    cx.beginPath();
    for (let k = 1; k < 4; k++) { cx.moveTo(x + w * k / 4, base - h); cx.lineTo(x + w * k / 4, base); }
    cx.moveTo(x, base - h * .45); cx.lineTo(x + w, base - h * .45); cx.stroke();
    // el tejado: alero curvado con las puntas hacia arriba y la cumbrera recta
    const ey = base - h, cy = ey - h * .7;
    cx.fillStyle = "#3B3F45";
    cx.beginPath(); cx.moveTo(x - w * .14, ey - h * .16);
    cx.quadraticCurveTo(x + w * .5, ey + h * .14, x + w * 1.14, ey - h * .16);
    cx.lineTo(x + w * .9, cy); cx.quadraticCurveTo(x + w * .5, cy + h * .1, x + w * .1, cy); cx.closePath(); cx.fill();
    cx.fillStyle = "#555B62"; cx.fillRect(x + w * .08, cy - h * .06, w * .84, h * .08);
  };

  const pintaFondo = () => {
    const vx = W * .46, vy = H * .56;
    let g = cx.createLinearGradient(0, 0, 0, vy);
    g.addColorStop(0, "#86AFD6"); g.addColorStop(.7, "#CFDDE6"); g.addColorStop(1, "#F2DDB8");
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    g = cx.createRadialGradient(W * .06, vy, 0, W * .06, vy, Math.max(W, H) * .6);
    g.addColorStop(0, "rgba(255,214,150,.8)"); g.addColorStop(1, "rgba(255,214,150,0)");
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    // el suelo a los dos lados
    cx.fillStyle = "#7D8650"; cx.fillRect(0, vy, W, H - vy);
    // árboles de otoño detrás de las casas
    const copas = ["#C8452A", "#E07A2E", "#B33A24", "#D9962F", "#6E7B3A"];
    for (const [x0, x1, y, r] of [[-.05, .4, .5, .07], [.55, 1.05, .5, .07], [.3, .44, .54, .025], [.5, .62, .54, .025]]) {
      for (let k = 0; k < 9; k++) {
        cx.fillStyle = copas[(k * 3 + Math.round(x0 * 10)) % copas.length];
        const rr = r * Math.min(W, H) * rnd(.7, 1.2);
        cx.beginPath(); cx.arc(rnd(x0, x1) * W, y * H - rnd(0, rr * 1.4), rr, 0, 6.283); cx.fill();
      }
    }
    // casas de teja: grandes cerca, pequeñas al fondo
    for (const [x, b, w, h] of [[-.06, .64, .3, .1], [.2, .6, .14, .05], [.34, .575, .07, .025], [.52, .575, .07, .025], [.62, .6, .15, .05], [.8, .64, .3, .1]]) casa(x * W, b * H, w * W, h * H);
    // la calzada y los bordillos amarillos
    g = cx.createLinearGradient(0, vy, 0, H);
    g.addColorStop(0, "#A39E95"); g.addColorStop(1, "#5E5E62");
    cx.fillStyle = g;
    cx.beginPath(); cx.moveTo(vx - 4 * dpr, vy); cx.lineTo(vx + 4 * dpr, vy); cx.lineTo(W * .86, H); cx.lineTo(W * .06, H); cx.closePath(); cx.fill();
    cx.fillStyle = "#E6C23A";
    cx.beginPath(); cx.moveTo(vx - 4 * dpr, vy); cx.lineTo(vx - 2.5 * dpr, vy); cx.lineTo(W * .09, H); cx.lineTo(W * .035, H); cx.closePath(); cx.fill();
    cx.beginPath(); cx.moveTo(vx + 2.5 * dpr, vy); cx.lineTo(vx + 4 * dpr, vy); cx.lineTo(W * .885, H); cx.lineTo(W * .83, H); cx.closePath(); cx.fill();
    // sombras largas de la tarde, hacia la derecha
    cx.fillStyle = "rgba(40,30,50,.16)";
    for (const t of [.25, .55, .8]) {
      const y = vy + (H - vy) * t, e = (H - vy) * .05 * (1 + t);
      cx.beginPath(); cx.moveTo(0, y); cx.lineTo(W, y + e * 1.5); cx.lineTo(W, y + e * 2.5); cx.lineTo(0, y + e); cx.closePath(); cx.fill();
    }
    // postes de la luz por la izquierda y sus cables, que se juntan al fondo
    const cimas = [];
    for (const t of [.06, .2, .5, 1.05]) {
      const x = vx - 10 * dpr - (vx - W * .02) * t, base = vy + (H - vy) * t, alto = H * (.04 + .62 * t);
      cx.strokeStyle = "#4A4A4E"; cx.lineWidth = Math.max(1, 7 * t * dpr);
      cx.beginPath(); cx.moveTo(x, base); cx.lineTo(x, base - alto); cx.stroke();
      cx.lineWidth = Math.max(1, 4 * t * dpr);
      cx.beginPath(); cx.moveTo(x - alto * .08, base - alto * .93); cx.lineTo(x + alto * .08, base - alto * .93); cx.stroke();
      cimas.push([x, base - alto * .93, alto]);
    }
    cx.strokeStyle = "rgba(40,40,46,.7)"; cx.lineWidth = Math.max(1, dpr * .8);
    for (const d of [-.07, 0, .07]) {
      cx.beginPath(); cx.moveTo(cimas[0][0] + d * cimas[0][2], cimas[0][1]);
      for (let k = 1; k < cimas.length; k++) {
        const [a, b] = cimas[k - 1], [c, e, al] = cimas[k];
        cx.quadraticCurveTo((a + c) / 2, Math.max(b, e) + al * .06, c + d * al, e);
      }
      cx.stroke();
    }
    for (const d of [.1, .16]) { cx.beginPath(); cx.moveTo(0, H * d); cx.quadraticCurveTo(W * .5, H * (d + .08), W, H * (d - .03)); cx.stroke(); }
  };

  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = Math.round(innerWidth * dpr); H = cv.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    pintaFondo();
    coloca();
  };

  // ---------- el gato del fondo: se acerca con el avance y en la última parada choca ----------
  let p = 0, ultima = false, choque = [];
  const coloca = () => {
    if (ultima) return;
    const w = innerWidth, h = innerHeight, e = Math.min(1, p / .9), s = .18 + (Math.min(1.1, Math.min(w, h) / 600) - .18) * e * e;
    const x = w * .46 + (w * .17 - w * .46) * e, y = h * .53 + (h * .66 - h * .53) * e;
    vuela.classList.remove("crash", "down");
    vuela.style.transform = `translate(${x - 75}px,${y - 60}px) scale(${s.toFixed(3)})`;
  };
  const choca = () => {
    if (quieto) { poste.classList.add("down"); return; }
    const r = poste.getBoundingClientRect(), x = r.left - 60, y = r.top + r.height * .45;
    saluda(vuela, true);
    choque.push(setTimeout(() => { vuela.classList.add("crash"); vuela.style.transform = `translate(${x - 75}px,${y - 60}px) scale(1)`; }, 900));
    choque.push(setTimeout(() => { estrellas(document.body, r.left, y, true); poste.classList.add("hit"); zum([20, 40, 20]); }, 1400));
    choque.push(setTimeout(() => {
      poste.classList.remove("hit"); poste.classList.add("down");
      vuela.classList.add("down"); vuela.style.transform = `translate(${x - 40}px,${innerHeight * .86 - 60}px) scale(1) rotate(-14deg)`;
    }, 1600));
  };
  const levanta = () => {
    choque.forEach(clearTimeout); choque = [];
    poste.classList.remove("down", "hit");
  };
  tam();
  addEventListener("resize", tam);

  addEventListener("flyview", (e) => {
    const { index, total, dir } = e.detail;
    p = total > 1 ? index / (total - 1) : 0;
    const fin = total > 1 && index === total - 1;
    if (fin && !ultima) { ultima = true; choca(); }
    else if (!fin && ultima) { ultima = false; levanta(); coloca(); }
    else if (!fin) coloca();
    if (dir) zum(dir > 0 ? [10, 30, 6] : 6);
  });

  // tocar la calle: el gato te saluda
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a")) return;
    zum(10);
    saluda(vuela);
  });

  // ---------- cada prompt, detrás de la calle: devuélvele el saludo ----------
  const HACEN = 4;
  const FONDO = `<svg class="bk" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <rect x="0" y="58" width="100" height="42" fill="#7D8650"/>
    <ellipse cx="8" cy="50" rx="7" ry="5" fill="#C8452A"/><ellipse cx="20" cy="51" rx="6" ry="4.5" fill="#E07A2E"/>
    <ellipse cx="82" cy="51" rx="7" ry="5" fill="#B33A24"/><ellipse cx="95" cy="50" rx="6" ry="5" fill="#D9962F"/>
    <path d="M3 53H29V58H3Z" fill="#EDE3CF"/><path d="M0 53.5Q16 56.5 32 53.5L28 50.5Q16 51.8 4 50.5Z" fill="#3B3F45"/>
    <path d="M70 53H96V58H70Z" fill="#EDE3CF"/><path d="M67 53.5Q83 56.5 99 53.5L95 50.5Q83 51.8 71 50.5Z" fill="#3B3F45"/>
    <path d="M44 58H50L88 100H4Z" fill="#7F7C78"/>
    <path d="M43.6 58H44.3L6 100H2.5Z" fill="#E6C23A"/><path d="M49.7 58H50.4L91.5 100H87.5Z" fill="#E6C23A"/>
  </svg>`;
  document.querySelectorAll(".code").forEach((code) => {
    const caja = document.createElement("div");
    caja.className = "lane on";
    code.replaceWith(caja); caja.appendChild(code);
    caja.insertAdjacentHTML("beforeend", `<div class="street" data-nofly role="button" tabindex="0" aria-label="Wave back at the cat to reveal the prompt">${FONDO}<span class="post">${POSTE}</span><span class="cat">${GATO}</span><p class="count">Wave back: <b>0</b> / ${HACEN}</p><span class="hint" aria-hidden="true">👋</span></div>`);
    const calle = caja.querySelector(".street"), gato = calle.querySelector(".cat"), palo = calle.querySelector(".post"), cuenta = calle.querySelector(".count b");
    let hecho = false, saludos = 0, ult = null, sentido = 0, tramo = 0, movido = 0;
    const abre = () => {
      if (caja.classList.contains("off")) return;
      hecho = true; caja.classList.remove("on"); caja.classList.add("off");
      zum([15, 30, 50]);
      setTimeout(() => calle.remove(), quieto ? 0 : 1100);
    };
    const choca = () => {
      if (hecho) return;
      hecho = true;
      if (quieto) return abre();
      saluda(gato, true);
      setTimeout(() => {
        // la targeta va en 3D y escalada: las medidas de pantalla se pasan a px de la targeta
        const c = calle.getBoundingClientRect(), g = gato.getBoundingClientRect(), q = palo.getBoundingClientRect();
        const k = calle.offsetWidth / (c.width || 1);
        caja.style.setProperty("--gx", ((q.left - g.right + g.width * .12) * k).toFixed(0) + "px");
        caja.style.setProperty("--gy", ((c.bottom - g.bottom - 4) * k).toFixed(0) + "px");
        caja.classList.add("go");
        setTimeout(() => {
          estrellas(calle, (q.left - c.left) * k, (g.top - c.top + g.height * .45) * k);
          palo.classList.add("hit"); zum([20, 40, 20]);
          setTimeout(() => { palo.classList.remove("hit"); caja.classList.add("fall"); }, 200);
          setTimeout(abre, 1100);
        }, 450);
      }, 700);
    };
    const uno = () => {
      saludos++; cuenta.textContent = saludos; calle.classList.add("started");
      saluda(gato); zum(8);
      if (saludos >= HACEN) choca();
    };
    calle.addEventListener("pointerdown", (e) => {
      if (hecho) return;
      try { calle.setPointerCapture(e.pointerId); } catch {}
      ult = e.clientX; sentido = 0; tramo = 0; movido = 0;
    });
    calle.addEventListener("pointermove", (e) => {
      if (hecho) return;
      // con ratón vale también pasar por encima sin pulsar; con el dedo, arrastrando
      if (ult === null) { if (e.pointerType === "mouse") ult = e.clientX; return; }
      const dx = e.clientX - ult; ult = e.clientX;
      if (!dx) return;
      movido += Math.abs(dx);
      const d = Math.sign(dx);
      if (d === sentido) { tramo += Math.abs(dx); return; }
      if (sentido !== 0 && tramo >= 18) uno();
      sentido = d; tramo = Math.abs(dx);
    });
    const suelta = (e) => {
      if (e.pointerType !== "mouse") ult = null;
      if (!hecho && e.type === "pointerup" && movido < 6) saluda(gato);
    };
    calle.addEventListener("pointerup", suelta);
    calle.addEventListener("pointercancel", suelta);
    calle.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") ult = null; });
    calle.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); while (!hecho) uno(); } });
    caja.parentElement.querySelector(".cp")?.addEventListener("click", abre);
  });

  // al copiar: estrellitas de golpe alrededor del botón
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    zum([8, 20, 8]);
    const r = b.getBoundingClientRect();
    estrellas(document.body, r.left + r.width / 2, r.top + r.height / 2, true);
  }));

  // ---------- reglas: cuelgan torcidas como una señal golpeada y se enderezan ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((s) => {
    if (!quieto) s.classList.add("askew");
    s.setAttribute("role", "button"); s.tabIndex = 0;
    s._golpe = () => {
      if (quieto) return;
      s.classList.remove("bonk"); void s.offsetWidth; s.classList.add("bonk");
      zum([6, 30, 6]);
    };
    s.addEventListener("click", s._golpe);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); s._golpe(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s) && !s._vista)
      .forEach((s, n) => { s._vista = true; setTimeout(() => { s.classList.remove("askew"); zum([6, 30, 6]); }, (quieto ? 0 : 500) + n * 350); });
  });
})();
