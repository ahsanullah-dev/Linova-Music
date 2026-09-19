import { MusicProvider } from './MusicProvider.js';
import YTMusic from 'ytmusic-api';

function cleanText(str) {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function parseLrc(lrcText) {
  if (!lrcText) return [];
  const lines = lrcText.split('\n');
  const result = [];
  const timeRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\](.*)/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = timeRegex.exec(trimmed);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      let ms = 0;
      if (match[3]) {
        ms = parseInt(match[3].padEnd(3, '0').substring(0, 3), 10);
      }
      const totalSeconds = minutes * 60 + seconds + ms / 1000;
      const text = match[4].trim();
      if (text) {
        result.push({ time: totalSeconds, text });
      }
    }
  }
  return result;
}

/**
 * YouTubeMusicProvider
 * Full-featured high-fidelity music provider for Linova.
 * Powers dynamic catalog search (Bangla, Rock, Global, Indie), dynamic home feeds, real lyrics, and exact track playback.
 */
export class YouTubeMusicProvider extends MusicProvider {
  constructor() {
    super('youtube-music');
    this.ytm = new YTMusic();
    this.initPromise = this.ytm.initialize().catch(err => {
      console.warn('[YouTubeMusicProvider] Init warning:', err.message);
    });
    this._homeCache = new Map();
    this._homeCacheTime = new Map();
  }

