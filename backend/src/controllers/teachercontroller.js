const asyncHandler = require("../utils/asyncHandler");
const { createLiveKitToken } = require("../utils/livekit");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Attendance = require("../models/Attendance");
const FreeClass = require("../models/FreeClass");
const SpecificPujaPackage = require("../models/SpecificPujaPackage");
const SpecificPujaBooking = require("../models/SpecificPujaBooking");
const { evaluateFreeClassJoinability } = require("../utils/freeClassSession");
const { evaluateJoinability } = require("../utils/pujaSession");
const { evaluateCourseJoinability } = require("../utils/courseSession");

const sendEmail = require("../utils/mailer");
const makeRoomId = require("../utils/makeRoomId");

function clampInt(v, def, min = 1, max = 100) {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return def;
  return Math.min(max, Math.max(min, n));
}

// @route GET /api/teacher/courses
exports.getMyCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ teacher: req.user._id }).sort({
    createdAt: -1,
  });

  const enriched = await Promise.all(
    courses.map(async (course) => {
      const studentCount = await Enrollment.countDocuments({
        course: course._id,
        status: { $ne: "cancelled" },
      });

      const j = evaluateCourseJoinability(course);

      return {
        ...course.toObject(),
        studentCount,
        joinability: {
          canJoin: j.canJoin,
          reason: j.reason || null,
          opensAt: j.opensAt,
          closesAt: j.closesAt,
          nextStart: j.nextStart || null,
        },
      };
    }),
  );

  res.json({ courses: enriched });
});

// @route GET /api/teacher/courses/:id/enrollments
exports.getCourseEnrollments = asyncHandler(async (req, res) => {
  const course = await Course.findOne({
    _id: req.params.id,
    teacher: req.user._id,
  });
  if (!course) {
    res.status(404);
    throw new Error("Course not found or not assigned to you");
  }

  const enrollments = await Enrollment.find({
    course: course._id,
    status: { $ne: "cancelled" },
  })
    .populate("student", "name email")
    .sort({ createdAt: -1 });

  res.json({ enrollments });
});

// @route GET /api/teacher/courses/:id/livekit-token
exports.getCourseLiveKitToken = asyncHandler(async (req, res) => {
  const course = await Course.findOne({
    _id: req.params.id,
    teacher: req.user._id,
  });
  if (!course) {
    res.status(404);
    throw new Error("Course not found or not assigned to you");
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
    roomAdmin: true,
  });

  res.json({
    token,
    roomName: course.liveKitRoomId,
    serverUrl: process.env.LIVEKIT_URL,
    opensAt: j.opensAt,
    closesAt: j.closesAt,
    nextStart: j.nextStart,
  });
});

// @route POST /api/teacher/courses/:id/attendance
exports.markAttendance = asyncHandler(async (req, res) => {
  const course = await Course.findOne({
    _id: req.params.id,
    teacher: req.user._id,
  });
  if (!course) {
    res.status(404);
    throw new Error("Course not found or not assigned to you");
  }

  const { date, records } = req.body;
  if (!date || !Array.isArray(records) || records.length === 0) {
    res.status(400);
    throw new Error("date and a non-empty records array are required");
  }

  const attendanceDate = new Date(date);

  const results = await Promise.all(
    records.map(({ student, status }) =>
      Attendance.findOneAndUpdate(
        { course: course._id, student, date: attendanceDate },
        { status, markedBy: req.user._id },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ),
    ),
  );

  res.json({ attendance: results });
});

// @route GET /api/teacher/courses/:id/attendance?date=2026-09-22
exports.getAttendance = asyncHandler(async (req, res) => {
  const course = await Course.findOne({
    _id: req.params.id,
    teacher: req.user._id,
  });
  if (!course) {
    res.status(404);
    throw new Error("Course not found or not assigned to you");
  }

  const filter = { course: course._id };
  if (req.query.date) filter.date = new Date(req.query.date);

  const attendance = await Attendance.find(filter)
    .populate("student", "name email")
    .sort({ date: -1 });

  res.json({ attendance });
});

