// ICE — nieve que se desvía al volar, prompts congelados que se rompen a golpecitos,
// esquirlas al copiar y reglas que se giran.
(() => {
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);

  // ---------- nieve ----------
  const cv = document.createElement("canvas");
  cv.id = "snow"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const cx = cv.getContext("2d");
  let W = 0, H = 0, dpr = 1, wind = 0;
  const copos = [];
  const tam = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr;
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
  };
  tam(); addEventListener("resize", tam);
  const N = quieto ? 0 : Math.round(Math.min(160, innerWidth / 8));
  for (let k = 0; k < N; k++) {
    const r = rnd(.5, 2.6);
    copos.push({ x: Math.random(), y: Math.random(), r, v: .00025 * r + rnd(0, .0004), f: rnd(0, 6.28), a: .25 + r / 4.5 });
  }
  let t0 = performance.now();
  const nieva = (t) => {
    const dt = Math.min(50, t - t0); t0 = t;
    cx.clearRect(0, 0, W, H);
    wind *= .94;
    for (const c of copos) {
      c.y += c.v * dt * .06; c.f += .002 * dt;
      c.x += (Math.sin(c.f) * .00012 + wind * c.r * .0009) * dt * .06;
      if (c.y > 1.02) { c.y = -.02; c.x = Math.random(); }
      if (c.x > 1.02) c.x = -.02; if (c.x < -.02) c.x = 1.02;
      cx.globalAlpha = c.a;
      cx.fillStyle = "#F3EEEB";
      cx.beginPath(); cx.arc(c.x * W, c.y * H, c.r * dpr, 0, 6.283); cx.fill();
    }
    requestAnimationFrame(nieva);
  };
  if (N) requestAnimationFrame(nieva);
  // al volar, la nieve se va hacia atrás como si la cámara la atravesara
  addEventListener("flyview", (e) => { wind = -(e.detail.dir || 0) * 9; });

  // ---------- esquirlas ----------
  const esquirlas = (x, y, n, { fuerza = 90, roja = false } = {}) => {
    if (quieto) return;
    for (let k = 0; k < n; k++) {
      const s = document.createElement("i");
      s.className = "chip" + (roja && k % 3 === 0 ? " red" : "");
      const ang = rnd(0, Math.PI * 2), d = rnd(.4, 1) * fuerza;
      s.style.left = x + "px"; s.style.top = y + "px";
      s.style.setProperty("--dx", Math.cos(ang) * d + "px");
      s.style.setProperty("--dy", Math.sin(ang) * d + rnd(20, 70) + "px");
      s.style.setProperty("--rot", rnd(-360, 360) + "deg");
      s.style.setProperty("--s", rnd(4, 10) + "px");
      s.style.setProperty("--dur", rnd(.6, 1.1) + "s");
      document.body.appendChild(s);
      s.addEventListener("animationend", () => s.remove());
    }
  };

  // ---------- prompts congelados ----------
  const NS = "http://www.w3.org/2000/svg";
  // grietas que salen del punto del golpe (coordenadas en % del bloque)
  const grietas = (svg, px, py, golpe) => {
    const ramas = 4 + golpe;
    for (let k = 0; k < ramas; k++) {
      const base = (k / ramas) * Math.PI * 2 + rnd(-.3, .3);
      let x = px, y = py, d = `M${x} ${y}`, len = 0;
      const pasos = 4 + Math.floor(rnd(0, 4)) + golpe * 2;
      for (let p = 0; p < pasos; p++) {
        const ang = base + rnd(-.45, .45), l = rnd(3, 9);
        const nx = x + Math.cos(ang) * l, ny = y + Math.sin(ang) * l * 1.6;
        len += Math.hypot(nx - x, ny - y) * 6; x = nx; y = ny; d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      const path = document.createElementNS(NS, "path");
      path.setAttribute("d", d);
      if (k % 2) path.setAttribute("class", "thin");
      path.style.setProperty("--len", Math.ceil(len) + 40);
      svg.appendChild(path);
    }
  };

  const romper = (ice, px = 50, py = 50) => {
    if (!ice.classList.contains("frozen")) return;
    ice.classList.remove("frozen");
    const cover = ice.querySelector(".ice-cover");
    const fondo = getComputedStyle(cover);
    // abanico de trozos desde el último golpe
    const borde = [];
    for (let k = 0; k <= 4; k++) borde.push([k * 25, 0]);
    for (let k = 1; k <= 4; k++) borde.push([100, k * 25]);
    for (let k = 3; k >= 0; k--) borde.push([k * 25, 100]);
    for (let k = 3; k >= 1; k--) borde.push([0, k * 25]);
    if (!quieto) {
      for (let k = 0; k < borde.length; k++) {
        const a = borde[k], b = borde[(k + 1) % borde.length];
        const s = document.createElement("div");
        s.className = "shard";
        s.style.background = fondo.background;
        s.style.clipPath = `polygon(${px}% ${py}%, ${a[0]}% ${a[1]}%, ${b[0]}% ${b[1]}%)`;
        const mx = (a[0] + b[0]) / 2 - px, my = (a[1] + b[1]) / 2 - py;
        s.style.setProperty("--dx", mx * rnd(1.2, 2.4) + "px");
        s.style.setProperty("--dy", rnd(160, 380) + "px");
        s.style.setProperty("--rot", rnd(-50, 50) + "deg");
        s.style.setProperty("--dur", rnd(.8, 1.3) + "s");
        ice.appendChild(s);
        s.addEventListener("animationend", () => s.remove());
      }
      const r = ice.getBoundingClientRect();
      esquirlas(r.left + (r.width * px) / 100, r.top + (r.height * py) / 100, 26, { fuerza: 160 });
    }
    cover.remove();
    ice.querySelector(".ice-hit")?.remove();
  };

  document.querySelectorAll(".code").forEach((code) => {
    const ice = document.createElement("div");
    ice.className = "ice frozen";
    code.replaceWith(ice);
    ice.appendChild(code);
    const cover = document.createElement("div");
    cover.className = "ice-cover"; cover.setAttribute("aria-hidden", "true");
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 100 100"); svg.setAttribute("preserveAspectRatio", "none");
    cover.appendChild(svg);
    const hint = document.createElement("span");
    hint.className = "ice-hint";
    hint.innerHTML = "Tap the ice <i><b></b><b></b><b></b></i>";
    cover.appendChild(hint);
    ice.appendChild(cover);
    const btn = document.createElement("button");
    btn.className = "ice-hit"; btn.type = "button";
    btn.setAttribute("aria-label", "Tap the ice to free the prompt (three taps)");
    ice.appendChild(btn);

    let golpes = 0;
    const golpe = (e) => {
      const r = ice.getBoundingClientRect();
      const px = e && e.clientX ? ((e.clientX - r.left) / r.width) * 100 : rnd(35, 65);
      const py = e && e.clientY ? ((e.clientY - r.top) / r.height) * 100 : rnd(35, 65);
      golpes++;
      ice.classList.remove("hit"); void ice.offsetWidth; ice.classList.add("hit");
      hint.querySelectorAll("b")[golpes - 1]?.classList.add("used");
      if (golpes < 3) {
        grietas(svg, px, py, golpes);
        esquirlas(r.left + (r.width * px) / 100, r.top + (r.height * py) / 100, 7 + golpes * 3, { fuerza: 60 });
      } else {
        grietas(svg, px, py, 3);
        setTimeout(() => romper(ice, px, py), quieto ? 0 : 140);
      }
    };
    btn.addEventListener("click", golpe);

    // copiar sin romper antes también libera el hielo
    const cp = ice.parentElement.querySelector(".cp");
    cp?.addEventListener("click", () => romper(ice));
  });

  // al copiar, revientan esquirlas desde el botón
  document.querySelectorAll(".cp[data-copy]").forEach((b) => {
    b.addEventListener("click", () => {
      const r = b.getBoundingClientRect();
      esquirlas(r.left + r.width / 2, r.top + r.height / 2, 22, { fuerza: 130, roja: true });
    });
  });

  // ---------- reglas que se giran ----------
  document.querySelectorAll(".slab.rule").forEach((slab, k) => {
    const [kick, h3, p] = [slab.querySelector(".k"), slab.querySelector("h3"), slab.querySelector("p:not(.k)")];
    const flip = document.createElement("button");
    flip.className = "flip"; flip.type = "button";
    flip.setAttribute("aria-label", `${kick.textContent}: ${h3.textContent}. Flip to read`);
    flip.innerHTML = `<div class="flip-in">
      <div class="face front"><p class="k">${kick.innerHTML}</p><div class="huge">${String(k + 1).padStart(2, "0")}</div><h3>${h3.innerHTML}</h3><span class="turn">Tap to flip</span></div>
      <div class="face back"><p class="k">${kick.innerHTML}</p><h3>${h3.innerHTML}</h3><p>${p.innerHTML}</p><span class="turn">Tap to flip back</span></div>
    </div>`;
    slab.replaceChildren(flip);
    flip.addEventListener("click", () => flip.classList.toggle("open"));
  });
  // las reglas se dan la vuelta solas, una detrás de otra, al llegar
  addEventListener("flyview", (e) => {
    const flips = e.detail.els.flatMap((el) => [...el.querySelectorAll(".flip")]);
    flips.forEach((f, k) => setTimeout(() => f.classList.add("open"), 700 + k * 260));
  });
})();
