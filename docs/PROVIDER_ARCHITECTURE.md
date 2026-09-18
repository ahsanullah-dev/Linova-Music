# LINOVA MUSIC — Music Provider Architecture

## 1. Provider Design Principle
To ensure provider-independence, the frontend client and core business logic NEVER interact with provider-specific SDKs or raw schemas directly. All catalog data is strictly normalized before leaving the server.

## 2. The Abstract Provider Interface
Every provider implements the following contract:

```javascript
class MusicProvider {
  async getCapabilities() { /* returns supported feature flags */ }
  async getHomeSections(userId) { /* returns normalized dynamic sections */ }
  async search(query, type) { /* returns normalized search results */ }
  async getTrack(id) { /* returns normalized Track */ }
  async getArtist(id) { /* returns normalized Artist with topTracks and albums */ }
  async getAlbum(id) { /* returns normalized Album with tracklist */ }
  async getPlaylist(id) { /* returns normalized Playlist */ }
  async getRecommendations(signals) { /* returns recommended tracks/albums */ }
  async getLyrics(trackId, title, artist) { /* returns lyrics payload */ }
}
```

## 3. Normalized Track Model
```json
{
  "id": "track-123",
  "provider": "mock",
  "title": "Midnight City Lights",
  "artist": "Aura",
  "artists": [{ "id": "artist-1", "name": "Aura" }],
  "album": { "id": "album-1", "name": "Neon Dreams" },
  "duration": 215,
  "artwork": "https://images.unsplash.com/photo-...",
  "audioUrl": "/audio/track-123.mp3",
  "canDownload": true,
  "playable": true
}
```

## 4. Providers
1. **MockMusicProvider:** Fast, comprehensive in-memory catalog with curated royalty-free audio tracks, dynamic genres, search, artists, albums, playlists, and synced lyrics.
2. **YouTubeMusicProvider:** Experimental adapter mapping YouTube Music metadata to the normalized format.
3. **ProviderFactory:** Dynamic selector that falls back to `MockMusicProvider` gracefully if external services are unreachable.
