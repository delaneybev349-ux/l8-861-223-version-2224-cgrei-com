(function () {
    var header = document.getElementById("siteHeader");
    var toggle = document.querySelector(".mobile-toggle");
    var panel = document.getElementById("mobilePanel");

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 40) {
            header.classList.add("is-scrolled");
        } else {
            header.classList.remove("is-scrolled");
        }
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            var open = panel.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    document.querySelectorAll("form[action='search.html']").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            var input = form.querySelector("input[name='q']");
            if (input && input.value.trim()) {
                event.preventDefault();
                window.location.href = "search.html?q=" + encodeURIComponent(input.value.trim());
            }
        });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var current = 0;
        var timer = null;

        function showHero(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function startHero() {
            timer = window.setInterval(function () {
                showHero(current + 1);
            }, 4800);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                showHero(index);
                startHero();
            });
        });

        hero.addEventListener("mouseenter", function () {
            if (timer) {
                window.clearInterval(timer);
            }
        });

        hero.addEventListener("mouseleave", function () {
            if (timer) {
                window.clearInterval(timer);
            }
            startHero();
        });

        showHero(0);
        startHero();
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function runFilters(scope) {
        var container = scope || document;
        var cards = Array.prototype.slice.call(container.querySelectorAll(".filter-scope .movie-card"));
        if (!cards.length) {
            return;
        }

        var keywordInput = container.querySelector(".global-filter") || container.querySelector(".local-filter");
        var typeFilter = container.querySelector(".type-filter");
        var regionFilter = container.querySelector(".region-filter");
        var yearFilter = container.querySelector(".year-filter");
        var emptyState = container.querySelector(".empty-state");
        var keyword = normalize(keywordInput && keywordInput.value);
        var typeValue = normalize(typeFilter && typeFilter.value);
        var regionValue = normalize(regionFilter && regionFilter.value);
        var yearValue = normalize(yearFilter && yearFilter.value);
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-genre"),
                card.textContent
            ].join(" "));
            var type = normalize(card.getAttribute("data-type"));
            var region = normalize(card.getAttribute("data-region"));
            var year = normalize(card.getAttribute("data-year"));
            var matched = true;

            if (keyword && haystack.indexOf(keyword) === -1) {
                matched = false;
            }
            if (typeValue && type.indexOf(typeValue) === -1) {
                matched = false;
            }
            if (regionValue && region.indexOf(regionValue) === -1) {
                matched = false;
            }
            if (yearValue && year !== yearValue) {
                matched = false;
            }

            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.hidden = visible !== 0;
        }
    }

    var filterRoots = Array.prototype.slice.call(document.querySelectorAll(".section"));
    filterRoots.forEach(function (root) {
        if (!root.querySelector(".filter-scope")) {
            return;
        }
        root.querySelectorAll(".global-filter, .local-filter, .type-filter, .region-filter, .year-filter").forEach(function (control) {
            control.addEventListener("input", function () {
                runFilters(root);
            });
            control.addEventListener("change", function () {
                runFilters(root);
            });
        });

        var keywordInput = root.querySelector(".global-filter");
        if (keywordInput) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q) {
                keywordInput.value = q;
            }
        }

        runFilters(root);
    });

    function startPlayer(wrapper) {
        if (!wrapper || wrapper._started) {
            if (wrapper && wrapper._video) {
                wrapper._video.play().catch(function () {});
            }
            return;
        }

        var video = wrapper.querySelector("video");
        var src = wrapper.getAttribute("data-video");
        if (!video || !src) {
            return;
        }

        wrapper._video = video;
        wrapper._started = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(src);
            hls.attachMedia(video);
            wrapper._hls = hls;
        } else {
            video.src = src;
        }

        wrapper.classList.add("is-playing");
        video.play().catch(function () {});
    }

    var player = document.querySelector(".watch-player");
    if (player) {
        var overlay = player.querySelector(".play-overlay");
        var video = player.querySelector("video");
        if (overlay) {
            overlay.addEventListener("click", function () {
                startPlayer(player);
            });
        }
        if (video) {
            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });
        }
        document.querySelectorAll(".play-now").forEach(function (button) {
            button.addEventListener("click", function () {
                player.scrollIntoView({ behavior: "smooth", block: "center" });
                startPlayer(player);
            });
        });
    }
})();
