import { Router } from 'express';
import { getLyrics } from '../controllers/lyricsController.js';

const router = Router();

router.get('/', getLyrics);

export default router;
