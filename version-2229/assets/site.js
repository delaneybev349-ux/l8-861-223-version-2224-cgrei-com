(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  var keywordInput = document.querySelector('.js-card-filter');
  var yearSelect = document.querySelector('.js-year-filter');
  var regionSelect = document.querySelector('.js-region-filter');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var emptyState = document.querySelector('[data-empty-state]');

  function filterCards() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(keywordInput ? keywordInput.value : '');
    var year = normalize(yearSelect ? yearSelect.value : '');
    var region = normalize(regionSelect ? regionSelect.value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var cardRegion = normalize(card.getAttribute('data-region'));
      var matched = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        matched = false;
      }

      if (year && cardYear.indexOf(year) === -1) {
        matched = false;
      }

      if (region && cardRegion.indexOf(region) === -1) {
        matched = false;
      }

      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  if (keywordInput) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      keywordInput.value = query;
    }
    keywordInput.addEventListener('input', filterCards);
  }

  if (yearSelect) {
    yearSelect.addEventListener('change', filterCards);
  }

  if (regionSelect) {
    regionSelect.addEventListener('change', filterCards);
  }

  filterCards();
})();
