-- Add account_username and account_password columns to Products table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Products') AND name = 'account_username')
BEGIN
    ALTER TABLE Products ADD account_username NVARCHAR(100) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Products') AND name = 'account_password')
BEGIN
    ALTER TABLE Products ADD account_password NVARCHAR(100) NULL;
END

PRINT 'Columns added successfully!';