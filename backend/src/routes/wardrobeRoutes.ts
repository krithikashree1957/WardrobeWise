import { Router } from 'express';
import * as ctrl from '../controllers/wardrobeController';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';
import {
  createClothingItemSchema, updateClothingItemSchema, updateLaundryStatusSchema,
} from '../validations/wardrobeValidation';

const router = Router();
router.use(requireAuth);

router.post('/detect', upload.single('image'), ctrl.detectItem);
router.post('/', upload.single('image'), validate(createClothingItemSchema), ctrl.createClothingItem);
router.get('/', ctrl.listClothingItems);
router.get('/:id', ctrl.getClothingItem);
router.patch('/:id', validate(updateClothingItemSchema), ctrl.updateClothingItem);
router.delete('/:id', ctrl.deleteClothingItem);
router.patch('/:id/laundry', validate(updateLaundryStatusSchema), ctrl.updateLaundryStatus);
router.patch('/:id/favorite', ctrl.toggleFavorite);
router.patch('/:id/worn', ctrl.markWorn);

export default router;
