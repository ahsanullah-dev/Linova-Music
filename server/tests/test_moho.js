import YTMusic from 'ytmusic-api';

async function testThumbnails() {
  const ytm = new YTMusic();
  await ytm.initialize();
  const songs = await ytm.searchSongs('Moho Aftermath');
  const song = songs[0];
  console.log('Original thumbnails:', song.thumbnails);

  // If we use standard i.ytimg.com/vi/VIDEO_ID/hqdefault.jpg or maxresdefault.jpg:
  const ytImgUrl = `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`;
  console.log('Reliable ytimg URL:', ytImgUrl);

  const testFetch = await fetch(ytImgUrl);
  console.log('ytimg fetch status:', testFetch.status);
}

testThumbnails().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
