@echo off
title SQL Server Connection Checker
color 0A
cls

:menu
echo ========================================
echo   SQL Server Connection Checker
echo ========================================
echo.
echo 1. Check Protocol Status
echo 2. Test Connection
echo 3. Restart SQL Server
echo 4. Create Database
echo 5. Run Server
echo 6. Exit
echo.
set /p choice="Select option (1-6): "

if "%choice%"=="1" goto check_protocols
if "%choice%"=="2" goto test_connection
if "%choice%"=="3" goto restart_sql
if "%choice%"=="4" goto create_db
if "%choice%"=="5" goto run_server
if "%choice%"=="6" exit

:check_protocols
cls
echo ========================================
echo   Protocol Status
echo ========================================
echo.
echo TCP/IP:
reg query "HKLM\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL17.MSSQLSERVER\MSSQLServer\SuperSocketNetLib\Tcp" /v Enabled 2>nul
echo.
echo Named Pipes:
reg query "HKLM\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL17.MSSQLSERVER\MSSQLServer\SuperSocketNetLib\Np" /v Enabled 2>nul
echo.
echo Shared Memory:
reg query "HKLM\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL17.MSSQLSERVER\MSSQLServer\SuperSocketNetLib\Sm" /v Enabled 2>nul
echo.
pause
goto menu

:test_connection
cls
node test-all-connections.js
echo.
pause
goto menu

:restart_sql
cls
echo Restarting SQL Server...
net stop MSSQLSERVER
timeout /t 3 /nobreak >nul
net start MSSQLSERVER
echo.
echo SQL Server restarted!
timeout /t 3 /nobreak >nul
goto menu

:create_db
cls
echo ========================================
echo   Creating Database and Tables
echo ========================================
echo.
echo Please run this in SQL Server Management Studio:
echo.
echo File: database\schema.sql
echo.
echo Or execute:
sqlcmd -S localhost -E -i database\schema.sql
echo.
pause
goto menu

:run_server
cls
echo ========================================
echo   Starting Node.js Server
echo ========================================
echo.
echo Server will run at: http://localhost:3000
echo.
echo Press Ctrl+C to stop
echo.
npm start
goto menu
