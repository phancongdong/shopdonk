-- ============================================
-- EMERGENCY FIX: Make categories work on VPS
-- This script ensures all required columns exist
-- ============================================

USE ShopDonkDB;
GO

PRINT 'Starting Emergency Fix for Categories...';
GO

-- Add missing columns to Categories (ignore if exists)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Categories') AND name = 'parent_id')
BEGIN
    ALTER TABLE Categories ADD parent_id INT NULL;
    PRINT 'Added parent_id column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Categories') AND name = 'depth')
BEGIN
    ALTER TABLE Categories ADD depth INT DEFAULT 0;
    PRINT 'Added depth column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Categories') AND name = 'path')
BEGIN
    ALTER TABLE Categories ADD path NVARCHAR(1000) DEFAULT '';
    PRINT 'Added path column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Categories') AND name = 'slug')
BEGIN
    ALTER TABLE Categories ADD slug VARCHAR(150) NULL;
    PRINT 'Added slug column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Categories') AND name = 'icon')
BEGIN
    ALTER TABLE Categories ADD icon VARCHAR(50) NULL;
    PRINT 'Added icon column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Categories') AND name = 'color')
BEGIN
    ALTER TABLE Categories ADD color VARCHAR(20) NULL;
    PRINT 'Added color column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Categories') AND name = 'display_order')
BEGIN
    ALTER TABLE Categories ADD display_order INT DEFAULT 0;
    PRINT 'Added display_order column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Categories') AND name = 'status')
BEGIN
    ALTER TABLE Categories ADD status BIT DEFAULT 1;
    PRINT 'Added status column';
END
GO

-- Create CategoryClosure table if not exists
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CategoryClosure' AND xtype='U')
BEGIN
    CREATE TABLE CategoryClosure (
        ancestor_id INT NOT NULL,
        descendant_id INT NOT NULL,
        depth INT NOT NULL DEFAULT 0,
        PRIMARY KEY (ancestor_id, descendant_id)
    );
    CREATE INDEX IX_CategoryClosure_Descendant ON CategoryClosure(descendant_id);
    PRINT 'Created CategoryClosure table';
END
GO

-- Initialize existing categories
-- Update depth and path
UPDATE Categories SET 
    depth = ISNULL(depth, 0),
    path = ISNULL(path, CAST(id AS NVARCHAR(1000))),
    display_order = ISNULL(display_order, id)
WHERE depth IS NULL OR path IS NULL OR path = '';
GO

-- Generate slugs for existing categories
UPDATE Categories 
SET slug = LOWER(REPLACE(REPLACE(REPLACE(REPLACE(name, ' ', '-'), '/', '-'), '''', ''), '"', ''))
WHERE slug IS NULL OR slug = '';
GO

-- Populate CategoryClosure with self-references
INSERT INTO CategoryClosure (ancestor_id, descendant_id, depth)
SELECT id, id, 0 FROM Categories
WHERE NOT EXISTS (
    SELECT 1 FROM CategoryClosure 
    WHERE ancestor_id = Categories.id AND descendant_id = Categories.id
);
GO

PRINT '============================================';
PRINT 'EMERGENCY FIX COMPLETED!';
PRINT 'Categories should now work correctly.';
PRINT '============================================';
GO

-- Verify
SELECT 
    'Categories' as TableName, COUNT(*) as Count FROM Categories
UNION ALL
SELECT 
    'CategoryClosure' as TableName, COUNT(*) as Count FROM CategoryClosure;
GO
