const sql = require('mssql');
const fs = require('fs');

// Local database
const localConfig = {
  user: 'sa',
  password: 'YourStrongPassword123!',
  server: 'localhost',
  port: 1433,
  database: 'CayTheDB',
  options: {encrypt: false, trustServerCertificate: true}
};

async function generateFullSchemaScript() {
  try {
    console.log('Connecting to local database...');
    const pool = await sql.connect(localConfig);
    
    console.log('Reading full schema...\n');
    
    // Get all tables
    const tablesResult = await pool.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);
    
    let schemaScript = '-- Full Schema Export from CayTheDB\n';
    schemaScript += '-- Generated: ' + new Date().toISOString() + '\n\n';
    schemaScript += 'USE ShopDonkDB;\nGO\n\n';
    
    for (const table of tablesResult.recordset) {
      const tableName = table.TABLE_NAME;
      
      // Get columns
      const columnsResult = await pool.query(`
        SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          CHARACTER_MAXIMUM_LENGTH,
          NUMERIC_PRECISION,
          NUMERIC_SCALE,
          IS_NULLABLE,
          COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = '${tableName}'
        ORDER BY ORDINAL_POSITION
      `);
      
      // Get primary key
      const pkResult = await pool.query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_NAME = '${tableName}'
        AND CONSTRAINT_NAME LIKE 'PK%'
      `);
      
      // Get identity column
      const identityResult = await pool.query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = '${tableName}'
        AND COLUMNPROPERTY(OBJECT_ID(TABLE_NAME), COLUMN_NAME, 'IsIdentity') = 1
      `);
      
      console.log(`Table: ${tableName} (${columnsResult.recordset.length} columns)`);
      
      schemaScript += `-- Table: ${tableName}\n`;
      schemaScript += `IF EXISTS (SELECT * FROM sysobjects WHERE name='${tableName}' AND xtype='U') DROP TABLE ${tableName};\n`;
      schemaScript += `CREATE TABLE ${tableName} (\n`;
      
      const columns = columnsResult.recordset.map(col => {
        let dataType = col.DATA_TYPE;
        if (col.CHARACTER_MAXIMUM_LENGTH && col.CHARACTER_MAXIMUM_LENGTH !== -1) {
          dataType += `(${col.CHARACTER_MAXIMUM_LENGTH})`;
        } else if (col.CHARACTER_MAXIMUM_LENGTH === -1) {
          dataType += '(MAX)';
        } else if (col.NUMERIC_PRECISION && col.NUMERIC_SCALE) {
          dataType += `(${col.NUMERIC_PRECISION}, ${col.NUMERIC_SCALE})`;
        }
        
        let line = `  ${col.COLUMN_NAME} ${dataType}`;
        
        if (identityResult.recordset.length > 0 && identityResult.recordset[0].COLUMN_NAME === col.COLUMN_NAME) {
          line += ' IDENTITY(1,1)';
        }
        
        if (col.IS_NULLABLE === 'NO') {
          line += ' NOT NULL';
        } else {
          line += ' NULL';
        }
        
        if (col.COLUMN_DEFAULT) {
          line += ` DEFAULT ${col.COLUMN_DEFAULT}`;
        }
        
        return line;
      });
      
      // Add primary key
      if (pkResult.recordset.length > 0) {
        const pkColumns = pkResult.recordset.map(pk => pk.COLUMN_NAME).join(', ');
        columns.push(`  PRIMARY KEY (${pkColumns})`);
      }
      
      schemaScript += columns.join(',\n');
      schemaScript += '\n);\nGO\n\n';
    }
    
    // Export data
    console.log('\nExporting data...\n');
    
    for (const table of tablesResult.recordset) {
      const tableName = table.TABLE_NAME;
      
      const dataResult = await pool.query(`SELECT * FROM ${tableName}`);
      
      if (dataResult.recordset.length > 0) {
        console.log(`${tableName}: ${dataResult.recordset.length} records`);
        
        schemaScript += `-- Data for ${tableName}\n`;
        
        for (const row of dataResult.recordset) {
          const columns = Object.keys(row);
          const values = columns.map(col => {
            const val = row[col];
            if (val === null) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            if (typeof val === 'number') return val.toString();
            if (val instanceof Date) return `'${val.toISOString()}'`;
            if (typeof val === 'boolean') return val ? '1' : '0';
            return `'${String(val).replace(/'/g, "''")}'`;
          });
          
          schemaScript += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
        }
        schemaScript += '\n';
      }
    }
    
    fs.writeFileSync('database/full-schema-export.sql', schemaScript);
    console.log('\n✓ Export completed! File: database/full-schema-export.sql');
    
    process.exit(0);
  } catch (err) {
    console.error('Export failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

generateFullSchemaScript();