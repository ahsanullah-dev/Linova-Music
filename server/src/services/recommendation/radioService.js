import { providerManager } from '../musicProvider/index.js';
import { GENRE_CLUSTERS } from './genreClusters.js';

/**
 * Spotify-style "song radio": given a seed track, produce a continuation queue
 * of tracks that share its genre neighbourhood, so playback never dead-ends
 * after a single search result finishes.
 *
 * Strategy, in descending order of relevance:
 *   1. More from the same artist
 *   2. The seed's genre cluster shelves (from the existing knowledge graph)
 *   3. Generic "similar to <artist>" style queries
 */

const norm = (s) => (s || '').toString().toLowerCase().trim();

export const detectGenreKey = (track) => {
  const haystack = [
    norm(track?.artist),
    norm(track?.title),
    norm(track?.album?.name),
    ...(Array.isArray(track?.artists) ? track.artists.map((a) => norm(a?.name || a)) : [])
  ].join(' ');

  let best = null;
  let bestScore = 0;

  for (const [key, cluster] of Object.entries(GENRE_CLUSTERS)) {
    let score = 0;
    for (const kw of cluster.keywords) {
      if (haystack.includes(kw)) score += kw.length; // longer match == more specific
    }
    if (score > bestScore) {
      bestScore = score;
      best = key;
    }
  }

  return best;
};

const buildQueries = (seed) => {
  const artist = seed?.artist ? seed.artist.trim() : '';
  const genreKey = detectGenreKey(seed);
  const cluster = genreKey ? GENRE_CLUSTERS[genreKey] : null;

  const queries = [];

  if (seed?.title && artist) {
    // This works for tracks discovered through search too, where the artist
    // name may not be present in our genre keyword graph.
    queries.push(`songs similar to ${seed.title} by ${artist}`);
    queries.push(`${artist} similar artists songs`);
  }

  if (artist) {
    queries.push(`${artist} songs`);
    queries.push(`${artist} best tracks`);
  }

  if (cluster) {
    for (const shelf of cluster.shelves) {
      if (shelf.q) queries.push(shelf.q);
    }
  }

  if (artist) queries.push(`artists similar to ${artist}`);

  if (queries.length === 0) {
    queries.push(seed?.title ? `${seed.title} similar songs` : 'popular songs');
  }

  return { queries, genreKey, genreLabel: cluster ? cluster.label : null };
};

/**
 * @param {object} seed        the track that just finished / is playing
 * @param {string[]} excludeIds track ids already in the queue or recently played
 * @param {number} limit       how many tracks to return
 */
export const buildRadioQueue = async (seed, excludeIds = [], limit = 20) => {
  const provider = providerManager.getProvider('youtube-music');
  const { queries, genreKey, genreLabel } = buildQueries(seed);

  const excluded = new Set([
    ...(excludeIds || []).map((id) => id && id.toString()),
    seed?.id ? seed.id.toString() : null
  ].filter(Boolean));

  const results = await Promise.allSettled(
    queries.slice(0, 8).map((q) => provider.search(q, 'songs'))
  );

  const picked = [];
  const seen = new Set();

  // Round-robin across query buckets so one artist cannot dominate the queue.
  const buckets = results
    .map((r) => (r.status === 'fulfilled' ? (r.value?.tracks || []) : []))
    .filter((b) => b.length > 0);

  const artistCount = new Map();
  const MAX_PER_ARTIST = 3;

  let depth = 0;
  while (picked.length < limit && depth < 40) {
    let addedThisPass = false;

    for (const bucket of buckets) {
      if (picked.length >= limit) break;
      const track = bucket[depth];
      if (!track || !track.id) continue;

      const id = track.id.toString();
      if (excluded.has(id) || seen.has(id)) continue;

      const artistKey = norm(track.artist);
      const count = artistCount.get(artistKey) || 0;
      if (artistKey && count >= MAX_PER_ARTIST) continue;

      seen.add(id);
      artistCount.set(artistKey, count + 1);
      picked.push(track);
      addedThisPass = true;
    }

    if (!addedThisPass && depth > 0) break;
    depth += 1;
  }

  return {
    seedTrackId: seed?.id || null,
    genre: genreKey,
    genreLabel,
    tracks: picked
  };
};
