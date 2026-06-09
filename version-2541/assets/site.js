(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    Array.prototype.forEach.call(document.querySelectorAll('[data-site-search]'), function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';
            var target = './search.html';

            if (value) {
                target += '?q=' + encodeURIComponent(value);
            }

            window.location.href = target;
        });
    });

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        show(0);
        startTimer();
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-quick-filter]'));

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function applyFilter(value) {
        var q = normalize(value);

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-filter-text') || card.textContent);
            card.hidden = q ? text.indexOf(q) === -1 : false;
        });

        chips.forEach(function (chip) {
            chip.classList.toggle('is-active', normalize(chip.getAttribute('data-quick-filter')) === q);
        });
    }

    if (filterInput && cards.length) {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';

        if (initial) {
            filterInput.value = initial;
        }

        filterInput.addEventListener('input', function () {
            applyFilter(filterInput.value);
        });

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                var value = chip.getAttribute('data-quick-filter') || '';
                filterInput.value = value;
                applyFilter(value);
            });
        });

        applyFilter(filterInput.value);
    }
})();
