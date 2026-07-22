import { Router } from 'express';
import * as ctrl from '../controllers/travelPlannerController';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { createTravelPlanSchema } from '../validations/travelPlannerValidation';

const router = Router();
router.use(requireAuth);

router.post('/', validate(createTravelPlanSchema), ctrl.createTravelPlan);
router.get('/', ctrl.listTravelPlans);
router.get('/:id', ctrl.getTravelPlan);
router.delete('/:id', ctrl.deleteTravelPlan);

export default router;
