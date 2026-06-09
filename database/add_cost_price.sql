-- Add cost_price column to Products table
USE CayTheDB;
GO

IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Products') 
    AND name = 'cost_price'
)
BEGIN
    ALTER TABLE Products ADD cost_price DECIMAL(18, 2) DEFAULT 0;
    PRINT 'Column cost_price added to Products table';
END
ELSE
BEGIN
    PRINT 'Column cost_price already exists';
END
GO

-- Update existing products to have cost_price equal to price (temporary)
UPDATE Products SET cost_price = price WHERE cost_price IS NULL OR cost_price = 0;
GO

PRINT 'Done!';
