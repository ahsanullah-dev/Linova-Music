import React, { useState, useEffect } from 'react';
import { Search, X, Loader2, Music2, Disc, User, ListMusic, Sparkles } from 'lucide-react';
import { api } from '../../services/api.js';
import { TrackRow } from '../../components/music/TrackRow.jsx';
import { TrackCard } from '../../components/music/TrackCard.jsx';
import { ArtistCard } from '../../components/music/ArtistCard.jsx';
import { AlbumCard } from '../../components/music/AlbumCard.jsx';
import { PlaylistCard } from '../../components/music/PlaylistCard.jsx';
import { SectionHeader } from '../../components/music/SectionHeader.jsx';

const GENRE_CARDS = [
  { name: '🎸 Bangla Rock Bands', color: 'from-emerald-700 to-teal-900', query: 'Bangla Rock Bands' },
  { name: '🔥 Global Trending', color: 'from-fuchsia-600 to-indigo-800', query: 'Trending Top Hits' },
  { name: '⚡ Alt & Heavy Rock', color: 'from-red-600 to-stone-900', query: 'Alternative Rock' },
  { name: '☕ Acoustic & Indie', color: 'from-amber-600 to-rose-700', query: 'Acoustic Indie' },
  { name: '✨ Pop & Electronic', color: 'from-cyan-600 to-blue-800', query: 'Pop Dance' },
  { name: '🌙 Lofi Chill Beats', color: 'from-purple-700 to-pink-900', query: 'Lofi Chill' }
];

export const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all | tracks | artists | albums | playlists
  const [results, setResults] = useState({ tracks: [], artists: [], albums: [], playlists: [] });
  const [isLoading, setIsLoading] = useState(false);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const executeSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults({ tracks: [], artists: [], albums: [], playlists: [] });
        return;
      }

      setIsLoading(true);
      try {
        const data = await api.search(debouncedQuery, activeFilter);
        setResults(data || { tracks: [], artists: [], albums: [], playlists: [] });
      } catch (error) {
        console.error('[Search] Error fetching results:', error);
      } finally {
        setIsLoading(false);
      }
    };

    executeSearch();
  }, [debouncedQuery, activeFilter]);

  const hasResults =
    results.tracks.length > 0 ||
    results.artists.length > 0 ||
    results.albums.length > 0 ||
    results.playlists.length > 0;

  const topResult = results.tracks[0] || results.artists[0] || results.albums[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Search Input Bar */}
      <div className="max-w-2xl space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search tracks, artists, albums, or genres..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-3.5 text-base text-white placeholder-gray-500 focus:outline-none focus:border-linova-primary focus:ring-1 focus:ring-linova-primary shadow-xl transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-3.5 p-1 rounded-full text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
          {[
            { id: 'all', label: 'All' },
            { id: 'tracks', label: 'Songs' },
            { id: 'artists', label: 'Artists' },
            { id: 'albums', label: 'Albums' },
            { id: 'playlists', label: 'Playlists' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-1.5 rounded-full transition-all ${
                activeFilter === tab.id
                  ? 'bg-white text-black font-bold'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-linova-primary mb-2" />
          <span className="text-sm">Searching LINOVA catalog...</span>
        </div>
      )}

      {/* When no query: Browse All Genres */}
      {!isLoading && !query.trim() && (
        <div className="space-y-4">
          <SectionHeader title="Explore Genres & Moods" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {GENRE_CARDS.map((g, i) => (
              <div
                key={i}
                onClick={() => setQuery(g.query)}
                className={`aspect-[4/3] rounded-2xl bg-gradient-to-br ${g.color} p-4 flex flex-col justify-between cursor-pointer hover:scale-105 transition-transform shadow-lg relative overflow-hidden group`}
              >
                <span className="font-bold text-base text-white z-10 leading-tight">
                  {g.name}
                </span>
                <Disc className="w-16 h-16 text-white/10 absolute -bottom-3 -right-3 transform rotate-12 group-hover:rotate-45 transition-transform" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {!isLoading && query.trim() && hasResults && (
        <div className="space-y-8">
          {/* Top Result + Songs split view */}
          {(activeFilter === 'all' || activeFilter === 'tracks') && results.tracks.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Result Card */}
              {topResult && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-white">Top Result</h3>
                  <div className="glass-card p-6 rounded-3xl flex flex-col justify-between h-[230px]">
                    <div className="flex items-center gap-4">
                      <img
                        src={topResult.artwork || topResult.avatar || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80'}
                        alt={topResult.title || topResult.name}
                        className="w-20 h-20 rounded-2xl object-cover shadow-lg"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xl font-bold text-white truncate">
                          {topResult.title || topResult.name}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">
                          {topResult.artist || 'Top Artist'}
                        </p>
                        <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-linova-primary/20 text-linova-primary text-[10px] font-bold uppercase">
                          {topResult.genre || 'Song'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Matching Songs List */}
              <div className="lg:col-span-2 space-y-3">
                <h3 className="text-lg font-bold text-white">Songs</h3>
                <div className="space-y-1">
                  {results.tracks.slice(0, 4).map((track, i) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      index={i}
                      contextQueue={results.tracks}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Artists */}
          {(activeFilter === 'all' || activeFilter === 'artists') && results.artists.length > 0 && (
            <section className="space-y-3">
              <SectionHeader title="Artists" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.artists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </section>
          )}

          {/* Albums */}
          {(activeFilter === 'all' || activeFilter === 'albums') && results.albums.length > 0 && (
            <section className="space-y-3">
              <SectionHeader title="Albums" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.albums.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            </section>
          )}

          {/* Playlists */}
          {(activeFilter === 'all' || activeFilter === 'playlists') && results.playlists.length > 0 && (
            <section className="space-y-3">
              <SectionHeader title="Playlists" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.playlists.map((pl) => (
                  <PlaylistCard key={pl.id} playlist={pl} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && query.trim() && !hasResults && (
        <div className="py-24 text-center space-y-3">
          <Music2 className="w-12 h-12 text-gray-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No results found for "{query}"</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Please make sure words are spelled correctly or try searching for another song, artist, or genre.
          </p>
        </div>
      )}
    </div>
  );
};
