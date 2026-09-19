import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Search,
  Download,
  Bell,
  Users,
  User,
  LogOut,
  FolderPlus,
  Compass,
  Bot
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore.js';
import { useAppStore } from '../../stores/appStore.js';

export const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchInput, setSearchInput] = useState('');

  const { user, isAuthenticated, logout } = useAuthStore();
  const { openAuthModal, pwaInstallPrompt, showToast } = useAppStore();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const handleInstallPwa = async () => {
    if (pwaInstallPrompt) {
      pwaInstallPrompt.prompt();
      const { outcome } = await pwaInstallPrompt.userChoice;
      if (outcome === 'accepted') {
        useAppStore.getState().setPwaInstallPrompt(null);
        showToast('Linova Music app installed!', 'success');
      }
    } else {
      showToast('Install prompt will appear when available in your browser.', 'info');
    }
  };

  return (
    <header className="h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5">
      {/* Left: Home Button Icon */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
            location.pathname === '/'
              ? 'bg-white text-black font-bold shadow-lg scale-105'
              : 'bg-[#1f1f22] text-gray-300 hover:text-white hover:scale-105 hover:bg-[#28282b]'
          }`}
          title="Home"
          aria-label="Home"
        >
          <Home className="w-5 h-5 fill-current" />
        </button>
      </div>

      {/* Center: Spotify-Style Large Search Pill */}
      <div className="flex-1 max-w-xl mx-4">
        <form onSubmit={handleSearchSubmit} className="relative group">
          <button
            type="submit"
            className="absolute left-4 top-3 text-gray-400 group-hover:text-white transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
          <input
            type="text"
            placeholder="What do you want to play?"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onFocus={() => { if (location.pathname !== '/search') navigate('/search'); }}
            className="w-full bg-[#1f1f22] hover:bg-[#28282b] focus:bg-[#28282b] border border-transparent focus:border-white/20 rounded-full pl-12 pr-12 py-3 text-sm text-white placeholder-gray-400 focus:outline-none transition-all shadow-inner"
          />
          <div
            onClick={() => navigate('/search')}
            className="absolute right-4 top-3 text-gray-400 hover:text-white cursor-pointer"
            title="Browse all categories"
          >
            <Compass className="w-5 h-5" />
          </div>
        </form>
      </div>

      {/* Right Controls: Explore Premium, Install App, Notifications, User */}
      <div className="flex items-center gap-3">
        {/* AI Music Companion Button */}
        <button
          onClick={() => navigate('/ai')}
          className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold shadow-md transition-all hover:scale-105 ${
            location.pathname === '/ai'
              ? 'bg-gradient-to-r from-linova-primary to-linova-violet text-white shadow-glow-primary'
              : 'bg-gradient-to-r from-indigo-600/30 to-violet-600/20 hover:from-indigo-600/50 hover:to-violet-600/40 text-white border border-indigo-500/30 hover:border-indigo-500/60'
          }`}
          title="Chat with Linova AI — Your Music Expert"
        >
          <Bot className="w-4 h-4" />
          <span>AI DJ</span>
        </button>

        {/* Install App */}
        <button
          onClick={handleInstallPwa}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/40 hover:bg-white/10 text-white text-xs font-bold border border-white/10 hover:scale-105 transition-all"
          title="Install Linova App on Desktop"
        >
          <Download className="w-4 h-4 text-gray-300" />
          <span>Install App</span>
        </button>

        {/* Notifications & Social - decorative on mobile (crowds the search bar
            on narrow screens with no real functionality behind them yet) */}
        <button
          onClick={() => showToast('No new notifications', 'info')}
          className="hidden sm:flex w-9 h-9 rounded-full bg-black/40 hover:bg-white/10 items-center justify-center text-gray-400 hover:text-white transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        <button
          onClick={() => showToast('Friend Activity is active', 'info')}
          className="hidden sm:flex w-9 h-9 rounded-full bg-black/40 hover:bg-white/10 items-center justify-center text-gray-400 hover:text-white transition-colors"
          title="Friend Activity"
        >
          <Users className="w-4 h-4" />
        </button>

        {/* User Session Profile / Login */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <div
              onClick={() => navigate('/settings')}
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-transparent hover:border-white cursor-pointer transition-all hover:scale-105"
              title={user?.name || 'Account'}
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user?.name || 'User'}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-rose-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => openAuthModal('login')}
            className="px-5 py-2 rounded-full bg-white hover:bg-gray-100 text-black text-xs font-extrabold shadow-md hover:scale-105 transition-all"
          >
            Log in
          </button>
        )}
      </div>
    </header>
  );
};
