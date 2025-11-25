const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { authFirebase, isAdmin } = require('../middleware/authFirebase');

// Public route to get settings
router.get('/', settingsController.getSiteSettings);

// Admin routes
router.get('/admin', authFirebase, isAdmin, settingsController.getAdminSiteSettings);
router.put('/admin', authFirebase, isAdmin, settingsController.updateSiteSettings);

module.exports = router;
