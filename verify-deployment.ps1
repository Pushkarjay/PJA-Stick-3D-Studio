# Comprehensive Deployment Verification Script

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   PJA3D Deployment Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$apiUrl = "https://pja3d-backend-369377967204.asia-south1.run.app/api"
$frontendUrl = "https://pja3d-fire.web.app"

# Test 1: Backend Health Check
Write-Host "1. Testing Backend Health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$apiUrl/../health" -UseBasicParsing
    $health = $response.Content | ConvertFrom-Json
    if ($health.success) {
        Write-Host "   ✅ Backend is healthy" -ForegroundColor Green
        Write-Host "   Environment: $($health.environment)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Backend health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Products API
Write-Host ""
Write-Host "2. Testing Products API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$apiUrl/products" -UseBasicParsing
    $products = $response.Content | ConvertFrom-Json
    
    if ($products.success) {
        Write-Host "   ✅ Products API working" -ForegroundColor Green
        Write-Host "   Total Products: $($products.data.products.Count)" -ForegroundColor Gray
        
        if ($products.data.products.Count -gt 0) {
            Write-Host "   Sample Product: $($products.data.products[0].name)" -ForegroundColor Gray
            Write-Host "   Price: ₹$($products.data.products[0].price)" -ForegroundColor Gray
            Write-Host "   Category: $($products.data.products[0].category)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "   ❌ Products API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Single Product API
Write-Host ""
Write-Host "3. Testing Single Product API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$apiUrl/products/prod_010" -UseBasicParsing
    $product = $response.Content | ConvertFrom-Json
    
    if ($product.success) {
        Write-Host "   ✅ Single product API working" -ForegroundColor Green
        Write-Host "   Product: $($product.data.name)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Single product API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Admin Endpoint Protection
Write-Host ""
Write-Host "4. Testing Admin Endpoint Protection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$apiUrl/admin/products" -Method POST -UseBasicParsing -ErrorAction Stop
    Write-Host "   ⚠️  WARNING: Admin endpoint is not protected!" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host "   ✅ Admin endpoints are properly protected (401 Unauthorized)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Unexpected error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Test 5: Frontend Accessibility
Write-Host ""
Write-Host "5. Testing Frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $frontendUrl -UseBasicParsing
    Write-Host "   ✅ Frontend is accessible (Status: $($response.StatusCode))" -ForegroundColor Green
    Write-Host "   Content size: $($response.Content.Length) bytes" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Frontend failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Admin Panel
Write-Host ""
Write-Host "6. Testing Admin Panel..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$frontendUrl/admin.html" -UseBasicParsing
    Write-Host "   ✅ Admin panel is accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Admin panel failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Check for Mock Data in Frontend
Write-Host ""
Write-Host "7. Checking for Mock Data..." -ForegroundColor Yellow
try {
    $appJs = Invoke-WebRequest -Uri "$frontendUrl/js/app.js" -UseBasicParsing
    $adminJs = Invoke-WebRequest -Uri "$frontendUrl/js/admin-script.js" -UseBasicParsing
    
    $hasMockInApp = $appJs.Content -match "defaultProducts|mockProducts"
    $hasMockInAdmin = $adminJs.Content -match "localStorage\.setItem\('pjaProducts'"
    $hasCorrectUrl = $appJs.Content -match "pja3d-backend-369377967204\.asia-south1\.run\.app"
    
    if (-not $hasMockInApp -and -not $hasMockInAdmin) {
        Write-Host "   ✅ No mock data found in frontend" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Mock data remnants detected" -ForegroundColor Yellow
    }
    
    if ($hasCorrectUrl) {
        Write-Host "   ✅ Correct API URL configured" -ForegroundColor Green
    } else {
        Write-Host "   ❌ API URL may be incorrect" -ForegroundColor Red
    }
} catch {
    Write-Host "   ⚠️  Could not check frontend files: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 8: CORS Configuration
Write-Host ""
Write-Host "8. Testing CORS..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$apiUrl/products" -UseBasicParsing
    $corsHeader = $response.Headers['Access-Control-Allow-Origin']
    
    if ($corsHeader) {
        Write-Host "   ✅ CORS is configured" -ForegroundColor Green
        Write-Host "   Allowed Origin: $corsHeader" -ForegroundColor Gray
    } else {
        Write-Host "   ⚠️  CORS header not found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Could not check CORS: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Verification Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URLs:" -ForegroundColor Cyan
Write-Host "  Frontend: $frontendUrl" -ForegroundColor White
Write-Host "  Admin: $frontendUrl/admin.html" -ForegroundColor White
Write-Host "  API: $apiUrl" -ForegroundColor White
Write-Host ""
Write-Host "Admin Credentials:" -ForegroundColor Cyan
Write-Host "  Username: pushkarjay" -ForegroundColor White
Write-Host "  Password: pja3d@admin2025" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Test the frontend in a browser" -ForegroundColor White
Write-Host "  2. Login to admin panel and test CRUD operations" -ForegroundColor White
Write-Host "  3. Verify products load from backend API" -ForegroundColor White
Write-Host ""
