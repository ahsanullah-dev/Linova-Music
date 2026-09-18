import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { TrackRow } from '../../components/music/TrackRow.jsx';
import { usePlayerStore } from '../../stores/playerStore.js';
import { useOfflineStore } from '../../stores/offlineStore.js';
import { useAppStore } from '../../stores/appStore.js';
import { Play, Shuffle, ArrowDownToLine, Loader2, Disc, Clock } from 'lucide-react';

export const AlbumPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const { playTrack, toggleShuffle } = usePlayerStore();
  const { downloadTrack } = useOfflineStore();
  const { showToast } = useAppStore();

  useEffect(() => {
    const fetchAlbum = async () => {
      setIsLoading(true);
      try {
        const data = await api.getAlbum(id);
        setAlbum(data);
      } catch (error) {
        console.error('[Album] Error loading album:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlbum();
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-linova-primary" />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="py-20 text-center text-gray-400">
        <h3 className="text-lg font-bold text-white">Album not found</h3>
      </div>
    );
  }

  const totalDurationSeconds = album.tracks?.reduce((acc, t) => acc + (t.duration || 0), 0) || 0;
  const totalMins = Math.floor(totalDurationSeconds / 60);

  const handlePlayAlbum = (shuffle = false) => {
    if (album.tracks?.length > 0) {
      if (shuffle) toggleShuffle();
      playTrack(album.tracks[0], album.tracks);
    }
  };

  const handleDownloadAlbum = async () => {
    if (!album.tracks || album.tracks.length === 0) return;
    setIsDownloadingAll(true);
    showToast(`Downloading ${album.tracks.length} tracks from "${album.title}"...`, 'info');

    try {
      for (const track of album.tracks) {
        if (track.canDownload !== false) {
          await downloadTrack(track);
        }
      }
      showToast(`Album "${album.title}" is now available offline!`, 'success');
    } catch (err) {
      showToast('Some tracks failed to download', 'error');
    } finally {
      setIsDownloadingAll(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8 pb-4">
        <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden shadow-2xl bg-white/5 flex-shrink-0 border border-white/10">
          <img
            src={album.artwork}
            alt={album.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
          <span className="text-xs font-bold uppercase tracking-widest text-linova-primary">
            Album
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight truncate">
            {album.title}
          </h1>

          <p className="text-sm text-gray-300">
            <span
              onClick={() => album.artistId && navigate(`/artist/${album.artistId}`)}
              className="font-bold text-white hover:underline cursor-pointer"
            >
              {album.artist}
            </span>
            {' • '}
            <span>{album.year || '2024'}</span>
            {' • '}
            <span>{album.tracks?.length || 0} songs</span>
            {totalMins > 0 && <span>, {totalMins} min</span>}
          </p>

          <p className="text-xs text-gray-400 max-w-xl line-clamp-2">
            {album.description}
          </p>

          {/* Action Bar */}
          <div className="pt-3 flex items-center justify-center sm:justify-start gap-4">
            <button
              onClick={() => handlePlayAlbum(false)}
              className="w-12 h-12 rounded-full bg-linova-primary hover:bg-linova-primary/90 text-white flex items-center justify-center shadow-xl shadow-linova-primary/40 hover:scale-105 transition-all"
              title="Play Album"
            >
              <Play className="w-6 h-6 fill-white ml-0.5" />
            </button>

            <button
              onClick={() => handlePlayAlbum(true)}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Shuffle Album"
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <button
              onClick={handleDownloadAlbum}
              disabled={isDownloadingAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-200 transition-colors"
              title="Download Entire Album"
            >
              {isDownloadingAll ? (
                <Loader2 className="w-4 h-4 animate-spin text-linova-primary" />
              ) : (
                <ArrowDownToLine className="w-4 h-4" />
              )}
              <span>Download Album</span>
            </button>
          </div>
        </div>
      </div>

      {/* Track List */}
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

        {album.tracks?.map((track, i) => (
          <TrackRow
            key={track.id}
            track={track}
            index={i}
            showAlbum={false}
            contextQueue={album.tracks}
          />
        ))}
      </div>
    </div>
  );
};
