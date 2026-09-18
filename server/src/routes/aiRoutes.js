import { Router } from 'express';
import { chatAI } from '../controllers/aiController.js';
import { getAiHistory, addAiMessage, clearAiHistory } from '../controllers/aiHistoryController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// The AI companion is a logged-in-only feature. `protect` returns 401 with
// code UNAUTHORIZED, which the client uses to show the sign-in gate.
router.use(protect);

router.post('/chat', chatAI);

router.get('/history', getAiHistory);
router.post('/history', addAiMessage);
router.delete('/history', clearAiHistory);

export default router;
