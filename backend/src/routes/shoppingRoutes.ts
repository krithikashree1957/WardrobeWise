import { Router } from 'express';
import * as ctrl from '../controllers/shoppingController';
import { requireAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();
router.use(requireAuth);

router.post('/evaluate', upload.single('image'), ctrl.evaluatePotentialPurchase);
router.get('/', ctrl.listShoppingSuggestions);

export default router;
