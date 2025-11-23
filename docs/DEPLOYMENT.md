# Deployment Guide

Complete step-by-step guide to deploy PJA Stick & 3D Studio to production.

## Prerequisites

- Google Cloud Platform account
- Firebase account (same project)
- GitHub account
- gcloud CLI installed
- Firebase CLI installed
- Docker installed (for local testing)
- Node.js 18+ and npm

## Architecture Overview

```
User Browser
    ↓
Firebase Hosting (Static React App)
    ↓
Cloud Run (Express API)
    ↓
├── Firestore (Database)
├── Cloud Storage (Images)
├── Secret Manager (Credentials)
└── WhatsApp (wa.me links)
```

## Step 1: Create GCP Project

```bash
# Set variables
export PROJECT_ID="pja3d-studio"
export REGION="us-central1"
export GCS_BUCKET="${PROJECT_ID}-images"

# Create project
gcloud projects create $PROJECT_ID --name="PJA 3D Studio"
gcloud config set project $PROJECT_ID

# Link billing account (required)
gcloud billing accounts list
gcloud billing projects link $PROJECT_ID --billing-account=YOUR_BILLING_ACCOUNT_ID
```

## Step 2: Enable Required APIs

```bash
gcloud services enable \
    firestore.googleapis.com \
    storage.googleapis.com \
    secretmanager.googleapis.com \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    firebasehosting.googleapis.com
```

## Step 3: Setup Firestore

```bash
# Create Firestore database in Native mode
gcloud firestore databases create \
    --location=$REGION \
    --type=firestore-native

# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

### Create Collections Structure

In Firebase Console:
1. Go to Firestore Database
2. Create collections:
   - `products` (will be populated via admin panel or CSV import)
   - `orders` (created automatically on checkout)
   - `users` (create first admin user manually)
   - `settings` (optional, for site configuration)

## Step 4: Setup Cloud Storage

```bash
# Create bucket for product images
gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$GCS_BUCKET

# Make bucket publicly readable (images need to be accessible)
gsutil iam ch allUsers:objectViewer gs://$GCS_BUCKET

# Set CORS configuration
cat > cors.json << 'EOF'
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST"],
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set cors.json gs://$GCS_BUCKET
rm cors.json

# Deploy storage rules
firebase deploy --only storage
```

## Step 5: Create Service Accounts

### Backend Service Account

```bash
# Create service account for Cloud Run
gcloud iam service-accounts create backend-api \
    --display-name="Backend API Service Account"

export SA_EMAIL="backend-api@${PROJECT_ID}.iam.gserviceaccount.com"

# Grant necessary permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/datastore.user"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/storage.objectAdmin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/secretmanager.secretAccessor"

# Create and download key (for GitHub Actions)
gcloud iam service-accounts keys create ./gcp-sa-key.json \
    --iam-account=$SA_EMAIL

# Base64 encode for GitHub Secrets
cat gcp-sa-key.json | base64 -w 0 > gcp-sa-key-base64.txt
echo "Save the contents of gcp-sa-key-base64.txt to GitHub Secret: GCP_SA_KEY"
```

### Firebase Admin Service Account

```bash
# Download Firebase Admin SDK key
# Go to Firebase Console → Project Settings → Service Accounts
# Click "Generate new private key"
# Save as firebase-admin-key.json

# For GitHub Secrets, use the JSON contents directly
cat firebase-admin-key.json
echo "Save the above JSON to GitHub Secret: FIREBASE_SERVICE_ACCOUNT"
```

## Step 6: Setup Secret Manager

```bash
# Store Twilio credentials (if using Twilio)
echo -n "YOUR_TWILIO_ACCOUNT_SID" | gcloud secrets create twilio-account-sid \
    --replication-policy="automatic" \
    --data-file=-

echo -n "YOUR_TWILIO_AUTH_TOKEN" | gcloud secrets create twilio-auth-token \
    --replication-policy="automatic" \
    --data-file=-

