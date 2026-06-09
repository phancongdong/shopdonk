const sql = require('mssql');
const fs = require('fs');
const path = require('path');

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'ShopDonk@2024',
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_DATABASE || 'ShopDonkDB',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true' || false,
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true' || true
  }
};

async function setupDatabase() {
  try {
    console.log('Connecting to database...');
    await sql.connect(config);
    console.log('Connected successfully');

    const schemaPath = path.join(__dirname, 'database', 'create-tables.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Creating tables...');
    const batches = schema.split('GO').filter(batch => batch.trim());

    for (const batch of batches) {
      if (batch.trim()) {
        try {
          await sql.query(batch);
        } catch (err) {
          if (!err.message.includes('already exists') && !err.message.includes('IF NOT EXISTS')) {
            console.error('Batch error:', err.message);
          }
        }
      }
    }

    console.log('Tables created successfully');

    const result = await sql.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'");
    console.log('Tables in database:', result.recordset.map(r => r.TABLE_NAME).join(', '));

    process.exit(0);
  } catch (err) {
    console.error('Setup failed:', err.message);
    process.exit(1);
  }
}

setupDatabase();
