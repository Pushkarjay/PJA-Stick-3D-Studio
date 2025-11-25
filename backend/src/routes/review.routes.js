const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/authFirebase');
const reviewController = require('../controllers/review.controller');

// Public routes
router.get('/:productId', reviewController.getProductReviews);

// Protected routes
router.post('/', verifyFirebaseToken, reviewController.createReview);
router.put('/:id', verifyFirebaseToken, reviewController.updateReview);
router.delete('/:id', verifyFirebaseToken, reviewController.deleteReview);

module.exports = router;
