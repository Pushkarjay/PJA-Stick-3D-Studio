const { db } = require('../services/firebase.service');
const logger = require('../utils/logger');

/**
 * Get all products with optional filtering
 * GET /api/products
 */
const getProducts = async (req, res, next) => {
  try {
    const { category, search, isActive = 'true' } = req.query;

    let query = db.collection('products');

    // Filter by active status
    if (isActive === 'true') {
      query = query.where('isActive', '==', true);
    }

    // Filter by category
    if (category) {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();

    let products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Client-side search filtering (Firestore doesn't support full-text search)
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    logger.error('Error fetching products:', error);
    next(error);
  }
};

/**
 * Get single product by ID
 * GET /api/products/:id
 */
const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const doc = await db.collection('products').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data(),
      },
    });
  } catch (error) {
    logger.error('Error fetching product:', error);
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
};
