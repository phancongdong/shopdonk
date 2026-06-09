-- ============================================
-- DATABASE SETUP FOR SHOPDONK
-- Run this after SQL Server is installed
-- ============================================

CREATE DATABASE ShopDonkDB;
GO

USE ShopDonkDB;
GO

-- Users Table
CREATE TABLE Users (
    id INT PRIMARY KEY IDENTITY(1,1),
    username NVARCHAR(50) UNIQUE NOT NULL,
    email NVARCHAR(100) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    phone NVARCHAR(20),
    fullName NVARCHAR(100),
    balance DECIMAL(18,2) DEFAULT 0,
    role NVARCHAR(20) DEFAULT 'user',
    status NVARCHAR(20) DEFAULT 'active',
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);
GO

-- Categories Table
CREATE TABLE Categories (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(500),
    image NVARCHAR(500),
    sortOrder INT DEFAULT 0,
    status NVARCHAR(20) DEFAULT 'active',
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);
GO

-- Products Table
CREATE TABLE Products (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX),
    price DECIMAL(18,2) NOT NULL,
    costPrice DECIMAL(18,2),
    categoryId INT,
    image NVARCHAR(500),
    stock INT DEFAULT 0,
    sold INT DEFAULT 0,
    status NVARCHAR(20) DEFAULT 'active',
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (categoryId) REFERENCES Categories(id)
);
GO

-- Orders Table
CREATE TABLE Orders (
    id INT PRIMARY KEY IDENTITY(1,1),
    userId INT NOT NULL,
    totalAmount DECIMAL(18,2) NOT NULL,
    status NVARCHAR(50) DEFAULT 'pending',
    paymentMethod NVARCHAR(50),
    paymentStatus NVARCHAR(50) DEFAULT 'pending',
    notes NVARCHAR(500),
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES Users(id)
);
GO

-- Order Items Table
CREATE TABLE OrderItems (
    id INT PRIMARY KEY IDENTITY(1,1),
    orderId INT NOT NULL,
    productId INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(18,2) NOT NULL,
    FOREIGN KEY (orderId) REFERENCES Orders(id),
    FOREIGN KEY (productId) REFERENCES Products(id)
);
GO

-- Deposits Table
CREATE TABLE Deposits (
    id INT PRIMARY KEY IDENTITY(1,1),
    userId INT NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    status NVARCHAR(50) DEFAULT 'pending',
    paymentMethod NVARCHAR(50),
    transactionId NVARCHAR(100),
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES Users(id)
);
GO

-- Transactions Table
CREATE TABLE Transactions (
    id INT PRIMARY KEY IDENTITY(1,1),
    userId INT NOT NULL,
    type NVARCHAR(50) NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    balance DECIMAL(18,2),
    description NVARCHAR(500),
    referenceId INT,
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES Users(id)
);
GO

-- Banners Table
CREATE TABLE Banners (
    id INT PRIMARY KEY IDENTITY(1,1),
    title NVARCHAR(200),
    description NVARCHAR(500),
    image NVARCHAR(500) NOT NULL,
    link NVARCHAR(500),
    sortOrder INT DEFAULT 0,
    status NVARCHAR(20) DEFAULT 'active',
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);
GO

-- Create Admin User
INSERT INTO Users (username, email, password, fullName, role, status)
VALUES ('admin', 'admin@shopdonk.com', '$2a$10$YourHashedPasswordHere', 'Administrator', 'admin', 'active');
GO

-- Create Indexes
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_users_username ON Users(username);
CREATE INDEX idx_products_category ON Products(categoryId);
CREATE INDEX idx_orders_user ON Orders(userId);
CREATE INDEX idx_orders_status ON Orders(status);
CREATE INDEX idx_deposits_user ON Deposits(userId);
CREATE INDEX idx_transactions_user ON Transactions(userId);
GO

PRINT 'Database setup completed successfully!';
GO
