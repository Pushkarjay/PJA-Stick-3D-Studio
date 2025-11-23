# COMPLETE FILE GENERATION GUIDE - PART 2
# GitHub Actions, Documentation, Scripts, and Terraform

## ============================================
## GITHUB ACTIONS CI/CD
## ============================================

### .github/workflows/deploy.yml
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  GCP_PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  GCP_REGION: us-central1
  SERVICE_NAME: pja3d-backend

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          cd frontend && npm ci
          cd ../backend && npm ci
      
      - name: Lint frontend
        run: cd frontend && npm run lint
      
      - name: Lint backend
        run: cd backend && npm run lint
      
      - name: Test frontend
        run: cd frontend && npm test -- --run
      
      - name: Test backend
        run: cd backend && npm test

  build-frontend:
    needs: lint-and-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Create frontend .env
        run: |
          cat > frontend/.env.production << EOF
          VITE_API_URL=${{ secrets.VITE_API_URL }}
          VITE_FIREBASE_API_KEY=${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN=${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID=${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET=${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID=${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID=${{ secrets.VITE_FIREBASE_APP_ID }}
          VITE_WHATSAPP_NUMBER=916372362313
          EOF
      
      - name: Install and build frontend
        run: |
          cd frontend
          npm ci
          npm run build
      
      - name: Upload frontend artifacts
        uses: actions/upload-artifact@v4
        with:
          name: frontend-dist
          path: frontend/dist

  deploy-backend:
    needs: lint-and-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      
      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2
      
      - name: Configure Docker for GCR
        run: gcloud auth configure-docker
      
      - name: Build and push Docker image
        run: |
          cd backend
          docker build -t gcr.io/${{ env.GCP_PROJECT_ID }}/${{ env.SERVICE_NAME }}:${{ github.sha }} .
          docker push gcr.io/${{ env.GCP_PROJECT_ID }}/${{ env.SERVICE_NAME }}:${{ github.sha }}
      
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy ${{ env.SERVICE_NAME }} \
            --image gcr.io/${{ env.GCP_PROJECT_ID }}/${{ env.SERVICE_NAME }}:${{ github.sha }} \
            --platform managed \
            --region ${{ env.GCP_REGION }} \
            --allow-unauthenticated \
            --set-env-vars="GCP_PROJECT_ID=${{ env.GCP_PROJECT_ID }},FIREBASE_PROJECT_ID=${{ env.GCP_PROJECT_ID }},GCS_BUCKET_NAME=${{ secrets.GCS_BUCKET_NAME }},SHOP_WHATSAPP_NUMBER=916372362313,NODE_ENV=production,CORS_ORIGIN=${{ secrets.CORS_ORIGIN }}" \
            --max-instances 10 \
            --memory 512Mi \
            --cpu 1 \
            --service-account ${{ secrets.BACKEND_SERVICE_ACCOUNT }}

  deploy-frontend:
    needs: [build-frontend, deploy-backend]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Download frontend artifacts
        uses: actions/download-artifact@v4
        with:
          name: frontend-dist
          path: frontend/dist
      
      - name: Deploy to Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: ${{ env.GCP_PROJECT_ID }}
```

## ============================================
## DOCUMENTATION
## ============================================

### docs/DEPLOYMENT.md
```markdown
# Deployment Guide

Complete step-by-step guide to deploy PJA Stick & 3D Studio to production.

## Prerequisites

- Google Cloud account with billing enabled
- Firebase account (can be same project as GCP)
- gcloud CLI installed
- Firebase CLI installed
- GitHub account
- Node.js 18+ installed locally

## Step 1: Create GCP Project

\`\`\`bash
# Create new project (or use existing)
gcloud projects create pja3d-studio --name="PJA 3D Studio"

# Set as active project
gcloud config set project pja3d-studio

# Enable billing (must be done in Console)
# Visit: https://console.cloud.google.com/billing

# Enable required APIs
gcloud services enable \
  run.googleapis.com \
  firestore.googleapis.com \
  storage-api.googleapis.com \
  storage-component.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com \
  firebase.googleapis.com \
  iam.googleapis.com \
  cloudresourcemanager.googleapis.com
\`\`\`

## Step 2: Create Firebase Project

\`\`\`bash
# Link to existing GCP project or create new
firebase projects:addfirebase pja3d-studio

# Login to Firebase
firebase login

# Initialize project
cd /path/to/PJA-Stick-3D-Studio
firebase init

# Select:
# - Hosting
# - Firestore
# - Storage
# Use existing files when prompted
\`\`\`

## Step 3: Setup Firestore

\`\`\`bash
# Create Firestore database in Native mode
gcloud firestore databases create \
  --location=us-central1 \
  --project=pja3d-studio

# Deploy Firestore rules and indexes
firebase deploy --only firestore:rules,firestore:indexes

# Verify
firebase firestore:indexes
\`\`\`

## Step 4: Setup Cloud Storage

\`\`\`bash
# Create bucket for product images
gsutil mb \
  -p pja3d-studio \
  -c STANDARD \
  -l us-central1 \
  gs://pja3d-studio-products

# Make bucket publicly readable
gsutil iam ch allUsers:objectViewer gs://pja3d-studio-products

# Set CORS policy
cat > cors.json << EOF
[
  {
    "origin": ["*"],
    "method": ["GET"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set cors.json gs://pja3d-studio-products
rm cors.json

# Deploy storage rules
firebase deploy --only storage:rules

# Verify
gsutil ls gs://pja3d-studio-products
\`\`\`

## Step 5: Create Service Accounts

### Backend Service Account (for Cloud Run)

\`\`\`bash
# Create service account
gcloud iam service-accounts create pja3d-backend \
  --display-name="PJA 3D Backend API" \
  --project=pja3d-studio

# Grant Firestore access
gcloud projects add-iam-policy-binding pja3d-studio \
  --member="serviceAccount:pja3d-backend@pja3d-studio.iam.gserviceaccount.com" \
  --role="roles/datastore.user"

# Grant Cloud Storage access
gcloud projects add-iam-policy-binding pja3d-studio \
  --member="serviceAccount:pja3d-backend@pja3d-studio.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

# Grant Secret Manager access
gcloud projects add-iam-policy-binding pja3d-studio \
  --member="serviceAccount:pja3d-backend@pja3d-studio.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
\`\`\`

### CI/CD Service Account (for GitHub Actions)

\`\`\`bash
# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions CI/CD" \
  --project=pja3d-studio

# Grant Cloud Run Admin (to deploy)
gcloud projects add-iam-policy-binding pja3d-studio \
  --member="serviceAccount:github-actions@pja3d-studio.iam.gserviceaccount.com" \
  --role="roles/run.admin"

# Grant Service Account User (to impersonate)
gcloud projects add-iam-policy-binding pja3d-studio \
  --member="serviceAccount:github-actions@pja3d-studio.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Grant Storage Admin (for Cloud Build)
gcloud projects add-iam-policy-binding pja3d-studio \
  --member="serviceAccount:github-actions@pja3d-studio.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

# Grant Cloud Build Editor
gcloud projects add-iam-policy-binding pja3d-studio \
  --member="serviceAccount:github-actions@pja3d-studio.iam.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.editor"

# Download key for GitHub Actions
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=github-actions@pja3d-studio.iam.gserviceaccount.com

# Get base64 encoded key for GitHub Secret
cat github-actions-key.json | base64 -w 0 > github-actions-key-base64.txt
cat github-actions-key-base64.txt

# IMPORTANT: Store this in GitHub Secrets as GCP_SA_KEY
# Then delete both files
rm github-actions-key.json github-actions-key-base64.txt
\`\`\`

## Step 6: Setup Secret Manager (Optional - for Twilio)

\`\`\`bash
# Create secrets for Twilio
echo -n "YOUR_TWILIO_SID" | gcloud secrets create TWILIO_ACCOUNT_SID \
  --data-file=- \
  --replication-policy="automatic" \
  --project=pja3d-studio

echo -n "YOUR_TWILIO_AUTH_TOKEN" | gcloud secrets create TWILIO_AUTH_TOKEN \
  --data-file=- \
  --replication-policy="automatic" \
  --project=pja3d-studio

echo -n "whatsapp:+14155238886" | gcloud secrets create TWILIO_WHATSAPP_FROM \
  --data-file=- \
  --replication-policy="automatic" \
  --project=pja3d-studio

# Grant backend service account access
for secret in TWILIO_ACCOUNT_SID TWILIO_AUTH_TOKEN TWILIO_WHATSAPP_FROM; do
  gcloud secrets add-iam-policy-binding $secret \
    --member="serviceAccount:pja3d-backend@pja3d-studio.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor" \
    --project=pja3d-studio
done

# List secrets
gcloud secrets list --project=pja3d-studio
\`\`\`

## Step 7: Deploy Backend Manually (First Time)

\`\`\`bash
cd backend

# Build Docker image
gcloud builds submit \
  --tag gcr.io/pja3d-studio/pja3d-backend \
  --project=pja3d-studio

# Deploy to Cloud Run
gcloud run deploy pja3d-backend \
  --image gcr.io/pja3d-studio/pja3d-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --service-account pja3d-backend@pja3d-studio.iam.gserviceaccount.com \
  --set-env-vars="GCP_PROJECT_ID=pja3d-studio,FIREBASE_PROJECT_ID=pja3d-studio,GCS_BUCKET_NAME=pja3d-studio-products,SHOP_WHATSAPP_NUMBER=916372362313,NODE_ENV=production,CORS_ORIGIN=https://pja3d-studio.web.app" \
  --max-instances 10 \
  --min-instances 0 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 60 \
  --project=pja3d-studio

# Get service URL
gcloud run services describe pja3d-backend \
  --region us-central1 \
  --format="value(status.url)" \
  --project=pja3d-studio
\`\`\`

## Step 8: Setup GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

### Required Secrets:
1. **GCP_PROJECT_ID**: `pja3d-studio`
2. **GCP_SA_KEY**: (base64-encoded service account key from Step 5)
3. **FIREBASE_SERVICE_ACCOUNT**: Get from Firebase Console → Project Settings → Service accounts → Generate new private key
4. **GCS_BUCKET_NAME**: `pja3d-studio-products`
5. **BACKEND_SERVICE_ACCOUNT**: `pja3d-backend@pja3d-studio.iam.gserviceaccount.com`

### Frontend Environment Secrets:
6. **VITE_API_URL**: (Cloud Run URL from Step 7)
7. **VITE_FIREBASE_API_KEY**: Get from Firebase Console → Project Settings → General
8. **VITE_FIREBASE_AUTH_DOMAIN**: `pja3d-studio.firebaseapp.com`
9. **VITE_FIREBASE_PROJECT_ID**: `pja3d-studio`
10. **VITE_FIREBASE_STORAGE_BUCKET**: `pja3d-studio.appspot.com`
11. **VITE_FIREBASE_MESSAGING_SENDER_ID**: Get from Firebase Console
12. **VITE_FIREBASE_APP_ID**: Get from Firebase Console
13. **CORS_ORIGIN**: `https://pja3d-studio.web.app`

## Step 9: Deploy Frontend

\`\`\`bash
cd frontend

# Create production .env
cat > .env.production << EOF
VITE_API_URL=https://pja3d-backend-xxx.run.app
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=pja3d-studio.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=pja3d-studio
VITE_FIREBASE_STORAGE_BUCKET=pja3d-studio.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_WHATSAPP_NUMBER=916372362313
EOF

# Build frontend
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting --project=pja3d-studio

# Get hosting URL
firebase hosting:sites:list --project=pja3d-studio
\`\`\`

## Step 10: Setup Automated Backups

\`\`\`bash
# Create backup bucket
gsutil mb \
  -p pja3d-studio \
  -c STANDARD \
  -l us-central1 \
  gs://pja3d-studio-backups

# Manual backup
gcloud firestore export gs://pja3d-studio-backups/\$(date +%Y%m%d) \
  --project=pja3d-studio

# Setup automated daily backups (see scripts/firestore-export.sh)
\`\`\`

## Step 11: Add Custom Domain (Optional)

\`\`\`bash
# In Firebase Console:
# 1. Go to Hosting
# 2. Click "Add custom domain"
# 3. Follow DNS verification steps
# 4. SSL certificate is automatically provisioned

# Or via CLI:
firebase hosting:channel:deploy production --only hosting
\`\`\`

## Step 12: Create Admin User

\`\`\`bash
# In Firebase Console:
# 1. Go to Authentication
# 2. Add user with email/password
# 3. Copy the UID

# Add admin role in Firestore:
# Collection: users
# Document ID: <user-uid>
# Fields:
#   email: "admin@pja3d.com"
#   role: "admin"
#   createdAt: <timestamp>
#   updatedAt: <timestamp>
\`\`\`

## Verification Checklist

- [ ] Backend deployed and responding at /health endpoint
- [ ] Frontend deployed and accessible
- [ ] Firestore rules active (test by trying unauthorized write)
- [ ] Storage rules active (test image upload)
- [ ] Admin can login and access admin panel
- [ ] Products can be created/edited/deleted
- [ ] Orders can be placed by guests
- [ ] WhatsApp links working
- [ ] GitHub Actions workflow runs successfully
- [ ] Cloud Run auto-scales with traffic
- [ ] Logs visible in Cloud Console

## Monitoring

\`\`\`bash
# View Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=pja3d-backend" \
  --limit 50 \
  --project=pja3d-studio

# View Firebase Hosting traffic
firebase hosting:clone pja3d-studio:production pja3d-studio:staging
\`\`\`

## Rollback

\`\`\`bash
# List Cloud Run revisions
gcloud run revisions list --service=pja3d-backend --region=us-central1

# Rollback to previous revision
gcloud run services update-traffic pja3d-backend \
  --to-revisions=pja3d-backend-00002-abc=100 \
  --region=us-central1
\`\`\`

## Cost Optimization

- Cloud Run: Pay per request (generous free tier)
- Firestore: Free tier: 50K reads, 20K writes per day
- Storage: $0.026/GB per month
- Firebase Hosting: Free tier: 10GB/month
- Estimated monthly cost for low traffic: $5-20

## Support

For issues, check:
1. Cloud Run logs
2. Firebase Console
3. GitHub Actions workflow logs
4. docs/SECURITY.md for security issues
\`\`\`

### docs/SECURITY.md
(See next section...)
```

Due to length constraints, I'll provide you with a summary and the key remaining files. Would you like me to:

1. Create individual files for the most critical remaining components (SECURITY.md, WHATSAPP.md, scripts)?
2. Continue with the comprehensive guide format?
3. Focus on specific sections you need most?

Let me create the most critical remaining files now:
