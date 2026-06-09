(function () {
  const menuButton = document.querySelector(".menu-toggle");
  const mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      const expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      mobilePanel.hidden = expanded;
    });
  }

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dot"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let index = 0;
    let timer = null;

    const show = function (target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    };

    const start = function () {
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    };

    const restart = function () {
      if (timer) {
        clearInterval(timer);
      }
      start();
    };

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.dataset.slide || 0));
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    if (slides.length > 1) {
      start();
    }
  }

  const filterForms = Array.from(document.querySelectorAll("[data-filter-form]"));
  filterForms.forEach(function (form) {
    const input = form.querySelector("[data-filter-input]");
    const items = Array.from(document.querySelectorAll(".filter-item"));
    const apply = function () {
      const query = (input && input.value ? input.value : "").trim().toLowerCase();
      items.forEach(function (item) {
        const content = [
          item.dataset.title,
          item.dataset.region,
          item.dataset.type,
          item.dataset.genre,
          item.dataset.year,
          item.textContent
        ].join(" ").toLowerCase();
        item.classList.toggle("filtered-out", query && !content.includes(query));
      });
    };

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      apply();
    });

    if (input) {
      input.addEventListener("input", apply);
    }
  });

  const searchForm = document.querySelector("[data-search-page]");
  const searchResults = document.querySelector("[data-search-results]");
  if (searchForm && searchResults && Array.isArray(globalThis.MOVIES_INDEX)) {
    const params = new URLSearchParams(location.search);
    const queryInput = searchForm.elements.q;
    const categorySelect = searchForm.elements.category;
    const typeSelect = searchForm.elements.type;

    if (params.get("q")) {
      queryInput.value = params.get("q");
    }

    const render = function () {
      const q = String(queryInput.value || "").trim().toLowerCase();
      const category = String(categorySelect.value || "");
      const type = String(typeSelect.value || "");
      const results = globalThis.MOVIES_INDEX.filter(function (movie) {
        const text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine, movie.category].join(" ").toLowerCase();
        const matchQuery = !q || text.includes(q);
        const matchCategory = !category || movie.category === category;
        const matchType = !type || movie.type === type;
        return matchQuery && matchCategory && matchType;
      }).slice(0, 120);

      if (!results.length) {
        searchResults.innerHTML = '<div class="search-result-card"><h2>暂无匹配内容</h2><p>可以尝试更换片名、地区、类型或标签。</p></div>';
        return;
      }

      searchResults.innerHTML = results.map(function (movie) {
        return '<article class="search-result-card">' +
          '<div class="movie-meta-line"><span>' + movie.type + '</span><span>' + movie.region + '</span><span>' + movie.year + '</span><span>' + movie.category + '</span></div>' +
          '<h2><a href="' + movie.file + '">' + movie.title + '</a></h2>' +
          '<p>' + movie.oneLine + '</p>' +
          '<a class="text-link" href="' + movie.file + '">查看详情</a>' +
          '</article>';
      }).join("");
    };

    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
    });

    queryInput.addEventListener("input", render);
    categorySelect.addEventListener("change", render);
    typeSelect.addEventListener("change", render);
    render();
  }
})();
