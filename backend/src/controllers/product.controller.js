const { getFirestore } = require('../config/firebase');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

/**
 * Get all products with pagination and filters
 */
exports.getAllProducts = async (req, res, next) => {
  try {
    const db = getFirestore();
    const {
      page = 1,
      limit = 12,
      category,
      sort = 'createdAt',
      order = 'desc',
      minPrice,
      maxPrice
    } = req.query;

    let query = db.collection('products').where('isActive', '==', true);

    // Apply filters
    if (category && category !== 'All') {
      query = query.where('category', '==', category);
    }

    if (minPrice) {
      query = query.where('price', '>=', parseFloat(minPrice));
    }

    if (maxPrice) {
      query = query.where('price', '<=', parseFloat(maxPrice));
    }

    // Apply sorting
    query = query.orderBy(sort, order);

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.limit(parseInt(limit)).offset(offset);

    const snapshot = await query.get();
    
    const products = [];
    snapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Get total count
    const countSnapshot = await db.collection('products')
      .where('isActive', '==', true)
      .count()
      .get();
    
    const total = countSnapshot.data().count;

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product by ID
 */
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getFirestore();

    const doc = await db.collection('products').doc(id).get();

    if (!doc.exists) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    // Increment view count
    await db.collection('products').doc(id).update({
      'stats.viewCount': (doc.data().stats?.viewCount || 0) + 1
    });

    res.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get products by category
 */
exports.getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const db = getFirestore();

    const snapshot = await db.collection('products')
      .where('category', '==', category)
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
      .get();

    const products = [];
    snapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search products
 */
exports.searchProducts = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      throw new AppError('Search query too short', 400, 'INVALID_QUERY');
    }

    const db = getFirestore();
    const searchTerm = q.toLowerCase();

    // Simple search - in production, use Algolia or ElasticSearch
    const snapshot = await db.collection('products')
      .where('isActive', '==', true)
      .get();

    const products = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const searchableText = `${data.name} ${data.description} ${data.category}`.toLowerCase();
      
      if (searchableText.includes(searchTerm)) {
        products.push({
          id: doc.id,
          ...data
        });
      }
    });

    res.json({
      success: true,
      data: {
        products,
        query: q,
        count: products.length
      }
    });
  } catch (error) {
    next(error);
  }
};
