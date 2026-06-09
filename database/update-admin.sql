-- Update Admin Account
-- Run this in SQL Server Management Studio

USE CayTheDB;
GO

-- Update admin role and balance
UPDATE Users 
SET role = 'admin',
    balance = 10000000
WHERE email = 'admin@shopgame.vn';
GO

-- Verify admin account
SELECT id, name, email, balance, role, created_at 
FROM Users 
WHERE email = 'admin@shopgame.vn';
GO

PRINT 'Admin account updated successfully!';
PRINT 'Email: admin@shopgame.vn';
PRINT 'Password: admin123456';
PRINT 'Balance: 10,000,000 VND';
PRINT 'Role: admin';
GO