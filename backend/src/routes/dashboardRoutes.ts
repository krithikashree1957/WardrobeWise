import { Router } from 'express';
import * as ctrl from '../controllers/dashboardController';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);
router.get('/', ctrl.getDashboard);

export default router;
