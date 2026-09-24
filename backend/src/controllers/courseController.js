const asyncHandler = require('../utils/asyncHandler');
const makeRoomId = require('../utils/makeRoomId');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');

// @route GET /api/admin/courses
const getCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find().populate('teacher', 'name email').sort({ createdAt: -1 });

  const withCounts = await Promise.all(
    courses.map(async (course) => {
      const studentCount = await Enrollment.countDocuments({
        course: course._id,
        status: { $ne: 'cancelled' },
      });
      return { ...course.toObject(), studentCount };
    })
  );

  res.json({ courses: withCounts });
});

// @route GET /api/admin/courses/:id
const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate('teacher', 'name email');
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  res.json({ course });
});

// @route POST /api/admin/courses
const createCourse = asyncHandler(async (req, res) => {
  const { title, description, category, price, teacher, schedule, syllabus } = req.body;

  if (!title || price === undefined) {
    res.status(400);
    throw new Error('Title and price are required');
  }

  const course = await Course.create({
    title,
    description,
    category,
    price,
    teacher: teacher || undefined,
    schedule,
    syllabus,
    liveKitRoomId: makeRoomId('course'),
  });

  res.status(201).json({ course });
});

// @route PATCH /api/admin/courses/:id
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const editableFields = ['title', 'description', 'category', 'price', 'teacher', 'schedule', 'syllabus', 'status'];
  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) course[field] = req.body[field];
  });

  await course.save();
  res.json({ course });
});

// @route DELETE /api/admin/courses/:id
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  await course.deleteOne();
  res.json({ message: 'Course deleted' });
});

// @route GET /api/admin/courses/:id/enrollments
const getCourseEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ course: req.params.id })
    .populate('student', 'name email')
    .sort({ createdAt: -1 });
  res.json({ enrollments });
});

// @route PATCH /api/admin/enrollments/:id/complete — marks an enrollment
// complete and issues a certificate for the student.
const completeEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id).populate('course').populate('student');
  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found');
  }

  enrollment.status = 'completed';
  enrollment.completedAt = new Date();

  const certificateNumber = `CERT-${new Date().getFullYear()}-${makeRoomId('').replace('-', '').toUpperCase()}`;
  const certificate = await Certificate.create({
    student: enrollment.student._id,
    course: enrollment.course._id,
    enrollment: enrollment._id,
    certificateNumber,
  });

  enrollment.certificate = certificate._id;
  await enrollment.save();

  res.json({ enrollment, certificate });
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
