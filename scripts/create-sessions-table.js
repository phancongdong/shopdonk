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
        
        await query(`CREATE INDEX IX_Sessions_Token ON Sessions(token)`);
        await query(`CREATE INDEX IX_Sessions_User ON Sessions(user_id)`);
        await query(`CREATE INDEX IX_Sessions_Expires ON Sessions(expires_at)`);
        
        console.log('Sessions table created successfully');
    } else {
        console.log('Sessions table already exists, checking columns...');
        
        const columns = await query(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Sessions'
        `);
        const existingColumns = columns.recordset.map(c => c.COLUMN_NAME);
        
        if (!existingColumns.includes('is_active')) {
            await query(`ALTER TABLE Sessions ADD is_active BIT DEFAULT 1`);
            console.log('Added is_active column');
        }
        
        if (!existingColumns.includes('invalidated_at')) {
            await query(`ALTER TABLE Sessions ADD invalidated_at DATETIME NULL`);
            console.log('Added invalidated_at column');
        }
        
        if (!existingColumns.includes('ip_address')) {
            await query(`ALTER TABLE Sessions ADD ip_address VARCHAR(45) NULL`);
            console.log('Added ip_address column');
        }
        
        if (!existingColumns.includes('user_agent')) {
            await query(`ALTER TABLE Sessions ADD user_agent NVARCHAR(500) NULL`);
            console.log('Added user_agent column');
        }
        
        console.log('Sessions table schema is up to date');
    }
}

async function run() {
    await connectDB();
    await createSessionsTable();
    console.log('Done');
    process.exit(0);
}

run();