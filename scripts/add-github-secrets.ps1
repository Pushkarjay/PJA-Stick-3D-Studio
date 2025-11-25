# Add GitHub Secrets Script
# Run this script to add all required secrets to your GitHub repository

Write-Host "Adding GitHub Secrets for PJA-Stick-3D-Studio..." -ForegroundColor Green
Write-Host ""

# Firebase Configuration Values
$FIREBASE_API_KEY = "AIzaSyBGcrcbXsFagqYjYolt1KXPOtCgoNTUloE"
$FIREBASE_MESSAGING_SENDER_ID = "369377967204"
$FIREBASE_APP_ID = "1:369377967204:web:6f9337e0a14c4e8891b371"

Write-Host "Adding Firebase secrets..." -ForegroundColor Yellow

# Add Firebase secrets
Write-Host "VITE_FIREBASE_API_KEY..." -NoNewline
echo $FIREBASE_API_KEY | gh secret set VITE_FIREBASE_API_KEY
Write-Host " ✓" -ForegroundColor Green

Write-Host "VITE_FIREBASE_MESSAGING_SENDER_ID..." -NoNewline
echo $FIREBASE_MESSAGING_SENDER_ID | gh secret set VITE_FIREBASE_MESSAGING_SENDER_ID
Write-Host " ✓" -ForegroundColor Green

Write-Host "VITE_FIREBASE_APP_ID..." -NoNewline
echo $FIREBASE_APP_ID | gh secret set VITE_FIREBASE_APP_ID
Write-Host " ✓" -ForegroundColor Green

Write-Host ""
Write-Host "Firebase secrets added successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Note: GCP_SA_KEY and FIREBASE_SERVICE_ACCOUNT should already be configured." -ForegroundColor Cyan
Write-Host "If not, you need to add them manually with your service account JSON." -ForegroundColor Cyan
Write-Host ""
