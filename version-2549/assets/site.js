(function () {
  const toggle = document.querySelector('[data-menu-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const input = form.querySelector('input[name="q"]');
      const value = input ? input.value.trim() : '';
      if (!value) {
        event.preventDefault();
        window.location.href = './movies.html';
      }
    });
  });

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;
    let timer = null;

    const show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    const start = function () {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  const catalog = document.querySelector('[data-catalog]');
  if (catalog) {
    const cards = Array.from(catalog.querySelectorAll('.movie-card-item'));
    const input = catalog.querySelector('[data-filter-input]');
    const category = catalog.querySelector('[data-category-select]');
    const year = catalog.querySelector('[data-year-select]');
    const count = catalog.querySelector('[data-filter-count]');
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';

    if (input && query) {
      input.value = query;
    }

    if (year) {
      const years = Array.from(new Set(cards.map(function (card) {
        return card.getAttribute('data-year') || '';
      }).filter(Boolean))).sort().reverse();

      years.forEach(function (value) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        year.appendChild(option);
      });
    }

    const apply = function () {
      const keyword = input ? input.value.trim().toLowerCase() : '';
      const categoryValue = category ? category.value : '';
      const yearValue = year ? year.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const search = (card.getAttribute('data-search') || '').toLowerCase();
        const cardCategory = card.getAttribute('data-category') || '';
        const cardYear = card.getAttribute('data-year') || '';
        const matched = (!keyword || search.includes(keyword)) &&
          (!categoryValue || cardCategory === categoryValue) &&
          (!yearValue || cardYear === yearValue);

        card.classList.toggle('is-filtered-out', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible ? visible + ' 部影片' : '没有匹配影片';
      }
    };

    [input, category, year].forEach(function (element) {
      if (element) {
        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      }
    });

    apply();
  }
})();
