const express = require('express');
const router = express.Router();
const dropdownController = require('../controllers/dropdown.controller');
const { verifyFirebaseToken, verifyAdmin } = require('../middleware/authFirebase');

// Public route to get dropdown options
router.get('/', dropdownController.getDropdownOptions);

// Admin-only routes
router.post('/', verifyFirebaseToken, verifyAdmin, dropdownController.addDropdownOption);
router.delete('/', verifyFirebaseToken, verifyAdmin, dropdownController.removeDropdownOption);

module.exports = router;
