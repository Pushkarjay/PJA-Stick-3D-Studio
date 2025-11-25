const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { verifyFirebaseToken, verifyAdmin } = require('../middleware/authFirebase');

// Public route to get all categories
router.get('/', categoryController.getCategories);

// Admin-only routes
router.post('/', verifyFirebaseToken, verifyAdmin, categoryController.createCategory);
router.put('/:id', verifyFirebaseToken, verifyAdmin, categoryController.updateCategory);
router.delete('/:id', verifyFirebaseToken, verifyAdmin, categoryController.deleteCategory);

module.exports = router;
