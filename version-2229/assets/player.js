(function () {
  function mount(videoId, coverId, source) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var attached = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      attached = true;
    }

    function play() {
      attach();

      if (cover) {
        cover.classList.add('is-hidden');
      }

      video.setAttribute('controls', 'controls');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (!attached) {
        play();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  window.SitePlayer = {
    mount: mount
  };
})();
