#!/bin/bash
# Quick Setup Script for Soil Health Feature

echo "🌱 Smart Agriculture - Soil Health Feature Setup"
echo "=================================================="

# Backend Setup
echo ""
echo "📦 Installing Backend Dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
  echo "❌ Backend npm install failed"
  exit 1
fi
echo "✅ Backend dependencies installed"

# Check if MongoDB is running
echo ""
echo "🔍 Checking MongoDB connection..."
if ! command -v mongosh &> /dev/null; then
  echo "⚠️  MongoDB client not found. Make sure MongoDB is running on localhost:27017"
else
  echo "✅ MongoDB client found"
fi

# Frontend Setup
echo ""
echo "📦 Installing Frontend Dependencies..."
cd ../smart-agro
npm install
if [ $? -ne 0 ]; then
  echo "❌ Frontend npm install failed"
  exit 1
fi
echo "✅ Frontend dependencies installed"

# Display next steps
echo ""
echo "✅ Setup Complete!"
echo ""
echo "Next Steps:"
echo "1. Make sure MongoDB is running"
echo "2. Configure .env file with MONGO_URI if needed"
echo ""
echo "To start the application:"
echo "  Terminal 1 (Backend):  cd backend && npm start"
echo "  Terminal 2 (Frontend): cd smart-agro && npm run dev"
echo ""
echo "Then visit: http://localhost:5173/soil"
echo ""
echo "💡 Features:"
echo "  ✓ Region-based soil analysis (auto-detect)"
echo "  ✓ Manual NPK/pH input"
echo "  ✓ Farmer-friendly recommendations"
echo "  ✓ Soil test history with pagination"
echo "  ✓ Health score calculation (0-100)"
