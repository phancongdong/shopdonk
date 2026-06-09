-- Seed Data for ShopGame
-- Run this after schema.sql

USE CayTheDB;
GO

-- Insert Admin User
IF NOT EXISTS (SELECT * FROM Users WHERE email = 'admin@shopgame.vn')
BEGIN
    INSERT INTO Users (name, email, password, role, balance, status)
    VALUES (
        'Admin', 
        'admin@shopgame.vn', 
        '$2a$10$YourHashedPasswordHere', 
        'admin', 
        10000000, 
        1
    );
    PRINT 'Admin user created';
END
GO

-- Insert Categories
IF NOT EXISTS (SELECT * FROM Categories WHERE slug = 'tft')
BEGIN
    INSERT INTO Categories (name, slug, icon, display_order, status) VALUES
    (N'TFT Đấu Trường Chân Lý', 'tft', 'fas fa-chess', 1, 1),
    (N'Liên Quân Mobile', 'lien-quan', 'fas fa-mobile-alt', 2, 1),
    (N'Free Fire', 'free-fire', 'fas fa-fire', 3, 1),
    (N'Roblox', 'roblox', 'fas fa-cube', 4, 1),
    (N'Tốc Chiến', 'toc-chien', 'fas fa-gamepad', 5, 1);
    
    PRINT 'Categories created';
END
GO

-- Insert Sample Products
IF NOT EXISTS (SELECT * FROM Products WHERE slug = 'linh-thu-aatrox-huyet-nguyet')
BEGIN
    INSERT INTO Products (category_id, name, slug, description, price, original_price, image, stock, features, status) VALUES
    (1, N'Linh Thú Aatrox Huyết Nguyệt', 'linh-thu-aatrox-huyet-nguyet', N'Linh thú TFT Aatrox Huyết Nguyệt cực đẹp', 110500, 130000, 'https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=Aatrox', 1, 'Rarity: Legendary', 1),
    (1, N'Linh Thú Jhin Hắc Tinh Đột Phá', 'linh-thu-jhin-hac-tinh-dot-pha', N'Linh thú TFT Jhin Hắc Tinh', 90000, 100000, 'https://via.placeholder.com/300x200/9B59B6/FFFFFF?text=Jhin', 15, 'Rarity: Epic', 1),
    (1, N'Linh Thú Jin Hắc Tinh', 'linh-thu-jin-hac-tinh', N'Linh thú TFT Jin Hắc Tinh', 112500, 120000, 'https://via.placeholder.com/300x200/3498DB/FFFFFF?text=Jin', 14, 'Rarity: Epic', 1),
    (1, N'Linh Xà Thần Vực', 'linh-xa-than-vuc', N'Linh thú TFT Linh Xà', 97500, 110000, 'https://via.placeholder.com/300x200/2ECC71/FFFFFF?text=Linh+Xa', 11, 'Rarity: Rare', 1),
    (1, N'Sàn Đấu Quán Giọt Cuối Cùng', 'san-dau-quan-giot-cuoi-cung', N'Sàn đấu TFT đặc biệt', 48000, 60000, 'https://via.placeholder.com/300x200/795548/FFFFFF?text=San+Dau', 5, 'Rarity: Rare', 1),
    
    (2, N'Nick Liên Quân Trắng Thông Tin', 'nick-lien-quan-trang-thong-tin', N'Nick Liên Quân Mobile trắng thông tin', 100000, 150000, 'https://via.placeholder.com/300x200/E74C3C/FFFFFF?text=Lien+Quan', 8, 'Rank: Bạch Kim', 1),
    (2, N'Nick Reg Trắng Thông Tin', 'nick-reg-trang-thong-tin', N'Nick Reg trắng thông tin giá rẻ', 30000, 50000, 'https://via.placeholder.com/300x200/F39C12/FFFFFF?text=Nick+Reg', 111, 'Rank: Đồng', 1),
    (2, N'Nick Liên Quân Rip', 'nick-lien-quan-rip', N'Nick Liên Quân Rip skin nhiều', 270000, 350000, 'https://via.placeholder.com/300x200/8E44AD/FFFFFF?text=LQ+Rip', 6, 'Skin: 50+', 1),
    (2, N'Random SS', 'random-ss', N'Random skin SS', 10000, 20000, 'https://via.placeholder.com/300x200/16A085/FFFFFF?text=Random+SS', 5, 'Random', 1),
    (2, N'Random Acc Có Giấy Vẽ', 'random-acc-co-giay-ve', N'Random acc có giấy vẽ', 5000, 10000, 'https://via.placeholder.com/300x200/D35400/FFFFFF?text=Giay+Ve', 39, 'Random', 1),
    
    (3, N'Acc Free Fire VIP', 'acc-free-fire-vip', N'Acc Free Fire VIP nhiều skin', 150000, 200000, 'https://via.placeholder.com/300x200/FF5722/FFFFFF?text=FF+VIP', 10, 'Skin: 30+', 1),
    (3, N'Nick Free Fire Random', 'nick-free-fire-random', N'Nick Free Fire random giá rẻ', 20000, 30000, 'https://via.placeholder.com/300x200/03A9F4/FFFFFF?text=FF+Random', 100, 'Random', 1),
    (3, N'Acc Free Fire Có Skin', 'acc-free-fire-co-skin', N'Acc Free Fire có skin', 80000, 100000, 'https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=FF+Skin', 25, 'Skin: 15+', 1),
    (3, N'Nick Free Fire Chơi Được', 'nick-free-fire-choi-duoc', N'Nick Free Fire chơi được ngay', 35000, 50000, 'https://via.placeholder.com/300x200/FFC107/FFFFFF?text=FF+Choi+Duoc', 60, 'Ready', 1),
    
    (4, N'Acc Roblox Có Robux', 'acc-roblox-co-robux', N'Acc Roblox có Robux', 200000, 300000, 'https://via.placeholder.com/300x200/E91E63/FFFFFF?text=Robux', 5, 'Robux: 1000+', 1),
    (4, N'Nick Roblox Random', 'nick-roblox-random', N'Nick Roblox random', 10000, 20000, 'https://via.placeholder.com/300x200/9C27B0/FFFFFF?text=Roblox+Random', 200, 'Random', 1),
    (4, N'Acc Roblox Có Game Pass', 'acc-roblox-co-game-pass', N'Acc Roblox có Game Pass', 50000, 70000, 'https://via.placeholder.com/300x200/00BCD4/FFFFFF?text=Game+Pass', 30, 'Game Pass: 5+', 1),
    (4, N'Nick Roblox Cũ', 'nick-roblox-cu', N'Nick Roblox cũ uy tín', 25000, 40000, 'https://via.placeholder.com/300x200/FF9800/FFFFFF?text=Roblox+Cu', 80, 'Age: 1+ year', 1);
    
    PRINT 'Products created';
