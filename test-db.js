const sql = require('mssql');

const config = {
    user: 'sa',
    password: 'YourStrongPassword123!',
    database: 'CayTheDB',
    server: 'localhost',
    port: 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

async function testConnection() {
    console.log('🔍 Testing SQL Authentication\n');
    console.log('Server:', config.server);
    console.log('Database:', config.database);
    console.log('User:', config.user);
    console.log('');
    
    try {
        console.log('Connecting...');
        const pool = await sql.connect(config);
        console.log('✅ Connected!\n');
        
        const result = await pool.request().query(`
            SELECT 
                DB_NAME() AS DatabaseName,
                SYSTEM_USER AS CurrentUser,
                COUNT(*) AS UserCount
            FROM Users
        `);
        
        console.log('Database:', result.recordset[0].DatabaseName);
        console.log('User:', result.recordset[0].CurrentUser);
        console.log('Users in database:', result.recordset[0].UserCount);
        
        await pool.close();
        
        console.log('\n✅ SUCCESS! Database connection working!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        if (error.code === 'ELOGIN') {
            console.log('\n💡 Login failed. Check:');
            console.log('   1. Mixed mode authentication is enabled');
            console.log('   2. SA password is correct');
            console.log('   3. SA account is enabled');
        }
    }
}

testConnection();