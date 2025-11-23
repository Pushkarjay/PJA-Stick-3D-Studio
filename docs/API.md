# API Documentation

Complete REST API reference for PJA Stick & 3D Studio backend.

**Base URL**: `https://backend-api-xxx.run.app` (replace with your Cloud Run URL)

---

## Authentication

Admin endpoints require Firebase ID token in Authorization header:

```
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

Get token after Firebase login:
```javascript
const user = await signInWithEmailAndPassword(auth, email, password);
const token = await user.user.getIdToken();
```

---

## Public Endpoints

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production"
}
```

---

## Products

### GET /api/products
Get all active products with optional filtering.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category: `stickers`, `banners`, `signboards`, `t-shirts`, `3d-printing` |
| `search` | string | Search in product name and description |
| `isActive` | boolean | Filter by active status (default: true) |

**Example:**
```bash
GET /api/products?category=stickers&search=custom
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod_123",
      "name": "Custom Vinyl Sticker",
      "description": "High-quality waterproof vinyl stickers",
      "category": "stickers",
      "priceTier": "₹0-50",
      "difficulty": "Easy",
      "productionTime": "1-2 days",
      "material": "Vinyl",
      "stockStatus": "In Stock",
      "imageUrl": "https://storage.googleapis.com/bucket/products/sticker1.jpg",
      "isActive": true,
      "createdAt": "2024-01-10T08:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid query parameters
- `500` - Server error

---

### GET /api/products/:id
Get a single product by ID.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Product ID |

**Example:**
```bash
GET /api/products/prod_123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "prod_123",
    "name": "Custom Vinyl Sticker",
    "description": "High-quality waterproof vinyl stickers",
    "category": "stickers",
    "priceTier": "₹0-50",
    "difficulty": "Easy",
    "productionTime": "1-2 days",
    "material": "Vinyl",
    "stockStatus": "In Stock",
    "imageUrl": "https://storage.googleapis.com/bucket/products/sticker1.jpg",
    "isActive": true,
    "createdAt": "2024-01-10T08:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - Product not found
- `500` - Server error

---

## Orders

### POST /api/orders
Create a new order (guest checkout).

**Request Body:**
```json
{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "9876543210",
  "items": [
    {
      "productId": "prod_123",
      "productName": "Custom Vinyl Sticker",
      "quantity": 5,
      "priceTier": "₹0-50"
    }
  ],
  "notes": "Please use blue color"
}
```

**Validation:**
- `customerName`: Required, 2-100 characters
- `customerEmail`: Required, valid email format
- `customerPhone`: Required, 10 digits
- `items`: Required, array with at least 1 item
- `items[].productId`: Required, valid Firestore document ID
- `items[].productName`: Required
- `items[].quantity`: Required, min 1
- `items[].priceTier`: Required
- `notes`: Optional, max 500 characters

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "order_456",
    "orderNumber": "ORD-20240115-A1B2",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "9876543210",
    "items": [
      {
        "productId": "prod_123",
        "productName": "Custom Vinyl Sticker",
        "quantity": 5,
        "priceTier": "₹0-50"
      }
    ],
    "totalItems": 5,
    "status": "pending",
    "notes": "Please use blue color",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Order created successfully"
}
```

**Status Codes:**
- `201` - Order created
- `400` - Validation error
- `500` - Server error

**Note:** If Twilio is configured, a WhatsApp notification is sent automatically to the business number.

---

## Admin Endpoints
**All admin endpoints require authentication.**

### POST /api/admin/products
Create a new product.

**Headers:**
```
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

**Request Body:**
```json
{
  "name": "Custom Banner",
  "description": "Large format vinyl banner for events",
  "category": "banners",
  "priceTier": "₹500-5000",
  "difficulty": "Medium",
  "productionTime": "3-5 days",
  "material": "Vinyl Banner",
  "stockStatus": "In Stock",
  "imageUrl": "https://storage.googleapis.com/bucket/products/banner1.jpg",
  "isActive": true
}
```

