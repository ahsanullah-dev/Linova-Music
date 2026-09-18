import test from 'node:test';
import assert from 'node:assert';
import { YouTubeMusicProvider } from '../src/services/musicProvider/YouTubeMusicProvider.js';
import { providerManager } from '../src/services/musicProvider/index.js';
import { generateRecommendations } from '../src/services/recommendation/recommendationService.js';
import { mockStore } from '../src/models/mockStore.js';

test('YouTubeMusicProvider provides full capabilities', async () => {
  const provider = new YouTubeMusicProvider();
  const caps = await provider.getCapabilities();
  assert.equal(caps.search, true);
  assert.equal(caps.playback, true);
  assert.equal(caps.canDownload, true);
  assert.equal(caps.tracks, true);
});

test('ProviderManager resolves youtube-music provider', () => {
  const provider = providerManager.getProvider('youtube-music');
  assert.ok(provider, 'Provider should exist');
  assert.equal(provider.name, 'youtube-music');
});

test('YouTubeMusicProvider search finds Bangla rock songs and bands', async () => {
  const provider = new YouTubeMusicProvider();
  const results = await provider.search('Artcell Biday Kibhabe Janai', 'songs');
  assert.ok(results.tracks.length > 0, 'Should return Artcell tracks');
  
  const first = results.tracks[0];
  assert.equal(first.provider, 'youtube-music');
  assert.ok(first.title, 'Track should have title');
  assert.ok(first.artist, 'Track should have artist');
});

test('YouTubeMusicProvider getHomeSections returns dynamic shelves', async () => {
  const provider = new YouTubeMusicProvider();
  const home = await provider.getHomeSections('test_user', 'bangla');
  assert.ok(home.sections.length > 0, 'Should return bangla sections');
  const banglaSection = home.sections.find(s => s.id === 'bangla-rock');
  assert.ok(banglaSection, 'Should contain bangla-rock section');
});

test('Spotify recommendation engine personalizes home feed based on listening history & search', async () => {
  const testUserId = 'test_user_spotify_algo_1';
  
  // 1. Record search
  await mockStore.addSearch(testUserId, 'Artcell');
  
  // 2. Record listening history
  await mockStore.addHistory(testUserId, {
    id: 'yt_test_artcell_1',
    title: 'Oniket Prantor',
    artist: 'Artcell',
    provider: 'youtube-music'
  });

  const recs = await generateRecommendations(testUserId);
  assert.ok(recs.sections.length > 0, 'Should have personalized sections');
  
  const jumpBackIn = recs.sections.find(s => s.id === 'user-jump-back-in');
  assert.ok(jumpBackIn, 'Should include Jump Back In section');
  assert.equal(jumpBackIn.items[0].title, 'Oniket Prantor');

  assert.ok(recs.tasteProfile.topArtists.includes('Artcell'), 'Taste profile should learn Artcell as top artist');
});