echo -n "+14155238886" | gcloud secrets create twilio-whatsapp-number \
    --replication-policy="automatic" \
    --data-file=-

# Grant access to backend service account
for secret in twilio-account-sid twilio-auth-token twilio-whatsapp-number; do
    gcloud secrets add-iam-policy-binding $secret \
        --member="serviceAccount:${SA_EMAIL}" \
        --role="roles/secretmanager.secretAccessor"
done
```

## Step 7: Deploy Backend to Cloud Run

### Manual Deployment (First Time)

```bash
cd backend

# Build Docker image
docker build -t gcr.io/$PROJECT_ID/backend-api:latest .

# Push to Google Container Registry
docker push gcr.io/$PROJECT_ID/backend-api:latest

# Deploy to Cloud Run
gcloud run deploy backend-api \
    --image gcr.io/$PROJECT_ID/backend-api:latest \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --service-account $SA_EMAIL \
    --set-env-vars "NODE_ENV=production,GCP_PROJECT_ID=$PROJECT_ID,GCS_BUCKET_NAME=$GCS_BUCKET,FIRESTORE_EMULATOR_HOST='',WHATSAPP_NUMBER=916372362313" \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10 \
    --min-instances 0 \
    --timeout 60s

# Get the service URL
export BACKEND_URL=$(gcloud run services describe backend-api --region $REGION --format 'value(status.url)')
echo "Backend URL: $BACKEND_URL"
```

## Step 8: Setup GitHub Actions

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

### Required GitHub Secrets

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `GCP_PROJECT_ID` | Your GCP project ID | `echo $PROJECT_ID` |
| `GCP_SA_KEY` | Base64-encoded service account key | From Step 5 |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase Admin SDK JSON | From Step 5 |
| `VITE_API_URL` | Backend API URL | `echo $BACKEND_URL` |
| `VITE_FIREBASE_API_KEY` | Firebase Web API key | Firebase Console → Project Settings → General |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `${PROJECT_ID}.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | Same as `GCP_PROJECT_ID` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | `${PROJECT_ID}.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Firebase Console → Project Settings → General |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | Firebase Console → Project Settings → General |
| `VITE_WHATSAPP_NUMBER` | WhatsApp number | `916372362313` |
| `VITE_GCS_BUCKET_URL` | Cloud Storage bucket URL | `https://storage.googleapis.com/${GCS_BUCKET}` |

### Get Firebase Config Values

```bash
# Get Firebase config
firebase apps:sdkconfig web

# Or from Firebase Console:
# Project Settings → General → Your apps → Firebase SDK snippet → Config
```

## Step 9: Deploy Frontend to Firebase Hosting

```bash
cd frontend

# Install Firebase CLI (if not already)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not already)
firebase init hosting
# Select existing project
# Public directory: dist
# Single-page app: Yes
# GitHub Actions: No (we have custom workflow)

# Build with production env vars
cat > .env.production << EOF
VITE_API_URL=$BACKEND_URL
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=${PROJECT_ID}.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=$PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=${PROJECT_ID}.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
VITE_WHATSAPP_NUMBER=916372362313
VITE_GCS_BUCKET_URL=https://storage.googleapis.com/$GCS_BUCKET
EOF

# Build
npm run build

# Deploy
firebase deploy --only hosting
```

## Step 10: Create Admin User

```bash
cd backend

# Create .env with credentials
cat > .env << EOF
GCP_PROJECT_ID=$PROJECT_ID
FIREBASE_ADMIN_KEY_PATH=./path-to-firebase-admin-key.json
EOF

# Run admin creation script
node create-admin.js

# Follow prompts to enter:
# - Email: admin@pja3d.com
# - Password: (secure password)
# - Name: Admin User
```

## Step 11: Verification Checklist

