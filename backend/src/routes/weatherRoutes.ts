import { Router } from 'express';
import * as ctrl from '../controllers/weatherController';

const router = Router();
router.get('/', ctrl.getWeatherRecommendation);

export default router;
