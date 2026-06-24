/* AUTONOMAX — terminal typewriter (token page) */
(function () {
  var term = document.querySelector(".om-term");
  var body = document.querySelector(".om-term-body");
  if (!term || !body) return;
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var lines = [].slice.call(body.children).map(function (el) {
    return {
      el: el,
      text: el.textContent,
      isCmd: el.classList.contains("cmd"),
      isFinal: !!el.querySelector(".om-cursor")
    };
  });

  var caret = document.createElement("span");
  caret.className = "om-cursor";

  lines.forEach(function (d) {
    if (d.isFinal) { d.el.style.visibility = "hidden"; return; }
    d.node = document.createTextNode("");
    d.el.textContent = "";
    d.el.appendChild(d.node);
    d.el.style.minHeight = "1.2em";
  });

  function typeLine(i) {
    if (i >= lines.length) return;
    var d = lines[i];
    if (d.isFinal) {
      if (caret.parentNode) caret.parentNode.removeChild(caret);
      d.el.style.visibility = "";
      return;
    }
    if (d.isCmd) {
      d.el.appendChild(caret);
      var k = 0;
      (function step() {
        d.node.nodeValue = d.text.slice(0, k);
        if (k <= d.text.length) {
          k++;
          setTimeout(step, 24 + Math.random() * 36);
        } else {
          setTimeout(function () { typeLine(i + 1); }, 240);
        }
      })();
    } else {
      setTimeout(function () {
        d.node.nodeValue = d.text;
        typeLine(i + 1);
      }, 160);
    }
  }

  var started = false;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting && !started) {
        started = true;
        io.disconnect();
        setTimeout(function () { typeLine(0); }, 350);
      }
    });
  }, { threshold: 0.3 });
  io.observe(term);
})();
