const express = require('express');
const {
  getFreeClasses,
  getFreeClass,
  createFreeClass,
  updateFreeClass,
  deleteFreeClass,
  getFreeClassParticipants,
  getFreeClassDonations,
} = require('../controllers/freeClassController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/', getFreeClasses);
router.post('/', createFreeClass);
router.get('/:id', getFreeClass);
router.patch('/:id', updateFreeClass);
router.delete('/:id', deleteFreeClass);
router.get('/:id/participants', getFreeClassParticipants);
router.get('/:id/donations', getFreeClassDonations);

module.exports = router;
