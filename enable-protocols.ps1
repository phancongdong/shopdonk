# Enable SQL Server Protocols
# Run this script as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Enable SQL Server Network Protocols" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    # Method 1: Using WMI
    Write-Host "Method 1: Using WMI..." -ForegroundColor Yellow
    
    $computerName = $env:COMPUTERNAME
    $instanceName = "MSSQLSERVER"
    
    # Load SMO WMI assembly
    Add-Type -AssemblyName "Microsoft.SqlServer.SqlWmiManagement, Version=16.0.0.0, Culture=neutral, PublicKeyToken=89845dcd8080cc91" -ErrorAction SilentlyContinue
    
    if ($?) {
        $wmi = New-Object Microsoft.SqlServer.Management.Smo.Wmi.ManagedComputer($computerName)
        
        # Enable TCP/IP
        $tcp = $wmi.GetSmoObject("ManagedComputer[@Name='$computerName']/ServerInstance[@Name='$instanceName']/ServerProtocol[@Name='Tcp']")
        if ($tcp.IsEnabled -eq $false) {
            $tcp.IsEnabled = $true
            $tcp.Alter()
            Write-Host "[OK] TCP/IP enabled" -ForegroundColor Green
        } else {
            Write-Host "[INFO] TCP/IP already enabled" -ForegroundColor Yellow
        }
        
        # Enable Named Pipes
        $np = $wmi.GetSmoObject("ManagedComputer[@Name='$computerName']/ServerInstance[@Name='$instanceName']/ServerProtocol[@Name='Np']")
        if ($np.IsEnabled -eq $false) {
            $np.IsEnabled = $true
            $np.Alter()
            Write-Host "[OK] Named Pipes enabled" -ForegroundColor Green
        } else {
            Write-Host "[INFO] Named Pipes already enabled" -ForegroundColor Yellow
        }
        
        # Enable Shared Memory
        $sm = $wmi.GetSmoObject("ManagedComputer[@Name='$computerName']/ServerInstance[@Name='$instanceName']/ServerProtocol[@Name='Sm']")
        if ($sm.IsEnabled -eq $false) {
            $sm.IsEnabled = $true
            $sm.Alter()
            Write-Host "[OK] Shared Memory enabled" -ForegroundColor Green
        } else {
            Write-Host "[INFO] Shared Memory already enabled" -ForegroundColor Yellow
        }
    } else {
        throw "WMI method failed"
    }
    
} catch {
    Write-Host "[ERROR] WMI method failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Method 2: Manual Configuration Required" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please follow these steps:" -ForegroundColor Cyan
    Write-Host "1. Open SQL Server Configuration Manager" -ForegroundColor White
    Write-Host "   Location: C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Microsoft SQL Server 2025\Configuration Tools\" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Navigate to:" -ForegroundColor White
    Write-Host "   SQL Server Network Configuration > Protocols for MSSQLSERVER" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Enable these protocols:" -ForegroundColor White
    Write-Host "   - TCP/IP (Right-click > Enable)" -ForegroundColor Gray
    Write-Host "   - Named Pipes (Right-click > Enable)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Restart SQL Server Service:" -ForegroundColor White
    Write-Host "   net stop MSSQLSERVER" -ForegroundColor Gray
    Write-Host "   net start MSSQLSERVER" -ForegroundColor Gray
    Write-Host ""
    
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Restart SQL Server Service" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Restart-Service -Name MSSQLSERVER -Force
Write-Host "[OK] SQL Server service restarted" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Connection" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Wait for service to start
Start-Sleep -Seconds 3

# Test connection
node test-all-connections.js