END
GO

-- Insert Sample News
IF NOT EXISTS (SELECT * FROM News WHERE slug = 'khuyen-mai-tet-nguyen-dan-2026')
BEGIN
    INSERT INTO News (title, slug, content, image, category, views, status) VALUES
    (N'Khuyến mãi Tết Nguyên Đán 2026 - Giảm giá 20% toàn bộ tài khoản game', 'khuyen-mai-tet-nguyen-dan-2026', N'Chào mừng Tết Nguyên Đán 2026, ShopGame giảm giá 20% toàn bộ tài khoản game. Cơ hội vàng để sở hữu nick game giá rẻ!', 'https://via.placeholder.com/800x400/FF6B35/FFFFFF?text=Khuyen+Mai+Tet+2026', 'Khuyến mãi', 1250, 1),
    (N'Hướng dẫn mua tài khoản game tại ShopGame', 'huong-dan-mua-tai-khoan-game', N'Chi tiết cách mua tài khoản game, thanh toán và nhận nick tại ShopGame.vn', 'https://via.placeholder.com/400x200/3498DB/FFFFFF?text=Huong+Dan+Mua', 'Hướng dẫn', 856, 1),
    (N'Hướng dẫn nạp tiền vào tài khoản', 'huong-dan-nap-tien', N'Các phương thức nạp tiền: chuyển khoản, thẻ cào, ví điện tử', 'https://via.placeholder.com/400x200/2ECC71/FFFFFF?text=Nap+Tien', 'Hướng dẫn', 742, 1),
    (N'Cách kiểm tra nick Liên Quân trước khi mua', 'cach-kiem-tra-nick-lien-quan', N'Hướng dẫn kiểm tra skin, rank, tướng trong nick Liên Quân Mobile', 'https://via.placeholder.com/400x200/E74C3C/FFFFFF?text=Lien+Quan', 'Game', 523, 1),
    (N'Hướng dẫn bảo mật tài khoản game sau khi mua', 'huong-dan-bao-mat-tai-khoan', N'Cách thay đổi mật khẩu, bảo mật nick game để tránh bị hack', 'https://via.placeholder.com/400x200/9B59B6/FFFFFF?text=Bao+Mat', 'Bảo mật', 389, 1),
    (N'TFT Season 2026 - Các linh thú hot nên có', 'tft-season-2026-linh-thu-hot', N'Danh sách các linh thú TFT mạnh nhất mùa 2026', 'https://via.placeholder.com/400x200/F39C12/FFFFFF?text=TFT', 'Game', 678, 1);
    
    PRINT 'News created';
END
GO

PRINT 'All seed data inserted successfully!';
GO