const { getFirestore } = require('../config/firebase');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get product reviews
 */
exports.getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const db = getFirestore();

    const snapshot = await db.collection('reviews')
      .where('productId', '==', productId)
      .where('status', '==', 'approved')
      .orderBy('createdAt', 'desc')
      .get();

    const reviews = [];
    snapshot.forEach(doc => {
      reviews.push({ id: doc.id, ...doc.data() });
    });

    res.json({
      success: true,
      data: { reviews }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create review
 */
exports.createReview = async (req, res, next) => {
  try {
    const { productId, rating, title, comment, images } = req.body;
    const { uid, displayName } = req.user;
    const db = getFirestore();

    // Check if user already reviewed this product
    const existingReview = await db.collection('reviews')
      .where('productId', '==', productId)
      .where('userId', '==', uid)
      .get();

    if (!existingReview.empty) {
      throw new AppError('You have already reviewed this product', 400, 'ALREADY_REVIEWED');
    }

    // Check if user purchased this product
    const orderSnapshot = await db.collection('orders')
      .where('customerId', '==', uid)
      .where('status', '==', 'delivered')
      .get();

    let isVerifiedPurchase = false;
    orderSnapshot.forEach(doc => {
      const order = doc.data();
      if (order.items.some(item => item.productId === productId)) {
        isVerifiedPurchase = true;
      }
    });

    const review = {
      productId,
      userId: uid,
      userName: displayName,
      rating,
      title,
      comment,
      images: images || [],
      isVerifiedPurchase,
      helpful: {
        count: 0,
        voters: []
      },
      status: 'approved', // Auto-approve for now
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection('reviews').add(review);

    // Update product rating
    await updateProductRating(productId);

    res.status(201).json({
      success: true,
      data: { id: docRef.id },
      message: 'Review submitted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update review
 */
exports.updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, title, comment } = req.body;
    const { uid } = req.user;
    const db = getFirestore();

    const doc = await db.collection('reviews').doc(id).get();

    if (!doc.exists) {
      throw new AppError('Review not found', 404, 'REVIEW_NOT_FOUND');
    }

    const reviewData = doc.data();

    if (reviewData.userId !== uid) {
      throw new AppError('Unauthorized', 403, 'FORBIDDEN');
    }

    await db.collection('reviews').doc(id).update({
      rating,
      title,
      comment,
      updatedAt: new Date()
    });

    // Update product rating
    await updateProductRating(reviewData.productId);

    res.json({
      success: true,
      message: 'Review updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete review
 */
exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;
    const db = getFirestore();

    const doc = await db.collection('reviews').doc(id).get();

    if (!doc.exists) {
      throw new AppError('Review not found', 404, 'REVIEW_NOT_FOUND');
    }

    const reviewData = doc.data();

    if (reviewData.userId !== uid) {
      throw new AppError('Unauthorized', 403, 'FORBIDDEN');
    }

    await db.collection('reviews').doc(id).delete();

    // Update product rating
    await updateProductRating(reviewData.productId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to update product rating
 */
async function updateProductRating(productId) {
  const db = getFirestore();

  const reviewsSnap = await db.collection('reviews')
    .where('productId', '==', productId)
    .where('status', '==', 'approved')
    .get();

  let totalRating = 0;
  let count = 0;

  reviewsSnap.forEach(doc => {
    totalRating += doc.data().rating;
    count++;
  });

  const averageRating = count > 0 ? totalRating / count : 0;

  await db.collection('products').doc(productId).update({
    'stats.reviewCount': count,
    'stats.averageRating': averageRating
  });
}
