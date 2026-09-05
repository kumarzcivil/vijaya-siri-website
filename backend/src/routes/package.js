import { Router } from 'express';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/isAdmin.js';
import packageController from '../controllers/packageController.js';
import { packageValidation, idParamValidation } from '../validations/packageValidation.js';

const router = Router();
const adminAuth = [auth, isAdmin];

// Public: list active packages
router.get('/', packageController.listActive);

// Admin: full CRUD
router.get('/admin', adminAuth, packageController.list);
router.get('/admin/stats', adminAuth, packageController.getStats);
router.get('/admin/:id', adminAuth, ...idParamValidation, packageController.getById);
router.post('/admin', adminAuth, ...packageValidation, packageController.create);
router.put('/admin/:id', adminAuth, ...idParamValidation, ...packageValidation, packageController.update);
router.delete('/admin/:id', adminAuth, ...idParamValidation, packageController.delete);
router.put('/admin/reorder', adminAuth, packageController.reorder);

export default router;
