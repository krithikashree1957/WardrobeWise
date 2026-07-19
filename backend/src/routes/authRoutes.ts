import { Router } from 'express';
import * as ctrl from '../controllers/authController';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';
import {
  registerSchema, loginSchema, googleLoginSchema, forgotPasswordSchema, resetPasswordSchema,
} from '../validations/authValidation';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), ctrl.register);
router.post('/login', authRateLimiter, validate(loginSchema), ctrl.login);
router.post('/google', authRateLimiter, validate(googleLoginSchema), ctrl.googleLogin);
router.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), ctrl.forgotPassword);
router.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), ctrl.resetPassword);
router.get('/me', requireAuth, ctrl.me);

export default router;
