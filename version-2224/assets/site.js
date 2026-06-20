/* Generated static site script. Kept expanded for readability. */
(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-mobile-menu-button]");
        var nav = document.querySelector("[data-site-nav]");

        if (!button || !nav) {
            return;
        }

        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");

        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var previousButton = slider.querySelector("[data-hero-prev]");
        var nextButton = slider.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function startAutoPlay() {
            stopAutoPlay();
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5000);
        }

        function stopAutoPlay() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                showSlide(dotIndex);
                startAutoPlay();
            });
        });

        if (previousButton) {
            previousButton.addEventListener("click", function () {
                showSlide(index - 1);
                startAutoPlay();
            });
        }

        if (nextButton) {
            nextButton.addEventListener("click", function () {
                showSlide(index + 1);
                startAutoPlay();
            });
        }

        slider.addEventListener("mouseenter", stopAutoPlay);
        slider.addEventListener("mouseleave", startAutoPlay);
        showSlide(0);
        startAutoPlay();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));

        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-select]"));
            var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
            var counter = scope.querySelector("[data-filter-count]");
            var empty = document.querySelector("[data-filter-empty]");

            function applyFilters() {
                var keyword = normalize(input ? input.value : "");
                var activeFilters = {};

                selects.forEach(function (select) {
                    var field = select.getAttribute("data-field");
                    activeFilters[field] = normalize(select.value);
                });

                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.textContent
                    ].join(" "));

                    var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchesSelects = true;

                    Object.keys(activeFilters).forEach(function (field) {
                        var wanted = activeFilters[field];
                        var actual = normalize(card.getAttribute("data-" + field));

                        if (wanted && actual !== wanted) {
                            matchesSelects = false;
                        }
                    });

                    var visibleNow = matchesKeyword && matchesSelects;
                    card.classList.toggle("is-hidden", !visibleNow);

                    if (visibleNow) {
                        visible += 1;
                    }
                });

                if (counter) {
                    counter.textContent = "当前显示 " + visible + " 部影片";
                }

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            if (input) {
                input.addEventListener("input", applyFilters);
            }

            selects.forEach(function (select) {
                select.addEventListener("change", applyFilters);
            });
        });
    }

    var hlsLoadPromise = null;

    function loadHlsScript() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        if (hlsLoadPromise) {
            return hlsLoadPromise;
        }

        hlsLoadPromise = new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = function () {
                reject(new Error("HLS 播放组件加载失败"));
            };
            document.head.appendChild(script);
        });

        return hlsLoadPromise;
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

        players.forEach(function (container) {
            var video = container.querySelector("[data-video]");
            var button = container.querySelector("[data-play-button]");
            var message = document.querySelector("[data-player-message]");
            var initialized = false;

            if (!video || !button) {
                return;
            }

            function setMessage(text) {
                if (message) {
                    message.textContent = text;
                }
            }

            async function startPlayback() {
                var source = button.getAttribute("data-video-src");

                if (!source) {
                    setMessage("当前影片没有可用播放源。");
                    return;
                }

                button.disabled = true;
                setMessage("正在初始化播放源，请稍候…");

                try {
                    if (!initialized) {
                        if (video.canPlayType("application/vnd.apple.mpegurl")) {
                            video.src = source;
                        } else {
                            var Hls = await loadHlsScript();

                            if (Hls && Hls.isSupported()) {
                                var hls = new Hls({
                                    enableWorker: true,
                                    lowLatencyMode: true,
                                    backBufferLength: 90
                                });

                                hls.loadSource(source);
                                hls.attachMedia(video);
                                video._hlsInstance = hls;
                            } else {
                                throw new Error("当前浏览器不支持 HLS 播放");
                            }
                        }

                        initialized = true;
                    }

                    button.classList.add("is-hidden");
                    await video.play();
                    setMessage("正在播放：m3u8 播放源已成功绑定。");
                } catch (error) {
                    button.disabled = false;
                    button.classList.remove("is-hidden");
                    setMessage(error && error.message ? error.message : "播放初始化失败，请稍后重试。");
                }
            }

            button.addEventListener("click", startPlayback);
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHeroSlider();
        setupFilters();
        setupPlayers();
    });
})();
