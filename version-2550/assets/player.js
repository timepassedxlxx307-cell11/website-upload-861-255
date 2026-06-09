const MoviePlayer = {
  mount(videoId, layerId, streamUrl) {
    const video = document.getElementById(videoId);
    const layer = document.getElementById(layerId);

    if (!video || !streamUrl) {
      return;
    }

    let hls = null;

    const attach = function () {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (!video.src) {
          video.src = streamUrl;
        }
        return;
      }

      if (globalThis.Hls && globalThis.Hls.isSupported()) {
        if (!hls) {
          hls = new globalThis.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        }
      } else if (!video.src) {
        video.src = streamUrl;
      }
    };

    const play = function () {
      attach();
      if (layer) {
        layer.classList.add("hidden");
      }
      const promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (layer) {
            layer.classList.remove("hidden");
          }
        });
      }
    };

    if (layer) {
      layer.addEventListener("click", play);
    }

    video.addEventListener("play", function () {
      if (layer) {
        layer.classList.add("hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (video.currentTime === 0 && layer) {
        layer.classList.remove("hidden");
      }
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    attach();
  }
};

globalThis.MoviePlayer = MoviePlayer;
