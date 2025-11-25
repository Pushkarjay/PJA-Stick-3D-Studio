// WhatsApp Integration Utilities
// Provides functions to create wa.me links and encode messages

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '916372362313'

/**
 * Create a WhatsApp wa.me link with pre-filled message
 * @param {string} message - The message to pre-fill
 * @returns {string} - wa.me URL
 */
export function createWhatsAppLink(message, number) {
  const whatsAppNumber = number || WHATSAPP_NUMBER;
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${whatsAppNumber}?text=${encodedMessage}`
}

/**
 * Format product order message for WhatsApp
 * @param {object} product - Product object
 * @param {number} quantity - Quantity to order
 * @returns {string} - Formatted message
 */
export function formatProductMessage(product, quantity = 1) {
  return `Hi! I'd like to order:

📦 *${product.name}*
🔢 Quantity: ${quantity}
💰 Price Tier: ${product.priceTier}
${product.category ? `📁 Category: ${product.category}` : ''}

Please let me know the final price and delivery time. Thanks!`
}

/**
 * Format cart checkout message for WhatsApp
 * @param {array} cartItems - Array of cart items { product, quantity }
 * @param {object} customer - Customer details
 * @param {string} orderId - Order ID from backend
 * @returns {string} - Formatted message
 */
export function formatCheckoutMessage(cartItems, customer, orderId) {
  const itemsList = cartItems
    .map((item, index) => {
      return `${index + 1}. *${item.product.name}*
   Qty: ${item.quantity} | Price Tier: ${item.product.priceTier}`
    })
    .join('\n\n')

  return `Hi! I'd like to place an order:

📋 *Order #${orderId}*

*Items:*
${itemsList}

*Customer Details:*
👤 Name: ${customer.name}
📧 Email: ${customer.email}
📱 Phone: ${customer.phone}
📍 Address: ${customer.address}
${customer.city ? `🏙️ City: ${customer.city}` : ''}
${customer.pincode ? `📮 Pincode: ${customer.pincode}` : ''}

${customer.notes ? `📝 *Notes:*\n${customer.notes}` : ''}

Please confirm the order and share the payment details. Thank you!`
}

/**
 * Format inquiry message for WhatsApp
 * @param {string} subject - Inquiry subject
 * @param {string} message - Inquiry message
 * @returns {string} - Formatted message
 */
export function formatInquiryMessage(subject, message) {
  return `Hi! I have an inquiry:

*Subject:* ${subject}

*Message:*
${message}

Looking forward to your response. Thanks!`
}

/**
 * Open WhatsApp in new window with pre-filled message
 * @param {string} message - Message to send
 */
export function openWhatsApp(message, number) {
  const link = createWhatsAppLink(message, number)
  window.open(link, '_blank', 'noopener,noreferrer')
}

/**
 * Validate WhatsApp number format
 * @param {string} number - Phone number to validate
 * @returns {boolean}
 */
export function validateWhatsAppNumber(number) {
  // Remove all non-digit characters
  const cleaned = number.replace(/\D/g, '')
  
  // Should be 10-15 digits
  return cleaned.length >= 10 && cleaned.length <= 15
}

export default {
  createWhatsAppLink,
  formatProductMessage,
  formatCheckoutMessage,
  formatInquiryMessage,
  openWhatsApp,
  validateWhatsAppNumber,
}
