const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");

// @route GET /api/admin/users?role=Teacher&search=ritika
// @route GET /api/admin/users?role=&search=&page=&limit=
const getUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 10 } = req.query;
  const filter = {};

  if (role && role !== "All") filter.role = role.toLowerCase();
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    users,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.max(Math.ceil(total / limitNum), 1),
    },
  });
});

// @route GET /api/admin/users/teachers — for populating "assign teacher" dropdowns
const getTeachers = asyncHandler(async (req, res) => {
  const teachers = await User.find({ role: "teacher", isActive: true })
    .select("name email")
    .sort({ name: 1 });
  res.json({ teachers,success:true });
});

// @route GET /api/admin/users/:id
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ user ,success:true});
});

// @route POST /api/admin/users — admin directly creates a teacher/admin/student account
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error("Name, email, password, and role are required");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409);
    throw new Error("An account with this email already exists");
  }

  const user = await User.create({ name, email, password, role, phone });
  res.status(201).json({ user: user.toSafeObject(), success: true });
});

// @route PATCH /api/admin/users/:id
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { name, role, phone, isActive } = req.body;
  if (name !== undefined) user.name = name;
  if (role !== undefined) user.role = role;
  if (phone !== undefined) user.phone = phone;
  if (isActive !== undefined) user.isActive = isActive;

  await user.save();
  res.json({ user: user.toSafeObject(),success:true });
});

// @route DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  await user.deleteOne();
  res.json({ message: "User deleted", success: true });
});

module.exports = {
  getUsers,
  getTeachers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
