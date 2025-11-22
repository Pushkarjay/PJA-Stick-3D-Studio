const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const productController = require('../controllers/product.controller');

// Public routes
router.get('/', optionalAuth, productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);

module.exports = router;
