#!/bin/bash

echo "========================================"
echo "   TELEGRAM BOT SETUP - LINUX/MAC"
echo "========================================"
echo ""

echo "[1] Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not installed!"
    echo ""
    echo "👉 Install Node.js:"
    echo "   Ubuntu/Debian: sudo apt install nodejs npm"
    echo "   macOS: brew install node"
    echo "   Or visit: https://nodejs.org"
    exit 1
fi
echo "✅ Node.js: $(node --version)"

echo ""
echo "[2] Installing dependencies..."
npm install
echo "✅ Dependencies installed"

echo ""
echo "========================================"
echo "   SETUP BOT TOKEN"
echo "========================================"
echo ""
echo "📋 How to get Bot Token:"
echo "   1. Open Telegram"
echo "   2. Find @BotFather (verified)"
echo "   3. Send: /newbot"
echo "   4. Name: Shop Acc Game"
echo "   5. Username: yourname_bot"
echo "   6. Copy the token"
echo ""

read -p "🔑 Enter Bot Token: " BOT_TOKEN
if [ -z "$BOT_TOKEN" ]; then
    echo "❌ Token cannot be empty!"
    exit 1
fi

echo ""
echo "📋 How to get Admin ID:"
echo "   1. Open Telegram"
echo "   2. Find @userinfobot"
echo "   3. Send any message"
echo "   4. Copy the ID (number)"
echo ""

read -p "👨‍💼 Enter Admin ID: " ADMIN_ID
if [ -z "$ADMIN_ID" ]; then
    echo "❌ Admin ID cannot be empty!"
    exit 1
fi

echo ""
echo "💳 Payment info (press Enter to skip):"
read -p "🏦 Bank name: " BANK_NAME
read -p "💳 Bank account: " BANK_ACCOUNT
read -p "👤 Account name: " ACCOUNT_NAME
read -p "📱 Momo number: " MOMO_NUMBER

echo ""
echo "[3] Creating config file..."

cat > .env << EOF
# Telegram Bot Token
TELEGRAM_BOT_TOKEN=$BOT_TOKEN

# Admin IDs
ADMIN_IDS=$ADMIN_ID

# Database path
DATABASE_PATH=./data/bot-database.json

# Payment config
BANK_NAME=$BANK_NAME
BANK_ACCOUNT=$BANK_ACCOUNT
ACCOUNT_NAME=$ACCOUNT_NAME
MOMO_NUMBER=$MOMO_NUMBER
MOMO_NAME=$ACCOUNT_NAME
EOF

echo "✅ .env file created"

echo ""
echo "[4] Creating data folder..."
mkdir -p data
echo "✅ Data folder created"

echo ""
echo "========================================"
echo "   SETUP COMPLETE!"
echo "========================================"
echo ""
echo "🚀 Start bot:"
echo "   npm start"
echo ""
echo "📦 Add product (Admin):"
echo "   /add"
echo ""

read -p "👉 Start bot now? (y/n): " START_NOW
if [ "$START_NOW" = "y" ]; then
    echo ""
    echo "🤖 Starting bot..."
    npm start
fi