@echo off
REM Quick Start Script for Finance App (Windows)

echo 🚀 Finance App - Quick Start
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js không được cài đặt
    echo Vui lòng cài đặt Node.js từ https://nodejs.org
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i

echo ✅ Node.js version: %NODE_VERSION%
echo ✅ npm version: %NPM_VERSION%
echo.

REM Backend setup
echo 📦 Thiết lập Backend...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Lỗi khi cài đặt backend
    pause
    exit /b 1
)
echo ✅ Backend dependencies cài đặt thành công
echo.

REM Frontend setup
echo 📦 Thiết lập Frontend...
cd ..\frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Lỗi khi cài đặt frontend
    pause
    exit /b 1
)
echo ✅ Frontend dependencies cài đặt thành công
echo.

echo ================================
echo 🎉 Thiết lập xong!
echo.
echo 📋 Các bước tiếp theo:
echo.
echo 1️⃣  Terminal 1 - Chạy Backend:
echo    cd backend
echo    npm run dev
echo.
echo 2️⃣  Terminal 2 - Chạy Frontend:
echo    cd frontend
echo    npm run dev
echo.
echo 3️⃣  Mở Browser:
echo    http://localhost:5173
echo.
echo ================================
pause
