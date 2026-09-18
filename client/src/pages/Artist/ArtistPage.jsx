import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import { TrackRow } from '../../components/music/TrackRow.jsx';
import { AlbumCard } from '../../components/music/AlbumCard.jsx';
import { ArtistCard } from '../../components/music/ArtistCard.jsx';
import { SectionHeader } from '../../components/music/SectionHeader.jsx';
import { usePlayerStore } from '../../stores/playerStore.js';
import { useLibraryStore } from '../../stores/libraryStore.js';
import { useAuthStore } from '../../stores/authStore.js';
import { useAppStore } from '../../stores/appStore.js';
import { Play, Shuffle, Heart, BadgeCheck, Loader2 } from 'lucide-react';

export const ArtistPage = () => {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { playTrack, toggleShuffle } = usePlayerStore();
  const { savedArtists, toggleLike } = useLibraryStore();
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal, showToast } = useAppStore();

  useEffect(() => {
    const fetchArtist = async () => {
      setIsLoading(true);
      try {
        const data = await api.getArtist(id);
        setArtist(data);
      } catch (error) {
        console.error('[Artist] Error loading artist:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArtist();
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-linova-primary" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="py-20 text-center text-gray-400">
        <h3 className="text-lg font-bold text-white">Artist not found</h3>
      </div>
    );
  }

  const handlePlayAll = (shuffle = false) => {
    if (artist.topTracks?.length > 0) {
      if (shuffle) toggleShuffle();
      playTrack(artist.topTracks[0], artist.topTracks);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Header Banner */}
      <div className="relative rounded-3xl overflow-hidden min-h-[280px] sm:min-h-[340px] flex items-end p-6 sm:p-10 bg-gradient-to-t from-background via-background/60 to-transparent border border-white/5 shadow-2xl">
        <img
          src={artist.headerImage || artist.avatar}
          alt={artist.name}
          className="absolute inset-0 w-full h-full object-cover -z-10 filter brightness-75"
        />

        <div className="space-y-3 z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-linova-primary flex items-center gap-1.5">
              <BadgeCheck className="w-4 h-4 fill-linova-primary/20 text-linova-primary" />
              Verified Artist
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            {artist.name}
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 font-medium">
            {artist.monthlyListeners ? `${artist.monthlyListeners} monthly listeners` : 'Artist'} • {artist.genres?.join(', ')}
          </p>

          <p className="text-xs text-gray-300/80 line-clamp-2 max-w-xl">
            {artist.bio}
          </p>

          {/* Action Bar */}
          <div className="pt-2 flex items-center gap-4">
            <button
              onClick={() => handlePlayAll(false)}
              className="w-12 h-12 rounded-full bg-linova-primary hover:bg-linova-primary/90 text-white flex items-center justify-center shadow-xl shadow-linova-primary/40 hover:scale-105 transition-all"
              title="Play Artist Top Tracks"
            >
              <Play className="w-6 h-6 fill-white ml-0.5" />
            </button>

            <button
              onClick={() => handlePlayAll(true)}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Shuffle Play"
            >
              <Shuffle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Top Tracks */}
      {artist.topTracks?.length > 0 && (
        <section className="space-y-3">
          <SectionHeader title="Popular Tracks" />
          <div className="space-y-1">
            {artist.topTracks.map((track, i) => (
              <TrackRow
                key={track.id}
                track={track}
                index={i}
                contextQueue={artist.topTracks}
              />
            ))}
          </div>
        </section>
      )}

      {/* Discography / Albums */}
      {artist.albums?.length > 0 && (
        <section className="space-y-3">
          <SectionHeader title="Discography" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {artist.albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}

      {/* Related Artists */}
      {artist.relatedArtists?.length > 0 && (
        <section className="space-y-3">
          <SectionHeader title="Fans Also Like" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {artist.relatedArtists.map((rel) => (
              <ArtistCard key={rel.id} artist={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
