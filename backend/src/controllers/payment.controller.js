const { db } = require('../services/firebase.service');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

/**
 * Create payment order with Cash on Delivery
 */
exports.createPaymentOrder = async (req, res, next) => {
  try {
    const { orderId, amount, paymentMethod } = req.body;

    // Verify order exists
    const orderDoc = await db.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    const orderData = orderDoc.data();

    // Support Cash on Delivery, UPI, or Offline payment
    const paymentData = {
      method: paymentMethod || 'cod', // cod, upi, offline
      amount: amount,
      currency: 'INR',
      status: 'pending',
      orderId: orderId,
      orderNumber: orderData.orderNumber,
      createdAt: new Date()
    };

    logger.info(`Payment order created for ${paymentMethod}: ${orderId}`);

    res.json({
      success: true,
      message: 'Order placed successfully! We will contact you soon.',
      data: paymentData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify offline/manual payment (Admin only)
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const { orderId, transactionId, paymentMethod, notes } = req.body;

    // Update order payment status (manual confirmation by admin)
    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();
    
    if (!orderDoc.exists) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    const orderData = orderDoc.data();

    await orderRef.update({
      'payment.status': 'completed',
      'payment.method': paymentMethod || 'offline',
      'payment.transactionId': transactionId || 'OFFLINE',
      'payment.paidAt': new Date(),
      'payment.notes': notes || '',
      status: 'confirmed',
      timeline: [
        ...orderData.timeline,
        {
          status: 'confirmed',
          timestamp: new Date(),
          note: notes || 'Payment received (manual confirmation)'
        }
      ],
      updatedAt: new Date()
    });

    logger.info(`Payment verified manually for order ${orderId}`);

    res.json({
      success: true,
      message: 'Payment marked as received'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment methods (for frontend)
 */
exports.getPaymentMethods = async (req, res, next) => {
  try {
    const paymentMethods = [
      {
        id: 'cod',
        name: 'Cash on Delivery',
        description: 'Pay when you receive your order',
        icon: '💵',
        enabled: true
      },
      {
        id: 'upi',
        name: 'UPI Payment',
        description: 'PhonePe, Google Pay, Paytm',
        icon: '📱',
        enabled: true
      },
      {
        id: 'offline',
        name: 'Pay at Store',
        description: 'Visit us at Suresh Singh Chowk',
        icon: '🏪',
        enabled: true
      }
    ];

    res.json({
      success: true,
      data: paymentMethods
    });
  } catch (error) {
    next(error);
  }
};
