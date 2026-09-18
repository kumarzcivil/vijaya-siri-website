import crypto from 'crypto';
import bcrypt from 'bcrypt';
import Otp from '../models/Otp.js';

const OTP_EXPIRY_MS = 2 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 60 * 1000;
const MAX_SENDS_PER_WINDOW = 3;
const SEND_WINDOW_MS = 10 * 60 * 1000;

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

async function storePendingSignup(data, otp) {
  const normalizedEmail = data.email.toLowerCase().trim();

  await Otp.deleteMany({ email: normalizedEmail });

  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  await Otp.create({
    email: normalizedEmail,
    otpHash,
    fullName: data.fullName.trim(),
    mobile: data.mobile.trim(),
    password: data.password,
    attempts: 0,
    expiresAt,
  });
}

async function getPendingSignup(email) {
  const normalizedEmail = email.toLowerCase().trim();
  const record = await Otp.findOne({
    email: normalizedEmail,
    expiresAt: { $gt: new Date() },
  }).select('+password');

  if (!record) return null;

  return {
    fullName: record.fullName,
    mobile: record.mobile,
    email: record.email,
    password: record.password,
    otp: record,
  };
}

async function deletePendingSignup(email) {
  const normalizedEmail = email.toLowerCase().trim();
  await Otp.deleteMany({ email: normalizedEmail });
}

async function incrementAttempts(email) {
  const normalizedEmail = email.toLowerCase().trim();
  const record = await Otp.findOne({
    email: normalizedEmail,
    expiresAt: { $gt: new Date() },
  });

  if (!record) return { attempts: MAX_ATTEMPTS, exceeded: true };

  record.attempts += 1;
  await record.save({ validateBeforeSave: false });

  return { attempts: record.attempts, exceeded: record.attempts >= MAX_ATTEMPTS };
}

async function checkCooldown(email) {
  const normalizedEmail = email.toLowerCase().trim();
  const cutoff = new Date(Date.now() - COOLDOWN_MS);
  const recent = await Otp.findOne({
    email: normalizedEmail,
    createdAt: { $gt: cutoff },
  }).sort({ createdAt: -1 });

  if (!recent) return 0;

  const elapsed = Date.now() - recent.createdAt.getTime();
  const remaining = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
  return remaining > 0 ? remaining : 0;
}

async function checkSendRateLimit(email) {
  const normalizedEmail = email.toLowerCase().trim();
  const windowStart = new Date(Date.now() - SEND_WINDOW_MS);
  const sendCount = await Otp.countDocuments({
    email: normalizedEmail,
    createdAt: { $gt: windowStart },
  });
  return sendCount < MAX_SENDS_PER_WINDOW;
}

async function verifyOTPRecord(otpRecord, inputOTP) {
  return otpRecord.verifyOTP(inputOTP.trim());
}

export {
  generateOTP,
  storePendingSignup,
  getPendingSignup,
  deletePendingSignup,
  incrementAttempts,
  checkCooldown,
  checkSendRateLimit,
  verifyOTPRecord,
  OTP_EXPIRY_MS,
  MAX_ATTEMPTS,
  COOLDOWN_MS,
  MAX_SENDS_PER_WINDOW,
  SEND_WINDOW_MS,
};
