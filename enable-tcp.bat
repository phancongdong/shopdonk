@echo off
echo ========================================
echo   Enable SQL Server TCP/IP Protocol
echo ========================================
echo.
echo This script will enable TCP/IP for SQL Server
echo.

REM Enable TCP/IP using PowerShell
powershell -Command "& { 
    try {
        $wmi = New-Object Microsoft.SqlServer.Management.Smo.Wmi.ManagedComputer
        $tcp = $wmi.GetSmoObject('ManagedComputer[@Name=''%COMPUTERNAME%'']/ServerInstance[@Name=''MSSQLSERVER'']/ServerProtocol[@Name=''Tcp'']')
        $tcp.IsEnabled = $true
        $tcp.Alter()
        Write-Host '[OK] TCP/IP protocol enabled successfully!' -ForegroundColor Green
    } catch {
        Write-Host '[ERROR] Failed to enable TCP/IP:' $_.Exception.Message -ForegroundColor Red
        Write-Host 'Please enable manually via SQL Server Configuration Manager' -ForegroundColor Yellow
    }
}"

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

node test-connection.js

pause