// @route GET /api/teacher/courses/:id/livekit-token
exports.getCourseLiveKitToken = asyncHandler(async (req, res) => {
  const course = await Course.findOne({
    _id: req.params.id,
    teacher: req.user._id,
  });
  if (!course) {
    res.status(404);
    throw new Error("Course not found or not assigned to you");
  }

  if (!course.liveKitRoomId) {
    res.status(400);
    throw new Error("This course does not have a session room yet");
  }

  const token = await createLiveKitToken({
    roomName: course.liveKitRoomId,
    identity: String(req.user._id),
    name: req.user.name,
    roomAdmin: true,
  });

  res.json({
    token,
    roomName: course.liveKitRoomId,
    serverUrl: process.env.LIVEKIT_URL,
  });
});

/* ------------------------------ Free Classes ------------------------------ */

// @route GET /api/teacher/free-classes
exports.getMyFreeClasses = asyncHandler(async (req, res) => {
  const freeClasses = await FreeClass.find({ teacher: req.user._id }).sort({
    dateTime: -1,
  });

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

// @route POST /api/teacher/free-classes/:id/start
exports.startFreeClassSession = asyncHandler(async (req, res) => {
  const freeClass = await FreeClass.findOne({
    _id: req.params.id,
    teacher: req.user._id,
  });

  if (!freeClass) {
    res.status(404);
    throw new Error("Free class not found or not assigned to you");
  }
  if (!freeClass.liveKitRoomId) {
    res.status(400);
    throw new Error("This class does not have a session room yet");
  }
  if (freeClass.status === "completed" || freeClass.status === "cancelled") {
    res.status(400);
    throw new Error(
      `This class has already been ${freeClass.status} and can't be started`,
    );
  }

  const j = evaluateFreeClassJoinability(freeClass);
  if (!j.canJoin) {
    res.status(403);
    throw new Error(j.reason || "The class is not open yet");
  }

  if (freeClass.status !== "live") freeClass.status = "live";
  if (!freeClass.startedAt) freeClass.startedAt = new Date();
  await freeClass.save();

  const token = await createLiveKitToken({
    roomName: freeClass.liveKitRoomId,
    identity: String(req.user._id),
    name: req.user.name,
    roomAdmin: true,
  });

  res.json({
    token,
    roomName: freeClass.liveKitRoomId,
    serverUrl: process.env.LIVEKIT_URL,
    opensAt: j.opensAt,
    closesAt: j.closesAt,
    freeClass,
  });
});

// @route POST /api/teacher/free-classes/:id/end
exports.endFreeClassSession = asyncHandler(async (req, res) => {
  const freeClass = await FreeClass.findOne({
    _id: req.params.id,
    teacher: req.user._id,
  });
  if (!freeClass) {
    res.status(404);
    throw new Error("Free class not found or not assigned to you");
  }

  freeClass.status = "completed";
  freeClass.endedAt = new Date();
  await freeClass.save();

  res.json({ freeClass });
});

/* ------------------------------ Specific Puja ------------------------------ */

exports.getMyPujaBookings = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const page = clampInt(req.query.page, 1, 1, 10_000);
  const limit = clampInt(req.query.limit, 20, 1, 100);

  const myPackages = await SpecificPujaPackage.find({
    teacher: req.user._id,
  }).select("_id");
  const packageIds = myPackages.map((p) => p._id);

  const match = { package: { $in: packageIds } };
  if (status) match.status = status;

  if (search) {
    const User = require("../models/User");
    const rx = new RegExp(search.trim(), "i");
    const users = await User.find(
      { $or: [{ name: rx }, { email: rx }] },
      { _id: 1 },
    ).limit(1000);
    const ids = users.map((u) => u._id);
    if (ids.length) match.user = { $in: ids };
    else match._id = { $in: [] };
  }

  const [items, total] = await Promise.all([
    SpecificPujaBooking.find(match)
      .populate("package", "name price durationMinutes")
      .populate("user", "name email")
      .sort({ scheduledDateTime: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    SpecificPujaBooking.countDocuments(match),
  ]);

  const enriched = items.map((b) => {
    const j = evaluateJoinability(b);
    return {
      ...b.toObject(),
      joinability: {
        canJoin: j.canJoin,
        reason: j.reason || null,
        opensAt: j.opensAt,
        closesAt: j.closesAt,
      },
    };
  });

  // keep `bookings` for backward compat; `items` for paginated consumers
  res.json({ items: enriched, total, page, limit, bookings: enriched });
});

// @route GET /api/teacher/specific-puja/bookings/:id
// DETAIL — single booking. Ownership is checked via the populated package.
exports.getMyPujaBooking = asyncHandler(async (req, res) => {
  const booking = await SpecificPujaBooking.findById(req.params.id)
    .populate("package", "name description price durationMinutes teacher")
    .populate("user", "name email");

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  const teacherId = booking.package?.teacher?._id || booking.package?.teacher;

  if (!teacherId || String(teacherId) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Booking not assigned to you");
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

// @route GET /api/teacher/specific-puja/bookings/:id/livekit-token
exports.getPujaBookingLiveKitToken = asyncHandler(async (req, res) => {
  const booking = await SpecificPujaBooking.findById(req.params.id).populate(
    "package",
    "teacher name",
  );

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  const teacherId = booking.package?.teacher?._id || booking.package?.teacher;

  if (!teacherId || String(teacherId) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Booking not assigned to you");
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
    roomAdmin: true,
  });

  res.json({
    token,
    roomName: booking.liveKitRoomId,
    serverUrl: process.env.LIVEKIT_URL,
    opensAt: joinability.opensAt,
    closesAt: joinability.closesAt,
  });
});

// @route POST /api/teacher/specific-puja/bookings/:id/start
exports.startPujaBooking = asyncHandler(async (req, res) => {
  const booking = await SpecificPujaBooking.findById(req.params.id).populate(
    "package",
    "teacher",
  );

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  const teacherId = booking.package?.teacher?._id || booking.package?.teacher;

  if (!teacherId || String(teacherId) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Booking not assigned to you");
  }

  if (booking.status !== "confirmed") {
    res.status(400);
    throw new Error("Only confirmed bookings can be started");
  }

  const joinability = evaluateJoinability(booking);
  if (!joinability.canJoin) {
    res.status(403);
    throw new Error(joinability.reason || "The session is not open yet");
  }

  if (!booking.startedAt) {
    booking.startedAt = new Date();
    await booking.save();
  }

  res.json({ booking });
});

// @route GET /api/teacher/specific-puja/packages
// List packages assigned to this teacher, paginated + searchable
exports.getMyPujaPackages = asyncHandler(async (req, res) => {
  const { search, status } = req.query;
  const page = clampInt(req.query.page, 1, 1, 10_000);
  const limit = clampInt(req.query.limit, 20, 1, 100);

  const match = { teacher: req.user._id };
  if (status) match.status = status;
  if (search) match.name = new RegExp(search.trim(), "i");

  const [items, total] = await Promise.all([
    SpecificPujaPackage.find(match)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    SpecificPujaPackage.countDocuments(match),
  ]);

  res.json({ items, total, page, limit });
});

/* ------------------------------ Schedule ------------------------------ */

// @route GET /api/teacher/schedule/upcoming
exports.getUpcomingSchedule = asyncHandler(async (req, res) => {
  const now = new Date();

  const myPackageIds = (
    await SpecificPujaPackage.find({ teacher: req.user._id }).select("_id")
  ).map((p) => p._id);

  const [freeClasses, pujaBookings] = await Promise.all([
    FreeClass.find({ teacher: req.user._id, dateTime: { $gte: now } })
      .sort({ dateTime: 1 })
      .limit(10),
    SpecificPujaBooking.find({
      package: { $in: myPackageIds },
      scheduledDateTime: { $gte: now },
      status: { $in: ["pending", "confirmed"] },
    })
      .populate("package", "name")
      .populate("user", "name")
      .sort({ scheduledDateTime: 1 })
      .limit(10),
  ]);

  res.json({ freeClasses, pujaBookings });
});

/* ─────────── Puja status email helper ─────────── */

async function sendPujaStatusEmail(booking, action, opts = {}) {
  try {
    const studentEmail = booking.user?.email;
    const studentName = booking.user?.name || "Student";
    const pujaName = booking.package?.name || "Specific Puja";
    const when = new Date(
      opts.dateTime ||
        booking.confirmedDateTime ||
        booking.proposedDateTime ||
        booking.scheduledDateTime ||
        Date.now(),
    );

    if (!studentEmail) {
      console.warn(
        "[teacherController] No student email for booking",
        booking._id,
      );
      return;
    }

    const whenLabel = when.toLocaleString("en-IN", {
      timeZone: "Asia/Dhaka",
      dateStyle: "full",
      timeStyle: "short",
    });

    const subjects = {
      confirmed: `Your ${pujaName} is confirmed — ${whenLabel}`,
      rescheduled: `Your ${pujaName} has been rescheduled — ${whenLabel}`,
      cancelled: `Your ${pujaName} has been cancelled`,
      completed: `Thank you for completing ${pujaName}`,
    };

    const bodies = {
      confirmed: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#222;">
          <h2 style="color:#8B2F1B;margin:0 0 16px;">Puja Confirmed ✅</h2>
          <p>Namaste <strong>${studentName}</strong>,</p>
          <p>Your puja <strong>${pujaName}</strong> has been <strong>confirmed</strong>.</p>
          <p style="background:#F7F4EE;padding:14px;border-radius:8px;border-left:3px solid #8B2F1B;">
            <strong>Scheduled for:</strong><br/>
            ${whenLabel}
          </p>
          <p>You will be able to join the live session from your dashboard a few minutes before the scheduled time.</p>
          <p style="color:#666;font-size:13px;margin-top:24px;">
            — Karmkand Bharti
          </p>
        </div>
      `,
      rescheduled: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#222;">
          <h2 style="color:#8B2F1B;margin:0 0 16px;">Puja Rescheduled 🔄</h2>
          <p>Namaste <strong>${studentName}</strong>,</p>
          <p>Your puja <strong>${pujaName}</strong> has been <strong>rescheduled</strong>.</p>
          <p style="background:#F7F4EE;padding:14px;border-radius:8px;border-left:3px solid #8B2F1B;">
            <strong>New time:</strong><br/>
            ${whenLabel}
          </p>
          ${opts.reason ? `<p><strong>Reason:</strong> ${opts.reason}</p>` : ""}
          <p>Please check your dashboard for the updated schedule.</p>
          <p style="color:#666;font-size:13px;margin-top:24px;">
            — Karmkand Bharti
          </p>
        </div>
      `,
      cancelled: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#222;">
          <h2 style="color:#B91C1C;margin:0 0 16px;">Puja Cancelled</h2>
          <p>Namaste <strong>${studentName}</strong>,</p>
          <p>Unfortunately, your puja <strong>${pujaName}</strong> has been <strong>cancelled</strong>.</p>
          ${
            opts.reason
              ? `<p style="background:#FEF2F2;padding:14px;border-radius:8px;border-left:3px solid #B91C1C;"><strong>Reason:</strong> ${opts.reason}</p>`
              : ""
          }
          <p>If you have questions, please contact support.</p>
          <p style="color:#666;font-size:13px;margin-top:24px;">
            — Karmkand Bharti
          </p>
        </div>
      `,
      completed: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#222;">
          <h2 style="color:#047857;margin:0 0 16px;">Puja Completed 🙏</h2>
          <p>Namaste <strong>${studentName}</strong>,</p>
          <p>Your puja <strong>${pujaName}</strong> has been marked <strong>completed</strong>.</p>
          <p>Thank you for choosing Karmkand Bharti.</p>
          <p style="color:#666;font-size:13px;margin-top:24px;">
            — Karmkand Bharti
          </p>
        </div>
      `,
    };

    await sendEmail({
      to: studentEmail,
      subject: subjects[action] || `Update on your ${pujaName}`,
      html: bodies[action] || `<p>Your puja status has been updated.</p>`,
      text: `${pujaName}: ${action} (${whenLabel})`,
    });
  } catch (err) {
    console.error(
      "[teacherController] sendPujaStatusEmail failed:",
      err?.message || err,
    );
  }
}
// @route PATCH /api/teacher/specific-puja/bookings/:id/confirm
exports.confirmPujaBooking = asyncHandler(async (req, res) => {
  const booking = await SpecificPujaBooking.findById(req.params.id)
    .populate("package", "name durationMinutes teacher")
    .populate("user", "name email");

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  const teacherId = booking.package?.teacher?._id || booking.package?.teacher;
  if (!teacherId || String(teacherId) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Booking not assigned to you");
  }

  if (booking.status !== "pending") {
    res.status(400);
    throw new Error(
      `Only pending bookings can be confirmed (current: ${booking.status})`,
    );
  }

  // Allow teacher to override the time in the body, else use what student requested
  const { confirmedDateTime, reason } = req.body || {};
  const incoming =
    confirmedDateTime || booking.proposedDateTime || booking.scheduledDateTime;

  if (!incoming) {
    res.status(400);
    throw new Error("No date/time to confirm");
  }

  const dt = new Date(incoming);
  if (isNaN(dt.getTime())) {
    res.status(400);
    throw new Error("Invalid date/time");
  }

  const duration =
    booking.durationMinutes || booking.package?.durationMinutes || 60;

  // Final conflict re-check against this teacher's other bookings
  const sameTeacherPkgIds = await SpecificPujaPackage.find({
    teacher: teacherId,
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
      "That time slot overlaps another booking. Pick another time.",
    );
  }

  const previous = booking.confirmedDateTime || booking.scheduledDateTime;
  if (previous && previous.getTime() !== dt.getTime()) {
    booking.rescheduleHistory = booking.rescheduleHistory || [];
    booking.rescheduleHistory.push({
      fromDateTime: previous,
      toDateTime: dt,
      byRole: "teacher",
      byUser: req.user._id,
      reason: reason || undefined,
    });
  }

  booking.status = "confirmed";
  booking.confirmedDateTime = dt;
  booking.scheduledDateTime = dt;
  booking.confirmedBy = req.user._id;
  booking.confirmedAt = new Date();
  if (!booking.liveKitRoomId) booking.liveKitRoomId = makeRoomId("puja");

  await booking.save();

  // Email — fire-and-forget
  sendPujaStatusEmail(booking, "confirmed", { dateTime: dt });

  res.json({ booking });
});

// @route PATCH /api/teacher/specific-puja/bookings/:id/reschedule
exports.reschedulePujaBooking = asyncHandler(async (req, res) => {
  const booking = await SpecificPujaBooking.findById(req.params.id)
    .populate("package", "name durationMinutes teacher")
    .populate("user", "name email");

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  const teacherId = booking.package?.teacher?._id || booking.package?.teacher;
  if (!teacherId || String(teacherId) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Booking not assigned to you");
  }

  if (booking.status !== "confirmed") {
    res.status(400);
    throw new Error("Only confirmed bookings can be rescheduled");
  }

  const { confirmedDateTime, reason } = req.body || {};
  if (!confirmedDateTime) {
    res.status(400);
    throw new Error("confirmedDateTime is required");
  }

  const dt = new Date(confirmedDateTime);
  if (isNaN(dt.getTime())) {
    res.status(400);
    throw new Error("Invalid date/time");
  }

  const duration =
    booking.durationMinutes || booking.package?.durationMinutes || 60;

  const sameTeacherPkgIds = await SpecificPujaPackage.find({
    teacher: teacherId,
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
      "That time slot overlaps another booking. Pick another time.",
    );
  }

  const previous = booking.confirmedDateTime || booking.scheduledDateTime;
  booking.rescheduleHistory = booking.rescheduleHistory || [];
  booking.rescheduleHistory.push({
    fromDateTime: previous,
    toDateTime: dt,
    byRole: "teacher",
    byUser: req.user._id,
    reason: reason || undefined,
  });

  booking.confirmedDateTime = dt;
  booking.scheduledDateTime = dt;
  await booking.save();

  sendPujaStatusEmail(booking, "rescheduled", {
    dateTime: dt,
    reason,
  });

  res.json({ booking });
});

// @route PATCH /api/teacher/specific-puja/bookings/:id/cancel
exports.cancelPujaBooking = asyncHandler(async (req, res) => {
  const booking = await SpecificPujaBooking.findById(req.params.id)
    .populate("package", "name teacher")
    .populate("user", "name email");

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  const teacherId = booking.package?.teacher?._id || booking.package?.teacher;
  if (!teacherId || String(teacherId) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Booking not assigned to you");
  }

  if (["completed", "cancelled"].includes(booking.status)) {
    res.status(400);
    throw new Error(`Cannot cancel a ${booking.status} booking`);
  }

  const { reason } = req.body || {};

  booking.status = "cancelled";
  booking.cancelledAt = new Date();
  booking.cancelledBy = req.user._id;
  if (reason) booking.cancellationReason = reason;
  await booking.save();

  sendPujaStatusEmail(booking, "cancelled", { reason });

  res.json({ booking });
});

exports.completePujaBooking = asyncHandler(async (req, res) => {
  const booking = await SpecificPujaBooking.findById(req.params.id)
    .populate("package", "teacher name")
    .populate("user", "name email");

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  const teacherId = booking.package?.teacher?._id || booking.package?.teacher;
  if (!teacherId || String(teacherId) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Booking not assigned to you");
  }

  booking.status = "completed";
  booking.endedAt = new Date();
  await booking.save();

  sendPujaStatusEmail(booking, "completed");

  res.json({ booking });
});
