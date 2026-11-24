const asyncHandler = require("../utils/asyncHandler");
const makeRoomId = require("../utils/makeRoomId");
const SpecificPujaPackage = require("../models/SpecificPujaPackage");
const SpecificPujaBooking = require("../models/SpecificPujaBooking");
const User = require("../models/User");

/* ─────────────── helpers ─────────────── */

function clampInt(v, def, min = 1, max = 100) {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return def;
  return Math.min(max, Math.max(min, n));
}

/* ─────────────── Packages ─────────────── */

// @route GET /api/admin/specific-puja/packages
// Supports: ?page=&limit=&search=&status=
const getPackages = asyncHandler(async (req, res) => {
  const { search, status } = req.query;
  const page = clampInt(req.query.page, 1, 1, 10_000);
  const limit = clampInt(req.query.limit, 20, 1, 100);

  const match = {};
  if (status) match.status = status;
  if (search) match.name = new RegExp(search.trim(), "i");

  const [items, total] = await Promise.all([
    SpecificPujaPackage.find(match)
      .populate("teacher", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    SpecificPujaPackage.countDocuments(match),
  ]);

  // `packages` kept for backward compatibility; `items` is the paginated shape
  res.json({ items, total, page, limit, packages: items });
});

const createPackage = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    teacher,
    requiredInfoFields,
    durationMinutes,
    minLeadTimeHours,
    maxLeadTimeDays,
    timezone,
    availabilityNote,
    preferredDays,
    status,
  } = req.body;

  if (!name || price === undefined) {
    res.status(400);
    throw new Error("Name and price are required");
  }

  const pkg = await SpecificPujaPackage.create({
    name,
    description,
    price,
    teacher: teacher || undefined,
    requiredInfoFields,
    durationMinutes,
    minLeadTimeHours,
    maxLeadTimeDays,
    timezone,
    availabilityNote,
    preferredDays,
    status: status || "draft",
  });

  res.status(201).json({ package: pkg });
});

const updatePackage = asyncHandler(async (req, res) => {
  const pkg = await SpecificPujaPackage.findById(req.params.id);
  if (!pkg) {
    res.status(404);
    throw new Error("Puja package not found");
  }

  [
    "name",
    "description",
    "price",
    "teacher",
    "requiredInfoFields",
    "durationMinutes",
    "minLeadTimeHours",
    "maxLeadTimeDays",
    "timezone",
    "availabilityNote",
    "preferredDays",
    "status",
  ].forEach((field) => {
    if (req.body[field] !== undefined) pkg[field] = req.body[field];
  });

  await pkg.save();
  res.json({ package: pkg });
});

// @route DELETE /api/admin/specific-puja/packages/:id
const deletePackage = asyncHandler(async (req, res) => {
  const pkg = await SpecificPujaPackage.findById(req.params.id);
  if (!pkg) {
    res.status(404);
    throw new Error("Puja package not found");
  }
  await pkg.deleteOne();
  res.json({ message: "Puja package deleted" });
});

/* ─────────────── Bookings ─────────────── */

// @route GET /api/admin/specific-puja/bookings
// Supports: ?page=&limit=&search=&status=
const getBookings = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const page = clampInt(req.query.page, 1, 1, 10_000);
  const limit = clampInt(req.query.limit, 20, 1, 100);

  const match = {};
  if (status) match.status = status;

  if (search) {
    const rx = new RegExp(search.trim(), "i");
    const users = await User.find(
      { $or: [{ name: rx }, { email: rx }] },
      { _id: 1 },
    ).limit(1000);
    const ids = users.map((u) => u._id);
    if (ids.length) {
      match.user = { $in: ids };
    } else {
      // No user matched — force empty, since search is only on user name/email
      match._id = { $in: [] };
    }
  }

  const [items, total] = await Promise.all([
    SpecificPujaBooking.find(match)
      .populate("package", "name price durationMinutes")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    SpecificPujaBooking.countDocuments(match),
  ]);

  res.json({ items, total, page, limit, bookings: items });
});

const updateBooking = asyncHandler(async (req, res) => {
  const booking = await SpecificPujaBooking.findById(req.params.id).populate(
    "package",
  );
  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  const { status, confirmedDateTime, scheduledDateTime, reason } = req.body;

  // ---- Handle datetime change (either via confirmedDateTime or scheduledDateTime) ----
  const incomingDateTime = confirmedDateTime || scheduledDateTime;

  if (incomingDateTime !== undefined) {
    const dt = new Date(incomingDateTime);
    if (isNaN(dt.getTime())) {
      res.status(400);
      throw new Error("Invalid date/time provided");
    }

    const duration =
      booking.durationMinutes || booking.package?.durationMinutes || 60;

    // Conflict check against the same teacher's other active bookings
    if (booking.package?.teacher) {
      const sameTeacherPkgIds = await SpecificPujaPackage.find({
        teacher: booking.package.teacher,
      }).distinct("_id");

      const windowStart = new Date(dt.getTime() - duration * 60_000);
      const windowEnd = new Date(dt.getTime() + duration * 60_000);

      const conflict = await SpecificPujaBooking.findOne({
        _id: { $ne: booking._id },
        package: { $in: sameTeacherPkgIds },
        status: { $in: ["pending", "confirmed"] },
        scheduledDateTime: { $gt: windowStart, $lt: windowEnd },
      });

      if (conflict) {
        res.status(409);
        throw new Error(
          "That time slot overlaps another booking for this priest. Pick another time.",
        );
      }
    }

    // Record reschedule history if time actually changed
    const previous = booking.confirmedDateTime || booking.scheduledDateTime;
    if (previous && previous.getTime() !== dt.getTime()) {
      booking.rescheduleHistory = booking.rescheduleHistory || [];
      booking.rescheduleHistory.push({
        fromDateTime: previous,
        toDateTime: dt,
        byRole: "admin",
        reason: reason || undefined,
      });
    }

    booking.confirmedDateTime = dt;
    booking.scheduledDateTime = dt;
  }

  // ---- Handle status change ----
  if (status !== undefined) {
    const allowed = ["pending", "confirmed", "completed", "cancelled"];
    if (!allowed.includes(status)) {
      res.status(400);
      throw new Error(`Invalid status: ${status}`);
    }

    // Guard: cannot confirm without a scheduled time
    if (
      status === "confirmed" &&
      !booking.confirmedDateTime &&
      !booking.scheduledDateTime
    ) {
      res.status(400);
      throw new Error("Set a date/time before confirming this booking.");
    }

    booking.status = status;

    if (status === "confirmed") {
      booking.confirmedBy = req.user._id;
      booking.confirmedAt = new Date();
      if (!booking.liveKitRoomId) {
        booking.liveKitRoomId = makeRoomId("puja");
      }
    }
  }

  await booking.save();
  res.json({ booking });
});

module.exports = {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
  getBookings,
  updateBooking,
};
