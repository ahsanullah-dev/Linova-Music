import { providerManager } from '../musicProvider/index.js';
import { getDBStatus } from '../../config/db.js';
import { mockStore } from '../../models/mockStore.js';
import { ListeningHistory } from '../../models/ListeningHistory.js';
import { LikedSong } from '../../models/LikedSong.js';

// Genre Knowledge Graph for authentic recommendation clustering
const GENRE_CLUSTERS = {
  bangla_rock: {
    id: 'bangla_rock',
    label: 'Bangla Rock & Band Scene',
    keywords: [
      'artcell', 'warfaze', 'aurthohin', 'shironamhin', 'nemesis', 'black',
      'cryptic fate', 'meghdol', 'avoidrafa', 'arbovirus', 'bay of bengal',
      'shurjo', 'wishtree', 'level five', 'trainwreck', 'aftermath', 'vibe',
      'powersurge', 'lrb', 'miles', 'nagar baul', 'james', 'ayub bachchu',
      'shunno', 'mechanix', 'conclusion', 'chirkutt', 'moho', 'oniket prantor'
    ],
    shelves: [
      {
        id: 'user-daily-mix-bangla-rock',
        title: '🎸 Daily Mix • Bangla Rock & Alternative',
        subtitle: 'Handpicked band anthems & underground classics',
        q: 'bangla rock band hits songs'
      },
      {
        id: 'user-bangla-indie-shelf',
        title: '🍃 Bangla Indie & Modern Band Vibes',
        subtitle: 'Meghdol, AvoidRafa, Shironamhin, Shunno & more',
        q: 'bangla indie band songs'
      }
    ]
  },
  bangla_indie: {
    id: 'bangla_indie',
    label: 'Bangla Acoustic & Indie',
    keywords: [
      'anupam roy', 'arnob', 'minar', 'tahsan', 'pritom hasan', 'konal',
      'habib wahid', 'kaaktaal', 'somnur', 'joy shahriar', 'topu', 'bappa mazumder'
    ],
    shelves: [
      {
        id: 'user-daily-mix-bangla-indie',
        title: '☕ Daily Mix • Bangla Acoustic & Chill',
        subtitle: 'Soulful melodies and heartfelt acoustic sessions',
        q: 'bangla acoustic indie songs'
      },
      {
        id: 'user-bangla-evergreen',
        title: '✨ Timeless Bengali Masterpieces',
        subtitle: 'Evergreen melodies and celebrated artists',
        q: 'bangla evergreen classic songs'
      }
    ]
  },
  bollywood_hindi: {
    id: 'bollywood_hindi',
    label: 'Bollywood & Hindi Melodies',
    keywords: [
      'arijit singh', 'atif aslam', 'pritam', 'vishal mishra', 'shreya ghoshal',
      'kk', 'mohit chauhan', 'jubin nautiyal', 'b praak', 'jasleen royal',
      'anuv jain', 'neha kakkar', 'badshah', 'ar rahman', 'sonu nigam',
      'kishore kumar', 'arijit', 'atif', 'pehli dafa', 'kesariya', 'tum hi ho'
    ],
    shelves: [
      {
        id: 'user-daily-mix-hindi',
        title: '✨ Daily Mix • Bollywood Romance & Hits',
        subtitle: 'Arijit Singh, Atif Aslam, Pritam & chart-toppers',
        q: 'bollywood romantic melodies arijit atif pritam'
      },
      {
        id: 'user-hindi-acoustic',
        title: '🌙 Soulful Hindi Acoustic & Lofi',
        subtitle: 'Mellow late-night acoustic and relaxing Hindi tracks',
        q: 'hindi acoustic soulful lofi songs'
      }
    ]
  },
  global_rock: {
    id: 'global_rock',
    label: 'Global Rock & Alt-Rock',
    keywords: [
      'linkin park', 'coldplay', 'imagine dragons', 'green day', 'nirvana',
      'queen', 'arctic monkeys', 'red hot chili peppers', 'bon jovi',
      'guns n roses', 'metallica', 'slipknot', 'ac/dc', 'radiohead'
    ],
    shelves: [
      {
        id: 'user-daily-mix-rock',
        title: '🎸 Daily Mix • Rock Anthems & Modern Alt',
        subtitle: 'High-voltage guitar riffs and legendary anthems',
        q: 'rock band anthems modern alternative'
      },
      {
        id: 'user-alt-indie',
        title: '⚡ Alternative & Indie Rock Spotlight',
        subtitle: 'Atmospheric rock and energetic modern hits',
        q: 'alternative indie rock hits'
      }
    ]
  },
  global_pop: {
    id: 'global_pop',
    label: 'Global Pop & Chartbusters',
    keywords: [
      'ed sheeran', 'the weeknd', 'taylor swift', 'bruno mars', 'dua lipa',
      'billie eilish', 'post malone', 'justin bieber', 'ariana grande',
      'harry styles', 'charlie puth', 'olivia rodrigo', 'shawn mendes'
    ],
    shelves: [
      {
        id: 'user-daily-mix-pop',
        title: '✨ Daily Mix • Global Pop Hits',
        subtitle: 'The biggest chartbusters dominating the world',
        q: 'global pop chartbusters 2026'
      }
    ]
  }
};

/**
 * Spotify-grade AI Music Recommendation & Genre Taste Engine
 * Analyzes listening history, liked tracks, and search queries to detect true music genres
 * and produce authentic, curated shelves without keyword pollution.
 */
