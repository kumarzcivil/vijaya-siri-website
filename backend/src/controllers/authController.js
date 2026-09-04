import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { getRedis } from "../config/redis.js";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const signup = async (req, res) => {
  try {
    const { fullName, mobile, email, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? "Email" : "Mobile number";
      return res.status(409).json({
        success: false,
        message: `${field} is already registered`,
      });
    }

    const user = await User.create({
      fullName,
      mobile,
      email,
      password,
    });

    const token = generateToken(user._id);

    try {
      const redis = getRedis();
      await redis.set(`user:${user._id}:token`, token, "EX", 15 * 24 * 60 * 60);
    } catch (err) {
      console.error("Redis cache error:", err.message);
    }

    res.status(201).json({
      success: true,
      message: "Account created successfully",
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
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Please contact support.",
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    try {
      const redis = getRedis();
      await redis.set(`user:${user._id}:token`, token, "EX", 7 * 24 * 60 * 60);
    } catch (err) {
      console.error("Redis cache error:", err.message);
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          mobile: user.mobile,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          mobile: user.mobile,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { fullName, mobile, email } = req.body;
    const userId = req.user._id;

    if (mobile && mobile !== req.user.mobile) {
      const existing = await User.findOne({ mobile, _id: { $ne: userId } });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Mobile number is already in use' });
      }
    }

    if (email && email !== req.user.email) {
      const existing = await User.findOne({ email, _id: { $ne: userId } });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email is already in use' });
      }
    }

    const user = await User.findById(userId);
    if (fullName) user.fullName = fullName.trim();
    if (mobile) user.mobile = mobile.trim();
    if (email) user.email = email.trim();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          mobile: user.mobile,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export { signup, login, getMe, updateProfile };
