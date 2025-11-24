# 🚀 QUICKSTART GUIDE

Get PJA Stick & 3D Studio running in **under 1 hour**.

---

## 📚 Before You Start

**Read first**: [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) - Complete overview of what's been delivered

**Prerequisites**:
- Google Cloud Platform account
- Firebase account
- GitHub account
- Node.js 18+ installed
- gcloud CLI installed
- Firebase CLI installed

---

## ⚡ 10-Minute Local Setup

### 1. Clone and Install

```bash
# Navigate to project
cd E:\Projects\Working\PJA-Stick-3D-Studio

# Install dependencies
npm install

# Install frontend deps
cd frontend
npm install

# Install backend deps
cd ../backend
npm install
cd ..
```

### 2. Create Backend Files

**Copy all backend code** from `FILE_GENERATION_GUIDE_PART1.md`:

```bash
# Create each file by copying from the guide:
# backend/src/utils/logger.js
# backend/src/middleware/errorHandler.js
# backend/src/middleware/rateLimiter.js
# backend/src/middleware/authFirebase.js
# backend/src/middleware/validate.js
# backend/src/services/firebase.service.js
# backend/src/services/storage.service.js
# backend/src/services/whatsapp.service.js
# backend/src/controllers/products.controller.js
# backend/src/controllers/orders.controller.js
# backend/src/controllers/admin.controller.js
# backend/src/routes/products.routes.js
# backend/src/routes/orders.routes.js
# backend/src/routes/admin.routes.js
# backend/Dockerfile
# backend/.eslintrc.cjs
```

**⏱️ Time: 10 minutes** (copy/paste from guide)

### 3. Setup Firebase Project (Local Testing)

```bash
# Login to Firebase
firebase login

# Create new project
firebase projects:create pja3d-studio-dev

# Select project
firebase use pja3d-studio-dev

# Initialize Firestore
firebase init firestore
# Select "Use an existing project"
# Accept default rules file
```

### 4. Configure Environment

```bash
# Frontend environment
cd frontend
cp .env.example .env.local

# Edit .env.local:
# VITE_API_URL=http://localhost:8080
# VITE_FIREBASE_API_KEY=<from Firebase Console>
# VITE_FIREBASE_AUTH_DOMAIN=pja3d-studio-dev.firebaseapp.com
# VITE_FIREBASE_PROJECT_ID=pja3d-studio-dev
# VITE_FIREBASE_STORAGE_BUCKET=pja3d-studio-dev.appspot.com
# VITE_FIREBASE_MESSAGING_SENDER_ID=<from Firebase Console>
# VITE_FIREBASE_APP_ID=<from Firebase Console>
# VITE_WHATSAPP_NUMBER=916372362313
# VITE_GCS_BUCKET_URL=http://localhost:8080/images

# Backend environment
cd ../backend
cp .env.example .env

# Edit .env:
# NODE_ENV=development
# PORT=8080
# GCP_PROJECT_ID=pja3d-studio-dev
# FIREBASE_ADMIN_KEY_PATH=./config/firebase-admin-key.json
# GCS_BUCKET_NAME=pja3d-studio-dev-images
# WHATSAPP_NUMBER=916372362313
```

### 5. Download Firebase Admin Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate new private key"
5. Save as `backend/config/firebase-admin-key.json`

### 6. Start Development Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev
# → http://localhost:8080

# Terminal 2: Frontend
cd frontend
npm run dev
# → http://localhost:5173
```

### 7. Create Admin User

```bash
# In a third terminal
cd backend
node create-admin.js

# Follow prompts:
# Email: admin@pja3d.com
# Password: (enter secure password)
# Name: Admin User
```

### 8. Test Locally

1. Open http://localhost:5173
2. Homepage should load (empty products initially)
3. Go to http://localhost:5173/admin
4. Login with admin credentials
5. Create a test product
6. View on homepage

**⏱️ Total Time: 10-15 minutes**

---

## 🚀 Production Deployment (45 Minutes)

### Step 1: GCP Project Setup (10 min)

```bash
# Set variables
export PROJECT_ID="pja3d-studio"
export REGION="us-central1"
export GCS_BUCKET="${PROJECT_ID}-images"

# Create project
gcloud projects create $PROJECT_ID --name="PJA 3D Studio"
gcloud config set project $PROJECT_ID

# Link billing (REQUIRED - get billing account ID from console)
gcloud billing accounts list
gcloud billing projects link $PROJECT_ID --billing-account=YOUR_BILLING_ID

# Enable APIs (takes ~2 minutes)
gcloud services enable \
    firestore.googleapis.com \
    storage.googleapis.com \
    secretmanager.googleapis.com \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    firebasehosting.googleapis.com
