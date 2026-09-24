const asyncHandler = require('../utils/asyncHandler');
const Payment = require('../models/Payment');
const Donation = require('../models/Donation');

// @route GET /api/admin/payments — all subscription + specific-puja payments
const getPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find()
    .populate('user', 'name email')
    .populate('course', 'title')
    .populate({ path: 'pujaBooking', populate: { path: 'package', select: 'name' } })
    .sort({ createdAt: -1 });
  res.json({ payments });
});

// @route GET /api/admin/payments/donations
const getDonations = asyncHandler(async (req, res) => {
  const donations = await Donation.find()
    .populate('user', 'name email')
    .populate('freeClass', 'title')
    .sort({ createdAt: -1 });
  res.json({ donations });
});

// @route GET /api/admin/payments/summary — totals for the current month,
// used by the Dashboard and Payments pages.
const getPaymentSummary = asyncHandler(async (req, res) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [courseRevenue, pujaRevenue, donationTotal] = await Promise.all([
    Payment.aggregate([
      { $match: { type: 'subscription', status: 'success', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Payment.aggregate([
      { $match: { type: 'specificPuja', status: 'success', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Donation.aggregate([
      { $match: { status: 'success', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  res.json({
    courseRevenue: courseRevenue[0]?.total || 0,
    pujaRevenue: pujaRevenue[0]?.total || 0,
    donationTotal: donationTotal[0]?.total || 0,
  });
});

module.exports = { getPayments, getDonations, getPaymentSummary };
