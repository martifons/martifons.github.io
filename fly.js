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
  //   orbit — un anillo: se aleja dando la vuelta y vuelve al punto de partida, como quien rodea un coche
  const modo = document.documentElement.dataset.fly || "drift";
  const parada = (si) => modo === "rise"
    ? [si % 2 ? 160 : -160, -si * 1150, -si * 260]
    : modo === "sink"
    ? [si % 2 ? -140 : 140, si * 1150, -si * 240]
    : modo === "walk"
    ? [si % 2 ? 90 : -90, si % 2 ? -30 : 30, -si * 1500]
    : modo === "wave"
    ? [si * 1350, si % 2 ? -380 : 380, -si * 420]
    : [si * 1500, si % 2 ? -150 : 130, -si * 640];
  const suelta = (g) => modo === "rise"
    ? [g % 2 ? 70 : -70, -g * 950, -g * 220, g % 2 ? 4 : -4]
    : modo === "sink"
    ? [g % 2 ? -60 : 60, g * 950, -g * 200, g % 2 ? -3 : 3]
    : modo === "walk"
    ? [g % 2 ? 40 : -40, g % 2 ? -20 : 20, -g * 1300, 0]
    : modo === "wave"
    ? [g * 760, g % 2 ? -260 : 260, -g * 380, g % 2 ? 7 : -7]
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
