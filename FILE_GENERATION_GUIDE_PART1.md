# COMPLETE FILE GENERATION GUIDE
# This file contains all remaining code that needs to be created
# Copy each section into the specified file path

## ============================================
## BACKEND FILES
## ============================================

### backend/src/utils/logger.js
```javascript
import winston from 'winston'
import config from '../config.js'

const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
})

export default logger
```

### backend/src/middlewares/errorHandler.js
```javascript
import logger from '../utils/logger.js'

export function errorHandler(err, req, res, next) {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  })

  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
```

### backend/src/middlewares/rateLimiter.js
```javascript
import rateLimit from 'express-rate-limit'
import config from '../config.js'

export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})
```

### backend/src/middlewares/authFirebase.js
```javascript
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { initializeFirebase } from '../services/firebase.service.js'

initializeFirebase()

export async function verifyFirebaseToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' })
    }

    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await getAuth().verifyIdToken(token)
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    }

    next()
  } catch (error) {
    console.error('Token verification error:', error)
    return res.status(401).json({ error: 'Unauthorized: Invalid token' })
  }
}

export async function verifyAdmin(req, res, next) {
  try {
    const db = getFirestore()
    const userDoc = await db.collection('users').doc(req.user.uid).get()
    
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' })
    }

    next()
  } catch (error) {
    console.error('Admin verification error:', error)
    return res.status(500).json({ error: 'Error verifying admin status' })
  }
}
```

### backend/src/middlewares/validate.js
```javascript
import Joi from 'joi'

export function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false })
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }))
      
      return res.status(400).json({
        error: 'Validation error',
        details: errors,
      })
    }
    
    next()
  }
}

// Validation schemas
export const schemas = {
  createProduct: Joi.object({
    name: Joi.string().required().min(3).max(200),
    description: Joi.string().allow('').max(1000),
    category: Joi.string().required(),
    subCategory: Joi.string().allow(''),
    priceTier: Joi.string().required(),
    difficulty: Joi.string().valid('Easy', 'Medium', 'Hard').allow(''),
    productionTime: Joi.string().allow(''),
    material: Joi.string().allow(''),
    stockQty: Joi.number().integer().min(0).default(0),
    isActive: Joi.boolean().default(true),
    imageUrl: Joi.string().uri().allow(''),
  }),

  createOrder: Joi.object({
    items: Joi.array().items(
      Joi.object({
        productId: Joi.string().required(),
        productName: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
        priceTier: Joi.string().required(),
      })
    ).min(1).required(),
    customer: Joi.object({
      name: Joi.string().required().min(2).max(100),
      email: Joi.string().email().required(),
      phone: Joi.string().required().pattern(/^\+?[0-9]{10,15}$/),
      address: Joi.string().required().min(10).max(500),
      city: Joi.string().allow('').max(100),
      pincode: Joi.string().allow('').pattern(/^[0-9]{6}$/),
    }).required(),
    notes: Joi.string().allow('').max(500),
  }),
}
```

### backend/src/services/firebase.service.js
```javascript
import admin from 'firebase-admin'
import config from '../config.js'

let firebaseInitialized = false

export function initializeFirebase() {
  if (firebaseInitialized) {
    return admin.app()
  }

  try {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Local development with service account key
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: config.firebaseProjectId,
      })
    } else {
      // Cloud Run with Workload Identity
      admin.initializeApp({
        projectId: config.firebaseProjectId,
      })
    }

    firebaseInitialized = true
    console.log('✓ Firebase Admin SDK initialized')
    return admin.app()
  } catch (error) {
    console.error('Firebase initialization error:', error)
    throw error
  }
}

export { admin }
```

### backend/src/services/storage.service.js
```javascript
import { Storage } from '@google-cloud/storage'
import config from '../config.js'

const storage = new Storage()
const bucket = storage.bucket(config.gcs.bucketName)

export async function generateSignedUploadUrl(fileName, contentType) {
  const file = bucket.file(`products/${Date.now()}-${fileName}`)
  
  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType,
  })

  const publicUrl = `https://storage.googleapis.com/${config.gcs.bucketName}/${file.name}`

  return { signedUrl: url, publicUrl }
}

export async function deleteFile(fileUrl) {
  try {
    const fileName = fileUrl.split('/').pop()
    await bucket.file(`products/${fileName}`).delete()
    return true
  } catch (error) {
    console.error('Error deleting file:', error)
    return false
  }
}
```

### backend/src/services/whatsapp.service.js
```javascript
import twilio from 'twilio'
import config from '../config.js'

let twilioClient = null

// Initialize Twilio client if credentials are available
if (config.twilio.accountSid && config.twilio.authToken) {
  twilioClient = twilio(config.twilio.accountSid, config.twilio.authToken)
}