```

### Step 2: Setup Firestore & Storage (5 min)

```bash
# Create Firestore database
gcloud firestore databases create --location=$REGION --type=firestore-native

# Create Cloud Storage bucket
gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$GCS_BUCKET

# Make bucket public
gsutil iam ch allUsers:objectViewer gs://$GCS_BUCKET

# Set CORS
cat > cors.json << 'EOF'
[{"origin": ["*"], "method": ["GET", "HEAD", "PUT", "POST"], "responseHeader": ["Content-Type"], "maxAgeSeconds": 3600}]
EOF
gsutil cors set cors.json gs://$GCS_BUCKET
rm cors.json

# Deploy Firestore rules
firebase deploy --only firestore:rules,firestore:indexes,storage
```

### Step 3: Create Service Accounts (5 min)

```bash
# Backend service account
gcloud iam service-accounts create backend-api \
    --display-name="Backend API Service Account"

export SA_EMAIL="backend-api@${PROJECT_ID}.iam.gserviceaccount.com"

# Grant permissions
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:${SA_EMAIL}" --role="roles/datastore.user"
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:${SA_EMAIL}" --role="roles/storage.objectAdmin"
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:${SA_EMAIL}" --role="roles/secretmanager.secretAccessor"

# Download key for GitHub Actions
gcloud iam service-accounts keys create ./gcp-sa-key.json --iam-account=$SA_EMAIL
cat gcp-sa-key.json | base64 -w 0 > gcp-sa-key-base64.txt
echo "✓ Save gcp-sa-key-base64.txt contents to GitHub Secret: GCP_SA_KEY"
```

### Step 4: Deploy Backend to Cloud Run (10 min)

```bash
cd backend

# Build and push Docker image
docker build -t gcr.io/$PROJECT_ID/backend-api:latest .
docker push gcr.io/$PROJECT_ID/backend-api:latest

# Deploy to Cloud Run
gcloud run deploy backend-api \
    --image gcr.io/$PROJECT_ID/backend-api:latest \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --service-account $SA_EMAIL \
    --set-env-vars "NODE_ENV=production,GCP_PROJECT_ID=$PROJECT_ID,GCS_BUCKET_NAME=$GCS_BUCKET,WHATSAPP_NUMBER=916372362313" \
    --memory 512Mi \
    --max-instances 10

# Get backend URL
export BACKEND_URL=$(gcloud run services describe backend-api --region $REGION --format 'value(status.url)')
echo "✓ Backend URL: $BACKEND_URL"
```

### Step 5: Configure GitHub Secrets (5 min)

Go to GitHub → Repository Settings → Secrets and variables → Actions

Add these 13 secrets:

| Secret Name | Value |
|-------------|-------|
| `GCP_PROJECT_ID` | Your PROJECT_ID |
| `GCP_SA_KEY` | Contents of gcp-sa-key-base64.txt |
| `FIREBASE_SERVICE_ACCOUNT` | Contents of firebase-admin-key.json |
| `VITE_API_URL` | Your BACKEND_URL |
| `VITE_FIREBASE_API_KEY` | From Firebase Console → Project Settings |
| `VITE_FIREBASE_AUTH_DOMAIN` | `${PROJECT_ID}.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Same as GCP_PROJECT_ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `${PROJECT_ID}.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | From Firebase Console |
| `VITE_FIREBASE_APP_ID` | From Firebase Console |
| `VITE_WHATSAPP_NUMBER` | `916372362313` |
| `VITE_GCS_BUCKET_URL` | `https://storage.googleapis.com/${GCS_BUCKET}` |

### Step 6: Deploy Frontend (5 min)

```bash
cd frontend

# Build with production env
cat > .env.production << EOF
VITE_API_URL=$BACKEND_URL
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=${PROJECT_ID}.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=$PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=${PROJECT_ID}.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
VITE_WHATSAPP_NUMBER=916372362313
VITE_GCS_BUCKET_URL=https://storage.googleapis.com/$GCS_BUCKET
EOF

# Build and deploy
npm run build
firebase deploy --only hosting

# Get hosting URL
echo "✓ Frontend URL: https://${PROJECT_ID}.web.app"
```

### Step 7: Create Production Admin (2 min)

```bash
cd backend

# Use production env
export GOOGLE_APPLICATION_CREDENTIALS=./config/firebase-admin-key.json
export GCP_PROJECT_ID=$PROJECT_ID

node create-admin.js
# Email: admin@pja3d.com
# Password: (strong password)
# Name: Admin User
```

### Step 8: Verification (3 min)

```bash
# Test backend
curl $BACKEND_URL/health

# Test frontend - visit in browser:
# https://PROJECT_ID.web.app

# Test admin panel:
# https://PROJECT_ID.web.app/admin
# Login with admin credentials
```

