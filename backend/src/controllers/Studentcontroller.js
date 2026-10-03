const asyncHandler = require("../utils/asyncHandler");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Payment = require("../models/Payment");
const FreeClass = require("../models/FreeClass");
const FreeClassParticipant = require("../models/FreeClassParticipant");
const Donation = require("../models/Donation");
const SpecificPujaPackage = require("../models/SpecificPujaPackage");
const SpecificPujaBooking = require("../models/SpecificPujaBooking");
const Certificate = require("../models/Certificate");
const { createLiveKitToken } = require("../utils/livekit");
const { evaluateJoinability } = require("../utils/pujaSession");
const { evaluateFreeClassJoinability } = require("../utils/freeClassSession");
const { evaluateCourseJoinability } = require("../utils/courseSession");

// @route GET /api/student/courses — browse active courses
exports.browseCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ status: "active" })
    .populate("teacher", "name")
    .sort({ createdAt: -1 });

  res.json({ courses });
});

// @route GET /api/student/enrollments
exports.getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .populate({
      path: "course",
      populate: { path: "teacher", select: "name" },
    })
    .populate("certificate")
    .sort({ createdAt: -1 });

  const enriched = enrollments.map((e) => {
    if (!e.course) return e.toObject();
    const j = evaluateCourseJoinability(e.course);
    return {
      ...e.toObject(),
      joinability: {
        canJoin: j.canJoin,
        reason: j.reason || null,
        opensAt: j.opensAt,
        closesAt: j.closesAt,
        nextStart: j.nextStart || null,
      },
    };
  });

  res.json({ enrollments: enriched });
});

// @route POST /api/student/courses/:id/enroll
exports.enrollInCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOne({
    _id: req.params.id,
    status: "active",
  });
  if (!course) {
    res.status(404);
    throw new Error("Course not found or not currently available");
  }

  const existing = await Enrollment.findOne({
    student: req.user._id,
    course: course._id,
    status: { $ne: "cancelled" },
  });
  if (existing) {
    res.status(409);
    throw new Error("You are already enrolled in this course");
  }

  const { method, gatewayRef } = req.body;
  if (!method) {
    res.status(400);
    throw new Error("Payment method is required");
  }

  const payment = await Payment.create({
    user: req.user._id,
    type: "subscription",
    course: course._id,
    amount: course.price,
    method,
    gatewayRef,
    status: "success",
  });

  const enrollment = await Enrollment.create({
    student: req.user._id,
    course: course._id,
    payment: payment._id,
    status: "active",
    startDate: new Date(),
  });

  res.status(201).json({ enrollment, payment });
});

// @route GET /api/student/courses/:id — single course detail (must be enrolled)
exports.getMyCourse = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.id,
    status: { $ne: "cancelled" },
  }).populate({
    path: "course",
    populate: { path: "teacher", select: "name email" },
  });

  if (!enrollment || !enrollment.course) {
    res.status(404);
    throw new Error("Course not found or you are not enrolled");
  }

  const j = evaluateCourseJoinability(enrollment.course);

  res.json({
    course: enrollment.course,
    enrollment,
    joinability: {
      canJoin: j.canJoin,
      reason: j.reason || null,
      opensAt: j.opensAt,
      closesAt: j.closesAt,
      nextStart: j.nextStart || null,
    },
  });
});

// @route GET /api/student/courses/:id/livekit-token
exports.getCourseLiveKitToken = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ _id: req.params.id, status: "active" });
  if (!course) {
    res.status(404);
    throw new Error("Course not found or not currently available");
  }

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: course._id,
    status: { $ne: "cancelled" },
  });
  if (!enrollment) {
    res.status(403);
    throw new Error("You are not enrolled in this course");
  }

  const j = evaluateCourseJoinability(course);
  if (!j.canJoin) {
    res.status(403);
    throw new Error(j.reason || "The class is not open right now");
  }

  const token = await createLiveKitToken({
    roomName: course.liveKitRoomId,
    identity: String(req.user._id),
    name: req.user.name,
    roomAdmin: false,
  });

  enrollment.lastJoinedAt = new Date();
  await enrollment.save();

  res.json({
    token,
    roomName: course.liveKitRoomId,
    serverUrl: process.env.LIVEKIT_URL,
    opensAt: j.opensAt,
    closesAt: j.closesAt,
    nextStart: j.nextStart,
  });
});

