const asyncHandler = require("../utils/asyncHandler");
const { createLiveKitToken } = require("../utils/livekit");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Attendance = require("../models/Attendance");
const FreeClass = require("../models/FreeClass");
const SpecificPujaPackage = require("../models/SpecificPujaPackage");
const SpecificPujaBooking = require("../models/SpecificPujaBooking");

exports.getMyCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ teacher: req.user._id }).sort({
    createdAt: -1,
  });

  const withCounts = await Promise.all(
    courses.map(async (course) => {
      const studentCount = await Enrollment.countDocuments({
        course: course._id,
        status: { $ne: "cancelled" },
      });
      return { ...course.toObject(), studentCount };
    }),
  );

  res.json({ courses: withCounts });
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

// @route POST /api/teacher/courses/:id/attendance
// body: { date: "2026-09-22", records: [{ student: "<id>", status: "present" }, ...] }
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

// @route GET /api/teacher/free-classes — only free classes assigned to this teacher
exports.getMyFreeClasses = asyncHandler(async (req, res) => {
  const freeClasses = await FreeClass.find({ teacher: req.user._id }).sort({
    dateTime: -1,
  });
  res.json({ freeClasses });
});

// @route GET /api/teacher/specific-puja/bookings — bookings for puja packages this teacher owns
exports.getMyPujaBookings = asyncHandler(async (req, res) => {
  const myPackages = await SpecificPujaPackage.find({
    teacher: req.user._id,
  }).select("_id");
  const packageIds = myPackages.map((p) => p._id);

  const bookings = await SpecificPujaBooking.find({
    package: { $in: packageIds },
  })
    .populate("package", "name")
    .populate("user", "name email")
    .sort({ scheduledDateTime: 1 });

  res.json({ bookings });
});

// @route PATCH /api/teacher/specific-puja/bookings/:id/complete
exports.completePujaBooking = asyncHandler(async (req, res) => {
  const booking = await SpecificPujaBooking.findById(req.params.id).populate(
    "package",
  );
  if (!booking || String(booking.package.teacher) !== String(req.user._id)) {
    res.status(404);
    throw new Error("Booking not found or not assigned to you");
  }

  booking.status = "completed";
  await booking.save();
  res.json({ booking });
});

// @route GET /api/teacher/schedule/upcoming — combined view for the teacher's own dashboard
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

// @route POST /api/teacher/free-classes/:id/start
// Starts (or rejoins) this teacher's own free class. Flips the class to
// 'live' the first time it's called so students browsing see it as live,
// and mints a LiveKit token with roomAdmin so the teacher can moderate
// (mute/remove participants) — distinct from a student's token, which
// has roomAdmin: false.
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

  if (freeClass.status !== "live") {
    freeClass.status = "live";
    await freeClass.save();
  }

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
    freeClass,
  });
});

// @route POST /api/teacher/free-classes/:id/end
// Marks the class completed. Only the explicit "End Class" action should
// call this — a dropped connection or page refresh should NOT finalize
// the class, so this is never triggered by a LiveKit disconnect event,
// only by the teacher deliberately ending the session.
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
  await freeClass.save();

  res.json({ freeClass });
});
