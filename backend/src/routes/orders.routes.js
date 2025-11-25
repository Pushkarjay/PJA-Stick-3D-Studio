const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const orderController = require('../controllers/orders.controller');

// All routes in this file require a valid token
router.use(verifyToken);

// Admin routes
router.get('/', requireAdmin, orderController.getAllOrders);
router.put('/:id/status', requireAdmin, orderController.updateOrderStatus);

// User-specific routes
router.get('/user', orderController.getUserOrders); 
router.post('/create', orderController.createOrder);
router.get('/:id', orderController.getOrderById);
router.put('/:id/cancel', orderController.cancelOrder);
router.get('/:id/track', orderController.trackOrder); // This could be public, but requires token for now

module.exports = router;
