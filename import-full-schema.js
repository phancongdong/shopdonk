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
    
    console.log('Preparing database...\n');
    
    // Drop foreign key constraints first
    const fkResult = await pool.query(`
      SELECT OBJECT_NAME(parent_object_id) as table_name, name as constraint_name
      FROM sys.foreign_keys
    `);
    
    for (const fk of fkResult.recordset) {
      try {
        await pool.query(`ALTER TABLE ${fk.table_name} DROP CONSTRAINT ${fk.constraint_name}`);
        console.log(`✓ Dropped FK: ${fk.constraint_name}`);
      } catch (e) {}
    }
    
    // Drop all tables
    const tables = ['Orders', 'Transactions', 'Images', 'Products', 'Categories', 'Banners', 'PaymentSettings', 'Sessions', 'Users'];
    
    for (const table of tables) {
      try {
        await pool.query(`DROP TABLE IF EXISTS ${table}`);
        console.log(`✓ Dropped table: ${table}`);
      } catch (e) {}
    }
    
    console.log('\nReading schema file...');
    const schema = fs.readFileSync('database/full-schema-export.sql', 'utf8');
    
    console.log('Creating tables and importing data...\n');
    
    // Split by GO and filter only CREATE TABLE statements first
    const batches = schema.split('GO').filter(b => b.trim());
    
    let tableCount = 0;
    let dataCount = 0;
    
    for (const batch of batches) {
      if (batch.includes('CREATE TABLE')) {
        try {
          await pool.query(batch);
          const tableMatch = batch.match(/CREATE TABLE (\w+)/);
          if (tableMatch) {
            console.log(`✓ Created table: ${tableMatch[1]}`);
            tableCount++;
          }
        } catch (err) {
          console.log(`Error creating table: ${err.message.substring(0, 100)}`);
        }
      }
    }
    
    // Now insert data in correct order (Users first, then dependent tables)
    const insertOrder = ['Users', 'Categories', 'Products', 'Orders', 'Transactions', 'Banners', 'PaymentSettings', 'Images'];
    
    for (const table of insertOrder) {
      const inserts = batches.filter(b => b.includes(`INSERT INTO ${table}`));
      
      for (const insert of inserts) {
        try {
          // Enable IDENTITY_INSERT for tables with identity columns
          if (['Users', 'Categories', 'Products', 'Orders', 'Transactions', 'Banners', 'PaymentSettings', 'Images'].includes(table)) {
            await pool.query(`SET IDENTITY_INSERT ${table} ON`);
          }
          
          await pool.query(insert);
          dataCount++;
          console.log(`✓ Inserted data into ${table}`);
          
          if (['Users', 'Categories', 'Products', 'Orders', 'Transactions', 'Banners', 'PaymentSettings', 'Images'].includes(table)) {
            await pool.query(`SET IDENTITY_INSERT ${table} OFF`);
          }
        } catch (err) {
          console.log(`  Error inserting into ${table}: ${err.message.substring(0, 150)}`);
        }
      }
    }
    
    // Recreate foreign key constraints
    console.log('\nRecreating foreign keys...');
    try {
      await pool.query(`ALTER TABLE Orders ADD CONSTRAINT FK_Orders_User FOREIGN KEY (user_id) REFERENCES Users(id)`);
      await pool.query(`ALTER TABLE Orders ADD CONSTRAINT FK_Orders_Product FOREIGN KEY (product_id) REFERENCES Products(id)`);
      await pool.query(`ALTER TABLE Transactions ADD CONSTRAINT FK_Transactions_User FOREIGN KEY (user_id) REFERENCES Users(id)`);
      await pool.query(`ALTER TABLE Products ADD CONSTRAINT FK_Products_Category FOREIGN KEY (category_id) REFERENCES Categories(id)`);
      console.log('✓ Foreign keys recreated');
    } catch (err) {
      console.log('FK recreation skipped');
    }
    
    // Verify
    console.log('\n=== Verification ===');
    for (const table of insertOrder) {
      const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`${table}: ${result.recordset[0].count} records`);
    }
    
    console.log(`\n✓ Import completed! Tables: ${tableCount}, Data inserts: ${dataCount}`);
    process.exit(0);
  } catch (err) {
    console.error('Import failed:', err.message);
    process.exit(1);
  }
}

importFullSchema();