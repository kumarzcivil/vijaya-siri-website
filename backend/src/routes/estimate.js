import express from 'express';
import {
  createEstimate,
  getEstimateById,
  getEstimates,
  updateEstimate,
  deleteEstimate,
} from '../controllers/estimateController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', getEstimates);
router.get('/:id', getEstimateById);
router.post('/', auth, createEstimate);
router.put('/:id', auth, updateEstimate);
router.delete('/:id', auth, deleteEstimate);

export default router;
