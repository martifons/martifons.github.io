// FLASH — el fondo es el cuarto viejo del estudio: pared de yeso con manchas, el fluorescente que
// parpadea, la cortina gris, el flash de estudio a la izquierda y la mesa con su montón de papeles a la
// derecha. Cada vez que se avanza salta un flash, y los golpes van a más: hacia un tercio del recorrido
// la cortina sale volando, hacia dos tercios el pie del flash se cae y al final los papeles revientan
// por todo el cuarto. Tocar la pared dispara el flash. El titular se encrespa con el primer flash y se
// peina solo. Cada prompt es una polaroid que se revela sacudiéndola. Copiar dispara el flash y suelta
// papeles. Las reglas son negativos que se positivan con un flash. Cámara "sheet": una hoja de contactos.
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const stage = document.getElementById("stage");

  // ---------- el cuarto ----------
  const props = document.createElement("div");
  props.id = "props"; props.setAttribute("aria-hidden", "true");
  props.innerHTML = `<i class="tube"></i><i class="rod"></i><i class="curtain"></i>
    <svg class="stand" viewBox="0 0 120 320"><defs><linearGradient id="refl" x1="0" x2="1"><stop offset="0" stop-color="#8E9196"/><stop offset=".5" stop-color="#F2F3F5"/><stop offset="1" stop-color="#9A9DA2"/></linearGradient></defs>
      <path d="M60 250 L12 318 M60 250 L108 318 M60 250 L60 318" stroke="#1B1B1D" stroke-width="5" stroke-linecap="round"/>
      <path d="M60 252 L60 78" stroke="#1B1B1D" stroke-width="6" stroke-linecap="round"/>
      <rect x="34" y="52" width="40" height="32" rx="5" fill="#222326"/>
      <path d="M74 50 L114 28 L114 108 L74 86 Z" fill="url(#refl)"/></svg>
    <i class="desk"><i class="monitor"></i><i class="stack"></i></i>`;
  document.body.prepend(props);
  const luz = document.createElement("div");
  luz.id = "flashlight"; luz.setAttribute("aria-hidden", "true");
  document.body.appendChild(luz);

  // los papeles: vuelan, revolotean y se quedan en el suelo
  const cv = document.createElement("canvas");
  cv.id = "papers"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  let W, H, dpr;
  const papeles = [];
  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = Math.round(innerWidth * dpr); H = cv.height = Math.round(innerHeight * dpr);
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    papeles.forEach((p) => { if (p.quieto) p.y = Math.min(p.y, H * .995); });
  };
  tam();
  const papel = (x, y, fuerza, enSuelo) => {
    const a = rnd(-Math.PI * .95, -Math.PI * .05), v = rnd(4, 13) * fuerza * dpr;
    const p = { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, rot: rnd(0, 6.28), vr: rnd(-.12, .12), w: rnd(16, 22) * dpr, fase: rnd(0, 6.28), suelo: H * rnd(.925, .995), quieto: false };
    if (enSuelo) { p.x = rnd(0, W); p.y = p.suelo; p.quieto = true; p.vr = 0; }
    papeles.push(p);
    if (papeles.length > 260) papeles.splice(0, papeles.length - 260);
  };
  const dibujaPapel = (p, t) => {
    const h = p.w * 1.3, giro = p.quieto ? 1 : Math.cos(p.fase + t * .006);
    cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.scale(giro, p.quieto ? .55 : 1);
    cx.fillStyle = giro > 0 ? "#FBFAF6" : "#E8E3D8"; cx.fillRect(-p.w / 2, -h / 2, p.w, h);
    cx.fillStyle = "rgba(60,55,50,.22)";
    for (let k = 0; k < 4; k++) cx.fillRect(-p.w * .35, -h * .32 + k * h * .16, p.w * (k === 3 ? .4 : .7), 1.2 * dpr);
    cx.restore();
  };
  let corriendo = false, ultimo = 0;
  const pinta = (t) => {
    const dt = Math.min(50, t - (ultimo || t)), f = dt / 16.7; ultimo = t;
    cx.clearRect(0, 0, W, H);
    let vivos = 0;
    for (const p of papeles) {
      if (!p.quieto) {
        vivos++;
        p.vy += .22 * dpr * f; p.vx *= Math.pow(.97, f); p.vy = Math.min(p.vy, 2.4 * dpr);
        p.x += (p.vx + Math.sin(p.fase + t * .004) * .9 * dpr) * f; p.y += p.vy * f; p.rot += p.vr * f;
        if (p.y >= p.suelo && p.vy > 0) { p.y = p.suelo; p.quieto = true; }
      }
      dibujaPapel(p, t);
    }
    if (vivos && !quieto) requestAnimationFrame(pinta); else corriendo = false;
  };
  const despierta = () => { if (quieto) { pinta(0); return; } if (!corriendo) { corriendo = true; ultimo = 0; requestAnimationFrame(pinta); } };
  addEventListener("resize", () => { tam(); pinta(performance.now()); });
  const revienta = (x, y, n, fuerza) => { for (let k = 0; k < n; k++) papel(x * dpr, y * dpr, fuerza * rnd(.5, 1.1), quieto); despierta(); };

  // el flash: dos fotogramas de luz blanca que nunca tapan del todo, y el cuarto que tiembla
  const dispara = (k) => {
    zum(k > .8 ? [40, 30, 60] : [25]);
    if (quieto) return;
    luz.animate([{ opacity: 0 }, { opacity: .5 * k, offset: .12 }, { opacity: 0 }], { duration: 320, easing: "ease-out" });
    props.animate([{ translate: "0 0" }, { translate: `${-6 * k}px ${3 * k}px` }, { translate: `${5 * k}px ${-2 * k}px` }, { translate: "0 0" }], { duration: 260 });
  };

  // los golpes van a más con el recorrido, y lo que se rompe se queda roto
  let maxP = 0;
  const escala = (p, sinAnimar) => {
    maxP = Math.max(maxP, p);
    if (sinAnimar) props.classList.add("instant");
    if (maxP >= .3) props.classList.add("no-curtain");
    if (maxP >= .6) props.classList.add("no-stand");
    if (maxP >= .999 && !props.classList.contains("no-stack")) {
      props.classList.add("no-stack");
      const r = props.querySelector(".stack").getBoundingClientRect();
      revienta(r.left + r.width / 2, r.top, 150, 1.25);
    }
    if (sinAnimar) { props.offsetWidth; props.classList.remove("instant"); }
  };

  // el titular, que se encrespa con el flash y se peina solo
  const letras = [];
  const titular = document.querySelector(".slab.hero h1");
  if (titular) {
    const parte = (nodo) => [...nodo.childNodes].forEach((n) => {
      if (n.nodeType !== 3) { parte(n); return; }
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((pal) => {
        if (!pal) return;
        if (/^\s+$/.test(pal)) { frag.appendChild(document.createTextNode(pal)); return; }
        const w = document.createElement("span"); w.className = "w";
        for (const ch of pal) { const s = document.createElement("span"); s.className = "ch"; s.textContent = ch; w.appendChild(s); letras.push(s); }
        frag.appendChild(w);
      });
      n.replaceWith(frag);
    });
    parte(titular);
  }
  const encrespa = () => {
    if (quieto || !letras.length) return;
    letras.forEach((s) => { s.style.transition = "transform .07s"; s.style.transform = `translate(${rnd(-4, 4)}px, ${rnd(-12, -2)}px) rotate(${rnd(-38, 38)}deg)`; });
    setTimeout(() => letras.forEach((s, n) => { s.style.transition = `transform .6s cubic-bezier(.3, 1.4, .5, 1) ${n * 22}ms`; s.style.transform = ""; }), 1300);
  };
  titular?.addEventListener("click", () => { dispara(.5); encrespa(); });

  let primero = true;
  addEventListener("flyview", (e) => {
    const { index, total, dir } = e.detail;
    const p = total > 1 ? index / (total - 1) : 0;
    if (primero) {
      primero = false;
      escala(p, true);
      if (index === 0) setTimeout(() => { dispara(.5); encrespa(); }, quieto ? 0 : 900);
      return;
    }
    if (dir > 0) { setTimeout(() => { dispara(.4 + .6 * p); escala(p); }, quieto ? 0 : 650); }
  });

  // tocar la pared: flash y unos cuantos papeles donde tocas
  stage.addEventListener("click", (e) => {
    if (e.target.closest(".slab, button, a")) return;
    dispara(.6);
    revienta(e.clientX, e.clientY, 9, .7);
  });

  // ---------- cada prompt, una polaroid que se revela sacudiéndola ----------
  const PASOS = 4;
  document.querySelectorAll(".code").forEach((code, n) => {
    const foto = document.createElement("div");
    foto.className = "polaroid raw"; foto.setAttribute("data-nofly", "");
    code.replaceWith(foto);
    const pic = document.createElement("div");
    pic.className = "pic"; foto.appendChild(pic); pic.appendChild(code);
    pic.insertAdjacentHTML("beforeend", `<i class="dev" aria-hidden="true"></i><span class="shake-hint" aria-hidden="true">Shake it</span>`);
    foto.insertAdjacentHTML("beforeend", `<p class="caption" aria-hidden="true"><span>PL-0${n + 1}</span><span class="dots">${"<i></i>".repeat(PASOS)}</span></p><button class="sr" type="button">Shake to develop the prompt</button>`);
    const puntos = foto.querySelectorAll(".dots i");
    let dev = 0, listo = false, arr = null;
    const muestra = () => {
      foto.style.setProperty("--dev", dev.toFixed(3));
      puntos.forEach((d, k) => d.classList.toggle("on", k < Math.round(dev * PASOS)));
    };
    const revela = () => {
      if (listo) return;
      listo = true; dev = 1; muestra();
      foto.classList.remove("raw"); foto.classList.add("developed");
      foto.style.rotate = "";
      zum([20, 30, 40]);
      setTimeout(() => { foto.querySelector(".shake-hint")?.remove(); foto.querySelector(".sr")?.remove(); }, quieto ? 0 : 700);
    };
    const sacude = () => {
      if (listo) return;
      dev = Math.min(1, dev + 1 / PASOS); muestra(); zum(12);
      if (dev >= .999) revela();
    };
    foto.addEventListener("pointerdown", (e) => {
      if (listo) return;
      arr = { x: e.clientX, x0: e.clientX, dir: 0, tramo: 0, recorrido: 0 };
      try { foto.setPointerCapture(e.pointerId); } catch {}
    });
    foto.addEventListener("pointermove", (e) => {
      if (!arr || listo) return;
      const dx = e.clientX - arr.x; arr.x = e.clientX;
      if (!dx) return;
      arr.recorrido += Math.abs(dx);
      foto.style.rotate = `${Math.max(-9, Math.min(9, (e.clientX - arr.x0) / 9))}deg`;
      const s = Math.sign(dx);
      // una sacudida cuenta cada vez que el gesto cambia de sentido tras recorrer un trecho
      if (s !== arr.dir) { if (arr.dir && arr.tramo > 22) sacude(); arr.dir = s; arr.tramo = 0; }
      arr.tramo += Math.abs(dx);
    });
    const suelta = () => {
      if (!arr) return;
      const toque = arr.recorrido < 8; arr = null;
      foto.style.rotate = "";
      if (listo) return;
      if (toque) { foto.classList.remove("wiggle"); void foto.offsetWidth; foto.classList.add("wiggle"); sacude(); }
    };
    foto.addEventListener("pointerup", suelta);
    foto.addEventListener("pointercancel", () => { arr = null; foto.style.rotate = ""; });
    foto.querySelector(".sr").addEventListener("click", (e) => { if (e.detail === 0) sacude(); });
    foto.parentElement.querySelector(".cp")?.addEventListener("click", revela);
    muestra();
  });

  // al copiar: flash y una ráfaga de papeles desde el botón
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    dispara(.7);
    const r = b.getBoundingClientRect();
    revienta(r.left + r.width / 2, r.top + r.height / 2, 18, .9);
  }));

  // ---------- reglas: negativos que se positivan con un flash ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((s) => {
    s.classList.add("neg");
    s.insertAdjacentHTML("beforeend", `<span class="hint" aria-hidden="true">Tap to expose</span><i class="pop" aria-hidden="true"></i>`);
    s.setAttribute("role", "button"); s.tabIndex = 0;
    s._expone = () => {
      if (s.classList.contains("pos")) {
        // otra vez: vuelve a negativo de golpe y se revela de nuevo
        s.classList.add("snap"); s.classList.remove("pos"); s.classList.add("neg"); void s.offsetWidth; s.classList.remove("snap");
      }
      s.classList.remove("neg"); s.classList.add("pos");
      zum([30, 20, 10]);
    };
    s.addEventListener("click", s._expone);
    s.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); s._expone(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s) && s.classList.contains("neg"))
      .forEach((s, n) => setTimeout(() => { if (s.classList.contains("neg")) s._expone(); }, (quieto ? 0 : 1250) + n * 520));
  });
})();
