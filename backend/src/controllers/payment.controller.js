const Razorpay = require('razorpay');
const crypto = require('crypto');
const { getFirestore } = require('../config/firebase');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Create payment order
 */
exports.createPaymentOrder = async (req, res, next) => {
  try {
    const { orderId, amount } = req.body;
    const db = getFirestore();

    // Verify order exists
    const orderDoc = await db.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    const orderData = orderDoc.data();

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: orderData.orderNumber,
      notes: {
        orderId,
        customerId: req.user.uid
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    logger.info(`Payment order created: ${razorpayOrder.id}`);

    res.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify payment signature
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      throw new AppError('Invalid payment signature', 400, 'INVALID_SIGNATURE');
    }

    // Update order payment status
    const db = getFirestore();
    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();
    const orderData = orderDoc.data();

    await orderRef.update({
      'payment.status': 'completed',
      'payment.transactionId': razorpay_payment_id,
      'payment.paidAt': new Date(),
      status: 'confirmed',
      timeline: [
        ...orderData.timeline,
        {
          status: 'confirmed',
          timestamp: new Date(),
          note: 'Payment successful'
        }
      ],
      updatedAt: new Date()
    });

    logger.info(`Payment verified: ${razorpay_payment_id} for order ${orderId}`);

    res.json({
      success: true,
      message: 'Payment verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Razorpay webhook
 */
exports.handleWebhook = async (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new AppError('Invalid webhook signature', 400, 'INVALID_SIGNATURE');
    }

    const event = req.body.event;
    const payload = req.body.payload;

    logger.info(`Webhook received: ${event}`);

    // Handle different events
    switch (event) {
      case 'payment.captured':
        // Payment successful
        logger.info(`Payment captured: ${payload.payment.entity.id}`);
        break;

      case 'payment.failed':
        // Payment failed
        logger.info(`Payment failed: ${payload.payment.entity.id}`);
        break;

      default:
        logger.info(`Unhandled webhook event: ${event}`);
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
