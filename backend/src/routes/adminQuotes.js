import { Router } from 'express';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/isAdmin.js';
import {
  listQuotes,
  getQuote,
  updateStatus,
  updateNotes,
  deleteQuote,
  getStats,
} from '../controllers/adminQuoteController.js';

const router = Router();

router.use(auth, isAdmin);

router.get('/stats', getStats);
router.get('/', listQuotes);
router.get('/:id', getQuote);
router.patch('/:id/status', updateStatus);
router.patch('/:id/notes', updateNotes);
router.delete('/:id', deleteQuote);

export default router;
