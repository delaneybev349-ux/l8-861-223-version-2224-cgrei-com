(function () {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    startTimer();
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function (panel) {
    var scope = panel.closest('.section-inner') || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var searchInput = panel.querySelector('[data-search-input]');
    var regionFilter = panel.querySelector('[data-filter-region]');
    var typeFilter = panel.querySelector('[data-filter-type]');
    var yearFilter = panel.querySelector('[data-filter-year]');
    var emptyState = scope.querySelector('[data-empty-state]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function updateCards() {
      var query = normalize(searchInput && searchInput.value);
      var region = normalize(regionFilter && regionFilter.value);
      var type = normalize(typeFilter && typeFilter.value);
      var year = normalize(yearFilter && yearFilter.value);
      var visibleCount = 0;

      cards.forEach(function (card) {
        var searchText = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));

        var matched = true;

        if (query && searchText.indexOf(query) === -1) {
          matched = false;
        }

        if (region && normalize(card.dataset.region) !== region) {
          matched = false;
        }

        if (type && normalize(card.dataset.type) !== type) {
          matched = false;
        }

        if (year && normalize(card.dataset.year) !== year) {
          matched = false;
        }

        card.classList.toggle('hidden-card', !matched);

        if (matched) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('visible', visibleCount === 0);
      }
    }

    [searchInput, regionFilter, typeFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', updateCards);
        control.addEventListener('change', updateCards);
      }
    });
  });
})();
