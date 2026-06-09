(function () {
    var hlsScriptUrl = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
    var hlsLoader = null;

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function loadHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        if (hlsLoader) {
            return hlsLoader;
        }

        hlsLoader = new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            script.src = hlsScriptUrl;
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });

        return hlsLoader;
    }

    function attachVideoSource(video, sourceUrl) {
        return new Promise(function (resolve) {
            if (!sourceUrl) {
                resolve();
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
                resolve();
                return;
            }

            loadHls()
                .then(function (Hls) {
                    if (Hls && Hls.isSupported()) {
                        if (video._hlsInstance) {
                            video._hlsInstance.destroy();
                        }

                        var hls = new Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });

                        video._hlsInstance = hls;
                        hls.loadSource(sourceUrl);
                        hls.attachMedia(video);
                        hls.on(Hls.Events.MANIFEST_PARSED, function () {
                            resolve();
                        });
                        hls.on(Hls.Events.ERROR, function () {
                            resolve();
                        });
                    } else {
                        video.src = sourceUrl;
                        resolve();
                    }
                })
                .catch(function () {
                    video.src = sourceUrl;
                    resolve();
                });
        });
    }

    function initPlayers() {
        var players = document.querySelectorAll("[data-player]");

        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector(".player-start");

            if (!video || !button) {
                return;
            }

            function startPlayer() {
                if (player.classList.contains("is-playing")) {
                    return;
                }

                var source = video.getAttribute("data-src") || "";
                player.classList.add("is-playing");
                video.controls = true;

                attachVideoSource(video, source).then(function () {
                    var playPromise = video.play();
                    if (playPromise && typeof playPromise.catch === "function") {
                        playPromise.catch(function () {
                            player.classList.remove("is-playing");
                            video.controls = true;
                        });
                    }
                });
            }

            button.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                startPlayer();
            });

            player.addEventListener("click", function (event) {
                if (event.target === video && video.controls) {
                    return;
                }
                startPlayer();
            });
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                show(active + 1);
            }, 5600);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(active - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(active + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        hero.addEventListener("mouseenter", function () {
            if (timer) {
                window.clearInterval(timer);
            }
        });

        hero.addEventListener("mouseleave", restart);
        show(0);
        restart();
    }

    function initNavigation() {
        var toggle = document.querySelector(".nav-toggle");

        if (!toggle) {
            return;
        }

        toggle.addEventListener("click", function () {
            var expanded = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!expanded));
            document.body.classList.toggle("nav-open", !expanded);
        });
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initGlobalSearchForms() {
        var forms = document.querySelectorAll(".global-search-form");

        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q'], input[type='search']");
                var value = input ? input.value.trim() : "";

                if (!value) {
                    return;
                }

                event.preventDefault();
                var action = form.getAttribute("action") || "library.html";
                window.location.href = action + "?q=" + encodeURIComponent(value);
            });
        });
    }

    function initFilters() {
        var panels = document.querySelectorAll("[data-filter-panel]");

        panels.forEach(function (panel) {
            var targetSelector = panel.getAttribute("data-target") || "#movie-grid";
            var grid = document.querySelector(targetSelector);

            if (!grid) {
                return;
            }

            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
            var searchInput = panel.querySelector("#site-search");
            var typeFilter = panel.querySelector("#type-filter");
            var yearFilter = panel.querySelector("#year-filter");
            var categoryFilter = panel.querySelector("#category-filter");
            var resetButton = panel.querySelector("[data-reset-filter]");
            var emptyState = document.querySelector("[data-empty-state]");
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || "";

            if (initialQuery && searchInput) {
                searchInput.value = initialQuery;
            }

            function apply() {
                var keyword = normalize(searchInput ? searchInput.value : "");
                var typeValue = normalize(typeFilter ? typeFilter.value : "");
                var yearValue = normalize(yearFilter ? yearFilter.value : "");
                var categoryValue = normalize(categoryFilter ? categoryFilter.value : "");
                var visibleCount = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var cardType = normalize(card.getAttribute("data-type"));
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var cardCategory = normalize(card.getAttribute("data-category"));
                    var matched = true;

                    if (keyword && text.indexOf(keyword) === -1) {
                        matched = false;
                    }

                    if (typeValue && cardType !== typeValue) {
                        matched = false;
                    }

                    if (yearValue && cardYear !== yearValue) {
                        matched = false;
                    }

                    if (categoryValue && cardCategory !== categoryValue) {
                        matched = false;
                    }

                    card.hidden = !matched;
                    if (matched) {
                        visibleCount += 1;
                    }
                });

                if (emptyState) {
                    emptyState.classList.toggle("is-visible", visibleCount === 0);
                }
            }

            [searchInput, typeFilter, yearFilter, categoryFilter].forEach(function (control) {
                if (!control) {
                    return;
                }

                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            });

            if (resetButton) {
                resetButton.addEventListener("click", function () {
                    if (searchInput) {
                        searchInput.value = "";
                    }
                    if (typeFilter) {
                        typeFilter.value = "";
                    }
                    if (yearFilter) {
                        yearFilter.value = "";
                    }
                    if (categoryFilter) {
                        categoryFilter.value = "";
                    }
                    apply();
                });
            }

            apply();
        });
    }

    ready(function () {
        initNavigation();
        initHero();
        initGlobalSearchForms();
        initFilters();
        initPlayers();
    });
})();
