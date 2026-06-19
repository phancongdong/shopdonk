const { query, connectDB } = require('./config/database');

async function check() {
    try {
        await connectDB();
        const result = await query(`
            SELECT TOP 5 id, user_id, status, 
                   CAST(account_info AS NVARCHAR(MAX)) as account_info,
                   account_username, account_password 
            FROM Orders 
            ORDER BY id DESC
        `);
        console.log('Recent orders:');
        result.recordset.forEach(o => {
            console.log('---');
            console.log('ID:', o.id);
            console.log('User ID:', o.user_id);
            console.log('Status:', o.status);
            console.log('account_info:', o.account_info);
            console.log('account_username:', o.account_username);
            console.log('account_password:', o.account_password);
        });
        process.exit(0);
    } catch(e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}
check();
