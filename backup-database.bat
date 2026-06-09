@echo off
echo ============================================
echo   BACKUP DATABASE CAYTHEDB
echo ============================================
echo.

set DB_NAME=CayTheDB
set BACKUP_FILE=CayTheDB_backup_%date:~-4,4%%date:~-7,2%%date:~-10,2%.bak
set BACKUP_PATH=C:\Users\Admin\Documents\webcaythe\backup

if not exist "%BACKUP_PATH%" mkdir "%BACKUP_PATH%"

echo Creating backup directory...
if not exist "%BACKUP_PATH%" mkdir "%BACKUP_PATH%"

echo.
echo Backing up database %DB_NAME%...
echo Backup file: %BACKUP_PATH%\%BACKUP_FILE%
echo.

sqlcmd -S localhost -U sa -P "YourStrongPassword123!" -d %DB_NAME% -Q "BACKUP DATABASE [%DB_NAME] TO DISK='%BACKUP_PATH%\%BACKUP_FILE%' WITH FORMAT, MEDIANAME='CayTheDB_Backup', NAME='Full Backup of CayTheDB'"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo   BACKUP SUCCESSFUL!
    echo ============================================
    echo Backup file: %BACKUP_PATH%\%BACKUP_FILE%
    echo.
    echo Next steps:
    echo 1. Copy backup file to VPS:
    echo    scp "%BACKUP_PATH%\%BACKUP_FILE%" root@103.178.235.184:/tmp/
    echo.
    echo 2. Restore on VPS (run in Bitvise SSH):
    echo    docker cp /tmp/%BACKUP_FILE% sqlserver:/var/opt/mssql/backup/
    echo    docker exec -it sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'ShopDonk@2024' -Q "RESTORE DATABASE ShopDonkDB FROM DISK='/var/opt/mssql/backup/%BACKUP_FILE%' WITH REPLACE, MOVE 'CayTheDB' TO '/var/opt/mssql/data/ShopDonkDB.mdf', MOVE 'CayTheDB_log' TO '/var/opt/mssql/data/ShopDonkDB_log.ldf'"
    echo ============================================
) else (
    echo.
    echo ============================================
    echo   BACKUP FAILED!
    echo ============================================
    echo Please check:
    echo 1. SQL Server is running
    echo 2. Database 'CayTheDB' exists
    echo 3. SA password is correct
    echo ============================================
)

pause
