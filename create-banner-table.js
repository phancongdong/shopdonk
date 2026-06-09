const { connectDB, query } = require('./config/database');

async function createBannerTable() {
    try {
        await connectDB();
        console.log('Connected to database');
        
        await query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Banners' AND xtype='U')
            BEGIN
                CREATE TABLE Banners (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    title NVARCHAR(200) NOT NULL,
                    description NVARCHAR(500),
                    image NVARCHAR(500) NOT NULL,
                    link NVARCHAR(500),
                    active BIT DEFAULT 1,
                    display_order INT DEFAULT 0,
                    created_at DATETIME DEFAULT GETDATE(),
                    updated_at DATETIME
                );
                PRINT 'Table Banners created';
            END
        `, []);
        
        console.log('✅ Banners table ready!');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

createBannerTable();