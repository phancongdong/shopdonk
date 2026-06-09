const sql = require('mssql');

const config = {
    database: 'master',
    server: 'localhost',
    port: 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
        connectTimeout: 30000
    }
};

async function testTCP() {
    console.log('🔍 Testing TCP/IP Connection to localhost:1433\n');
    
    try {
        console.log('Connecting...');
        const pool = await sql.connect(config);
        console.log('✅ Connected!\n');
        
        const result = await pool.request().query('SELECT @@VERSION AS Version, DB_NAME() AS CurrentDB');
        console.log('Version:', result.recordset[0].Version.split('\n')[0]);
        console.log('Database:', result.recordset[0].CurrentDB);
        
        await pool.close();
        console.log('\n✅ SUCCESS!');
        return true;
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\nFull error:', error);
        return false;
    }
}

testTCP();