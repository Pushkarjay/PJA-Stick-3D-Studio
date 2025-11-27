const { db } = require('../services/firebase.service');
const { logger } = require('../utils/logger');

/**
 * Get all products with optional filtering
 * GET /api/products
 */
const getProducts = async (req, res, next) => {
  try {
    const { 
      category, 
      search, 
      isActive, // Keep it simple, don't default to 'true'
      includeInactive,
      material,
      theme,
      features,
      sort = 'date-desc' 
    } = req.query;

    let query = db.collection('products');

    // Filter by active status unless includeInactive is true
    if (includeInactive !== 'true') {
      // If isActive is not specified, default to true for public queries
      const filterActive = isActive === undefined ? true : isActive === 'true';
      if (filterActive) {
        query = query.where('isActive', '==', true);
      }
    }
    // If includeInactive is 'true', we don't apply any isActive filter.

    // Filter by category (ignore 'All')
    if (category && category !== 'All') {
      query = query.where('category', '==', category);
    }

    // Filter by material/finish (ignore 'All')
    if (material && material !== 'All') {
      query = query.where('material', '==', material);
    }

    // Filter by theme/vibe (ignore 'All')
    if (theme && theme !== 'All') {
      query = query.where('theme', '==', theme);
    }

    // Sorting
    switch (sort) {
      case 'best-selling':
        query = query.orderBy('stats.salesCount', 'desc');
        break;
      case 'alpha-asc':
        query = query.orderBy('name', 'asc');
        break;
      case 'alpha-desc':
        query = query.orderBy('name', 'desc');
        break;
      case 'price-asc':
        query = query.orderBy('discountedPrice', 'asc');
        break;
      case 'price-desc':
        query = query.orderBy('discountedPrice', 'desc');
        break;
      case 'date-asc':
        query = query.orderBy('createdAt', 'asc');
        break;
      case 'featured':
        // Only use isFeatured sort if explicitly requested
        query = query.orderBy('isFeatured', 'desc').orderBy('createdAt', 'desc');
        break;
      case 'date-desc':
      default:
        // Default to date-desc to ensure all products are returned
        query = query.orderBy('createdAt', 'desc');
        break;
    }

    const snapshot = await query.get();

    let products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Client-side search and feature filtering
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(
        (product) =>
          (product.name && product.name.toLowerCase().includes(searchLower)) ||
          (product.description && product.description.toLowerCase().includes(searchLower)) ||
          (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }
    
    if (features) {
      const featureList = features.split(',');
      products = products.filter(p => 
        p.features && featureList.every(f => p.features.includes(f))
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
