import { Router } from 'express';
import * as ctrl from '../controllers/packingController';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { createPackingListSchema } from '../validations/packingValidation';

const router = Router();
router.use(requireAuth);

router.post('/', validate(createPackingListSchema), ctrl.createPackingList);
router.get('/', ctrl.listPackingLists);
router.patch('/:id/items/:itemId/toggle', ctrl.togglePackedItem);

export default router;
