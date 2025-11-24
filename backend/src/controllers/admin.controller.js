const { db } = require('../services/firebase.service');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const { generateSignedUploadUrl } = require('../services/storage.service');

/**
 * Get dashboard statistics
 */
exports.getDashboard = async (req, res, next) => {
  try {
    // Get all products
    const productsSnap = await db.collection('products').get();
    let totalProducts = 0;
    let activeProducts = 0;
    
    productsSnap.forEach(doc => {
      totalProducts++;
      if (doc.data().isActive) activeProducts++;
    });

    // Get all orders
    const ordersSnap = await db.collection('orders').get();
    let totalOrders = 0;
    let pendingOrders = 0;
    let completedOrders = 0;
    let totalRevenue = 0;
    const recentOrders = [];

    ordersSnap.forEach(doc => {
      const order = doc.data();
      totalOrders++;
      
      if (order.status === 'pending') pendingOrders++;
      if (order.status === 'delivered' || order.status === 'completed') {
        completedOrders++;
        // Estimate revenue based on items (since pricing might vary)
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            // Rough estimate: extract base price from price tier
            const priceMatch = (item.priceTier || '').match(/\d+/g);
            if (priceMatch && priceMatch.length > 0) {
              totalRevenue += parseInt(priceMatch[0]) * (item.quantity || 1);
            }
          });
        }
      }
      
      // Collect recent orders
      if (recentOrders.length < 10) {
        recentOrders.push({ id: doc.id, ...order });
      }
    });

    // Sort recent orders by date
    recentOrders.sort((a, b) => {
      const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt);
      const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt);
      return bDate - aDate;
    });

    res.json({
      success: true,
      data: {
        totalProducts,
        activeProducts,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue,
        recentOrders: recentOrders.slice(0, 10)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get analytics
 */
exports.getAnalytics = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    const days = parseInt(period) || 30;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const ordersSnap = await db.collection('orders')
      .where('createdAt', '>=', startDate)
      .get();

    const analytics = {
      totalOrders: ordersSnap.size,
      totalRevenue: 0,
      averageOrderValue: 0,
      topProducts: {}
    };

    ordersSnap.forEach(doc => {
      const order = doc.data();
      analytics.totalRevenue += order.pricing.total;

      // Count product sales
      order.items.forEach(item => {
        if (!analytics.topProducts[item.productId]) {
          analytics.topProducts[item.productId] = {
            name: item.productName,
            count: 0,
            revenue: 0
          };
        }
        analytics.topProducts[item.productId].count += item.quantity;
        analytics.topProducts[item.productId].revenue += item.subtotal;
      });
    });

    analytics.averageOrderValue = analytics.totalOrders > 0 
      ? analytics.totalRevenue / analytics.totalOrders 
      : 0;

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create product (Admin)
 */
exports.createProduct = async (req, res, next) => {
  try {
    const productData = req.body;

    const product = {
      ...productData,
      stats: {
        viewCount: 0,
        salesCount: 0,
        reviewCount: 0,
        averageRating: 0
      },
      isActive: productData.isActive !== undefined ? productData.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.uid
    };

    const docRef = await db.collection('products').add(product);

    logger.info(`Product created: ${docRef.id} by ${req.user.email || req.user.uid}`);

    res.status(201).json({
      success: true,
      data: { id: docRef.id, product },
      message: 'Product created successfully'
    });
  } catch (error) {
    logger.error('Error creating product:', error);
    next(error);
  }
};

/**
 * Update product (Admin)
 */
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    await db.collection('products').doc(id).update({
      ...updates,
      updatedAt: new Date()
    });

    logger.info(`Product updated: ${id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Product updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product (Admin) - Soft delete
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    await db.collection('products').doc(id).update({
      isActive: false,
      updatedAt: new Date()
    });

    logger.info(`Product deleted: ${id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk upload products
 */
exports.bulkUploadProducts = async (req, res, next) => {
  try {
    const { products } = req.body;

    const batch = db.batch();

    products.forEach(product => {
      const docRef = db.collection('products').doc();
      batch.set(docRef, {
        ...product,
        stats: {
          viewCount: 0,
          salesCount: 0,
          reviewCount: 0,
          averageRating: 0
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: req.user.uid
      });
    });

    await batch.commit();

    logger.info(`Bulk upload: ${products.length} products by ${req.user.email}`);

    res.json({
      success: true,
      message: `${products.length} products uploaded successfully`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all orders (Admin)
 */
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = db.collection('orders');

    if (status) {
      query = query.where('status', '==', status);
    }

    query = query.orderBy('createdAt', 'desc');

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.limit(parseInt(limit)).offset(offset);

    const snapshot = await query.get();

    const orders = [];
    snapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });

    res.json({
      success: true,
      data: { orders }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status (Admin)
 */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const orderRef = db.collection('orders').doc(id);
    const doc = await orderRef.get();

    if (!doc.exists) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    const orderData = doc.data();

    await orderRef.update({
      status,
      timeline: [
        ...orderData.timeline,
        {
          status,
          timestamp: new Date(),
          note: note || `Status updated to ${status}`
        }
      ],
      updatedAt: new Date()
    });

    logger.info(`Order ${id} status updated to ${status} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Order status updated'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users (Admin)
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const snapshot = await db.collection('users')
      .orderBy('createdAt', 'desc')
      .get();

    const users = [];
    snapshot.forEach(doc => {
      const userData = doc.data();
      users.push({
        uid: doc.id,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        createdAt: userData.createdAt,
        isActive: userData.isActive
      });
    });

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user role (Admin)
 */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['customer', 'admin', 'super_admin'].includes(role)) {
      throw new AppError('Invalid role', 400, 'INVALID_ROLE');
    }

    await db.collection('users').doc(id).update({
      role,
      updatedAt: new Date()
    });

    logger.info(`User ${id} role updated to ${role} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'User role updated'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get signed upload URL for Cloud Storage (Admin)
 */
exports.getUploadUrl = async (req, res, next) => {
  try {
    const { fileName, contentType } = req.body;

    if (!fileName || !contentType) {
      throw new AppError('fileName and contentType are required', 400, 'MISSING_PARAMS');
    }

    // Validate content type
    if (!contentType.startsWith('image/')) {
      throw new AppError('Only image files are allowed', 400, 'INVALID_FILE_TYPE');
    }

    const { uploadUrl, publicUrl } = await generateSignedUploadUrl(fileName, contentType);

    logger.info(`Upload URL generated for: ${fileName} by ${req.user.email || req.user.uid}`);

    res.json({
      success: true,
      uploadUrl,
      publicUrl
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create admin user
 */
exports.createAdminUser = async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400, 'MISSING_PARAMS');
    }

    const admin = require('firebase-admin');

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: displayName || email.split('@')[0]
    });

    // Create user document in Firestore with admin role
    await db.collection('users').doc(userRecord.uid).set({
      email,
      displayName: displayName || email.split('@')[0],
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    logger.info(`Admin user created: ${email} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * CSV Import for products
 */
exports.importProductsCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('CSV file is required', 400, 'MISSING_FILE');
    }

    const parse = require('csv-parse/sync').parse;
    const fs = require('fs');
    
    const fileContent = fs.readFileSync(req.file.path, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    const batch = db.batch();
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const record of records) {
      try {
        // Map CSV columns to product schema (flexible)
        const productData = {
          name: record.name || record.productName || '',
          category: record.category || 'uncategorized',
          subcategory: record.subcategory || '',
          description: record.description || '',
          basePrice: parseFloat(record.basePrice || record.price || 0),
          baseDiscount: parseFloat(record.baseDiscount || 0),
          extraDiscount: parseFloat(record.extraDiscount || 0),
          stock: parseInt(record.stock || 0),
          isAvailable: record.isAvailable !== 'false',
          isActive: record.isActive !== 'false',
          images: record.images ? record.images.split('|') : [],
          specifications: record.specifications ? JSON.parse(record.specifications) : {},
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Calculate discounted price
        const discountMultiplier = (100 - productData.baseDiscount - productData.extraDiscount) / 100;
        productData.discountedPrice = productData.basePrice * discountMultiplier;

        // Auto-create category if it doesn't exist
        const categoryRef = db.collection('categories').doc(productData.category);
        const categoryDoc = await categoryRef.get();
        if (!categoryDoc.exists) {
          batch.set(categoryRef, {
            name: productData.category,
            subcategories: [productData.subcategory].filter(Boolean),
            createdAt: new Date()
          });
        } else if (productData.subcategory && !categoryDoc.data().subcategories.includes(productData.subcategory)) {
          batch.update(categoryRef, {
            subcategories: [...categoryDoc.data().subcategories, productData.subcategory]
          });
        }

        const productRef = db.collection('products').doc();
        batch.set(productRef, productData);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({ row: record, error: error.message });
      }
    }

    await batch.commit();

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    logger.info(`CSV import completed: ${results.success} success, ${results.failed} failed`);

    res.json({
      success: true,
      message: 'CSV import completed',
      data: results
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all categories
 */
exports.getCategories = async (req, res, next) => {
  try {
    const snapshot = await db.collection('categories').orderBy('name').get();
    const categories = [];
    
    for (const doc of snapshot.docs) {
      const categoryData = doc.data();
      // Count products in this category
      const productCount = await db.collection('products')
        .where('category', '==', doc.id)
        .where('isActive', '==', true)
        .count()
        .get();
      
      categories.push({
        id: doc.id,
        ...categoryData,
        productCount: productCount.data().count
      });
    }

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create category
 */
exports.createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, icon } = req.body;

    if (!name || !slug) {
      throw new AppError('Name and slug are required', 400, 'VALIDATION_ERROR');
    }

    // Check if slug already exists
    const existingSnap = await db.collection('categories').where('slug', '==', slug).get();
    if (!existingSnap.empty) {
      throw new AppError('Category slug already exists', 400, 'DUPLICATE_SLUG');
    }

    const category = {
      name,
      slug,
      description: description || '',
      icon: icon || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection('categories').add(category);

    logger.info(`Category created: ${name} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: { id: docRef.id, ...category },
      message: 'Category created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update category
 */
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    await db.collection('categories').doc(id).update({
      ...updates,
      updatedAt: new Date()
    });

    logger.info(`Category updated: ${id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Category updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete category
 */
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if category has products
    const productCount = await db.collection('products')
      .where('category', '==', id)
      .count()
      .get();

    if (productCount.data().count > 0) {
      throw new AppError('Cannot delete category with existing products', 400, 'CATEGORY_HAS_PRODUCTS');
    }

    await db.collection('categories').doc(id).delete();

    logger.info(`Category deleted: ${id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update settings
 */
exports.updateSettings = async (req, res, next) => {
  try {
    const updates = req.body;

    await db.collection('settings').doc('site').set(updates, { merge: true });

    logger.info(`Settings updated by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    next(error);
  }
};
