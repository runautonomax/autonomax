/* AUTONOMAX — mini particle morph untuk kartu "The Stack" (market-protocol)
   Tiap canvas [data-mini-shape] : bentuk tema ↔ tulisan AUTONOMAX */
(function () {
  var boxes = document.querySelectorAll("canvas[data-mini-shape]");
  if (!boxes.length) return;
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  var SIZE = 560, C = SIZE / 2;
  var N = 650, MORPH = 1200, HOLD = 2600, STAGGER = 300;
  var COLOR = "244,86,29"; // #f4561d

  function hash(i, s) { var x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); }

  /* ---- point helpers (560-space) ---- */
  function fillRect(p, x, y, w, h, st) {
    st = st || 7;
    for (var yy = y; yy <= y + h; yy += st)
      for (var xx = x; xx <= x + w; xx += st) p.push([xx, yy]);
  }
  function line(p, x1, y1, x2, y2, st) {
    st = st || 6;
    var d = Math.hypot(x2 - x1, y2 - y1), n = Math.max(2, Math.round(d / st));
    for (var i = 0; i <= n; i++) {
      var t = i / n;
      p.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]);
      p.push([x1 + (x2 - x1) * t + 2.5, y1 + (y2 - y1) * t + 2.5]);
    }
  }
  function ring(p, cx, cy, r1, r2, st) {
    st = st || 6;
    for (var r = Math.max(r1, 1); r <= r2; r += st) {
      var n = Math.max(8, Math.round(2 * Math.PI * r / st));
      for (var i = 0; i < n; i++) {
        var a = i / n * 2 * Math.PI;
        p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
    }
  }
  function disk(p, cx, cy, r, st) { ring(p, cx, cy, 0, r, st || 5.5); }

  function sampleText(text, font) {
    var off = document.createElement("canvas");
    off.width = off.height = 560;
    var o = off.getContext("2d");
    o.textAlign = "center"; o.textBaseline = "middle"; o.fillStyle = "#fff";
    o.font = font;
    var w = o.measureText(text).width;
    if (w > 500) {
      var m = /(\d+)px/.exec(font);
      o.font = font.replace(m[1] + "px", Math.floor(m[1] * 500 / w) + "px");
    }
    o.fillText(text, 280, 285);
    var d = o.getImageData(0, 0, 560, 560).data;
    var pts = [], st = 4;
    for (var y = 3; y < 557; y += st)
      for (var x = 3; x < 557; x += st)
        if (d[(y * 560 + x) * 4 + 3] > 120) pts.push([x, y]);
    return pts;
  }

  /* ---- bentuk ---- */
  function shapeChip() {
    var p = [], S = 230, x0 = C - S / 2, y0 = C - S / 2, T = 14;
    fillRect(p, x0, y0, S, T); fillRect(p, x0, y0 + S - T, S, T);
    fillRect(p, x0, y0, T, S); fillRect(p, x0 + S - T, y0, T, S);
    ring(p, C, C, 44, 70, 7);
    fillRect(p, C - 25, C - 25, 50, 50, 8);
    for (var i = 0; i < 6; i++) {
      var t = x0 + 22 + i * ((S - 44) / 5);
      line(p, t, y0 - 6, t, y0 - 38, 6); line(p, t, y0 + S + 6, t, y0 + S + 38, 6);
      line(p, x0 - 6, t, x0 - 38, t, 6); line(p, x0 + S + 6, t, x0 + S + 38, t, 6);
    }
    return p;
  }
  function shapeNetwork() {
    var p = [], nodes = [[C, C]], R = 170;
    for (var i = 0; i < 7; i++) {
      var a = i / 7 * 2 * Math.PI - Math.PI / 2;
      var r = R * (0.75 + 0.3 * hash(i, 3));
      nodes.push([C + Math.cos(a) * r, C + Math.sin(a) * r]);
    }
    for (i = 1; i < nodes.length; i++) {
      line(p, nodes[0][0], nodes[0][1], nodes[i][0], nodes[i][1], 8);
      var nb = 1 + (i % (nodes.length - 1));
      line(p, nodes[i][0], nodes[i][1], nodes[nb][0], nodes[nb][1], 9);
    }
    disk(p, C, C, 30, 6);
    for (i = 1; i < nodes.length; i++) disk(p, nodes[i][0], nodes[i][1], 17 + 7 * hash(i, 9), 5.5);
    return p;
  }
  function shapeCoin() {
    var p = [];
    ring(p, C, C, 178, 205, 6);
    ring(p, C, C, 148, 158, 7);
    return p.concat(sampleText("$", "700 170px 'IBM Plex Mono', monospace"));
  }
  function shapeChart() {
    var p = [], bx = C - 190, bw = 44, gap = 17, base = C + 150;
    var hs = [66, 104, 142, 190, 240];
    for (var i = 0; i < 5; i++) fillRect(p, bx + i * (bw + gap), base - hs[i], bw, hs[i], 7);
    fillRect(p, bx - 14, base + 9, 5 * bw + 4 * gap + 28, 8, 6);
    var ax1 = bx - 5, ay1 = base - 92, ax2 = bx + 4 * (bw + gap) + bw + 3, ay2 = base - 285;
    line(p, ax1, ay1, ax2, ay2, 5); line(p, ax1 + 4, ay1 + 4, ax2 + 4, ay2 + 4, 5);
    line(p, ax2, ay2, ax2 - 54, ay2 - 4, 5); line(p, ax2, ay2, ax2 + 3, ay2 + 55, 5);
    return p;
  }
  function shapeWordmark() { return sampleText("AUTONOMAX", "700 64px 'Doto', monospace"); }

  var GEN = { chip: shapeChip, network: shapeNetwork, coin: shapeCoin, chart: shapeChart };

  function targetsFrom(pts, salt) {
    var t = new Float32Array(N * 2);
    for (var i = 0; i < N; i++) {
      var p = pts[Math.floor(hash(i, salt) * pts.length)];
      t[i * 2] = p[0] + (hash(i, salt + 1) - 0.5) * 5;
      t[i * 2 + 1] = p[1] + (hash(i, salt + 2) - 0.5) * 5;
    }
    return t;
  }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function startBox(canvas, idx) {
    var key = canvas.getAttribute("data-mini-shape");
    var gen = GEN[key] || shapeChip;
    var pts = gen(), wm = shapeWordmark();
    if (pts.length < 40 || wm.length < 40) return false;
    canvas.width = SIZE; canvas.height = SIZE;
    var ctx = canvas.getContext("2d");
    var shapes = [targetsFrom(pts, 11 + idx), targetsFrom(wm, 77 + idx)];

    if (reduced) { // statis: bentuk tema saja
      var t0s = shapes[0];
      ctx.clearRect(0, 0, SIZE, SIZE);
      for (var i = 0; i < N; i++) {
        ctx.globalAlpha = 0.5 + 0.5 * hash(i, 12);
        ctx.fillStyle = "rgb(" + COLOR + ")";
        var sz = 2.2 + hash(i, 99) * 2;
        ctx.fillRect(t0s[i * 2] - sz / 2, t0s[i * 2 + 1] - sz / 2, sz, sz);
      }
      return true;
    }

    var cur = 0, nxt = 1, t0 = performance.now() - idx * 700, phase = "hold";
    var from = shapes[0], to = shapes[0];
    function frame(now) {
      var dt = now - t0;
      if (phase === "hold" && dt > HOLD) {
        phase = "morph"; t0 = now; dt = 0;
        from = shapes[cur]; nxt = (cur + 1) % 2; to = shapes[nxt];
      } else if (phase === "morph" && dt > MORPH + STAGGER) {
        phase = "hold"; t0 = now; dt = 0; cur = nxt;
      }
      ctx.clearRect(0, 0, SIZE, SIZE);
      for (var i = 0; i < N; i++) {
        var x, y, j = hash(i, 99);
        if (phase === "morph") {
          var pr = Math.min(1, Math.max(0, (dt - j * STAGGER) / MORPH));
          var e = ease(pr);
          var fx = from[i * 2], fy = from[i * 2 + 1];
          var tx = to[i * 2], ty = to[i * 2 + 1];
          var arc = Math.sin(pr * Math.PI) * (hash(i, 5) - 0.5) * 80;
          x = fx + (tx - fx) * e + arc * 0.6;
          y = fy + (ty - fy) * e + arc;
        } else {
          var tc = shapes[cur];
          x = tc[i * 2] + Math.sin(now * 0.0016 + i * 1.7) * 1.4;
          y = tc[i * 2 + 1] + Math.cos(now * 0.0013 + i * 2.3) * 1.4;
        }
        var sz = 2.2 + j * 2;
        ctx.globalAlpha = 0.5 + 0.5 * hash(i, 12);
        ctx.fillStyle = "rgb(" + COLOR + ")";
        ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz);
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return true;
  }

  function boot() {
    var ok = true;
    boxes.forEach ? null : 0;
    for (var i = 0; i < boxes.length; i++) {
      if (!startBox(boxes[i], i)) ok = false;
    }
    if (!ok) setTimeout(boot, 300); // tunggu webfont
  }
  if (document.fonts && document.fonts.ready) {
    Promise.all([
      document.fonts.load("700 64px 'Doto'"),
      document.fonts.load("700 170px 'IBM Plex Mono'")
    ]).then(function () { document.fonts.ready.then(boot); });
  } else boot();
})();
