import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Heart,
  ArrowDownToLine,
  CheckCircle2,
  BadgeCheck,
  Music2,
  Mic2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore.js';
import { useLibraryStore } from '../../stores/libraryStore.js';
import { useOfflineStore } from '../../stores/offlineStore.js';
import { api } from '../../services/api.js';

export const NowPlayingPanel = () => {
  const navigate = useNavigate();
  const {
    currentTrack,
    queue,
    currentIndex,
    isNowPlayingPanelOpen,
    toggleNowPlayingPanel,
    toggleLyrics
  } = usePlayerStore();

  const { likedTrackIds, toggleLike } = useLibraryStore();
  const { isTrackDownloaded, downloadTrack } = useOfflineStore();
  const [artistDetails, setArtistDetails] = useState(null);
  const [isLoadingArtist, setIsLoadingArtist] = useState(false);

  const nextTrack = queue[currentIndex + 1] || null;
  const isLiked = currentTrack ? likedTrackIds.has(currentTrack.id) : false;
  const isDownloaded = currentTrack ? isTrackDownloaded(currentTrack.id) : false;

  useEffect(() => {
    if (!currentTrack) return;

    const artistId = currentTrack.artists?.[0]?.id || currentTrack.artist;
    if (artistId) {
      setIsLoadingArtist(true);
      api.getArtist(artistId)
        .then(data => setArtistDetails(data))
        .catch(() => setArtistDetails(null))
        .finally(() => setIsLoadingArtist(false));
    }
  }, [currentTrack?.id]);

  if (!isNowPlayingPanelOpen || !currentTrack) return null;

  return (
    <aside className="hidden xl:flex flex-col w-80 2xl:w-96 h-full bg-[#121216] rounded-2xl overflow-hidden border border-white/5 shadow-2xl flex-shrink-0 animate-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 flex-shrink-0">
        <h3 className="font-extrabold text-sm text-white truncate max-w-[200px]">
          {currentTrack.title}
        </h3>
        <button
          onClick={toggleNowPlayingPanel}
          className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-none">
        {/* Large Artwork */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-2xl bg-black/40 border border-white/10 group">
          <img
            src={currentTrack.artwork || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'}
            alt={currentTrack.title}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80';
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>

        {/* Track Title & Quick Actions */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg font-black text-white truncate hover:text-emerald-400 transition-colors">
                {currentTrack.title}
              </h2>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20 flex-shrink-0" />
            </div>
            <p className="text-xs font-semibold text-gray-400 truncate mt-0.5">
              {currentTrack.artist}
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {currentTrack.canDownload && (
              <button
                onClick={() => downloadTrack(currentTrack)}
                className={`p-2 rounded-full hover:bg-white/10 transition-colors ${
                  isDownloaded ? 'text-emerald-400' : 'text-gray-400 hover:text-white'
                }`}
                title={isDownloaded ? "Downloaded" : "Download offline"}
              >
                {isDownloaded ? <CheckCircle2 className="w-4 h-4" /> : <ArrowDownToLine className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={() => toggleLike(currentTrack)}
              className={`p-2 rounded-full hover:bg-white/10 transition-colors ${
                isLiked ? 'text-rose-500 scale-105' : 'text-gray-400 hover:text-white'
              }`}
              title={isLiked ? "Unlike" : "Like"}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* About the Artist Card (Spotify-Style) */}
        <div className="rounded-2xl bg-white/5 border border-white/5 p-4 space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400">
              About the Artist
            </span>
            {artistDetails?.id && (
              <button
                onClick={() => navigate(`/artist/${artistDetails.id}`)}
                className="text-[11px] font-bold text-linova-cyan hover:underline flex items-center gap-1"
              >
                <span>Profile</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-black/40 flex-shrink-0 border border-white/10 shadow-md">
              <img
                src={artistDetails?.avatar || currentTrack.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80'}
                alt={currentTrack.artist}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80';
                }}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="font-extrabold text-sm text-white truncate">
                  {currentTrack.artist}
                </h4>
                <BadgeCheck className="w-4 h-4 text-linova-cyan fill-linova-cyan/20 flex-shrink-0" />
              </div>
              <p className="text-[11px] font-medium text-gray-400 truncate mt-0.5">
                {artistDetails?.monthlyListeners || 'Verified Recording Artist'}
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-300 font-normal leading-relaxed line-clamp-3">
            {artistDetails?.bio || `${currentTrack.artist} is a world-class recording artist featured on Linova Music.`}
          </p>
        </div>

        {/* Quick Synchronized Lyrics Tile */}
        <div
          onClick={toggleLyrics}
          className="rounded-2xl bg-gradient-to-br from-emerald-950/40 via-teal-950/20 to-black/40 border border-emerald-500/20 p-4 space-y-2 cursor-pointer hover:border-emerald-500/40 transition-all group"
        >
          <div className="flex items-center justify-between text-emerald-400">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
              <Mic2 className="w-3.5 h-3.5" />
              <span>Lyrics</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-400/80 group-hover:underline">Open Fullscreen</span>
          </div>
          <p className="text-xs text-gray-300 font-medium italic line-clamp-2">
            "Sing along in sync with full studio audio and synchronized words..."
          </p>
        </div>

        {/* Next in Queue Preview */}
        {nextTrack && (
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400">
              Next in Queue
            </span>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
              <img
                src={nextTrack.artwork}
                alt={nextTrack.title}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h5 className="font-bold text-xs text-white truncate">{nextTrack.title}</h5>
                <p className="text-[11px] text-gray-400 truncate">{nextTrack.artist}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
