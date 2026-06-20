(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-main-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }
    function start() {
      stop();
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        clearInterval(timer);
      }
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initSearchInputs() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    document.querySelectorAll("input[name='q']").forEach(function (input) {
      if (q && !input.value) {
        input.value = q;
      }
    });
  }

  function textMatch(item, query) {
    var haystack = [
      item.title,
      item.region,
      item.type,
      item.year,
      item.genre,
      item.tags,
      item.oneLine,
      item.category
    ].join(" ").toLowerCase();
    return query.every(function (part) {
      return haystack.indexOf(part) !== -1;
    });
  }

  function renderSearchCard(item) {
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + item.url + '" aria-label="' + escapeHtml(item.title) + '">',
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="poster-shade"></span>',
      '<span class="play-mark">▶</span>',
      '<span class="year-badge">' + escapeHtml(item.year) + '</span>',
      '</a>',
      '<div class="movie-info">',
      '<div class="card-meta"><a href="' + item.categoryUrl + '">' + escapeHtml(item.category) + '</a><span>' + escapeHtml(item.region) + '</span></div>',
      '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
      '<p>' + escapeHtml(shortText(item.oneLine, 92)) + '</p>',
      '</div>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function shortText(value, size) {
    value = String(value || "");
    return value.length > size ? value.slice(0, size).trim() + "…" : value;
  }

  function initSearchPage() {
    var grid = document.querySelector("[data-search-results]");
    var title = document.querySelector("[data-search-title]");
    if (!grid || !title || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = (params.get("q") || "").trim().toLowerCase();
    if (!q) {
      return;
    }
    var parts = q.split(/\s+/).filter(Boolean);
    var results = window.SEARCH_INDEX.filter(function (item) {
      return textMatch(item, parts);
    }).slice(0, 120);
    title.textContent = results.length ? "搜索结果" : "未找到匹配影片";
    grid.innerHTML = results.length ? results.map(renderSearchCard).join("") : "";
  }

  window.setupPlayer = function (src) {
    var video = document.getElementById("moviePlayer");
    var overlay = document.getElementById("playOverlay");
    var attached = false;
    var hls = null;
    if (!video || !src) {
      return;
    }
    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }
    function start() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }
    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    video.addEventListener("emptied", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
      attached = false;
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initSearchInputs();
    initSearchPage();
  });
}());
