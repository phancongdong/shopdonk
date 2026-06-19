const { query, connectDB } = require('./config/database');

async function testOrderFlow() {
    try {
        await connectDB();
        
        const orderId = 1021;
        const userId = 11;
        
        console.log('=== Test getOrderById ===');
        
        const queryStr = `
            SELECT o.*, p.name as product_name, p.image as product_image, p.slug as product_slug,
                   u.name as user_name, u.email as user_email
            FROM Orders o
            LEFT JOIN Products p ON o.product_id = p.id
            LEFT JOIN Users u ON o.user_id = u.id
            WHERE o.id = ${orderId}
        `;
        const result = await query(queryStr);
        let order = result.recordset[0];
        
        console.log('Raw order from DB:');
        console.log('- id:', order.id);
        console.log('- user_id:', order.user_id);
        console.log('- status:', order.status);
        console.log('- account_info type:', typeof order.account_info);
        console.log('- account_info raw:', order.account_info);
        
        if (order.account_info) {
            order.account_info = JSON.parse(order.account_info);
            console.log('- account_info parsed:', JSON.stringify(order.account_info, null, 2));
        }
        
        console.log('\n=== Simulating getOrderAccount ===');
        
        if (order.user_id !== userId) {
            console.log('ERROR: User mismatch!');
            return;
        }
        
        if (order.status !== 'completed') {
            console.log('ERROR: Order not completed!');
            return;
        }
        
        const accountInfo = order.account_info || {};
        const accounts = accountInfo.accounts || [];
        
        console.log('accountInfo:', JSON.stringify(accountInfo, null, 2));
        console.log('accounts array:', accounts);
        console.log('accounts.length:', accounts.length);
        
        if (accounts.length === 0 && order.account_username) {
            console.log('Falling back to account_username/password from order');
            accounts.push({
                username: order.account_username,
                password: order.account_password
            });
        }
        
        console.log('\n=== Final accounts ===');
        console.log(JSON.stringify(accounts, null, 2));
        
        process.exit(0);
    } catch(e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

testOrderFlow();
