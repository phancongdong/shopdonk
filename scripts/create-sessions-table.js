const { query, connectDB } = require('../config/database');

async function createSessionsTable() {
    console.log('Creating Sessions table...');
    
    const checkTable = await query(`
        SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = 'Sessions'
    `);
    
    if (checkTable.recordset[0].count === 0) {
        await query(`
            CREATE TABLE Sessions (
                id INT IDENTITY(1,1) PRIMARY KEY,
                token VARCHAR(64) NOT NULL UNIQUE,
                user_id INT NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at DATETIME NOT NULL,
                is_active BIT DEFAULT 1,
                invalidated_at DATETIME NULL,
                ip_address VARCHAR(45) NULL,
                user_agent NVARCHAR(500) NULL,
                CONSTRAINT FK_Sessions_User FOREIGN KEY (user_id) REFERENCES Users(id)
            )
        `);
        
        await query(`
            CREATE INDEX IX_Sessions_Token ON Sessions(token)
        `);
        
        await query(`
            CREATE INDEX IX_Sessions_User ON Sessions(user_id)
        `);
        
        await query(`
            CREATE INDEX IX_Sessions_Expires ON Sessions(expires_at)
        `);
        
        console.log('Sessions table created successfully');
    } else {
        console.log('Sessions table already exists');
    }
}

async function run() {
    await connectDB();
    await createSessionsTable();
    console.log('Done');
    process.exit(0);
}

run();