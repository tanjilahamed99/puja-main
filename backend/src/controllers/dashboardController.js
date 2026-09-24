const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Course = require('../models/Course');
const FreeClass = require('../models/FreeClass');
const SpecificPujaBooking = require('../models/SpecificPujaBooking');
const Payment = require('../models/Payment');
const Donation = require('../models/Donation');
const Enrollment = require('../models/Enrollment');

// @route GET /api/admin/dashboard/stats
const getStats = asyncHandler(async (req, res) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const [
    totalStudents,
    activeCourses,
    freeClassesThisWeek,
    pendingPujaBookings,
    totalPujaBookings,
    revenueAgg,
    donationAgg,
  ] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    Course.countDocuments({ status: 'active' }),
    FreeClass.countDocuments({ dateTime: { $gte: startOfWeek, $lt: endOfWeek } }),
    SpecificPujaBooking.countDocuments({ status: 'pending' }),
    SpecificPujaBooking.countDocuments(),
    Payment.aggregate([
      { $match: { status: 'success', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Donation.aggregate([
      { $match: { status: 'success', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  res.json({
    totalStudents,
    activeCourses,
    freeClassesThisWeek,
    pujaBookings: { total: totalPujaBookings, pending: pendingPujaBookings },
    revenueThisMonth: revenueAgg[0]?.total || 0,
    donationsThisMonth: donationAgg[0]?.total || 0,
  });
});

// @route GET /api/admin/dashboard/recent-enrollments
const getRecentEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find()
    .populate('student', 'name')
    .populate('course', 'title')
    .sort({ createdAt: -1 })
    .limit(10);
  res.json({ enrollments });
});

// @route GET /api/admin/dashboard/upcoming-sessions
const getUpcomingSessions = asyncHandler(async (req, res) => {
  const now = new Date();

  const [freeClasses, bookings] = await Promise.all([
    FreeClass.find({ dateTime: { $gte: now } }).populate('teacher', 'name').sort({ dateTime: 1 }).limit(5),
    SpecificPujaBooking.find({ scheduledDateTime: { $gte: now }, status: { $in: ['confirmed', 'pending'] } })
      .populate('package', 'name')
      .populate('user', 'name')
      .sort({ scheduledDateTime: 1 })
      .limit(5),
  ]);

  res.json({ freeClasses, bookings });
});

module.exports = { getStats, getRecentEnrollments, getUpcomingSessions };
