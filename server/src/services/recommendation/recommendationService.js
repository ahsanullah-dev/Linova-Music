import { providerManager } from '../musicProvider/index.js';
import { getDBStatus } from '../../config/db.js';
import { mockStore } from '../../models/mockStore.js';
import { ListeningHistory } from '../../models/ListeningHistory.js';
import { LikedSong } from '../../models/LikedSong.js';
import { GENRE_CLUSTERS } from './genreClusters.js';
import { buildRadioQueue } from './radioService.js';


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
  // Previously only the single #1 genre ever got a shelf, so as soon as one
  // genre pulled slightly ahead, every other genre the user actually listens
  // to vanished from the feed entirely - that's a big part of why the feed
  // felt static. Blending the top 2 keeps the feed reflecting a wider slice
  // of what someone actually plays.
  const secondaryGenreKey = rankedGenres[1] || null;
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

  // 1b. "Because you listened to <Artist>" - reuses the same genre-matched
  // radio builder that powers autoplay, seeded from the user's most-played
  // and most-liked artists. This is the part that actually moves as
  // listening history grows, rather than only reshuffling within a fixed
  // genre's static shelf queries.
  const artistPlayCounts = new Map();
  recentHistory.forEach(h => {
    const a = (h.track || h)?.artist;
    if (a) artistPlayCounts.set(a, (artistPlayCounts.get(a) || 0) + 1);
  });
  likedSongs.forEach(l => {
    const a = (l.track || l)?.artist;
    if (a) artistPlayCounts.set(a, (artistPlayCounts.get(a) || 0) + 2); // liked counts extra
  });

  const topArtistNames = Array.from(artistPlayCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name)
    .slice(0, 2);

  if (topArtistNames.length > 0) {
    const seedTracksByArtist = topArtistNames.map(name => {
      const fromHistory = recentHistory.find(h => (h.track || h)?.artist === name);
      const fromLiked = likedSongs.find(l => (l.track || l)?.artist === name);
      return (fromHistory?.track || fromHistory) || (fromLiked?.track || fromLiked) || { artist: name };
    });

    const radioResults = await Promise.allSettled(
      seedTracksByArtist.map(seed => buildRadioQueue(seed, [], 15))
    );

    radioResults.forEach((res, idx) => {
      if (res.status !== 'fulfilled') return;
      const artistName = topArtistNames[idx];
      const tracks = res.value?.tracks || [];
      if (tracks.length > 0) {
        sections.push({
          id: `because-you-listened-${artistName.toLowerCase().replace(/\s+/g, '-')}`,
          title: `Because you listened to ${artistName}`,
          subtitle: `More tracks in the same vein as ${artistName}`,
          type: 'tracks',
          items: tracks
        });
      }
    });
  }

  // 2. Genre-Personalized Daily Mix Shelves - blends the top 2 detected
  // genres so the feed reflects more than just whichever genre is narrowly
  // in first place.
  for (const genreKey of [topGenreKey, secondaryGenreKey].filter(Boolean)) {
    const cluster = GENRE_CLUSTERS[genreKey];
    if (!cluster) continue;

    const shelfResults = await Promise.allSettled(
      cluster.shelves.map(sq => ytmProvider.search(sq.q, 'songs'))
    );

    shelfResults.forEach((res, idx) => {
      const sq = cluster.shelves[idx];
      const tracks = (res.status === 'fulfilled' ? res.value.tracks : []).slice(0, 30);
      if (tracks.length > 0 && !sections.some(s => s.id === sq.id)) {
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
