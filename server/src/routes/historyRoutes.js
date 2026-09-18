import { Router } from 'express';
import { getHistory, addHistory, recordSearch, getSearches } from '../controllers/historyController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.use(optionalAuth);

router.get('/', getHistory);
router.post('/', addHistory);
router.get('/searches', getSearches);
router.post('/searches', recordSearch);

export default router;
