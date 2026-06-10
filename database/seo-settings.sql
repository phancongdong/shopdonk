-- SEO Settings Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='SEOSettings' AND xtype='U')
BEGIN
    CREATE TABLE SEOSettings (
        id INT PRIMARY KEY IDENTITY(1,1),
        google_verification NVARCHAR(255),
        google_analytics_id NVARCHAR(255),
        site_title NVARCHAR(255),
        site_description NVARCHAR(MAX),
        site_keywords NVARCHAR(MAX),
        og_title NVARCHAR(255),
        og_description NVARCHAR(MAX),
        og_image NVARCHAR(255),
        robots_txt NVARCHAR(MAX),
        allow_google BIT DEFAULT 1,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE()
    );
    
    PRINT 'SEOSettings table created successfully';
END
ELSE
BEGIN
    PRINT 'SEOSettings table already exists';
END
GO