import YTMusic from 'ytmusic-api';

async function testLyrics() {
  const ytm = new YTMusic();
  await ytm.initialize();

  // Test with Blinding Lights, and with Artcell
  const songs = await ytm.searchSongs('Artcell Biday Kibhabe Janai');
  const song = songs[0];
  console.log('Testing song:', song.name, 'videoId:', song.videoId);

  try {
    const lyrics = await ytm.getLyrics(song.videoId);
    console.log('YouTube Music lyrics result:', lyrics);
  } catch (e) {
    console.log('ytm.getLyrics error:', e.message);
  }

  const enSongs = await ytm.searchSongs('Blinding Lights The Weeknd');
  try {
    const enLyrics = await ytm.getLyrics(enSongs[0].videoId);
    console.log('En lyrics:', enLyrics);
  } catch (e) {
    console.log('En lyrics error:', e.message);
  }
}

testLyrics().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
