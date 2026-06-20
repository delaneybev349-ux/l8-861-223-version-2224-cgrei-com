(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', panel.classList.contains('is-open') ? 'true' : 'false');
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initSearchForms() {
    Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        var target = form.getAttribute('data-target') || './search.html';
        if (form.hasAttribute('data-local-search')) {
          filterCards(query, getActiveFilter());
          return;
        }
        window.location.href = query ? target + '?q=' + encodeURIComponent(query) : target;
      });
    });
  }

  function getActiveFilter() {
    var active = document.querySelector('.filter-button.is-active');
    return active ? active.getAttribute('data-filter') || 'all' : 'all';
  }

  function filterCards(query, typeFilter) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
    if (!cards.length) {
      return;
    }
    var normalizedQuery = normalize(query);
    var normalizedType = normalize(typeFilter || 'all');
    var visibleCount = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-text'));
      var type = normalize(card.getAttribute('data-type'));
      var matchesQuery = !normalizedQuery || text.indexOf(normalizedQuery) !== -1;
      var matchesType = normalizedType === 'all' || type === normalizedType;
      var visible = matchesQuery && matchesType;
      card.style.display = visible ? '' : 'none';
      if (visible) {
        visibleCount += 1;
      }
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-no-results]')).forEach(function (empty) {
      empty.classList.toggle('is-visible', visibleCount === 0);
    });
  }

  function initLocalSearch() {
    var input = document.querySelector('[data-local-query]');
    if (!input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    if (initialQuery) {
      input.value = initialQuery;
    }
    input.addEventListener('input', function () {
      filterCards(input.value, getActiveFilter());
    });
    filterCards(input.value, getActiveFilter());
  }

  function initFilters() {
    Array.prototype.slice.call(document.querySelectorAll('.filter-button')).forEach(function (button) {
      button.addEventListener('click', function () {
        Array.prototype.slice.call(document.querySelectorAll('.filter-button')).forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        var input = document.querySelector('[data-local-query]');
        filterCards(input ? input.value : '', button.getAttribute('data-filter'));
      });
    });
  }

  window.initializePlayer = function (sourceUrl) {
    var video = document.getElementById('movie-player');
    var cover = document.querySelector('[data-player-cover]');
    var trigger = document.querySelector('[data-player-trigger]');
    if (!video || !sourceUrl) {
      return;
    }

    var loaded = false;
    var hlsInstance = null;

    function bindSource() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
          }
        });
      } else {
        video.src = sourceUrl;
      }
    }

    function playVideo() {
      bindSource();
      if (cover) {
        cover.style.opacity = '0';
        cover.style.pointerEvents = 'none';
      }
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener('click', playVideo);
    }
    if (cover) {
      cover.addEventListener('click', playVideo);
    }
    video.addEventListener('click', function () {
      if (!loaded) {
        playVideo();
      }
    });
  };

  ready(function () {
    initMobileMenu();
    initHeroSlider();
    initSearchForms();
    initFilters();
    initLocalSearch();
  });
})();
