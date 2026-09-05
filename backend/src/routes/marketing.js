import { Router } from 'express';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/isAdmin.js';
import marketingStatController from '../controllers/marketingStatController.js';
import marketingServiceController from '../controllers/marketingServiceController.js';
import { statValidation, serviceValidation, idParamValidation } from '../validations/marketingValidation.js';

const router = Router();
const adminAuth = [auth, isAdmin];

// Public
router.get('/stats', marketingStatController.list);
router.get('/services', marketingServiceController.list);

// Admin: stats
router.get('/admin/stats', adminAuth, marketingStatController.list);
router.get('/admin/stats/:id', adminAuth, ...idParamValidation, marketingStatController.getById);
router.post('/admin/stats', adminAuth, ...statValidation, marketingStatController.create);
router.put('/admin/stats/:id', adminAuth, ...idParamValidation, ...statValidation, marketingStatController.update);
router.patch('/admin/stats/:id/toggle-status', adminAuth, ...idParamValidation, marketingStatController.toggleStatus);
router.delete('/admin/stats/:id', adminAuth, ...idParamValidation, marketingStatController.delete);
router.put('/admin/stats-reorder', adminAuth, marketingStatController.reorder);

// Admin: services
router.get('/admin/services', adminAuth, marketingServiceController.list);
router.get('/admin/services/stats', adminAuth, marketingServiceController.getStats);
router.get('/admin/services/:id', adminAuth, ...idParamValidation, marketingServiceController.getById);
router.post('/admin/services', adminAuth, ...serviceValidation, marketingServiceController.create);
router.put('/admin/services/:id', adminAuth, ...idParamValidation, ...serviceValidation, marketingServiceController.update);
router.patch('/admin/services/:id/toggle-status', adminAuth, ...idParamValidation, marketingServiceController.toggleStatus);
router.delete('/admin/services/:id', adminAuth, ...idParamValidation, marketingServiceController.delete);
router.put('/admin/services-reorder', adminAuth, marketingServiceController.reorder);

export default router;
