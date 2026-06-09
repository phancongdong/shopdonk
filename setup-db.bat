@echo off
echo ========================================
echo   SQL Server Connection Setup
echo ========================================
echo.

echo Step 1: Checking SQL Server Service...
sc query MSSQLSERVER | find "RUNNING" >nul
if errorlevel 1 (
    echo [ERROR] SQL Server service is not running!
    echo Please start SQL Server service first.
    pause
    exit /b 1
) else (
    echo [OK] SQL Server service is running
)

echo.
echo Step 2: Testing Connection...
echo.

node test-connection.js

echo.
echo ========================================
echo   Setup Instructions
echo ========================================
echo.
echo If connection failed, please:
echo.
echo 1. Enable TCP/IP Protocol:
echo    - Open SQL Server Configuration Manager
echo    - SQL Server Network Configuration
echo    - Protocols for MSSQLSERVER
echo    - Enable TCP/IP
echo    - Restart SQL Server service
echo.
echo 2. Enable Mixed Mode Authentication:
echo    - Open SQL Server Management Studio
echo    - Right-click server ^> Properties ^> Security
echo    - Select "SQL Server and Windows Authentication mode"
echo    - Restart SQL Server service
echo.
echo 3. Create SA Password (if needed):
echo    - In SSMS, expand Security ^> Logins
echo    - Right-click 'sa' ^> Properties
echo    - Set a strong password
echo    - Enable 'Login' in Status tab
echo.
echo 4. Update .env file with your password
echo.
pause