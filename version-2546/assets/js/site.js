(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero-slider]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var show = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
            });
        });
        show(0);
        setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    var homeSearch = document.querySelector('[data-home-search]');
    if (homeSearch) {
        homeSearch.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = homeSearch.querySelector('input');
            var value = input ? input.value.trim() : '';
            var query = value ? '?q=' + encodeURIComponent(value) : '';
            window.location.href = './search.html' + query;
        });
    }

    var filterRoot = document.querySelector('[data-filter-root]');
    if (filterRoot) {
        var keywordInput = filterRoot.querySelector('[data-filter-keyword]');
        var regionSelect = filterRoot.querySelector('[data-filter-region]');
        var yearSelect = filterRoot.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-movie-card]'));
        var params = new URLSearchParams(window.location.search);
        var preset = params.get('q');
        if (preset && keywordInput) {
            keywordInput.value = preset;
        }
        var applyFilter = function () {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
            var region = regionSelect ? regionSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-tags')).toLowerCase();
                var matchKeyword = !keyword || text.indexOf(keyword) >= 0;
                var matchRegion = !region || card.getAttribute('data-region') === region;
                var matchYear = !year || card.getAttribute('data-year') === year;
                card.classList.toggle('hide', !(matchKeyword && matchRegion && matchYear));
            });
        };
        [keywordInput, regionSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
        applyFilter();
    }
})();

function initMoviePlayer(source) {
    var video = document.getElementById('movieVideo');
    var overlay = document.getElementById('playOverlay');
    var hls = null;
    var attached = false;
    if (!video || !overlay || !source) {
        return;
    }
    var attach = function () {
        if (attached) {
            return;
        }
        attached = true;
        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else {
            video.src = source;
        }
    };
    var play = function () {
        attach();
        overlay.classList.add('is-hidden');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                overlay.classList.remove('is-hidden');
            });
        }
    };
    overlay.addEventListener('click', play);
    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });
    video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
    });
    video.addEventListener('ended', function () {
        overlay.classList.remove('is-hidden');
    });
    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
