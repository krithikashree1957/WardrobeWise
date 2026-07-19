import { Router } from 'express';
import * as ctrl from '../controllers/laundryController';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);
router.get('/', ctrl.getLaundryOverview);

export default router;
