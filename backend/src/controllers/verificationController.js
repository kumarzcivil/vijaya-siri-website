import User from '../models/User.js';
import { sendOTPEmail } from '../services/brevoEmailService.js';
import {
  generateOTP,
  storePendingSignup,
  getPendingSignup,
  deletePendingSignup,
  incrementAttempts,
  checkCooldown,
  checkSendRateLimit,
  verifyOTPRecord,
  MAX_ATTEMPTS,
} from '../services/otpService.js';
import jwt from 'jsonwebtoken';
import { getRedis, isRedisReady } from '../config/redis.js';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const sendOTP = async (req, res) => {
  try {
    const { fullName, mobile, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    await deletePendingSignup(normalizedEmail);

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { mobile: mobile.trim() }],
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase().trim() ? 'Email' : 'Mobile number';
      return res.status(409).json({
        success: false,
        message: `${field} is already registered`,
      });
    }

    const cooldownRemaining = await checkCooldown(email);
    if (cooldownRemaining > 0) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${cooldownRemaining} seconds before requesting a new OTP`,
      });
    }

    const canSend = await checkSendRateLimit(email);
    if (!canSend) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please try again after 10 minutes.',
      });
    }

    const otp = generateOTP();

    await storePendingSignup({ fullName, mobile, email, password }, otp);

    try {
      await sendOTPEmail(email.toLowerCase().trim(), otp, fullName.trim());
    } catch (emailError) {
      console.error('Email send error:', emailError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.',
      });
    }

    const maskedEmail = maskEmail(email);

    res.status(200).json({
      success: true,
      message: `Verification OTP sent to ${maskedEmail}`,
      data: { email: maskedEmail },
    });
  } catch (error) {
    console.error('SendOTP error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const verifyOTPHandler = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const pending = await getPendingSignup(normalizedEmail);
    if (!pending) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please sign up again.',
      });
    }

    const { attempts, exceeded } = await incrementAttempts(normalizedEmail);
    if (exceeded) {
      await deletePendingSignup(normalizedEmail);
      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts. Please sign up again.',
      });
    }

    const isValid = await verifyOTPRecord(pending.otp, otp);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${MAX_ATTEMPTS - attempts} attempts remaining.`,
      });
    }

    await deletePendingSignup(normalizedEmail);

    const user = await User.create({
      fullName: pending.fullName,
      mobile: pending.mobile,
      email: pending.email,
      password: pending.password,
    });

    const token = generateToken(user._id);

    if (isRedisReady()) {
      try {
        const redis = getRedis();
        await redis.set(`user:${user._id}:token`, token, 'EX', 15 * 24 * 60 * 60);
      } catch (err) {
        console.error('Redis cache error:', err.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          mobile: user.mobile,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error('VerifyOTP error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const cooldownRemaining = await checkCooldown(normalizedEmail);
    if (cooldownRemaining > 0) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${cooldownRemaining} seconds before requesting a new OTP`,
      });
    }

    const canSend = await checkSendRateLimit(normalizedEmail);
    if (!canSend) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please try again after 10 minutes.',
      });
    }

    const pending = await getPendingSignup(normalizedEmail);
    if (!pending) {
      return res.status(400).json({
        success: false,
        message: 'Session expired. Please sign up again.',
      });
    }

    const otp = generateOTP();

    await storePendingSignup(
      {
        fullName: pending.fullName,
        mobile: pending.mobile,
        email: pending.email,
        password: pending.password,
      },
      otp,
    );

    try {
      await sendOTPEmail(normalizedEmail, otp, pending.fullName);
    } catch (emailError) {
      console.error('Resend email error:', emailError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to resend verification email. Please try again.',
      });
    }

    res.status(200).json({
      success: true,
      message: `New OTP sent to ${maskEmail(normalizedEmail)}`,
    });
  } catch (error) {
    console.error('ResendOTP error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

function maskEmail(email) {
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
}

export { sendOTP, verifyOTPHandler, resendOTP };
