const { db } = require('../services/firebase.service');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

/**
 * Generate order number
 */
function generateOrderNumber() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PJA-${dateStr}-${random}`;
}

/**
 * Create new order
 */
exports.createOrder = async (req, res, next) => {
  try {
    const { uid, email } = req.user;
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      throw new AppError('Cart is empty', 400, 'EMPTY_CART');
    }

    // Calculate pricing
    let subtotal = 0;
    const orderItems = await Promise.all(
      items.map(async (item) => {
        const productDoc = await db.collection('products').doc(item.productId).get();
        if (!productDoc.exists) {
          throw new AppError(`Product ${item.productId} not found`, 404, 'PRODUCT_NOT_FOUND');
        }

        const productData = productDoc.data();
        const itemSubtotal = productData.price * item.quantity;
        subtotal += itemSubtotal;

        return {
          productId: item.productId,
          productName: productData.name,
          quantity: item.quantity,
          price: productData.price,
          subtotal: itemSubtotal
        };
      })
    );

    const tax = subtotal * 0.18; // 18% GST
    const shipping = subtotal > 500 ? 0 : 50;
    const total = subtotal + tax + shipping;

    // Create order
    const orderData = {
      orderNumber: generateOrderNumber(),
      customerId: uid,
      customerEmail: email,
      items: orderItems,
      pricing: {
        subtotal,
        tax,
        shipping,
        discount: 0,
        total
      },
      shippingAddress,
      payment: {
        method: paymentMethod,
        status: 'pending',
        transactionId: null,
        paidAt: null
      },
      status: 'pending',
      timeline: [
        {
          status: 'pending',
          timestamp: new Date(),
          note: 'Order created'
        }
      ],
      notes: notes || '',
      adminNotes: '',
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const orderRef = await db.collection('orders').add(orderData);

    // Clear cart after order creation
    await db.collection('cart').doc(uid).delete();

    logger.info(`Order created: ${orderData.orderNumber} by ${email}`);

    res.status(201).json({
      success: true,
      data: {
        orderId: orderRef.id,
        orderNumber: orderData.orderNumber,
        total
      },
      message: 'Order created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user orders
 */
exports.getUserOrders = async (req, res, next) => {
  try {
    const { uid } = req.user;

    const snapshot = await db.collection('orders')
      .where('customerId', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();

    const orders = [];
    snapshot.forEach(doc => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
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
 * Get order by ID
 */
exports.getOrderById = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    const doc = await db.collection('orders').doc(id).get();

    if (!doc.exists) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    const orderData = doc.data();

    // Verify order belongs to user (unless admin)
    if (orderData.customerId !== uid && req.user.role !== 'admin') {
      throw new AppError('Unauthorized', 403, 'FORBIDDEN');
    }

    res.json({
      success: true,
      data: {
        id: doc.id,
        ...orderData
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel order
 */
exports.cancelOrder = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    const orderRef = db.collection('orders').doc(id);
    const doc = await orderRef.get();

    if (!doc.exists) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    const orderData = doc.data();

    // Verify ownership
    if (orderData.customerId !== uid) {
      throw new AppError('Unauthorized', 403, 'FORBIDDEN');
    }

    // Check if order can be cancelled (only pending/confirmed)
    if (!['pending', 'confirmed'].includes(orderData.status)) {
      throw new AppError('Order cannot be cancelled', 400, 'CANNOT_CANCEL');
    }

    // Update order status
    await orderRef.update({
      status: 'cancelled',
      timeline: [
        ...orderData.timeline,
        {
          status: 'cancelled',
          timestamp: new Date(),
          note: 'Cancelled by customer'
        }
      ],
      updatedAt: new Date()
    });

    logger.info(`Order cancelled: ${orderData.orderNumber}`);

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Track order
 */
exports.trackOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const doc = await db.collection('orders').doc(id).get();

    if (!doc.exists) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    const orderData = doc.data();

    res.json({
      success: true,
      data: {
        orderNumber: orderData.orderNumber,
        status: orderData.status,
        timeline: orderData.timeline,
        estimatedDelivery: orderData.estimatedDelivery
      }
    });
  } catch (error) {
    next(error);
  }
};
