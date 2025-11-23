const twilio = require('twilio');
const config = require('../config');
const { logger } = require('../utils/logger');

let twilioClient = null;

// Initialize Twilio client if credentials are configured
if (config.twilio.accountSid && config.twilio.authToken) {
  twilioClient = twilio(config.twilio.accountSid, config.twilio.authToken);
  logger.info('Twilio WhatsApp client initialized');
} else {
  logger.warn('Twilio credentials not configured - WhatsApp notifications disabled');
}

/**
 * Send WhatsApp message via Twilio
 * @param {string} to - Recipient phone number (E.164 format)
 * @param {string} message - Message content
 * @returns {Promise<{success: boolean, messageId?: string}>}
 */
const sendWhatsAppMessage = async (to, message) => {
  if (!twilioClient) {
    logger.warn('Twilio not configured - skipping WhatsApp message');
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    const result = await twilioClient.messages.create({
      from: `whatsapp:${config.twilio.whatsappNumber}`,
      to: `whatsapp:${to}`,
      body: message,
    });

    logger.info(`WhatsApp message sent successfully: ${result.sid}`);
    return {
      success: true,
      messageId: result.sid,
    };
  } catch (error) {
    logger.error('Failed to send WhatsApp message:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Send order notification to business WhatsApp
 * @param {object} order - Order details
 * @returns {Promise<{success: boolean, messageId?: string}>}
 */
const sendOrderNotification = async (order) => {
  const businessNumber = config.whatsappNumber;

  // Format order details
  const itemsList = order.items
    .map((item, index) => `${index + 1}. ${item.productName} x${item.quantity} (${item.priceTier})`)
    .join('\n');

  const message = `🔔 *New Order Received*

*Order Number:* ${order.orderNumber}

*Customer Details:*
Name: ${order.customerName}
Phone: ${order.customerPhone}
Email: ${order.customerEmail}

*Order Items:*
${itemsList}

*Total Items:* ${order.totalItems}

${order.notes ? `*Special Notes:*\n${order.notes}\n\n` : ''}*Order Time:* ${new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

Please contact the customer to confirm the order.`;

  return sendWhatsAppMessage(businessNumber, message);
};

/**
 * Format checkout message for customer
 * @param {object} order - Order details
 * @returns {string}
 */
const formatCheckoutMessage = (order) => {
  const itemsList = order.items
    .map((item, index) => `${index + 1}. ${item.productName} x${item.quantity}`)
    .join('\n');

  return `Hi, I'd like to place an order:

Order #${order.orderNumber}

Items:
${itemsList}

Name: ${order.customerName}
Phone: ${order.customerPhone}
Email: ${order.customerEmail}

${order.notes ? `Special Requirements:\n${order.notes}\n\n` : ''}Please confirm my order. Thank you!`;
};

module.exports = {
  sendWhatsAppMessage,
  sendOrderNotification,
  formatCheckoutMessage,
};
