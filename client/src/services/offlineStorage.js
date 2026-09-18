import { get, set, del, keys, entries } from 'idb-keyval';

const TRACK_PREFIX = 'linova_offline_track_';
const AUDIO_PREFIX = 'linova_offline_audio_';

export const offlineStorage = {
  /**
   * Downloads track audio and saves metadata and blob into IndexedDB
   */
  async downloadTrack(track, onProgress = null) {
    if (!track || !track.id || !track.audioUrl) {
      throw new Error('Track does not have a downloadable audio stream.');
    }

    try {
      if (onProgress) onProgress({ status: 'downloading', percent: 10 });

      // Fetch the audio binary stream as a Blob
      const response = await fetch(track.audioUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio stream (HTTP ${response.status})`);
      }

      if (onProgress) onProgress({ status: 'downloading', percent: 60 });
      const audioBlob = await response.blob();

      if (onProgress) onProgress({ status: 'saving', percent: 90 });

      // Save audio blob and metadata snapshot
      const metadata = {
        ...track,
        downloadedAt: new Date().toISOString(),
        sizeBytes: audioBlob.size,
        mimeType: audioBlob.type || 'audio/mp3'
      };

      await set(`${TRACK_PREFIX}${track.id}`, metadata);
      await set(`${AUDIO_PREFIX}${track.id}`, audioBlob);

      if (onProgress) onProgress({ status: 'completed', percent: 100 });
      return metadata;
    } catch (error) {
      console.error(`[Offline Storage] Failed to download track ${track.id}:`, error);
      throw error;
    }
  },

  /**
   * Retrieves an offline audio playback URL (Blob URL)
   */
  async getOfflineAudioUrl(trackId) {
    try {
      const audioBlob = await get(`${AUDIO_PREFIX}${trackId}`);
      if (!audioBlob) return null;
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error(`[Offline Storage] Error getting audio blob for ${trackId}:`, error);
      return null;
    }
  },

  /**
   * Checks if a track is stored offline
   */
  async isTrackDownloaded(trackId) {
    try {
      const meta = await get(`${TRACK_PREFIX}${trackId}`);
      return !!meta;
    } catch {
      return false;
    }
  },

  /**
   * Removes a downloaded track from IndexedDB
   */
  async removeTrack(trackId) {
    try {
      await del(`${TRACK_PREFIX}${trackId}`);
      await del(`${AUDIO_PREFIX}${trackId}`);
      return true;
    } catch (error) {
      console.error(`[Offline Storage] Error removing track ${trackId}:`, error);
      return false;
    }
  },

  /**
   * Gets all downloaded tracks
   */
  async getAllDownloadedTracks() {
    try {
      const allEntries = await entries();
      const tracks = [];

      for (const [key, val] of allEntries) {
        if (typeof key === 'string' && key.startsWith(TRACK_PREFIX)) {
          tracks.push(val);
        }
      }

      return tracks.sort((a, b) => new Date(b.downloadedAt) - new Date(a.downloadedAt));
    } catch (error) {
      console.error('[Offline Storage] Error listing downloaded tracks:', error);
      return [];
    }
  },

  /**
   * Gets total offline storage used in Megabytes
   */
  async getStorageUsage() {
    try {
      const tracks = await this.getAllDownloadedTracks();
      const totalBytes = tracks.reduce((acc, t) => acc + (t.sizeBytes || 0), 0);
      return {
        totalTracks: tracks.length,
        totalBytes,
        totalMB: (totalBytes / (1024 * 1024)).toFixed(2)
      };
    } catch {
      return { totalTracks: 0, totalBytes: 0, totalMB: '0.00' };
    }
  },

  /**
   * Clears all offline downloaded tracks
   */
  async clearAllOfflineData() {
    try {
      const allKeys = await keys();
      for (const key of allKeys) {
        if (typeof key === 'string' && (key.startsWith(TRACK_PREFIX) || key.startsWith(AUDIO_PREFIX))) {
          await del(key);
        }
      }
      return true;
    } catch (error) {
      console.error('[Offline Storage] Error clearing offline data:', error);
      return false;
    }
  }
};
