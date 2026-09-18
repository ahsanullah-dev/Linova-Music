import { MusicProvider } from './MusicProvider.js';

/**
 * SaavnMusicProvider
 * Provides full access to 80M+ tracks, albums, artists, trending charts, and high-quality streaming audio
 * using open public endpoints.
 */
export class SaavnMusicProvider extends MusicProvider {
  constructor() {
    super('saavn');
    this.primaryApi = 'https://saavn.dev/api';
    this.fallbackApi = 'https://jiosaavn-api-privateindexing.vercel.app/api';
  }

  async getCapabilities() {
    return {
      search: true,
      tracks: true,
      albums: true,
      artists: true,
      playlists: true,
      recommendations: true,
      playback: true,
      lyrics: true,
      canDownload: true
    };
  }

  async fetchApi(endpoint) {
    try {
      const res = await fetch(`${this.primaryApi}${endpoint}`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(6000)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
    } catch (e) {
      // Try fallback
    }

    try {
      const resFallback = await fetch(`${this.fallbackApi}${endpoint}`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(6000)
      });
      if (resFallback.ok) {
        const json = await resFallback.json();
        return json.data || json;
      }
    } catch (err) {
      console.warn(`[Saavn API] Request failed for ${endpoint}:`, err.message);
    }
    return null;
  }

  normalizeTrack(item) {
    if (!item) return null;

    // Extract best audio download / stream URL (320kbps or 160kbps or direct)
    let streamUrl = '';
    if (item.downloadUrl && Array.isArray(item.downloadUrl)) {
      const highQuality = item.downloadUrl.find(d => d.quality === '320kbps') ||
                          item.downloadUrl.find(d => d.quality === '160kbps') ||
                          item.downloadUrl[item.downloadUrl.length - 1];
      streamUrl = highQuality?.url || highQuality?.link || '';
    } else if (typeof item.downloadUrl === 'string') {
      streamUrl = item.downloadUrl;
    } else if (item.media_url) {
      streamUrl = item.media_url;
    }

    // Extract best artwork (500x500)
    let artworkUrl = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80';
    if (item.image && Array.isArray(item.image)) {
      const highImg = item.image.find(i => i.quality === '500x500') || item.image[item.image.length - 1];
      artworkUrl = highImg?.url || highImg?.link || artworkUrl;
    } else if (typeof item.image === 'string') {
      artworkUrl = item.image;
    }

    const artistsList = [];
    if (item.artists && Array.isArray(item.artists.primary)) {
      item.artists.primary.forEach(a => artistsList.push({ id: a.id, name: a.name }));
    } else if (item.primaryArtists) {
      item.primaryArtists.split(',').forEach((name, idx) => {
        artistsList.push({ id: `artist_${idx}`, name: name.trim() });
      });
    }

    const artistName = item.artist || item.primaryArtists || artistsList.map(a => a.name).join(', ') || 'Various Artists';

    return {
      id: item.id?.toString() || `track_${Date.now()}`,
      provider: 'saavn',
      title: (item.name || item.title || 'Unknown Title').replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
      artist: artistName.replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
      artists: artistsList.length > 0 ? artistsList : [{ id: 'art-0', name: artistName }],
      album: {
        id: item.album?.id || item.albumId || 'album-0',
        name: (item.album?.name || item.album || 'Single').replace(/&quot;/g, '"').replace(/&amp;/g, '&')
      },
      duration: parseInt(item.duration, 10) || 180,
      artwork: artworkUrl,
      audioUrl: streamUrl,
      canDownload: !!streamUrl,
      playable: !!streamUrl,
      year: item.year || 2024,
      playCount: item.playCount || '1.2M',
      explicit: item.explicitContent || false
    };
  }

