import React from 'react';
import { useAuthStore } from '../../stores/authStore.js';
import { useOfflineStore } from '../../stores/offlineStore.js';
import { useAppStore } from '../../stores/appStore.js';
import { HardDrive, Trash2, Volume2, Shield, User, Palette, Download } from 'lucide-react';

export const SettingsPage = () => {
  const { user, isAuthenticated, updateProfile } = useAuthStore();
  const { storageUsage, clearAllDownloads, refreshDownloads } = useOfflineStore();
  const { showToast, openAuthModal, pwaInstallPrompt } = useAppStore();

  const handleClearCache = async () => {
    if (window.confirm('Are you sure you want to delete all downloaded offline tracks?')) {
      await clearAllDownloads();
      showToast('Offline cache cleared successfully', 'info');
    }
  };

  const handleQualityChange = async (quality) => {
    if (isAuthenticated) {
      await updateProfile({ preferences: { audioQuality: quality } });
      showToast(`Audio streaming quality set to ${quality}`, 'success');
    } else {
      showToast(`Audio quality set to ${quality}`, 'info');
    }
  };

  const handleInstallApp = async () => {
    if (pwaInstallPrompt) {
      pwaInstallPrompt.prompt();
      const { outcome } = await pwaInstallPrompt.userChoice;
      if (outcome === 'accepted') {
        useAppStore.getState().setPwaInstallPrompt(null);
        showToast('Linova Music installed!', 'success');
      }
    } else {
      showToast('To install Linova Music, tap "Add to Home Screen" or the install icon in your browser address bar.', 'info');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Settings</h1>
        <p className="text-xs text-gray-400 mt-1">Manage your account preferences, offline storage, and audio settings.</p>
      </div>

      {/* Account Section */}
      <section className="glass-card p-6 rounded-3xl space-y-4">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-linova-primary" />
          <h3 className="text-base font-bold text-white">Account Profile</h3>
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-4 pt-2">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-linova-primary/40"
            />
            <div>
              <h4 className="font-bold text-white text-base">{user?.name}</h4>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-xs text-gray-300">You are currently browsing as a guest.</p>
              <p className="text-[11px] text-gray-500">Sign in to sync your playlists and likes across devices.</p>
            </div>
            <button
              onClick={() => openAuthModal('login')}
              className="px-4 py-2 rounded-full bg-linova-primary text-white text-xs font-bold shadow-md hover:scale-105 transition-all"
            >
              Sign In
            </button>
          </div>
        )}
      </section>

      {/* Offline Storage Management Section */}
      <section className="glass-card p-6 rounded-3xl space-y-4">
        <div className="flex items-center gap-3">
          <HardDrive className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Offline Storage & Downloads</h3>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-gray-200">Local Download Footprint</span>
            <p className="text-xs text-gray-400 mt-0.5">
              {storageUsage.totalTracks} songs stored offline ({storageUsage.totalMB} MB of browser IndexedDB storage)
            </p>
          </div>

          <button
            onClick={handleClearCache}
            disabled={storageUsage.totalTracks === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Offline Downloads</span>
          </button>
        </div>
      </section>

      {/* Audio Playback & Quality */}
      <section className="glass-card p-6 rounded-3xl space-y-4">
        <div className="flex items-center gap-3">
          <Volume2 className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white">Streaming & Audio Quality</h3>
        </div>

        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5">
            <div>
              <span className="text-xs font-semibold text-gray-200 block">Streaming Bitrate</span>
              <span className="text-[11px] text-gray-400">Higher quality uses more bandwidth.</span>
            </div>

            <div className="flex items-center gap-2">
              {['normal', 'high'].map((q) => (
                <button
                  key={q}
                  onClick={() => handleQualityChange(q)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                    (user?.preferences?.audioQuality || 'high') === q
                      ? 'bg-linova-primary text-white shadow-md'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Install App Section */}
      <section className="glass-card p-6 rounded-3xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Download className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-base font-bold text-white">Install LINOVA App (PWA)</h3>
            <p className="text-xs text-gray-400">Install standalone borderless app on Desktop or Mobile home screen.</p>
          </div>
        </div>

        <button
          onClick={handleInstallApp}
          className="px-4 py-2 rounded-full bg-linova-primary/20 hover:bg-linova-primary/30 border border-linova-primary/40 text-linova-primary text-xs font-bold transition-all"
        >
          Install App
        </button>
      </section>
    </div>
  );
};
