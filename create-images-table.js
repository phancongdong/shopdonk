const { connectDB, query } = require('./config/database');

async function createImagesTable() {
    try {
        await connectDB();
        console.log('Connected to database');
        
        await query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Images' AND xtype='U')
            BEGIN
                CREATE TABLE Images (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    public_id NVARCHAR(500) NOT NULL,
                    url NVARCHAR(1000) NOT NULL,
                    original_name NVARCHAR(255),
                    size INT,
                    width INT,
                    height INT,
                    format NVARCHAR(20),
                    resource_type NVARCHAR(50) DEFAULT 'image',
                    user_id INT,
                    created_at DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (user_id) REFERENCES Users(id)
                );
                PRINT 'Table Images created';
            END
        `, []);
        
        console.log('✅ Images table ready!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

createImagesTable();
