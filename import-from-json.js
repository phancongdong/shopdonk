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

async function importFromJson() {
  try {
    console.log('Connecting to database...');
    const pool = await sql.connect(config);
    
    console.log('Reading data file...');
    const data = JSON.parse(fs.readFileSync('database/data-export.json', 'utf8'));
    
    console.log('\nImporting data...\n');
    
    for (const [table, records] of Object.entries(data)) {
      if (records.length === 0) {
        console.log(`${table}: No records, skipping`);
        continue;
      }
      
      console.log(`${table}: Importing ${records.length} records`);
      
      // Delete existing records
      await pool.query(`DELETE FROM ${table}`);
      
      // Insert records one by one with IDENTITY_INSERT
      let imported = 0;
      for (const record of records) {
        try {
          const columns = Object.keys(record);
          const values = columns.map(col => {
            const val = record[col];
            if (val === null) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            if (typeof val === 'number') return val.toString();
            if (val instanceof Date) return `'${val.toISOString()}'`;
            if (typeof val === 'boolean') return val ? '1' : '0';
            return `'${String(val).replace(/'/g, "''")}'`;
          });
          
          const query = `
            SET IDENTITY_INSERT ${table} ON;
            INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});
            SET IDENTITY_INSERT ${table} OFF;
          `;
          
          await pool.query(query);
          imported++;
        } catch (err) {
          console.log(`  Error importing record: ${err.message.substring(0, 80)}`);
        }
      }
      
      console.log(`  ✓ Imported ${imported}/${records.length} records`);
    }
    
    // Verify
    console.log('\n=== Verification ===');
    for (const table of Object.keys(data)) {
      const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`${table}: ${result.recordset[0].count} records`);
    }
    
    console.log('\n✓ Import completed!');
    process.exit(0);
  } catch (err) {
    console.error('\n✗ Import failed:', err.message);
    process.exit(1);
  }
}

importFromJson();