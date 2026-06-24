/* =========================================================================
   ⚙️  AUTONOMAX — PANEL KONTROL TOKEN $ATNMX
   =========================================================================
   CUKUP ISI 2 BARIS DI BAWAH INI. Setelah diisi & file di-upload (timpa
   yang lama), SEMUA halaman website otomatis ikut berubah — kolom CA,
   tombol BUY, tombol Pump.fun / Axiom / Dexscreener / Jupiter, dll.
   Tidak perlu mengedit file HTML satu per satu.
   ========================================================================= */


/* ─────────────────────────────────────────────────────────────────────────
   1)  CA  (Contract Address coin kamu)
   ─────────────────────────────────────────────────────────────────────────
   Tempel CA di antara tanda kutip. Contoh:
        window.ATNMX_CA = "9xQyZf...pump";

   • Kosong ("")  → semua kolom CA menampilkan tanggal launch
                    (JUN 26 2026 · 5PM UTC) dan sudah bisa diklik untuk copy.
   • Sudah diisi  → semua kolom otomatis jadi CA, bisa diklik copy,
                    dan SEMUA tombol exchange mengarah ke coin kamu.            */

window.ATNMX_CA = "";            /* <<<<<<<<<< GANTI CA DI SINI */


/* ─────────────────────────────────────────────────────────────────────────
   2)  LINK TOMBOL BUY → PUMP.FUN  (opsional, manual)
   ─────────────────────────────────────────────────────────────────────────
   • Kosong ("")  → otomatis:
                    - sebelum CA diisi → tombol BUY ke https://pump.fun
                    - sesudah CA diisi → tombol BUY ke https://pump.fun/coin/<CA>
   • Diisi        → semua tombol BUY dipaksa ke link ini (abaikan CA).
                    Pakai ini kalau kamu sudah punya halaman pump.fun-nya.
        Contoh: window.ATNMX_PUMP_URL = "https://pump.fun/coin/9xQyZf...pump"; */

window.ATNMX_PUMP_URL = "";      /* <<<<<<<<<< (opsional) LINK PUMP.FUN MANUAL */


/* ========================================================================= */
/* ===============  JANGAN UBAH APA PUN DI BAWAH GARIS INI  ================= */
/* ========================================================================= */
(function () {
  var CA   = (window.ATNMX_CA || "").trim();
  var PUMP = (window.ATNMX_PUMP_URL || "").trim();
  var LIVE = !!CA;
  var SHORT = CA.length > 12 ? CA.slice(0, 4) + "…" + CA.slice(-4) : CA;
  var LINKS = {
    pumpfun:     "https://pump.fun/coin/" + CA,
    axiom:       "https://axiom.trade/t/" + CA,
    dexscreener: "https://dexscreener.com/solana/" + CA,
    jupiter:     "https://jup.ag/swap/SOL-" + CA
  };

  function setAll(sel, fn) {
    var els = document.querySelectorAll(sel);
    for (var i = 0; i < els.length; i++) fn(els[i]);
  }
  function openable(a, href) { a.href = href; a.target = "_blank"; a.rel = "noopener noreferrer"; }

  /* --- teks CA + label (hanya saat CA sudah diisi) --- */
  if (LIVE) {
    setAll("[data-ca]", function (el) { el.textContent = CA; });
    setAll("[data-ca-short]", function (el) { el.textContent = SHORT; });
    setAll("[data-ca-label]", function (el) { el.textContent = "AVAILABLE_ON"; });
    setAll("[data-ca-flip]", function (el) { el.textContent = "click_to_copy"; });
  }

  /* --- link tombol exchange --- */
  setAll("[data-ca-link]", function (a) {
    var k = a.getAttribute("data-ca-link");
    if (k === "pumpfun" && PUMP) { openable(a, PUMP); return; }   /* override manual */
    if (LIVE && LINKS[k]) { openable(a, LINKS[k]); }              /* otomatis dari CA */
  });

  /* --- klik untuk copy (jalan sebelum & sesudah launch) --- */
  function textToCopy(el) {
    if (LIVE) return CA;
    var inner = el.querySelector("[data-ca],[data-ca-short]");
    return (inner ? inner.textContent : el.textContent).trim();
  }
  function copyCA(el) {
    var value = textToCopy(el);
    function done() {
      var t = el.getAttribute("data-ca-feedback-target");
      var target = t ? el.querySelector(t) : (el.querySelector("[data-ca],[data-ca-short]") || el);
      var old = target.textContent;
      target.textContent = "COPIED ✓";
      setTimeout(function () { target.textContent = old; }, 1200);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(done, done);
    } else {
      var ta = document.createElement("textarea");
      ta.value = value; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta); done();
    }
  }
  setAll("[data-ca-copy]", function (el) {
    el.style.cursor = "pointer";
    el.title = LIVE ? "Klik untuk copy CA" : "Klik untuk copy";
    el.addEventListener("click", function (ev) {
      if (ev.target.closest("a")) return;
      copyCA(el);
    });
  });
})();
