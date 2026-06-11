-- Sync existing categories with SEO data
-- Run this on VPS - syncs existing Categories to CategorySEO table

USE CayTheDB;
GO

-- Ensure tables exist
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PageSEO' AND xtype='U')
BEGIN
    CREATE TABLE PageSEO (
        id INT PRIMARY KEY IDENTITY(1,1),
        page_name NVARCHAR(100) NOT NULL UNIQUE,
        page_url NVARCHAR(255) NOT NULL,
        title NVARCHAR(255),
        description NVARCHAR(MAX),
        keywords NVARCHAR(MAX),
        og_title NVARCHAR(255),
        og_description NVARCHAR(MAX),
        og_image NVARCHAR(255),
        canonical_url NVARCHAR(255),
        noindex BIT DEFAULT 0,
        nofollow BIT DEFAULT 0,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CategorySEO' AND xtype='U')
BEGIN
    CREATE TABLE CategorySEO (
        id INT PRIMARY KEY IDENTITY(1,1),
        category_id INT NOT NULL,
        title NVARCHAR(255),
        description NVARCHAR(MAX),
        keywords NVARCHAR(MAX),
        og_title NVARCHAR(255),
        og_description NVARCHAR(MAX),
        og_image NVARCHAR(255),
        canonical_url NVARCHAR(255),
        noindex BIT DEFAULT 0,
        nofollow BIT DEFAULT 0,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (category_id) REFERENCES Categories(id)
    );
END
GO

-- Insert default pages if missing
INSERT INTO PageSEO (page_name, page_url, title, description, keywords)
SELECT page_name, page_url, title, description, keywords
FROM (VALUES
    ('home', '/', 'ShopDonk - Shop bán acc game uy tín', 'Shop bán tài khoản game uy tín, giá rẻ', 'acc game'),
    ('login', '/login.html', 'Đăng nhập - ShopDonk', 'Đăng nhập tài khoản ShopDonk', 'đăng nhập'),
    ('register', '/register.html', 'Đăng ký - ShopDonk', 'Đăng ký tài khoản miễn phí', 'đăng ký'),
    ('deposit', '/deposit.html', 'Nạp tiền - ShopDonk', 'Nạp tiền vào tài khoản', 'nạp tiền'),
    ('orders', '/orders.html', 'Lịch sử đơn hàng - ShopDonk', 'Xem lịch sử mua hàng', 'đơn hàng'),
    ('faq', '/faq.html', 'FAQ - ShopDonk', 'Câu hỏi thường gặp', 'faq'),
    ('contact', '/contact.html', 'Liên hệ - ShopDonk', 'Liên hệ hỗ trợ', 'liên hệ'),
    ('terms', '/terms.html', 'Điều khoản - ShopDonk', 'Điều khoản sử dụng', 'điều khoản')
) AS v(page_name, page_url, title, description, keywords)
WHERE NOT EXISTS (SELECT * FROM PageSEO WHERE page_name = v.page_name);
GO

-- Sync existing categories to CategorySEO
INSERT INTO CategorySEO (category_id, title, description, keywords, canonical_url)
SELECT 
    c.id,
    c.name + ' - Tài khoản game giá rẻ | ShopDonk',
    'Mua bán tài khoản ' + c.name + ' uy tín tại ShopDonk.',
    c.name + ', acc ' + c.name,
    'https://shopdonk.com/?slug=' + ISNULL(c.slug, CAST(c.id AS VARCHAR))
FROM Categories c
WHERE c.status = 1
AND NOT EXISTS (SELECT * FROM CategorySEO WHERE category_id = c.id);
GO

-- Show results
SELECT 'Pages synced:' as Info, COUNT(*) as Count FROM PageSEO;
SELECT 'Categories synced:' as Info, COUNT(*) as Count FROM CategorySEO;
SELECT c.name as Category, cs.title as SEO_Title FROM Categories c LEFT JOIN CategorySEO cs ON c.id = cs.category_id WHERE c.status = 1;
GO