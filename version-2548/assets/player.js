(function () {
    function initializeMoviePlayer(sourceUrl) {
        var video = document.querySelector('[data-video-player]');
        var overlay = document.querySelector('[data-player-overlay]');
        var prepared = false;
        var hlsInstance = null;

        if (!video || !sourceUrl) {
            return;
        }

        function attachSource() {
            if (prepared) {
                return;
            }

            prepared = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = sourceUrl;
        }

        function startPlayback() {
            attachSource();

            if (overlay) {
                overlay.classList.add('is-hidden');
            }

            video.controls = true;
            var playAttempt = video.play();

            if (playAttempt && typeof playAttempt.catch === 'function') {
                playAttempt.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', startPlayback);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.initializeMoviePlayer = initializeMoviePlayer;
})();
