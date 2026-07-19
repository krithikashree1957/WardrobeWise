import { Router } from 'express';
import * as ctrl from '../controllers/outfitController';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { generateOutfitSchema } from '../validations/outfitValidation';

const router = Router();
router.use(requireAuth);

router.post('/generate', validate(generateOutfitSchema), ctrl.createOutfitSuggestion);
router.get('/', ctrl.listOutfits);
router.get('/:id', ctrl.getOutfit);
router.patch('/:id/save', ctrl.saveOutfit);
router.patch('/:id/worn', ctrl.markOutfitWorn);
router.delete('/:id', ctrl.deleteOutfit);

export default router;
