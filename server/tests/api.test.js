import test from 'node:test';
import assert from 'node:assert';
import { MockMusicProvider } from '../src/services/musicProvider/MockMusicProvider.js';
import { mockStore } from '../src/models/mockStore.js';

test('MockMusicProvider returns home sections and tracks', async () => {
  const provider = new MockMusicProvider();
  const home = await provider.getHomeSections();
  assert.ok(home.sections.length > 0, 'Home should contain sections');
  assert.equal(home.sections[0].id, 'trending');
});

test('MockMusicProvider search finds matching tracks', async () => {
  const provider = new MockMusicProvider();
  const results = await provider.search('Neon');
  assert.ok(results.tracks.length > 0, 'Should find tracks matching Neon');
  assert.equal(results.tracks[0].title, 'Neon Horizon');
});

test('mockStore creates and retrieves user playlists', async () => {
  const playlist = await mockStore.createPlaylist('user_test_99', {
    name: 'My Synth Playlist',
    description: 'Test description'
  });
  assert.equal(playlist.name, 'My Synth Playlist');
  const userPlaylists = await mockStore.getUserPlaylists('user_test_99');
  assert.equal(userPlaylists.length, 1);
});

test('mockStore manages liked songs', async () => {
  const like = await mockStore.addLikedSong('user_test_99', {
    id: 'trk-1',
    title: 'Neon Horizon',
    artist: 'Cyberwave Orchestra'
  });
  assert.equal(like.trackId, 'trk-1');
  const likes = await mockStore.getLikedSongs('user_test_99');
  assert.equal(likes.length, 1);
  await mockStore.removeLikedSong('user_test_99', 'trk-1');
  const afterRemove = await mockStore.getLikedSongs('user_test_99');
  assert.equal(afterRemove.length, 0);
});
