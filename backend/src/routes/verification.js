import express from 'express';
import { sendOTP, verifyOTPHandler, resendOTP } from '../controllers/verificationController.js';
import { sendOTPValidation, verifyOTPValidation, resendOTPValidation } from '../middleware/validate.js';

const router = express.Router();

router.post('/send-otp', sendOTPValidation, sendOTP);
router.post('/verify-otp', verifyOTPValidation, verifyOTPHandler);
router.post('/resend-otp', resendOTPValidation, resendOTP);

export default router;
