import { Router } from 'express';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/isAdmin.js';
import notificationController from '../controllers/notificationController.js';
import { notificationValidation, notificationIdParamValidation } from '../validations/notificationValidation.js';

const router = Router();
const adminAuth = [auth, isAdmin];

// Public: VAPID key
router.get('/vapid-key', notificationController.getVapidKey);

// Push subscription (public - works for all visitors)
router.post('/subscribe', notificationController.subscribe);
router.post('/unsubscribe', notificationController.unsubscribe);

// Test push (admin only)
router.get('/test-push', adminAuth, notificationController.testPush);
router.get('/test-push/:id', adminAuth, notificationController.testPush);

// Customer: list own notifications
router.get('/my', auth, notificationController.list);
router.patch('/my/read-all', auth, notificationController.markAllRead);

// Admin: full CRUD + push
router.get('/admin', adminAuth, notificationController.list);
router.get('/admin/stats', adminAuth, notificationController.getStats);
router.get('/admin/:id', adminAuth, ...notificationIdParamValidation, notificationController.getById);
router.post('/admin', adminAuth, ...notificationValidation, notificationController.create);
router.patch('/admin/:id/read', adminAuth, ...notificationIdParamValidation, notificationController.markRead);
router.delete('/admin/:id', adminAuth, ...notificationIdParamValidation, notificationController.delete);

export default router;
