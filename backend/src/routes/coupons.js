import { Router } from 'express';
import auth from '../../middleware/auth.js';
import isAdmin from '../../middleware/isAdmin.js';
import couponController from '../../controllers/couponController.js';

const router = Router();
const adminAuth = [auth, isAdmin];

// Public: validate coupon
router.post('/validate', couponController.validate);

// Public: list active coupons (for customer profile)
router.get('/active', couponController.listActive);

// Admin
router.get('/admin', adminAuth, couponController.list);
router.get('/admin/stats', adminAuth, couponController.getStats);
router.get('/admin/:id', adminAuth, couponController.getById);
router.post('/admin', adminAuth, couponController.create);
router.put('/admin/:id', adminAuth, couponController.update);
router.patch('/admin/:id/toggle-status', adminAuth, couponController.toggleStatus);
router.delete('/admin/:id', adminAuth, couponController.delete);

export default router;
