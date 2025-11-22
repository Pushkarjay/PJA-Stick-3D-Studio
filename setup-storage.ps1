# Initialize Firebase Storage

Write-Host ""
Write-Host "=== Firebase Storage Setup ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Firebase Storage needs to be enabled in the Firebase Console." -ForegroundColor Yellow
Write-Host ""
Write-Host "Steps to enable Firebase Storage:" -ForegroundColor White
Write-Host "1. Go to: https://console.firebase.google.com/project/pja3d-fire/storage" -ForegroundColor Green
Write-Host "2. Click 'Get Started' button" -ForegroundColor Green
Write-Host "3. Accept the default security rules (we'll deploy our custom rules after)" -ForegroundColor Green
Write-Host "4. Wait for Storage to be provisioned" -ForegroundColor Green
Write-Host ""
Write-Host "After enabling Storage, run this command to deploy the security rules:" -ForegroundColor Yellow
Write-Host "  firebase deploy --only storage" -ForegroundColor Cyan
Write-Host ""
Write-Host "Opening Firebase Console..." -ForegroundColor Cyan

# Open the browser
Start-Process "https://console.firebase.google.com/project/pja3d-fire/storage"

Write-Host ""
Write-Host "Press Enter after you've enabled Storage in the console..." -ForegroundColor Yellow
Read-Host

Write-Host ""
Write-Host "Deploying storage rules..." -ForegroundColor Cyan
firebase deploy --only storage

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS: Firebase Storage is now ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your storage bucket: pja3d-fire.appspot.com" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERROR: Please make sure Storage is enabled in the Firebase Console" -ForegroundColor Red
    Write-Host ""
}
