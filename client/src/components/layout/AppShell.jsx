import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { TopBar } from './TopBar.jsx';
import { MobileNav } from './MobileNav.jsx';
import { MusicPlayer } from '../player/MusicPlayer.jsx';
import { ExpandedPlayer } from '../player/ExpandedPlayer.jsx';
import { QueueDrawer } from '../player/QueueDrawer.jsx';
import { NowPlayingPanel } from '../player/NowPlayingPanel.jsx';
import { AuthModal } from '../common/AuthModal.jsx';
import { CreatePlaylistModal } from '../common/CreatePlaylistModal.jsx';
import { ToastContainer } from '../common/ToastContainer.jsx';
import { useAuthStore } from '../../stores/authStore.js';
import { useLibraryStore } from '../../stores/libraryStore.js';
import { useOfflineStore } from '../../stores/offlineStore.js';
import { usePlayerStore } from '../../stores/playerStore.js';
import { useAppStore } from '../../stores/appStore.js';

import { MiddleLyricsView } from '../player/MiddleLyricsView.jsx';

export const AppShell = () => {
  const { initialize: initAuth } = useAuthStore();
  const { fetchLibraryData } = useLibraryStore();
  const { initialize: initOffline } = useOfflineStore();
  const {
    initialize: initPlayer,
    currentTrack,
    togglePlay,
    seek,
    position,
    duration,
    toggleMute,
    skipNext,
    skipPrevious,
    isLyricsOpen
  } = usePlayerStore();
  const { isSidebarMobileOpen, closeMobileSidebar, setPwaInstallPrompt, showToast } = useAppStore();
  const { toggleLike } = useLibraryStore();
  const location = useLocation();
  const isAIPage = location.pathname === '/ai';

  // One-time bootstrap. This MUST NOT depend on player position: `position`
  // ticks ~10x/second during playback, and when it was in the dependency array
  // this effect re-ran on every tick, re-firing initAuth() and a full library
  // refetch each time. That flooded the API and any single failed /auth/me in
  // the storm would clear the stored token and log the user out.
  useEffect(() => {
    initAuth().then(() => fetchLibraryData());
    initOffline();
    initPlayer();
  }, []);

  useEffect(() => {
    // Listen for PWA BeforeInstallPromptEvent
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setPwaInstallPrompt(e);
    };

    // Spotify-like global keyboard shortcuts
    const handleKeyDown = (e) => {
      // Don't intercept when typing in search / forms / inputs
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'KeyM') {
        toggleMute();
      } else if (e.code === 'KeyL' && currentTrack) {
        toggleLike(currentTrack);
        showToast('Toggled Like on current track', 'info');
      } else if (e.code === 'ArrowRight' && !e.ctrlKey) {
        e.preventDefault();
        seek(Math.min(duration || 100, position + 5));
      } else if (e.code === 'ArrowLeft' && !e.ctrlKey) {
        e.preventDefault();
        seek(Math.max(0, position - 5));
      } else if (e.code === 'ArrowRight' && e.ctrlKey) {
        e.preventDefault();
        skipNext();
      } else if (e.code === 'ArrowLeft' && e.ctrlKey) {
        e.preventDefault();
        skipPrevious();
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentTrack, position, duration]);

  return (
    <div className="flex h-[100dvh] min-h-[100dvh] w-screen bg-[#09090b] text-gray-100 overflow-hidden select-none p-0 md:p-2 md:gap-2">
      {/* Desktop Sidebar (Spotify Left Dock) */}
      <div className="hidden md:flex flex-col h-full rounded-2xl overflow-hidden shadow-2xl">
        <Sidebar />
      </div>

      {/* Mobile Drawer Backdrop */}
      {isSidebarMobileOpen && (
        <div
          onClick={closeMobileSidebar}
          className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm animate-in fade-in"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={`md:hidden fixed top-0 bottom-0 left-0 z-50 transition-transform duration-300 transform ${
          isSidebarMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar />
      </div>

      {/* Main Content Area (Spotify Center Viewport) */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative bg-[#121216] md:rounded-2xl overflow-hidden border border-white/5">
        <TopBar />

        {/* Scrollable Viewport */}
        <main className={`flex-1 min-h-0 ${isAIPage ? `overflow-hidden p-3 ${currentTrack ? 'pb-[10.5rem] md:pb-28' : 'pb-20 md:pb-3'}` : `overflow-y-auto px-4 sm:px-8 py-6 ${currentTrack ? 'pb-[10.5rem] md:pb-28' : 'pb-20 md:pb-6'}`}`}>
          {isLyricsOpen && currentTrack && !isAIPage ? (
            <MiddleLyricsView />
          ) : (
            <Outlet />
          )}
        </main>

        {/* Persistent Bottom Player Bar */}
        <MusicPlayer />

        {/* Mobile Tab Bar */}
        <MobileNav />
      </div>

      {/* Spotify Right Dock (Now Playing & Singer Details) */}
      <NowPlayingPanel />

      {/* Overlays & Drawers */}
      <ExpandedPlayer />
      <QueueDrawer />
      <AuthModal />
      <CreatePlaylistModal />
      <ToastContainer />
    </div>
  );
};
