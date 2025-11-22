# 📋 Google Cloud Services - Complete Configuration Guide

## Project Information
- **Project Name**: PJA3D-FIRE
- **Project ID**: pja3d-fire
- **Project Number**: 369377967204
- **Region**: asia-south1 (Mumbai)

---

## ✅ Currently Configured Services

### 1. Firebase Authentication
**Status**: ✅ Active  
**Purpose**: User authentication and authorization

**What it does**:
- Email/password authentication
- Google Sign-In
- User management
- Token generation

**Configuration**:
- Enabled providers: Email/Password, Google
- Service account: `firebase-adminsdk-fbsvc@pja3d-fire.iam.gserviceaccount.com`
- Roles: Firebase Admin SDK Administrator, Service Account Token Creator

**No additional action needed** - Already configured ✅

---

### 2. Cloud Firestore
**Status**: ✅ Active  
**Purpose**: Primary NoSQL database

**What it does**:
- Store users, products, orders, cart data
- Real-time data synchronization
- Complex queries with indexes
- Automatic scaling

**Configuration**:
- Location: asia-south1
- Security rules: Deployed via `firestore.rules`
- Indexes: Configured in `firestore.indexes.json`

**Action Items**:
```bash
# Deploy rules and indexes
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

---

### 3. Firebase Storage
**Status**: ✅ Active  
**Purpose**: Store product images and user uploads

**What it does**:
- Store product images
- Store review photos
- Store profile pictures
- Automatic CDN distribution

**Configuration**:
- Bucket: `pja3d-fire.appspot.com`
- Security rules: `storage.rules`
- Max file size: 5 MB (products), 2 MB (reviews)

**Action Items**:
```bash
# Deploy storage rules
firebase deploy --only storage
```

---

### 4. Firebase Hosting
**Status**: ✅ Active  
**Purpose**: Host frontend application

**What it does**:
- Serve static HTML/CSS/JS files
- Global CDN distribution
- Automatic SSL certificates
- Custom domain support

**Configuration**:
- Public directory: `frontend`
- URL: https://pja3d-fire.web.app
- Custom domain: (to be configured)

**Action Items**:
```bash
# Deploy frontend
firebase deploy --only hosting
```

---

## 🔧 Services to Enable

### 5. Cloud Run ⚙️
**Status**: ⚠️ Needs Configuration  
**Purpose**: Host Express.js backend API

**What it does**:
- Run containerized Node.js backend
- Automatic scaling (0-10 instances)
- Pay per use
- Global load balancing

**How to Enable**:
```bash
# 1. Enable Cloud Run API
gcloud services enable run.googleapis.com

# 2. Deploy backend
cd backend
gcloud run deploy pja3d-backend \
  --source . \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars "NODE_ENV=production,PORT=8080" \
  --set-secrets="FIREBASE_PRIVATE_KEY=FIREBASE_PRIVATE_KEY:latest,JWT_SECRET=JWT_SECRET:latest,RAZORPAY_KEY_SECRET=RAZORPAY_KEY_SECRET:latest"
```

**Cost**: ~$0/month (within free tier for low traffic)

---

### 6. Cloud Build ⚙️
**Status**: ⚠️ Needs Configuration  
**Purpose**: Automated CI/CD pipeline

**What it does**:
- Build Docker images automatically
- Run tests before deployment
- Deploy on Git push
- Integrate with GitHub

**How to Enable**:
```bash
# 1. Enable Cloud Build API
gcloud services enable cloudbuild.googleapis.com

# 2. Connect GitHub repository
gcloud builds connect https://github.com/Pushkarjay/PJA-Stick-3D-Studio

# 3. Create build trigger (or use GitHub Actions)
# GitHub Actions is already configured in .github/workflows/deploy.yml
```

**Cost**: 120 build-minutes/day free

---

### 7. Secret Manager ⚙️
**Status**: ⚠️ Needs Configuration  
**Purpose**: Securely store API keys and secrets

**What it does**:
- Store sensitive environment variables
- Encrypted storage
- Version control for secrets
- Access control with IAM

**How to Enable**:
```bash
# 1. Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com

