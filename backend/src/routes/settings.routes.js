const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { verifyFirebaseToken, verifyAdmin } = require('../middleware/authFirebase');

// Public route to get settings
router.get('/', settingsController.getSiteSettings);

// Admin routes
router.get('/admin', verifyFirebaseToken, verifyAdmin, settingsController.getAdminSiteSettings);
router.put('/admin', verifyFirebaseToken, verifyAdmin, settingsController.updateSiteSettings);

module.exports = router;
