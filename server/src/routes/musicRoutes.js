import { Router } from 'express';
import {
  getHome,
  searchCatalog,
  getTrack,
  getArtist,
  getAlbum,
  getProviderPlaylist,
  getRecommendations,
  getProviderStatus,
  streamAudioTrack
} from '../controllers/musicController.js';
import { optionalAuth } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(apiLimiter);

router.get('/home', optionalAuth, getHome);
router.get('/search', searchCatalog);
router.get('/tracks/:id', getTrack);
router.get('/artists/:id', getArtist);
router.get('/albums/:id', getAlbum);
router.get('/playlists/:id', getProviderPlaylist);
router.get('/recommendations', optionalAuth, getRecommendations);
router.get('/status', getProviderStatus);
router.get('/stream/:id', streamAudioTrack);

export default router;
