const sql = require('mssql');

const configs = [
    {
        name: 'Windows Authentication',
        config: {
            database: 'master',
            server: 'localhost',
            port: 1433,
            options: {
                encrypt: false,
                trustServerCertificate: true,
                enableArithAbort: true,
                authentication: {
                    type: 'ntlm',
                    options: {
                        domain: ''
                    }
                }
            }
        }
    }
];

async function testConnections() {
    console.log('🔍 Testing Authentication Methods\n');
    
    for (const {name, config} of configs) {
        console.log(`=== ${name} ===`);
        
        try {
            const pool = await sql.connect(config);
            console.log(`✅ Connected!\n`);
            
            const result = await pool.request().query(`
                SELECT 
                    @@SERVERNAME AS ServerName,
                    @@VERSION AS Version,
                    DB_NAME() AS CurrentDB,
                    SYSTEM_USER AS CurrentUser
            `);
            
            const row = result.recordset[0];
            console.log('Server:', row.ServerName);
            console.log('Database:', row.CurrentDB);
            console.log('User:', row.CurrentUser);
            console.log('\nVersion:', row.Version.split('\n')[0]);
            
            await pool.close();
            
            console.log('\n✅ SUCCESS! Connection working!');
            return config;
            
        } catch (error) {
            console.error('❌ Failed:', error.message);
        }
    }
    
    return null;
}

testConnections();