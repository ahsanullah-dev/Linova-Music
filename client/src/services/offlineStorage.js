import { get, set, del, keys, entries } from 'idb-keyval';
import CryptoJS from 'crypto-js';
import { getBaseUrl } from './api.js';

const TRACK_PREFIX = 'linova_offline_track_';
const AUDIO_PREFIX = 'linova_offline_audio_';
const activeBlobUrls = new Map();

function decryptSaavnUrl(enc) {
  if (!enc) return null;
  try {
    const key = CryptoJS.enc.Utf8.parse('38346591');
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(enc) },
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    const rawUrl = decrypted.toString(CryptoJS.enc.Utf8);
    if (!rawUrl) return null;
    return rawUrl.replace('_96.mp4', '_320.mp4').replace('_96.mp3', '_320.mp3');
  } catch {
    return null;
  }
}

async function resolveDirectAudioUrl(track) {
  try {
    const query = `${track.title || ''} ${track.artist || ''}`.trim();
    if (!query) return null;
    const searchUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&q=${encodeURIComponent(query)}&_format=json&p=1&n=3&_marker=0&ctx=web6dot0`;
    const res = await fetch(searchUrl, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const data = await res.json();
    const results = data.results || [];
    for (const item of results) {
      const encUrl = item.encrypted_media_url || item.more_info?.encrypted_media_url;
      const decrypted = decryptSaavnUrl(encUrl) || item.more_info?.vlink;
      if (decrypted) return decrypted;
    }
  } catch (e) {
    console.warn('[Offline Storage] Direct stream fallback error:', e.message);
  }
  return null;
}

async function blobToDataUrl(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });
}

export const offlineStorage = {
  /**
   * Downloads track audio and saves metadata and blob into IndexedDB
   */
  async downloadTrack(track, onProgress = null) {
    if (!track || !track.id) {
      throw new Error('Track must have a valid identifier.');
    }

    try {
      if (onProgress) onProgress({ status: 'connecting', percent: 5 });

      // Resolve full download/stream URL
      let targetUrl = track.audioUrl;
      const baseUrl = getBaseUrl();
      const serverOrigin = baseUrl.replace(/\/api$/, '');

      if (!targetUrl || targetUrl.trim() === '') {
        const videoId = (track.videoId || track.id).replace(/^yt_/, '');
        targetUrl = `${baseUrl}/music/stream/${videoId}?title=${encodeURIComponent(track.title || '')}&artist=${encodeURIComponent(track.artist || '')}`;
      } else if (targetUrl.startsWith('/api')) {
        targetUrl = `${serverOrigin}${targetUrl}`;
      }

      if (onProgress) onProgress({ status: 'downloading', percent: 15 });

      let response = null;
      try {
        const primaryRes = await fetch(targetUrl);
        if (primaryRes.ok) {
          response = primaryRes;
        }
      } catch (err) {
        console.warn('[Offline Storage] Server stream fetch warning:', err.message);
      }

      // If server stream was unavailable, cold, or failed, fallback to direct CDN resolver
      if (!response) {
        if (onProgress) onProgress({ status: 'resolving_stream', percent: 30 });
        const directUrl = await resolveDirectAudioUrl(track);
        if (directUrl) {
          response = await fetch(directUrl);
        }
      }

      if (!response || !response.ok) {
        throw new Error('Could not download audio stream. Server is temporarily unavailable or waking up.');
      }

      if (onProgress) onProgress({ status: 'downloading', percent: 55 });
      const rawBlob = await response.blob();

      // Ensure proper audio MIME type
      const contentType = response.headers.get('content-type') || rawBlob.type || 'audio/mp4';
      const audioBlob = new Blob([rawBlob], { type: contentType.split(';')[0] });

      if (onProgress) onProgress({ status: 'caching_artwork', percent: 80 });

      // Cache artwork offline as Base64 data URL so it displays with no internet
      let offlineArtwork = track.artwork;
      if (track.artwork && track.artwork.startsWith('http')) {
        try {
          const artRes = await fetch(track.artwork);
          if (artRes.ok) {
            const artBlob = await artRes.blob();
            const dataUrl = await blobToDataUrl(artBlob);
            if (dataUrl) offlineArtwork = dataUrl;
          }
        } catch {
          // Keep original artwork URL if offline fetch fails
        }
      }

      if (onProgress) onProgress({ status: 'saving', percent: 92 });

      // Save audio blob and metadata snapshot
      const metadata = {
        ...track,
        artwork: offlineArtwork,
        downloadedAt: new Date().toISOString(),
        sizeBytes: audioBlob.size,
        mimeType: audioBlob.type || 'audio/mp4'
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
      // Revoke any previous Blob URL for this track to free memory
      if (activeBlobUrls.has(trackId)) {
        URL.revokeObjectURL(activeBlobUrls.get(trackId));
        activeBlobUrls.delete(trackId);
      }

      const audioBlob = await get(`${AUDIO_PREFIX}${trackId}`);
      if (!audioBlob) return null;

      const mimeType = audioBlob.type || 'audio/mp4';
      const playableBlob = new Blob([audioBlob], { type: mimeType });
      const blobUrl = URL.createObjectURL(playableBlob);
      activeBlobUrls.set(trackId, blobUrl);
      return blobUrl;
    } catch (error) {
      console.error(`[Offline Storage] Error getting audio blob for ${trackId}:`, error);
      return null;
    }
  },

  /**
   * Revoke all active blob URLs
   */
  revokeAllOfflineUrls() {
    activeBlobUrls.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    });
    activeBlobUrls.clear();
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
