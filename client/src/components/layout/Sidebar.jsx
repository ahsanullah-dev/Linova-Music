import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Search,
  Library,
  Heart,
  Plus,
  ArrowDownToLine,
  Disc3,
  Search as SearchIcon,
  Pin,
  Sparkles,
  Bot
} from 'lucide-react';
import { useLibraryStore } from '../../stores/libraryStore.js';
import { useOfflineStore } from '../../stores/offlineStore.js';
import { useAppStore } from '../../stores/appStore.js';
import { useAuthStore } from '../../stores/authStore.js';

export const Sidebar = () => {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState('all'); // all | playlists | artists | albums
  const [libraryQuery, setLibraryQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const { playlists, savedAlbums, savedArtists, likedTracks } = useLibraryStore();
  const { downloadedTracks } = useOfflineStore();
  const { openCreatePlaylistModal, openAuthModal, closeMobileSidebar } = useAppStore();
  const { isAuthenticated } = useAuthStore();

  const handleCreatePlaylist = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    openCreatePlaylistModal();
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold transition-all text-sm ${
      isActive
        ? 'bg-gradient-to-r from-linova-primary to-linova-violet text-white shadow-glow-primary'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`;

  const filteredPlaylists = playlists.filter(p => p.name.toLowerCase().includes(libraryQuery.toLowerCase()));
  const filteredAlbums = savedAlbums.filter(a => (a.title || a.name || '').toLowerCase().includes(libraryQuery.toLowerCase()));
  const filteredArtists = savedArtists.filter(a => a.name.toLowerCase().includes(libraryQuery.toLowerCase()));

  return (
    <aside className="w-72 md:w-80 bg-[#0c0e17]/85 backdrop-blur-2xl border-r md:border border-white/5 flex flex-col h-full select-none z-30 space-y-2">
      {/* Top Main Nav Section */}
      <div className="bg-[#131726]/70 rounded-2xl p-4 space-y-1 mx-2 mt-2 border border-white/5">
        {/* Brand Header */}
        <div
          onClick={() => { navigate('/'); closeMobileSidebar(); }}
          className="flex items-center gap-3 cursor-pointer group px-2 py-2 mb-2"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-linova-primary via-linova-violet to-linova-cyan flex items-center justify-center shadow-glow-primary group-hover:scale-105 transition-transform">
            <Disc3 className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-black text-xl tracking-wider bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              LINOVA
            </span>
            <span className="text-[10px] uppercase font-black tracking-widest text-linova-cyan px-2 py-0.5 rounded-full bg-linova-cyan/10 border border-linova-cyan/30">
              STUDIO
            </span>
          </div>
        </div>

        <NavLink to="/" onClick={closeMobileSidebar} className={navLinkClass}>
          <Home className="w-5 h-5" />
          <span>Discover</span>
        </NavLink>
        <NavLink to="/search" onClick={closeMobileSidebar} className={navLinkClass}>
          <Search className="w-5 h-5" />
          <span>Search</span>
        </NavLink>
        <NavLink to="/ai" onClick={closeMobileSidebar} className={navLinkClass}>
          <Bot className="w-5 h-5" />
          <span>AI DJ</span>
          <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-linova-violet bg-linova-violet/20 px-1.5 py-0.5 rounded-full border border-linova-violet/30">Beta</span>
        </NavLink>
      </div>

      {/* Collapsible Library Panel */}
      <div className="flex-1 bg-[#131726]/70 rounded-2xl p-3 mx-2 mb-2 flex flex-col min-h-0 overflow-hidden border border-white/5">
        {/* Library Header */}
        <div className="flex items-center justify-between px-2 py-2 mb-2">
          <NavLink
            to="/library"
            onClick={closeMobileSidebar}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
          >
            <Library className="w-5 h-5 text-linova-cyan group-hover:scale-105 transition-transform" />
            <span className="font-extrabold text-sm">Your Library</span>
          </NavLink>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCreatePlaylist}
              className="p-1.5 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
              title="Create playlist"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Pills: Playlists, Artists, Albums */}
        <div className="flex items-center gap-1.5 px-2 pb-2 overflow-x-auto text-[11px] font-bold scrollbar-none">
          {['all', 'playlists', 'artists', 'albums'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-full capitalize transition-all whitespace-nowrap ${
                filterType === type
                  ? 'bg-gradient-to-r from-linova-primary to-linova-cyan text-white shadow-sm font-extrabold'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search within Library */}
        <div className="px-2 py-1 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2 w-full">
            <SearchIcon
              onClick={() => setShowSearch(!showSearch)}
              className="w-3.5 h-3.5 text-gray-400 hover:text-white cursor-pointer"
            />
            {showSearch && (
              <input
                type="text"
                placeholder="Search Library..."
                value={libraryQuery}
                onChange={(e) => setLibraryQuery(e.target.value)}
                autoFocus
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-linova-primary"
              />
            )}
          </div>
        </div>

        {/* Scrollable Library Items List */}
        <div className="flex-1 overflow-y-auto space-y-1 mt-1 pr-1 scrollbar-none">
          {/* Pinned Liked Songs Card */}
          {(filterType === 'all' || filterType === 'playlists') && !libraryQuery && (
            <div
              onClick={() => { navigate('/library?tab=liked'); closeMobileSidebar(); }}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 via-pink-600 to-indigo-600 flex items-center justify-center text-white shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h5 className="text-sm font-bold text-white truncate">Liked Songs</h5>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <Pin className="w-3 h-3 text-linova-rose fill-linova-rose" />
                  <span>Playlist • {likedTracks.length} songs</span>
                </p>
              </div>
            </div>
          )}

          {/* Pinned Downloaded Offline Card */}
          {(filterType === 'all' || filterType === 'playlists') && !libraryQuery && (
            <div
              onClick={() => { navigate('/library?tab=downloaded'); closeMobileSidebar(); }}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                <ArrowDownToLine className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h5 className="text-sm font-bold text-white truncate">Downloaded</h5>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <Pin className="w-3 h-3 text-linova-emerald fill-linova-emerald" />
                  <span>Offline • {downloadedTracks.length} tracks</span>
                </p>
              </div>
            </div>
          )}

          {/* Custom Playlists */}
          {(filterType === 'all' || filterType === 'playlists') &&
            filteredPlaylists.map((pl) => (
              <div
                key={pl._id}
                onClick={() => { navigate(`/playlist/${pl._id}`); closeMobileSidebar(); }}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors"
              >
                <img
                  src={pl.coverImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80'}
                  alt={pl.name}
                  className="w-11 h-11 rounded-xl object-cover shadow-sm flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h5 className="text-sm font-bold text-gray-200 group-hover:text-white truncate">
                    {pl.name}
                  </h5>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    Playlist • {pl.tracks?.length || 0} songs
                  </p>
                </div>
              </div>
            ))}

          {/* Saved Albums */}
          {(filterType === 'all' || filterType === 'albums') &&
            filteredAlbums.map((item) => (
              <div
                key={item.albumId || item._id}
                onClick={() => { navigate(`/album/${item.albumId || item._id}`); closeMobileSidebar(); }}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors"
              >
                <img
                  src={item.artwork || item.album?.artwork}
                  alt={item.title || item.album?.title}
                  className="w-11 h-11 rounded-xl object-cover shadow-sm flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h5 className="text-sm font-bold text-gray-200 group-hover:text-white truncate">
                    {item.title || item.album?.title}
                  </h5>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    Album • {item.artist || item.album?.artist}
                  </p>
                </div>
              </div>
            ))}

          {/* Saved Artists */}
          {(filterType === 'all' || filterType === 'artists') &&
            filteredArtists.map((item) => (
              <div
                key={item.artistId || item._id}
                onClick={() => { navigate(`/artist/${item.artistId || item._id}`); closeMobileSidebar(); }}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors"
              >
                <img
                  src={item.avatar || item.artist?.avatar}
                  alt={item.name || item.artist?.name}
                  className="w-11 h-11 rounded-full object-cover shadow-sm flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h5 className="text-sm font-bold text-gray-200 group-hover:text-white truncate">
                    {item.name || item.artist?.name}
                  </h5>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    Artist
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </aside>
  );
};
