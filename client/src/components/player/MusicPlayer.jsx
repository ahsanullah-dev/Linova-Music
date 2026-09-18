import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Maximize2,
  Mic2,
  ListMusic,
  Heart,
  CheckCircle2,
  AlertCircle,
  PanelRightClose,
  PanelRightOpen
} from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore.js';
import { useLibraryStore } from '../../stores/libraryStore.js';
import { useOfflineStore } from '../../stores/offlineStore.js';
import { useAppStore } from '../../stores/appStore.js';
import { useAuthStore } from '../../stores/authStore.js';

export const MusicPlayer = () => {
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    volume,
    isMuted,
    shuffle,
    repeatMode,
    isLyricsOpen,
    isQueueOpen,
    playbackError,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    skipNext,
    skipPrevious,
    setIsExpanded,
    toggleLyrics,
    toggleQueue
  } = usePlayerStore();

  const { likedTrackIds, toggleLike } = useLibraryStore();
  const { isTrackDownloaded } = useOfflineStore();
  const { showToast, openAuthModal } = useAppStore();
  const { isAuthenticated } = useAuthStore();

  if (!currentTrack) return null;

  const isLiked = likedTrackIds.has(currentTrack.id);
  const isDownloaded = isTrackDownloaded(currentTrack.id);

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeekChange = (e) => {
    setIsSeeking(true);
    setSeekValue(parseFloat(e.target.value));
  };

  const handleSeekCommit = (e) => {
    setIsSeeking(false);
    seek(parseFloat(e.target.value));
  };

  const currentDisplayPosition = isSeeking ? seekValue : position;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 md:h-24 bg-[#09090b]/95 backdrop-blur-2xl border-t border-white/10 z-40 px-3 md:px-6 flex items-center justify-between shadow-2xl pb-safe">
      {/* Track Info (Left) */}
      <div className="flex items-center gap-3 w-1/4 min-w-[170px] max-w-[320px]">
        <div
          onClick={() => setIsExpanded(true)}
          className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 cursor-pointer group shadow-lg"
        >
          <img
            src={currentTrack.artwork || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80'}
            alt={currentTrack.title}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80';
            }}
            className={`w-full h-full object-cover transition-transform ${isPlaying ? 'scale-105' : ''}`}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Maximize2 className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4
              onClick={() => setIsExpanded(true)}
              className="text-xs md:text-sm font-bold text-gray-100 hover:text-emerald-400 cursor-pointer truncate transition-colors"
            >
              {currentTrack.title}
            </h4>
            {isDownloaded && (
              <span title="Playing from offline storage">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              </span>
            )}
          </div>
          <p className="text-[11px] md:text-xs text-gray-400 truncate mt-0.5 font-medium">
            {currentTrack.artist}
          </p>
        </div>

        <button
          onClick={() => {
            if (!isAuthenticated) return openAuthModal('login');
            toggleLike(currentTrack);
            showToast(isLiked ? 'Removed from Liked Songs' : 'Added to Liked Songs', 'success');
          }}
          className={`hidden sm:block p-1.5 rounded-full hover:bg-white/10 transition-colors ${
            isLiked ? 'text-emerald-400' : 'text-gray-400 hover:text-white'
          }`}
          title={isLiked ? "Unlike" : "Like"}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-emerald-400' : ''}`} />
        </button>
      </div>

      {/* Center Controls & Scrubber */}
      <div className="flex-1 max-w-xl mx-2 md:mx-6 flex flex-col items-center">
        {playbackError && (
          <div className="text-[11px] text-rose-400 flex items-center gap-1 mb-1 animate-pulse font-medium">
            <AlertCircle className="w-3 h-3" />
            <span>{playbackError}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-4 md:gap-6 mb-1">
          <button
            onClick={toggleShuffle}
            className={`hidden sm:block p-1 rounded-full transition-colors ${
              shuffle ? 'text-emerald-400' : 'text-gray-400 hover:text-white'
            }`}
            title={shuffle ? "Disable Shuffle" : "Enable Shuffle"}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={skipPrevious}
            className="p-1 text-gray-300 hover:text-white transition-colors"
            title="Previous (Ctrl + Left)"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-white hover:bg-gray-200 text-black flex items-center justify-center shadow-lg hover:scale-105 transition-all"
            title={isPlaying ? "Pause (Space)" : "Play (Space)"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={skipNext}
            className="p-1 text-gray-300 hover:text-white transition-colors"
            title="Next (Ctrl + Right)"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`hidden sm:block p-1 rounded-full transition-colors ${
              repeatMode !== 'off' ? 'text-emerald-400' : 'text-gray-400 hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>

        {/* Scrubber Progress Bar */}
        <div className="w-full flex items-center gap-2 text-[11px] font-mono text-gray-400">
          <span className="w-9 text-right text-[11px]">{formatTime(currentDisplayPosition)}</span>
          <div className="relative flex-1 flex items-center group py-2 cursor-pointer">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentDisplayPosition}
              onChange={handleSeekChange}
              onMouseUp={handleSeekCommit}
              onTouchEnd={handleSeekCommit}
              className="w-full h-1 group-hover:h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400 transition-all"
            />
          </div>
          <span className="w-9 text-[11px]">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right Tools (Lyrics, Queue, Volume Slider, Fullscreen) */}
      <div className="hidden md:flex items-center justify-end gap-3 w-1/4 min-w-[170px]">
        <button
          onClick={toggleLyrics}
          className={`p-2 rounded-full transition-colors ${
            isLyricsOpen ? 'text-emerald-400 bg-white/10' : 'text-gray-400 hover:text-white'
          }`}
          title="Lyrics"
        >
          <Mic2 className="w-4 h-4" />
        </button>

        <button
          onClick={toggleQueue}
          className={`p-2 rounded-full transition-colors ${
            isQueueOpen ? 'text-emerald-400 bg-white/10' : 'text-gray-400 hover:text-white'
          }`}
          title="Queue"
        >
          <ListMusic className="w-4 h-4" />
        </button>

        <button
          onClick={usePlayerStore.getState().toggleNowPlayingPanel}
          className={`hidden xl:block p-2 rounded-full transition-colors ${
            usePlayerStore((s) => s.isNowPlayingPanelOpen) ? 'text-emerald-400 bg-white/10' : 'text-gray-400 hover:text-white'
          }`}
          title="Now Playing View (Singer Details)"
        >
          {usePlayerStore((s) => s.isNowPlayingPanelOpen) ? (
            <PanelRightClose className="w-4 h-4" />
          ) : (
            <PanelRightOpen className="w-4 h-4" />
          )}
        </button>

        {/* Volume Control Slider */}
        <div className="flex items-center gap-2 group">
          <button
            onClick={toggleMute}
            className="text-gray-400 hover:text-white transition-colors"
            title={isMuted ? "Unmute (M)" : "Mute (M)"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : volume < 0.5 ? (
              <Volume1 className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 sm:w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
        </div>

        <button
          onClick={() => setIsExpanded(true)}
          className="p-2 text-gray-400 hover:text-white rounded-full transition-colors"
          title="Expand View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
