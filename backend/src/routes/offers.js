import { Router } from 'express';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/isAdmin.js';
import offerController from '../controllers/offerController.js';
import { offerValidation, offerIdParamValidation } from '../validations/offerValidation.js';

const router = Router();
const adminAuth = [auth, isAdmin];

// Public: list active offers only
router.get('/', (req, _res, next) => { req.query.active = 'true'; next(); }, offerController.list);

// Admin
router.get('/admin', adminAuth, offerController.list);
router.get('/admin/stats', adminAuth, offerController.getStats);
router.get('/admin/:id', adminAuth, ...offerIdParamValidation, offerController.getById);
router.post('/admin', adminAuth, ...offerValidation, offerController.create);
router.put('/admin/:id', adminAuth, ...offerIdParamValidation, ...offerValidation, offerController.update);
router.patch('/admin/:id/toggle-status', adminAuth, ...offerIdParamValidation, offerController.toggleStatus);
router.delete('/admin/:id', adminAuth, ...offerIdParamValidation, offerController.delete);
router.put('/admin/reorder', adminAuth, offerController.reorder);

export default router;
