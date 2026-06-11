-- Seed data for SEO Categories and Pages
-- Run this on VPS after database setup

USE CayTheDB;
GO

-- Insert default categories if not exists
IF NOT EXISTS (SELECT * FROM Categories)
BEGIN
    INSERT INTO Categories (name, slug, description, display_order, status) VALUES
    ('Free Fire', 'free-fire', 'Tài khoản Free Fire, acc FF giá rẻ', 1, 1),
    ('PUBG Mobile', 'pubg-mobile', 'Tài khoản PUBG Mobile, acc PUBG', 2, 1),
    ('Liên Quân Mobile', 'lien-quan-mobile', 'Tài khoản Liên Quân, acc LMQ', 3, 1),
    ('League of Legends', 'league-of-legends', 'Tài khoản LOL, acc Liên Minh', 4, 1),
    ('Valorant', 'valorant', 'Tài khoản Valorant', 5, 1),
    ('Steam', 'steam', 'Tài khoản Steam game', 6, 1),
    ('Genshin Impact', 'genshin-impact', 'Tài khoản Genshin Impact', 7, 1);
    
    PRINT 'Categories seeded successfully';
END
GO

-- Insert default PageSEO if not exists
IF NOT EXISTS (SELECT * FROM PageSEO)
BEGIN
    INSERT INTO PageSEO (page_name, page_url, title, description, keywords, og_title, og_description, canonical_url, noindex, nofollow) VALUES
    ('home', '/', 'ShopDonk - Shop bán acc game uy tín hàng đầu Việt Nam', 'ShopDonk chuyên mua bán tài khoản game uy tín, giá rẻ, bảo hành 24/7. Free Fire, PUBG, Liên Quân, LOL...', 'mua acc game, bán acc game, tài khoản game, shop game uy tín', 'ShopDonk - Shop bán acc game uy tín', 'Mua bán tài khoản game uy tín tại ShopDonk', 'https://shopdonk.com/', 0, 0),
    ('login', '/login.html', 'Đăng nhập - ShopDonk', 'Đăng nhập tài khoản ShopDonk để mua bán tài khoản game uy tín với giá tốt nhất.', 'đăng nhập, login, shopdonk', 'Đăng nhập - ShopDonk', 'Đăng nhập để mua bán acc game', 'https://shopdonk.com/login.html', 0, 0),
    ('register', '/register.html', 'Đăng ký - ShopDonk', 'Đăng ký tài khoản ShopDonk miễn phí để mua bán tài khoản game uy tín.', 'đăng ký, register, tạo tài khoản', 'Đăng ký - ShopDonk', 'Đăng ký miễn phí tại ShopDonk', 'https://shopdonk.com/register.html', 0, 0),
    ('deposit', '/deposit.html', 'Nạp tiền - ShopDonk', 'Nạp tiền vào tài khoản ShopDonk qua ngân hàng, Momo, ZaloPay. Nhanh chóng, an toàn.', 'nạp tiền, deposit, thanh toán', 'Nạp tiền - ShopDonk', 'Nạp tiền nhanh chóng an toàn', 'https://shopdonk.com/deposit.html', 0, 0),
    ('orders', '/orders.html', 'Lịch sử đơn hàng - ShopDonk', 'Xem lịch sử mua hàng và thông tin tài khoản game đã mua tại ShopDonk.', 'lịch sử, đơn hàng, orders', 'Lịch sử đơn hàng - ShopDonk', 'Xem lịch sử mua hàng', 'https://shopdonk.com/orders.html', 0, 0),
    ('faq', '/faq.html', 'FAQ - Câu hỏi thường gặp - ShopDonk', 'Câu hỏi thường gặp về mua bán tài khoản game tại ShopDonk. Hướng dẫn sử dụng, thanh toán, bảo hành.', 'faq, câu hỏi, hướng dẫn', 'FAQ - ShopDonk', 'Câu hỏi thường gặp', 'https://shopdonk.com/faq.html', 0, 0),
    ('contact', '/contact.html', 'Liên hệ hỗ trợ - ShopDonk', 'Liên hệ với ShopDonk để được hỗ trợ 24/7. Hotline, email, Zalo, Facebook.', 'liên hệ, hỗ trợ, contact', 'Liên hệ - ShopDonk', 'Hỗ trợ 24/7', 'https://shopdonk.com/contact.html', 0, 0),
    ('terms', '/terms.html', 'Điều khoản & Chính sách - ShopDonk', 'Điều khoản sử dụng và chính sách bảo hành tại ShopDonk.', 'điều khoản, chính sách, bảo hành', 'Điều khoản - ShopDonk', 'Điều khoản sử dụng', 'https://shopdonk.com/terms.html', 0, 0);
    
    PRINT 'PageSEO seeded successfully';
END
GO

-- Update existing categories with SEO data if missing
DECLARE @cat_id INT;
DECLARE @cat_name NVARCHAR(100);
DECLARE @cat_slug VARCHAR(150);

DECLARE cat_cursor CURSOR FOR SELECT id, name, slug FROM Categories WHERE status = 1;
OPEN cat_cursor;
FETCH NEXT FROM cat_cursor INTO @cat_id, @cat_name, @cat_slug;

WHILE @@FETCH_STATUS = 0
BEGIN
    IF NOT EXISTS (SELECT * FROM CategorySEO WHERE category_id = @cat_id)
    BEGIN
        INSERT INTO CategorySEO (category_id, title, description, keywords, canonical_url, noindex, nofollow)
        VALUES (
            @cat_id,
            @cat_name + ' - Tài khoản game giá rẻ | ShopDonk',
            'Mua bán tài khoản ' + @cat_name + ' uy tín, giá rẻ tại ShopDonk. Bảo hành 24/7, hỗ trợ tận tâm.',
            @cat_name + ', acc ' + @cat_name + ', tài khoản ' + @cat_name + ', mua acc',
            'https://shopdonk.com/?slug=' + @cat_slug,
            0,
            0
        );
    END
    FETCH NEXT FROM cat_cursor INTO @cat_id, @cat_name, @cat_slug;
END

CLOSE cat_cursor;
DEALLOCATE cat_cursor;

PRINT 'CategorySEO seeded successfully';
GO

SELECT 'Categories:' as Info, COUNT(*) as Count FROM Categories;
SELECT 'PageSEO:' as Info, COUNT(*) as Count FROM PageSEO;
SELECT 'CategorySEO:' as Info, COUNT(*) as Count FROM CategorySEO;
GO