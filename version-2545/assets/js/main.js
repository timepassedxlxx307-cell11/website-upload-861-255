(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var active = 0;
    function show(index) {
      active = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    setInterval(function () {
      show((active + 1) % slides.length);
    }, 5200);
  }

  function setupFilters() {
    var areas = Array.prototype.slice.call(document.querySelectorAll('[data-filter-area]'));
    areas.forEach(function (area) {
      var section = area.closest('.content-section') || document;
      var grid = section.querySelector('[data-filter-grid]');
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
      var input = area.querySelector('[data-filter-input]');
      var year = area.querySelector('[data-filter-year]');
      var region = area.querySelector('[data-filter-region]');
      var type = area.querySelector('[data-filter-type]');
      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var yearValue = year ? year.value : '';
        var regionValue = region ? region.value : '';
        var typeValue = type ? type.value : '';
        cards.forEach(function (card) {
          var text = card.getAttribute('data-search') || '';
          var keep = true;
          if (query && text.indexOf(query) === -1) {
            keep = false;
          }
          if (yearValue && card.getAttribute('data-year') !== yearValue) {
            keep = false;
          }
          if (regionValue && card.getAttribute('data-region') !== regionValue) {
            keep = false;
          }
          if (typeValue && card.getAttribute('data-type') !== typeValue) {
            keep = false;
          }
          card.classList.toggle('is-hidden', !keep);
        });
      }
      [input, year, region, type].forEach(function (node) {
        if (node) {
          node.addEventListener('input', apply);
          node.addEventListener('change', apply);
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function resultCard(item) {
    return '' +
      '<article class="movie-card">' +
        '<a class="poster-link" href="' + escapeHtml(item.url) + '" aria-label="' + escapeHtml(item.title) + '">' +
          '<span class="poster-wrap">' +
            '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
            '<span class="poster-gradient"></span>' +
            '<span class="play-badge">▶</span>' +
            '<span class="duration-badge">' + escapeHtml(item.duration) + '</span>' +
          '</span>' +
          '<span class="movie-title">' + escapeHtml(item.title) + '</span>' +
        '</a>' +
        '<div class="movie-meta">' +
          '<span>' + escapeHtml(item.year) + '</span>' +
          '<span>' + escapeHtml(item.region) + '</span>' +
          '<span class="rating">★ ' + escapeHtml(item.rating) + '</span>' +
        '</div>' +
        '<p class="movie-line">' + escapeHtml(item.oneLine) + '</p>' +
      '</article>';
  }

  function setupSearchPage() {
    var input = document.getElementById('site-search-input');
    var button = document.getElementById('site-search-button');
    var results = document.getElementById('site-search-results');
    var data = window.siteSearchData || [];
    if (!input || !button || !results || !data.length) {
      return;
    }
    function render() {
      var query = input.value.trim().toLowerCase();
      if (!query) {
        results.innerHTML = data.slice(0, 24).map(resultCard).join('');
        return;
      }
      var matched = data.filter(function (item) {
        return item.search.indexOf(query) !== -1;
      }).slice(0, 96);
      if (!matched.length) {
        results.innerHTML = '<div class="search-empty">没有找到匹配影片，换个关键词试试。</div>';
        return;
      }
      results.innerHTML = matched.map(resultCard).join('');
    }
    button.addEventListener('click', render);
    input.addEventListener('input', render);
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