exports.getFreeClassLiveKitToken = asyncHandler(async (req, res) => {
  const freeClass = await FreeClass.findById(req.params.id);
  if (!freeClass) {
    res.status(404);
    throw new Error("Free class not found");
  }

  if (!freeClass.liveKitRoomId) {
    res.status(400);
    throw new Error("This class does not have a session room yet");
  }

  const JOIN_WINDOW_MS = 5 * 60 * 1000;
  const opensAt = new Date(freeClass.dateTime).getTime() - JOIN_WINDOW_MS;
  if (Date.now() < opensAt) {
    res.status(403);
    throw new Error("This class is not open to join yet");
  }

  const token = await createLiveKitToken({
    roomName: freeClass.liveKitRoomId,
    identity: String(req.user._id),
    name: req.user.name,
  });

  res.json({
    token,
    roomName: freeClass.liveKitRoomId,
    serverUrl: process.env.LIVEKIT_URL,
  });
});

// ---------------- Free classes ----------------

// @route POST /api/student/free-classes/:id/donate
// body: { amount, method: 'paypal' | 'phonepe', gatewayRef }
exports.donateToFreeClass = asyncHandler(async (req, res) => {
  const freeClass = await FreeClass.findById(req.params.id);
  if (!freeClass) {
    res.status(404);
    throw new Error("Free class not found");
  }

  const { amount, method, gatewayRef } = req.body;
  if (!amount || !method) {
    res.status(400);
    throw new Error("Amount and payment method are required");
  }

  const donation = await Donation.create({
    user: req.user._id,
    freeClass: freeClass._id,
    amount,
    method,
    gatewayRef,
    status: "success",
  });

  res.status(201).json({ donation });
});

// @route GET /api/student/free-classes
exports.browseFreeClasses = asyncHandler(async (req, res) => {
  const freeClasses = await FreeClass.find({
    status: { $in: ["scheduled", "live"] },
  })
    .populate("teacher", "name")
    .sort({ dateTime: 1 });

  const enriched = freeClasses.map((fc) => {
    const j = evaluateFreeClassJoinability(fc);
    return {
      ...fc.toObject(),
      joinability: {
        canJoin: j.canJoin,
        reason: j.reason || null,
        opensAt: j.opensAt,
        closesAt: j.closesAt,
      },
    };
  });

  res.json({ freeClasses: enriched });
});

// @route GET /api/student/free-classes/:id
exports.getFreeClass = asyncHandler(async (req, res) => {
  const fc = await FreeClass.findById(req.params.id).populate(
    "teacher",
    "name",
  );
  if (!fc) {
    res.status(404);
    throw new Error("Free class not found");
  }

  const j = evaluateFreeClassJoinability(fc);

  res.json({
    freeClass: fc,
    joinability: {
      canJoin: j.canJoin,
      reason: j.reason || null,
      opensAt: j.opensAt,
      closesAt: j.closesAt,
    },
  });
});

