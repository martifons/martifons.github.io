// Recorrido en 3D por las targetas: siguiente/anterior, rueda, teclado, arrastrar para mirar
// y deslizar en el móvil. Sin JS la página se ve igual, apilada.
(() => {
  // copiar prompts (también en la portada)
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = document.getElementById(btn.dataset.copy).textContent;
      try { await navigator.clipboard.writeText(text); }
      catch {
        const t = document.createElement("textarea"); t.value = text; t.setAttribute("readonly", "");
        t.style.position = "fixed"; t.style.opacity = "0"; document.body.appendChild(t);
        t.select(); document.execCommand("copy"); t.remove();
      }
      const old = btn.dataset.label || btn.textContent;
      btn.dataset.label = old; btn.classList.add("done"); btn.textContent = "Copied";
      setTimeout(() => { btn.classList.remove("done"); btn.textContent = old; }, 1800);
    });
  });
  document.querySelectorAll("[data-sound]").forEach((btn) => {
    const v = document.getElementById(btn.dataset.sound);
    btn.addEventListener("click", () => {
      v.muted = !v.muted; if (!v.muted) v.play().catch(() => {});
      btn.textContent = v.muted ? "Sound on" : "Sound off";
    });
  });

  const stage = document.getElementById("stage");
  const cam = document.getElementById("cam");
  if (!cam || !cam.querySelector(".stop")) return;
  document.documentElement.classList.add("fly");
  // el escenario no se desplaza nunca: al enfocar o tocar algo cerca del borde de una targeta, el
  // navegador lo desplazaba para "enseñarlo" (mide la caja sin la transformación 3D) y la targeta subía
  stage.addEventListener("scroll", () => { if (stage.scrollTop || stage.scrollLeft) { stage.scrollTop = 0; stage.scrollLeft = 0; } });

  const P = 1300; // perspectiva, igual que en el CSS
  const stops = [...cam.querySelectorAll(".stop")];
  const rail = [...document.querySelectorAll("#rail .dot")];
  const now = document.getElementById("now");
  const count = document.getElementById("count");
  const bar = document.querySelector("#bar i");
  const prev = document.getElementById("prev");
  const next = document.getElementById("next");
  const phone = matchMedia("(max-width: 760px)");
  let views = [], i = 0, lx = 0, ly = 0;

  // trayectoria de la cámara: cada pieza puede elegir la suya en reel.json ("fly")
  //   drift — hacia la derecha y al fondo (la de por defecto)
  //   rise  — hacia arriba, como un cohete que sube
  //   sink  — hacia abajo, como una piedra que se hunde
  //   walk  — hacia delante por un camino, como quien anda
  //   wave  — a la derecha en ola, arriba y abajo, como una cortina de aurora
  //   dive  — en diagonal hacia abajo y al fondo, como quien se mete en una nube
  //   spiral — cae hacia abajo dando vueltas en espiral, como una zambullida desde las nubes
  //   meteor — cae en diagonal pronunciada, abajo y a la derecha, como un trozo de luna
  //   climb  — sube en zigzag por una pared, como un tentáculo por el casco de un barco
  //   ess    — baja trazando una S, como el chorro de trazadoras que dibuja un dólar en el cielo
  //   launch — sube cada vez más deprisa y se tumba hacia la izquierda, como un cohete en su giro
  //   sheet  — recorre una hoja de contactos: fila a fila, de izquierda a derecha y luego abajo
  //   track  — avanza en diagonal hacia arriba a la derecha, como una tormenta en el radar
  //   arc    — un cuarto de vuelta hacia la derecha alrededor de un punto, como la cámara que rodea a alguien
  //   slalom — baja haciendo eses anchas, de un lado a otro, como una tabla bajando por una ladera
  //   liftoff — la primera mitad avanza en llano hacia la derecha y la segunda sube en vertical, como un coche que despega
  //   swing — baja en arco y vuelve a subir hacia la derecha, como el asiento de un columpio de un extremo al otro
  //   bounce — avanza a la derecha botando, cada bote más bajo que el anterior, como una piedra de granizo en el asfalto
  //   loop — un rizo: sube, pasa por arriba hacia atrás y vuelve a bajar hacia la derecha, como una escoba haciendo una vuelta de campana
  //   orbit — un anillo: se aleja dando la vuelta y vuelve al punto de partida, como quien rodea un coche
  const modo = document.documentElement.dataset.fly || "drift";
  // ess: la x sigue una S de arriba abajo a lo largo de todo el recorrido
  const nSueltas = stops.reduce((a, s) => a + [...s.children].filter((c) => c.classList.contains("slab")).length, 0);
  const ese = (k, n) => (n > 1 ? k / (n - 1) : 0) * 2 * Math.PI;
  // arc: un cuarto de círculo a lo largo de todo el recorrido, con el radio justo para que las paradas
  // queden a "paso" px unas de otras
  const cuarto = (k, n, paso) => { const R = Math.max(1, n - 1) * paso / (Math.PI / 2), a = (n > 1 ? k / (n - 1) : 0) * Math.PI / 2; return [R * Math.sin(a), -k * 90, R * Math.cos(a) - R]; };
  // liftoff: la mitad del recorrido por la carretera y la otra mitad hacia arriba
  const despega = (k, n, px, py) => { const h = Math.floor((n - 1) / 2); return k <= h ? [k * px, 0, -k * 150] : [h * px, -(k - h) * py, -h * 150 - (k - h) * 120]; };
  // swing: un arco en U, abajo en el centro del recorrido y arriba en los dos extremos; u va de -1 a 1
  const columpio = (k, n, px, hondo) => { const u = n > 1 ? 2 * k / (n - 1) - 1 : 0; return [k * px, hondo * (1 - u * u), -k * 160, u]; };
  // bounce: las paradas pares en lo alto de cada bote y las impares en el suelo; cada bote, un 28 % más bajo
  const bote = (k, px, alto) => [k * px, k % 2 ? 0 : -alto * Math.pow(.72, k / 2), 0];
  // loop: un tramo recto, un rizo completo que avanza un poco a la derecha y otro tramo recto; las paradas
  // se reparten a la misma distancia a lo largo del camino (en unidades del radio del rizo, escaladas a px)
  const rizo = (k, n, esc) => {
    const a = 1.2, d = 1.2, N = 480, pts = [[0, 0, 0]];
    const punto = (t) => {
      if (t < .2) return [a * t / .2, 0];
      if (t > .8) return [a + d + a * (t - .8) / .2, 0];
      const u = (t - .2) / .6, th = -Math.PI / 2 + u * 2 * Math.PI;
      return [a + Math.cos(th) + d * u, 1 + Math.sin(th)];
    };
    let L = 0, prev = punto(0);
    for (let i = 1; i <= N; i++) { const q = punto(i / N); L += Math.hypot(q[0] - prev[0], q[1] - prev[1]); pts.push([q[0], q[1], L]); prev = q; }
    const meta = (n > 1 ? k / (n - 1) : 0) * L;
    let i = 1; while (i < N && pts[i][2] < meta) i++;
    const p0 = pts[i - 1], p1 = pts[i], f = p1[2] > p0[2] ? (meta - p0[2]) / (p1[2] - p0[2]) : 0;
    const x = p0[0] + (p1[0] - p0[0]) * f, y = p0[1] + (p1[1] - p0[1]) * f;
    return [x * esc, -y * esc, Math.atan2(p1[1] - p0[1], p1[0] - p0[0])];
  };
  const parada = (si) => modo === "loop"
    ? ((r) => [r[0], r[1], -si * 220])(rizo(si, stops.length, 900))
    : modo === "bounce"
    ? ((b) => [b[0], b[1], -si * 300])(bote(si, 1250, 900))
    : modo === "swing"
    ? columpio(si, stops.length, 1350, 1300).slice(0, 3)
    : modo === "liftoff"
    ? despega(si, stops.length, 1400, 1150)
    : modo === "slalom"
    ? [si % 2 ? 560 : -560, si * 820, -si * 260]
    : modo === "arc"
    ? cuarto(si, stops.length, 1500)
    : modo === "track"
    ? [si * 1250, -si * 620 + Math.sin(si * 1.7) * 160, -si * 340]
    : modo === "sheet"
    ? [(si % 3) * 1450, Math.floor(si / 3) * 1150, -(si % 3) * 60]
    : modo === "launch"
    ? [-si * si * 160, -(si * 1000 + si * si * 120), -si * 220]
    : modo === "ess"
    ? [-Math.sin(ese(si, stops.length)) * 900, si * 1050, -si * 300]
    : modo === "rise"
    ? [si % 2 ? 160 : -160, -si * 1150, -si * 260]
    : modo === "sink"
    ? [si % 2 ? -140 : 140, si * 1150, -si * 240]
    : modo === "walk"
    ? [si % 2 ? 90 : -90, si % 2 ? -30 : 30, -si * 1500]
    : modo === "wave"
    ? [si * 1350, si % 2 ? -380 : 380, -si * 420]
    : modo === "dive"
    ? [si % 2 ? -70 : 70, si * 950, -si * 900]
    : modo === "spiral"
    ? [Math.sin(si * 1.3) * 420, si * 1300, -si * 260 - Math.cos(si * 1.3) * 200]
    : modo === "meteor"
    ? [si * 760, si * 1150, -si * 480]
    : modo === "climb"
    ? [si % 2 ? -420 : 420, -si * 880, -si * 90]
    : [si * 1500, si % 2 ? -150 : 130, -si * 640];
  const suelta = (g) => modo === "loop"
    ? ((r) => [r[0], r[1], -g * 160, Math.sin(r[2]) * 6])(rizo(g, nSueltas, 640))
    : modo === "bounce"
    ? ((b) => [b[0], b[1], -g * 180, g % 2 ? 3 : -3])(bote(g, 520, 420))
    : modo === "swing"
    ? ((c) => [c[0], c[1], c[2], -c[3] * 6])(columpio(g, nSueltas, 540, 900))
    : modo === "liftoff"
    ? [...despega(g, nSueltas, 560, 820), 0]
    : modo === "slalom"
    ? [g % 2 ? 230 : -230, g * 700, -g * 200, g % 2 ? -6 : 6]
    : modo === "arc"
    ? [...cuarto(g, nSueltas, 560), -3]
    : modo === "track"
    ? [g * 520, -g * 420 + Math.sin(g * 1.7) * 90, -g * 220, g % 2 ? 4 : -4]
    : modo === "sheet"
    ? [(g % 3) * 560, Math.floor(g / 3) * 940, 0, 0]
    : modo === "launch"
    ? [-g * g * 26, -(g * 720 + g * g * 30), -g * 160, g % 2 ? 3 : -3]
    : modo === "ess"
    ? [-Math.sin(ese(g, nSueltas)) * 380, g * 820, -g * 240, -Math.cos(ese(g, nSueltas)) * 5]
    : modo === "rise"
    ? [g % 2 ? 70 : -70, -g * 950, -g * 220, g % 2 ? 4 : -4]
    : modo === "sink"
    ? [g % 2 ? -60 : 60, g * 950, -g * 200, g % 2 ? -3 : 3]
    : modo === "walk"
    ? [g % 2 ? 40 : -40, g % 2 ? -20 : 20, -g * 1300, 0]
    : modo === "wave"
    ? [g * 760, g % 2 ? -260 : 260, -g * 380, g % 2 ? 7 : -7]
    : modo === "dive"
    ? [g % 2 ? -40 : 40, g * 820, -g * 700, g % 2 ? 3 : -3]
    : modo === "spiral"
    ? [Math.sin(g * 1.1) * 220, g * 1000, -g * 200, Math.sin(g * 1.1) * 6]
    : modo === "meteor"
    ? [g * 460, g * 820, -g * 320, 4]
    : modo === "climb"
    ? [g % 2 ? -60 : 60, -g * 760, -g * 80, g % 2 ? 4 : -4]
    : [g * 900, g % 2 ? -110 : 110, -g * 480, g % 2 ? 6 : -6];

  // orbit: las paradas en un anillo visto desde arriba; la cámara solo se traslada (girarla junto con
  // traslaciones grandes se dibuja mal en Chrome con un devicePixelRatio no entero)
  const orbita = modo === "orbit";
  const anillo = (k, n, R) => { const a = k / n * 2 * Math.PI; return [R * Math.sin(a), Math.sin(a * 2) * 60, R * Math.cos(a) - R]; };

  // la cámara no se traslada: se trasladan las paradas (escritorio) o las targetas (móvil), y la que
  // está delante queda siempre cerca del origen. Con la cámara a miles de px en Z, Chrome dibuja bien
  // pero calcula mal los toques y los botones de las targetas de más adelante dejan de responder.
  let movers = [];

  function layout() {
    views = []; movers = [];
    const W = innerWidth;
    let g = 0;
    const sueltas = stops.reduce((a, s) => a + [...s.children].filter((c) => c.classList.contains("slab")).length, 0);
    stops.forEach((s, si) => {
      const slabs = [...s.children].filter((c) => c.classList.contains("slab"));
      if (!phone.matches) {
        const [sx, sy, sz] = orbita ? anillo(si, stops.length, 1700) : parada(si);
        s._b = [sx, sy, sz]; s._ry = undefined; movers.push(s);
        slabs.forEach((el) => { el._z = sz; });
        const gap = 44;
        const widths = slabs.map((el) => el.offsetWidth);
        const total = widths.reduce((a, b) => a + b, 0) + gap * (slabs.length - 1);
        let x = -total / 2;
        const mid = (slabs.length - 1) / 2;
        slabs.forEach((el, k) => {
          const cx = x + widths[k] / 2; x += widths[k] + gap;
          const ry = (mid - k) * 8, z = 0, y = k % 2 ? 22 : 0;
          el.style.transform = `translate(-50%, -50%) translate3d(${cx}px, ${y}px, ${z}px) rotateY(${ry}deg)`;
        });
        // si la fila no cabe, la cámara se aleja lo justo
        const scale = Math.min(1, (W - 300) / total); // deja sitio al rail de la derecha
        const back = P / scale - P;
        views.push({ x: sx, y: sy, z: sz + back, stop: si, els: slabs });
      } else {
        s.style.transform = "none";
        slabs.forEach((el) => {
          const [x, y, z, ry] = orbita ? [...anillo(g, sueltas, Math.max(1100, sueltas * 110)), 0] : suelta(g);
          el._b = [x, y, z]; el._ry = ry; movers.push(el);
          el._z = z;
          views.push({ x, y, z, stop: si, els: [el] });
          g++;
        });
      }
    });
    rail.forEach((d, k) => { d.onclick = () => go(views.findIndex((v) => v.stop === k)); });
    go(Math.min(i, views.length - 1), true);
  }

  // mirar alrededor (arrastrar con el ratón): solo gira la cámara
  function mira(instant) {
    if (instant) cam.style.transition = "none";
    cam.style.transform = `rotateX(${ly}deg) rotateY(${lx}deg)`;
    if (instant) { cam.offsetWidth; cam.style.transition = ""; }
  }

  function aim(instant) {
    const v = views[i];
    if (instant) movers.forEach((el) => { el.style.transition = "none"; });
    mira(instant);
    for (const el of movers) {
      const [x, y, z] = el._b;
      el.style.transform = el._ry === undefined
        ? `translate3d(${x - v.x}px, ${y - v.y}px, ${z - v.z}px)`
        : `translate(-50%, -50%) translate3d(${x - v.x}px, ${y - v.y}px, ${z - v.z}px) rotateY(${el._ry}deg)`;
    }
    if (instant) { cam.offsetWidth; movers.forEach((el) => { el.style.transition = ""; }); }
  }

  function go(n, instant) {
    i = Math.max(0, Math.min(views.length - 1, n));
    const v = views[i];
    aim(instant);
    cam.querySelectorAll(".slab").forEach((el) => {
      const on = v.els.includes(el);
      el.classList.toggle("on", on);
      el.inert = !on;
      // en el anillo, lo que queda a la espalda de la cámara no se pinta: Chrome lo proyecta del revés y se come los toques
      if (orbita) el.style.visibility = (el._z ?? 0) - v.z > P * .8 ? "hidden" : "";
    });
    rail.forEach((d, k) => d.classList.toggle("on", k === v.stop));
    now.textContent = stops[v.stop].dataset.label || "";
    count.textContent = `${i + 1} / ${views.length}`;
    bar.style.width = `${((i + 1) / views.length) * 100}%`;
    prev.disabled = i === 0;
    next.disabled = i === views.length - 1;
    cam.querySelectorAll("video").forEach((vid) => {
      if (v.els.some((el) => el.contains(vid))) vid.play().catch(() => {}); else vid.pause();
    });
    history.replaceState(null, "", `#${i + 1}`);
    // cada pieza puede reaccionar al vuelo en su theme.js
    dispatchEvent(new CustomEvent("flyview", { detail: { index: i, total: views.length, els: v.els, dir: Math.sign(i - (go.last ?? i)) } }));
    go.last = i;
  }

  prev.addEventListener("click", () => go(i - 1));
  next.addEventListener("click", () => go(i + 1));

  addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea")) return;
    const k = e.key;
    if (["ArrowRight", "ArrowDown", "PageDown"].includes(k) || (k === " " && !e.target.closest("button"))) { e.preventDefault(); go(i + 1); }
    else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(k)) { e.preventDefault(); go(i - 1); }
    else if (k === "Home") go(0);
    else if (k === "End") go(views.length - 1);
  });

  // rueda: vuela, salvo encima de algo que todavía puede hacer scroll en esa dirección
  const canScroll = (el, dy) => {
    for (; el && el !== stage; el = el.parentElement) {
      if (el.scrollHeight > el.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(el).overflowY)) {
        if (dy > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
        if (dy < 0 && el.scrollTop > 0) return true;
      }
    }
    return false;
  };
  let lock = 0, acc = 0;
  addEventListener("wheel", (e) => {
    if (canScroll(e.target, e.deltaY)) return;
    e.preventDefault();
    const t = Date.now();
    if (t < lock) return;
    acc += e.deltaY;
    if (Math.abs(acc) > 40) { go(i + Math.sign(acc)); acc = 0; lock = t + 950; }
  }, { passive: false });

  // arrastrar para mirar (ratón) y deslizar o tocar para volar (dedo)
  let start = null;
  stage.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button, a, .code, video, [data-nofly]")) return;
    start = { x: e.clientX, y: e.clientY, t: Date.now(), touch: e.pointerType !== "mouse", inSlab: !!e.target.closest(".slab") };
    if (!start.touch && !start.inSlab) { stage.classList.add("dragging"); stage.setPointerCapture(e.pointerId); }
  });
  stage.addEventListener("pointermove", (e) => {
    if (!start || start.touch || start.inSlab) return;
    lx = Math.max(-12, Math.min(12, (e.clientX - start.x) / 18));
    ly = Math.max(-7, Math.min(7, -(e.clientY - start.y) / 26));
    mira(true);
  });
  const end = (e) => {
    if (!start) return;
    const dx = e.clientX - start.x, dy = e.clientY - start.y;
    if (start.touch) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) > 45) go(i + ((Math.abs(dx) > Math.abs(dy) ? dx : dy) < 0 ? 1 : -1));
      else if (!start.inSlab && Date.now() - start.t < 400) go(i + 1);
    } else if (!start.inSlab) {
      lx = 0; ly = 0; mira(false);
    }
    stage.classList.remove("dragging");
    start = null;
  };
  stage.addEventListener("pointerup", end);
  stage.addEventListener("pointercancel", end);

  let rt;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(layout, 150); });
  const fromHash = parseInt(location.hash.slice(1), 10);
  if (fromHash > 0) i = fromHash - 1;
  // esperar a las fuentes: el ancho de las targetas depende de ellas
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(layout);
  // en el siguiente frame: así el theme.js de la pieza ya escucha el primer "flyview"
  requestAnimationFrame(() => layout());
})();
