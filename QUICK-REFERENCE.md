# PJA3D E-Commerce Platform - Quick Reference

## 🚀 Quick Start

### Start Backend
```powershell
cd backend
npm install
npm run dev
```
Backend runs on: http://localhost:5000

### Start Frontend
```powershell
cd frontend
npx serve .
```
Frontend runs on: http://localhost:3000

---

## 📝 Common Commands

### Backend Development
```bash
npm run dev          # Start with auto-reload
npm start            # Production mode
npm test             # Run tests
npm run lint         # Check code quality
```

### Firebase Commands
```bash
firebase login                          # Login to Firebase
firebase use pja3d-fire                 # Select project
firebase deploy --only hosting         # Deploy frontend
firebase deploy --only firestore:rules # Deploy database rules
firebase deploy                        # Deploy everything
```

### Cloud Run Deployment
```bash
cd backend
gcloud run deploy pja3d-backend \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated
```

---

## 🔑 Environment Variables

Required in `backend/.env`:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `JWT_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

---

## 📡 API Endpoints

**Base URL**: http://localhost:5000/api

### Authentication
- POST `/auth/register` - Register user
- POST `/auth/login` - Login user
- POST `/auth/logout` - Logout user

### Products
- GET `/products` - List all products
- GET `/products/:id` - Get product details
- GET `/products/search?q=query` - Search products

### Cart (Protected)
- GET `/cart` - Get cart
- POST `/cart/add` - Add to cart
- PUT `/cart/update/:itemId` - Update quantity
- DELETE `/cart/remove/:itemId` - Remove item

### Orders (Protected)
- GET `/orders` - User orders
- POST `/orders/create` - Create order
- GET `/orders/:id` - Order details

### Admin (Admin Only)
- GET `/admin/dashboard` - Dashboard stats
- POST `/admin/products` - Create product
- PUT `/admin/products/:id` - Update product
- DELETE `/admin/products/:id` - Delete product

---

## 🗄️ Database Collections

### Firestore Collections
- `users` - User profiles
- `products` - Product catalog
- `orders` - Order history
- `cart` - Shopping carts
- `reviews` - Product reviews
- `settings` - Site configuration

---

## 🔐 Service Accounts

### firebase-adminsdk-fbsvc@pja3d-fire.iam.gserviceaccount.com
- Role: Firebase Admin SDK Service Agent
- Purpose: Backend Firebase operations

### github-actions@pja3d-fire.iam.gserviceaccount.com
- Role: Cloud Run Admin, Storage Admin
- Purpose: Automated deployments

---

## 📊 Google Cloud Services

### Enabled Services
- ✅ Firebase Authentication
- ✅ Cloud Firestore
- ✅ Firebase Storage
- ✅ Firebase Hosting
- ✅ Cloud Run (for backend)
- ✅ Cloud Build (for CI/CD)
- ✅ Secret Manager (for secrets)
- ✅ Cloud Monitoring & Logging

### Service URLs
- Frontend: https://pja3d-fire.web.app
- Backend: https://pja3d-backend-xxx.run.app
- Console: https://console.cloud.google.com

---

## 🧪 Testing

### Test Backend API
```bash
# Health check
curl http://localhost:5000/health

# Get products
curl http://localhost:5000/api/products

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456","displayName":"Test User"}'
```

### Razorpay Test Cards
```
Card: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
```

---

## 🐛 Troubleshooting

### Backend won't start
1. Check `.env` file exists
2. Verify Firebase credentials
3. Check port 5000 is not in use: `netstat -ano | findstr :5000`

### Firebase connection error
```bash
# Verify credentials
firebase projects:list

# Re-authenticate
firebase login
```

### CORS errors
Add your frontend URL to `ALLOWED_ORIGINS` in `.env`

### Cloud Run deployment fails
```bash
# Check logs
gcloud logging read "resource.type=cloud_run_revision" --limit 50

# Verify authentication
gcloud auth list
```

---

## 📞 Contact

**Developer**: Pushkarjay Ajay  
**Email**: pushkarjay.ajay1@gmail.com  
**WhatsApp**: +91 6372362313  
**Location**: Daltonganj, Jharkhand

---

## 📚 Documentation

- [Setup Guide](SETUP-GUIDE.md) - Complete setup instructions
- [SRS Document](SRS.md) - Software Requirements Specification
- [README](README.md) - Project overview
- [API Documentation](docs/API.md) - Detailed API docs

---

## 🎯 Next Steps

1. ✅ Setup complete
2. [ ] Add products via admin panel
3. [ ] Test payment flow
4. [ ] Configure custom domain
5. [ ] Enable monitoring alerts
6. [ ] Setup email templates
7. [ ] Add Google Analytics

---

**Project Status**: ✅ Ready for Development

Last Updated: November 22, 2025
