import React from 'react';
import { useAuthStore } from '../../stores/authStore.js';
import { useOfflineStore } from '../../stores/offlineStore.js';
import { useAppStore } from '../../stores/appStore.js';
import { useLibraryStore } from '../../stores/libraryStore.js';
import { usePlayerStore } from '../../stores/playerStore.js';
import { HardDrive, Trash2, Volume2, Shield, User, Palette, Download, Calendar, Heart, ListMusic, History, Play, Server, Wifi, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

const timeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const memberSince = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
};

export const SettingsPage = () => {
  const { user, isAuthenticated, updateProfile } = useAuthStore();
  const { storageUsage, clearAllDownloads, refreshDownloads } = useOfflineStore();
  const { showToast, openAuthModal, pwaInstallPrompt } = useAppStore();
  const { likedTracks, playlists, history } = useLibraryStore();
  const { playTrack } = usePlayerStore();

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
    }
  };

  const [backendUrl, setBackendUrl] = React.useState(localStorage.getItem('linova_backend_url') || '');
  const [testStatus, setTestStatus] = React.useState('idle');
  const [testMessage, setTestMessage] = React.useState('');

  const handleTestBackend = async () => {
    setTestStatus('testing');
    setTestMessage('Pinging server health check...');
    try {
      const urlToTest = (backendUrl.trim() || 'https://linova-music.onrender.com').replace(/\/+$/, '');
      const fullUrl = urlToTest.endsWith('/api') ? `${urlToTest}/health` : `${urlToTest}/api/health`;
      
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(fullUrl, { signal: controller.signal });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        setTestStatus('success');
        setTestMessage(`Connected! Provider: ${data.provider?.activeProvider || 'ready'}`);
      } else {
        setTestStatus('error');
        setTestMessage(`Server returned HTTP ${res.status}`);
      }
    } catch (e) {
      setTestStatus('error');
      setTestMessage(e.name === 'AbortError' ? 'Connection timed out (server might be waking up).' : `Cannot reach server: ${e.message}`);
    }
  };

  const handleSaveBackend = () => {
    const trimmed = backendUrl.trim();
    if (!trimmed) {
      localStorage.removeItem('linova_backend_url');
      showToast('Default cloud server restored (Render)', 'info');
    } else {
      localStorage.setItem('linova_backend_url', trimmed);
      showToast('Custom backend server saved!', 'success');
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
          <div className="pt-2 space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user?.name}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-linova-primary/40"
              />
              <div>
                <h4 className="font-bold text-white text-base">{user?.name}</h4>
                <p className="text-xs text-gray-400">{user?.email}</p>
                {memberSince(user?.createdAt) && (
                  <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>Member since {memberSince(user.createdAt)}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                <Heart className="w-4 h-4 text-rose-400 mx-auto mb-1" />
                <div className="text-lg font-extrabold text-white">{likedTracks?.length || 0}</div>
                <div className="text-[10px] text-gray-500">Liked Songs</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                <ListMusic className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                <div className="text-lg font-extrabold text-white">{playlists?.length || 0}</div>
                <div className="text-[10px] text-gray-500">Playlists</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                <History className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <div className="text-lg font-extrabold text-white">{history?.length || 0}</div>
                <div className="text-[10px] text-gray-500">Songs Played</div>
              </div>
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

      {/* Listening History */}
      {isAuthenticated && (
        <section className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Listening History</h3>
          </div>

          {history && history.length > 0 ? (
            <div className="space-y-1">
              {history.slice(0, 15).map((entry, idx) => {
                const track = entry.track || entry;
                return (
                  <button
                    key={entry._id || `${track.id}_${idx}`}
                    onClick={() => playTrack(track, history.map(h => h.track || h))}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors text-left group"
                  >
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                      {track.artwork ? (
                        <img src={track.artwork} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          <History className="w-4 h-4" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{track.title}</p>
                      <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                    </div>
                    <span className="text-[11px] text-gray-500 flex-shrink-0">
                      {timeAgo(entry.playedAt || entry.createdAt)}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-2">
              Nothing played yet — your recently played songs will show up here.
            </p>
          )}
        </section>
      )}

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

      {/* Backend & Mobile Server Connection */}
      <section className="glass-card p-6 rounded-3xl space-y-4">
        <div className="flex items-center gap-3">
          <Server className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-base font-bold text-white">Backend & Mobile Connection</h3>
            <p className="text-xs text-gray-400">Configure or test the API server that the app connects to.</p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <div className="p-4 rounded-2xl bg-white/5 space-y-3">
            <label className="text-xs font-semibold text-gray-200 block">Server URL</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                placeholder="https://linova-music.onrender.com (or http://192.168.x.x:5000)"
                className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-linova-primary"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleTestBackend}
                  disabled={testStatus === 'testing'}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
                  Test
                </button>
                <button
                  onClick={handleSaveBackend}
                  className="px-4 py-2.5 rounded-xl bg-linova-primary hover:bg-linova-primary-dark text-white text-xs font-bold shadow-md transition-all"
                >
                  Save
                </button>
              </div>
            </div>

            {testStatus !== 'idle' && (
              <div className={`flex items-center gap-2 text-xs font-medium pt-1 ${
                testStatus === 'success' ? 'text-emerald-400' :
                testStatus === 'error' ? 'text-rose-400' : 'text-amber-400'
              }`}>
                {testStatus === 'success' && <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
                {testStatus === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                {testStatus === 'testing' && <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" />}
                <span>{testMessage}</span>
              </div>
            )}

            <p className="text-[11px] text-gray-400 leading-relaxed">
              Default is <span className="text-indigo-300 font-mono">https://linova-music.onrender.com</span>. If testing on Android using your home Wi-Fi, enter your computer&apos;s LAN IP (e.g. <span className="text-indigo-300 font-mono">http://192.168.1.50:5000</span>).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
