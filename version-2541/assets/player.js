(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (root) {
        var video = root.querySelector('video');
        var cover = root.querySelector('[data-player-cover]');
        var videoUrl = root.getAttribute('data-video-url');
        var hlsInstance = null;
        var loaded = false;

        function startVideo() {
            if (!video || !videoUrl) {
                return;
            }

            if (!loaded) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = videoUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                    });
                    hlsInstance.loadSource(videoUrl);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = videoUrl;
                }

                loaded = true;
                video.controls = true;
            }

            if (cover) {
                cover.classList.add('is-hidden');
            }

            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', startVideo);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!loaded) {
                    startVideo();
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    });
})();
