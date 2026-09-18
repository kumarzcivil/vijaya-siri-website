import express from 'express';
import { signup, login, getMe, updateProfile, adminLogin, googleAuth } from '../controllers/authController.js';
import { signupValidation, loginValidation, adminLoginValidation, googleAuthValidation } from '../middleware/validate.js';
import auth from '../middleware/auth.js';
import verificationRoutes from './verification.js';

const router = express.Router();

router.use('/verify', verificationRoutes);

router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.post('/google', googleAuthValidation, googleAuth);
router.post('/admin/login', adminLoginValidation, adminLogin);
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);

export default router;
