const express = require('express');
const { completeEnrollment } = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.patch('/:id/complete', completeEnrollment);

module.exports = router;
