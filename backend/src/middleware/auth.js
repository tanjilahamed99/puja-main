const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

// Verifies the JWT sent as "Authorization: Bearer <token>" and attaches
// the matching user document to req.user.
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized — no token provided');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    res.status(401);
    throw new Error('Not authorized — invalid or expired token');
  }

  const user = await User.findById(decoded._id);
  if (!user || !user.isActive) {
    res.status(401);
    throw new Error('Not authorized — account not found or deactivated');
  }

  req.user = user;
  next();
});

// Usage: authorize('admin') or authorize('admin', 'teacher')
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    throw new Error(
      `Role '${req.user ? req.user.role : 'guest'}' is not permitted to access this resource`
    );
  }
  next();
};

module.exports = { protect, authorize };
