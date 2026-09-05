import express from 'express';
import {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  toggleActive,
  moveTemplate,
} from '../controllers/estimatorTemplateController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllTemplates);
router.get('/:id', getTemplateById);
router.post('/', auth, createTemplate);
router.put('/:id', auth, updateTemplate);
router.delete('/:id', auth, deleteTemplate);
router.patch('/:id/active', auth, toggleActive);
router.patch('/:id/move', auth, moveTemplate);

export default router;