**Validation:**
- `name`: Required, 3-100 characters
- `description`: Required, 10-500 characters
- `category`: Required, one of: `stickers`, `banners`, `signboards`, `t-shirts`, `3d-printing`
- `priceTier`: Required, one of: `₹0-50`, `₹50-500`, `₹500-5000`, `₹5000+`
- `difficulty`: Required, one of: `Easy`, `Medium`, `Hard`
- `productionTime`: Required, one of: `1-2 days`, `3-5 days`, `1-2 weeks`
- `material`: Required
- `stockStatus`: Required, one of: `In Stock`, `Low Stock`, `Out of Stock`
- `imageUrl`: Required, valid URL
- `isActive`: Optional, boolean (default: true)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "prod_789",
    "name": "Custom Banner",
    "description": "Large format vinyl banner for events",
    "category": "banners",
    "priceTier": "₹500-5000",
    "difficulty": "Medium",
    "productionTime": "3-5 days",
    "material": "Vinyl Banner",
    "stockStatus": "In Stock",
    "imageUrl": "https://storage.googleapis.com/bucket/products/banner1.jpg",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Product created successfully"
}
```

**Status Codes:**
- `201` - Product created
- `400` - Validation error
- `401` - Unauthorized (no token)
- `403` - Forbidden (not admin)
- `500` - Server error

---

### PUT /api/admin/products/:id
Update an existing product.

**Headers:**
```
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Product ID |

**Request Body:** Same as create, all fields optional

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "prod_789",
    "name": "Updated Banner",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  },
  "message": "Product updated successfully"
}
```

**Status Codes:**
- `200` - Product updated
- `400` - Validation error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Product not found
- `500` - Server error

---

### DELETE /api/admin/products/:id
Delete a product (soft delete - sets isActive to false).

**Headers:**
```
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Product ID |

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

**Status Codes:**
- `200` - Product deleted
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Product not found
- `500` - Server error

---

### GET /api/admin/products
Get all products (including inactive).

**Headers:**
```
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category |
| `isActive` | boolean | Filter by active status (optional) |

**Response:** Same as public GET /api/products

---

### GET /api/admin/upload-url
Get a signed URL for uploading product images to Cloud Storage.

**Headers:**
```
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `fileName` | string | File name (e.g., "product.jpg") |
| `contentType` | string | MIME type (e.g., "image/jpeg") |

**Example:**
```bash
GET /api/admin/upload-url?fileName=banner1.jpg&contentType=image/jpeg
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://storage.googleapis.com/bucket/products/1234567890-banner1.jpg?X-Goog-Algorithm=...",
    "publicUrl": "https://storage.googleapis.com/bucket/products/1234567890-banner1.jpg",
    "expiresIn": 900
  }
}
```

**Upload Flow:**
1. Request signed URL from this endpoint
2. Upload file directly to `uploadUrl` using PUT request
3. Save `publicUrl` in product `imageUrl` field

**Example Upload:**
```javascript
// 1. Get signed URL
const { uploadUrl, publicUrl } = await getUploadUrl('product.jpg', 'image/jpeg');

// 2. Upload file
await fetch(uploadUrl, {
  method: 'PUT',
  headers: { 'Content-Type': 'image/jpeg' },
  body: fileBlob
});

// 3. Create product with publicUrl
await createProduct({ imageUrl: publicUrl, ... });
```

**Status Codes:**
- `200` - URL generated
- `400` - Missing parameters
- `401` - Unauthorized
- `403` - Forbidden
- `500` - Server error

---

### GET /api/admin/orders
Get all orders with optional filtering.

**Headers:**
```
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status: `pending`, `confirmed`, `in-progress`, `completed`, `cancelled` |
| `limit` | number | Number of orders to return (default: 50, max: 100) |
| `startAfter` | string | Order ID for pagination |

**Example:**
```bash
GET /api/admin/orders?status=pending&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "order_456",
      "orderNumber": "ORD-20240115-A1B2",
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "customerPhone": "9876543210",
      "items": [
        {
          "productId": "prod_123",
          "productName": "Custom Vinyl Sticker",
          "quantity": 5,
          "priceTier": "₹0-50"
        }
      ],
      "totalItems": 5,
      "status": "pending",
      "notes": "Please use blue color",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "count": 1,
  "hasMore": false
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `403` - Forbidden
- `500` - Server error

---

### PATCH /api/admin/orders/:id/status
Update order status.

**Headers:**
```
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Order ID |

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Validation:**
- `status`: Required, one of: `pending`, `confirmed`, `in-progress`, `completed`, `cancelled`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "order_456",
    "status": "confirmed",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  },
  "message": "Order status updated successfully"
}
```

