(function () {
  function bindPlayer(shell) {
    var video = shell.querySelector('video');
    var cover = shell.querySelector('[data-play-cover]');
    var stream = shell.getAttribute('data-stream');
    var hlsInstance = null;
    var prepared = false;

    if (!video || !stream) {
      return;
    }

    function prepare() {
      if (prepared) {
        return Promise.resolve();
      }

      prepared = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.load();
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        return new Promise(function (resolve) {
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
        });
      }

      video.src = stream;
      video.load();
      return Promise.resolve();
    }

    function play() {
      if (cover) {
        cover.hidden = true;
      }
      prepare().then(function () {
        var request = video.play();
        if (request && typeof request.catch === 'function') {
          request.catch(function () {
            video.controls = true;
          });
        }
      });
    }

    if (cover) {
      cover.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(bindPlayer);
})();
