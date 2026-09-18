const BASE_URL = '/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('linova_auth_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('linova_auth_token', token);
    } else {
      localStorage.removeItem('linova_auth_token');
    }
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // The API is proxied to a Render free-tier service, which sleeps after
    // ~15 minutes of inactivity. The first request after a sleep can take
    // 30-60s to cold start and often comes back as a 502/503/504 gateway
    // page (HTML, not JSON). Retry those with backoff instead of surfacing
    // an unhelpful "Unexpected token <" JSON parse error to the user.
    const COLD_START_STATUSES = [502, 503, 504, 522, 524];
    const MAX_ATTEMPTS = 3;
    let lastError;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
          ...options,
          headers
        });

        if (!response.ok && COLD_START_STATUSES.includes(response.status)) {
          const error = new Error(
            'The music server is waking up. This can take up to a minute on the first request.'
          );
          error.status = response.status;
          error.code = 'SERVER_COLD_START';
          throw error;
        }

        // Guard against gateway/HTML bodies that would blow up response.json()
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          const error = new Error(
            `Expected JSON from ${endpoint} but received "${contentType || 'unknown'}"`
          );
          error.status = response.status;
          error.code = 'NON_JSON_RESPONSE';
          throw error;
        }

        const data = await response.json();

        if (!response.ok) {
          const error = new Error(data.error?.message || 'API request failed');
          error.code = data.error?.code;
          error.status = response.status;
          throw error;
        }

        return data.data !== undefined ? data.data : data;
      } catch (error) {
        lastError = error;

        const isRetryable =
          error.code === 'SERVER_COLD_START' ||
          error.code === 'NON_JSON_RESPONSE' ||
          error.name === 'TypeError'; // network-level failure

        if (!isRetryable || attempt === MAX_ATTEMPTS) {
          console.error(`[API Error] ${endpoint}:`, error);
          throw error;
        }

        const delayMs = 2000 * attempt; // 2s, then 4s
        console.warn(
          `[API Retry] ${endpoint} failed (${error.code || error.name}); retrying in ${delayMs}ms (attempt ${attempt + 1}/${MAX_ATTEMPTS})`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    throw lastError;
  }

  // Auth
  register(userData) {
    return this.request('/auth/register', { method: 'POST', body: JSON.stringify(userData) });
  }

  login(credentials) {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
  }

  getMe() {
    return this.request('/auth/me');
  }

  updateProfile(profileData) {
    return this.request('/auth/profile', { method: 'PATCH', body: JSON.stringify(profileData) });
  }

  // Music Catalog
  getHome(category) {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/music/home${qs}`);
  }

  search(query, type) {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (type) params.append('type', type);
    return this.request(`/music/search?${params.toString()}`);
  }

  recordSearch(query) {
    if (!query) return Promise.resolve();
    return this.request('/history/searches', { method: 'POST', body: JSON.stringify({ query }) }).catch(() => {});
  }

  getSearchHistory() {
    return this.request('/history/searches').catch(() => []);
  }

  getTrack(id) {
    return this.request(`/music/tracks/${id}`);
  }

  getArtist(id) {
    return this.request(`/music/artists/${id}`);
  }

  getAlbum(id) {
    return this.request(`/music/albums/${id}`);
  }

  getPlaylist(id) {
    return this.request(`/music/playlists/${id}`);
  }

  getRecommendations() {
    return this.request('/music/recommendations');
  }

  getProviderStatus() {
    return this.request('/music/status');
  }

  // Library - Likes
  getLikedSongs() {
    return this.request('/library/liked');
  }

  addLikedSong(track) {
    return this.request('/library/liked', { method: 'POST', body: JSON.stringify({ track }) });
  }

  removeLikedSong(trackId) {
    return this.request(`/library/liked/${trackId}`, { method: 'DELETE' });
  }

  // Library - Saved Albums
  getSavedAlbums() {
    return this.request('/library/albums');
  }

  addSavedAlbum(album) {
    return this.request('/library/albums', { method: 'POST', body: JSON.stringify({ album }) });
  }

  removeSavedAlbum(albumId) {
    return this.request(`/library/albums/${albumId}`, { method: 'DELETE' });
  }

  // Library - Saved Artists
  getSavedArtists() {
    return this.request('/library/artists');
  }

  addSavedArtist(artist) {
    return this.request('/library/artists', { method: 'POST', body: JSON.stringify({ artist }) });
  }

  removeSavedArtist(artistId) {
    return this.request(`/library/artists/${artistId}`, { method: 'DELETE' });
  }

  // User Playlists
  getUserPlaylists() {
    return this.request('/playlists');
  }

  createPlaylist(data) {
    return this.request('/playlists', { method: 'POST', body: JSON.stringify(data) });
  }

  getPlaylistById(id) {
    return this.request(`/playlists/${id}`);
  }

  updatePlaylist(id, data) {
    return this.request(`/playlists/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  deletePlaylist(id) {
    return this.request(`/playlists/${id}`, { method: 'DELETE' });
  }

  addTrackToPlaylist(playlistId, track) {
    return this.request(`/playlists/${playlistId}/tracks`, { method: 'POST', body: JSON.stringify({ track }) });
  }

  removeTrackFromPlaylist(playlistId, trackId) {
    return this.request(`/playlists/${playlistId}/tracks/${trackId}`, { method: 'DELETE' });
  }

  reorderPlaylist(playlistId, sourceIndex, destinationIndex) {
    return this.request(`/playlists/${playlistId}/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ sourceIndex, destinationIndex })
    });
  }

  // History
  getHistory() {
    return this.request('/history');
  }

  addHistory(track, completionPercentage) {
    return this.request('/history', {
      method: 'POST',
      body: JSON.stringify({ track, completionPercentage })
    });
  }

  // Lyrics
  getLyrics(trackId, title, artist) {
    const params = new URLSearchParams();
    if (trackId) params.append('trackId', trackId);
    if (title) params.append('title', title);
    if (artist) params.append('artist', artist);
    return this.request(`/lyrics?${params.toString()}`);
  }

  // AI Music Chat
  chatAI(messages, attachedSong = null) {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, attachedSong })
    });
  }
}

export const api = new ApiService();
