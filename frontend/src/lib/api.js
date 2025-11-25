// API Client for backend communication
// Handles all HTTP requests to the Cloud Run backend

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

/**
 * Helper to make authenticated API requests
 * @param {string} endpoint - API endpoint (e.g., '/api/products')
 * @param {object} options - Fetch options
 * @param {string} token - Firebase ID token (optional, for admin routes)
 */
async function apiRequest(endpoint, options = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || data.message || 'API request failed')
    }

    return data
  } catch (error) {
    console.error('API Request Error:', error)
    throw error
  }
}

// ============================================
// PUBLIC ENDPOINTS (No auth required)
// ============================================

/**
 * Get all products with optional filtering
 * @param {object} filters - { category, search, isActive }
 */
export async function getProducts(filters = {}) {
  const params = new URLSearchParams()
  
  // Add all filter key/value pairs to the params
  for (const key in filters) {
    const value = filters[key];
    if (value && value !== 'All') {
      params.append(key, value);
    }
  }

  const query = params.toString() ? `?${params.toString()}` : ''
  return apiRequest(`/api/products${query}`)
}

/**
 * Get a single product by ID
 * @param {string} productId
 */
export async function getProduct(productId) {
  return apiRequest(`/api/products/${productId}`)
}

/**
 * Create a new order (guest checkout allowed)
 * @param {object} orderData - { items, customer, notes }
 */
export async function createOrder(orderData) {
  return apiRequest('/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  })
}

// ============================================
// ADMIN ENDPOINTS (Require Firebase auth token)
// ============================================

/**
 * Create a new product (admin only)
 * @param {object} productData
 * @param {string} token - Firebase ID token
 */
export async function createProduct(productData, token) {
  return apiRequest('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  }, token)
}

/**
 * Update a product (admin only)
 * @param {string} productId
 * @param {object} productData
 * @param {string} token - Firebase ID token
 */
export async function updateProduct(productId, productData, token) {
  return apiRequest(`/api/admin/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  }, token)
}

/**
 * Delete a product (admin only)
 * @param {string} productId
 * @param {string} token - Firebase ID token
 */
export async function deleteProduct(productId, token) {
  return apiRequest(`/api/admin/products/${productId}`, {
    method: 'DELETE',
  }, token)
}

/**
 * Get signed upload URL for product image (admin only)
 * @param {string} fileName
 * @param {string} contentType
 * @param {string} token - Firebase ID token
 */
export async function getUploadUrl(fileName, contentType, token) {
  return apiRequest('/api/admin/upload-url', {
    method: 'POST',
    body: JSON.stringify({ fileName, contentType }),
  }, token)
}

/**
 * Upload image to Cloud Storage using signed URL
 * @param {string} signedUrl
 * @param {File} file
 */
export async function uploadImage(signedUrl, file) {
  const response = await fetch(signedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  })

  if (!response.ok) {
    throw new Error('Image upload failed')
  }

  return response
}

/**
 * Get all orders (admin only)
 * @param {string} token - Firebase ID token
 * @param {object} filters - { status, limit }
 */
export async function getOrders(token, filters = {}) {
  const params = new URLSearchParams()
  
  if (filters.status) {
    params.append('status', filters.status)
  }
  if (filters.limit) {
    params.append('limit', filters.limit)
  }

  const query = params.toString() ? `?${params.toString()}` : ''
  return apiRequest(`/api/admin/orders${query}`, {}, token)
}

/**
 * Update order status (admin only)
 * @param {string} orderId
 * @param {string} status - 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled'
 * @param {string} token - Firebase ID token
 */
export async function updateOrderStatus(orderId, status, token) {
  return apiRequest(`/api/admin/orders/${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }, token)
}

/**
 * Import products from CSV (admin only)
 * @param {FormData} formData - FormData with 'file' field
 * @param {string} token - Firebase ID token
 */
export async function importProducts(formData, token) {
  const response = await fetch(`${API_URL}/api/admin/import`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Import failed')
  }

  return data
}

export default {
  getProducts,
  getProduct,
  createOrder,
  createProduct,
  updateProduct,
  deleteProduct,
  getUploadUrl,
  uploadImage,
  getOrders,
  updateOrderStatus,
  importProducts,
}
