// REVIEW (reel93) — the editor's light table. The real strip of the failed clip runs under a playhead as you advance;
// a red pencil circles wherever you tap; each prompt has a lid: spot the four real mistakes, drag v1/v2, or stamp it.
(() => {
  const vibra = (ms) => { try { navigator.vibrate && navigator.vibrate(ms); } catch {} };

  // ---------- the table ----------
  const mesa = document.createElement("div");
  mesa.id = "table"; mesa.setAttribute("aria-hidden", "true");
  mesa.innerHTML = `<div class="film"><i style="background-image:url(strip.jpg)"></i></div><div class="head"></div><svg class="pen"></svg>`;
  document.body.prepend(mesa);
  const film = mesa.querySelector(".film"), pen = mesa.querySelector("svg.pen");
  const avanza = (i, n) => { film.style.transform = `translateX(${-(i / Math.max(1, n - 1)) * 62 - 4}%)`; };
  avanza(0, 2);
  addEventListener("flyview", (e) => avanza(e.detail.index, e.detail.total));

  // a loose hand-drawn ellipse, in the coordinates it is given
  const trazo = (cx, cy, rx, ry) => {
    const s = Math.random() * 6.28;
    let d = "";
    for (let i = 0; i <= 44; i++) {
      const a = -2 + (i / 44) * 6.28 * 1.07;
      const r = 1 + Math.sin(a * 3 + s) * .035 + (i / 44) * .05;
      d += `${i ? "L" : "M"}${(cx + Math.cos(a) * rx * r).toFixed(1)} ${(cy + Math.sin(a) * ry * r).toFixed(1)} `;
    }
    return d;
  };
  addEventListener("pointerdown", (e) => {
    if (e.target.closest && e.target.closest(".slab, button, a, nav")) return;
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", trazo(e.clientX, e.clientY, 34 + Math.random() * 16, 24 + Math.random() * 14));
    p.setAttribute("pathLength", "1");
    pen.append(p);
    while (pen.children.length > 14) pen.firstChild.remove();
    vibra(6);
  });

  // ---------- the lids ----------
  const cajas = [...document.querySelectorAll(".slab .code")].map((pre) => {
    const box = document.createElement("div");
    box.className = "lidbox"; box.dataset.nofly = "";
    pre.before(box); box.append(pre);
    return box;
  });
  const abre = (box) => { box.classList.add("open"); vibra(18); };
  const frena = (el) => ["touchstart", "touchmove", "mousedown", "wheel"].forEach((t) => el.addEventListener(t, (e) => e.stopPropagation(), { passive: true }));

  // 1. spot the mistake. Hot spots measured on the real frames, as fractions of the crop.
  const FALLOS = [
    { src: "m1.jpg", q: "Where does the water land?", x: .2, y: .52, r: .2, t: "0:02", a: "behind the tail" },
    { src: "m2.jpg", q: "Find the water that comes from nowhere.", x: .89, y: .49, r: .15, t: "0:06", a: "no trunk, no source" },
    { src: "m3.jpg", q: "The dog should be shaking. What isn't moving?", x: .39, y: .5, r: .32, t: "0:06", a: "only its head moves" },
    { src: "m4.jpg", q: "The line is where the trough ended at 0:05. What moved?", x: .45, y: .5, r: .34, t: "0:10", a: "the frame slid 12%", line: .367 },
  ];
  const juego = (box) => {
    const lid = document.createElement("div");
    lid.className = "lid";
    lid.innerHTML = `<div class="q"><small></small><span></span></div><div class="pic"><img alt=""><svg viewBox="0 0 400 300"></svg></div><div class="ticks">${FALLOS.map(() => "<i></i>").join("")}<button class="skip" type="button">Skip it</button></div><p class="tip">Tap the spot on the picture. Find all four and the prompt opens.</p>`;
    box.append(lid);
    frena(lid);
    const pic = lid.querySelector(".pic"), img = pic.querySelector("img"), svg = pic.querySelector("svg");
    const small = lid.querySelector("small"), texto = lid.querySelector(".q span"), ticks = lid.querySelectorAll(".ticks i");
    let i = 0, fallos = 0, bloqueado = false;
    const carga = () => {
      const f = FALLOS[i];
      img.src = f.src;
      small.textContent = `Mistake ${i + 1} of 4`;
      texto.textContent = f.q;
      svg.innerHTML = f.line ? `<line x1="${f.line * 400}" x2="${f.line * 400}" y1="0" y2="300" stroke="#FF2A1F" stroke-width="4" stroke-dasharray="12 9"/>` : "";
      pic.querySelectorAll(".ans,.hint").forEach((x) => x.remove());
      fallos = 0; bloqueado = false;
    };
    carga();
    pic.addEventListener("click", (e) => {
      if (bloqueado) return;
      const f = FALLOS[i], r = pic.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      const dx = x - f.x, dy = (y - f.y) * .75; // the crop is 4:3
      if (Math.hypot(dx, dy) > f.r) {
        const m = document.createElement("div");
        m.className = "miss"; m.textContent = "×"; m.style.left = x * 100 + "%"; m.style.top = y * 100 + "%";
        pic.append(m); setTimeout(() => m.remove(), 700);
        vibra(8);
        if (++fallos === 2) {
          const h = document.createElement("div");
          h.className = "hint";
          const w = f.r * 100;
          h.style.cssText = `left:${(f.x - f.r) * 100}%;top:${f.y * 100 - w * 4 / 3}%;width:${w * 2}%;aspect-ratio:1`;
          pic.append(h);
        }
        return;
      }
      bloqueado = true;
      pic.querySelectorAll(".hint").forEach((h) => h.remove());
      const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p.setAttribute("d", trazo(f.x * 400, f.y * 300, Math.max(38, f.r * 400 * .75), Math.max(38, f.r * 300 * .75)));
      p.setAttribute("pathLength", "1"); p.setAttribute("class", "ring");
      svg.append(p);
      pic.insertAdjacentHTML("beforeend", `<div class="ans"><b>${f.t}</b>${f.a}</div>`);
      ticks[i].classList.add("on");
      vibra(22);
      setTimeout(() => {
        i++;
        if (i < FALLOS.length) carga();
        else abre(box);
      }, 1100);
    });
    lid.querySelector(".skip").addEventListener("click", () => abre(box));
  };

  // 2. before / after, dragged
  const antesDespues = (box) => {
    const lid = document.createElement("div");
    lid.className = "lid ba";
    lid.innerHTML = `<div class="q"><small>Same photo, new prompt</small><span>Drag to fix the water.</span></div><div class="pic"><img src="after.jpg" alt="Version two: the water lands on the dog"><img class="top" src="before.jpg" alt="Version one: the water misses the dog"><span class="tag l">v2</span><span class="tag r">v1</span><div class="bar"></div></div><div class="ticks"><button class="skip" type="button">Skip it</button></div><p class="tip">Left of the handle, the new prompt: the water reaches the dog. Drag it all the way and the prompt opens.</p>`;
    box.append(lid);
    frena(lid);
    const pic = lid.querySelector(".pic");
    let cogido = false, listo = false;
    const pon = (e) => {
      const r = pic.getBoundingClientRect();
      const u = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      pic.style.setProperty("--x", u * 100 + "%");
      if (u > .32) lid.classList.add("moved");
      if (u > .85 && !listo) { listo = true; cogido = false; setTimeout(() => abre(box), 500); }
    };
    pic.addEventListener("pointerdown", (e) => { cogido = true; try { pic.setPointerCapture(e.pointerId); } catch {} e.stopPropagation(); pon(e); });
    pic.addEventListener("pointermove", (e) => { if (cogido) { e.stopPropagation(); pon(e); } });
    addEventListener("pointerup", () => { cogido = false; });
    lid.querySelector(".skip").addEventListener("click", () => abre(box));
  };

  // 3. the stamp
  const sello = (box) => {
    const lid = document.createElement("div");
    lid.className = "lid st";
    lid.innerHTML = `<div class="q"><small>The guy talking isn't real</small><span>Stamp him.</span></div><button class="pad" type="button">Tap to stamp</button>`;
    box.append(lid);
    frena(lid);
    const pad = lid.querySelector(".pad");
    pad.addEventListener("click", () => {
      if (pad.querySelector(".stampmark")) return;
      pad.insertAdjacentHTML("beforeend", `<span class="stampmark">100% AI</span>`);
      vibra(40);
      setTimeout(() => abre(box), 650);
    });
  };
  if (cajas[0]) juego(cajas[0]);
  if (cajas[1]) antesDespues(cajas[1]);
  if (cajas[2]) sello(cajas[2]);

  // ---------- copying: a red tick, and the lid goes away ----------
  document.querySelectorAll(".cp[data-copy]").forEach((b) => b.addEventListener("click", () => {
    const box = b.closest(".slab")?.querySelector(".lidbox");
    if (box) box.classList.add("open");
    const r = b.getBoundingClientRect();
    const t = document.createElement("div");
    t.className = "ticked";
    t.style.left = r.left + r.width / 2 - 36 + "px"; t.style.top = r.top - 56 + "px";
    t.innerHTML = `<svg viewBox="0 0 72 62" width="72" height="62"><path pathLength="1" d="M8 34 L27 54 L66 8"/></svg>`;
    document.body.append(t);
    setTimeout(() => t.remove(), 1000);
    vibra(12);
  }));
})();
