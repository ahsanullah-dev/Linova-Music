import { Router } from 'express';
import authRoutes from './authRoutes.js';
import musicRoutes from './musicRoutes.js';
import libraryRoutes from './libraryRoutes.js';
import playlistRoutes from './playlistRoutes.js';
import historyRoutes from './historyRoutes.js';
import lyricsRoutes from './lyricsRoutes.js';
import healthRoutes from './healthRoutes.js';
import aiRoutes from './aiRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/music', musicRoutes);
router.use('/library', libraryRoutes);
router.use('/playlists', playlistRoutes);
router.use('/history', historyRoutes);
router.use('/lyrics', lyricsRoutes);
router.use('/health', healthRoutes);
router.use('/ai', aiRoutes);

export default router;

