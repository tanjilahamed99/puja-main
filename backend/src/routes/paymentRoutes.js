const express = require('express');
const { getPayments, getDonations, getPaymentSummary } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/', getPayments);
router.get('/summary', getPaymentSummary);
router.get('/donations', getDonations);

module.exports = router;