**⏱️ Total Production Time: ~45 minutes**

---

## 🎯 Post-Deployment

### 1. Import Products (5 min)

**Option A: Via Admin Panel**
1. Go to `/admin`
2. Click "New Product"
3. Fill form and upload image
4. Click "Save"

**Option B: CSV Import**
1. Prepare CSV with columns: name, description, category, priceTier, difficulty, productionTime, material, stockStatus, imageUrl, isActive
2. Go to `/admin` → "Import CSV"
3. Upload file

### 2. Test End-to-End (5 min)

- [ ] Browse products on homepage
- [ ] Add product to cart
- [ ] Proceed to checkout
- [ ] Fill customer details
- [ ] Submit order
- [ ] WhatsApp link opens with order details
- [ ] Order appears in Firestore
- [ ] Admin can view order in dashboard

### 3. Setup Monitoring (5 min)

```bash
# Enable monitoring
gcloud services enable monitoring.googleapis.com

# View logs
gcloud run services logs tail backend-api --region $REGION

# Setup alerts (in Cloud Console):
# - High error rate (5xx > 5%)
# - High latency (p95 > 2s)
# - No traffic for 10 minutes
```

### 4. Automated Deployments

Every push to `main` branch now triggers:
1. Lint & test (frontend + backend)
2. Build frontend
3. Deploy backend to Cloud Run
4. Deploy frontend to Firebase Hosting

**Monitor**: GitHub → Actions tab

---

## 📋 Production Checklist

Before going live:

- [ ] Backend deployed and healthy (`/health` returns 200)
- [ ] Frontend deployed to Firebase Hosting
- [ ] Admin account created
- [ ] At least 5 products added
- [ ] All product images uploaded
- [ ] Test order flow (add to cart → checkout → WhatsApp)
- [ ] Firestore security rules deployed
- [ ] Storage security rules deployed
- [ ] GitHub Actions workflow running
- [ ] Monitoring alerts configured
- [ ] Custom domain configured (optional)
- [ ] SSL certificate valid (auto via Firebase)
- [ ] CORS configured for production domains
- [ ] Rate limiting tested (100 req/15min)
- [ ] Mobile responsive verified (test on phone)
- [ ] WhatsApp number verified (916372362313)

---

## 🆘 Troubleshooting

### "Cannot reach backend"
```bash
# Check backend logs
gcloud run services logs read backend-api --region us-central1 --limit 50

# Verify CORS in backend/src/server.js includes your frontend domain
```

### "Images not loading"
```bash
# Verify bucket is public
gsutil iam get gs://$GCS_BUCKET | grep allUsers

# Check CORS
gsutil cors get gs://$GCS_BUCKET
```

### "Admin login fails"
- Verify Firebase Auth is enabled in Firebase Console
- Check user has `role: "admin"` in Firestore `users` collection
- Verify frontend has correct Firebase config

### "WhatsApp link doesn't work"
- Check phone number format (no +, no spaces): `916372362313`
- Verify WhatsApp is installed on test device
- Test message encoding (avoid special characters)

---

## 📚 Next Steps

**Essential Reading**:
1. [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) - Complete delivery overview
2. [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) - Detailed deployment guide
3. [docs/SECURITY.md](docs/SECURITY.md) - Security best practices
4. [docs/WHATSAPP.md](docs/WHATSAPP.md) - WhatsApp integration (wa.me + Twilio)
5. [docs/API.md](docs/API.md) - REST API reference

**Optional Enhancements**:
- Setup Twilio WhatsApp Business API (see docs/WHATSAPP.md)
- Configure custom domain
- Add Google Analytics
- Implement email notifications
- Create automated backups (see scripts/firestore-export.sh)

---

## 💰 Cost Estimate

**Low traffic (1K orders/month)**: $1-8/month
- Cloud Run: $0-5
- Firestore: $1-2
- Cloud Storage: $0.50
- Firebase Hosting: FREE
- Secret Manager: $0.06

**Medium traffic (10K orders/month)**: $15-30/month

**High traffic (50K orders/month)**: $50-100/month

---

## 🎉 You're Live!

Your e-commerce platform is now running in production!

**Frontend**: https://PROJECT_ID.web.app  
**Admin Panel**: https://PROJECT_ID.web.app/admin  
**API**: https://backend-api-xxx.run.app  
**WhatsApp**: +91 6372362313

**Share with your customers and start taking orders!** 🚀

---

**Need Help?**
- Check [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed troubleshooting
- Review Cloud Run logs for backend errors
- Open GitHub issue for bugs
- Contact development team for support

Built with ❤️ for PJA Stick & 3D Studio
