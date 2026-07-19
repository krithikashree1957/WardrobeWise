import { Router } from 'express';
import * as ctrl from '../controllers/assistantController';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { chatMessageSchema } from '../validations/assistantValidation';

const router = Router();
router.use(requireAuth);

router.post('/chat', validate(chatMessageSchema), ctrl.sendMessage);
router.get('/history', ctrl.getChatHistory);

export default router;
