/**
 * Unified YouTube Player Engine for Linova Music
 * Seamlessly plays exact YouTube Music videos/tracks with full playback controls
 * (play, pause, seek, volume, time tracking, and auto-next).
 */

class YouTubePlayerEngine {
  constructor() {
    this.player = null;
    this.isReady = false;
    this.currentVideoId = null;
    this.timeUpdateInterval = null;
    this.onTimeUpdateCallback = null;
    this.onStateChangeCallback = null;
    this.onErrorCallback = null;
    this.initPromise = null;
    this.volume = 100;
  }

  init() {
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve) => {
      // Create off-screen container for player
      let container = document.getElementById('linova-yt-host');
      if (!container) {
        container = document.createElement('div');
        container.id = 'linova-yt-host';
        container.style.position = 'fixed';
        container.style.bottom = '-1000px';
        container.style.right = '-1000px';
        container.style.width = '200px';
        container.style.height = '200px';
        container.style.opacity = '0.01';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '-9999';
        
        const iframeDiv = document.createElement('div');
        iframeDiv.id = 'linova-yt-player-target';
        container.appendChild(iframeDiv);
        document.body.appendChild(container);
      }

      const createPlayer = () => {
        if (!window.YT || !window.YT.Player) {
          setTimeout(createPlayer, 100);
          return;
        }

        try {
          this.player = new window.YT.Player('linova-yt-player-target', {
            height: '200',
            width: '200',
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              enablejsapi: 1,
              fs: 0,
              modestbranding: 1,
              playsinline: 1,
              rel: 0,
              origin: window.location.origin
            },
            events: {
              onReady: () => {
                this.isReady = true;
                if (this.volume !== undefined) {
                  this.player.setVolume(this.volume);
                }
                resolve();
              },
              onStateChange: (event) => {
                this.handleStateChange(event.data);
              },
              onError: (err) => {
                console.warn('[YT Engine] Playback notice:', err.data);
                if (this.onErrorCallback) this.onErrorCallback(err);
              }
            }
          });
        } catch (e) {
          console.warn('[YT Engine] Init warning:', e.message);
          resolve();
        }
      };

      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        window.onYouTubeIframeAPIReady = createPlayer;
      } else {
        createPlayer();
      }
    });

    return this.initPromise;
  }

  handleStateChange(state) {
    // YT.PlayerState: -1 (UNSTARTED), 0 (ENDED), 1 (PLAYING), 2 (PAUSED), 3 (BUFFERING), 5 (CUED)
    if (state === 1) { // PLAYING
      this.startTimeTracking();
      if (this.onStateChangeCallback) this.onStateChangeCallback(true, false);
    } else if (state === 2) { // PAUSED
      this.stopTimeTracking();
      if (this.onStateChangeCallback) this.onStateChangeCallback(false, false);
    } else if (state === 0) { // ENDED
      this.stopTimeTracking();
      if (this.onStateChangeCallback) this.onStateChangeCallback(false, true);
    }
  }

  startTimeTracking() {
    this.stopTimeTracking();
    this.timeUpdateInterval = setInterval(() => {
      if (this.player && typeof this.player.getCurrentTime === 'function') {
        const current = this.player.getCurrentTime() || 0;
        const duration = this.player.getDuration() || 0;
        if (this.onTimeUpdateCallback) {
          this.onTimeUpdateCallback(current, duration);
        }
      }
    }, 100);
  }

  stopTimeTracking() {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }
  }

  async loadTrack(videoId) {
    await this.init();
    if (!this.player || typeof this.player.loadVideoById !== 'function') {
      return;
    }

    this.currentVideoId = videoId;
    this.player.loadVideoById({
      videoId,
      suggestedQuality: 'hd720'
    });
  }

  play() {
    if (this.player && typeof this.player.playVideo === 'function') {
      this.player.playVideo();
    }
  }

  pause() {
    if (this.player && typeof this.player.pauseVideo === 'function') {
      this.player.pauseVideo();
    }
  }

  seek(seconds) {
    if (this.player && typeof this.player.seekTo === 'function') {
      this.player.seekTo(seconds, true);
    }
  }

  setVolume(volZeroToOne) {
    const vol = Math.max(0, Math.min(100, Math.round(volZeroToOne * 100)));
    this.volume = vol;
    if (this.player && typeof this.player.setVolume === 'function') {
      this.player.setVolume(vol);
    }
  }

  destroy() {
    this.stopTimeTracking();
    if (this.player && typeof this.player.destroy === 'function') {
      this.player.destroy();
    }
  }
}

export const ytEngine = new YouTubePlayerEngine();
