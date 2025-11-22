const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const orderController = require('../controllers/order.controller');

// All order routes require authentication
router.use(verifyToken);

router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);
router.post('/create', orderController.createOrder);
router.put('/:id/cancel', orderController.cancelOrder);
router.get('/:id/track', orderController.trackOrder);

module.exports = router;
