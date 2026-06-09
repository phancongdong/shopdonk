const sql = require('mssql');
require('dotenv').config();

const configs = [
    {
        name: 'Named Pipes',
        config: {
            database: 'master',
            server: `np:\\\\.\\pipe\\MSSQLSERVER\\sql\\query`,
            options: {
                encrypt: false,
                trustServerCertificate: true
            }
        }
    },
    {
        name: 'Shared Memory',
        config: {
            database: 'master',
            server: 'lpc:localhost',
            options: {
                encrypt: false,
                trustServerCertificate: true
            }
        }
    }
];

async function testAllConnections() {
    console.log('🔍 Testing all connection methods...\n');
    
    for (const {name, config} of configs) {
        console.log(`\n=== Testing ${name} ===`);
        console.log(`Server: ${config.server}`);
        
        try {
            const pool = await sql.connect(config);
            console.log(`✅ ${name}: Connected successfully!\n`);
            
            const result = await pool.request().query('SELECT @@SERVERNAME AS ServerName, @@VERSION AS Version');
            console.log('Server:', result.recordset[0].ServerName);
            
            await pool.close();
            console.log(`\n🎉 SUCCESS! Use ${name} connection in .env`);
            
            return name;
        } catch (error) {
            console.log(`❌ ${name} failed:`, error.message);
        }
    }
    
    console.log('\n❌ All connection methods failed!');
    console.log('\n💡 Solutions:');
    console.log('1. Enable Named Pipes:');
    console.log('   - Open SQL Server Configuration Manager');
    console.log('   - SQL Server Network Configuration → Protocols for MSSQLSERVER');
    console.log('   - Enable Named Pipes');
    console.log('   - Restart SQL Server service\n');
    
    console.log('2. Enable TCP/IP:');
    console.log('   - Same location as above');
    console.log('   - Enable TCP/IP');
    console.log('   - Restart SQL Server service\n');
    
    return null;
}

testAllConnections();