const express = require('express');
const router = express.Router();
const { createOrder } = require('../controllers/orders.controller');
const { validateOrder } = require('../middleware/validate');

// Public route - create order
router.post('/', validateOrder, createOrder);

module.exports = router;
