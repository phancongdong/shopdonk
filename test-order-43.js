const { query, connectDB } = require('./config/database');

async function check() {
    try {
        await connectDB();
        
        console.log('=== Checking Order ID 43 ===');
        const result = await query(`
            SELECT id, user_id, status, product_id,
                   CAST(account_info AS NVARCHAR(MAX)) as account_info,
                   account_username, account_password
            FROM Orders WHERE id = 43
        `);
        
        const order = result.recordset[0];
        if (!order) {
            console.log('Order 43 NOT FOUND');
            process.exit(0);
        }
        
        console.log('Order 43:');
        console.log('- id:', order.id);
        console.log('- user_id:', order.user_id);
        console.log('- status:', order.status);
        console.log('- product_id:', order.product_id);
        console.log('- account_info:', order.account_info);
        console.log('- account_username:', order.account_username);
        console.log('- account_password:', order.account_password);
        
        if (order.account_info) {
            try {
                const parsed = JSON.parse(order.account_info);
                console.log('\nParsed account_info:');
                console.log(JSON.stringify(parsed, null, 2));
                
                const accounts = parsed.accounts || [];
                console.log('\naccounts array length:', accounts.length);
                
                if (accounts.length === 0) {
                    console.log('WARNING: accounts array is EMPTY!');
                    console.log('This is the BUG - accounts_list was consumed but accounts array not populated');
                } else {
                    accounts.forEach((a, i) => {
                        console.log(`Account ${i+1}: username=${a.username}, password=${a.password}`);
                    });
                }
            } catch(e) {
                console.log('Parse error:', e.message);
            }
        } else {
            console.log('WARNING: account_info is NULL/empty');
        }
        
        process.exit(0);
    } catch(e) {
        console.error('Error:', e);
        process.exit(1);
    }
}
check();