export async function sendWhatsAppNotification(to, message) {
  if (!twilioClient) {
    console.log('Twilio not configured - skipping WhatsApp notification')
    return { success: false, method: 'wa.me' }
  }

  try {
    const result = await twilioClient.messages.create({
      from: config.twilio.whatsappFrom,
      to: `whatsapp:+${to}`,
      body: message,
    })

    console.log('WhatsApp message sent:', result.sid)
    return { success: true, method: 'twilio', sid: result.sid }
  } catch (error) {
    console.error('Twilio error:', error)
    return { success: false, method: 'twilio', error: error.message }
  }
}

export function formatOrderNotification(order) {
  return `🎉 New Order Received!

Order #${order.id}

Customer: ${order.customer.name}
Phone: ${order.customer.phone}
Email: ${order.customer.email}

Items:
${order.items.map((item, i) => `${i + 1}. ${item.productName} (Qty: ${item.quantity})`).join('\n')}

Address: ${order.customer.address}
${order.customer.city ? `City: ${order.customer.city}` : ''}
${order.customer.pincode ? `Pincode: ${order.customer.pincode}` : ''}

${order.notes ? `Notes: ${order.notes}` : ''}

Please process this order. Order created at: ${new Date(order.createdAt).toLocaleString()}`
}
```

### backend/src/controllers/products.controller.js
```javascript
import { getFirestore } from 'firebase-admin/firestore'
import { initializeFirebase } from '../services/firebase.service.js'

initializeFirebase()
const db = getFirestore()

export async function getProducts(req, res, next) {
  try {
    const { category, search, isActive } = req.query
    
    let query = db.collection('products')
    
    if (category) {
      query = query.where('category', '==', category)
    }
    
    if (isActive !== undefined) {
      query = query.where('isActive', '==', isActive === 'true')
    }
    
    const snapshot = await query.get()
    
    let products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
    
    // Client-side search for flexibility
    if (search) {
      const searchLower = search.toLowerCase()
      products = products.filter(p => 
        p.name?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.category?.toLowerCase().includes(searchLower)
      )
    }
    
    res.json({ products })
  } catch (error) {
    next(error)
  }
}

export async function getProduct(req, res, next) {
  try {
    const { id } = req.params
    
    const doc = await db.collection('products').doc(id).get()
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    res.json({
      id: doc.id,
      ...doc.data(),
    })
  } catch (error) {
    next(error)
  }
}
```

### backend/src/controllers/orders.controller.js
```javascript
import { getFirestore } from 'firebase-admin/firestore'
import { initializeFirebase } from '../services/firebase.service.js'
import { sendWhatsAppNotification, formatOrderNotification } from '../services/whatsapp.service.js'
import config from '../config.js'

initializeFirebase()
const db = getFirestore()

