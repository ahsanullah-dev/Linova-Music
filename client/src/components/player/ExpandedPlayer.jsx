import React from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Mic2,
  ArrowDownToLine,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore.js';
import { useLibraryStore } from '../../stores/libraryStore.js';
import { useOfflineStore } from '../../stores/offlineStore.js';
import { LyricsViewer } from './LyricsViewer.jsx';

export const ExpandedPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    shuffle,
    repeatMode,
    isExpanded,
    isLyricsOpen,
    togglePlay,
    seek,
    toggleShuffle,
    toggleRepeat,
    skipNext,
    skipPrevious,
    setIsExpanded,
    toggleLyrics
  } = usePlayerStore();

  const { likedTrackIds, toggleLike } = useLibraryStore();
  const { isTrackDownloaded, downloadTrack } = useOfflineStore();

  if (!isExpanded || !currentTrack) return null;

  const isLiked = likedTrackIds.has(currentTrack.id);
  const isDownloaded = isTrackDownloaded(currentTrack.id);

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col h-[100dvh] max-h-[100dvh] overflow-hidden px-4 sm:px-8 py-3 sm:py-5 select-none animate-in fade-in zoom-in-95 duration-200">
      {/* Top Header Bar (Fixed at top) */}
      <div className="flex items-center justify-between flex-shrink-0 mb-1">
        <button
          onClick={() => setIsExpanded(false)}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
          aria-label="Minimize Player"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="text-center px-4">
          <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-widest text-linova-cyan font-extrabold">
            <Sparkles className="w-3 h-3 text-linova-cyan animate-pulse" />
            <span>Now Playing</span>
          </div>
          <h5 className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
            {currentTrack.album?.name || currentTrack.title}
          </h5>
        </div>

        <button
          onClick={toggleLyrics}
          className={`p-2 rounded-full transition-all ${
            isLyricsOpen
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30 scale-105'
              : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
          title="Toggle Lyrics"
        >
          <Mic2 className="w-5 h-5" />
        </button>
      </div>

      {/* Center Display: Either Large Artwork or Synchronized Lyrics (Scrollable / Constrained) */}
      <div className="flex-1 min-h-0 w-full overflow-hidden flex items-center justify-center my-2">
        {isLyricsOpen ? (
          <div className="w-full max-w-2xl h-full overflow-y-auto scrollbar-none">
            <LyricsViewer />
          </div>
        ) : (
          <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 max-h-[38vh] aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-black/80 border border-white/10 flex-shrink-0">
            <img
              src={currentTrack.artwork || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80'}
              alt={currentTrack.title}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80';
              }}
              className={`w-full h-full object-cover transition-transform duration-700 ${
                isPlaying ? 'scale-105' : 'scale-100'
              }`}
            />
          </div>
        )}
      </div>

      {/* Bottom Track Controls & Progress Bar (Always 100% Pinned & Visible) */}
      <div className="w-full max-w-xl mx-auto flex-shrink-0 space-y-3 pt-2 pb-3">
        {/* Track Title, Artist, & Actions */}
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 mr-4">
            <h2 className="text-lg sm:text-2xl font-bold text-white truncate">
              {currentTrack.title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 truncate mt-0.5 font-medium">
              {currentTrack.artist}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {currentTrack.canDownload && (
              <button
                onClick={() => downloadTrack(currentTrack)}
                className={`p-2 rounded-full hover:bg-white/10 transition-colors ${
                  isDownloaded ? 'text-emerald-400' : 'text-gray-400 hover:text-white'
                }`}
                title={isDownloaded ? "Downloaded" : "Download"}
              >
                {isDownloaded ? <CheckCircle2 className="w-5 h-5" /> : <ArrowDownToLine className="w-5 h-5" />}
              </button>
            )}

            <button
              onClick={() => toggleLike(currentTrack)}
              className={`p-2 rounded-full hover:bg-white/10 transition-colors ${
                isLiked ? 'text-rose-500 scale-105' : 'text-gray-400 hover:text-white'
              }`}
              title={isLiked ? "Unlike" : "Like"}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Scrubber Bar */}
        <div>
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={position}
            onChange={(e) => seek(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-linova-cyan hover:accent-white transition-all"
          />
          <div className="flex justify-between text-xs text-gray-400 font-mono mt-1">
            <span>{formatTime(position)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={toggleShuffle}
            className={`p-2 rounded-full transition-colors ${
              shuffle ? 'text-linova-cyan' : 'text-gray-400 hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={skipPrevious}
            className="p-2 text-gray-200 hover:text-white hover:scale-105 transition-all"
            title="Previous"
          >
            <SkipBack className="w-7 h-7 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white hover:bg-gray-100 text-black flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
            ) : (
              <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={skipNext}
            className="p-2 text-gray-200 hover:text-white hover:scale-105 transition-all"
            title="Next"
          >
            <SkipForward className="w-7 h-7 fill-current" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`p-2 rounded-full transition-colors ${
              repeatMode !== 'off' ? 'text-linova-cyan' : 'text-gray-400 hover:text-white'
            }`}
            title="Repeat"
          >
            {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
