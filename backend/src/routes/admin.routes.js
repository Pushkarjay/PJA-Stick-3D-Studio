const express = require('express');
const router = express.Router();
const { verifyFirebaseToken, verifyAdmin } = require('../middleware/authFirebase');
const adminController = require('../controllers/admin.controller');

// All admin routes require authentication and admin role
router.use(verifyFirebaseToken);
router.use(verifyAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboard);
router.get('/stats', adminController.getDashboard); // Added for dashboard stats
router.get('/analytics', adminController.getAnalytics);

// Product management
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);
router.delete('/products/:id/permanent', adminController.permanentDeleteProduct);
router.post('/products/bulk', adminController.bulkUploadProducts);

// Image upload
router.post('/upload-url', adminController.getUploadUrl);

// Review management
router.post('/reviews', adminController.addReview);
router.put('/reviews/:id', adminController.updateReview);
router.delete('/reviews/:id', adminController.deleteReview);

// Admin user management
router.post('/create-admin', adminController.createAdmin);
router.get('/admins', adminController.getAdmins);
router.put('/admins/:id', adminController.updateAdmin);
router.delete('/admins/:id', adminController.deleteAdmin);

module.exports = router;