// @route POST /api/student/free-classes/:id/join
// Records (or updates) this user's participation. Idempotent on rejoin.
exports.joinFreeClass = asyncHandler(async (req, res) => {
  const freeClass = await FreeClass.findById(req.params.id);
  if (!freeClass) {
    res.status(404);
    throw new Error("Free class not found");
  }

  const j = evaluateFreeClassJoinability(freeClass);
  if (!j.canJoin) {
    res.status(403);
    throw new Error(j.reason || "The class is not open yet");
  }

  const participant = await FreeClassParticipant.findOneAndUpdate(
    { freeClass: freeClass._id, user: req.user._id },
    {
      $set: { lastJoinedAt: new Date(), leftAt: null },
      $inc: { joinCount: 1 },
      $setOnInsert: { joinedAt: new Date() },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  res.status(201).json({
    participant,
    liveKitRoomId: freeClass.liveKitRoomId,
  });
});

// @route GET /api/student/free-classes/:id/livekit-token
exports.getFreeClassLiveKitToken = asyncHandler(async (req, res) => {
  const freeClass = await FreeClass.findById(req.params.id);
  if (!freeClass) {
    res.status(404);
    throw new Error("Free class not found");
  }

  const j = evaluateFreeClassJoinability(freeClass);
  if (!j.canJoin) {
    res.status(403);
    throw new Error(j.reason || "The class is not open yet");
  }

  // Ensure a participant record exists — so a user can't join without
  // appearing in the admin's attendance list.
  await FreeClassParticipant.findOneAndUpdate(
    { freeClass: freeClass._id, user: req.user._id },
    {
      $set: { lastJoinedAt: new Date(), leftAt: null },
      $inc: { joinCount: 1 },
      $setOnInsert: { joinedAt: new Date() },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const token = await createLiveKitToken({
    roomName: freeClass.liveKitRoomId,
    identity: String(req.user._id),
    name: req.user.name,
    roomAdmin: false,
  });

  res.json({
    token,
    roomName: freeClass.liveKitRoomId,
    serverUrl: process.env.LIVEKIT_URL,
    opensAt: j.opensAt,
    closesAt: j.closesAt,
  });
});

// ---------------- Specific puja ----------------

// @route GET /api/student/specific-puja/packages
exports.browsePujaPackages = asyncHandler(async (req, res) => {
  const packages = await SpecificPujaPackage.find({ status: "active" })
    .populate("teacher", "name")
    .sort({ createdAt: -1 });
  res.json({ packages });
});

// @route POST /api/student/specific-puja/packages/:id/book
// body: { method, gatewayRef, participantInfo, preferredDateTime }
exports.bookPujaPackage = asyncHandler(async (req, res) => {
  const pkg = await SpecificPujaPackage.findOne({
    _id: req.params.id,
    status: "active",
  });
  if (!pkg) {
    res.status(404);
    throw new Error("Puja package not found or not currently available");
  }

  const { method, gatewayRef, participantInfo, preferredDateTime } = req.body;

  if (!method) {
    res.status(400);
    throw new Error("Payment method is required");
  }
  if (!preferredDateTime) {
    res.status(400);
    throw new Error("Please choose a date and time for your puja");
  }

  // ---- Validate the preferred datetime ----
  const proposed = new Date(preferredDateTime);
  if (isNaN(proposed.getTime())) {
    res.status(400);
    throw new Error("Invalid date/time provided");
  }

  const now = Date.now();
  const minTime = now + (pkg.minLeadTimeHours ?? 24) * 60 * 60 * 1000;
  const maxTime = now + (pkg.maxLeadTimeDays ?? 60) * 24 * 60 * 60 * 1000;

  if (proposed.getTime() < minTime) {
    res.status(400);
    throw new Error(
      `Please choose a time at least ${pkg.minLeadTimeHours ?? 24} hours from now`,
    );
  }
  if (proposed.getTime() > maxTime) {
    res.status(400);
    throw new Error(
      `Please choose a time within the next ${pkg.maxLeadTimeDays ?? 60} days`,
    );
  }

  // ---- Prevent double-booking the same teacher in an overlapping window ----
  if (pkg.teacher) {
    const duration = pkg.durationMinutes || 60;
    const windowStart = new Date(proposed.getTime() - duration * 60 * 1000);
    const windowEnd = new Date(proposed.getTime() + duration * 60 * 1000);

    const conflict = await SpecificPujaBooking.findOne({
      package: {
        $in: await SpecificPujaPackage.find({ teacher: pkg.teacher }).distinct(
          "_id",
        ),
      },
      status: { $in: ["pending", "confirmed"] },
      scheduledDateTime: { $gt: windowStart, $lt: windowEnd },
    });
    if (conflict) {
      res.status(409);
      throw new Error("That time slot is already booked. Please pick another.");
    }
  }

  // ---- Payment (unchanged — still assumes gateway confirmed client-side) ----
  const payment = await Payment.create({
    user: req.user._id,
    type: "specificPuja",
    amount: pkg.price,
    method,
    gatewayRef,
    status: "success",
  });

  // ---- Booking ----
  const booking = await SpecificPujaBooking.create({
    package: pkg._id,
    user: req.user._id,
    payment: payment._id,
    participantInfo,
    proposedDateTime: proposed,
    scheduledDateTime: proposed, // mirror until admin confirms
    durationMinutes: pkg.durationMinutes || 60,
    status: "pending", // admin confirms later
  });

  payment.pujaBooking = booking._id;
  await payment.save();

  res.status(201).json({ booking, payment });
});

// @route GET /api/student/specific-puja/bookings/:id
exports.getMyPujaBooking = asyncHandler(async (req, res) => {
  const booking = await SpecificPujaBooking.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate("package", "name description price durationMinutes teacher");

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  const joinability = evaluateJoinability(booking);

  res.json({
    booking,
    joinability: {
      canJoin: joinability.canJoin,
      reason: joinability.reason || null,
      opensAt: joinability.opensAt,
      closesAt: joinability.closesAt,
    },
  });
});

// @route GET /api/student/specific-puja/bookings/:id/livekit-token
exports.getPujaBookingLiveKitToken = asyncHandler(async (req, res) => {
  const booking = await SpecificPujaBooking.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  const joinability = evaluateJoinability(booking);
  if (!joinability.canJoin) {
    res.status(403);
    throw new Error(joinability.reason || "The session is not open yet");
  }

  const token = await createLiveKitToken({
    roomName: booking.liveKitRoomId,
    identity: String(req.user._id),
    name: req.user.name,
    roomAdmin: false,
  });

  res.json({
    token,
    roomName: booking.liveKitRoomId,
    serverUrl: process.env.LIVEKIT_URL,
    opensAt: joinability.opensAt,
    closesAt: joinability.closesAt,
  });
});

// @route GET /api/student/specific-puja/packages/:id/slots
// Returns available hourly slots for the next N days, excluding conflicts.
exports.getPujaPackageSlots = asyncHandler(async (req, res) => {
  const pkg = await SpecificPujaPackage.findOne({
    _id: req.params.id,
    status: "active",
  });
  if (!pkg) {
    res.status(404);
    throw new Error("Puja package not found");
  }

  const duration = pkg.durationMinutes || 60;
  const stepMinutes = 60; // hour-by-hour slots
  const days = Math.min(pkg.maxLeadTimeDays ?? 60, 30);
  const leadHours = pkg.minLeadTimeHours ?? 24;

  // Pull existing bookings for this teacher's packages in the window
  const pkgIds = await SpecificPujaPackage.find({
    teacher: pkg.teacher,
  }).distinct("_id");
  const windowStart = new Date(Date.now() + leadHours * 3600 * 1000);
  const windowEnd = new Date(Date.now() + days * 24 * 3600 * 1000);

  const busy = await SpecificPujaBooking.find({
    package: { $in: pkgIds },
    status: { $in: ["pending", "confirmed"] },
    scheduledDateTime: { $gte: windowStart, $lte: windowEnd },
  })
    .select("scheduledDateTime durationMinutes")
    .lean();

  const busyWindows = busy.map((b) => ({
    start: new Date(b.scheduledDateTime).getTime(),
    end:
      new Date(b.scheduledDateTime).getTime() +
      (b.durationMinutes || 60) * 60_000,
  }));

  // Build slot list
  const slots = [];
  for (
    let d = new Date(windowStart);
    d <= windowEnd;
    d.setDate(d.getDate() + 1)
  ) {
    // Skip disallowed days if preferredDays is set
    if (pkg.preferredDays?.length && !pkg.preferredDays.includes(d.getDay()))
      continue;

    // Simple 8 AM – 8 PM local window (adjust using pkg.timezone if needed)
    for (let hour = 8; hour <= 20; hour += stepMinutes / 60) {
      const slotStart = new Date(d);
      slotStart.setHours(hour, 0, 0, 0);
      if (slotStart.getTime() < windowStart.getTime()) continue;

      const slotEnd = slotStart.getTime() + duration * 60_000;
      const overlaps = busyWindows.some(
        (w) => slotStart.getTime() < w.end && slotEnd > w.start,
      );
      if (overlaps) continue;

      slots.push(slotStart.toISOString());
    }
  }

  res.json({ slots, timezone: pkg.timezone, durationMinutes: duration });
});

// ---------------- Certificates ----------------

// @route GET /api/student/certificates
exports.getMyCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({ student: req.user._id })
    .populate("course", "title")
    .sort({ issuedAt: -1 });
  res.json({ certificates });
});
