import { MusicProvider } from './MusicProvider.js';

// Curated royalty-free catalog with valid high-quality audio streams and lyrics
const MOCK_TRACKS = [
  {
    id: 'trk-1',
    provider: 'mock',
    title: 'Neon Horizon',
    artist: 'Cyberwave Orchestra',
    artists: [{ id: 'art-1', name: 'Cyberwave Orchestra' }],
    album: { id: 'alb-1', name: 'Retrograde 2099' },
    artwork: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
    duration: 184,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=electronic-future-beats-117997.mp3',
    genre: 'Synthwave',
    plays: '1,420,930',
    canDownload: true,
    playable: true,
    lyrics: [
      { time: 0, text: "Electric pulses through the wire" },
      { time: 8, text: "Neon shadows ignite the fire" },
      { time: 18, text: "Driving through the cyber grid" },
      { time: 28, text: "Underneath the city lights we hid" },
      { time: 38, text: "Synthetic memories in the rain" },
      { time: 50, text: "Washing out all the digital pain" },
      { time: 65, text: "Neon horizon calling my name" }
    ]
  },
  {
    id: 'trk-2',
    provider: 'mock',
    title: 'Midnight Coffee & Rain',
    artist: 'Lofi Chill Sanctuary',
    artists: [{ id: 'art-2', name: 'Lofi Chill Sanctuary' }],
    album: { id: 'alb-2', name: 'Study & Rain Sessions' },
    artwork: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80',
    duration: 142,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=lofi-study-112191.mp3',
    genre: 'Lofi Beats',
    plays: '2,890,110',
    canDownload: true,
    playable: true,
    lyrics: [
      { time: 0, text: "[Smooth vinyl crackle & warm Rhodes piano]" },
      { time: 12, text: "Raindrops on the window pane" },
      { time: 24, text: "Warm coffee running through my veins" },
      { time: 36, text: "Pages turning through the night" },
      { time: 52, text: "Everything's going to be alright" },
      { time: 70, text: "[Mellow drum loop & acoustic guitar]" }
    ]
  },
  {
    id: 'trk-3',
    provider: 'mock',
    title: 'Starlight Dreamer',
    artist: 'Luna Eclipse',
    artists: [{ id: 'art-3', name: 'Luna Eclipse' }],
    album: { id: 'alb-3', name: 'Cosmic Echoes' },
    artwork: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
    duration: 210,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-piano-amp-strings-10711.mp3',
    genre: 'Ambient Pop',
    plays: '984,300',
    canDownload: true,
    playable: true,
    lyrics: [
      { time: 0, text: "Stars align across the vast expanse" },
      { time: 14, text: "We are caught in a celestial dance" },
      { time: 28, text: "Floating high above the earth" },
      { time: 42, text: "Discovering what we are worth" },
      { time: 60, text: "Starlight dreamer, take flight" }
    ]
  },
  {
    id: 'trk-4',
    provider: 'mock',
    title: 'Urban Pulse',
    artist: 'K-Metropolis',
    artists: [{ id: 'art-4', name: 'K-Metropolis' }],
    album: { id: 'alb-4', name: 'Tokyo After Dark' },
    artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
    duration: 165,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=tuesday-glitch-future-bass-123415.mp3',
    genre: 'Future Bass',
    plays: '3,410,200',
    canDownload: true,
    playable: true,
    lyrics: [
      { time: 0, text: "Bass dropping in the underground" },
      { time: 10, text: "Feel the pressure of the sound" },
      { time: 22, text: "Tokyo neon shining bright" },
      { time: 35, text: "We own the rhythm of tonight" }
    ]
  },
  {
    id: 'trk-5',
    provider: 'mock',
    title: 'Golden Sunset Chill',
    artist: 'Sunset Boulevard Trio',
    artists: [{ id: 'art-5', name: 'Sunset Boulevard Trio' }],
    album: { id: 'alb-5', name: 'Pacific Coast Highway' },
    artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
    duration: 195,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb630cc098.mp3?filename=chill-abstract-intention-12099.mp3',
    genre: 'Chillout',
    plays: '1,890,400',
    canDownload: true,
    playable: true,
    lyrics: [
      { time: 0, text: "Warm breeze kissing the ocean tide" },
      { time: 15, text: "No worries on this coastal ride" },
      { time: 30, text: "Golden hour painting the sky" },
      { time: 48, text: "Watch the seagulls passing by" }
    ]
  },
  {
    id: 'trk-6',
    provider: 'mock',
    title: 'Cyberpunk Awakening',
    artist: 'Cyberwave Orchestra',
    artists: [{ id: 'art-1', name: 'Cyberwave Orchestra' }],
    album: { id: 'alb-1', name: 'Retrograde 2099' },
    artwork: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
    duration: 204,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/26/audio_d0c6ff1101.mp3?filename=cyberpunk-2099-10701.mp3',
    genre: 'Synthwave',
    plays: '2,110,800',
    canDownload: true,
    playable: true,
    lyrics: [
      { time: 0, text: "System boot sequence initiated..." },
      { time: 14, text: "Neural link online and connected" },
      { time: 28, text: "Rebel forces in the lower sector" },
      { time: 44, text: "Breaking the control of the director" }
    ]
  },
  {
    id: 'trk-7',
    provider: 'mock',
    title: 'Deep Focus Flow',
    artist: 'Lofi Chill Sanctuary',
    artists: [{ id: 'art-2', name: 'Lofi Chill Sanctuary' }],
    album: { id: 'alb-2', name: 'Study & Rain Sessions' },
    artwork: 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?w=500&auto=format&fit=crop&q=80',
    duration: 178,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=lofi-chill-114407.mp3',
    genre: 'Lofi Beats',
    plays: '4,520,300',
    canDownload: true,
    playable: true,
    lyrics: [
      { time: 0, text: "[Instrumental Study Beat]" },
      { time: 30, text: "[Deep meditative ambient resonance]" }
    ]
  },
  {
    id: 'trk-8',
    provider: 'mock',
    title: 'Solar Eclipse Resonance',
    artist: 'Luna Eclipse',
    artists: [{ id: 'art-3', name: 'Luna Eclipse' }],
    album: { id: 'alb-3', name: 'Cosmic Echoes' },
    artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    duration: 228,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_c920f666f7.mp3?filename=space-ambient-126237.mp3',
    genre: 'Ambient Pop',
    plays: '1,120,500',
    canDownload: true,
    playable: true,
    lyrics: [
      { time: 0, text: "Darkness overtaking the sun" },
      { time: 20, text: "A new era has now begun" }
    ]
  }
];

