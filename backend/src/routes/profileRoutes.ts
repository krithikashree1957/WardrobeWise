import { Router } from 'express';
import * as ctrl from '../controllers/profileController';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { updateProfileSchema, updateAvatarSchema } from '../validations/profileValidation';

const router = Router();
router.use(requireAuth);

router.patch('/', validate(updateProfileSchema), ctrl.updateProfile);
router.get('/avatar', ctrl.getAvatar);
router.patch('/avatar', validate(updateAvatarSchema), ctrl.updateAvatar);

export default router;
