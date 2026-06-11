const { query } = require('./config/database');

async function initTables() {
    try {
        console.log('Creating PageSEO table...');
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
        console.log('✓ PageSEO table created');

        console.log('Creating CategorySEO table...');
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
        console.log('✓ CategorySEO table created');

        const pageCheck = await query('SELECT COUNT(*) as count FROM PageSEO');
        const catCheck = await query('SELECT COUNT(*) as count FROM CategorySEO');
        
        console.log(`\nPageSEO: ${pageCheck.recordset[0].count} rows`);
        console.log(`CategorySEO: ${catCheck.recordset[0].count} rows`);
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

initTables();
