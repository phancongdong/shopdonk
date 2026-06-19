#!/bin/bash
# Sync VPS database to local for analysis
# Run: bash sync-vps-db.sh

echo "=== Syncing VPS Orders table ==="

# Export orders from VPS
ssh ubuntu@103.178.235.184 << 'EOF'
sqlcmd -S localhost -U sa -P 'ShopDonk@2024' -d CayTheDB -o /tmp/orders-export.txt -Q "SET NOCOUNT ON; SELECT id, user_id, status, product_id, quantity, total_price, CAST(account_info AS NVARCHAR(MAX)) as account_info, account_username, account_password, created_at FROM Orders ORDER BY id DESC" -W -h-1 -s","
EOF

# Copy file to local
scp ubuntu@103.178.235.184:/tmp/orders-export.txt ./orders-export.txt

echo ""
echo "=== Orders exported to orders-export.txt ==="
echo ""
cat orders-export.txt