  async getHomeSections(userId) {
    try {
      const [trendingSongs, charts, albumsData] = await Promise.allSettled([
        this.fetchApi('/search/songs?query=trending+top+hits&limit=15'),
        this.fetchApi('/search/playlists?query=today+top+hits&limit=10'),
        this.fetchApi('/search/albums?query=latest+albums&limit=10')
      ]);

      const tracks = (trendingSongs.status === 'fulfilled' && trendingSongs.value?.results)
        ? trendingSongs.value.results.map(t => this.normalizeTrack(t)).filter(Boolean)
        : [];

      const playlists = (charts.status === 'fulfilled' && charts.value?.results)
        ? charts.value.results.map(p => ({
            id: p.id,
            name: (p.name || p.title || '').replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
            description: (p.description || `${p.songCount || '50'} top tracks`).replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
            coverImage: p.image?.[p.image.length - 1]?.url || p.image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
            trackCount: parseInt(p.songCount, 10) || 30
          }))
        : [];

      const albums = (albumsData.status === 'fulfilled' && albumsData.value?.results)
        ? albumsData.value.results.map(a => ({
            id: a.id,
            title: (a.name || a.title || '').replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
            artist: a.primaryArtists || a.artist || 'Various Artists',
            year: a.year || 2024,
            artwork: a.image?.[a.image.length - 1]?.url || a.image,
            trackCount: parseInt(a.songCount, 10) || 12
          }))
        : [];

      return {
        sections: [
          {
            id: 'trending-hits',
            title: '🔥 Today\'s Global Top Hits',
            subtitle: 'The hottest trending tracks worldwide',
            type: 'tracks',
            items: tracks.slice(0, 10)
          },
          {
            id: 'featured-playlists',
            title: '✨ Curated Playlists',
            subtitle: 'Editorial playlists matching your vibe',
            type: 'playlists',
            items: playlists.slice(0, 5)
          },
          {
            id: 'new-albums',
            title: '💿 Popular New Albums',
            subtitle: 'Trending album drops and full records',
            type: 'albums',
            items: albums.slice(0, 5)
          },
          {
            id: 'late-night',
            title: '🌙 Late Night Beats',
            subtitle: 'Vibe out with smooth rhythmic sessions',
            type: 'tracks',
            items: tracks.slice(10, 15)
          }
        ]
      };
    } catch (e) {
      console.warn('[Saavn Home] Fallback triggered:', e.message);
      return { sections: [] };
    }
  }

  async search(query, type = 'all') {
    const q = encodeURIComponent((query || '').trim());
    if (!q) return { tracks: [], artists: [], albums: [], playlists: [] };

    try {
      const [songRes, albumRes, artistRes, playlistRes] = await Promise.allSettled([
        (type === 'all' || type === 'tracks') ? this.fetchApi(`/search/songs?query=${q}&limit=20`) : Promise.resolve(null),
        (type === 'all' || type === 'albums') ? this.fetchApi(`/search/albums?query=${q}&limit=10`) : Promise.resolve(null),
        (type === 'all' || type === 'artists') ? this.fetchApi(`/search/artists?query=${q}&limit=10`) : Promise.resolve(null),
        (type === 'all' || type === 'playlists') ? this.fetchApi(`/search/playlists?query=${q}&limit=10`) : Promise.resolve(null)
      ]);

      const tracks = (songRes.status === 'fulfilled' && songRes.value?.results)
        ? songRes.value.results.map(t => this.normalizeTrack(t)).filter(Boolean)
        : [];

      const albums = (albumRes.status === 'fulfilled' && albumRes.value?.results)
        ? albumRes.value.results.map(a => ({
            id: a.id,
            title: (a.name || a.title || '').replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
            artist: a.primaryArtists || a.artist || 'Various Artists',
            artwork: a.image?.[a.image.length - 1]?.url || a.image,
            year: a.year || 2024,
            trackCount: parseInt(a.songCount, 10) || 10
          }))
        : [];

      const artists = (artistRes.status === 'fulfilled' && artistRes.value?.results)
        ? artistRes.value.results.map(art => ({
            id: art.id,
            name: (art.name || art.title || '').replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
            avatar: art.image?.[art.image.length - 1]?.url || art.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
            genres: ['Pop', 'Hits', 'Top Charts'],
            monthlyListeners: art.role || 'Top Artist',
            verified: true
          }))
        : [];

      const playlists = (playlistRes.status === 'fulfilled' && playlistRes.value?.results)
        ? playlistRes.value.results.map(p => ({
            id: p.id,
            name: (p.name || p.title || '').replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
            description: (p.description || 'Curated playlist').replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
            coverImage: p.image?.[p.image.length - 1]?.url || p.image,
            trackCount: parseInt(p.songCount, 10) || 25
          }))
        : [];

      return { tracks, artists, albums, playlists };
    } catch (e) {
      console.error('[Saavn Search] Error:', e);
      return { tracks: [], artists: [], albums: [], playlists: [] };
    }
  }

