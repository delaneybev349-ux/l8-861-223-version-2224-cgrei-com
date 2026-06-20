(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }

    callback();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initMobileNavigation() {
    var toggle = document.querySelector(".js-mobile-toggle");
    var panel = document.querySelector(".js-mobile-panel");

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      var isOpen = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function initHeroCarousel() {
    var hero = document.querySelector("[data-hero-carousel]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var currentIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      currentIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === currentIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === currentIndex);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(currentIndex + 1);
      }, 5000);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        schedule();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        showSlide(currentIndex - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(currentIndex + 1);
        schedule();
      });
    }

    showSlide(0);
    schedule();
  }

  function initCategoryFilters() {
    var filterScope = document.querySelector("[data-filter-scope]");

    if (!filterScope) {
      return;
    }

    var cards = Array.prototype.slice.call(filterScope.querySelectorAll("[data-movie-card]"));
    var keywordInput = filterScope.querySelector("[data-filter-keyword]");
    var regionSelect = filterScope.querySelector("[data-filter-region]");
    var yearSelect = filterScope.querySelector("[data-filter-year]");
    var typeSelect = filterScope.querySelector("[data-filter-type]");
    var resetButton = filterScope.querySelector("[data-filter-reset]");
    var emptyState = filterScope.querySelector("[data-empty-state]");

    function matchesSelect(card, select, key) {
      if (!select || !select.value) {
        return true;
      }

      return card.dataset[key] === select.value;
    }

    function applyFilters() {
      var keyword = normalize(keywordInput ? keywordInput.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(
          [
            card.dataset.title,
            card.dataset.region,
            card.dataset.year,
            card.dataset.type,
            card.dataset.genre
          ].join(" ")
        );

        var matched = true;

        if (keyword && !haystack.includes(keyword)) {
          matched = false;
        }

        if (!matchesSelect(card, regionSelect, "region")) {
          matched = false;
        }

        if (!matchesSelect(card, yearSelect, "year")) {
          matched = false;
        }

        if (!matchesSelect(card, typeSelect, "type")) {
          matched = false;
        }

        card.hidden = !matched;

        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visible === 0);
      }
    }

    [keywordInput, regionSelect, yearSelect, typeSelect].forEach(function (control) {
      if (!control) {
        return;
      }

      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    });

    if (resetButton) {
      resetButton.addEventListener("click", function () {
        if (keywordInput) {
          keywordInput.value = "";
        }

        if (regionSelect) {
          regionSelect.value = "";
        }

        if (yearSelect) {
          yearSelect.value = "";
        }

        if (typeSelect) {
          typeSelect.value = "";
        }

        applyFilters();
      });
    }

    applyFilters();
  }

  function renderSearchCard(movie) {
    return [
      '<article class="movie-card">',
      '  <a class="movie-card__poster poster-frame" href="' + escapeHtml(movie.url) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.style.display=' + "'none'" + '">',
      '    <span class="play-badge">▶</span>',
      '    <span class="poster-meta">' + escapeHtml(movie.year) + '</span>',
      '  </a>',
      '  <div class="movie-card__body">',
      '    <div class="movie-card__meta">',
      '      <a href="' + escapeHtml(movie.categoryUrl) + '">' + escapeHtml(movie.category) + '</a>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '    </div>',
      '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-row">',
      movie.tags.slice(0, 3).map(function (tag) {
        return '      <span>' + escapeHtml(tag) + '</span>';
      }).join(""),
      '    </div>',
      '  </div>',
      '</article>'
    ].join("\n");
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");

    if (!results || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = normalize(params.get("q"));
    var input = document.querySelector("[data-search-input]");
    var heading = document.querySelector("[data-search-heading]");
    var movies = window.MOVIE_SEARCH_INDEX;

    if (input && query) {
      input.value = params.get("q") || "";
    }

    var matched = movies.filter(function (movie) {
      if (!query) {
        return movie.featured;
      }

      var haystack = normalize(
        [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags.join(" "),
          movie.oneLine,
          movie.summary
        ].join(" ")
      );

      return haystack.includes(query);
    });

    if (heading) {
      heading.textContent = query ? "搜索结果" : "推荐片目";
    }

    if (!matched.length) {
      results.innerHTML = '<div class="empty-state is-visible">没有匹配到结果，可尝试更换片名、地区、年份或类型关键词。</div>';
      return;
    }

    results.innerHTML = matched.slice(0, 120).map(renderSearchCard).join("\n");
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".js-player"));

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".player-start");
      var message = player.parentElement.querySelector(".player-message");

      if (!video || !button) {
        return;
      }

      var source = video.dataset.src;
      var hlsInstance = null;

      function setMessage(text) {
        if (message) {
          message.textContent = text || "";
        }
      }

      function playVideo() {
        if (!source) {
          setMessage("当前播放源暂不可用。");
          return;
        }

        player.classList.add("is-playing");
        setMessage("正在加载高清播放源…");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.play().then(function () {
            setMessage("");
          }).catch(function () {
            setMessage("播放已就绪，请再次点击视频控件开始。");
          });
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (hlsInstance) {
            hlsInstance.destroy();
          }

          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);

          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().then(function () {
              setMessage("");
            }).catch(function () {
              setMessage("播放已就绪，请再次点击视频控件开始。");
            });
          });

          hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              setMessage("播放源加载异常，可刷新页面后重试。");
            }
          });

          return;
        }

        video.src = source;
        video.play().then(function () {
          setMessage("");
        }).catch(function () {
          setMessage("当前浏览器需要 HLS 支持，请使用现代浏览器打开。");
        });
      }

      button.addEventListener("click", playVideo);
    });
  }

  ready(function () {
    initMobileNavigation();
    initHeroCarousel();
    initCategoryFilters();
    initSearchPage();
    initPlayers();
  });
})();
