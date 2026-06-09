const { connectDB, query } = require('./config/database');

async function checkAndCreateTransactionsTable() {
    try {
        await connectDB();
        console.log('Connected to database');
        
        const result = await query(`
            SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'Transactions'
        `);
        
        if (result.recordset.length === 0) {
            console.log('Creating Transactions table...');
            await query(`
                CREATE TABLE Transactions (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    user_id INT NOT NULL,
                    type NVARCHAR(50) NOT NULL,
                    amount DECIMAL(18,2) NOT NULL,
                    description NVARCHAR(500),
                    created_at DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (user_id) REFERENCES Users(id)
                )
            `);
            console.log('✅ Transactions table created!');
        } else {
            console.log('✅ Transactions table already exists');
            
            const cols = await query(`
                SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'Transactions'
            `);
            console.log('Columns:', cols.recordset.map(r => r.COLUMN_NAME).join(', '));
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkAndCreateTransactionsTable();
