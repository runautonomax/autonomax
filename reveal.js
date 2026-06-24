/* AUTONOMAX — entrance & scroll-reveal animations */
(function () {
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var SEL = [
    "main h1", "main h2", "main h3", "main p",
    "main .om-post", ".om-teamgrid .card", ".om-distcard", ".om-exgrid a",
    ".om-filters a", ".om-term", ".om-dist-row", ".om-ca",
    ".tm-grid a", ".tm-stack > div", ".tm-how > div", ".tm-stats > div",
    ".tm-card", ".tm-panel", ".tm-x402", ".tm-build", ".tm-pagehead h1",
    ".docs-table .row", ".docs-protos > div", ".docs-cmd",
    ".tm-dirtable tr", ".tm-contracts tr",
    "footer .font-title", "footer ul li"
  ].join(",");

  var els = [];
  document.querySelectorAll(SEL).forEach(function (el) {
    if (el.closest(".om-horse-el")) return;
    if (el.classList.contains("hero-load-flicker") || el.closest(".hero-load-flicker")) return;
    if (el.querySelector && el.querySelector("canvas")) return;
    el.classList.add(el.tagName === "TR" ? "rv-flat" : "rv");
    els.push(el);
  });
  if (!els.length) return;

  var pending = [];
  var flushTimer = null;
  function flush() {
    pending.sort(function (a, b) { return a.getBoundingClientRect().top - b.getBoundingClientRect().top; });
    pending.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i * 70, 560) + "ms";
      el.classList.add("rv-in");
    });
    pending = [];
    flushTimer = null;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      pending.push(en.target);
    });
    if (pending.length && !flushTimer) flushTimer = setTimeout(flush, 40);
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

  els.forEach(function (el) { io.observe(el); });
})();
