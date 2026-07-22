import { Router } from 'express';
import * as ctrl from '../controllers/marketplaceController';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/recommendations', ctrl.getMarketplaceRecommendations);

export default router;