# 2. Create secrets
# JWT Secret
echo -n "your-super-secret-jwt-key" | \
  gcloud secrets create JWT_SECRET --data-file=-

# Razorpay Secret
echo -n "your_razorpay_key_secret" | \
  gcloud secrets create RAZORPAY_KEY_SECRET --data-file=-

# Firebase Private Key
cat firebase-service-account.json | jq -r '.private_key' | \
  gcloud secrets create FIREBASE_PRIVATE_KEY --data-file=-

# SMTP Password
echo -n "your-gmail-app-password" | \
  gcloud secrets create SMTP_PASS --data-file=-

# 3. Grant access to Cloud Run service account
gcloud secrets add-iam-policy-binding JWT_SECRET \
  --member="serviceAccount:369377967204-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding RAZORPAY_KEY_SECRET \
  --member="serviceAccount:369377967204-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding FIREBASE_PRIVATE_KEY \
  --member="serviceAccount:369377967204-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

**Cost**: $0.06 per secret per month

---

### 8. Cloud Monitoring ⚙️
**Status**: ⚠️ Needs Configuration  
**Purpose**: Monitor application health and performance

**What it does**:
- Track API response times
- Monitor error rates
- Set up alerts for issues
- View logs and metrics
- Uptime monitoring

**How to Enable**:
```bash
# 1. Enable Monitoring API
gcloud services enable monitoring.googleapis.com

# 2. Enable Logging API
gcloud services enable logging.googleapis.com

# 3. Create log-based metrics
gcloud logging metrics create error_count \
  --description="Count of error logs" \
  --log-filter='severity="ERROR"'

# 4. Create alert policy
gcloud alpha monitoring policies create \
  --display-name="High Error Rate" \
  --condition-threshold-value=10 \
  --condition-threshold-duration=60s \
  --notification-channels=EMAIL_CHANNEL_ID
```

**Cost**: 50 GB logs/month free

---

### 9. Cloud Scheduler ⚙️ (Optional)
**Status**: ⚠️ Optional - For Automation  
**Purpose**: Run scheduled tasks

**What it does**:
- Daily database backups
- Weekly sales reports
- Monthly analytics emails
- Automated maintenance tasks

**How to Enable**:
```bash
# 1. Enable Cloud Scheduler API
gcloud services enable cloudscheduler.googleapis.com

# 2. Create daily backup job
gcloud scheduler jobs create http firestore-backup \
  --schedule="0 2 * * *" \
  --time-zone="Asia/Kolkata" \
  --uri="https://firestore.googleapis.com/v1/projects/pja3d-fire/databases/(default):exportDocuments" \
  --message-body='{"outputUriPrefix":"gs://pja3d-fire-backups"}' \
  --oauth-service-account-email=firebase-adminsdk-fbsvc@pja3d-fire.iam.gserviceaccount.com
```

**Cost**: 3 jobs free/month

---

## 🔐 IAM & Service Accounts

### Current Service Accounts

#### 1. firebase-adminsdk-fbsvc@pja3d-fire.iam.gserviceaccount.com ✅
**Roles**:
- Firebase Admin SDK Administrator Service Agent
- Service Account Token Creator

**Purpose**: Backend Firebase operations

**Status**: Already configured ✅

---

#### 2. github-actions@pja3d-fire.iam.gserviceaccount.com ⚙️
**Status**: ⚠️ To be created  
**Roles**:
- Cloud Run Admin
- Storage Admin
- Service Account User

**Purpose**: GitHub Actions CI/CD deployments

