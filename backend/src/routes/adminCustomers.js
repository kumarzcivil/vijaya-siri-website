import { Router } from 'express';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/isAdmin.js';
import {
  listCustomers,
  getCustomer,
  toggleCustomer,
  deleteCustomer,
  getStats,
} from '../controllers/adminCustomerController.js';

const router = Router();

router.use(auth, isAdmin);

router.get('/stats', getStats);
router.get('/', listCustomers);
router.get('/:id', getCustomer);
router.patch('/:id/toggle', toggleCustomer);
router.delete('/:id', deleteCustomer);

export default router;
