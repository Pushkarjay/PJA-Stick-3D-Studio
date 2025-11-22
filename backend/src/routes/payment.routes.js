const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const paymentController = require('../controllers/payment.controller');

// Public route - get payment methods
router.get('/methods', paymentController.getPaymentMethods);

// Protected routes
router.use(verifyToken);

router.post('/create', paymentController.createPaymentOrder);

// Admin only - manual payment verification
router.post('/verify', requireAdmin, paymentController.verifyPayment);

module.exports = router;
