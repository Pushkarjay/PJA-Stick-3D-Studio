const { db, admin } = require('../services/firebase.service');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

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

    // Ensure stats object exists
    if (!productData.stats) {
      productData.stats = {
        viewCount: 0,
        salesCount: 0,
        reviewCount: 0,
        averageRating: 0
      };
    }

    // Convert imageUrl to imageUrls array for consistency
    let imageUrls = productData.imageUrls || [];
    if (productData.imageUrl && !imageUrls.includes(productData.imageUrl)) {
      imageUrls = [productData.imageUrl, ...imageUrls];
    }

    // Build pricing object for consistent frontend usage
    const actualPrice = parseFloat(productData.actualPrice) || parseFloat(productData.price) || 0;
    const baseDiscount = parseFloat(productData.baseDiscount) || 0;
    const extraDiscount = parseFloat(productData.extraDiscount) || 0;
    const totalDiscountPercent = baseDiscount + extraDiscount;
    const discountedPrice = parseFloat(productData.discountedPrice) || (actualPrice - (actualPrice * totalDiscountPercent / 100));
    const discount = actualPrice - discountedPrice;

    const product = {
      ...productData,
      imageUrls,
      // Store both flat fields and pricing object for compatibility
      price: actualPrice,
      actualPrice,
      baseDiscount,
      extraDiscount,
      discountedPrice,
      discount,
      // Structured pricing object for ProductModal and other components
      pricing: {
        basePrice: actualPrice,
        discountedPrice: discountedPrice,
        discount: discount,
        discountBreakdown: {
          baseDiscount: baseDiscount,
          extraDiscount: extraDiscount,
          totalPercent: totalDiscountPercent
        }
      },
      isActive: productData.isActive !== undefined ? productData.isActive : true,
      isFeatured: productData.isFeatured || false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.uid
    };

    // Clean up: remove singular imageUrl field
    delete product.imageUrl;

    // Remove any undefined fields to avoid Firestore errors
    Object.keys(product).forEach(key => product[key] === undefined && delete product[key]);

    const docRef = await db.collection('products').add(product);

    logger.info(`Product created: ${docRef.id} by ${req.user.email || req.user.uid}`);

    res.status(201).json({
      success: true,
      data: { id: docRef.id, ...product },
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

    // Convert imageUrl to imageUrls array for consistency
    if (updates.imageUrl) {
      let imageUrls = updates.imageUrls || [];
      if (!imageUrls.includes(updates.imageUrl)) {
        imageUrls = [updates.imageUrl, ...imageUrls];
      }
      updates.imageUrls = imageUrls;
      delete updates.imageUrl;
    }

    // Build pricing object for consistent frontend usage
    const actualPrice = parseFloat(updates.actualPrice) || parseFloat(updates.price) || 0;
    const baseDiscount = parseFloat(updates.baseDiscount) || 0;
    const extraDiscount = parseFloat(updates.extraDiscount) || 0;
    const totalDiscountPercent = baseDiscount + extraDiscount;
    const discountedPrice = parseFloat(updates.discountedPrice) || (actualPrice - (actualPrice * totalDiscountPercent / 100));
    const discount = actualPrice - discountedPrice;

    // Update pricing fields
    updates.price = actualPrice;
    updates.actualPrice = actualPrice;
    updates.baseDiscount = baseDiscount;
    updates.extraDiscount = extraDiscount;
    updates.discountedPrice = discountedPrice;
    updates.discount = discount;
    updates.pricing = {
      basePrice: actualPrice,
      discountedPrice: discountedPrice,
      discount: discount,
      discountBreakdown: {
        baseDiscount: baseDiscount,
        extraDiscount: extraDiscount,
        totalPercent: totalDiscountPercent
      }
    };

    // Remove any undefined fields to avoid Firestore errors
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

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
 * Permanently delete product (Admin) - Hard delete from database
 */
exports.permanentDeleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const productDoc = await db.collection('products').doc(id).get();
    if (!productDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete the product permanently
    await db.collection('products').doc(id).delete();

    logger.info(`Product permanently deleted: ${id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Product permanently deleted'
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
 * Update settings - DEPRECATED in favor of settings controller
 */
/*
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
*/

/**
 * Get a signed URL for uploading a file to Firebase Storage.
 */
exports.getUploadUrl = async (req, res, next) => {
  try {
    const { fileName, contentType } = req.body;
    if (!fileName || !contentType) {
      throw new AppError('fileName and contentType are required', 400);
    }

    const { generateSignedUploadUrl } = require('../services/storage.service');
    const url = await generateSignedUploadUrl(fileName, contentType);

    res.json({
      success: true,
      data: { url },
      message: 'Upload URL generated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new admin user.
 */
exports.createAdmin = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      throw new AppError('Email, password, and name are required', 400);
    }

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Set custom claim to identify user as an admin
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });

    const now = new Date();
    
    // Save admin details to BOTH collections for compatibility
    // The 'users' collection is checked by auth middleware
    await db.collection('users').doc(userRecord.uid).set({
      email,
      displayName: name,
      role: 'admin',
      createdAt: now,
      updatedAt: now,
    });
    
    // Also save to 'admins' collection for the admin management page
    await db.collection('admins').doc(userRecord.uid).set({
      name,
      email,
      createdAt: now,
      status: 'Active',
    });

    logger.info(`Admin created: ${userRecord.uid} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: { uid: userRecord.uid, email, displayName: name },
    });
  } catch (error) {
    logger.error('Error creating admin user:', error);
    if (error.code === 'auth/email-already-exists') {
      next(new AppError('An admin with this email already exists.', 409));
    } else {
      next(error);
    }
  }
};

