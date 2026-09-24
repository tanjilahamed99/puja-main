const asyncHandler = require('../utils/asyncHandler');
const makeRoomId = require('../utils/makeRoomId');
const FreeClass = require('../models/FreeClass');
const FreeClassParticipant = require('../models/FreeClassParticipant');
const Donation = require('../models/Donation');

// @route GET /api/admin/free-classes
const getFreeClasses = asyncHandler(async (req, res) => {
  const classes = await FreeClass.find().populate('teacher', 'name email').sort({ dateTime: -1 });

  const withStats = await Promise.all(
    classes.map(async (fc) => {
      const participantCount = await FreeClassParticipant.countDocuments({ freeClass: fc._id });
      const donationAgg = await Donation.aggregate([
        { $match: { freeClass: fc._id, status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      return {
        ...fc.toObject(),
        participantCount,
        donationTotal: donationAgg[0]?.total || 0,
      };
    })
  );

  res.json({ freeClasses: withStats });
});

// @route GET /api/admin/free-classes/:id
const getFreeClass = asyncHandler(async (req, res) => {
  const fc = await FreeClass.findById(req.params.id).populate('teacher', 'name email');
  if (!fc) {
    res.status(404);
    throw new Error('Free class not found');
  }
  res.json({ freeClass: fc });
});

// @route POST /api/admin/free-classes
const createFreeClass = asyncHandler(async (req, res) => {
  const { title, description, teacher, dateTime } = req.body;

  if (!title || !dateTime) {
    res.status(400);
    throw new Error('Title and date/time are required');
  }

  const freeClass = await FreeClass.create({
    title,
    description,
    teacher: teacher || undefined,
    dateTime,
    liveKitRoomId: makeRoomId('free'),
  });

  res.status(201).json({ freeClass });
});

// @route PATCH /api/admin/free-classes/:id
const updateFreeClass = asyncHandler(async (req, res) => {
  const fc = await FreeClass.findById(req.params.id);
  if (!fc) {
    res.status(404);
    throw new Error('Free class not found');
  }

  ['title', 'description', 'teacher', 'dateTime', 'status'].forEach((field) => {
    if (req.body[field] !== undefined) fc[field] = req.body[field];
  });

  await fc.save();
  res.json({ freeClass: fc });
});

// @route DELETE /api/admin/free-classes/:id
const deleteFreeClass = asyncHandler(async (req, res) => {
  const fc = await FreeClass.findById(req.params.id);
  if (!fc) {
    res.status(404);
    throw new Error('Free class not found');
  }
  await fc.deleteOne();
  res.json({ message: 'Free class deleted' });
});

// @route GET /api/admin/free-classes/:id/participants
const getFreeClassParticipants = asyncHandler(async (req, res) => {
  const participants = await FreeClassParticipant.find({ freeClass: req.params.id }).populate(
    'user',
    'name email'
  );
  res.json({ participants });
});

// @route GET /api/admin/free-classes/:id/donations
const getFreeClassDonations = asyncHandler(async (req, res) => {
  const donations = await Donation.find({ freeClass: req.params.id })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
  res.json({ donations });
});

module.exports = {
  getFreeClasses,
  getFreeClass,
  createFreeClass,
  updateFreeClass,
  deleteFreeClass,
  getFreeClassParticipants,
  getFreeClassDonations,
};
