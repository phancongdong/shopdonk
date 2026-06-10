const sql = require('mssql');
const fs = require('fs');

const config = {
  user: 'sa',
  password: 'ShopDonk@2024',
  server: 'localhost',
  port: 1433,
  database: 'ShopDonkDB',
  options: {encrypt: false, trustServerCertificate: true}
};

async function importFullSchema() {
  try {
    console.log('Connecting to database...');
    const pool = await sql.connect(config);
    
    console.log('Reading schema file...');
    const schema = fs.readFileSync('database/full-schema-export.sql', 'utf8');
    
    console.log('Importing schema and data...\n');
    
    // Split by GO
    const batches = schema.split('GO').filter(b => b.trim());
    
    let success = 0;
    let errors = 0;
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i].trim();
      if (!batch || batch.startsWith('--')) continue;
      
      try {
        await pool.query(batch);
        success++;
        
        // Log progress for data inserts
        if (batch.includes('INSERT INTO')) {
          const tableMatch = batch.match(/INSERT INTO (\w+)/);
          if (tableMatch) {
            console.log(`✓ Inserted into ${tableMatch[1]}`);
          }
        }
      } catch (err) {
        errors++;
        if (!err.message.includes('already exists')) {
          console.log(`Error batch ${i}: ${err.message.substring(0, 100)}`);
        }
      }
    }
    
    // Verify
    console.log('\n=== Verification ===');
    const tables = ['Users', 'Products', 'Categories', 'Orders', 'Transactions', 'Banners', 'PaymentSettings', 'Images'];
    
    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`${table}: ${result.recordset[0].count} records`);
      } catch (err) {
        console.log(`${table}: Table not found`);
      }
    }
    
    console.log(`\n✓ Import completed! Success: ${success}, Errors: ${errors}`);
    process.exit(0);
  } catch (err) {
    console.error('Import failed:', err.message);
    process.exit(1);
  }
}

importFullSchema();