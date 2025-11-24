const express = require('express');
const router = express.Router();
const { verifyFirebaseToken, verifyAdmin } = require('../middleware/authFirebase');
const adminController = require('../controllers/admin.controller');
const multer = require('multer');

// Configure multer for CSV upload
const upload = multer({ dest: 'uploads/temp/' });

// All admin routes require authentication and admin role
router.use(verifyFirebaseToken);
router.use(verifyAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboard);
router.get('/analytics', adminController.getAnalytics);

// Product management
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);
router.post('/products/bulk', adminController.bulkUploadProducts);

// Image upload
router.post('/upload-url', adminController.getUploadUrl);

// Order management
router.get('/orders', adminController.getAllOrders);
router.put('/orders/:id', adminController.updateOrderStatus);

// User management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.post('/users/create-admin', adminController.createAdminUser);

// CSV Import
router.post('/import-products', upload.single('file'), adminController.importProductsCSV);

module.exports = router;
