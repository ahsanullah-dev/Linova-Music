import { providerManager, getRequestProvider } from '../services/musicProvider/index.js';
import { generateRecommendations } from '../services/recommendation/recommendationService.js';
import { mockStore } from '../models/mockStore.js';

export const getHome = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : 'guest_session';
    const { category } = req.query;
    const homeSections = await generateRecommendations(userId, category || 'all');
    res.json({
      success: true,
      data: homeSections
    });
  } catch (error) {
    next(error);
  }
};

export const searchCatalog = async (req, res, next) => {
  try {
    const { q, type } = req.query;
    const userId = req.user ? req.user._id : 'guest_session';
    const provider = getRequestProvider(req);

    // Record search query into recommendation engine signals
    if (q && q.trim()) {
      mockStore.addSearch(userId, q.trim()).catch(() => {});
    }

    const results = await provider.search(q, type);
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

export const getTrack = async (req, res, next) => {
  try {
    const { id } = req.params;
    const provider = getRequestProvider(req);
    const track = await provider.getTrack(id);
    if (!track) {
      return res.status(404).json({
        success: false,
        error: { code: 'TRACK_NOT_FOUND', message: 'Track not found' }
      });
    }
    res.json({
      success: true,
      data: track
    });
  } catch (error) {
    next(error);
  }
};

export const getArtist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const provider = getRequestProvider(req);
    const artist = await provider.getArtist(id);
    if (!artist) {
      return res.status(404).json({
        success: false,
        error: { code: 'ARTIST_NOT_FOUND', message: 'Artist not found' }
      });
    }
    res.json({
      success: true,
      data: artist
    });
  } catch (error) {
    next(error);
  }
};

export const getAlbum = async (req, res, next) => {
  try {
    const { id } = req.params;
    const provider = getRequestProvider(req);
    const album = await provider.getAlbum(id);
    if (!album) {
      return res.status(404).json({
        success: false,
        error: { code: 'ALBUM_NOT_FOUND', message: 'Album not found' }
      });
    }
    res.json({
      success: true,
      data: album
    });
  } catch (error) {
    next(error);
  }
};

export const getProviderPlaylist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const provider = getRequestProvider(req);
    const playlist = await provider.getPlaylist(id);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: { code: 'PLAYLIST_NOT_FOUND', message: 'Playlist not found' }
      });
    }
    res.json({
      success: true,
      data: playlist
    });
  } catch (error) {
    next(error);
  }
};

export const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : 'guest_session';
    const { category } = req.query;
    const recommendations = await generateRecommendations(userId, category || 'all');
    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
};

export const getProviderStatus = async (req, res, next) => {
  try {
    const status = await providerManager.getActiveStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Stream audio track on demand
 * Resolves high-fidelity audio stream and redirects or proxies chunks directly to HTML5 Audio / Web Audio
 */
export const streamAudioTrack = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, artist, proxy } = req.query;
    const videoId = id.replace(/^yt_/, '');

    const ytmProvider = providerManager.getProvider('youtube-music');
    const audioUrl = await ytmProvider.resolveAudioStream(videoId, title, artist);

    if (!audioUrl) {
      return res.status(404).json({
        success: false,
        error: { code: 'STREAM_UNAVAILABLE', message: 'Audio stream could not be resolved for this track.' }
      });
    }

    if (proxy === 'true') {
      const headers = {};
      if (req.headers.range) {
        headers['Range'] = req.headers.range;
      }
      const fetchResp = await fetch(audioUrl, { headers });
      res.status(fetchResp.status);
      fetchResp.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });
      const buffer = await fetchResp.arrayBuffer();
      return res.send(Buffer.from(buffer));
    }

    // Default fast 302 redirect directly to audio CDN
    return res.redirect(302, audioUrl);
  } catch (error) {
    next(error);
  }
};
