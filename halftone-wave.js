/* halftone-wave.js — animated halftone dot-field background (whole site)
   Tiny dots on a grid whose size + opacity ripple with travelling sine waves,
   so the entire background looks like a slow halftone "ocean".
   Theme-aware: dot colour comes from CSS var --halftone-dot ("r,g,b").
   Honours prefers-reduced-motion and pauses when the tab is hidden. */
(function () {
  'use strict';

  var media = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduce = media && media.matches;

  var canvas = document.createElement('canvas');
  canvas.id = 'om-halftone';
  canvas.setAttribute('aria-hidden', 'true');
  var s = canvas.style;
  s.position = 'fixed';
  s.left = '0'; s.top = '0';
  s.width = '100%'; s.height = '100%';
  s.zIndex = '-1';   /* behind normal-flow content, above the page background colour */
  s.pointerEvents = 'none';
  s.display = 'block';

  function mount() {
    if (!canvas.parentNode) document.body.insertBefore(canvas, document.body.firstChild);
  }
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);

  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  // ---- tunables ----
  var GAP = 15;          // grid spacing in CSS px (tiny halftone dots)
  var MIN = 0.9;         // smallest dot side (px) — halftone stays visible in troughs
  var MAX_SIZE = 2.9;    // largest dot side (px) at wave crest
  var A_BASE = 0.10;     // alpha at wave trough
  var SPEED = 0.012;     // wave travel speed

  function themeColor() {
    var raw = '';
    try { raw = getComputedStyle(document.body).getPropertyValue('--halftone-dot'); } catch (e) {}
    raw = (raw || '').trim();
    return raw || '199,155,255'; // default lilac
  }
  function themeMaxAlpha() {
    var raw = '';
    try { raw = getComputedStyle(document.body).getPropertyValue('--halftone-max'); } catch (e) {}
    raw = parseFloat(raw);
    return isNaN(raw) ? 0.42 : raw;
  }

  var color = '199,155,255', AMAX = 0.42;
  var W = 0, H = 0, cols = 0, rows = 0;

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(W / GAP) + 1;
    rows = Math.ceil(H / GAP) + 1;
  }

  function render(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgb(' + color + ')';
    var span = MAX_SIZE - MIN;
    var aspan = AMAX - A_BASE;
    for (var j = 0; j < rows; j++) {
      var y = j * GAP;
      var ny = y * 0.012;
      for (var i = 0; i < cols; i++) {
        var x = i * GAP;
        var nx = x * 0.012;
        // three travelling sines -> flowing interference (looks like waves)
        var w = Math.sin(nx + t) +
                Math.sin(ny * 0.85 - t * 0.7) +
                Math.sin((nx + ny) * 0.6 + t * 0.45);
        var n = (w + 3) / 6;            // 0..1 (flowing wave field)
        var size = MIN + n * span;
        ctx.globalAlpha = A_BASE + n * aspan;
        var h = size * 0.5;
        ctx.fillRect(x - h, y - h, size, size);
      }
    }
    ctx.globalAlpha = 1;
  }

  var t = 0, raf = 0, running = false;
  function loop() {
    t += SPEED;
    render(t);
    raf = requestAnimationFrame(loop);
  }
  function start() {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(loop);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function init() {
    color = themeColor();
    AMAX = themeMaxAlpha();
    resize();
    if (reduce) { render(0.7); return; }   // single static frame
    start();
  }

  if (document.body) init();
  else document.addEventListener('DOMContentLoaded', init);

  window.addEventListener('resize', function () {
    resize();
    if (reduce) render(0.7);
  }, { passive: true });

  document.addEventListener('visibilitychange', function () {
    if (reduce) return;
    if (document.hidden) stop(); else start();
  });

  // react if the user flips reduced-motion at runtime
  if (media && media.addEventListener) {
    media.addEventListener('change', function (e) {
      reduce = e.matches;
      if (reduce) { stop(); render(0.7); } else start();
    });
  }
})();
