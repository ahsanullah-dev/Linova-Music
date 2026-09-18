import { create } from 'zustand';
import { offlineStorage } from '../services/offlineStorage.js';
import { api } from '../services/api.js';
import { audioEngine } from '../services/audioEngine.js';
import { ytEngine } from '../services/youtubePlayerEngine.js';

let loggedHistoryForTrack = null;

export const usePlayerStore = create((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  volume: parseFloat(localStorage.getItem('linova_volume') || '1.0'),
  isMuted: false,
  queue: [],
  originalQueue: [],
  currentIndex: -1,
  shuffle: false,
  repeatMode: 'off', // 'off' | 'all' | 'one'
  isExpanded: false,
  isLyricsOpen: false,
  isQueueOpen: false,
  isNowPlayingPanelOpen: localStorage.getItem('linova_now_playing_panel') !== 'false',
  playbackError: null,
  // Autoplay radio: keeps playing genre-matched songs when the queue runs out
  autoplayRadio: localStorage.getItem('linova_autoplay_radio') !== 'false',
  isLoadingRadio: false,
  radioGenreLabel: null,
  playedTrackIds: [],
  lyrics: null,
  isLoadingLyrics: false,
  activeEngine: 'youtube', // 'youtube' | 'native'

  initialize: () => {
    const audio = audioEngine.audio;
    audioEngine.setVolume(get().volume);
    ytEngine.setVolume(get().volume);

    // Setup YouTube engine callbacks
    ytEngine.onTimeUpdateCallback = (pos, dur) => {
      const durationVal = dur > 0 ? dur : (get().currentTrack?.duration || 0);
      set({ position: pos, duration: durationVal });

      const track = get().currentTrack;
      if (track && pos >= 10 && loggedHistoryForTrack !== track.id) {
        loggedHistoryForTrack = track.id;
        api.addHistory(track, Math.min(100, Math.round((pos / (durationVal || 1)) * 100))).catch(() => {});
      }
    };

    ytEngine.onStateChangeCallback = (isPlaying, isEnded) => {
      set({ isPlaying, playbackError: null });
      if (isEnded) {
        const { repeatMode, skipNext } = get();
        if (repeatMode === 'one') {
          ytEngine.seek(0);
          ytEngine.play();
        } else {
          skipNext();
        }
      }
    };

    ytEngine.onErrorCallback = () => {
      set({
        isPlaying: false,
        playbackError: 'Could not load stream. Skipping to next...'
      });
      setTimeout(() => get().skipNext(), 1500);
    };

    // Setup Native HTML5 Audio callbacks
    audio.ontimeupdate = () => {
      if (get().activeEngine !== 'native') return;
      const pos = audio.currentTime;
      set({ position: pos, duration: audio.duration || get().currentTrack?.duration || 0 });

      const track = get().currentTrack;
      if (track && pos >= 10 && loggedHistoryForTrack !== track.id) {
        loggedHistoryForTrack = track.id;
        api.addHistory(track, Math.min(100, Math.round((pos / (audio.duration || 1)) * 100))).catch(() => {});
      }
    };

    audio.onended = () => {
      if (get().activeEngine !== 'native') return;
      const { repeatMode, skipNext } = get();
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        skipNext();
      }
    };

    audio.onerror = (e) => {
      if (get().activeEngine !== 'native') return;
      console.warn('[Player] Audio playback error:', e);
      set({
        isPlaying: false,
        playbackError: 'Playback error: Audio stream currently unavailable.'
      });
    };

    audio.onplay = () => {
      if (get().activeEngine === 'native') {
        audioEngine.resumeContext();
        set({ isPlaying: true, playbackError: null });
      }
    };
    audio.onpause = () => {
      if (get().activeEngine === 'native') {
        set({ isPlaying: false });
      }
    };

    // Setup MediaSession handlers
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => get().play());
      navigator.mediaSession.setActionHandler('pause', () => get().pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => get().skipPrevious());
      navigator.mediaSession.setActionHandler('nexttrack', () => get().skipNext());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime) get().seek(details.seekTime);
      });
    }
  },

  playTrack: async (track, contextQueue = null) => {
    if (!track) return;

    set({ playbackError: null });

    if (contextQueue && Array.isArray(contextQueue) && contextQueue.length > 0) {
      const index = contextQueue.findIndex(t => t.id === track.id);
      set({
        queue: contextQueue,
        originalQueue: contextQueue,
        currentIndex: index >= 0 ? index : 0
      });
    } else if (get().queue.length === 0) {
      set({ queue: [track], originalQueue: [track], currentIndex: 0 });
    } else {
      const idx = get().queue.findIndex(t => t.id === track.id);
      if (idx >= 0) {
        set({ currentIndex: idx });
      } else {
        const nextQueue = [track, ...get().queue];
        set({ queue: nextQueue, originalQueue: nextQueue, currentIndex: 0 });
      }
    }

    set((state) => ({
      currentTrack: track,
      position: 0,
      // Remember what we've played so the radio never serves it back to us.
      playedTrackIds: [track.id, ...state.playedTrackIds.filter((id) => id !== track.id)].slice(0, 100)
    }));

    // Warm the radio up before the queue actually runs dry, so the transition
    // into the next song has no gap.
    const { queue, currentIndex, autoplayRadio, repeatMode } = get();
    if (autoplayRadio && repeatMode !== 'all' && queue.length - currentIndex <= 2) {
      get().extendQueueWithRadio(track);
    }

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album?.name || '',
        artwork: [
          { src: track.artwork || '', sizes: '512x512', type: 'image/jpeg' }
        ]
      });
    }

    try {
      const offlineBlobUrl = await offlineStorage.getOfflineAudioUrl(track.id);

      if (offlineBlobUrl) {
        // Play downloaded offline blob through HTML5 Audio
        ytEngine.pause();
        set({ activeEngine: 'native' });
        audioEngine.initWebAudio();
        audioEngine.resumeContext();
        audioEngine.audio.src = offlineBlobUrl;
        audioEngine.audio.load();
        await audioEngine.audio.play();
        set({ isPlaying: true });
      } else {
        // Stream exact YouTube track video audio
        audioEngine.audio.pause();
        audioEngine.audio.src = '';
        set({ activeEngine: 'youtube' });
        
        const videoId = track.videoId || track.id.replace(/^yt_/, '');
        await ytEngine.loadTrack(videoId);
        ytEngine.play();
        set({ isPlaying: true });
      }

      get().fetchTrackLyrics(track);
    } catch (error) {
      console.warn('[Player] Play failed:', error);
      set({ isPlaying: false, playbackError: 'Could not start audio playback.' });
    }
  },

  play: async () => {
    const { activeEngine, currentTrack } = get();
    if (activeEngine === 'youtube') {
      ytEngine.play();
      set({ isPlaying: true });
    } else {
      audioEngine.initWebAudio();
      audioEngine.resumeContext();
      if (audioEngine.audio.src) {
        try {
          await audioEngine.audio.play();
          set({ isPlaying: true });
        } catch (e) {
          console.error(e);
        }
      } else if (currentTrack) {
        get().playTrack(currentTrack);
      }
    }
  },

  pause: () => {
    const { activeEngine } = get();
    if (activeEngine === 'youtube') {
      ytEngine.pause();
    } else {
      audioEngine.audio.pause();
    }
    set({ isPlaying: false });
  },

  togglePlay: () => {
    if (get().isPlaying) {
      get().pause();
    } else {
      get().play();
    }
  },

  seek: (seconds) => {
    const { activeEngine } = get();
    if (activeEngine === 'youtube') {
      ytEngine.seek(seconds);
      set({ position: seconds });
    } else {
      if (audioEngine.audio.duration) {
        const targetTime = Math.max(0, Math.min(seconds, audioEngine.audio.duration));
        audioEngine.audio.currentTime = targetTime;
        set({ position: targetTime });
      }
    }
  },

  setVolume: (val) => {
    const clamped = Math.max(0, Math.min(1.0, val));
    audioEngine.setVolume(clamped);
    ytEngine.setVolume(clamped);
    localStorage.setItem('linova_volume', clamped.toString());
    set({ volume: clamped, isMuted: clamped === 0 });
  },

  toggleMute: () => {
    const { isMuted, volume } = get();
    if (isMuted) {
      const nextVol = volume > 0 ? volume : 1.0;
      audioEngine.setVolume(nextVol);
      ytEngine.setVolume(nextVol);
      set({ isMuted: false });
    } else {
      audioEngine.setVolume(0);
      ytEngine.setVolume(0);
      set({ isMuted: true });
    }
  },

  toggleShuffle: () => {
    const { shuffle, queue, currentTrack, originalQueue } = get();
    if (!shuffle) {
      const remaining = queue.filter(t => t.id !== currentTrack?.id);
      const shuffled = [...remaining].sort(() => Math.random() - 0.5);
      const newQueue = currentTrack ? [currentTrack, ...shuffled] : shuffled;
      set({ shuffle: true, queue: newQueue, currentIndex: 0 });
    } else {
      const currentIdx = originalQueue.findIndex(t => t.id === currentTrack?.id);
      set({ shuffle: false, queue: originalQueue, currentIndex: currentIdx >= 0 ? currentIdx : 0 });
    }
  },

  toggleRepeat: () => {
    const { repeatMode } = get();
    const modes = ['off', 'all', 'one'];
    const nextMode = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
    set({ repeatMode: nextMode });
  },

  toggleAutoplayRadio: () => {
    const next = !get().autoplayRadio;
    localStorage.setItem('linova_autoplay_radio', String(next));
    set({ autoplayRadio: next });
  },

  /**
   * Spotify-style continuation. When the queue runs dry we don't stop - we pull
   * a genre-matched radio queue seeded from the track that just played, so a
   * single song opened from search rolls into similar music automatically.
   */
  extendQueueWithRadio: async (seedTrack) => {
    const { queue, autoplayRadio, isLoadingRadio, playedTrackIds } = get();
    if (!autoplayRadio || isLoadingRadio) return [];

    const seed = seedTrack || get().currentTrack;
    if (!seed) return [];

    set({ isLoadingRadio: true });
    try {
      const exclude = Array.from(
        new Set([...queue.map((t) => t.id), ...playedTrackIds])
      ).filter(Boolean);

      const radio = await api.getRadio(seed, exclude, 20);
      const tracks = (radio?.tracks || []).filter(
        (t) => t && t.id && !queue.some((q) => q.id === t.id)
      );

      if (tracks.length > 0) {
        set((state) => ({
          queue: [...state.queue, ...tracks],
          originalQueue: [...state.originalQueue, ...tracks],
          radioGenreLabel: radio?.genreLabel || null
        }));
      }

      return tracks;
    } catch (error) {
      console.warn('[Player] Could not load autoplay radio:', error);
      return [];
    } finally {
      set({ isLoadingRadio: false });
    }
  },

  skipNext: async () => {
    const { queue, currentIndex, repeatMode, playTrack, extendQueueWithRadio } = get();
    if (queue.length === 0) return;

    let nextIndex = currentIndex + 1;

    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        // Try to keep the music going with a genre-matched radio queue before
        // giving up and stopping playback.
        const added = await extendQueueWithRadio(queue[currentIndex] || get().currentTrack);
        if (added.length === 0) {
          set({ isPlaying: false });
          return;
        }
      }
    }

    const nextQueue = get().queue;
    const nextTrack = nextQueue[nextIndex];
    if (!nextTrack) {
      set({ isPlaying: false });
      return;
    }

    set({ currentIndex: nextIndex });
    playTrack(nextTrack);
  },

  skipPrevious: () => {
    const { queue, currentIndex, position, playTrack, seek } = get();

    if (position > 3) {
      seek(0);
      return;
    }

    if (queue.length === 0) return;

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = queue.length - 1;
    }

    set({ currentIndex: prevIndex });
    playTrack(queue[prevIndex]);
  },

  addToQueue: (track) => {
    set(state => ({
      queue: [...state.queue, track],
      originalQueue: [...state.originalQueue, track]
    }));
  },

  playNext: (track) => {
    const { queue, currentIndex } = get();
    const newQueue = [...queue];
    newQueue.splice(currentIndex + 1, 0, track);
    set({ queue: newQueue });
  },

  removeFromQueue: (index) => {
    set(state => {
      const newQueue = state.queue.filter((_, idx) => idx !== index);
      let nextIndex = state.currentIndex;
      if (index < state.currentIndex) nextIndex -= 1;
      return { queue: newQueue, currentIndex: Math.max(0, nextIndex) };
    });
  },

  clearQueue: () => {
    const { currentTrack } = get();
    set({
      queue: currentTrack ? [currentTrack] : [],
      originalQueue: currentTrack ? [currentTrack] : [],
      currentIndex: 0
    });
  },

  setIsExpanded: (val) => set({ isExpanded: val }),
  toggleLyrics: () => {
    const { isLyricsOpen, currentTrack, fetchTrackLyrics } = get();
    const nextState = !isLyricsOpen;
    set({
      isLyricsOpen: nextState
    });
    if (nextState && currentTrack) {
      fetchTrackLyrics(currentTrack);
    }
  },
  toggleQueue: () => set(state => ({ isQueueOpen: !state.isQueueOpen })),
  toggleNowPlayingPanel: () => {
    const next = !get().isNowPlayingPanelOpen;
    localStorage.setItem('linova_now_playing_panel', next.toString());
    set({ isNowPlayingPanelOpen: next });
  },

  fetchTrackLyrics: async (track) => {
    if (!track) return;
    set({ isLoadingLyrics: true });
    try {
      const result = await api.getLyrics(track.id, track.title, track.artist);
      set({ lyrics: result, isLoadingLyrics: false });
    } catch {
      set({
        lyrics: {
          synced: false,
          lines: []
        },
        isLoadingLyrics: false
      });
    }
  }
}));
