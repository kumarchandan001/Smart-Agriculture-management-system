#!/bin/bash
# Fertilizer Guide System - Installation & Verification Script

echo "=========================================="
echo "Fertilizer Guide System - Verification"
echo "=========================================="
echo ""

# Check backend server
echo "[1] Checking Backend Status..."
if pgrep -f "node server.js" > /dev/null; then
    echo "✅ Backend is running on port 5000"
else
    echo "⚠️  Backend not running. Start with: cd backend && npm run dev"
fi

echo ""

# Check CSV files
echo "[2] Checking CSV Data Files..."
if [ -f "backend/data/region_npk_final_500.csv" ]; then
    COUNT=$(wc -l < "backend/data/region_npk_final_500.csv")
    echo "✅ region_npk_final_500.csv ($COUNT records)"
else
    echo "❌ region_npk_final_500.csv not found"
fi

if [ -f "backend/data/crop_ideal_npk.csv" ]; then
    COUNT=$(wc -l < "backend/data/crop_ideal_npk.csv")
    echo "✅ crop_ideal_npk.csv ($COUNT records)"
else
    echo "❌ crop_ideal_npk.csv not found"
fi

echo ""

# Check service files
echo "[3] Checking Service Files..."
FILES=(
    "backend/services/fertilizer.service.js"
    "backend/controllers/fertilizer.controller.js"
    "backend/routes/fertilizer.js"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file not found"
    fi
done

echo ""

# Check documentation
echo "[4] Checking Documentation..."
DOCS=(
    "docs/FERTILIZER_GUIDE_IMPLEMENTATION.md"
    "docs/FERTILIZER_QUICK_REFERENCE.md"
    "docs/fertilizer_guide_api.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo "✅ $doc"
    else
        echo "❌ $doc not found"
    fi
done

echo ""

# Test endpoints
echo "[5] Testing API Endpoints..."
if [ "$(command -v curl)" ]; then
    echo "Testing GET /api/fertilizer/crops..."
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/fertilizer/crops)
    if [ "$RESPONSE" = "200" ]; then
        echo "✅ GET /api/fertilizer/crops (HTTP $RESPONSE)"
    else
        echo "⚠️  GET /api/fertilizer/crops (HTTP $RESPONSE)"
    fi
else
    echo "⚠️  curl not found. Cannot test endpoints."
fi

echo ""
echo "=========================================="
echo "System Summary:"
echo "=========================================="
echo "Backend API: http://localhost:5000"
echo "Documentation: /docs/"
echo "Test File: backend/test-fertilizer.js"
echo ""
echo "Run: node backend/test-fertilizer.js"
echo "=========================================="
