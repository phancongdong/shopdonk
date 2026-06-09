const { connectDB, query, sql } = require('./config/database');

async function updateDatabase() {
    try {
        await connectDB();
        console.log('Connected to database');
        
        // Check and add created_by column
        const checkColumn = await query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Products' AND COLUMN_NAME = 'created_by'
        `, []);
        
        if (checkColumn.recordset.length === 0) {
            console.log('Adding created_by column...');
            await query('ALTER TABLE Products ADD created_by INT NULL', []);
            console.log('✓ Column created_by added');
        } else {
            console.log('✓ Column created_by already exists');
        }
        
        // Check other required columns
        const requiredColumns = [
            { name: 'account_type', type: 'VARCHAR(20)', default: "'single'" },
            { name: 'account_username', type: 'NVARCHAR(200)', default: 'NULL' },
            { name: 'account_password', type: 'NVARCHAR(200)', default: 'NULL' },
            { name: 'accounts_list', type: 'NVARCHAR(MAX)', default: 'NULL' },
            { name: 'cost_price', type: 'DECIMAL(18,2)', default: '0' },
            { name: 'is_hidden', type: 'BIT', default: '0' }
        ];
        
        for (const col of requiredColumns) {
            const check = await query(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'Products' AND COLUMN_NAME = '${col.name}'
            `, []);
            
            if (check.recordset.length === 0) {
                console.log(`Adding ${col.name} column...`);
                await query(`ALTER TABLE Products ADD ${col.name} ${col.type} DEFAULT ${col.default}`, []);
                console.log(`✓ Column ${col.name} added`);
            } else {
                console.log(`✓ Column ${col.name} already exists`);
            }
        }
        
        console.log('\n✅ Database updated successfully!');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

updateDatabase();