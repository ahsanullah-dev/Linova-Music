import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { TrackRow } from '../../components/music/TrackRow.jsx';
import { usePlayerStore } from '../../stores/playerStore.js';
import { useLibraryStore } from '../../stores/libraryStore.js';
import { useOfflineStore } from '../../stores/offlineStore.js';
import { useAppStore } from '../../stores/appStore.js';
import { Play, Shuffle, ArrowDownToLine, Trash2, Loader2, Music, Clock } from 'lucide-react';

export const PlaylistPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const { playTrack, toggleShuffle } = usePlayerStore();
  const { deletePlaylist, removeTrackFromPlaylist } = useLibraryStore();
  const { downloadTrack } = useOfflineStore();
  const { showToast } = useAppStore();

  useEffect(() => {
    const fetchPlaylist = async () => {
      setIsLoading(true);
      try {
        let data;
        if (id.startsWith('pl-featured')) {
          data = await api.getPlaylist(id);
        } else {
          data = await api.getPlaylistById(id);
        }
        setPlaylist(data);
      } catch (error) {
        console.error('[Playlist] Error loading playlist:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlaylist();
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-linova-primary" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="py-20 text-center text-gray-400">
        <h3 className="text-lg font-bold text-white">Playlist not found</h3>
      </div>
    );
  }

  const handlePlayPlaylist = (shuffle = false) => {
    if (playlist.tracks?.length > 0) {
      if (shuffle) toggleShuffle();
      playTrack(playlist.tracks[0], playlist.tracks);
    }
  };

  const handleRemoveTrack = async (trackId) => {
    try {
      await removeTrackFromPlaylist(playlist._id, trackId);
      setPlaylist(prev => ({
        ...prev,
        tracks: prev.tracks.filter(t => t.id !== trackId)
      }));
      showToast('Track removed from playlist', 'info');
    } catch {
      showToast('Failed to remove track', 'error');
    }
  };

  const handleDeletePlaylist = async () => {
    if (window.confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
      await deletePlaylist(playlist._id);
      showToast('Playlist deleted', 'info');
      navigate('/library');
    }
  };

  const handleDownloadPlaylist = async () => {
    if (!playlist.tracks || playlist.tracks.length === 0) return;
    setIsDownloadingAll(true);
    showToast(`Downloading ${playlist.tracks.length} tracks...`, 'info');

    try {
      for (const track of playlist.tracks) {
        if (track.canDownload !== false) {
          await downloadTrack(track);
        }
      }
      showToast(`Playlist "${playlist.name}" saved offline!`, 'success');
    } catch {
      showToast('Some tracks could not be downloaded', 'error');
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const isCustomUserPlaylist = !id.startsWith('pl-featured');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8 pb-4">
        <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden shadow-2xl bg-white/5 flex-shrink-0 border border-white/10">
          <img
            src={playlist.coverImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80'}
            alt={playlist.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
          <span className="text-xs font-bold uppercase tracking-widest text-linova-primary">
            Playlist
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight truncate">
            {playlist.name}
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 max-w-xl">
            {playlist.description || 'Created by you on Linova Music.'}
          </p>

          <p className="text-xs text-gray-400 font-medium">
            {playlist.tracks?.length || 0} songs
          </p>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-center sm:justify-start gap-4">
            <button
              onClick={() => handlePlayPlaylist(false)}
              disabled={!playlist.tracks?.length}
              className="w-12 h-12 rounded-full bg-linova-primary hover:bg-linova-primary/90 text-white flex items-center justify-center shadow-xl shadow-linova-primary/40 hover:scale-105 transition-all disabled:opacity-50"
              title="Play Playlist"
            >
              <Play className="w-6 h-6 fill-white ml-0.5" />
            </button>

            <button
              onClick={() => handlePlayPlaylist(true)}
              disabled={!playlist.tracks?.length}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
              title="Shuffle Playlist"
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <button
              onClick={handleDownloadPlaylist}
              disabled={isDownloadingAll || !playlist.tracks?.length}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-200 transition-colors disabled:opacity-50"
              title="Download Playlist"
            >
              {isDownloadingAll ? (
                <Loader2 className="w-4 h-4 animate-spin text-linova-primary" />
              ) : (
                <ArrowDownToLine className="w-4 h-4" />
              )}
              <span>Download</span>
            </button>

            {isCustomUserPlaylist && (
              <button
                onClick={handleDeletePlaylist}
                className="p-3 rounded-full hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-colors ml-auto"
                title="Delete Playlist"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tracks */}
      {playlist.tracks?.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-white/5 rounded-3xl p-8 border border-white/5">
          <Music className="w-12 h-12 text-gray-500 mx-auto" />
          <h4 className="text-lg font-bold text-white">This playlist is empty</h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Explore music in Search or Home and add songs using the three-dot menu!
          </p>
          <button
            onClick={() => navigate('/search')}
            className="px-5 py-2 rounded-full bg-linova-primary text-white text-xs font-bold"
          >
            Find Songs to Add
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <div className="flex items-center gap-4">
              <span className="w-6 text-center">#</span>
              <span>Title</span>
            </div>
            <div className="flex items-center gap-4">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          {playlist.tracks?.map((track, i) => (
            <TrackRow
              key={`${track.id}-${i}`}
              track={track}
              index={i}
              contextQueue={playlist.tracks}
              onRemove={isCustomUserPlaylist ? handleRemoveTrack : null}
            />
          ))}
        </div>
      )}
    </div>
  );
};
