import { fetchLyrics } from '../services/lyrics/lyricsService.js';

export const getLyrics = async (req, res, next) => {
  try {
    const { trackId, title, artist } = req.query;
    const lyrics = await fetchLyrics({ trackId, title, artist });
    res.json({
      success: true,
      data: lyrics
    });
  } catch (error) {
    next(error);
  }
};
