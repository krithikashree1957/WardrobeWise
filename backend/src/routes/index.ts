import { Router } from 'express';
import authRoutes from './authRoutes';
import profileRoutes from './profileRoutes';
import wardrobeRoutes from './wardrobeRoutes';
import outfitRoutes from './outfitRoutes';
import colorRoutes from './colorRoutes';
import weatherRoutes from './weatherRoutes';
import assistantRoutes from './assistantRoutes';
import laundryRoutes from './laundryRoutes';
import packingRoutes from './packingRoutes';
import shoppingRoutes from './shoppingRoutes';
import analyticsRoutes from './analyticsRoutes';
import dashboardRoutes from './dashboardRoutes';
import marketplaceRoutes from './marketplaceRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/wardrobe', wardrobeRoutes);
router.use('/outfits', outfitRoutes);
router.use('/colors', colorRoutes);
router.use('/weather', weatherRoutes);
router.use('/assistant', assistantRoutes);
router.use('/laundry', laundryRoutes);
router.use('/packing', packingRoutes);
router.use('/shopping', shoppingRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/marketplace', marketplaceRoutes);

export default router;
