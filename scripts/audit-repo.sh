#!/bin/bash
# Repository Audit Script
# Runs linting, tests, and builds for both frontend and backend

set -e  # Exit on error

echo "================================"
echo "PJA 3D Studio - Repository Audit"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track errors
ERRORS=0

# Function to print status
print_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1"
        ERRORS=$((ERRORS + 1))
    fi
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo ""

# ================================
# FRONTEND AUDIT
# ================================
echo "================================"
echo "Auditing Frontend..."
echo "================================"

cd frontend || exit 1

# Install dependencies
echo "Installing frontend dependencies..."
npm ci > /dev/null 2>&1
print_status "Frontend dependencies installed"

# Run security audit
echo "Running security audit..."
npm audit --audit-level=moderate
print_status "Security audit completed"

# Run linter
echo "Running ESLint..."
npm run lint
print_status "Linting passed"

# Run tests
echo "Running tests..."
npm test -- --run > /dev/null 2>&1
print_status "Tests passed"

# Build
echo "Building frontend..."
npm run build > /dev/null 2>&1
print_status "Build successful"

# Check bundle size
if [ -d "dist" ]; then
    BUNDLE_SIZE=$(du -sh dist | cut -f1)
    echo "Bundle size: $BUNDLE_SIZE"
fi

cd ..

# ================================
# BACKEND AUDIT
# ================================
echo ""
echo "================================"
echo "Auditing Backend..."
echo "================================"

cd backend || exit 1

# Install dependencies
echo "Installing backend dependencies..."
npm ci > /dev/null 2>&1
print_status "Backend dependencies installed"

# Run security audit
echo "Running security audit..."
npm audit --audit-level=moderate
print_status "Security audit completed"

# Run linter
echo "Running ESLint..."
npm run lint
print_status "Linting passed"

# Run tests
echo "Running tests..."
npm test > /dev/null 2>&1
print_status "Tests passed"

cd ..

# ================================
# SECURITY CHECKS
# ================================
echo ""
echo "================================"
echo "Security Checks..."
echo "================================"

# Check for sensitive files
echo "Checking for sensitive files..."
SENSITIVE_FILES=(
    "**/*.pem"
    "**/*.key"
    "**/service-account*.json"
    "**/.env"
    "**/.env.local"
)

FOUND_SENSITIVE=0
for pattern in "${SENSITIVE_FILES[@]}"; do
    if find . -path ./node_modules -prune -o -name "$pattern" -print | grep -q .; then
        echo -e "${RED}Warning: Found sensitive file matching $pattern${NC}"
        find . -path ./node_modules -prune -o -name "$pattern" -print
        FOUND_SENSITIVE=1
    fi
done

if [ $FOUND_SENSITIVE -eq 0 ]; then
    print_status "No sensitive files found in repository"
fi

# Check .gitignore
if grep -q "*.pem" .gitignore && grep -q "*.key" .gitignore && grep -q ".env" .gitignore; then
    print_status ".gitignore properly configured"
else
    echo -e "${YELLOW}Warning: .gitignore may be missing sensitive file patterns${NC}"
    ERRORS=$((ERRORS + 1))
fi

# ================================
# CONFIGURATION CHECKS
# ================================
echo ""
echo "================================"
echo "Configuration Checks..."
echo "================================"

# Check for required config files
REQUIRED_FILES=(
    "firebase.json"
    "firestore.rules"
    "firestore.indexes.json"
    "storage.rules"
    ".github/workflows/deploy.yml"
    "frontend/.env.example"
    "backend/.env.example"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_status "$file exists"
    else
        echo -e "${RED}Missing: $file${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done

# ================================
# SUMMARY
# ================================
echo ""
echo "================================"
echo "Audit Summary"
echo "================================"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo "Repository is ready for deployment."
    exit 0
else
    echo -e "${RED}✗ Found $ERRORS issue(s)${NC}"
    echo "Please fix the issues before deploying."
    exit 1
fi
