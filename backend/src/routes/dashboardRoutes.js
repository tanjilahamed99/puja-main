const express = require('express');
const { getStats, getRecentEnrollments, getUpcomingSessions } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/recent-enrollments', getRecentEnrollments);
router.get('/upcoming-sessions', getUpcomingSessions);

module.exports = router;
