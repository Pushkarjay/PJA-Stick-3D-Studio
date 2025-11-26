const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billing.controller');
const { authenticate, isAdmin } = require('../middleware/auth');

// All billing routes require admin authentication
router.use(authenticate, isAdmin);

// Get all billing data
router.get('/', billingController.getBillingData);

// Save all billing data (bulk update)
router.post('/', billingController.saveBillingData);

// Expenses
router.post('/expenses', billingController.addExpense);
router.delete('/expenses/:id', billingController.deleteExpense);

// Stock
router.put('/stock', billingController.updateStock);

// Reset all data
router.delete('/reset', billingController.resetBillingData);

module.exports = router;
