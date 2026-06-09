(function () {
  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function prepare(card) {
    var video = card.querySelector('video');
    var button = card.querySelector('.player-button');
    var url = card.getAttribute('data-url');
    var loaded = false;
    var hls = null;
    if (!video || !button || !url) {
      return;
    }
    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
      card.hlsPlayer = hls;
    }
    function play() {
      attach();
      card.classList.add('is-playing');
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          card.classList.remove('is-playing');
        });
      }
    }
    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
  }

  onReady(function () {
    Array.prototype.slice.call(document.querySelectorAll('.player-card')).forEach(prepare);
  });
})();
