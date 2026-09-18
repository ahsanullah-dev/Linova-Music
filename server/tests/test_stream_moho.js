import ytdl from '@distube/ytdl-core';

async function testYtdl() {
  const videoId = 'sNQyFU4w3H4';
  console.log('Testing @distube/ytdl-core for Moho:', videoId);
  
  const info = await ytdl.getInfo(videoId);
  console.log('Video title:', info.videoDetails.title);
  console.log('Video author:', info.videoDetails.author.name);
  
  const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });
  console.log('Chosen audio format:', {
    itag: audioFormat.itag,
    mimeType: audioFormat.mimeType,
    bitrate: audioFormat.bitrate,
    hasUrl: !!audioFormat.url,
    url: audioFormat.url ? audioFormat.url.substring(0, 80) : 'none'
  });

  if (audioFormat.url) {
    const testResp = await fetch(audioFormat.url, { headers: { 'Range': 'bytes=0-1024' } });
    console.log('Audio test fetch status:', testResp.status, 'Content-Range:', testResp.headers.get('content-range'));
  }
}

testYtdl().then(() => process.exit(0)).catch(err => { console.error('Ytdl error:', err); process.exit(1); });
