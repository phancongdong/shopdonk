@echo off
echo ========================================
echo   Enable SQL Server TCP/IP and Named Pipes
echo ========================================
echo.
echo This script requires Administrator privileges.
echo.

REM Enable TCP/IP
echo Enabling TCP/IP...
reg add "HKLM\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL17.MSSQLSERVER\MSSQLServer\SuperSocketNetLib\Tcp" /v Enabled /t REG_DWORD /d 1 /f
if errorlevel 1 (
    echo [ERROR] Failed to enable TCP/IP. Run as Administrator!
    pause
    exit /b 1
) else (
    echo [OK] TCP/IP enabled
)

REM Enable Named Pipes
echo.
echo Enabling Named Pipes...
reg add "HKLM\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL17.MSSQLSERVER\MSSQLServer\SuperSocketNetLib\Np" /v Enabled /t REG_DWORD /d 1 /f
if errorlevel 1 (
    echo [ERROR] Failed to enable Named Pipes. Run as Administrator!
    pause
    exit /b 1
) else (
    echo [OK] Named Pipes enabled
)

REM Enable Shared Memory
echo.
echo Enabling Shared Memory...
reg add "HKLM\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL17.MSSQLSERVER\MSSQLServer\SuperSocketNetLib\Sm" /v Enabled /t REG_DWORD /d 1 /f
if errorlevel 1 (
    echo [ERROR] Failed to enable Shared Memory!
) else (
    echo [OK] Shared Memory enabled
)

echo.
echo ========================================
echo   Restart SQL Server Service
echo ========================================
echo.

net stop MSSQLSERVER
timeout /t 3 /nobreak >nul
net start MSSQLSERVER

echo.
echo ========================================
echo   Test Connection
echo ========================================
echo.

timeout /t 5 /nobreak >nul

node test-all-connections.js

echo.
pause