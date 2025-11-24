# Deploy Backend to Cloud Run
# Run this script to deploy the backend API to Google Cloud Run

Write-Host "🚀 PJA 3D Studio - Backend Deployment" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check GCP authentication
Write-Host "📝 Checking GCP authentication..." -ForegroundColor Cyan
gcloud config get-value project 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to GCP. Please run: gcloud auth login" -ForegroundColor Red
    exit 1
}

$project = gcloud config get-value project
Write-Host "✅ GCP authenticated (Project: $project)" -ForegroundColor Green

# Verify project is correct
if ($project -ne "pja3d-fire") {
    Write-Host "⚠️  Current project is '$project', expected 'pja3d-fire'" -ForegroundColor Yellow
    $continue = Read-Host "Set project to pja3d-fire? (Y/n)"
    if ($continue -ne "n" -and $continue -ne "N") {
        gcloud config set project pja3d-fire
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to set project" -ForegroundColor Red
            exit 1
        }
    }
}

Write-Host ""

# Deploy to Cloud Run
Write-Host "🚀 Deploying backend to Cloud Run..." -ForegroundColor Cyan
Write-Host "This may take 3-5 minutes..." -ForegroundColor Yellow
Write-Host ""

Set-Location backend

gcloud run deploy pja3d-backend `
  --source . `
  --platform managed `
  --region asia-south1 `
  --allow-unauthenticated `
  --set-env-vars "NODE_ENV=production,GCP_PROJECT_ID=pja3d-fire,FIRESTORE_EMULATOR_HOST=" `
  --memory 512Mi `
  --cpu 1 `
  --timeout 60s `
  --max-instances 10

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend deployment failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ Backend deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Get your backend URL from Cloud Console or by running:" -ForegroundColor Cyan
Write-Host "  gcloud run services describe pja3d-backend --region asia-south1 --format 'value(status.url)'" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Copy the backend URL" -ForegroundColor White
Write-Host "  2. Update frontend/.env.production with VITE_API_URL=<backend-url>" -ForegroundColor White
Write-Host "  3. Redeploy frontend: .\deploy-frontend.ps1" -ForegroundColor White
Write-Host ""
