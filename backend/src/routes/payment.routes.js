const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const paymentController = require('../controllers/payment.controller');

router.use(verifyToken);

router.post('/create', paymentController.createPaymentOrder);
router.post('/verify', paymentController.verifyPayment);
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;
