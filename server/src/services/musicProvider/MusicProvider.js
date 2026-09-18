/**
 * Base Music Provider Abstract Interface
 * All concrete music providers (Mock, YouTube Music, etc.) must implement this interface.
 */
export class MusicProvider {
  constructor(name = 'base-provider') {
    this.name = name;
  }

  async getCapabilities() {
    return {
      search: false,
      tracks: false,
      albums: false,
      artists: false,
      playlists: false,
      recommendations: false,
      playback: false,
      lyrics: false,
      canDownload: false
    };
  }

  async getHomeSections(userId) {
    throw new Error('Method getHomeSections() not implemented.');
  }

  async search(query, type = 'all') {
    throw new Error('Method search() not implemented.');
  }

  async getTrack(id) {
    throw new Error('Method getTrack() not implemented.');
  }

  async getArtist(id) {
    throw new Error('Method getArtist() not implemented.');
  }

  async getAlbum(id) {
    throw new Error('Method getAlbum() not implemented.');
  }

  async getPlaylist(id) {
    throw new Error('Method getPlaylist() not implemented.');
  }

  async getRecommendations(signals) {
    throw new Error('Method getRecommendations() not implemented.');
  }

  async getLyrics(trackId, title, artist) {
    throw new Error('Method getLyrics() not implemented.');
  }
}
