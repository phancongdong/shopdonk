-- Nested Categories Schema with Closure Table Pattern
-- Run this script to add hierarchical category support

USE CayTheDB;
GO

-- Add parent_id column to Categories table (Adjacency List for simple operations)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Categories') AND name = 'parent_id')
BEGIN
    ALTER TABLE Categories ADD parent_id INT NULL;
    ALTER TABLE Categories ADD CONSTRAINT FK_Categories_Parent FOREIGN KEY (parent_id) REFERENCES Categories(id);
    PRINT 'Added parent_id column to Categories';
END
GO

-- Add depth and path columns for quick lookups
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Categories') AND name = 'depth')
BEGIN
    ALTER TABLE Categories ADD depth INT DEFAULT 0;
    PRINT 'Added depth column to Categories';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Categories') AND name = 'path')
BEGIN
    ALTER TABLE Categories ADD path NVARCHAR(1000) DEFAULT '';
    PRINT 'Added path column to Categories';
END
GO

-- Create CategoryClosure table (Closure Table for efficient tree queries)
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
    
    PRINT 'Table CategoryClosure created successfully';
END
GO

-- Initialize closure table with existing categories
-- First, add self-references for all existing categories
INSERT INTO CategoryClosure (ancestor_id, descendant_id, depth)
SELECT id, id, 0 FROM Categories
WHERE NOT EXISTS (
    SELECT 1 FROM CategoryClosure 
    WHERE ancestor_id = Categories.id AND descendant_id = Categories.id
);
GO

-- Update depth and path for existing categories
UPDATE Categories SET depth = 0, path = CAST(id AS NVARCHAR(1000)) WHERE parent_id IS NULL;
UPDATE c SET 
    c.depth = p.depth + 1,
    c.path = p.path + '/' + CAST(c.id AS NVARCHAR(1000))
FROM Categories c
INNER JOIN Categories p ON c.parent_id = p.id;
GO

PRINT 'Nested Categories Schema setup complete!';
PRINT 'Structure:';
PRINT '- Categories table: has parent_id, depth, path columns';
PRINT '- CategoryClosure table: stores all ancestor-descendant relationships';
PRINT '';
PRINT 'Usage:';
PRINT '- parent_id: direct parent (Adjacency List - simple but limited)';
PRINT '- CategoryClosure: all ancestors/descendants (Closure Table - efficient tree queries)';
PRINT '- depth: level in hierarchy (0 = root)';
PRINT '- path: slash-separated path of IDs (e.g., "1/5/12")';
GO