/**
 * Get all admin users.
 */
exports.getAdmins = async (req, res, next) => {
  try {
    const snapshot = await db.collection('admins').get();
    const admins = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // Convert Firestore Timestamp to ISO string for proper JSON serialization
      admins.push({ 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt
      });
    });
    res.json({ success: true, data: admins });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an admin user.
 */
exports.updateAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;
    const updates = { updatedAt: new Date() };
    if (name) updates.name = name;
    if (status) updates.status = status;

    // Update in admins collection
    await db.collection('admins').doc(id).update(updates);
    
    // Also update in users collection if exists
    const userDoc = await db.collection('users').doc(id).get();
    if (userDoc.exists) {
      const userUpdates = { updatedAt: new Date() };
      if (name) userUpdates.displayName = name;
      await db.collection('users').doc(id).update(userUpdates);
    }

    logger.info(`Admin ${id} updated by ${req.user.email}`);
    res.json({ success: true, message: 'Admin updated successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an admin user.
 */
exports.deleteAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Deactivate in admins collection
    await db.collection('admins').doc(id).update({ status: 'Inactive', updatedAt: new Date() });
    
    // Also update role in users collection to revoke access
    const userDoc = await db.collection('users').doc(id).get();
    if (userDoc.exists) {
      await db.collection('users').doc(id).update({ 
        role: 'customer', // Demote to customer
        updatedAt: new Date() 
      });
    }
    
    // Disable in Firebase Auth
    await admin.auth().updateUser(id, { disabled: true });

    logger.info(`Admin ${id} deleted (deactivated) by ${req.user.email}`);
    res.json({ success: true, message: 'Admin user deactivated successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Migrate existing admins to users collection (one-time fix)
 */
exports.migrateAdmins = async (req, res, next) => {
  try {
    const adminsSnapshot = await db.collection('admins').get();
    let migrated = 0;
    let skipped = 0;
    
    for (const adminDoc of adminsSnapshot.docs) {
      const adminData = adminDoc.data();
      const uid = adminDoc.id;
      
      // Check if user already exists in users collection
      const userDoc = await db.collection('users').doc(uid).get();
      
      if (!userDoc.exists) {
        // Create user document
        await db.collection('users').doc(uid).set({
          email: adminData.email,
          displayName: adminData.name,
          role: adminData.status === 'Active' ? 'admin' : 'customer',
          createdAt: adminData.createdAt || new Date(),
          updatedAt: new Date(),
        });
        migrated++;
        logger.info(`Migrated admin ${adminData.email} to users collection`);
      } else {
        // Update role if user exists but isn't admin
        const userData = userDoc.data();
        if (userData.role !== 'admin' && userData.role !== 'super_admin' && adminData.status === 'Active') {
          await db.collection('users').doc(uid).update({
            role: 'admin',
            updatedAt: new Date(),
          });
          migrated++;
          logger.info(`Updated ${adminData.email} role to admin`);
        } else {
          skipped++;
        }
      }
    }
    
    logger.info(`Admin migration complete: ${migrated} migrated, ${skipped} skipped`);
    res.json({ 
      success: true, 
      message: `Migration complete: ${migrated} admins migrated, ${skipped} already existed` 
    });
  } catch (error) {
    logger.error('Error migrating admins:', error);
    next(error);
  }
};

/**
 * Add a review for a product
 */
exports.addReview = async (req, res, next) => {
  try {
    const { productId, rating, reviewText, reviewerName } = req.body;
    const reviewData = {
      productId,
      rating: Number(rating),
      reviewText,
      reviewerName,
      images: req.body.images || [],
      createdAt: new Date(),
      approved: false, // Reviews start as unapproved
      userId: req.user.uid,
    };

    const reviewRef = await db.collection('reviews').add(reviewData);

    // Update product's review stats
    const productRef = db.collection('products').doc(productId);
    const productDoc = await productRef.get();
    if (productDoc.exists) {
      const productData = productDoc.data();
      const stats = productData.stats || {};
      const newReviewCount = (stats.reviewCount || 0) + 1;
      const newAverageRating = ((stats.averageRating || 0) * (stats.reviewCount || 0) + Number(rating)) / newReviewCount;
      
      await productRef.update({
        'stats.reviewCount': newReviewCount,
        'stats.averageRating': newAverageRating,
      });
    }

    logger.info(`Review added for product ${productId} by ${req.user.email}`);
    res.status(201).json({ success: true, message: 'Review submitted for approval.', reviewId: reviewRef.id });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a review (e.g., approve it)
 */
exports.updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body; // e.g., { approved: true }

    await db.collection('reviews').doc(id).update({
      ...updates,
      updatedAt: new Date(),
    });

    logger.info(`Review ${id} updated by ${req.user.email}`);
    res.json({ success: true, message: 'Review updated successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a review
 */
exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.collection('reviews').doc(id).delete();
    logger.info(`Review ${id} deleted by ${req.user.email}`);
    res.json({ success: true, message: 'Review deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
