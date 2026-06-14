#!/bin/bash

# ============================================
# SYNC NESTED CATEGORIES TO VPS
# VPS IP: 103.178.235.184
# Domain: shopdonk.com
# ============================================

set -e

echo "=========================================="
echo "  SYNCING NESTED CATEGORIES TO VPS"
echo "=========================================="

VPS_IP="103.178.235.184"
VPS_USER="root"
PROJECT_DIR="/var/www/shopdonk"

echo "[1/4] Pulling latest code on VPS..."
ssh $VPS_USER@$VPS_IP "cd $PROJECT_DIR && git pull origin main"

echo "[2/4] Running database migration on VPS..."
ssh $VPS_USER@$VPS_IP "cd $PROJECT_DIR && /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrongPassword123!' -d ShopDonkDB -i database/vps-nested-categories-migration.sql"

echo "[3/4] Installing dependencies..."
ssh $VPS_USER@$VPS_IP "cd $PROJECT_DIR && npm install --production"

echo "[4/4] Restarting application..."
ssh $VPS_USER@$VPS_IP "pm2 restart shopdonk"

echo ""
echo "=========================================="
echo "  SYNC COMPLETED SUCCESSFULLY!"
echo "=========================================="
echo ""
echo "Access admin panel: https://shopdonk.com/admin/categories.html"
echo ""