export const generateRecommendations = async (userId = 'guest_session', category = 'all') => {
  let recentHistory = [];
  let likedSongs = [];
  let recentSearches = [];

  const uid = userId || 'guest_session';
  const dbStatus = getDBStatus();

  if (dbStatus.isMockMode) {
    recentHistory = await mockStore.getHistory(uid);
    likedSongs = await mockStore.getLikedSongs(uid);
    recentSearches = await mockStore.getSearches(uid);
  } else {
    try {
      recentHistory = await ListeningHistory.find({ userId: uid }).sort({ playedAt: -1 }).limit(30);
      likedSongs = await LikedSong.find({ userId: uid }).limit(30);
      recentSearches = await mockStore.getSearches(uid);
    } catch (e) {
      recentHistory = await mockStore.getHistory(uid);
      likedSongs = await mockStore.getLikedSongs(uid);
      recentSearches = await mockStore.getSearches(uid);
    }
  }

  // Calculate genre scores based on listening patterns
  const genreScores = {
    bangla_rock: 0,
    bangla_indie: 0,
    bollywood_hindi: 0,
    global_rock: 0,
    global_pop: 0
  };

  const textSignals = [];

  recentHistory.forEach(h => {
    const t = h.track || h;
    if (t?.artist) textSignals.push({ text: t.artist.toLowerCase(), weight: 2 });
    if (t?.title) textSignals.push({ text: t.title.toLowerCase(), weight: 1.5 });
  });

  likedSongs.forEach(l => {
    const t = l.track || l;
    if (t?.artist) textSignals.push({ text: t.artist.toLowerCase(), weight: 3 });
    if (t?.title) textSignals.push({ text: t.title.toLowerCase(), weight: 2 });
  });

  recentSearches.forEach((s, idx) => {
    const q = (s.query || '').toLowerCase().trim();
    if (q) {
      textSignals.push({ text: q, weight: Math.max(1.5, 4 - idx) });
    }
  });

  // Score each genre cluster against text signals
  textSignals.forEach(({ text, weight }) => {
    Object.keys(GENRE_CLUSTERS).forEach(genreKey => {
      const cluster = GENRE_CLUSTERS[genreKey];
      const hasMatch = cluster.keywords.some(kw => text.includes(kw) || kw.includes(text));
      if (hasMatch) {
        genreScores[genreKey] += weight;
      }
    });
  });

  // Sort genres by preference
  const rankedGenres = Object.entries(genreScores)
    .sort((a, b) => b[1] - a[1])
    .filter(e => e[1] > 0)
    .map(e => e[0]);

  const topGenreKey = rankedGenres[0] || (category === 'bangla' ? 'bangla_rock' : null);
  const ytmProvider = providerManager.getProvider('youtube-music');

  const sections = [];

  // 1. "Jump Back In" - User's authentic recent listening history
  if (recentHistory.length > 0) {
    const uniqueRecentTracks = [];
    const seen = new Set();
    recentHistory.forEach(h => {
      const trk = h.track || h;
      if (trk?.id && !seen.has(trk.id)) {
        seen.add(trk.id);
        uniqueRecentTracks.push(trk);
      }
    });
    if (uniqueRecentTracks.length > 0) {
      sections.push({
        id: 'user-jump-back-in',
        title: 'Jump Back In',
        subtitle: 'Pick up right where you left off',
        type: 'tracks',
        items: uniqueRecentTracks.slice(0, 15)
      });
    }
  }

  // 2. Genre-Personalized Daily Mix Shelves
  if (topGenreKey && GENRE_CLUSTERS[topGenreKey]) {
    const topCluster = GENRE_CLUSTERS[topGenreKey];
    const shelfQueries = topCluster.shelves;

    const shelfResults = await Promise.allSettled(
      shelfQueries.map(sq => ytmProvider.search(sq.q, 'songs'))
    );

    shelfResults.forEach((res, idx) => {
      const sq = shelfQueries[idx];
      const tracks = (res.status === 'fulfilled' ? res.value.tracks : []).slice(0, 15);
      if (tracks.length > 0) {
        sections.push({
          id: sq.id,
          title: sq.title,
          subtitle: sq.subtitle,
          type: 'tracks',
          items: tracks
        });
      }
    });
  }

  // 3. Add dynamic discovery feed (Trending, Rock, Acoustic) from provider
  const exploreFeed = await ytmProvider.getHomeSections(uid, category);
  if (exploreFeed?.sections?.length > 0) {
    exploreFeed.sections.forEach(sec => {
      if (!sections.some(s => s.id === sec.id)) {
        sections.push(sec);
      }
    });
  }

  // Extract top artist names for profile
  const artistFreq = new Map();
  recentHistory.forEach(h => {
    const a = (h.track || h)?.artist;
    if (a) artistFreq.set(a, (artistFreq.get(a) || 0) + 1);
  });
  recentSearches.forEach(s => {
    if (s.query) artistFreq.set(s.query, (artistFreq.get(s.query) || 0) + 1);
  });
  const topArtists = Array.from(artistFreq.keys()).slice(0, 5);

  return {
    sections,
    tasteProfile: {
      topGenre: topGenreKey ? GENRE_CLUSTERS[topGenreKey]?.label : 'Diverse Hits',
      topArtists,
      recentSearches: recentSearches.map(s => s.query).filter(Boolean).slice(0, 5),
      totalHistoryTracks: recentHistory.length,
      totalLikedTracks: likedSongs.length
    }
  };
};
