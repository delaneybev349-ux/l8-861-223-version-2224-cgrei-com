(function () {
  var shell = document.querySelector('[data-player]');

  if (!shell) {
    return;
  }

  var video = shell.querySelector('.movie-player');
  var cover = shell.querySelector('.player-cover');
  var streamUrl = shell.getAttribute('data-stream');
  var ready = false;
  var hlsInstance = null;

  function preparePlayer() {
    if (!video || !streamUrl || ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls();
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function playVideo() {
    preparePlayer();

    if (cover) {
      cover.classList.add('hidden');
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', playVideo);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('hidden');
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
