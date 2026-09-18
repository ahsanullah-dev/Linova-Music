import { Router } from 'express';
import {
  getLikedSongs,
  addLikedSong,
  removeLikedSong,
  getSavedAlbums,
  addSavedAlbum,
  removeSavedAlbum,
  getSavedArtists,
  addSavedArtist,
  removeSavedArtist
} from '../controllers/libraryController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

// Liked Songs
router.get('/liked', getLikedSongs);
router.post('/liked', addLikedSong);
router.delete('/liked/:trackId', removeLikedSong);

// Saved Albums
router.get('/albums', getSavedAlbums);
router.post('/albums', addSavedAlbum);
router.delete('/albums/:albumId', removeSavedAlbum);

// Saved Artists
router.get('/artists', getSavedArtists);
router.post('/artists', addSavedArtist);
router.delete('/artists/:artistId', removeSavedArtist);

export default router;
