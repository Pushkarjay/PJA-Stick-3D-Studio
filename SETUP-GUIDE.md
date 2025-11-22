# 🚀 Complete Setup Guide - PJA3D E-Commerce Platform

## Prerequisites Checklist

Before starting, ensure you have:
- [ ] Node.js v18+ installed (`node --version`)
- [ ] npm v8+ installed (`npm --version`)
- [ ] Git installed
- [ ] Google Cloud account with billing enabled
- [ ] Firebase project created (`pja3d-fire`)
- [ ] Razorpay account (or test keys)
- [ ] Text editor (VS Code recommended)

---

## Part 1: Firebase Setup (15 minutes)

### Step 1.1: Enable Firebase Services

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your project**: `pja3d-fire`

3. **Enable Authentication**:
   - Go to Authentication → Get Started
   - Enable Email/Password provider
   - Enable Google Sign-In provider
   - Add authorized domain: `pja3d-fire.web.app`

4. **Create Firestore Database**:
   - Go to Firestore Database → Create Database
   - Choose location: `asia-south1` (Mumbai)
   - Start in production mode
   - Apply rules from `firestore.rules` file

5. **Enable Storage**:
   - Go to Storage → Get Started
   - Use default bucket: `pja3d-fire.appspot.com`
   - Apply rules from `storage.rules` file

6. **Setup Hosting**:
   - Go to Hosting → Get Started
   - Follow the setup wizard

### Step 1.2: Get Firebase Credentials

1. Go to Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file as `firebase-service-account.json`
4. Extract these values for `.env`:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` characters)

### Step 1.3: Install Firebase CLI

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Verify login
firebase projects:list

# Select project
firebase use pja3d-fire
```

---

## Part 2: Google Cloud Setup (20 minutes)

### Step 2.1: Enable Required APIs

```bash
# Install Google Cloud SDK first: https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login

# Set project
gcloud config set project pja3d-fire

# Enable APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable cloudscheduler.googleapis.com
gcloud services enable logging.googleapis.com
gcloud services enable monitoring.googleapis.com

# Verify enabled services
gcloud services list --enabled
```

### Step 2.2: Create Service Account for GitHub Actions

```bash
# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Deployment" \
  --description="Service account for automated deployments"

# Grant necessary roles
gcloud projects add-iam-policy-binding pja3d-fire \
  --member="serviceAccount:github-actions@pja3d-fire.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding pja3d-fire \
  --member="serviceAccount:github-actions@pja3d-fire.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding pja3d-fire \
  --member="serviceAccount:github-actions@pja3d-fire.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Create and download key
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=github-actions@pja3d-fire.iam.gserviceaccount.com

# Save this JSON content for GitHub secrets
cat github-actions-key.json
```

### Step 2.3: Setup Secret Manager

```bash
# Create secrets
echo -n "your-super-secret-jwt-key-change-this-in-production" | \
  gcloud secrets create JWT_SECRET --data-file=-

echo -n "your_razorpay_key_secret" | \
  gcloud secrets create RAZORPAY_KEY_SECRET --data-file=-

# Copy your Firebase private key
cat firebase-service-account.json | jq -r '.private_key' | \
  gcloud secrets create FIREBASE_PRIVATE_KEY --data-file=-

# Verify secrets created
gcloud secrets list
```

---

## Part 3: Backend Setup (10 minutes)

### Step 3.1: Install Dependencies

```bash
cd backend

# Install all dependencies
npm install

# Install development tools globally (optional)
npm install -g nodemon eslint
```

### Step 3.2: Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env file
notepad .env  # or use your preferred editor
```

**Fill in these required values**:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Firebase Configuration (from firebase-service-account.json)
FIREBASE_PROJECT_ID=pja3d-fire
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@pja3d-fire.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://pja3d-fire.firebaseio.com
FIREBASE_STORAGE_BUCKET=pja3d-fire.appspot.com

# JWT Configuration
JWT_SECRET=generate-a-secure-random-string-here
JWT_EXPIRY=24h

# Razorpay Configuration (Get from https://dashboard.razorpay.com/app/keys)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
EMAIL_FROM=PJA Studio <noreply@pja3d.com>

# WhatsApp API (Optional)
WHATSAPP_API_TOKEN=your_whatsapp_token
WHATSAPP_PHONE_ID=916372362313

# Other
ALLOWED_ORIGINS=http://localhost:3000,https://pja3d-fire.web.app
```

### Step 3.3: Generate Secure JWT Secret

