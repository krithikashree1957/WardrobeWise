import { Router } from 'express';
import * as ctrl from '../controllers/colorController';

const router = Router();
router.get('/scheme', ctrl.getColorScheme);
router.get('/schemes', ctrl.getAllColorSchemes);

export default router;
