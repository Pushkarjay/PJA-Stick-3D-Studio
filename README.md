# PJA Stick & 3D Studio

> **PRINT. STICK. CREATE.**  
> Flip Names, Moon Lamps & Divine Idols  
> **Now Open at Suresh Singh Chowk**

A production-ready full-stack e-commerce platform for PJA Stick & 3D Studio, featuring custom 3D printing, stickers, and printing services with WhatsApp-based ordering.

## 🚀 One-Line Deploy (After Setup)

```bash
# Frontend + Backend
npm run deploy
```

## 📋 Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Environment Variables](#environment-variables)
- [Creating Admin Account](#creating-admin-account)
- [WhatsApp Integration](#whatsapp-integration)
- [Security](#security)
- [Testing](#testing)
- [Monitoring](#monitoring)
- [Go-Live Checklist](#go-live-checklist)

## 🏗️ Architecture

```
┌─────────────────┐
│  Firebase       │
│  Hosting        │◄──── Custom Domain (HTTPS)
└────────┬────────┘
         │
         ▼
┌─────────────────┐         ┌──────────────────┐
│  React/Vite     │────────►│  Cloud Run API   │
│  Frontend       │         │  (Node/Express)  │
│  (Static SPA)   │         └────────┬─────────┘
└─────────────────┘                  │
         │                           │
         │                           ▼
         │                  ┌──────────────────┐
         │                  │   Firestore      │
         │                  │   (Database)     │
         │                  └──────────────────┘
         │                           │
         │                           ▼
         │                  ┌──────────────────┐
         │                  │  Cloud Storage   │
         │                  │  (Product Imgs)  │
         │                  └──────────────────┘
         │                           │
         ▼                           ▼
┌─────────────────┐         ┌──────────────────┐
│  Firebase Auth  │         │ Secret Manager   │
│  (Admin Login)  │         │  (Credentials)   │
└─────────────────┘         └──────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  WhatsApp (916372362313)            │
│  - wa.me (primary)                  │
│  - Twilio Business API (optional)   │
└─────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS
- **Icons:** lucide-react
- **State Management:** React Context + Hooks
- **Routing:** React Router v6
- **Auth:** Firebase Client SDK
- **Build:** Vite (ES modules, fast HMR)

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** Google Cloud Firestore
- **Storage:** Google Cloud Storage
- **Auth:** Firebase Admin SDK
- **Validation:** Joi
- **Security:** Helmet, express-rate-limit
- **Logging:** Winston (structured JSON)

### Infrastructure
- **Hosting:** Firebase Hosting (Frontend)
- **API:** Google Cloud Run (Backend)
- **Database:** Firestore (Production Mode)
- **Storage:** Cloud Storage (Public bucket for images)
- **Secrets:** Google Secret Manager
- **CI/CD:** GitHub Actions
- **Monitoring:** Cloud Logging, Cloud Monitoring

### Messaging
- **Primary:** WhatsApp wa.me links (client-side, zero cost)
- **Optional:** Twilio WhatsApp Business API (server-side notifications)

## 📦 Prerequisites

1. **Node.js 18+** and npm
2. **Google Cloud Project** with billing enabled
3. **Firebase Project** (can be linked to GCP project)
4. **Git** and **GitHub** account
5. **gcloud CLI** - [Install](https://cloud.google.com/sdk/docs/install)
6. **Firebase CLI** - `npm install -g firebase-tools`
7. **Docker** (optional, for local backend testing)

## 🏃 Local Development

### 1. Clone Repository

```bash
git clone https://github.com/<<YOUR_GITHUB_USERNAME>>/PJA-Stick-3D-Studio.git
cd PJA-Stick-3D-Studio
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Setup Firebase Project

```bash
# Login to Firebase
firebase login

# Initialize Firebase (select existing project or create new)
firebase init

# Select: Hosting, Firestore, Storage
# Use existing files when prompted
```

### 4. Setup Environment Variables

#### Frontend (.env)
Create `frontend/.env`:

```env
VITE_FIREBASE_API_KEY=<<YOUR_FIREBASE_API_KEY>>
VITE_FIREBASE_AUTH_DOMAIN=<<YOUR_PROJECT_ID>>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<<YOUR_PROJECT_ID>>
VITE_FIREBASE_STORAGE_BUCKET=<<YOUR_PROJECT_ID>>.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<<YOUR_SENDER_ID>>
VITE_FIREBASE_APP_ID=<<YOUR_APP_ID>>
VITE_API_URL=http://localhost:8080
VITE_WHATSAPP_NUMBER=916372362313
```

#### Backend (.env)
Create `backend/.env`:

```env
# GCP & Firebase
GCP_PROJECT_ID=<<YOUR_GCP_PROJECT_ID>>
FIREBASE_PROJECT_ID=<<YOUR_FIREBASE_PROJECT_ID>>
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json

# Storage
GCS_BUCKET_NAME=<<YOUR_PROJECT_ID>>-products

# API Configuration
PORT=8080
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# WhatsApp
SHOP_WHATSAPP_NUMBER=916372362313

# Twilio (Optional - only if using Business API)
TWILIO_ACCOUNT_SID=<<YOUR_TWILIO_SID>>
TWILIO_AUTH_TOKEN=<<YOUR_TWILIO_TOKEN>>
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 5. Download Service Account Key

```bash
# Create service account
gcloud iam service-accounts create pja3d-local-dev \
  --display-name="PJA 3D Local Development"

# Grant roles
gcloud projects add-iam-policy-binding <<YOUR_PROJECT_ID>> \
  --member="serviceAccount:pja3d-local-dev@<<YOUR_PROJECT_ID>>.iam.gserviceaccount.com" \
  --role="roles/datastore.user"

gcloud projects add-iam-policy-binding <<YOUR_PROJECT_ID>> \
  --member="serviceAccount:pja3d-local-dev@<<YOUR_PROJECT_ID>>.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

# Download key
gcloud iam service-accounts keys create backend/service-account-key.json \
  --iam-account=pja3d-local-dev@<<YOUR_PROJECT_ID>>.iam.gserviceaccount.com
```

⚠️ **NEVER commit service-account-key.json to Git!**

### 6. Deploy Firestore Rules & Indexes

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

### 7. Start Development Servers

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Visit: http://localhost:5173

## 🚀 Production Deployment

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for complete deployment guide.

### Quick Deploy Commands

```bash
# Deploy backend
cd backend
gcloud run deploy pja3d-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated

# Deploy frontend
cd frontend
npm run build
firebase deploy --only hosting
```

## 🔐 Creating Admin Account

### Set Admin Role in Firestore
1. Create user in Firebase Authentication
2. Copy User UID
3. Add document to `users` collection:

```json
{
  "email": "admin@pja3d.com",
  "role": "admin",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

Or use the admin creation endpoint (see backend API docs).

## 📱 WhatsApp Integration

### Primary: wa.me Links
- No setup required
- Zero cost
- Immediate availability

### Optional: Twilio WhatsApp Business API
See [docs/WHATSAPP.md](./docs/WHATSAPP.md) for setup instructions.

## 🔒 Security

- Firestore security rules enforced
- API rate limiting enabled
- Input validation on all endpoints
- Helmet.js security headers
- CORS restrictions
- Secret Manager for credentials
- HTTPS enforced

See [docs/SECURITY.md](./docs/SECURITY.md) for details.

## 🧪 Testing

```bash
# Run all tests
npm test

# Lint code
npm run lint

# Audit repository
./scripts/audit-repo.sh
```

## 📊 Monitoring

```bash
# View backend logs
gcloud logging read "resource.type=cloud_run_revision" --limit 50

# View frontend logs
firebase hosting:logs
```

## ✅ Go-Live Checklist

### Critical (Must Complete)
1. ✓ Firebase Production Mode enabled
2. ✓ Firestore security rules deployed
3. ✓ All secrets in Secret Manager
4. ✓ Service accounts with least-privilege roles
5. ✓ HTTPS enforced with SSL certificate
6. ✓ Automated backups configured
7. ✓ Admin account created and tested
8. ✓ Rate limiting enabled
9. ✓ Error monitoring configured
10. ✓ Legal pages (Privacy, Terms) added

### Important
11. Load testing completed
12. CSP headers configured
13. Images optimized
14. Mobile testing done
15. WhatsApp links verified
16. CORS properly configured
17. Cache headers set
18. Custom error pages
19. Accessibility audit passed
20. SEO optimized

### Recommended
21. Analytics tracking
22. Performance monitoring
23. Social media integration
24. PWA manifest
25. Staging environment
26. Internal documentation
27. WhatsApp Business profile
28. Backup restoration tested
29. Incident response plan
30. Code cleanup

## 📚 Documentation

- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Deployment guide
- [docs/SECURITY.md](./docs/SECURITY.md) - Security practices
- [docs/WHATSAPP.md](./docs/WHATSAPP.md) - WhatsApp integration
- [docs/API.md](./docs/API.md) - API documentation

## 📞 Support

- **WhatsApp:** +91 6372362313
- **Location:** Suresh Singh Chowk
- **Email:** info@pja3dstudio.com

---

**Built with ❤️ for PJA Stick & 3D Studio**
