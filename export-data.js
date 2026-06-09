const sql = require('mssql');
const fs = require('fs');
const path = require('path');

const config = {
  user: 'sa',
  password: 'YourStrongPassword123!',
  server: 'localhost',
  port: 1433,
  database: 'CayTheDB',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function exportData() {
  try {
    console.log('Connecting to database...');
    await sql.connect(config);
    
    // Get all tables that exist
    const tablesResult = await sql.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'");
    const tables = tablesResult.recordset.map(r => r.TABLE_NAME);
    
    console.log('Tables found:', tables.join(', '));
    
    let exportScript = '-- Export data from CayTheDB\n-- Date: ' + new Date().toISOString() + '\n\nUSE ShopDonkDB;\nGO\n\n';
    
    for (const table of tables) {
      console.log(`Exporting table: ${table}`);
      
      try {
        const result = await sql.query(`SELECT * FROM ${table}`);
        
        if (result.recordset.length > 0) {
          exportScript += `-- Data for table ${table} (${result.recordset.length} rows)\n`;
          exportScript += `DELETE FROM ${table};\n`;
          
          for (const row of result.recordset) {
            const columns = Object.keys(row);
            const values = columns.map(col => {
              const val = row[col];
              if (val === null) return 'NULL';
              if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
              if (typeof val === 'number') return val.toString();
              if (val instanceof Date) return `'${val.toISOString()}'`;
              if (typeof val === 'boolean') return val ? 1 : 0;
              return `'${val}'`;
            });
            
            exportScript += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
          }
          exportScript += '\n';
        } else {
          console.log(`  Table ${table} is empty`);
        }
      } catch (err) {
        console.log(`  Skipped table ${table}: ${err.message}`);
      }
    }
    
    const exportPath = path.join(__dirname, 'database', 'export-data.sql');
    fs.writeFileSync(exportPath, exportScript);
    console.log(`\nExport completed! File saved to: ${exportPath}`);
    
    process.exit(0);
  } catch (err) {
    console.error('Export failed:', err.message);
    process.exit(1);
  }
}

exportData();
