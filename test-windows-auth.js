const sql = require('mssql');
require('dotenv').config();

const config = {
    database: 'master',
    server: process.env.DB_SERVER || 'localhost',
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
        authentication: {
            type: 'ntlm',
            options: {
                domain: '',
                userName: '',
                password: ''
            }
        }
    }
};

async function testWindowsAuth() {
    console.log('🔍 Testing Windows Authentication...\n');
    
    try {
        console.log('⏳ Connecting with Windows Authentication...');
        const pool = await sql.connect(config);
        console.log('✅ Connected successfully with Windows Auth!\n');
        
        const result = await pool.request().query('SELECT @@VERSION AS Version');
        console.log('SQL Server Version:');
        console.log(result.recordset[0].Version + '\n');
        
        await pool.close();
        return true;
    } catch (error) {
        console.error('❌ Windows Auth failed:', error.message);
        return false;
    }
}

testWindowsAuth();
