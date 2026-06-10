const sql = require('mssql');
const fs = require('fs');

const config = {
  user: 'sa',
  password: 'YourStrongPassword123!',
  server: 'localhost',
  port: 1433,
  database: 'CayTheDB',
  options: {encrypt: false, trustServerCertificate: true}
};

async function exportToJson() {
  try {
    console.log('Connecting to database...');
    await sql.connect(config);
    
    const tables = ['Users', 'Transactions', 'Categories', 'Products', 'Orders', 'PaymentSettings', 'Banners', 'Images'];
    const exportData = {};
    
    for (const table of tables) {
      console.log(`Exporting ${table}...`);
      const result = await sql.query(`SELECT * FROM ${table}`);
      exportData[table] = result.recordset;
      console.log(`  ${result.recordset.length} records`);
    }
    
    fs.writeFileSync('database/data-export.json', JSON.stringify(exportData, null, 2));
    console.log('\nExport completed! File: database/data-export.json');
    process.exit(0);
  } catch (err) {
    console.error('Export failed:', err.message);
    process.exit(1);
  }
}

exportToJson();