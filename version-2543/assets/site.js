(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            var expanded = menuButton.getAttribute('aria-expanded') === 'true';
            menuButton.setAttribute('aria-expanded', String(!expanded));
            mobilePanel.classList.toggle('open');
        });
    }

    var heroSlides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var heroDots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));

    if (heroSlides.length > 1) {
        var heroIndex = 0;
        var showHero = function (index) {
            heroSlides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            heroDots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
            heroIndex = index;
        };

        heroDots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showHero(index);
            });
        });

        setInterval(function () {
            showHero((heroIndex + 1) % heroSlides.length);
        }, 5200);
    }

    var searchInput = document.getElementById('searchInput');
    var filterCards = Array.prototype.slice.call(document.querySelectorAll('.search-results .filter-card'));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-category]'));
    var typeFilter = document.getElementById('typeFilter');
    var yearFilter = document.getElementById('yearFilter');
    var selectedCategory = 'all';

    if (searchInput && filterCards.length) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        var initialCategory = params.get('category') || 'all';
        searchInput.value = initialQuery;

        if (initialCategory !== 'all') {
            selectedCategory = initialCategory;
            filterButtons.forEach(function (button) {
                button.classList.toggle('active', button.getAttribute('data-filter-category') === initialCategory);
            });
        }

        var matchesYear = function (card, value) {
            if (value === 'all') {
                return true;
            }
            var year = card.getAttribute('data-year') || '';
            if (value === 'older') {
                var numericYear = parseInt(year, 10);
                return Number.isFinite(numericYear) && numericYear <= 2021;
            }
            return year === value;
        };

        var applyFilters = function () {
            var q = searchInput.value.trim().toLowerCase();
            var selectedType = typeFilter ? typeFilter.value : 'all';
            var selectedYear = yearFilter ? yearFilter.value : 'all';

            filterCards.forEach(function (card) {
                var text = card.getAttribute('data-title') || '';
                var category = card.getAttribute('data-category') || '';
                var type = card.getAttribute('data-type') || '';
                var okQuery = !q || text.indexOf(q) !== -1;
                var okCategory = selectedCategory === 'all' || category === selectedCategory;
                var okType = selectedType === 'all' || type === selectedType;
                var okYear = matchesYear(card, selectedYear);
                card.classList.toggle('hidden-by-filter', !(okQuery && okCategory && okType && okYear));
            });
        };

        searchInput.addEventListener('input', applyFilters);
        if (typeFilter) {
            typeFilter.addEventListener('change', applyFilters);
        }
        if (yearFilter) {
            yearFilter.addEventListener('change', applyFilters);
        }
        filterButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                selectedCategory = button.getAttribute('data-filter-category') || 'all';
                filterButtons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                applyFilters();
            });
        });
        applyFilters();
    }

    var playerShells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));

    playerShells.forEach(function (shell) {
        var video = shell.querySelector('video');
        var playButton = shell.querySelector('[data-play-trigger]');
        var streamUrl = shell.getAttribute('data-stream');
        var hlsInstance = null;
        var loaded = false;

        if (!video || !streamUrl) {
            return;
        }

        var startVideo = function () {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        };

        var loadStream = function () {
            if (loaded) {
                startVideo();
                return;
            }

            loaded = true;
            shell.classList.add('is-ready');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                startVideo();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, startVideo);
                } else {
                    window.setTimeout(startVideo, 500);
                }
                return;
            }

            video.src = streamUrl;
            startVideo();
        };

        if (playButton) {
            playButton.addEventListener('click', function (event) {
                event.preventDefault();
                loadStream();
            });
        }

        shell.addEventListener('click', function (event) {
            if (event.target.closest('button') || event.target.closest('a')) {
                return;
            }
            if (!loaded) {
                loadStream();
            }
        });

        video.addEventListener('play', function () {
            shell.classList.add('is-ready');
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                hlsInstance.destroy();
            }
        });
    });
})();
