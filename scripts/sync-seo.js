const { query } = require('./config/database');

async function syncSEO() {
    try {
        console.log('Syncing SEO data...');
        
        // Create PageSEO table if not exists
        await query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PageSEO' AND xtype='U')
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
            )
        `);
        console.log('✓ PageSEO table ready');
        
        // Create CategorySEO table if not exists
        await query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CategorySEO' AND xtype='U')
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
                updated_at DATETIME DEFAULT GETDATE()
            )
        `);
        console.log('✓ CategorySEO table ready');
        
        // Insert default pages
        const pages = [
            ['home', '/', 'ShopDonk - Shop bán acc game uy tín', 'Shop bán tài khoản game uy tín, giá rẻ', 'acc game'],
            ['login', '/login.html', 'Đăng nhập - ShopDonk', 'Đăng nhập tài khoản ShopDonk', 'đăng nhập'],
            ['register', '/register.html', 'Đăng ký - ShopDonk', 'Đăng ký tài khoản miễn phí', 'đăng ký'],
            ['deposit', '/deposit.html', 'Nạp tiền - ShopDonk', 'Nạp tiền vào tài khoản', 'nạp tiền'],
            ['orders', '/orders.html', 'Lịch sử đơn hàng - ShopDonk', 'Xem lịch sử mua hàng', 'đơn hàng'],
            ['faq', '/faq.html', 'FAQ - ShopDonk', 'Câu hỏi thường gặp', 'faq'],
            ['contact', '/contact.html', 'Liên hệ - ShopDonk', 'Liên hệ hỗ trợ', 'liên hệ'],
            ['terms', '/terms.html', 'Điều khoản - ShopDonk', 'Điều khoản sử dụng', 'điều khoản']
        ];
        
        for (const [name, url, title, desc, kw] of pages) {
            await query(`
                IF NOT EXISTS (SELECT * FROM PageSEO WHERE page_name = @param0)
                INSERT INTO PageSEO (page_name, page_url, title, description, keywords)
                VALUES (@param0, @param1, @param2, @param3, @param4)
            `, [name, url, title, desc, kw]);
        }
        console.log('✓ Pages synced');
        
        // Sync categories
        const cats = await query('SELECT id, name, slug FROM Categories WHERE status = 1');
        
        for (const cat of cats.recordset) {
            await query(`
                IF NOT EXISTS (SELECT * FROM CategorySEO WHERE category_id = @param0)
                INSERT INTO CategorySEO (category_id, title, description, keywords, canonical_url)
                VALUES (@param0, @param1, @param2, @param3, @param4)
            `, [
                cat.id,
                `${cat.name} - Tài khoản game giá rẻ | ShopDonk`,
                `Mua bán tài khoản ${cat.name} uy tín tại ShopDonk.`,
                `${cat.name}, acc ${cat.name}`,
                `https://shopdonk.com/?slug=${cat.slug || cat.id}`
            ]);
        }
        console.log(`✓ ${cats.recordset.length} categories synced`);
        
        // Show results
        const pageCount = await query('SELECT COUNT(*) as count FROM PageSEO');
        const catCount = await query('SELECT COUNT(*) as count FROM CategorySEO');
        
        console.log('\n=== SYNC COMPLETE ===');
        console.log(`Pages: ${pageCount.recordset[0].count}`);
        console.log(`Categories: ${catCount.recordset[0].count}`);
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

syncSEO();
