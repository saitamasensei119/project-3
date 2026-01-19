#!/bin/bash
# Quick Start Script for Finance App

echo "🚀 Finance App - Quick Start"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js không được cài đặt"
    echo "Vui lòng cài đặt Node.js từ https://nodejs.org"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Backend setup
echo "📦 Thiết lập Backend..."
cd backend
npm install
echo "✅ Backend dependencies cài đặt thành công"
echo ""

# Frontend setup
echo "📦 Thiết lập Frontend..."
cd ../frontend
npm install
echo "✅ Frontend dependencies cài đặt thành công"
echo ""

echo "================================"
echo "🎉 Thiết lập xong!"
echo ""
echo "📋 Các bước tiếp theo:"
echo ""
echo "1️⃣  Terminal 1 - Chạy Backend:"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "2️⃣  Terminal 2 - Chạy Frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "3️⃣  Mở Browser:"
echo "   http://localhost:5173"
echo ""
echo "================================"
