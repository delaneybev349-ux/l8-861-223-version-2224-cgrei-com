(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".mobile-menu-button");
    var mobilePanel = document.querySelector(".mobile-nav-panel");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        var isOpen = mobilePanel.classList.toggle("open");
        menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    }

    document.querySelectorAll(".site-search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var url = "./search.html";
        if (query) {
          url += "?q=" + encodeURIComponent(query);
        }
        window.location.href = url;
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("active", current === activeIndex);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("active", current === activeIndex);
      });
    }

    function startHero() {
      if (timer) {
        window.clearInterval(timer);
      }
      if (slides.length > 1) {
        timer = window.setInterval(function () {
          showSlide(activeIndex + 1);
        }, 5000);
      }
    }

    if (slides.length) {
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
          startHero();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(activeIndex - 1);
          startHero();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(activeIndex + 1);
          startHero();
        });
      }

      startHero();
    }

    var filterInput = document.querySelector(".filter-input");
    if (filterInput) {
      filterInput.addEventListener("input", function () {
        var query = filterInput.value.trim().toLowerCase();
        document.querySelectorAll("[data-search-text]").forEach(function (card) {
          var text = (card.getAttribute("data-search-text") || "").toLowerCase();
          card.classList.toggle("hidden-card", query && text.indexOf(query) === -1);
        });
      });
    }

    var resultRoot = document.querySelector(".search-results");
    if (resultRoot && Array.isArray(window.SEARCH_INDEX)) {
      var params = new URLSearchParams(window.location.search);
      var queryText = (params.get("q") || "").trim();
      var input = document.querySelector(".search-page-input");
      if (input) {
        input.value = queryText;
      }
      renderSearchResults(resultRoot, queryText);
    }

    var playerConfig = document.getElementById("playerConfig");
    if (playerConfig) {
      setupPlayer(playerConfig);
    }
  });

  function cardHtml(item) {
    return [
      '<a class="movie-card" href="' + escapeAttr(item.href) + '">',
      '<div class="card-cover">',
      '<img src="' + escapeAttr(item.image) + '" alt="' + escapeAttr(item.title) + '" loading="lazy">',
      '<span class="card-play">▶</span>',
      '<span class="card-badge">' + escapeHtml(item.region) + '</span>',
      '</div>',
      '<div class="card-body">',
      '<h3>' + escapeHtml(item.title) + '</h3>',
      '<p>' + escapeHtml(item.oneLine) + '</p>',
      '<div class="card-meta">',
      '<span>' + escapeHtml(item.year) + '</span>',
      '<span>' + escapeHtml(item.type) + '</span>',
      '<span>' + escapeHtml(item.genre) + '</span>',
      '</div>',
      '</div>',
      '</a>'
    ].join("");
  }

  function renderSearchResults(root, queryText) {
    var q = queryText.toLowerCase();
    var items = window.SEARCH_INDEX.filter(function (item) {
      if (!q) {
        return false;
      }
      return item.searchText.toLowerCase().indexOf(q) !== -1;
    });

    if (!q) {
      root.innerHTML = '<div class="search-empty">请输入关键词，快速查找片名、类型、地区或标签。</div>';
      return;
    }

    if (!items.length) {
      root.innerHTML = '<div class="search-empty">暂未找到匹配内容，请尝试更换关键词。</div>';
      return;
    }

    root.innerHTML = '<div class="movie-grid">' + items.map(cardHtml).join("") + '</div>';
  }

  function setupPlayer(configElement) {
    var config = {};
    try {
      config = JSON.parse(configElement.textContent || "{}");
    } catch (error) {
      config = {};
    }

    var video = document.getElementById("moviePlayer");
    var overlay = document.querySelector(".player-overlay");
    var button = document.querySelector("[data-play-button]");
    var hasLoaded = false;

    function attachStream() {
      if (!video || !config.videoUrl || hasLoaded) {
        return;
      }

      hasLoaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = config.videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(config.videoUrl);
        hls.attachMedia(video);
      } else {
        video.src = config.videoUrl;
      }
    }

    function startPlayback() {
      attachStream();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      if (video) {
        video.controls = true;
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {});
        }
      }
    }

    if (button) {
      button.addEventListener("click", startPlayback);
    }

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          startPlayback();
        }
      });
    }
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (match) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[match];
    });
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/'/g, "&#39;");
  }
})();
