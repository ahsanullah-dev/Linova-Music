import { create } from 'zustand';
import { api } from '../services/api.js';

export const useLibraryStore = create((set, get) => ({
  likedTracks: [],
  likedTrackIds: new Set(),
  playlists: [],
  savedAlbums: [],
  savedArtists: [],
  history: [],
  isLoading: false,

  fetchLibraryData: async () => {
    set({ isLoading: true });
    try {
      const [likes, playlists, albums, artists, history] = await Promise.allSettled([
        api.getLikedSongs(),
        api.getUserPlaylists(),
        api.getSavedAlbums(),
        api.getSavedArtists(),
        api.getHistory()
      ]);

      const likedTracks = likes.status === 'fulfilled' ? likes.value.map(l => l.track || l) : [];
      const likedTrackIds = new Set(likedTracks.map(t => t.id));

      set({
        likedTracks,
        likedTrackIds,
        playlists: playlists.status === 'fulfilled' ? playlists.value : [],
        savedAlbums: albums.status === 'fulfilled' ? albums.value : [],
        savedArtists: artists.status === 'fulfilled' ? artists.value : [],
        history: history.status === 'fulfilled' ? history.value : [],
        isLoading: false
      });
    } catch (error) {
      console.error('[Library Store] Failed to fetch library:', error);
      set({ isLoading: false });
    }
  },

  toggleLike: async (track) => {
    if (!track || !track.id) return;
    const { likedTrackIds, likedTracks } = get();
    const isLiked = likedTrackIds.has(track.id);

    // Optimistic UI update
    const nextIds = new Set(likedTrackIds);
    let nextTracks = [...likedTracks];

    if (isLiked) {
      nextIds.delete(track.id);
      nextTracks = nextTracks.filter(t => t.id !== track.id);
      set({ likedTrackIds: nextIds, likedTracks: nextTracks });
      try {
        await api.removeLikedSong(track.id);
      } catch (e) {
        // Rollback on error
        set({ likedTrackIds, likedTracks });
      }
    } else {
      nextIds.add(track.id);
      nextTracks = [track, ...nextTracks];
      set({ likedTrackIds: nextIds, likedTracks: nextTracks });
      try {
        await api.addLikedSong(track);
      } catch (e) {
        // Rollback on error
        set({ likedTrackIds, likedTracks });
      }
    }
  },

  createPlaylist: async (data) => {
    const newPlaylist = await api.createPlaylist(data);
    set(state => ({ playlists: [newPlaylist, ...state.playlists] }));
    return newPlaylist;
  },

  deletePlaylist: async (id) => {
    await api.deletePlaylist(id);
    set(state => ({ playlists: state.playlists.filter(p => p._id !== id) }));
  },

  addTrackToPlaylist: async (playlistId, track) => {
    const updated = await api.addTrackToPlaylist(playlistId, track);
    set(state => ({
      playlists: state.playlists.map(p => p._id === playlistId ? updated : p)
    }));
    return updated;
  },

  removeTrackFromPlaylist: async (playlistId, trackId) => {
    const updated = await api.removeTrackFromPlaylist(playlistId, trackId);
    set(state => ({
      playlists: state.playlists.map(p => p._id === playlistId ? updated : p)
    }));
    return updated;
  },

  reorderPlaylist: async (playlistId, sourceIndex, destinationIndex) => {
    const updated = await api.reorderPlaylist(playlistId, sourceIndex, destinationIndex);
    set(state => ({
      playlists: state.playlists.map(p => p._id === playlistId ? updated : p)
    }));
    return updated;
  }
}));
