-- Database Schema for ShopGame
-- Run this script in SQL Server Management Studio

USE master;
GO

-- Create database if not exists
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'CayTheDB')
BEGIN
    CREATE DATABASE CayTheDB;
END
GO

USE CayTheDB;
GO

-- Users Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
BEGIN
    CREATE TABLE Users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        balance DECIMAL(18, 2) DEFAULT 0,
        role VARCHAR(20) DEFAULT 'user',
        status BIT DEFAULT 1,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME
    );
    
    PRINT 'Table Users created successfully';
END
GO

-- Categories Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Categories' AND xtype='U')
BEGIN
    CREATE TABLE Categories (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        slug VARCHAR(150) UNIQUE,
        icon VARCHAR(50),
        description NVARCHAR(500),
        display_order INT DEFAULT 0,
        status BIT DEFAULT 1,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME
    );
    
    PRINT 'Table Categories created successfully';
END
GO

-- Products Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Products' AND xtype='U')
BEGIN
    CREATE TABLE Products (
        id INT IDENTITY(1,1) PRIMARY KEY,
        category_id INT,
        name NVARCHAR(200) NOT NULL,
        slug VARCHAR(250) UNIQUE,
        description NVARCHAR(MAX),
        price DECIMAL(18, 2) NOT NULL,
        original_price DECIMAL(18, 2),
        image VARCHAR(500),
        stock INT DEFAULT 0,
        features NVARCHAR(MAX),
        status BIT DEFAULT 1,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME,
        FOREIGN KEY (category_id) REFERENCES Categories(id) ON DELETE SET NULL
    );
    
    PRINT 'Table Products created successfully';
END
GO

-- Orders Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Orders' AND xtype='U')
BEGIN
    CREATE TABLE Orders (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT DEFAULT 1,
        total_price DECIMAL(18, 2) NOT NULL,
        account_info NVARCHAR(MAX),
        status VARCHAR(20) DEFAULT 'pending',
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE
    );
    
    PRINT 'Table Orders created successfully';
END
GO

-- Deposits Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Deposits' AND xtype='U')
BEGIN
    CREATE TABLE Deposits (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        amount DECIMAL(18, 2) NOT NULL,
        method VARCHAR(50) NOT NULL,
        transaction_code VARCHAR(100),
        status VARCHAR(20) DEFAULT 'pending',
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
    );
    
    PRINT 'Table Deposits created successfully';
END
GO

-- Transactions Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Transactions' AND xtype='U')
BEGIN
    CREATE TABLE Transactions (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        amount DECIMAL(18, 2) NOT NULL,
        description NVARCHAR(500),
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
    );
    
    PRINT 'Table Transactions created successfully';
END
GO

-- News/Articles Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='News' AND xtype='U')
BEGIN
    CREATE TABLE News (
        id INT IDENTITY(1,1) PRIMARY KEY,
        title NVARCHAR(200) NOT NULL,
        slug VARCHAR(250) UNIQUE,
        content NVARCHAR(MAX),
        image VARCHAR(500),
        category VARCHAR(50),
        views INT DEFAULT 0,
        status BIT DEFAULT 1,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME
    );
    
    PRINT 'Table News created successfully';
END
GO

-- Create Indexes for better performance
CREATE INDEX IX_Users_Email ON Users(email);
CREATE INDEX IX_Products_Category ON Products(category_id);
CREATE INDEX IX_Products_Status ON Products(status);
CREATE INDEX IX_Orders_User ON Orders(user_id);
CREATE INDEX IX_Orders_Status ON Orders(status);
CREATE INDEX IX_Deposits_User ON Deposits(user_id);
CREATE INDEX IX_Transactions_User ON Transactions(user_id);
GO

PRINT 'All tables and indexes created successfully!';
PRINT 'Database Schema for ShopGame is ready.';
GO