const asyncHandler = require('../utils/asyncHandler');
const makeRoomId = require('../utils/makeRoomId');
const SpecificPujaPackage = require('../models/SpecificPujaPackage');
const SpecificPujaBooking = require('../models/SpecificPujaBooking');

// ---- Packages ----

// @route GET /api/admin/specific-puja/packages
const getPackages = asyncHandler(async (req, res) => {
  const packages = await SpecificPujaPackage.find().populate('teacher', 'name email').sort({ createdAt: -1 });
  res.json({ packages });
});

// @route POST /api/admin/specific-puja/packages
const createPackage = asyncHandler(async (req, res) => {
  const { name, description, price, teacher, requiredInfoFields } = req.body;

  if (!name || price === undefined) {
    res.status(400);
    throw new Error('Name and price are required');
  }

  const pkg = await SpecificPujaPackage.create({
    name,
    description,
    price,
    teacher: teacher || undefined,
    requiredInfoFields,
  });

  res.status(201).json({ package: pkg });
});

// @route PATCH /api/admin/specific-puja/packages/:id
const updatePackage = asyncHandler(async (req, res) => {
  const pkg = await SpecificPujaPackage.findById(req.params.id);
  if (!pkg) {
    res.status(404);
    throw new Error('Puja package not found');
  }

  ['name', 'description', 'price', 'teacher', 'requiredInfoFields', 'status'].forEach((field) => {
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
    throw new Error('Puja package not found');
  }
  await pkg.deleteOne();
  res.json({ message: 'Puja package deleted' });
});

// ---- Bookings ----

// @route GET /api/admin/specific-puja/bookings
const getBookings = asyncHandler(async (req, res) => {
  const bookings = await SpecificPujaBooking.find()
    .populate('package', 'name price')
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
  res.json({ bookings });
});

// @route PATCH /api/admin/specific-puja/bookings/:id
// Admin confirms/cancels/reschedules a booking. Confirming auto-generates
// the private LiveKit room for that single participant.
const updateBooking = asyncHandler(async (req, res) => {
  const booking = await SpecificPujaBooking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  const { status, scheduledDateTime } = req.body;
  if (status !== undefined) booking.status = status;
  if (scheduledDateTime !== undefined) booking.scheduledDateTime = scheduledDateTime;
  if (status === 'confirmed' && !booking.liveKitRoomId) {
    booking.liveKitRoomId = makeRoomId('puja');
  }

  await booking.save();
  res.json({ booking });
});

module.exports = { getPackages, createPackage, updatePackage, deletePackage, getBookings, updateBooking };
