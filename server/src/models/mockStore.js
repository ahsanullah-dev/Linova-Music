// In-memory persistent mock datastore for zero-config offline execution
import bcrypt from 'bcryptjs';

const mockDb = {
  users: [
    {
      _id: 'user_demo_1',
      name: 'Demo Listener',
      email: 'demo@linova.music',
      passwordHash: bcrypt.hashSync('linova123', 10),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      preferences: {
        theme: 'dark',
        accentColor: '#6366F1',
        audioQuality: 'high',
        autoplay: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  playlists: [
    {
      _id: 'playlist_fav_1',
      userId: 'user_demo_1',
      name: 'Chill Waves & Late Nights',
      description: 'The ultimate collection of deep melodic beats and atmospheric rhythms.',
      coverImage: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80',
      isPublic: true,
      tracks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  likedSongs: [],
  savedAlbums: [],
  savedArtists: [],
  history: []
};

export const mockStore = {
  // Users
  async findUserByEmail(email) {
    return mockDb.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },
  async findUserById(id) {
    return mockDb.users.find(u => u._id === id || u._id.toString() === id.toString()) || null;
  },
  async createUser(userData) {
    const user = {
      _id: `user_${Date.now()}`,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockDb.users.push(user);
    return user;
  },
  async updateUser(id, updates) {
    const user = await this.findUserById(id);
    if (!user) return null;
    Object.assign(user, updates, { updatedAt: new Date() });
    return user;
  },

  // Playlists
  async getUserPlaylists(userId) {
    return mockDb.playlists.filter(p => p.userId.toString() === userId.toString());
  },
  async getPlaylistById(id) {
    return mockDb.playlists.find(p => p._id.toString() === id.toString()) || null;
  },
  async createPlaylist(userId, data) {
    const playlist = {
      _id: `playlist_${Date.now()}`,
      userId,
      name: data.name,
      description: data.description || '',
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
      isPublic: data.isPublic !== false,
      tracks: data.tracks || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockDb.playlists.push(playlist);
    return playlist;
  },
  async updatePlaylist(id, userId, updates) {
    const playlist = await this.getPlaylistById(id);
    if (!playlist || playlist.userId.toString() !== userId.toString()) return null;
    Object.assign(playlist, updates, { updatedAt: new Date() });
    return playlist;
  },
  async deletePlaylist(id, userId) {
    const index = mockDb.playlists.findIndex(p => p._id.toString() === id.toString() && p.userId.toString() === userId.toString());
    if (index === -1) return false;
    mockDb.playlists.splice(index, 1);
    return true;
  },
  async addTrackToPlaylist(id, userId, track) {
    const playlist = await this.getPlaylistById(id);
    if (!playlist || playlist.userId.toString() !== userId.toString()) return null;
    if (!playlist.tracks.some(t => t.id === track.id)) {
      playlist.tracks.push({ ...track, addedAt: new Date() });
      playlist.updatedAt = new Date();
    }
    return playlist;
  },
  async removeTrackFromPlaylist(id, userId, trackId) {
    const playlist = await this.getPlaylistById(id);
    if (!playlist || playlist.userId.toString() !== userId.toString()) return null;
    playlist.tracks = playlist.tracks.filter(t => t.id !== trackId);
    playlist.updatedAt = new Date();
    return playlist;
  },
  async reorderPlaylistTracks(id, userId, sourceIndex, destinationIndex) {
    const playlist = await this.getPlaylistById(id);
    if (!playlist || playlist.userId.toString() !== userId.toString()) return null;
    const [moved] = playlist.tracks.splice(sourceIndex, 1);
    playlist.tracks.splice(destinationIndex, 0, moved);
    playlist.updatedAt = new Date();
    return playlist;
  },

  // Liked Songs
  async getLikedSongs(userId) {
    return mockDb.likedSongs.filter(l => l.userId.toString() === userId.toString());
  },
  async addLikedSong(userId, track) {
    const existing = mockDb.likedSongs.find(l => l.userId.toString() === userId.toString() && l.trackId === track.id);
    if (existing) return existing;
    const item = {
      _id: `like_${Date.now()}`,
      userId,
      provider: track.provider || 'mock',
      trackId: track.id,
      track,
      createdAt: new Date()
    };
    mockDb.likedSongs.unshift(item);
    return item;
  },
  async removeLikedSong(userId, trackId) {
    const index = mockDb.likedSongs.findIndex(l => l.userId.toString() === userId.toString() && l.trackId === trackId);
    if (index === -1) return false;
    mockDb.likedSongs.splice(index, 1);
    return true;
  },

  // Saved Albums
  async getSavedAlbums(userId) {
    return mockDb.savedAlbums.filter(a => a.userId.toString() === userId.toString());
  },
  async addSavedAlbum(userId, album) {
    const existing = mockDb.savedAlbums.find(a => a.userId.toString() === userId.toString() && a.albumId === album.id);
    if (existing) return existing;
    const item = {
      _id: `album_${Date.now()}`,
      userId,
      provider: album.provider || 'mock',
      albumId: album.id,
      album,
      createdAt: new Date()
    };
    mockDb.savedAlbums.unshift(item);
    return item;
  },
  async removeSavedAlbum(userId, albumId) {
    const index = mockDb.savedAlbums.findIndex(a => a.userId.toString() === userId.toString() && a.albumId === albumId);
    if (index === -1) return false;
    mockDb.savedAlbums.splice(index, 1);
    return true;
  },

  // Saved Artists
  async getSavedArtists(userId) {
    return mockDb.savedArtists.filter(a => a.userId.toString() === userId.toString());
  },
  async addSavedArtist(userId, artist) {
    const existing = mockDb.savedArtists.find(a => a.userId.toString() === userId.toString() && a.artistId === artist.id);
    if (existing) return existing;
    const item = {
      _id: `artist_${Date.now()}`,
      userId,
      provider: artist.provider || 'mock',
      artistId: artist.id,
      artist,
      createdAt: new Date()
    };
    mockDb.savedArtists.unshift(item);
    return item;
  },
  async removeSavedArtist(userId, artistId) {
    const index = mockDb.savedArtists.findIndex(a => a.userId.toString() === userId.toString() && a.artistId === artistId);
    if (index === -1) return false;
    mockDb.savedArtists.splice(index, 1);
    return true;
  },

  // History
  async getHistory(userId) {
    const uid = userId || 'guest_session';
    return mockDb.history
      .filter(h => h.userId.toString() === uid.toString())
      .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt))
      .slice(0, 50);
  },
  async addHistory(userId, track, completionPercentage = 100) {
    const uid = userId || 'guest_session';
    const item = {
      _id: `hist_${Date.now()}`,
      userId: uid,
      provider: track.provider || 'youtube-music',
      trackId: track.id,
      track,
      playedAt: new Date(),
      completionPercentage
    };
    mockDb.history.unshift(item);
    return item;
  },

  // Searches
  async getSearches(userId) {
    const uid = userId || 'guest_session';
    return (mockDb.searches || [])
      .filter(s => s.userId.toString() === uid.toString())
      .sort((a, b) => new Date(b.searchedAt) - new Date(a.searchedAt))
      .slice(0, 20);
  },
  async addSearch(userId, query) {
    if (!query || !query.trim()) return null;
    if (!mockDb.searches) mockDb.searches = [];
    const uid = userId || 'guest_session';
    const cleanQ = query.trim();
    // Remove duplicates
    mockDb.searches = mockDb.searches.filter(s => !(s.userId.toString() === uid.toString() && s.query.toLowerCase() === cleanQ.toLowerCase()));
    const item = {
      _id: `search_${Date.now()}`,
      userId: uid,
      query: cleanQ,
      searchedAt: new Date()
    };
    mockDb.searches.unshift(item);
    return item;
  }
};
