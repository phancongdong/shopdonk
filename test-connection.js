const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD,
    database: 'master',
    server: process.env.DB_SERVER || 'localhost',
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

async function testConnection() {
    console.log('🔍 Testing SQL Server Connection...\n');
    console.log('Configuration:');
    console.log(`  Server: ${config.server}`);
    console.log(`  Port: ${config.port}`);
    console.log(`  User: ${config.user}`);
    console.log(`  Database: ${config.database}\n`);
    
    try {
        console.log('⏳ Connecting to SQL Server...');
        const pool = await sql.connect(config);
        console.log('✅ Connected successfully!\n');
        
        const versionResult = await pool.request().query('SELECT @@VERSION AS Version');
        console.log('SQL Server Version:');
        console.log(versionResult.recordset[0].Version + '\n');
        
        const databasesResult = await pool.request().query(
            "SELECT name FROM sys.databases WHERE name NOT IN ('master', 'tempdb', 'model', 'msdb')"
        );
        console.log('User Databases:');
        if (databasesResult.recordset.length === 0) {
            console.log('  (No user databases found)\n');
        } else {
            databasesResult.recordset.forEach(db => {
                console.log(`  - ${db.name}`);
            });
            console.log('');
        }
        
        await pool.close();
        console.log('✅ Connection test completed successfully!');
        return true;
    } catch (error) {
        console.error('❌ Connection failed!');
        console.error('Error:', error.message);
        
        if (error.message.includes('SSL')) {
            console.log('\n💡 SSL Error Solution:');
            console.log('   - The connection is using trustServerCertificate: true');
            console.log('   - This should bypass SSL certificate validation');
        }
        
        if (error.message.includes('Login failed')) {
            console.log('\n💡 Authentication Error Solution:');
            console.log('   1. Open SQL Server Management Studio');
            console.log('   2. Connect to your server');
            console.log('   3. Right-click server > Properties > Security');
            console.log('   4. Select "SQL Server and Windows Authentication mode"');
            console.log('   5. Restart SQL Server service');
        }
        
        if (error.message.includes('network-related')) {
            console.log('\n💡 Network Error Solution:');
            console.log('   1. Open SQL Server Configuration Manager');
            console.log('   2. Go to SQL Server Network Configuration');
            console.log('   3. Protocols for MSSQLSERVER');
            console.log('   4. Enable TCP/IP');
            console.log('   5. Restart SQL Server service');
        }
        
        return false;
    }
}

testConnection();
