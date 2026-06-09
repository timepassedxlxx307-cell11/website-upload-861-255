(function () {
  var body = document.body;
  var toggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var sliders = document.querySelectorAll('[data-hero-slider]');

  sliders.forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
        dot.setAttribute('aria-pressed', dotIndex === current ? 'true' : 'false');
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 6200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  var panels = document.querySelectorAll('[data-filter-panel]');

  panels.forEach(function (panel) {
    var scope = panel.getAttribute('data-filter-scope');
    var container = scope ? document.querySelector(scope) : document;
    var input = panel.querySelector('[data-filter-input]');
    var year = panel.querySelector('[data-filter-year]');
    var region = panel.querySelector('[data-filter-region]');
    var type = panel.querySelector('[data-filter-type]');
    var empty = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (query && input) {
      input.value = query;
    }

    function normalize(text) {
      return String(text || '').toLowerCase().trim();
    }

    function apply() {
      var keyword = normalize(input ? input.value : '');
      var yearValue = normalize(year ? year.value : '');
      var regionValue = normalize(region ? region.value : '');
      var typeValue = normalize(type ? type.value : '');
      var visible = 0;
      var cards = container ? container.querySelectorAll('[data-search-card]') : [];

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year')
        ].join(' '));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
        var matchRegion = !regionValue || normalize(card.getAttribute('data-region')) === regionValue;
        var matchType = !typeValue || normalize(card.getAttribute('data-type')) === typeValue;
        var ok = matchKeyword && matchYear && matchRegion && matchType;
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, year, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  });
})();