const MOCK_ARTISTS = [
  {
    id: 'art-1',
    provider: 'mock',
    name: 'Cyberwave Orchestra',
    avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    headerImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    bio: 'Pioneering futuristic synthwave, analog basslines, and cyberpunk cinematic soundscapes since 2021.',
    genres: ['Synthwave', 'Cyberpunk', 'Electronic'],
    monthlyListeners: '3,840,120',
    verified: true
  },
  {
    id: 'art-2',
    provider: 'mock',
    name: 'Lofi Chill Sanctuary',
    avatar: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80',
    headerImage: 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?w=1200&auto=format&fit=crop&q=80',
    bio: 'Creating relaxing tape-warm lofi hip hop, cozy study beats, and calm rain textures for millions of daily learners.',
    genres: ['Lofi Beats', 'Chillhop', 'Ambient'],
    monthlyListeners: '6,120,950',
    verified: true
  },
  {
    id: 'art-3',
    provider: 'mock',
    name: 'Luna Eclipse',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    headerImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
    bio: 'Ethereal vocals, dreamy synthesizers, and cosmic lyricism that takes listeners beyond the stratosphere.',
    genres: ['Ambient Pop', 'Dream Pop', 'Indie Electronic'],
    monthlyListeners: '2,450,800',
    verified: true
  },
  {
    id: 'art-4',
    provider: 'mock',
    name: 'K-Metropolis',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    headerImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
    bio: 'Tokyo-based bass producer blending heavy 808s, glitch rhythms, and euphoric future bass drops.',
    genres: ['Future Bass', 'Trap', 'Electronic'],
    monthlyListeners: '4,910,340',
    verified: true
  },
  {
    id: 'art-5',
    provider: 'mock',
    name: 'Sunset Boulevard Trio',
    avatar: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
    headerImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
    bio: 'Acoustic jazz guitars, mellow percussion, and sunset vibes from the California coastline.',
    genres: ['Chillout', 'Smooth Jazz', 'Acoustic'],
    monthlyListeners: '1,980,500',
    verified: true
  }
];

