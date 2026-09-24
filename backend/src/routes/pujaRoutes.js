const express = require('express');
const {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
  getBookings,
  updateBooking,
} = require('../controllers/pujaController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/packages', getPackages);
router.post('/packages', createPackage);
router.patch('/packages/:id', updatePackage);
router.delete('/packages/:id', deletePackage);

router.get('/bookings', getBookings);
router.patch('/bookings/:id', updateBooking);

module.exports = router;
