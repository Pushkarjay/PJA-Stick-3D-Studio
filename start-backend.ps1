# Quick Start Commands

# Install dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Cyan
cd backend
npm install

# Check if .env exists
if (-Not (Test-Path .env)) {
    Write-Host "⚠️  Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ Please edit backend/.env with your credentials before starting!" -ForegroundColor Green
    Write-Host ""
    notepad .env
} else {
    Write-Host "✅ .env file found" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Starting development server..." -ForegroundColor Cyan
Write-Host "📡 Backend will run on http://localhost:5000" -ForegroundColor Yellow
Write-Host "📝 API Docs: http://localhost:5000/health" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

npm run dev
