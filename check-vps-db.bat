@echo off
echo ========================================
echo SCRIPT KIEM TRA DATABASE TREN VPS
echo ========================================
echo.
echo 1. SSH vao VPS:
echo    ssh ubuntu@103.178.235.184
echo    (hoac ssh root@103.178.235.184)
echo.
echo 2. Sau khi SSH, chay lenh sau:
echo.
echo ----------------------------------------
echo sqlcmd -S localhost -U sa -P 'ShopDonk@2024' -d CayTheDB -Q "SELECT TOP 10 id, user_id, status, CAST(account_info AS NVARCHAR(MAX)) as account_info, account_username, account_password FROM Orders ORDER BY id DESC"
echo ----------------------------------------
echo.
echo 3. Kiem tra Order ID 43:
echo.
echo ----------------------------------------
echo sqlcmd -S localhost -U sa -P 'ShopDonk@2024' -d CayTheDB -Q "SELECT id, user_id, status, CAST(account_info AS NVARCHAR(MAX)) as account_info, account_username, account_password FROM Orders WHERE id = 43"
echo ----------------------------------------
echo.
echo 4. Kiem tra pm2 logs:
echo.
echo ----------------------------------------
echo pm2 logs shopdonk --lines 50
echo ----------------------------------------
echo.
echo 5. Kiem tra Node process:
echo.
echo ----------------------------------------
echo pm2 status
echo ----------------------------------------
echo.
pause