const MOCK_ALBUMS = [
  {
    id: 'alb-1',
    provider: 'mock',
    title: 'Retrograde 2099',
    artist: 'Cyberwave Orchestra',
    artistId: 'art-1',
    artwork: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
    year: 2024,
    genre: 'Synthwave',
    description: 'An epic journey across cyberpunk highways, neon skylines, and retro-futuristic synth odysseys.',
    trackIds: ['trk-1', 'trk-6']
  },
  {
    id: 'alb-2',
    provider: 'mock',
    title: 'Study & Rain Sessions',
    artist: 'Lofi Chill Sanctuary',
    artistId: 'art-2',
    artwork: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80',
    year: 2024,
    genre: 'Lofi Beats',
    description: 'The definitive sound companion for study, focus, coding, and peaceful relaxation.',
    trackIds: ['trk-2', 'trk-7']
  },
  {
    id: 'alb-3',
    provider: 'mock',
    title: 'Cosmic Echoes',
    artist: 'Luna Eclipse',
    artistId: 'art-3',
    artwork: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
    year: 2023,
    genre: 'Ambient Pop',
    description: 'Celestial vocal harmonies floating over lush orchestral strings and modular analog synths.',
    trackIds: ['trk-3', 'trk-8']
  },
  {
    id: 'alb-4',
    provider: 'mock',
    title: 'Tokyo After Dark',
    artist: 'K-Metropolis',
    artistId: 'art-4',
    artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
    year: 2024,
    genre: 'Future Bass',
    description: 'High energy club heaters and glittering future bass synth explosions straight from Shibuya.',
    trackIds: ['trk-4']
  },
  {
    id: 'alb-5',
    provider: 'mock',
    title: 'Pacific Coast Highway',
    artist: 'Sunset Boulevard Trio',
    artistId: 'art-5',
    artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
    year: 2023,
    genre: 'Chillout',
    description: 'Breezy acoustic guitars and sunset grooves built for long afternoon coastal drives.',
    trackIds: ['trk-5']
  }
];

const MOCK_PLAYLISTS = [
  {
    id: 'pl-featured-1',
    provider: 'mock',
    name: 'Linova Top 50 Global',
    description: 'The hottest tracks trending across the Linova Music universe right now.',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
    isPublic: true,
    trackIds: ['trk-1', 'trk-4', 'trk-2', 'trk-6', 'trk-3']
  },
  {
    id: 'pl-featured-2',
    provider: 'mock',
    name: 'Cyberpunk & Synthwave Drive',
    description: 'Heavy basslines, arpeggiated synths, and retro futuristic night drives.',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
    isPublic: true,
    trackIds: ['trk-1', 'trk-6', 'trk-4']
  },
  {
    id: 'pl-featured-3',
    provider: 'mock',
    name: 'Deep Focus & Late Night Study',
    description: 'Calm lofi beats, rainy textures, and zero-distraction ambient melodies.',
    coverImage: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80',
    isPublic: true,
    trackIds: ['trk-2', 'trk-7', 'trk-5', 'trk-3']
  }
];

