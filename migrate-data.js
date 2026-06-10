const sql = require('mssql');
const fs = require('fs');

// Local database config
const localConfig = {
  user: 'sa',
  password: 'YourStrongPassword123!',
  server: 'localhost',
  port: 1433,
  database: 'CayTheDB',
  options: {encrypt: false, trustServerCertificate: true}
};

// VPS database config (via SSH tunnel or direct if accessible)
const vpsConfig = {
  user: 'sa',
  password: 'ShopDonk@2024',
  server: '103.178.235.184', // Direct connection to VPS
  port: 1433,
  database: 'ShopDonkDB',
  options: {encrypt: false, trustServerCertificate: true}
};

async function migrateData() {
  let localPool, vpsPool;
  
  try {
    console.log('Connecting to local database...');
    localPool = await sql.connect(localConfig);
    console.log('Connected to local database');
    
    console.log('Connecting to VPS database...');
    vpsPool = await sql.connect(vpsConfig);
    console.log('Connected to VPS database');
    
    // Get all tables
    const tablesResult = await localPool.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'");
    const tables = tablesResult.recordset.map(r => r.TABLE_NAME);
    
    console.log('Tables to migrate:', tables.join(', '));
    
    for (const table of tables) {
      if (table === 'Sessions') continue; // Skip empty table
      
      console.log(`\nMigrating table: ${table}`);
      
      try {
        // Get data from local
        const dataResult = await localPool.query(`SELECT * FROM ${table}`);
        
        if (dataResult.recordset.length === 0) {
          console.log(`  Table ${table} is empty, skipping`);
          continue;
        }
        
        console.log(`  Found ${dataResult.recordset.length} records`);
        
        // Clear existing data in VPS
        await vpsPool.query(`DELETE FROM ${table}`);
        
        // Insert data into VPS
        for (const row of dataResult.recordset) {
          const columns = Object.keys(row);
          const request = vpsPool.request();
          
          // Build parameterized query to avoid SQL injection
          const paramNames = columns.map((col, i) => `@p${i}`);
          columns.forEach((col, i) => {
            request.input(`p${i}`, row[col]);
          });
          
          const insertQuery = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${paramNames.join(', ')})`;
          await request.query(insertQuery);
        }
        
        console.log(`  ✓ Migrated ${dataResult.recordset.length} records`);
      } catch (err) {
        console.log(`  ✗ Error migrating ${table}: ${err.message}`);
      }
    }
    
    // Verify migration
    console.log('\n=== Verification ===');
    for (const table of tables) {
      if (table === 'Sessions') continue;
      try {
        const countResult = await vpsPool.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`${table}: ${countResult.recordset[0].count} records`);
      } catch (err) {
        console.log(`${table}: error - ${err.message}`);
      }
    }
    
    console.log('\n✓ Migration completed!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrateData();