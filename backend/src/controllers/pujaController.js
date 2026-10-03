const asyncHandler = require("../utils/asyncHandler");
const makeRoomId = require("../utils/makeRoomId");
const SpecificPujaPackage = require("../models/SpecificPujaPackage");
const SpecificPujaBooking = require("../models/SpecificPujaBooking");

// ---- Packages ----

// @route GET /api/admin/specific-puja/packages
const getPackages = asyncHandler(async (req, res) => {
  const packages = await SpecificPujaPackage.find()
    .populate("teacher", "name email")
    .sort({ createdAt: -1 });
  res.json({ packages });
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

const getBookings = asyncHandler(async (req, res) => {
  const bookings = await SpecificPujaBooking.find()
    .populate("package", "name price")
    .populate("user", "name email")
    .sort({ createdAt: -1 });
  res.json({ bookings });
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
