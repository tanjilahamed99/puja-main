const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcryptjs/dist/bcrypt");

// @route POST /api/auth/register  (public self-registration — always creates a student)
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409);
    throw new Error("An account with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: "student",
  });

  const payload = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  res.status(201).json({
    user: user.toSafeObject(),
    token: generateToken(payload),
    success: true,
  });
});

// @route POST /api/auth/login  (any role)
const login = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    const passwordMatched = await bcrypt.compare(password, user.password);

    if (!passwordMatched) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    const payload = {
      _id: user._id,
      name: user.name,
      role: user.role,
      email: user.email,
    };

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: generateToken(payload),
      user: payload,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
});

// @route GET /api/auth/me  (any logged-in role)
const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

module.exports = { register, login, getMe };
