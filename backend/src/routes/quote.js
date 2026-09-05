import { Router } from 'express';
import { submitQuote, getQuoteByRef } from '../controllers/quoteController.js';
import { quoteValidation } from '../middleware/validate.js';

const router = Router();

router.post('/', quoteValidation, submitQuote);
router.get('/:refId', getQuoteByRef);

export default router;
