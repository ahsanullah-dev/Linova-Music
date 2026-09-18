import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  Heart,
  ArrowDownToLine,
  CheckCircle2,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash2,
  Share2,
  ListPlus,
  Disc,
  User
} from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore.js';
import { useLibraryStore } from '../../stores/libraryStore.js';
import { useOfflineStore } from '../../stores/offlineStore.js';
import { useAppStore } from '../../stores/appStore.js';
import { useAuthStore } from '../../stores/authStore.js';

export const TrackRow = ({
  track,
  index,
  contextQueue = null,
  showAlbum = true,
  onRemove = null
}) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const { currentTrack, isPlaying, playTrack, togglePlay, addToQueue, playNext } = usePlayerStore();
  const { likedTrackIds, toggleLike, playlists, addTrackToPlaylist } = useLibraryStore();
  const { downloadTrack, isTrackDownloaded, downloadingIds, removeDownloadedTrack } = useOfflineStore();
  const { showToast, openAuthModal } = useAppStore();
  const { isAuthenticated } = useAuthStore();

  if (!track) return null;

  const isCurrent = currentTrack?.id === track.id;
  const isLiked = likedTrackIds.has(track.id);
  const isDownloaded = isTrackDownloaded(track.id);
  const isDownloading = downloadingIds[track.id] !== undefined;

  const formatDuration = (sec) => {
    if (!sec) return '--:--';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleRowClick = () => {
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
      await removeDownloadedTrack(track.id);
      showToast(`Removed "${track.title}" from offline storage`, 'info');
      return;
    }
    if (!track.canDownload) {
      showToast('Offline download not supported for external streams', 'warning');
      return;
    }
    try {
      showToast(`Downloading "${track.title}"...`, 'info');
      await downloadTrack(track);
      showToast(`Saved "${track.title}" to offline library!`, 'success');
    } catch (err) {
      showToast('Failed to download track', 'error');
    }
  };

  const handleAddToPlaylist = async (playlistId, e) => {
    e.stopPropagation();
    setShowMenu(false);
    try {
      await addTrackToPlaylist(playlistId, track);
      showToast(`Added to playlist!`, 'success');
    } catch (err) {
      showToast('Could not add track to playlist', 'error');
    }
  };

  const handleCopyLink = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    const url = `${window.location.origin}/search?q=${encodeURIComponent(track.title)}`;
    navigator.clipboard.writeText(url);
    showToast('Song link copied to clipboard!', 'success');
  };

  return (
    <div
      onClick={handleRowClick}
      className={`group flex items-center gap-4 px-4 py-2.5 rounded-xl hover:bg-white/10 transition-all cursor-pointer select-none relative ${
        isCurrent ? 'bg-white/10' : ''
      }`}
    >
      {/* Index or Spotify Equalizer / Play Icon */}
      <div className="w-6 text-center text-xs font-bold text-gray-400 flex items-center justify-center">
        {isCurrent && isPlaying ? (
          <div className="flex items-end gap-[2px] h-3.5">
            <span className="w-1 bg-linova-spotify animate-[pulse_0.6s_ease-in-out_infinite] h-full rounded-full" />
            <span className="w-1 bg-linova-spotify animate-[pulse_0.9s_ease-in-out_infinite] h-2/3 rounded-full" />
            <span className="w-1 bg-linova-spotify animate-[pulse_0.4s_ease-in-out_infinite] h-4/5 rounded-full" />
          </div>
        ) : (
          <span className="group-hover:hidden">
            {index !== undefined ? index + 1 : ''}
          </span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); handleRowClick(); }}
          className={`${isCurrent && isPlaying ? 'hidden' : 'hidden group-hover:flex'} text-white hover:text-linova-spotify transition-colors`}
          aria-label={isCurrent && isPlaying ? "Pause" : "Play"}
        >
          {isCurrent && isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
        </button>
      </div>

      {/* Thumbnail */}
      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 relative shadow-sm">
        <img
          src={track.artwork || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80'}
          alt={track.title}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80';
          }}
          className="w-full h-full object-cover"
        />
        {isDownloaded && (
          <div className="absolute bottom-0.5 right-0.5 p-0.5 rounded-full bg-emerald-500 text-white shadow">
            <CheckCircle2 className="w-2.5 h-2.5" />
          </div>
        )}
      </div>

      {/* Title & Artist */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className={`text-sm font-bold truncate ${isCurrent ? 'text-linova-spotify' : 'text-gray-100 group-hover:text-white'}`}>
            {track.title}
          </h4>
          {track.explicit && (
            <span className="px-1 py-0.2 rounded bg-gray-600 text-black text-[9px] font-extrabold uppercase">
              E
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 truncate mt-0.5">
          <span
            onClick={(e) => {
              if (track.artists?.[0]?.id) {
                e.stopPropagation();
                navigate(`/artist/${track.artists[0].id}`);
              }
            }}
            className="hover:underline hover:text-gray-200"
          >
            {track.artist}
          </span>
        </p>
      </div>

      {/* Album Name */}
      {showAlbum && (
        <div
          onClick={(e) => {
            if (track.album?.id && track.album.id !== 'album-0') {
              e.stopPropagation();
              navigate(`/album/${track.album.id}`);
            }
          }}
          className="hidden md:block flex-1 min-w-0 text-xs text-gray-400 hover:text-white truncate cursor-pointer hover:underline"
        >
          {track.album?.name || 'Single'}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 sm:gap-2 text-gray-400">
        <button
          onClick={handleLikeClick}
          className={`p-2 rounded-full hover:bg-white/10 transition-colors ${
            isLiked ? 'text-linova-spotify' : 'opacity-0 group-hover:opacity-100 hover:text-white'
          }`}
          title={isLiked ? "Unlike" : "Like"}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-linova-spotify' : ''}`} />
        </button>

        {track.canDownload !== false && (
          <button
            onClick={handleDownloadClick}
            disabled={isDownloading}
            className={`p-2 rounded-full hover:bg-white/10 transition-colors ${
              isDownloaded ? 'text-emerald-400' : 'opacity-0 group-hover:opacity-100 hover:text-white'
            }`}
            title={isDownloaded ? "Saved Offline (Click to remove)" : "Download for Offline"}
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin text-linova-spotify" />
            ) : isDownloaded ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <ArrowDownToLine className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Duration */}
        <span className="text-xs text-gray-400 font-mono w-10 text-right">
          {formatDuration(track.duration)}
        </span>

        {/* Dropdown Options */}
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
            aria-label="Track Options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 bottom-full mb-2 w-52 rounded-2xl glass-panel shadow-2xl py-2 z-40 border border-white/10 text-xs animate-in zoom-in-95"
            >
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(false); addToQueue(track); showToast('Added to Queue', 'info'); }}
                className="w-full text-left px-4 py-2 text-gray-200 hover:bg-white/10 flex items-center gap-2.5 transition-colors"
              >
                <ListPlus className="w-4 h-4 text-gray-400" />
                <span>Add to Queue</span>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(false); playNext(track); showToast('Will play next', 'info'); }}
                className="w-full text-left px-4 py-2 text-gray-200 hover:bg-white/10 flex items-center gap-2.5 transition-colors"
              >
                <Play className="w-4 h-4 text-gray-400" />
                <span>Play Next</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="w-full text-left px-4 py-2 text-gray-200 hover:bg-white/10 flex items-center gap-2.5 transition-colors"
              >
                <Share2 className="w-4 h-4 text-gray-400" />
                <span>Share & Copy Link</span>
              </button>

              <div className="h-[1px] bg-white/10 my-1" />

              <div className="px-4 py-1 text-gray-500 font-bold uppercase tracking-wider text-[9px]">
                Add to Playlist
              </div>

              {playlists.length === 0 ? (
                <div className="px-4 py-1.5 text-gray-500 italic text-[11px]">No playlists created</div>
              ) : (
                playlists.map(pl => (
                  <button
                    key={pl._id}
                    onClick={(e) => handleAddToPlaylist(pl._id, e)}
                    className="w-full text-left px-4 py-1.5 text-gray-300 hover:bg-linova-spotify hover:text-black flex items-center gap-2 truncate transition-colors font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="truncate">{pl.name}</span>
                  </button>
                ))
              )}

              {onRemove && (
                <>
                  <div className="h-[1px] bg-white/10 my-1" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); onRemove(track.id); }}
                    className="w-full text-left px-4 py-2 text-rose-400 hover:bg-rose-500/20 flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove from playlist</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
