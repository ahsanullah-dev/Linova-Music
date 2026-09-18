import React from 'react';
import { Play, Pause, Heart, ArrowDownToLine, CheckCircle2, Loader2, Disc3 } from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore.js';
import { useLibraryStore } from '../../stores/libraryStore.js';
import { useOfflineStore } from '../../stores/offlineStore.js';
import { useAppStore } from '../../stores/appStore.js';
import { useAuthStore } from '../../stores/authStore.js';

export const TrackCard = ({ track, contextQueue = null }) => {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();
  const { likedTrackIds, toggleLike } = useLibraryStore();
  const { downloadTrack, isTrackDownloaded, downloadingIds } = useOfflineStore();
  const { showToast, openAuthModal } = useAppStore();
  const { isAuthenticated } = useAuthStore();

  if (!track) return null;

  const isCurrent = currentTrack?.id === track.id;
  const isLiked = likedTrackIds.has(track.id);
  const isDownloaded = isTrackDownloaded(track.id);
  const isDownloading = downloadingIds[track.id] !== undefined;

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, contextQueue || [track]);
    }
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    toggleLike(track);
    showToast(isLiked ? 'Removed from Liked Songs' : 'Added to Liked Songs', 'success');
  };

  const handleDownloadClick = async (e) => {
    e.stopPropagation();
    if (isDownloaded) {
      showToast('Track already saved offline', 'info');
      return;
    }
    if (!track.canDownload) {
      showToast('Offline download not supported for external streams', 'warning');
      return;
    }
    try {
      showToast(`Downloading "${track.title}" for offline play...`, 'info');
      await downloadTrack(track);
      showToast(`Saved "${track.title}" to offline library!`, 'success');
    } catch (err) {
      showToast('Failed to download track', 'error');
    }
  };

  return (
    <div
      onClick={handlePlayClick}
      className={`linova-glass-card p-3 rounded-2xl cursor-pointer flex flex-col justify-between relative group ${
        isCurrent ? 'ring-1 ring-linova-primary/50 shadow-glow-primary/20' : ''
      }`}
    >
      {/* Artwork container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-black/40 shadow-inner">
        <img
          src={track.artwork || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80'}
          alt={track.title}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Playing Animated Equalizer Overlay */}
        {isCurrent && isPlaying && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center gap-1">
            <span className="w-1.5 h-6 bg-linova-cyan rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" />
            <span className="w-1.5 h-8 bg-linova-primary rounded-full animate-[pulse_0.9s_ease-in-out_infinite]" />
            <span className="w-1.5 h-5 bg-linova-violet rounded-full animate-[pulse_0.4s_ease-in-out_infinite]" />
          </div>
        )}

        {/* Floating Gradient Play Button */}
        <div className={`absolute right-2.5 bottom-2.5 transition-all duration-300 ${
          isCurrent ? 'opacity-100 translate-y-0' : 'opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2'
        }`}>
          <button
            onClick={handlePlayClick}
            className="w-11 h-11 rounded-full bg-gradient-to-r from-linova-primary via-indigo-500 to-linova-cyan hover:scale-105 text-white flex items-center justify-center shadow-lg shadow-black/80 transition-transform"
            aria-label={isCurrent && isPlaying ? "Pause" : "Play"}
          >
            {isCurrent && isPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white ml-0.5" />
            )}
          </button>
        </div>

        {/* Downloaded Badge */}
        {isDownloaded && (
          <div className="absolute top-2 right-2 p-1 rounded-full bg-linova-emerald text-black shadow-md" title="Downloaded">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-bold truncate ${isCurrent ? 'text-linova-cyan' : 'text-gray-100 group-hover:text-white'}`}>
          {track.title}
        </h4>
        <p className="text-xs text-gray-400 truncate mt-0.5 font-medium">
          {track.artist}
        </p>
      </div>

      {/* Card Quick Actions */}
      <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-gray-400">
        <button
          onClick={handleLikeClick}
          className={`p-1.5 rounded-full hover:bg-white/10 transition-colors ${
            isLiked ? 'text-linova-rose' : 'hover:text-white'
          }`}
          title={isLiked ? "Unlike" : "Like"}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-linova-rose' : ''}`} />
        </button>

        {track.canDownload !== false && (
          <button
            onClick={handleDownloadClick}
            disabled={isDownloading || isDownloaded}
            className={`p-1.5 rounded-full hover:bg-white/10 transition-colors ${
              isDownloaded ? 'text-linova-emerald' : 'hover:text-white'
            }`}
            title={isDownloaded ? "Saved Offline" : "Download for Offline"}
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin text-linova-cyan" />
            ) : (
              <ArrowDownToLine className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
