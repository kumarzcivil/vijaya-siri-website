import express from 'express';
import { signup, login, getMe, updateProfile } from '../controllers/authController.js';
import { signupValidation, loginValidation } from '../middleware/validate.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);

export default router;