  async getTrack(id) {
    const data = await this.fetchApi(`/songs/${id}`);
    if (data && Array.isArray(data) && data.length > 0) {
      return this.normalizeTrack(data[0]);
    } else if (data && data.id) {
      return this.normalizeTrack(data);
    }
    return null;
  }

  async getAlbum(id) {
    const data = await this.fetchApi(`/albums?id=${id}`);
    if (!data) return null;

    const tracks = (data.songs || data.tracks || []).map(t => this.normalizeTrack(t)).filter(Boolean);
    const artwork = data.image?.[data.image.length - 1]?.url || data.image;

    return {
      id: data.id,
      provider: 'saavn',
      title: (data.name || data.title || '').replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
      artist: data.primaryArtists || data.artist || 'Various Artists',
      year: data.year || 2024,
      artwork,
      description: data.description || `${tracks.length} songs in this album.`,
      trackCount: tracks.length,
      tracks
    };
  }

  async getArtist(id) {
    const data = await this.fetchApi(`/artists?id=${id}`);
    if (!data) return null;

    const topTracks = (data.topSongs || data.songs || []).map(t => this.normalizeTrack(t)).filter(Boolean);
    const albums = (data.topAlbums || data.albums || []).map(a => ({
      id: a.id,
      title: a.name || a.title,
      artwork: a.image?.[a.image.length - 1]?.url || a.image,
      year: a.year || 2024,
      trackCount: parseInt(a.songCount, 10) || 10
    }));

    const avatar = data.image?.[data.image.length - 1]?.url || data.image;

    return {
      id: data.id,
      provider: 'saavn',
      name: data.name || 'Artist',
      avatar,
      headerImage: avatar,
      bio: data.bio?.[0]?.text || `Listen to the top popular tracks and latest album releases by ${data.name || 'this artist'} on Linova Music.`,
      genres: data.genres || ['Pop', 'Top Global'],
      monthlyListeners: data.followerCount ? `${Number(data.followerCount).toLocaleString()} monthly` : '5,420,100 monthly',
      verified: true,
      topTracks,
      albums,
      relatedArtists: []
    };
  }

  async getPlaylist(id) {
    const data = await this.fetchApi(`/playlists?id=${id}`);
    if (!data) return null;

    const tracks = (data.songs || data.tracks || []).map(t => this.normalizeTrack(t)).filter(Boolean);
    const coverImage = data.image?.[data.image.length - 1]?.url || data.image;

    return {
      id: data.id,
      provider: 'saavn',
      name: (data.name || data.title || '').replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
      description: (data.description || `${tracks.length} curated tracks`).replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
      coverImage,
      trackCount: tracks.length,
      tracks
    };
  }

  async getRecommendations(signals = {}) {
    const query = signals.likedGenres?.[0] || 'top pop hits';
    const data = await this.search(query, 'tracks');
    return {
      title: '🎯 Recommended Hits',
      tracks: data.tracks.slice(0, 10),
      artists: data.artists.slice(0, 5),
      albums: data.albums.slice(0, 5)
    };
  }

  async getLyrics(trackId, title, artist) {
    try {
      const data = await this.fetchApi(`/lyrics?id=${trackId}`);
      if (data && (data.lyrics || data.snippet)) {
        const text = data.lyrics || data.snippet;
        const lines = text.split('<br>').flatMap(l => l.split('\n')).map((line, idx) => ({
          time: idx * 4,
          text: line.trim()
        })).filter(l => l.text.length > 0);

        return {
          trackId,
          title,
          artist,
          synced: true,
          lines: lines.length > 0 ? lines : [{ time: 0, text: text }]
        };
      }
    } catch {}

    return {
      trackId,
      title,
      artist,
      synced: false,
      lines: [
        { time: 0, text: `♪ Lyrics for ${title || 'this track'} ♪` },
        { time: 5, text: `Performed by ${artist || 'Artist'}` },
        { time: 10, text: "Sing along and vibe with the music on LINOVA!" }
      ]
    };
  }
}
