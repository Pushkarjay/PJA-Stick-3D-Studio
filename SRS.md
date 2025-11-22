# Software Requirements Specification (SRS)
## PJA Stick & 3D Studio E-Commerce Platform

**Version:** 1.0  
**Date:** November 22, 2025  
**Project Name:** PJA3D-FIRE E-Commerce Platform  
**Project ID:** pja3d-fire  
**Organization:** PJA Stick & 3D Studio, Daltonganj

---

## Table of Contents
1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Architecture](#3-system-architecture)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Technology Stack](#6-technology-stack)
7. [Google Cloud & Firebase Services](#7-google-cloud--firebase-services)
8. [API Specifications](#8-api-specifications)
9. [Database Schema](#9-database-schema)
10. [Security Requirements](#10-security-requirements)
11. [Deployment & CI/CD](#11-deployment--cicd)

---

## 1. Introduction

### 1.1 Purpose
This SRS document describes the complete requirements for transforming PJA Stick & 3D Studio from a static website into a fully functional e-commerce platform with backend services, payment integration, user authentication, and cloud deployment.

### 1.2 Scope
The system will enable:
- Online shopping for 3D prints, stickers, and printing services
- User registration and authentication
- Shopping cart and checkout with payment processing
- Order tracking and management
- Admin dashboard for inventory and order management
- Real-time inventory updates
- Image upload and management
- Email notifications
- Analytics and reporting

### 1.3 Business Goals
- Increase online sales by 300%
- Reduce order processing time by 70%
- Enable 24/7 automated ordering
- Scale business operations across Daltonganj region
- Build customer database and loyalty program

---

## 2. Overall Description

### 2.1 Product Perspective
A modern, mobile-first e-commerce platform serving the creative printing and 3D printing industry in Daltonganj, featuring:
- Progressive Web App (PWA) capabilities
- Real-time inventory management
- WhatsApp integration for customer support
- Multi-payment gateway support
- Firebase-powered backend with Google Cloud infrastructure

### 2.2 User Classes

#### 2.2.1 Customers (End Users)
- Browse products and categories
- Create accounts and manage profiles
- Add items to cart and checkout
- Track order status
- Rate and review products
- Save favorite items

#### 2.2.2 Admin Users
- Manage product catalog (CRUD operations)
- Process and fulfill orders
- Manage inventory and pricing
- View analytics and reports
- Manage customer inquiries
- Update website content

#### 2.2.3 Super Admin
- User role management
- System configuration
- Database backups
- Security settings
- API key management

### 2.3 Operating Environment
- **Frontend:** Modern web browsers (Chrome, Firefox, Safari, Edge)
- **Backend:** Node.js on Firebase Cloud Functions / Google Cloud Run
- **Database:** Firebase Firestore (NoSQL)
- **Storage:** Firebase Storage / Google Cloud Storage
- **Hosting:** Firebase Hosting
- **CDN:** Firebase CDN / Cloudflare

---

## 3. System Architecture

### 3.1 Architecture Overview
```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  React/  │  │ Shopping │  │   User   │  │  Admin   │   │
│  │ Vanilla  │  │   Cart   │  │  Portal  │  │  Panel   │   │
│  │   JS     │  │          │  │          │  │          │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼─────────────┼─────────────┼─────────────┼──────────┘
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                          │
                    HTTPS/REST API
                          │
┌─────────────────────────┼─────────────────────────────────┐
│                   BACKEND LAYER                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │        Express.js API Server (Cloud Run)           │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐          │   │
│  │  │ Products │ │  Orders  │ │   Auth   │          │   │
│  │  │   API    │ │   API    │ │   API    │          │   │
│  │  └──────────┘ └──────────┘ └──────────┘          │   │
│  └────────┬───────────────────────────┬───────────────┘   │
│           │                           │                    │
│  ┌────────▼─────────┐        ┌───────▼─────────┐         │
│  │  Firebase Admin  │        │  Payment Gateway│         │
│  │      SDK         │        │ (Razorpay/Stripe)│        │
│  └──────────────────┘        └──────────────────┘         │
└────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────┼─────────────────────────────────┐
│                    DATA LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Firestore  │  │   Firebase   │  │    Cloud     │   │
│  │   Database   │  │   Storage    │  │    Storage   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└────────────────────────────────────────────────────────────┘
```

### 3.2 Technology Architecture
- **Frontend Framework:** Vanilla JS (current) → React.js (future enhancement)
- **Backend:** Node.js + Express.js
- **Database:** Firebase Firestore
- **Authentication:** Firebase Authentication
- **File Storage:** Firebase Storage
- **Hosting:** Firebase Hosting
- **Functions:** Firebase Cloud Functions / Google Cloud Run
- **CI/CD:** GitHub Actions
- **Monitoring:** Google Cloud Monitoring

---

## 4. Functional Requirements

### 4.1 User Management

#### FR-UM-001: User Registration
- Users can register using email/password
- Users can register using Google OAuth
- Email verification required
- Profile creation with name, phone, address

#### FR-UM-002: User Authentication
- Secure login with JWT tokens
- Password reset via email
- Remember me functionality
- Session management (24-hour expiry)

#### FR-UM-003: User Profile
- View and edit profile information
- Update delivery addresses (multiple addresses)
- Change password
- View order history
- Delete account option

### 4.2 Product Management

#### FR-PM-001: Product Catalog
- Display all products with pagination
- Filter by category (3D Print, Stickers, Printing)
- Filter by price range
- Search functionality
- Sort by: price, popularity, newest

#### FR-PM-002: Product Details
- Product name, description, images
- Pricing information
- Availability status
- Estimated production time
- Material specifications
- Customer reviews and ratings

#### FR-PM-003: Admin Product Management
- Add new products with multiple images
- Edit existing products
- Delete products (soft delete)
- Bulk upload via CSV
- Manage inventory quantities
- Set product visibility (active/inactive)

### 4.3 Shopping Cart

#### FR-SC-001: Cart Operations
- Add items to cart
- Update item quantities
- Remove items from cart
- Save cart to local storage (guest users)
- Sync cart with server (logged-in users)
- Cart persists across sessions

#### FR-SC-002: Cart Display
- Show item count in header
- Display total price
- Show estimated delivery time
- Apply coupon codes
- Calculate taxes and fees

### 4.4 Order Management

#### FR-OM-001: Checkout Process
- Review cart items
- Select/add delivery address
- Choose payment method
- Apply discount codes
- Confirm order details

#### FR-OM-002: Payment Processing
- Integration with Razorpay (primary)
- Support UPI, cards, net banking
- Payment status tracking
- Refund processing
- Payment receipts via email

#### FR-OM-003: Order Tracking
- Real-time order status updates
- Status: Pending → Confirmed → In Production → Ready → Shipped → Delivered
- WhatsApp notifications for status changes
- Estimated delivery dates
- Order cancellation (within 1 hour)

#### FR-OM-004: Admin Order Management
- View all orders with filters
- Update order status
- Print order receipts
- Mark orders as completed
- Handle returns/refunds
- Export orders to CSV

### 4.5 Admin Dashboard

#### FR-AD-001: Dashboard Overview
- Total sales analytics
- Orders summary (pending, completed)
- Popular products
- Revenue charts (daily, weekly, monthly)
- Low stock alerts

#### FR-AD-002: Inventory Management
- Real-time stock levels
- Low stock notifications
- Bulk stock updates
- Material tracking (PLA, vinyl, paper)

#### FR-AD-003: Customer Management
- View customer list
- Customer purchase history
- Customer lifetime value
- Export customer data

### 4.6 Additional Features

#### FR-AF-001: Reviews & Ratings
- Customers can rate products (1-5 stars)
- Write text reviews
- Upload photos of received products
- Admin moderation of reviews

#### FR-AF-002: Wishlist
- Add products to wishlist
- Share wishlist
- Move items to cart

#### FR-AF-003: Notifications
- Email notifications for orders
- WhatsApp order confirmations
- SMS for delivery updates
- Push notifications (PWA)

#### FR-AF-004: Search & Recommendations
- Full-text search across products
- Search suggestions
- Recently viewed products
- "Customers also bought" recommendations

---

## 5. Non-Functional Requirements

### 5.1 Performance
- **NFR-P-001:** Page load time < 2 seconds
- **NFR-P-002:** API response time < 500ms
- **NFR-P-003:** Support 1000 concurrent users
- **NFR-P-004:** Database query time < 100ms
- **NFR-P-005:** Image loading optimized with lazy loading

### 5.2 Security
- **NFR-S-001:** HTTPS encryption for all traffic
- **NFR-S-002:** Password hashing with bcrypt
- **NFR-S-003:** XSS and CSRF protection
- **NFR-S-004:** API rate limiting (100 req/min per IP)
- **NFR-S-005:** Secure payment gateway integration
- **NFR-S-006:** Regular security audits
- **NFR-S-007:** Firebase Security Rules for Firestore

### 5.3 Reliability
- **NFR-R-001:** 99.9% uptime
- **NFR-R-002:** Automated backups (daily)
- **NFR-R-003:** Disaster recovery plan
- **NFR-R-004:** Error logging and monitoring

### 5.4 Scalability
- **NFR-SC-001:** Horizontal scaling with Cloud Run
- **NFR-SC-002:** CDN for static assets
- **NFR-SC-003:** Database indexing for performance
- **NFR-SC-004:** Caching strategy (Redis/Memcached)

### 5.5 Usability
- **NFR-U-001:** Mobile-first responsive design
- **NFR-U-002:** Accessibility (WCAG 2.1 Level AA)
- **NFR-U-003:** Multi-language support (Hindi, English)
- **NFR-U-004:** Intuitive navigation
- **NFR-U-005:** Consistent UI/UX across pages

### 5.6 Maintainability
- **NFR-M-001:** Clean code with ESLint
- **NFR-M-002:** Comprehensive API documentation
- **NFR-M-003:** Unit test coverage > 80%
- **NFR-M-004:** Automated CI/CD pipeline

---

## 6. Technology Stack

### 6.1 Frontend
```json
{
  "core": "HTML5, CSS3, JavaScript ES6+",
  "framework": "Vanilla JS (Phase 1) / React.js (Phase 2)",
  "styling": "CSS Grid, Flexbox, Custom Properties",
  "icons": "SVG Icons",
  "state-management": "localStorage / Context API (React)",
  "http-client": "Fetch API / Axios"
}
```

### 6.2 Backend
```json
{
  "runtime": "Node.js v18+",
  "framework": "Express.js v4.x",
  "authentication": "Firebase Auth + JWT",
  "validation": "Joi / Express-validator",
  "logging": "Winston",
  "testing": "Jest + Supertest"
}
```

### 6.3 Database
```json
{
  "primary": "Firebase Firestore (NoSQL)",
  "structure": "Collections: users, products, orders, reviews, cart",
  "indexing": "Composite indexes for complex queries",
  "backup": "Automated daily backups to Cloud Storage"
}
```

### 6.4 DevOps & Infrastructure
```json
{
  "version-control": "Git + GitHub",
  "ci-cd": "GitHub Actions",
  "hosting": "Firebase Hosting",
  "functions": "Firebase Cloud Functions / Cloud Run",
  "monitoring": "Google Cloud Monitoring + Logging",
  "cdn": "Firebase CDN",
  "ssl": "Automatic via Firebase"
}
```

---

## 7. Google Cloud & Firebase Services

### 7.1 Firebase Services (Required)

#### 7.1.1 Firebase Authentication
- **Purpose:** User authentication and authorization
- **Methods:** Email/Password, Google Sign-In
- **Configuration:**
  - Enable Email/Password provider
  - Configure Google OAuth 2.0
  - Setup email templates for verification
- **Usage:** User login, registration, password reset

#### 7.1.2 Firebase Firestore
- **Purpose:** Primary database for structured data
- **Collections:**
  - `users` - User profiles and preferences
  - `products` - Product catalog
  - `orders` - Order history and tracking
  - `cart` - Shopping cart data
  - `reviews` - Product reviews
  - `inventory` - Stock management
  - `settings` - App configuration
- **Security Rules:** Role-based access control
- **Indexing:** Composite indexes for filtering

#### 7.1.3 Firebase Storage
- **Purpose:** Store product images, user uploads
- **Buckets:**
  - `products/` - Product images
  - `reviews/` - Customer review photos
  - `profiles/` - User profile pictures
- **Features:**
  - Image compression
  - Thumbnail generation
  - Access control via security rules

#### 7.1.4 Firebase Hosting
- **Purpose:** Host frontend application
- **Features:**
  - Global CDN
  - Automatic SSL certificates
  - Custom domain support
  - Preview channels for testing
- **Configuration:** `firebase.json`

#### 7.1.5 Firebase Cloud Functions (Optional)
- **Purpose:** Serverless backend functions
- **Functions:**
  - `onOrderCreate` - Send notifications
  - `onPaymentSuccess` - Update order status
  - `generateInvoice` - Create PDF invoices
  - `syncInventory` - Update stock levels

### 7.2 Google Cloud Services (To Enable)

#### 7.2.1 Google Cloud Run
- **Purpose:** Host Express.js backend API
- **Configuration:**
  - Container: Node.js 18
  - Memory: 512 MB
  - Auto-scaling: 0-10 instances
  - Region: asia-south1 (Mumbai)
- **Deployment:** Docker container via GitHub Actions

#### 7.2.2 Cloud Storage
- **Purpose:** Backup storage, large file storage
- **Buckets:**
  - `pja3d-fire-backups` - Database backups
  - `pja3d-fire-exports` - Data exports (CSV, PDF)
- **Lifecycle:** Auto-delete backups after 90 days

#### 7.2.3 Cloud Monitoring & Logging
- **Purpose:** Application monitoring and debugging
- **Metrics:**
  - API response times
  - Error rates
  - User activity
  - Payment transactions
- **Alerts:** Email/SMS for critical errors

#### 7.2.4 Cloud Secret Manager
- **Purpose:** Store API keys and credentials securely
- **Secrets:**
  - Razorpay API keys
  - SMTP credentials
  - WhatsApp API token
  - JWT signing key

#### 7.2.5 Cloud Build (for CI/CD)
- **Purpose:** Automated builds and deployments
- **Triggers:**
  - Push to `main` branch → Production
  - Push to `develop` branch → Staging
  - Pull request → Preview deployment

#### 7.2.6 Cloud Scheduler (Optional)
- **Purpose:** Scheduled tasks
- **Jobs:**
  - Daily backup at 2 AM IST
  - Weekly inventory report
  - Monthly sales analytics email

### 7.3 IAM & Permissions Setup

#### Service Account: `firebase-adminsdk-fbsvc@pja3d-fire.iam.gserviceaccount.com`
- **Roles:**
  - Firebase Admin SDK Administrator
  - Service Account Token Creator
  
#### Owner Account: `pushkarjay.ajay1@gmail.com`
- **Roles:**
  - Project Owner
  - Full access to all services

#### Additional Service Accounts Needed:
```
github-actions@pja3d-fire.iam.gserviceaccount.com
  - Cloud Run Admin
  - Firebase Hosting Admin
  - Storage Admin
  
backend-api@pja3d-fire.iam.gserviceaccount.com
  - Firestore User
  - Storage Object Admin
  - Cloud Functions Invoker
```

### 7.4 Firebase Configuration Files

#### `.firebaserc`
```json
{
  "projects": {
    "default": "pja3d-fire"
  }
}
```

#### `firebase.json`
```json
{
  "hosting": {
    "public": "public",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "/api/**",
        "run": {
          "serviceId": "pja3d-backend",
          "region": "asia-south1"
        }
      },
      {
        "source": "**",
        "destination": "/index.html"
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

### 7.5 Cost Estimation (Monthly)

| Service | Free Tier | Estimated Usage | Cost |
|---------|-----------|-----------------|------|
| Firebase Hosting | 10 GB/month | 5 GB | $0 |
| Firestore | 50K reads/day | ~200K reads | $6 |
| Storage | 5 GB | 20 GB | $0.50 |
| Cloud Run | 2M requests | ~500K requests | $0 |
| Authentication | 10K MAU | ~1K users | $0 |
| Cloud Monitoring | 150 MB logs | 100 MB | $0 |
| **Total** | | | **~$7/month** |

*Note: Costs will scale with traffic. Monitor usage regularly.*

---

## 8. API Specifications

### 8.1 Base URL
```
Production: https://api.pja3d.com
Staging: https://staging-api.pja3d.com
Local: http://localhost:5000
```

### 8.2 Authentication
All authenticated endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

### 8.3 API Endpoints

#### 8.3.1 Authentication API
```
POST   /api/auth/register        - Register new user
POST   /api/auth/login           - User login
POST   /api/auth/logout          - User logout
POST   /api/auth/refresh         - Refresh JWT token
POST   /api/auth/forgot-password - Request password reset
POST   /api/auth/reset-password  - Reset password with token
GET    /api/auth/verify-email    - Verify email address
```

#### 8.3.2 Products API
```
GET    /api/products             - List all products (paginated)
GET    /api/products/:id         - Get product by ID
POST   /api/products             - Create product (Admin)
PUT    /api/products/:id         - Update product (Admin)
DELETE /api/products/:id         - Delete product (Admin)
GET    /api/products/category/:cat - Get products by category
GET    /api/products/search      - Search products
```

#### 8.3.3 Cart API
```
GET    /api/cart                 - Get user cart
POST   /api/cart/add             - Add item to cart
PUT    /api/cart/update/:itemId  - Update cart item quantity
DELETE /api/cart/remove/:itemId  - Remove item from cart
DELETE /api/cart/clear           - Clear entire cart
```

#### 8.3.4 Orders API
```
GET    /api/orders               - Get user orders
GET    /api/orders/:id           - Get order details
POST   /api/orders/create        - Create new order
PUT    /api/orders/:id/cancel    - Cancel order
GET    /api/orders/:id/track     - Track order status
```

#### 8.3.5 Payment API
```
POST   /api/payment/create       - Create payment order
POST   /api/payment/verify       - Verify payment signature
POST   /api/payment/webhook      - Payment gateway webhook
```

#### 8.3.6 Admin API
```
GET    /api/admin/dashboard      - Dashboard statistics
GET    /api/admin/orders         - All orders (filterable)
PUT    /api/admin/orders/:id     - Update order status
GET    /api/admin/users          - List all users
GET    /api/admin/analytics      - Sales analytics
POST   /api/admin/products/bulk  - Bulk upload products
```

#### 8.3.7 Reviews API
```
GET    /api/reviews/:productId   - Get product reviews
POST   /api/reviews              - Create review
PUT    /api/reviews/:id          - Update review
DELETE /api/reviews/:id          - Delete review
```

### 8.4 Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "timestamp": "2025-11-22T10:30:00Z"
}
```

### 8.5 Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {"field": "email", "message": "Invalid email format"}
    ]
  },
  "timestamp": "2025-11-22T10:30:00Z"
}
```

---

## 9. Database Schema

### 9.1 Firestore Collections

#### Collection: `users`
```javascript
{
  uid: string,              // Firebase Auth UID
  email: string,
  displayName: string,
  phoneNumber: string,
  photoURL: string,
  role: string,             // 'customer', 'admin', 'super_admin'
  addresses: [
    {
      id: string,
      label: string,        // 'Home', 'Work', etc.
      street: string,
      city: string,
      state: string,
      pincode: string,
      phone: string,
      isDefault: boolean
    }
  ],
  createdAt: timestamp,
  updatedAt: timestamp,
  lastLogin: timestamp,
  isActive: boolean
}
```

#### Collection: `products`
```javascript
{
  id: string,
  name: string,
  slug: string,
  description: string,
  category: string,         // '3D Print', 'Stickers', 'Printing'
  subCategory: string,
  price: number,
  compareAtPrice: number,   // Original price for discount display
  costPrice: number,        // For profit calculation
  images: [
    {
      url: string,
      alt: string,
      isPrimary: boolean
    }
  ],
  specifications: {
    material: string,
    difficulty: string,     // 'Easy', 'Moderate', 'Complex'
    productionTime: string, // '2-3 Hours'
    weight: number,         // in grams
    dimensions: string      // 'L x W x H'
  },
  inventory: {
    stockQuantity: number,
    lowStockThreshold: number,
    trackInventory: boolean
  },
  seo: {
    metaTitle: string,
    metaDescription: string,
    keywords: [string]
  },
  stats: {
    viewCount: number,
    salesCount: number,
    reviewCount: number,
    averageRating: number
  },
  isActive: boolean,
  isFeatured: boolean,
  isTrending: boolean,
  createdAt: timestamp,
  updatedAt: timestamp,
  createdBy: string        // Admin UID
}
```

#### Collection: `orders`
```javascript
{
  id: string,
  orderNumber: string,      // e.g., 'PJA-20251122-001'
  customerId: string,       // User UID
  items: [
    {
      productId: string,
      productName: string,
      quantity: number,
      price: number,
      subtotal: number
    }
  ],
  pricing: {
    subtotal: number,
    tax: number,            // GST 18%
    shipping: number,
    discount: number,
    total: number
  },
  shippingAddress: {
    name: string,
    phone: string,
    street: string,
    city: string,
    state: string,
    pincode: string
  },
  payment: {
    method: string,         // 'razorpay', 'cod'
    status: string,         // 'pending', 'completed', 'failed'
    transactionId: string,
    paidAt: timestamp
  },
  status: string,           // 'pending', 'confirmed', 'in_production', 'ready', 'shipped', 'delivered', 'cancelled'
  timeline: [
    {
      status: string,
      timestamp: timestamp,
      note: string
    }
  ],
  notes: string,            // Customer notes
  adminNotes: string,       // Internal notes
  estimatedDelivery: timestamp,
  deliveredAt: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Collection: `cart`
```javascript
{
  userId: string,
  items: [
    {
      productId: string,
      quantity: number,
      addedAt: timestamp
    }
  ],
  updatedAt: timestamp
}
```

#### Collection: `reviews`
```javascript
{
  id: string,
  productId: string,
  userId: string,
  userName: string,
  rating: number,           // 1-5
  title: string,
  comment: string,
  images: [string],
  isVerifiedPurchase: boolean,
  helpful: {
    count: number,
    voters: [string]        // User IDs who found helpful
  },
  status: string,           // 'pending', 'approved', 'rejected'
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Collection: `settings`
```javascript
{
  id: 'site_config',
  siteName: string,
  contactEmail: string,
  contactPhone: string,
  whatsappNumber: string,
  address: object,
  socialMedia: {
    facebook: string,
    instagram: string,
    youtube: string
  },
  businessHours: string,
  taxRate: number,
  shippingRates: [
    {
      zone: string,
      minOrder: number,
      rate: number
    }
  ],
  paymentMethods: {
    razorpay: {
      enabled: boolean,
      keyId: string
    },
    cod: {
      enabled: boolean,
      minOrder: number
    }
  },
  notifications: {
    emailEnabled: boolean,
    smsEnabled: boolean,
    whatsappEnabled: boolean
  }
}
```

### 9.2 Firestore Indexes
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
        { "fieldPath": "customerId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## 10. Security Requirements

### 10.1 Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'super_admin'];
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Products collection
    match /products/{productId} {
      allow read: if true;  // Public
      allow create, update, delete: if isAdmin();
    }
    
    // Orders collection
    match /orders/{orderId} {
      allow read: if isOwner(resource.data.customerId) || isAdmin();
      allow create: if isAuthenticated();
      allow update: if isAdmin();
      allow delete: if false;  // Never delete orders
    }
    
    // Cart collection
    match /cart/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // Reviews collection
    match /reviews/{reviewId} {
      allow read: if resource.data.status == 'approved';
      allow create: if isAuthenticated();
      allow update: if isOwner(resource.data.userId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Settings collection
    match /settings/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

### 10.2 Firebase Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Product images
    match /products/{imageId} {
      allow read: if true;
      allow write: if request.auth != null && 
                    request.resource.size < 5 * 1024 * 1024 &&  // 5MB limit
                    request.resource.contentType.matches('image/.*');
    }
    
    // Review images
    match /reviews/{userId}/{imageId} {
      allow read: if true;
      allow write: if request.auth != null && 
                    request.auth.uid == userId &&
                    request.resource.size < 2 * 1024 * 1024;  // 2MB limit
    }
    
    // Profile pictures
    match /profiles/{userId} {
      allow read: if true;
      allow write: if request.auth != null && 
                    request.auth.uid == userId &&
                    request.resource.size < 1 * 1024 * 1024;  // 1MB limit
    }
  }
}
```

### 10.3 API Security
- Rate limiting: 100 requests/minute per IP
- Input validation with Joi schemas
- SQL injection prevention (N/A for Firestore)
- XSS protection with DOMPurify
- CORS configuration for allowed origins
- Helmet.js for HTTP headers security
- JWT token expiration: 24 hours
- Refresh tokens: 30 days

---

## 11. Deployment & CI/CD

### 11.1 GitHub Actions Workflow

#### File: `.github/workflows/deploy.yml`
```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  PROJECT_ID: pja3d-fire

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install Dependencies
      run: |
        cd backend
        npm ci
        cd ../frontend
        npm ci
    
    - name: Run Tests
      run: |
        cd backend
        npm test
    
    - name: Build Frontend
      run: |
        cd frontend
        npm run build
    
    - name: Deploy to Firebase Hosting
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
        projectId: ${{ env.PROJECT_ID }}
        channelId: live
    
    - name: Deploy Backend to Cloud Run
      uses: google-github-actions/deploy-cloudrun@v1
      with:
        service: pja3d-backend
        region: asia-south1
        source: ./backend
        credentials: ${{ secrets.GCP_SA_KEY }}
```

### 11.2 Environment Variables

#### Backend `.env`
```env
# Firebase Config
FIREBASE_PROJECT_ID=pja3d-fire
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@pja3d-fire.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=<private-key>

# JWT
JWT_SECRET=<random-secret>
JWT_EXPIRY=24h

# Payment Gateway
RAZORPAY_KEY_ID=<key-id>
RAZORPAY_KEY_SECRET=<key-secret>

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASS=<app-password>

# WhatsApp
WHATSAPP_API_TOKEN=<token>
WHATSAPP_PHONE_ID=<phone-id>

# App Config
NODE_ENV=production
PORT=8080
API_BASE_URL=https://api.pja3d.com
FRONTEND_URL=https://pja3d.com
```

### 11.3 Deployment Checklist
- [ ] Firebase project created: `pja3d-fire`
- [ ] Firebase CLI installed
- [ ] Service accounts configured
- [ ] Environment variables set in Cloud Secret Manager
- [ ] GitHub secrets configured
- [ ] Firestore database provisioned
- [ ] Firebase Storage bucket created
- [ ] Custom domain configured
- [ ] SSL certificates active
- [ ] Payment gateway keys added
- [ ] Email SMTP configured
- [ ] Monitoring alerts setup
- [ ] Backup strategy implemented

---

## 12. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Setup project structure
- Configure Firebase services
- Implement authentication
- Create basic API endpoints
- Setup CI/CD pipeline

### Phase 2: Core Features (Week 3-4)
- Product catalog with CRUD
- Shopping cart functionality
- Checkout flow
- Payment integration
- Order management

### Phase 3: Admin Panel (Week 5)
- Admin dashboard
- Product management
- Order processing
- Inventory management
- Analytics

### Phase 4: Enhancements (Week 6)
- Reviews & ratings
- Search & filters
- Email notifications
- WhatsApp integration
- Image optimization

### Phase 5: Testing & Launch (Week 7-8)
- Comprehensive testing
- Performance optimization
- Security audit
- User acceptance testing
- Production deployment

---

## 13. Success Metrics

### 13.1 Technical Metrics
- Page load time < 2s
- API response time < 500ms
- 99.9% uptime
- Zero critical security vulnerabilities
- Test coverage > 80%

### 13.2 Business Metrics
- 100+ products cataloged
- 50+ orders per month
- Cart abandonment rate < 40%
- Customer retention rate > 60%
- Average order value: ₹500+

### 13.3 User Metrics
- User registration rate: 30%
- Repeat purchase rate: 40%
- Average session duration: 5+ minutes
- Mobile traffic: 70%+
- Customer satisfaction: 4.5+ stars

---

## 14. Maintenance & Support

### 14.1 Regular Maintenance
- Daily automated backups
- Weekly security updates
- Monthly performance audits
- Quarterly feature releases

### 14.2 Monitoring
- Real-time error tracking (Sentry)
- Performance monitoring (Cloud Monitoring)
- User behavior analytics (Google Analytics)
- Uptime monitoring (UptimeRobot)

### 14.3 Support Channels
- WhatsApp: +91 6372362313
- Email: support@pja3d.com
- Admin dashboard chat
- Help documentation

---

## 15. Future Enhancements

### Phase 2 Features (3-6 months)
- Mobile app (React Native)
- Loyalty rewards program
- Subscription service
- 3D model customizer
- AR product preview
- Multi-vendor marketplace
- Affiliate program
- Bulk order discounts

### Advanced Features (6-12 months)
- AI-powered product recommendations
- Voice search
- Chatbot support
- Inventory prediction with ML
- Multi-currency support
- International shipping
- Social commerce integration

---

## Appendix

### A. Glossary
- **PLA:** Polylactic Acid (3D printing material)
- **Lithophane:** 3D print that reveals image when backlit
- **MAU:** Monthly Active Users
- **CAC:** Customer Acquisition Cost
- **LTV:** Lifetime Value

### B. References
- Firebase Documentation: https://firebase.google.com/docs
- Google Cloud Documentation: https://cloud.google.com/docs
- Razorpay Integration: https://razorpay.com/docs
- Express.js Guide: https://expressjs.com
- Firestore Best Practices: https://firebase.google.com/docs/firestore/best-practices

### C. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Nov 22, 2025 | PJA Team | Initial SRS document |

---

**End of Document**

*For questions or clarifications, contact: pushkarjay.ajay1@gmail.com*