- [ ] Backend API health check: `curl $BACKEND_URL/health`
- [ ] Frontend loads: Visit Firebase Hosting URL
- [ ] Admin login works: Go to `/admin` and login
- [ ] Products page loads (empty initially)
- [ ] Upload a test product image
- [ ] Create a test product
- [ ] View product on homepage
- [ ] Add product to cart
- [ ] Checkout flow works
- [ ] Order created in Firestore
- [ ] WhatsApp link opens correctly
- [ ] Firestore rules prevent unauthorized access
- [ ] Storage rules allow public image read
- [ ] CORS headers work for API calls

## Step 12: Production Configuration

### Update CORS Origins

Edit `backend/src/server.js`:

```javascript
const corsOptions = {
  origin: [
    'https://YOUR-PROJECT-ID.web.app',
    'https://YOUR-PROJECT-ID.firebaseapp.com',
    'https://yourdomain.com', // If using custom domain
  ],
  credentials: true,
};
```

Redeploy backend after changing CORS.

### Setup Custom Domain

```bash
# Add custom domain to Firebase Hosting
firebase hosting:channel:open live --site YOUR-PROJECT-ID

# Follow instructions to add DNS records
# TXT record for verification
# A records pointing to Firebase IPs
```

### Enable Monitoring

```bash
# Enable Cloud Monitoring
gcloud services enable monitoring.googleapis.com

# Create uptime check
gcloud alpha monitoring uptime create $BACKEND_URL-health \
    --resource-type=uptime-url \
    --display-name="Backend Health Check" \
    --http-check-path=/health \
    --monitored-resource="{\"type\":\"uptime_url\",\"labels\":{\"host\":\"${BACKEND_URL#https://}\"}}"
```

### Setup Automated Backups

```bash
# Make backup script executable
chmod +x scripts/firestore-export.sh

# Create Cloud Scheduler job (requires App Engine)
gcloud app create --region=$REGION

gcloud scheduler jobs create http firestore-daily-backup \
    --schedule="0 2 * * *" \
    --uri="https://firestore.googleapis.com/v1/projects/$PROJECT_ID/databases/(default):exportDocuments" \
    --message-body='{"outputUriPrefix":"gs://'$PROJECT_ID'-backups/firestore"}' \
    --oauth-service-account-email=$SA_EMAIL \
    --location=$REGION
```

## Automated Deployment via GitHub Actions

After initial setup, every push to `main` branch triggers:

1. **Lint & Test**: Runs ESLint and tests for frontend + backend
2. **Build Frontend**: Creates production build with env vars
3. **Deploy Backend**: Builds Docker image, pushes to GCR, deploys to Cloud Run
4. **Deploy Frontend**: Deploys to Firebase Hosting

Monitor deployments: GitHub → Actions tab

## Rollback Procedure

### Rollback Backend

```bash
# List recent revisions
gcloud run revisions list --service backend-api --region $REGION

# Rollback to specific revision
gcloud run services update-traffic backend-api \
    --to-revisions REVISION_NAME=100 \
    --region $REGION
```

### Rollback Frontend

```bash
# List recent deployments
firebase hosting:releases:list

# Rollback to previous version
firebase hosting:rollback
```

## Monitoring & Logs

### View Backend Logs

```bash
# Real-time logs
gcloud run services logs tail backend-api --region $REGION

# View in Cloud Console
# https://console.cloud.google.com/run/detail/$REGION/backend-api/logs
```

### View Frontend Access Logs

```bash
# Firebase Hosting logs (via Console)
# https://console.firebase.google.com/project/$PROJECT_ID/hosting/sites
```

### Setup Alerts

In Cloud Console → Monitoring → Alerting:
- **High Error Rate**: Trigger when 5xx errors > 5% over 5 min
- **High Latency**: Trigger when p95 latency > 2s
- **Low Traffic**: Trigger when requests = 0 for 10 min (downtime)

## Cost Optimization

### Expected Monthly Costs (Low Traffic)

- **Cloud Run**: ~$0-5 (100K requests, 500ms avg)
- **Firestore**: ~$1-2 (50K reads, 10K writes)
- **Cloud Storage**: ~$0.50 (10GB images)
- **Firebase Hosting**: Free (10GB transfer)
- **Secret Manager**: ~$0.06 (3 secrets)
- **Total**: ~$1-8/month

