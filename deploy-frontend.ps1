# Quick Deploy Script for PJA 3D Studio
# Run this script to deploy frontend to Firebase Hosting

Write-Host "🚀 PJA 3D Studio - Deployment Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.production exists and has been updated
$envFile = ".\frontend\.env.production"
if (Test-Path $envFile) {
    $content = Get-Content $envFile -Raw
    if ($content -match "YOUR_PRODUCTION_API_KEY") {
        Write-Host "⚠️  WARNING: .env.production still has placeholder values!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Please update the following in frontend/.env.production:" -ForegroundColor Yellow
        Write-Host "  - VITE_FIREBASE_API_KEY" -ForegroundColor Yellow
        Write-Host "  - VITE_FIREBASE_MESSAGING_SENDER_ID" -ForegroundColor Yellow
        Write-Host "  - VITE_FIREBASE_APP_ID" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Get these values from: https://console.firebase.google.com/project/pja3d-fire" -ForegroundColor Cyan
        Write-Host ""
        
        $continue = Read-Host "Continue anyway? (y/N)"
        if ($continue -ne "y" -and $continue -ne "Y") {
            Write-Host "❌ Deployment cancelled." -ForegroundColor Red
            exit 1
        }
    }
} else {
    Write-Host "❌ Error: frontend/.env.production not found!" -ForegroundColor Red
    exit 1
}

# Check if Firebase CLI is logged in
Write-Host "📝 Checking Firebase authentication..." -ForegroundColor Cyan
firebase projects:list 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Firebase. Please run: firebase login" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Firebase authenticated" -ForegroundColor Green
Write-Host ""

# Build frontend
Write-Host "🔨 Building frontend..." -ForegroundColor Cyan
Set-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✅ Frontend built successfully" -ForegroundColor Green
Write-Host ""

# Deploy to Firebase Hosting
Write-Host "🚀 Deploying to Firebase Hosting..." -ForegroundColor Cyan
firebase deploy --only hosting
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Your site is live at:" -ForegroundColor Cyan
Write-Host "  🌐 https://pja3d-fire.web.app" -ForegroundColor White
Write-Host "  🌐 https://pja3d-fire.firebaseapp.com" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Visit your site and test functionality" -ForegroundColor White
Write-Host "  2. Upload products via admin panel (/admin)" -ForegroundColor White
Write-Host "  3. Share the URL with customers" -ForegroundColor White
Write-Host ""
