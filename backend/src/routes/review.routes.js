const express = require('express');
const router = express.Router();
const { verifyToken, optionalAuth } = require('../middleware/auth');
const reviewController = require('../controllers/review.controller');

// Public routes
router.get('/:productId', reviewController.getProductReviews);

// Protected routes
router.post('/', verifyToken, reviewController.createReview);
router.put('/:id', verifyToken, reviewController.updateReview);
router.delete('/:id', verifyToken, reviewController.deleteReview);

module.exports = router;
