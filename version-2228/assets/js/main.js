(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  ready(function () {
    var body = document.body;
    var toggle = document.querySelector(".nav-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var open = body.classList.toggle("nav-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function startHero() {
      if (timer || slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function restartHero() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
      startHero();
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        restartHero();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        restartHero();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        restartHero();
      });
    }

    startHero();

    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get("q") || "";
    var filterInput = document.querySelector(".filter-input");
    var filterSelect = document.querySelector(".filter-select");
    var filterYear = document.querySelector(".filter-year");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-scope .movie-card"));
    var emptyState = document.querySelector(".empty-state");

    if (filterInput && queryValue) {
      filterInput.value = queryValue;
    }

    function applyFilters() {
      if (!cards.length) {
        return;
      }
      var keyword = normalize(filterInput && filterInput.value);
      var type = normalize(filterSelect && filterSelect.value);
      var year = normalize(filterYear && filterYear.value);
      var visibleCount = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }
        if (type && cardType !== type) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }

        card.hidden = !matched;
        if (matched) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visibleCount !== 0;
      }
    }

    if (filterInput) {
      filterInput.addEventListener("input", applyFilters);
    }
    if (filterSelect) {
      filterSelect.addEventListener("change", applyFilters);
    }
    if (filterYear) {
      filterYear.addEventListener("change", applyFilters);
    }
    applyFilters();
  });
})();
