const asyncHandler = require("../utils/asyncHandler");
const Payment = require("../models/Payment");
const Donation = require("../models/Donation");
const User = require("../models/User");

/* ─────────── helpers ─────────── */

function buildDateMatch(query) {
  const { from, to } = query;
  if (!from && !to) return null;
  const range = {};
  if (from) range.$gte = new Date(from);
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    range.$lte = end;
  }
  return range;
}

function clampInt(v, def, min = 1, max = 100) {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return def;
  return Math.min(max, Math.max(min, n));
}

/**
 * Resolve `search` → array of user _ids whose name/email matches.
 * Keeps user filter server-side without needing denormalized fields.
 */
async function resolveUserIds(search) {
  if (!search) return null;
  const rx = new RegExp(search.trim(), "i");
  const users = await User.find(
    { $or: [{ name: rx }, { email: rx }] },
    { _id: 1 },
  ).limit(1000);
  return users.map((u) => u._id);
}

/* ─────────── GET /api/admin/payments ─────────── */
const getPayments = asyncHandler(async (req, res) => {
  const { type, status, method, from, to, search } = req.query;
  const page = clampInt(req.query.page, 1, 1, 10_000);
  const limit = clampInt(req.query.limit, 20, 1, 100);

  const match = {};
  if (type) match.type = type; // subscription | specificPuja
  if (status) match.status = status; // success | pending | failed
  if (method) match.method = method; // paypal | phonepe

  const dateRange = buildDateMatch(req.query);
  if (dateRange) match.createdAt = dateRange;

  if (search) {
    const userIds = await resolveUserIds(search);
    if (userIds && userIds.length) {
      match.user = { $in: userIds };
    } else {
      // No user match → still allow item text search on course title.
      // Fallback: return only payments with no user filter, but narrow by populated title
      // is expensive; simplest is to return empty when user search misses AND no other criteria.
      // But we want to also match course title. So we do a second pass below via populate.
      // To keep it simple + fast: only fall back to title match via regex on course.
      // We'll query courses by title and match courseId.
      const Course = require("../models/Course");
      const rx = new RegExp(search.trim(), "i");
      const courses = await Course.find({ title: rx }, { _id: 1 }).limit(500);
      const courseIds = courses.map((c) => c._id);
      if (courseIds.length) {
        match.course = { $in: courseIds };
      } else {
        // Nothing matched → force empty result
        match._id = { $in: [] };
      }
    }
  }

  const [items, total] = await Promise.all([
    Payment.find(match)
      .populate("user", "name email")
      .populate("course", "title")
      .populate({
        path: "pujaBooking",
        populate: { path: "package", select: "name" },
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Payment.countDocuments(match),
  ]);

  res.json({ items, total, page, limit });
});

/* ─────────── GET /api/admin/payments/donations ─────────── */
const getDonations = asyncHandler(async (req, res) => {
  const { status, method, from, to, search } = req.query;
  const page = clampInt(req.query.page, 1, 1, 10_000);
  const limit = clampInt(req.query.limit, 20, 1, 100);

  const match = {};
  if (status) match.status = status;
  if (method) match.method = method;

  const dateRange = buildDateMatch(req.query);
  if (dateRange) match.createdAt = dateRange;

  if (search) {
    const userIds = await resolveUserIds(search);
    if (userIds && userIds.length) {
      match.user = { $in: userIds };
    } else {
      const FreeClass = require("../models/FreeClass");
      const rx = new RegExp(search.trim(), "i");
      const classes = await FreeClass.find({ title: rx }, { _id: 1 }).limit(
        500,
      );
      const classIds = classes.map((c) => c._id);
      if (classIds.length) {
        match.freeClass = { $in: classIds };
      } else {
        match._id = { $in: [] };
      }
    }
  }

  const [items, total] = await Promise.all([
    Donation.find(match)
      .populate("user", "name email")
      .populate("freeClass", "title")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Donation.countDocuments(match),
  ]);

  res.json({ items, total, page, limit });
});

/* ─────────── GET /api/admin/payments/summary ─────────── */
const getPaymentSummary = asyncHandler(async (req, res) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [courseRevenue, pujaRevenue, donationTotal] = await Promise.all([
    Payment.aggregate([
      {
        $match: {
          type: "subscription",
          status: "success",
          createdAt: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Payment.aggregate([
      {
        $match: {
          type: "specificPuja",
          status: "success",
          createdAt: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Donation.aggregate([
      { $match: { status: "success", createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  res.json({
    courseRevenue: courseRevenue[0]?.total || 0,
    pujaRevenue: pujaRevenue[0]?.total || 0,
    donationTotal: donationTotal[0]?.total || 0,
  });
});

module.exports = { getPayments, getDonations, getPaymentSummary };
