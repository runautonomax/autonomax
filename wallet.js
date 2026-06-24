/* TaskForge — Phantom wallet login */
(function () {
  function provider() {
    var p = window.phantom && window.phantom.solana;
    if (p && p.isPhantom) return p;
    if (window.solana && window.solana.isPhantom) return window.solana;
    return null;
  }
  function short(a) { return a.slice(0, 4) + '…' + a.slice(-4); }
  function addr() {
    var p = provider();
    return p && p.publicKey ? p.publicKey.toString() : null;
  }

  var cwBtns = document.querySelectorAll('.tm-cw');
  var createBtn = document.querySelector('.tm-submit');

  function setUI(a) {
    cwBtns.forEach(function (b) {
      b.textContent = a ? short(a) : 'Connect Wallet';
      b.title = a ? a + ' — click to disconnect' : 'Login with Phantom';
    });
    if (createBtn) createBtn.textContent = a ? 'Create Task' : 'Connect Wallet to Create Task';
  }

  function connect() {
    var p = provider();
    if (!p) { window.open('https://phantom.app/', '_blank', 'noopener'); return; }
    p.connect().then(function (r) {
      localStorage.setItem('tf_wallet', '1');
      setUI(r.publicKey.toString());
    }).catch(function () { /* user dismissed */ });
  }

  function disconnect() {
    var p = provider();
    if (p) { try { p.disconnect(); } catch (e) {} }
    localStorage.removeItem('tf_wallet');
    setUI(null);
  }

  cwBtns.forEach(function (b) {
    b.addEventListener('click', function (ev) {
      ev.preventDefault();
      addr() ? disconnect() : connect();
    });
  });

  if (createBtn) {
    createBtn.addEventListener('click', function () {
      if (!addr()) { connect(); return; }
      var old = createBtn.textContent;
      createBtn.textContent = 'Task Submitted ✓';
      createBtn.disabled = true;
      setTimeout(function () { createBtn.textContent = old; createBtn.disabled = false; }, 2500);
    });
  }

  window.addEventListener('load', function () {
    var p = provider();
    if (!p) return;
    if (localStorage.getItem('tf_wallet')) {
      p.connect({ onlyIfTrusted: true })
        .then(function (r) { setUI(r.publicKey.toString()); })
        .catch(function () {});
    }
    if (p.on) {
      p.on('disconnect', function () { setUI(null); });
      p.on('accountChanged', function (pk) { setUI(pk ? pk.toString() : null); });
    }
  });
})();
