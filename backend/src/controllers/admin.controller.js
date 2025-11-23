const { db } = require('../services/firebase.service');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

/**
 * Get dashboard statistics
 */
exports.getDashboard = async (req, res, next) => {
  try {
    // Get counts
    const [productsSnap, ordersSnap, usersSnap] = await Promise.all([
      db.collection('products').where('isActive', '==', true).count().get(),
      db.collection('orders').count().get(),
      db.collection('users').count().get()
    ]);

    // Get recent orders
    const recentOrdersSnap = await db.collection('orders')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const recentOrders = [];
    recentOrdersSnap.forEach(doc => {
      recentOrders.push({ id: doc.id, ...doc.data() });
    });

    // Get pending orders
    const pendingOrdersSnap = await db.collection('orders')
      .where('status', '==', 'pending')
      .count()
      .get();

    // Calculate total revenue
    const completedOrdersSnap = await db.collection('orders')
      .where('status', '==', 'delivered')
      .get();

    let totalRevenue = 0;
    completedOrdersSnap.forEach(doc => {
      totalRevenue += doc.data().pricing.total;
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalProducts: productsSnap.data().count,
          totalOrders: ordersSnap.data().count,
          totalUsers: usersSnap.data().count,
          pendingOrders: pendingOrdersSnap.data().count,
          totalRevenue
        },
        recentOrders
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
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.uid
    };

    const docRef = await db.collection('products').add(product);

    logger.info(`Product created: ${docRef.id} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: { id: docRef.id },
      message: 'Product created successfully'
    });
  } catch (error) {
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