### Optimize Costs

```bash
# Set Cloud Run max instances
gcloud run services update backend-api \
    --max-instances 5 \
    --region $REGION

# Enable Cloud CDN for Cloud Storage (optional)
# Reduces egress costs for frequently accessed images
```

## Security Hardening

- [ ] Rotate service account keys every 90 days
- [ ] Enable Cloud Armor (DDoS protection)
- [ ] Setup VPC Service Controls (enterprise)
- [ ] Enable audit logging
- [ ] Review Firestore security rules
- [ ] Scan Docker images for vulnerabilities
- [ ] Enable 2FA for Firebase/GCP accounts

## Troubleshooting

### Backend won't start

```bash
# Check logs
gcloud run services logs read backend-api --region $REGION --limit 50

# Common issues:
# - Missing env vars: Check Cloud Run environment variables
# - Service account permissions: Verify IAM roles
# - Secret Manager access: Test with gcloud secrets access
```

### Frontend can't reach backend

- Check CORS configuration in `backend/src/server.js`
- Verify `VITE_API_URL` in frontend build
- Test API directly: `curl $BACKEND_URL/health`

### Images not loading

- Verify bucket is publicly readable: `gsutil iam get gs://$GCS_BUCKET`
- Check CORS on bucket: `gsutil cors get gs://$GCS_BUCKET`
- Test image URL directly in browser

### WhatsApp link not working

- Check phone number format (should be: 916372362313)
- Verify WhatsApp is installed on test device
- Check message encoding (special characters)

## Production Go-Live Checklist

### Pre-Launch (1 week before)

- [ ] Run full audit: `bash scripts/audit-repo.sh`
- [ ] Load test backend (use Apache Bench or K6)
- [ ] Test on multiple devices (mobile, tablet, desktop)
- [ ] Test on multiple browsers (Chrome, Safari, Firefox)
- [ ] Verify WhatsApp flow end-to-end
- [ ] Create admin account with strong password
- [ ] Import initial product catalog
- [ ] Upload all product images
- [ ] Configure site settings (contact info, hours)
- [ ] Test checkout flow completely
- [ ] Setup monitoring alerts
- [ ] Document admin procedures

### Launch Day

- [ ] Final smoke test on production URL
- [ ] Monitor Cloud Run logs for errors
- [ ] Monitor Firestore usage
- [ ] Test first real order
- [ ] Share URL with team
- [ ] Update Google Business Profile with website
- [ ] Post on social media

### Post-Launch (First Week)

- [ ] Monitor daily for errors
- [ ] Review user feedback
- [ ] Check performance metrics
- [ ] Verify backup jobs running
- [ ] Test mobile responsiveness
- [ ] Optimize images if needed
- [ ] Fine-tune rate limits

## Support & Maintenance

### Daily Tasks
- Check Cloud Run logs for errors
- Monitor order volume
- Respond to WhatsApp messages

### Weekly Tasks
- Review Firestore query performance
- Check Cloud Storage usage
- Audit new user accounts
- Update product inventory

### Monthly Tasks
- Review costs and optimize
- Run security audit
- Update dependencies
- Test backup restoration
- Rotate secrets (if policy requires)

### Quarterly Tasks
- Rotate service account keys
- Review and update documentation
- Performance optimization
- Security vulnerability scan

## Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Firebase Hosting Guide](https://firebase.google.com/docs/hosting)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Google Cloud Storage CORS](https://cloud.google.com/storage/docs/cross-origin)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)

## Getting Help

- **Technical Issues**: Check Cloud Run logs, Firestore logs
- **Deployment Issues**: Review GitHub Actions logs
- **Security Concerns**: See `docs/SECURITY.md`
- **WhatsApp Setup**: See `docs/WHATSAPP.md`
- **GCP Support**: https://cloud.google.com/support

---

**Need help?** Open an issue on GitHub or contact the development team.