```bash
# Generate a secure random string for JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and paste it as your `JWT_SECRET` value.

### Step 3.4: Setup Gmail App Password

1. Go to Google Account → Security
2. Enable 2-Factor Authentication
3. Go to App Passwords
4. Create new app password for "Mail"
5. Copy the 16-character password
6. Paste it as `SMTP_PASS` in `.env`

---

## Part 4: Razorpay Setup (5 minutes)

### Step 4.1: Create Razorpay Account

1. Go to https://razorpay.com
2. Sign up for free account
3. Complete KYC (for production) or use test mode

### Step 4.2: Get API Keys

1. Go to Dashboard → Settings → API Keys
2. Generate Test Keys (or Live Keys for production)
3. Copy:
   - Key ID → `RAZORPAY_KEY_ID`
   - Key Secret → `RAZORPAY_KEY_SECRET`

### Step 4.3: Configure Webhooks (Optional)

1. Go to Settings → Webhooks
2. Add webhook URL: `https://your-api-url.run.app/api/payment/webhook`
3. Select events: `payment.captured`, `payment.failed`
4. Copy webhook secret → `RAZORPAY_WEBHOOK_SECRET`

---

## Part 5: Database Initial Setup (10 minutes)

### Step 5.1: Deploy Firestore Rules

```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes

# Deploy storage rules
firebase deploy --only storage
```

### Step 5.2: Create Initial Collections

Run this script to create initial data:

```bash
# Start backend server first
cd backend
npm run dev

# In another terminal, run initial data setup
curl -X POST http://localhost:5000/api/admin/setup \
  -H "Content-Type: application/json"
```

Or manually in Firebase Console:

1. **Create Settings Document**:
   - Collection: `settings`
   - Document ID: `site_config`
   - Fields:
     ```json
     {
       "siteName": "PJA Stick & 3D Studio",
       "contactEmail": "pushkarjay.ajay1@gmail.com",
       "contactPhone": "+916372362313",
       "whatsappNumber": "916372362313",
       "taxRate": 0.18,
       "shippingRates": [
         {
           "zone": "local",
           "minOrder": 0,
           "rate": 50
         },
         {
           "zone": "local",
           "minOrder": 500,
           "rate": 0
         }
       ]
     }
     ```

2. **Create Admin User**:
   - Go to Authentication → Users
   - Add user with email/password
   - Copy the User UID
   - Go to Firestore → `users` collection
   - Create document with UID as document ID
   - Fields:
     ```json
     {
       "uid": "USER_UID_HERE",
       "email": "admin@pja3d.com",
       "displayName": "Admin User",
       "role": "admin",
       "isActive": true,
       "createdAt": "2025-11-22T00:00:00Z"
     }
     ```

---

## Part 6: Frontend Setup (5 minutes)

### Step 6.1: Move Existing Files

```bash
# Move existing frontend files to frontend folder
mv index.html frontend/
mv styles.css frontend/css/
mv script.js frontend/js/
mv logo*.png frontend/assets/
mv admin.html frontend/
mv admin-*.js frontend/js/
mv admin-*.css frontend/css/
```

### Step 6.2: Update API Base URL

Edit `frontend/js/script.js` and add at the top:

```javascript
// API Configuration
const API_BASE_URL = 'http://localhost:5000/api'; // Development
// const API_BASE_URL = 'https://pja3d-backend-xxx.run.app/api'; // Production

// Update all fetch calls to use API_BASE_URL
```

---

## Part 7: Testing Locally (10 minutes)

### Step 7.1: Start Backend Server

```bash
cd backend

# Start development server with auto-reload
npm run dev

# Or start production mode
npm start
```

You should see:
```
🚀 Server running on port 5000 in development mode
📡 API Base URL: http://localhost:5000
✅ Firebase Admin SDK initialized successfully
```

### Step 7.2: Test Backend API

Open another terminal:

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test product listing
curl http://localhost:5000/api/products

# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "displayName": "Test User",
    "phoneNumber": "+919876543210"
  }'
```

### Step 7.3: Start Frontend

```bash
# Option 1: Simple HTTP server
cd frontend
npx serve .

# Option 2: VS Code Live Server extension
# Right-click index.html → Open with Live Server

# Option 3: Python HTTP server
cd frontend
python -m http.server 3000
```

Open browser: http://localhost:3000

---

## Part 8: GitHub Setup (10 minutes)

### Step 8.1: Initialize Git Repository

```bash
cd PJA-Stick-3D-Studio

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Full-stack e-commerce platform"

# Add remote
git remote add origin https://github.com/Pushkarjay/PJA-Stick-3D-Studio.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 8.2: Configure GitHub Secrets

1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Add these secrets:

**FIREBASE_SERVICE_ACCOUNT**:
```json
{
  "type": "service_account",
  "project_id": "pja3d-fire",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "...",
  ...
}
```

**GCP_SA_KEY**:
```json
{
  "type": "service_account",
  "project_id": "pja3d-fire",
  ...
}
```
(Content of `github-actions-key.json` created earlier)

---

## Part 9: Deployment (15 minutes)

### Step 9.1: Deploy Frontend to Firebase Hosting

```bash
# Build frontend (if needed)
# For now, we're using static files

# Deploy
firebase deploy --only hosting

# You should see:
# ✔  Deploy complete!
# Hosting URL: https://pja3d-fire.web.app
```

### Step 9.2: Deploy Backend to Cloud Run

```bash
cd backend

# Deploy to Cloud Run
gcloud run deploy pja3d-backend \
  --source . \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --timeout 300 \
  --set-env-vars "NODE_ENV=production,PORT=8080" \
  --set-secrets="FIREBASE_PRIVATE_KEY=FIREBASE_PRIVATE_KEY:latest,JWT_SECRET=JWT_SECRET:latest,RAZORPAY_KEY_SECRET=RAZORPAY_KEY_SECRET:latest"

# Note the service URL displayed after deployment
# Example: https://pja3d-backend-xxx-uc.a.run.app
```

### Step 9.3: Update Frontend with Production API URL

Edit `frontend/js/script.js`:

```javascript
const API_BASE_URL = 'https://pja3d-backend-xxx-uc.a.run.app/api';
```

Re-deploy frontend:
```bash
firebase deploy --only hosting
```

---

## Part 10: Post-Deployment Setup (10 minutes)

### Step 10.1: Test Production Deployment

```bash
# Test backend health
curl https://pja3d-backend-xxx-uc.a.run.app/health

# Test frontend
curl https://pja3d-fire.web.app

# Test API endpoints
curl https://pja3d-backend-xxx-uc.a.run.app/api/products
```

### Step 10.2: Setup Custom Domain (Optional)

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Enter your domain: `pja3d.com`
4. Follow DNS configuration steps
5. Wait for SSL certificate provisioning (up to 24 hours)

### Step 10.3: Configure Monitoring

```bash
# Enable Cloud Monitoring
gcloud monitoring dashboards create --config-from-file=monitoring-config.json

# Setup log-based alerts
gcloud logging metrics create error-rate \
  --description="Error rate metric" \
  --log-filter='severity="ERROR"'

# Create alert policy
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="High Error Rate" \
  --condition-threshold-value=10 \
  --condition-threshold-duration=60s
```

### Step 10.4: Setup Backups

```bash
# Schedule daily Firestore backups
gcloud firestore export gs://pja3d-fire-backups \
  --project=pja3d-fire

# Create Cloud Scheduler job for automated backups
gcloud scheduler jobs create http firestore-backup \
  --schedule="0 2 * * *" \
  --uri="https://firestore.googleapis.com/v1/projects/pja3d-fire/databases/(default):exportDocuments" \
  --message-body='{"outputUriPrefix":"gs://pja3d-fire-backups"}' \
  --oauth-service-account-email=firebase-adminsdk-fbsvc@pja3d-fire.iam.gserviceaccount.com \
  --oauth-token-scope=https://www.googleapis.com/auth/cloud-platform
```

---

## Part 11: Verification Checklist

### Backend Verification
- [ ] Server starts without errors
- [ ] Health endpoint returns 200
- [ ] Firebase connection successful
- [ ] Products API returns data
- [ ] Authentication works (register/login)
- [ ] Admin endpoints require authentication
- [ ] CORS configured correctly

### Frontend Verification
- [ ] Website loads successfully
- [ ] Products display correctly
- [ ] Navigation works
- [ ] Mobile responsive design
- [ ] WhatsApp button works
- [ ] Admin panel accessible

### Database Verification
- [ ] Firestore rules deployed
- [ ] Indexes created
- [ ] Collections exist
- [ ] Admin user created
- [ ] Test data present

### Deployment Verification
- [ ] Frontend deployed to Firebase
- [ ] Backend deployed to Cloud Run
- [ ] API accessible from frontend
- [ ] SSL certificates active
- [ ] GitHub Actions working

---

## Troubleshooting

### Common Issues

**1. Firebase Connection Error**
```bash
# Check credentials
firebase projects:list

# Verify service account
cat firebase-service-account.json | jq '.client_email'

# Test Firebase connection
node -e "
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
console.log('✅ Firebase connected');
"
```

**2. CORS Errors**
Add to backend `.env`:
```env
ALLOWED_ORIGINS=http://localhost:3000,https://pja3d-fire.web.app,https://pja3d.com
```

**3. Cloud Run Deployment Fails**
```bash
# Check logs
gcloud logging read "resource.type=cloud_run_revision" --limit 50

# Increase timeout
gcloud run services update pja3d-backend --timeout=300
```

**4. Firestore Permission Denied**
```bash
# Re-deploy rules
firebase deploy --only firestore:rules

# Check rules in console
firebase firestore:rules get
```

---

## Next Steps

1. **Add Products**: Use admin panel to add your product catalog
2. **Test Payments**: Make test orders with Razorpay test cards
3. **Setup Analytics**: Add Google Analytics tracking
4. **Enable Monitoring**: Setup alerts and dashboards
5. **Marketing**: Configure SEO metadata and social sharing
6. **Mobile App**: Plan React Native mobile app (future)

---

## Support

If you encounter issues:
1. Check logs: `gcloud logging read`
2. Review Firebase console for errors
3. Test API endpoints with curl
4. Check GitHub Actions logs
5. Contact: pushkarjay.ajay1@gmail.com

---

**Setup Complete! 🎉**

Your e-commerce platform is now live and ready to accept orders!

Frontend: https://pja3d-fire.web.app
Backend: https://pja3d-backend-xxx.run.app
Admin: https://pja3d-fire.web.app/admin.html
