/* AUTONOMAX — particle morph: dots rearrange between geometric shapes (no fade) */
(function () {
  var canvas = document.getElementById("om-morph");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var SIZE = 1280, C = SIZE / 2;
  canvas.width = SIZE; canvas.height = SIZE;

  var COLOR = "199,155,255";             // #c79bff
  var N = 1900;
  var MORPH = 1400, HOLD = 3000, STAGGER = 420;
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function hash(i, s) { var x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); }

  /* ---------- point-cloud helpers (1280-space) ---------- */
  function fillRect(p, x, y, w, h, step) {
    step = step || 13;
    for (var yy = y; yy <= y + h; yy += step)
      for (var xx = x; xx <= x + w; xx += step) p.push([xx, yy]);
  }
  function line(p, x1, y1, x2, y2, step) {
    step = step || 12;
    var d = Math.hypot(x2 - x1, y2 - y1), n = Math.max(2, Math.round(d / step));
    for (var i = 0; i <= n; i++) {
      var t = i / n;
      p.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]);
      p.push([x1 + (x2 - x1) * t + 5, y1 + (y2 - y1) * t + 5]); // thicken
    }
  }
  function ring(p, cx, cy, r1, r2, step) {
    step = step || 12;
    for (var r = r1; r <= r2; r += step) {
      var n = Math.max(10, Math.round(2 * Math.PI * r / step));
      for (var i = 0; i < n; i++) {
        var a = i / n * 2 * Math.PI;
        p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
    }
  }
  function disk(p, cx, cy, r, step) { ring(p, cx, cy, 0, r, step || 11); }

  function sampleText(text, font) {
    var off = document.createElement("canvas");
    off.width = off.height = 640;
    var o = off.getContext("2d");
    o.textAlign = "center"; o.textBaseline = "middle"; o.fillStyle = "#fff";
    o.font = font;
    var w = o.measureText(text).width;
    if (w > 560) {
      var m = /(\d+)px/.exec(font);
      o.font = font.replace(m[1] + "px", Math.floor(m[1] * 560 / w) + "px");
    }
    o.fillText(text, 320, 330);
    var data = o.getImageData(0, 0, 640, 640).data;
    var pts = [], step = 5;
    for (var y = 4; y < 636; y += step)
      for (var x = 4; x < 636; x += step)
        if (data[(y * 640 + x) * 4 + 3] > 120) pts.push([x * 2, y * 2]);
    return pts;
  }

  /* ---------- shapes ---------- */
  function shapeChip() {
    var p = [];
    var S = 480, x0 = C - S / 2, y0 = C - S / 2, T = 26;
    fillRect(p, x0, y0, S, T); fillRect(p, x0, y0 + S - T, S, T);          // top/bottom edge
    fillRect(p, x0, y0, T, S); fillRect(p, x0 + S - T, y0, T, S);          // left/right edge
    ring(p, C, C, 96, 150, 13);                                            // core ring
    fillRect(p, C - 52, C - 52, 104, 104, 14);                             // core
    for (var i = 0; i < 8; i++) {                                          // pins
      var t = x0 + 38 + i * ((S - 76) / 7);
      line(p, t, y0 - 8, t, y0 - 72, 11); line(p, t, y0 + S + 8, t, y0 + S + 72, 11);
      line(p, x0 - 8, t, x0 - 72, t, 11); line(p, x0 + S + 8, t, x0 + S + 72, t, 11);
    }
    return p;
  }

  function shapeNetwork() {
    var p = [];
    var nodes = [[C, C]], R = 360;
    for (var i = 0; i < 8; i++) {
      var a = i / 8 * 2 * Math.PI - Math.PI / 2;
      var r = R * (0.78 + 0.3 * hash(i, 3));
      nodes.push([C + Math.cos(a) * r, C + Math.sin(a) * r]);
    }
    for (i = 1; i < nodes.length; i++) {
      line(p, nodes[0][0], nodes[0][1], nodes[i][0], nodes[i][1], 15);     // hub spokes
      var nb = 1 + (i % (nodes.length - 1));
      line(p, nodes[i][0], nodes[i][1], nodes[nb][0], nodes[nb][1], 17);   // outer links
    }
    disk(p, nodes[0][0], nodes[0][1], 66, 11);
    for (i = 1; i < nodes.length; i++) disk(p, nodes[i][0], nodes[i][1], 38 + 14 * hash(i, 9), 10);
    return p;
  }

  function shapeCoin() {
    var p = [];
    ring(p, C, C, 396, 450, 12);                                           // outer ring
    ring(p, C, C, 330, 352, 13);                                           // inner rim
    return p.concat(sampleText("$", "700 360px 'IBM Plex Mono', monospace"));
  }

  function shapeChart() {
    var p = [];
    var bx = C - 430, bw = 96, gap = 38, base = C + 330;
    var hs = [150, 235, 320, 430, 540];
    for (var i = 0; i < 5; i++)
      fillRect(p, bx + i * (bw + gap), base - hs[i], bw, hs[i], 13);
    fillRect(p, bx - 30, base + 18, 5 * bw + 4 * gap + 60, 16, 12);        // baseline
    var ax1 = bx - 10, ay1 = base - 210, ax2 = bx + 4 * (bw + gap) + bw + 6, ay2 = base - 640;
    line(p, ax1, ay1, ax2, ay2, 10); line(p, ax1 + 8, ay1 + 8, ax2 + 8, ay2 + 8, 10); // arrow shaft
    line(p, ax2, ay2, ax2 - 120, ay2 - 8, 10); line(p, ax2, ay2, ax2 + 6, ay2 + 124, 10); // head
    return p;
  }

  function shapeWordmark() { return sampleText("AUTONOMAX", "700 118px 'Doto', monospace"); }

  var SHAPES = [shapeNetwork, shapeChip, shapeCoin, shapeChart, shapeWordmark];

  /* ---------- particles ---------- */
  function targetsFrom(pts, salt) {
    var t = new Float32Array(N * 2);
    for (var i = 0; i < N; i++) {
      var p = pts[Math.floor(hash(i, salt) * pts.length)];
      t[i * 2] = p[0] + (hash(i, salt + 1) - 0.5) * 8;
      t[i * 2 + 1] = p[1] + (hash(i, salt + 2) - 0.5) * 8;
    }
    return t;
  }

  function build() {
    var out = [];
    for (var s = 0; s < SHAPES.length; s++) {
      var pts = SHAPES[s]();
      if (!pts || pts.length < 60) return null;
      out.push(targetsFrom(pts, s * 7 + 1));
    }
    return out;
  }

  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function start(shapes) {
    var cur = 0, next = 1, t0 = performance.now(), phase = "hold";
    var from = shapes[0], to = shapes[0];

    function frame(now) {
      var dt = now - t0;
      if (phase === "hold" && dt > HOLD && !reduced) {
        phase = "morph"; t0 = now; dt = 0;
        from = shapes[cur]; next = (cur + 1) % shapes.length; to = shapes[next];
      } else if (phase === "morph" && dt > MORPH + STAGGER) {
        phase = "hold"; t0 = now; dt = 0; cur = next;
      }
      ctx.clearRect(0, 0, SIZE, SIZE);
      for (var i = 0; i < N; i++) {
        var x, y, j = hash(i, 99);
        if (phase === "morph") {
          var pr = Math.min(1, Math.max(0, (dt - j * STAGGER) / MORPH));
          var e = ease(pr);
          var fx = from[i * 2], fy = from[i * 2 + 1];
          var tx = to[i * 2], ty = to[i * 2 + 1];
          var arc = Math.sin(pr * Math.PI) * (hash(i, 5) - 0.5) * 170;
          x = fx + (tx - fx) * e + arc * 0.6;
          y = fy + (ty - fy) * e + arc;
        } else {
          var tc = shapes[cur];
          x = tc[i * 2] + Math.sin(now * 0.0016 + i * 1.7) * 2.2;
          y = tc[i * 2 + 1] + Math.cos(now * 0.0013 + i * 2.3) * 2.2;
        }
        var sz = 4 + j * 3.5;
        ctx.globalAlpha = 0.55 + 0.45 * hash(i, 12);
        ctx.fillStyle = "rgb(" + COLOR + ")";
        ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz);
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function boot() {
    var shapes = build();
    if (shapes) start(shapes);
    else setTimeout(boot, 300);
  }
  if (document.fonts && document.fonts.ready) {
    Promise.all([
      document.fonts.load("700 118px 'Doto'"),
      document.fonts.load("700 360px 'IBM Plex Mono'")
    ]).then(function () { document.fonts.ready.then(boot); });
  } else boot();
})();
