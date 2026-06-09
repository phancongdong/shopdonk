-- Quick Setup Database for ShopGame
-- Copy and run this entire script in SQL Server Management Studio

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

-- Drop existing tables (be careful in production!)
IF EXISTS (SELECT * FROM sysobjects WHERE name='News') DROP TABLE News;
IF EXISTS (SELECT * FROM sysobjects WHERE name='Transactions') DROP TABLE Transactions;
IF EXISTS (SELECT * FROM sysobjects WHERE name='Deposits') DROP TABLE Deposits;
IF EXISTS (SELECT * FROM sysobjects WHERE name='Orders') DROP TABLE Orders;
IF EXISTS (SELECT * FROM sysobjects WHERE name='Products') DROP TABLE Products;
IF EXISTS (SELECT * FROM sysobjects WHERE name='Categories') DROP TABLE Categories;
IF EXISTS (SELECT * FROM sysobjects WHERE name='Users') DROP TABLE Users;
GO

-- Users Table
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
GO

-- Categories Table
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
GO

-- Products Table
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
GO

-- Orders Table
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
GO

-- Deposits Table
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
GO

-- Transactions Table
CREATE TABLE Transactions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    description NVARCHAR(500),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
GO

-- News Table
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
GO

-- Insert Categories
INSERT INTO Categories (name, slug, icon, display_order, status) VALUES
(N'TFT Đấu Trường Chân Lý', 'tft', 'fas fa-chess', 1, 1),
(N'Liên Quân Mobile', 'lien-quan', 'fas fa-mobile-alt', 2, 1),
(N'Free Fire', 'free-fire', 'fas fa-fire', 3, 1),
(N'Roblox', 'roblox', 'fas fa-cube', 4, 1);
GO

-- Insert Products
INSERT INTO Products (category_id, name, slug, description, price, original_price, image, stock, features, status) VALUES
(1, N'Linh Thú Aatrox Huyết Nguyệt', 'linh-thu-aatrox-huyet-nguyet', N'Linh thú TFT Aatrox Huyết Nguyệt cực đẹp', 110500, 130000, 'https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=Aatrox', 1, 'Rarity: Legendary', 1),
(1, N'Linh Thú Jhin Hắc Tinh Đột Phá', 'linh-thu-jhin-hac-tinh-dot-pha', N'Linh thú TFT Jhin Hắc Tinh', 90000, 100000, 'https://via.placeholder.com/300x200/9B59B6/FFFFFF?text=Jhin', 15, 'Rarity: Epic', 1),
(1, N'Linh Thú Jin Hắc Tinh', 'linh-thu-jin-hac-tinh', N'Linh thú TFT Jin Hắc Tinh', 112500, 120000, 'https://via.placeholder.com/300x200/3498DB/FFFFFF?text=Jin', 14, 'Rarity: Epic', 1),
(1, N'Linh Xà Thần Vực', 'linh-xa-than-vuc', N'Linh thú TFT Linh Xà', 97500, 110000, 'https://via.placeholder.com/300x200/2ECC71/FFFFFF?text=Linh+Xa', 11, 'Rarity: Rare', 1),
(2, N'Nick Liên Quân Trắng Thông Tin', 'nick-lien-quan-trang-thong-tin', N'Nick Liên Quân Mobile trắng thông tin', 100000, 150000, 'https://via.placeholder.com/300x200/E74C3C/FFFFFF?text=Lien+Quan', 8, 'Rank: Bạch Kim', 1),
(2, N'Nick Reg Trắng Thông Tin', 'nick-reg-trang-thong-tin', N'Nick Reg trắng thông tin giá rẻ', 30000, 50000, 'https://via.placeholder.com/300x200/F39C12/FFFFFF?text=Nick+Reg', 111, 'Rank: Đồng', 1),
(2, N'Nick Liên Quân Rip', 'nick-lien-quan-rip', N'Nick Liên Quân Rip skin nhiều', 270000, 350000, 'https://via.placeholder.com/300x200/8E44AD/FFFFFF?text=LQ+Rip', 6, 'Skin: 50+', 1),
(3, N'Acc Free Fire VIP', 'acc-free-fire-vip', N'Acc Free Fire VIP nhiều skin', 150000, 200000, 'https://via.placeholder.com/300x200/FF5722/FFFFFF?text=FF+VIP', 10, 'Skin: 30+', 1),
(3, N'Nick Free Fire Random', 'nick-free-fire-random', N'Nick Free Fire random giá rẻ', 20000, 30000, 'https://via.placeholder.com/300x200/03A9F4/FFFFFF?text=FF+Random', 100, 'Random', 1),
(4, N'Acc Roblox Có Robux', 'acc-roblox-co-robux', N'Acc Roblox có Robux', 200000, 300000, 'https://via.placeholder.com/300x200/E91E63/FFFFFF?text=Robux', 5, 'Robux: 1000+', 1),
(4, N'Nick Roblox Random', 'nick-roblox-random', N'Nick Roblox random', 10000, 20000, 'https://via.placeholder.com/300x200/9C27B0/FFFFFF?text=Roblox+Random', 200, 'Random', 1);
GO

PRINT '=================================';
PRINT 'Database setup completed!';
PRINT '=================================';
PRINT 'Database: CayTheDB';
PRINT 'Tables: Users, Categories, Products, Orders, Deposits, Transactions, News';
PRINT 'Categories: 4';
PRINT 'Products: 11';
PRINT '=================================';
GO