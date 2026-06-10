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
    await sql.connect(config);
    
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
      await sql.query(`DELETE FROM ${table}`);
      
      // Enable IDENTITY_INSERT
      await sql.query(`SET IDENTITY_INSERT ${table} ON`);
      
      try {
        // Insert records
        for (const record of records) {
          const columns = Object.keys(record);
          const request = new sql.Request();
          
          // Add parameters
          columns.forEach(col => {
            const value = record[col];
            if (value === null) {
              request.input(col, null);
            } else if (typeof value === 'string') {
              request.input(col, sql.NVarChar(sql.MAX), value);
            } else if (typeof value === 'number') {
              if (Number.isInteger(value)) {
                request.input(col, sql.Int, value);
              } else {
                request.input(col, sql.Decimal(18, 2), value);
              }
            } else if (value instanceof Date) {
              request.input(col, sql.DateTime, value);
            } else if (typeof value === 'boolean') {
              request.input(col, sql.Bit, value);
            } else {
              request.input(col, sql.NVarChar(sql.MAX), String(value));
            }
          });
          
          // Build query with parameter names
          const colNames = columns.join(', ');
          const paramNames = columns.map(c => '@' + c).join(', ');
          const query = `INSERT INTO ${table} (${colNames}) VALUES (${paramNames})`;
          
          await request.query(query);
        }
        
        console.log(`  ✓ Imported ${records.length} records`);
      } finally {
        // Disable IDENTITY_INSERT
        await sql.query(`SET IDENTITY_INSERT ${table} OFF`);
      }
    }
    
    // Verify
    console.log('\n=== Verification ===');
    for (const table of Object.keys(data)) {
      const result = await sql.query(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`${table}: ${result.recordset[0].count} records`);
    }
    
    console.log('\n✓ Import completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('\n✗ Import failed:', err.message);
    process.exit(1);
  }
}

importFromJson();