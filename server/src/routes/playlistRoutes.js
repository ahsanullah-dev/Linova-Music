import { Router } from 'express';
import {
  getPlaylists,
  createPlaylist,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  reorderPlaylistTracks
} from '../controllers/playlistController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, getPlaylists);
router.post('/', protect, createPlaylist);
router.get('/:id', optionalAuth, getPlaylistById);
router.patch('/:id', protect, updatePlaylist);
router.delete('/:id', protect, deletePlaylist);

router.post('/:id/tracks', protect, addTrackToPlaylist);
router.delete('/:id/tracks/:trackId', protect, removeTrackFromPlaylist);
router.patch('/:id/reorder', protect, reorderPlaylistTracks);

export default router;
