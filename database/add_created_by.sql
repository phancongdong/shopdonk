-- Add created_by column to Products table for CTV tracking
USE CayTheDB;
GO

-- Check if column exists, if not add it
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Products') AND name = 'created_by'
)
BEGIN
    ALTER TABLE Products ADD created_by INT NULL;
    PRINT 'Column created_by added to Products table';
END
GO

-- Check if account_type column exists (for account management)
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Products') AND name = 'account_type'
)
BEGIN
    ALTER TABLE Products ADD account_type VARCHAR(20) DEFAULT 'single';
    PRINT 'Column account_type added to Products table';
END
GO

-- Check if account_username column exists
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Products') AND name = 'account_username'
)
BEGIN
    ALTER TABLE Products ADD account_username NVARCHAR(200) NULL;
    PRINT 'Column account_username added to Products table';
END
GO

-- Check if account_password column exists
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Products') AND name = 'account_password'
)
BEGIN
    ALTER TABLE Products ADD account_password NVARCHAR(200) NULL;
    PRINT 'Column account_password added to Products table';
END
GO

-- Check if accounts_list column exists
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Products') AND name = 'accounts_list'
)
BEGIN
    ALTER TABLE Products ADD accounts_list NVARCHAR(MAX) NULL;
    PRINT 'Column accounts_list added to Products table';
END
GO

-- Check if cost_price column exists
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Products') AND name = 'cost_price'
)
BEGIN
    ALTER TABLE Products ADD cost_price DECIMAL(18, 2) DEFAULT 0;
    PRINT 'Column cost_price added to Products table';
END
GO

-- Check if is_hidden column exists
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Products') AND name = 'is_hidden'
)
BEGIN
    ALTER TABLE Products ADD is_hidden BIT DEFAULT 0;
    PRINT 'Column is_hidden added to Products table';
END
GO

-- Add foreign key constraint for created_by if not exists
IF NOT EXISTS (
    SELECT * FROM sys.foreign_keys 
    WHERE name = 'FK_Products_CreatedBy'
)
BEGIN
    ALTER TABLE Products ADD CONSTRAINT FK_Products_CreatedBy 
    FOREIGN KEY (created_by) REFERENCES Users(id) ON DELETE SET NULL;
    PRINT 'Foreign key FK_Products_CreatedBy added';
END
GO

PRINT 'Database updated successfully for CTV feature!';
GO