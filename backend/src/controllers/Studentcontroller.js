const asyncHandler = require('../utils/asyncHandler');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const FreeClass = require('../models/FreeClass');
const FreeClassParticipant = require('../models/FreeClassParticipant');
const Donation = require('../models/Donation');
const SpecificPujaPackage = require('../models/SpecificPujaPackage');
const SpecificPujaBooking = require('../models/SpecificPujaBooking');
const Certificate = require('../models/Certificate');

// ---------------- Courses ----------------

// @route GET /api/student/courses — browse active, published courses
exports.browseCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ status: 'active' })
    .populate('teacher', 'name')
    .sort({ createdAt: -1 });
  res.json({ courses });
});

// @route POST /api/student/courses/:id/enroll
// body: { method: 'paypal' | 'phonepe', gatewayRef }
// NOTE: this assumes the payment has already been confirmed client-side by
// the gateway's checkout flow. Once real PayPal/PhonePe webhooks are wired
// up, this should instead create the Payment as 'pending' and let the
// webhook flip it to 'success' before the Enrollment is activated.
exports.enrollInCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ _id: req.params.id, status: 'active' });
  if (!course) {
    res.status(404);
    throw new Error('Course not found or not currently available');
  }

  const existing = await Enrollment.findOne({
    student: req.user._id,
    course: course._id,
    status: { $ne: 'cancelled' },
  });
  if (existing) {
    res.status(409);
    throw new Error('You are already enrolled in this course');
  }

  const { method, gatewayRef } = req.body;
  if (!method) {
    res.status(400);
    throw new Error('Payment method is required');
  }

  const payment = await Payment.create({
    user: req.user._id,
    type: 'subscription',
    course: course._id,
    amount: course.price,
    method,
    gatewayRef,
    status: 'success',
  });

  const enrollment = await Enrollment.create({
    student: req.user._id,
    course: course._id,
    payment: payment._id,
    status: 'active',
    startDate: new Date(),
  });

  res.status(201).json({ enrollment, payment });
});

// @route GET /api/student/enrollments — this student's own enrollments
exports.getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .populate({ path: 'course', populate: { path: 'teacher', select: 'name' } })
    .populate('certificate')
    .sort({ createdAt: -1 });
  res.json({ enrollments });
});

// ---------------- Free classes ----------------

// @route GET /api/student/free-classes — open, upcoming/live sessions
exports.browseFreeClasses = asyncHandler(async (req, res) => {
  const freeClasses = await FreeClass.find({ status: { $in: ['scheduled', 'live'] } })
    .populate('teacher', 'name')
    .sort({ dateTime: 1 });
  res.json({ freeClasses });
});

// @route POST /api/student/free-classes/:id/join
exports.joinFreeClass = asyncHandler(async (req, res) => {
  const freeClass = await FreeClass.findById(req.params.id);
  if (!freeClass) {
    res.status(404);
    throw new Error('Free class not found');
  }

  const participant = await FreeClassParticipant.create({
    freeClass: freeClass._id,
    user: req.user._id,
  });

  res.status(201).json({
    participant,
    liveKitRoomId: freeClass.liveKitRoomId,
  });
});

// @route POST /api/student/free-classes/:id/donate
// body: { amount, method: 'paypal' | 'phonepe', gatewayRef }
exports.donateToFreeClass = asyncHandler(async (req, res) => {
  const freeClass = await FreeClass.findById(req.params.id);
  if (!freeClass) {
    res.status(404);
    throw new Error('Free class not found');
  }

  const { amount, method, gatewayRef } = req.body;
  if (!amount || !method) {
    res.status(400);
    throw new Error('Amount and payment method are required');
  }

  const donation = await Donation.create({
    user: req.user._id,
    freeClass: freeClass._id,
    amount,
    method,
    gatewayRef,
    status: 'success',
  });

  res.status(201).json({ donation });
});

// ---------------- Specific puja ----------------

// @route GET /api/student/specific-puja/packages
exports.browsePujaPackages = asyncHandler(async (req, res) => {
  const packages = await SpecificPujaPackage.find({ status: 'active' })
    .populate('teacher', 'name')
    .sort({ createdAt: -1 });
  res.json({ packages });
});

// @route POST /api/student/specific-puja/packages/:id/book
// body: { method, gatewayRef, participantInfo, preferredDateTime }
exports.bookPujaPackage = asyncHandler(async (req, res) => {
  const pkg = await SpecificPujaPackage.findOne({ _id: req.params.id, status: 'active' });
  if (!pkg) {
    res.status(404);
    throw new Error('Puja package not found or not currently available');
  }

  const { method, gatewayRef, participantInfo, preferredDateTime } = req.body;
  if (!method) {
    res.status(400);
    throw new Error('Payment method is required');
  }

  const payment = await Payment.create({
    user: req.user._id,
    type: 'specificPuja',
    amount: pkg.price,
    method,
    gatewayRef,
    status: 'success',
  });

  const booking = await SpecificPujaBooking.create({
    package: pkg._id,
    user: req.user._id,
    payment: payment._id,
    participantInfo,
    scheduledDateTime: preferredDateTime || undefined,
    status: 'pending', // admin confirms the final schedule and generates the LiveKit room
  });

  payment.pujaBooking = booking._id;
  await payment.save();

  res.status(201).json({ booking, payment });
});

// @route GET /api/student/specific-puja/bookings — this student's own bookings
exports.getMyPujaBookings = asyncHandler(async (req, res) => {
  const bookings = await SpecificPujaBooking.find({ user: req.user._id })
    .populate('package', 'name price')
    .sort({ createdAt: -1 });
  res.json({ bookings });
});

// ---------------- Certificates ----------------

// @route GET /api/student/certificates
exports.getMyCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({ student: req.user._id })
    .populate('course', 'title')
    .sort({ issuedAt: -1 });
  res.json({ certificates });
});