**Status Codes:**
- `200` - Status updated
- `400` - Invalid status
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Order not found
- `500` - Server error

---

### POST /api/admin/products/import
Import products from CSV file.

**Headers:**
```
Authorization: Bearer <FIREBASE_ID_TOKEN>
Content-Type: multipart/form-data
```

**Request Body:**
Form data with CSV file:
```
file: [CSV file]
```

**CSV Format:**
```csv
name,description,category,priceTier,difficulty,productionTime,material,stockStatus,imageUrl,isActive
Custom Sticker,Vinyl sticker,stickers,₹0-50,Easy,1-2 days,Vinyl,In Stock,https://...,true
```

**Response:**
```json
{
  "success": true,
  "data": {
    "imported": 25,
    "failed": 2,
    "errors": [
      {
        "row": 3,
        "error": "Invalid category"
      }
    ]
  },
  "message": "Imported 25 products, 2 failed"
}
```

**Status Codes:**
- `200` - Import completed (may have partial failures)
- `400` - Invalid file format
- `401` - Unauthorized
- `403` - Forbidden
- `500` - Server error

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "details": {
    "field": "validation error details"
  }
}
```

### Common Error Codes

| Status Code | Meaning |
|-------------|---------|
| `400` | Bad Request - Invalid input |
| `401` | Unauthorized - Missing or invalid token |
| `403` | Forbidden - Valid token but insufficient permissions |
| `404` | Not Found - Resource doesn't exist |
| `429` | Too Many Requests - Rate limit exceeded |
| `500` | Internal Server Error - Server error |

### Rate Limiting

**Limits:**
- **All endpoints**: 100 requests per 15 minutes per IP
- **Admin endpoints**: Same limit per authenticated user

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705318200
```

**Rate Limit Error:**
```json
{
  "success": false,
  "error": "Too many requests, please try again later",
  "retryAfter": 900
}
```

---

## Webhooks (Future)

Webhook support is planned for:
- Order status changes
- Low stock alerts
- New product additions

---

## SDK / Client Libraries

### JavaScript / TypeScript

See `frontend/src/lib/api.js` for a complete client implementation:

```javascript
import { getProducts, createOrder, createProduct } from './lib/api';

// Get products
const products = await getProducts({ category: 'stickers' });

// Create order
const order = await createOrder({
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerPhone: '9876543210',
  items: [{ productId: 'prod_123', productName: 'Sticker', quantity: 5, priceTier: '₹0-50' }],
  notes: 'Blue color'
});

// Admin: Create product (requires token)
const token = await user.getIdToken();
const product = await createProduct({
  name: 'Custom Banner',
  description: 'Vinyl banner',
  category: 'banners',
  // ... other fields
}, token);
```

---

## Testing

### Using cURL

```bash
# Health check
curl https://backend-api-xxx.run.app/health

# Get products
curl https://backend-api-xxx.run.app/api/products

# Create order
curl -X POST https://backend-api-xxx.run.app/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "9876543210",
    "items": [{"productId": "prod_123", "productName": "Sticker", "quantity": 5, "priceTier": "₹0-50"}],
    "notes": "Blue color"
  }'

# Admin: Get products (requires token)
curl https://backend-api-xxx.run.app/api/admin/products \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

### Using Postman

Import this collection URL:
```
https://www.postman.com/collections/[COLLECTION_ID]
```

Or create a new collection with:
1. Set base URL as variable: `{{baseUrl}}`
2. Set authorization as Bearer Token: `{{token}}`
3. Add requests for each endpoint

---

## Changelog

### v1.0.0 (2024-01-15)
- Initial API release
- Public endpoints: products, orders
- Admin endpoints: products CRUD, orders management, image upload, CSV import
- Rate limiting: 100 req/15min
- Authentication via Firebase ID tokens
- WhatsApp notifications via Twilio (optional)

---

## Support

For API issues:
- Check Cloud Run logs: `gcloud run services logs tail backend-api --region us-central1`
- Review Firestore security rules
- Verify service account permissions
- Check rate limit headers

For feature requests or bugs, open a GitHub issue.

---

**API Version**: 1.0.0  
**Last Updated**: January 15, 2024  
**Base URL**: `https://backend-api-xxx.run.app`
