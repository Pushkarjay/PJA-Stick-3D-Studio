const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billing.controller');
const { verifyFirebaseToken, verifyAdmin } = require('../middleware/authFirebase');

// All billing routes require admin authentication
router.use(verifyFirebaseToken, verifyAdmin);

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
