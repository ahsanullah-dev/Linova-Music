import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { TrackCard } from '../../components/music/TrackCard.jsx';
import { ArtistCard } from '../../components/music/ArtistCard.jsx';
import { AlbumCard } from '../../components/music/AlbumCard.jsx';
import { PlaylistCard } from '../../components/music/PlaylistCard.jsx';
import { useAuthStore } from '../../stores/authStore.js';
import { usePlayerStore } from '../../stores/playerStore.js';
import { useLibraryStore } from '../../stores/libraryStore.js';
import { Play, Pause, Heart, ChevronLeft, ChevronRight, Sparkles, Flame, Radio, Disc3, ShieldCheck, Loader2 } from 'lucide-react';

export const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const { likedTrackIds, toggleLike } = useLibraryStore();

  const [activeTab, setActiveTab] = useState('all'); // all | bangla | rock | pop | chill | hiphop
  const [sections, setSections] = useState([]);
  const [tasteProfile, setTasteProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true);
      try {
        const homeData = await api.getHome(activeTab);
        if (homeData && homeData.sections) {
          setSections(homeData.sections);
          if (homeData.tasteProfile) {
            setTasteProfile(homeData.tasteProfile);
          }
        }
      } catch (error) {
        console.error('[Home] Failed to load sections:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, [activeTab]);

  // Dynamic featured track extracted directly from the primary active shelf
  const featuredTrack = sections.find(s => s.type === 'tracks')?.items?.[0] || null;

  const isHeroPlaying = featuredTrack && currentTrack?.id === featuredTrack.id && isPlaying;
  const isHeroLiked = featuredTrack && likedTrackIds.has(featuredTrack.id);

  const quickTracks = sections.find(s => s.type === 'tracks')?.items || [];

  return (
    <div className="space-y-10 pb-20">
      {/* Top Welcome & Dynamic Category Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-linova-cyan animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-linova-cyan">
              Linova Music AI
            </span>
            {tasteProfile?.topArtists?.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-linova-primary/20 text-linova-primary text-[10px] font-extrabold">
                Personalized
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Discover & Stream
          </h1>
        </div>

        {/* Dynamic Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: '🔥 All Hits' },
            { id: 'bangla', label: '🇧🇩 Bangla Bands & Hits' },
            { id: 'rock', label: '🎸 Rock & Metal' },
            { id: 'pop', label: '✨ Pop & Dance' },
            { id: 'chill', label: '☕ Acoustic & Chill' },
            { id: 'hiphop', label: '🎤 Hip-Hop & Urban' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-linova-primary to-linova-violet text-white shadow-glow-primary scale-105'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <Loader2 className="w-8 h-8 text-linova-primary animate-spin" />
          <p className="text-sm font-medium text-gray-400">Tuning recommendation engine...</p>
        </div>
      ) : (
        <>
          {/* Dynamic Hero Spotlight Card */}
          {featuredTrack && (
            <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 border border-white/10 bg-gradient-to-br from-indigo-950/60 via-purple-950/30 to-[#0c0e18] shadow-2xl backdrop-blur-xl group">
              {/* Ambient Lighting Mesh */}
              <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-linova-primary/20 blur-3xl pointer-events-none group-hover:bg-linova-primary/30 transition-all duration-700" />
              <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-linova-cyan/15 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4 max-w-xl text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-linova-primary/20 border border-linova-primary/40 text-linova-primary text-xs font-extrabold tracking-wider uppercase">
                    <Flame className="w-3.5 h-3.5 fill-current text-linova-rose" />
                    <span>🔥 Spotlight Chartbuster</span>
                  </div>

                  <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                    {featuredTrack.title}
                  </h2>

                  <p className="text-sm sm:text-base text-gray-300 font-medium line-clamp-2">
                    {featuredTrack.artist}
                  </p>

                  <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                    <button
                      onClick={() => {
                        if (currentTrack?.id === featuredTrack.id) {
                          togglePlay();
                        } else {
                          playTrack(featuredTrack, quickTracks);
                        }
                      }}
                      className="px-6 py-3.5 rounded-full bg-gradient-to-r from-linova-primary via-indigo-500 to-linova-violet hover:brightness-110 text-white font-extrabold text-sm flex items-center gap-2.5 shadow-glow-primary hover:scale-105 transition-all"
                    >
                      {isHeroPlaying ? (
                        <>
                          <Pause className="w-4 h-4 fill-current" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                          <span>Listen Now</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => toggleLike(featuredTrack)}
                      className={`p-3.5 rounded-full border transition-all ${
                        isHeroLiked
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 scale-105'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300 hover:text-white'
                      }`}
                      title={isHeroLiked ? "Unlike" : "Like"}
                    >
                      <Heart className={`w-5 h-5 ${isHeroLiked ? 'fill-rose-400' : ''}`} />
                    </button>

                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>320kbps Studio Lossless</span>
                    </div>
                  </div>
                </div>

                {/* Glowing Hero Cover */}
                <div className="relative flex-shrink-0 group/cover">
                  <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-2xl overflow-hidden shadow-2xl border border-white/15 group-hover/cover:scale-105 transition-transform duration-500">
                    <img
                      src={featuredTrack.artwork}
                      alt={featuredTrack.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Play Grid */}
          {quickTracks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Quick Access</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Liked Songs Tile */}
                <div
                  onClick={() => navigate('/library?tab=liked')}
                  className="linova-quick-tile flex items-center gap-3.5 rounded-2xl p-2.5 cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-600 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <Heart className="w-5 h-5 fill-white" />
                  </div>
                  <span className="font-bold text-sm text-white truncate flex-1">Liked Songs</span>
                  <div className="w-9 h-9 rounded-full bg-linova-primary text-white flex items-center justify-center shadow-lg mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Quick Access Top Hits */}
                {quickTracks.slice(0, 7).map((track) => (
                  <div
                    key={`quick-${track.id}`}
                    onClick={() => playTrack(track, quickTracks)}
                    className="linova-quick-tile flex items-center gap-3.5 rounded-2xl p-2 cursor-pointer group"
                  >
                    <img
                      src={track.artwork}
                      alt={track.title}
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0 shadow-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-sm text-white truncate group-hover:text-linova-cyan transition-colors">{track.title}</h5>
                      <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-linova-primary to-linova-cyan text-white flex items-center justify-center shadow-lg mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Discovery Shelves */}
          {sections.map((sec) => (
            <section key={sec.id} className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white hover:text-linova-primary cursor-pointer transition-colors">
                    {sec.title}
                  </h2>
                  {sec.subtitle && (
                    <p className="text-xs text-gray-400 mt-0.5">{sec.subtitle}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const el = document.getElementById(`shelf-${sec.id}`);
                      if (el) el.scrollBy({ left: -400, behavior: 'smooth' });
                    }}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white flex items-center justify-center border border-white/5 transition-colors"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const el = document.getElementById(`shelf-${sec.id}`);
                      if (el) el.scrollBy({ left: 400, behavior: 'smooth' });
                    }}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white flex items-center justify-center border border-white/5 transition-colors"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Horizontally Scrollable Grid with Linova Glass Cards */}
              <div
                id={`shelf-${sec.id}`}
                className="grid grid-flow-col auto-cols-[175px] sm:auto-cols-[195px] md:auto-cols-[215px] gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none"
              >
                {sec.items?.map((item) => {
                  if (sec.type === 'artists') return <ArtistCard key={item.id} artist={item} />;
                  if (sec.type === 'albums') return <AlbumCard key={item.id} album={item} />;
                  if (sec.type === 'playlists') return <PlaylistCard key={item.id} playlist={item} />;
                  return <TrackCard key={item.id} track={item} contextQueue={sec.items} />;
                })}
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  );
};
