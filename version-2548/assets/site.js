(function () {
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuToggle && mobilePanel) {
        menuToggle.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero-carousel]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        if (previous) {
            previous.addEventListener('click', function () {
                showSlide(activeIndex - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(activeIndex + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var filterRoot = document.querySelector('[data-filter-root]');

    if (filterRoot) {
        var searchInput = filterRoot.querySelector('[data-filter-search]');
        var typeSelect = filterRoot.querySelector('[data-filter-type]');
        var yearSelect = filterRoot.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('.movie-card'));
        var status = filterRoot.querySelector('[data-filter-status]');
        var empty = filterRoot.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (initialQuery && searchInput) {
            searchInput.value = initialQuery;
        }

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilters() {
            var query = normalize(searchInput ? searchInput.value : '');
            var type = normalize(typeSelect ? typeSelect.value : '');
            var year = normalize(yearSelect ? yearSelect.value : '');
            var visible = 0;

            cards.forEach(function (card) {
                var searchable = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' ').toLowerCase();

                var matchedQuery = !query || searchable.indexOf(query) !== -1;
                var matchedType = !type || normalize(card.getAttribute('data-type')) === type;
                var matchedYear = !year || normalize(card.getAttribute('data-year')) === year;
                var matched = matchedQuery && matchedType && matchedYear;

                card.style.display = matched ? '' : 'none';

                if (matched) {
                    visible += 1;
                }
            });

            if (status) {
                status.textContent = visible > 0 ? '匹配结果已更新' : '未找到相关影片';
            }

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [searchInput, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    }
})();
