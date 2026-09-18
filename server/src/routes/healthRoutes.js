import { Router } from 'express';
import { getDBStatus } from '../config/db.js';
import { providerManager } from '../services/musicProvider/index.js';

const router = Router();

router.get('/', async (req, res) => {
  const dbStatus = getDBStatus();
  const providerStatus = await providerManager.getActiveStatus();

  res.json({
    status: 'ok',
    app: 'LINOVA MUSIC API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    provider: providerStatus
  });
});

export default router;