export async function createOrder(req, res, next) {
  try {
    const { items, customer, notes } = req.body
    
    // Create order document
    const orderRef = db.collection('orders').doc()
    const orderData = {
      items,
      customer,
      notes: notes || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    await orderRef.set(orderData)
    
    // Send WhatsApp notification to shop (optional, if Twilio configured)
    const notification = formatOrderNotification({
      id: orderRef.id,
      ...orderData,
    })
    
    await sendWhatsAppNotification(config.whatsapp.shopNumber, notification)
    
    res.status(201).json({
      orderId: orderRef.id,
      status: 'pending',
      message: 'Order created successfully',
    })
  } catch (error) {
    next(error)
  }
}
```

### backend/src/controllers/admin.controller.js
```javascript
import { getFirestore } from 'firebase-admin/firestore'
import { initializeFirebase } from '../services/firebase.service.js'
import { generateSignedUploadUrl } from '../services/storage.service.js'
import csv from 'csv-parse/sync'

initializeFirebase()
const db = getFirestore()

export async function createProduct(req, res, next) {
  try {
    const productData = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    const docRef = await db.collection('products').add(productData)
    
    res.status(201).json({
      id: docRef.id,
      ...productData,
    })
  } catch (error) {
    next(error)
  }
}

export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params
    const updates = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    }
    
    await db.collection('products').doc(id).update(updates)
    
    res.json({
      id,
      message: 'Product updated successfully',
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params
    
    await db.collection('products').doc(id).delete()
    
    res.json({
      message: 'Product deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

export async function getUploadUrl(req, res, next) {
  try {
    const { fileName, contentType } = req.body
    
    const { signedUrl, publicUrl } = await generateSignedUploadUrl(fileName, contentType)
    
    res.json({ signedUrl, publicUrl })
  } catch (error) {
    next(error)
  }
}

export async function getOrders(req, res, next) {
  try {
    const { status, limit = 50 } = req.query
    
    let query = db.collection('orders')
    
    if (status) {
      query = query.where('status', '==', status)
    }
    
    query = query.orderBy('createdAt', 'desc').limit(parseInt(limit))
    
    const snapshot = await query.get()
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
    
    res.json({ orders })
  } catch (error) {
    next(error)
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params
    const { status } = req.body
    
    await db.collection('orders').doc(id).update({
      status,
      updatedAt: new Date().toISOString(),
    })
    
    res.json({
      message: 'Order status updated successfully',
    })
  } catch (error) {
    next(error)
  }
}

export async function importProducts(req, res, next) {
  try {
    const csvData = req.file.buffer.toString()
    const records = csv.parse(csvData, { columns: true, skip_empty_lines: true })
    
    const batch = db.batch()
    let count = 0
    
    for (const record of records) {
      const productRef = db.collection('products').doc()
      const productData = {
        name: record.name,
        description: record.description || '',
        category: record.category,
        subCategory: record.subCategory || '',
        priceTier: record.priceTier,
        difficulty: record.difficulty || '',
        productionTime: record.productionTime || '',
        material: record.material || '',
        stockQty: parseInt(record.stockQty) || 0,
        isActive: record.isActive === 'true',
        imageUrl: record.imageUrl || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      batch.set(productRef, productData)
      count++
    }
    
    await batch.commit()
    
    res.json({
      message: 'Products imported successfully',
      count,
    })
  } catch (error) {
    next(error)
  }
}
```

### backend/src/routes/products.routes.js
```javascript
import express from 'express'
import { getProducts, getProduct } from '../controllers/products.controller.js'

const router = express.Router()

router.get('/', getProducts)
router.get('/:id', getProduct)

export default router
```

### backend/src/routes/orders.routes.js
```javascript
import express from 'express'
import { createOrder } from '../controllers/orders.controller.js'
import { validate, schemas } from '../middlewares/validate.js'

const router = express.Router()

router.post('/', validate(schemas.createOrder), createOrder)

export default router
```

### backend/src/routes/admin.routes.js
```javascript
import express from 'express'
import multer from 'multer'
import { verifyFirebaseToken, verifyAdmin } from '../middlewares/authFirebase.js'
import { validate, schemas } from '../middlewares/validate.js'
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getUploadUrl,
  getOrders,
  updateOrderStatus,
  importProducts,
} from '../controllers/admin.controller.js'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

// All admin routes require authentication
router.use(verifyFirebaseToken)
router.use(verifyAdmin)

// Product management
router.post('/products', validate(schemas.createProduct), createProduct)
router.put('/products/:id', validate(schemas.createProduct), updateProduct)
router.delete('/products/:id', deleteProduct)

// Image upload
router.post('/upload-url', getUploadUrl)

// Order management
router.get('/orders', getOrders)
router.patch('/orders/:id', updateOrderStatus)

// Import products from CSV
router.post('/import', upload.single('file'), importProducts)

export default router
```

### backend/Dockerfile
```dockerfile
# Production-ready Node.js 18 Dockerfile for Cloud Run

FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY src/ ./src/

# Create non-root user
RUN useradd -r -u 1001 -g root nodejs && \
    chown -R nodejs:root /app
USER nodejs

# Expose port (Cloud Run will set PORT env variable)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Start server
CMD ["node", "src/server.js"]
```

### backend/.eslintrc.cjs
```javascript
module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
}
```

## ============================================
## INFRASTRUCTURE FILES
## ============================================

### firebase.json
```json
{
  "hosting": {
    "public": "frontend/dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "pja3d-backend"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

### firestore.rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Products collection - public read, admin write
    match /products/{productId} {
      allow read: if true;  // Anyone can read products
      allow create, update, delete: if isAdmin();
    }
    
    // Orders collection
    match /orders/{orderId} {
      // Anyone can create orders (guest checkout)
      allow create: if true;
      
      // Only admins can read all orders
      allow read: if isAdmin();
      
      // Only admins can update order status
      allow update: if isAdmin();
      
      // No one can delete orders
      allow delete: if false;
    }
    
    // Users collection
    match /users/{userId} {
      // Users can read their own document
      allow read: if isSignedIn() && request.auth.uid == userId;
      
      // Users can create/update their own document
      allow create, update: if isSignedIn() && request.auth.uid == userId;
      
      // Admins can read/update any user
      allow read, update: if isAdmin();
      
      // No one can delete users
      allow delete: if false;
    }
    
    // Settings collection (admin only)
    match /settings/{document} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

### firestore.indexes.json
```json
{
  "indexes": [
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

### storage.rules
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{allPaths=**} {
      // Anyone can read product images
      allow read: if true;
      
      // Only authenticated admins can write
      allow write: if request.auth != null &&
                      firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

I'll continue this file with GitHub Actions, documentation, and scripts in the next section due to length...

---
## TO BE CONTINUED IN NEXT FILE...
This is Part 1 of the complete file generation guide.
```

Now let me create a second comprehensive file with the remaining infrastructure:

