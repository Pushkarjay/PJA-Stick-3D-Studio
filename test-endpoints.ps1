# Test API Endpoints

Write-Host ""
Write-Host "=== Testing Backend API ===" -ForegroundColor Cyan
try {
    $backendResponse = Invoke-WebRequest -Uri "https://pja3d-backend-369377967204.asia-south1.run.app/api/products" -UseBasicParsing
    $backendJson = $backendResponse.Content | ConvertFrom-Json
    Write-Host "SUCCESS: Backend API is working!" -ForegroundColor Green
    Write-Host "  Product Count: $($backendJson.data.products.Count)"
    Write-Host "  First Product: $($backendJson.data.products[0].name) (ID: $($backendJson.data.products[0].id))" -ForegroundColor Yellow
    
    Write-Host ""
    Write-Host "  All Product IDs:" -ForegroundColor Cyan
    foreach ($product in $backendJson.data.products) {
        Write-Host "    - $($product.id): $($product.name)"
    }
} catch {
    Write-Host "ERROR: Backend API failed - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Testing Frontend ===" -ForegroundColor Cyan
try {
    $frontendResponse = Invoke-WebRequest -Uri "https://pja3d-fire.web.app/" -UseBasicParsing
    Write-Host "SUCCESS: Frontend is live (Status: $($frontendResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Frontend failed - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Testing Admin Page ===" -ForegroundColor Cyan
try {
    $adminResponse = Invoke-WebRequest -Uri "https://pja3d-fire.web.app/admin.html" -UseBasicParsing
    Write-Host "SUCCESS: Admin page is live (Status: $($adminResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Admin page failed - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Checking for Mock Data ===" -ForegroundColor Cyan
try {
    $appJsResponse = Invoke-WebRequest -Uri "https://pja3d-fire.web.app/js/app.js" -UseBasicParsing
    $hasApiUrl = $appJsResponse.Content -match "API_BASE_URL"
    $hasMockData = $appJsResponse.Content -match "defaultProducts"
    
    Write-Host "  app.js:"
    if ($hasApiUrl) {
        Write-Host "    SUCCESS: Has API_BASE_URL configuration" -ForegroundColor Green
    } else {
        Write-Host "    WARNING: No API_BASE_URL found" -ForegroundColor Yellow
    }
    
    if ($hasMockData) {
        Write-Host "    WARNING: Still has mock data!" -ForegroundColor Red
    } else {
        Write-Host "    SUCCESS: No mock data found" -ForegroundColor Green
    }
} catch {
    Write-Host "  ERROR: Could not check app.js - $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $adminJsResponse = Invoke-WebRequest -Uri "https://pja3d-fire.web.app/js/admin-script.js" -UseBasicParsing
    $hasApiUrl = $adminJsResponse.Content -match "API_BASE_URL"
    $hasMockData = $adminJsResponse.Content -match "defaultProducts"
    
    Write-Host ""
    Write-Host "  admin-script.js:"
    if ($hasApiUrl) {
        Write-Host "    SUCCESS: Has API_BASE_URL configuration" -ForegroundColor Green
    } else {
        Write-Host "    WARNING: No API_BASE_URL found" -ForegroundColor Yellow
    }
    
    if ($hasMockData) {
        Write-Host "    WARNING: Still has mock data!" -ForegroundColor Red
    } else {
        Write-Host "    SUCCESS: No mock data found" -ForegroundColor Green
    }
} catch {
    Write-Host "  ERROR: Could not check admin-script.js - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Testing Complete ===" -ForegroundColor Green
