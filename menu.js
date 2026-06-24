/* AUTONOMAX — header MORE dropdown */
(function () {
  var root = document.getElementById("om-more");
  if (!root) return;
  var btn = root.querySelector("button");
  var menu = root.querySelector(".om-menu");
  function close() { menu.hidden = true; btn.setAttribute("aria-expanded", "false"); }
  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    var open = menu.hidden;
    menu.hidden = !open ? true : false;
    if (open) { menu.hidden = false; }
    btn.setAttribute("aria-expanded", String(!menu.hidden));
  });
  document.addEventListener("click", function (e) { if (!root.contains(e.target)) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
})();
