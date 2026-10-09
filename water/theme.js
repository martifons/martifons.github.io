// WATER — la pantalla entera es agua: el ratón o el dedo hacen ondas, caen gotas solas, y cada
// llegada de la cámara (que se hunde como la piedra) deja un anillo. Los prompts están bajo el
// agua hasta que les dejas caer una piedra; las reglas son gotas que revientan.
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const zum = (p) => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch {} };
  const NS = "http://www.w3.org/2000/svg";

  // ---------- la lámina de agua (simulación de ondas en una rejilla pequeña) ----------
  const cv = document.createElement("canvas");
  cv.id = "pond"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  const off = document.createElement("canvas");
  const ox = off.getContext("2d");
  let GW, GH, cur, prev, img, base;
  const tam = () => {
    cv.width = innerWidth; cv.height = innerHeight;
    GW = innerWidth < 760 ? 120 : 180; GH = Math.round(GW * innerHeight / innerWidth);
    off.width = GW; off.height = GH;
    cur = new Float32Array(GW * GH); prev = new Float32Array(GW * GH);
    img = ox.createImageData(GW, GH);
    // color de fondo de cada celda: agua oscura, con el sol cálido arriba
    base = new Float32Array(GW * GH * 3);
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
      const t = y / GH, k = (y * GW + x) * 3;
      const sol = Math.max(0, 1 - Math.hypot((x / GW - .5) * 1.4, t * 2.2 - .05)) ** 2.2;
      base[k] = 7 + 10 * (1 - t) + 120 * sol; base[k + 1] = 12 + 18 * (1 - t) + 80 * sol; base[k + 2] = 15 + 22 * (1 - t) + 45 * sol;
    }
  };
  tam(); addEventListener("resize", tam);
  const toca = (px, py, fuerza = 380, radio = 2) => {
    if (!cur) return;
    const gx = Math.round(px / innerWidth * GW), gy = Math.round(py / innerHeight * GH);
    for (let j = -radio; j <= radio; j++) for (let i = -radio; i <= radio; i++) {
      const x = gx + i, y = gy + j;
      if (x > 0 && y > 0 && x < GW - 1 && y < GH - 1 && i * i + j * j <= radio * radio) cur[y * GW + x] += fuerza;
    }
  };
  let gotaEn = 1200, t0 = performance.now();
  const paso = (t) => {
    const dt = t - t0; t0 = t;
    // ondas
    for (let y = 1; y < GH - 1; y++) for (let x = 1; x < GW - 1; x++) {
      const i = y * GW + x;
      prev[i] = ((cur[i - 1] + cur[i + 1] + cur[i - GW] + cur[i + GW]) / 2 - prev[i]) * .975;
    }
    [cur, prev] = [prev, cur];
    // luz: la pendiente de la ola hace brillos y sombras
    const d = img.data;
    for (let y = 1; y < GH - 1; y++) for (let x = 1; x < GW - 1; x++) {
      const i = y * GW + x, k = i * 3, p = i * 4;
      const luz = (cur[i - 1] - cur[i + 1]) * .55 + (cur[i - GW] - cur[i + GW]) * .35;
      d[p] = base[k] + luz * .8; d[p + 1] = base[k + 1] + luz * 1.0; d[p + 2] = base[k + 2] + luz * 1.1; d[p + 3] = 255;
    }
    ox.putImageData(img, 0, 0);
    cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = "high"; cx.drawImage(off, 0, 0, cv.width, cv.height);
    // gotas sueltas, como las que caen del agua en el vídeo
    gotaEn -= dt;
    if (gotaEn <= 0 && !document.hidden) { toca(rnd(.15, .85) * innerWidth, rnd(.15, .85) * innerHeight, 200, 2); gotaEn = rnd(900, 1700); }
    requestAnimationFrame(paso);
  };
  if (!quieto) requestAnimationFrame(paso);
  else { tam(); cx.fillStyle = "#0A1418"; cx.fillRect(0, 0, cv.width, cv.height); }

  // el ratón al moverse y el dedo al arrastrar rozan el agua
  let ultimo = 0;
  addEventListener("pointermove", (e) => {
    const t = performance.now(); if (t - ultimo < 28) return; ultimo = t;
    toca(e.clientX, e.clientY, e.pointerType === "mouse" ? 90 : 160, 2);
  }, { passive: true });
  addEventListener("pointerdown", (e) => toca(e.clientX, e.clientY, 520, 2), { passive: true });

  // ---------- filtros de "bajo el agua" ----------
  const defs = document.createElementNS(NS, "svg");
  defs.setAttribute("width", "0"); defs.setAttribute("height", "0"); defs.style.position = "absolute";
  document.body.appendChild(defs);
  const filtro = (id, escala) => {
    defs.insertAdjacentHTML("beforeend", `<filter id="${id}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="2" seed="${Math.round(rnd(1, 99))}"/><feDisplacementMap in="SourceGraphic" scale="${escala}" xChannelSelector="R" yChannelSelector="G"/></filter>`);
    const f = defs.querySelector(`#${id}`);
    return { turb: f.querySelector("feTurbulence"), disp: f.querySelector("feDisplacementMap") };
  };
  const filtros = [];
  const titulo = filtro("wobble-title", 14); filtros.push(titulo);
  // el agua se mueve: la turbulencia respira despacio
  let fase = 0;
  const respira = () => {
    fase += .02;
    for (const f of filtros) f.turb.setAttribute("baseFrequency", `${(.012 + Math.sin(fase) * .003).toFixed(4)} ${(.03 + Math.cos(fase * .8) * .006).toFixed(4)}`);
    requestAnimationFrame(respira);
  };
  if (!quieto) requestAnimationFrame(respira);
  const aclara = (f, ms, alFin) => {
    const ini = performance.now(), s0 = +f.disp.getAttribute("scale");
    const p = (t) => { const k = Math.min(1, (t - ini) / ms); f.disp.setAttribute("scale", (s0 * (1 - k)).toFixed(2)); if (k < 1) requestAnimationFrame(p); else alFin && alFin(); };
    quieto ? (f.disp.setAttribute("scale", "0"), alFin && alFin()) : requestAnimationFrame(p);
  };

  // ---------- el título se aclara al llegar ----------
  const h1 = document.querySelector(".hero h1.big");
  let hecho = false;
  addEventListener("flyview", (e) => {
    if (hecho || e.detail.index !== 0 || !h1) return;
    hecho = true;
    setTimeout(() => {
      const r = h1.getBoundingClientRect(); toca(r.left + r.width * .5, r.bottom - 10, 700, 3);
      aclara(titulo, 1300, () => h1.classList.add("clear"));
    }, quieto ? 0 : 700);
  });

  // ---------- cada llegada: las targetas se asientan y el agua hace un anillo ----------
  addEventListener("flyview", (e) => {
    e.detail.els.forEach((el, k) => {
      el.classList.remove("settle"); void el.offsetWidth;
      el.style.animationDelay = k * 120 + "ms"; el.classList.add("settle");
    });
    if (e.detail.dir) toca(innerWidth / 2, innerHeight * .5, 900, 4);
  });

  // ---------- los prompts, bajo el agua: se les deja caer una piedra ----------
  let n = 0;
  const suelta = (deep, rapido) => {
    if (!deep.classList.contains("under") || deep.dataset.cayendo) return;
    const f = deep._f, piedra = deep.querySelector(".stone");
    const r = deep.getBoundingClientRect();
    const fin = () => { deep.classList.remove("under"); delete deep.dataset.cayendo; deep.querySelector(".drop-btn")?.remove(); };
    zum([15, 30, 15]);
    if (rapido || quieto) { f.disp.setAttribute("scale", "0"); toca(r.left + r.width / 2, r.top + 20, 600, 3); fin(); return; }
    deep.dataset.cayendo = "1";
    deep.querySelector(".drop-btn").style.opacity = "0";
    const alto = r.height;
    const anim = piedra.animate([
      { transform: "translateY(-60px) rotate(0deg)", opacity: 1, offset: 0 },
      { transform: "translateY(4px) rotate(40deg)", opacity: 1, offset: .18, easing: "cubic-bezier(.2,.6,.4,1)" },
      { transform: `translateY(${alto - 30}px) rotate(130deg)`, opacity: 1, offset: .85, easing: "cubic-bezier(.5,0,1,1)" },
      { transform: `translateY(${alto + 60}px) rotate(160deg)`, opacity: 0, offset: 1 },
    ], { duration: 1700, fill: "forwards" });
    // al entrar en el agua: anillo y empieza a aclararse detrás de ella
    setTimeout(() => {
      toca(r.left + r.width / 2, r.top + 10, 700, 3);
      const ring = document.createElement("i"); ring.className = "ripple-ring"; ring.style.top = "6px"; deep.appendChild(ring);
      ring.addEventListener("animationend", () => ring.remove());
      aclara(f, 1200);
    }, 300);
    anim.onfinish = fin;
  };
  document.querySelectorAll(".code").forEach((code) => {
    const deep = document.createElement("div");
    deep.className = "deep under";
    code.replaceWith(deep); deep.appendChild(code);
    const id = `wob-${n++}`;
    deep._f = filtro(id, 16); filtros.push(deep._f);
    deep.style.setProperty("--wob", `url(#${id})`);
    deep.insertAdjacentHTML("beforeend", `<i class="stone" aria-hidden="true"></i>
      <button class="drop-btn" type="button" aria-label="Drop the stone to clear the prompt"><span class="pebble"></span>Drop the stone <kbd>D</kbd></button>`);
    deep.querySelector(".drop-btn").addEventListener("click", () => suelta(deep));
    deep.parentElement.querySelector(".cp")?.addEventListener("click", () => suelta(deep, true));
  });
  addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() !== "d" || e.metaKey || e.ctrlKey || e.altKey) return;
    const d = document.querySelector(".slab.on .deep.under");
    if (d) suelta(d); else toca(innerWidth / 2, innerHeight / 2, 900, 4);
  });

  // al copiar: el agua responde desde el botón
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    const r = b.getBoundingClientRect(); toca(r.left + r.width / 2, r.top + r.height / 2, 800, 3); zum(20);
  }));

  // ---------- reglas: gotas que revientan ----------
  const reglas = [...document.querySelectorAll(".slab.rule")];
  reglas.forEach((slab) => {
    const p = slab.querySelector("p:not(.k)");
    const more = document.createElement("div"); more.className = "more"; more.appendChild(p);
    const gota = document.createElement("div"); gota.className = "gota"; gota.setAttribute("aria-hidden", "true");
    slab.querySelector(".k").after(gota);
    slab.appendChild(more);
    slab.insertAdjacentHTML("beforeend", `<div class="hint">Tap the drop</div>`);
    slab.setAttribute("role", "button"); slab.tabIndex = 0;
    slab._abre = (si) => {
      const abierto = si ?? !slab.classList.contains("open");
      slab.classList.toggle("open", abierto); slab.setAttribute("aria-expanded", abierto);
      if (abierto) {
        const ring = document.createElement("i"); ring.className = "ripple-ring"; slab.appendChild(ring);
        ring.addEventListener("animationend", () => ring.remove());
        const r = gota.getBoundingClientRect(); toca(r.left + r.width / 2, r.top + r.height / 2, 500, 2); zum(12);
      }
    };
    slab.addEventListener("click", () => slab._abre());
    slab.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); slab._abre(); } });
  });
  addEventListener("flyview", (e) => {
    reglas.filter((s) => e.detail.els.includes(s)).forEach((s, k) => setTimeout(() => { if (!s.classList.contains("open")) s._abre(true); }, (quieto ? 0 : 900) + k * 420));
  });
})();
