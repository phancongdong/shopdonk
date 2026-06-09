const { connectDB, query } = require('./config/database');

async function testDeposit() {
    try {
        await connectDB();
        
        await query(`
            INSERT INTO Transactions (user_id, type, amount, description, created_at)
            VALUES (11, 'deposit', 100000, N'Admin cộng tiền test', GETDATE())
        `);
        
        const result = await query(`
            SELECT TOP 1 * FROM Transactions 
            WHERE user_id = 11 AND type = 'deposit' 
            ORDER BY created_at DESC
        `);
        
        console.log('Created deposit:', JSON.stringify(result.recordset, null, 2));
        
        const all = await query(`
            SELECT TOP 5 * FROM Transactions 
            WHERE user_id = 11
            ORDER BY created_at DESC
        `);
        
        console.log('Recent transactions for user 11:', JSON.stringify(all.recordset, null, 2));
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

testDeposit();