export class MockMusicProvider extends MusicProvider {
  constructor() {
    super('mock');
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

  async getHomeSections(userId) {
    return {
      sections: [
        {
          id: 'trending',
          title: '🔥 Trending Now on Linova',
          subtitle: 'The most streamed tracks this week',
          type: 'tracks',
          items: MOCK_TRACKS.slice(0, 5)
        },
        {
          id: 'featured-playlists',
          title: '✨ Curated For You',
          subtitle: 'Editorially crafted playlists for every mood',
          type: 'playlists',
          items: MOCK_PLAYLISTS.map(p => ({
            ...p,
            trackCount: p.trackIds.length
          }))
        },
        {
          id: 'popular-artists',
          title: '🎤 Popular Artists',
          subtitle: 'Trending creators and music producers',
          type: 'artists',
          items: MOCK_ARTISTS
        },
        {
          id: 'new-releases',
          title: '💿 New Album Releases',
          subtitle: 'Fresh full-length albums and EPs',
          type: 'albums',
          items: MOCK_ALBUMS.map(a => ({
            ...a,
            trackCount: a.trackIds.length
          }))
        },
        {
          id: 'chill-vibes',
          title: '☕ Chill & Study Sanctuary',
          subtitle: 'Relaxing soundscapes and lofi rhythms',
          type: 'tracks',
          items: [MOCK_TRACKS[1], MOCK_TRACKS[6], MOCK_TRACKS[4], MOCK_TRACKS[2]]
        }
      ]
    };
  }

  async search(query, type = 'all') {
    const q = (query || '').toLowerCase().trim();
    if (!q) {
      return { tracks: [], artists: [], albums: [], playlists: [] };
    }

    const tracks = MOCK_TRACKS.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      (t.genre && t.genre.toLowerCase().includes(q))
    );

    const artists = MOCK_ARTISTS.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.genres.some(g => g.toLowerCase().includes(q))
    );

    const albums = MOCK_ALBUMS.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.artist.toLowerCase().includes(q)
    ).map(a => ({ ...a, trackCount: a.trackIds.length }));

    const playlists = MOCK_PLAYLISTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    ).map(p => ({ ...p, trackCount: p.trackIds.length }));

    return { tracks, artists, albums, playlists };
  }

  async getTrack(id) {
    const track = MOCK_TRACKS.find(t => t.id === id);
    if (!track) return null;
    return track;
  }

  async getArtist(id) {
    const artist = MOCK_ARTISTS.find(a => a.id === id);
    if (!artist) return null;

    const topTracks = MOCK_TRACKS.filter(t => t.artists.some(art => art.id === id));
    const albums = MOCK_ALBUMS.filter(a => a.artistId === id).map(a => ({
      ...a,
      trackCount: a.trackIds.length
    }));
    const relatedArtists = MOCK_ARTISTS.filter(a => a.id !== id).slice(0, 3);

    return {
      ...artist,
      topTracks,
      albums,
      relatedArtists
    };
  }

  async getAlbum(id) {
    const album = MOCK_ALBUMS.find(a => a.id === id);
    if (!album) return null;

    const tracks = album.trackIds.map(tid => MOCK_TRACKS.find(t => t.id === tid)).filter(Boolean);
    return {
      ...album,
      trackCount: tracks.length,
      tracks
    };
  }

  async getPlaylist(id) {
    const playlist = MOCK_PLAYLISTS.find(p => p.id === id);
    if (!playlist) return null;

    const tracks = playlist.trackIds.map(tid => MOCK_TRACKS.find(t => t.id === tid)).filter(Boolean);
    return {
      ...playlist,
      trackCount: tracks.length,
      tracks
    };
  }

  async getRecommendations(signals = {}) {
    // Rule-based smart recommendations
    const likedGenres = signals.likedGenres || ['Synthwave', 'Lofi Beats'];
    const recommendedTracks = MOCK_TRACKS.filter(t => likedGenres.includes(t.genre) || true).slice(0, 6);
    return {
      title: 'Recommended For You',
      tracks: recommendedTracks,
      artists: MOCK_ARTISTS.slice(0, 4),
      albums: MOCK_ALBUMS.slice(0, 3)
    };
  }

  async getLyrics(trackId, title, artist) {
    const track = MOCK_TRACKS.find(t => t.id === trackId);
    if (track && track.lyrics) {
      return {
        trackId: track.id,
        title: track.title,
        artist: track.artist,
        synced: true,
        lines: track.lyrics
      };
    }
    return {
      trackId,
      title,
      artist,
      synced: false,
      lines: [{ time: 0, text: "Lyrics unavailable for this track." }]
    };
  }
}
