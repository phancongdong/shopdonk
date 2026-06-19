const sql = require('mssql');

async function checkDatabase() {
    try {
        await sql.connect({
            user: 'sa',
            password: 'ShopDonk@2024',
            database: 'CayTheDB',
            server: 'localhost',
            options: {
                encrypt: false,
                trustServerCertificate: true,
                enableArithAbort: true
            }
        });
        
        console.log('=== Connected to VPS Database ===\n');
        
        // Check Order 43
        console.log('=== Order ID 43 ===');
        let result = await sql.query(`
            SELECT id, user_id, status, product_id,
                   CAST(account_info AS NVARCHAR(MAX)) as account_info,
                   account_username, account_password
            FROM Orders WHERE id = 43
        `);
        
        if (result.recordset.length === 0) {
            console.log('Order 43 NOT FOUND\n');
        } else {
            const order = result.recordset[0];
            console.log('ID:', order.id);
            console.log('User ID:', order.user_id);
            console.log('Status:', order.status);
            console.log('account_info:', order.account_info);
            console.log('account_username:', order.account_username);
            console.log('account_password:', order.account_password);
            console.log('');
        }
        
        // Check recent orders
        console.log('=== Recent Orders ===');
        result = await sql.query(`
            SELECT TOP 5 id, user_id, status,
                   CAST(account_info AS NVARCHAR(MAX)) as account_info,
                   account_username, account_password
            FROM Orders ORDER BY id DESC
        `);
        
        result.recordset.forEach(o => {
            console.log('---');
            console.log('ID:', o.id, '| User:', o.user_id, '| Status:', o.status);
            console.log('account_info:', o.account_info ? o.account_info.substring(0, 100) + '...' : 'NULL');
        });
        
        await sql.close();
        process.exit(0);
    } catch(e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

checkDatabase();
