# GitHub Secrets Configuration

This document lists all the secrets that need to be configured in your GitHub repository for the CI/CD pipeline to work.

## How to Add Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret listed below

## Required Secrets

### Backend Deployment Secrets

#### `GCP_SA_KEY`
**Description:** Google Cloud Service Account key JSON for deploying to Cloud Run  
**How to get:** 
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to IAM & Admin → Service Accounts
3. Use the `firebase-adminsdk-fbsvc@pja3d-fire.iam.gserviceaccount.com` account
4. Create a new key (JSON format)
5. Copy the entire JSON content

**Value:** Full JSON content of the service account key

---

### Frontend Deployment Secrets

#### `FIREBASE_SERVICE_ACCOUNT`
**Description:** Firebase service account key for deploying to Firebase Hosting  
**How to get:** Same as `GCP_SA_KEY` - they can use the same service account key

**Value:** Full JSON content of the service account key

#### `VITE_FIREBASE_API_KEY`
**Description:** Firebase Web API Key (public, safe to expose)  
**How to get:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Open your project: `pja3d-fire`
3. Go to Project Settings (gear icon)
4. Scroll to "Your apps" section
5. If you have a web app, the API key is shown there
6. Or go to Project Settings → General → Web API Key

**Value Example:** `AIzaSyA...` (starts with AIza)

#### `VITE_FIREBASE_MESSAGING_SENDER_ID`
**Description:** Firebase Cloud Messaging Sender ID  
**How to get:**
1. Same location as API Key in Firebase Console
2. Project Settings → General → Project number

**Value Example:** `369377967204` (numeric)

#### `VITE_FIREBASE_APP_ID`
**Description:** Firebase App ID  
**How to get:**
1. Same location as API Key in Firebase Console
2. Project Settings → General → App ID

**Value Example:** `1:369377967204:web:abc123def456` (format: `1:PROJECT_NUMBER:web:HASH`)

---

## Secrets Summary Checklist

- [ ] `GCP_SA_KEY` - Service account JSON key
- [ ] `FIREBASE_SERVICE_ACCOUNT` - Service account JSON key (can be same as GCP_SA_KEY)
- [ ] `VITE_FIREBASE_API_KEY` - Firebase Web API Key
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` - Project number
- [ ] `VITE_FIREBASE_APP_ID` - Firebase App ID

---

## Environment Variables (Not Secrets)

These are configured in the workflow file and don't need to be added as secrets:

- `VITE_FIREBASE_AUTH_DOMAIN` - Automatically set to `pja3d-fire.firebaseapp.com`
- `VITE_FIREBASE_PROJECT_ID` - Automatically set to `pja3d-fire`
- `VITE_FIREBASE_STORAGE_BUCKET` - Automatically set to `pja3d-fire.appspot.com`
- `VITE_API_URL` - Automatically set to Cloud Run backend URL
- `VITE_WHATSAPP_NUMBER` - Set to `916372362313`

---

## How to Get Firebase Configuration

Quick way to get all Firebase config at once:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project `pja3d-fire`
3. Click on Project Settings (gear icon)
4. Scroll to "Your apps" section
5. If no web app exists, click "Add app" → Web
6. Copy the `firebaseConfig` object
7. Extract the values you need

Example config you'll see:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",              // → VITE_FIREBASE_API_KEY
  authDomain: "pja3d-fire.firebaseapp.com",
  projectId: "pja3d-fire",
  storageBucket: "pja3d-fire.appspot.com",
  messagingSenderId: "369377967204",  // → VITE_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:369377967204:web:..."      // → VITE_FIREBASE_APP_ID
};
```

---

## Testing Configuration

After adding all secrets, trigger a new deployment by pushing to main:

```bash
git commit --allow-empty -m "trigger: Test deployment with new secrets"
git push origin main
```

Monitor the deployment at: https://github.com/Pushkarjay/PJA-Stick-3D-Studio/actions
