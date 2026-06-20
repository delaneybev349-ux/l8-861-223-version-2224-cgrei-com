(function () {
  function initializeMoviePlayer(videoUrl) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    var playButtons = Array.prototype.slice.call(document.querySelectorAll("[data-play-button]"));
    var hasStarted = false;
    var hlsInstance = null;
    if (!video || !videoUrl) {
      return;
    }
    function requestPlay() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }
    function start() {
      if (hasStarted) {
        requestPlay();
        return;
      }
      hasStarted = true;
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
        requestPlay();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 40,
          backBufferLength: 60
        });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on("hlsManifestParsed", requestPlay);
        requestPlay();
        return;
      }
      video.src = videoUrl;
      requestPlay();
    }
    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!hasStarted) {
        start();
      }
    });
    playButtons.forEach(function (button) {
      button.addEventListener("click", start);
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }
  window.initializeMoviePlayer = initializeMoviePlayer;
})();