**How to Create**:
```bash
# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions CI/CD"

# Grant roles
gcloud projects add-iam-policy-binding pja3d-fire \
  --member="serviceAccount:github-actions@pja3d-fire.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding pja3d-fire \
  --member="serviceAccount:github-actions@pja3d-fire.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding pja3d-fire \
  --member="serviceAccount:github-actions@pja3d-fire.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Create key for GitHub secrets
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=github-actions@pja3d-fire.iam.gserviceaccount.com

# Display key (copy this to GitHub secrets)
cat github-actions-key.json
```

---

## 💰 Cost Breakdown

| Service | Free Tier | Expected Usage | Est. Cost |
|---------|-----------|----------------|-----------|
| Firebase Hosting | 10 GB/month | 5 GB | $0 |
| Cloud Firestore | 50K reads/day | 10K reads/day | $0 |
| Firebase Storage | 5 GB | 20 GB | $0.50 |
| Firebase Auth | 10K MAU | 500 users | $0 |
| Cloud Run | 2M requests | 100K requests | $0 |
| Cloud Build | 120 mins/day | 30 mins/day | $0 |
| Secret Manager | - | 5 secrets | $0.30 |
| Monitoring | 50 GB logs | 20 GB logs | $0 |
| **Total** | | | **~$1/month** |

**Note**: All costs assume low-to-medium traffic (500-1000 users/month)

---

## 🚀 Deployment Checklist

### Phase 1: Enable Core Services ⚙️
- [x] Firebase Authentication ✅ (Already enabled)
- [x] Cloud Firestore ✅ (Already enabled)
- [x] Firebase Storage ✅ (Already enabled)
- [x] Firebase Hosting ✅ (Already enabled)
- [ ] Deploy Firestore rules
- [ ] Deploy Storage rules

### Phase 2: Enable Backend Services ⚙️
- [ ] Enable Cloud Run API
- [ ] Deploy backend to Cloud Run
- [ ] Enable Secret Manager
- [ ] Create and store secrets
- [ ] Configure environment variables

### Phase 3: Enable CI/CD ⚙️
- [ ] Enable Cloud Build API
- [ ] Create github-actions service account
- [ ] Add GitHub secrets
- [ ] Test automated deployment

### Phase 4: Enable Monitoring ⚙️
- [ ] Enable Monitoring API
- [ ] Enable Logging API
- [ ] Create error alerts
- [ ] Setup uptime checks
- [ ] Configure notification channels

### Phase 5: Optional Services 🔧
- [ ] Enable Cloud Scheduler (for backups)
- [ ] Setup custom domain
- [ ] Configure CDN
- [ ] Enable Cloud Storage (for backups)

---

## 📞 Quick Commands Reference

### Check Enabled Services
```bash
gcloud services list --enabled
```

### Enable All Required Services at Once
```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  cloudscheduler.googleapis.com \
  logging.googleapis.com \
  monitoring.googleapis.com
```

### Check Service Account Permissions
```bash
gcloud projects get-iam-policy pja3d-fire \
  --flatten="bindings[].members" \
  --format="table(bindings.role)"
```

### View Current Project Info
```bash
gcloud config list
gcloud projects describe pja3d-fire
```

---

## 🆘 Support & Resources

### Google Cloud Console Links
- **Project Dashboard**: https://console.cloud.google.com/home/dashboard?project=pja3d-fire
- **Firebase Console**: https://console.firebase.google.com/project/pja3d-fire
- **IAM & Admin**: https://console.cloud.google.com/iam-admin/iam?project=pja3d-fire
- **Cloud Run**: https://console.cloud.google.com/run?project=pja3d-fire
- **Secret Manager**: https://console.cloud.google.com/security/secret-manager?project=pja3d-fire

### Documentation
- [Firebase Documentation](https://firebase.google.com/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)

### Support
- **Email**: pushkarjay.ajay1@gmail.com
- **Project Owner**: pushkarjay.ajay1@gmail.com

---

**Last Updated**: November 22, 2025  
**Document Version**: 1.0
