(function () {
  document.querySelectorAll('[data-player]').forEach(function (player) {
    const video = player.querySelector('video');
    const cover = player.querySelector('.player-cover');
    const streamUrl = player.getAttribute('data-stream');
    let started = false;
    let hls = null;

    if (!video || !streamUrl) {
      return;
    }

    const load = function () {
      if (started) {
        return;
      }
      started = true;

      if (cover) {
        cover.classList.add('is-hidden');
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {});
        }, { once: true });
        video.load();
      }
    };

    if (cover) {
      cover.addEventListener('click', load);
    }

    video.addEventListener('click', function () {
      if (!started) {
        load();
      } else if (video.paused) {
        video.play().catch(function () {});
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });
})();
