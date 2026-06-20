(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initializeMenu() {
    var header = document.querySelector(".site-header");
    var button = document.querySelector(".menu-toggle");
    if (!header || !button) {
      return;
    }
    button.addEventListener("click", function () {
      var isOpen = header.classList.toggle("is-open");
      button.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  function initializeHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function restart() {
      window.clearInterval(timer);
      start();
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });
    hero.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });
    hero.addEventListener("mouseleave", start);
    start();
  }

  function initializeFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    if (!cards.length || !panels.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var keyword = params.get("keyword") || "";
    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    var fields = Array.prototype.slice.call(document.querySelectorAll("[data-filter-field]"));
    searchInputs.forEach(function (input) {
      if (keyword && !input.value) {
        input.value = keyword;
      }
      input.addEventListener("input", applyFilters);
    });
    fields.forEach(function (field) {
      field.addEventListener("change", applyFilters);
    });
    function textMatches(card, terms) {
      if (!terms.length) {
        return true;
      }
      var haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.year,
        card.dataset.type,
        card.dataset.genre,
        card.dataset.tags
      ].join(" "));
      return terms.every(function (term) {
        return haystack.indexOf(term) !== -1;
      });
    }
    function valueMatches(card, field) {
      var key = field.getAttribute("data-filter-field");
      var value = normalize(field.value);
      if (!value) {
        return true;
      }
      return normalize(card.dataset[key]) === value;
    }
    function applyFilters() {
      var text = normalize(searchInputs.map(function (input) {
        return input.value;
      }).join(" "));
      var terms = text ? text.split(/\s+/).filter(Boolean) : [];
      cards.forEach(function (card) {
        var matchesText = textMatches(card, terms);
        var matchesFields = fields.every(function (field) {
          return valueMatches(card, field);
        });
        card.hidden = !(matchesText && matchesFields);
      });
    }
    applyFilters();
  }

  ready(function () {
    initializeMenu();
    initializeHero();
    initializeFilters();
  });
})();
