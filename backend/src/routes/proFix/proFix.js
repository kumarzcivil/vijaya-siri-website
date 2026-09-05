import { Router } from 'express';
import auth  from '../../middleware/auth.js';
import isAdmin from '../../middleware/isAdmin.js';
import proFixCategoryController from '../../controllers/proFix/proFixCategoryController.js';
import proFixServiceController from '../../controllers/proFix/proFixServiceController.js';
import proFixBannerController from '../../controllers/proFix/proFixBannerController.js';
import { categoryValidation, serviceValidation, bannerValidation, idParamValidation } from '../../validations/proFix/proFixValidation.js';

const router = Router();
const adminAuth = [auth, isAdmin];

// Public: list active categories, services, banners (for customer side)
router.get('/categories', proFixCategoryController.list);
router.get('/services', proFixServiceController.list);
router.get('/banners', proFixBannerController.list);

// Admin: categories
router.get('/admin/categories', adminAuth, proFixCategoryController.list);
router.get('/admin/categories/:id', adminAuth, ...idParamValidation, proFixCategoryController.getById);
router.post('/admin/categories', adminAuth, ...categoryValidation, proFixCategoryController.create);
router.put('/admin/categories/:id', adminAuth, ...idParamValidation, ...categoryValidation, proFixCategoryController.update);
router.patch('/admin/categories/:id/toggle-active', adminAuth, ...idParamValidation, proFixCategoryController.toggleActive);
router.delete('/admin/categories/:id', adminAuth, ...idParamValidation, proFixCategoryController.delete);
router.put('/admin/categories-reorder', adminAuth, proFixCategoryController.reorder);

// Admin: services
router.get('/admin/services', adminAuth, proFixServiceController.list);
router.get('/admin/services/stats', adminAuth, proFixServiceController.getStats);
router.get('/admin/services/:id', adminAuth, ...idParamValidation, proFixServiceController.getById);
router.post('/admin/services', adminAuth, ...serviceValidation, proFixServiceController.create);
router.put('/admin/services/:id', adminAuth, ...idParamValidation, ...serviceValidation, proFixServiceController.update);
router.patch('/admin/services/:id/toggle-active', adminAuth, ...idParamValidation, proFixServiceController.toggleActive);
router.delete('/admin/services/:id', adminAuth, ...idParamValidation, proFixServiceController.delete);
router.put('/admin/services-reorder', adminAuth, proFixServiceController.reorder);

// Admin: banners
router.get('/admin/banners', adminAuth, proFixBannerController.list);
router.get('/admin/banners/stats', adminAuth, proFixBannerController.getStats);
router.get('/admin/banners/:id', adminAuth, ...idParamValidation, proFixBannerController.getById);
router.post('/admin/banners', adminAuth, ...bannerValidation, proFixBannerController.create);
router.put('/admin/banners/:id', adminAuth, ...idParamValidation, ...bannerValidation, proFixBannerController.update);
router.patch('/admin/banners/:id/toggle-status', adminAuth, ...idParamValidation, proFixBannerController.toggleStatus);
router.delete('/admin/banners/:id', adminAuth, ...idParamValidation, proFixBannerController.delete);

export default router;
