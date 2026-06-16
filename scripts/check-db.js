const { connectDB, query } = require('./config/database');

async function checkDB() {
    await connectDB();
    
    const tables = await query(`
        SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE' 
        ORDER BY TABLE_NAME
    `);
    console.log('\n=== TABLES ===');
    tables.recordset.forEach(t => console.log('-', t.TABLE_NAME));
    
    const sessions = await query('SELECT COUNT(*) as count FROM Sessions');
    console.log('\nSessions count:', sessions.recordset[0].count);
    
    const users = await query('SELECT id, name, role FROM Users WHERE role IN (\'admin\', \'ctv\')');
    console.log('\nAdmin/CTV Users:', users.recordset);
    
    process.exit(0);
}

checkDB().catch(e => { console.error(e); process.exit(1); });