  async ensureInit() {
    if (this.initPromise) {
      await this.initPromise;
    }
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

  getBestArtwork(thumbnails, videoId = '') {
    if (Array.isArray(thumbnails) && thumbnails.length > 0) {
      const valid = thumbnails.filter(t => t && t.url);
      if (valid.length > 0) {
        let best = valid[valid.length - 1].url;
        // Upgrade googleusercontent / ytimg thumbnails to crisp square max resolution
        if (best.includes('googleusercontent.com') || best.includes('ggpht.com')) {
          best = best.replace(/=w\d+-h\d+[^?]*/, '=w800-h800-l90-rj');
        }
        return best;
      }
    }
    if (videoId) {
      return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    }
    return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80';
  }

  normalizeTrack(item) {
    if (!item) return null;

    const rawId = item.videoId || item.id || `yt_${Date.now()}_${Math.random()}`;
    const videoId = rawId.replace(/^yt_/, '');
    const cleanId = `yt_${videoId}`;

    const artistName = cleanText(
      item.artist?.name ||
      item.artists?.[0]?.name ||
      (Array.isArray(item.artists) ? item.artists.map(a => a.name).join(', ') : '') ||
      'Various Artists'
    );

    const title = cleanText(item.name || item.title || 'Unknown Title');
    const albumName = cleanText(item.album?.name || item.album || 'Single');
    const albumId = item.album?.albumId || item.album?.id || `alb_${videoId}`;
    const artwork = this.getBestArtwork(item.thumbnails, videoId);

    const duration = typeof item.duration === 'number'
      ? item.duration
      : (typeof item.durationInSec === 'number' ? item.durationInSec : 200);

    const streamEndpoint = `/api/music/stream/${videoId}?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artistName)}`;

    return {
      id: cleanId,
      videoId,
      provider: 'youtube-music',
      title,
      artist: artistName,
      artists: [
        {
          id: item.artist?.artistId ? `art_${item.artist.artistId}` : 'art_0',
          name: artistName
        }
      ],
      album: {
        id: `alb_${albumId}`,
        name: albumName
      },
      duration,
      artwork,
      audioUrl: streamEndpoint,
      canDownload: true,
      playable: true,
      year: item.year || 2024,
      playCount: item.views ? `${item.views} plays` : '1.2M plays',
      explicit: false
    };
  }

  async resolveAudioStream(videoId, title = '', artist = '') {
    // For web clients, audio streams directly and accurately via the integrated player engine
    return `/api/music/stream/${videoId}`;
  }

  async getHomeSections(userId, category = 'all') {
    const cacheKey = category || 'all';
    if (this._homeCache.has(cacheKey) && Date.now() - (this._homeCacheTime.get(cacheKey) || 0) < 600000) {
      return this._homeCache.get(cacheKey);
    }

    await this.ensureInit();

    try {
      let querySets = [];

      if (category === 'bangla' || category === 'regional') {
        querySets = [
          { id: 'bangla-rock', title: '🎸 Bangla Rock Band Hits', subtitle: 'Artcell, Warfaze, LRB, Miles, Meghdol, Aurthohin & Shironamhin', q: 'bangla rock band songs' },
          { id: 'bangla-trending', title: '🔥 Trending Bengali Hits', subtitle: 'Top trending Bangladeshi and Bengali songs', q: 'bangla trending songs 2026' },
          { id: 'bangla-acoustic', title: '🍃 Bangla Acoustic & Indie', subtitle: 'Heartfelt acoustic melodies and soulful indie tracks', q: 'bangla acoustic indie songs' },
          { id: 'bangla-golden', title: '✨ Bangla Classic & Evergreen Hits', subtitle: 'Timeless masterpieces from legendary bands and artists', q: 'bangla evergreen classic songs' },
          { id: 'bangla-love', title: '💜 Bengali Love Songs', subtitle: 'Romantic songs from modern Bengali artists', q: 'best bengali romantic songs' },
          { id: 'bangla-new', title: '🌱 New Bengali Releases', subtitle: 'Fresh songs and rising voices to discover', q: 'new bengali songs 2026' }
        ];
      } else if (category === 'rock') {
        querySets = [
          { id: 'rock-anthems', title: '🎸 Legendary Rock Anthems', subtitle: 'Powerful guitar riffs and electrifying band classics', q: 'rock band anthems' },
          { id: 'alt-rock', title: '⚡ Alternative & Modern Rock', subtitle: 'The biggest alt-rock tracks and energetic hits', q: 'alternative rock hits' },
          { id: 'metal-hits', title: '🔥 Heavy Metal & Hard Rock', subtitle: 'Raw energy, heavy breakdowns, and iconic vocals', q: 'heavy metal band hits' },
          { id: 'indie-rock', title: '🌌 Indie Rock Discoveries', subtitle: 'Critically loved and under-the-radar guitar music', q: 'best indie rock songs' },
          { id: 'classic-rock', title: '📻 Classic Rock Essentials', subtitle: 'Timeless records from rock history', q: 'classic rock greatest songs' }
        ];
      } else if (category === 'pop') {
        querySets = [
          { id: 'pop-global', title: '✨ Global Pop Chartbusters', subtitle: 'The biggest pop records dominating charts worldwide', q: 'global pop hits 2026' },
          { id: 'dance-edm', title: '🎧 Electronic & Dance Anthems', subtitle: 'High energy beats and electronic drops', q: 'dance electronic hits' },
          { id: 'pop-love', title: '💖 Pop Love Songs', subtitle: 'Romantic pop songs for every mood', q: 'best pop love songs' },
          { id: 'pop-discovery', title: '🌟 Pop Discoveries', subtitle: 'Fresh voices and songs worth replaying', q: 'new pop songs 2026' }
        ];
      } else if (category === 'chill') {
        querySets = [
          { id: 'chill-acoustic', title: '☕ Acoustic & Coffee House', subtitle: 'Unplugged sessions and soothing acoustic guitars', q: 'acoustic chill songs' },
          { id: 'lofi-study', title: '🌙 Lofi & Atmospheric Beats', subtitle: 'Calm rhythms for focus, relaxation, and late nights', q: 'lofi chill beats' },
          { id: 'chill-pop', title: '🌊 Mellow Pop & R&B', subtitle: 'Smooth vocals and relaxed grooves', q: 'mellow pop rnb songs' },
          { id: 'jazz-lounge', title: '🍷 Jazz & Lounge Evenings', subtitle: 'Warm, sophisticated sounds for slow evenings', q: 'jazz lounge chill songs' }
        ];
      } else if (category === 'hiphop') {
        querySets = [
          { id: 'hiphop-trending', title: '🎤 Hip-Hop & Rap Heavyweights', subtitle: 'Fresh bars, trap beats, and global hip-hop anthems', q: 'hip hop hits 2026' },
          { id: 'rnb-vibes', title: '💫 Smooth R&B & Soul', subtitle: 'Velvet vocals and late night grooves', q: 'smooth rnb soul songs' },
          { id: 'rap-discovery', title: '🚀 Rap Discoveries', subtitle: 'Fresh flows and rising hip-hop artists', q: 'new rap songs 2026' },
          { id: 'hiphop-classics', title: '🏆 Hip-Hop Classics', subtitle: 'Influential records that shaped the culture', q: 'greatest hip hop songs' }
        ];
      } else {
        // Default 'all' - previously only 4 shelves here, which combined with
        // a single-genre personalized shelf made the whole feed feel thin.
        // Rounding out to 6 covers more of what a first-time or logged-out
        // visitor might actually be into.
        querySets = [
          { id: 'trending-hits', title: '🔥 Trending Global Chartbusters', subtitle: 'The hottest tracks viral right now across the globe', q: 'trending top hits 2026' },
          { id: 'bangla-rock-hits', title: '🎸 Bangla Rock Bands & Underground', subtitle: 'Artcell, Warfaze, LRB, Miles, Meghdol, Aurthohin & more', q: 'bangla rock band hits' },
          { id: 'hot100-hits', title: '🌟 Global Billboard Top Hits', subtitle: 'Top-charting tracks breaking worldwide records', q: 'global hot 100 billboard' },
          { id: 'acoustic-melodic', title: '🍃 Acoustic & Late Night Chill', subtitle: 'Mellow melodies and soulful acoustic songs', q: 'acoustic melodic songs' },
          { id: 'hiphop-trending', title: '🎤 Hip-Hop & Rap Heavyweights', subtitle: 'Fresh bars, trap beats, and global hip-hop anthems', q: 'hip hop hits 2026' },
          { id: 'dance-edm', title: '🎧 Electronic & Dance Anthems', subtitle: 'High energy beats and electronic drops', q: 'dance electronic hits' },
          { id: 'hindi-hits', title: '🎬 Bollywood & Hindi Hits', subtitle: 'Romantic, cinematic, and unforgettable Hindi songs', q: 'latest bollywood hindi songs 2026' },
          { id: 'indie-discoveries', title: '🌌 Indie Discoveries', subtitle: 'Fresh alternative songs beyond the charts', q: 'best indie songs 2026' },
          { id: 'rnb-soul', title: '💫 R&B & Soul Vibes', subtitle: 'Smooth vocals, soulful grooves, and late-night favorites', q: 'rnb soul hits' },
          { id: 'classic-favorites', title: '🏆 Timeless Favorites', subtitle: 'Songs that never leave the rotation', q: 'greatest songs of all time' }
        ];
      }

      const results = await Promise.allSettled(
        querySets.map(qs => this.ytm.searchSongs(qs.q))
      );

      const sections = [];
      results.forEach((res, idx) => {
        const meta = querySets[idx];
        const songs = (res.status === 'fulfilled' ? res.value : [])
          .slice(0, 30)
          .map(t => this.normalizeTrack(t))
          .filter(Boolean);

        if (songs.length > 0) {
          sections.push({
            id: meta.id,
            title: meta.title,
            subtitle: meta.subtitle,
            type: 'tracks',
            items: songs
          });
        }
      });

      // Also add dynamic Artists shelf
      try {
        const artistQuery = category === 'bangla' ? 'Artcell Warfaze LRB' : 'The Weeknd Coldplay';
        const artistsRes = await this.ytm.searchArtists(artistQuery);
        if (artistsRes && artistsRes.length > 0) {
          const artistItems = artistsRes.slice(0, 8).map(a => ({
            id: `art_${a.artistId}`,
            name: cleanText(a.name),
            avatar: this.getBestArtwork(a.thumbnails),
            genres: ['Featured Artist'],
            monthlyListeners: 'Verified Artist',
            verified: true
          }));

          sections.push({
            id: 'featured-artists',
            title: '🌟 Featured Artists',
            subtitle: 'Explore discographies and top releases',
            type: 'artists',
            items: artistItems
          });
        }
      } catch (e) {}

      const payload = { sections };
      if (sections.length > 0) {
        this._homeCache.set(cacheKey, payload);
        this._homeCacheTime.set(cacheKey, Date.now());
      }
      return payload;
    } catch (err) {
      console.warn('[YouTubeMusicProvider] getHomeSections error:', err.message);
      return { sections: [] };
    }
  }

  async search(query, type = 'all') {
    const q = (query || '').trim();
    if (!q) {
      const home = await this.getHomeSections();
      return {
        tracks: home.sections[0]?.items || [],
        artists: [],
        albums: [],
        playlists: []
      };
    }

    await this.ensureInit();

    try {
      if (type === 'songs' || type === 'tracks') {
        const songs = await this.ytm.searchSongs(q);
        return {
          tracks: (songs || []).map(s => this.normalizeTrack(s)).filter(Boolean),
          artists: [],
          albums: [],
          playlists: []
        };
      }

      if (type === 'artists') {
        const artists = await this.ytm.searchArtists(q);
        return {
          tracks: [],
          artists: (artists || []).map(a => ({
            id: `art_${a.artistId}`,
            name: cleanText(a.name),
            avatar: this.getBestArtwork(a.thumbnails),
            genres: ['Recording Artist'],
            monthlyListeners: 'Verified Artist',
            verified: true
          })),
          albums: [],
          playlists: []
        };
      }

      if (type === 'albums') {
        const albums = await this.ytm.searchAlbums(q);
        return {
          tracks: [],
          artists: [],
          albums: (albums || []).map(a => ({
            id: `alb_${a.albumId}`,
            title: cleanText(a.name),
            artist: cleanText(a.artist?.name || 'Various Artists'),
            artwork: this.getBestArtwork(a.thumbnails),
            year: a.year || 2024,
            trackCount: 10
          })),
          playlists: []
        };
      }

      if (type === 'playlists') {
        const playlists = await this.ytm.searchPlaylists(q);
        return {
          tracks: [],
          artists: [],
          albums: [],
          playlists: (playlists || []).map(p => ({
            id: `pl_${p.playlistId}`,
            name: cleanText(p.name),
            description: cleanText(p.author?.name ? `Curated by ${p.author.name}` : 'Curated Playlist'),
            coverImage: this.getBestArtwork(p.thumbnails),
            trackCount: p.songCount || 25
          }))
        };
      }

      // 'all' search
      const [songsRes, artistsRes, albumsRes, playlistsRes] = await Promise.allSettled([
        this.ytm.searchSongs(q),
        this.ytm.searchArtists(q),
        this.ytm.searchAlbums(q),
        this.ytm.searchPlaylists(q)
      ]);

      const tracks = (songsRes.status === 'fulfilled' ? songsRes.value : [])
        .map(s => this.normalizeTrack(s))
        .filter(Boolean);

      const artists = (artistsRes.status === 'fulfilled' ? artistsRes.value : []).map(a => ({
        id: `art_${a.artistId}`,
        name: cleanText(a.name),
        avatar: this.getBestArtwork(a.thumbnails),
        genres: ['Recording Artist'],
        monthlyListeners: 'Verified Artist',
        verified: true
      }));

      const albums = (albumsRes.status === 'fulfilled' ? albumsRes.value : []).map(a => ({
        id: `alb_${a.albumId}`,
        title: cleanText(a.name),
        artist: cleanText(a.artist?.name || 'Various Artists'),
        artwork: this.getBestArtwork(a.thumbnails),
        year: a.year || 2024,
        trackCount: 10
      }));

      const playlists = (playlistsRes.status === 'fulfilled' ? playlistsRes.value : []).map(p => ({
        id: `pl_${p.playlistId}`,
        name: cleanText(p.name),
        description: cleanText(p.author?.name ? `Curated by ${p.author.name}` : 'Curated Playlist'),
        coverImage: this.getBestArtwork(p.thumbnails),
        trackCount: p.songCount || 25
      }));

      return { tracks, artists, albums, playlists };
    } catch (err) {
      console.warn('[YouTubeMusicProvider] search error:', err.message);
      return { tracks: [], artists: [], albums: [], playlists: [] };
    }
  }

  async getTrack(id) {
    await this.ensureInit();
    const cleanId = id.toString().replace(/^yt_/, '');

    try {
      const searchRes = await this.ytm.searchSongs(cleanId);
      if (searchRes && searchRes.length > 0) {
        const found = searchRes.find(s => s.videoId === cleanId) || searchRes[0];
        return this.normalizeTrack(found);
      }
    } catch (err) {
      console.warn('[YouTubeMusicProvider] getTrack error:', err.message);
    }

    return null;
  }

  async getArtist(id) {
    await this.ensureInit();
    const cleanId = id.toString().replace(/^art_/, '').replace(/^yt_art_/, '').replace(/^yt_/, '');

    try {
      const artist = await this.ytm.getArtist(cleanId);
      if (!artist) return null;

      const topSongs = (artist.topSongs || []).map(s => this.normalizeTrack(s)).filter(Boolean);
      const albums = (artist.topAlbums || []).map(a => ({
        id: `alb_${a.albumId}`,
        title: cleanText(a.name),
        artist: cleanText(artist.name),
        artwork: this.getBestArtwork(a.thumbnails),
        year: a.year || 2024,
        trackCount: 10
      }));

      return {
        id: `art_${cleanId}`,
        name: cleanText(artist.name),
        bio: cleanText(artist.description || `${artist.name} is a renowned recording artist.`),
        avatar: this.getBestArtwork(artist.thumbnails),
        banner: this.getBestArtwork(artist.thumbnails),
        monthlyListeners: artist.subscribers ? `${artist.subscribers} subscribers` : 'Verified Artist',
        genres: ['Featured Artist'],
        topTracks: topSongs,
        albums
      };
    } catch (err) {
      console.warn('[YouTubeMusicProvider] getArtist error:', err.message);
      return null;
    }
  }

  async getAlbum(id) {
    await this.ensureInit();
    const cleanId = id.toString().replace(/^alb_/, '').replace(/^yt_alb_/, '').replace(/^yt_/, '');

    try {
      const album = await this.ytm.getAlbum(cleanId);
      if (!album) return null;

      const tracks = (album.songs || []).map(s => this.normalizeTrack({
        ...s,
        album: { albumId: cleanId, name: album.name },
        thumbnails: album.thumbnails
      })).filter(Boolean);

      return {
        id: `alb_${cleanId}`,
        title: cleanText(album.name),
        artist: cleanText(album.artist?.name || 'Various Artists'),
        artists: [{ id: 'art_0', name: cleanText(album.artist?.name || 'Various Artists') }],
        artwork: this.getBestArtwork(album.thumbnails),
        year: album.year || 2024,
        trackCount: tracks.length,
        duration: tracks.reduce((acc, t) => acc + (t.duration || 0), 0),
        tracks
      };
    } catch (err) {
      console.warn('[YouTubeMusicProvider] getAlbum error:', err.message);
      return null;
    }
  }

  async getPlaylist(id) {
    await this.ensureInit();
    const cleanId = id.toString().replace(/^pl_/, '').replace(/^yt_pl_/, '').replace(/^yt_/, '');

    try {
      const playlist = await this.ytm.getPlaylist(cleanId);
      if (!playlist) return null;

      const rawTracks = playlist.content || playlist.songs || [];
      const tracks = rawTracks.map(s => this.normalizeTrack(s)).filter(Boolean);

      return {
        id: `pl_${cleanId}`,
        name: cleanText(playlist.name),
        description: cleanText(playlist.description || `Curated collection with ${tracks.length} tracks`),
        coverImage: this.getBestArtwork(playlist.thumbnails),
        trackCount: tracks.length,
        tracks
      };
    } catch (err) {
      console.warn('[YouTubeMusicProvider] getPlaylist error:', err.message);
      return null;
    }
  }

  async getRecommendations(signals = {}) {
    const home = await this.getHomeSections();
    const allTracks = home.sections
      .filter(s => s.type === 'tracks')
      .flatMap(s => s.items);

    return {
      tracks: allTracks.slice(0, 20),
      artists: home.sections.find(s => s.type === 'artists')?.items || [],
      albums: []
    };
  }

  async getLyrics(trackId, title, artist) {
    await this.ensureInit();
    const videoId = trackId ? trackId.toString().replace(/^yt_/, '') : '';

    const cleanTitle = (title || '')
      .replace(/\s*\([^)]*(official|video|audio|lyric|remastered|version|feat|ft|hd|4k)[^)]*\)/gi, '')
      .replace(/\s*\[[^\]]*(official|video|audio|lyric|remastered|version|feat|ft|hd|4k)[^\]]*\]/gi, '')
      .split('-')[0]
      .trim();

    const cleanArtist = (artist || '')
      .replace(/\s*-\s*topic/gi, '')
      .split(',')[0]
      .split('&')[0]
      .trim();

    // 1. Prioritize Real Millisecond-Synchronized Lyrics from LRCLIB
    try {
      if (cleanTitle) {
        // Try exact get
        const exactUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}`;
        const exactRes = await fetch(exactUrl, { signal: AbortSignal.timeout(3500) });

        if (exactRes.ok) {
          const data = await exactRes.json();
          if (data.syncedLyrics) {
            const parsedLines = parseLrc(data.syncedLyrics);
            if (parsedLines.length > 0) {
              return {
                trackId,
                title: data.trackName || title,
                artist: data.artistName || artist,
                synced: true,
                source: 'Synchronized Lyrics',
                lines: parsedLines
              };
            }
          }
        }

        // Try fuzzy search on LRCLIB
        const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(`${cleanTitle} ${cleanArtist}`.trim())}`;
        const searchRes = await fetch(searchUrl, { signal: AbortSignal.timeout(3500) });

        if (searchRes.ok) {
          const list = await searchRes.json();
          if (Array.isArray(list) && list.length > 0) {
            // Find first with syncedLyrics
            const syncedMatch = list.find(item => item.syncedLyrics);
            if (syncedMatch) {
              const parsedLines = parseLrc(syncedMatch.syncedLyrics);
              if (parsedLines.length > 0) {
                return {
                  trackId,
                  title: syncedMatch.trackName || title,
                  artist: syncedMatch.artistName || artist,
                  synced: true,
                  source: 'Synchronized Lyrics',
                  lines: parsedLines
                };
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('[YouTubeMusicProvider] LRCLIB synced lookup notice:', err.message);
    }

    // 2. Fallback to YouTube Music Official Unsynced Text
    if (videoId) {
      try {
        const ytLyrics = await this.ytm.getLyrics(videoId);
        if (ytLyrics && Array.isArray(ytLyrics) && ytLyrics.length > 0) {
          return {
            trackId,
            title,
            artist,
            synced: false,
            source: 'Official Lyrics',
            lines: ytLyrics.map((text) => ({ time: 0, text: cleanText(text) }))
          };
        } else if (typeof ytLyrics === 'string' && ytLyrics.trim()) {
          const lines = ytLyrics.split('\n').map(l => l.trim()).filter(Boolean);
          return {
            trackId,
            title,
            artist,
            synced: false,
            source: 'Official Lyrics',
            lines: lines.map((text) => ({ time: 0, text: cleanText(text) }))
          };
        }
      } catch (err) {
        // Continue to fallback
      }
    }

    return {
      trackId,
      title: title || 'Song Title',
      artist: artist || 'Artist',
      synced: false,
      unavailable: true,
      lines: []
    };
  }
}
