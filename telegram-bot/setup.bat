@echo off
chcp 65001 > nul
echo ========================================
echo    TELEGRAM BOT SETUP - WINDOWS
echo ========================================
echo.

echo [1] Kiểm tra Node.js...
node --version > nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js chưa được cài đặt!
    echo.
    echo 👉 Cài đặt Node.js:
    echo    1. Truy cập: https://nodejs.org
    echo    2. Download LTS version (v18+)
    echo    3. Cài đặt và restart máy
    echo.
    pause
    exit /b 1
)
echo ✅ Node.js: 
node --version

echo.
echo [2] Cài đặt dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Lỗi cài đặt!
    pause
    exit /b 1
)
echo ✅ Dependencies installed

echo.
echo ========================================
echo    THIẾT LẬP BOT TOKEN
echo ========================================
echo.
echo 📋 Hướng dẫn lấy Bot Token:
echo    1. Mở Telegram app
echo    2. Tìm @BotFather (có tích xanh)
echo    3. Gửi: /newbot
echo    4. Đặt tên: Shop Acc Game
echo    5. Username: yourname_bot (phải có 'bot')
echo    6. Copy token nhận được
echo.

set /p BOT_TOKEN="🔑 Nhập Bot Token: "
if "%BOT_TOKEN%"=="" (
    echo ❌ Token không được để trống!
    pause
    exit /b 1
)

echo.
echo 📋 Hướng dẫn lấy Admin ID:
echo    1. Mở Telegram
echo    2. Tìm @userinfobot
echo    3. Gửi tin nhắn
echo    4. Copy ID (số, ví dụ: 123456789)
echo.

set /p ADMIN_ID="👨‍💼 Nhập Admin ID: "
if "%ADMIN_ID%"=="" (
    echo ❌ Admin ID không được để trống!
    pause
    exit /b 1
)

echo.
echo 💳 Thông tin thanh toán (Enter để bỏ qua):
set /p BANK_NAME="🏦 Tên ngân hàng: "
set /p BANK_ACCOUNT="💳 Số tài khoản: "
set /p ACCOUNT_NAME="👤 Tên tài khoản: "
set /p MOMO_NUMBER="📱 Số Momo: "

echo.
echo [3] Tạo file cấu hình...

(
echo # Telegram Bot Token
echo TELEGRAM_BOT_TOKEN=%BOT_TOKEN%
echo.
echo # Admin IDs
echo ADMIN_IDS=%ADMIN_ID%
echo.
echo # Database path
echo DATABASE_PATH=./data/bot-database.json
echo.
echo # Payment config
echo BANK_NAME=%BANK_NAME%
echo BANK_ACCOUNT=%BANK_ACCOUNT%
echo ACCOUNT_NAME=%ACCOUNT_NAME%
echo MOMO_NUMBER=%MOMO_NUMBER%
echo MOMO_NAME=%ACCOUNT_NAME%
) > .env

echo ✅ File .env created

echo.
echo [4] Tạo thư mục data...
if not exist "data" mkdir data
echo ✅ Data folder created

echo.
echo ========================================
echo    SETUP HOÀN TẤT!
echo ========================================
echo.
echo 🚀 Khởi động bot:
echo    npm start
echo.
echo 📦 Thêm sản phẩm (Admin):
echo    /add
echo.
echo 📁 Files quan trọng:
echo    - .env          : Cấu hình
echo    - data/         : Database
echo    - README.md     : Hướng dẫn
echo.

set /p START_NOW="👉 Khởi động bot ngay? (y/n): "
if "%START_NOW%"=="y" (
    echo.
    echo 🤖 Starting bot...
    npm start
)

pause