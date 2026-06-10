-- Page-specific SEO Settings
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
    
    PRINT 'PageSEO table created successfully';
END
GO

-- Category-specific SEO Settings
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
    
    PRINT 'CategorySEO table created successfully';
END
GO

-- Insert default page SEO settings
IF NOT EXISTS (SELECT * FROM PageSEO WHERE page_name = 'home')
BEGIN
    INSERT INTO PageSEO (page_name, page_url, title, description, keywords) VALUES
    ('home', '/', 'ShopDonk - Shop bán acc game uy tín hàng đầu Việt Nam', 'ShopDonk chuyên mua bán tài khoản game uy tín, giá rẻ, bảo hành 24/7. Hỗ trợ đa dạng game: Free Fire, PUBG, Liên Quân, LOL...', 'mua acc game, bán acc game, tài khoản game, shop game uy tín'),
    ('login', '/login.html', 'Đăng nhập - ShopDonk', 'Đăng nhập tài khoản ShopDonk để mua bán tài khoản game uy tín với giá tốt nhất.', 'đăng nhập, login, shopdonk'),
    ('register', '/register.html', 'Đăng ký - ShopDonk', 'Đăng ký tài khoản ShopDonk miễn phí để mua bán tài khoản game uy tín.', 'đăng ký, register, tạo tài khoản'),
    ('deposit', '/deposit.html', 'Nạp tiền - ShopDonk', 'Nạp tiền vào tài khoản ShopDonk qua ngân hàng, Momo, ZaloPay. Nhanh chóng, an toàn.', 'nạp tiền, deposit, thanh toán'),
    ('orders', '/orders.html', 'Lịch sử đơn hàng - ShopDonk', 'Xem lịch sử mua hàng và thông tin tài khoản game đã mua tại ShopDonk.', 'lịch sử, đơn hàng, orders'),
    ('faq', '/faq.html', 'FAQ - Câu hỏi thường gặp - ShopDonk', 'Câu hỏi thường gặp về mua bán tài khoản game tại ShopDonk. Hướng dẫn sử dụng, thanh toán, bảo hành.', 'faq, câu hỏi, hướng dẫn'),
    ('contact', '/contact.html', 'Liên hệ hỗ trợ - ShopDonk', 'Liên hệ với ShopDonk để được hỗ trợ 24/7. Hotline, email, Zalo, Facebook.', 'liên hệ, hỗ trợ, contact'),
    ('terms', '/terms.html', 'Điều khoản & Chính sách - ShopDonk', 'Điều khoản sử dụng và chính sách bảo hành tại ShopDonk.', 'điều khoản, chính sách, bảo hành');
    
    PRINT 'Default page SEO inserted';
END
GO