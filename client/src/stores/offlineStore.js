import { create } from 'zustand';
import { offlineStorage } from '../services/offlineStorage.js';

export const useOfflineStore = create((set, get) => ({
  downloadedTracks: [],
  downloadingIds: {}, // { [trackId]: progressPercentage }
  storageUsage: { totalTracks: 0, totalBytes: 0, totalMB: '0.00' },
  isOnline: navigator.onLine,
  isLoading: true,

  initialize: async () => {
    // Listen to network status
    window.addEventListener('online', () => set({ isOnline: true }));
    window.addEventListener('offline', () => set({ isOnline: false }));

    await get().refreshDownloads();
  },

  refreshDownloads: async () => {
    try {
      const tracks = await offlineStorage.getAllDownloadedTracks();
      const storageUsage = await offlineStorage.getStorageUsage();
      set({ downloadedTracks: tracks, storageUsage, isLoading: false });
    } catch (error) {
      console.error('[Offline Store] Failed to refresh downloads:', error);
      set({ isLoading: false });
    }
  },

  downloadTrack: async (track) => {
    if (!track || !track.id) return;

    set(state => ({
      downloadingIds: { ...state.downloadingIds, [track.id]: 10 }
    }));

    try {
      await offlineStorage.downloadTrack(track, (progress) => {
        set(state => ({
          downloadingIds: { ...state.downloadingIds, [track.id]: progress.percent }
        }));
      });

      await get().refreshDownloads();
    } catch (error) {
      console.error('[Offline Store] Download failed:', error);
      throw error;
    } finally {
      set(state => {
        const nextDownloading = { ...state.downloadingIds };
        delete nextDownloading[track.id];
        return { downloadingIds: nextDownloading };
      });
    }
  },

  removeDownloadedTrack: async (trackId) => {
    await offlineStorage.removeTrack(trackId);
    await get().refreshDownloads();
  },

  clearAllDownloads: async () => {
    await offlineStorage.clearAllOfflineData();
    await get().refreshDownloads();
  },

  isTrackDownloaded: (trackId) => {
    return get().downloadedTracks.some(t => t.id === trackId);
  }
}));
