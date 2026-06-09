-- Create SQL Login and Database
-- Run this in SQL Server Management Studio (SSMS)

USE master;
GO

-- Enable mixed mode authentication (if not already enabled)
-- This requires registry change and service restart
EXEC xp_instance_regwrite N'HKEY_LOCAL_MACHINE', N'Software\Microsoft\MSSQLServer\MSSQLServer', N'LoginMode', REG_DWORD, 2;
GO

-- Create sa password (if needed)
ALTER LOGIN sa ENABLE;
GO
ALTER LOGIN sa WITH PASSWORD = 'YourStrongPassword123!';
GO

-- Create database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'CayTheDB')
BEGIN
    CREATE DATABASE CayTheDB;
    PRINT 'Database CayTheDB created successfully';
END
ELSE
BEGIN
    PRINT 'Database CayTheDB already exists';
END
GO

USE CayTheDB;
GO

-- Create Users table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
BEGIN
    CREATE TABLE Users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE()
    );
    
    PRINT 'Table Users created successfully';
END
GO

-- Create index
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_users_email' AND object_id = OBJECT_ID('Users'))
BEGIN
    CREATE INDEX idx_users_email ON Users(email);
    PRINT 'Index idx_users_email created successfully';
END
GO

-- Create Sessions table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Sessions' AND xtype='U')
BEGIN
    CREATE TABLE Sessions (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT GETDATE(),
        expires_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
    );
    
    PRINT 'Table Sessions created successfully';
END
GO

-- Create Transactions table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Transactions' AND xtype='U')
BEGIN
    CREATE TABLE Transactions (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        type NVARCHAR(50) NOT NULL,
        amount DECIMAL(18, 2) NOT NULL,
        description NVARCHAR(500),
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
    );
    
    PRINT 'Table Transactions created successfully';
END
GO

PRINT '========================================';
PRINT 'Database setup completed successfully!';
PRINT '========================================';
PRINT '';
PRINT 'Connection details:';
PRINT '  Server: localhost';
PRINT '  Database: CayTheDB';
PRINT '  User: sa';
PRINT '  Password: YourStrongPassword123!';
PRINT '';
PRINT 'IMPORTANT: Restart SQL Server service!';
PRINT '========================================';
GO