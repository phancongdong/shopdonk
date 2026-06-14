-- ============================================
-- NESTED CATEGORIES MIGRATION FOR VPS
-- Run this on VPS database: ShopDonkDB
-- ============================================

USE ShopDonkDB;
GO

PRINT 'Starting Nested Categories Migration...';
GO

-- Step 1: Add parent_id column if not exists
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Categories') AND name = 'parent_id')
BEGIN
    ALTER TABLE Categories ADD parent_id INT NULL;
    PRINT 'Added parent_id column';
END
GO

-- Step 2: Add depth column if not exists
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Categories') AND name = 'depth')
BEGIN
    ALTER TABLE Categories ADD depth INT DEFAULT 0;
    PRINT 'Added depth column';
END
GO

-- Step 3: Add path column if not exists
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Categories') AND name = 'path')
BEGIN
    ALTER TABLE Categories ADD path NVARCHAR(1000) DEFAULT '';
    PRINT 'Added path column';
END
GO

-- Step 4: Add slug column if not exists (for SEO-friendly URLs)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Categories') AND name = 'slug')
BEGIN
    ALTER TABLE Categories ADD slug VARCHAR(150) NULL;
    PRINT 'Added slug column';
END
GO

-- Step 5: Add icon column if not exists
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Categories') AND name = 'icon')
BEGIN
    ALTER TABLE Categories ADD icon VARCHAR(50) NULL;
    PRINT 'Added icon column';
END
GO

-- Step 6: Add color column if not exists
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Categories') AND name = 'color')
BEGIN
    ALTER TABLE Categories ADD color VARCHAR(20) NULL;
    PRINT 'Added color column';
END
GO

-- Step 7: Add display_order column if not exists
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Categories') AND name = 'display_order')
BEGIN
    ALTER TABLE Categories ADD display_order INT DEFAULT 0;
    PRINT 'Added display_order column';
END
GO

-- Step 8: Add status column if not exists (bit type)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Categories') AND name = 'status')
BEGIN
    ALTER TABLE Categories ADD status BIT DEFAULT 1;
    PRINT 'Added status column';
END
GO

-- Step 9: Create CategoryClosure table for efficient tree queries
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CategoryClosure' AND xtype='U')
BEGIN
    CREATE TABLE CategoryClosure (
        ancestor_id INT NOT NULL,
        descendant_id INT NOT NULL,
        depth INT NOT NULL DEFAULT 0,
        PRIMARY KEY (ancestor_id, descendant_id)
    );
    
    CREATE INDEX IX_CategoryClosure_Descendant ON CategoryClosure(descendant_id);
    CREATE INDEX IX_CategoryClosure_Depth ON CategoryClosure(depth);
    PRINT 'Created CategoryClosure table';
END
GO

-- Step 10: Add foreign key constraint
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Categories_Parent')
BEGIN
    BEGIN TRY
        ALTER TABLE Categories ADD CONSTRAINT FK_Categories_Parent 
        FOREIGN KEY (parent_id) REFERENCES Categories(id);
        PRINT 'Added FK_Categories_Parent constraint';
    END TRY
    BEGIN CATCH
        PRINT 'FK_Categories_Parent constraint may already exist or could not be added';
    END CATCH
END
GO

-- Step 11: Initialize closure table with existing categories
-- Add self-references
INSERT INTO CategoryClosure (ancestor_id, descendant_id, depth)
SELECT id, id, 0 FROM Categories
WHERE NOT EXISTS (
    SELECT 1 FROM CategoryClosure 
    WHERE ancestor_id = Categories.id AND descendant_id = Categories.id
);
GO

-- Step 12: Update depth and path for all categories
UPDATE Categories SET 
    depth = 0, 
    path = CAST(id AS NVARCHAR(1000))
WHERE parent_id IS NULL;
GO

-- Step 13: Generate slugs for existing categories if missing
UPDATE Categories 
SET slug = LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
    name, ' ', '-'), '/', '-'), '\'', ''), '"', ''), '(', ''), ')', ''), '&', 'and'))
WHERE slug IS NULL OR slug = '';
GO

-- Make slug unique
DECLARE @slug_updates TABLE (id INT, new_slug NVARCHAR(200));
INSERT INTO @slug_updates
SELECT c.id, c.slug + '-' + CAST(ROW_NUMBER() OVER (PARTITION BY c.slug ORDER BY c.id) AS VARCHAR)
FROM Categories c
WHERE EXISTS (SELECT 1 FROM Categories c2 WHERE c2.slug = c.slug AND c2.id < c.id);

UPDATE c SET c.slug = u.new_slug
FROM Categories c
INNER JOIN @slug_updates u ON c.id = u.id;
GO

-- Step 14: Update display_order to match id if not set
UPDATE Categories SET display_order = id WHERE display_order IS NULL OR display_order = 0;
GO

-- Step 15: Verify migration
DECLARE @total_categories INT, @closure_entries INT, @root_categories INT, @max_depth INT;

SELECT @total_categories = COUNT(*) FROM Categories;
SELECT @closure_entries = COUNT(*) FROM CategoryClosure;
SELECT @root_categories = COUNT(*) FROM Categories WHERE parent_id IS NULL;
SELECT @max_depth = ISNULL(MAX(depth), 0) FROM Categories;

PRINT '============================================';
PRINT 'MIGRATION COMPLETED SUCCESSFULLY!';
PRINT '============================================';
PRINT 'Total categories: ' + CAST(@total_categories AS VARCHAR);
PRINT 'Closure entries: ' + CAST(@closure_entries AS VARCHAR);
PRINT 'Root categories: ' + CAST(@root_categories AS VARCHAR);
PRINT 'Max depth: ' + CAST(@max_depth AS VARCHAR);
PRINT '============================================';
GO
