import { Router } from 'express';
import * as ctrl from '../controllers/analyticsController';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/statistics', ctrl.getStatistics);
router.get('/sustainability', ctrl.getSustainability);

export default router;
