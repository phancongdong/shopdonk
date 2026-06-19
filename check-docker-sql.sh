#!/bin/bash
# Check SQL Server in Docker on VPS

echo "=== Check Docker containers ==="
docker ps -a | grep -i sql

echo ""
echo "=== Check Orders table ==="
docker exec -it mssql /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'ShopDonk@2024' -d CayTheDB -C -Q "SELECT TOP 10 id, user_id, status FROM Orders ORDER BY id DESC"

echo ""
echo "=== Check Order 43 ==="
docker exec -it mssql /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'ShopDonk@2024' -d CayTheDB -C -Q "SELECT id, user_id, status, CAST(account_info AS NVARCHAR(MAX)) as account_info, account_username, account_password FROM Orders WHERE id = 43"

echo ""
echo "=== Check account_info structure for order 43 ==="
docker exec -it mssql /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'ShopDonk@2024' -d CayTheDB -C -Q "SET NOCOUNT ON; SELECT CAST(account_info AS NVARCHAR(MAX)) as account_info FROM Orders WHERE id = 43" -o /tmp/order43.txt -W

echo ""
echo "=== Order 43 account_info content ==="
docker exec -it mssql cat /tmp/order43.txt
