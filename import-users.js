const sql = require('mssql');
const fs = require('fs');
const path = require('path');

const config = {
  user: 'sa',
  password: 'ShopDonk@2024',
  server: 'localhost',
  port: 1433,
  database: 'ShopDonkDB',
  options: {encrypt: false, trustServerCertificate: true}
};

async function importUsers() {
  try {
    console.log('Connecting to database...');
    await sql.connect(config);
    
    // Read export data
    const exportFile = fs.readFileSync('database/export-data.sql', 'utf8');
    
    // Extract Users data
    const usersMatch = exportFile.match(/-- Data for table Users.*?\nDELETE FROM Users;\n([\s\S]*?)\n-- /);
    
    if (usersMatch && usersMatch[1]) {
      const insertStatements = usersMatch[1].split('\n').filter(line => line.startsWith('INSERT INTO Users'));
      
      console.log(`Found ${insertStatements.length} user records to import`);
      
      for (let i = 0; i < insertStatements.length; i++) {
        try {
          // Parse INSERT statement
          const valuesMatch = insertStatements[i].match(/VALUES \((.*)\)/);
          if (valuesMatch) {
            const valuesStr = valuesMatch[1];
            // Parse values carefully
            const result = await sql.query(insertStatements[i]);
            console.log(`Imported user ${i + 1}/${insertStatements.length}`);
          }
        } catch (err) {
          console.log(`Error importing user ${i + 1}: ${err.message.substring(0, 80)}`);
          // Try alternative approach - insert with proper escaping
          try {
            const match = insertStatements[i].match(/INSERT INTO Users \((.*?)\) VALUES \((.*)\)/);
            if (match) {
              const columns = match[1].split(', ');
              const valuesRaw = match[2];
              // Parse values manually
              const request = new sql.Request();
              const query = `INSERT INTO Users (${match[1]}) VALUES (${valuesRaw})`;
              await request.query(query);
              console.log(`Imported user ${i + 1} (alternative method)`);
            }
          } catch (err2) {
            console.log(`Still failed: ${err2.message.substring(0, 80)}`);
          }
        }
      }
    }
    
    // Check result
    const result = await sql.query('SELECT COUNT(*) as count FROM Users');
    console.log(`\nTotal users imported: ${result.recordset[0].count}`);
    
    process.exit(0);
  } catch (err) {
    console.error('Import failed:', err.message);
    process.exit(1);
  }
}

importUsers();