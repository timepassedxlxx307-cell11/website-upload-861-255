(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");
  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-slider]").forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-slide-dot]"));
    var prev = slider.querySelector("[data-slide-prev]");
    var next = slider.querySelector("[data-slide-next]");
    var index = 0;
    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide-dot")) || 0);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }
  });

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get("q") || "";
  var queryInput = document.querySelector("[data-query-input]");
  if (queryInput) {
    queryInput.value = initialQuery;
  }

  var grids = Array.prototype.slice.call(document.querySelectorAll("[data-filter-grid]"));
  grids.forEach(function (grid) {
    var scope = grid.closest("section") || document;
    var searchInput = scope.querySelector("[data-live-search]");
    var yearFilter = scope.querySelector("[data-year-filter]");
    var typeFilter = scope.querySelector("[data-type-filter]");
    var empty = scope.querySelector("[data-empty-state]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-filter-card]"));
    function filterCards() {
      var q = ((searchInput && searchInput.value) || "").trim().toLowerCase();
      var year = (yearFilter && yearFilter.value) || "";
      var type = (typeFilter && typeFilter.value) || "";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-region"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var ok = (!q || haystack.indexOf(q) !== -1) && (!year || card.getAttribute("data-year") === year) && (!type || card.getAttribute("data-type") === type);
        card.classList.toggle("is-hidden", !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }
    if (searchInput && initialQuery && searchInput.hasAttribute("data-query-input")) {
      searchInput.value = initialQuery;
    }
    [searchInput, yearFilter, typeFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", filterCards);
        control.addEventListener("change", filterCards);
      }
    });
    filterCards();
  });
}());
