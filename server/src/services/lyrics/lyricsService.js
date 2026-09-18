import { musicProvider } from '../musicProvider/index.js';

export const fetchLyrics = async ({ trackId, title, artist }) => {
  if (!trackId && !title) {
    return {
      synced: false,
      lines: [{ time: 0, text: "No track specified for lyrics lookup." }]
    };
  }
  return await musicProvider.getLyrics(trackId, title, artist);
};
