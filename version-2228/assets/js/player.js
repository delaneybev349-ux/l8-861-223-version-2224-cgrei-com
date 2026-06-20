(function () {
  window.initMoviePlayer = function (rootId, src) {
    var root = document.getElementById(rootId);
    if (!root) {
      return;
    }

    var video = root.querySelector("video");
    var cover = root.querySelector(".player-cover");
    var hls = null;
    var loaded = false;

    function load() {
      if (loaded || !video) {
        return;
      }
      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function hideCover() {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    }

    function play() {
      load();
      hideCover();
      var request = video.play();
      if (request && typeof request.catch === "function") {
        request.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }

    if (video) {
      video.addEventListener("play", hideCover);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("error", function () {
        if (hls) {
          hls.destroy();
          hls = null;
          loaded = false;
        }
      });
    }
  };
})();
