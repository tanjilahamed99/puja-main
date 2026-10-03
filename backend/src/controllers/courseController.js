const asyncHandler = require("../utils/asyncHandler");
const makeRoomId = require("../utils/makeRoomId");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Certificate = require("../models/Certificate");
const { evaluateCourseJoinability } = require("../utils/courseSession");

/* ------------------------------ Courses ------------------------------ */

// @route GET /api/admin/courses
const getCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find()
    .populate("teacher", "name email")
    .sort({ createdAt: -1 });

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

  res.json({ courses: enriched, success: true });
});

// @route GET /api/admin/courses/:id
const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate(
    "teacher",
    "name email",
  );
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  const j = evaluateCourseJoinability(course);

  res.json({
    course,
    joinability: {
      canJoin: j.canJoin,
      reason: j.reason || null,
      opensAt: j.opensAt,
      closesAt: j.closesAt,
      nextStart: j.nextStart || null,
    },
    success: true,
  });
});

// @route POST /api/admin/courses
const createCourse = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    price,
    teacher,
    schedule,
    syllabus,
    image,
    durationMinutes,
    joinLeadMinutes,
    joinGraceMinutes,
    startDate,
    endDate,
    totalSessions,
    status,
  } = req.body;

  if (!title || price === undefined) {
    res.status(400);
    throw new Error("Title and price are required");
  }

  const course = await Course.create({
    title,
    description,
    category,
    price,
    teacher: teacher || undefined,
    schedule,
    syllabus,
    image,
    liveKitRoomId: makeRoomId("course"),
    durationMinutes: durationMinutes ?? 60,
    joinLeadMinutes: joinLeadMinutes ?? 10,
    joinGraceMinutes: joinGraceMinutes ?? 15,
    startDate,
    endDate,
    totalSessions: totalSessions ?? 0,
    status: status || "draft",
  });

  res.status(201).json({ course, success: true });
});

// @route PATCH /api/admin/courses/:id
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  [
    "title",
    "description",
    "category",
    "price",
    "teacher",
    "schedule",
    "syllabus",
    "status",
    "image",
    "durationMinutes",
    "joinLeadMinutes",
    "joinGraceMinutes",
    "startDate",
    "endDate",
    "totalSessions",
  ].forEach((field) => {
    if (req.body[field] !== undefined) course[field] = req.body[field];
  });

  await course.save();
  res.json({ course, success: true });
});

// @route DELETE /api/admin/courses/:id
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }
  await course.deleteOne();
  res.json({ message: "Course deleted", success: true });
});

/* ------------------------------ Enrollments ------------------------------ */

// @route GET /api/admin/courses/:id/enrollments
const getCourseEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ course: req.params.id })
    .populate("student", "name email")
    .populate("certificate")
    .sort({ createdAt: -1 });

  res.json({ enrollments, success: true });
});

// @route PATCH /api/admin/enrollments/:id/complete
const completeEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id)
    .populate("course")
    .populate("student");

  if (!enrollment) {
    res.status(404);
    throw new Error("Enrollment not found");
  }
  if (enrollment.status === "completed") {
    return res.json({
      enrollment,
      certificate: enrollment.certificate,
      success: true,
    });
  }

  enrollment.status = "completed";
  enrollment.completedAt = new Date();

  const certificateNumber = `CERT-${new Date().getFullYear()}-${makeRoomId("")
    .replace("-", "")
    .toUpperCase()}`;

  const certificate = await Certificate.create({
    student: enrollment.student._id,
    course: enrollment.course._id,
    enrollment: enrollment._id,
    certificateNumber,
  });

  enrollment.certificate = certificate._id;
  await enrollment.save();

  res.json({ enrollment, certificate, success: true });
});

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseEnrollments,
  completeEnrollment,
};
