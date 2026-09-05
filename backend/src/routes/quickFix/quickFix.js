import { Router } from 'express';
import  auth  from '../../middleware/auth.js';
import isAdmin from '../../middleware/isAdmin.js';
import quickFixCategoryController from '../../controllers/quickFix/quickFixCategoryController.js';
import quickFixServiceController from '../../controllers/quickFix/quickFixServiceController.js';
import quickFixBannerController from '../../controllers/quickFix/quickFixBannerController.js';
import { categoryValidation, serviceValidation, bannerValidation, idParamValidation } from '../../validations/quickFix/quickFixValidation.js';

const router = Router();
const adminAuth = [auth, isAdmin];

// Public: list active categories, services, banners (for customer side)
router.get('/categories', quickFixCategoryController.list);
router.get('/services', quickFixServiceController.list);
router.get('/banners', quickFixBannerController.list);

// Admin: categories
router.get('/admin/categories', adminAuth, quickFixCategoryController.list);
router.get('/admin/categories/:id', adminAuth, ...idParamValidation, quickFixCategoryController.getById);
router.post('/admin/categories', adminAuth, ...categoryValidation, quickFixCategoryController.create);
router.put('/admin/categories/:id', adminAuth, ...idParamValidation, ...categoryValidation, quickFixCategoryController.update);
router.patch('/admin/categories/:id/toggle-active', adminAuth, ...idParamValidation, quickFixCategoryController.toggleActive);
router.delete('/admin/categories/:id', adminAuth, ...idParamValidation, quickFixCategoryController.delete);
router.put('/admin/categories-reorder', adminAuth, quickFixCategoryController.reorder);

// Admin: services
router.get('/admin/services', adminAuth, quickFixServiceController.list);
router.get('/admin/services/stats', adminAuth, quickFixServiceController.getStats);
router.get('/admin/services/:id', adminAuth, ...idParamValidation, quickFixServiceController.getById);
router.post('/admin/services', adminAuth, ...serviceValidation, quickFixServiceController.create);
router.put('/admin/services/:id', adminAuth, ...idParamValidation, ...serviceValidation, quickFixServiceController.update);
router.patch('/admin/services/:id/toggle-active', adminAuth, ...idParamValidation, quickFixServiceController.toggleActive);
router.delete('/admin/services/:id', adminAuth, ...idParamValidation, quickFixServiceController.delete);
router.put('/admin/services-reorder', adminAuth, quickFixServiceController.reorder);

// Admin: banners
router.get('/admin/banners', adminAuth, quickFixBannerController.list);
router.get('/admin/banners/stats', adminAuth, quickFixBannerController.getStats);
router.get('/admin/banners/:id', adminAuth, ...idParamValidation, quickFixBannerController.getById);
router.post('/admin/banners', adminAuth, ...bannerValidation, quickFixBannerController.create);
router.put('/admin/banners/:id', adminAuth, ...idParamValidation, ...bannerValidation, quickFixBannerController.update);
router.patch('/admin/banners/:id/toggle-active', adminAuth, ...idParamValidation, quickFixBannerController.toggleActive);
router.delete('/admin/banners/:id', adminAuth, ...idParamValidation, quickFixBannerController.delete);
router.put('/admin/banners-reorder', adminAuth, quickFixBannerController.reorder);

export default router;
