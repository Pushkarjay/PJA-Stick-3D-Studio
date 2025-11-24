# Create Admin User Script for PJA 3D Studio
# This script creates an admin user directly in Firestore and Firebase Auth

param(
    [Parameter(Mandatory=$false)]
    [string]$Email = "",
    [Parameter(Mandatory=$false)]
    [string]$Password = "",
    [Parameter(Mandatory=$false)]
    [string]$DisplayName = "Admin User"
)

Write-Host "🔐 Create Admin User for PJA 3D Studio" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Prompt for inputs if not provided
if ([string]::IsNullOrEmpty($Email)) {
    $Email = Read-Host "Enter admin email"
}

if ([string]::IsNullOrEmpty($Password)) {
    $SecurePassword = Read-Host "Enter password (min 6 characters)" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword)
    $Password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
}

if ([string]::IsNullOrEmpty($DisplayName)) {
    $DisplayName = Read-Host "Enter display name (default: Admin User)"
    if ([string]::IsNullOrEmpty($DisplayName)) {
        $DisplayName = "Admin User"
    }
}

# Validate inputs
if ([string]::IsNullOrEmpty($Email) -or [string]::IsNullOrEmpty($Password)) {
    Write-Host "❌ Email and password are required!" -ForegroundColor Red
    exit 1
}

if ($Password.Length -lt 6) {
    Write-Host "❌ Password must be at least 6 characters!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "⏳ Creating admin user..." -ForegroundColor Yellow
Write-Host ""

# Set environment variable for Firebase project
$env:FIREBASE_PROJECT_ID = "pja3d-fire"
$env:GCP_PROJECT_ID = "pja3d-fire"

# Run the Node.js script
Set-Location "$PSScriptRoot\backend"

# Create a temp input file
$tempInput = "$env:TEMP\admin-input-$(Get-Random).txt"
@"
$Email
$Password
$DisplayName
"@ | Out-File -FilePath $tempInput -Encoding UTF8

# Run the create-admin script
Get-Content $tempInput | node create-admin.js

# Clean up
Remove-Item $tempInput -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✅ Done! You can now login at https://pja3d-fire.web.app/admin" -ForegroundColor Green
Write-Host ""
