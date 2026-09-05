import { Router } from 'express';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/isAdmin.js';
import bookingController from '../controllers/bookingController.js';
import { bookingValidation, bookingStatusValidation, bookingIdParamValidation } from '../validations/bookingValidation.js';

const router = Router();
const adminAuth = [auth, isAdmin];

// Public: create a booking (logged-in user)
router.post('/', auth, ...bookingValidation, bookingController.create);

// User: list own bookings
router.get('/my', auth, bookingController.list);

// Admin: list all, stats
router.get('/admin', adminAuth, bookingController.list);
router.get('/admin/stats', adminAuth, bookingController.getStats);
router.get('/admin/:id', adminAuth, ...bookingIdParamValidation, bookingController.getById);
router.patch('/admin/:id/status', adminAuth, ...bookingIdParamValidation, ...bookingStatusValidation, bookingController.updateStatus);
router.delete('/admin/:id', adminAuth, ...bookingIdParamValidation, bookingController.delete);

export default router;
