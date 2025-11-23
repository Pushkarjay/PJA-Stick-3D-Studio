const { db } = require('../services/firebase.service');
const { sendOrderNotification } = require('../services/whatsapp.service');
const logger = require('../utils/logger');

/**
 * Generate unique order number
 * Format: ORD-YYYYMMDD-XXXX
 */
const generateOrderNumber = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${dateStr}-${random}`;
};

/**
 * Create a new order
 * POST /api/orders
 */
const createOrder = async (req, res, next) => {
  try {
    const orderData = req.validatedData;

    // Calculate total items
    const totalItems = orderData.items.reduce((sum, item) => sum + item.quantity, 0);

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order object
    const order = {
      orderNumber,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      items: orderData.items,
      totalItems,
      status: 'pending',
      notes: orderData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to Firestore
    const docRef = await db.collection('orders').add(order);

    logger.info(`Order created: ${orderNumber} (${docRef.id})`);

    // Send WhatsApp notification (async, don't wait)
    sendOrderNotification({
      ...order,
      id: docRef.id,
    }).catch((error) => {
      logger.error('Failed to send WhatsApp notification:', error);
      // Don't fail the order creation if notification fails
    });

    res.status(201).json({
      success: true,
      data: {
        id: docRef.id,
        ...order,
      },
      message: 'Order created successfully',
    });
  } catch (error) {
    logger.error('Error creating order:', error);
    next(error);
  }
};

module.exports = {
  createOrder,
};
