-- Create Images Table for Cloudinary uploads
USE CayTheDB;
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Images' AND xtype='U')
BEGIN
    CREATE TABLE Images (
        id INT IDENTITY(1,1) PRIMARY KEY,
        public_id NVARCHAR(500) NOT NULL,
        url NVARCHAR(1000) NOT NULL,
        original_name NVARCHAR(500),
        size INT DEFAULT 0,
        width INT DEFAULT 0,
        height INT DEFAULT 0,
        format NVARCHAR(20),
        resource_type NVARCHAR(50) DEFAULT 'image',
        user_id INT,
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL
    );
    
    CREATE INDEX IX_Images_PublicId ON Images(public_id);
    CREATE INDEX IX_Images_User ON Images(user_id);
    CREATE INDEX IX_Images_CreatedAt ON Images(created_at);
    
    PRINT 'Table Images created successfully!';
END
ELSE
BEGIN
    PRINT 'Table Images already exists!';
END
GO
