import express from 'express';
import { getProjects, getProject, createProject, updateProject, deleteProject } from '../controllers/projectController.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', auth, upload.array('images', 6), createProject);
router.put('/:id', auth, upload.array('images', 6), updateProject);
router.delete('/:id', auth, deleteProject);

export default router;
